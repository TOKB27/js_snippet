// assets/js/modules/tableActions.js
window.App = window.App || {};

window.App.renderTable = function (records) {
  const rows = (records || [])
    .map((record) => {
      const json = escapeAttr(JSON.stringify(record));
      return `
        <tr data-record="${json}">
          <td>${escapeHtml(record.id)}</td>
          <td>${escapeHtml(record.name)}</td>
          <td>${escapeHtml(record.type)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-info btnDetail">詳細</button>
            <button class="btn btn-sm btn-outline-warning btnEdit">変更</button>
            <button class="btn btn-sm btn-outline-danger btnDelete">削除</button>
          </td>
        </tr>
      `;
    })
    .join("");

  $("#recordsTable tbody").html(rows);
};

window.App.bindTableActions = function (modalWizard) {
  const detailModalEl = document.getElementById("detailModal");
  const detailModal = new bootstrap.Modal(detailModalEl);
  const $detailSummary = $("#detailSummary");

  let currentDetailRecord = null;

  $("#btnNew").on("click", () => {
    modalWizard.open({ applyType: "NEW", record: null });
  });

  $("#recordsTable").on("click", ".btnDetail", function () {
    const record = readRecordFromRow(this);
    currentDetailRecord = record;

    $detailSummary.html(
      window.App.renderRecordSummaryHtml(record, {
        applyType: "NEW",
      }),
    );

    detailModal.show();
  });

  $("#recordsTable").on("click", ".btnEdit", function () {
    const record = readRecordFromRow(this);
    modalWizard.open({ applyType: "UPDATE", record });
  });

  $("#recordsTable").on("click", ".btnDelete", function () {
    const record = readRecordFromRow(this);
    modalWizard.open({ applyType: "DELETE", record });
  });

  $("#btnDetailEdit").on("click", () => {
    if (!currentDetailRecord) return;
    detailModal.hide();
    modalWizard.open({ applyType: "UPDATE", record: currentDetailRecord });
  });

  $("#btnDetailDelete").on("click", () => {
    if (!currentDetailRecord) return;
    detailModal.hide();
    modalWizard.open({ applyType: "DELETE", record: currentDetailRecord });
  });
};

function readRecordFromRow(btn) {
  const json = $(btn).closest("tr").attr("data-record");
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
