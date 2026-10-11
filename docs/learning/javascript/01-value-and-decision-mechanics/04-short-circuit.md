# Ders 4 — Short-Circuit Evaluation

> **İzlek:** [JavaScript öğrenme sırası](../README.md) · [Bölüm 1 özeti](./README.md)  
> **Durum:** Teorik referans; repo uygulaması ve test kanıtı ayrıca değerlendirilecek.

## Öğrenme hedefi

Mantıksal operatörlerin değerlendirme sırasını, çalıştırılmayan ifadeleri ve operand döndürme davranışını görmek.

Önkoşul: [Önceki ders](./03-logical-operators.md).

## Temel model

`&&` soldaki ilk falsy operand'ı, yoksa son operand'ı döndürür. `||` soldaki ilk truthy operand'ı, yoksa son operand'ı döndürür. `&&` sol falsy, `||` sol truthy olduğunda sağ taraf hiç değerlendirilmez.

## Açıklamalı örnekler

### Örnek 1 — Fonksiyon gerçekten çağrılır mı?

```ts
function verify(): boolean {
  console.log("verify called");
  return true;
}
const active = false;
console.log(active && verify()); // yalnız false
```

Fonksiyon ifadenin içinde yer alıyor diye çağrılmak zorunda değildir.

### Örnek 2 — Boolean olmayan sonuçlar

```ts
console.log(0 && "Next");  // 0
console.log(5 && "Next");  // "Next"
console.log(0 || 10);      // 10
console.log(5 || 10);      // 5
```

Sonuçların boolean olması şart değildir; operand'ın değeri döner.

### Örnek 3 — Riskli fallback

```ts
function pageSize(requested: number): number {
  return requested || 20;
}
console.log(pageSize(0)); // 20
```

`0` geçerliyse bu yaklaşım yanlıştır; sonraki derste `??` ile düzelt.

## Yaygın hata / debugging kontrolü

- Sağ taraftaki fonksiyonun her koşulda çalışacağını varsaymak.
- `&&` ve `||` sonuçlarının mutlaka `true`/`false` olduğunu sanmak.
- Değişkenin önceden hesaplanması ile ifadede operand'ın değerlendirilmesini aynı şey sanmak.

## Kendi kendine kontrol

1. `false && verify()` konsola hangi mesajları yazdırır?
2. `"Hi" || expensive()` ifadesinde `expensive` çağrılır mı?

**Kanıt ayrımı:** Bu sayfadaki örnek kodlar öğretim amaçlıdır. Bir derste doğru cevap vermek, bağımsız uygulama, typecheck, test ve debugging yeterliliğini tek başına kanıtlamaz.
