# Regression, Confirmation, Smoke, Sanity & Exploration

**Amaç:** Değişiklik sonrasında hangi testi neden yeniden çalıştırdığını açıklamak; test amaçlarını test seviyeleriyle karıştırmamak.
**ISTQB CTFL v4.0.1:** FL-2.2.3 (K2), FL-2.3.1 (K2). **Smoke ve sanity** yaygın sektör etiketleridir; CTFL'nin beş test seviyesi değildir. Testing quadrants içinde smoke Q4'e örnektir.

## 1. Technical Foundation

### Confirmation vs regression testing

**Confirmation testing (retesting):** Daha önce failure veren spesifik defect'in **düzeltildiğini** doğrulamak. Orijinal yeniden üretim adımlarını tekrar işlet; gerekirse fix'in kullandığı varyasyonları ekle.

**Regression testing:** Değişikliğin **önceden çalışan davranışı istemeden bozmadığını** doğrulamak. Etki aynı component, bağlı servis veya tüm system tarafında olabilir. Confirmation testi “düzeltme çalıştı” iddiasını, regression ise “başka davranış etkilenmedi” iddiasını destekler.

Örnek: Kupon maksimum indirim kusuru düzeltildi.
- **Confirmation:** 100 € sepette üst sınır hatası artık doğru hesaplıyor mu?
- **Regression:** Normal indirim, başka kupon türü, vergi hesaplama ve checkout akışı hâlâ doğru mu?
- Aynı test her iki amaçla kullanılabilir, fakat **hedefler** ayrı raporlanır.

### Smoke, sanity, regression, exploratory

| Etiket | Amaç | Sıklıkla ne zaman? | Yanlış anlaşılma |
|---|---|---|---|
| **Smoke** | Build / deployment temel fonksiyonları ayakta mı? | Yeni build veya ortam sonrası | “Smoke geçti; ürün release-ready” |
| **Sanity** | Belirli değişiklik/düzeltme alanında hızlı ve odaklı kontrol | Küçük değişiklikten sonra | “Sanity her yerde aynı standardize test level'idir” |
| **Regression** | Değişiklik eski işlevleri bozdu mu? | Fix, feature veya environment değişimi | “Her seferinde bütün suite'i çalıştırmak şart” |
| **Confirmation** | Spesifik defect ortadan kalktı mı? | Fix sonrası | “Aynı şey regression'dır” |
| **Exploratory** | Öğrenme + anlık tasarım + yürütme ile yeni kusurlar/riski araştırma | Yeni veya belirsiz davranışta | “Rastgele tıklama” |

**Terminoloji uyarısı:** Smoke ve sanity ekipler arasında farklı tanımlanabilir; konuşurken hangi kapsamın kastedildiğini netleştir. ISTQB CTFL'de confirmation ve regression açık kavramlardır; smoke/sanity ile resmî seviyeleri eşitleme.

### Maintenance testing ve impact analysis

Mevcut üründe yeni özellik, defect fix, migration, dependency/runtime yükseltme, verinin taşınması veya sistem retirement gibi değişiklikler maintenance testing gerektirebilir.

**Impact analysis** soruları:
1. Neler değişti? (code, contract, data model, environment, configuration)
2. Doğrudan hangi işlev/bağımlılıklar etkilenebilir?
3. Ne için confirmation, ne için regression gerekir?
4. Veriler, permission ve dış sistemler nasıl etkilenebilir?
5. Risk nedeniyle hangi testler ertelenemez, hangileri seçilebilir?

### Regression suite seçim yöntemleri

- **Retest-all:** Bütün suite. Geniş kanıt verir ancak çok zaman alabilir; değişikliğin kapsamına göre pahalıdır.
- **Regression test selection:** Değişikliğin olası etkisine göre alt küme seç.
- **Prioritization:** Yüksek riskli/ana yola yönelik testleri önce çalıştır.
- **Incremental coverage:** Zaten kontrol edilen davranışları tekrar etmek yerine yeni risk/öğeleri kapsayan testlere yer ver.

**Dikkat:** Sadece değişen dosyaya odaklanırsan dolaylı bağımlılıkları kaçırabilirsin. Test seçimi test basis, mimari bağımlılık ve geçmiş defect verisiyle gerekçelendirilmelidir.

## 2. Engineering Perspective

### Dört ortamda aynı kusur?

