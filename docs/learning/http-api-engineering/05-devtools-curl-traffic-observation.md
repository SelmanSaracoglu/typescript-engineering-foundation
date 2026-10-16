# Ders 05 — Browser DevTools ve curl ile gerçek trafiği gözlemlemek

> **Temel problem:** «315 request gördüm» demek, hata üreten belirli request'in gerçekten doğru incelendiği anlamına gelmez. Doğru kanıt nasıl seçilir?

## 1. DevTools Network sekmesi: önce tek isteği izole et

Chrome/Edge gibi tarayıcılarda DevTools → Network, ağ aktivitesini gösterir. Bir web sayfası HTML, CSS, JS, görsel, font ve API çağrıları için yüzlerce ayrı istek oluşturabilir. **Her satır ayrı analiz edilmek zorunda değil.**

Hata araştırmasında önce hedef kullanıcı eylemini belirle:

1. DevTools Network'ü aç, gerekirse kayıt listesini temizle.
2. İlgili kullanıcı eylemini **bir kez** gerçekleştir.
3. Kaynağın türüne göre filtrele. API çağrılarında `Fetch/XHR` yaygındır; adres çubuğunda doğrudan açılan bir API `Document` türünde görünebilir.
4. Request URL veya istek adı ile ilgili satırı bul.
5. **Headers → Payload → Response/Preview → Timing** sırasıyla *tek istek* üzerinde bilgi topla.

| Alan | Sorduğumuz mühendislik sorusu |
| --- | --- |
| Name / Request URL | Tam olarak nereye istek gitti? |
| Method | GET mi, POST mu, PUT mu? |
| Status | Bir HTTP response geldi mi, hangi status? |
| Request Headers | Client hangi metadata'yı gerçekten gönderdi? |
| Payload | Body/query varsa ne gönderildi? |
| Response Headers | Sunucu veya aracı hangi metadata'yı verdi? |
| Response / Preview | Body'de gerçek sonuç ne? |
| Initiator | Bu isteği hangi kaynak veya kod tetikledi? |
| Timing | Beklemenin hangi kısmı bağlantı/yanıt/indirme? |

DevTools bazı HTTP/2 veya HTTP/3 bilgilerini anlamlı alanlar hâlinde sunar. **Bunu HTTP/1.1 ham mesajı sanma.** Ayrıca DevTools bir arayüzdür: bazı header'lar gizlenebilir/özetlenebilir; gerektiğinde orijinal değere bak.

## 2. curl parametrelerinin ne yaptığı

Windows PowerShell'de özellikle `curl.exe` kullanıyoruz. Bu, bazı PowerShell sürümlerinde bulunan `curl` alias karışıklığından kaçınır.

| Parametre | Etki | Doğrulamada nasıl kullanılır? |
| --- | --- | --- |
| `-i` | Response header'larını body ile birlikte yazar | HTTP status ve header/body karşılaştırması |
| `-H "Accept: application/json"` | Request header gönderir | Client tercihinin gerçekten ulaşması |
| `-X PUT` | HTTP method'u açıkça seçer | Method farkını gözleme |
| `--data-binary "@-"` | Body'yi stdin'den aktarır | PowerShell'de JSON tırnak aktarımı sorunu azaltma |
| `-sS` | Progress meter gizler ama hataları gösterir | Çıktıyı okunabilir tutma |
| `-o NUL` | Windows'ta body'yi ekrana basmaz | Sadece status inceleme |
| `-w "HTTP: %{http_code}\n"` | Seçilen sonucu ayrı yazar | Response HTTP kodu |
| `--fail` | Çoğu HTTP 4xx/5xx için non-zero curl exit code | Script'in HTTP hata durumunu algılaması |
| `--connect-timeout 3` | Bağlantı kurma denemesi için süre sınırı | Hata deneyini sınırlandırma |

**Önemli:** `-i` çoğunlukla **response** header'larını gösterir. Gönderilen **request** header'larını da görmek için kontrollü lab'da `-v` kullanılabilir; `-v` hassas header'ları (özellikle cookie/token) gösterebilir. Ham verbose çıktısını public ortama taşımadan önce mutlaka maskele.

## 3. Gerçek GET ve query verisi

~~~powershell
curl.exe -i "https://postman-echo.com/get?topic=http&source=lab" -H "Accept: application/json"
~~~

Kullanıcının gerçek çıktı özeti:

~~~http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"args":{"topic":"http","source":"lab"}}
~~~

Bu çıktı **kısaltılmıştır**, çünkü Echo daha fazla header ve body alanı döndürdü.

