# return, throw, Error ve Exception Akışı

**Önkoşul:** [Bölüm 07 giriş](./README.md) · [Önceki ders](./03-discriminated-results.md) · [Bölüm 08](../08-value-and-decision-mechanics/README.md)

## 1. Bu konuya neden ihtiyaç duyuyoruz?
Normal başarısızlık sonucuyla exception'ı karıştırmak caller'ın hata yönetimini belirsizleştirir.

## 2. Tanım ve zihinsel mekanizma
`return` normal sonuç kanalıdır: fonksiyon tamamlanır ve caller değeri alır. `throw` normal yürütmeyi keser ve bir matching catch'e ilerler. `new Error(message)` Error object'i oluşturur; `throw` o nesneyi exception kanalına taşır.

## 3. Açıklamalı TypeScript örneği
```ts
function divide(a: number, b: number): number | null {
  if (b === 0) return null; // beklenen hata sonucu
  return a / b;
}
function requirePositive(n: number): number {
  if (n <= 0) throw new Error("NON_POSITIVE");
  return n;
}
console.log(divide(6, 0)); // null
try {
  requirePositive(-2);
} catch (error: unknown) {
  if (error instanceof Error) console.log(error.message); // NON_POSITIVE
}
```

## 4. Execution ve veri akışı
`divide(6,0)` normal biçimde `null` return eder; caller'a exception göndermez. `requirePositive(-2)` yeni Error yaratıp fırlatır; aynı çağrıda normal return oluşmaz; catch yakalar ve mesajı yazdırır.

## 5. TypeScript ile ilişkisi
Return type `number | null` normal sonuçları açıklar; `throw` bu union'ın `null` alternatifi değildir. Catch'teki değer `unknown` kabul edilir; Error olup olmadığını `instanceof` ile daraltmak gerekir.

## 6. Sınır davranışları ve önemli ayrımlar
Her invalid input için evrensel tek yöntem yoktur. Beklenen validation başarısızlığı Result ile; gerçekten normal yürütmeyi sürdüremeyen durum exception ile modellenebilir. Bu bölüm **senkron** modeldir; Promise rejection/asenkron hata ileride ayrı öğretilir.

## 7. Hata araştırma / doğrulama
Stack trace gördüğünde hangi satırın throw ettiğini, catch'in gerçekten çalışıp çalışmadığını ve sorunun caller sözleşmesinde mi olduğunu ayır. `throw new Error` ile `return new Error` aynı değildir.

## 8. Gerçek kullanım ve birikimli bağlantı
Bu mekanizma dışarıdan gelen veriyi uygulama modeline güvenle taşırken kullanılır. JSON metni parsing ve serialization ayrı tekniklerdir; [10 — JSON Boundary](../10-json-boundary/README.md) burada öğrenilen güven sınırını tekrar kullanır, aynı runtime validation bilgisini baştan öğretmez.

## 9. Mülakat hazırlığı
*How does throw differ from return?* Return ends a call normally with a value. Throw abandons the normal return path and transfers control to exception handling.

## 10. Pekiştirme
`divide(6,3)`, `divide(0,0)`, `requirePositive(1)` sonuçlarını tahmin et. `requirePositive(-1)` için normal return niçin oluşmaz?

## Kaynak ve tarihsel kanıt ayrımı
[I3 — Safe Types, Runtime Boundaries](../../../I3-safe-types-runtime-boundaries.md) yeniden kullanılabilir öğretim kaynağıdır. Bu ders geçmiş H0–H4 sonucunu değiştirmez.
