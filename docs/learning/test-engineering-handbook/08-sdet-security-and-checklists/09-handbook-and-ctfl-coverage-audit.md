# Handbook Final Review — Öğretim kapsamı, boşluklar ve CTFL eşlemesi

> **Amaç:** I1–I6'yı bitirmiş gibi ilan etmek değil; **hangi konunun hangi derste açıklandığını, hangi becerinin henüz gözlenmediğini ve ISTQB Foundation açısından hangi alanların eksik olduğunu** görünür kılmak.

**Kaynak:** ISTQB **Certified Tester Foundation Level Syllabus v4.0.1 (2024-09-15)**. Resmî PDF: https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf

**Denetim yaklaşımı:** Ders varlığı, konunun **açıklanmış/örneklenmiş** olmasına kanıt sağlayabilir. Ancak öğrencinin anladığını, kendi çözümünü oluşturabildiğini veya sertifika sınavına hazır olduğunu kanıtlamaz.

## 1. Öğretim yolculuğu: Neyi nereye bağladık?

| Öğrenme adımı | Handbook bölümü | Sorusu |
|---|---|---|
| Kalite, requirement, oracle ve risk | I1 / Ders 1–3 | Doğru sonucu nereden biliyoruz? |
| EP, BVA, decision table, state, exploratory, white-box, ATDD | I1 / Ders 4–10 | Hangi input ve akıştan anlamlı test çıkar? |
| SDLC, review, test levels/types, pyramid, regression, risk stratejisi | I2 / Ders 11–16 | Hangi sınırda, ne zaman ve hangi öncelikle test edilir? |
| Data, fixture, determinism, isolation, doubles, assertions | I3 / Ders 17–22 | Testi güvenilir ve yeniden üretilebilir yapan nedir? |
| Automation architecture, selector, Cypress, BDD, step definitions | I4 / Ders 23–29 | Davranışı bakım yapılabilir otomasyona nasıl çeviririz? |
| API contract, auth, idempotency, browser, debugging ve CI | I5 / Ders 30–37 | Servis ve UI davranışını nasıl doğrular, hatayı nasıl araştırırız? |
| Testability, threat model, secure handling, fail-safe, audit, checklist | I6 / Ders 38–44 | Güvenliği doğrulanabilir mühendislik gereksinimine nasıl dönüştürürüz? |

**Toplam:** **44 ana ders**. Her Increment'te ayrı bir uygulama/mülakat/sınav atölyesi var. Ana dersler **sınav etiketleriyle bölünmüyor**; mülakat ve CTFL tekrarları ayrı tutuluyor.

## 2. CTFL v4.0.1 için kapsam matrisi

Bu, **chapter düzeyinde niteliksel eşlemedir**, resmî öğrenme hedefi bazında tamamlanma sertifikası değildir. Her chapter içindeki **tüm K-level hedeflerinin** işlendiğini varsayma.

| CTFL chapter | Handbook'ta ilgili ana içerik | Değerlendirme | Açık dikkat |
|---|---|---|---|
| **1 — Fundamentals of Testing** | I1/1–3, I5/36, I6/38 | **Önemli kısmı işlendi** | Yedi test ilkesi, test process/testware/traceability, tester bağımsızlığı ve whole-team becerileri syllabus hedefleriyle tek tek ölçülmedi |
| **2 — Testing Throughout SDLC** | I2/11,13,15 | **Geniş ölçüde işlendi** | Resmî terminolojiyle kısa tekrar ve yeni örnekler gerekir |
| **3 — Static Testing** | I2/12 | **Geniş ölçüde işlendi** | Formal review roles/stages üzerinden bağımsız uygulama henüz gözlenmedi |
| **4 — Test Analysis & Design** | I1/4–10 | **Geniş ölçüde işlendi** | K3 seviyesindeki tüm teknikler yeni ve zamana bağlı sorularda test edilmedi |
| **5 — Managing Test Activities** | I2/14,16; I5/36–37 | **Kısmen işlendi** | Test estimation, monitoring/control/completion, configuration management ve bazı planlama/reporting hedefleri sistematik tamamlanmadı |
| **6 — Test Tools** | I4/23–29; I5/37 | **Kısmen işlendi** | Resmî tool categories/farklı test faaliyetlerini destekleme amaçları syllabus düzeniyle ayrıca gözden geçirilmeli |

