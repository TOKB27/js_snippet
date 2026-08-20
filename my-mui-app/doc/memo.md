# MUIコンポーネント
## テーブル
DataGrid
標準機能として「フィルター（絞り込み）」「列の表示・非表示（Column visibility）」「ソート」「ページネーション」「カラム幅変更」が組み込まれており、要件をすべて自己完結で満たせる。

Paper
テーブルの背景となる外枠（カード状のコンテナ）として利用し、画面に立体感を与える。

## モーダル外枠
Dialog(DialogTitle, DialogContent, DialogActions)
Modalコンポーネントよりも、タイトル・中身・ボタンの構造化が容易で、申請フォームに最適。

## テキストボックス
TextField
標準的な入力欄。labelやrequired（必須マーク）、エラー時の赤枠表示（errorプロパティ）が簡単に制御可能。

## チェックボックス
Checkbox(FormControlLabel)
同意事項や、複数選択の項目に利用。

## ラジオボタン
RadioGroup(Radio, FormControlLabel)
単一選択の項目（例：申請区分の選択など）に利用。

## カレンダー選択
DatePicker(from @mui/x-date-pickers)
申請日や希望日などをカレンダーから直感的に選択。
※利用には LocalizationProvider のラップが必要。