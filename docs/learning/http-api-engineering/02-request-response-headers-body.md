# Ders 02 — HTTP headers, body, JSON ve Content-Type

> **Temel problem:** İstemci geçerli JSON'a benzeyen veri gönderiyor; sunucu niçin beklediğimiz nesneyi görmüyor?

## 1. Request ile response ayrı mesajlardır

**Temsili HTTP/1.1 request:**

~~~http
POST /products HTTP/1.1
Host: api.example.test
Content-Type: application/json
Accept: application/json

{"name":"Laptop","price":1200}
~~~

Burada `Content-Type` **gönderilen request body'nin**, `Accept` ise **alınması tercih edilen response'un** media type bilgisini taşır. Header'dan sonra gelen JSON, request body'dir. POST method'u tek başına body'nin JSON olduğunu göstermez.

**Temsili HTTP/1.1 response:**

~~~http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /products/42

{"id":42,"name":"Laptop","price":1200}
~~~

Cevabın kendi `Content-Type` header'ı vardır. **Request Content-Type ve Response Content-Type aynı olmak zorunda değildir.** Client `text/plain` yollayıp sunucudan `application/json` alabilir.

**Önemli üç sınır:**
- HTTP response **header**'ları ile JSON response **body** içindeki `"headers"` nesnesi farklı katmanlardır.
- `Content-Type`, verinin **hangi tipte olduğunu bildiren metadata**'dır; body'yi otomatik olarak dönüştürmez.
- `Accept`, bir tercih bildirir; sunucunun her durumda bu içerik türünü sağlayabileceği anlamına gelmez.

## 2. JSON metni ile nesne arasındaki fark

Şu iki JavaScript/TypeScript değerine bak:

~~~typescript
const objectValue = { name: "Alex", role: "tester" };
const stringValue = '{"name":"Alex","role":"tester"}';

console.log(objectValue.name); // "Alex"
console.log(stringValue.name); // undefined
~~~

İkincisi **JSON'a benzeyen metindir**, JavaScript nesnesi değildir. JSON ayrıştırılması (parsing) metni bir değere dönüştürür. Ancak parsed bir değer bile dış kaynaktan geliyorsa henüz güvenilir veri sayılmaz; detaylı validation mühendisliği I3 kapsamındadır.

Ayrıca iki farklı başarısız durum var:

- **Parsing skipped / ayrıştırma yapılmadı:** Örneğin endpoint yalnız `application/json` içerik türü için JSON parser çalıştıracak şekilde kurulmuştur ama istek `text/plain` gelmiştir.
- **Parsing failed / ayrıştırma başarısız:** Parser çalıştırılmıştır, ama `{"price":1200` gibi eksik kapanış parantezli, geçersiz JSON verilmiştir.

İlkinde hata her zaman exception değildir; parser çalışmamış olabilir. İkincisinde uygulama `400 Bad Request` benzeri bir yanıt üretmeyi seçebilir. Endpoint yalnız JSON kabul ediyorsa `text/plain` gönderimine `415 Unsupported Media Type` döndürebilir. **Kesin beklenen status API sözleşmesinden gelir**; Echo servisinin davranışı bütün backend'ler için standart değildir.

## 3. Gerçek POST deneyimiz

PowerShell'de aynı metin iki farklı content type ile Postman Echo'ya gönderildi:

~~~powershell
$json = '{"name":"Alex","role":"tester"}'
$json | curl.exe -sS -i "https://postman-echo.com/post" -H "Content-Type: application/json" --data-binary "@-"
$json | curl.exe -sS -i "https://postman-echo.com/post" -H "Content-Type: text/plain" --data-binary "@-"
~~~

**Gerçekte gözlenen verilerin özeti:**

| Gözlem | `application/json` request | `text/plain` request |
| --- | --- | --- |
| HTTP status | `200` | `200` |
| Response header Content-Type | `application/json; charset=utf-8` | `application/json; charset=utf-8` |
| JSON response body içindeki request content-type | `application/json` | `text/plain` |
| Echo `json` alanı | Nesne | `null` |
| Echo `data` alanı | Nesne | String |

