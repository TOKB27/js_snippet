# 開発・テスト・コード品質運用コマンドリファレンス (command.md)

---

## 1. 概要

本ドキュメントは、のフロントエンド（React + TypeScript + Material UI + Biome）およびテスト基盤（Vitest + RTL + MSW）の開発・運用で日常的に使用する実行コマンドを体系的にまとめたリファレンスです。

---

## 2. コマンドクイックリファレンス

| 分類 | コマンド | 説明 |
| :--- | :--- | :--- |
| **開発サーバー** | `npm run dev` | ローカル開発サーバー (Vite) の起動 |
| **型チェック** | `npm run typecheck` | TypeScript の型チェックを一括実行 (`tsc -b --noEmit`) |
| **コード検証 (Lint)** | `npm run lint` | Biome による静的解析とフォーマット規約チェック |
| **コード自動修正** | `npm run lint:fix` | Biome による安全な自動修正 (インポート整理・フォーマット適用) |
| **強制一括修正** | `npx @biomejs/biome check --write --unsafe .` | テンプレートリテラル変換等を含む一括適用 |
| **フォーマットのみ** | `npm run format` | Biome によるコード整形のみを実行 |
| **テスト実行** | `npm run test` | Vitest による単体・結合テストの全件実行 (CI向け) |
| **テスト監視** | `npm run test:watch` | ファイル変更を検知してテストを自動再実行 (開発向け) |
| **カバレッジ測定** | `npm run test:coverage` | V8 エンジンによるテストカバレッジレポートの出力 |
| **本番ビルド** | `npm run build` | 型検証 (`tsc -b`) と本番向け静的アセット生成 (Vite) |

---

## 3. 分野別コマンド詳細と実行手順

### ① 静的解析・コードフォーマット (Biome)

Biome を利用して、コード品質、アクセシビリティ (a11y)、インポート順序の整合性を検証・自動修正します。

#### 1. コード検証（エラーの有無を確認）
```bash
npm run lint
# または直接実行:
npx @biomejs/biome check .
```
- **用途:** CI環境やコミット前に、ルール違反（未使用変数、フォーマット崩れ等）がないか確認します。

#### 2. 安全な自動修正の適用 (Safe Fixes)
```bash
npm run lint:fix
# または直接実行:
npx @biomejs/biome check --write .
```
- **用途:** インポートのアルファベット順ソート、タブインデント、ダブルクォートの統一などを一括適用します。

#### 3. 推奨される構文変換を含めた自動修正 (Unsafe Fixes 含む)
```bash
npx @biomejs/biome check --write --unsafe .
```
- **用途:** 文字列結合 (`+`) からテンプレートリテラル (`` `${...}` ``) への変換など、構文レベルの最適化を一括適用します。

#### 4. フォーマット（整形）のみの適用
```bash
npm run format
# または直接実行:
npx @biomejs/biome format --write .
```

---

### ② 型チェック (TypeScript)

Project References（`tsconfig.app.json` / `tsconfig.node.json`）の依存関係をすべて解決した厳格な型検証を行います。

```bash
npm run typecheck
# または直接実行:
npx tsc -b --noEmit
```
- **用途:** Biome では検知できない TypeScript 固有の型不整合、MUI コンポーネントの Props 型、API Gateway レスポンス型の不整合を網羅的に検査します。

---

### ③ UI結合・単体テスト (Vitest + React Testing Library + MSW)

Amazon API Gateway / Cognito レスポンスを MSW でモック化し、ブラウザを介さずに高速なユーザー操作検証を行います。

#### 1. テストの一括実行（CI/CD & コミット前確認）
```bash
npm run test
# または直接実行:
npx vitest run
```

#### 2. ウォッチモードでの開発（TDD・コンポーネント開発時）
```bash
npm run test:watch
# または直接実行:
npx vitest
```
- **用途:** ファイルを保存するたびに、関連するテストケースが数ミリ秒で自動再実行されます。

#### 3. カバレッジレポートの出力
```bash
npm run test:coverage
# または直接実行:
npx vitest run --coverage
```
- **用途:** レポート（HTML/テキスト）を出力し、テスト網羅率（Statements / Branches / Functions / Lines）を可視化します。

---

### ④ ビルド & 成果物プレビュー (Vite)

Amazon CloudFront + S3 (Static Website Hosting) にデプロイする本番アセットを生成・確認します。

#### 1. 本番ビルド
```bash
npm run build
```
- **実行内容:** `tsc -b` による厳格な型チェックをパスした後にのみ、`dist/` ディレクトリ配下に最適化された JS / CSS / HTML アセットが生成されます。

#### 2. ビルド成果物のローカルプレビュー
```bash
npm run preview
```

---

## 4. プルリクエスト（PR）提出前・推奨チェックフロー

コードをコミット・プッシュする前に、以下の3ステップを順に実行することで、CI パイプラインでの失敗を未然に防ぎます。

```bash
# Step 1: Biome による自動修正 & 検証
npm run lint:fix

# Step 2: TypeScript 型チェック
npm run typecheck

# Step 3: 自動テストの全件パス確認
npm run test
```
