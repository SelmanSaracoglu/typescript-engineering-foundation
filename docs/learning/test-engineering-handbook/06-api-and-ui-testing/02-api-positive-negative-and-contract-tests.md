# 31. API Positive, Negative & Contract Tests — Girdiyi sistematik sınamak

> **Temel soru:** Başarılı bir POST testinin geçmesi, endpoint'in hatalı veriyi güvenli biçimde yönettiğini gösterir mi?

Bir önceki derste HTTP request/response ve test oracle'ını ayırdık. Şimdi onaylı sözleşmeyi **pozitif, negatif ve sınır** senaryolarına dönüştüreceğiz.

## 31.1 Tek bir API kuralı

MiniShop'ta şu örnek endpoint olsun:

~~~http
POST /api/coupons/validate
Content-Type: application/json

{"code":"SAVE20","basketTotalMinor":12000}
~~~

Eğitim sözleşmesi:
- code: boş olmayan, tanımlı geçerli kupon kodu;
- basketTotalMinor: 0 veya pozitif **tam sayı**, para birimi EUR minor units;
- SAVE20: geçerli ve AVAILABLE ise 2000 minor unit indirim;
- USED kupon indirime uygun değildir;
- bilinmeyen alanlar ve eksik alanların davranışı API contract'ında belirlenir;
- doğrulama **yalnız eligibility sonucu verir**, kuponu USED yapmaz.

Bu son madde çok önemlidir. Sadece “validate” adında diye endpoint'in veri değiştirmediğini varsayamayız; **bu örnek sözleşmede açıkça** yan etkisiz kabul ettik.

## 31.2 Pozitif test neyi doğrular?

Happy-path:

Input: SAVE20, 12000.  
Expected: success, discountMinor=2000, netMinor=10000; kupon AVAILABLE kalır.

**Kontroller:**
1. HTTP status sözleşmeye uygun;
2. response alanları ve tipleri doğru;
3. 12000−2000=10000 hesaplaması doğru;
4. salt validation işlemi veri değiştirmedi.

Son kontrol dışarıdan görünmüyorsa uygun integration test düzeyinde state kanıtı gerekebilir.

## 31.3 Negatif senaryoları rastgele seçmeyelim

I1'deki EP/BVA/decision table bilgisini kullan:

| Test grubu | Girdi | Beklenen türü |
|---|---|---|
| Geçerli | code=SAVE20, total=12000 | İndirim hesaplanır |
| Eksik required field | code yok | Doğrulama hatası |
| Yanlış tip | total="12000" string | Sözleşmeye göre ret / açık coercion politikası |
| Negatif sayı | total=-1 | Validation ret |
| Boundary | total=0 | İş kuralınca kabul edilen sayı; indirim uygulanabilirliği ayrıca belirlenir |
| Bilinmeyen kupon | code=NOPE | Geçersiz kod davranışı |
| Kullanılmış kupon | code USED | İş kuralına uygun ret |
| Çok uzun değer | aşırı uzun code | Uzunluk sınırı varsa ona uygun ret |

Her “invalid” istek 400 olmak zorunda değildir. **400**, **409** veya **422** gibi status seçimleri ürünün sözleşmesinde netleştirilmelidir. “Hangi status bana daha mantıklı geldi?” test oracle'ının yerine geçmez.

### Boundary ve para tipleri

0, 1, 9999, 10000 gibi değerlerin anlamı, kuponun **minimum sepet tutarı kuralına** bağlıdır. Sözleşmede minimum yoksa “100 € altı kesin reddedilir” diye gereksinim uydurma.

Para **floating-point** olarak modellenirse hassasiyet sorunu oluşabilir; minor units gibi integer yaklaşımı burada özellikle açıkça belirtildi.

## 31.4 Schema doğrulaması neyi çözer?

İş birimi şu contract'a ihtiyaç duyuyor:

~~~json
{
  "eligible": true,
  "discountMinor": 2000,
  "netMinor": 10000,
  "currency": "EUR"
}
~~~

Şema kontrolü:
- eligible boolean mı?
- discountMinor integer mı?
- currency izin verilen değer mi?
- zorunlu alanlar var mı?
- gerekiyorsa bilinmeyen alanlar yasak mı?

