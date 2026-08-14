import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		// describe, test, it, expect などのグローバルインポートを有効化
		globals: true,
		// ブラウザ環境をシミュレートする JSDOM を指定
		environment: "jsdom",
		// 各テスト実行前に読み込む共通セットアップファイル
		setupFiles: "./src/test/setup.ts",
		// MUI のスタイル計算処理をスキップしてテスト実行を劇的に高速化
		css: false,
		// テスト対象外とするディレクトリ
		exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
		// カバレッジ計測設定
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["src/test/**", "src/main.tsx", "src/vite-env.d.ts", "**/*.d.ts"],
		},
	},
});
