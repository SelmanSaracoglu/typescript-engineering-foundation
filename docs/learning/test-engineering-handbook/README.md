# Test Engineering Handbook

**Yazılım test etmeyi kavramlardan gerçek mühendislik kararlarına doğru öğrenmek için hazırlanmış Türkçe teknik kaynak.**

> **Okuma durumu — 13 Ekim 2026:** **I1, I2 ve I3 pedagojik biçimde hazırlandı; kullanıcı incelemesine açık.** I4–I6 henüz hazırlanmadı.

## Nereden başlamalı?

**[Ders 1 — Yazılım kalitesi, test etme ve güven](01-foundations/01-quality-testing-and-confidence.md)**

Bu kaynak hızlı tanım listesi değil. Her bölümde sırasıyla:

**Bir problem gör → kavramı anla → neden gerekli olduğunu sorgula → açıklamalı örneği takip et → karşı örneği incele → yeni küçük problemi kendin çöz.**

Bölümler birbirine bağlıdır. Tekniklerin adlarını öğrenmek hedef değil; **hangi iş kuralından, hangi risk nedeniyle, neden o testin seçildiğini anlatabilmek** hedeftir.

## I1 — Foundations & Test Design

### Birinci bölüm: Testçi nasıl düşünür?

Bu üç dersi sırayla oku; ikinci bölümde bütün teknikler bunların üstüne inşa ediliyor.

| Sıra | Ders | Burada öğreneceğin temel soru |
|---|---|---|
| 1 | [Quality, Testing & Confidence](01-foundations/01-quality-testing-and-confidence.md) | Bir testin geçmesi neyi **kanıtlar**, neyi kanıtlamaz? |
| 2 | [Verification, Validation & Risk](01-foundations/02-verification-validation-and-risk.md) | Bir yazılım şartnameye uyup kullanıcı için yine de başarısız olabilir mi? |
| 3 | [Requirements, Test Oracle & Evidence](01-foundations/03-requirements-expected-behavior-and-evidence.md) | **Doğru sonucu** nereden biliyoruz; hangi kanıt yeterli? |

### İkinci bölüm: Testleri nasıl tasarlarız?

| Sıra | Ders | Burada öğreneceğin temel soru |
|---|---|---|
| 4 | [Equivalence Partitioning](02-test-design-techniques/01-equivalence-partitioning.md) | Sınırsız girdiden anlamlı örnekleri nasıl seçeriz? |
| 5 | [Boundary Value Analysis](02-test-design-techniques/02-boundary-value-analysis.md) | Sınırdaki yanlış operatörü nasıl görünür yaparız? |
| 6 | [Decision Table Testing](02-test-design-techniques/03-decision-table-testing.md) | Birlikte çalışan koşulları nasıl sistematik test ederiz? |
| 7 | [State Transition Testing](02-test-design-techniques/04-state-transition-testing.md) | Aynı işlem neden farklı durumlarda farklı sonuç üretir? |
| 8 | [Scenario, Negative & Exploratory Testing](02-test-design-techniques/05-scenario-negative-exploratory-testing.md) | Yazılmamış ama gerçek riskleri nasıl araştırırız? |
| 9 | [White-box Testing](02-test-design-techniques/06-white-box-statement-and-branch-testing.md) | Kodun tüm satırlarını çalıştırmak yeterli midir? |
| 10 | [User Stories, Acceptance Criteria & ATDD](02-test-design-techniques/07-collaboration-user-stories-and-atdd.md) | Test edilebilir beklentiyi koddan **önce** nasıl netleştiririz? |

### Üçüncü adım: Birleştir, uygula, sonra sınava hazırlan

**[I1 Çalışma Atölyesi — Uygulama, İngilizce mülakat ve isteğe bağlı ISTQB tekrar](02-test-design-techniques/08-i1-practice-and-interview-companion.md)**

Bu ayrı dosyada:
- Bir senaryo üzerinden EP, BVA, decision table, state, negative ve risk düşüncesi bir arada;
- Daha önce görmediğin bir gereksinim için **çözümlü transfer görevi**;
- İngilizce, teknik mülakatlarda kullanılabilecek **10 örnek soru/cevap**;
- **12 özgün CTFL Foundation** tarzı soru ve gerekçeli cevap anahtarı bulunur.

