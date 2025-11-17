// <div id="viewport" style="height: 300px; overflow-y: scroll; border: 1px solid #ccc;">
//  <div id="content"></div>
// </div>

$(function () {
  const rowHeight = 30;
  const total = 10000;

  const data = Array.from({ length: total }, (_, i) => `行データ ${i}`);

  const $viewport = $("#viewport");
  const $content = $("#content");

  $content.css("height", total * rowHeight + "px");

  $viewport.on("scroll", render);

  function render() {
    const scrollTop = $viewport.scrollTop();

    const startIndex = Math.floor(scrollTop / rowHeight);
    const viewCount = Math.ceil($viewport.height() / rowHeight) + 5;
    const endIndex = Math.min(startIndex + viewCount, total);

    let html = "";
    for (let i = startIndex; i < endIndex; i++) {
      html += `
        <div style="
          position: absolute;
          top: ${i * rowHeight}px;
          height: ${rowHeight}px;
          line-height: ${rowHeight}px;
          border-bottom: 1px solid #eee;
        ">
          ${data[i]}
        </div>`;
    }

    $content.html(html);
  }

  render();
});