// <div id="viewport" style="height: 300px; overflow-y: scroll; border: 1px solid #ccc;">
//  <div id="content"></div>
// </div>

$(function () {
  const total = 10000;

  // データモデル：チェック状態を保持する
  const data = Array.from({ length: total }, (_, i) => ({
    id: i,
    label: `行データ ${i} —— テキスト量によって高さが変わるかもしれない`,
    checked: false
  }));

  // 初期想定の高さ（適当に「このくらい」と置いておく）
  const defaultRowHeight = 40;

  // 各行の高さキャッシュ
  const heights = new Array(total).fill(defaultRowHeight);

  // 各行の top 位置（累積）
  const offsets = new Array(total);
  offsets[0] = 0;
  for (let i = 1; i < total; i++) {
    offsets[i] = offsets[i - 1] + heights[i - 1];
  }

  let startIndex = 0; // 前回の開始行

  const $viewport = $("#viewport");
  const $content  = $("#content");

  // content をスクロール用の大きな箱にする
  $content.css({
    position: "relative",
    height: offsets[total - 1] + heights[total - 1] + "px"
  });

  // 指定インデックス以降の offsets を再計算
  function recalcOffsetsFrom(idx) {
    for (let i = idx + 1; i < total; i++) {
      offsets[i] = offsets[i - 1] + heights[i - 1];
    }
    const totalHeight = offsets[total - 1] + heights[total - 1];
    $content.height(totalHeight);
  }

  // scrollTop に合わせて startIndex を前回値から調整
  function adjustStartIndex(scrollTop) {
    // 上方向へ戻った場合
    while (startIndex > 0 && offsets[startIndex] > scrollTop) {
      startIndex--;
    }
    // 下方向へ進んだ場合
    while (startIndex < total - 1 && offsets[startIndex + 1] <= scrollTop) {
      startIndex++;
    }
  }

  function render() {
    const scrollTop      = $viewport.scrollTop();
    const viewportBottom = scrollTop + $viewport.height();
    const buffer         = 200; // 画面の下にちょっと余分に描画（px）

    adjustStartIndex(scrollTop);

    let html = "";
    let i = startIndex;

    // 表示範囲 + バッファ内の行だけ描画
    while (i < total && offsets[i] < viewportBottom + buffer) {
      const row = data[i];

      html += `
        <div class="row" data-index="${i}"
             style="
               position: absolute;
               left: 0;
               right: 0;
               top: ${offsets[i]}px;
               border-bottom: 1px solid #eee;
               box-sizing: border-box;
               padding: 4px 8px;
             ">
          <label>
            <input type="checkbox"
                   class="row-check"
                   data-index="${i}"
                   ${row.checked ? "checked" : ""}>
            ${row.label}
          </label>
        </div>
      `;
      i++;
    }

    $content.html(html);

    // 描画された要素の実際の高さを取得し、キャッシュ更新
    $content.children(".row").each(function () {
      const $row = $(this);
      const idx  = Number($row.data("index"));
      const h    = $row.outerHeight();

      if (h !== heights[idx]) {
        heights[idx] = h;
        recalcOffsetsFrom(idx);
      }
    });
  }

  // チェックボックスの状態変更 → data側に反映
  $content.on("change", ".row-check", function () {
    const idx = Number($(this).data("index"));
    const checked = $(this).prop("checked");
    data[idx].checked = checked;
    // 必要であればここで別処理（選択件数カウントなど）も
  });

  $viewport.on("scroll", render);

  // 初回表示
  render();
});