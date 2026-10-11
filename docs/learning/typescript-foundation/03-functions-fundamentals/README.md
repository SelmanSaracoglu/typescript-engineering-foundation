# 03 — Functions Fundamentals

**Önkoşul:** [02](../02-values-variables-basic-decisions/README.md). **Sonraki:** [04 — iteration](../04-control-flow-iteration/README.md).

## Ayrıntılı dersler

1. [Function, Parameter ve Argument](./01-function-parameter-argument.md)
2. [Local Variable, Return Value ve Execution Flow](./02-local-variables-return-flow.md)
3. [Local Scope, Block Scope ve Shadowing](./03-scope-shadowing-and-blocks.md)

## Neden?
Bir function kodu yeniden kullanılabilir bir davranışa ayırır. Fonksiyonun input→processing→output akışını okumadan callback veya closure öğrenmek sağlam temel oluşturmaz.

```ts
function addTax(price: number): number {
  const result = price + 20;
  return result;
}
const finalPrice = addTax(100);
console.log(finalPrice); // 120
```

| Kavram | Örnekteki karşılığı |
| --- | --- |
| Function declaration | `function addTax(...)` |
| Parameter | `price` |
| Argument | `100` |
| Local variable | `result` |
| Return value | `120` |
| Caller | `addTax(100)` çağrısını kullanan kod |

Akış: `100` argument → `price` parameter → `result=120` → `return 120` → `finalPrice`. `return` yalnız değer üretmez, o çağrının yürütmesini sonlandırır.

## Scope
```ts
const score = 50;
if (true) {
  const score = 80;
  console.log(score); // 80
}
console.log(score); // 50
```
`const` ve `let` block scope'ludur. Function içinde tanımlanan `result` normalde dışarıdan erişilemez.

## Sınır ve hata
```ts
function label(n: number): string {
  if (n < 0) return "negative";
  return "nonnegative";
}
```
`n=-1` ilk return ile çıkar; `n=0` ikinci return'a ulaşır. `return` loop'un içinde yanlış konursa bütün fonksiyonu erken bitirir: [04](../04-control-flow-iteration/README.md).

**Mülakat:** *What is the difference between parameters and arguments?* Parameter, fonksiyon tanımındaki isim; argument, çağrıda verilen gerçek değerdir.

**Pekiştirme:** `addTax(0)` ne döndürür? `result` neden dışarıdan erişilemez? Function çağrılmadığında body çalışır mı?

**Henüz bu bölümde yok:** callback, higher-order function ve closure; bunlar sonraki öğrenme rotasına aittir. Kaynaklar: [I1](../../../I1-execution-model.md), [I2](../../../I2-control-flow-functions-data-modeling.md).
