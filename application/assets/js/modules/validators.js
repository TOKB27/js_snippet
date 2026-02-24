// assets/js/modules/validators.js
window.App = window.App || {};
window.App.Validators = window.App.Validators || {};

window.App.Validators.isEmpty = function (v) {
  return v === undefined || v === null || String(v).trim() === "";
};

window.App.Validators.validateFields = function ({
  ctx,
  values,
  groups,
  $root,
}) {
  let ok = true;

  // 既存エラー表示をクリア
  $root.find(".is-invalid").removeClass("is-invalid");
  $root.find(".invalid-feedback.dynamic").remove();

  for (const g of groups) {
    for (const f of g.fields) {
      // 表示条件がある場合、非表示なら検証しない
      if (typeof f.showIf === "function" && !f.showIf(values)) continue;

      // required は boolean or function(ctx, values)
      const req =
        typeof f.required === "function"
          ? f.required(ctx, values)
          : !!f.required;
      if (!req) continue;

      const val = values[f.id];

      // checkbox は true必須
      if (f.type === "checkbox") {
        if (val !== true) {
          ok = false;
          markInvalid($root, f.id, "必須です。");
        }
        continue;
      }

      // text/select/radio
      if (window.App.Validators.isEmpty(val)) {
        ok = false;
        markInvalid($root, f.id, "必須です。");
      }
    }
  }

  return ok;
};

function markInvalid($root, fieldId, message) {
  const $el = $root.find(`[data-field="${fieldId}"]`);
  $el.addClass("is-invalid");

  // 直後に invalid-feedback を動的追加（Bootstrap標準）
  if ($el.next(".invalid-feedback.dynamic").length === 0) {
    $el.after(`<div class="invalid-feedback dynamic">${message}</div>`);
  }
}
