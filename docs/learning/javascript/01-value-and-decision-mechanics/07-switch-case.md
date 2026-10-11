# Ders 7 — Switch / Case

> **İzlek:** [JavaScript öğrenme sırası](../README.md) · [Bölüm 1 özeti](./README.md)  
> **Durum:** Teorik referans; repo uygulaması ve test kanıtı ayrıca değerlendirilecek.

## Öğrenme hedefi

Bir ifadenin farklı değerlerini yönetmek, `break`/`return` ayrımını ve fall-through riskini anlamak.

Önkoşul: [Önceki ders](./06-ternary.md).

## Temel model

`switch (expression)` case değerlerini strict equality yaklaşımıyla eşleştirir. Eşleşen case'ten itibaren kod yürütülür; `break` switch'ten çıkar, `return` fonksiyondan çıkar. Çıkış yoksa fall-through oluşabilir.

## Açıklamalı örnekler

### Örnek 1 — Durum mesajları

```ts
function paymentText(status: string): string {
  switch (status) {
    case "pending": return "Payment pending";
    case "paid": return "Payment completed";
    case "failed": return "Payment failed";
    default: return "Unknown payment status";
  }
}
console.log(paymentText("failed")); // "Payment failed"
```

`return` fonksiyonu bitirdiği için ayrıca `break` gerekmez.

### Örnek 2 — Fall-through

```ts
const role: string = "admin";
switch (role) {
  case "admin": console.log("A");
  case "user": console.log("B"); break;
  default: console.log("C");
}
// A ve B yazılır
```

`case` eşleşmesinden sonra sonraki case koşulları yeniden doğrulanmaz.

### Örnek 3 — Bilinçli ortak davranış

```ts
function phase(status: string): string {
  switch (status) {
    case "pending":
    case "processing": return "In progress";
    default: return "Other";
  }
}
```

Arka arkaya iki case aynı kodu paylaşabilir.

## Yaygın hata / debugging kontrolü

- `case 'failed'` sonrasına `:` koymayı unutmak syntax hatasıdır.
- `break` eksikliğiyle birden fazla case'i yanlışlıkla yürütmek.
- `break` ile `return` arasındaki kapsam farkını karıştırmak.
- `switch`'in `"200"` ve `200` değerlerini eşit kabul edeceğini düşünmek.

## Kendi kendine kontrol

1. `switch` içinde `break` sonrası fonksiyon devam eder mi?
2. Bir ödeme durumunu `pending`, `paid`, `failed`, diğerleri olarak modelleyen fonksiyon yaz.

**Kanıt ayrımı:** Bu sayfadaki örnek kodlar öğretim amaçlıdır. Bir derste doğru cevap vermek, bağımsız uygulama, typecheck, test ve debugging yeterliliğini tek başına kanıtlamaz.
