# Ders 14 — I2 Öğrenim Rehberi, Kapsam Kontrolü ve Ertelenen Kanıtlar

> **Epic 03 / I2 — API Contract Design & OpenAPI**
>
> **Ana Anforderung:** API-A2 · **Specification:** OpenAPI 3.1.2 · **Aşama:** Theory-first.
>
> **Önemli:** Doküman setinin tamamlanması, Selman'ın bütün içeriği öğrendiği veya bağımsız uygulama yapabildiği anlamına gelmez.

## 1. I2 okuma sırası ve I1 bağlantısı

I1'in `01`–`06` dosyaları HTTP request/response, methods, headers, status, DevTools/curl ve hata katmanlarını öğretir. I2 bu bilgilerin üzerine kurulur, I1'i yeniden anlatmaz.

| Dosya | Odak | Öğrenilecek mühendislik ayrımı |
| --- | --- | --- |
| `07-api-contract-requirement-design.md` | Requirement → Contract | Beklenti ile çalışan kod ayrımı |
| `08-resources-operations-and-state.md` | Resource / path / operation | Method, input/output ve state etkisi |
| `09-request-contract-schema-and-input-cases.md` | Parametreler, body, şema | Missing/null/empty/invalid, required/optional |
| `10-response-and-error-contract.md` | Başarı ve hata sözleşmesi | Status, header, body ve state; validation/business |
| `11-openapi-3-1-2-reading-guide.md` | OpenAPI yapısı | YAML öğelerinin contract kararlarıyla bağlantısı |
| `12-product-api-openapi-3.1.2.yaml` | Birleşik sentetik API örneği | Tam contract ve reuse/`$ref` |
| `13-contract-evolution-and-compatibility.md` | Backward compatibility | Consumer etkisi ve breaking changes |
| Bu dosya | Eğitim ve kanıt ayrımı | Teorik faz kapanışı için açık kriterler |

Tüm örnekler **sentetik** `https://api.example.test` adresini kullanır. Çalışan bir Product API sunucusu iddia edilmez.

## 2. I2 içerik kapsaması — dokümantasyon düzeyi

| Anforderung / konu | Belge | Dokümantasyon |
| --- | --- | --- |
| Contract / implementation / consumer / provider / API-first | 07 | Yazıldı |
| Resource, collection, identifier, endpoint, operation, GET/POST/PUT/PATCH/DELETE | 08 | Yazıldı |
| Path/query/header/body, content types | 09 | Yazıldı |
| Schema, required, optional, nullable, constraints | 09 | Yazıldı |
| Missing/null/empty/invalid | 09 | Yazıldı |
| Success status, response headers/body, errors | 10 | Yazıldı |
| Validation vs business-rule error | 10 | Yazıldı |
| OpenAPI 3.1.2, JSON Schema, components/$ref | 11 + 12 | Yazıldı |
| Breaking changes, backwards compatibility, versioning farkındalığı | 13 | Yazıldı |
| SDET/AppSec/SOC etkileri | 07–13 | Yazıldı |
| Teorik soruların öğrenciyle değerlendirilmesi | Sohbet kanıtı | **Kısmen; devamı gerekli** |
| Teknik doküman gözden geçirme ve örnek onayı | Bu PR | **İnceleme bekliyor** |
| H0 yeni görev, runtime validation, API test, debugging | Sonraki Increment'ler | **Bu fazda yapılmadı** |

“Yazıldı”, **öğrenildi** veya **bağımsız doğrulandı** anlamına gelmez.

## 3. Selman'ın bu sohbette gözlenen katkıları

Aşağıdaki açıklamalar mentor tarafından sunulmuş örneklerin ardından verilmiştir:

- `price` alanının string dönmesinin numeric response contract'ını ihlal ettiğini söyledi.
- `404` beklenirken `200` dönmesinin hata mesajı doğru olsa bile sözleşmeye aykırı olduğunu belirtti.
- Hata JSON'undaki `code` alanının önce hiç kararlaştırılmadığını sordu; bu, mentorun örnekteki belirsizliği ortaya çıkardı.
- `code` required olduğu için eksikliğinin hata sözleşmesini bozduğunu açıkladı.
- `price` alanını `cost` olarak değiştirmek consumer'ı bozabilir dedi.
- API-first'te ortak contract'ın entegrasyon uyuşmazlığını azalttığını açıkladı.
- GET ile DELETE operations ayrımını, collection ile individual resource farkını, POST yaratma ve GET okuma niyetini açıkladı.
- PUT/PATCH örneğindeki aşırı basitleştirmeye itiraz etti; PATCH'in gönderilmeyen alanları koruyabilmesini doğru yorumladı.
- DELETE sonrası GET'in `404` dönmesi gerektiğini, `204`'ün tek başına yeterli kanıt olmadığını belirtti.
- Her küçük konu sonunda soru istenmediğini bildirdi; öğretim daha büyük kavramsal bloklar hâlinde ilerletilecektir.

