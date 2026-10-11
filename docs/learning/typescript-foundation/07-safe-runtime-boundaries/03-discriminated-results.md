# Discriminated Result Union: Valid ve Invalid Sonuçlar

**Önkoşul:** [Bölüm 07 giriş](./README.md) · [Önceki ders](./02-property-existence-and-types.md) · [Sonraki ders](./04-return-versus-throw-and-exceptions.md)

## 1. Bu konuya neden ihtiyaç duyuyoruz?
Geçersiz girdi validation function'ının olağan sonuçlarından biridir. Hata yolunu açık modellemezsek caller yanlış varsayımla devam edebilir.

## 2. Tanım ve zihinsel mekanizma
**Discriminated union**, bir ayrıştırıcı alanla (`ok:true/false` gibi) success ve failure branch'lerini güvenli biçimde ayırır. `return {ok:false,error:...}` exception değildir; normal control flow içinde dönen beklenen error result'tır.

## 3. Açıklamalı TypeScript örneği
```ts
type Product = { name: string };
type Result =
  | { ok: true; value: Product }
  | { ok: false; error: "INVALID_SHAPE" };

function validate(input: unknown): Result {
  if (typeof input !== "object" || input === null ||
      Array.isArray(input) || !("name" in input) ||
      typeof input.name !== "string") {
    return { ok: false, error: "INVALID_SHAPE" };
  }
  return { ok: true, value: { name: input.name } };
}
const result = validate({ name: "Ali" });
if (result.ok) {
  console.log(result.value.name); // Ali
} else {
  console.log(result.error);
}
```

## 4. Execution ve veri akışı
Input control'lerden geçerse success branch'i model taşır. Geçmezse failure branch'i hata kodu taşır. Caller `result.ok` kontrolü ile hangi alanın mevcut olduğunu güvenli biçimde bilir.

## 5. TypeScript ile ilişkisi
TypeScript literal discriminant üzerinde narrowing yapar: `ok:true` durumunda `value`, `ok:false` durumunda `error` vardır. `result.value` alanını `ok` kontrolü olmadan kullanmak tip hatası doğurur.

## 6. Sınır davranışları ve önemli ayrımlar
Bu örneğin hata kodu yalnız shape başarısızlığını ifade eder. JSON syntax hatası `JSON.parse` düzeyinde ayrıca ele alınır: [10 — JSON Boundary](../10-json-boundary/README.md). Business rule ile shape kuralını ayrıştırabilmek yararlıdır.

## 7. Hata araştırma / doğrulama
Test için iki yoldan da assert oluştur: valid input → `ok:true` ve beklenen value; invalid input → `ok:false` ve doğru error. Yalnız `ok` false demek hangi hata sözleşmesinin seçildiğini doğrulamaz.

## 8. Gerçek kullanım ve birikimli bağlantı
Bu mekanizma dışarıdan gelen veriyi uygulama modeline güvenle taşırken kullanılır. JSON metni parsing ve serialization ayrı tekniklerdir; [10 — JSON Boundary](../10-json-boundary/README.md) burada öğrenilen güven sınırını tekrar kullanır, aynı runtime validation bilgisini baştan öğretmez.

## 9. Mülakat hazırlığı
*Why model expected validation failure as a Result?* Callers can handle known failure cases explicitly without treating them as unexpected exceptions.

## 10. Pekiştirme
`validate({})`, `validate({name: 99})`, `validate({name:'Ada'})` sonuçlarının discriminant ve taşınan alanlarını tabloya yaz.

## Kaynak ve tarihsel kanıt ayrımı
[I3 — Safe Types, Runtime Boundaries](../../../I3-safe-types-runtime-boundaries.md) yeniden kullanılabilir öğretim kaynağıdır. Bu ders geçmiş H0–H4 sonucunu değiştirmez.
