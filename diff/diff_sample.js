/**
 * 値を比較しやすい形に正規化する
 * - null / undefined は null に統一
 * - Date は ISO文字列に変換
 */
function normalizeValue(val) {
  if (val == null) return null;
  if (val instanceof Date) return val.toISOString();
  return val;
}

/**
 * 複合キーを生成する
 * 例: keyFields = ["company_id", "user_id", "target_date"]
 */
function createCompositeKey(row, keyFields) {
  return JSON.stringify(
    keyFields.map((field) => normalizeValue(row?.[field]))
  );
}

/**
 * 指定フィールドだけ取り出す
 */
function pickFields(row, fields) {
  const result = {};
  for (const field of fields) {
    result[field] = normalizeValue(row?.[field]);
  }
  return result;
}

/**
 * 2行の差分を比較対象カラムだけで判定する
 */
function compareRows(oldRow, newRow, compareColumns) {
  const changes = {};

  for (const col of compareColumns) {
    const oldVal = normalizeValue(oldRow?.[col]);
    const newVal = normalizeValue(newRow?.[col]);

    if (oldVal !== newVal) {
      changes[col] = {
        old: oldVal,
        new: newVal
      };
    }
  }

  return changes;
}

/**
 * 複合キーの重複チェック
 * 同一データ内でキー重複があると正しく比較できないため事前検証する
 */
function validateUniqueKeys(rows, keyFields, tableName = "table") {
  const seen = new Set();

  for (const row of rows) {
    const key = createCompositeKey(row, keyFields);

    if (seen.has(key)) {
      throw new Error(
        `${tableName} 内で複合キーが重複しています: ${key}`
      );
    }

    seen.add(key);
  }
}

/**
 * 2つのテーブルデータを差分比較する
 *
 * @param {Array<Object>} oldRows - 比較元データ
 * @param {Array<Object>} newRows - 比較先データ
 * @param {Array<string>} keyFields - 複合キー項目
 * @param {Array<string>} compareColumns - 差分比較対象カラム
 * @returns {{
 *   added: Array,
 *   removed: Array,
 *   updated: Array,
 *   unchanged: Array
 * }}
 */
function diffTables(oldRows, newRows, keyFields, compareColumns) {
  if (!Array.isArray(oldRows)) {
    throw new Error("oldRows は配列である必要があります。");
  }
  if (!Array.isArray(newRows)) {
    throw new Error("newRows は配列である必要があります。");
  }
  if (!Array.isArray(keyFields) || keyFields.length === 0) {
    throw new Error("keyFields は1件以上の配列である必要があります。");
  }
  if (!Array.isArray(compareColumns) || compareColumns.length === 0) {
    throw new Error("compareColumns は1件以上の配列である必要があります。");
  }

  validateUniqueKeys(oldRows, keyFields, "oldRows");
  validateUniqueKeys(newRows, keyFields, "newRows");

  const oldMap = new Map(
    oldRows.map((row) => [createCompositeKey(row, keyFields), row])
  );

  const newMap = new Map(
    newRows.map((row) => [createCompositeKey(row, keyFields), row])
  );

  const result = {
    added: [],
    removed: [],
    updated: [],
    unchanged: []
  };

  const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const compositeKey of allKeys) {
    const oldRow = oldMap.get(compositeKey);
    const newRow = newMap.get(compositeKey);

    // 追加
    if (!oldRow && newRow) {
      result.added.push({
        keyValues: pickFields(newRow, keyFields),
        row: newRow
      });
      continue;
    }

    // 削除
    if (oldRow && !newRow) {
      result.removed.push({
        keyValues: pickFields(oldRow, keyFields),
        row: oldRow
      });
      continue;
    }

    // 更新 / 一致
    const changes = compareRows(oldRow, newRow, compareColumns);

    if (Object.keys(changes).length > 0) {
      result.updated.push({
        keyValues: pickFields(newRow, keyFields),
        changes,
        oldRow,
        newRow
      });
    } else {
      result.unchanged.push({
        keyValues: pickFields(newRow, keyFields),
        row: newRow
      });
    }
  }

  return result;
}

/* =========================
 * 使用例
 * ========================= */

const oldRows = [
  {
    company_id: 1,
    user_id: 100,
    target_date: "2026-03-01",
    status: "active",
    score: 80,
    memo: "old"
  },
  {
    company_id: 1,
    user_id: 101,
    target_date: "2026-03-01",
    status: "inactive",
    score: 50,
    memo: "old"
  }
];

const newRows = [
  {
    company_id: 1,
    user_id: 100,
    target_date: "2026-03-01",
    status: "active",
    score: 90,
    memo: "new"
  },
  {
    company_id: 1,
    user_id: 102,
    target_date: "2026-03-01",
    status: "active",
    score: 70,
    memo: "new"
  }
];

const keyFields = ["company_id", "user_id", "target_date"];
const compareColumns = ["status", "score"];

const diffResult = diffTables(oldRows, newRows, keyFields, compareColumns);

console.log(JSON.stringify(diffResult, null, 2));