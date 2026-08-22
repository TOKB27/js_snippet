import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // テストファイルの格納ディレクトリ
  testDir: "./e2e",

  // 並列実行の設定
  fullyParallel: true,

  // CI環境でのみ test.only を禁止
  forbidOnly: !!process.env.CI,

  // 失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,

  // レポート出力設定（コンソール一覧 + HTMLレポート）
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  // 各テスト共通のブラウザ実行設定
  use: {
    // 対象WebサーバーのベースURL
    baseURL: "http://localhost:5173",

    // エビデンス収集設定
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // タイムアウト設定 (ミリ秒)
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  // 実行対象ブラウザの定義
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // テスト実行前のローカル開発サーバー自動起動設定
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});