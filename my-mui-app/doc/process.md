# Vite + MUI (Material UI) ローカル環境立ち上げ手順
Vite を使って React (TypeScript) プロジェクトを立ち上げ、MUI を導入してブラウザ表示するまでの最短手順です。

## Vite で React プロジェクトを作成する
ターミナルを開き、プロジェクトを作成したいディレクトリに移動して以下のコマンドを実行します。

### プロジェクトの作成（「my-mui-app」は任意のプロジェクト名）
npm create vite@latest my-mui-app -- --template react-ts

### 作成したプロジェクトのディレクトリに移動
cd my-mui-app


## 依存パッケージのインストール
### 基本パッケージのインストール
npm install

### MUI コアパッケージのインストール
npm install @mui/material @emotion/react @emotion/styled

### MUI DataGridのインストール
npm install @mui/x-data-grid

# MUI Date Pickers ＆ 日付ユーティリティ（申請のカレンダー選択用）のインストール
npm install @mui/x-date-pickers date-fns

# MUI Icons（プラスアイコンや戻る矢印など）のインストール
npm install @mui/icons-material

# Biomeのインストール
npm install @biomejs/biome

# Biome初期設定ファイル作成
npx @biomejs/biome init

## ローカル開発サーバーの起動
npm run dev

## ビルド（静的ファイルの生成→プロジェクト直下に dist というフォルダが生成）
npm run build