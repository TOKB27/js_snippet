// 変数宣言
var x = 10;
let y = 20;
const z = 30;

// 関数宣言
function greet(name) {
  return `Hello, ${name}`;
}
console.log(greet("Alice"));

// アロー関数
const add = (a, b) => a + b;
console.log(add(5, 3));

// テンプレートリテラル
let name = "Bob";
let greeting = `Hello, ${name}!`;
console.log(greeting);

// デストラクチャリング(オブジェクトや配列から値を抽出する方法)
let person = { name2: "Charlie", age: 25 };
let { name2, age } = person;
console.log(name2, age);

let numbers = [1, 2, 3];
let [first, second, third] = numbers;
console.log(first, second, third);

// スプレッド演算子
let arr1 = [1, 2, 3];
let arr2 = [...arr1, 4, 5];
console.log(arr2);

let obj1 = { a: 1, b: 2 };
let obj2 = { ...obj1, c: 3 };
console.log(obj2);

// 三項演算子
const flag = true;
const text = flag ? "flagはtrueです" : "flagはfalseです";
console.log(text);

// 複数プロセスの統合
function processAll(list) {
  list.forEach(([a, b]) => {
    console.log(a, b);
  });
}
processAll([
  [1, 2],
  [3, 4],
  [5, 6],
]);