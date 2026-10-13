# I3 Çalışma Atölyesi — Güvenilir test tasarlamak

> **Bu dosya isteğe bağlı ikinci aşamadır.** Önce [17–22. dersleri](01-test-data-design-and-lifecycle.md) oku. Burada yeni kavram öğretmekten çok, öğrendiklerimizi aynı mühendislik probleminde birlikte kullanıyoruz. Mülakat ve sertifika perspektifi **ana derslerin dışında** tutulur.

## A. MiniShop vakası: “Aynı test bazen geçiyor”

MiniShop ekibinin test suite'inde bir sorun var:

> “Kupon yalnız bir kez kullanılabilir. Test tek başına geçiyor ama tam suite çalıştırıldığında bazen ‘Coupon already used’ ile başarısız oluyor.”

Kurallar:
- Kupon `AVAILABLE` durumunda kullanılabilir;
- Başarılı sipariş sonunda `USED` olur;
- `USED` kupon ikinci siparişte reddedilir;
- Başarısız işlemde veri tutarlı kalmalıdır.

**Sistem parçaları:**

~~~text
Order Service
    ├── Coupon Repository
    ├── Pricing Service
    ├── Payment Provider
    └── Notification Service
~~~

### Adım 1 — Gizli önkoşulu bul

Eski testler `coupon-test-001` adlı **ortak** kuponu kullanıyor.

| Test | Başlangıç varsayımı | Gerçekte ne olabilir? |
|---|---|---|
| T1 — İlk kullanım | Kupon AVAILABLE | AVAILABLE → USED |
| T2 — Eşik hesabı | Kupon AVAILABLE | T1 daha önce koştaysa USED |
| T3 — Tekrar kullanım | Kupon USED | Test sırası değişince AVAILABLE |

**Sorun:** Testler kendi verilerini kurmuyor; **bir başka testin bıraktığı state'i** gizli input olarak kullanıyor.

**Çözüm:** T1, T2 ve T3 için ayrı kuponlar oluştur. T3'ün başlangıç kuponu kendi setup'ında USED olmalı; T1'e bağımlı olmamalı.

### Adım 2 — Test data factory tasarla

**Pseudo-code:**

~~~typescript
const coupon = await createCoupon({
  ownerId: testCustomer.id,
  status: "AVAILABLE",
  amount: 20,
  id: uniqueIdForThisTest()
});
~~~

Gerekenler:
- Teste özgü `customerId`, `couponId` ve varsa `orderId`;
- Kuponun başlangıç state'inin doğrulanması;
- Test sonucunun yanında **yan etkilerin** assert edilmesi;
- Yalnız testin oluşturduğu verinin temizlenmesi.

**Dikkat:** `uniqueIdForThisTest()` ve `createCoupon()` örnek adlardır; proje kodunda tanımlı fonksiyonlar oldukları iddia edilmiyor.

### Adım 3 — Determinism'i sağla

Kuponun son kullanma tarihi de var. Test canlı `new Date()` kullanıyor ve ay sonunda bozulabiliyor.

- Clock'u uygun sınırda kontrol et;
- Son kullanma politikasının timezone'unu onayla;
- Sabit veya seed'i kaydedilmiş test datası kullan;
- Gerçek provider'ı simüle ediyorsan hangi riskin dışarıda kaldığını not et.

**Kontrol:** Tek başına, farklı sırada, paralel ve tekrar koştuğunda testin aynı davranışı sınadığını gösterebilmelisin.

### Adım 4 — Hangi double?

| Dependency | Component testi için tercih | Sınır |
|---|---|---|
| Coupon Repository | In-memory fake veya uygun stub | Gerçek DB constraint'ini göstermez |
| Payment Provider | Kontrollü success/failure stub | Gerçek provider contract'ını göstermez |
| Notification Service | Recording spy/mock | E-postanın teslimini göstermez |
| Clock | Sabit zaman stub | Gerçek timezone altyapısının tümünü test etmez |

**Karar:** Kuponun **gerçek DB'de tek kez tüketilmesi** kritik riskse component fake'i yeterli değildir; seçilmiş **integration** kontrolü gerekir.

### Adım 5 — State ve interaction doğrula

**Test 1:** AVAILABLE kuponla başarılı sipariş:
- Response başarılı;
- Sipariş beklenen toplamda;
- Kupon `USED`;
- Yalnız bir usage/charge kaydı;
- Onaylı kurala göre bildirim gönderme isteği doğru içerikle yaratılmış.

**Test 2:** USED kuponla ikinci sipariş:
- İşlem reddedilir;
- Yeni indirim kaydı oluşmaz;
- Önceki siparişin verisi değişmez.

**Test 3:** Payment Provider başarısız:
- Onaylı iş akışına göre order/kupon state'i;
- Hatalı “başarılı ödeme” bildirimi gönderilmemesi;
- Gerekliyse rollback/retry durumu.

