# Ders 2 — Truthy ve Falsy: JavaScript koşulları değerleri nasıl yorumlar?

> **Öğrenme yolu:** [Dizin](../README.md) → [Bölüm 1](./README.md)  
> **Önkoşul:** [Ders 1 — Equality](./01-equality.md), primitive tipler ve `if`.

## 1. Neden öğreniyoruz?

`if`, `while`, ternary ve mantıksal operatörler yalnızca `true`/`false` literal'leriyle çalışmaz. JavaScript **herhangi bir değeri boolean bağlamda** yorumlayabilir. Bu yorumun sonucuna *truthy* veya *falsy* deriz.

Bu bilgi özellikle şu sorunları önler: `stock = 0` olduğu hâlde "stok bilgisi yok" yazılması, `false` ayarının "tanımsız" sayılması veya boş array'in yanlışlıkla boş olmayan array gibi değerlendirilmesi.

**Tanım:** *Truthy*, boolean bağlamda `true` gibi; *falsy*, boolean bağlamda `false` gibi değerlendirilen bir değerdir. Bu, değerin gerçek tipinin boolean'a dönüşüp değişkende saklandığı anlamına gelmez.

## 2. Değer nasıl değerlendirilir?

```ts
const username = "Alex";
if (username) {
  console.log("Username has a truthy value");
}
console.log(typeof username); // "string"
```

Adım adım: `if`, `username` değerini boolean bağlamda değerlendirir. Boş olmayan string truthy'dir, blok yürür. Son satırdaki değer hâlâ `string` türündedir.

Dönüşümü açık görmek için:

```ts
console.log(Boolean("Alex")); // true
console.log(Boolean(""));     // false
console.log(Boolean(0));      // false
console.log(Boolean(-1));     // true
```

`Boolean(value)` yeni bir boolean sonuç üretir; orijinal `value` değişkenini değiştirmez. `!!value` da aynı boolean sonucu elde etmek için kullanılabilir, ancak yeni öğrenirken `Boolean()` daha açık okunur.

## 3. Falsy değerlerin tamamı

JavaScript'te yaygın falsy primitive değerler:

| Değer | Açıklama |
|---|---|
| `false` | Boolean false |
| `0` ve `-0` | Sıfır değerleri |
| `0n` | BigInt sıfır |
| `""`, `''`, boş template literal | Boş string |
| `null` | Bilinçli boş değer |
| `undefined` | Değerin bulunmaması/tanımlanmaması |
| `NaN` | Geçersiz sayısal işlem sonucu |

Tarayıcılarda tarihsel bir istisna olarak `document.all` da falsy davranır; normal JavaScript/TypeScript uygulama modellerimizde kullanılmaz. Yukarıdaki tablo günlük mühendislik için temel listedir.

**Bunların dışındaki değerler genellikle truthy'dir.** Örneğin `"0"`, `"false"`, `" "`, `-1`, `[]`, `{}` ve `Infinity` truthy'dir.

```ts
console.log(Boolean("false")); // true
console.log(Boolean("0"));     // true
console.log(Boolean(" "));     // true
console.log(Boolean([]));      // true
console.log(Boolean({}));      // true
```

Neden `"false"` true? Çünkü bu bir **boş olmayan string**; boolean `false` değil. Neden `[]` truthy? Çünkü boş da olsa gerçek bir object'tir.

## 4. Empty array / empty object tuzağı

```ts
const alerts: string[] = [];

if (alerts) {
  console.log("Array exists"); // Çalışır
}
if (alerts.length > 0) {
  console.log("There are alerts"); // Çalışmaz
}
```

İlk koşul "array referansı mevcut mu?" sorusunu truthiness üzerinden değerlendirir, eleman sayısını kontrol etmez. İkinci koşul gerçekten "en az bir alert var mı?" sorusuna cevap verir.

Object için de `{}` truthy'dir. Bir object'in beklenen property'lere sahip olduğunu truthiness ile kanıtlayamazsın; bu işlem runtime validation gerektirir.

## 5. Truthiness, geçerlilik kontrolü değildir

Bir stok sistemi için `stock = 0` geçerli olabilir:

```ts
function stockMessage(stock: number | undefined): string {
  if (stock) {
    return `Stock: ${stock}`;
  }
  return "Stock information missing";
}
console.log(stockMessage(0)); // "Stock information missing" — HATALI iş davranışı
```

İş kuralını inceleyelim: *Bilgi verilmemişse hata, stok sıfırsa sıfır göster.* O zaman `0` ile `undefined` ayrılmalıdır:

```ts
function stockMessage(stock: number | undefined): string {
  if (stock !== undefined) {
    return `Stock: ${stock}`;
  }
  return "Stock information missing";
}
console.log(stockMessage(0));         // "Stock: 0"
console.log(stockMessage(undefined)); // "Stock information missing"
```

