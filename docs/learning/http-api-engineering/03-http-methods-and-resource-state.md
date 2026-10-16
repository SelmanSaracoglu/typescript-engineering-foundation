# Ders 03 — HTTP methods ve kaynağın gerçek durumu

> **Temel problem:** API `204 No Content` döndürüyor ama silindiği düşünülen ürün GET ile hâlâ görünür. Hangisine güvenmeliyiz?

## 1. Method bir «niyet» tanımlar

Bir URL tek başına hangi işlemin istendiğini anlatmaz. `/products/42` yolu aynı olabilir; **method**, istemcinin kaynak üzerinde hangi tür işlem istediğini ifade eder.

| Method | Temel HTTP semantiği | Temsili kullanım |
| --- | --- | --- |
| `GET` | Kaynağın temsilini istemek | `GET /products/42` |
| `POST` | Gönderilen verinin hedef resource tarafından işlenmesi | `POST /products` |
| `PUT` | Hedef kaynağın temsilini verilen temsille oluşturma/değiştirme | `PUT /products/42` |
| `PATCH` | Bir kaynağa kısmi değişiklik uygulamak | `PATCH /products/42` |
| `DELETE` | Hedef kaynak ile mevcut işlevsellik arasındaki ilişkiyi kaldırmayı istemek | `DELETE /products/42` |

**Önemli nüans:** `POST` her zaman yalnız «create» demek değildir. HTTP semantiği daha geniştir; oluşturma pek çok REST API'sindeki yaygın kullanım şeklidir.

Bir API method'u tanıyor olması, istemcinin o işlemi yapmaya **yetkili** olduğunu göstermez. Yetki konusunun ayrıntıları I5–I6'da ele alınacak.

## 2. PUT ile PATCH niçin aynı şey değil?

Kaynaktaki ürün:

~~~json
{"id":42,"name":"Laptop","price":1000,"stock":15}
~~~

Amaç fiyatı `1200` yapmak olsun.

**Temsili HTTP/1.1 PUT:**

~~~http
PUT /products/42 HTTP/1.1
Host: api.example.test
Content-Type: application/json

{"name":"Laptop","price":1200,"stock":15}
~~~

PUT, hedef kaynağın **temsilinin değiştirilmesi** niyetini ifade eder. Sözleşme tam temsil bekliyorsa yalnız `{"price":1200}` göndermek diğer alanların kaybına veya isteğin reddedilmesine neden olabilir. Ancak «PUT her zaman tüm eksik alanları siler» demek fazla geneldir; sunucu uygulaması ve sözleşme belirleyicidir.

**Temsili HTTP/1.1 PATCH:**

~~~http
PATCH /products/42 HTTP/1.1
Host: api.example.test
Content-Type: application/merge-patch+json

{"price":1200}
~~~

Burada JSON Merge Patch biçiminde kısmi değişiklik istiyoruz. Mevcut ürünün `name` ve `stock` alanları değişmeden kalması beklenir. PATCH **tek bir evrensel JSON body formatı değildir**; JSON Patch, Merge Patch veya API'ye özgü bir biçim kullanılabilir.

### Testçinin önce sözleşmeye bakması neden doğru?

Aynı istek için üç farklı problem ortaya çıkabilir:

1. **Frontend sözleşmeye aykırı:** PUT tam temsil beklerken sadece fiyat gönderiyor.
2. **Backend sözleşmeye aykırı:** Kısmi güncelleme vaat edilirken diğer alanları siliyor.
3. **Sözleşme belirsiz:** Eksik alanların nasıl işleneceği tanımlanmamış.

**SDET karar sırası:** beklenen davranış → gönderilen request → alınan response → kaynakta gerçekten gözlenen son durum. `200` tek başına güncellemenin doğruluğunu kanıtlamaz.

## 3. DELETE cevabı ile kaynak durumu farklı gözlemler

Örnek (**temsili HTTP/1.1**):

~~~http
DELETE /products/42 HTTP/1.1
Host: api.example.test

~~~

~~~http
HTTP/1.1 204 No Content

~~~

`204`, işlemin başarılı tamamlandığını, cevabın body taşımadığını bildirir. Ama **DELETE response'u kendi başına kaynak durumunun bağımsız gözlemi değildir**.

API sözleşmesinde başarılı silme sonrasında tekil ürünün erişilemez olması gerekiyorsa şu istekle kontrol edilebilir:

~~~http
GET /products/42 HTTP/1.1
Host: api.example.test

~~~

O durumda `404 Not Found` beklenebilir. Buna karşılık `200` ile eski ürün dönüyorsa **gözlem**: ürün bu GET yanıtında hâlâ erişilebilir görünüyor. **Kök neden**: cache, soft delete, yanlış resource ID'si veya yanlış implementasyon olabilir; ek kanıt olmadan kesin birini seçmeyiz.

## 4. Echo servisinin sınırı

Kullanılan eğitim servisi `https://postman-echo.com/put` ve `/patch` isteklerini geri yansıttı. İki response'ta yalnız path'in farklı görünmesi şaşırtıcı değildi. Echo servisi gerçek ürünün durumunu kalıcı olarak değiştirmez. Bu yüzden:

- **Kanıtlanan:** PUT/PATCH method'larıyla body gönderebildik; istek verisi geri yansıtıldı.
- **Kanıtlanmayan:** Bir üründe tam/kısmi güncellemenin gerçekten doğru gerçekleştiği.

Bir servisin neyi test ettiği kadar neyi **test etmediğini** bilmek de test mühendisliğidir.

## 5. Safe ve idempotent kavramlarına kısa bakış

- **Safe method:** İstemci sunucunun durumunu değiştirmeyi amaçlamaz. GET bu gruptadır. Bu, «sunucu log bile yazamaz» demek değildir.
- **Idempotent method:** Aynı amaçlanan işlemin birden fazla uygulanması, sunucudaki istenen son etkiyi bir kez uygulamakla aynı tutar. PUT ve DELETE bu semantiğe sahiptir; PATCH genel olarak idempotent olmak zorunda değildir.
- İdempotent demek **her seferinde aynı response status'u döner** demek değildir; örneğin ilk DELETE `204`, ikincisi `404` dönebilir.

**Sınır:** Retry stratejisi, idempotency key ve tekrar isteklerin yan etkileri I7'de; burada sadece method'ların anlamını ayırıyoruz.

## 6. Güvenlik ve operasyon bağlantısı

**SDET:** Bir ürün silindikten sonra doğru ID üzerinden GET karşılaştırması yapmak, sadece DELETE status'una bakmaktan daha güçlü kanıttır.

**AppSec:** Method'un tahmin edilebilir olması, işlem yapılabileceği anlamına gelmez. «GET görünüyorsa aynı endpoint'te DELETE denemek güvenli veya yetkilidir» yanlıştır; gerçek sistemlerde değiştirme isteği için açık yetki gerekir. Lab ortamımız sentetik Echo verisiyle sınırlıdır.

**SOC:** Bir access logunda `DELETE /products/42` görülmesi, ürünün silindiğinin kesin kanıtı değildir: request kaydı, response durumu ve mümkünse uygulama/audit sonucu ayrı incelenmelidir.

**Kaynaklar:** [MDN — HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods), [MDN — PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH), [MDN — DELETE](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE).

**Öğrenme durumu:** Sözleşmeden başlamanın gerekçesi konuşmada ifade edildi; PUT/PATCH Echo isteği gerçek kaynak durumunu doğrulamadı. Bağımsız uygulama I1 sonunda ölçülecek.
