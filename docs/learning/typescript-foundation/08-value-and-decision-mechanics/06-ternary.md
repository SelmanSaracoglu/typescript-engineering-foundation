# Ders 6 — Ternary Operator: `condition ? valueA : valueB`

## 1. Neden ternary kullanırız?

Bir program bazen tek bir **değer** üretmek için iki durumdan birini seçer: Hesap aktifse `"Active"`, değilse `"Inactive"`; yaş 18 ve üstüyse `"Adult"`, değilse `"Minor"`.

Bu karar `if/else` ile de verilir:

```ts
function ageLabel(age: number): string {
  if (age >= 18) {
    return "Adult";
  } else {
    return "Minor";
  }
}
```

**Ternary operator (koşullu operatör)** aynı iki seçenekten bir **expression sonucu** elde etmeyi sağlar:

```ts
function ageLabel(age: number): string {
  return age >= 18 ? "Adult" : "Minor";
}
console.log(ageLabel(18)); // "Adult"
console.log(ageLabel(17)); // "Minor"
```

**Temel fark:** `if/else` bir kontrol akışı statement'ıdır; ternary bir **değer üreten expression**'dır. Ternary daha kısa olduğu için değil, basit iki alternatifli sonuçları açık ifade ettiği için tercih edilir.

## 2. Sözdizimi ve değerlendirme sırası

```text
condition ? expressionWhenTruthy : expressionWhenFalsy
```

1. JavaScript önce `condition` ifadesini değerlendirir.
2. Sonuç truthy ise `?` sonrasındaki ifade değerlendirilir.
3. Sonuç falsy ise `:` sonrasındaki ifade değerlendirilir.
4. **Seçilmeyen ifade çalıştırılmaz.**
5. Seçilen ifade ternary'nin sonucudur.

```ts
const score = 70;
const result = score >= 60 ? "Passed" : "Failed";
console.log(result); // "Passed"
```

Ternary bir **ifade** olduğu için değişkene atanabilir, başka bir fonksiyona argüman olarak verilebilir veya doğrudan `return` edilebilir.

## 3. Ternary ile `if/else` ne zaman tercih edilir?

Ternary:

```ts
function displayStatus(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}
```

`if/else`:

```ts
function evaluateStatus(isActive: boolean): string {
  if (!isActive) {
    console.log("Account is inactive");
    return "Inactive";
  }
  console.log("Account is active");
  return "Active";
}
```

İkincisinde iki branch içinde ek eylemler ve farklı iş adımları var. Böyle durumlarda `if/else` daha okunaklı olabilir. **Ternary tüm karar yapılarını kısaltmak için kullanılmaz.**

## 4. Lazy evaluation: yalnız seçilen branch çalışır

```ts
function approved(): string {
  console.log("Approval branch");
  return "Approved";
}
function denied(): string {
  console.log("Denial branch");
  return "Denied";
}

const hasPermission = false;
const message = hasPermission ? approved() : denied();
console.log(message);
// Denial branch
// Denied
```

`approved()` çağrılmadı. Bu davranış Short-Circuit Evaluation ile yakından ilişkilidir: Gerekmeyen branch değerlendirilmez.

Bu yüzden side effect içeren ağır kodları ternary içinde gizlemek yerine ayrı bloklarda yazmak daha anlaşılır olabilir.

## 5. Koşul boolean olmak zorunda mı?

Hayır. Ternary koşulunda truthy/falsy değerlendirme yapılır:

```ts
const input = "";
const text = input ? "Value exists" : "No value";
console.log(text); // "No value"
```

Ancak iş kuralı `0` veya `""` değerini geçerli sayıyorsa `condition` olarak doğrudan değeri kullanmak bug oluşturabilir.

```ts
function stockLabel(stock: number | undefined): string {
  return stock !== undefined ? `Stock: ${stock}` : "Stock unknown";
}
console.log(stockLabel(0)); // "Stock: 0"
```

Burada koşulumuz truthiness değil, **değerin `undefined` olmaması**dır. Bu ayrımı önceki derslerde öğrenmiştik.

## 6. Farklı branch tipleri ve TypeScript

Ternary'nin iki kolu farklı tipler üretebilir:

```ts
function valueByStatus(isReady: boolean): string | number {
  return isReady ? "Ready" : 0;
}
```

Bu durumda sonuç olası `string | number` türündedir. Tüketen kodun bu olasılıkları hesaba katması gerekir.

```ts
const status: boolean = false;
const value = status ? "Ready" : 0;
console.log(value); // 0
```

Fonksiyon dönüş tipi yalnız `string` olarak tanımlanmışsa number dönen bir kol typecheck hatasına yol açabilir. Tip sisteminin uyarısı, ürün davranışının doğru olduğunu kanıtlamaz; fakat iki branch'in farklı tipte olduğunu görünür kılar.

## 7. İç içe ternary (nested ternary) neden zor olabilir?

```ts
function label(score: number): string {
  return score >= 90
    ? "Excellent"
    : score >= 60
      ? "Passed"
      : "Failed";
}
```

Bu geçerli olabilir ancak büyüdükçe okunması ve debug edilmesi güçleşir. Üç farklı karar noktasını açık `if` bloklarıyla da gösterebiliriz:

```ts
function label(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 60) return "Passed";
  return "Failed";
}
```

Birinci koşul sağlandığında fonksiyon bittiği için ikinci koşulun ayrıca `score < 90` demesine gerek yoktur.

**Seçim kuralı:** İki açık sonuç ve tek basit koşul → ternary iyi aday. Çok branch, karmaşık yan etkiler veya hata yönetimi → açık `if/else` daha iyi.

## 8. Test tasarımı ve hata ayıklama

```ts
function examResult(score: number): string {
  return score >= 60 ? "Passed" : "Failed";
}
```

Sadece `90 → Passed` test etmek yeterli değildir. `>= 60` operatörünü yanlışlıkla `> 60` yazarsan bu test bug'ı bulamaz.

| Girdi | Beklenen | Neden? |
|---|---|---|
| `59` | `"Failed"` | Sınırın altı |
| `60` | `"Passed"` | Exact boundary |
| `61` | `"Passed"` | Sınırın üstü |

**Debugging sırası:** Condition değeri → truthiness/boolean sonucu → seçilen branch → branch değeri → beklenen iş kuralı.

## 9. Mülakat hazırlığı

**Question: What is the ternary operator in JavaScript?**

> The ternary operator is a conditional expression with the syntax `condition ? a : b`. It evaluates the condition and returns the result of only one branch. It is useful for simple two-way value selection, while `if/else` is often clearer for complex logic.

**Türkçe:** Koşulun durumuna göre iki ifadeden birinin sonucunu üreten operatördür. Basit değer seçiminde okunaklıdır, karmaşık kararlarda `if/else` daha uygundur.

**Question: Does a ternary evaluate both branches?**

> No. Only the selected branch is evaluated, so functions in the other branch are not called.

## 10. Pekiştirme

1. `false ? "A" : "B"` sonucu nedir?
2. `isBlocked` true ise `"Denied"`, değilse `"Granted"` döndüren ifade yaz.
3. `const label = stock ? "Known" : "Missing"` neden `stock = 0` için hatalı olabilir?
4. Karmaşık üç seviyeli seçimde neden `if/else` daha okunaklı olabilir?

<details><summary>Kontrol cevapları</summary>

1. `"B"`.
2. `isBlocked ? "Denied" : "Granted"`.
3. `0` falsy fakat geçerli stok değeridir.
4. Branch'lerin mantığı ve debugging adımları açık görünür.
</details>
