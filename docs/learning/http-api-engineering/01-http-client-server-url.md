# Ders 01 — HTTP iletişim modeli ve URL

> **Temel mühendislik sorusu:** Bir uygulama «istek başarısız» dediğinde, isteğin hangi aşamada başarısız olduğunu nasıl ayırırız?

## 1. Önce problemi tanımlayalım

Bir kullanıcı, ürün sayfasında «Detayları göster» düğmesine basıyor. Ekranda hiçbir bilgi belirmiyor. Tek başına bu görüntü, sorunun kaynağını söylemez. Tarayıcı istek oluşturamamış olabilir; bağlantı kurulmamış olabilir; sunucu `404` döndürmüş olabilir; hatta sunucu `200` döndürüp istemci veriyi yanlış işlemiş olabilir.

Bir **Client (istemci)** — Chrome, mobil uygulama, otomasyon veya `curl` — HTTP request başlatır. **Server (sunucu)** isteği alır, uygun işlemi yapar ve HTTP response üretir. HTTP (Hypertext Transfer Protocol) bu mesajların anlamını ve kurallarını belirleyen **uygulama katmanı protokolüdür**.

~~~text
Kullanıcı eylemi
    ↓
Client (Browser / curl)
    ↓     [Gerekirse DNS adı çözülür, bağlantı/TLS kurulur]
HTTP request: GET /products/42
    ↓
Server / ara sunucu / uygulama
    ↓
HTTP response: status + headers + (varsa) body
    ↓
Client response'u yorumlar → arayüz
~~~

Bu bir **zihinsel model**. Gerçek sistemde CDN, proxy, load balancer, gateway ve cache bulunabilir. HTTP status'unu her zaman doğrudan uygulama process'inin ürettiğini varsayma.

## 2. Ham HTTP mesajı nasıl okunur?

Aşağıdaki mesajlar **temsili HTTP/1.1 metinsel gösterimleridir**, canlı ağdan yakalanmış kayıtlar değildir.

**Request:**

~~~http
GET /products/42 HTTP/1.1
Host: api.example.test
Accept: application/json

~~~

- `GET` — **method**, hedef kaynağı okumak istiyoruz.
- `/products/42` — **path**, hangi kaynağı istediğimiz.
- `HTTP/1.1` — gösterimdeki HTTP sürümü.
- `Host` — HTTP/1.1 request'inde hedef sunucu adı.
- `Accept` — istemcinin kabul ettiği response türü.
- Son boş satır — header'lar burada biter; bu örnekte request body yok.

**Response:**

~~~http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":42,"name":"Laptop","price":1200}
~~~

- `200 OK` — **status**, sunucunun HTTP düzeyindeki sonuç bildirimi.
- `Content-Type` — bu **response body**'nin JSON olduğunu bildirir.
- JSON satırı — **body**, taşınan veri.

`200`, doğru ürünün geldiğini tek başına kanıtlamaz. Status'u ve body'nin beklenen davranışını ayrı değerlendiririz.

**Sürüm notu:** HTTP/2 ve HTTP/3'ün gerçek wire format'ı HTTP/1.1'in yukarıdaki satır gösterimi değildir. HTTP/2, `:method` ve `:status` gibi pseudo-header'lar kullanır; HTTP/3 QUIC üzerinde çalışır. DevTools'da HTTP/2 görürken yukarıdaki gösterimi gerçek byte dizisi diye yorumlama. HTTP method ve status'un **anlamı** sürümler arasında büyük ölçüde ortaktır.

## 3. URL parçaları

Şu örneği parçalayalım:

`https://postman-echo.com:443/get?topic=http&source=lab#result`

| Parça | Değer | Ne iş yapar? |
| --- | --- | --- |
| Scheme | `https` | TLS ile korunan HTTP erişimi |
| Host | `postman-echo.com` | İletişim kurulacak hedef ad |
| Port | `443` | Hedef port; HTTPS için varsayılan |
| Path | `/get` | Sunucuda hedeflenen yol |
| Query string | `topic=http&source=lab` | URL'deki parametreler |
| Fragment | `#result` | İstemci tarafı bölüm; normal HTTP request'inde sunucuya iletilmez |

URL üzerinde görünen parametreler ile **request body** farklıdır. Örnek: `/products/42?view=short` içinde `42` path'te, `view=short` query'dedir. Bir endpoint bunları nasıl yorumlayacağını kendi API sözleşmesinde tanımlar.

`https` kullanılması, HTTP trafiğinin uygun biçimde TLS ile korunmasını sağlayabilir; **uygulamanın yetkilendirmesinin, verilerinin veya iş kurallarının doğru olduğunu garanti etmez**. HTTPS, HTTP'nin yerine geçen bir API validation mekanizması değildir.

## 4. Ağ hatası mı, HTTP cevabı mı?

Ağ/transport aşamaları ile HTTP cevabını ayrı düşün:

| Sonuç | Ne gözlenir? | Ne söylenemez? |
| --- | --- | --- |
| `HTTP/1.1 404 Not Found` | Bir HTTP cevabı alındı | Sunucuya hiç bağlanılamadığı söylenemez |
| `curl: (7) Could not connect` | Bağlantı başarısız; HTTP status yok | «HTTP 500 döndü» denemez |
| `200 OK`, yanlış body | HTTP başarı status'u var | İşlevsel doğruluk kanıtlanmış olmaz |

Önceki gerçek deneyde `127.0.0.1:1` adresine bağlanılamadı: `curl` exit code `7`. Bu bir **HTTP status 7** değildir.

## 5. Neden üç kariyer alanı için ortak temel?

**SDET:** UI'de hata gördüğünde request gerçekten gönderilmiş mi, response gelmiş mi, doğru method/URL mi, doğru veri mi? Böylece ürün kusurunu test veya ortam kusurundan ayırırsın.

**Application Security:** Host, path, query ve body değerleri client tarafından kontrol edilebilir. Bu nedenle server bunları güvenilir kabul edemez. HTTPS, saldırgan tarafından hazırlanmış isteği sırf şifreli taşıdığı için güvenli hâle getirmez.

**Security Operations & Engineering:** HTTP `404` logu ile TCP bağlantı reddi farklı kanıt kaynaklarıdır; reverse proxy HTTP kayıtları, ağ/host bağlantı kayıtları ve uygulama logları aynı bilgiyi sağlamaz.

## 6. Yanlış varsayımlar

- «Ekran boşsa backend kapalıdır.» — Client render hatası da olabilir.
- «HTTPS varsa API güvenlidir.» — TLS güvenliği, business logic güvenliği değildir.
- «Her HTTP isteği JSON body taşır.» — GET gibi isteklerde body çoğunlukla bulunmaz; body her durumda JSON olmak zorunda değildir.
- «HTTP/2 kullanan istek ağda `GET /... HTTP/1.1` satırı şeklinde gönderilir.» — Yanlış protokol gösterimidir.

**Kaynaklar:** [MDN — Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview), [MDN — HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages).

**Öğrenme durumu:** İletişim akışı konuşmada doğru açıklandı; bu dersin tamamı için bağımsız transfer henüz ölçülmedi.
