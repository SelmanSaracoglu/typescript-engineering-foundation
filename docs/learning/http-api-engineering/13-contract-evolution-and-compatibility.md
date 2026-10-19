# Ders 13 — Contract Evolution, Backward Compatibility ve Breaking Changes

> **Temel mühendislik sorusu:** Provider'ın yaptığı “küçük” bir API değişikliği hangi consumer'ları bozabilir?
>
> **Increment:** Epic 03 / I2 · **Anforderung:** API-A2 · **Durum:** Theory-first referans.

## 1. API sözleşmeleri niçin değişir?

Gerçek ürünler gelişir. Yeni özellikler, performans gereksinimleri, alan isimleri, güvenlik kontrolleri veya iş kuralları contract değişikliği gerektirebilir. Ancak API bir kere tüketicilere açıldığında provider'ın yaptığı değişiklik consumer davranışını etkiler.

**Backward compatibility (geriye dönük uyumluluk):** Yeni provider sürümünün, eski sözleşmeye uygun çalışan consumer'larla beklenen etkileşimi sürdürebilmesi.

**Breaking change:** Önceden geçerli ve çalışır bir consumer kullanımını yeni sözleşme veya implementation yüzünden bozabilen değişiklik.

Uyumluluk **yalnız YAML dosyalarının farkı** değildir; gerçek consumer'ların hangi alanlara, değerlere ve davranışlara bağlı olduğu da önemlidir.

## 2. Somut Product API örneği: price → cost

Önce:

~~~json
{"id":"p-101","name":"Mouse","price":29.99,"status":"active"}
~~~

Sonra:

~~~json
{"id":"p-101","name":"Mouse","cost":29.99,"status":"active"}
~~~

Frontend `product.price` okuyorsa bu değişiklik onu bozabilir. Her iki JSON da sözdizimsel olarak geçerlidir; ama yeni cevap eski **response contract**'a uymaz.

**Yanlış yaklaşım:** “Bilgi aynı, sadece property adı farklı.”

**Doğru yaklaşım:** Consumer, field ismi ve tipi üzerine kurulu olabilir; dolayısıyla değişiklik bir breaking change'dir.

## 3. Request ve response yönlerini ayır

Bu ayrım özellikle önemlidir: Aynı alan değişikliğinin etkisi, alanın **istekte mi cevapta mı** olduğuna göre farklılaşır.

| Değişiklik | Genellikle uyumluluk etkisi | Neden / nüans |
| --- | --- | --- |
| Request'e yeni required alan | **Breaking** | Eski consumer alanı göndermiyor |
| Request'e yeni optional alan | Genellikle backward compatible | Eski request'ler kabul edilmeye devam edebilir |
| Eskiden kabul edilen request alanını kaldırmak | **Breaking olabilir** | Eski consumer bu alanı gönderiyorsa reddedilebilir |
| Request değer kısıtını sıkılaştırmak | **Breaking olabilir** | Eskiden kabul edilen veri artık reddedilir |
| Response'taki required alanı kaldırmak | **Breaking** | Eski consumer o alana güveniyor olabilir |
| Response alanının tipini değiştirmek | **Breaking** | `number` → `string` gibi |
| Response'a yeni optional alan eklemek | Genellikle uyumlu, **garanti değil** | Sıkı consumer bilinmeyen alanı reddedebilir |
| Response'taki required alanı optional yapmak | **Breaking olabilir** | Eski consumer hep mevcut olduğunu varsaymış olabilir |
| Response enum'una yeni değer eklemek | **Breaking olabilir** | Consumer exhaustive switch uygulayabilir |
| Hata status/code davranışını değiştirmek | **Breaking olabilir** | Consumer hata dallanmasını bu koda bağlamış olabilir |
| Operation path/method değiştirmek | Genellikle **breaking** | Mevcut client artık aynı çağrıyı yapamaz |

“Genellikle” notu bilinçlidir. Schema-level kompatibilite ile davranışsal uyumluluk bire bir aynı şey değildir.

## 4. Required vs optional: iki yönde örnek

### A. Request'e required alan eklemek

Önce create request:

~~~json
{"name":"Wireless Mouse","price":29.99}
~~~

