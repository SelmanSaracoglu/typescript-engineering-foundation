# Risk-based Test Strategy & Test Prioritization

**Amaç:** Kısıtlı zaman ve test bütçesinde en kritik belirsizlikleri önce doğrulamak, kalan riski görünür kılmak.
**ISTQB CTFL v4.0.1:** FL-5.2.1 (K1), FL-5.2.2–5.2.4 (K2), ayrıca FL-5.1.5 (K3, test case prioritization). Detaylı test plan, estimation ve monitoring **sonraki Increment kapsamıdır**.

## 1. Technical Foundation

### Risk-based testing, “sezgisel test listesi” değildir

**Risk:** Olası bir olayın veya koşulun olumsuz sonucu. İki temel özelliği vardır:

- **Likelihood:** Olumsuz durumun ortaya çıkma olasılığı.
- **Impact:** Olay gerçekleşirse zarar/sonuç ne kadar büyük?

Düşünme aracı: **Risk level ≈ likelihood × impact.** 1–3 gibi ordinal etiketlerle yapılan çarpım yalnız **göreli önceliklendirme** sağlar; gerçek olay olasılığı veya finansal kaybı hesapladığını iddia etme.

**Product risk:** Ürünün kalitesi/işleviyle ilgili zarar: yanlış ödeme tutarı, yetkisiz veri erişimi, yavaş yanıt, veri kaybı.  
**Project risk:** Geliştirme/test faaliyetlerinin yürütülmesini etkiler: test ortamı gecikmesi, uzman eksikliği, üçüncü taraf teslim gecikmesi, belirsiz bütçe.  
Bir risk proje sürecini bozarken ürün kalitesini de dolaylı etkileyebilir; baskın soruyu ayır: **“Ürün yanlış çalışırsa zarar ne?”** veya **“Projeyi/testi yürütemezsek ne olur?”**

### CTFL risk management döngüsü

1. **Risk analysis**
   - **Risk identification:** Paydaşlarla riskleri, hata geçmişini, mimari sınırları, kullanıcı yolculuklarını listele.
   - **Risk assessment:** Likelihood ve impact değerlendir, önceliklendirme ve risk sahibini belirle.
2. **Risk control**
   - **Risk mitigation:** Riskin gerçekleşme olasılığını, etkisini veya bilinmezliğini azalt: test, review, kod düzeltme, rate limit, monitoring, iyileştirilmiş tasarım.
   - **Risk monitoring:** Risk ve kontrol etkinliğini yeni bilgi/defect/ürün değişimlerine göre yeniden değerlendir.

Testler kusurun varlığını ortaya çıkarabilir veya kontrol edilen koşul hakkında güven artırabilir; yalnız test koşmak **doğrudan product defect'i düzeltmez**.

### Basit risk değerlendirme örneği

Sentetik checkout sisteminde 1=low, 3=high varsayalım:

| Risk ID | Tehdit / ürün etkisi | L | I | Göreli skor | İlk doğrulama |
|---|---|---:|---:|---:|---|
| R1 | Retry sonrası müşteriden iki kez ödeme | 2 | 3 | 6 | Duplicate/retry + state kontrolü |
| R2 | Başkasının siparişini görüntüleme | 2 | 3 | 6 | Yetkisiz erişim/ownership negatif testi |
| R3 | Sepette yanlış renk etiketlenmesi | 2 | 1 | 2 | Seçilmiş UI kontrolü |
| R4 | Kupon eşik tutarının yanlış hesaplanması | 3 | 2 | 6 | BVA + decision table |

Skor eşit olan R1/R2/R4'ün **iş etkisi, kontrol yükümlülüğü ve maliyeti** farklıdır. Skoru mekanik sıralayıp bütün güvenlik senaryolarını en sona atma; ayrı kritik öncelik kararı alınabilir.

### Risk → scope → depth → evidence

| Risk | Test tasarımı | Uygun seviye | Beklenen kanıt |
|---|---|---|---|
| R1 çift ödeme | Tekrarlı request, timeout sonrası retry, parallel isteği | Service integration ve seçilmiş system | Tek charge / tutarlı transaction |
| R2 unauthorized read | Role/ownership matrisi, iki kullanıcı | Service/API system | Ret + veri sızıntısı yok |
| R4 yanlış eşik | 99.99,100,100.01; para precision | Component + birkaç integration | Oracle'a uygun hesap |

**Yüksek risk ⇒ daha erken, daha detaylı ve gerekirse çok seviyeli kontrol**; düşük risk ⇒ sınırlı örnek veya sonraya bırakma. Riskli senaryoların hiçbiri mutlak “zero risk” olarak kapanmaz.

### Test case prioritization (CTFL 5.1.5)

- **Risk-based:** En ciddi zarar risklerini kontrol eden testler önce.
- **Coverage-based:** Çok sayıda öğeyi kapsayan testler önce. **Additional coverage** varyantı her adımda henüz kapsanmamış en çok öğeyi sağlayan testi seçer.
- **Requirements-based:** Stakeholder'ın en önemli gereksinimi önce.

**Önemli bağımlılık:** Kritik checkout testi kullanıcı kaydı/seed ortamı gerektiriyorsa önkoşulu önce hazırlanır; sırf önceliği yüksek diye hazır olmayan testi körlemesine işletme.

