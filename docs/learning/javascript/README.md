# JavaScript / TypeScript — Modüler Öğrenme Dizini

Bu dizin Increment teslimatlarına göre değil, **kavramsal önkoşul ve öğrenme sırasına** göre düzenlenmiştir. Her konu ayrı Markdown dersidir; bölüm `README.md` dosyaları kavramları birikimli örneklerle birbirine bağlar.

## Öğrenme rotası

1. [Bölüm 1 — Value & Decision Mechanics](./01-value-and-decision-mechanics/README.md) — Ders 1–7: equality, truthy/falsy, logical operators, short-circuit, nullish coalescing, ternary, switch.
2. [Bölüm 2 — Modern Object & Array Syntax](./02-modern-object-array-syntax/README.md) — Ders 8–13: destructuring, spread, rest, optional chaining, template literals.
3. [Bölüm 3 — JSON Boundary](./03-json-boundary/README.md) — Ders 14–17: JSON basics, `JSON.stringify`, `JSON.parse`, runtime validation ve controlled result.

## Dokümanlardan nasıl yararlanılır?

- **İlk kez öğreniyorsan:** Dersleri sırayla oku. Kodun çıktısını açıklamadan önce kendin tahmin et; yalnızca sonucu değil *nedenini* söyle.
- **Tekrar yapıyorsan:** Kavramın çalışma mekanizmasını, sınır davranışlarını, yanlış kullanım örneklerini ve debugging adımlarını incele.
- **Mülakata hazırlanıyorsan:** Her dosyanın **Mülakat hazırlığı** bölümündeki İngilizce soruya önce kendin cevap ver, ardından örnek cevabı Türkçe açıklamasıyla karşılaştır.
- **Pratiğe geçiyorsan:** Öğretim örneğini gerçek repo kodundan ayır. Yeni bir görev geliştir, TypeScript typecheck/Vitest ile doğrula ve debugging sürecini kaydet.

## Belge kalitesi ve revizyon durumu

**Bölüm 1 ve Bölüm 3**, yeni başlayanların kavramı geri dönüp yeniden öğrenebilmesine yönelik kapsamlı teknik ders kaynakları olarak düzenlendi: neden gerekli → tanım → mekanizma → açıklamalı kod → kritik ayrımlar → hata/debugging → mülakat → pekiştirme.

**Bölüm 2** hâlen önceki kısa sürümüdür. Aynı pedagojik seviyeye getirilmesi için ayrıca revizyon gerektirir; dizinde bulunması bütün bölümlerin içerik kalitesinin eşit olduğu anlamına gelmez.

## Tarihsel çalışma ve kanıt

Mevcut `docs/I1-*`, `docs/I2-*` ve `docs/I3-*` belgeleri geçmiş Increment çalışma/kanıt dokümantasyonu olarak korunmuştur. Genel dokümantasyon refactor'u ayrı bir Increment'te ele alınacaktır.

- Teorik öğrenme ve örnekleri anlama, bağımsız programlama yeterliliği anlamına gelmez.
- I4 için gerçek repo uygulaması, `typecheck`, Vitest, debugging ve bağımsız transfer gözlemi ayrıca yapılmalıdır.
- Yardım seviyesi H0–H4, yalnızca gerçek uygulama davranışına göre kaydedilir.