Bu deney, **server'ın request'i nasıl yorumladığı ile response'u nasıl formatladığının ayrı** olduğunu kanıtladı. `json:null`, «sunucuya hiçbir veri ulaşmadı» demek değildi: `data` metin içeriyordu.

PowerShell pipe kullanımında body sonunda `\r\n` görülebilir. Bu satır sonu, JSON string olarak görüntülenirken escaping ile gösterilir; JSON sözdiziminde kapanıştan sonra whitespace normalde kabul edilebilir.

## 4. İkinci gerçek hata: yanlış aktarılmış JSON

İlk PUT/PATCH denemesinde body'yi doğrudan `-d '{"price":1200}'` olarak verdik. Echo şu sonucu gösterdi:

~~~json
{"data":"{price:1200}","json":null}
~~~

Ama hedeflenen veri:

~~~json
{"price":1200}
~~~

**Gözlem:** `price` anahtarının çift tırnakları kaybolmuş; gönderilen body artık geçerli JSON değil. `Content-Type: application/json` doğru yazılmış olması bunu düzeltmedi.

**Hipotez:** Windows PowerShell → native executable `curl.exe` argüman aktarımında tırnak işaretleri kaybolmuş olabilir. Bu ara adım bağımsız ölçülmediği için kesin root cause olarak yazılmamalı.

**Kontrollü değişiklik:**

~~~powershell
$json = '{"price":1200}'
$json | curl.exe -sS -i -X PUT "https://postman-echo.com/put" -H "Content-Type: application/json" --data-binary "@-"
~~~

**Gerçekte doğrulanan sonuç:** Echo'nun `json` ve `data` alanları `{"price":1200}` nesnesini gösterdi. `--data-binary "@-"` veriyi standart girdiden (stdin) alır. Bu, istemci tarafındaki veri aktarımını daha gözlenebilir hâle getirdi.

## 5. Diğer önemli header'lar

| Header | Yön | Anlamı |
| --- | --- | --- |
| `Host` | HTTP/1.1 Request | Hedef host |
| `User-Agent` | Genellikle request | İstemci yazılımının tanıtımı; güvenilir kimlik kanıtı değildir |
| `Content-Type` | Her iki yönde | İlgili mesajın body türü |
| `Content-Length` | Her iki yönde | İlgili body'nin **byte** uzunluğu |
| `Content-Encoding` | Her iki yönde | Sıkıştırma/kodlama (media type değildir) |
| `Accept` | Request | Kabul edilen response media type'ları |
| `Location` | Response | Örn. yeni kaynağın konumu veya yönlendirme hedefi |
| `ETag` | Response | Bir temsil sürümünü ayırt etmek için etiket |
| `Set-Cookie` | Response | Cookie oluşturma/güncelleme bilgisi |
| `Cookie` | Request | İstemcinin gönderdiği cookie'ler |

Header adları **case-insensitive**: `content-type` ile `Content-Type` aynı alan adıdır. Body tipi varsayılmamalı; örneğin `204 No Content` response'unda body yoktur.

### Güvenlik sınırı

`Set-Cookie` değeri bazen geçerli bir oturum tanımlayıcısı içerebilir. **Cookie, Authorization, token, secret, kişisel veri** bulunan ham terminal çıktıları public repo veya sohbete olduğu gibi taşınmamalıdır. Güvenlik analizinde **header adı/özellikleri** ile **gizli header değeri** ayrılır.

## 6. Neden önemli?

- **SDET:** `200` + JSON formatı + gereken alanlar + iş sonucu birlikte doğrulanır; yalnız status assertion eksiktir.
- **AppSec:** Dış girdinin tipi client header'ı ile ilan edilir, **güvenli veri** olacağı garanti edilmez. Ayrıştırma sınırı, saldırı yüzeyinin bir parçasıdır.
- **SOC:** Proxy logunda response Content-Type görülmesi, uygulamanın request body'yi JSON olarak işlediğinin kanıtı değildir; gözlenebilir alanları ve kör noktaları ayır.

**Kaynaklar:** [MDN — Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type), [MDN — Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept), [MDN — HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages).

**Öğrenme durumu:** İki içerik türü ve hatalı/onarılmış JSON gerçek terminal verisiyle karşılaştırıldı; mentor yönlendirmesi kullanıldı. Bağımsız transfer henüz ölçülmedi.
