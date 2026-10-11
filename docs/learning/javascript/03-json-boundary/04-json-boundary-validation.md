# Ders 17 — JSON Boundary: Runtime Validation ve Kontrollü Hata Modeli

> **Öğrenme yolu:** [JavaScript öğrenme dizini](../README.md) → [Bölüm 3](./README.md)  
> **Önkoşullar:** [JSON syntax](./01-json-fundamentals.md), [serialization](./02-json-stringify.md), [parsing ve `unknown`](./03-json-parse.md), TypeScript union/narrowing ve fonksiyonlar.  
> **Bu dersin hedefi:** Geçerli JSON ile güvenilir uygulama verisini ayırmak; doğru ve yanlış girdiler için açık sonuç üretmek.

## 1. Problem: JSON başarıyla parse edildi, şimdi güvenebilir miyiz?

Hayır. `JSON.parse()` yalnızca metni JavaScript değerine dönüştürür. Örneğin:

```ts
const text = '{"id":"wrong","price":false}';
const parsed: unknown = JSON.parse(text);
```

Bu JSON **geçerlidir** ama uygulamamızın beklediği model şöyleyse:

```ts
type Product = {
  id: number;
  price: number;
};
```

`id` string, `price` boolean olduğu için uyumsuzdur. Tür bildirimi JSON'un içeriğini değiştirmez. Bu nedenle programın güvenilmeyen veriyle güvenilir veri arasında **runtime validation boundary** kurması gerekir.

**Boundary'nin üç sorusu:**

1. **Syntax:** Metin parse edilebiliyor mu?
2. **Type/shape:** Parse edilen değer gerçekten gerekli property'lere ve doğru runtime tiplere sahip mi?
3. **Business rules:** Fiyat gibi alanların değerleri kabul edilebilir aralıkta mı?

Her biri ayrı başarısızlık türü üretir.

## 2. `any`, `unknown` ve `as` neden önemli?

Şu kullanım risklidir:

```ts
const text = '{"id":"wrong","price":false}';
const product = JSON.parse(text) as Product;
```

`as Product`, runtime'da property'leri kontrol **etmez**. TypeScript derlemesi sırasında bir iddiadır. Runtime değerleri aynı kalır:

```ts
console.log(typeof product.id);    // "string"
console.log(typeof product.price); // "boolean"
```

Bunun yerine doğrulanmamış veriyi açıkça `unknown` olarak ele alalım:

```ts
const parsed: unknown = JSON.parse(text);

// Henüz güvenli değildir:
// console.log(parsed.price);
```

`unknown`, type guard / narrowing olmadan property erişimini engeller. Böylece runtime kontrolünü görünür ve zorunlu kılan bir akış kurabiliriz.

## 3. İlk kontrol: Object gerçekten object mi?

