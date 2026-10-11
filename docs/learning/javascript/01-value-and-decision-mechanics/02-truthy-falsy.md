# Ders 2 — Truthy / Falsy

> **İzlek:** [JavaScript öğrenme sırası](../README.md) · [Bölüm 1 özeti](./README.md)  
> **Durum:** Teorik referans; repo uygulaması ve test kanıtı ayrıca değerlendirilecek.

## Öğrenme hedefi

Boolean bağlamında değerlerin yorumunu anlamak ve veri geçerliliği ile truthiness'i birbirine karıştırmamak.

Önkoşul: [Önceki ders](./01-equality.md).

## Temel model

Koşul içindeki değer boolean bağlamında yorumlanır; orijinal değişkenin tipi değişmez. Temel falsy değerler: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Boş array `[]` ve boş object `{}` truthy'dir.

## Açıklamalı örnekler

### Örnek 1 — String ile number aynı davranmaz

```ts
console.log(Boolean("0"));     // true
console.log(Boolean(0));       // false
console.log(Boolean("false")); // true
console.log(Boolean(" "));     // true
```

String içeriğinin 'false' yazması boolean false olduğu anlamına gelmez; boşluk da karakterdir.

### Örnek 2 — Boş array

```ts
const items: string[] = [];
console.log(Boolean(items));    // true
console.log(items.length > 0);  // false
```

Eleman var mı sorusu için `length > 0` kontrolünü kullan.

### Örnek 3 — Geçerli sıfır

```ts
function stockText(stock: number | undefined): string {
  if (stock !== undefined) return `Stock: ${stock}`;
  return "Stock unavailable";
}
console.log(stockText(0)); // "Stock: 0"
```

`if (stock)` hatalı iş kuralı doğurabilir: `0` eksik veri değildir.

## Yaygın hata / debugging kontrolü

- `Boolean([])` ve `Boolean({})` sonuçlarını `false` sanmak.
- `"   "` gibi boşluk içeren string'i boş sanmak; gerekirse `.trim().length` kontrol et.
- Falsy değer ile geçersiz/hatalı veriyi eşitlemek.

## Kendi kendine kontrol

1. `Boolean('false')`, `Boolean([])` ve `Boolean('')` değerlerini belirle.
2. Kullanıcı boş string girebiliyorsa `if (nickname)` kullanmak hangi davranışı kaybettirir?

**Kanıt ayrımı:** Bu sayfadaki örnek kodlar öğretim amaçlıdır. Bir derste doğru cevap vermek, bağımsız uygulama, typecheck, test ve debugging yeterliliğini tek başına kanıtlamaz.
