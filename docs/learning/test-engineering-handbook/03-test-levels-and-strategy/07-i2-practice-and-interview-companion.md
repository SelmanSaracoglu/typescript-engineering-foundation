# I2 Çalışma Atölyesi — Test kararlarını tek vakada birleştirmek

> **Burası isteğe bağlı tekrar ve uygulama alanıdır.** Önce [11–16. ana dersleri](01-sdlc-test-first-and-continuous-testing.md) oku. Teknik mülakat ve ISTQB Foundation tekrarı yalnız bu dosyada bulunur; öğretici metinleri bölmez.

## A. Entegre vaka: MiniShop kupon sisteminin yeni sürümü

Bir ekip şu değişikliği hazırlıyor:

> **Yeni ürün kararı:** Kupon indiriminden sonra sepet tutarı 100 € veya üzerindeyse ACTIVE üyeye STANDARD ücretsiz kargo uygulanacak. EXPRESS her durumda ücretli. Aynı kupon başarılı sipariş sonrası USED olur ve ikinci siparişte kullanılamaz.

Yeni kural aşağıdaki sistemi etkiliyor:

~~~text
Basket UI
    ↓
Order API
    ↓
Pricing Service ── Membership Repository
    ↓
Order Database ── Payment Provider
~~~

Bu bir eğitim senaryosudur; beklenen iş sonuçları burada belirtilen kurallarla sınırlıdır.

### Adım 1 — Geliştirme başlamadan ne yapılmalı?

**Static review'da** şu belirsizlikleri sor:
- “İndirim sonrası tutar” vergi ve kargo bedelini kapsıyor mu?
- 100 € tam olarak dahil mi?
- Kupon kullanılmış bilgisi, ödeme kesin başarılı olduğunda mı yoksa sipariş açıldığında mı yazılacak?
- Sağlayıcı timeout'u sonrası aynı sipariş kimliğiyle tekrar istekte ne olacak?

İlk ikisi cevaplanmadan doğru expected total tasarlanamaz; son iki soru **state / payment** riskini etkiler.

**Öğrenilen:** Review ve requirement netleştirme, kod bitince yapılması zorunlu bir iş değildir.

### Adım 2 — Aynı iş kuralını hangi seviyede test edeceğiz?

| Test sınırı | Temel kontrol | Yakalayabileceği kusur |
|---|---|---|
| Component | 99,99 / 100,00 / 100,01; ACTIVE ve EXPRESS örnekleri | Yanlış eşik veya karar |
| Component integration | Pricing Service'in Membership Repository'den aldığı üyelik durumu | Yanlış service mapping |
| System/API | İndirimli sepetle sipariş oluşturulduğunda shipping doğru mu? | Birleşik ürün davranışı |
| System integration | Payment Provider ile ödeme tutarı ve retry sözleşmesi | Dış sistem arayüz kusuru |
| Acceptance | Product owner'ın üzerinde uzlaştığı ücret örnekleri | İş kabulüne uygunluk |

**API test**, bu tabloda kullanılan bir giriş noktası olabilir; kendiliğinden “altıncı CTFL test level” değildir.

### Adım 3 — Test pyramid ile dağıtalım

- Çok sayıda para sınırı ve üyelik kombinasyonu → hızlı component testleri.
- Veri ve service etkileşimleri → seçilmiş integration testleri.
- Sepette doğru ücret gösterimi ve kritik checkout → az sayıda E2E/system testi.
- Gerçek ödeme sağlayıcısı → mümkün olduğu ölçüde ilgili system integration kontrolü.

**Soru:** Neden bütün boundary değerlerini browser'da kontrol etmiyoruz?  
**Yanıt:** Aynı hesaplama davranışı küçük testlerle hızlı, izole ve kolay teşhis edilebilir; browser testleri daha geniş fakat farklı riskleri kontrol etmek için tutulur.

### Adım 4 — Fix geldiğinde neyi yeniden test edeceğiz?

Bulunan defect: “100,00 € eşiğinde ücretli kargo çıkıyor.”

