# SDLC, Test-first Approaches, DevOps & Maintenance Testing

**Amaç:** Test faaliyetlerini geliştirme yaşam döngüsünün içine doğru yerleştirmek; değişiklik sonrası test ihtiyacını belirlemek.  
**ISTQB CTFL v4.0.1:** FL-2.1.1 (K2), FL-2.1.2 (K1), FL-2.1.3 (K1), FL-2.1.4–2.1.6 (K2), FL-2.3.1 (K2). Bölüm 2.2 için [test seviyeleri](01-unit-component-integration-api-e2e.md).

## 1. Technical Foundation

### SDLC test faaliyetlerinin zamanını değiştirir

**Software Development Lifecycle (SDLC)**; analizin, tasarımın, kodlamanın, testin ve teslimin nasıl organize edildiğini açıklar. Model seçimi testin ne zaman başladığını, belgelerin ayrıntısını, gereken otomasyon hızını ve geri bildirim sıklığını etkiler.

| Yaklaşım | Test için tipik sonuç | Yanlış varsayım |
|---|---|---|
| **Sequential / Waterfall** | Gereksinim, tasarım ve kod review'ları erken; dinamik test seviyeleri sonraki aşamalarda belirginleşebilir | “Tester en son dahil olur” |
| **V-Model** | Geliştirme ürünleri ile bunlara karşılık gelen test faaliyetlerinin eşleşmesi görünürdür | “Test tasarımı ancak kod bitince başlar” |
| **Iterative / Incremental** | Her iterasyonda küçük değişiklik için test, geri bildirim ve regression gerekir | “Her sprint yalnız yeni özellik test edilir” |
| **Agile** | İş birliği, değişebilen kabul kriterleri, hızlı geri bildirim ve sürekli test tasarımı | “Agile'da dokümantasyon veya sistematik test olmaz” |

**Her SDLC'de iyi uygulamalar:** Her geliştirme faaliyetinin kalite değerlendirmesi olmalı; farklı test seviyelerinin amaçları net olmalı; test analysis/design ilgili iş ürünü oluşurken başlamalı; tester gereksinim ve tasarımın erken taslaklarını incelemeli. Bu ilkeler tek bir süreç modeline özel değildir.

### Test-first: TDD, ATDD, BDD

- **TDD — Test-driven Development:** Önce küçük kod testini yaz, başarısızlığını gözle, minimum implementasyonu yap, davranışı koruyarak refactor et (**red → green → refactor**).
- **ATDD — Acceptance Test-driven Development:** İş paydaşı/developer/tester, koddan önce kabul senaryolarında uzlaşır; geliştirme bu somut iş örnekleriyle yönlendirilir. Ayrıntı [I1 ATDD](../02-test-design-techniques/07-collaboration-user-stories-and-atdd.md).
- **BDD — Behavior-driven Development:** Sistemin beklenen davranışını paydaşlarla ortak dilde tarif eder; Given/When/Then gibi örnekler kullanılabilir. BDD ile Cucumber aynı şey değildir.

Bu üç yaklaşım erken test tanımlamasını paylaşır fakat test nesnesi, iş birliği odağı ve ifade biçimleri farklıdır. **TDD tek başına acceptance doğruluğunu garanti etmez; ATDD de bütün unit koşullarını test etmez.**

### DevOps ve continuous testing

DevOps geliştirme ve operasyon arasındaki sorumluluk/geri bildirim akışını iyileştirir. CI'da otomatik kontrol, build/dependency tekrarlanabilirliği, ortam görünürlüğü, hızlı failure triage ve production telemetry önemli hale gelir. **CI green = production'a sıfır risk** değildir. Test ortamının temsil gücü ve gözlemlenemeyen bağımlılıklar açık kalır.

**Shift-left**, testin ve kalite kontrolünün daha erken çalıştırılmasıdır: user story review, statik analiz, API contract tartışması, erken component testleri, gerektiğinde erkene çekilmiş non-functional kontrol. Bu, bütün geç aşama testlerin kaldırılması anlamına gelmez; erken aşamada ek efor isteyebilir.

**Retrospective:** “Ne işe yaradı? Ne sorun yarattı? Hangi ölçülebilir iyileştirmeyi kim uygulayacak?” sorularına cevap arar. Örnek aksiyon: “Son üç iterasyonda fixture çakışmalarından 9 false failure oldu → izolasyon kurulacak → iki iterasyon sonra tekrar ölçülecek.” Sadece toplantı yapmak iyileştirme değildir.

### Maintenance testing: düzeltme, değişim, ortam

