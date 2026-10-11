# Property Existence ve Runtime Type Validation

**Önkoşul:** [Bölüm 07 giriş](./README.md) · [Önceki ders](./01-external-input-trust-boundary.md) · [Sonraki ders](./03-discriminated-results.md)

## 1. Bu konuya neden ihtiyaç duyuyoruz?
Bir object'in `price` property ismini taşıması, bu değerin number olduğuna dair kanıt değildir.

## 2. Tanım ve zihinsel mekanizma
Runtime validation adımları: object/null/array kontrolü → required property var mı → gerçek property type doğru mu → yalnız güvenilir alanlardan model oluştur. `in` ile property varlığına bakmak, `typeof` ile değer kontrolü yapmak iki ayrı sorudur.

## 3. Açıklamalı TypeScript örneği
```ts
type Product = { name: string; price: number };
function parseProduct(input: unknown): Product | null {
  if (typeof input !== "object" || input === null ||
      Array.isArray(input)) return null;
  if (!("name" in input) || !("price" in input)) return null;
  if (typeof input.name !== "string" ||
      typeof input.price !== "number") return null;
  return { name: input.name, price: input.price };
}
console.log(parseProduct({name:"Elma",price:10})); // {name:"Elma",price:10}
console.log(parseProduct({name:123,price:10}));    // null
console.log(parseProduct(null));                   // null
```

## 4. Execution ve veri akışı
İlk çağrı object, property ve tür kontrollerinin hepsini geçer ve yeni Product object'i üretir. İkincide `name` var ama number olduğu için reddedilir. Üçüncü çağrıda null doğrudan reddedilir.

## 5. TypeScript ile ilişkisi
Runtime kontrolü sonucunda TypeScript narrowing kullanılır. `as Product` hiç kontrol yapmadan modeli doğruymuş gibi gösterebilir; bu yöntemin alternatifi değildir.

## 6. Sınır davranışları ve önemli ayrımlar
`typeof NaN === 'number'` doğrudur; sadece shape'i sınamak `NaN`, `Infinity` veya negatif fiyatın iş kuralınca geçerli olduğunu ispatlamaz. Böyle kısıtlar ayrıca **business validation** konusudur.

## 7. Hata araştırma / doğrulama
Eksik property ve yanlış property type'ını aynı hata mesajıyla saklamak yerine gerekirse hangi kontrolde reddedildiğini not al; `null`, `{}`, `[]`, yanlış name ve yanlış price testlerini birbirinden ayır.

## 8. Gerçek kullanım ve birikimli bağlantı
Bu mekanizma dışarıdan gelen veriyi uygulama modeline güvenle taşırken kullanılır. JSON metni parsing ve serialization ayrı tekniklerdir; [10 — JSON Boundary](../10-json-boundary/README.md) burada öğrenilen güven sınırını tekrar kullanır, aynı runtime validation bilgisini baştan öğretmez.

## 9. Mülakat hazırlığı
*Is checking that a key exists sufficient validation?* No. You must also check the property's runtime type and any relevant business constraints.

## 10. Pekiştirme
`{name:'Elma',price:'10'}` neden reddedilir? `price: NaN` şu an kabul edilir mi, bu hangi eksik kontrol türüdür?

## Kaynak ve tarihsel kanıt ayrımı
[I3 — Safe Types, Runtime Boundaries](../../../I3-safe-types-runtime-boundaries.md) yeniden kullanılabilir öğretim kaynağıdır. Bu ders geçmiş H0–H4 sonucunu değiştirmez.
