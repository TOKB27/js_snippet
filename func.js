// map()
// 配列の各要素に対して関数を適用し、新しい配列を返す
const numbersA = [1, 2, 3, 4];
const doubled = numbersA.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8]

// filter()
// 配列の各要素に対して条件をチェックし、その条件を満たす要素だけからなる新しい配列を返す
const numbersB = [1, 2, 3, 4];
const evens = numbersB.filter((num) => num % 2 === 0);
console.log(evens); // [2, 4]

// split()
// 文字列を指定した区切り文字で分割し、配列を返す
const strA = "Hello World";
const words = strA.split(" ");
console.log(words); // ["Hello", "World"]

// replace()
// 文字列内の特定の部分を置き換え
const strB = "Hello World";
const newStr = strB.replace("World", "JavaScript");
console.log(newStr); // "Hello JavaScript"

// Object.values()
// オブジェクトのすべての値を配列として返す
const obj = { name: "Taro", age: 30 };
const values = Object.values(obj);
console.log(values); // ["Taro", 30]