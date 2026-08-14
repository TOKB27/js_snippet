import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

// 1. テストスイート全体の実行前に MSW サーバーを起動
// 未定義のAPIリクエストが飛んできた場合は警告ではなくエラーにして意図しない通信漏れを防ぐ
beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

// 2. 各テストケース実行後に状態をリセット
afterEach(() => {
	// React Testing Library の DOM クリーンアップ
	cleanup();
	// 各テスト内で個別に上書き（override）したハンドラーを初期状態へ戻す
	server.resetHandlers();
});

// 3. 全テスト終了後に MSW サーバーをシャットダウン
afterAll(() => {
	server.close();
});
