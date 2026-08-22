import { expect, test } from "@playwright/test";

test.describe("システム導線の E2E テスト", () => {
  test("ポータルからシステムAへ遷移できる", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "情報一元管理プラットフォーム" })).toBeVisible();
    await expect(page.getByText("利用する業務システムを選択してください。")).toBeVisible();

    await page.getByRole("button", { name: "システムを開く" }).first().click();

    await expect(page.getByRole("heading", { name: "システムA：フルーツ管理システム" })).toBeVisible();
  });

  test("システムAの申請フォームは必須項目が揃うまで送信できない", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "システムを開く" }).first().click();

    await page.getByRole("button", { name: "新規品質検査申請" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const submitButton = page.getByRole("button", { name: "申請を確定する" });
    await expect(submitButton).toBeDisabled();

    await page.getByLabel("対象品目 / 申請名称").fill("高級完熟マンゴー");
    await page.getByLabel("利用目的 / 備考").fill("夏季の出荷計画確認");

    await expect(submitButton).toBeDisabled();
    await expect(page.getByText("新規申請登録")).toBeVisible();
  });

  test("システムBへ遷移してテーブル表示とフィルター操作ができる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "システムを開く" }).nth(1).click();

    await expect(page.getByRole("heading", { name: "システムB：スポーツ管理システム" })).toBeVisible();

    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible();
    await expect(grid.getByText("市民フットサル大会（予選リーグ）")).toBeVisible();

    const header = page.getByRole("columnheader", { name: "大会・イベント名" });
    await header.hover();

    const menuButton = header.locator('button[aria-label*="column menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const columnMenu = page.getByRole("menu");
    await expect(columnMenu).toBeVisible();
    await expect(columnMenu.getByRole("menuitem", { name: /filter/i })).toBeVisible();
  });

  test("システムBのCSVダウンロードが実行できる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "システムを開く" }).nth(1).click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "CSVダウンロード" }).click(),
    ]);

    const filename = download.suggestedFilename();
    expect(filename).toContain(".csv");
  });
});