**Belirsizlik uyarısı:** “Başarısız ödemede kupon AVAILABLE kalır mı?” sorusu ürün sözleşmesinde kesinleştirilmeden tek expected result icat edilmez.

### Adım 6 — Failure evidence oluştur

Yetersiz kayıt:
> “Coupon test flaky.”

Daha yararlı rapor:
> “Test B, Test A'dan sonra çalıştırıldığında aynı kuponu USED olarak buluyor; tek başına başladığında AVAILABLE. Test run kimliği ve kupon ID'si kaydedildi. Ayrı test verisiyle A→B, B→A ve paralel koşul tekrarlandı; ortak veri çakışması giderildi.”

Bu, **hipotez + deney + gözlem** içerir. Gerçek run sonucu yalnız testi uyguladıktan sonra böyle raporlanabilir; bu örnek hayalî bir vaka çözümüdür.

---

## B. Bağımsız transfer — belge onay sistemi

Aşağıdaki yeni durumu **çözümü okumadan** ele al.

**İş kuralları (bu örnek için):**
1. Kullanıcı yalnız kendine ait `PENDING` belgeleri düzenleyebilir.
2. Reviewer `PENDING` belgeyi `APPROVED` yapabilir.
3. `APPROVED` belge düzenlenemez.
4. Onay sonrasında kullanıcıya yalnız bir bildirim isteği yapılır.

**Problem:** Bütün testler aynı `document-001` kaydını kullanıyor; CI'da bazen “already approved”, bazen “document not found” failure'ı var.

**Görevler:**
1. Hangi **gizli başlangıç state'leri** testleri birbirine bağlamış olabilir?
2. Her testin kurması gereken **minimum fixture** nedir?
3. `Clock`, `DocumentRepository`, `NotificationGateway` için birer double/gerçek entegrasyon kararı ver.
4. `APPROVED` belgeyi değiştirme negative testinde **iki assertion** yaz.
5. Tester “notification method called once” kontrolüyle hangi şeyi **henüz kanıtlamamış** olur?
6. Tek başına, farklı sıra ve paralel koşul için doğrulama planı öner.

### Örnek çözüm

1. Aynı belgenin durumunu bir test PENDING'den APPROVED yapmış; diğeri silmiş olabilir.
2. Her test kendi `documentId`, owner, reviewer ve beklenen state'ini yaratır.
3. Clock sınıra göre sabit stub; repository için unit'te fake, gerçek persistence kuralı için integration DB; NotificationGateway için recording spy ve gerçek delivery için ayrı integration.
4. Reddedilen işlem response/state kontratına uygun olmalı; belge içeriği ve status **değişmemeli**.
5. Dış sağlayıcının gerçekten bildirimi kabul edip teslim ettiğini kanıtlamaz; yalnız gönderim isteğinin oluştuğunu gösterir.
6. Önce tek başına; sonra A→B/B→A; sonra farklı run/worker identity'leriyle paralel. Her koşuda kurulan ID ve state kayıtları korunur.

**Transfer ölçütü:** “Mock kullandım, izolasyon tamam” cevabı yeterli değil; **hangi sınırın simüle edildiğini ve hangi riskin açık kaldığını** açıklayabilmelisin.

---

## C. English interview rehearsal

Bunlar **gerçek deneyim iddiası değil**, teknik cevabı nasıl kurabileceğine dair örneklerdir.

**1. What makes a test reliable and repeatable?**  
“A repeatable test controls its input, time, data and dependencies. The same defined conditions should lead to the same expected result, including a consistent failure when the product has a defect.”

**2. Why should tests be independent?**  
“Independent tests do not rely on the order or side effects of other tests. I give each test its own data and check that it works alone, in different orders and in parallel.”

**3. What is the purpose of a test fixture?**  
“A fixture provides the required starting data and environment for a test. I keep its scope clear and control setup, ownership and cleanup.”

**4. How do you avoid shared-state problems in CI?**  
“I use test-owned records, unique identifiers, isolated namespaces where needed, and cleanup that only affects data created by that test.”

**5. What is the difference between a stub and a fake?**  
“A stub provides predefined responses. A fake is a simplified working implementation, such as an in-memory repository. Neither proves the real integration.”

**6. What is the difference between a spy and a mock?**  
“A spy records calls for later inspection. A mock defines expected interactions and verifies them. Framework terminology can overlap, so I explain what the test actually checks.”

**7. When do you prefer state verification over interaction verification?**  
“I prefer observable business outcomes and persisted state when those are the requirement. I verify interactions when a boundary call or side effect is itself part of the contract.”

**8. What is over-mocking?**  
“It happens when too much real behavior is replaced or tests become coupled to internal implementation details. It can make tests pass while integration or business behavior remains broken.”