Bir API 500 döndü. Olasılıklar: uygulama defect'i, test verisi problemi, dış sağlayıcı kesintisi, yanlış environment variable. Tüm regresyon suite'ini “product defect” etiketiyle kapatma. Önce gözlemleri, reproducibility'yi, değişiklikleri ve log/response delillerini topla.

**Flaky test**, aynı kodla bazen pass bazen fail eden testtir; retry sayısını artırmak kök nedeni gidermez. Ayrıntılı flaky/CI araştırması I5'te yapılacak.

### Release riskine bağlama

Yeni deployment sonrası smoke testi “uygulama ana giriş sayfasını sunuyor” dedi; bu **ödemelerin doğru alındığı** anlamına gelmez. Kritik ödeme akışı için ayrı system integration veya E2E kontrolü risk değerlendirmesine göre gerekir.

## 3. Practical Scenario — üç farklı değişiklik

**A. Unit bug fix:** 100 € kargo sınırında yanlış `>` düzeltildi.
- Confirmation: 100 € için FREE beklenen.
- Regression: 99 €, 101 €, aktif/pasif ve express istisnası.
- Smoke: Yeni build genel olarak ayakta mı? Gerektiğinde ayrıca.

**B. DB migration:** `price` numeric precision değişiyor.
- Confirmation etiketi tek başına yeterli değil; migration correctness, rollback plan, etkilenen hesaplama ve API mapping regresyonu.
- Data conversion sırasında sessiz kayıp riskini ayrı gözle.

**C. Yeni browser sürümü:** UI element konumu değişti.
- Test kırıldı ama API davranışı doğru olabilir; otomasyon selector/ortam kusurunu ürün kusurundan ayır.

## 4. Interview Preparation

**Q1: What is the difference between retesting and regression testing?**  
**A:** “Confirmation or retesting checks that a known defect has been fixed. Regression testing checks that a change has not adversely affected previously working behavior. They may use overlapping tests but answer different questions.”

**Q2: How do you choose a regression suite for a small change?**  
**A:** “I perform impact analysis, consider dependencies and critical risks, run targeted checks first, and include broader tests when the potential impact warrants it.”

**Q3: Are smoke and sanity testing the same?**  
**A:** “They are commonly used shorthand rather than standardized ISTQB test levels. Smoke usually checks basic build or deployment health, while sanity often means a narrow check around a change. I clarify team definitions.”

## 5. CTFL Practice — özgün sorular

**S1 (K2):** Daha önce fail olan 100 € sınır testi fix sonrası yeniden pass oldu. En doğrudan test amacı?  
A) Confirmation · B) Regression only · C) Static review · D) Acceptance only  
**Yanıt: A.** Aynı defect'in giderilmesi kontrol edilir.

**S2 (K2):** Düzeltmeden sonra başka kupon tiplerinin yanlış etkilendiği bulunuyor. Bunu hedefleyen test?  
A) Confirmation of original bug only · B) Regression · C) Walkthrough · D) Requirements elicitation  
**Yanıt: B.** Değişiklik yan etkisi araştırılır.

**S3 (K2):** Runtime yükseltmesi var, uygulama iş kodu değişmedi. Hangisi doğru?  
A) Testing gereksiz · B) Impact analysis yapılarak maintenance testing seçilir · C) Yalnız unit test yazılmaz · D) Smoke her türlü riski kapatır  
**Yanıt: B.** Ortam değişikliği ürün davranışını etkileyebilir.

**S4 (K2):** Smoke testi geçti; bunun anlamı nedir?  
A) Tüm işlev ve performans testleri başarıyla tamamlandı · B) Kontrol edilen temel sağlık koşulları sağlandı · C) Defect kalmadı · D) Herhangi regression gereksiz  
**Yanıt: B.** Smoke yalnız sınırlı build/ortam sağlığına kanıttır.

## Sonuç ve kaynak

**Confirmation = bilinen defect düzeldi mi? Regression = değişiklik başka neyi bozmuş olabilir?** Smoke/sanity kapsamın ne kadar dar olduğunu ifade eden pratik etiketlerdir.

- [SDLC & Maintenance](05-sdlc-devops-and-maintenance-testing.md) · [Risk-based Strategy](03-risk-based-test-strategy.md) · [Static Reviews](06-static-testing-and-reviews.md)
- [ISTQB CTFL v4.0.1 §§2.2.3, 2.3](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
