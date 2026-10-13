# 30. API Testing — HTTP isteğinden doğrulanabilir sözleşmeye

> **Temel soru:** Bir API isteği 200 döndürdüğünde hangi davranışların gerçekten doğru olduğunu biliyoruz?

I1'de beklenen sonucu gereksinimden çıkardık. I2'de test seviyesini, I3'te veri ve yan etkileri, I4'te otomasyon sınırlarını öğrendik. I5'te aynı düşünceyi **HTTP üzerinden gözlenebilen ürün davranışına** taşıyoruz.

## 30.1 Önce tek bir işlem

MiniShop'ta müşteri kendi siparişini görüntülemek istiyor. Eğitim örneğinin onaylı sözleşmesi:

- GET /api/orders/{orderId} bir siparişi döndürür.
- Sipariş yalnız sahibine gösterilir.
- Başarılı yanıtta id, ownerId, status, total ve currency bulunur.
- Sipariş bulunamazsa belirlenmiş hata biçimi döner.
- Yetkisiz çağrı veri açıklamadan reddedilir.

Şöyle bir HTTP exchange düşün:

~~~http
GET /api/orders/o-101 HTTP/1.1
Authorization: Bearer <TEST_TOKEN>
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"id":"o-101","ownerId":"u-7","status":"PAID","total":10000,"currency":"EUR"}
~~~

Bu **gerçek bir sunucudan alınmış yanıt değil**, sözleşmeyi öğrenmek için hazırlanmış örnek. Burada tutar **minor unit** (eurocent) kabul ediliyor: 10000 → 100,00 €. Bu kararın sözleşmede açık olması gerekir; başka API 100.00 gibi decimal kullanabilir.

## 30.2 İstek ve yanıtı parçalayalım

**Method:** GET, POST, PUT, PATCH, DELETE gibi eylemin HTTP semantiğini belirler.

**Path ve path parameters:** /orders/o-101 içindeki o-101 hangi kaynağın istendiğini belirler.

**Query parameters:** Örneğin /orders?status=PAID&limit=20 filtre/pagination isteği taşıyabilir.

**Headers:** Authorization, Accept, Content-Type, correlation bilgisi, cache/conditional request gibi metaveri taşır.

**Request body:** POST/PATCH/PUT gibi işlemlerde onaylı sözleşmeye göre gönderilen içerik.

**Response status:** HTTP düzeyinde işlemin sonucunu sınıflandırır.

**Response headers/body:** Dönen verinin tipi, cache politikası, concurrency bilgisi ve iş sonucunu taşıyabilir.

**Önemli:** HTTP status ile **business result** aynı kavram değildir. 200 dönüp yanlış sipariş tutarı içeren yanıt başarısız iş davranışıdır.

### HTTP yöntemlerinin niyeti

| Method | Genel amaç | Testte sorulacak soru |
|---|---|---|
| GET | Kaynak okumak, güvenli/safe semantik | Okuma yetki ve veri doğruluğu; yan etki var mı? |
| POST | Kaynak oluşturma veya işlem çalıştırma | Aynı isteğin tekrarı nasıl yönetiliyor? |
| PUT | Hedef kaynağın temsilini oluşturma/değiştirme | Tekrarlandığında amaçlanan nihai durum aynı mı? |
| PATCH | Kısmi değişiklik | Hangi alanlar değişebilir; yetki ve validasyon var mı? |
| DELETE | Kaynağı silme | Tekrar sonrası state tutarlı mı? |

GET HTTP anlamında *safe*, PUT ve DELETE HTTP semantiği bakımından *idempotent* kabul edilir; bu, gerçek implementasyonların asla hatalı yan etki oluşturmayacağı veya DELETE'in her denemede aynı status döneceği anlamına gelmez. Özellikle ödeme gibi POST işlemlerinde **işlemsel idempotency** ayrı tasarlanır; 33. derste ele alacağız.

## 30.3 Beklenen sonucu nereden çıkarıyoruz?

API testinin dayanağı **onaylı API contract**'ıdır:
- Endpoint ve HTTP method;
- Input alanlarının tipi, zorunluluğu ve sınırları;
- Response şeması;
- Yetki kuralları;
- İş state'i ve hata davranışı;
- Kalıcı yan etkiler.

OpenAPI gibi bir tanım bu sözleşmenin bazı bölümlerini makinece okunur kılar; **iş kuralı, güvenlik ve kullanıcı amacı** tek başına şema dosyasından eksiksiz anlaşılmayabilir.

**Yanlış:** Ürün bugün hangi JSON'u döndürüyorsa onu expected saymak.

**Doğru:** Requirement ve API contract'taki beklenen davranışı esas almak; uygulamanın davranışını onunla karşılaştırmak.

## 30.4 Aynı response için üç derinlik

Sipariş GET çağrısı 200 döndü. Bu yalnız ilk kontroldür:

