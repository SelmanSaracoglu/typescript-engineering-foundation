# Ders 11 — OpenAPI 3.1.2: Yapıyı Gereksinimden Okumak

> **Temel mühendislik sorusu:** Bir API davranışı insan anlatımından makine tarafından okunabilir bir sözleşmeye nasıl dönüşür?
>
> **Increment:** Epic 03 / I2 · **Sabit OAS sürümü:** `3.1.2` · **Anforderung:** API-A2.

## 1. OpenAPI nedir, ne değildir?

**OpenAPI Specification (OAS)** HTTP API arayüzlerini dil ve framework'ten bağımsız tarif etmek için kullanılan standarttır. Bir API'nin endpoint, operation, parameter, request body, response ve schema'sını tanımlayabiliriz.

**OpenAPI belgesi tek başına:**

- HTTP server **başlatmaz**.
- Gelen veriye otomatik **runtime validation** uygulamaz.
- **Authentication veya authorization** yapmaz.
- Gerçek implementation'ın sözleşmeye uygun olduğunu **kanıtlamaz**.
- Test yazılıp çalıştırılmış olduğu anlamına gelmez.

Belgenin çalışır olması ile sağlayıcının o belgeye uyması ayrı sorumluluklardır.

## 2. Gereksinimden çok küçük bir OAS tanımına

Gereksinim: “ID verilen ürün sorulabilsin; başarıda Product dönsün.”

~~~yaml
openapi: 3.1.2
info:
  title: Product API
  version: 0.1.0
servers:
  - url: https://api.example.test
paths:
  /products/{productId}:
    get:
      summary: Get one product
      parameters:
        - name: productId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Product was found
          content:
            application/json:
              schema:
                type: object
                required: [id, name, price, status]
                properties:
                  id: { type: string }
                  name: { type: string }
                  price: { type: number }
                  status:
                    type: string
                    enum: [active, inactive]
~~~

Bu **öğretici ilk parçadır**; Product modelindeki tüm kısıtlar, bulunamama hatası ve tekrar eden şemaların reuse edilmesi biraz sonra eklenir.

### Önemli satırların görevi

| YAML bölümü | Ne tarif eder? |
| --- | --- |
| `openapi: 3.1.2` | Kullanılan OpenAPI Specification sürümü |
| `info.title` | API'nin belgede görünen adı |
| `info.version: 0.1.0` | API tanımının bilgi sürümü; OAS sürümü **değildir** |
| `servers[].url` | Temel erişim URL'si |
| `paths` | Path şablonları |
| `/products/{productId}` | Path parameter yer tutucusu |
| `get` | Bu path'teki GET operation |
| `parameters` | Path/query/header/cookie parametre tanımları |
| `in: path` | Parametrenin konumu |
| `required: true` | Parametrenin bulunması zorunlu |
| `responses.'200'` | Belirli status için response contract |
| `content.application/json` | İlgili response media type |
| `schema` | Body veya parameter verisinin beklenen şekli |

HTTP status key'lerini yazarken YAML'de `'200'`, `'404'` gibi string yazmak yanlışlıkla sayıya dönüştürülmesini önleyen net bir yöntemdir.

## 3. Request body nasıl eklenir?

Yeni gereksinim: “Consumer `name` ve `price` ile ürün oluştursun.”

~~~yaml
/products:
  post:
    summary: Create a product
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [name, price]
            properties:
              name: { type: string, minLength: 1 }
              price: { type: number, exclusiveMinimum: 0 }
            additionalProperties: false
    responses:
      '201':
        description: Product created
~~~

Bu parça tek başına **tam OpenAPI dokümanı değildir**; önceki `paths` içerisine eklenecek *Path Item* örneğidir. `requestBody.required` ile schema içindeki `required` farklı kavramlardır.

**Not:** Response body dönüyorsa `201` response'unda `content` ve `schema` da belirtilmelidir. Tam dosyada bu tanım bulunacak.

## 4. components ve $ref niçin kullanılır?

Bir Product modeli hem GET'in response'unda hem POST'un `201` cevabında kullanılacak. Her yere aynı uzun model şemasını kopyalamak bakım maliyetini ve tutarsızlık riskini artırır.

