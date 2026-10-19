# Ders 09 — Request Contract: Parameters, Body, Schema ve Nullable

> **Temel problem:** Geçerli JSON göndermek, API'nin o veriyi kabul etmesi için neden yeterli değildir?
>
> **Increment:** Epic 03 / I2 · **Anforderung:** API-A2 · **Statü:** Theory-first referans. Runtime validation I3'e aittir.

## 1. Dört request girdisi: aynı Product API

| Konum | Örnek | İşlev | Bizim sözleşmemizde |
| --- | --- | --- | --- |
| Path | `/products/{productId}` | Hangi tekil ürün? | `productId` zorunlu |
| Query | `/products?status=active` | Hangi ürünler filtrelenecek? | `status` optional |
| Header | `Accept-Language: tr` | Tercih edilen dil | Öğretici örnek, zorunlu değil |
| Body | `{"name":"Mouse","price":29.99}` | Ürün oluşturma girdisi | `POST /products` için body zorunlu |

~~~http
POST /products HTTP/1.1
Host: api.example.test
Accept: application/json
Content-Type: application/json

{"name":"Wireless Mouse","price":29.99}
~~~

`Content-Type` gönderdiğimiz body'nin media type bilgisini verir; `Accept` kabul edilebilir response media type'ını bildirir. **Header'ın öyle söylemesi verinin doğru olduğunu kanıtlamaz.** OpenAPI'de request formatı `requestBody.content`, response formatı `responses.*.content` altında tanımlanır. `Accept` veya `Content-Type` header adlarını sıradan OpenAPI Header Parameter olarak tanımlamak doğru değildir.

## 2. Requirement → alan kararı

**Gereksinim:** “Yeni ürünün adını ve pozitif fiyatını consumer belirler; ID ve ilk durum provider tarafından atanır.”

Buna göre bir **CreateProductRequest** tasarlayalım:

| Alan | JSON type | Presence | Constraint | Gerekçe |
| --- | --- | --- | --- | --- |
| `name` | string | required | 1–100 karakter; yalnız whitespace olamaz | Anlamlı ürün adı |
| `price` | number | required | 0'dan büyük | Pozitif fiyat |
| `id` | — | yasak | Provider üretir | Consumer ID seçmesin |
| `status` | — | yasak | İlk değer `active` | Provider durum atar |
| Ek alanlar | — | yasak | `additionalProperties: false` | Tanımlanmamış input reddedilir |

Geçerli:

~~~json
{"name":"Wireless Mouse","price":29.99}
~~~

Geçerli JSON, ancak sözleşmeye aykırı:

~~~json
{"name":123,"price":"29.99"}
~~~

JSON parser bu nesneyi okuyabilir; fakat schema doğru tipleri bulamaz.

## 3. Missing, null, empty ve invalid farklıdır

| Request body | Sınıf | Bizim sözleşmemiz |
| --- | --- | --- |
| `{"price":29.99}` | Missing `name` | Required ihlali |
| `{"name":null,"price":29.99}` | Present ama null | String değil |
| `{"name":"","price":29.99}` | Empty string | `minLength:1` ihlali |
| `{"name":42,"price":29.99}` | Wrong type | String değil |
| `{"name":"  ","price":29.99}` | Whitespace-only | Ek `pattern` kuralıyla ihlal |

**Required:** Alan mevcut olmalı mı? **Optional:** Alan hiç gönderilmeyebilir mi? **Nullable:** Alan mevcutsa null kabul ediliyor mu? Bu özellikler birbirinden bağımsızdır.

OpenAPI 3.1.2 / JSON Schema'da nullable string gösterimi:

~~~yaml
type:
  - string
  - "null"
~~~

Bu yazım, alanı tek başına required yapmaz. `nullable: true`, OpenAPI 3.0 alışkanlığıdır ve 3.1.2'de burada kullanılmaz.

**Yalnız kavramsal örnek:** `description` optional ve nullable olsaydı `{}` ve `{"description":null}` kabul edilebilirdi; `{"description":5}` reddedilirdi. Ancak `description` çekirdek Product API sözleşmemizde henüz tanımlanmadı.

## 4. Kısıtları YAML ile tanımlama

