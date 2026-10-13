# I5 Çalışma Atölyesi — API, UI & Failure Engineering

> **Kullanım:** Önce [30–37. dersleri](../06-api-and-ui-testing/01-http-api-contract-and-observable-behavior.md) oku. Bu dosyada aynı riskleri API contract, authorization, UI state, idempotency ve CI failure evidence boyunca takip edeceğiz. Mülakat ve isteğe bağlı sınav tekrarları **ana derslerden ayrı** durur.

## A. Bütünleşik vaka — MiniShop checkout

**Bu çalışmanın onaylı örnek kuralları:**

- ACTIVE üye için kupon sonrası sepet ≥100,00 € ve STANDARD kargo → 0 €;
- EXPRESS her durumda 10 €;
- Kullanıcı yalnız kendi siparişine erişebilir;
- Bir mantıksal ödeme, idempotency key ile tekrar gelse bile **tek charge** üretir;
- Sipariş tamamlandığında state PAID olur;
- UI, ödeme sonucunu doğru ve anlaşılır şekilde gösterir.

Bunlar **öğretici iş kurallarıdır**; gerçek ürün API'si veya canlı ödeme sağlayıcısı değildir.

### Adım 1 — Contract'tan test condition üret

API örneği:

~~~http
POST /api/orders
Authorization: Bearer <TEST_TOKEN>
Idempotency-Key: order-payment-101
Content-Type: application/json

{"basketId":"basket-101","delivery":"STANDARD"}
~~~

Bu örnek için **beklenen başarı durumu ve response schema**, ürün sözleşmesi onaylandıktan sonra kesinleştirilmelidir. Örneğin 201 Created, yeni order ID ve doğru shippingMinor döndürülmesi seçilebilir; ancak “201 her zaman olacak” evrensel kural değildir.

| Test condition | Veri | Kontrol |
|---|---|---|
| ACTIVE, STANDARD, net 100 € | Test-owned basket | 0 € shipping |
| ACTIVE, STANDARD, net 99,99 € | Test-owned basket | 5 € shipping |
| ACTIVE, EXPRESS, net 120 € | Test-owned basket | 10 € shipping |
| A, B siparişi GET | A/B ayrı hesaplar | DENY + sızıntı yok |
| Aynı ödeme tekrar | Aynı idempotency key | Tek charge + tutarlı state |

**İlk karar:** 99,99/100/100,01 gibi ayrıntılı boundary varyasyonlarını küçük component/API testlerinde; kullanıcıya gösterilen ana checkout sonucunu az sayıda UI E2E testinde tut.

### Adım 2 — Authentication ve authorization ayır

~~~text
AuthN: Kim çağırıyor? → User A
AuthZ: Kaynağa erişebilir mi? → Order belongs to User B → DENY
~~~

Negatif testte:
- A token'ıyla B order ID'sini gönder;
- sözleşmenin belirlediği 403/404 davranışını doğrula;
- response'ta B'ye ait gizli veri yok;
- B'nin order state'i değişmedi.

**Açık risk:** UI'da edit butonunun gizli olması backend authorization'ı kanıtlamaz.

### Adım 3 — Idempotency ve timeout

İlk ödeme gerçekte provider'da tamamlanıyor ama response kayboluyor. Client aynı key ile tekrar deniyor.

**Beklenen invariant:** Aynı mantıksal ödeme için yalnız bir charge.

**Test planı:**
1. İlk istek;
2. aynı key + aynı payload ile tekrar;
3. aynı key + farklı payload;
4. uygun kontrol altında eşzamanlı tekrar;
5. her durumda charge count, amount, order state ve response contract'ı gözleme.

**Kontrollü stub neyi kanıtlar?** Uygulamanın belirli success/failure response'a tepkisini. **Neyi kanıtlamaz?** Gerçek ödeme sağlayıcısının retry/transaction garantisini. Bunun için ayrı system integration kanıtı gerekir.

