# Ders 21 — Union Types ve Control-Flow Narrowing

## 1. Bir değer birden fazla türden biri olabilir

Bazı fonksiyonlar hem string hem number input kabul eder. Aynı method bütün türler için güvenli olmayabilir. TypeScript bu belirsizliği union olarak ifade eder.

## 2. Union ve narrowing

```ts
function normalize(value: string | number): string | number {
  if (typeof value === "string") {
    return value.trim();
  }
  return value * 10;
}
console.log(normalize("  Hi ")); // Hi
console.log(normalize(3));       // 30
```

`string | number` iki olası type anlamına gelir. `typeof value==="string"` runtime kontrolüdür; TypeScript bu condition'ın true branch'inde value'yu string olarak daraltır. İlk branch return ettiği için sonraki yolda number kalır.

## 3. Çalışma izi

| Input | typeof | Seçilen branch | Sonuç |
| --- | --- | --- | --- |
| `" Hi "` | string | trim | `"Hi"` |
| `3` | number | multiply | 30 |
| `0` | number | multiply | 0 |

Bu sonuç type anotasyonunun dönüşüm yapmasıyla değil, **JavaScript condition ve expression** yürütmesiyle oluşur.

## 4. Guard yoksa ne olur?

```ts
// Bilerek yanlış:
// function broken(v: string | number) {
//   return v.trim(); // number'da trim yok
// }
```

String'e ait method'u union'ın her olasılığında çağırmak güvenli değildir. TypeScript bunu bildirebilir, fakat `any` ile gizlenmiş runtime number yine hata oluşturabilir.

## 5. Discriminated union

```ts
type Result =
  | { kind:"ok"; value:number }
  | { kind:"error"; message:string };

function explain(result: Result): string {
  if (result.kind === "ok") {
    return "Value: " + result.value;
  }
  return "Error: " + result.message;
}
console.log(explain({ kind:"ok", value:80 })); // Value: 80
console.log(explain({ kind:"error", message:"invalid" })); // Error: invalid
```

Ortak `kind` literal property, branch'i ayırır. `"ok"` branch'inde value; `"error"` branch'inde message vardır. Hatalı branch property erişimi type-check hatası yaratabilir.

## 6. Type assertion kontrol değildir

```ts
const value: unknown = 42;
const assumed = value as string;
// assumed.toUpperCase(); // runtime'da TypeError oluşturabilir
console.log(typeof assumed); // number
```

Assertion, type checker'a iddia sunar; runtime value'yu string yapmaz. Guard gerçek runtime türünü ölçer.

## 7. Null ve object narrowing

```ts
function isObject(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}
console.log(isObject(null)); // false
console.log(isObject({}));   // true
```

`typeof null` özel davranışı nedeniyle null ayrıca elenir. Bu kontrol henüz object property shape'ini doğrulamaz.

## 8. Debugging ve sınırlar

**Belirti:** `trim is not a function`. Gerçek typeof değerini incele; string branch'i olmadan method çağrılmış mı?

**Belirti:** Discriminated union'da message okunamıyor. Önce `kind` kontrolü doğru branch'i seçiyor mu bak.

**Boundary:** Return type `string | number` olan fonksiyonu çağıran, gerçek sonuç üzerinde type-specific işlemden önce daraltma yapmak zorunda kalabilir.

## 9. Mülakat / pekiştirme

**Question:** What is type narrowing?

> Runtime checks such as typeof and discriminant comparisons allow TypeScript to refine union types in control-flow branches.

**Kontrol:** `normalize(0)` sonucu? `normalize(" hi ")` sonucu? Assertion gerçek dönüşüm mü? `kind:"ok"` branch'inde message bulunur mu?

<details><summary>Cevaplar</summary>

0; hi; hayır; hayır.

</details>

## 10. İkinci union çalışması: başarı ve hata yolları

```ts
type CheckResult =
  | { success:true; amount:number }
  | { success:false; error:"INVALID_AMOUNT" };

function describe(result: CheckResult): string {
  if (result.success) {
    return "Amount: " + result.amount;
  }
  return result.error;
}
console.log(describe({success:true,amount:0})); // Amount: 0
console.log(describe({success:false,error:"INVALID_AMOUNT"})); // INVALID_AMOUNT
```

**Önemli:** `amount=0`, success branch'i açısından geçerli number olabilir; truthiness ile success testi yapmak yerine discriminant alanının kendisini kullanırız.

### Property access tablosu

| Branch | Uygun alan | Diğer alan |
| --- | --- | --- |
| `success:true` | amount | error zorunlu değil |
| `success:false` | error | amount zorunlu değil |

Caller doğrudan `result.amount` okumaya çalışırsa failure olasılığında alan yoktur. Narrowing olmadan güvenli erişim varsayma.

### String/number array üzerinde uygulama

```ts
function describeInput(value: string | number): string {
  if (typeof value === "string") {
    return "Text length: " + value.length;
  }
  return "Number: " + value;
}
console.log(describeInput("ABC")); // Text length: 3
console.log(describeInput(0));     // Number: 0
```

Bu iki branch'te kullanılan property ve operation'lar farklıdır. Narrowing, kodun tür bilinçli olmasına yardım eder.

### Yeni görev

`boolean | string` union'ı için “boolean ise ACTIVE/INACTIVE, string ise aynen dön” şartını kodla. Hangi `typeof` kontrolleri gerekir?

<details><summary>Kontrol</summary>

Boolean branch'inde true/false kararı, string branch'inde return value. Cast ile türü dönüştürmeye gerek yok.

</details>
