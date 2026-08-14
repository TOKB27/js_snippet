import { HttpResponse, http } from "msw";

/**
 * データモデル型定義
 * (Python Lambda / RDS PostgreSQL のテーブル構造と整合)
 */
export interface ManagedItem {
	id: string;
	title: string;
	category: "DOCUMENT" | "CREDENTIAL" | "INFRA";
	description: string;
	status: "ACTIVE" | "ARCHIVED";
	createdAt: string;
	updatedAt: string;
}

/**
 * 初期モックデータ
 */
export const mockItems: ManagedItem[] = [
	{
		id: "item-001",
		title: "AWS構成設計書_CloudFront_API_Gateway",
		category: "DOCUMENT",
		description: "CloudFront + S3 + Cognito + API Gatewayのアーキテクチャ定義書",
		status: "ACTIVE",
		createdAt: "2026-08-14T09:00:00Z",
		updatedAt: "2026-08-14T09:00:00Z",
	},
	{
		id: "item-002",
		title: "RDS接続Bastion運用マニュアル",
		category: "INFRA",
		description: "EC2踏み台経由でのPostgreSQLトンネリング接続手順",
		status: "ACTIVE",
		createdAt: "2026-08-14T10:00:00Z",
		updatedAt: "2026-08-14T10:00:00Z",
	},
];

/**
 * API Gateway / Lambda 模擬ハンドラー群
 */
export const handlers = [
	// 1. 管理項目一覧取得 API (GET /api/v1/items)
	http.get("/api/v1/items", ({ request }) => {
		// ※ 必要に応じて Cognito Bearer トークンの有無をチェック
		const authHeader = request.headers.get("Authorization");
		if (authHeader && !authHeader.startsWith("Bearer ")) {
			return HttpResponse.json({ message: "Unauthorized: Invalid Cognito Token" }, { status: 401 });
		}

		return HttpResponse.json(
			{
				success: true,
				data: mockItems,
				totalCount: mockItems.length,
			},
			{ status: 200 },
		);
	}),

	// 2. 新規データ登録 API (POST /api/v1/items)
	http.post("/api/v1/items", async ({ request }) => {
		const body = (await request.json()) as Partial<ManagedItem>;

		// バリデーション（Python Lambda 側の Pydantic / PostgreSQL NOT NULL 制約を意識）
		if (!body.title || !body.category) {
			return HttpResponse.json(
				{
					success: false,
					message: "Bad Request: title and category are required",
				},
				{ status: 400 },
			);
		}

		const newItem: ManagedItem = {
			id: `item-${Date.now()}`,
			title: body.title,
			category: body.category,
			description: body.description ?? "",
			status: "ACTIVE",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return HttpResponse.json(
			{
				success: true,
				data: newItem,
			},
			{ status: 201 },
		);
	}),
];