1. **Transport:** 200 ve Content-Type beklenen mi?
2. **Contract:** JSON nesnesi gerekli alanları doğru tiplerle taşıyor mu? total sayısal ve currency EUR mu?
3. **Business behavior:** Gelen id istenen sipariş mi? ownerId oturum sahibine mi ait? total gerçekten siparişin beklenen hesabı mı?

**Ek risk:** Fazla veri sızması. Response içinde müşterinin gizli token'ı veya admin alanı görünüyorsa şema temel alanları içeriyor diye güvenli sayılmaz.

### Örnek kontrol matrisi

| Koşul | Status (bu sözleşmede) | Yanıt | Ek gözlem |
|---|---|---|---|
| Sahip kendi siparişini okuyor | 200 | Doğru order alanları | State değişmez |
| Sipariş ID'si yok | 404 | Tanımlı hata | Başka veri yok |
| Oturum bilgisi yok | 401 | Kimlik gereksinimi | Kaynak açıklanmaz |
| Başka kullanıcı siparişi | 404 veya 403 — **önceden seçilmiş politika** | Gizli veri yok | State değişmez |

**403/404 seçimi geliştiricinin anlık yanıtından çıkarılmaz.** Bazı ürünler kaynak varlığını açığa çıkarmamak için 404 döndürür; bu ancak güvenlik/ürün sözleşmesi bunu belirlemişse expected olur.

## 30.5 API testing hangi seviyede olabilir?

I2'yi hatırla: **API bir arayüzdür, test seviyesi değil.**

- İzole route handler → component sınırı.
- Gerçek service + DB → component integration.
- Tam ürünün HTTP davranışı → system testing.
- Dış ödeme sağlayıcısı API'si → system integration.

“API testi yazdım” yerine **gerçekte hangi bileşenlerin dahil edildiğini** ifade etmek, kanıtın sınırını gösterir.

## 30.6 Cypress ile doğrudan API isteği

Aşağıdaki örnek **öğretim amaçlıdır**; MiniShop endpoints mevcut repoda bulunmuyor:

~~~typescript
cy.request({
  method: "GET",
  url: "/api/orders/o-101",
  headers: { Authorization: "Bearer <TEST_TOKEN>" }
}).then((response) => {
  expect(response.status).to.eq(200);
  expect(response.body.id).to.eq("o-101");
  expect(response.body.currency).to.eq("EUR");
});
~~~

Gerçekte token'ı kaynak dosyasına gömmek doğru değildir; güvenli test session/secret yönetimi gerekir. Ayrıca bu testin verisi o-101'i ve beklenen sahipliği **önceden güvenilir biçimde kurmuş** olmalıdır.

**Çok önemli fark:** Cypress **cy.request()** testi çalıştıran Node tarafı üzerinden doğrudan HTTP isteği gönderir; **cy.intercept()** ise uygulamanın browser kaynaklı network isteklerini gözler/stub'lar. Bir cy.request çağrısını cy.intercept ile yakalamayı bekleme. İkisi farklı test amaçları içindir.

## 30.7 Karşı örnek: 200 ama yanlış ürün

İstenen sipariş o-101. API yanıtı:

~~~json
{"id":"o-202","ownerId":"u-7","status":"PAID","total":10000,"currency":"EUR"}
~~~

Status ve JSON yapısı doğru olsa bile **yanlış kaynağın** dönmesi product defect adayıdır. Bu yüzden API testinin oracle'ı yalnız status kodundan oluşmamalıdır.

## 30.8 Alıştırma — yeni alana aktar

Belge servisi: GET /api/documents/{id}. Sözleşme: Yalnız sahibi erişir; başarılı sonuç id, ownerId, state ve filename içerir.

**Görev:** Bir pozitif ve iki negatif test tasarla. Her testte status dışında **hangi iş kanıtını** gözleyeceğini açıkla.

**Örnek çözüm:**
- Sahibi okur → sözleşmedeki başarılı status, istenen id/ownerId/state, doğru belge.
- Oturumsuz okuma → sözleşmedeki authentication hatası, hiçbir belge içeriği yok.
- A kullanıcısı B belgesini okur → önceden belirlenmiş 403/404 politika yanıtı, belge içerik/sensitive metadata sızmaz.

**Kazanım:** API testini “status doğrulama”dan **sözleşme + davranış + yan etki kanıtı** düzeyine taşıdık.

## Sonraki ders

API temel sözleşmesini biliyoruz. Şimdi geçerli örneklerin yanına **bozuk, eksik ve sınırdaki istekleri** sistematik olarak ekleyeceğiz.

→ [31. Positive, Negative & Contract Testing](02-api-positive-negative-and-contract-tests.md)

**Resmî referanslar:** [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) · [Cypress cy.request()](https://docs.cypress.io/api/commands/request).
