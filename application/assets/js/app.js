$(async function () {
  try {
    const applications = await window.App.Api.fetchApplications();
    renderApplicationsTable(applications);

    const wizard = window.App.createModalWizard();
    const detailView = window.App.createDetailView();

    window.App.bindApplicationTableActions(wizard, detailView);
  } catch (e) {
    console.error(e);
    alert("初期データの読み込みに失敗しました。");
  }
});

function renderApplicationsTable(applications) {
  const $tbody = $("#recordsTable tbody");

  const html = (applications || [])
    .map((app) => {
      const escapedJson = escapeAttrJson(app);
      const typeText =
        window.App.APPLY_TYPES?.[app.applyType]?.title || app.applyType || "";

      return `
        <tr data-application='${escapedJson}'>
          <td>${escapeHtml(app.applicationId)}</td>
          <td>${escapeHtml(typeText)}</td>
          <td>${escapeHtml(app.targetId ?? "—")}</td>
          <td>${escapeHtml(app.status ?? "")}</td>
          <td>${escapeHtml(app.appliedAt ?? "")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-info btnDetail">詳細</button>
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