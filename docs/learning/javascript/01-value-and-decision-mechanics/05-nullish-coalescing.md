# Ders 5 — Nullish Coalescing: ??

> **İzlek:** [JavaScript öğrenme sırası](../README.md) · [Bölüm 1 özeti](./README.md)  
> **Durum:** Teorik referans; repo uygulaması ve test kanıtı ayrıca değerlendirilecek.

## Öğrenme hedefi

Eksik değer ile geçerli falsy değeri ayırarak doğru default seçimini yapmak.

Önkoşul: [Önceki ders](./04-short-circuit.md).

## Temel model

`a ?? b`, yalnızca `a` değeri `null` veya `undefined` olduğunda `b` değerini değerlendirir. `0`, `false` ve `""` korunur. `a || b` ise bütün falsy değerlerde fallback yapar.

## Açıklamalı örnekler

### Örnek 1 — Üç geçerli tercih

```ts
const limit: number | null = 0;
const notifications: boolean | undefined = false;
const nickname: string | undefined = "";
console.log(limit ?? 10);              // 0
console.log(notifications ?? true);    // false
console.log(nickname ?? "Guest");      // ""
```

`||` kullanımı üç değeri de yanlışlıkla değiştirebilir.

### Örnek 2 — Yan yana davranış

```ts
console.log(0 || 3);          // 3
console.log(0 ?? 3);          // 0
console.log(null ?? 3);       // 3
console.log(undefined ?? 3);  // 3
```

Fallback ihtiyacını iş kuralından çıkar: falsy mi, yoksa gerçekten eksik mi?

### Örnek 3 — Short-circuit

```ts
function defaultRetries() {
  console.log("fallback computed");
  return 3;
}
console.log(0 ?? defaultRetries()); // yalnız 0
```

Sol operand nullish değilse fallback fonksiyonu çalışmaz.

## Yaygın hata / debugging kontrolü

- `??` doğrulama değildir; `-5` veya `NaN` gibi değerler korunur.
- `??` ile `&&`/`||` doğrudan karıştırılamaz: `(a ?? b) || c` gibi parantez gerekir.
- Destructuring `= default`, `??` ile tamamen aynı değildir: destructuring yalnız `undefined` için default kullanır.

## Kendi kendine kontrol

1. `false ?? true` ve `false || true` sonuçlarını karşılaştır.
2. `0` geçerli tekrar sayısıysa `return retries || 3` satırını düzelt.

**Kanıt ayrımı:** Bu sayfadaki örnek kodlar öğretim amaçlıdır. Bir derste doğru cevap vermek, bağımsız uygulama, typecheck, test ve debugging yeterliliğini tek başına kanıtlamaz.