**Önemli ayrım:** I5 ve I6'daki BOLA, idempotency, XSS ve AppSec derinliği **CTFL syllabus'ını otomatik tamamlamaz**. Bunlar SDET/AppSec mühendisliği için bilinçli ek kapsamlardır.

## 3. Gerçek CTFL açık alanları — gizlenmemeli

### 3.1 Foundation testing terminolojisinin küçük ama önemli boşlukları

I1 testin değerini ve teknikleri açıklar. Yine de CTFL için ayrıca netleştirilmeli:
- **Yedi test ilkesi** ve bunların karşı örnekleri;
- **error, defect, failure, root cause** ilişkisi;
- test process activities ve **testware** çıktıları;
- **test basis ↔ testware traceability**;
- whole-team approach ve independent testing'in faydaları/sınırları.

**Örnek pratik:** Bir iade requirement'ını test conditions, test case, test data, execution result ve defect kaydına izlenebilir bağla; başka bir user story'de H0 transfer ile yeniden kur.

### 3.2 Test Planning & Estimation (5.1)

I2 risk ve kapsamı anlattı; ama **estimation techniques** sistematik öğretilmedi.

Eksik içerik hedefleri:
- Test plan amacı, risk ve kaynak/çevre kısıtları;
- iteration/release planning'de tester katkısı;
- entry/exit criteria;
- **estimation**: benzer iş üzerinden tahmin, oran temelli tahmin ve üç-nokta tahmin gibi yöntemlerin farkı/varsayımları;
- test prioritization, pyramid ve quadrants (son üçü I2'de işlendi).

**Açıklamalı küçük örnek:** Önceki benzer API testlerinde 8 vaka yazımı+çalıştırması 4 saat sürdü. Yeni işte 12 benzer vaka tahmin ediliyor. Basit oranla **12×(4/8)=6 saat** taban tahmini bulunur. Ancak farklı authentication/test data zorluğu varsa bu varsayım bozulur. Sayı kesin taahhüt değil, gerekçeli başlangıçtır.

### 3.3 Monitoring, Control & Completion (5.3)

I5 CI failure ve raporlamayı anlattı; fakat test management faaliyetleri ayrıca sistematik öğretilmeli:
- Planlanan vs yürütülen testler;
- pass/fail/blocked/not-run ayrımı;
- defect ve product risk trendi;
- requirement/risk coverage;
- completion/exit raporu;
- veriye dayanarak scope veya öncelik değiştirme (**test control**).

**Örnek:** 40 testten 30'u PASS, 5'i FAIL, 5'i BLOCKED. **Yalnız çalıştırılmışların pass rate'i 30/35≈%85,7** olabilir; fakat **40 testin hepsi test edildi** denemez. Beş blocked testin taşıdığı risk ayrıca açıklanır. Test status bağlamı olmadan yüzdelik yanlış güven doğurur.

### 3.4 Configuration & Defect Management (5.4–5.5)

I5/36–37 defect raporunu örnekledi; ancak şu öğeler syllabus hedefleriyle ayrıca doğrulanmalı:
- SUT build, testware, test data, environment ve üçüncü taraf sürümlerini **izlenebilir biçimde eşleme**;
- release/branch ve configuration baseline;
- defect lifecycle/status, severity/priority, reproducibility;
- resmî sınav tarzında **tam defect report hazırlama** uygulaması.

**Örnek:** Test fail ederken aynı testin \`main\` branch'indeki son hali değil, eski lockfile ile oluşturulmuş başka build üzerinde çalıştırıldığını fark etmek. Configuration baseline bu farkı görünür kılar.

### 3.5 Test Tools (6.1–6.2)

I4 automation'ın maliyetini ve teknik mekanizmayı anlattı. CTFL açısından **araçların test sürecinde neyi desteklediğini** ayrı ele almak gerekir:
- management/traceability/defect araçları;
- static analysis ve review destek araçları;
- test design/data ve execution araçları;
- performance/monitoring gibi non-functional araçlar;
- automation'ın faydaları **ve** maintenance, yanlış güven, tool bağımlılığı gibi riskleri.

**Örnek:** Cypress UI davranışını çalıştırır; GitHub Actions çalıştırmayı zamanlar ve sonuç kaydeder; issue tracker defect workflow sağlar. Bunlardan hiçbiri tek başına doğru oracle üretmez.

## 4. Bu boşlukları neden I6 ana derslerine dağıtmadık?

I6'nın aktif öğretim amacı **SDET kalite mühendisliği ve güvenlik doğrulaması**. Eksik CTFL konularını her sayfaya eklemek, daha önce kullanıcı tarafından özellikle eleştirilen **etiket kirliliği ve kopuk öğretim akışını** yeniden üretirdi.

Doğru sonraki adım, ihtiyaç doğduğunda **ayrı ve dar bir CTFL tamamlayıcı çalışma** ile bu alanları öğretmek; ardından resmî syllabus learning objectives ile ve **resmî sample exams** üzerinden hazır oluşu ölçmektir. **Bu denetim dosyasının varlığı eksikleri kapatmaz.**

## 5. Final dokümantasyon kalite kontrolü

Denetim kapsamı:

- **Yapı:** Tek kök \`README.md\`, sekiz tematik klasör; alt klasörde nested README yok.
- **İndeks:** I1–I6 ders sırası ve bütünleştirici atölyeler kök README'de gösterilir.
- **Pedagoji:** Kavram → gerekçe → açıklamalı örnek → karşı örnek/sınır → alıştırma.
- **Sınav ayrımı:** Ana I6 dersleri CTFL etiketiyle bölünmez.
- **Kod dürüstlüğü:** Pseudo-code, model ve örnek CI logları **gerçek çalıştırma kanıtı değildir**.
- **Kaynak ve sürüm:** ISTQB CTFL v4.0.1, OWASP ASVS stable 5.0.0, OWASP Top 10:2025; belirsiz veya değişken kurallar örnek sözleşme olarak işaretlenir.
- **Scope:** Uygulama kodu, tests, TS Foundation, yeni framework/repo/CI/deployment yok.

**Teknik link/fence ve GitHub içerik kontrolü** ayrıca commit öncesi gerçekleştirilir; sonuç yalnız gerçekten doğrulanmışsa kapanışta raporlanmalıdır.

## 6. Definition of Done: Doküman ile yetkinlik ayrı

| Ölçüt | Durum |
|---|---|
| I1–I6 dokümantasyon ve index üretimi | Dosyalar oluşturuldu; commit/inceleme ile doğrulanacak |
| SDET-A1/A2 için teorik öğrenme kaynağı | Var |
| Test otomasyonu kodunda bağımsız küçük değişiklik | **Bu Epic'te gözlenmedi** |
| Kasıtlı bir defect'in testle yakalanması ve düzeltilmesi | **Bu Epic'te gözlenmedi** |
| Gerçek flaky/CI failure'ın root-cause düzeltmesi | **Bu Epic'te gözlenmedi** |
| Yetkili lab'da security vulnerability reproduce → fix → regression | **Bu Epic'te gözlenmedi** |
| Yeni problemde Selman'ın **H0** transferi | **Bu Epic'te gözlenmedi** |
| CTFL v4.0.1 syllabus'ın bütün K1/K2/K3 hedefleri | **Tamamlanmış sayılmaz** |

**Yardım seviyesi:** Bu handbook dosyalarının büyük bölümünü AI hazırladı; öğretim materyali üretimi **H4** olarak tanımlanır. Selman'ın kendi kod ve testleri üzerinde elde edilmiş bir H0 başarı iddiası yoktur.

## 7. Sonraki karar

I6 tamamlandığında önce **Selman'ın okuma ve düzeltme geri bildirimi** alınır. Yeni pratik Epic veya CTFL tamamlayıcı birimi **kendi kapsam kararı** ile planlanır; burada otomatik başlatılmaz.

→ [Genel okuma indeksi](../README.md)

**Resmî kaynak:** [ISTQB CTFL v4.0.1 syllabus](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) · [ISTQB CTFL resmi sample exams](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) · [OWASP ASVS stable release](https://github.com/OWASP/ASVS/releases/tag/v5.0.0_release).
