# Step 1: 開発環境・依存パッケージの整備 & Biome設定 手順書

---

## 1. 概要と目的

本手順書は、のフロントエンド基盤（React + TypeScript + Material UI）において、**Biome による超高速な静的解析・フォーマット環境** および **Vitest + React Testing Library + MSW によるUI結合テスト自動化環境** を構築するための初期セットアップ手順書です。

本構成を適用することで、以下の開発体験と品質基準を実現します：
* **Biome による高速・厳格なコード規約担保**: ESLint/Prettier よりも桁違いに高速な Lint / Format をワンバイナリで実行。
* **Vitest + JSDOM のネイティブ統合**: Vite のビルドパイプラインと同期した高速なテスト実行環境の確立。
* **MSW による AWS API Gateway / Cognito 境界の隔離**: バックエンド（Python Lambda / RDS）や認証（Cognito）に依存しない単体・結合テストの土台作成。

---

## 2. 前提環境

* **Node.js**: `v20.x` 以上（LTS 推奨）
* **パッケージマネージャー**: `npm`（または `pnpm` / `yarn`）
* **ビルドツール**: `Vite` (React + TypeScript テンプレート)

---

## 3. 依存パッケージのインストール手順

プロジェクトルートディレクトリで以下のコマンドを実行し、テストおよびコード品質担保に必要なパッケージを追加します。

### ① テストフレームワーク & モックライブラリ（開発依存）
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw @vitest/coverage-v8
```

### ② Biome（リンター / フォーマッター）
```bash
npm install -D --save-exact @biomejs/biome
```

### ③ フロントエンドUI & アイコン（本番依存）
※ 未インストールの場合は導入します。
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

#### 【導入パッケージの選定理由一覧】
| パッケージ名 | 用途・役割 | 選定理由 |
| :--- | :--- | :--- |
| `vitest` | テストランナー | Vite 設定を共有し、ESM を高速ネイティブ処理。Jest に比べ起動・実行が極めて高速。 |
| `@testing-library/react`<br>`@testing-library/jest-dom`<br>`@testing-library/user-event` | ユーザー操作シミュレーション / DOM検証 | 内部 State ではなくアクセシビリティ（Role, Label）基準で検証し、リファクタリング耐性を向上。 |
| `jsdom` | 仮想DOM環境 | Node.js 上でブラウザの `window` / `document` 環境を再現。 |
| `msw` (Mock Service Worker) | ネットワーク層モック | API Gateway / Lambda 宛ての HTTP リクエストを捕捉し、安全かつ高速なモックレスポンスを返却。 |
| `@biomejs/biome` | 静的解析 / フォーマッター | Rust 製の高速ツール。TypeScript の型安全性とクリーンコードを徹底。 |

---

## 4. 各種設定ファイルの作成・構成

### ① `biome.json`（プロジェクトルート）
プロジェクトのコード品質ルール、インデント、インポート整理、未定義変数の検知を定義します。

```json
{
	"$schema": "https://biomejs.dev/schemas/2.5.1/schema.json",
	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true
	},
	"files": {
		"includes": [
			"**",
			"!!**/dist",
			"!!**/coverage",
			"!!**/node_modules",
			"!!**/src/test/mocks/mockServiceWorker.js"
		]
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "tab",
		"lineWidth": 100
	},
	"linter": {
		"enabled": true,
		"rules": {
			"preset": "recommended",
			"correctness": {
				"noUnusedVariables": "error",
				"noUnusedImports": "error"
			},
			"style": {
				"useConst": "error",
				"noNonNullAssertion": "warn"
			},
			"a11y": {
				"recommended": true
			}
		}
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "double",
			"semicolons": "always",
			"trailingCommas": "all"
		}
	},
	"assist": {
		"enabled": true,
		"actions": {
			"source": {
				"organizeImports": "on"
			}
		}
	}
}
```

---

### ② `vitest.config.ts`（プロジェクトルート）
React プラグインおよび JSDOM 環境、テストセットアップファイルを連携します。

```typescript
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // describe, test, it, expect などのグローバルインポートを有効化
    globals: true,
    // ブラウザ環境をシミュレートする JSDOM を指定
    environment: "jsdom",
    // 各テスト実行前に読み込む共通セットアップファイル
    setupFiles: "./src/test/setup.ts",
    // MUI のスタイル計算処理をスキップしてテスト実行を劇的に高速化
    css: false,
    // テスト対象外とするディレクトリ
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
    // カバレッジ計測設定
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "src/test/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "**/*.d.ts",
      ],
    },
  },
});
```

---

### ③ `tsconfig.app.json` の型定義追加
テストコード内で `vitest/globals` および `@testing-library/jest-dom` の型定義（`toBeInTheDocument` 等）が TypeScript に認識されるよう、`types` 配列を更新します。

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    /* ★ vitest/globals と jest-dom の型定義を追加 */
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom/vitest"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict & Linting (Biomeと整合) */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  /* src 配下のすべてのソースコードおよびテスト関連コードを包括 */
  "include": ["src"]
}
```

---

### ④ `package.json` へのスクリプト登録
日常の開発フローで実行するスクリプトを `package.json` に追記します。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "biome check .",
    "lint:apply": "biome check --write .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 5. 動作確認コマンド

環境のセットアップ完了後、以下のコマンドが正常に動作することを確認します。

```bash
# 1. Biome による静的解析 & フォーマットチェック
npm run lint

# 2. TypeScript による型整合性チェック
npm run typecheck

# 3. Vitest の実行テスト（テストファイルが存在する場合）
npm run test
```

---

## 6. 次のステップ（Step 2）への連携

本環境整備（Step 1）が完了したら、次は **「Step 2: MSW による AWS API Gateway モック基盤の構築」** に進み、`src/test/setup.ts`、`src/test/mocks/handlers.ts`、および `src/test/mocks/server.ts` を配置します。
