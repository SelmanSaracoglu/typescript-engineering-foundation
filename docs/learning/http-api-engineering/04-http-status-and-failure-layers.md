# Ders 04 — HTTP status kodları ve hata katmanları

> **Temel problem:** `200 OK` dönmesine rağmen ekranda hata olabilir; `404 Not Found` dönmesi ise bağlantı hatası değildir. Status bize tam olarak ne söyler?

## 1. Status, sunucunun HTTP düzeyindeki bildirimi

HTTP response status kodu, request'in nasıl sonuçlandığını **HTTP açısından** tanımlar. Status'un başındaki rakam sınıfını gösterir:

| Sınıf | Anlam | Örnek |
| --- | --- | --- |
| `1xx` | Bilgilendirme / ara yanıt | `100 Continue` |
| `2xx` | Başarılı HTTP isteği | `200 OK`, `201 Created`, `204 No Content` |
| `3xx` | Yönlendirme veya koşullu/cache akışı | `301`, `302`, `304` |
| `4xx` | İstek mevcut hâliyle karşılanamıyor | `400`, `401`, `403`, `404`, `405`, `415`, `429` |
| `5xx` | Sunucu veya aracı birimi isteği yerine getirirken hata yaşadı | `500`, `502`, `503`, `504` |

**4xx «frontend geliştiricisi suçlu»**, **5xx «backend kodu kesin bozuk»** demek değildir. Bir ara proxy veya gateway yanıt üretmiş olabilir. Bir request'in yanlış olması da client'ın kötü niyetli olduğunu kanıtlamaz.

## 2. Sık kullanılan kodlar ve beklenen anlamları

### 2xx — Olumlu sonuçlar

- `200 OK`: İstek HTTP düzeyinde başarıyla işlendi. Response body'nin iş kuralı açısından doğru olduğu ayrıca incelenir.
- `201 Created`: Bir veya daha fazla yeni kaynak oluşturuldu. Yeni kaynağın URL'si `Location` ile bildirilebilir.
- `204 No Content`: İstek başarıyla işlendi; response body bulunmaz. Bu nedenle JSON parse etmeye çalışmak yanlıştır.

### 3xx — Yönlendirme ile cache'i karıştırma

**Temsili HTTP/1.1 redirect:**

~~~http
HTTP/1.1 301 Moved Permanently
Location: https://api.example.test/v2/products/42

~~~

Burada `Location` yeni adresi belirtir. Tarayıcı veya `curl -L` yönlendirmeyi izlerse ikinci bir HTTP isteği oluşabilir. İlk 301'i değil son 200'ü görmek istiyorsak **redirect chain**'i ayrıca incelemeliyiz.

`304 Not Modified` bir sayfaya «başka URL'den git» komutu değildir. Koşullu GET/HEAD isteğinde önbellekteki önceki temsilin kullanılabileceğini bildirir; normal response body taşımaz. Cache mekanizmasının ayrıntıları bu Increment'in kapsamı dışındadır.

### 4xx — İsteğin reddi veya karşılanamaması

| Status | Temel anlam | Örnek mühendislik gözlemi |
| --- | --- | --- |
| `400 Bad Request` | Sunucu, request'i istemci kaynaklı bir hata nedeniyle işleyemiyor | Geçersiz JSON |
| `401 Unauthorized` | Geçerli authentication bilgisi gerekli | Kimlik doğrulaması yapılmamış |
| `403 Forbidden` | Sunucu isteğin yapılmasına izin vermiyor | Erişim reddi |
| `404 Not Found` | Hedef kaynak bulunamadı | Yanlış resource ID veya route |
| `405 Method Not Allowed` | Hedef kaynak method'u desteklemiyor | İzin verilen method'lar için `Allow` header'ı |
| `415 Unsupported Media Type` | Request body'nin formatı desteklenmiyor | JSON isteyen servise `text/plain` gönderildi |
| `429 Too Many Requests` | Çok sayıda istek | İstek yoğunluğu sınırlandırılmış olabilir |

Kimlik, erişim ve rate-limit policy tasarımı ileriki Increment'lere ait. Burada HTTP cevabının anlamını okuyoruz.

### 5xx — Sunucu / gateway tarafı işleme hataları

| Status | Açıklama | İlk araştırma yönü |
| --- | --- | --- |
| `500 Internal Server Error` | Beklenmeyen sunucu hatası | Uygulama logu, ilgili request, hata handling |
| `502 Bad Gateway` | Gateway, upstream'den geçersiz cevap aldı | Proxy–upstream ilişkisinin logları |
| `503 Service Unavailable` | Servis geçici olarak kullanılamıyor | Hizmet sağlığı ve erişilebilirliği |
| `504 Gateway Timeout` | Gateway, upstream'i beklerken zaman aşımına uğradı | Zaman aşımı, upstream gecikmesi |

Bir `504`, tek başına «veritabanı yavaş» kanıtı değildir. İlgili bileşenleri gözlemek gerekir.

## 3. Gerçek HTTP 200 ve 404 gözlemleri

Kullanılan kamuya açık eğitim servisi: Postman Echo.

