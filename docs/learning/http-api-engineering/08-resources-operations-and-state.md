# Ders 08 — Resource, Endpoint, Operation ve Beklenen State

> **Mühendislik sorusu:** Aynı path'e farklı HTTP method'ları gönderildiğinde hangi contract kararları değişir?
>
> **Increment:** Epic 03 / I2 · **Anforderung:** API-A2 · **Durum:** Theory-first referans.

## 1. Resource, representation, path ve operation

- **Resource:** Product gibi API üzerinden temsil edilen mantıksal varlık.
- **Representation:** Resource'un belirli bir andaki JSON gösterimi; resource'un kendisiyle eş anlamlı değildir.
- **Path:** `/products` veya `/products/p-101` gibi resource'a giden URL yolu.
- **Endpoint:** Günlük kullanımda API erişim noktası; bazen method+path için de söylenir. Teknik belirsizliği azaltmak için burada path ile operation'ı ayrı tutuyoruz.
- **Operation:** HTTP method + path üzerinde tanımlanan davranış (ör. `GET /products/{productId}`).

`p-101` bizim sentetik resource identifier'ımızdır. Gerçek ürün ID'sinin hangi biçimde olduğu provider tarafından tanımlanır.

| Resource düzeyi | Path | Sözleşmemizdeki örnek |
| --- | --- | --- |
| Collection | `/products` | `GET` liste, `POST` yeni ürün |
| Individual | `/products/{productId}` | `GET` oku, `PUT` veya `PATCH` güncelle, `DELETE` sil |

Collection sonucunun JSON array olması bu örnek API'nin seçimidir, HTTP'nin zorunlu kuralı değildir. Liste boşsa `[]`, tek ürün varsa tek elemanlı array beklenebilir.

## 2. Product API operation matrisi

| Operation | Input | Örnek başarı | Beklenen state etkisi |
| --- | --- | --- | --- |
| `GET /products` | Opsiyonel `status` query | `200` + Product dizisi | Değiştirmez |
| `GET /products/{productId}` | Zorunlu path ID | `200` + Product | Değiştirmez |
| `POST /products` | `name` ve `price` body | `201` + Product; `Location` | Yeni ürün oluşturur |
| `PUT /products/{productId}` | `name`, `price`, `status` | `200` + güncel Product | Tam güncellenebilir temsil |
| `PATCH /products/{productId}` | Değiştirilecek alanlar | `200` + güncel Product | Belirtilen alanları değiştirir |
| `DELETE /products/{productId}` | Path ID | `204`, body yok | Ürün normal sorgudan çıkar |

Bu seçimler **API'mize özgü contract tasarımıdır**. HTTP yöntemleri genel semantiği sağlar, alanların hangilerinin zorunlu olduğu ve silme sonrası GET'in `404` dönmesi ise tasarım kararımızdır.

## 3. GET — collection ve tekil resource

~~~http
GET /products?status=active HTTP/1.1
Host: api.example.test
Accept: application/json

~~~

**Sözleşme:** `status` yoksa koleksiyonun tamamı (örneğin küçük sentetik veri kümesi); `status=active` varsa aktif ürünler. Bu I2 öğretim örneğinde pagination tasarlamıyoruz; büyük ve gerçek kataloglarda limitsiz listeleme tasarımı ayrıca gözden geçirilmelidir (I8).

~~~json
[
  {"id":"p-101","name":"Wireless Mouse","price":29.99,"status":"active"},
  {"id":"p-103","name":"Gaming Keyboard","price":79.99,"status":"active"}
]
~~~

~~~http
GET /products/p-101 HTTP/1.1
Host: api.example.test

~~~

~~~json
{"id":"p-101","name":"Wireless Mouse","price":29.99,"status":"active"}
~~~

## 4. POST — resource oluşturmak

~~~http
POST /products HTTP/1.1
Host: api.example.test
Content-Type: application/json

{"name":"Gaming Keyboard","price":79.99}
~~~

~~~http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /products/p-103

{"id":"p-103","name":"Gaming Keyboard","price":79.99,"status":"active"}
~~~

Provider `id` üretir ve `status=active` atar. Consumer POST ile `id` veya `status` gönderirse bu API'deki sıkı create schema'sı isteği reddeder. HTTP'deki POST semantiği yalnızca “create” ile sınırlı değildir; bu operation için create seçtik.

