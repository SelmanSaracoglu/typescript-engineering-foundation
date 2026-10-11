# Conditions, Multiple Conditions ve Branch Seçimi

**Önkoşullar:** [Functions ve return](../03-functions-fundamentals/README.md), [Bölüm 04 giriş](./README.md).  [Sonraki](./02-for-of-iteration-over-arrays.md)

## 1. Neden bu derse ihtiyacımız var?
Tek bir sayısal kontrol kolay görünebilir; iki veya daha çok gereksinim aynı anda geçerli olduğunda hangi branch'in seçileceğini adım adım okumak gerekir.

## 2. Tanım ve mekanizma
Condition, boolean bağlamda değerlendirilen ifadedir. Multiple conditions `&&`, `||` gibi operatörlerle birleştirilir. `if`, `else if`, `else` zinciri ilk uygun dalı seçer; birden fazla bağımsız `if` farklı davranabilir.

## 3. Açıklamalı, çalıştırılabilir örnek
```ts
type Candidate = { active: boolean; score: number };
function decision(candidate: Candidate): string {
  if (!candidate.active) return "inactive";
  if (candidate.score >= 60) return "qualified";
  return "below-threshold";
}
console.log(decision({ active: false, score: 100 })); // inactive
console.log(decision({ active: true, score: 60 }));   // qualified
console.log(decision({ active: true, score: 59 }));   // below-threshold
```

## 4. Veri/çalıştırma akışı
1. `active=false` olan kayıt ilk dalda döner; skor 100 olsa da önem taşımaz. 2. Aktif, skor 60 olan kayıt ikinci dalda döner. 3. Aktif, skor 59 olan kayıt iki koşuldan da çıkmayıp sona ulaşır. Her return yalnız o çağrıyı sonlandırır.

## 5. Önceki konularla fark ve TypeScript bağlantısı
`candidate.active && candidate.score >= 60` koşulu qualified seçimini kısa yazabilir; fakat ayrı return'lar **hangi nedenle reddedildiğini** görünür kılar. Operatörün truthiness ve short-circuit mekanizması 08'de öğretilir.

## 6. Sınır durumları, hata ve test tasarımı
Sadece 80 puanlı aktif örnekle test yazmak `active=false` veya tam 60 sınırındaki hatayı yakalamaz. Test matrisi: `(false,100) → inactive`, `(true,59) → below`, `(true,60) → qualified`, `(true,90) → qualified`.

## 7. Mülakat ve pekiştirme
**Question:** How can a loop silently omit valid records? A misplaced early return may terminate the function before the remaining iterations.

Skor 59 ve active=false için hangi return çalışır? İkinci if ilkinden önce yazılsaydı ne bozulabilirdi?

## 8. Kanıt ve kaynak
Özgün I2 içerik kaynağı: [I2 Control Flow, Functions & Data Modeling](../../../I2-control-flow-functions-data-modeling.md). Bu ders yeni bir Increment uygulaması veya H0 yeterlilik gözlemi değildir.
