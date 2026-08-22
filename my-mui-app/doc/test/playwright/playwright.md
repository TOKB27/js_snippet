# Playwright 導入・利用手順書 (playwright_general.md)

---

## 1. 概要

本ドキュメントは、Web フロントエンドアプリケーションにおいて、ブラウザを通じた操作検証（E2E テスト）を実施するための **Playwright の一般的な導入手順、効率的なテスト作成手法、および運用ガイドライン** をまとめたリファレンスです。

---

## 2. 前提要件

* **Node.js**: `20.x` 以上推奨
* **パッケージマネージャー**: `npm`（または `yarn`, `pnpm`）
* **対応 OS**: macOS / Linux / Windows

---

## 3. インストール手順

### Step 1: パッケージのインストール
プロジェクトルートで以下のコマンドを実行し、Playwright テストランナーを開発用依存関係として追加します。

```bash
npm install -D @playwright/test
```

### Step 2: ブラウザバイナリのインストール
テスト実行に必要なブラウザ（Chromium, Firefox, WebKit）をインストールします。

```bash
# 全ブラウザおよび依存パッケージを一括インストールする場合
npx playwright install --with-deps

# Chromium のみに絞ってインストールする場合（初期工数・容量削減）
npx playwright install --with-deps chromium
```

---

## 4. 基本設定ファイルの作成 (`playwright.config.ts`)

プロジェクトルートに設定ファイル `playwright.config.ts` を作成します。

```typescript
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
```

---

## 5. npm スクリプトの登録 (`package.json`)

`package.json` の `scripts` フィールドに実行用コマンドを追加します。

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 6. 効率的なテストコード作成の 4 つのコア原則

### ① 自動待機（Auto-waiting）の活用と固定スリープの全廃
Playwright は、操作対象要素が「表示されているか」「操作可能か」「アニメーションが安定しているか」を自動で判定して待機します。`page.waitForTimeout(3000)` 等の固定秒数スリープは実行速度を落とし、不安定（フレーキー）なテストの原因となるため原則使用しません。

### ② アクセシビリティ優先のロケーター選定
UI変更や構造変化に強いテストを維持するため、ユーザーが画面を認識する基準に沿ったロケーターを優先します。

| 優先度 | ロケーター種別 | コード例 | 主な用途 |
| :--- | :--- | :--- | :--- |
| **最優先** | `getByRole` | `page.getByRole('button', { name: '保存' })` | ボタン、リンク、見出し、ダイアログ |
| **高** | `getByLabel` | `page.getByLabel('ユーザー名')` | `<label>` と紐づく入力フォーム |
| **中** | `getByText` | `page.getByText('完了しました')` | メッセージ、静的テキストの存在確認 |
| **補足** | `getByTestId` | `page.getByTestId('custom-widget')` | 適切なアクセシビリティ属性がない場合 |

### ③ Page Object Model (POM) による再利用性の確保
画面要素の取得や一連の操作ロジックをクラスやモジュールにカプセル化します。画面レイアウトや文言の変更があっても、テストケース側ではなく POM 側の修正 1 箇所で保守が完結します。

### ④ コードジェネレーター (Codegen) による初期作成工数の削減
手作業でセレクタを調査・記述するのではなく、ブラウザ操作の記録から自動生成したコードを下書きとして活用します。

---

## 7. 実践コードパターン

### パターン 1: Page Object Model (POM) の実装例

```typescript
import { type Locator, type Page, expect } from "@playwright/test";

/**
 * 共通データテーブル操作用 Page Object
 */
export class TablePageObject {
  readonly page: Page;
  readonly table: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.getByRole("table");
    this.exportButton = page.getByRole("button", { name: "ダウンロード" });
  }

  async navigateTo(path: string) {
    await this.page.goto(path);
  }

  async verifyRowVisible(text: string) {
    await expect(this.table.getByText(text)).toBeVisible();
  }

  async triggerExport(): Promise<string> {
    const downloadPromise = this.page.waitForEvent("download");
    await this.exportButton.click();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }
}
```

### パターン 2: 基本シナリオテストの実装例

```typescript
import { expect, test } from "@playwright/test";
import { TablePageObject } from "./pages/TablePageObject";

test.describe("基本操作テストスイート", () => {
  test("画面表示・フォーム入力・CSVダウンロードの一連フロー", async ({ page }) => {
    const tablePage = new TablePageObject(page);
    await tablePage.navigateTo("/");

    // 見出しの可視性確認
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // フォーム入力と送信
    const input = page.getByRole("textbox", { name: "ユーザー名" });
    await input.fill("test_user");
    await page.getByRole("button", { name: "送信" }).click();

    // 結果メッセージの検証
    await expect(page.getByText("送信が完了しました")).toBeVisible();

    // CSV ダウンロードの検証
    const filename = await tablePage.triggerExport();
    expect(filename).toContain(".csv");
  });

  test("API エラー発生時のアラート表示検証 (ネットワークモック)", async ({ page }) => {
    // 特定 API を 500 エラーに差し替え
    await page.route("**/api/v1/resource", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    await page.goto("/dashboard");

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("エラーが発生しました");
  });
});
```

---

## 8. テスト実行・開発効率化コマンド

| コマンド | 説明 | 主な用途 |
| :--- | :--- | :--- |
| `npm run test:e2e` | ヘッドレスモードでテストを一括実行 | CI/CD 環境、コミット前の一括チェック |
| `npm run test:e2e:ui` | GUI ダッシュボード（UI モード）を起動 | ステップ実行、タイムライン追跡、視覚的デバッグ |
| `npm run test:e2e:headed` | 実ブラウザウィンドウを表示して実行 | 実際の自動操作挙動を目視確認 |
| `npm run test:e2e:report` | テスト完了レポート (HTML) を開く | 成否エビデンス、失敗時スクリーンショット・動画の確認 |
| `npx playwright codegen <URL>` | ブラウザ操作を記録してコード自動生成 | テストコードの初期骨組み作成 |
| `npx playwright test --debug` | 1 行ずつステップ実行（インスペクター起動） | 原因特定のトラブルシューティング |

---

## 9. アンチパターンと改善策

* **アンチパターン 1: 親要素からの深い CSS パス指定**
  * ✖ `page.locator('div > div:nth-child(2) > form > button')`
  * 〇 `page.getByRole('button', { name: '送信' })`
* **アンチパターン 2: 画面遷移やダイアログの表示待機に固定秒数を使う**
  * ✖ `await page.waitForTimeout(5000)`
  * 〇 `await expect(page.getByRole('dialog')).toBeVisible()`
* **アンチパターン 3: テストケース間で状態（認証やデータ）を依存させる**
  * ✖ テスト A で作成したデータをテスト B で更新する構成（並列実行時に破損）。
  * 〇 各テストケースの `beforeEach` で独立した初期状態をセットアップする。

---

## 10. トラブルシューティング

| 事象 | 原因 | 対処法 |
| :--- | :--- | :--- |
| `browserType.launch: Executable doesn't exist` | ブラウザバイナリが未導入 | `npx playwright install --with-deps` を実行する |
| `webServer process failed to start` | 指定ポートが使用中、または起動コマンド誤り | `baseURL` や `webServer.command` のポート番号・設定を確認する |
| `Timeout exceeded waiting for locator` | セレクタの不一致、または非同期描画の遅延 | 対象要素の `getByRole` や `getByText` の指定が正しいか確認する |
