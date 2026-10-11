# Ders 27 — Module Boundary: export, import type ve Sorumluluk Ayrımı

## 1. Neden birden fazla dosya?

Bir uygulama modelinin (`Product`) tanımı ile ona gelen verinin doğrulanması iki ayrı sorumluluktur. Kod tabanı büyüdüğünde farklı modüllerde tutmak okunabilirliği sağlayabilir. Ancak yeni dosya üretmek tek başına doğru tasarım veya güvenlik kanıtı değildir.

## 2. export type ve import type

Birinci dosya:

```ts
// src/product.ts
export type Product = {
  name: string;
  price: number;
};
```

İkinci dosya:

```ts
// src/productValidation.ts
import type { Product } from "./product";

export function isProduct(input: unknown): input is Product {
  return typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    "name" in input &&
    typeof input.name === "string" &&
    "price" in input &&
    typeof input.price === "number";
}
```

Bunlar tek code block olarak **tek dosyada birleştirilmeyecek iki ayrı dosya** örneğidir.

## 3. Type dependency ve runtime behavior

- `export type` type modelini diğer dosyaların statik kontrollerine açar.
- `import type` yalnız compile-time type bağımlılığıdır.
- `export function` runtime'da çağrılacak gerçek fonksiyonu dışarı açar.
- `input is Product` predicate, function'ın true sonucuna bağlı TypeScript narrowing sağlar.
- **Gerçek doğrulama**, function body içindeki koşulları çalıştırmaktır.

## 4. Data flow

```text
Unknown external value
      ↓
isProduct runtime checks
      ↓ boolean result
true → Product olarak daraltılmış input
false → reddedilen shape
```

Modülleri ayırmak dış veriyi kendiliğinden Product yapmaz. `import type { Product }` gerçek model object'i veya validator fonksiyonu üretmez.

## 5. Runtime guard hatalıysa?

```ts
// Riskli, bilerek yanlış guard:
function fakeIsProduct(_input: unknown): _input is Product {
  return true;
}
```

TypeScript bu iddiayı kullanabilir; ancak runtime'da alanlar yanlış olabilir. Predicate imzası tek başına veri doğrulamanın kanıtı değildir.

## 6. Gerçek repo farkı

Bu repository'de `src/product.ts` kendi Product modelini ve seçim fonksiyonunu export eder. `src/productValidation.ts` ise `import type` ile bu modeli kullanır ve runtime input kontrolü yapar. Ders, mevcut dosya sorumluluklarını açıklar; yeni framework veya modül sistemi kurmaz.

## 7. Sınır ve debugging

Belirti: Module import bulunamıyor. Relative path gerçekten doğru mu? Dosya adı ve compiler module ayarları ne? TypeScript compilation hata raporunu kontrol et.

Belirti: Type import doğru ancak `price:"100"` geçiyor. Validator'daki property type kontrolleri eksik olabilir; `import type` runtime doğrulama sağlamaz.

Belirti: TypeScript type runtime'da kullanılamıyor. Type alias/interface runtime object değildir; sadece `export type` ile sınıf/instance üretilmez.

## 8. Mülakat hazırlığı

**Question:** What is the difference between import type and importing a runtime function?

> Import type brings in compile-time type information and is erased in emitted JavaScript. A runtime function import provides executable code.

## 9. Pekiştirme

1. `import type` Product instance'ı oluşturur mu?
2. Validator neden `unknown` input kabul ediyor?
3. `export function` neden `export type` ile aynı davranış değil?
4. Runtime type guard her zaman true dönerse ne tehlike var?

<details><summary>Cevaplar</summary>

1. Hayır. 2. Dış input doğrulanmamıştır. 3. Fonksiyon runtime code içerir. 4. Yanlış shape güvenilir sanılabilir.

</details>

## 10. Sorumluluk ayrımı: model, validator ve caller

Aşağıdaki üç parça **üç ayrı dosyayı** temsil eder:

```ts
// product.ts
export type Product = { name:string; price:number };
```

```ts
// validate.ts
import type { Product } from "./product";
export function isProduct(input: unknown): input is Product {
  return typeof input === "object" && input !== null &&
    !Array.isArray(input) &&
    "name" in input && typeof input.name === "string" &&
    "price" in input && typeof input.price === "number";
}
```

```ts
// app.ts
import { isProduct } from "./validate";
const incoming: unknown = {name:"Elma",price:100};
if (isProduct(incoming)) {
  console.log(incoming.price); // 100
}
```

**Execution:** Caller validator function'ı runtime import eder; `Product` type import'u runtime değer üretmez. Predicate true sonucuna göre caller'da input Product olarak daraltılır.

### Dosya konumuna dikkat

Relative import path, dosyaların gerçek konumuna göre kurulur. Yanlış dosya adı veya path modül çözümlemesinde hata yaratabilir. Ancak dosya ayırmak, input'un doğru olduğuna ilişkin validation kanıtı değildir.

### Bağımsız görev

Modelde `inStock:boolean` zorunlu hale gelsin. Hangi iki dosyada model ve guard değişmeli? Caller'da `incoming.inStock` okunacaksa bu hangi koşuldan sonra güvenlidir?

<details><summary>Kontrol</summary>

Model declaration ve validator guard güncellenir. Caller, guard başarılı olduktan sonra field'e güvenebilir. Bu senaryo için yeni repo/framework kurmak gerekmez.

</details>
