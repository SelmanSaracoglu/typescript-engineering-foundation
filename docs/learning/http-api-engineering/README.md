# HTTP & API Engineering — I1 Handbook

> **Epic 03 / I1 — HTTP Fundamentals & Traffic Observation**  
> **Ana Anforderung:** API-A1 — HTTP Request / Response Model  
> **Durum (16 Ekim 2026):** Öğretim ve rehberli trafik gözlemleri devam ediyor. Increment **tamamlanmadı**.  
> **Çalışma düzeni:** Önce konu anlatımı; I1 sonunda bütünleşik uygulama, hata araştırması ve bağımsız aktarım değerlendirmesi.

Bu belge, HTTP iletişimini kavramak, gerçek request/response verisini yorumlamak ve DevTools ile `curl` üzerinden hata katmanını ayırt etmek için hazırlanmış Türkçe teknik ders notudur. HTTP sözdizimini ezberlemek değil, **gözlem → beklenti → gerekçeli teknik karar** kurmak amaçlanır.

## İçindekiler

1. [Client–server ve HTTP modeli](#1-clientserver-ve-http-modeli)
2. [URL yapısı](#2-url-yapısı)
3. [Request/response: method, header ve body](#3-requestresponse-method-header-ve-body)
4. [HTTP methods](#4-http-methods)
5. [HTTP status kodları](#5-http-status-kodları)
6. [DevTools ile trafik okuma](#6-devtools-ile-trafik-okuma)
7. [curl: gerçek gözlemler ve hata ayrımı](#7-curl-gerçek-gözlemler-ve-hata-ayrımı)
8. [I1 gözlem ve yeterlilik kaydı](#8-i1-gözlem-ve-yeterlilik-kaydı)
9. [Açık konular ve kapanış kanıtı](#9-açık-konular-ve-kapanış-kanıtı)

## 1. Client–server ve HTTP modeli

- **Client / istemci:** İsteği başlatan taraf (tarayıcı, uygulama, `curl`).
- **Server / sunucu:** HTTP isteğini alıp işler ve cevap üretir.
- **HTTP request / istek:** Ne yapılacağını ve hangi kaynağın hedeflendiğini ifade eder.
- **HTTP response / cevap:** İşlemin durumunu, başlıkları ve varsa cevap gövdesini taşır.

Akış: **Client → HTTP request → Server → HTTP response → Client**.

Örneğin, uygulama bir ürünün bilgilerini istediğinde `GET /products/42` gönderir. Sunucu kaynak bulunuyorsa veriyi, bulunmuyorsa uygun hata durumunu döndürebilir. HTTP status ile JSON body ayrı alanlardır; JSON içinde `error` yazıyor diye HTTP status kendiliğinden `404` olmaz.

> Aşağıdaki ham örnekler **HTTP/1.1 metinsel gösterimidir**. HTTP/2 ve HTTP/3'ün aktarım biçimi aynı değildir. DevTools ekranındaki protokol ile bu gösterimi karıştırma.

**Temsili HTTP/1.1 request:**

```http
GET /products/42 HTTP/1.1
Host: api.example.test
Accept: application/json

```

**Temsili HTTP/1.1 response:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":42,"name":"Laptop","price":1000}
```

## 2. URL yapısı

Örnek: `https://postman-echo.com/get?topic=http&source=lab`

| Bileşen | Örnekteki değer | Anlamı |
| --- | --- | --- |
| Scheme | `https` | Kullanılacak protokol/bağlantı şeması; HTTPS, HTTP iletişimini TLS üzerinden korur |
| Host | `postman-echo.com` | Hedef sunucu adı |
| Port | Açık yazılmamış; HTTPS varsayılanı `443` | Ulaşılacak ağ hizmetinin portu |
| Path | `/get` | İstenen yol/kaynak |
| Query | `topic=http&source=lab` | URL'deki anahtar–değer parametreleri |

Query parametreleri ile request body aynı şey değildir. `?topic=http` URL'dedir; JSON body ise HTTP mesajının gövdesindedir.

## 3. Request/response: method, header ve body

**Request:** method + hedef URL/path + headers + isteğe bağlı body.  
**Response:** HTTP status + headers + isteğe bağlı body.

- **Request `Accept: application/json`:** İstemci hangi cevap biçimlerini kabul ettiğini belirtir.
- **Request `Content-Type: application/json`:** İstemci gönderdiği *request body*'nin türünü bildirir.
- **Response `Content-Type: application/json`:** Sunucu gönderdiği *response body*'nin türünü bildirir.
- **Body:** Asıl taşınan veri. JSON nesnesi ile JSON'a benzeyen düz metin farklıdır.

`Content-Type` veri içeriğini dönüştürmez. Aynı `{"price":1200}` baytları `text/plain` olarak gönderilirse sunucu bunları JSON olarak parse etmeyebilir. Sunucunun hangi media type'ı kabul edeceği API sözleşmesine bağlıdır. **Parsing skipped** (ayrıştırma yapılmadı) ile **parsing failed** (ayrıştırma denendi ama başarısız oldu) farklı durumlardır.

Echo servisinin response JSON'undaki `"headers"` nesnesi, **request headers**'ın body içinde geri yansıtılmış bir kopyasıdır; gerçek HTTP **response headers** ile karıştırılmamalıdır.

## 4. HTTP methods

| Method | Temel niyet | Örnek |
| --- | --- | --- |
| `GET` | Kaynağın temsilini almak | `GET /products/42` |
| `POST` | Veriyi hedef kaynağa işlettirmek; çoğu API'de oluşturma | `POST /products` |
| `PUT` | Hedef kaynağın temsilini oluşturmak veya bütünüyle değiştirmek | `PUT /products/42` |
| `PATCH` | Kaynak üzerinde kısmi değişiklik uygulamak | `PATCH /products/42` |
| `DELETE` | Kaynağın kaldırılmasını istemek | `DELETE /products/42` |

**PUT/PATCH ayrımı:** `PUT` ile yalnız `{"price":1200}` gönderildiğinde diğer alanların nasıl ele alınacağı sunucunun API sözleşmesi ve implementasyonuyla ilgilidir; `PATCH` kısmi değişiklik semantiği taşır. PATCH'in body formatı tek tip değildir; örneğin JSON Merge Patch kullanılıyorsa `Content-Type: application/merge-patch+json` olabilir.

**Silme sonrası doğrulama:** `DELETE /products/42` isteğinin `204` dönmesi, ürünün gerçek durumunu tek başına gözlemlediğimiz anlamına gelmez. API sözleşmesine göre uygunsa `GET /products/42` ile son durum doğrulanır. GET eski ürünü döndürüyorsa gözlem açıktır; veritabanı, cache veya soft delete hakkında kök neden çıkarımı için ek kanıt gerekir.

> Ayrıntılı retry ve idempotency davranışı bu Increment'in kapsamı dışındadır (I7).

## 5. HTTP status kodları

| Aile | Anlamı | Sık görülen örnekler |
| --- | --- | --- |
| 1xx | Bilgilendirme / ara cevap | `100 Continue` |
| 2xx | Başarılı işlem | `200 OK`, `201 Created`, `204 No Content` |
| 3xx | Yönlendirme veya cache ile ilişkili cevap | `301`, `302`, `304` |
| 4xx | İstek mevcut hâliyle karşılanamıyor | `400`, `401`, `403`, `404`, `405`, `415`, `429` |
| 5xx | Sunucu/gateway işleme sırasında sorun yaşadı | `500`, `502`, `503`, `504` |

Önemli ayrımlar:

- `200`: HTTP isteği başarıyla işlendi; dönen JSON'un iş kuralına uygunluğu ayrıca doğrulanır.
- `201`: Kaynak oluşturuldu. `Location` header'ı yeni kaynak adresini gösterebilir.
- `204`: Başarılı sonuç, response body **yok**.
- `400`: Hatalı istek; örneğin bozuk JSON nedeniyle reddedilmiş olabilir.
- `404`: Kaynak bulunamadı. Kontrollü `/status/404` endpoint'inde bu cevap bilerek üretilir.
- `405`: O kaynak için HTTP method kabul edilmiyor.
- `415`: İstekte gönderilen media type desteklenmiyor.
- `500`: İç sunucu hatası.
- `502`: Gateway/proxy upstream'den geçersiz cevap aldı.
- `503`: Hizmet kullanılamıyor.
- `504`: Gateway/proxy upstream'i beklerken zaman aşımı yaşadı.

`4xx` her zaman frontend geliştiricisinin kusurunu; `5xx` de mutlaka backend uygulama kodunun kusurunu kanıtlamaz. Hata kaynağı katman katman araştırılır.

## 6. DevTools ile trafik okuma

Chrome DevTools → **Network** ekranında her satır ayrı bir network isteği olabilir. API odaklı filtre için çoğunlukla **Fetch/XHR** uygundur; doğrudan adres çubuğunda açılan API cevapları **Document** olarak da görünebilir.

Bir istekte şu alanlara bakılır:

| Sekme/alan | İncelenen şey |
| --- | --- |
| Headers / General | Request URL, method, status |
| Request Headers | Client'ın gerçekten gönderdiği metadata |
| Payload | Query veya gönderilen request body |
| Response Headers | Sunucunun cevap metadata'sı |
| Response / Preview | Sunucunun verdiği body |
| Timing | Ağ ve cevap süresi aşamaları |
| Initiator | İsteği tetikleyen kaynak/kod |

**Kayıt:** DevTools'ta çok sayıda request görüldü; tekil bir API çağrısının alanları için bağımsız ekran kanıtı henüz kaydedilmedi. 315 satırın tamamını tek tek incelemek gerekli değildir.

## 7. curl: gerçek gözlemler ve hata ayrımı

Komutlar **Windows PowerShell** içindir. `curl.exe`, PowerShell'deki olası `curl` alias'ı ile karışmayı önler. Gizli token, gerçek kullanıcı verisi veya mevcut sistemleri değiştiren işlem kullanılmaz.

### A. Başarılı GET ve query

```powershell
curl.exe -i "https://postman-echo.com/get?topic=http&source=lab" -H "Accept: application/json"
```

**Gerçekte gözlendi:** HTTP/1.1 `200 OK`; JSON response içindeki `args.topic=http`, `args.source=lab`, `headers.accept=application/json`, `headers.user-agent=curl/8.21.0`.

### B. HTTP hata cevabı

```powershell
curl.exe -sS -i "https://postman-echo.com/status/404"
```

**Gerçekte gözlendi:** HTTP/1.1 `404 Not Found`, body `{"status":404}`.

### C. HTTP 404 ile curl exit code farkı

```powershell
curl.exe -sS -o NUL -w "HTTP: %{http_code}\n" "https://postman-echo.com/status/404"
$LASTEXITCODE
```

**Gerçekte gözlendi:** `HTTP: 404`; process exit code `0`. Curl varsayılan olarak HTTP hata status'unu bir transfer hatası saymayabilir.

```powershell
curl.exe -sS --fail -o NUL -w "HTTP: %{http_code}\n" "https://postman-echo.com/status/404"
$LASTEXITCODE
```

**Gerçekte gözlendi:** `HTTP: 404`, `curl: (22)`, exit code `22`. `--fail` istemcinin çıkış davranışını değiştirir; sunucunun HTTP status'unu değiştirmez.

### D. HTTP cevabı oluşmadan bağlantı hatası

```powershell
curl.exe -sS -i --connect-timeout 3 "http://127.0.0.1:1/"
$LASTEXITCODE
```

**Gerçekte gözlendi:** `curl: (7) Failed to connect`, exit code `7`. HTTP response/status elde edilmedi. Port 1'de servis olmadığı varsayımı bu makinedeki deneyle uyuştu.

### E. JSON request body'sini gönderme ve karşılaştırma

```powershell
$json = '{"name":"Alex","role":"tester"}'
$json | curl.exe -sS -i "https://postman-echo.com/post" -H "Content-Type: application/json" --data-binary "@-"
$json | curl.exe -sS -i "https://postman-echo.com/post" -H "Content-Type: text/plain" --data-binary "@-"
```

**Gerçekte gözlendi:** İki istek de HTTP `200`; response Content-Type ikisinde de JSON. İlkinde Echo `json` alanı nesne; ikincisinde `json: null`, `data` string. İki isteğin **request** Content-Type'ları farklıydı.

### F. PUT/PATCH ve yanlış JSON biçimi

Aynı body'yi `curl.exe -d '{"price":1200}'` argümanıyla göndermeye çalışırken Echo cevabında `data:"{price:1200}"`, `json:null` gözlendi: Gönderilen veri geçerli JSON değildi. Bunun PowerShell → native command argüman aktarımından kaynaklandığı **hipotezi** kuruldu; doğrudan argv incelemesiyle kesinleştirilmedi.

Düzeltilmiş komut:

```powershell
$json = '{"price":1200}'
$json | curl.exe -sS -i -X PUT "https://postman-echo.com/put" -H "Content-Type: application/json" --data-binary "@-"
```

**Gerçekte gözlendi:** Echo `data: {"price":1200}` ve `json: {"price":1200}` döndürdü. `--data-binary "@-"` body'yi stdin'den gönderir. PUT/PATCH echo deneyi gerçek kalıcı resource güncellemesini **kanıtlamaz**.

## 8. I1 gözlem ve yeterlilik kaydı

| Kanıt | Durum | Bağımsızlık / yardım |
| --- | --- | --- |
| Client → request → server → response açıklaması | İlk kavramsal yanıt gözlendi | Temel anlama |
| DevTools Network'e erişim | Gözlendi; ayrıntılı tek istek kanıtı sınırlı | Bağımsız seviye ölçülmedi |
| GET `200` ve Echo query/header response | Gerçek terminal çıktısı | Rehberli komut |
| `404` HTTP cevabı | Gerçek terminal çıktısı | Rehberli komut |
| TCP bağlantı hatası / curl exit `7` | Gerçek terminal çıktısı | Rehberli komut |
| `--fail` yok/var: curl `0` vs `22` | Gerçek terminal çıktısı | Rehberli komut |
| Request/response Content-Type farkı | Gerçek iki POST gözlemi ve açıklama | Kavramsal gerekçelendirme gözlendi |
| Yanlış JSON body → stdin ile düzeltme | Gerçek önce/sonra kanıtı | Mentor yönlendirmeli debugging (en az H2) |
| PUT/PATCH kaynak durumu değişikliği | Echo üzerinde gözlenemez | Kanıtlanmadı |
| Yeni örnekte H0 bağımsız debugging ve aktarım | Henüz yapılmadı | Açık |

**Yardım ölçeği:** H0: Not/resmî doküman/debugger ile bağımsız; H1: genel ipucu; H2: adım/komut yönlendirmesi; H3: birlikte kritik çözüm; H4: hazır tam çözüm. Bu belge mentorun açıklamalarını içerir; **tek başına bağımsız yeterlilik kanıtı değildir**.

## 9. Açık konular ve kapanış kanıtı

Bu Increment için sırada: status ailelerinin teşhis açısından pekiştirilmesi; yalnız HTTP düzeyinde `4xx`–`5xx` ayrımı; tekil DevTools request'inin gerçek alanlarının incelenmesi; kontrollü hata hipotezi/deneyi; gerekli olursa built-in Node HTTP fixture ile body gözlemi; yeni bir request üzerinde bağımsız transfer.

**I1 Closure Report henüz oluşturulmadı.** Kapanış için request/response yapısı, method/status/header/body yorumlama, gerçek DevTools ve curl gözlemi, sistematik debugging ve yeni görevde H0 bağımsız aktarımın kanıtlanması gerekir. Dosya veya kod değişiklikleri ve Git commit bilgisi kapanışta ayrıca kaydedilir.

### Kaynaklar

- [MDN — HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [MDN — HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [MDN — HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [curl — Everything curl](https://everything.curl.dev/)
