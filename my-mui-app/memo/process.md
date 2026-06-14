# Vite + MUI (Material UI) ローカル環境立ち上げ手順
Vite を使って React (TypeScript) プロジェクトを立ち上げ、MUI を導入してブラウザ表示するまでの最短手順です。

## Vite で React プロジェクトを作成する
ターミナルを開き、プロジェクトを作成したいディレクトリに移動して以下のコマンドを実行します。

### プロジェクトの作成（「my-mui-app」は任意のプロジェクト名）
npm create vite@latest my-mui-app -- --template react-ts

### 作成したプロジェクトのディレクトリに移動
cd my-mui-app


## 依存パッケージのインストール
### 1. 基本パッケージのインストール
npm install

### 2. MUI コアパッケージのインストール
npm install @mui/material @emotion/react @emotion/styled

### 3. MUI アイコンのインストール（任意ですが、よく使うため推奨）
npm install @mui/icons-material

## ローカル開発サーバーの起動
npm run dev