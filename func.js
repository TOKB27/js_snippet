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

// sort()
// 配列の要素を並び替え
const numbersC = [4, 2, 3, 1];
numbersC.sort();
console.log(numbersC); // [1, 2, 3, 4]

// concat()
// 2つ以上の配列を結合
const array1 = [1, 2];
const array2 = [3, 4];
const combined = array1.concat(array2);
console.log(combined); // [1, 2, 3, 4]

// find();
// 配列内の条件を満たす最初の要素を返す
const numbers_find = [1, 2, 3, 4];
const found = numbers_find.find((num) => num > 2);
console.log(found); // 3

// every()
// 配列のすべての要素が条件を満たすかどうかをチェック
const numbers_every = [2, 4, 6];
const allEven = numbers_every.every((num) => num % 2 === 0);
console.log(allEven); // true

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