Yeni sürümde `currency` zorunlu hâle getiriliyor olsun. Eski consumer hâlâ yukarıdaki body'yi gönderiyor; artık yeni required şartını karşılamıyor. Bu **breaking change** örneğidir.

### B. Response'a optional alan eklemek

Önce:

~~~json
{"id":"p-101","name":"Mouse","price":29.99,"status":"active"}
~~~

Sonra:

~~~json
{"id":"p-101","name":"Mouse","price":29.99,"status":"active","category":"accessory"}
~~~

Eski consumer bilinmeyen property'leri yok sayıyorsa çalışmaya devam edebilir. Ancak mevcut response'u `additionalProperties: false` ile **katı biçimde** doğruluyorsa yeni `category` alanını reddedebilir.

Bu nedenle “response'a optional field eklemek her zaman güvenlidir” demek doğru olmaz.

## 5. Değişen iş davranışı da breaking olabilir

API schema aynı kalsa bile davranış değişebilir.

Örneğin eskiden `DELETE /products/p-101` sonrası GET `404` dönerken yeni sürümde ürün hâlâ GET ile erişilebilir olursa, body'nin şekli değişmemesine rağmen state contract bozulur.

Benzer şekilde PATCH'in “eksik alan korunur” kuralını “eksik alan silinir” olarak değiştirmek risklidir. Bu semantik kayma yalnız type karşılaştırmasıyla görülemez.

## 6. API versioning farkındalığı

Uyumsuz bir değişiklik gerektiğinde seçenekler olabilir:

- Yeni bir API versiyonu veya yeni endpoint sunmak.
- Geçiş süresi boyunca eski ve yeni contract'ı birlikte desteklemek.
- Consumer etkisini ve deprecation takvimini açıklamak.
- Önceden anlaşılmış güvenli bir migration yolunu belgelendirmek.

Örneğin `/v2/products` bir versiyonlama stratejisidir, fakat tek strateji değildir ve yeni path koymak tek başına gerçek uyumluluğu çözmez. **İleri versiyonlama veya mikroservis mimarisi bu Increment'in kapsamı değildir.**

## 7. SDET ve AppSec açısından inceleme yöntemi

Bir contract değişikliğinde şu soruları sor:

1. Önceden kabul edilen hangi request artık reddediliyor?
2. Önceden garanti edilen hangi response alanı, tip, status veya davranış değişiyor?
3. Eski consumer'ın kullandığı alanlar ve enum değerleri hangileri?
4. Değişiklik yalnız schema'da mı, state/business semantics'te de var mı?
5. Yeni belgenin yazılması dışında hangi **regression** kanıtı gerekir?

**SDET:** Eski contract için regression örnekleri, yeni contract için pozitif/negatif test koşulları geliştirilir (uygulama I4).

**AppSec:** Eski sürümü desteklemek güvenlik kontrollerinin atlanmasına yol açmamalıdır. Buna karşılık “güvenlik için değişti” gerekçesi, consumer etkisini analiz etme zorunluluğunu ortadan kaldırmaz.

**SOC:** API değişikliğinden sonra hata kodu veya alan ismi değişmişse telemetry/detection görünürlüğü de etkilenebilir.

## 8. Yanlış ve doğru düşünce

| Yanlış | Doğru |
| --- | --- |
| “Optional field eklemek her durumda kırmaz.” | Tolerant/strict consumer davranışı kontrol edilir. |
| “API JSON ise alan adları önemsiz.” | JSON property isimleri consumer'ın sözleşmesidir. |
| “Version numarası artırınca herkes uyumlu olur.” | Gerçek kabul edilen request ve response semantiği önemlidir. |
| “YAML diff boşsa breaking change yok.” | Davranışsal/state değişiklikleri ayrı izlenir. |

## 9. Kaynak ve öğrenim durumu

- [OpenAPI Specification 3.1.2](https://spec.openapis.org/oas/v3.1.2.html)
- [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)

**Gözlenen:** Selman `price` alanının `cost` olarak değiştirilmesinin consumer kodunu bozabileceğini açıklamıştır. Diğer compatibility vakaları öğretim dokümanında hazırdır; henüz yeni senaryoda bağımsız tasarım/analiz veya H0 transfer kanıtı yoktur.