- **Confirmation:** ACTIVE + STANDARD + 100,00 € → FREE.
- **Regression:** 99,99 €; 100,01 €; INACTIVE + 120 €; EXPRESS + 120 €; order toplamının kaydı.
- **Smoke:** Build ve sipariş servisinin temel erişilebilirliği.
- **Impact analysis:** Kupon sonrası tutar değişimi vergiyi, faturayı ve ödeme total'ını da etkiliyor mu?

**Soru:** Confirmation testi geçtiğinde release kesin güvenli midir?  
**Yanıt:** Hayır. O kusurun giderildiğine dair kanıttır, bütün bağlı davranışların korunduğunu göstermez.

### Adım 5 — Kalan süreyi planla

Ekipte iki yüksek risk var:

1. **Başka müşteri siparişine erişim**: veri gizliliği zararı.
2. **Timeout sonrası çift ödeme**: finansal zarar.

Önce gerekli data ve sandbox erişimi hazırlanır, ardından bu riskleri ortaya çıkarabilecek testler seçilir. Ödeme sandbox'ı çalışmıyorsa environment blocker ayrı raporlanır; **test edilmemiş risk test geçmiş gibi gösterilmez**.

### Adım 6 — Bir cümlede release raporu

> “Kargo eşik ve üyelik kombinasyonlarını component ve system sınırlarında doğruladık; kritik yetki kontrolü geçti. Harici ödeme sağlayıcısının timeout senaryosu bu ortamda tamamlanamadı. Etki yüksek olduğundan release kararı öncesi residual risk'in paydaşlarla değerlendirilmesi gerekir.”

**Atölyenin temel kazanımı:** Ne kadar test yaptığımızdan önce **hangi risk için hangi kanıtı topladığımızı** anlatabiliyoruz.

---

## B. Yeni vaka — önce kendi başına çöz

**Ürün:** Dosya paylaşım uygulaması.

**İş kuralları:**
- ACTIVE kullanıcı dosya yükleyebilir;
- Bir dosya en çok 10 MB olabilir;
- Dosya önce PENDING, inceleme sonrası APPROVED veya REJECTED olur;
- Sadece dosya sahibi ve yetkili reviewer dosya içeriğini okuyabilir.

**Değişiklik:** Yeni sürümde dosya boyutu kontrolü ve metadata veritabanı güncelleniyor.

**Görevler:**
1. Kod başlamadan soracağın üç review sorusunu yaz.
2. Component, component integration ve system için birer test seç.
3. İki regression senaryosu öner.
4. Bir yüksek product risk ve bir project risk belirle.
5. Release notunda hangi kanıt eksikliğini açıkça iletmen gerektiğine örnek ver.

### Örnek değerlendirme

1. “10 MB nasıl hesaplanıyor (10,000,000 mı 10,485,760 byte mı)?”, “Yetkili reviewer rolünü kim verir?”, “REJECTED dosyanın indirilmesi mümkün mü?”
2. Component: boyut eşiği hesaplama; component integration: metadata'nın DB'ye doğru yazılması; system: kullanıcı yüklediği dosyayı iş akışında doğru state ile görür.
3. Eski desteklenen dosya tipleri hâlâ yükleniyor mu? Eski APPROVED dosyalar yeni metadata şemasında doğru okunuyor mu?
4. Product risk: B'nin private dosyasını A okuyabilir. Project risk: DB migration test datası/ortamı hazır değil.
5. “Gerçek veri migrasyonu geri alma testi henüz çalıştırılamadı” gibi somut bir boşluk.

Bu cevaplar tek olası çözüm değildir; **oracle'ın kaynağı, testin sınırı ve dışarıda kalan risk** açıklanmalıdır.

---

## C. English interview rehearsal

Önce sesli veya yazılı olarak **kendin cevap ver**. Örnek yanıtlar kişisel deneyim iddiası değil, teknik ifade modelleridir.

**1. Where does testing start in the SDLC?**  
“Testing can start when requirements and designs are discussed. Early review and test design help detect misunderstandings before they become code defects.”

