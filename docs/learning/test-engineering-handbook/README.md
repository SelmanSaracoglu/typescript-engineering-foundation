# Test Engineering Handbook — Engineering, Interviews & ISTQB CTFL

> **Durum:** Epic 02 / I1 ve I2 dokümantasyonları yayımlandı. I3–I6 henüz hazırlanmadı.  
> **Dil:** Türkçe anlatım, İngilizce teknik terimler ve mülakat cevapları.  
> **Sınav referansı:** ISTQB Certified Tester Foundation Level (CTFL), İngilizce Syllabus **v4.0.1 (15.09.2024)**.

## Amaç ve sınırlar

Bu handbook üç ihtiyacı birlikte karşılar: (1) gereksinimden gerekçeli test kararı çıkaran **Test Engineering** bilgisi, (2) Software Tester / Test Automation Engineer / SDET **teknik mülakatlarına** hazırlık, (3) **ISTQB CTFL** müfredatına göre sistematik çalışma.

Sadece terim ezberi veya soru bankası değildir. Örneklerin çoğu eğitim amaçlı tasarlanmış sentetik ürün kurallarıdır. İngilizce cevaplar kişisel deneyim iddiası değil, teknik cevap örneğidir. Bölümün yazılmış olması uygulamalı yeterlilik, sınava hazır olma veya sertifika kazanma kanıtı değildir.

Bu alan, mevcut **typescript-foundation** dokümantasyonundan ayrıdır; uygulama kodu veya otomasyon framework'ü içermez.

## Önerilen okuma sırası — I1

### 01 — Foundations

1. [Quality, Testing & Confidence](01-foundations/01-quality-testing-and-confidence.md)
2. [Verification, Validation & Risk](01-foundations/02-verification-validation-and-risk.md)
3. [Requirements, Expected Behavior & Evidence](01-foundations/03-requirements-expected-behavior-and-evidence.md)

### 02 — Test Design Techniques

1. [Equivalence Partitioning](02-test-design-techniques/01-equivalence-partitioning.md)
2. [Boundary Value Analysis](02-test-design-techniques/02-boundary-value-analysis.md)
3. [Decision Table Testing](02-test-design-techniques/03-decision-table-testing.md)
4. [State Transition Testing](02-test-design-techniques/04-state-transition-testing.md)
5. [Scenario, Negative & Experience-based Testing](02-test-design-techniques/05-scenario-negative-exploratory-testing.md)
6. [White-box: Statement & Branch Coverage](02-test-design-techniques/06-white-box-statement-and-branch-testing.md)
7. [Collaboration-based: User Stories, AC & ATDD](02-test-design-techniques/07-collaboration-user-stories-and-atdd.md)

**I1 toplamı: 10 konu dosyası + 1 genel README.** CTFL v4.0.1 Bölüm 4'ün white-box ve ATDD gereksinimlerini doğru kapsamak için başlangıçtaki 8 dosyaya 2 anlamlı konu dosyası eklenmiştir.

## Önerilen okuma sırası — I2

### 03 — Test Levels & Strategy

CTFL Bölüm 2 ve 3 öğrenme hedeflerini izlemek için önce yaşam döngüsü ve review bağlamını oku, ardından seviyelere ve stratejiye geç.

1. [SDLC, Test-first, DevOps & Maintenance](03-test-levels-and-strategy/05-sdlc-devops-and-maintenance-testing.md)
2. [Static Testing, Reviews & Early Feedback](03-test-levels-and-strategy/06-static-testing-and-reviews.md)
3. [Unit, Component, Integration, API & E2E — Levels and Types](03-test-levels-and-strategy/01-unit-component-integration-api-e2e.md)
4. [Test Pyramid, Distribution & Agile Testing Quadrants](03-test-levels-and-strategy/02-test-pyramid-and-distribution.md)
5. [Risk-based Test Strategy & Prioritization](03-test-levels-and-strategy/03-risk-based-test-strategy.md)
6. [Regression, Confirmation, Smoke, Sanity & Exploration](03-test-levels-and-strategy/04-regression-smoke-sanity-and-exploration.md)

**I2 toplamı:** 6 konu dosyası. Başlangıçtaki dört dosyalık `03` bölümüne, CTFL Bölüm 2'nin SDLC/maintenance hedeflerini ve Bölüm 3'ün static testing hedeflerini eksik bırakmamak için iki anlamlı dosya eklendi. Yeni repository, uygulama kodu veya alt klasör README oluşturulmadı.

## Bu kaynak nasıl kullanılmalı?

1. Önce kuralı ve **test oracle**'ı oku; beklenen sonucu implementasyonun çıktısından türetme.
2. Her teknik için örneği çöz, kapsama öğelerini (coverage items) ve dışarıda kalan riski göster.
3. **Interview Preparation** bölümündeki İngilizce cevapları kendi gerekçenle yeniden ifade et.
4. **CTFL Practice** özgün sorularında cevap anahtarını görmeden karar ver; yanlış seçeneklerin gerekçelerini incele.
5. Gerekiyorsa [resmî örnek sınavları](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) ayrı ve süreli çöz.

## CTFL v4.0.1 kapsam izlemesi

