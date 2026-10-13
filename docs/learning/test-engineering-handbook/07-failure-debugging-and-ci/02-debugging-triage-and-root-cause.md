# 36. Debugging & Defect Triage — Belirtiden kök nedene

> **Temel soru:** Test FAIL verdiyse gerçek kusur nerede, bunu nasıl kanıtlarız?

I5'in önceki dersinde flaky test için olası nedenleri sınıflandırdık. Bu derste herhangi bir failure için **yeniden üretim, gözlem, hipotez, deney, düzeltme ve yeniden doğrulama** zincirini kuracağız.

## 36.1 İlk rapor neden yetersiz?

~~~text
Checkout testi FAIL.
Expected: 100
Actual: 0
~~~

Bu kayıt birçok soruyu cevapsız bırakır:
- Sepet toplamı mı, kargo ücreti mi?
- 100 ve 0 hangi birimde?
- Hangi kullanıcı/kupon?
- Hangi endpoint veya DOM öğesi?
- Hangi build?
- İş kuralına göre gerçekten 100 mü bekleniyor?

**Failure (gözlenen başarısız davranış)** ile **defect (buna yol açan ürün kusuru)** aynı şey değildir. Hata raporunda henüz bulmadığımız kök nedeni kesin gerçek gibi yazmamalıyız.

## 36.2 Evidence üç katmanda toplanır

MiniShop örneği: ACTIVE müşteri, kupon sonrası sepet 100 €, STANDARD shipping seçili; UI 5 € gösteriyor ama iş kuralı 0 € diyor.

**Katman 1 — Test setup**
- Customer gerçekten ACTIVE mi?
- Basket gerçekten 100,00 € mu?
- Kupon AVAILABLE/USED koşulu doğru mu?
- Shipping türü STANDARD mı?

**Katman 2 — Transport / API**
- Request hangi body ile gitti?
- Response hangi status/tutar ile döndü?
- Endpoint hangi sürümde?
- Correlation ID var mı?

**Katman 3 — UI / persisted state**
- Browser hangi tutarı gösterdi?
- Order kaydında shipping minor units kaç?
- Herhangi bir yan etki veya veri değişimi var mı?

Bu katmanların farklı sonuçlar üretmesi, sorunun **nerede oluşmuş olabileceğini** daraltır.

## 36.3 Gözlem ile hipotez tablosu

| Gözlem | Olası hipotez | Bir sonraki deney |
|---|---|---|
| API shipping=0, UI shipping=5 | UI yanlış cache/formatlama | Reload ve DOM/network karşılaştır |
| API shipping=5, component expected=0 | Backend mapping/rule kusuru | Aynı fixture ile service test |
| API 401 | Session expired veya yanlış token | Identity ve token koşulunu kontrol et |
| Request hiç gitmedi | UI event veya selector hatası | Click/actionability ve network trace |
| DB shipping=0, API=5 | Serializer veya cache tutarsızlığı | DB ve response timestamp/version incele |
| Test yalnız CI'da fail | Env, parallelism, locale farkı | Env matrisi ve izolasyon deneyleri |

**Bu tablo teşhis değil, deney tasarımıdır.** Bir gözlemi diğer katmanla karşılaştırmadan belirli kod satırını suçlamak erken olur.

## 36.4 Debugging adımlarını küçük bir vaka üzerinde izle

**Aşama 1 — Reproduce:** Sabit fixture, belirli build ve aynı kullanıcıyla failure'ı tekrar et.

**Aşama 2 — Record:** Expected/actual tutar, request body, response body ve correlation ID kaydet. Test hesabı/gizli token'ı düz metin yayımlama.

**Aşama 3 — Hypothesis A:** Backend kupon öncesi toplamı kullanıyor.  
**Deney:** Aynı ürünler, kuponlu/kuponsuz kontrollü iki input ile response'u karşılaştır.

**Aşama 4 — Hypothesis B:** UI yanlış eski response'u okuyor.  
**Deney:** API 0 döndüğünde UI state ve cache davranışını izle.

**Aşama 5 — Root cause:** Deneylerle hangi varsayımın desteklendiğini belirle; olasılıkları eleyemiyorsan “root cause confirmed” yazma.

**Aşama 6 — Fix / Regression:** İlgili kod veya test setup düzeltildikten sonra hem başarısız koşulu (**confirmation**) hem komşu/etkilenen davranışları (**regression**) çalıştır.

Bu yaklaşım “hata olduğunda satır değiştirip yeniden denedim” metodundan daha güvenilirdir.

## 36.5 Defect kaydında gerekli alanlar

