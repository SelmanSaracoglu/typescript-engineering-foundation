# unknown, any ve Compile-Time Model Sınırı

**Önkoşul:** [TypeScript modelleme bölümü](./README.md) · [Önceki](./03-unions-control-flow-narrowing.md) · [Bölüm 07](../07-safe-runtime-boundaries/README.md)

## 1. Neden ihtiyaç duyuyoruz?
Güvenilmeyen verinin TypeScript tarafından güvenilir kabul edilmesi, ileride güvenlik ve mantık kusurlarına yol açabilir.

## 2. Tanım ve mekanizma
`unknown` değer olduğunu ama tipini güvenli biçimde bilmediğimizi belirtir; kontrol olmadan property/method kullanımı engellenir. `any` statik kontrolün önemli kısmını devre dışı bırakır.

## 3. Açıklamalı kod ve çıktı
```ts
function readLabel(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return "INVALID_TYPE";
}
console.log(readLabel("  ready ")); // ready
console.log(readLabel(42));          // INVALID_TYPE
console.log(readLabel(null));        // INVALID_TYPE
```

## 4. Execution ve veri akışı
Function'a `unknown` değer gelir. Her çağrıda gerçek runtime `typeof` kontrol edilir. Sadece string değer `trim()` alır. Başka türler controlled string sonucuna gider; exception fırlatmak zorunda değildir.

## 5. TypeScript compile-time ile runtime ayrımı
`unknown` typecheck'teki güvenli sınırdır ama veriyi **kendi başına** doğrulamaz. Runtime guard işin gerçek kısmını yapar. `any` kullanılması sorunu gizleyebilir; güvenli modelin yerine geçmez.

## 6. Sınır davranışları ve kritik farklar
`typeof x === 'object'` null için de true olabilir; object input'larında shape/property kontrolü gerekir. [07 — Runtime Boundaries](../07-safe-runtime-boundaries/README.md). JSON parse sonucunu TypeScript modeline as etmek, doğrulama değil assertion'dır.

## 7. Yaygın yanlış kullanım / debugging
Çalışırken `Cannot read properties of ...` hatası alındığında varsayılan veri shape'inin gerçekten mevcut olup olmadığına bak; `as Product` ile problemi örtemezsin.

## 8. Gerçek kullanım
Uygulamanın model bekleyen iç fonksiyonları ve dışarıdan veri alan sınır fonksiyonları aynı güven seviyesinde değildir. Compile-time shape bilgisi faydalıdır fakat runtime'daki gerçek değeri anlamak için kontrol gerekir.

## 9. Interview preparation
*Why prefer unknown for untrusted input?* It forces the caller to check the value before unsafe operations instead of bypassing type checks.

## 10. Bağımsız pekiştirme
`readLabel([])` ne döner? `as string` kullanmanın array'i string'e dönüştürmediğini açıkla.

**Kaynak:** [I2](../../../I2-control-flow-functions-data-modeling.md) ve [I3](../../../I3-safe-types-runtime-boundaries.md). Eğitim içeriği bağımsız öğrenci uygulama/H0 kanıtı değildir.
