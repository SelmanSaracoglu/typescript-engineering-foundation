# Ders 07 — Gereksinimden API Contract'a: Product API

> **Temel mühendislik sorusu:** Frontend ile backend aynı ürünü konuşurken hangi davranış üzerinde anlaşmış olmalıdır?
>
> **Increment:** Epic 03 / I2 — API Contract Design & OpenAPI · **Anforderung:** API-A2 · **Aşama:** Theory-first referans (bağımsız uygulama kanıtı değildir).

## 1. Problem ve kapsam

Bir e-ticaret uygulamasında kullanıcı ürünün kimliğini vererek adını, fiyatını ve durumunu görmek istiyor. Ürün yoksa anlaşılır bir hata almak istiyor. Bu iş isteği (*requirement*), tek başına teknik sözleşme değildir; hangi adres, veri biçimi, alan ve hata davranışının kullanılacağını söylemez.

**API contract**, sağlayıcının (*provider*) dışarıya sunduğu gözlenebilir davranışı, tüketicinin (*consumer*) güvenebileceği biçimde tarif eder. Uygulama kodu, veritabanı yapısı veya framework seçimi bu tanımın yerine geçmez.

~~~text
Requirement → Contract design → Implementation → Verification
Ne gerekli?   Ne garanti?     Nasıl yapılır?  Gerçekte uyuyor mu?
~~~

**Provider sorumluluğu:** Sözleşmedeki request'leri, cevap biçimlerini ve yan etkileri doğru gerçekleştirmek. **Consumer sorumluluğu:** Sözleşmede beklenen biçimde istek göndermek ve garanti edilmiş cevapları doğru işlemek. Consumer belirtilmemiş alanları veya sıralamayı keyfî olarak garanti edilmiş saymamalıdır.

## 2. Gereksinimi teknik kararlara dönüştürme

**İş gereksinimi:** “Kimliği verilen ürün görüntülenebilsin; bulunamayan ürün açıkça bildirilsin.”

| Tasarım sorusu | Product API kararı | Neden |
| --- | --- | --- |
| Hangi resource? | Product | İş dünyasındaki ürün varlığı |
| Hangi operation? | `GET /products/{productId}` | Belirli ürünü okumak |
| Identifier nerede? | Path içindeki `productId` | İstenen ürünü seçmek |
| Başarı? | `200 OK` + Product JSON | Ürün temsili döndürmek |
| Bulunamazsa? | `404 Not Found` + Error JSON | Belirgin ve tutarlı hata |
| Product alanları? | `id`, `name`, `price`, `status` | Consumer'ın ihtiyaç duyduğu veri |
| Fiyat tipi? | JSON number; pozitif | Metin yerine sayısal değer |
| Durum? | `active` veya `inactive` | Açık ve sınırlı değer kümesi |

**Temsili HTTP/1.1 request** (canlı trafik kaydı değildir):

~~~http
GET /products/p-101 HTTP/1.1
Host: api.example.test
Accept: application/json

~~~

**Temsili cevap:**

~~~http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":"p-101","name":"Wireless Mouse","price":29.99,"status":"active"}
~~~

**Bulunamama sözleşmesi:**

~~~http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"code":"PRODUCT_NOT_FOUND","message":"Product not found"}
~~~

`code` makine tarafından işlenebilir *error code*; `message` insanlar için açıklamadır. Bu alan isimleri HTTP veya JSON tarafından zorunlu kılınmaz; **bizim sözleşme kararımızdır**.

## 3. Contract ile implementation farklı şeyler

Diyelim backend JSON dosyasından veri okurken daha sonra bir veritabanına geçti. Dışarıdan aynı input/output davranışı sürüyorsa consumer'ın bunu fark etmesi gerekmeyebilir. Buna karşılık backend `price: "29.99"` gönderirse `200` dönse bile sözleşmeyi ihlal eder: sayı yerine string döndürülmüştür.

Üç seviyeyi karıştırma:

