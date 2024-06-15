// PromiseJavaScriptの非同期処理を扱うためのオブジェクトで、成功（resolved）または失敗（rejected）の状態を持つ
// resolve は、Promise オブジェクトにおいて非同期処理が成功した場合に呼び出される関数
// 5行後にメッセージ出力される例
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve("Data fetched"), 5000);
  });
}

fetchData().then((data) => console.log(data));

// async/awaitを用いて非同期処理
async function fetchAsyncData() {
  let data = await fetchData();
  console.log(data);
}
fetchAsyncData();