### Adım 4 — UI, API ve browser state bir arada

Kullanıcı ödeme sayfasında “Payment successful” gördü. Tek başına bu mesaj:
- tek charge oluştuğunu;
- sipariş sahibi doğru olduğunu;
- backend'in doğru state tuttuğunu;
- yanıtın tekrar gönderilmediğini

kanıtlamaz.

**Seçilmiş UI senaryosu:** Test-owned müşteriyle checkout, doğru görünen tutar, doğru onay mesajı ve sipariş referansı.

**API/integration senaryosu:** Order state PAID, doğru owner/amount, tek charge.

**Browser state senaryosu:** Reload veya back sonrası beklenmeyen ikinci ödeme yaratılmaması.

### Adım 5 — Failure: “Expected 0 EUR, got 5 EUR”

Ürün değişmediği halde test bazen FAIL.

| Hipotez | Kontrol |
|---|---|
| Test fixture'da kupon USED | Başlangıç state ve test-owned ID |
| UI eski basket response'u gösteriyor | Browser network + DOM timeline |
| Pricing Service yanlış eşik | Aynı input'la component/API |
| Cypress selector yanlış alanı okuyor | Locator scope/teklik |
| Paralel job çakışması | Run ID ve worker kayıtları |
| Yeni business rule uygulandı | Product owner onaylı güncel contract |

**Düzeltme yöntemi:** Kanıt toplama → tek hipotezli deney → root cause → kalıcı fix → confirmation + regression.

### Adım 6 — CI raporu yaz

Örnek bir rapor iskeleti:

> “Build [SHA] / test run [ID]: ACTIVE + STANDARD + net 100 € için beklenen shipping=0 €, actual=5 €. Başlangıç sepeti ve kupon state'i [kanıt] ile doğrulandı. API response [değer], UI [değer]. İlk yeniden üretim sonucu [gözlem]. Root cause [doğrulandı / araştırılıyor]. Kalan risk [açık boşluk].”

Bu, **gerçek çalışma sonucu değildir**. Sadece kanıtın hangi alanlarda raporlanacağını gösterir.

---

## B. Bağımsız transfer — DocumentHub

Yeni ürün, aynı düşünme biçimi:

**Onaylı eğitim kuralları:**
1. ACTIVE kullanıcı kendi PENDING belgesini düzenleyebilir.
2. APPROVED belge değiştirilemez.
3. Başka kullanıcının belge içeriği hiçbir zaman açıklanmaz.
4. Yükleme tekrar isteklerinde aynı upload identity'si için tek belge kaydı korunur.
5. Upload asenkron işlenebilir; ACCEPTED sonucu işin tamamlandığı anlamına gelmez.

**Görev:**
1. İki pozitif ve üç negatif API test condition yaz.
2. A/B actor × document owner × state matrisi oluştur.
3. Bir idempotency ve bir concurrency senaryosu yaz; doğru invariant'ı açıkla.
4. Bir browser state/UX testi seç; API sonucundan farkını açıkla.
5. CI'da yalnız paralel çalışmada “document already approved” hatası alıyorsun. Üç hipotez ve deney tasarla.
6. Hangi testleri stub ile çalıştırabileceğini, hangi gerçek integration riskinin açık kaldığını belirt.

### Örnek değerlendirme

**Pozitif:** A kendi PENDING belgesini düzenler ve yeni içerik persist edilir; reviewer tanımlı rol ile PENDING belgesini APPROVED yapar (reviewer yetkisi örnek sözleşmeye eklendiyse).

**Negatif:** A, B belgesini GET dener; A kendi APPROVED belgesini PATCH dener; oturumsuz kullanıcı belgeyi okumaya çalışır.

**Matris:** A + kendi PENDING → ALLOW; A + kendi APPROVED → DENY; A + B PENDING → DENY; A + B APPROVED → DENY.

