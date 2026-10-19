# Ders 10 — Response Contract ve Tutarlı Hata Sözleşmesi

> **Temel mühendislik sorusu:** API'nin doğru HTTP status vermesi neden response'un doğru olduğu anlamına gelmez?
>
> **Increment:** Epic 03 / I2 · **Anforderung:** API-A2 · **Statü:** Theory-first referans.

## 1. Response contract'ın bileşenleri

Bir operation'ın contract'ı yalnız request değil, yanıt davranışını da içerir:

- **HTTP status:** İşlemin HTTP düzeyindeki sonucunu bildirir.
- **Response headers:** Media type, yeni resource adresi veya diğer metadata.
- **Response body:** Varsa sonuç temsilinin veri şekli.
- **State effect:** İşlem başka bir resource'un durumunu değiştirebilir; tek response her zaman bunu kanıtlamaz.

**GET /products/p-101:**

~~~http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":"p-101","name":"Wireless Mouse","price":29.99,"status":"active"}
~~~

Burada yalnız `200` kontrolü yeterli değildir. `price: "29.99"` dönmesi body contract ihlalidir. `status` alanı zorunluysa onun eksikliği de ihlaldir.

## 2. Başarı cevapları: farklı işlemler, farklı beklentiler

| Operation | Örnek status | Header/body sözleşmesi | Doğrulama |
| --- | --- | --- | --- |
| `GET /products/{productId}` | `200 OK` | Product JSON | ID ve alan/tip uyumu |
| `GET /products` | `200 OK` | Product array | Filtreye uygun elemanlar |
| `POST /products` | `201 Created` | Product JSON; `Location` | Yeni ID, status active, yeni resource |
| `PUT /products/{productId}` | `200 OK` | Güncel Product JSON | Güncellenmiş alanlar |
| `PATCH /products/{productId}` | `200 OK` | Güncel Product JSON | Değiştirilen ve korunan alanlar |
| `DELETE /products/{productId}` | `204 No Content` | Body **yok** | Sonraki GET'te `404` |

**Yanlış:** `204 No Content` ile JSON body göndermek. **Doğru:** `204` için body bulunmaması. JSON başarı mesajı istenirse başka bir status/response contract seçilir.

`201` için `Location: /products/p-103` yeni oluşturulan resource'un adresini gösterir. Yeni ürünün kimliğinin nereden geldiği (provider) önemlidir.

## 3. Error contract: hata kodu ve mesajı farklı görevler

Ürün bulunmadığında bizim sözleşmemiz:

~~~http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"code":"PRODUCT_NOT_FOUND","message":"Product not found"}
~~~

| Alan | Amacı | Contract |
| --- | --- | --- |
| HTTP `404` | Request sonucunun sınıfı | Ürün mevcut değil |
| JSON `code` | Kararlı, makinece işlenebilir sınıflandırma | Required string |
| JSON `message` | İnsan tarafından anlaşılabilir açıklama | Required string |

`code` “makine dili” değildir; API'nin seçtiği **machine-readable error code** değeridir. `message` değişebilir veya yerelleştirilebilir, bu nedenle consumer kritik dallanmaları yalnız serbest metne bağlamamalıdır.

## 4. Tek bir tutarlı ErrorResponse şeması

~~~yaml
type: object
required: [code, message]
properties:
  code:
    type: string
    minLength: 1
  message:
    type: string
    minLength: 1
  details:
    type: array
    items:
      type: object
      required: [field, reason]
      properties:
        field: { type: string }
        reason: { type: string }
      additionalProperties: false
additionalProperties: false
~~~

`details` optional'dır; birden çok input ihlalini raporlamak gerektiğinde kullanılabilir. Örneğin:

~~~http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/json

{
  "code": "VALIDATION_ERROR",
  "message": "Request does not match the product schema",
  "details": [
    {"field":"name","reason":"must contain a non-whitespace character"},
    {"field":"price","reason":"must be greater than zero"}
  ]
}
~~~