| CTFL alanı | Durum | Handbook karşılığı |
|---|---|---|
| Chapter 1 — Fundamentals of Testing | **I1'de belgelenmiş** | 01 / üç dosya; test activities, roles, test principles, traceability |
| Chapter 2 — Testing Throughout the SDLC | **I2'de belgelenmiş** | 03 / SDLC, test levels/types, confirmation/regression, maintenance |
| Chapter 3 — Static Testing | **I2'de belgelenmiş** | 03 / static testing, review process/roles/types |
| Chapter 4 — Test Analysis and Design | **I1'de belgelenmiş** | 02 / yedi dosya; siyah kutu, beyaz kutu, deneyime dayalı, ATDD |
| Chapter 5 — Managing the Test Activities | **Kısmi — I2** | FL-5.1.5–5.1.7 ve FL-5.2.1–5.2.4 belgelenmiş; FL-5.1.1–5.1.4, 5.3–5.5 planlı |
| Chapter 6 — Test Tools | **Planlı — I4 / I6** | Araçların değeri ve otomasyon riskleri henüz mevcut değil |

**Önemli:** Bu tablo yalnızca dokümantasyonda açıklanmış kapsamı gösterir, LO bazında bağımsız sınav başarısını değil. Final I6 kontrolünde her Learning Objective doğrulanmalıdır. Syllabus'ta Chapter 4 için **use-case testing** ayrı sınav tekniği değildir; mühendislik örneği olarak anılabilir.

### I2 CTFL learning objective izi

- **2.1:** FL-2.1.1–2.1.6 (K1/K2) → [SDLC, Test-first & DevOps](03-test-levels-and-strategy/05-sdlc-devops-and-maintenance-testing.md).
- **2.2:** FL-2.2.1–2.2.2 (K2) → [Test Levels & Types](03-test-levels-and-strategy/01-unit-component-integration-api-e2e.md); FL-2.2.3 (K2) → [Regression / Confirmation](03-test-levels-and-strategy/04-regression-smoke-sanity-and-exploration.md).
- **2.3:** FL-2.3.1 (K2) → [SDLC/Maintenance](03-test-levels-and-strategy/05-sdlc-devops-and-maintenance-testing.md).
- **3.1–3.2:** FL-3.1.1–3.1.3 ve FL-3.2.1–3.2.5 (K1/K2) → [Static Testing & Reviews](03-test-levels-and-strategy/06-static-testing-and-reviews.md).
- **5.1 (kısmi):** FL-5.1.5 (K3) → [Risk Prioritization](03-test-levels-and-strategy/03-risk-based-test-strategy.md); FL-5.1.6 (K1), FL-5.1.7 (K2) → [Test Pyramid & Quadrants](03-test-levels-and-strategy/02-test-pyramid-and-distribution.md).
- **5.2:** FL-5.2.1–5.2.4 (K1/K2) → [Risk-based Test Strategy](03-test-levels-and-strategy/03-risk-based-test-strategy.md).
- **Henüz belgelenmemiş CTFL objectives:** FL-5.1.1–5.1.4; FL-5.3.1–5.3.3; FL-5.4.1; FL-5.5.1; Bölüm 6. Bunlar gelecekteki Incrementlerde ele alınacak.

### I1 CTFL learning objective izi

- **1.1–1.3:** FL-1.1.1–1.1.2; FL-1.2.1–1.2.3; FL-1.3.1 → 01/01 ve 01/02.
- **1.4–1.5:** FL-1.4.1–1.4.5; FL-1.5.1–1.5.3 → 01/01 ve 01/03.
- **4.1:** FL-4.1.1 → 02/05 ve 02/06.
- **4.2:** FL-4.2.1–4.2.4 (K3) → 02/01–04.
- **4.3:** FL-4.3.1–4.3.3 (K2) → 02/06.
- **4.4:** FL-4.4.1–4.4.3 (K2) → 02/05.
- **4.5:** FL-4.5.1–4.5.2 (K2), FL-4.5.3 (K3) → 02/07.

## Bölüm şablonu

I1 ve I2 konu dosyaları **Technical Foundation → Engineering Perspective → Practical Scenario → Interview Preparation → CTFL Practice** akışını izler. K1 hatırlama, K2 anlama, K3 verilen duruma uygulama seviyesidir. Sorular bu handbook için özgün yazılmıştır; resmî ISTQB sınav soruları değildir.

## Kaynaklar ve kullanım

- [ISTQB CTFL v4.0.1 — resmî syllabus (PDF)](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [ISTQB CTFL — resmî örnek sınav indirmeleri](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISTQB Glossary](https://glossary.istqb.org/)

Metin, syllabus kavramlarının **özgün eğitim açıklaması**dır; resmî materyalin kopyası ya da akredite eğitim iddiası değildir. Sınava kayıt olurken sınav dili ve kabul edilen sürümü sınav sağlayıcısından teyit et.

## Increment durumu ve sonraki çalışmalar

- **I2 (tamamlandı):** Test levels, SDLC, strategy, static reviews ve Chapter 5'in belirtilen alt başlıkları.
- **I3:** Test data, isolation, doubles; ilgili CTFL yönetim bağlantıları.
- **I4:** Automation & BDD; CTFL test tools.
- **I5:** API/UI test perspektifi, failure analysis, CI.
- **I6:** SDET/security/checklists ve tam CTFL LO coverage final kontrolü.

**Dokümantasyon tamamlandı ≠ bağımsız teknik mastery veya sınav hazır oluşu kanıtlandı.**