**Idempotency:** Aynı upload key ile iki kez istek → tek belge kaydı. **Concurrency:** Aynı key ile yakın zamanlı iki istek → yine tek kayıt. Her iki durumda response status sözleşmeye, side effect invariant'a göre kontrol edilir.

**UI:** Asenkron upload sırasında kullanıcıya PENDING gösterilmesi; terminal sonucun anlaşılır güncellenmesi. HTTP 202 **dosyanın hazır olduğu** anlamına gelmez.

**CI failure:** Shared document ID; yanlış cleanup; gerçek concurrent state update defect'i. Deneyler: isolated ID ile aynı paralellik, cleanup scope logu, controlled concurrent update ve DB version kayıtları.

**Stub sınırı:** UI'nın 202 veya hata response'ına verdiği reaksiyon stub'la kontrol edilebilir; gerçek upload storage/DB transaction ve authorization garantisi için uygun integration/system test gerekir.

**Öz değerlendirme:** Örnek çözümün kelimelerini tekrarlamak değil, farklı ürün verisiyle **beklenen sonucu nereden aldığını** gerekçelendirmek hedeflenir.

---

## C. English interview rehearsal

Bunlar kişisel deneyim iddiası değil, teknik cevabı kurmak için örneklerdir.

**1. How do you design an API test?**  
“I start from the API contract and business rules, select positive, negative and boundary conditions, then verify status, response schema, business values and important state changes.”

**2. Is a 200 response enough to pass an API test?**  
“No. It confirms an HTTP success status, but not necessarily the correct resource, calculation, authorization or persistence.”

**3. How do authentication and authorization differ?**  
“Authentication establishes who the caller is; authorization determines whether that caller can perform a specific action on a specific resource.”

**4. How would you test an IDOR/BOLA risk?**  
“I create two controlled users and a resource owned by one of them, then attempt access with the other user's identity. I verify the agreed denial, no data leakage and no unauthorized state change.”

**5. What is idempotency in payment APIs?**  
“It means retrying the same logical payment should not cause duplicate business effects. I verify response behavior and the persisted charge count, not just the status.”

**6. What is the difference between cy.request and cy.intercept?**  
“cy.request sends a direct HTTP request from the Cypress Node process. cy.intercept observes or stubs network requests made by the browser application, not cy.request calls.”

**7. How would you test an asynchronous API?**  
“I verify the accepted response and job identity, then observe progress to an expected terminal state within a bounded period and validate the final result.”

**8. How do you investigate a flaky test?**  
“I capture the failure context, reproduce it, separate product, test and environment hypotheses, change one variable and verify a permanent fix across isolated and parallel runs.”

**9. What belongs in a useful CI failure report?**  
“The commit, job and test, environment, expected and actual results, test data identity, relevant logs/artifacts and the status of the root-cause investigation.”

**10. How do you decide which failures block a release?**  
“I relate them to business impact, confidence and unverified risks. I make the evidence and technical recommendation explicit, while accountable stakeholders decide on risk acceptance.”

---

## D. İsteğe bağlı ISTQB Foundation pekiştirme

Bu alıştırmalar **özgündür**, resmî ISTQB soruları değildir. API güvenliği, Cypress komutları, idempotency ve CI investigation'ın ayrıntılarını **CTFL v4.0.1'in birebir sınav kazanımları** olarak sunmuyoruz. CTFL ile kesişim: test basis, test levels, test data, defects, test execution ve automation benefits/risks.

**S1.** API 200 döndü ancak istenenden farklı sipariş id geldi. Doğru yorum?  
A) PASS · B) Status uygun olabilir ama iş davranışı başarısızdır · C) Sadece UI sorunudur · D) Test oracle gerekmez

**S2.** A oturumuyla B'nin özel kaydını okuyabilmek hangi temel risktir?  
A) Performance · B) Object-level authorization · C) Localization · D) Statement coverage

