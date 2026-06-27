import type React from "react";
import { Box, CircularProgress, Typography, LinearProgress, Paper } from "@mui/material";

interface LoadingProgressProps {
	/**
	 * ローディングの進捗率（0 〜 100）
	 */
	progress: number;
	/**
	 * 現在読み込み中の処理名やステータスメッセージ
	 */
	message?: string;
	/**
	 * 読み込み済みのデータサイズなどの詳細テキスト (例: "3.6MB / 4.2MB")
	 */
	detailText?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
	progress,
	message = "データを読み込んでいます...",
	detailText,
}) => {
	// 進捗率が範囲外にならないよう制御
	const clampedProgress = Math.min(Math.max(progress, 0), 100);

	return (
		<Box
			sx={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: (theme) => theme.zIndex.modal + 1,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				// 背景に透過度の高いダークマスクをかけ、背後の操作を無効化
				bgcolor: "rgba(0, 0, 0, 0.4)",
				backdropFilter: "blur(4px)", // 視覚的な美しさを出すためのグラスモルフィズム
			}}
		>
			<Paper
				elevation={4}
				sx={{
					p: 4,
					width: "100%",
					maxWidth: 440,
					borderRadius: 2,
					textAlign: "center",
					bgcolor: "background.paper",
				}}
			>
				{/* 中央のサークルインジケーター */}
				<Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
					<CircularProgress
						variant="determinate"
						value={clampedProgress}
						size={80}
						thickness={4.5}
						color="primary"
					/>
					<Box
						sx={{
							top: 0,
							left: 0,
							bottom: 0,
							right: 0,
							position: "absolute",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
							{`${Math.round(clampedProgress)}%`}
						</Typography>
					</Box>
				</Box>

				{/* ステータスメッセージ */}
				<Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
					{message}
				</Typography>

				{/* 詳細情報 (データサイズなど) */}
				{detailText && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontVariantNumeric: "tabular-nums" }}>
						{detailText}
					</Typography>
				)}

				{/* 下部のライン型プログレスバー */}
				<Box sx={{ width: "100%", mt: 1 }}>
					<LinearProgress
						variant="determinate"
						value={clampedProgress}
						color="primary"
						sx={{ height: 6, borderRadius: 3 }}
					/>
				</Box>
			</Paper>
		</Box>
	);
};

export default LoadingProgress;