1. **HTTP sonucu:** Sunucu `200` bildirdi.
2. **Contract uygunluğu:** Doğru alanlar, tipler, status ve response biçimi var mı?
3. **Gerçek iş sonucu:** İstenen ürünün verisi ve sistem durumu doğru mu?

Bir testte expected result uygulamanın mevcut çıktısından kopyalanmaz; requirement ve contract'tan türetilir.

## 4. API-first ile implementation-first

| Yaklaşım | Önce hangi karar? | Avantaj / risk |
| --- | --- | --- |
| API-first | Consumer ve provider ortak sözleşmeyi netleştirir | Paralel geliştirmeyi kolaylaştırır; yanlış tasarlanmış sözleşme yine mümkündür |
| Implementation-first | Çalışan uygulama geliştirilir, sonra arayüz belgelenir | Keşif sırasında hızlı olabilir; tesadüfi davranışın “doğru contract” sayılma riski vardır |

İki yaklaşım da test ve gözden geçirme gerektirir. **OpenAPI dokümanı = çalışan API veya otomatik runtime validation değildir.**

## 5. İlk tasarım kaydı (karar ve gerekçesi)

- `productId` örneği `p-101` biçimindedir; kimliği provider yönetir.
- `price` JSON number olarak gösterilir. Para hesaplarında binary floating-point hassasiyet riski bulunduğundan gerçek finansal API'lerde tam sayı en küçük para birimi veya açık decimal-string yaklaşımı ayrıca tasarlanabilir. Bu küçük örnek yalnız contract mantığı içindir.
- `status` enum: `active`, `inactive`.
- Bu sentetik API'de erişim kontrolü veya kullanıcı yetkileri henüz tasarlanmamıştır. Sözleşme oluşturmak yetkilendirme sağlamaz.

## 6. Yanlış ve doğru yaklaşım

| Yanlış varsayım | Daha doğru mühendislik yaklaşımı |
| --- | --- |
| “JSON parse edildi, demek veri doğru.” | Syntax, schema ve business rule ayrı değerlendirilir |
| “`200` varsa test başarılı.” | Body ve gerekiyorsa state de kontrol edilir |
| “Hata mesajı yazmak yeterli.” | Status + makinece işlenebilir hata şekli tanımlanır |
| “Dokümana yazdık, backend uygular.” | Implementation ve verification ayrı çalışmadır |
| “Backend alan adını değiştirirse önemli değil.” | Consumer beklentisi ve backward compatibility incelenir |

## 7. SDET, AppSec ve Security Operations

**SDET:** Contract, expected status/body/state assertion'larının kaynağıdır. Sözleşmeyi tekrar etmek bağımsız API testi yazabilmek değildir.

**AppSec:** Örnekte provider'ın yönettiği `id` veya `status` gibi alanların consumer tarafından zorla belirlenememesi gerektiği tasarımda görünür hâle gelir. Sözleşme tek başına authorization veya input validation sağlamaz.

**Security Operations & Engineering:** Bir proxy'nin `200` kaydetmesi ürünün doğru dönmüş olduğunu veya işlemin gerçekten gerçekleştiğini kanıtlamaz; telemetry'nin kanıt sınırını ayır.

## 8. Kaynaklar ve öğrenme durumu

- [OpenAPI Specification 3.1.2](https://spec.openapis.org/oas/v3.1.2.html) — *Introduction* ve *OpenAPI Object*.
- [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) — HTTP request/response semantiği.
- Önkoşul: aynı klasördeki `01`–`06` I1 dersleri; burada I1 baştan tekrarlanmıyor.

**Gözlenen:** Selman `price` tip uyuşmazlığını, eksik `code` alanını, `price → cost` değişikliğinin consumer etkisini ve API-first avantajını açıklamıştır. Bunlar rehberli **kavramsal cevaplar**dır. Bu belgenin üretilmesi / okunması H0 tasarım veya uygulama kanıtı değildir.
