// assets/js/app.js
$(async function () {
  try {
    const records = await window.App.Api.fetchRecords();
    window.App.renderTable(records);

    const wizard = window.App.createModalWizard();
    window.App.bindTableActions(wizard);
  } catch (e) {
    console.error(e);
    alert("一覧データの取得に失敗しました。");
  }
});
