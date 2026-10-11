# Gereksinimden Beklenen Sonuca ve Boundary Testine

**Önkoşul:** [Bölüm girişi](./README.md). Bu bölümdeki kavramlar önceki eğitim içeriğinin yeniden düzenlenmesidir; yeni framework veya ileri type/module kapsamı değildir.

## 1. Neden gerekiyor?
Typecheck'in başarılı olması veya tek normal girdinin doğru sonuç vermesi iş kuralının sınırda doğru olduğunu kanıtlamaz.

## 2. Kavram ve sözleşme
**Expected result**, implementasyondan kopyalanmamalı, gereksinimden üretilmelidir. 20 indirim için 20 exact boundary, 19 sınır altı, 100 normal örnektir. `discount(20,true)=0` testi negatif sonucu engelleme kontrolünü **tek başına** kanıtlamaz, çünkü koruma olmasa da 20-20=0'dır. `19` girdisi korumasız durumda -1 üretirdi; `0` beklentisi anlamlı negatif testtir.

## 3. Açıklamalı örnek
```ts
// Kural: indirim uygulanırsa 20 çıkar; sonuç negatif olamaz.
function discount(price: number, enabled: boolean): number {
  if (!enabled) return price;
  return Math.max(0, price - 20);
}
console.log(discount(100, true)); // 80
console.log(discount(20, true));  // 0
console.log(discount(19, true));  // 0
```

## 4. Davranış / sınır tablosu
| Girdi | Discount | Beklenen | Neyi denetler? |
| ---: | --- | ---: | --- |
| 100 | true | 80 | Normal indirim |
| 20 | true | 0 | Exact boundary |
| 19 | true | 0 | Negatif koruma |
| 15 | false | 15 | Disabled branch |

## 5. Hata araştırma ve doğrulama
Sadece happy-path test varsa `return price - 20` yanlış implementasyonu 100 değerinde geçer. 19 testi yanlış davranışı gösterir. Değişiklik öncesi expected tablosu yaz, sonra kod/test çalıştır; başarı durumunu senaryoya göre gerekçelendir.

## 6. Öğretici pratik
**Önce çalıştırmadan tahmin et:** Neden `20 -> 0` testi negatif fiyat korumasını tek başına doğrulamaz? 21 için sonuç ve hangi riskin test edildiğini açıkla.

## 7. Kariyer aktarımı
Bu mekanizma uygulama kodu, test otomasyonu ve güvenli veri işleme çalışmalarında aynı temel prensibi korur: beklenen davranış, gerçek runtime değer ve doğrulama kanıtını ayrı tutmak.

## 8. Interview preparation
**Question:** What evidence would distinguish a working example from a verified requirement?  
**Answer:** A requirement-derived expected outcome, appropriate boundary or negative test, and observed behavior after execution.

## 9. Kaynak ve kanıt ayrımı
[İlk çalışma belgesi](../../../I1-execution-model.md) tarihsel bağlamı korur. Buradaki örnek H0 bağımsızlık/competency kanıtı değildir.
