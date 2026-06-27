import type React from "react";
import { Box } from "@mui/material";
import { DataGrid, type GridColDef, type GridValidRowModel, type GridColumnGroupingModel, GridToolbar } from "@mui/x-data-grid";

interface GenericDataGridProps<TRows extends GridValidRowModel> {
	rows: TRows[];
	columns: GridColDef<TRows>[];
	loading?: boolean;
	pageSize?: number;
	// 💡 親ヘッダーの定義を受け取れるように拡張
	columnGroupingModel?: GridColumnGroupingModel;
}

export const GenericDataGrid = <TRows extends GridValidRowModel>({
	rows,
	columns,
	loading = false,
	pageSize = 10,
	columnGroupingModel, // 💡 追加
}: GenericDataGridProps<TRows>): React.JSX.Element => {
	return (
		<Box sx={{ width: "100%", height: "100%" }}>
			<DataGrid
				rows={rows}
				columns={columns}
				loading={loading}
				columnGroupingModel={columnGroupingModel} // 💡 DataGridにそのまま流し込む
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
				slots={{
					toolbar: GridToolbar,
				}}
				sx={{
					border: "none",
					"& .MuiDataGrid-toolbarContainer": {
						p: 1,
						gap: 1,
						borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
						"& .MuiButton-root": {
							textTransform: "none",
							fontWeight: 600,
						},
					},
					"& .MuiDataGrid-columnHeaders": {
						bgcolor: "background.neutral",
					},
					// 💡 親ヘッダー（グループ）のスタイル定義を追加
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
	);
};

export default GenericDataGrid;