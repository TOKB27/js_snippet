# TypeScript 設定ファイル（tsconfig）役割・構成概要仕様書

---

## 1. はじめに・概要

本ドキュメントはフロントエンド基盤（React + TypeScript + Material UI + Biome + Vitest）において採用されている TypeScript 設定ファイル群の全体像、それぞれの役割分担、および分離設計の技術的根拠をまとめた仕様書です。

本プロジェクトでは、TypeScript の **Project References（プロジェクト参照）** 機能を活用し、ブラウザで動作するアプリケーションコードと Node.js 上で動作するビルド/テスト設定コードの型環境を明確に分離・統括しています。

---

## 2. tsconfig ファイル構成と全体マップ

プロジェクトルートにおける TypeScript 設定ファイルの依存関係および全体構造は以下の通りです。

```
プロジェクトルート
├── tsconfig.json          # 【親】全体統括・オーケストレーター
│     │
│     ├── references
│     │     ▼
│     ├── tsconfig.app.json  # 【子1】React アプリケーション・UI・テスト用
│     │                      #       (CloudFront/S3 配信対象 & Vitest/JSDOM)
│     │
│     └── tsconfig.node.json # 【子2】ビルドツール・Node.js 実行環境用
│                            #       (vite.config.ts, vitest.config.ts 等)
```

---

## 3. 各ファイルの役割と設定詳細

### ① `tsconfig.json`（プロジェクト全体の統括・オーケストレーター）

#### 【主な役割】
プロジェクト全体のルート設定ファイルです。自身は直接 TypeScript ファイルをコンパイルせず（`files: []`）、子設定ファイル（`tsconfig.app.json`, `tsconfig.node.json`）を参照・統合する役割を持ちます。

#### 【設定のポイント】
* **`files: []`**: ルート設定自身による二重コンパイルや誤った型チェックを防止します。
* **`references`**: `tsc -b`（ビルドモード）を実行した際、依存関係に基づいて子プロジェクトを順序正しく差分ビルド・型チェックします。

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

---

### ② `tsconfig.app.json`（React アプリケーション & UIテスト用）

#### 【主な役割】
`src/` ディレクトリ配下に存在する **すべてのフロントエンドコード（React コンポーネント、Material UI、フック、状態管理、API通信、Vitest テストコード）** を型定義・チェックする中核設定です。

#### 【設定のポイント】
* **`lib: ["ES2020", "DOM", "DOM.Iterable"]`**: ブラウザ環境で使用可能な DOM API（`window`, `document`, `fetch` 等）を有効化。
* **`jsx: "react-jsx"`**: React 17 以降の新しい JSX トランスフォームを適用（`import React from 'react'` の省略を許可）。
* **`types: ["vitest/globals", "@testing-library/jest-dom/vitest"]`**: Vitest のグローバル関数（`describe`, `it`, `expect`）および Testing Library のマッチャー（`toBeInTheDocument` 等）を型補完の対象に含める。
* **Biome 連携**: `noUnusedLocals` や `noUnusedParameters` などの厳格なチェックを有効化し、Biome の Linter と連携して不要コードを防止。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* バンドラー向けモジュール解決 */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* 厳格な型チェック (Biome・型安全連携) */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Vitest & Testing Library グローバル型定義 */
    "types": ["vitest/globals", "@testing-library/jest-dom/vitest"]
  },
  "include": ["src"]
}
```

---

### ③ `tsconfig.node.json`（ビルドツール・Node.js 実行環境用）

#### 【主な役割】
ローカル開発機や CI/CD パイプライン上の **Node.js 環境で実行される設定スクリプト（`vite.config.ts`, `vitest.config.ts` 等）** に適用される設定です。

#### 【設定のポイント】
* **`lib: ["ES2022"]`**: ブラウザ用の DOM API を含めず、純粋な ECMAScript / Node.js API のみを許可。
* **`include`**: ルート直下の設定ファイル（`vite.config.ts`, `vitest.config.ts` 等）のみを対象に限定。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* バンドラー向け設定 */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* 厳格な型チェック */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

---

## 4. ファイルを分離する技術的理由・メリット

### ① 型汚染（Type Pollution）の防止
* **課題**: 1つの `tsconfig.json` に DOM ライブラリと Node.js の型を両方記述すると、フロントエンドコード（`src/`）内で誤って Node.js 専用の `process.env` や `fs` モジュールを参照してもコンパイルが通ってしまい、S3/CloudFront 本番配信時に実行時クラッシュを引き起こします。
* **解決**: `src/` 配下（`tsconfig.app.json`）とビルドスクリプト（`tsconfig.node.json`）で型定義の境界を完全に分離することで、誤った API 参照を実行前に 100% 検知します。

### ② 高速なインクリメンタル型チェック
* **課題**: 単一設定ファイルの場合、一部の設定ファイルの変更でもプロジェクト全体の全ファイルを再検証する必要が生じます。
* **解決**: Project References を利用することで、TypeScript コンパイラ（`tsc -b`）がプロジェクト境界を認識し、差分のみを効率的にチェックするため、CI やローカルでの型検査速度が向上します。

### ③ Biome との責務分離（静的解析の高速化）
* **Biome**: 超高速な構文解析・フォーマット・一般的な Lint ルール・アクセシビリティ（a11y）をチェック。
* **TypeScript (`tsconfig.app.json`)**: コンポーネント間の Props 整合性、API レスポンス型、Vitest グローバル型の整合性をチェック。
* 両者の役割を明確に分担することで、開発時のフィードバック速度を最大化します。

---

## 5. 比較一覧表

| 設定ファイル | 対象領域 | 動作環境 | DOM API (window, document) | 主な対象ファイル |
| :--- | :--- | :--- | :--- | :--- |
| **`tsconfig.json`** | 全体統括 | - | なし (参照のみ) | なし (`files: []`) |
| **`tsconfig.app.json`** | アプリケーション & UIテスト | ブラウザ (CloudFront/S3) & JSDOM | **利用可能 (`DOM`)** | `src/**/*.tsx`, `src/**/*.ts` |
| **`tsconfig.node.json`** | ビルド・設定スクリプト | Node.js (開発機 / CI) | **利用不可** | `vite.config.ts`, `vitest.config.ts` |
