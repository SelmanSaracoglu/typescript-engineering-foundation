# 33. Idempotency, Retries & Concurrency — Aynı işlem iki kez gelirse?

> **Temel soru:** Ağda yanıt kaybolduysa ödeme işlemini tekrar göndermek güvenli midir?

Önceki derste **kimin ne yapabileceğini** belirledik. Şimdi aynı yetkili kullanıcının aynı işlemi birden fazla kez yapmasını inceleyeceğiz. Bu sadece performans değil, **işlemsel doğruluk** problemidir.

## 33.1 Ödeme örneği: Yanıt yok ama işlem gerçekleşmiş olabilir

MiniShop kullanıcısı “Öde” düğmesine basıyor.

~~~text
Client ---- POST /payments ----> Payment Service
                         |
                         | Charge başarıyla oluştu
                         v
                      Provider
Client <---- timeout ----X  (yanıt istemciye ulaşmadı)
~~~

İstemci sonucu bilmiyor. Tekrar deniyor. Eğer servis ikinci isteği yeni işlem sanırsa **çift tahsilat** oluşabilir.

**Önemli ayrım:** Timeout, **işlemin başarısız olduğunu** kanıtlamaz. Sadece bu istemcinin belirlenen sürede cevabı almadığını gösterir.

## 33.2 Idempotency nedir?

**Idempotent işlem**, aynı istek tekrarlandığında sistem üzerinde amaçlanan **nihai etkinin** ilk başarılı uygulamadan farklı olmamasıdır.

Örneğin var olan aynı kaynağa aynı PUT isteğini iki kez uygulamak, uygun HTTP semantiğine göre aynı amaçlanan resource state'ini korumalıdır. Yanıt status veya audit logları farklı olabilir; **idempotency tüm gözlemlerin birebir aynı olması değildir**.

**GET:** Safe/okuma semantiği; uygulama gizli side effect üretmemeli.  
**PUT/DELETE:** HTTP yönteminin amaçlanan etkisi bakımından idempotent.  
**POST:** Genel olarak idempotent olmak zorunda değildir. Ödeme POST'u **application-level idempotency key** ile güvenli tekrara uygun hale getirilebilir.

## 33.3 İşlemsel idempotency key

Onaylı örnek API kuralı:

- Client her mantıksal ödeme için benzersiz idempotency key kullanır;
- aynı key + aynı payload tekrar gelirse ikinci bir charge oluşturulmaz;
- aynı key + farklı payload gelirse sözleşmedeki conflict/validation davranışı uygulanır;
- key'in ne kadar süreyle saklanacağı, scope'u ve sonuçların nasıl tekrar döndürüleceği tanımlıdır.

Örnek:

~~~http
POST /api/payments
Idempotency-Key: payment-order-101
Content-Type: application/json

{"orderId":"o-101","amountMinor":10000,"currency":"EUR"}
~~~

**Test case 1 — İlk istek:**
- Bir charge oluşur;
- order state beklenen duruma geçer.

**Test case 2 — Aynı key ve payload tekrarı:**
- İkinci charge **oluşmaz**;
- nihai order/charge state'i tutarlıdır;
- HTTP response sözleşmeye göre olabilir (aynı yanıtın birebir dönmesi bu örnekte ayrıca belirtilmedikçe varsayılmaz).

**Test case 3 — Aynı key, farklı tutar:**
- İşlem sözleşmeye uygun reddedilir;
- **hiçbir ek charge** oluşmaz.

## 33.4 Testi yalnız response'la bitiremeyiz

İkinci çağrı 409 dönüyor olabilir ama altta ikinci payment kaydı oluşmuş olabilir. Bu nedenle **iki katmanlı kanıt** toplarız:

1. **Request/response contract:** status, body, correlation/idempotency key.
2. **Business invariant:** Bir mantıksal işlem için bir charge; doğru tutar ve order state.

**Invariant**, bir iş kuralının farklı olay sıralarında korunması gereken özelliğidir. Burada “aynı ödeme niyeti ikinci charge üretmez”.

Sadece provider stub'u kullanmak gerçek ödeme sağlayıcısının idempotency davranışını kanıtlamaz. Test seviyesini I2'deki gibi seçeriz.

## 33.5 Retry policy ile ürün güvenliği

Retry, geçici hata sonrası aynı işlemi tekrar deneme davranışıdır. Ağ kesintisi ya da 503 gibi geçici durumlar için yararlı olabilir.

