# Test Engineering Handbook

**Yazılım test etmeyi kavramlardan gerçek mühendislik kararlarına doğru öğrenmek için hazırlanmış Türkçe teknik kaynak.**

> **Okuma durumu — 13 Ekim 2026:** **I1–I6 dokümantasyon ve indeksleri hazırlandı; kullanıcı incelemesine açık.** Bu, uygulamalı bağımsız yeterlilik veya tüm CTFL sınav hedeflerinin tamamlandığı anlamına gelmez.

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

## I4 — Automation & BDD

I1'de **neyi**, I2'de **nerede ve ne zaman**, I3'te **nasıl güvenilir biçimde** test edeceğimizi öğrendik. I4'te artık şu kararı veriyoruz: **Hangi testi otomatikleştirmeye değer, test kodunu nasıl sürdürülebilir kurar ve iş davranışını Gherkin'den doğru otomasyon adımına nasıl taşırız?**

Önerilen sıra 7 açıklamalı ders ve tek ayrı atölyedir:

| Sıra | Ders | Temel soru |
|---|---|---|
| 23 | [Automation Candidates & Value](05-automation-and-bdd/01-automation-candidates-and-value.md) | Hangi testin otomasyonu gerçek değer üretir? |
| 24 | [Automation Architecture & Maintainability](05-automation-and-bdd/02-automation-architecture-and-maintainability.md) | Test kodunu kopya ve sihirli helper'lardan nasıl koruruz? |
| 25 | [Selectors & UI Contracts](05-automation-and-bdd/03-selectors-and-ui-contracts.md) | UI değiştiğinde doğru öğeyi güvenilir biçimde nasıl buluruz? |
| 26 | [Cypress Command Queue, Retry & Waits](05-automation-and-bdd/04-cypress-command-queue-retry-and-waits.md) | Cypress niçin normal Promise/await gibi çalışmaz? |
| 27 | [BDD & Gherkin](05-automation-and-bdd/05-bdd-gherkin-as-a-collaboration-language.md) | İş davranışını paydaşlarla ortak dilde nasıl ifade ederiz? |
| 28 | [Step Definitions & Gherkin Integration](05-automation-and-bdd/06-step-definitions-and-gherkin-integration.md) | Senaryo cümlesi uygun test koduna nasıl bağlanır? |
| 29 | [BDD Automation Review & Failure Diagnosis](05-automation-and-bdd/07-bdd-automation-review-and-failure-diagnosis.md) | Testin niyetini ve güvenilirliğini değişiklik boyunca nasıl koruruz? |

**[I4 Çalışma Atölyesi — MiniShop vakası, bağımsız yeni görev, İngilizce mülakat ve isteğe bağlı ISTQB tekrar](05-automation-and-bdd/08-i4-practice-and-interview-companion.md)**

Ana dersler **problem → kavram → gerekçeli örnek → sınırlar → alıştırma** düzenindedir. Mülakat ve sınav tekrarları tek atölyede. Cypress–Cucumber adapter sürümü doğrulanmadan import ve konfigürasyon uydurulmadı; framework/repo/deployment kapsamı eklenmedi.

## I5 — API, UI & Failure Engineering

I1'de test koşulunu, I2'de uygun sınırı, I3'te güvenilir veriyi, I4'te sürdürülebilir otomasyonu öğrendik. I5 bu temeli **gerçek HTTP sözleşmesi, authorization, kalıcı state, browser davranışı ve kanıta dayalı hata araştırma** zincirinde birleştirir.

Önerilen sıra **8 açıklamalı ders** ve **1 ayrı uygulama atölyesi**:

### 06 — API & UI Testing

| Sıra | Ders | Temel soru |
|---|---|---|
| 30 | [HTTP API Contract & Observable Behavior](06-api-and-ui-testing/01-http-api-contract-and-observable-behavior.md) | HTTP 200 doğru iş davranışını garanti eder mi? |
| 31 | [API Positive, Negative & Contract Tests](06-api-and-ui-testing/02-api-positive-negative-and-contract-tests.md) | Bozuk input ve response schema nasıl sistematik test edilir? |
| 32 | [Authentication, Authorization & State](06-api-and-ui-testing/03-api-authentication-authorization-and-state.md) | Kimlik, izin ve kaynak state'i nasıl birlikte test edilir? |
| 33 | [Idempotency, Retries & Concurrency](06-api-and-ui-testing/04-api-idempotency-retries-and-concurrency.md) | Timeout ve eşzamanlı işlem çift tahsilata nasıl yol açabilir? |
| 34 | [UI Workflows, Browser State & Network](06-api-and-ui-testing/05-ui-workflows-browser-state-and-network.md) | Browser, API ve gerçek veri hangi farklı kanıtları sağlar? |

### 07 — Failure Debugging & CI

| Sıra | Ders | Temel soru |
|---|---|---|
| 35 | [Flaky Tests & Failure Classification](07-failure-debugging-and-ci/01-flaky-tests-and-failure-classification.md) | Aynı test neden bazen PASS bazen FAIL olur? |
| 36 | [Debugging, Triage & Root Cause](07-failure-debugging-and-ci/02-debugging-triage-and-root-cause.md) | Gözlem, hipotez ve kök nedeni nasıl ayırırız? |
| 37 | [CI Failure Analysis & Diagnostics](07-failure-debugging-and-ci/03-ci-failure-analysis-and-diagnostics.md) | Local PASS / CI FAIL farkı hangi kanıtla araştırılır? |

**[I5 Çalışma Atölyesi — MiniShop vakası, yeni problem, İngilizce mülakat ve isteğe bağlı CTFL tekrar](07-failure-debugging-and-ci/04-i5-practice-and-interview-companion.md)**

