import type React from "react";
import { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Stack,
	Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ja } from "date-fns/locale/ja";

// モーダルが受け取るプロップスの厳格な型定義
interface ApplicationModalProps {
	isOpen: boolean;
	onClose: () => void;
	/**
	 * フォーム送信時のコールバック関数
	 */
	onSubmit: (formData: {
		vehicleName: string; // 内部実装は共通だが、親側でフルーツ名等にマッピング可能
		startDate: Date | null;
		endDate: Date | null;
		purpose: string;
	}) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	// フォームのローカル状態管理（型推論により安全に制御）
	const [name, setName] = useState<string>("");
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [purpose, setPurpose] = useState<string>("");

	// バリデーション：必須項目が入力されているかチェック
	const isFormValid = name.trim() !== "" && startDate !== null && endDate !== null && purpose.trim() !== "";

	// フォームリセット処理
	const handleReset = () => {
		setName("");
		setStartDate(null);
		setEndDate(null);
		setPurpose("");
	};

	// キャンセル時のハンドラー
	const handleCancel = () => {
		handleReset();
		onClose();
	};

	// 送信時のハンドラー
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isFormValid) return;

		onSubmit({
			vehicleName: name,
			startDate,
			endDate,
			purpose,
		});

		handleReset();
	};

	return (
		<Dialog open={isOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ fontWeight: 700, pb: 1 }}>新規申請登録</DialogTitle>
			
			{/* HTMLのネイティブなフォーム機能を利用してアクセシビリティを確保 */}
			<Box component="form" onSubmit={handleSubmit}>
				<DialogContent dividers>
					{/* MUI v9 仕様: レイアウトプロパティはすべてsx内に集約 */}
					<Stack spacing={3} sx={{ pt: 1 }}>
						
						{/* 対象名称入力 */}
						<TextField
							label="対象品目 / 申請名称"
							fullWidth
							variant="outlined"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							placeholder="例: 高級完熟マンゴー、市民フットサル大会など"
						/>

						{/* カレンダー選択エリア (MUI X DatePickers) */}
						<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
							<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
								<DatePicker
									label="開始日 / 入荷日"
									value={startDate}
									onChange={(newValue) => setStartDate(newValue)}
									slotProps={{
										textField: {
											fullWidth: true,
											required: true,
										},
									}}
								/>
								<DatePicker
									label="終了日 / 出荷期限"
									value={endDate}
									onChange={(newValue) => setEndDate(newValue)}
									slotProps={{
										textField: {
											fullWidth: true,
											required: true,
										},
									}}
									minDate={startDate ?? undefined} // 開始日より前の日付を選択不可に
								/>
							</Stack>
						</LocalizationProvider>

						{/* 目的・理由の複数行入力 */}
						<TextField
							label="利用目的 / 備考"
							fullWidth
							variant="outlined"
							multiline
							rows={4}
							value={purpose}
							onChange={(e) => setPurpose(e.target.value)}
							required
							placeholder="申請の詳細な理由や目的を入力してください"
						/>
					</Stack>
				</DialogContent>

				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={handleCancel} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
						キャンセル
					</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={!isFormValid}
						sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
					>
						申請を確定する
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	);
};

export default ApplicationModal;