Mevcut ürünün **değiştirilmesi**, **ortamının değişmesi** veya **kullanımdan kaldırılması** maintenance testing tetikleyebilir. Örnekler: bug fix, yeni özellik, OS/runtime upgrade, veritabanı migration, API sağlayıcı değişimi, sistemin emekliye ayrılması ve veri taşıma.

**Impact analysis:** Neler değişti, hangi arayüzler/veriler/yan etkiler etkilendi, eski testlerin oracle'ı hâlâ geçerli mi? Testi yalnız değişen dosyaya sınırlamak her zaman yeterli değildir; integration ve tüketici etkisi de incelenir.

## 2. Engineering Perspective

**Örnek sürüm:** Sipariş servisinde para formatı değişti.

1. Tasarım sırasında currency precision kararını review et (shift-left).
2. Küçük hesaplama testlerini güncelle (component).
3. Ödeme-servis sözleşmesini doğrula (integration).
4. Gerçekçi checkout'u riskine göre değerlendir (system/acceptance).
5. CI failure ve kullanıcı etkisini izle; regression suite'in kapsamını gerekçelendir.

SDLC seçimi test **amacını** değiştirmez, feedback döngüsünün hızını ve hangi kanıtın nerede toplandığını değiştirir. “Tüm senaryolar E2E” yaklaşımı yerine hızlı lokal kontroller ve az sayıda kritik bütünleşik akış daha teşhis edilebilirdir.

## 3. Practical Scenario — iki sürümlü özellik

Sprint 1: Aktif üyeye ≥100 € sepet ücretsiz kargo. Sprint 2: Express kargo istisnası eklendi.

- **Sprint 1:** Story review ile 100 € sınırını kesinleştir, ATDD örnekleri oluştur, component hesaplama ve acceptance akışını doğrula.
- **Sprint 2:** Eski kabul örneklerinin hangilerinin hâlâ geçerli olduğunu **impact analysis** ile belirle; express yeni karar sütunları oluşturur.
- **Release:** Yeni express akışında confirmation/new-feature tests + eski standart-kargo akışında regression; deployment sonrası monitoring.

**Açık soru:** “Express surcharge tax öncesi mi sonrası mı hesaplanır?” Bu belirlenmeden yeni oracle üretme.

## 4. Interview Preparation

**Q1 (Foundation): How does testing differ between Waterfall and Agile?**  
**A:** “The feedback timing and organization differ. Sequential models often make levels more phase-oriented, while Agile brings testing into each increment with frequent regression. Early reviews and test design are valuable in both.”

**Q2 (Mid): What does shift-left mean?**  
**A:** “It means performing appropriate quality activities earlier, such as requirement reviews and component checks. It does not eliminate the need for realistic later testing.”

**Q3 (Advanced): What would trigger maintenance testing besides a bug fix?**  
**A:** “Environment upgrades, migrations, integrations, new functionality and retirement can all change risk. I start with impact analysis and then select confirmation and regression checks.”

## 5. CTFL Practice — özgün

**S1 (K2):** Ekip user story taslağını developer kod yazmadan inceliyor. Bu en doğrudan hangi yaklaşımdır?  
A) Shift-left · B) Sadece regression · C) Production-only validation · D) Test completion  
**Yanıt: A.** Kalite kontrolü erkene taşınmıştır; diğerleri olayın açıklaması değildir.

**S2 (K1):** Hangisi test-first yaklaşım ailesindendir?  
A) TDD, ATDD, BDD · B) Smoke, sanity, regression · C) Alpha, beta, load · D) Monitoring, reporting, escalation  
**Yanıt: A.** Diğer seçenekler test suite amacı, tipi veya yönetim faaliyetidir.

**S3 (K2):** Uygulama kodu değişmedi, ancak DB motoru yükseltildi. Ne yapılmalı?  
A) Hiç test yok · B) Impact analysis ve ilgili maintenance tests · C) Sadece screenshot · D) Ürün testlerini tümüyle silmek  
**Yanıt: B.** Çalışma ortamı değişimi ürün davranışını etkileyebilir.

## İlişkili bölümler ve kaynak

- [Test levels](01-unit-component-integration-api-e2e.md) · [Regression & maintenance](04-regression-smoke-sanity-and-exploration.md) · [Static review](06-static-testing-and-reviews.md).
- [ISTQB CTFL v4.0.1 — §§2.1 ve 2.3](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).

**Sınır:** Buradaki örnekler eğitim amaçlıdır; gerçek bir CI/CD sistemi kurulmadı.
