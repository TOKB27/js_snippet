// assets/js/app.js
$(async function () {
  try {
    const records = await window.App.Api.fetchTestData();
    renderRecordsTable(records);

    const wizard = window.App.createModalWizard();
    const detailView = window.App.createDetailView();

    window.App.bindTableActions(wizard, detailView);
  } catch (e) {
    console.error(e);
    alert("初期データの読み込みに失敗しました。");
  }
});

function renderRecordsTable(records) {
  const $tbody = $("#recordsTable tbody");

  const html = (records || [])
    .map((record) => {
      const escapedJson = escapeAttrJson(record);

      return `
        <tr data-record='${escapedJson}'>
          <td>${escapeHtml(record.id)}</td>
          <td>${escapeHtml(record.name ?? "")}</td>
          <td>${escapeHtml(record.type ?? "")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-info btnDetail">詳細</button>
            <button class="btn btn-sm btn-outline-warning btnEdit">変更</button>
            <button class="btn btn-sm btn-outline-danger btnDelete">削除</button>
          </td>
        </tr>
      `;
    })
    .join("");

  $tbody.html(html);
}

function escapeAttrJson(obj) {
  return JSON.stringify(obj)
    .replaceAll("&", "&amp;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}