Ana dersler **problem → kavram → gerekçeli ve adım adım örnek → karşı örnek/kanıt sınırı → alıştırma** akışındadır. Mülakat ve sınav notları yalnız atölyede. API çağrıları, Cypress kodları ve CI çıktıları **öğretici örneklerdir**; gerçek çalışan servis/test veya başarılı CI kanıtı olarak sunulmaz. Yeni repo, framework, adapter ve deployment eklenmedi.

## I6 — SDET, Security Connection & Final Review

İlk beş Increment'te **doğru test koşulunu bulmayı, seviyesini seçmeyi, güvenilir otomasyonla doğrulamayı ve hatayı araştırmayı** öğrendik. I6 bu düşünmeyi güvenli tasarım, AppSec regresyonu ve olay kanıtıyla birleştiriyor.

**Önerilen sıra: 7 ana ders → 1 uygulama atölyesi → 1 final kapsam denetimi.**

| Sıra | Ders | Temel soru |
|---|---|---|
| 38 | [SDET Quality Engineering & Testability](08-sdet-security-and-checklists/01-sdet-quality-engineering-and-testability.md) | Test edilemeyen davranış hangi tasarım sorunlarını görünür kılar? |
| 39 | [Security Requirements & Trust Boundaries](08-sdet-security-and-checklists/02-security-requirements-and-trust-boundaries.md) | Varlık, tehdit ve trust boundary'den test edilebilir gereksinim nasıl çıkar? |
| 40 | [Identity, Authorization & Security Regression](08-sdet-security-and-checklists/03-identity-authorization-and-security-regression.md) | Yetki düzeltmesinin gerçek regresyon kanıtı nedir? |
| 41 | [Input Validation, Output Encoding & Injection](08-sdet-security-and-checklists/04-input-validation-output-encoding-and-injection.md) | Veri nasıl güvenli doğrulanır, saklanır ve gösterilir? |
| 42 | [Abuse Cases & Fail-safe Behavior](08-sdet-security-and-checklists/05-abuse-cases-fail-safe-and-exception-handling.md) | Hata ve kötüye kullanım sırasında hangi invariants korunur? |
| 43 | [Security Observability, Audit & Secrets](08-sdet-security-and-checklists/06-security-observability-audit-and-secrets.md) | Bir erişim olayını gizli veri sızdırmadan nasıl gözleyebiliriz? |
| 44 | [Security Regression & SDET Review Checklist](08-sdet-security-and-checklists/07-security-regression-and-sdet-review-checklists.md) | Risk, test, düzeltme ve kanıt nasıl tek karara bağlanır? |

**[I6 Çalışma Atölyesi — Security regression vakası, bağımsız transfer, İngilizce mülakat ve isteğe bağlı sınav tekrar](08-sdet-security-and-checklists/08-i6-practice-and-interview-companion.md)**

**[Handbook Final Review — Ders haritası, CTFL v4.0.1 kapsam eşlemesi ve açık eksikler](08-sdet-security-and-checklists/09-handbook-and-ctfl-coverage-audit.md)**

**Önemli sınır:** OWASP ASVS 5.0.0 / WSTG / Top 10:2025 kaynakları Application Security öğretimini destekler. Bunları CTFL'ye zorla konu etiketi olarak dağıtmıyoruz. CTFL **Chapter 5/6 ve bazı Chapter 1 hedeflerinde kalan eksikler**, final denetim dosyasında açıkça gösteriliyor. Güvenlik, test ve SOC yetkinlikleri ayrı kanıtlanır.

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
| **I4 — Automation & BDD** | **Hazırlandı; incelemeye açık** | 7 açıklamalı ders + 1 bütünleştirici çalışma atölyesi |
| **I5 — API, UI & Failure Engineering** | **Hazırlandı; incelemeye açık** | 8 açıklamalı ders + 1 bütünleştirici çalışma atölyesi |
| **I6 — SDET, Security & Final Review** | **Hazırlandı; incelemeye açık** | 7 ders + uygulama atölyesi + final CTFL/kapsam denetimi |

**CTFL hedefi:** Bu öğretim serisi sınav hazırlığını da destekler, ancak I1–I6 derslerini okumak CTFL müfredatının tamamını kapsamaz. I1 temel kavramlar ve test tasarımını; I2 yaşam döngüsü, test seviyeleri ve static testing'i ele alır. I3 test verisi, izolasyon, test doubles ve kanıt güvenilirliğine odaklanır; her I3 alt konusu CTFL'de bağımsız sınav hedefi değildir. I4 otomasyon tasarımını ve BDD/Cypress kavramlarını öğretir; tüm içerik CTFL'ye birebir sınav kazanımı olarak eşlenmez. I5 API/UI kanıtı ve failure engineering'i derinleştirir; bütün içeriği doğrudan CTFL sınav hedefi sayılmaz. Özellikle test management, estimation, monitoring/control, configuration management ve test tool categories konularının bazı hedefleri eksiktir. **[Final kapsam denetimi](08-sdet-security-and-checklists/09-handbook-and-ctfl-coverage-audit.md)** bu boşlukları saklamadan gösterir. Sertifika hazırlığında resmî syllabus ve sample exams ile ayrıca bağımsız değerlendirme gerekir. Resmî bilgi: [ISTQB CTFL](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) ve [Glossary](https://glossary.istqb.org/).

## Repository sınırları

Bu handbook, mevcut `docs/learning/typescript-foundation/` materyallerinden bağımsızdır. `src/`, `tests/`, mevcut TypeScript dersleri ve diğer Increment klasörleri bu I6 çalışmasında değiştirilmemiştir.

**Bir genel README** vardır; alt klasörlerde README oluşturulmaz.
