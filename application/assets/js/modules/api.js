// assets/js/modules/api.js
window.App = window.App || {};
window.App.Api = window.App.Api || {};

window.App.Api.submitApplication = async function (payload) {
  // ここを実APIに差し替え
  // return $.ajax({
  //   url: "/api/apply",
  //   method: "POST",
  //   contentType: "application/json",
  //   data: JSON.stringify(payload)
  // });

  console.log("submit payload:", payload);

  // 疑似待ち
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
};
