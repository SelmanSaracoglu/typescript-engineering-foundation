# Test Engineering Handbook — Engineering, Interviews & ISTQB CTFL

> **Durum:** Epic 02 / I1 (Foundations & Test Design) yayımlandı. I2–I6 henüz hazırlanmadı.  
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
| Chapter 2 — Testing Throughout the SDLC | **Planlı — I2** | 03 / seviyeler ve yaşam döngüsü; şu an mevcut değil |
| Chapter 3 — Static Testing | **Planlı — I2** | 03 kapsamına static testing/review başlığı eklenmeli; şu an mevcut değil |
| Chapter 4 — Test Analysis and Design | **I1'de belgelenmiş** | 02 / yedi dosya; siyah kutu, beyaz kutu, deneyime dayalı, ATDD |
| Chapter 5 — Managing the Test Activities | **Planlı — I2, I3, I6 kapsamında tamamlanacak** | Test planning, risk, estimation, monitoring, CM, defect management henüz mevcut değil |
| Chapter 6 — Test Tools | **Planlı — I4 / I6** | Araçların değeri ve otomasyon riskleri henüz mevcut değil |

**Önemli:** Bu tablo yalnızca dokümantasyonda açıklanmış kapsamı gösterir, LO bazında bağımsız sınav başarısını değil. Final I6 kontrolünde her Learning Objective doğrulanmalıdır. Syllabus'ta Chapter 4 için **use-case testing** ayrı sınav tekniği değildir; mühendislik örneği olarak anılabilir.

### I1 CTFL learning objective izi

- **1.1–1.3:** FL-1.1.1–1.1.2; FL-1.2.1–1.2.3; FL-1.3.1 → 01/01 ve 01/02.
- **1.4–1.5:** FL-1.4.1–1.4.5; FL-1.5.1–1.5.3 → 01/01 ve 01/03.
- **4.1:** FL-4.1.1 → 02/05 ve 02/06.
- **4.2:** FL-4.2.1–4.2.4 (K3) → 02/01–04.
- **4.3:** FL-4.3.1–4.3.3 (K2) → 02/06.
- **4.4:** FL-4.4.1–4.4.3 (K2) → 02/05.
- **4.5:** FL-4.5.1–4.5.2 (K2), FL-4.5.3 (K3) → 02/07.

## Bölüm şablonu

Bütün I1 konu dosyaları **Technical Foundation → Engineering Perspective → Practical Scenario → Interview Preparation → CTFL Practice** akışını izler. K1 hatırlama, K2 anlama, K3 verilen duruma uygulama seviyesidir. Sorular bu handbook için özgün yazılmıştır; resmî ISTQB sınav soruları değildir.

## Kaynaklar ve kullanım

- [ISTQB CTFL v4.0.1 — resmî syllabus (PDF)](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [ISTQB CTFL — resmî örnek sınav indirmeleri](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISTQB Glossary](https://glossary.istqb.org/)

Metin, syllabus kavramlarının **özgün eğitim açıklaması**dır; resmî materyalin kopyası ya da akredite eğitim iddiası değildir. Sınava kayıt olurken sınav dili ve kabul edilen sürümü sınav sağlayıcısından teyit et.

## Sonraki Incrementler (henüz açılmadı)

- **I2:** Test levels, SDLC, strategy ve CTFL static reviews boşlukları.
- **I3:** Test data, isolation, doubles; ilgili CTFL yönetim bağlantıları.
- **I4:** Automation & BDD; CTFL test tools.
- **I5:** API/UI test perspektifi, failure analysis, CI.
- **I6:** SDET/security/checklists ve tam CTFL LO coverage final kontrolü.

**Dokümantasyon tamamlandı ≠ bağımsız teknik mastery veya sınav hazır oluşu kanıtlandı.**
