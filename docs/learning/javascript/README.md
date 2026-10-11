# JavaScript / TypeScript — Modüler Öğrenme Dizini

Bu dizin Increment teslimatlarına göre değil, **kavramsal önkoşul ve öğrenme sırasına** göre düzenlenmiştir. Her ders ayrı Markdown belgesidir; bölüm `README.md` dosyaları kavramları birbirine bağlar.

## Öğrenme rotası

1. [Bölüm 1 — Value & Decision Mechanics](./01-value-and-decision-mechanics/README.md) — Ders 1–7: equality, truthy/falsy, logical operators, short-circuit, nullish coalescing, ternary, switch.
2. [Bölüm 2 — Modern Object & Array Syntax](./02-modern-object-array-syntax/README.md) — Ders 8–13: destructuring, spread, rest, optional chaining, template literals.
3. [Bölüm 3 — JSON Boundary](./03-json-boundary/README.md) — Ders 14–17: JSON basics, `JSON.stringify`, `JSON.parse`, runtime validation ve controlled result.

## Dokümanlardan nasıl yararlanılır?

- **İlk kez öğreniyorsan:** Dersleri sırayla oku, örneklerin çıktısını önce kendin tahmin et, gerekçesini açıklamayı dene.
- **Tekrar yapıyorsan:** Kavram, mekanizma, kritik ayrımlar ve debugging bölümlerine dön.
- **Mülakata hazırlanıyorsan:** Mülakat sorularını önce kendi cümlelerinle yanıtla; örnek cevabı sonra karşılaştır.
- **Uygulamaya geçiyorsan:** Derslerdeki teorik bilgiyi gerçek repo kodu, testler, typecheck ve debugging ile ayrıca doğrula.

## Belge kalitesi ve revizyon durumu

**Bölüm 3**, kavram tanımı → neden gerekli → adım adım mekanizma → kod ve sınır durumları → hata/debugging → mülakat → pekiştirme düzeninde ayrıntılı öğretim notları olarak hazırlandı.

**Bölüm 1 ve 2 belgeleri**, önceki kısa sürümleridir; aynı derinlik standardına ulaşmaları için ayrıca revizyon gerektirir. Bu dizinde bulunmaları, pedagojik kalitelerinin Bölüm 3 ile aynı olduğu anlamına gelmez.

## Tarihsel çalışma ve kanıt

Mevcut `docs/I1-*`, `docs/I2-*` ve `docs/I3-*` belgeleri geçmiş Increment çalışma/kanıt dokümantasyonu olarak korunmuştur. Genel dokümantasyon refactor'u ayrı bir Increment'te ele alınacaktır.

- Teorik öğrenme ve örnekleri anlama, bağımsız programlama yeterliliği anlamına gelmez.
- I4 için gerçek repo uygulaması, `typecheck`, Vitest, debugging ve bağımsız transfer gözlemi ayrıca yapılmalıdır.
- Yardım seviyesi H0–H4, yalnızca gerçek uygulama davranışına göre kaydedilecektir.