#### K3 örneği — additional coverage

| Test | Kapladığı risk/requirement öğeleri |
|---|---|
| TC-A | {A,B} |
| TC-B | {B,C,D} |
| TC-C | {D,E} |

**Adım 1:** TC-B seçilir (3 öğe). Kalan {A,E}.  
**Adım 2:** TC-A veya TC-C her biri bir yeni öğe ekler; tie-breaker olarak risk/efor seçilir.  
**Adım 3:** Kalan öğeyi veren test seçilir.  
Bu, “en çok test case” değil, **eklenen yeni coverage** ölçütüdür.

## 2. Engineering Perspective

**Test strategy**, neyi/neyi değil, neden hangi seviyede/teknikle test edeceğimizi, risk sahiplerini ve exit ölçütlerini tanımlar. Tek bir evrensel strateji yoktur.

Küçük bir change request geldiğinde:

1. Değişikliğin ne olduğu ve kimleri etkilediği anlaşılır.
2. Product risk listesi güncellenir; project blockers da kaydedilir.
3. Her risk için test condition, uygun seviye, veri, oracle ve gözlemlenecek state belirlenir.
4. Yüksek riskli testler PR/CI'da mümkün olduğunca erken çalışır; uzun testler için uygun zamanlama seçilir.
5. Unresolved defect ve untested riskleri release karar verene açıkça sun.

**Failure triage:** Kritik test kırıldıysa bu mutlaka kritik ürün defect'i demek değildir. Test kodu, environment, data veya gerçek ürün kusuru ayrı ihtimallerdir; kanıt gerek.

### Test stratejisinin sınırı

“Bütün unit testler geçti” argümanı risk analizinin yerini tutmaz. Tersine “tüm E2E'ler var” demek de sistemin sınırlarını otomatik doğrulamaz. Test seçimi **risk x görünürlük x maliyet x düzeltilebilirlik** dengesi ister.

## 3. Practical Scenario — Son iki saat

Release öncesi iki saat kaldı. Üç iş var:
- TC1: Başkasına ait fatura görüntüleme (10 dakika; yüksek data-risk)
- TC2: Mobil renk/simge kontrolü (20 dakika; düşük risk)
- TC3: Retry ile duplicate ödeme (45 dakika; kritik financial risk)

**Örnek öncelik:** Önce TC1 ve TC3, sonra sonuçlara/çevreye göre TC2. Ancak TC3 için ödeme sağlayıcısı erişilemiyorsa engeli açık kaydet, uygun kontrollü service testini hemen yap, gerçek system integration boşluğunu **çözülmüş** sayma.

**Release notu:** “Yetki ve ödeme retry risklerinin belirlenen koşulları test edildi; gerçek sağlayıcı timeout senaryosu henüz doğrulanamadı. Ürün sahibi bu residual risk üzerinde karar vermeli.” Böylece testçinin rolü kanıta dayalı olur.

## 4. Interview Preparation

**Q1: What is risk-based testing?**  
**A:** “It uses product risk analysis to prioritize test scope, depth and execution. I consider the likelihood and impact of failures, select evidence for the key risks and communicate what remains untested.”

**Q2: How do project risks differ from product risks?**  
**A:** “Product risks concern failures and quality of the delivered software. Project risks threaten the delivery or test process, such as a missing environment or insufficient skills.”

**Q3: How do you prioritize tests when time is limited?**  
**A:** “I start with high-impact user and data risks, account for dependencies and environment availability, and document any reduced scope rather than equating skipped tests with passed tests.”

## 5. CTFL Practice — özgün sorular

**S1 (K2):** Test ortamı zamanında sağlanmadı. Risk türü?  
A) Product · B) Project · C) Test level · D) Test technique  
**Yanıt: B.** Test faaliyetinin yürütülmesini engeller; A ürünün kendisindeki davranış riski olurdu.

**S2 (K1):** Product risk'in iki temel niteliği?  
A) Age ve version · B) Likelihood ve impact · C) Velocity ve coverage · D) CPU ve RAM  
**Yanıt: B.** Diğer çiftler riskin iki temel özelliği değildir.

**S3 (K3):** TC-A={A,B}, TC-B={B,C,D}, TC-C={D,E}. Additional coverage ile ilk test?  
A) TC-A · B) TC-B · C) TC-C · D) Üçü aynı  
**Yanıt: B.** TC-B ilk adımda üç ayrı öğe kapsar; diğerleri iki.

**S4 (K2):** Yeni risk kaydı açıp olasılık ve etkisini değerlendirmek hangi faaliyet grubundadır?  
A) Risk analysis · B) Risk mitigation only · C) Test execution only · D) Defect closure  
**Yanıt: A.** Identification ve assessment, risk analysis altındadır.

## Sonuç ve kaynak

Risk-based test strategy **“en çok test” yerine “en çok değerli karar kanıtı”** üretir. Coverage, test sayısı veya skor tek başına kalite sertifikası değildir.

- [Levels & Types](01-unit-component-integration-api-e2e.md) · [Test Pyramid](02-test-pyramid-and-distribution.md) · [Regression](04-regression-smoke-sanity-and-exploration.md)
- [ISTQB CTFL v4.0.1 §§5.1.5, 5.2](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