~~~yaml
type: object
required: [name, price]
properties:
  name:
    type: string
    minLength: 1
    maxLength: 100
    pattern: '.*\S.*'
  price:
    type: number
    exclusiveMinimum: 0
additionalProperties: false
~~~

| Keyword | Görevi |
| --- | --- |
| `type` | JSON veri tipi |
| `required` | Nesnedeki zorunlu alan isimleri |
| `properties` | Alanların ayrı şemaları |
| `minLength` / `maxLength` | String uzunluğu sınırları |
| `pattern` | İstenen karakter örüntüsü |
| `exclusiveMinimum: 0` | Sayı sıfırdan büyük |
| `enum` | İzinli değerler kümesi |
| `additionalProperties: false` | Tanımlanmamış alanları reddetmek |

`minLength: 1`, yalnızca boşluk içeren `"   "` ifadesini engellemez. `pattern: '.*\S.*'` en az bir boşluk olmayan karakter arar.

**Dikkat:** `properties` altında bir alanı listelememek, ek alanları kendiliğinden reddetmez. `additionalProperties: false` bu sözleşmede bu işi üstlenir. `price` için JSON number seçilmesi, tam parasal hassasiyet ve para birimi sorularını kendiliğinden çözmez. Bu basitleştirilmiş Product API örneğidir.

## 5. Parameter schema da gerekir

**Path:**

~~~yaml
- name: productId
  in: path
  required: true
  schema:
    type: string
    pattern: '^p-[0-9]+$'
~~~

Path parameter'ı OpenAPI'de required olmalıdır. `p-101` bizim sentetik ID formatımızdır.

**Query:**

~~~yaml
- name: status
  in: query
  required: false
  schema:
    type: string
    enum: [active, inactive]
~~~

`status` gönderilmezse tüm ürünleri listelemek bizim API kararımızdır; query parametreleri genel olarak her zaman optional olmak zorunda değildir.

**Header parametresine örnek (nihai Product YAML'ında etkinleştirilmemiştir):**

~~~yaml
- name: Accept-Language
  in: header
  required: false
  schema:
    type: string
    enum: [tr, en]
~~~

Header destekleniyorsa varsayılan dil, fallback ve yanıtın hangi alanlarını etkilediği ayrıca tasarlanmalıdır.

## 6. Media type ve geçersiz istek politikası

`POST /products` bu sözleşmede `application/json` body bekler.

| Durum | Bu API'de seçtiğimiz HTTP cevabı |
| --- | --- |
| JSON syntax bozuk | `400 Bad Request`; `INVALID_JSON` |
| `Content-Type: text/plain` | `415 Unsupported Media Type`; `UNSUPPORTED_MEDIA_TYPE` |
| İyi biçimlenmiş JSON, fakat alan/tip/kısıt ihlali | `422 Unprocessable Content`; `VALIDATION_ERROR` |
| Schema doğru fakat işlem iş kuralına aykırı | Ayrı business error, örneğin `409 Conflict` |

Bu tablo **bizim hata politikamızdır**; başka API'ler schema validation için `400` tercih edebilir.

## 7. Tasarım sınırı

- Schema tanımı runtime validation'ı kendi başına çalıştırmaz.
- Frontend kontrolü backend kontrolünün yerine geçmez.
- Consumer'ın sağlayıcıya ait alanları yazabilmesi mass assignment benzeri riskler yaratabilir.
- Schema yazmak authorization kontrolünün yapıldığını kanıtlamaz.
- SDET için missing/null/empty/wrong-type/boundary ayrı test koşullarıdır; otomatik test I4 konusudur.
- SOC için header ve response status logu, backend'in input'u doğru ayrıştırdığına dair tek başına kanıt değildir.

## 8. Kaynaklar ve öğrenim statüsü

- [OpenAPI 3.1.2 — Parameter, Request Body, Schema](https://spec.openapis.org/oas/v3.1.2.html)
- [JSON Schema](https://json-schema.org/understanding-json-schema/)
- [MDN Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type)

**Gözlenen:** Path/query/body ve required/optional temel kavramları konuşuldu. Bu dokümandaki tüm missing/null/empty/invalid ayrımları, field constraints ve tam YAML schema henüz Selman tarafından bağımsız örnekte değerlendirilmedi; bu dosyanın yazılmış olması yeterlilik kanıtı değildir.