**9. What does a good failure report contain?**  
“The requirement, setup, build, expected and actual result, reproducible steps and relevant response, log or state evidence. I separate observations from hypotheses.”

**10. How would you investigate a flaky test?**  
“I would reproduce it, compare isolated and parallel runs, inspect data and timing, form a specific hypothesis, change one variable and reverify. I would not treat retries as the root-cause fix.”

---

## D. ISTQB Foundation bağlantısı — doğru kapsam sınırı

Bu Increment'in **test doubles sınıflandırması, mocking tasarımı ve parallel isolation** konuları, profesyonel SDET becerisi için önemlidir. Ancak bu başlıkları **CTFL v4.0.1 sınavında ayrı zorunlu konu başlıklarıymış gibi** göstermiyoruz.

CTFL ile doğrudan ilişkili tekrar alanları şunlardır:
- Test implementation ve test data hazırlığı;
- Test execution sırasında expected/actual comparison;
- Testware ve traceability;
- Testing'in sınırlı kanıt sağlaması;
- Test tools ve automation risklerine giriş (ayrıntılı araç bölümü daha sonra).

### Özgün pekiştirme soruları

**S1.** Bir test sonucu başarıyla karşılaştırılıyor ama test datası başka test tarafından değiştirilmiş. En doğru ilk yaklaşım?  
A) Expected sonucu değiştir · B) Önkoşul ve test data ownership'i araştır · C) Sürekli retry ekle · D) Defect'i kesin onayla

**S2.** Bir tester test case'leri çalıştırmadan önce veri ve prosedürü hazırlıyor. Bu hangi test activity'siyle en çok ilişkilidir?  
A) Test implementation · B) Test completion · C) Risk acceptance · D) Static walkthrough

**S3.** Kullanıcı UI'da “Payment successful” görüyor; ancak gerçekte iki charge var. En doğru değerlendirme?  
A) UI mesajı bütün ödeme koşullarını kanıtlar · B) İş riski için veri/ödeme state'i de kontrol edilmelidir · C) Daha çok screenshot yeterlidir · D) Test seviyeleri önemsizdir

**S4.** Bir stub gerçek ödeme sağlayıcısı yerine başarılı yanıt döndürüyor. Hangi iddia **yapılamaz**?  
A) SUT'un success branch'i denenebilir · B) Başarı yanıtında servis mantığı kontrol edilebilir · C) Gerçek sağlayıcının kontratı kesin çalışıyor · D) Dış arıza kontrol altına alınmış olabilir

**S5.** Testlerin %100'ü PASS; ama kuponun iki kez kullanılmasına dair hiç test yok. Ne söylenebilir?  
A) Sıfır defect garantisi · B) Başarılı kontroller hakkında kanıt var, eksik risk açık · C) Ürün kabul edilmiş sayılır · D) Test oracle gereksiz

**S6.** Test sonucu başarısız; fakat tester failure'ın gerçek product defect'i mi data setup problemi mi olduğunu henüz bilmiyor. En iyi sonraki adım?  
A) Doğrudan production defect ilan et · B) Expected sonucu kaldır · C) Evidence topla ve kontrollü hipotez dene · D) Assertion sil

### Cevaplar ve gerekçeler

| Soru | Yanıt | Neden? |
|---|---|---|
| S1 | **B** | Paylaşılan state gizli test girdisidir; diğer seçenekler kanıtı zayıflatır. |
| S2 | **A** | Test veri, prosedür ve ortamının yürütmeye hazırlanması implementation faaliyetidir. |
| S3 | **B** | UI gözlemi tek charge ve kalıcı kayıt doğruluğunu kanıtlamaz. |
| S4 | **C** | Stub gerçek provider ile konuşmaz; contract için ayrı kanıt gerekir. |
| S5 | **B** | Pass oranı yalnız sınanan koşulları anlatır. |
| S6 | **C** | Önce gözlem–hipotez–deney gerekir; failure'ın türünü uydurma. |

Bu sorular **çalışma amacıyla özgün** yazılmıştır. Resmî CTFL örnek sınavının yerine geçmez ve birebir soru dağılımını temsil etmez.

## E. Kaynaklar ve kullanım sınırı

- [Martin Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html): Double türleri, state/behavior verification ayrımı.
- [Microsoft — Unit Testing Best Practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices): İzolasyon, tekrar edilebilirlik, self-checking test.
- [Vitest — Mocking Modules](https://vitest.dev/guide/mocking/modules): Framework seviyesinde mocking/spying; **bu Increment'te kod kurulumu yapılmadı**.
- [ISTQB CTFL resmî sayfası](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/).

Bu atölyedeki pseudo-code ve raporlar **öğretici örneklerdir**; GitHub'da yürütülmüş otomasyon, gerçek CI sonucu veya bağımsız mastery kanıtı değildir.
