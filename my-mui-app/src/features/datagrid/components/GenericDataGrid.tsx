import { Download as DownloadIcon } from "@mui/icons-material";
import { Box, Button, Stack } from "@mui/material";
import {
	DataGrid,
	type GridColDef,
	type GridColumnGroupingModel,
	type GridValidRowModel,
} from "@mui/x-data-grid";
import type React from "react";

interface GenericDataGridProps<TRows extends GridValidRowModel> {
	rows: TRows[];
	columns: GridColDef<TRows>[];
	loading?: boolean;
	pageSize?: number;
	columnGroupingModel?: GridColumnGroupingModel;
	fileName?: string; // ダウンロード時のファイル名（拡張子不要）
}

/**
 * 💡 100%確実に動作する自作CSVダウンロード処理（Excel文字化け防止のBOM付きUTF-8）
 */
const handleCsvDownload = <TRows extends GridValidRowModel>(
	rows: TRows[],
	columns: GridColDef<TRows>[],
	fileName: string,
) => {
	if (!rows || rows.length === 0) return;

	// 1. エクスポート対象のカラムを取得（fieldとheaderNameが存在するもの）
	const exportableCols = columns.filter((col) => col.field && col.headerName);

	// 2. ヘッダー行を作成
	const headerLine = exportableCols.map((col) => `"${col.headerName ?? col.field}"`).join(",");

	// 3. データ行を作成
	const bodyLines = rows.map((row) =>
		exportableCols
			.map((col) => {
				const val = row[col.field as keyof TRows];
				const formattedVal =
					val !== undefined && val !== null ? String(val).replace(/"/g, '""') : "";
				return `"${formattedVal}"`;
			})
			.join(","),
	);

	// 4. BOM (\uFEFF) を付与して Blob を生成（Excelの日本語文字化け防止）
	const csvString = [headerLine, ...bodyLines].join("\n");
	const blob = new Blob([`\uFEFF${csvString}`], { type: "text/csv;charset=utf-8;" });

	// 5. ブラウザでダウンロードを実行
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", `${fileName}.csv`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const GenericDataGrid = <TRows extends GridValidRowModel>({
	rows,
	columns,
	loading = false,
	pageSize = 10,
	columnGroupingModel,
	fileName = "export_data",
}: GenericDataGridProps<TRows>): React.JSX.Element => {
	return (
		<Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
			{/* 💡 sx プロパティへカプセル化して Stack のオーバーロードエラーを解決 */}
			<Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
				<Button
					variant="outlined"
					color="primary"
					size="small"
					startIcon={<DownloadIcon />}
					onClick={() => handleCsvDownload(rows, columns, fileName)}
					sx={{ textTransform: "none", fontWeight: 600 }}
				>
					CSVダウンロード
				</Button>
			</Stack>

			{/* DataGrid本体 */}
			<Box sx={{ flexGrow: 1, width: "100%", minHeight: 300 }}>
				<DataGrid
					rows={rows}
					columns={columns}
					loading={loading}
					columnGroupingModel={columnGroupingModel}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: pageSize,
								page: 0,
							},
						},
					}}
					pageSizeOptions={[5, 10, 20, 50]}
					disableRowSelectionOnClick
					disableColumnMenu={false}
					sx={{
						border: "none",
						"& .MuiDataGrid-columnHeaders": {
							bgcolor: "background.neutral",
						},
						"& .MuiDataGrid-columnGroupHeader": {
							fontWeight: 700,
							color: "text.secondary",
							borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
							bgcolor: "rgba(0, 0, 0, 0.01)",
						},
						"& .MuiDataGrid-cell": {
							borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
							fontVariantNumeric: "tabular-nums",
						},
						"& .MuiDataGrid-footerContainer": {
							borderTop: (theme) => `1px solid ${theme.palette.divider}`,
						},
					}}
				/>
			</Box>
		</Box>
	);
};

export default GenericDataGrid;