Ama schema'nın geçmesi **hesaplamanın doğru olduğu** anlamına gelmez. total=12000 iken netMinor=11000 dönse bile tipler doğru olabilir.

**İki bağımsız oracle:**
- Contract shape/type;
- Business rule (hesaplama ve state).

## 31.5 Consumer–provider contract ve gerçek sistem sınırı

Client bir alanı kullanıyor: **discountMinor**. Provider alan adını **discountAmount** olarak değiştirirse backend kendi unit testlerinde geçebilir ama frontend kırılabilir.

**Contract testing**, iki tarafın üzerinde uzlaştığı **istek/yanıt sözleşmesinin** korunup korunmadığını kontrol eder.

Dikkat:
- OpenAPI schema validation her iş davranışını kapsamaz;
- Consumer-driven contract (ör. Pact yöntemi), tüketici beklentilerinin provider ile doğrulanmasına yardımcı olabilir, ancak ayrı kapsam/araç seçimi gerekir;
- Her test için yeni contract-testing framework kurulmayacak;
- Network ortamı ve gerçek sağlayıcı davranışı ayrıca değerlendirilebilir.

**Yanlış güven:** Stub fixture'ını frontend'in beklentisine göre düzenleyip gerçek provider'ı hiç test etmemek. Böylece client ile mock anlaşır ama üretim API'si farklı cevap verebilir.

## 31.6 Cypress'te negatif status nasıl kontrol edilir?

Öğretici örnek, endpoint yok; API kontratına göre uyarlanmalı:

~~~typescript
cy.request({
  method: "POST",
  url: "/api/coupons/validate",
  body: { code: "", basketTotalMinor: 12000 },
  failOnStatusCode: false
}).then((response) => {
  expect(response.status).to.eq(400); // SADECE bu status onaylandıysa
  expect(response.body.error.code).to.eq("INVALID_COUPON_CODE");
});
~~~

**Neden failOnStatusCode: false?** Cypress varsayılan olarak 4xx/5xx yanıtları komutu başarısız sayabilir. Negatif davranışı **bilinçli biçimde assert etmek** için özelliği kullanıyoruz.

Ancak sadece response'a bakmak her zaman yeterli değil. Validation girişiminden sonra kupon veya sipariş state'i istemeden değişmiş olabilir; ilgili risk varsa bu ayrıca gözlenmeli.

## 31.7 Örnek hata: Geçersiz input ama 200

İstek:

~~~json
{"code":"SAVE20","basketTotalMinor":"twelve thousand"}
~~~

Actual 200 ve indirim=2000.

Eğer sözleşme integer zorunlu tutuyorsa bu behavior defect adayıdır. Ama uygulama string sayıları **bilinçli normalize edecek** şekilde tasarlandıysa oracle farklı olur.

Bu yüzden:
1. Sözleşmeyi doğrula;
2. validation sınırını belirle;
3. gözlenen response'u kaydet;
4. input coercion politikası belirsizse karar iste;
5. beklenen sonuca göre hata raporla.

## 31.8 Alıştırma — yeni üründe EP/BVA transferi

Belge yükleme API'si en çok **10 MiB** (10 × 1024 × 1024 byte) dosya kabul ediyor; PDF/PNG destekliyor; boş dosya kabul edilmiyor.

**Görev:** Üç geçerli/geçersiz veri sınıfı ve 2-value size boundary testleri öner.

**Örnek çözüm:** Boyut partition'ları 0 byte, 1..10485760 byte, 10485761+ byte. Boundary geçişleri 0/1 ve 10485760/10485761. PDF ve PNG formatları sözleşmede ikisi de kabul edilir; farklı parser riski nedeniyle ikisini ayrı temsil etmek mantıklıdır. Desteklenmeyen EXE veya başka formatın reddi ayrıca test edilir. **10 MB ile 10 MiB** farkını belirsiz bırakmak yanlış boundary oracle üretebilir.

## Sonraki ders

Veri doğru biçimde gönderilse bile **kimin hangi kaynağa erişebileceği** ayrı risk. Authentication ile authorization'ı, response ve state kanıtıyla ayıracağız.

→ [32. Authentication & Authorization](03-api-authentication-authorization-and-state.md)

**Kaynaklar:** [Cypress cy.request](https://docs.cypress.io/api/commands/request) · [OpenAPI Specification](https://spec.openapis.org/oas/latest.html).
