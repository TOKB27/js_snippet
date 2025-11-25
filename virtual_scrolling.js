// <div id="viewport" style="height: 300px; overflow-y: scroll; border: 1px solid #ccc;">
//  <div id="content"></div>
// </div>

$(function () {
  // ★ここが一番重要：defaultList をそのまま使う
  const data = defaultList.map((item, i) => ({
    ...item,
    _index: i,        // 内部管理用のインデックス
    checked: false,   // チェック状態を保持する
  }));

  const total = data.length;

  // 初期想定の高さ
  const defaultRowHeight = 40;

  // 各行の高さキャッシュ
  const heights = new Array(total).fill(defaultRowHeight);

  // 各行の top 位置（累積）
  const offsets = new Array(total);
  offsets[0] = 0;
  for (let i = 1; i < total; i++) {
    offsets[i] = offsets[i - 1] + heights[i - 1];
  }

  let startIndex = 0;

  const $viewport = $("#viewport");
  const $content = $("#content");

  $content.css({
    position: "relative",
    height: offsets[total - 1] + heights[total - 1] + "px"
  });

  function recalcOffsetsFrom(idx) {
    for (let i = idx + 1; i < total; i++) {
      offsets[i] = offsets[i - 1] + heights[i - 1];
    }
    const totalHeight = offsets[total - 1] + heights[total - 1];
    $content.height(totalHeight);
  }

  function adjustStartIndex(scrollTop) {
    while (startIndex > 0 && offsets[startIndex] > scrollTop) {
      startIndex--;
    }
    while (startIndex < total - 1 && offsets[startIndex + 1] <= scrollTop) {
      startIndex++;
    }
  }

  function render() {
    const scrollTop = $viewport.scrollTop();
    const viewportBottom = scrollTop + $viewport.height();
    const buffer = 200; // 少し多めに描画

    adjustStartIndex(scrollTop);

    let html = "";
    let i = startIndex;

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
            ${row.text ?? row.label ?? JSON.stringify(row)}
          </label>
        </div>
      `;
      i++;
    }

    $content.html(html);

    // 高さ測定
    $content.children(".row").each(function () {
      const $row = $(this);
      const idx = Number($row.data("index"));
      const h = $row.outerHeight();

      if (h !== heights[idx]) {
        heights[idx] = h;
        recalcOffsetsFrom(idx);
      }
    });
  }

  // チェック状態保持
  $content.on("change", ".row-check", function () {
    const idx = Number($(this).data("index"));
    const checked = $(this).prop("checked");
    data[idx].checked = checked;
  });

  $viewport.on("scroll", render);

  render();
});