# Ders 6 — Ternary Operator: İki Expression Arasında Seçim

> [Foundation](../README.md) → [08 — Value & Decision Mechanics](./README.md) → bu ders

**Önkoşul:** [Truthy/falsy](./02-truthy-falsy.md), [logical operators](./03-logical-operators.md), [short-circuit](./04-short-circuit.md). **Sonraki:** [Switch](./07-switch-case.md).

## 1. Neden ihtiyaç duyuyoruz?

Bir condition'a bağlı **tek değer** üretmek için her zaman çok satırlı `if/else` yazmak gerekmez. Ternary'nin amacı gereksiz kısalık değil, iki açık seçenekten hangisinin değerlendirildiğini görünür kılmaktır.

```ts
const score = 60;
let label: string;
if (score >= 60) {
  label = "Passed";
} else {
  label = "Failed";
}
console.log(label); // Passed
```

Aynı küçük seçim expression olarak da yapılabilir:

```ts
const score = 60;
const label = score >= 60 ? "Passed" : "Failed";
console.log(label); // Passed
```

## 2. Tanım ve çalışma mekanizması

```text
condition ? expressionWhenTrue : expressionWhenFalse
```

Condition önce değerlendirilir. Truthy ise soldaki, falsy ise sağdaki expression seçilir. **Yalnızca seçilen dal değerlendirilir.** Ternary bir expression'dır; `if/else` ise bir statement'tır.

```ts
function classify(score: number): string {
  return score >= 60 ? "Passed" : "Failed";
}
console.log(classify(59)); // Failed
console.log(classify(60)); // Passed
console.log(classify(61)); // Passed
```

| Girdi | `score >= 60` | Seçilen branch | Sonuç |
| ---: | --- | --- | --- |
| 59 | false | false expression | Failed |
| 60 | true | true expression | Passed |
| 61 | true | true expression | Passed |

Tam sınırda `>=` yerine yanlışlıkla `>` yazmak gerçek bug üretir. Boundary testi bu farkı yakalamalıdır.

## 3. Yalnızca bir expression çalışır

```ts
function yes(): number {
  console.log("YES called");
  return 1;
}
function no(): number {
  console.log("NO called");
  return 2;
}
const result = true ? yes() : no();
// YES called
console.log(result); // 1
```

Yürütme: condition true → `yes()` çağrılır → return 1 → `result=1`; `no()` çağrılmaz. Bu, [short-circuit](./04-short-circuit.md) davranışını anlamayı gerektirir. Yan etki yapan fonksiyonları iki dalda kullanmak bazen okunabilirliği azaltır.

## 4. Truthiness ile iş kuralını karıştırma

```ts
const retries = 0;
console.log(retries ? "Retry" : "No retry"); // No retry
```

Bu kod 0 değerini boolean bağlamda falsy yorumlar; ama 0'ın iş kuralınca **geçersiz** olduğunu söylemez. Özellikle fallback seçerken `||` ile `??` farklıdır:

```ts
type Options = { retries?: number };
function message(options: Options): string {
  const retries = options.retries ?? 3;
  return retries === 0 ? "No retry" : `Retries: ${retries}`;
}
console.log(message({ retries: 0 })); // No retry
console.log(message({})); // Retries: 3
```

`??` yalnız `null` ve `undefined` için alternatif seçer. Ternary burada ayrıca sıfır durumunu etiketler. `options.retries || 3` kullanılsaydı geçerli 0 değeri yanlışlıkla ezilirdi.

## 5. TypeScript ile ilişkisi

İki dalın tipleri, expression'ın tipini etkiler. Örneğin:

```ts
function state(active: boolean): string | number {
  return active ? "ON" : 0;
}
console.log(state(true)); // "ON"
console.log(state(false)); // 0
```

TypeScript her iki branch'in return type'a uygunluğunu denetler. Ancak condition'ın iş açısından doğru kurulup kurulmadığını belirleyemez. Ternary kendiliğinden runtime validation da gerçekleştirmez.

## 6. Yaygın hatalar ve sınır davranışları

- **Yanlış threshold:** `> 60` yerine `>= 60` gereksinimi varsa 60 yanlış branch'e gider.
- **Falsy değeri eksik veri sanmak:** `0`, `false`, `""` sık sık geçerli değerlerdir; fallback amacı doğru seçilmelidir.
- **İç içe ternary:** Üç veya daha fazla karar bir araya gelince expression zor okunur. Çoğu zaman açık `if/else if/else` daha iyi tasarımdır.
- **Operatörleri karıştırmak:** `condition ? x : y` ile `value ?? defaultValue` ve `obj?.property` farklı işler yapar.
- **İki dal da çağrılır sanmak:** Runtime'da yalnız seçilen expression yürür.

## 7. Debugging: Yanlış branch nasıl araştırılır?

1. Gereksinimden beklenen sonucu çıkart (örneğin 60 dahil).
2. Gerçek input ve türünü debugger/log ile doğrula.
3. Condition'ın true/false sonucunu ayrı gözle.
4. Seçilen branch'i takip et, diğer branch'in çalışmadığını kontrol et.
5. Operator hatası hipotezini tek değişiklikle sınayıp 59/60/61 sınır testlerini tekrarla.

## 8. Gerçekçi kullanım

```ts
type TestResult = { name: string; passed: boolean };
function summary(test: TestResult): string {
  const label = test.passed ? "PASS" : "FAIL";
  return `${label}: ${test.name}`;
}
console.log(summary({ name: "Login", passed: false })); // FAIL: Login
```

Bu kod zaten belirlenmiş `passed` değerini okunabilir metne dönüştürür. Sonucun gerçekten doğru olduğuna ilişkin test kanıtı üretmez.

## 9. Mülakat hazırlığı

**Question: When would you use a ternary rather than if/else?**

> A ternary is an expression that picks one of two values. It evaluates only the selected branch. I use it for short, readable value selections and prefer explicit if/else for complex logic.

**Türkçe:** Ternary iki değerden birini seçen expression'dır; koşuldan sonra yalnız seçilen taraf yürütülür. Karmaşık akışta okunabilirlik için açık if/else tercih edilebilir.

## 10. Pekiştirme

1. `false ? 10 : 20` ne döndürür?
2. `score=60` iken `score > 60 ? "yes" : "no"` çıktısı nedir?
3. `0 ? "on" : "off"` sonucu neden böyledir?
4. `true ? yes() : no()` hangi fonksiyonu çağırır?
5. `retries=0` iken `??` ile `||` fallback sonuçları neden farklı olabilir?
6. Nested ternary'yi `if/else` ile değiştirmenin ne zaman daha okunaklı olacağını açıkla.

**Öğretim/evidence sınırı:** Bu kalıcı ders H0 veya I4 uygulama yeterliliği kanıtı değildir. Orijinal uzun anlatım da [tarihsel kaynağında](../../javascript/01-value-and-decision-mechanics/06-ternary.md) korunur.