**Ana dersleri bölüp her sayfayı CTFL ve mülakat etiketleriyle doldurmuyoruz.** Önce kavramı öğren, sonra istersen sınav/konuşma pratiğine geç.

## I1 için pedagojik rota: Her adım neden bu sırada?

~~~text
Quality & Confidence
        ↓
Verification / Validation / Risk
        ↓
Requirement → Test condition → Expected result → Evidence
        ↓
EP → BVA → Decision table → State transition
        ↓
Negative / Exploratory → White-box
        ↓
Acceptance Criteria & ATDD
        ↓
Entegre vaka → Yeni problem → Mülakat ve sınav tekrarı
~~~

**Örnek dünyamız:** Sepet, kargo ücreti, kupon, sipariş state'i ve iade kuralları. Aynı iş alanını farklı tekniklerle ele almak, her derste sıfırdan yeni bir ürün öğrenme yükünü azaltır. Bütün örnek kurallar eğitim için oluşturulmuştur; gerçek bir sisteme ilişkin doğrulanmış ürün politikası değildir.

## I2 — Test Levels & Strategy

I1'de *hangi verileri test edeceğimizi* öğrendik. I2'de bunun üzerine şu soruyu kuruyoruz: **Bu testi geliştirme sürecinin hangi anında, sistemin hangi sınırında ve hangi riski azaltmak için yapmalıyız?**

Bu sıralama temel bir problemden başlayarak adım adım ilerler.

| Sıra | Ders | Temel soru |
|---|---|---|
| 11 | [SDLC, Test-first & Continuous Testing](03-test-levels-and-strategy/01-sdlc-test-first-and-continuous-testing.md) | Testing ne zaman başlar; yazılım yaşam döngüsünü nasıl etkiler? |
| 12 | [Static Testing & Reviews](03-test-levels-and-strategy/02-static-testing-and-reviews.md) | Kod çalışmadan nasıl kusur ve belirsizlik buluruz? |
| 13 | [Test Levels & Types](03-test-levels-and-strategy/03-test-levels-and-types.md) | Component, integration, system ve acceptance hangi sınırları ele alır? |
| 14 | [Test Pyramid & Test Distribution](03-test-levels-and-strategy/04-test-pyramid-and-test-distribution.md) | Testleri hız, risk ve teşhis gücüne göre nasıl dağıtırız? |
| 15 | [Confirmation, Regression & Maintenance](03-test-levels-and-strategy/05-confirmation-regression-and-maintenance.md) | Değişen üründe hangi kontrolleri yeniden çalıştırırız? |
| 16 | [Risk-based Test Strategy](03-test-levels-and-strategy/06-risk-based-test-strategy-and-prioritization.md) | Kısıtlı zaman ve kaynakta hangi testi neden önce seçeriz? |

**[I2 Çalışma Atölyesi — Entegre vaka, İngilizce mülakat ve isteğe bağlı CTFL tekrar](03-test-levels-and-strategy/07-i2-practice-and-interview-companion.md)**

Ana dersler önce **kavramı öğretir**; mülakat ve sınav çalışması sonradan yapılır. I2'de eski altı taslak dosyanın yerini **öğretim sırasına göre numaralanmış altı yeni ders** ve bir ayrı atölye aldı. Önceki dosyalar Git geçmişinde bulunabilir; önerilen rota bu yeni derslerdir.

## I3 — Test Data, Isolation & Test Doubles

I1'de **ne test ediyoruz?**, I2'de **nerede ve ne zaman test ediyoruz?** sorularını inceledik. I3'te test sonucunun **tekrar edilebilir ve güvenilir olması için başlangıç verisini, bağımlılıkları ve kanıtı** tasarlıyoruz.

Bu bölüm bir kavram sözlüğü değil; birlikte ilerleyen altı ders ve ayrı uygulama atölyesidir.

