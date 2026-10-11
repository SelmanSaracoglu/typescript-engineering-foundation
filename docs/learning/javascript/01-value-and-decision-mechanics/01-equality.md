# Ders 1 — Equality: ===, !==, ==, !=

> **İzlek:** [JavaScript öğrenme sırası](../README.md) · [Bölüm 1 özeti](./README.md)  
> **Durum:** Teorik referans; repo uygulaması ve test kanıtı ayrıca değerlendirilecek.

## Öğrenme hedefi

Primitive değerlerde tip dönüşümü olmadan eşitlik kontrolü yapmak; object referans eşitliğini içerik eşitliğinden ayırmak.

Önkoşul: JavaScript primitive değerleri ve temel değişkenler.

## Temel model

`===` ve `!==` katı karşılaştırma yapar. Farklı primitive tipler, otomatik dönüştürülerek eşit sayılmaz. `==` ve `!=` ise belirli kurallarla coercion uygulayabilir. Object'lerde iki ayrı nesne aynı alanları taşısa da `===` sonucu `false` olur.

## Açıklamalı örnekler

### Örnek 1 — Primitive ve unknown

```ts
const receivedId: unknown = "15";
const storedId = 15;
console.log(receivedId === storedId); // false
console.log(receivedId == storedId);  // true
console.log(receivedId !== storedId); // true
```

`unknown`, dışarıdan gelen değerin tipinin doğrulanmadığını gösterir. `==` sonucuna güvenerek ID tiplerini karıştırma.

### Örnek 2 — Reference identity

```ts
const a = { id: 15 };
const b = { id: 15 };
const same = a;
console.log(a === b);    // false
console.log(a === same); // true
```

`===` object property'lerini derinlemesine karşılaştırmaz.

### Örnek 3 — İş kuralı

```ts
function isSameRecord(receivedId: unknown, storedId: number): boolean {
  return receivedId === storedId;
}
console.log(isSameRecord(15, 15));   // true
console.log(isSameRecord("15", 15)); // false
```

Fonksiyon adı tanım ve çağrı sırasında birebir aynı olmalıdır.

## Yaygın hata / debugging kontrolü

- `==` kullanarak beklenmedik coercion'a güvenmek; örn. `0 == false` sonucu `true`dur.
- Görünüşte aynı iki object'in `===` ile eşit olacağını düşünmek.
- TypeScript'in doğrudan farklı sabit tipleri karşılaştırırken TS2367 bildirebileceğini unutmamak.

## Kendi kendine kontrol

1. `null === undefined` ile `null == undefined` sonuçları nedir?
2. Bir kayıt numarası string olarak gelirse açık dönüştürme mi, reddetme mi gerekir? Yanıtı iş kuralıyla gerekçelendir.

**Kanıt ayrımı:** Bu sayfadaki örnek kodlar öğretim amaçlıdır. Bir derste doğru cevap vermek, bağımsız uygulama, typecheck, test ve debugging yeterliliğini tek başına kanıtlamaz.
