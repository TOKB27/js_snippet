import { Apple, SportsSoccer } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Container,
	Grid,
	Typography,
} from "@mui/material";
import type React from "react";

// システム定義の型安全なインターフェース
interface SystemInfo {
	id: "A" | "B";
	title: string;
	description: string;
	icon: React.ReactNode;
}

interface SystemSelectorPageProps {
	onSelectSystem: (systemId: "A" | "B") => void;
}

export const SystemSelectorPage: React.FC<SystemSelectorPageProps> = ({ onSelectSystem }) => {
	// フルーツ管理・スポーツ管理に特化したシステム定義
	const systems: SystemInfo[] = [
		{
			id: "A",
			title: "システムA（フルーツ管理）",
			description:
				"フルーツの入荷状況、品質検査申請、および出荷制限ステータスの制御を一元管理します。",
			icon: <Apple sx={{ fontSize: 40, color: "primary.main" }} />,
		},
		{
			id: "B",
			title: "システムB（スポーツ管理）",
			description:
				"各種スポーツ施設・コートの予約状況、大会イベントスケジュールおよび定員の閲覧を行います。",
			icon: <SportsSoccer sx={{ fontSize: 40, color: "secondary.main" }} />,
		},
	];

	return (
		<Container maxWidth="lg" sx={{ py: 8 }}>
			<Box sx={{ textAlign: "center", mb: 6 }}>
				<Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
					情報一元管理プラットフォーム
				</Typography>
				<Typography variant="h6" color="text.secondary">
					利用する業務システムを選択してください。
				</Typography>
			</Box>

			<Grid container spacing={4} sx={{ justifyContent: "center" }}>
				{systems.map((system) => (
					<Grid size={{ xs: 12, md: 5 }} key={system.id}>
						<Card
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								transition: "transform 0.2s, box-shadow 0.2s",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: 4,
								},
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
									{system.icon}
									<Typography variant="h5" component="h2" sx={{ ml: 2, fontWeight: 600 }}>
										{system.title}
									</Typography>
								</Box>
								<Typography variant="body2" color="text.secondary">
									{system.description}
								</Typography>
							</CardContent>
							<CardActions sx={{ p: 2, pt: 0 }}>
								<Button
									fullWidth
									variant="contained"
									color={system.id === "A" ? "primary" : "secondary"}
									onClick={() => onSelectSystem(system.id)}
									sx={{ textTransform: "none", fontWeight: 600 }}
								>
									システムを開く
								</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>
		</Container>
	);
};
