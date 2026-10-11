# Union Types ve Control-Flow Narrowing

**Önkoşul:** [TypeScript modelleme bölümü](./README.md) · [Önceki](./02-optional-undefined-null.md) · [Sonraki](./04-unknown-and-compile-time-limits.md)

## 1. Neden ihtiyaç duyuyoruz?
Bir parametre birden fazla tür olabiliyorsa o türlerin ortak olmayan işlemlerini doğrudan çağırmak güvenli değildir.

## 2. Tanım ve mekanizma
`string | number` bir değerin iki türden **biri** olduğunu söyler. **Narrowing**, `typeof` gibi runtime kontrolünün ardından TypeScript'in o branch'teki olasılıkları daraltmasıdır.

## 3. Açıklamalı kod ve çıktı
```ts
function normalize(value: string | number): string | number {
  if (typeof value === "string") {
    return value.trim();
  }
  return value * 10;
}
console.log(normalize(" Hi ")); // Hi
console.log(normalize(3));      // 30
```

## 4. Execution ve veri akışı
String çağrısında `typeof value` string branch'i seçer, `trim()` güvenli olur. Number çağrısında if geçilmez, geri kalan değer number olarak kullanılır. `return` function'ı ilgili çağrıda sonlandırır.

## 5. TypeScript compile-time ile runtime ayrımı
Narrowing TypeScript'in sihirli runtime dönüştürmesi değildir; gerçek bir kontrolü **okuyarak** tür olasılıklarını daraltır. Başka branch'in çalışmadığı bilgisi de daraltmaya katkı verir.

## 6. Sınır davranışları ve kritik farklar
Type assertion `as string` çalışma anında veri dönüşümü veya doğrulaması yapmaz. Bir `string | number` üzerinde doğrudan `.trim()` çağırmak number ihtimalini göz ardı eder.

## 7. Yaygın yanlış kullanım / debugging
Type hatası çıktığında hangi branch'in değerin türünü kanıtladığını kontrol et. Gereksiz `as` yerine control-flow kontrolü ekle ve normal iki yolu test et.

## 8. Gerçek kullanım
Uygulamanın model bekleyen iç fonksiyonları ve dışarıdan veri alan sınır fonksiyonları aynı güven seviyesinde değildir. Compile-time shape bilgisi faydalıdır fakat runtime'daki gerçek değeri anlamak için kontrol gerekir.

## 9. Interview preparation
*How does narrowing work in TypeScript?* Real runtime conditions such as `typeof` allow the checker to refine a union type in a control-flow branch.

## 10. Bağımsız pekiştirme
`normalize('  ok ')`, `normalize(0)` sonuçları? `typeof` kontrolü kaldırılırsa hangi satır type hatası üretebilir?

**Kaynak:** [I2](../../../I2-control-flow-functions-data-modeling.md) ve [I3](../../../I3-safe-types-runtime-boundaries.md). Eğitim içeriği bağımsız öğrenci uygulama/H0 kanıtı değildir.
