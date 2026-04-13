// assets/js/modules/tableActions.js
window.App = window.App || {};

window.App.bindTableActions = function (modalWizard, detailView) {
  $("#btnNew").on("click", () => {
    modalWizard.open({ applyType: "NEW", record: null });
  });

  $("#recordsTable").on("click", ".btnDetail", function () {
    const record = readRecordFromRow(this);
    detailView.open({ record, modalWizard });
  });

  $("#recordsTable").on("click", ".btnEdit", function () {
    const record = readRecordFromRow(this);
    modalWizard.open({ applyType: "UPDATE", record });
  });

  $("#recordsTable").on("click", ".btnDelete", function () {
    const record = readRecordFromRow(this);
    modalWizard.open({ applyType: "DELETE", record });
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