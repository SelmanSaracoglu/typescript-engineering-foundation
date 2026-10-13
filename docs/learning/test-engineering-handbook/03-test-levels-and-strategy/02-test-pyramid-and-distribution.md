# Test Pyramid, Distribution & Agile Testing Quadrants

**Amaç:** Testleri hız, izolasyon, gerçekçilik ve maliyet arasında bilinçli dağıtmak; tekrar eden kontrolleri azaltmak.
**ISTQB CTFL v4.0.1:** FL-5.1.6 (**K1**, test pyramid) ve FL-5.1.7 (**K2**, testing quadrants).

## 1. Technical Foundation

### Test pyramid: bir kalite ölçütü değil, tasarım modeli

Sık kullanılan üç katmanlı model:

~~~text
             /  E2E / UI  \        az; geniş ve pahalı akışlar
            /-------------\
           / Service/API & \      orta; önemli sınır ve entegrasyonlar
          / integration     \
         /-------------------\
        /  Unit / component   \    çok; hızlı, izole ve açıklayıcı kontroller
       /_______________________\
~~~

Şekil **oran zorunluluğu** değil, test dağılımına ilişkin ilk sezgidir. CTFL'ye göre piramidin katman adları değişebilir; original model unit/service/UI, başka bir model component/integration/E2E kullanır.

**Alt seviye:** Daha küçük kapsam, daha çok izolasyon, hızlı tekrar, dar failure localization.  
**Üst seviye:** Daha geniş workflow, daha fazla dış bağımlılık, daha yüksek bakım ve işletme maliyeti; belirli kullanıcı risklerini daha gerçekçi gözler.

Piramidi test **level** terminolojisiyle bire bir eşitleme: “API testing” farklı seviyelerde olabilir. Üst katmana küçük bir takımın gerçekten önemli kullanıcı yolculukları konmalıdır.

### Katman seçimi için trade-off

| Boyut | Component / unit | Integration / service | UI E2E |
|---|---|---|---|
| Hız | Genellikle en hızlı | Orta | Genellikle en yavaş |
| Hata yeri | Yüksek teşhis gücü | Bağlantı katmanını lokalize eder | Çok sayıda olası neden |
| Test isolation | Yüksek | Orta | Düşük |
| Yakalanan tipik kusur | Yanlış iş kuralı | Yanlış mapping, DB transaction, contract | Yanlış UI routing, tam kullanıcı akışı |
| Görmediği şey | Network, env, UI | Tarayıcı ve ürünün tüm akışı | Derin input kombinasyonları ekonomik olmayabilir |

**Double coverage** her zaman gereksiz değildir: Yüksek riskli ödeme tutarının component'te detaylı ve E2E'de bir happy-path doğrulaması mantıklıdır. Ancak aynı 20 boundary değerini hem unit hem UI'da işletmek ek güven yerine bakım yükü getirebilir.

### Anti-pattern'ler ve alternatif modeller

- **Ice-cream cone / inverted pyramid:** Çok ağır manuel UI ve az otomatik düşük seviye test; hızlı feedback ve kök neden araştırması zor olabilir.
- **Testing trophy:** Integration testlerine daha çok vurgu yapan alternatif model; ürün mimarisi ve gözlemlenmek istenen riskle değerlendirilmelidir.
- **Honeycomb:** Dağıtık servis ortamında contract/integration kontrollerini öne çıkaran yaklaşım; her projeye norm olarak dayatılmaz.

Piramide takılıp ürünün önemli **non-functional** (güvenlik, kullanılabilirlik, performans) risklerini unutmak da yanlıştır.

### Agile testing quadrants — iki eksen

**Dikey eksen:** business-facing / technology-facing.  
**Yatay eksen:** support the team (geliştirmeyi yönlendirir) / critique the product (çıktıyı değerlendirir).

| Quadrant | Yönelim | Örnek aktiviteler |
|---|---|---|
| **Q1** | Technology-facing × support team | Unit/component, component integration, CI testleri |
| **Q2** | Business-facing × support team | Acceptance examples, functional scenarios, user stories, API davranış örnekleri |
| **Q3** | Business-facing × critique product | Exploratory, usability, UAT |
| **Q4** | Technology-facing × critique product | Smoke, performance, security gibi non-functional kontroller (usability hariç) |

**Q1/Q2 geliştirmenin doğru ürün geliştirmesine destek; Q3/Q4 mevcut ürüne eleştirel bakış** sağlar. Quadrant **çalıştırılma sırası** veya zorunlu dört takım ayrımı değildir. Bir test türü farklı bağlamda birden fazla amaca hizmet edebilir.