`details` alanı isteğin uygulanması için zorunlu değildir. Ancak sunucu alanı döndürüyorsa ilan edilen formatı karşılamalıdır. Bu örnek hassas internal schema, stack trace veya database bilgisi döndürmez.

## 5. Validation error ile business-rule error ayrımı

**Validation error:** Request, sözleşmede kabul edilen veri yapısına veya basit constraint'e uygun değil.

~~~json
{"name":"","price":-10}
~~~

Bu Product API'de `422 VALIDATION_ERROR`.

**Business-rule error:** Request yapısal olarak geçerli, fakat sistemin iş durumuna göre işleme izin verilmiyor.

Örneğin **tasarım kararı** olarak “`inactive` ürüne fiyat güncellemesi yapılamaz” kuralını kabul edelim:

~~~http
PATCH /products/p-102 HTTP/1.1
Content-Type: application/merge-patch+json

{"price":89.99}
~~~

Ürün `p-102` mevcut ama `status=inactive` ise:

~~~http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"code":"PRODUCT_INACTIVE","message":"Inactive product cannot be updated"}
~~~

Bu örnekte request body şemaya uyuyor; işlem resource'un iş durumuyla çelişiyor. `409` ve hata kodu bizim tasarım seçimimiz. Bu kural nihai referans OpenAPI'sinde PUT/PATCH için de belgelenir.

**Dikkat:** `400` ile `422` ayrımı API tasarımına bağlıdır; her sistem aynı status politikasını izlemek zorunda değildir.

## 6. Hata karar tablosu

| Koşul | Bu Product API'nin kararı |
| --- | --- |
| Bozuk JSON | `400` + `INVALID_JSON` |
| Beklenmeyen request media type | `415` + `UNSUPPORTED_MEDIA_TYPE` |
| Schema yanlış/eksik/constraint ihlali | `422` + `VALIDATION_ERROR` |
| Geçerli ID biçimi ama ürün yok | `404` + `PRODUCT_NOT_FOUND` |
| Mevcut ama inactive ürünün PUT/PATCH ile değiştirilmesi | `409` + `PRODUCT_INACTIVE` |
| Başarılı create | `201` + Product + Location |
| Başarılı delete | `204`, body yok |

**Sıra nüansı:** Bir istek birden fazla açıdan geçersizse (örneğin hem bulunmayan ID hem yanlış body), provider'ın hangi hatayı önce bildireceği ayrıca tanımlanabilir. Bu küçük API sözleşmesi bütün kombinasyonlar için kontrol sırası taahhüt etmez; ileride belirsizliği gideren açık bir contract kararı gerekebilir.

## 7. SDET ve AppSec açısından doğrulama sınırı

**SDET:** Beklenen sonuç; status + header + body schema + gerekiyorsa state doğrulamasından oluşur. API otomasyonunun kurulması I4'te yapılacaktır.

**AppSec:** Hata mesajlarında credential, stack trace veya iç sistem detayları dökülmemeli. Aynı hata sınıfına tutarlı davranış üretmek faydalıdır; authorization yine ayrı güvenlik kontrolüdür.

**SOC:** Bir hata kodunun logda görünmesi, nedenin ispatı değildir. Trace ve uygulama davranışı gerektiğinde ayrıca incelenir.

## 8. Kaynak ve öğrenim durumu

- [MDN — HTTP Status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [OpenAPI 3.1.2 — Responses / Response Objects](https://spec.openapis.org/oas/v3.1.2.html)

**Gözlenen:** Selman `200` yerine `404` gerekliliğini; `404` olduğu hâlde `code` eksikse response contract ihlalini; `204` sonrası state doğrulama gerekçesini açıklamıştır. `400`/`415`/`422`/`409` ayrımının bütün ayrıntıları henüz bağımsız örnekte değerlendirilmeyip referans olarak yazılmıştır.