## 5. PUT ve PATCH — isim benzerliğine aldanma

Mevcut ürün:

~~~json
{"id":"p-103","name":"Gaming Keyboard","price":79.99,"status":"active"}
~~~

**PUT:** Sözleşmemizde güncellenebilir alanların tamamını istiyoruz.

~~~http
PUT /products/p-103 HTTP/1.1
Content-Type: application/json

{"name":"Gaming Keyboard","price":89.99,"status":"active"}
~~~

Yalnız `{"price":89.99}` gönderilmesi bu **PUT contract'ına** uymaz; eksik alanlar vardır. Bu, bütün PUT sunucularının otomatik olarak alan sildiği anlamına gelmez.

**PATCH:** Bu API, `application/merge-patch+json` (JSON Merge Patch) kullanır:

~~~http
PATCH /products/p-103 HTTP/1.1
Content-Type: application/merge-patch+json

{"price":89.99,"status":"inactive"}
~~~

Son durumda `name` korunur, `price` ve `status` değişir. PATCH yalnızca tek alanı değil, birden fazla alanı değiştirebilir. Merge Patch'te `null` genellikle alan kaldırma anlamındadır; bu API'nin PATCH şemasında silinebilir olmayan alanlar için `null` yasaktır. Farklı PATCH formatlarının semantiği aynı değildir.

**Yanlış:** “PUT object'i mutlaka bozar, PATCH sadece tek property değiştirir.”

**Doğru:** HTTP method'unun semantiği ve seçilmiş request schema'sı birlikte yorumlanır. Hangi alanın eksik, değiştirilebilir veya reddedilecek olduğu contract'ta açık olmalıdır.

## 6. DELETE — bildirilen başarı ile gözlenen state farkı

Silmeden önce:

~~~http
GET /products/p-103 → 200 OK
~~~

Silme isteği:

~~~http
DELETE /products/p-103 → 204 No Content
~~~

Silmeden sonra bizim sözleşmemiz gereği:

~~~http
GET /products/p-103 → 404 Not Found
~~~

`204` body içermez; bu status'la JSON başarı mesajı göndermeyiz. DELETE arka planda soft delete gerçekleştirebilir; HTTP, fiziksel database silmesini zorunlu kılmaz. `204` görmek, beklenen durum değişikliğini **tek başına** kanıtlamaz.

## 7. Yanlış varsayım ve gözlenebilir doğrulama

| Yanlış çıkarım | Doğru ayırım |
| --- | --- |
| `DELETE 204` gördüm, verinin silindiği kesin. | Response bir bildirimdir; sonraki GET/state ayrıca sınanır. |
| `POST` her yerde yalnız create yapar. | POST genel olarak request payload'unun hedef tarafından işlenmesini ister. |
| `/products` her zaman dolu dizi döndürür. | Collection boş da olabilir; sözleşmedeki filtre/format belirler. |
| Aynı path tek operation demektir. | Method+path ayrı operation tanımlar. |
| GET/DELETE URL'sini bilmek yeterli. | Doğru yetki ve erişim ayrıca gerekir. |

**SDET:** Expected request, response ve state etkisini ayrı test koşullarına dönüştür.

**AppSec:** Tahmin edilebilir ID veya DELETE method'u yetki vermez. Authorization I5–I6 konusudur; burada güvenlik uygulandığı iddia edilmez.

**SOC:** Request logu, HTTP sonuç kodu ve uygulama/audit state değişikliği üç farklı gözlemdir.

## 8. Kaynak ve öğrenim kaydı

- [MDN HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [RFC 7396 — JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396)
- [OpenAPI 3.1.2 — Paths, Path Item, Operation](https://spec.openapis.org/oas/v3.1.2.html)

**Gözlenen:** Selman method+path farkını, collection/individual resource ayrımını, POST-GET niyetini, PUT/PATCH kapsamını ve DELETE sonrası beklenen `404` state sonucunu açıklamıştır. Bu cevaplar kavramsal, mentor desteğiyle işlenmiş örneklerdir; otomatik API testi, H0 transfer veya runtime uygulaması olarak kaydedilmez.