**2. How does Agile change testing?**  
“It creates frequent feedback cycles. Testing happens throughout each increment, and teams continuously revisit acceptance criteria, regression risks and quality evidence.”

**3. What is static testing?**  
“It evaluates work products without executing software, for example through requirement reviews or static analysis. It complements dynamic testing rather than replacing it.”

**4. What is the difference between component integration and system integration testing?**  
“Component integration checks interactions between internal components. System integration checks interfaces between the system and external systems or services.”

**5. Is API testing a separate test level?**  
“Not automatically. An API is an interface. The test level depends on what components are involved and which objective the test is intended to satisfy.”

**6. What is the purpose of the test pyramid?**  
“To distribute testing so most detailed checks can run quickly at smaller boundaries while a smaller number of broader tests cover integration and critical user journeys.”

**7. Confirmation testing versus regression testing?**  
“Confirmation checks that a known defect is fixed. Regression checks that a change has not harmed previously working behavior. They provide different evidence.”

**8. What is risk-based testing?**  
“It prioritizes testing based on the likelihood and impact of product failures. I connect important risks to test conditions, appropriate test levels and observable evidence.”

**9. What would you do when a critical test environment is unavailable?**  
“I would record the project blocker, run meaningful alternative checks where possible, and explicitly report which product risk remains unverified.”

**10. How do you communicate release readiness?**  
“I describe what was tested, the important results, unresolved defects and residual risks. I offer a technical recommendation while the accountable stakeholder makes the release risk decision.”

---

## D. ISTQB CTFL Foundation — isteğe bağlı soru çalışması

Bu bölüm, CTFL v4.0.1'in özellikle **SDLC, static testing, levels/types** ve test management konularına ilişkin anlayışı tekrar etmek içindir. Sorular **özgündür**, resmî sınav sorusu değildir. Bu I2 çalışması CTFL Chapter 5'in bütün öğrenme hedeflerini henüz kapsamaz.

### Sorular (cevaplara bakmadan çöz)

**S1.** Developer henüz koda başlamadan tester gereksinimdeki tarih çelişkisini belirliyor. Hangi ifade doğru?  
A) Yalnız dynamic testing · B) Static testing ve shift-left yaklaşımı · C) Sadece regression · D) Test ancak deployment sonrası başlar

**S2.** TDD'de beklenen küçük döngü hangisidir?  
A) Deploy → rollback → monitoring · B) Red → green → refactor · C) Review → sign-off → archive · D) Run all E2E → skip component

**S3.** Bir checkout fonksiyonunun bireysel iş davranışını izole doğrulamak hangi seviyedir?  
A) Component · B) System integration · C) Acceptance · D) Operational acceptance

**S4.** Sipariş sisteminin dış ödeme sağlayıcısıyla protokol/alan eşleşmesini doğrulamak en doğrudan hangi seviyedir?  
A) Component · B) Component integration · C) System integration · D) Unit only

**S5.** Aynı HTTP endpoint'i hem tek handler hem service+DB düzeyinde test edilebilir. Doğru açıklama?  
A) API testing tek sabit seviyedir · B) Level, test nesnesi ve sınırıyla belirlenir · C) API her zaman UI testidir · D) API testte expected result gerekmez

**S6.** Formal inspection'da yazarın üstlenmemesi gereken rol çifti hangisidir?  
A) Review leader ve scribe · B) Reviewer ve developer · C) Product owner ve kullanıcı · D) Manager ve tester

**S7.** Kodun yazarı, yeni tasarımı diğer katılımcılara adım adım anlatarak görüş topluyor. Hangi review türüne en yakındır?  
A) Walkthrough · B) Inspection · C) Load testing · D) Branch testing

**S8.** Review'a katılan kişinin belgenin üzerinde tek başına anomali notları hazırlaması hangi aşamadır?  
A) Fixing · B) Individual review · C) Deployment · D) Test execution

