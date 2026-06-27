import type React from "react";
import { useState } from "react";
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { theme } from "./theme/theme";
import { SystemSelectorPage } from "./features/system-selector/SystemSelectorPage";
import { SystemAPage } from "./pages/SystemAPage";
import { SystemBPage } from "./pages/SystemBPage";
// 💡 デモページをインポート
import { VersionDiffDemoPage } from "./pages/VersionDiffDemoPage";

type ActivePage = "PORTAL" | "SYSTEM_A" | "SYSTEM_B" | "DEMO";

export const App: React.FC = () => {
	const [activePage, setActivePage] = useState<ActivePage>("PORTAL");

	const handleSelectSystem = (systemId: "A" | "B" | "C") => {
		if (systemId === "A") {
			setActivePage("SYSTEM_A");
		} else if (systemId === "B") {
			setActivePage("SYSTEM_B");
		}
	};

	const handleBackToPortal = () => {
		setActivePage("PORTAL");
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			
			<Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
				{/* グローバルナビゲーションバー */}
				<AppBar position="static" elevation={1} sx={{ bgcolor: "background.paper", color: "text.primary" }}>
					<Toolbar>
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: "0.5px", cursor: "pointer" }}
							onClick={handleBackToPortal}
						>
							情報一元管理プラットフォーム
						</Typography>

						{/* ナビゲーションバーの右側に「差分デモ」ボタンを配置 */}
						<Button
							color="primary"
							variant={activePage === "DEMO" ? "contained" : "text"}
							onClick={() => setActivePage("DEMO")}
							sx={{ textTransform: "none", fontWeight: 600, ml: 2 }}
						>
							履歴・差分デモ画面を開く
						</Button>
					</Toolbar>
				</AppBar>

				{/* 画面の条件付きレンダリング */}
				<Box component="main">
					{activePage === "PORTAL" && (
						<SystemSelectorPage onSelectSystem={handleSelectSystem} />
					)}
					{activePage === "SYSTEM_A" && (
						<SystemAPage onBack={handleBackToPortal} />
					)}
					{activePage === "SYSTEM_B" && (
						<SystemBPage onBack={handleBackToPortal} />
					)}
					{/* 💡 状態が 'DEMO' の時にデモページを表示 */}
					{activePage === "DEMO" && (
						<VersionDiffDemoPage onBack={handleBackToPortal} />
					)}
				</Box>
			</Box>
		</ThemeProvider>
	);
};

export default App;