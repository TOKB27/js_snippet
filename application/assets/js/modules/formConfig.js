// assets/js/modules/formConfig.js
window.App = window.App || {};

// 申請種別（ヘッダー色・タイトル）
window.App.APPLY_TYPES = {
  NEW: { key: "NEW", title: "新規申請", headerClass: "bg-primary" },
  UPDATE: {
    key: "UPDATE",
    title: "変更申請",
    headerClass: "bg-warning text-dark",
  },
  DELETE: { key: "DELETE", title: "削除申請", headerClass: "bg-danger" },
};

// Step1: 入力フォーム定義（グループ単位）
window.App.FORM_GROUPS = [
  {
    title: "基本情報",
    fields: [
      {
        id: "name",
        label: "名称",
        type: "text",
        required: (ctx) => ctx.applyType !== "DELETE",
        placeholder: "例）〇〇",
      },

      {
        id: "type",
        label: "種別",
        type: "select",
        options: [
          { value: "", text: "選択してください" },
          { value: "A", text: "A" },
          { value: "B", text: "B" },
        ],
        required: (ctx) => ctx.applyType !== "DELETE",
      },

      {
        id: "plan",
        label: "プラン",
        type: "radio",
        options: [
          { value: "basic", text: "Basic" },
          { value: "pro", text: "Pro" },
        ],
        required: (ctx) => ctx.applyType !== "DELETE",
      },
    ],
  },
  {
    title: "通知設定",
    fields: [
      {
        id: "notify",
        label: "通知方法",
        type: "select",
        options: [
          { value: "", text: "選択してください" },
          { value: "email", text: "メール" },
          { value: "sms", text: "SMS" },
        ],
        required: (ctx) => ctx.applyType !== "DELETE",
      },

      {
        id: "emailAddress",
        label: "メールアドレス",
        type: "text",
        showIf: (values) => values.notify === "email",
        required: (ctx, values) =>
          ctx.applyType !== "DELETE" && values.notify === "email",
        placeholder: "example@example.com",
      },

      {
        id: "smsNumber",
        label: "SMS番号",
        type: "text",
        showIf: (values) => values.notify === "sms",
        required: (ctx, values) =>
          ctx.applyType !== "DELETE" && values.notify === "sms",
        placeholder: "090...",
      },

      {
        id: "agree",
        label: "利用規約に同意",
        type: "checkbox",
        required: (ctx) => ctx.applyType !== "DELETE",
      },
    ],
  },
];

// Step2: 申請前確認の入力（確認画面で追加入力）
window.App.PRECHECK_GROUPS = [
  {
    title: "申請前確認",
    fields: [
      {
        id: "confirmText",
        label: "確認コメント",
        type: "text",
        required: true,
        placeholder: "確認しました 等",
      },

      {
        id: "impact",
        label: "影響範囲",
        type: "select",
        options: [
          { value: "", text: "選択してください" },
          { value: "low", text: "低" },
          { value: "mid", text: "中" },
          { value: "high", text: "高" },
        ],
        required: true,
      },

      {
        id: "rollback",
        label: "ロールバック手順あり",
        type: "radio",
        options: [
          { value: "yes", text: "はい" },
          { value: "no", text: "いいえ" },
        ],
        required: true,
      },

      {
        id: "finalCheck",
        label: "最終確認チェック",
        type: "checkbox",
        required: true,
      },
    ],
  },
];
