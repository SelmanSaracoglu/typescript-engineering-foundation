# Unit, Component, Integration, API & E2E — Test Levels and Types

**Amaç:** “Bu davranış nerede ve neden test edilmeli?” sorusunu test nesnesi, risk, hız ve teşhis gücüne göre cevaplamak.
**ISTQB CTFL v4.0.1:** FL-2.2.1 (K2), FL-2.2.2 (K2). **Önemli:** CTFL'nin resmî beş test seviyesi ile sektörde kullanılan “API test/E2E” adlarını karıştırma.

## 1. Technical Foundation

### CTFL'nin beş test seviyesi

Test level, benzer **amaç, test object, test basis, hata türleri, sorumluluklar** etrafında düzenlenmiş test faaliyetlerinin düzeyidir.

| CTFL test level | Test object / esas amaç | Örnek |
|---|---|---|
| **Component testing** (*unit*) | Tek fonksiyon/sınıf/modülün izole davranışı | `calculateDiscount(100, 10)` sonucu |
| **Component integration testing** | İç bileşenler arasındaki arayüz ve etkileşim | Service'in repository hata sonucunu yönetmesi |
| **System testing** | Tam ürünün işlevsel ve non-functional davranışı | Uygulamanın sipariş oluşturma akışı |
| **System integration testing** | Ürünün dış servis/sistemlerle arayüzü | Sipariş sisteminin gerçek sandbox ödeme sağlayıcısına gönderimi |
| **Acceptance testing** | Kullanıcı/iş/operasyonel/kural gereksinimlerine göre kabul veya release uygunluğu | Product owner'ın onaylı iade iş kuralını doğrulaması |

**Acceptance çeşitleri:** UAT, operational acceptance, contractual/regulatory acceptance, alpha/beta testing. Acceptance yalnız UI üzerinden manuel tıklama değildir; uygun ortam, kullanıcı ve amaç testin türünü belirler.

**Bir düzey diğerini otomatik içermez.** Component testte doğru hesaplama ile ödeme sağlayıcısının yanlış field mapping'i tespit edilemez. System testlerinde basit hesaplamayı yüzlerce kez yeniden doğrulamak da gereksiz olabilir.

### Sektör sözlüğü: API, component, integration, E2E

- **Unit:** Genellikle izole küçük davranış; CTFL component testing ile örtüşür.
- **Component:** Bazen UI component (React form) anlamında kullanılır; CTFL'de daha genel “izole bileşen”dir.
- **Integration:** CTFL'ye göre içeride bileşenler arası **component integration** veya dış sistemler arası **system integration** olabilir. “Integration testi” demek bunları ayırmaya tek başına yetmez.
- **API test:** **Test edilen arayüz / erişim yöntemi** tanımlar; tek başına ayrı CTFL test seviyesi değildir. İzole API route testi component, service+DB testi component integration, uçtan uca ürün API davranışı system, partner API erişimi system integration, iş kabulü açısından API testi acceptance olabilir.
- **E2E:** Birçok bileşenden geçen uçtan uca iş akışı için kullanılan **kapsam etiketi**; genelde system-level, dış sistem de dahilse system integration boyutuna da dokunabilir. E2E ile mutlaka browser/UI kastetmek yanlıştır.
- **Contract test:** Üretici/tüketici sözleşmesi uyumluluğunun kontrolü; arayüz, izolasyon ve kimin katıldığına göre sınıflandırılır.

### CTFL test types başka bir eksendir

| Test type | Hangi soruyu sorar? |
|---|---|
| **Functional** | Ürün **ne** yapmalı? |
| **Non-functional** | Bunu **ne kadar iyi** yapıyor: performance, security, usability, reliability vb.? |
| **Black-box** | Dış requirement/contract'a göre davranış doğru mu? |
| **White-box** | İç yapının hangi statement/branch/flow öğeleri test edildi? |

Bunlar test seviyeleri ile dik kesişebilir: **component-level functional white-box test**, **system-level non-functional performance test**, **acceptance-level black-box test** mümkün. Ayrıca “regression” bir **değişiklik sonrası test amacı**, tek başına seviye veya yukarıdaki dört CTFL test type'ından biri değildir.

### Seviye seçiminde beş parametre

1. **Test object:** Hesaplama mı, service/DB entegrasyonu mu, üçüncü taraf mı, bütün ürün mü?
2. **Failure localization:** Test düşerse hangi bileşene odaklanacağız?
3. **Speed/cost:** Bağımsız tekrar ve CI geri bildirim süresi.
4. **Realism/observability:** DB side effect, network contract, kullanıcı yolculuğu gerçekten gözleniyor mu?
5. **Risk/oracle:** Beklenen sonuç hangi onaylı kuraldan geliyor?

## 2. Engineering Perspective — aynı iş kuralı, farklı kanıt

