# Optional Property, undefined ve null

**Önkoşul:** [TypeScript modelleme bölümü](./README.md) · [Önceki](./01-type-alias-object-shape-interface.md) · [Sonraki](./03-unions-control-flow-narrowing.md)

## 1. Neden ihtiyaç duyuyoruz?
Eksik property ile özellikle 'değer yok' olarak işaretlenmiş property aynı şey değildir; bunları karıştırmak UI, test ve validation hatası üretir.

## 2. Tanım ve mekanizma
`field?: T` property'nin bulunmayabileceğini; `field: T | null` property'nin gerekli olduğunu ama null taşıyabileceğini ifade eder. `undefined` mevcut olmayan/uninitialized değerle sık görülür; `null` bilinçli boş değerdir.

## 3. Açıklamalı kod ve çıktı
```ts
type Product = {
  name: string;
  price?: number;
  middleName: string | null;
};
const p: Product = { name: "Elma", middleName: null };
console.log(p.price);      // undefined
console.log(p.middleName); // null
if (p.price !== undefined) {
  console.log(p.price * 2);
}
```

## 4. Execution ve veri akışı
`price` değeri object'te bulunmaz; property okununca undefined gelir. `middleName` property olarak vardır ama null taşır. `if` daraltması price yokken hesaplamayı engeller.

## 5. TypeScript compile-time ile runtime ayrımı
`price` okunduğunda `number | undefined` olasılığı dikkate alınır. `middleName: string | null` property'yi atlamaya izin vermez. Optional property ile `T | undefined` her compiler seçeneğinde aynı **yazma** semantiği demek değildir; burada okuma davranışına odaklanılır.

## 6. Sınır davranışları ve kritik farklar
`0` falsy olabilir fakat geçerli fiyat değeridir. `price || 10` sıfırı değiştirir; `price ?? 10` yalnız nullish değerlerde fallback yapar. Ayrıntılı mekanizma [08 nullish](../08-value-and-decision-mechanics/05-nullish-coalescing.md).

## 7. Yaygın yanlış kullanım / debugging
Yanlış fallback ile gerçek eksik veri durumunu ayır. Önce `price` undefined mı null mı 0 mı? Her durumun beklenen sözleşmesini ayrı belirt.

## 8. Gerçek kullanım
Uygulamanın model bekleyen iç fonksiyonları ve dışarıdan veri alan sınır fonksiyonları aynı güven seviyesinde değildir. Compile-time shape bilgisi faydalıdır fakat runtime'daki gerçek değeri anlamak için kontrol gerekir.

## 9. Interview preparation
*What is the difference between an optional property and a nullable property?* Optional may be absent; nullable can be present with null, depending on its declared type.

## 10. Bağımsız pekiştirme
`{name:'Elma',middleName:null}` geçerli mi? `{name:'Elma'}` neden farklı? `price:0` ile `price:undefined` için ne gözlersin?

**Kaynak:** [I2](../../../I2-control-flow-functions-data-modeling.md) ve [I3](../../../I3-safe-types-runtime-boundaries.md). Eğitim içeriği bağımsız öğrenci uygulama/H0 kanıtı değildir.
