import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { SystemSelectorPage } from "./SystemSelectorPage";

describe("SystemSelectorPage (ポータル選択画面)", () => {
	it("1. システムA（フルーツ管理）およびシステムB（スポーツ管理）のカードが描画されること", () => {
		const handleSelect = vi.fn();
		render(<SystemSelectorPage onSelectSystem={handleSelect} />);

		// タイトルと説明文の確認
		expect(
			screen.getByRole("heading", { name: "情報一元管理プラットフォーム" }),
		).toBeInTheDocument();
		expect(screen.getByText("システムA（フルーツ管理）")).toBeInTheDocument();
		expect(screen.getByText("システムB（スポーツ管理）")).toBeInTheDocument();
	});

	it("2. 「システムA」のボタンをクリックするとコールバックに 'A' が渡されること", async () => {
		const handleSelect = vi.fn();
		const { user } = render(<SystemSelectorPage onSelectSystem={handleSelect} />);

		const buttons = screen.getAllByRole("button", {
			name: "システムを開く",
		});
		// 1つ目のボタン（システムA）をクリック
		await user.click(buttons[0]);

		expect(handleSelect).toHaveBeenCalledTimes(1);
		expect(handleSelect).toHaveBeenCalledWith("A");
	});

	it("3. 「システムB」のボタンをクリックするとコールバックに 'B' が渡されること", async () => {
		const handleSelect = vi.fn();
		const { user } = render(<SystemSelectorPage onSelectSystem={handleSelect} />);

		const buttons = screen.getAllByRole("button", {
			name: "システムを開く",
		});
		// 2つ目のボタン（システムB）をクリック
		await user.click(buttons[1]);

		expect(handleSelect).toHaveBeenCalledTimes(1);
		expect(handleSelect).toHaveBeenCalledWith("B");
	});
});