JSON kökünde `null`, sayı, string veya array bulunabileceğini biliyoruz. Product için array olmayan ve `null` olmayan bir object gerekir.

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}
```

Neden bu üç koşul?

| İfade | Önlediği hata |
|---|---|
| `typeof value === "object"` | Number / string / boolean ile property okuma |
| `value !== null` | `typeof null` sonucunun `"object"` olmasından doğan yanılgı |
| `!Array.isArray(value)` | Array'in bu veri modelinde object yerine kabul edilmesi |

Ancak şu hâlâ yeterli değil:

```ts
const obj: unknown = { id: "abc", price: false };
console.log(isRecord(obj)); // true
```

**Dış şeklin object olması**, required property'lerin doğru tipte olduğunu kanıtlamaz.

## 4. Property ve type validation

Aşağıdaki Product modeli için iki zorunlu property tanımladık:

```ts
type Product = {
  id: number;
  price: number;
};
```

Runtime'da sırasıyla şunları doğrulamalıyız:

- Dış değer normal object biçiminde mi?
- `id` property'si bulunuyor mu ve `number` mı?
- `price` property'si bulunuyor mu ve `number` mı?

Bunu bir **User-Defined Type Guard** ile ifade edebiliriz:

```ts
function isProductShape(value: unknown): value is Product {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  if (!("id" in value) || !("price" in value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.price === "number"
  );
}
```

**Mekanizma:**

1. İlk `if`, array/null/primitive durumlarını reddeder.
2. `in` operatörü required alanların mevcut olup olmadığını kontrol eder.
3. `typeof` ile beklenen primitive tipleri doğrularız.
4. `value is Product`, `true` sonucundan sonra TypeScript'in `value` tipini Product'a daraltmasına izin verir.

### Type Guard neden sihirli doğrulama değildir?

```ts
function unsafeGuard(value: unknown): value is Product {
  return true;
}
```

Bu kod TypeScript'in anlayacağı bir type guard **sözdizimi** oluşturur ama gerçekte hiçbir doğrulama yapmaz. Güvenilirlik, `value is Product` yazmaktan değil **doğru runtime kontrollerinden** gelir.

## 5. İş kuralı kontrolü — Type doğru, değer yanlış olabilir

Aşağıdaki veri JSON ve shape bakımından doğrudur:

```json
{"id":101,"price":-50}
```

Ama sistemimizde fiyat negatif olamazsa iş kuralını ihlal eder. Bu ders için iş kuralımız:

> `price` sonlu (`finite`) bir sayı olmalı ve sıfır veya daha büyük olmalıdır.

```ts
function hasValidPrice(product: Product): boolean {
  return Number.isFinite(product.price) && product.price >= 0;
}
```

`typeof NaN === "number"` ve `typeof Infinity === "number"` davranışları nedeniyle `typeof price === "number"`, bütün sayısal geçerlilik koşullarını karşılamaz. JSON metninde `NaN` yazmak geçersizdir ama bazı sayıların aşırı büyük üstel gösterimleri runtime'da sonlu olmayan sayısal sonuçlar doğurabilir. Bu yüzden `Number.isFinite()` sağlam bir iş kuralıdır.

### Boundary testleri

- `price = 0` → **geçerli sınır değeri**.
- `price = -1` → **geçersiz sınır altı değer**.
- `price = 49` → **normal geçerli değer**.

Bu testler birlikte, yalnızca pozitif sayı örnekleriyle yakalanamayacak bir hatayı belirginleştirir.

## 6. Hataları açık bir sonuç modeliyle temsil etmek

Parsing sırasında `SyntaxError` exception fırlatılır. Ancak geçersiz kullanıcı verisi gibi beklenen başarısızlıklar, bir fonksiyonun **kontrollü sonucu** olarak ifade edilebilir.

```ts
type ProductResult =
  | { ok: true; value: Product }
  | {
      ok: false;
      error: "INVALID_JSON" | "INVALID_SHAPE" | "INVALID_PRICE";
    };
```

Bu yapıya **discriminated union** denir. `ok` alanı, sonuçtaki diğer property'lerin hangilerinin var olduğunu ayırt etmeye yarar:

```ts
function describeResult(result: ProductResult): string {
  if (result.ok) {
    return `Product ${result.value.id}, price ${result.value.price}`;
  }

  return `Error: ${result.error}`;
}
```

`result.ok` true iken `value`, false iken `error` erişilebilir. Her olasılık açıkça modellenmiştir.

**Exception ile controlled result ayrımı:**

- **SyntaxError:** JSON.parse işleminin fırlattığı exception'dır. Bunu yakalayıp `INVALID_JSON` sonucu olarak çevirebiliriz.
- **INVALID_SHAPE:** Parse başarılıdır; yapı/tip beklenene uymaz.
- **INVALID_PRICE:** Veri shape olarak uygundur; iş kuralına aykırıdır.

Bunlar aynı hata değildir; tanılama ve test stratejisinde ayrılmalıdır.

## 7. Bütünleşik TypeScript fonksiyonu — İlk satırdan son return'e

Aşağıdaki örneği **tamamını okuyarak** takip et. Yeni framework, HTTP veya validation kütüphanesi gerektirmez.

```ts
type Product = {
  id: number;
  price: number;
};

type ProductResult =
  | { ok: true; value: Product }
  | {
      ok: false;
      error: "INVALID_JSON" | "INVALID_SHAPE" | "INVALID_PRICE";
    };

function isProductShape(value: unknown): value is Product {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  if (!("id" in value) || !("price" in value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.price === "number"
  );
}

function parseProduct(jsonText: string): ProductResult {
  let parsed: unknown;

  // Aşama 1 — Sözdizimini yorumla.
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, error: "INVALID_JSON" };
    }
    throw error;
  }

  // Aşama 2 — Required alanları ve tiplerini doğrula.
  if (!isProductShape(parsed)) {
    return { ok: false, error: "INVALID_SHAPE" };
  }

  // Aşama 3 — Bu uygulamanın fiyat iş kuralı.
  if (!Number.isFinite(parsed.price) || parsed.price < 0) {
    return { ok: false, error: "INVALID_PRICE" };
  }

  // Aşama 4 — Yalnız doğrulanmış alanlarla yeni bir model oluştur.
  return {
    ok: true,
    value: { id: parsed.id, price: parsed.price }
  };
}

