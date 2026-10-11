# Ders 6 — Ternary Operator: ? :

> **İzlek:** [JavaScript öğrenme sırası](../README.md) · [Bölüm 1 özeti](./README.md)  
> **Durum:** Teorik referans; repo uygulaması ve test kanıtı ayrıca değerlendirilecek.

## Öğrenme hedefi

İki olası sonuç arasında tek bir expression ile değer seçmek ve karmaşık koşullarda okunabilirliği korumak.

Önkoşul: [Önceki ders](./05-nullish-coalescing.md).

## Temel model

`condition ? ifTruthy : ifFalsy`, koşulu değerlendirir ve yalnız seçilen dalın değerini üretir. `if/else` kontrol statement'ıdır; ternary ise değer üreten expression'dır.

## Açıklamalı örnekler

### Örnek 1 — Değer seçmek

```ts
const age = 16;
const category = age >= 18 ? "Adult" : "Minor";
console.log(category); // "Minor"
```

Bu örnekte iki açık sonuçtan biri seçiliyor.

### Örnek 2 — Fonksiyondan döndürmek

```ts
function getStatus(active: boolean): string {
  return active ? "Active" : "Inactive";
}
```

`return active ? true : false` yerine doğrudan `return active` yeterlidir.

### Örnek 3 — Yalnız seçilen dal

```ts
function success() { console.log("A"); return 1; }
function failure() { console.log("B"); return 2; }
const ok = true;
console.log(ok ? success() : failure()); // A, ardından 1
```

Seçilmeyen fonksiyon çağrısı değerlendirilmez.

## Yaygın hata / debugging kontrolü

- Ternary ile yanlış branch'e yanlış iş kuralı bağlamak.
- Farklı branch tiplerinin `string | number` gibi union oluşturabileceğini unutmak.
- İç içe ternary yığmak; fazla karar varsa açık `if/else` daha anlaşılırdır.

## Kendi kendine kontrol

1. `false ? 1 : 2` sonucu nedir?
2. `if (isBlocked) return 'Denied'; return 'Granted';` davranışını ternary ile ifade et.

**Kanıt ayrımı:** Bu sayfadaki örnek kodlar öğretim amaçlıdır. Bir derste doğru cevap vermek, bağımsız uygulama, typecheck, test ve debugging yeterliliğini tek başına kanıtlamaz.
