import type React from "react";
import { useState } from "react";
import { Box, Button, Container, Typography, Stack, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import type { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";
import { GenericDataGrid } from "../features/datagrid/components/GenericDataGrid";

interface SportsEvent {
	id: string;
	eventName: string;
	facilityName: string;
	organizer: string;
	eventDate: string;
	status: "scheduled" | "ongoing" | "completed";
	maxParticipants: number;
}

interface SystemBPageProps {
	onBack: () => void;
}

export const SystemBPage: React.FC<SystemBPageProps> = ({ onBack }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const events: SportsEvent[] = [
		{ id: "EVT-101", eventName: "市民フットサル大会（予選リーグ）", facilityName: "中央スポーツアリーナ - コートA", organizer: "地域スポーツ振興課", eventDate: "2026-07-12", status: "scheduled", maxParticipants: 80 },
		{ id: "EVT-102", eventName: "ジュニアテニス強化合宿", facilityName: "緑ヶ丘テニスコート（クレー）", organizer: "テニス協会 事務局", eventDate: "2026-07-15", status: "scheduled", maxParticipants: 30 },
		{ id: "EVT-103", eventName: "シニアアクアエクササイズ定期教室", facilityName: "市民温水プール - 2レーン貸切", organizer: "健康増進推進チーム", eventDate: "2026-06-27", status: "ongoing", maxParticipants: 25 },
	];

	const columns: GridColDef<SportsEvent>[] = [
		{ field: "id", headerName: "イベントID", width: 120 },
		{ field: "eventName", headerName: "大会・イベント名", width: 240 },
		{ field: "facilityName", headerName: "使用施設・コート", width: 220 },
		{ field: "eventDate", headerName: "開催予定日", width: 130 },
		{ field: "organizer", headerName: "主催・運営団体", width: 180 },
		{ field: "maxParticipants", headerName: "定員（名）", type: "number", width: 120, headerAlign: "left", align: "left" },
		{
			field: "status",
			headerName: "開催状況",
			width: 130,
			renderCell: (params) => {
				const status = params.value;
				let color: "info" | "success" | "default" = "default";
				let label = "終了";
				if (status === "scheduled") { color = "info"; label = "開催予定"; }
				else if (status === "ongoing") { color = "success"; label = "進行中"; }
				return <Chip label={label} color={color} size="small" variant="filled" />;
			},
		},
	];

	// 💡 スポーツ専用の親ヘッダー定義
	const sportsColumnGroupingModel: GridColumnGroupingModel = [
		{
			groupId: "schedule_info",
			headerName: "開催スケジュール",
			headerAlign: "center",
			children: [{ field: "id" }, { field: "eventName" }, { field: "facilityName" }, { field: "eventDate" }],
		},
		{
			groupId: "management_info",
			headerName: "運営・キャパシティ情報",
			headerAlign: "center",
			children: [{ field: "organizer" }, { field: "maxParticipants" }, { field: "status" }],
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
						システムB：スポーツ管理システム
					</Typography>
				</Box>
				<Button variant="outlined" color="secondary" startIcon={<RefreshIcon />} onClick={() => setIsLoading(true)} disabled={isLoading} sx={{ textTransform: "none" }}>
					最新の情報に更新
				</Button>
			</Stack>

			<Box sx={{ height: 600, width: "100%", bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
				<GenericDataGrid rows={events} columns={columns} columnGroupingModel={sportsColumnGroupingModel} loading={isLoading} />
			</Box>
		</Container>
	);
};