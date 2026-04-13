// assets/js/modules/detailView.js
window.App = window.App || {};

window.App.createDetailView = function () {
  const modalEl = document.getElementById("detailModal");
  const modal = new bootstrap.Modal(modalEl);

  const $title = $("#detailModalTitle");
  const $summary = $("#detailSummary");
  const $btnEditFromDetail = $("#btnEditFromDetail");
  const $btnDeleteFromDetail = $("#btnDeleteFromDetail");

  const state = {
    record: null,
    modalWizard: null,
  };

  function open({ record, modalWizard }) {
    state.record = record || null;
    state.modalWizard = modalWizard || null;

    if (!state.record) {
      $title.text("詳細");
      $summary.html('<div class="text-danger">データがありません。</div>');
      $btnEditFromDetail.prop("disabled", true);
      $btnDeleteFromDetail.prop("disabled", true);
      modal.show();
      return;
    }

    $title.text(`詳細 - ID: ${state.record.id}`);
    $summary.html(renderDetailHtml(state.record));

    $btnEditFromDetail.prop("disabled", false);
    $btnDeleteFromDetail.prop("disabled", false);

    modal.show();
  }

  $btnEditFromDetail.off("click").on("click", function () {
    if (!state.record || !state.modalWizard) return;
    modal.hide();
    state.modalWizard.open({ applyType: "UPDATE", record: state.record });
  });

  $btnDeleteFromDetail.off("click").on("click", function () {
    if (!state.record || !state.modalWizard) return;
    modal.hide();
    state.modalWizard.open({ applyType: "DELETE", record: state.record });
  });

  function renderDetailHtml(values) {
    const { labelMap, optionTextMap, typeMap } = buildFieldMeta(
      window.App.FORM_GROUPS
    );

    const blocks = window.App.FORM_GROUPS
      .map((group) => {
        const rows = group.fields
          .filter((field) => isVisibleField(field, values))
          .map((field) => {
            const id = field.id;
            const label = labelMap[id] || id;
            const text = formatValue(id, values[id], typeMap[id], optionTextMap);

            return `
              <div class="d-flex border-bottom py-2">
                <div class="text-muted fw-semibold" style="width:200px;">
                  ${escapeHtml(label)}
                </div>
                <div class="flex-fill">
                  ${escapeHtml(text)}
                </div>
              </div>
            `;
          })
          .join("");

        if (!rows) return "";

        return `
          <div class="mb-3">
            <div class="mb-2 group-bar">${escapeHtml(group.title)}</div>
            <div>${rows}</div>
          </div>
        `;
      })
      .join("");

    return blocks || '<div class="text-muted">表示できる項目がありません。</div>';
  }

  function isVisibleField(field, values) {
    if (typeof field.showIf === "function") {
      return !!field.showIf(values);
    }
    return true;
  }

  function buildFieldMeta(groups) {
    const labelMap = {};
    const optionTextMap = {};
    const typeMap = {};

    groups.forEach((g) => {
      g.fields.forEach((f) => {
        labelMap[f.id] = f.label;
        typeMap[f.id] = f.type;

        if (f.type === "select" || f.type === "radio") {
          optionTextMap[f.id] = optionTextMap[f.id] || {};
          (f.options || []).forEach((o) => {
            optionTextMap[f.id][String(o.value)] = o.text;
          });
        }
      });
    });

    return { labelMap, optionTextMap, typeMap };
  }

  function formatValue(fieldId, raw, type, optionTextMap) {
    if (type === "checkbox") {
      return raw === true ? "✓" : "—";
    }

    if (type === "select" || type === "radio") {
      const key = String(raw ?? "");
      if (key === "") return "—";
      return optionTextMap[fieldId] && optionTextMap[fieldId][key]
        ? optionTextMap[fieldId][key]
        : key;
    }

    const s = String(raw ?? "").trim();
    return s === "" ? "—" : s;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  return { open };
};