## 2. Engineering Perspective

### Bir sipariş akışında dağılım önerisi

- **Component:** İndirim ve kargo hesaplamasında EP/BVA/decision table testleri.
- **Integration:** Ödeme kayıt başarısızlığında rollback ve audit tutarlılığı.
- **System/API:** Sipariş oluşturma/iptal davranışı.
- **E2E:** Başarılı satın alma ve kritik bir hata/geri alma akışı.
- **Q3:** Kullanıcının beklenmedik geri navigasyonunu, anlaşılmaz mesajları araştır.
- **Q4:** Eşzamanlı talep/ödeme gecikmesi ve yetkisiz veri görünürlüğü.

Bu bir **örnek stratejidir**; test adedini sayısal hedef olarak kopyalama. Gerçek uygulamanın teknoloji sınırları, test veri izolasyonu ve riskine göre değiştir.

### CI tasarımı için sezgi

PR aşamasında hızlı, deterministik suite; merge/release aşamasında maliyetli entegrasyon ve kritik E2E; gecelik/periodic aşamada daha uzun non-functional kontroller düşünülebilir. Ancak **gecikmiş yüksek riskli test**, yanlış release kararına yol açıyorsa daha erkene alınmalıdır. Her CI failure otomatik ürün defect'i değildir.

## 3. Practical Scenario — suite maliyetini düşür

Bir projede her fiyat sınırı için 40 UI E2E testi var; her biri 45 saniye, flaky çevre sorunları mevcut. Aynı hesaplama fonksiyonu deterministik ve bağımsız test edilebiliyor.

**İyileştirme planı:**
1. Fiyat kurallarını küçük component testlerine taşı (40 sınır/decision varyasyonu).
2. Gerçek service + DB bağlantısı için birkaç integration testi bırak.
3. UI'da fiyatın doğru gösterildiği ve checkout'un tamamlandığı kritik birkaç akış koru.
4. Başlangıç/sonrası çalıştırma süresi, false failure sayısı ve kaçırılan defect türlerini karşılaştır.

**Dikkat:** UI'ya özel tutar formatlama kusuru component price function'ıyla yakalanmaz; bu nedenle bütün UI testlerini silmek de hatadır.

## 4. Interview Preparation

**Q1: What is the test pyramid and why use it?**  
**A:** “It is a distribution model: many fast and isolated low-level tests, fewer broad and costly end-to-end tests. It helps teams balance confidence, feedback speed and maintenance.”

**Q2: How do you decide whether coverage at multiple levels is duplicate waste?**  
**A:** “I compare the failure modes each test can expose. Detailed rule variations belong low; a few broader flows verify integration. Overlap is justified when it protects a distinct high-risk boundary.”

**Q3: How do the Agile testing quadrants differ from test levels?**  
**A:** “Quadrants categorize testing by business versus technology focus and by supporting development versus critiquing the product. Levels categorize the test object and scope. They are complementary, not the same axes.”

## 5. CTFL Practice — özgün sorular

**S1 (K1):** Piramidin üstünde tipik olarak nasıl testler bulunur?  
A) Küçük, çok hızlı ve en izole · B) Geniş kapsamlı ve görece maliyetli E2E · C) Yalnız statik review · D) Kod derleme hataları  
**Yanıt: B.** Diğerleri üst katmanın tipik özellikleri değildir.

**S2 (K2):** Product owner'ın kabul örneklerini test ekibiyle yazması hangi quadranta daha yakındır?  
A) Q1 · B) Q2 · C) Q3 · D) Q4  
**Yanıt: B.** İş odaklıdır ve geliştirmeyi destekler.

**S3 (K2):** Üretime yakın sistemde performans/kapasite kontrolü hangi quadranta en uygundur?  
A) Q1 · B) Q2 · C) Q3 · D) Q4  
**Yanıt: D.** Technology-facing ve ürünü eleştirel değerlendiren non-functional test.

**S4 (K2):** Test pyramid, API testlerinin mutlaka hangi katmanda olacağını emreder?  
A) Unit · B) Integration · C) E2E · D) Hiçbirini; test object ve amaç belirler  
**Yanıt: D.** API bir erişim arayüzüdür, otomatik level değildir.

## Sonuç ve kaynak

**Test sayısını değil testlerin ortaya çıkardığı riskleri, hızlı geri bildirimi ve bakım maliyetini optimize et.**

- [Levels & Types](01-unit-component-integration-api-e2e.md) · [Risk-based Strategy](03-risk-based-test-strategy.md)
- [ISTQB CTFL v4.0.1 §§5.1.6–5.1.7](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
