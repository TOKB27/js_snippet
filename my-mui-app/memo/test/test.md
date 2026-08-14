# UIリファクタリング（jQuery → React/MUI）テスト計画・自動化概要仕様書

---

## 1. はじめに・テストの目的

本ドキュメントは、フロントエンドのレガシー資産（jQuery）からモダンスタック（React + TypeScript + Material UI + Biome）へのリファクタリングに伴い、**「リファクタリング前後で既存機能・挙動に一切のデグレーション（機能破壊・先祖返り）がないこと」**を機械的かつ高速に保証するためのテスト方針・自動化アーキテクチャを定義するものです。

### 達成目標
1. **振る舞いの等価性保証**: jQuery実装とReact実装に対し、同一のユーザー操作シナリオ・アサーションを適用して同一結果を得ること。
2. **高速フィードバックループの確立**: Biome + Vitest + MSW による高速な実行基盤により、ミリ秒〜数秒でテストを完了させ、開発速度を最大化する。
3. **AWSインフラ非依存の隔離テスト**: API Gateway / Python Lambda / RDS PostgreSQL をモック（MSW）化し、認証（Cognito / Lambda@Edge）やDBに依存せずローカルおよびCI環境で安定動作させる。

---

## 2. システム前提アーキテクチャとテスト境界

本システム全体のアーキテクチャと、今回のUIテスト自動化がカバーする境界を以下に示します。

```
【本番システム全体像】
[ユーザー / ブラウザ]
       │
       ▼ (CloudFront + Lambda@Edge: Cognito Token検証)
[S3: Static Hosting (React / MUI App)]
       │
       ▼ (HTTPS / Cognito Bearer Auth)
[Amazon API Gateway]
       │
       ▼
[AWS Lambda (Python 3.12)] ── (Secrets Managerで認証情報取得)
       │
       ▼ (VPC / EC2 Bastion経由運用)
[Amazon RDS for PostgreSQL]

──────────────────────────────────────────────────────────────────

【UI結合テスト実行時（Vitest + RTL + MSW）のテスト境界】
┌──────────────────────────────────────────────────────────────┐
│ JSDOM 実行環境 (Vitest)                                      │
│                                                              │
│  [テストシナリオ (User Scenarios)]                           │
│     │ (クリック・入力・表示確認)                             │
│     ▼                                                        │
│  [対象UI (jQuery HTML or React/MUI Component)]               │
│     │ (HTTP Request: /api/v1/...)                            │
│     ▼                                                        │
│  [MSW (Mock Service Worker)] <─── API Gateway/Lambdaの身代わり │
│     │ (モックJSONレスポンス返却)                             │
│     ▼                                                        │
│  [画面へのデータ反映・トースト表示の自動検証]                │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. テスト技術スタック選定理由

| ツール / ライブラリ | 役割 | 選定理由・技術的メリット |
| :--- | :--- | :--- |
| **Vitest** | テストランナー / アサーション | Vite / Biome との親和性が極めて高く、Jestと比べて起動・実行速度が圧倒的に高速。ESMネイティブ対応。 |
| **@testing-library/dom<br>& @testing-library/react** | ユーザー操作シミュレーション / DOM検証 | 実装詳細（内部Stateやプライベート変数）ではなく、アクセシビリティ（Role, Label, Text）を基準としたテストが可能。 |
| **MSW (Mock Service Worker)** | ネットワーク層モック (API Gateway代行) | Service Worker / Node.js通信層でリクエストを横取り。jQuery (`$.ajax`) でも React (`fetch` / `axios`) でも同一のモックハンドラーを共用可能。 |
| **Biome** | 静的解析 (Lint / Format) | テストコード自体の品質保持・型チェックと連携した高速な静的検証の実行。 |

---

## 4. テスト共通化アーキテクチャ（jQuery ⇄ React）

リファクタリング前後の安全性を証明するため、テスト資産を以下の3層構造に分離・共通化します。

```
                    ┌───────────────────────────────┐
                    │ 1. API Mock層 (MSW Handlers) │
                    │    /api/v1/items などの定義    │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │ 2. 共通ユーザーシナリオ層     │
                    │    runItemManagerScenario()   │
                    │    (アクセシビリティ操作・検証) │
                    └───────┬───────────────┬───────┘
                            │               │
            ┌───────────────┴───┐       ┌───┴───────────────┐
            ▼                   │       │                   ▼
  【jQuery検証テスト】          │       │         【React/MUI検証テスト】
  ・DOM生成 & $.ajax 実行       │       │         ・RTL render(<ItemManager/>)
  ・共通シナリオの呼び出し      │       │         ・共通シナリオの呼び出し
            │                   │       │                   │
            └───────────────┬───┘       └───┬───────────────┘
                            ▼               ▼
                 [ Vitest による並列高速自動判定 (All Pass) ]
```

### ① 共通シナリオの検証観点
* **初期ロード**: APIからのデータフェッチおよびローディング終了後のデータ一覧表示
* **ユーザー入力**: テキストフィールドへの入力、セレクトボックスの選択
* **アクション実行**: 送信ボタン押下によるPOSTリクエスト送信
* **楽観的/応答的UI更新**: リストへの新規要素追加、入力フォームの初期化
* **通知・フィードバック**: MUI Snackbar / Alert または同等の完了通知の表示
* **バリデーション**: 必須項目未入力時のボタン非活性（disabled）制御

---

## 5. ディレクトリ構成案

```
src/
├── features/
│   └── items/
│       ├── ItemManager.tsx         # [リファクタ後] React + MUI コンポーネント
│       └── ItemManager.test.tsx    # React版の自動テスト実行ファイル
├── legacy/
│   ├── jqueryApp.ts                # [リファクタ前] 既存のjQueryコード
│   └── jqueryApp.test.ts           # jQuery版の自動テスト実行ファイル
└── test/
    ├── setup.ts                    # Vitest 初期セットアップ・MSWライフサイクル設定
    ├── mocks/
    │   ├── handlers.ts             # API Gateway / Lambda 共通モック定義
    │   └── server.ts               # MSW nodeサーバーインスタンス
    └── scenarios/
        └── itemScenario.ts         # ★ jQuery / React 共用の操作・検証シナリオ関数
```

---

## 6. テスト実行 & CI/CD 自動化フロー

プルリクエスト（PR）作成時およびリファクタリング作業中のローカル環境において、以下のパイプラインを自動実行します。

1. **静的解析フェーズ (Biome / TypeScript)**
   - `npx @biomejs/biome check --apply .` (Lint & Format)
   - `npx tsc --noEmit` (型整合性チェック)
2. **UI結合テストフェーズ (Vitest + MSW)**
   - `npx vitest run`
   - jQueryレガシーテスト ＆ React新実装テストの双方が実行され、100% Pass することを確認。
3. **カバレッジ・デグレーション検証**
   - 既存仕様との差分（不一致）が発生した場合は即座にCIを落とし、デグレーションを防止。

---

## 7. 今後の拡張計画（バックエンド結合 & E2E）

フロントエンドUIの等価性検証完了後、以下のフェーズへ拡張します。

* **Phase 2 (バックエンド単体/統合テスト)**:
  - Python Lambda に対する `pytest` + `moto`（AWSリソースモック）
  - Amazon RDS PostgreSQL に対するトランザクションロールバック型統合テスト
* **Phase 3 (E2Eテスト)**:
  - Playwright による Amazon CloudFront + Cognito 認証ログインを通した本番同等ブラウザ結合テスト
