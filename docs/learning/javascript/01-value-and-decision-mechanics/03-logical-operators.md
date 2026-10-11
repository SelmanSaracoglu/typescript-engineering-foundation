# Ders 3 — Logical Operators: &&, ||, !

> **İzlek:** [JavaScript öğrenme sırası](../README.md) · [Bölüm 1 özeti](./README.md)  
> **Durum:** Teorik referans; repo uygulaması ve test kanıtı ayrıca değerlendirilecek.

## Öğrenme hedefi

Birden fazla koşulu gereksinime uygun biçimde birleştirmek ve operatör önceliğini okumak.

Önkoşul: [Önceki ders](./02-truthy-falsy.md).

## Temel model

`&&` her iki boolean koşulun sağlanmasını; `||` en az birinin sağlanmasını ifade eder. `!` truthiness sonucunu tersine çevirip boolean üretir. Öncelik: `!` sonra `&&`, sonra `||`. Açıklık için parantez kullan.

## Açıklamalı örnekler

### Örnek 1 — Yetki ve engel durumu

```ts
const isAdmin = true;
const isOwner = false;
const isBlocked = true;
const canEdit = (isAdmin || isOwner) && !isBlocked;
console.log(canEdit); // false
```

Engellenmiş yöneticiye de izin verilmemesi için parantez önemlidir.

### Örnek 2 — Yanlış gruplama

```ts
const wrong = isAdmin || isOwner && !isBlocked;
console.log(wrong); // true
```

Bu ifade `isAdmin || (isOwner && !isBlocked)` olarak gruplanır; iş kuralı değişir.

### Örnek 3 — Aralık kontrolü

```ts
function validAge(age: number): boolean {
  return age >= 18 && age <= 65;
}
```

`||` kullanmak neredeyse her sonlu sayıyı kabul eder. Aralık için iki koşul da gerekli.

## Yaygın hata / debugging kontrolü

- `status === 'draft' || 'pending'` doğru bir ikili eşitlik değildir; ikinci operand truthy string olur.
- `&&` ile `||` yanlış seçilirse beklenen test sonuçları kodla uyuşmaz.
- `!` operatörü bir boolean üretir ama `&&` ve `||` her zaman boolean döndürmez; sonraki derse bak.

## Kendi kendine kontrol

1. `true || false && false` sonucu nedir?
2. Yalnızca kayıt sahibi veya admin olan ve engellenmemiş kullanıcılar için koşul yaz.

**Kanıt ayrımı:** Bu sayfadaki örnek kodlar öğretim amaçlıdır. Bir derste doğru cevap vermek, bağımsız uygulama, typecheck, test ve debugging yeterliliğini tek başına kanıtlamaz.