Ama şu soruları sormalıyız:
- Hangi hata **retryable**?
- Kaç deneme yapılacak?
- Denemeler arasında bekleme/backoff var mı?
- Bir işlem kısmen başarılıysa ne olur?
- İkinci isteğin yeni ödeme sayılmaması nasıl garantilenir?
- Tekrar sonucunu nasıl gözleriz?

**Yanlış varsayım:** “500 ise retry güvenli, 200 ise her şey tamam.” Özellikle POST işlemlerinde hata kodu ve iş state'i birbirine birebir eşit değildir.

## 33.6 Concurrency: İki istek aynı anda gelirse?

Aynı kupon tek kullanımlık. İki browser sekmesi aynı anda APPLY yapıyor:

~~~text
Request A: coupon AVAILABLE?  → yes
Request B: coupon AVAILABLE?  → yes
Request A: apply discount
Request B: apply discount
~~~

Her iki istek “AVAILABLE” bilgisini **eşzamanlı** okursa ikisi de indirim verebilir. Bu bir **race condition** örneğidir: Sonuç işlemlerin zamanlamasına/yarışına bağlıdır.

Çözüm türleri ürüne göre değişebilir:
- DB transaction/unique constraint;
- atomic update / compare-and-set;
- uygun locking;
- serializable işlem garantisi;
- idempotency ve tekil iş kimliği.

**Tester'ın rolü:** Bu araçlardan birini körlemesine dayatmak değil, **korunacak invariant'ı ve eşzamanlı senaryoyu** tanımlamak. Seçilen implementasyon için uygun doğrulama yapılır.

## 33.7 Eşzamanlı testi nasıl tasarlarız?

Test başlangıcı:
- Teste ait ACTIVE müşteri;
- Tek kullanımlık AVAILABLE kupon;
- Henüz kullanım kaydı yok.

Olay:
- Ayrı iki istek aynı kuponu kullanmayı **olabildiğince eşzamanlı** dener.

Expected:
- Ürün kuralına göre en fazla **bir başarılı kullanım**;
- kullanım sayısı ≤ 1;
- iki siparişte birden kupon indirimi bulunmaz.

**Uyarı:** “İki Promise.all çağrısı yazdım; gerçek race'i kesin tetikledim” demek yanlıştır. Ağ ve server scheduling farklı olabilir. Güvenilir concurrency test tasarımı kontrollü senkronizasyon, tekrarlama ve gözlenebilir state gerektirebilir. Bu Increment çalışma kodu kurmuyor; tasarım mantığını öğretiyor.

## 33.8 Asynchronous processing: 202 ne demek?

Bazı API'ler uzun işi başlatıp HTTP **202 Accepted** döndürür. Bu, **işin bittiğini garanti etmez**.

Eğitim sözleşmesi:

~~~http
POST /api/reports

HTTP/1.1 202 Accepted
{"jobId":"j-12","state":"PENDING"}
~~~

Doğru test:
1. 202 ve jobId formatını doğrular;
2. tanımlı endpoint'ten durumu izler veya event'i bekler;
3. COMPLETED ya da FAILED terminal durumunu değerlendirir;
4. sonuç içeriğini ve yan etkileri doğrular.

Sadece 202 ile “rapor doğru oluşturuldu” sonucu çıkarılmaz. Polling varsa **bounded timeout** ve açık hata raporlama gerekir; sonsuz bekleme doğru çözüm değildir.

## 33.9 Alıştırma — dosya yükleme

Bir servis aynı file upload isteğini ağ timeout sonrası tekrar alabiliyor. İş kuralı: Aynı upload identity'si tek belge kaydı oluşturmalı.

**Görev:** Üç negatif/tekrar senaryosu ve iki invariant öner.

**Örnek çözüm:** Aynı key+payload tekrarı; aynı key+farklı dosya; iki aynı-key eşzamanlı istek. İnvariant: aynı mantıksal upload için tek belge kaydı ve yüklenen içeriğin doğru checksum'a sahip olması. Key retention/scope kuralı ürün sözleşmesinde net olmalıdır.

## Sonraki ders

API business state'ini sınadık. Şimdi aynı davranışın kullanıcıya **UI içinde nasıl gösterildiğini**, browser state ve network ilişkisini öğreneceğiz.

→ [34. UI Workflows, Browser State & Network](05-ui-workflows-browser-state-and-network.md)

**Kaynak:** [MDN — Idempotent HTTP methods](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent) · [MDN — 202 Accepted](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202).
