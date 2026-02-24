// assets/js/modules/modalWizard.js
// S3配備前提：import/export 不使用（window.App配下に定義）
// 確認サマリ：日本語ラベル表示 + 変更申請(UPDATE)は変更箇所を強調（変更前→変更後）

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
    originalValues: {}, // ★変更前スナップショット（UPDATE向け）
    values: {},
    precheck: {},
  };

  function open({ applyType, record }) {
    state.applyType = applyType;
    state.record = record || null;

    // ★変更前（UPDATEで差分表示するため）
    state.originalValues = buildOriginalValues(record);

    // 現在値（フォームに表示する初期値）
    state.values = buildInitialValues(record);
    state.precheck = {};

    // ヘッダー（色・タイトル）
    const t = window.App.APPLY_TYPES[applyType];
    $title.text(t.title);
    $header
      .removeClass("bg-primary bg-warning bg-danger text-dark")
      .addClass(t.headerClass);

    // Step1表示
    showStep("FORM");

    // Step1描画
    renderGroups($formContainer, window.App.FORM_GROUPS, state.values);

    // 削除申請は参照のみ（必要ならここを変更）
    if (state.applyType === "DELETE") {
      $formContainer.find("input,select,textarea").prop("disabled", true);
    } else {
      $formContainer.find("input,select,textarea").prop("disabled", false);
    }

    // 入力変更ハンドラ（値更新 & 条件表示更新）
    bindChangeHandlers($formContainer, state.values, () => {
      updateVisibility($formContainer, window.App.FORM_GROUPS, state.values);
    });
    updateVisibility($formContainer, window.App.FORM_GROUPS, state.values);

    // Step2初期化
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

  // 次へ（Step1→Step2）
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

    // ★日本語ラベル表示 + UPDATEは差分表示
    $summary.html(
      renderSummaryHtml(state.values, {
        applyType: state.applyType,
        originalValues: state.originalValues,
      })
    );

    // 申請前確認の描画（Step2）
    renderGroups(
      $precheckContainer,
      window.App.PRECHECK_GROUPS,
      state.precheck
    );
    bindChangeHandlers($precheckContainer, state.precheck, () => {});

    showStep("CONFIRM");
  });

  // 戻る（Step2→Step1）
  $btnBack.off("click").on("click", () => showStep("FORM"));

  // 申請（Step2）
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

  // ---- 汎用描画（縦並び= col-12 固定） ----

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

  // ★ 縦並び（全項目 col-12）
  function renderField(f, values) {
    const id = f.id;
    const label = f.label;
    const v = values[id];

    const wrapperStart = `<div class="col-12" data-wrapper="${id}">`;
    const wrapperEnd = `</div>`;

    // checkbox
    if (f.type === "checkbox") {
      const checked = v === true ? "checked" : "";
      return `
        ${wrapperStart}
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${id}" data-field="${id}" ${checked}>
            <label class="form-check-label" for="${id}">${escapeHtml(
        label
      )}</label>
          </div>
        ${wrapperEnd}
      `;
    }

    // radio
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
            o.text
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

    // select
    if (f.type === "select") {
      const opts = (f.options || [])
        .map((o) => {
          const selected = v === o.value ? "selected" : "";
          return `<option value="${escapeHtml(
            o.value
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

    // text（default）
    const placeholder = f.placeholder
      ? `placeholder="${escapeHtml(f.placeholder)}"`
      : "";
    return `
      ${wrapperStart}
        <label class="form-label" for="${id}">${escapeHtml(label)}</label>
        <input type="text" class="form-control" id="${id}" data-field="${id}"
               value="${escapeHtml(v ?? "")}" ${placeholder}>
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

        // 非表示項目は値を空にする（不要ならここを消す）
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

  function buildInitialValues(record) {
    const base = {};
    for (const g of window.App.FORM_GROUPS) {
      for (const f of g.fields) {
        base[f.id] = f.type === "checkbox" ? false : "";
      }
    }
    if (record) {
      Object.assign(base, record);
      // checkbox正規化
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
      // checkbox正規化
      for (const g of window.App.FORM_GROUPS) {
        for (const f of g.fields) {
          if (f.type === "checkbox") base[f.id] = base[f.id] === true;
        }
      }
    }
    return base;
  }

  // ★ 日本語ラベル + UPDATEは差分表示（変更前→変更後 + 変更バッジ）
  function renderSummaryHtml(values, { applyType, originalValues }) {
    const { labelMap, optionTextMap, typeMap } = buildFieldMeta(
      window.App.FORM_GROUPS
    );

    // 定義順に表示
    const orderedIds = [];
    window.App.FORM_GROUPS.forEach((g) =>
      g.fields.forEach((f) => orderedIds.push(f.id))
    );

    const rows = orderedIds
      .filter((id) => id in values)
      .filter((id) => {
        // showIfがある項目は、現在値に対して非表示ならサマリにも出さない
        const field = findFieldById(window.App.FORM_GROUPS, id);
        if (field && typeof field.showIf === "function") {
          return field.showIf(values);
        }
        return true;
      })
      .map((id) => {
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
                  before
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

    return `<div>${rows}</div>`;
  }

  function buildFieldMeta(groups) {
    const labelMap = {};
    const optionTextMap = {}; // { fieldId: { value: text } }
    const typeMap = {}; // { fieldId: type }

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

  function findFieldById(groups, id) {
    for (const g of groups) {
      for (const f of g.fields) {
        if (f.id === id) return f;
      }
    }
    return null;
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