~~~powershell
curl.exe -sS -i "https://postman-echo.com/status/404"
~~~

**Gerçek çıktıdan:** `HTTP/1.1 404 Not Found` ve `{"status":404}`.

Bu, **bir HTTP yanıtı** aldığımızı gösterir. HTTP request'in istenen sonucu gerçekleşmemiş olabilir; ama «sunucuya hiç erişilemedi» yorumunu desteklemez. `/status/404` endpoint'i bilerek seçilen status'u üretir; gerçek kaynak arama başarısızlığı kanıtı değildir.

Önceki `GET /get?topic=http&source=lab` deneyi ise `HTTP/1.1 200 OK` ve parametreleri yansıtan JSON döndürdü.

## 4. HTTP status code ile curl exit code farklıdır

Bu bölüm, CI/test script'lerinde yanlış «başarılı» kararını önlemek için önemlidir.

~~~powershell
curl.exe -sS -o NUL -w "HTTP: %{http_code}\n" "https://postman-echo.com/status/404"
$LASTEXITCODE
~~~

**Gerçekte gözlendi:** `HTTP: 404` ve `0`.

Neden? Varsayılan `curl`, bir HTTP 404 cevabını başarıyla **almış** olabilir; bu durumda process kendi transfer başarısını `0` olarak bildirir. Bu, API iş davranışının başarı olduğunu göstermez.

~~~powershell
curl.exe -sS --fail -o NUL -w "HTTP: %{http_code}\n" "https://postman-echo.com/status/404"
$LASTEXITCODE
~~~

**Gerçekte gözlendi:** `HTTP: 404`, `curl: (22)`, exit code `22`.

`--fail`, curl'ın `400` ve üzeri cevaplarda genellikle başarısız exit code vermesini sağlar; sunucunun HTTP cevabını **değiştirmez**. Bazı authentication/HTTP durumlarına ilişkin istisnalar ve kullanılan curl seçenekleri için resmî doküman esas alınmalıdır.

Bir CI job yalnız shell exit code'a bakıyorsa, `--fail` olmadan API'deki `404`'ü yanlışlıkla başarılı komut sayabilir.

## 5. HTTP cevabı hiç gelmeden hata oluşması

~~~powershell
curl.exe -sS -i --connect-timeout 3 "http://127.0.0.1:1/"
$LASTEXITCODE
~~~

**Gerçek terminal çıktısı:**

~~~text
curl: (7) Failed to connect to 127.0.0.1:1 after 2041 ms: Could not connect to server
7
~~~

Bu sefer **HTTP status yok**. `curl: (7)` ağ bağlantısının kurulamadığını gösteren **program hata kodudur**. Port 1'de servis dinlenmediği varsayımı bu deneydeki gözlemle uyuşur; hata başka bir bağlantı reddi nedeninden de kaynaklanabilir.

### Üç sonucu beraber düşün

| Durum | HTTP response? | HTTP status | curl exit code |
| --- | --- | --- | --- |
| Geçerli Echo GET | Evet | `200` | Bu deneyde ayrıca ölçülmedi; normalde `0` |
| Echo `/status/404`, normal curl | Evet | `404` | Gerçek gözlem `0` |
| Aynı 404, `--fail` | Evet | `404` | Gerçek gözlem `22` |
| Local port bağlantısı başarısız | Hayır | Yok | Gerçek gözlem `7` |

## 6. 200 içinde hata mesajı bulunursa?

**Temsili HTTP/1.1:**

~~~http
HTTP/1.1 200 OK
Content-Type: application/json

{"error":"Repository not found"}
~~~

Bu sözdizimi bakımından mümkün. Ancak bir tekil resource GET işleminde «bulunamadı» hâli için API sözleşmesi `404` gerektiriyorsa **işlevsel olarak hatalı status** kullanılmış demektir. Başarılı bir aramanın **boş sonuç listesi** döndürmesi ise meşru olarak `200` olabilir. Beklentiyi sadece body'deki `error` anahtarıyla değil, endpoint semantiğiyle değerlendir.

## 7. Test / AppSec / SOC ayrımı

**SDET:** Status assertion, data assertion ve gerektiğinde **state verification** ayrı kanıtlar sağlar. Testin neyi doğrulamadığını açıkça kaydet.

**AppSec:** `500` hatasında gereksiz stack trace/hassas veri dökülüp dökülmediği ve hata mesajlarının istemciye gereğinden fazla detay verip vermediği değerlendirilebilir. Hata kodu tek başına bir zafiyet kanıtı değildir.

**SOC:** Proxy'den gelen `502` ile backend'in ürettiği `500` farklı log bağlamına işaret eder. Tek status üzerinden saldırı veya compromise sonucu çıkarma; ilgili request ID, zaman, bileşen ve diğer kanıtları eşleştir.

**Kaynaklar:** [MDN — HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), [curl — Exit codes](https://everything.curl.dev/cmdline/exitcode.html), [curl — --fail](https://curl.se/docs/manpage.html).

**Öğrenme durumu:** 200/404, exit code 0/22/7 karşılaştırmaları gerçek çıktıyla görüldü; bu çalışma rehberliydi, H0 aktarım değildir.
