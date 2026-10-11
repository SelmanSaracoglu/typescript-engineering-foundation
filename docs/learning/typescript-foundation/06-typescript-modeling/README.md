# 06 — TypeScript Modeling Fundamentals

**Önkoşul:** [05 — objects](../05-objects-arrays-references/README.md). **Sonraki:** [07 — runtime boundary](../07-safe-runtime-boundaries/README.md), [08 — decision mechanics](../08-value-and-decision-mechanics/README.md).

## Temel fark
TypeScript `type` veya `interface` programcının beklediği shape'i type-check sırasında açıklar; runtime'da gelen her değeri otomatik doğrulamaz.

```ts
type Product = {
  name: string;
  price?: number;          // property olmayabilir
  note: string | null;     // property var; değer null olabilir
};

const product: Product = { name: "Elma", note: null };
console.log(product.price); // undefined
```

`price?` için okunan değer kavramsal olarak `number | undefined` olur. `note` alanı zorunludur ama `null` değerine izin verir. `undefined` ile `null` aynı şey değildir; eksiklik ve bilinçli boş değer ayrımı gerekir.

## Union ve narrowing
```ts
function normalize(value: string | number): string | number {
  if (typeof value === "string") {
    return value.trim();
  }
  return value * 10;
}
console.log(normalize(" Hi ")); // "Hi"
console.log(normalize(2));      // 20
```
Başlangıçta iki olası tür vardır; `typeof` kontrolü ilgili branch'de olasılığı daraltır. Buna **narrowing** denir.

## `unknown` ve `any`
`unknown` bir değerin henüz doğrulanmamış olduğunu söyler; doğrudan property/method kullanmaya izin vermez. `any` birçok type-check güvenliğini atlar. Gerçek dış veri için `unknown` ile başlayıp çalışma anında doğrulama yap: [07](../07-safe-runtime-boundaries/README.md).

## Hata ve sınır
`price ?? 0` nullish fallback seçer, fiyatın geçerli olup olmadığını kanıtlamaz. Truthiness, equality ve `??` ayrıntıları [08](../08-value-and-decision-mechanics/README.md)'de; `?.` erişimi [09](../09-modern-object-array-syntax/05-optional-chaining.md)'da işlenir.

**Mülakat:** *Does a TypeScript type validate JSON at runtime?* Hayır. JSON sonrası verinin gerçek şekli ve değerleri runtime kontrolleriyle doğrulanır.

**Pekiştirme:** `nickname?: string` ile `nickname: string | null` farkı? `unknown` neden `any`'den daha güvenli? Kaynaklar: [I2](../../I2-control-flow-functions-data-modeling.md), [I3](../../I3-safe-types-runtime-boundaries.md).
