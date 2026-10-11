# External Input ve Trust Boundary

**Önkoşul:** [Bölüm 07 giriş](./README.md) · [Bölüm 06](../06-typescript-modeling/README.md) · [Sonraki ders](./02-property-existence-and-types.md)

## 1. Bu konuya neden ihtiyaç duyuyoruz?
TypeScript'in `Product` olarak beklediği parametre, program dışından gerçekten doğru biçimde gelmeyebilir. Kritik ayrım 'beklenen model' ile 'gelen değer' arasındadır.

## 2. Tanım ve zihinsel mekanizma
**Trust boundary**, kontrol edilmemiş dış veri ile doğrulanmış iç model arasındaki sınırdır. `unknown` dış değer için güvenli type başlangıcıdır. Güvenlik ve correctness, runtime'da gerçek değerin shape'ini sınayarak kurulur.

## 3. Açıklamalı TypeScript örneği
```ts
type Product = { name: string; price: number };
function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" &&
    input !== null &&
    !Array.isArray(input);
}
console.log(isRecord(null));       // false
console.log(isRecord([]));         // false
console.log(isRecord({price: 3})); // true
```

## 4. Execution ve veri akışı
`typeof null` object döndürdüğü için `input !== null` zorunludur. Array de object türünde olduğu için `!Array.isArray` ayrı karar verir. Bu ilk kontrol sadece record olduğunu gösterir; Product shape'inin tamamını henüz doğrulamaz.

## 5. TypeScript ile ilişkisi
`input is Record<string,unknown>` bir **type predicate**'tir. TypeScript daraltmayı fonksiyonun runtime boolean cevabına göre yapar; predicate'in içinin gerçekten doğru yazılması geliştiricinin sorumluluğudur.

## 6. Sınır davranışları ve önemli ayrımlar
Kötü bir guard her şey için `true` döndürürse TypeScript aldanabilir. `isRecord({})` true olması Product doğrulandı demek değildir; gerekli property'ler daha sonra kontrol edilir.

## 7. Hata araştırma / doğrulama
Bir dış veri hatasında önce hangi sınırdan geldiğini tespit et: parse edilen metin mi, kullanıcı nesnesi mi, test fixture mı? Sonra object, null ve array durumlarını gözlemle.

## 8. Gerçek kullanım ve birikimli bağlantı
Bu mekanizma dışarıdan gelen veriyi uygulama modeline güvenle taşırken kullanılır. JSON metni parsing ve serialization ayrı tekniklerdir; [10 — JSON Boundary](../10-json-boundary/README.md) burada öğrenilen güven sınırını tekrar kullanır, aynı runtime validation bilgisini baştan öğretmez.

## 9. Mülakat hazırlığı
*Why use unknown instead of asserting a type for untrusted data?* Unknown requires runtime checks before values are treated as an application model.

## 10. Pekiştirme
`isRecord(42)`, `isRecord('hello')`, `isRecord({})` sonuçlarını tahmin et. `{}` neden geçerli Product olarak kabul edilmemeli?

## Kaynak ve tarihsel kanıt ayrımı
[I3 — Safe Types, Runtime Boundaries](../../../I3-safe-types-runtime-boundaries.md) yeniden kullanılabilir öğretim kaynağıdır. Bu ders geçmiş H0–H4 sonucunu değiştirmez.
