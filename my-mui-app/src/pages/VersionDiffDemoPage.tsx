import type React from "react";
import { Box, Container, Typography, Stack, Button, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, CompareArrows as CompareIcon } from "@mui/icons-material";
import { DataGrid, type GridColDef, type GridColumnGroupingModel } from "@mui/x-data-grid";

interface FruitRecord {
	gridRowId: string;
	id: string;
	version: number;
	fruitName: string;
	category: string;
	price: number;
	purpose: string;
	updatedAt: string;
	updatedBy: string; // 担当者を追加
	type: "before" | "after";
}

interface VersionDiffDemoPageProps {
	onBack?: () => void;
}

export const VersionDiffDemoPage: React.FC<VersionDiffDemoPageProps> = ({ onBack }) => {
	
	const rows: FruitRecord[] = [
		{
			gridRowId: "FRUIT-001-v2",
			id: "FRUIT-001",
			version: 2,
			fruitName: "完熟マンゴー (宮崎県産)",
			category: "トロピカルフルーツ",
			price: 4980,
			purpose: "糖度検査にて15度を記録したため、出荷選別基準をギフトB級から特選A級へ引き上げて再申請。",
			updatedAt: "2026-06-26 10:15",
			updatedBy: "検収担当 佐藤",
			type: "before",
		},
		{
			gridRowId: "FRUIT-001-v3",
			id: "FRUIT-001",
			version: 3,
			fruitName: "特選 完熟マンゴー (宮崎県産プレミアム)",
			category: "熱帯果樹",
			price: 5800,
			purpose: "糖度検査16度以上クリア。お中元ギフト用の最終検収および特殊フィルムパッキング包装を適用。",
			updatedAt: "2026-06-27 15:30",
			updatedBy: "品質管理課 山田",
			type: "after",
		},
	];

	const getCellSchema = (currentGridRowId: string, field: keyof FruitRecord) => {
		const isBeforeRow = currentGridRowId.endsWith("-v2");
		const targetRowId = isBeforeRow ? "FRUIT-001-v3" : "FRUIT-001-v2";
		const currentRow = rows.find((r) => r.gridRowId === currentGridRowId);
		const targetRow = rows.find((r) => r.gridRowId === targetRowId);

		if (!currentRow || !targetRow) return {};

		if (currentRow[field] !== targetRow[field]) {
			return {
				backgroundColor: isBeforeRow ? "rgba(211, 47, 47, 0.08)" : "rgba(46, 125, 50, 0.08)",
				color: isBeforeRow ? "error.main" : "success.main",
				fontWeight: isBeforeRow ? 400 : 600,
				textDecoration: isBeforeRow ? "line-through" : "none",
			};
		}
		return {};
	};

	// カラム（子ヘッダー）の定義
	const columns: GridColDef<FruitRecord>[] = [
		{
			field: "type",
			headerName: "比較区分",
			width: 120,
			renderCell: (params) => {
				const isBefore = params.value === "before";
				return (
					<Chip
						label={isBefore ? `v${rows[0].version} 変更前` : `v${rows[1].version} 変更後`}
						color={isBefore ? "default" : "primary"}
						size="small"
						variant={isBefore ? "outlined" : "filled"}
					/>
				);
			},
		},
		{
			field: "id",
			headerName: "管理ID",
			width: 110,
		},
		{
			field: "fruitName",
			headerName: "品目・品種名",
			width: 240,
			renderCell: (params) => (
				<Box sx={{ ...getCellSchema(params.row.gridRowId, "fruitName"), width: "100%", height: "100%", display: "flex", alignItems: "center", px: 1 }}>
					{params.value}
				</Box>
			),
		},
		{
			field: "updatedBy",
			headerName: "担当者",
			width: 140,
			renderCell: (params) => (
				<Box sx={{ ...getCellSchema(params.row.gridRowId, "updatedBy"), width: "100%", height: "100%", display: "flex", alignItems: "center", px: 1 }}>
					{params.value}
				</Box>
			),
		},
		{
			field: "category",
			headerName: "管理カテゴリ",
			width: 140,
			renderCell: (params) => (
				<Box sx={{ ...getCellSchema(params.row.gridRowId, "category"), width: "100%", height: "100%", display: "flex", alignItems: "center", px: 1 }}>
					{params.value}
				</Box>
			),
		},
		{
			field: "price",
			headerName: "想定単価 (円)",
			width: 120,
			renderCell: (params) => (
				<Box sx={{ ...getCellSchema(params.row.gridRowId, "price"), width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", px: 1, fontVariantNumeric: "tabular-nums" }}>
					{Number(params.value).toLocaleString()}
				</Box>
			),
		},
		{
			field: "purpose",
			headerName: "申請・備考詳細",
			flex: 1,
			minWidth: 250,
			renderCell: (params) => (
				<Box sx={{ ...getCellSchema(params.row.gridRowId, "purpose"), width: "100%", height: "100%", display: "flex", alignItems: "center", px: 1, whiteSpace: "normal", lineHeight: "1.2" }}>
					{params.value}
				</Box>
			),
		},
	];

	// 親ヘッダー（グルーピング）のモデル定義
	const columnGroupingModel: GridColumnGroupingModel = [
		{
			groupId: "application_basic_info",
			headerName: "申請基本情報",
			description: "申請に関する基本的なマスタ情報です",
			headerAlign: "center", // 親ヘッダーの文字を中央揃えに
			children: [
				{ field: "id" }, 
				{ field: "fruitName" }, 
				{ field: "updatedBy" }
			], // グループに入れたい子カラムのfield名を指定
		},
		{
			groupId: "change_details",
			headerName: "変更内容・メタ情報",
			headerAlign: "center",
			children: [
				{ field: "category" }, 
				{ field: "price" }, 
				{ field: "purpose" }
			],
		},
	];

	return (
		<Container maxWidth="xl" sx={{ py: 4 }}>
			<Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 4 }}>
				<Box>
					{onBack && (
						<Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 1, textTransform: "none" }} variant="text">
							戻る
						</Button>
					)}
					<Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
						カラムグルーピング差分比較
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						MUI標準の構造化ヘッダーを適用し、関連する複数のカラムを「親ヘッダー」で束ねています。
					</Typography>
				</Box>
				<Chip icon={<CompareIcon />} label="構造化ヘッダーモード" color="success" variant="outlined" />
			</Stack>

			<Box sx={{ height: 350, width: "100%", bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
				<DataGrid
					rows={rows}
					columns={columns}
					// 💡 プロップスに作成したグループモデルを渡すだけ
					columnGroupingModel={columnGroupingModel}
					getRowId={(row) => row.gridRowId}
					rowHeight={70}
					disableRowSelectionOnClick
					hideFooter
					sx={{
						border: "none",
						"& .MuiDataGrid-columnHeaders": {
							bgcolor: "rgba(0, 0, 0, 0.02)",
						},
						// 親ヘッダー部分の境界線や背景のスタイリング
						"& .MuiDataGrid-columnGroupHeader": {
							fontWeight: 700,
							color: "text.secondary",
							borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
							bgcolor: "rgba(0, 0, 0, 0.01)",
						},
						"& .MuiDataGrid-cell": {
							p: 0,
							borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
						},
					}}
				/>
			</Box>
		</Container>
	);
};

export default VersionDiffDemoPage;