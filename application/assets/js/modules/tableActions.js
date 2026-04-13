// assets/js/modules/tableActions.js
window.App = window.App || {};

window.App.bindApplicationTableActions = function (modalWizard, detailView) {
  $("#btnNew").on("click", () => {
    modalWizard.open({ applyType: "NEW", record: null });
  });

  $("#recordsTable").on("click", ".btnDetail", function () {
    const application = readApplicationFromRow(this);
    detailView.open({ application });
  });
};

function readApplicationFromRow(btn) {
  const json = $(btn).closest("tr").attr("data-application");
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}