import { createTheme } from "@mui/material/styles";

/**
 * アプリケーション全体のMUIカスタムテーマ定義
 * システムの一貫したデザイン（プライマリカラー、背景色、タイポグラフィ）を制御します。
 */
export const theme = createTheme({
	palette: {
		primary: {
			main: "#1976d2", // システム全体のメインカラー（信頼感のあるブルー）
		},
		secondary: {
			main: "#9c27b0", // バージョン発行やサブアクション用（パープル）
		},
		background: {
			default: "#f5f5f5", // 画面全体の背景（薄いグレーでカードを引き立たせる）
		},
	},
	typography: {
		fontFamily: ["Roboto", '"Helvetica Neue"', "Arial", "sans-serif"].join(","),
	},
});