Gözlenenin anlamı:
- `200 OK`: HTTP başarı cevabı var.
- `args`: Query parametreleri doğru ulaşmış.
- Echo JSON içindeki `headers.accept`: `application/json` gönderilmiş.
- Echo `user-agent`: `curl/8.21.0`.
- Gerçek response header'da `Content-Type` JSON.

### Yorum hatası

Echo cevabında şu alanı görmek:

~~~json
{"headers":{"accept":"application/json"}}
~~~

**Bu bir response header listesi değildir**; Echo'nun **request header'larını response body'nin içinde geri yansıttığı veri**dir.

## 4. HTTP hatası ve connection failure deneyleri

~~~powershell
curl.exe -sS -i "https://postman-echo.com/status/404"
~~~

Gerçek çıktı: `HTTP/1.1 404 Not Found` + `{"status":404}`. HTTP cevabı **var**.

~~~powershell
curl.exe -sS -i --connect-timeout 3 "http://127.0.0.1:1/"
$LASTEXITCODE
~~~

Gerçek çıktı: `curl: (7) Failed to connect...`, exit code `7`. HTTP cevabı **yok**.

~~~powershell
curl.exe -sS -o NUL -w "HTTP: %{http_code}\n" "https://postman-echo.com/status/404"
$LASTEXITCODE
curl.exe -sS --fail -o NUL -w "HTTP: %{http_code}\n" "https://postman-echo.com/status/404"
$LASTEXITCODE
~~~

Gerçek çıktı: Her iki komutta HTTP `404`; `--fail` olmadan exit `0`, onunla exit `22`.

## 5. JSON POST ve PowerShell'deki gerçek sorun

~~~powershell
$json = '{"name":"Alex","role":"tester"}'
$json | curl.exe -sS -i "https://postman-echo.com/post" -H "Content-Type: application/json" --data-binary "@-"
$json | curl.exe -sS -i "https://postman-echo.com/post" -H "Content-Type: text/plain" --data-binary "@-"
~~~

Gerçek gözlem: iki istekte response Content-Type JSON; yalnız JSON request'inde Echo `json` alanı nesne, düz metinde `null`.

PUT denemesinde:

~~~powershell
curl.exe -sS -X PUT "https://postman-echo.com/put" -H "Content-Type: application/json" -d '{"price":1200}'
~~~

Echo `data:"{price:1200}"`, `json:null` gördü. Bunun yerine:

~~~powershell
$json = '{"price":1200}'
$json | curl.exe -sS -i -X PUT "https://postman-echo.com/put" -H "Content-Type: application/json" --data-binary "@-"
~~~

Echo `data` ve `json` alanlarında `{"price":1200}` nesnesini döndürdü. Bu **önce/sonra doğrulaması** gerçek kullanıcı çıktısına dayanır. Kaybolan tırnakların tam olarak hangi PowerShell/native argüman dönüştürme adımında silindiği doğrudan ölçülmedi; varsayımı kesinlik gibi kaydetme.

## 6. Gizli bilgileri asla kayda geçirme

İlk Echo deneyinde `Set-Cookie` gibi header'larda oturum/cookie değerleri vardı. Bunların değeri **public GitHub dokümantasyonuna veya bug ticket'a ham hâliyle konulmamalı**. Örnek güvenli kayıt:

~~~text
Set-Cookie: sails.sid=<redacted>; Path=/; HttpOnly
~~~

Başka gerçek kullanıcı token'ı, API key'i, kişisel bilgi veya oturum cookie'si kullanma. Gerçek hizmetleri değiştiren DELETE/PUT/POST denemeleri yerine yetkili sentetik Echo servisini kullan.

## 7. Üç alanda işlevi

**SDET:** Yanlış API URL, yanlış method, bozuk body, gerçek 4xx/5xx ve istemci testinin yanlış pass vermesi ayrı kusurlardır.

**AppSec:** Proxy ile uygulamanın gördüğü metadata farklı olabilir; request header'ını güvenilir yetki kaynağı sayma. Log/screenshot paylaşımında token ve cookie sızıntısını önle.

**SOC:** HTTP status ve request path kayıtları faydalıdır ama tek başına olayın nedenini veya kötü niyeti kanıtlamaz. Gözlemi zaman, host, process ve log kaynağı bağlamında değerlendir.

**Kaynaklar:** [Chrome — Network panel](https://developer.chrome.com/docs/devtools/network/), [curl — Command line options](https://curl.se/docs/manpage.html).

**Öğrenme durumu:** Terminal deneylerinin gerçek çıktı kanıtı var. Ayrıntılı DevTools tekil request kanıtı ve bağımsız debugging/transfer henüz tamamlanmadı.