**S9.** Test pyramid'in üst kısmındaki testler çoğunlukla nasıldır?  
A) Daha geniş, yavaş ve bağımlılıkları fazla · B) En izole ve en küçük · C) Yalnız requirement review · D) Her zaman statement testleri

**S10.** Exploratory, usability ve UAT daha çok hangi Agile testing quadrant'ında anılır?  
A) Q1 · B) Q2 · C) Q3 · D) Q4

**S11.** Düzeltme sonrası önceki bozuk davranış düzelmiş mi diye aynı testin tekrar edilmesi?  
A) Confirmation · B) Product risk identification · C) Static analysis · D) Contract acceptance only

**S12.** Test ortamının hazır olmaması hangi risk türüdür?  
A) Project risk · B) Product defect olarak zorunlu · C) Test type · D) Component level

**S13.** Testler şu öğeleri kapsıyor: T1={A,B}, T2={B,C,D}, T3={D,E}. **Additional coverage** için ilk seçim hangisi?  
A) T1 · B) T2 · C) T3 · D) Hepsi eşit

**S14.** Bir test sadece kullanıcı arayüzünde “yetkisiz” düğmesini gizliyor. Hangisi en doğru sonuçtur?  
A) Backend authorization kesin doğrulandı · B) UI davranışına sınırlı kanıt sağlandı, backend sınırı ayrıca doğrulanmalı · C) Tüm product risk sıfır · D) Yalnız smoke gerekir

### Gerekçeli cevap anahtarı

| Soru | Doğru | Neden? |
|---|---|---|
| S1 | **B** | Çalıştırılmayan gereksinim erken incelenir. A/C/D bu davranışı karşılamaz. |
| S2 | **B** | TDD küçük başarısız test → çalışan kod → düzenleme döngüsüdür. |
| S3 | **A** | Test nesnesi izole küçük bileşendir. Diğer seviyeler daha farklı amaç/sınırlar taşır. |
| S4 | **C** | Ürün ile dış servis arasındaki entegrasyon hedeflenir. |
| S5 | **B** | API arayüzdür; test level test nesnesine göre değişebilir. |
| S6 | **A** | Inspection'daki özel rol kısıtı; diğer çiftler bu kurala karşılık gelmez. |
| S7 | **A** | Walkthrough çoğunlukla yazar tarafından yönetilir. |
| S8 | **B** | Bireysel review, ortak analysis görüşmesinden önce anomalileri hazırlar. |
| S9 | **A** | Üstte daha geniş ve genellikle maliyetli akışlar, altta daha küçük/izole kontroller. |
| S10 | **C** | Q3 business-facing ve critique-the-product yönelimlidir. |
| S11 | **A** | Bilinen kusurun düzeldiği doğrulanır; yan etkiler ayrı regression sorusudur. |
| S12 | **A** | Test faaliyetinin yürütülmesini engelleyen proje riskidir. |
| S13 | **B** | İlk adımda üç yeni öğe (B,C,D) sağlar; diğerleri ikişer öğe kapsar. |
| S14 | **B** | UI gizleme, backend erişim kontrolü kanıtı değildir. |

## E. Kaynaklar ve ilerideki kapsam

- [ISTQB CTFL resmî sayfası ve örnek sınavlar](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISTQB resmî glossary](https://glossary.istqb.org/)
- CTFL v4.0.1 **Chapter 2 ve Chapter 3** bu Increment'in temel öğretim alanlarıdır. Chapter 5'in test pyramid, quadrants, risk ve prioritization öğeleri de desteklenir.
- **Chapter 5'in plan, estimation, monitoring, reporting, configuration ve defect management** gibi ayrıntıları bu dokümantasyonla bitmiş sayılmaz; sonraki Incrementlerin syllabus kontrolünde açık tutulur.

**Dokümanı okumak veya bu cevap anahtarını görmek bağımsız sınav başarısı ve uygulamalı mastery kanıtı değildir.** Bu çalışma, yeni bir problemi kendi gerekçenle çözme yeteneğini geliştirmek için bir araçtır.