Bu liste **gözlenen kavramsal katkılar**dır; yeni bir API'yi yardım olmadan tasarlama, validasyon kodu yazma veya test otomasyonu kanıtı değildir.

## 4. H0–H4 yardım ve kanıt politikası

Ortak değerlendirme prensibine göre:

- **H0:** Göreve özel hazır çözüm almadan bağımsız uygulama (doküman ve debugger serbest).
- **H1–H2:** Kavramsal ipucu veya adım yönlendirmesiyle yapılan çalışma.
- **H3:** Mentorla birlikte kritik çözüm üretimi.
- **H4:** Göreve ait tam mentor/AI çözümü.

**Bu doküman seti AI tarafından tam olarak hazırlanmış referans materyalidir (üretim bakımından H4).** Selman'ın konuşmadaki kavramsal yanıtları mentorun açıklanmış örnekleri ardından gelmiştir; bağımsız H0 görev olarak sınıflandırılmamalıdır.

## 5. Theory Phase Definition of Done — henüz kapanmadı

I2 teorik fazı tamamlanmış saymak için:

1. Konuların tamamı Selman ile işlenmeli.
2. Endpoint input/output/state contract açıklanmalı.
3. OpenAPI 3.1.2 örneği satır düzeyinde okunmalı.
4. Required/optional/nullable, error response ve compatibility kararları açıklanmalı.
5. Kısa kavramsal kontrollerin cevapları gözlenip değerlendirilmelidir.
6. Doküman ve YAML örnekleri gözden geçirilmelidir.
7. Ertelenmiş uygulama/debugging/H0 kanıtları açıkça kaydedilmelidir.

**Mevcut kayıt:** Dokümantasyon taslağı hazırlanmıştır. Tam teori öğretimi ve öğrenci doğrulaması **henüz tamamlanmış olarak kaydedilmiyor**. `Theory Completed ≠ Engineering Competence Verified`.

## 6. Sonraya bırakılan uygulama ve transfer

Bu Increment yalnız **Theory Phase** içerir. Ertelenenler:

- Yeni endpoint için H0 contract tasarımı ve gerekçelendirme.
- Runtime validation implementation (**I3**).
- Normal/sınır/hata otomatik API testleri (**I4**).
- Authentication ve session uygulaması (**I5**), authorization/ownership testleri (**I6**).
- Idempotency/retry (**I7**).
- Pagination, limits ve resilience (**I8**).
- Bütünleşik bağımsız capstone (**I9**).
- Gerçek traffic/implementation üzerinde kontrat uyumsuzluğunu debug etme ve yeni alana bağımsız aktarım.

Bu dosyadaki YAML sentetik örnektir; yeni repo/framework/database/server kurulmaz.

## 7. Belge inceleme kontrolü

PR incelemesinde kontrol edilecekler:

- `openapi: 3.1.2` doğru; `info.version` API tanım sürümüdür.
- Tüm `$ref` bağlantıları `components` içinde hedef buluyor.
- `POST /products` yalnız name+price kabul ediyor; ID/status provider'dan.
- PATCH media type `application/merge-patch+json`; missing alan korunur; null forbidden.
- `204` body içermiyor; `201` Location tanımlıyor.
- Success ve error response'un required alanları tutarlı.
- `price` number ve `status` enum; parasal hassasiyetin sınırı belgeli.
- Değişiklik yalnız `docs/learning/http-api-engineering/` klasöründeki yeni dosyalardan oluşuyor; eski I1 veya başka Epic dosyaları değiştirilmemiş.

## 8. Epic'e sunulacak closure report — gelecekte

**Anforderung:** API-A2

**Öğretilen konular:** [teorik oturumda gerçekten işlenenler]

**Açıklanan contract örnekleri:** [gerçekten değerlendirilenler]

**OpenAPI sürümü:** 3.1.2

**Oluşturulan dosyalar:** 07–14 arası MD/YAML referans dosyaları

**Değiştirilen eski dosyalar:** Yok

**Selman'ın gözlenen katkıları ve yardım düzeyi:** Yukarıdaki somut kanıt + gelecekteki yanıtlar

**GitHub durumu:** İnceleme dalı / draft PR; merge edilirse commit SHA ve branch doğrulanacak

**Theory Completed:** Henüz kanıtlanmadı

**Engineering Competence Verified / H0:** Hayır, sonraki görevlerde değerlendirilecek

**Açık eksikler:** Öğrenciyle kalan teorik konuların işlenmesi, örneklerin anlaşılmasının doğrulanması, bağımsız transfer ve uygulama

Bu bir **hazırlık kaydıdır**, tamamlanmış Increment Closure Report değildir. Tam kapanış raporu ancak sohbetin teorik DoD'si gözlenince Epic yönetimine verilir.

## 9. Teknik referanslar

- [OpenAPI 3.1.2 — sabit resmi specification](https://spec.openapis.org/oas/v3.1.2.html)
- [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [RFC 7396 — JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396)
- [JSON Schema](https://json-schema.org/)
