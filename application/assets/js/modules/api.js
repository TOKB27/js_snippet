// assets/js/modules/api.js
window.App = window.App || {};
window.App.Api = window.App.Api || {};

window.App.Api.submitApplication = async function (payload) {
  console.log("submit payload:", payload);
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
};

window.App.Api.fetchTestData = async function () {
  const res = await fetch("./assets/data/test_data.json", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("test_data.json の読み込みに失敗しました。");
  }

  return await res.json();
};