Aynı hata `false` veya `""` geçerli kullanıcı tercihi olduğunda da görülür. `if (setting)` ancak **iş kuralı gerçekten truthiness istemişse** uygundur.

## 6. Boşluk ve string validasyonu

```ts
const rawUsername = "   ";
console.log(Boolean(rawUsername));        // true
console.log(rawUsername.trim().length);   // 0
```

Boşluk karakterlerini içeren string truthy olsa bile iş kuralı "yalnızca boşluklardan oluşan kullanıcı adı geçersiz" diyorsa `.trim()` sonrasında uzunluk kontrolü gerekir:

```ts
function hasNonBlankUsername(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
console.log(hasNonBlankUsername(" Alex ")); // true
console.log(hasNonBlankUsername("   "));    // false
console.log(hasNonBlankUsername(null));     // false
```

Burada `&&` gördük: ilk kontrol false olduğunda `.trim()` değerlendirilmez. Bu, bir sonraki derslerde ele alacağımız *short-circuit* davranışıdır.

## 7. TypeScript kontrol akışı ile bağlantı

TypeScript truthy kontrollerini bazı union tiplerini daraltmak için de kullanabilir:

```ts
function displayName(name: string | null): string {
  if (name) {
    return name;
  }
  return "Guest";
}
```

Ancak `if (name)` null yanında **boş string'i de** dışlar. TypeScript daraltma yapabilir diye iş kuralının da doğru olduğu sonucuna varamayız.

Örneğin boş string'in geçerli bir değer olduğu modelde `name !== null` daha uygun olabilir.

## 8. Debugging ve test yaklaşımı

Bir truthy/falsy bug'ını ararken sırasıyla sor:

1. Değerin `typeof` sonucu nedir?
2. `0`, `false`, `""`, `null`, `undefined` gibi özel bir durum mu?
3. İş kuralı **mevcut mu**, **boş mu**, **pozitif mi**, **geçerli mi** sorularından hangisini soruyor?
4. Testlerde `0`, boş string, boş array ve yalnız boşluk gibi sınırlar var mı?

| Girdi | `Boolean(input)` | `input` boş/eksik mi? |
|---|---|---|
| `0` | `false` | İş kuralına göre değişir |
| `""` | `false` | Çoğunlukla boş string |
| `" "` | `true` | Trim sonrası boş olabilir |
| `[]` | `true` | Array uzunluğu 0 |
| `null` | `false` | Nullish |

Bu tablo, **truthiness ile iş gereksiniminin aynı şey olmadığını** göstermek için vardır.

## 9. Mülakat hazırlığı

**Question: What is the difference between truthy and falsy values in JavaScript?**

> JavaScript evaluates values as true or false in boolean contexts. Values such as `false`, zero, an empty string, `null`, `undefined`, and `NaN` are falsy. Empty arrays and objects are truthy. Truthiness does not prove that data is valid or non-empty.

**Türkçe:** JavaScript koşul içinde değerleri boolean gibi değerlendirir. Bazı değerler falsy'dir, boş array/object ise truthy'dir. Bu kontrol verinin doğrulandığı anlamına gelmez.

**Question: Why is `if (stock)` sometimes incorrect?**

> Because zero is falsy even if zero is a valid stock quantity. I would check specifically whether the value is missing, for example with `stock !== undefined`.

## 10. Pekiştirme

1. `Boolean("false")`, `Boolean([])`, `Boolean("")`, `Boolean(0n)` sonuçlarını belirle.
2. `const items: string[] = []; if (items) ...` çalışır mı? Neden?
3. `false` geçerli ayar olsun. `if (notificationsEnabled)` neden "ayar yapılmış mı?" sorusuna yanlış cevap verir?
4. Boş olmayan, yalnız boşluk içermeyen string kontrolünü yaz.

<details><summary>Kontrol cevapları</summary>

1. `true`, `true`, `false`, `false`.
2. Evet; boş array truthy object'tir.
3. `false` değeri var olduğu hâlde koşul falsy'dir; eksiklik kontrolü farklı yapılmalıdır.
4. `typeof x === "string" && x.trim().length > 0`.
</details>

## 11. Öğrenme bağlantısı

Truthy/falsy bilgisi, [Ders 3 — Logical Operators](./03-logical-operators.md) ve [Ders 4 — Short-Circuit](./04-short-circuit.md) için önkoşuldur. Daha sonra `||` ile `??` arasındaki farkı anlamamızı sağlayacak.

> **Kanıt:** Açıklamalı örnekler, bağımsız kod geliştirme veya repo test kanıtı değildir.


---

> **Kalıcı müfredat notu:** Bu ders [TypeScript Foundation öğrenme rotasının](../README.md) parçasıdır. Dokümandaki önceki Increment/yardım durumları tarihsel bağlamdır; güncel bağımsız yeterlilik kanıtı değildir.