console.log(parseProduct('{"id":101,"price":49}'));
// { ok: true, value: { id: 101, price: 49 } }

console.log(parseProduct('{"id":"101","price":49}'));
// { ok: false, error: "INVALID_SHAPE" }

console.log(parseProduct('{"id":101,"price":-1}'));
// { ok: false, error: "INVALID_PRICE" }

console.log(parseProduct('{"id":101,}'));
// { ok: false, error: "INVALID_JSON" }
```

### Bu akışta verinin durumu nasıl değişiyor?

**Aşama 1 — Parsing:** `jsonText` string → `parsed: unknown`. Parse başarılıysa syntax doğrudur; verinin tipi hâlâ bilinmiyor.

**Aşama 2 — Shape:** `isProductShape(parsed)` yanlışsa `INVALID_SHAPE`. Doğruysa TypeScript `parsed` değerini `Product` olarak daraltır.

**Aşama 3 — Business rule:** `price` sonlu ve negatif değilse devam edilir; aksi hâlde `INVALID_PRICE`.

**Aşama 4 — Sonuç:** `{ id: parsed.id, price: parsed.price }` ile **yeni, açıkça seçilmiş alanları içeren object** oluşturulur. Kaynakta beklenmeyen ek property varsa dış sonuç object'ine taşınmaz.

### `return` ve `throw` arasındaki fark

`return {ok:false,...}` fonksiyonun **normal dönüş değeridir**; çağıran taraf bunu işleyebilir. `throw error` ise beklenmeyen bir hatayı gizlememek için exception akışını sürdürür. Bütün hataları aynı `catch` ile "INVALID_JSON" yapmak debugging bilgisini kaybettirir.

## 8. Güvenlik ve tasarım sınırları

Bu çözüm, tanımladığımız **id number / price finite nonnegative** kurallarını doğrular. Bunun dışında kendiliğinden her şeyi doğrulamaz.

Örneğin:

- `id`'nin pozitif tam sayı olması isteniyorsa **ayrı iş kuralı** gerekir. Yukarıdaki örnekte böyle bir kural tanımlamadık.
- Kaynak object'teki beklenmeyen property'leri response'a otomatik yaymamak için iki alanı açıkça seçtik.
- JSON parse edildi diye içeriği otomatik güvenilir saymayız.
- `as Product` veya `any` ile kontrolü atlamayız.
- Bu derste yeni validation library eklemiyoruz; TypeScript'in yerleşik kontrolleriyle çalışıyoruz.

Bu sınırları doğru tanımlamak, aşırı güvenle geliştirilmiş "çalışıyor gibi görünen" koddan daha önemlidir.

## 9. Test mühendisliği — Risklere göre senaryo seçimi

Aşağıdaki tablo, `parseProduct` için beklenen davranış sözleşmesidir:

| Durum | Girdi | Beklenen sonuç | Hangi riski yakalar? |
|---|---|---|---|
| Happy path | `{"id":1,"price":49}` | `ok: true` | Normal kabul |
| Exact boundary | `{"id":1,"price":0}` | `ok: true` | Sıfırı yanlışlıkla reddetme |
| Negative price | `{"id":1,"price":-1}` | `INVALID_PRICE` | İş kuralı ihlali |
| Malformed JSON | `{"id":1,}` | `INVALID_JSON` | Syntax error |
| Missing field | `{"id":1}` | `INVALID_SHAPE` | Required property |
| Wrong type | `{"id":"1","price":49}` | `INVALID_SHAPE` | Type mismatch |
| Null root | `null` | `INVALID_SHAPE` | `typeof null` tuzağı |
| Array root | `[]` | `INVALID_SHAPE` | Object–array ayrımı |
| Primitive root | `42` | `INVALID_SHAPE` | JSON her zaman object değildir |
| Extra field | `{"id":1,"price":49,"debug":"x"}` | `ok: true`, dış sonuçta `debug` yok | Alanları açık seçme |

### Vitest'e aktarım örneği (henüz çalıştırılmış test değildir)

Aşağıdaki satırlar, fonksiyon `parseProduct` bir module olarak export edildiğinde yazılabilecek test fikrini gösterir. Gerçek test dosyası yolu uygulama aşamasında belirlenecektir.

```ts
// Örnek test tasarımı; burada çalıştırılmış olarak işaretlenmez.
import { describe, expect, it } from "vitest";
import { parseProduct } from "./parse-product";