İş kuralı: “Aktif üye, 100 € ve üstü standart kargoda ücretsiz kargoya hak kazanır.”

| Seviye/arayüz | Kontrol | Neyi kanıtlar / kanıtlamaz? |
|---|---|---|
| Component | `shippingFee(member,total,type)` doğru değer veriyor mu? | İş mantığını kanıtlar; DB/HTTP değil |
| Component integration | Service, repository'den gelen üyelik durumunu doğru kullanıyor mu? | Bileşen sınırını kontrol eder; browser değil |
| System (API üzerinden) | HTTP request iş kuralını ve response'u doğruluyor mu? | Ürün API davranışını kontrol eder; kullanıcı UI'sini değil |
| System (UI E2E) | Sepette doğru ücretsiz kargo bilgisi gösteriliyor mu? | Ana kullanıcı akışını gözler; her aralığın ideal test yeri değil |
| System integration | Harici lojistik servis ücretini doğru alıyor mu? | Dış sağlayıcıyla eşleşmeyi kontrol eder; ödeme settlement değil |
| Acceptance | Product owner'ın onaylı örnekleri karşılandı mı? | İş beklentisini doğrular; tüm güvenlik kusurları yok demek değil |

**Örnek yanlış karar:** “100 €, 101 €, 200 €, null, boş, format hatası” varyasyonlarını aynı browser E2E suite'ine koymak. Bu, ilgili davranışın düşük katmanda hızlı ve izole test edilebildiği durumda tekrarlı, yavaş ve kırılgan olabilir.

**Mühendislik kuralı:** Bir risk için **en düşük yeterli test sınırını** seç, daha üst düzeyde gerçek birleşimin bozulabileceği birkaç kritik senaryo bırak. “Her şey unit” de hatalıdır çünkü entegrasyon kusurları gerçek risklerdir.

## 3. Practical Scenario — authorization

İş kuralı: “Kullanıcı yalnız kendine ait kaydı düzenleyebilir.”

- Component: `canEdit(actor, owner)` true/false tablosu.
- Integration: Backend service kullanıcı kimliğini **güvenilir kaynaktan** alıyor mu; DB ownership kontrolü doğru mu?
- System/API: Diğer kullanıcının ID'siyle UPDATE → 403/404 gibi **onaylı sözleşmeye** uygun ret, state değişmemesi.
- UI: Düzenleme düğmesinin gizlenmesi kullanılabilirlik kanıtıdır; **backend yetkilendirmesi değildir**.
- Security: Yetkili/izinsiz varyasyonlar AppSec çalışmasında ayrıca derinleştirilecektir.

## 4. Interview Preparation

**Q1: What is the difference between unit, integration and E2E tests?**  
**A:** “Unit tests focus on isolated components, integration tests verify interactions, and end-to-end tests exercise broader workflows. I use the smallest level that can expose the relevant risk, then add a few realistic end-to-end checks.”

**Q2: Is API testing a separate test level?**  
**A:** “Not necessarily. API describes the interface used. An API test may verify a component, integrated services or a complete system, depending on what is included and the test objective.”

**Q3: How would you choose a test level for an authorization rule?**  
**A:** “I would test pure policy logic at component level, its enforcement with identity and persistence at integration level, and selected unauthorized requests at API/system level. Hiding a UI button is not sufficient.”

## 5. CTFL Practice — özgün sorular

**S1 (K2):** “Sipariş servisinin dış ödeme sağlayıcısıyla protokol ve veri uyumunu doğrulama” CTFL'de en doğrudan hangi level?  
A) Component · B) Component integration · C) System integration · D) Acceptance  
**Yanıt: C.** Sistem sınırının dışındaki servis entegrasyonu test edilir. B daha çok iç bileşenler arasını hedefler.

**S2 (K2):** Hangisi bir test level yerine **test type** örneğidir?  
A) Acceptance · B) System integration · C) Component · D) Non-functional  
**Yanıt: D.** Diğerleri CTFL test seviyeleridir.

**S3 (K2):** Tek bir HTTP endpoint'i, service+DB ile birlikte deniyorsun. En doğru yorum?  
A) API testing zorunlu olarak altıncı CTFL seviyesidir · B) Test sınırına göre integration/system olabilir · C) Sadece E2E UI sayılır · D) Her zaman acceptance'tır  
**Yanıt: B.** Sınıflandırma endpoint varlığına değil test object ve amacına bağlıdır.

## Sonuç ve kaynaklar

**Level = neyi hangi sınırda test ediyoruz; type = hangi kalite/analiz boyutuna bakıyoruz; API/E2E = kullanılan arayüz veya geniş iş akışı etiketidir.**

- [Test Pyramid](02-test-pyramid-and-distribution.md) · [Risk-based Strategy](03-risk-based-test-strategy.md) · [Regression](04-regression-smoke-sanity-and-exploration.md).
- [ISTQB CTFL v4.0.1 §2.2](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
