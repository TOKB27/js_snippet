// assets/js/modules/modalWizard.js
// S3配備前提：import/export 不使用（window.App配下に定義）
// 確認サマリ：日本語ラベル表示 + 変更申請(UPDATE)は変更箇所を強調（変更前→変更後）
// 確認画面には、Step1で実際に表示されている項目だけを表示する

window.App = window.App || {};

window.App.createModalWizard = function () {
  const modalEl = document.getElementById("applyModal");
  const modal = new bootstrap.Modal(modalEl);

  const $header = $("#applyModalHeader");
  const $title = $("#applyModalTitle");
  const $formContainer = $("#formContainer");
  const $precheckContainer = $("#precheckContainer");
  const $summary = $("#confirmSummary");

  const $stepForm = $("#stepForm");
  const $stepConfirm = $("#stepConfirm");

  const $btnNext = $("#btnNext");
  const $btnBack = $("#btnBack");
  const $btnSubmit = $("#btnSubmit");
  const $err = $("#formError");

  const state = {
    applyType: "NEW",
    record: null,
    originalValues: {},
    values: {},
    precheck: {},
    visibleFieldIds: [],
  };

  function open({ applyType, record }) {
    state.applyType = applyType;
    state.record = record || null;

    state.originalValues = buildOriginalValues(record);
    state.values = buildInitialValues(record);
    state.precheck = {};
    state.visibleFieldIds = [];

    const t = window.App.APPLY_TYPES[applyType];
    $title.text(t.title);
    $header
      .removeClass("bg-primary bg-warning bg-danger text-dark")
      .addClass(t.headerClass);

    showStep("FORM");

    renderGroups($formContainer, window.App.FORM_GROUPS, state.values);

    // 変更申請時は種別を変更できないようにし、削除申請時は表示されない
    $formContainer.find("input,select,textarea").prop("disabled", false);
    if (state.applyType === "DELETE") {
      $formContainer.find("input,select,textarea").prop("disabled", true);
    }
    if (state.applyType === "UPDATE" || state.applyType === "DELETE") {
      $formContainer.find('[data-field="type"]').prop("disabled", true);
    }

    bindChangeHandlers($formContainer, state.values, () => {
      updateVisibility($formContainer, window.App.FORM_GROUPS, state.values);
    });
    updateVisibility($formContainer, window.App.FORM_GROUPS, state.values);

    $precheckContainer.empty();
    $summary.empty();

    modal.show();
  }

  function showStep(which) {
    $err.addClass("d-none").text("入力に不備があります。");

    if (which === "FORM") {
      $stepForm.removeClass("d-none");
      $stepConfirm.addClass("d-none");
      $btnNext.removeClass("d-none");
      $btnBack.addClass("d-none");
      $btnSubmit.addClass("d-none");
    } else {
      $stepForm.addClass("d-none");
      $stepConfirm.removeClass("d-none");
      $btnNext.addClass("d-none");
      $btnBack.removeClass("d-none");
      $btnSubmit.removeClass("d-none");
    }
  }

  $btnNext.off("click").on("click", () => {
    readValues($formContainer, window.App.FORM_GROUPS, state.values);

    const ok = window.App.Validators.validateFields({
      ctx: { applyType: state.applyType },
      values: state.values,
      groups: window.App.FORM_GROUPS,
      $root: $formContainer,
    });
    if (!ok) {
      $err.removeClass("d-none");
      return;
    }

    state.visibleFieldIds = getVisibleFieldIds($formContainer);

    $summary.html(
      renderSummaryHtml(state.values, {
        applyType: state.applyType,
        originalValues: state.originalValues,
        visibleFieldIds: state.visibleFieldIds,
      }),
    );

    renderGroups(
      $precheckContainer,
      window.App.PRECHECK_GROUPS,
      state.precheck,
    );
    bindChangeHandlers($precheckContainer, state.precheck, () => {});

    showStep("CONFIRM");
  });

  $btnBack.off("click").on("click", () => showStep("FORM"));

  $btnSubmit.off("click").on("click", async () => {
    readValues($precheckContainer, window.App.PRECHECK_GROUPS, state.precheck);

    const ok = window.App.Validators.validateFields({
      ctx: { applyType: state.applyType },
      values: state.precheck,
      groups: window.App.PRECHECK_GROUPS,
      $root: $precheckContainer,
    });
    if (!ok) {
      $err.text("申請前確認に不備があります。").removeClass("d-none");
      return;
    }

    const payload = {
      applyType: state.applyType,
      targetId: state.record && state.record.id ? state.record.id : null,
      form: state.values,
      precheck: state.precheck,
    };

    try {
      $btnSubmit.prop("disabled", true);
      await window.App.Api.submitApplication(payload);
      modal.hide();
      alert("申請しました。");
    } catch (e) {
      console.error(e);
      $err.text("申請に失敗しました。").removeClass("d-none");
    } finally {
      $btnSubmit.prop("disabled", false);
    }
  });

  function renderGroups($root, groups, values) {
    const html = groups
      .map((g) => {
        const fieldsHtml = g.fields.map((f) => renderField(f, values)).join("");
        return `
        <div class="mb-2 group-bar">${escapeHtml(g.title)}</div>
        <div class="row g-3">${fieldsHtml}</div>
      `;
      })
      .join("");
    $root.html(html);
  }

  function renderField(f, values) {
    const id = f.id;
    const label = f.label;
    const v = values[id];

    const wrapperStart = `<div class="col-12" data-wrapper="${id}">`;
    const wrapperEnd = `</div>`;

    if (f.type === "checkbox") {
      const checked = v === true ? "checked" : "";
      return `
        ${wrapperStart}
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${id}" data-field="${id}" ${checked}>
            <label class="form-check-label" for="${id}">${escapeHtml(label)}</label>
          </div>
        ${wrapperEnd}
      `;
    }

    if (f.type === "radio") {
      const opts = (f.options || [])
        .map((o, idx) => {
          const checked = v === o.value ? "checked" : "";
          const rid = `${id}_${idx}`;
          return `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="${id}" id="${rid}" data-field="${id}"
                   value="${escapeHtml(o.value)}" ${checked}>
            <label class="form-check-label" for="${rid}">${escapeHtml(
              o.text,
            )}</label>
          </div>
        `;
        })
        .join("");

      return `
        ${wrapperStart}
          <label class="form-label">${escapeHtml(label)}</label>
          <div>${opts}</div>
        ${wrapperEnd}
      `;
    }

    if (f.type === "select") {
      const opts = (f.options || [])
        .map((o) => {
          const selected = v === o.value ? "selected" : "";
          return `<option value="${escapeHtml(
            o.value,
          )}" ${selected}>${escapeHtml(o.text)}</option>`;
        })
        .join("");

      return `
        ${wrapperStart}
          <label class="form-label" for="${id}">${escapeHtml(label)}</label>
          <select class="form-select" id="${id}" data-field="${id}">
            ${opts}
          </select>
        ${wrapperEnd}
      `;
    }

    const inputType = f.type === "number" ? "number" : "text";
    const placeholder = f.placeholder
      ? `placeholder="${escapeHtml(f.placeholder)}"`
      : "";
    const minAttr = f.min != null ? `min="${escapeHtml(f.min)}"` : "";
    const maxAttr = f.max != null ? `max="${escapeHtml(f.max)}"` : "";
    const stepAttr = f.step != null ? `step="${escapeHtml(f.step)}"` : "";

    return `
      ${wrapperStart}
        <label class="form-label" for="${id}">${escapeHtml(label)}</label>
        <input type="${inputType}" class="form-control" id="${id}" data-field="${id}"
               value="${escapeHtml(v ?? "")}" ${placeholder} ${minAttr} ${maxAttr} ${stepAttr}>
      ${wrapperEnd}
    `;
  }

  function bindChangeHandlers($root, values, onChange) {
    $root.off("change input", "[data-field]");
    $root.on("change input", "[data-field]", function () {
      const $el = $(this);
      const fieldId = $el.data("field");

      if ($el.attr("type") === "checkbox") {
        values[fieldId] = $el.is(":checked");
      } else if ($el.attr("type") === "radio") {
        values[fieldId] =
          $root.find(`input[name="${fieldId}"]:checked`).val() || "";
      } else {
        values[fieldId] = $el.val();
      }
      onChange();
    });
  }

  function readValues($root, groups, values) {
    for (const g of groups) {
      for (const f of g.fields) {
        const id = f.id;

        if (typeof f.showIf === "function" && !f.showIf(values)) {
          values[id] = f.type === "checkbox" ? false : "";
          continue;
        }

        if (f.type === "checkbox") {
          values[id] = $root.find(`[data-field="${id}"]`).is(":checked");
        } else if (f.type === "radio") {
          values[id] = $root.find(`input[name="${id}"]:checked`).val() || "";
        } else {
          values[id] = $root.find(`[data-field="${id}"]`).val() || "";
        }
      }
    }
  }

  function updateVisibility($root, groups, values) {
    for (const g of groups) {
      for (const f of g.fields) {
        if (typeof f.showIf !== "function") continue;
        const visible = f.showIf(values);
        $root.find(`[data-wrapper="${f.id}"]`).toggleClass("d-none", !visible);
      }
    }
  }

  function getVisibleFieldIds($root) {
    const ids = [];

    $root.find("[data-wrapper]").each(function () {
      const $wrapper = $(this);
      if ($wrapper.hasClass("d-none")) return;

      const fieldId = $wrapper.attr("data-wrapper");
      if (fieldId) ids.push(fieldId);
    });

    return ids;
  }

  function buildInitialValues(record) {
    const base = {};
    for (const g of window.App.FORM_GROUPS) {
      for (const f of g.fields) {
        base[f.id] = f.type === "checkbox" ? false : "";
      }
    }
    if (record) {
      Object.assign(base, record);
      for (const g of window.App.FORM_GROUPS) {
        for (const f of g.fields) {
          if (f.type === "checkbox") base[f.id] = base[f.id] === true;
        }
      }
    }
    return base;
  }

  function buildOriginalValues(record) {
    const base = {};
    for (const g of window.App.FORM_GROUPS) {
      for (const f of g.fields) {
        base[f.id] = f.type === "checkbox" ? false : "";
      }
    }
    if (record) {
      Object.assign(base, record);
      for (const g of window.App.FORM_GROUPS) {
        for (const f of g.fields) {
          if (f.type === "checkbox") base[f.id] = base[f.id] === true;
        }
      }
    }
    return base;
  }

  function renderSummaryHtml(
    values,
    { applyType, originalValues, visibleFieldIds },
  ) {
    const { labelMap, optionTextMap, typeMap } = buildFieldMeta(
      window.App.FORM_GROUPS,
    );

    const visibleSet = new Set(visibleFieldIds || []);

    const blocks = window.App.FORM_GROUPS.map((g) => {
      const rows = g.fields
        .filter((f) => visibleSet.has(f.id))
        .map((f) => {
          const id = f.id;
          const label = labelMap[id] || id;

          const afterRaw = values[id];
          const beforeRaw = (originalValues || {})[id];

          const before = formatValue(id, beforeRaw, typeMap[id], optionTextMap);
          const after = formatValue(id, afterRaw, typeMap[id], optionTextMap);

          const isUpdate = applyType === "UPDATE";
          const changed =
            isUpdate && !isSameValue(beforeRaw, afterRaw, typeMap[id]);

          if (changed) {
            return `
                <div class="p-2 mb-2 changed-row">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="fw-semibold">${escapeHtml(label)}</div>
                    <span class="badge text-bg-warning changed-badge">変更</span>
                  </div>
                  <div class="mt-1">
                    <div class="value-before small">変更前：${escapeHtml(
                      before,
                    )}</div>
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
            <div class="mb-2 group-bar">${escapeHtml(g.title)}</div>
            <div>${rows}</div>
          </div>
        `;
    }).join("");

    return `<div>${blocks}</div>`;
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
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  return { open };
};