**S3.** HTTP 202 Accepted için doğru ifade?  
A) İşi tamamladı · B) İstek kabul edildi, asenkron iş henüz tamamlanmamış olabilir · C) Her zaman başarısız · D) Client token gereksiz

**S4.** Negatif API testinde neden yalnız hata status'u yeterli olmayabilir?  
A) Status her zaman değişir · B) Yasak yan etki oluşmamış olmalı · C) UI zorunludur · D) Sadece GET önemlidir

**S5.** cy.request ile yapılan isteği cy.intercept route'unun yakalaması beklenir mi?  
A) Evet · B) Hayır, network yolları farklıdır · C) Her zaman Firefox'ta · D) Yalnız status=200'de

**S6.** İki test aynı kuponu farklı sırayla kullanıp FAIL/PASS oluyorsa ilk hipotez?  
A) Shared state/order dependency · B) Sıfır risk · C) Mutlaka HTTP 502 · D) Cypress selector doğru

**S7.** Cypress query retry ile bütün testin otomatik rerun olması aynı mı?  
A) Evet · B) Hayır, farklı yürütme sınırlarıdır · C) Sadece localde aynı · D) İkisi de hiçbir assertion çalıştırmaz

**S8.** CI yalnız dependency install aşamasında fail. İlk bakılacak yer?  
A) Ürün pricing function · B) Setup/install step logu · C) Gherkin When · D) Kullanıcı ekranı

**S9.** Test runner retry sonrası PASS verdi. En doğru yaklaşım?  
A) İlk failure silinir · B) İlk failure kanıtı korunur ve kök neden araştırılır · C) Tüm testler kaldırılır · D) Release zorunlu onaylanır

**S10.** Tester “Bu ödeme testinde gerçek sağlayıcı stub'landı” diyor. Neyi kanıtlamadık?  
A) Uygulamanın stub response'a tepkisini · B) Gerçek provider contract ve işleme etkisini · C) Bir assertion yazabildiğimizi · D) Error mesajını işleyebildiğimizi

### Açıklamalı cevap anahtarı

| Soru | Yanıt | Gerekçe |
|---|---|---|
| S1 | **B** | Business ID oracle'ı yanlış; 200 tek başına güvence değil. |
| S2 | **B** | Actor–resource izin kontrolü eksikliği. |
| S3 | **B** | 202 işi bitirmiş olma garantisi değildir. |
| S4 | **B** | Veri bütünlüğü ve gizlilik için side effect ayrı gözlenir. |
| S5 | **B** | cy.intercept browser trafiğiyle çalışır, cy.request doğrudan HTTP gönderir. |
| S6 | **A** | Test sırası farklı sonucu tetikliyorsa paylaşılmış durum şüphelidir. |
| S7 | **B** | Query/assertion retry ile whole-test retry aynı mekanizma değildir. |
| S8 | **B** | Test bile başlamadan kurulum fail etmiş olabilir. |
| S9 | **B** | Rerun geçmesi ilk failure'ı açıklamaz. |
| S10 | **B** | Stub gerçek provider behavior'ını yürütmez. |

---

## E. Kaynaklar ve çalışma sınırı

- [Cypress — Network Requests](https://docs.cypress.io/app/guides/network-requests)
- [Cypress — cy.request](https://docs.cypress.io/api/commands/request)
- [Cypress — cy.intercept](https://docs.cypress.io/api/commands/intercept)
- [MDN — HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [OWASP API Security Top 10 — 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [GitHub Actions — Monitoring workflows](https://docs.github.com/en/actions/how-tos/monitor-workflows)
- [ISTQB CTFL Foundation](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

**Dürüst yeterlilik kaydı:** Bu içerik hazırlanmış dokümantasyondur. Gerçek endpoint'e istek atılmadı; çalışan Cypress projesi kurulmadı; CI run veya hata giderimi yürütülmedi; Selman'ın bağımsız çözüm/H0 kanıtı oluşmadı.