| Sıra | Ders | Temel soru |
|---|---|---|
| 17 | [Test Data Design & Lifecycle](04-test-data-isolation-and-doubles/01-test-data-design-and-lifecycle.md) | Testin doğru veri ve başlangıç state'iyle başladığını nasıl biliriz? |
| 18 | [Deterministic & Repeatable Tests](04-test-data-isolation-and-doubles/02-deterministic-repeatable-tests.md) | Saat, rastgelelik ve asenkron çalışma sonucu neden değiştirebilir? |
| 19 | [Test Isolation, Fixtures & Parallelism](04-test-data-isolation-and-doubles/03-test-isolation-fixtures-and-parallelism.md) | Testler neden sıraya ve birbirinin verisine bağımlı olmamalıdır? |
| 20 | [Test Doubles: Dummy, Stub, Fake, Spy, Mock](04-test-data-isolation-and-doubles/04-test-doubles-dummy-stub-fake-spy-mock.md) | Gerçek dış bağımlılık olmadan neyi test edip neyi test etmemiş oluruz? |
| 21 | [State vs Interaction & Over-mocking](04-test-data-isolation-and-doubles/05-state-vs-interaction-and-over-mocking.md) | Sonucu mu, çağrıyı mı doğrulamalıyız; fazla mock neyi gizler? |
| 22 | [Assertions, Observability & Evidence](04-test-data-isolation-and-doubles/06-assertions-observability-and-evidence.md) | Pass sonucu hangi gerçek davranışı ve yan etkileri doğrular? |

**[I3 Çalışma Atölyesi — Kupon izolasyonu, yeni problem, İngilizce mülakat ve isteğe bağlı sınav tekrarı](04-test-data-isolation-and-doubles/07-i3-practice-and-interview-companion.md)**

Ana altı ders **kavram → gerekçe → açıklamalı örnek → karşı örnek → çözümlü transfer görevi** düzenini izler. Mocking framework kurulumu veya çalışan Cypress/Vitest kodu oluşturulmadı. CTFL ve mülakat tekrarları yalnız atölyede; I3'ün ileri test double konularının CTFL'de ayrı zorunlu öğrenme hedefleri olduğu iddia edilmez.

## Nasıl çalışmalı?

1. Bir dersin ilk örneğine bakıp sonucu **kendin tahmin et**.
2. Açıklamayı okuyup nedenini anlayarak tabloyu yeniden kur.
3. **Alıştırma** bölümünü örnek çözüme bakmadan çöz.
4. Kendi çözümünle farkları karşılaştır; beklenen sonucun kaynağını ve kalan riski açıklamaya çalış.
5. Bölümü bitirince bir sonraki derse geç. Mülakat veya sınav sorularını **zorunlu önkoşul** yapma.

İleride canlı eğitim/pratik oturumlarında bağımsız çalışma ve debugging ayrıca gözlenir. **AI tarafından yazılmış dokümanların varlığı, öğrencinin bağımsız SDET yetkinliği kanıtı değildir.**

## Kapsam, durum ve sonraki adımlar

| Aşama | Durum | Açıklama |
|---|---|---|
| **I1 — Foundations & Test Design** | **Yeniden yazıldı; incelemeye açık** | 10 açıklamalı ders + 1 bütünleştirici çalışma atölyesi |
| **I2 — Levels & Strategy** | **Yeniden yazıldı; incelemeye açık** | 6 açıklamalı ders + 1 bütünleştirici çalışma atölyesi |
| **I3 — Data, Isolation & Doubles** | **Hazırlandı; incelemeye açık** | 6 açıklamalı ders + 1 bütünleştirici çalışma atölyesi |
| I4 — Automation & BDD | Planlı | Yeni ders yok |
| I5 — API, UI & Failure Engineering | Planlı | Yeni ders yok |
| I6 — SDET, Security & Final Review | Planlı | Yeni ders yok |

**CTFL hedefi:** Bu öğretim serisi sınav hazırlığını da destekler, ancak I1–I3 derslerini okumak CTFL müfredatının tamamını kapsamaz. I1 temel kavramlar ve test tasarımını; I2 yaşam döngüsü, test seviyeleri ve static testing'i ele alır. I3 test verisi, izolasyon, test doubles ve kanıt güvenilirliğine odaklanır; her I3 alt konusu CTFL'de bağımsız sınav hedefi değildir. Test management ve test tools konularının tamamı henüz bitmiş değildir. Sınav hazırlığını ayrı çalışma atölyesi ve nihai syllabus coverage kontrolünde takip edeceğiz. Resmî bilgi: [ISTQB CTFL](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) ve [Glossary](https://glossary.istqb.org/).

## Repository sınırları

Bu handbook, mevcut `docs/learning/typescript-foundation/` materyallerinden bağımsızdır. `src/`, `tests/`, mevcut TypeScript dersleri ve diğer Increment klasörleri bu I3 çalışmasında değiştirilmemiştir.

**Bir genel README** vardır; alt klasörlerde README oluşturulmaz.
