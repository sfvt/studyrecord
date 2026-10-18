// 認証・送信・保存は行わない、ログイン画面のプレビュー専用処理。
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("password").value = "";
  window.location.assign("/");
});