| Alan | Örnek |
|---|---|
| Title | Active member charged standard shipping at 100 EUR threshold |
| Requirement | Onaylı ücretsiz kargo kuralı |
| Environment | Test/staging, build, browser, ilgili servis sürümü |
| Preconditions | ACTIVE kullanıcı, STANDARD seçimi, net basket=100,00 € |
| Steps | Sepeti oluştur → kargo seç → sonucu gözle |
| Expected | Shipping fee 0,00 € |
| Actual | UI 5,00 €, API response ... (gerçek veriyle doldurulur) |
| Evidence | Sanitized request/response, screenshot, correlation ID |
| Impact | Yanlış ücretlendirme; etkilenen kullanıcı kümesi |
| Status / unresolved | Root cause investigation pending |

**Severity ve priority farklıdır:**
- **Severity:** Kusurun kullanıcı/iş/teknik açıdan ciddiyeti.
- **Priority:** Ne kadar erken ele alınmalı?
Yüksek severity her zaman aynı release priority anlamına gelmeyebilir; ürün riski, workaround ve sorumlularla değerlendirilir.

## 36.6 Error status mı, ağ arızası mı?

Ödeme akışı başarısız oldu. İki gözlem:

**A:** HTTP 500 response dönüyor. Sunucu bir HTTP hata yanıtı verdi.

**B:** Hiç response alınamıyor, bağlantı koptu. İşlemin server/provider tarafında gerçekleşip gerçekleşmediği belirsiz.

İkinci durumda kullanıcıya “ödeme başarısız” mesajı göstermek **yanlış kesinlik** taşıyabilir. Bu konu, önceki [idempotency](../06-api-and-ui-testing/04-api-idempotency-retries-and-concurrency.md) dersiyle bağlantılıdır.

### Test defect'i de gerçek defect'tir

Testin yanlış selector kullanması veya actual'ı expected olarak kaydetmesi **test otomasyon kodundaki kusurdur**. Bu, uygulama kusuru olmayabilir; yine de güvenilmez kalite sinyali ürettiği için düzeltilmelidir.

## 36.7 Observability ve sınırları

**Log:** Hangi olay ne zaman gerçekleşti?  
**Metric:** Hata oranı veya latency ne kadar değişti?  
**Trace / correlation ID:** İstek hangi servislerden geçti?  
**Screenshot/video:** Browser hangi state'i gösterdi?  
**DB state:** İş sonucunun kalıcı kaydı nasıl?

Bu kaynakların hepsinin aynı zaman dilimi, request veya test run'a ait olduğunu kanıtlamak gerekir. Aksi halde birbirinden farklı işlemlerle yanlış root cause analizi yapılabilir.

**Güvenlik:** Token, cookie, müşteri adresi, kart bilgisi veya hassas belge içeriğini rapora/screenshot'a gereksiz kopyalama; maskele ve erişimi sınırla.

## 36.8 Fail örneğini düzgün raporla

Zayıf:
> “BDD kargo testi flaky; bazen 5 dönüyor. Retry açtım.”

Daha iyi **örnek rapor**:
> “Build X'te ACTIVE üye + net 100,00 € + STANDARD gönderimde beklenen 0,00 € iken UI 5,00 € gösterdi. Başlangıç fixture'ı doğrulandı. İlgili API response ve DOM gözlemleri aynı correlation ID ile karşılaştırılacak. Şu an kök neden doğrulanmış değil. Yeniden üretim ve izole karşılaştırma planlandı.”

Bu örnekte X yer tutucudur. **Gerçek raporda yalnız gerçekten toplanan kanıtı yaz.**

## 36.9 Alıştırma — başka sistem

Belge servisi bir dosya yüklemesinden sonra “Upload succeeded” gösteriyor ama dosya listesinde belge görünmüyor.

**Görev:** Üç hipotez, her biri için bir deney ve bug kaydına girecek iki kanıt öner.

**Örnek çözüm:**
- UI eski list/cache → reload ve GET documents response kontrolü.
- Backend belge kaydını persist etmedi → upload yanıtı ile DB kayıt/state'ini karşılaştır.
- Test yanlış kullanıcı/tenant kullandı → identity ve fixture ownership doğrula.
- Kanıt: sanitized upload request/response + aynı belge ID'sinin list/DB sonucunu gösteren kayıt.

**Kazanım:** Failure'ı doğrudan “backend bug” olarak sınıflandırmadan **kanıtla daraltmayı** öğrendik.

## Sonraki ders

Yerel ortamda izleyebildiğimiz failure, CI'da farklı nedenlerle görünür olabilir. Son derste **pipeline job, artifact, log, ortam farkı ve güvenlik sınırlarıyla** test sonucunu değerlendiriyoruz.

→ [37. CI Failure Analysis & Diagnostics](03-ci-failure-analysis-and-diagnostics.md)

**Kaynak:** [Cypress Debugging](https://docs.cypress.io/app/guides/debugging) · [GitHub Actions — Workflow runs](https://docs.github.com/en/actions/how-tos/monitor-workflows).