~~~yaml
components:
  schemas:
    Product:
      type: object
      required: [id, name, price, status]
      properties:
        id: { type: string }
        name: { type: string }
        price: { type: number }
        status:
          type: string
          enum: [active, inactive]
~~~

Bir operation'da yeniden kullanabiliriz:

~~~yaml
content:
  application/json:
    schema:
      $ref: '#/components/schemas/Product'
~~~

`$ref`, bu örnekte belgedeki `components.schemas.Product` tanımına referanstır. Schema'yı tek merkezden güncellemek tekrar riskini azaltır; fakat yanlış ortak model kullanmak da farklı request/response ihtiyaçlarını gizleyebilir.

Bu nedenle tam örneğimizde:
- `Product` (response)
- `CreateProductRequest` (POST input)
- `ReplaceProductRequest` (PUT input)
- `PatchProductRequest` (PATCH input)
- `ErrorResponse` (hata response)

ayrı tasarlanır. Özellikle consumer'ın `id`/`status` belirlememesi gereken POST body ile bütün alanları içeren Product response'unu **aynı schema sanmayacağız**.

## 5. OpenAPI 3.1.2 ve JSON Schema ilişkisi

OAS 3.1 Schema Object, JSON Schema Draft 2020-12 ile uyumluluk temeline dayanır (OAS dialect ayrıntıları vardır). Basit veri modellemede `type`, `required`, `enum`, `pattern`, `additionalProperties` gibi JSON Schema kavramlarını kullanırız.

**OAS 3.1.2'de nullable:**

~~~yaml
type: [string, 'null']
~~~

**Eski OAS 3.0 alışkanlığı:**

~~~yaml
# 3.1.2 örneklerimizde tercih ETMİYORUZ
type: string
nullable: true
~~~

JSON Schema, bir verinin kısıtlara uyup uymadığını tarif eder. Uygulamanın bu kuralları runtime'da çalıştırması için uygun doğrulama mekanizması ayrıca gereklidir.

## 6. Sık yapılan tasarım hataları

| Yanlış | Doğru |
| --- | --- |
| `openapi` ile `info.version` aynı olmalı. | Biri OAS sürümü, diğeri API tanımının sürümü. |
| `type: object` tüm alanları zorunlu kılar. | Zorunluluk schema `required` ile açıkça tanımlanır. |
| `properties` dışındaki alanlar kendiliğinden reddedilir. | Ek alan davranışı `additionalProperties` gibi kurallarla belirlenir. |
| Header `Content-Type` parametre olarak eklenmeli. | Media type `requestBody.content` altında ifade edilir. |
| Swagger/OpenAPI dosyası authorization gerçekleştirir. | Sözleşme anlatır; uygulama uygular ve test kanıtlar. |
| GET/POST aynı Product şemasını zorunlu olarak paylaşır. | Input ile output farklı güven sınırları ve alan gereksinimleri taşıyabilir. |

## 7. Tam dosyayı okuma sırası

Bir sonraki `12-product-api-openapi-3.1.2.yaml` dosyasını şu sırayla incele:

1. `openapi`, `info`, `servers`
2. `paths` ve operations
3. `parameters` / `requestBody`
4. `responses` ve status/headers/body
5. `components.schemas` ve `components.responses`
6. `$ref` hedeflerinin doğru yere bağlanması
7. Gerçek gereksinime göre eksik davranış veya belirsizlik var mı?

Sadece YAML syntax'ını ezberlemek hedefimiz değil; **her satırın hangi contract kararını açıkladığını** anlayabilmek.

## 8. Kaynaklar ve öğrenim kaydı

- [OpenAPI Specification v3.1.2 — resmi sabit sürüm](https://spec.openapis.org/oas/v3.1.2.html)
- Seçili bölümler: *OpenAPI Object*, *Paths/Operation*, *Parameter Object*, *Request Body Object*, *Responses/Response*, *Components*, *Schema Object*.
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)

**Öğrenme statüsü:** Bu dosya tam öğretim için hazırlanmış referanstır. Sohbette tam bir OpenAPI 3.1.2 belgesi henüz Selman tarafından okunup açıklanmadı; bağımsız tasarım H0 değerlendirmesi yoktur.
