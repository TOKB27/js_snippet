import { CssBaseline, ThemeProvider } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ja } from "date-fns/locale/ja";
import type React from "react";
import type { ReactElement, ReactNode } from "react";
import { theme } from "../theme/theme";

/**
 * テスト実行時に全コンポーネントへ共通適用するプロバイダー群
 */
interface AllTheProvidersProps {
	children: ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
				{children}
			</LocalizationProvider>
		</ThemeProvider>
	);
};

/**
 * MUI テーマおよび日付プロバイダーを自動注入するカスタム render 関数
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
	return {
		user: userEvent.setup(),
		...render(ui, { wrapper: AllTheProviders, ...options }),
	};
};

// React Testing Library の標準ユーティリティをすべて再エクスポート
export * from "@testing-library/react";

// 標準の render を customRender に差し替えてエクスポート
export { customRender as render };
