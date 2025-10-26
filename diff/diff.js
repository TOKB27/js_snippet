/**
 * 1階層オブジェクト同士の差分抽出（追加/削除/変更/変更なし）
 * - 複合キー対応（'id' | ['id','version'] | (item)=>string|number）
 * - 変更点は { prop: { before, after } } の浅い差分のみ
 *
 * @template T extends Record<string, any>
 * @param {T[]} oldArr
 * @param {T[]} newArr
 * @param {string | string[] | ((item:T)=>string|number)} keyBy
 * @param {Object} [opts]
 * @param {string[]} [opts.ignoreKeys=[]] - 変更判定から除外するキー
 * @param {'last'|'first'|'error'} [opts.duplicate='last'] - 同一キー出現時の扱い
 * @returns {{
 *   added: T[],
 *   removed: T[],
 *   changed: Array<{ key: string|number, before: T, after: T, diff: Record<string, {before:any, after:any}> }>,
 *   unchanged: T[]
 * }}
 */
function diffByKeyShallow(oldArr, newArr, keyBy, opts = {}) {
  const { ignoreKeys = [], duplicate = "last" } = opts;
  const getKey = makeKeyFn(keyBy);

  const oldMap = toMap(oldArr, getKey, duplicate, "oldArr");
  const newMap = toMap(newArr, getKey, duplicate, "newArr");

  const added = [];
  const removed = [];
  const changed = [];
  const unchanged = [];

  for (const [k, newItem] of newMap.entries()) {
    if (!oldMap.has(k)) {
      added.push(newItem);
      continue;
    }
    const oldItem = oldMap.get(k);
    const diff = objectDiffShallow(oldItem, newItem, ignoreKeys);
    if (Object.keys(diff).length > 0) {
      changed.push({ key: k, before: oldItem, after: newItem, diff });
    } else {
      unchanged.push(newItem);
    }
  }

  for (const [k, oldItem] of oldMap.entries()) {
    if (!newMap.has(k)) removed.push(oldItem);
  }

  return { added, removed, changed, unchanged };
}

/* ----------------- ヘルパ ----------------- */

/**
 * 'id' → (item)=>item.id
 * ['id','version'] → 連結キー（衝突しにくい区切り文字使用）
 * 関数ならそのまま使用
 */
function makeKeyFn(keyBy) {
  const SEP = "\u0001";
  if (Array.isArray(keyBy)) {
    return (item) =>
      keyBy
        .map((k) => (typeof k === "function" ? k(item) : item?.[k]))
        .join(SEP);
  }
  if (typeof keyBy === "function") return keyBy;
  return (item) => item?.[keyBy];
}

/**
 * 配列 → Map（重複キーの扱いは引数で制御）
 */
function toMap(arr, getKey, duplicate, label) {
  const m = new Map();
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const k = getKey(item);
    if (k === undefined) continue; // 必要なら throw に
    if (!m.has(k)) {
      m.set(k, item);
    } else {
      if (duplicate === "error") {
        throw new Error(
          `Duplicate key "${String(k)}" detected in ${label} at index ${i}.`
        );
      }
      if (duplicate === "last") m.set(k, item); // 後勝ち
      // 'first' は先勝ちで何もしない
    }
  }
  return m;
}

/**
 * 浅い差分（1階層のみ）
 * @returns {Record<string, {before:any, after:any}>}
 */
function objectDiffShallow(a, b, ignoreKeys = []) {
  const diff = {};
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const k of keys) {
    if (ignoreKeys.includes(k)) continue;
    const va = a?.[k];
    const vb = b?.[k];
    // 1階層のみなので === で十分（配列/オブジェクトが来る設計なら必要に応じて比較を拡張）
    if (va !== vb) diff[k] = { before: va, after: vb };
  }
  return diff;
}

/* ----------------- 使用例 ----------------- */

// 単一キー
/*
const oldData = [
  { id: 1, name: "Alice", age: 24 },
  { id: 2, name: "Bob",   age: 29 },
  { id: 3, name: "Cara",  age: 31 },
];
const newData = [
  { id: 1, name: "Alice", age: 25 }, // age変更
  { id: 3, name: "Cara",  age: 31 }, // 変更なし
  { id: 4, name: "Dan",   age: 22 }, // 追加
];
const r1 = diffByKeyShallow(oldData, newData, 'id', { ignoreKeys: [] });
console.log(r1);
*/

// 複合キー（id + version）
/*
const oldData2 = [
  { id: 1, version: 1, name: "Alice" },
  { id: 1, version: 2, name: "Alice v2" },
  { id: 2, version: 1, name: "Bob" },
];
const newData2 = [
  { id: 1, version: 2, name: "Alice updated" }, // 変更
  { id: 2, version: 1, name: "Bob" }, // 変更なし
  { id: 3, version: 1, name: "Cara" }, // 追加
];
const r2 = diffByKeyShallow(oldData2, newData2, ["id", "version"], {
  ignoreKeys: [], // 例: ['updatedAt']
  duplicate: "last", // 'first' | 'last' | 'error'
});
console.log(r2);
*/
