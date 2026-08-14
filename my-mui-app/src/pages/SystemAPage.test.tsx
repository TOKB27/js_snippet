import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "../test/test-utils";
import { SystemAPage } from "./SystemAPage";

describe("SystemAPage (システムA：フルーツ管理システム)", () => {
	it("1. 画面タイトルと初期フルーツ一覧データが表示されていること", () => {
		const handleBack = vi.fn();
		render(<SystemAPage onBack={handleBack} />);

		// ヘッダー確認
		expect(
			screen.getByRole("heading", {
				name: "システムA：フルーツ管理システム",
			}),
		).toBeInTheDocument();

		// グリッド内の初期データ確認
		expect(screen.getByText("完熟マンゴー (宮崎県産)")).toBeInTheDocument();
		expect(screen.getByText("シャインマスカット")).toBeInTheDocument();
		expect(screen.getByText("佐藤錦 (さくらんぼ)")).toBeInTheDocument();
		expect(screen.getByText("合格 (出荷可)")).toBeInTheDocument();
	});

	it("2. 「ポータルへ戻る」ボタンを押すと onBack コールバックが発火すること", async () => {
		const handleBack = vi.fn();
		const { user } = render(<SystemAPage onBack={handleBack} />);

		const backButton = screen.getByRole("button", {
			name: /ポータルへ戻る/i,
		});
		await user.click(backButton);

		expect(handleBack).toHaveBeenCalledTimes(1);
	});

	it("3. 「新規品質検査申請」をクリックするとモーダルが開き、閉じるボタンで閉じられること", async () => {
		const handleBack = vi.fn();
		const { user } = render(<SystemAPage onBack={handleBack} />);

		// モーダルを開く
		const openModalButton = screen.getByRole("button", {
			name: /新規品質検査申請/i,
		});
		await user.click(openModalButton);

		// モーダル要素（Dialog）が表示されたことを確認
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toBeInTheDocument();

		// モーダル内の「キャンセル」ボタンを押して閉じる
		const cancelButton = screen.getByRole("button", {
			name: /キャンセル|閉じる/i,
		});
		await user.click(cancelButton);

		// モーダルが非表示になったことを確認
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});
});
