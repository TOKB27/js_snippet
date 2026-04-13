// assets/js/modules/detailView.js
window.App = window.App || {};

window.App.createDetailView = function () {
  const modalEl = document.getElementById("detailModal");
  const modal = new bootstrap.Modal(modalEl);

  const $title = $("#detailModalTitle");
  const $summary = $("#detailSummary");
  const $precheck = $("#detailPrecheck");
  const $btnClose = $("#btnCloseDetail");

  const state = {
    application: null,
  };

  function open({ application }) {
    state.application = application || null;

    if (!state.application) {
      $title.text("申請詳細");
      $summary.html('<div class="text-danger">データがありません。</div>');
      $precheck.empty();
      modal.show();
      return;
    }

    $title.text(buildTitle(state.application));
    $summary.html(renderApplicationDetailHtml(state.application));
    $precheck.html(renderPrecheckHtml(state.application.precheck || {}));

    modal.show();
  }

  $btnClose.off("click").on("click", function () {
    modal.hide();
  });

  function buildTitle(application) {
    const typeText =
      window.App.APPLY_TYPES?.[application.applyType]?.title ||
      application.applyType ||
      "申請";
    return `${typeText} 詳細`;
  }

  function renderApplicationDetailHtml(application) {
    const values = application.formValues || {};
    const originalValues = application.originalValues || {};
    const applyType = application.applyType;

    const { labelMap, optionTextMap, typeMap } = buildFieldMeta(
      window.App.FORM_GROUPS
    );

    const headerHtml = `
      <div class="mb-3">
        <div class="mb-2 group-bar">申請情報</div>
        <div class="d-flex border-bottom py-2">
          <div class="text-muted fw-semibold" style="width:200px;">申請ID</div>
          <div class="flex-fill">${escapeHtml(application.applicationId ?? "—")}</div>
        </div>
        <div class="d-flex border-bottom py-2">
          <div class="text-muted fw-semibold" style="width:200px;">申請種別</div>
          <div class="flex-fill">${escapeHtml(
            window.App.APPLY_TYPES?.[application.applyType]?.title || application.applyType || "—"
          )}</div>
        </div>
        <div class="d-flex border-bottom py-2">
          <div class="text-muted fw-semibold" style="width:200px;">対象ID</div>
          <div class="flex-fill">${escapeHtml(application.targetId ?? "—")}</div>
        </div>
        <div class="d-flex border-bottom py-2">
          <div class="text-muted fw-semibold" style="width:200px;">状態</div>
          <div class="flex-fill">${escapeHtml(application.status ?? "—")}</div>
        </div>
        <div class="d-flex border-bottom py-2">
          <div class="text-muted fw-semibold" style="width:200px;">申請日時</div>
          <div class="flex-fill">${escapeHtml(application.appliedAt ?? "—")}</div>
        </div>
      </div>
    `;

    const detailBlocks = window.App.FORM_GROUPS
      .map((group) => {
        const rows = group.fields
          .filter((field) => isVisibleField(field, values))
          .map((field) => {
            const id = field.id;
            const label = labelMap[id] || id;

            const afterRaw = values[id];
            const beforeRaw = originalValues[id];

            const after = formatValue(id, afterRaw, typeMap[id], optionTextMap);
            const before = formatValue(id, beforeRaw, typeMap[id], optionTextMap);

            const changed =
              applyType === "UPDATE" &&
              !isSameValue(beforeRaw, afterRaw, typeMap[id]);

            if (changed) {
              return `
                <div class="p-2 mb-2 changed-row">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="fw-semibold">${escapeHtml(label)}</div>
                    <span class="badge text-bg-warning changed-badge">変更</span>
                  </div>
                  <div class="mt-1">
                    <div class="value-before small">変更前：${escapeHtml(before)}</div>
                    <div class="mt-1">変更後：${escapeHtml(after)}</div>
                  </div>
                </div>
              `;
            }

            return `
              <div class="d-flex border-bottom py-2">
                <div class="text-muted fw-semibold" style="width:200px;">
                  ${escapeHtml(label)}
                </div>
                <div class="flex-fill">
                  ${escapeHtml(after)}
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

    return headerHtml + detailBlocks;
  }

  function renderPrecheckHtml(precheckValues) {
    const { labelMap, optionTextMap, typeMap } = buildFieldMeta(
      window.App.PRECHECK_GROUPS
    );

    const blocks = window.App.PRECHECK_GROUPS
      .map((group) => {
        const rows = group.fields
          .map((field) => {
            const id = field.id;
            const label = labelMap[id] || id;
            const text = formatValue(id, precheckValues[id], typeMap[id], optionTextMap);

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

    return blocks;
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

  function isSameValue(a, b, type) {
    if (type === "checkbox") {
      return (a === true) === (b === true);
    }
    return String(a ?? "") === String(b ?? "");
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
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  return { open };
};