describe("parseProduct", () => {
  it("accepts zero price at the boundary", () => {
    expect(parseProduct('{"id":1,"price":0}')).toEqual({
      ok: true,
      value: { id: 1, price: 0 }
    });
  });

  it("rejects malformed JSON", () => {
    expect(parseProduct('{"id":1,}')).toEqual({
      ok: false,
      error: "INVALID_JSON"
    });
  });

  it("rejects a string price", () => {
    expect(parseProduct('{"id":1,"price":"49"}')).toEqual({
      ok: false,
      error: "INVALID_SHAPE"
    });
  });
});
```

**Not:** `./parse-product` dosya yolu yer tutucudur; bu belge yeni bir kod dosyasının oluşturulduğu veya testlerin çalıştığı anlamına gelmez.

### Debugging pratiği

Bir test `INVALID_PRICE` beklerken `INVALID_SHAPE` alıyorsa şu sırayla incele:

1. JSON gerçekten geçerli mi?
2. `price` değeri `-1` (number) mi, `"-1"` (string) mi?
3. `isProductShape` hangi adımda false döndürüyor?
4. İş kuralına gerçekten ulaşılmış mı, yoksa erken `return` mü var?

Bu yaklaşım, körlemesine kod değiştirmek yerine veri akışını takip ederek hata ayıklamaktır.

## 10. Mülakat hazırlığı

**Soru: Why is `JSON.parse()` not enough to trust API or file data?**

> Parsing only checks whether the text follows JSON syntax and converts it into a JavaScript value. The result can still have missing properties, wrong runtime types, or values that violate business rules. We should validate the shape and constraints at the trust boundary.

**Soru: What is a type guard in TypeScript?**

> A type guard is a runtime check that allows TypeScript to narrow a value's type. A user-defined guard can return `value is Product`, but its implementation must actually verify the required properties and types.

**Soru: What is a discriminated union?**

> It is a union of object types distinguished by a common literal field such as `ok: true` or `ok: false`. The field lets TypeScript narrow the result to the success or error branch safely.

**Türkçe öz:** JSON parse etmek güvenilir model üretmez. Önce shape ve tip, sonra iş kuralı kontrol edilir. Başarı/hata açık result olarak döndürülür. Tip daraltma runtime kontrolleriyle desteklenir.

## 11. Kendi kendine pekiştirme

1. `{"id":101,"price":"49"}` geldiğinde hangi aşama başarısız olur ve neden?
2. `{"id":101,"price":-5}` için neden `INVALID_SHAPE` değil `INVALID_PRICE` beklenir?
3. `const product = JSON.parse(text) as Product` neden güvenilir bir boundary değildir?
4. `price = 0` neden mutlaka test edilmesi gereken exact boundary örneğidir?
5. Fonksiyon `debug` gibi ek alanları niçin sonuç modeline otomatik olarak taşımıyor?
6. İş kuralını `price > 0` olarak yanlış yazarsak hangi test bunu yakalar?

<details>
<summary>Kontrol cevapları</summary>

1. Shape/type validation: `price` runtime'da string'dir.
2. JSON ve number tipleri doğrudur; fakat negatif fiyat iş kuralını ihlal eder.
3. `as` compile-time iddiasıdır; runtime'da property tiplerini doğrulamaz.
4. `0`, `price >= 0` için kabul edilen en küçük sınır değeridir; truthy/falsy yanılgısını da yakalar.
5. Yalnız doğrulanan/istenen alanlar açıkça seçilir; beklenmeyen veri sızmasını azaltır.
6. Sıfır fiyatı kabul eden happy-boundary testi.

</details>

## 12. Bölüm kapanışı ve sıradaki mühendislik adımı

Buraya kadar: JSON formatı → serialization → parsing → `unknown` → runtime shape → business rule → controlled result zincirini öğrendik.

**Bölüm özeti ve bütünleştirme:** [Bölüm 3 README](./README.md).

**Sonraki çalışma:** Mevcut TypeScript repository'sinde I4 kapsamındaki davranışı tasarlama, gerçek typecheck/test yürütme, debugging ve bağımsız transfer. Buradaki kodlar öğretici örnektir; gerçek uygulama kanıtı olarak işaretlenmez. H0–H4 yardım seviyesi uygulama gözleminde ayrıca kaydedilir.
