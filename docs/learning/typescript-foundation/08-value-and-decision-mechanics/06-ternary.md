# Ders 6 — Ternary Operator: Koşula Göre Expression Seçme

[Foundation öğrenme rotası](../README.md) · [Bölüm 08](./README.md)

**Önkoşul:** [Truthy/falsy](./02-truthy-falsy.md), [Logical operators](./03-logical-operators.md), [Short-circuit](./04-short-circuit.md). **Sonraki:** [Switch](./07-switch-case.md).

## Neden ve tanım
`condition ? valueA : valueB` bir condition'a göre iki expression'dan **yalnız birini** değerlendirir ve onun sonucunu üretir. `if/else` bir statement, ternary ise bir expression'dır.

```ts
const score = 60;
const result = score >= 60 ? "Passed" : "Failed";
console.log(result); // Passed
```

Akış: `score >= 60` → true → `"Passed"`; diğer expression değerlendirilmez. Score 59 ise `"Failed"`; exact boundary 60'tır.

## Koşulun falsy olması
```ts
const label = 0 ? "nonzero" : "zero";
console.log(label); // zero
```
Truthy/falsy kontrolü iş kuralı doğrulaması değildir. Özellikle `0` geçerli bir sayı olabilir.

## Yan etkilerin değerlendirme sırası
```ts
function yes() { console.log("yes"); return 1; }
function no() { console.log("no"); return 2; }
const value = true ? yes() : no(); // yalnız yes loglanır; value=1
```
Ternary her iki dalı da çalıştırmaz. Nested ternary okunabilirliği bozabilir; karmaşık kararlar için `if/else` veya ayrık fonksiyonlar daha iyi olabilir.

## TypeScript ilişkisi ve debugging
Dal sonuçları farklı tiplerdeyse inferred result bir union olabilir. Hatalı davranış gördüğünde önce condition'ın gerçek değerini, sonra hangi dalın seçildiğini, sonra dal expression'ının değerini takip et. Gereksiz iç içe ternary ile hata saklama.

**Mülakat:** *When do you prefer a ternary over if/else?* Kısa ve açık iki alternatif değer seçimi için ternary; çok işlemli veya karmaşık branch akışı için if/else.

**Pekiştirme:** Score 59/60/61 sonucunu tahmin et. `const x = false ? 1 : 2` çıktısı nedir? `true ? yes() : no()` örneğinde neden tek çağrı gerçekleşir?

**Kanıt notu:** Bu belge öğretim materyalidir, H0 yeterlilik kanıtı değildir. Tarihsel uzun anlatım [eski I4 dersinde](../../javascript/01-value-and-decision-mechanics/06-ternary.md) korunmuştur.
