import type React from "react";
import { useState } from "react";
import { Box, Button, Container, Typography, Stack, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import type { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";
import { GenericDataGrid } from "../features/datagrid/components/GenericDataGrid";
import { ApplicationModal } from "../features/application/components/ApplicationModal";

interface FruitRecord {
	id: string;
	fruitName: string;
	origin: string;
	arrivalDate: string;
	inspectionStatus: "passed" | "pending" | "failed";
	shippingLimit: string;
}

interface SystemAPageProps {
	onBack: () => void;
}

export const SystemAPage: React.FC<SystemAPageProps> = ({ onBack }) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fruits: FruitRecord[] = [
		{ id: "FRUIT-001", fruitName: "完熟マンゴー (宮崎県産)", origin: "宮崎県 JA宮崎", arrivalDate: "2026-06-25", inspectionStatus: "passed", shippingLimit: "2026-07-05" },
		{ id: "FRUIT-002", fruitName: "シャインマスカット", origin: "山梨県 勝沼農協", arrivalDate: "2026-06-26", inspectionStatus: "pending", shippingLimit: "2026-07-12" },
		{ id: "FRUIT-003", fruitName: "佐藤錦 (さくらんぼ)", origin: "山形県 東根市", arrivalDate: "2026-06-23", inspectionStatus: "failed", shippingLimit: "2026-06-28" },
	];

	const columns: GridColDef<FruitRecord>[] = [
		{ field: "id", headerName: "品目ID", width: 120 },
		{ field: "fruitName", headerName: "品種・品名", width: 220 },
		{ field: "origin", headerName: "生産地・農協名", width: 180 },
		{ field: "arrivalDate", headerName: "入荷日", width: 130 },
		{ field: "shippingLimit", headerName: "出荷制限期限", width: 130 },
		{
			field: "inspectionStatus",
			headerName: "品質検査状態",
			width: 140,
			renderCell: (params) => {
				const status = params.value;
				let color: "success" | "warning" | "error" = "warning";
				let label = "保留";

				if (status === "passed") { color = "success"; label = "合格 (出荷可)"; }
				else if (status === "failed") { color = "error"; label = "不合格 (制限)"; }

				return <Chip label={label} color={color} size="small" />;
			},
		},
	];

	// 💡 フルーツ専用の親ヘッダー定義
	const fruitColumnGroupingModel: GridColumnGroupingModel = [
		{
			groupId: "fruit_base_info",
			headerName: "品目基本情報",
			headerAlign: "center",
			children: [{ field: "id" }, { field: "fruitName" }, { field: "origin" }],
		},
		{
			groupId: "inspection_info",
			headerName: "入荷・検査ステータス",
			headerAlign: "center",
			children: [{ field: "arrivalDate" }, { field: "shippingLimit" }, { field: "inspectionStatus" }],
		},
	];

	return (
		<Container maxWidth="xl" sx={{ py: 4 }}>
			<Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 4 }}>
				<Box>
					<Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 1, textTransform: "none" }} variant="text">
						ポータルへ戻る
					</Button>
					<Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
						システムA：フルーツ管理システム
					</Typography>
				</Box>

				<Stack direction="row" spacing={2}>
					<Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={() => setIsLoading(true)} disabled={isLoading} sx={{ textTransform: "none" }}>
						最新の情報に更新
					</Button>
					<Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
						新規品質検査申請
					</Button>
				</Stack>
			</Stack>

			<Box sx={{ height: 600, width: "100%", bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
				<GenericDataGrid rows={fruits} columns={columns} columnGroupingModel={fruitColumnGroupingModel} loading={isLoading} />
			</Box>

			<ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={(data) => console.log(data)} />
		</Container>
	);
};