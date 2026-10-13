# 37. CI Failure Analysis — Pipeline'dan kanıt üretmek

> **Temel soru:** Bir test bilgisayarında geçiyor ama CI'da kalıyorsa ilk hangi kanıta bakmalısın?

Bir önceki derste **hata araştırma zinciri** kurduk. CI (Continuous Integration), bu zincire yeni bağımlılıklar ekler: farklı işletim sistemi, test veritabanı, browser sürümü, paralellik, secret yönetimi ve runner kaynakları.

Bu derste GitHub Actions üzerinden örnek veriyoruz ama **workflow dosyası yazmıyoruz, yeni CI kurmuyoruz**. Amaç failure'ı sistematik okuyabilmek.

## 37.1 İlk belirti: PR kontrolü kırmızı

MiniShop PR'ında üç job çalışıyor:

~~~text
typecheck          PASS
unit-tests         PASS
e2e-checkout       FAIL
~~~

Bundan hangisini çıkarabiliriz?

- Typecheck geçti → ilgili statik tip kontrolünün koşulları sağlandı.
- Unit tests geçti → tanımlı küçük davranış testleri ilgili koşulda başarılı.
- E2E başarısız → daha geniş checkout testinde bir failure gözlendi.

**Şunu henüz bilemeyiz:** Gerçek ürün kusuru mu, testin setup'ı mı, browser ortamı mı, dış sağlayıcı mı? “Unit geçti, E2E fail, kesin Cypress flaky” hatalı bir teşhistir.

## 37.2 CI'da üç düzeyli okuma

**Düzey A — Workflow/job:**
- Doğru commit/branch mi çalıştı?
- Hangi job başarısız?
- Setup, dependency install, build, test veya artifact upload hangi aşamada hata verdi?
- Job'ın exit code ve durumu ne?

**Düzey B — Test runtime:**
- Hangi spec/test?
- Hangi browser ve sürüm?
- Node ve dependency lockfile sürümü?
- Paralel worker ve test sırası?
- Environment variables ve feature flags uygun mu?

**Düzey C — Product/evidence:**
- Expected/actual ne?
- Test data/identity doğru mu?
- HTTP request/response, log ve screenshot/video ne gösteriyor?
- Son commit ile ilişkili code/config değişikliği var mı?

Bir **dependency install failure** ile **test assertion failure** aynı investigation yolunu gerektirmez. Önce işin hangi aşamada bozulduğunu belirle.

## 37.3 “Local PASS, CI FAIL” araştırması

| Olası fark | Neye bakılır? | Deney |
|---|---|---|
| Node/dependency versiyonu | Lockfile ve runner versiyonları | Aynı versiyonlarla yerelde yeniden üret |
| Timezone/locale | Tarih/sayı biçimi | Açık timezone ve veri ile koş |
| Browser/rendering | Browser/viewport | CI ile eşdeğer browser ve viewport |
| Shared data | DB ve test account ownership | Benzersiz run ID / izole namespace |
| Parallelism | Worker sayısı | Tek worker vs çok worker |
| Feature flag/config | Uygulama config, endpoints | Config farklarını karşılaştır |
| Dış servis | Sandbox health, rate limit | Kontrollü stub ile arayüz riskini ayır; gerçek integration boşluğunu belirt |

**Tek deneyde üç ayarı birden değiştirmek** root cause kanıtını zayıflatır. Amaç değişkeni mümkün olduğunca tek tek kontrol etmek.

## 37.4 CI artifacts ne işe yarar?

Test failure anında saklanan bazı kanıtlar:
- Screenshot veya video;
- JUnit/test report;
- Sanitized HTTP request/response;
- Browser/Node sürüm kaydı;
- Son test komutu ve test run ID;
- İlgili backend log ve correlation ID.

Örnek investigation:

~~~text
Job: e2e-checkout
Spec: checkout/shipping
Expected: 0.00 EUR
Actual: 5.00 EUR
Build: <COMMIT_SHA>
Environment: staging-test
Attachment: sanitized screenshot + request ID
Hypothesis: membership fixture or API rule mismatch
~~~

Burada yer tutucular **gerçek kanıt değildir**. Mevcut repo'ya ait böyle bir failure'ın gerçekten yaşandığını iddia etmiyoruz.

### Güvenlik ve veri saklama

Artifacts içine:
- canlı access token;
- private customer address;
- ödeme kartı;
- tam session cookie;
- hassas belge

kopyalanmamalı. Saklama süresi, erişim yetkisi ve masking/secret yönetimi kontrol edilmelidir. Bir pipeline başarısızlığı araştırmak **gizli veriyi açığa çıkarmayı** gerektirmez.

## 37.5 CI failure'ını nasıl sınıflandıracağız?

**Infrastructure/setup:** Dependency install veya runner kaynak sorunu.

**Environment/config:** Yanlış base URL, eksik test-only permission, feature flag farkı.

**Test data/isolation:** Test suite aynı kupon veya belgeyi paylaşıyor.

**Test automation defect:** Yanlış selector, hatalı expected value, kontrolsüz bekleme.

**Product defect:** Sözleşmeye göre yanlış business behavior, authorization/işlem kusuru.

**External dependency:** Gerçek sağlayıcı/şebeke arızası.

Sınıflandırmayı ilk log satırına göre kalıcı etiketleme; **kanıtla güncelle**. Aynı failure'ın hem product race hem testin yanlış beklemesiyle şiddetlenmesi mümkündür.

## 37.6 GitHub Actions gözlemi: Kod yazmadan

GitHub Actions arayüzünde tipik araştırma:

1. İlgili workflow run ve **çalışan commit SHA**'sını doğrula.
2. Failed job ve step'ini aç.
3. Test runner çıktılarını, environment bilgisini ve exit durumunu incele.
4. Varsa screenshot/video/test report artifactlerini kontrollü indir ve eşleştir.
5. Son başarılı run ile farkları değerlendir.
6. Root cause hipotezini doğrulamak için küçük bir yeniden üretim deneyi seç.
7. Kalıcı düzeltme sonrası aynı testin uygun koşullarda tekrar geçtiğini kontrol et.

Burada örnek bir sistem anlatılıyor; **bu handbook'ta yeni Actions workflow dosyası veya deployment yapılandırması oluşturulmadı**.

## 37.7 Rerun geçti: Ticket kapanır mı?

Hayır, tek başına değil.

~~~text
Run #31: FAIL
Rerun #31: PASS
~~~

Bu olay:
- zamanlama veya shared state;
- dış servis dalgalanması;
- ürün race condition'ı;
- kalıcı olmayan test setup

gibi nedenlerle açıklanabilir. **Rerun başarıyla bitmesi, ilk failure'ı geçersiz kılmaz.**

Kalıcı iyileştirmeden önce:
- ilk failure evidence'ını koru;
- sıralı/paralel senaryoları incele;
- gerekiyorsa test flakiness'i görünür şekilde işaretle;
- gerçek ürün riskini saklama.

**Quarantine / skip** bazen geçici teslim kararı olabilir; fakat testin sağladığı kanıtın artık bulunmadığını açıkça raporlamak gerekir. Skip edilen kritik test **PASS** değildir.

## 37.8 Defect → fix → verification → CI

Örnek: Paralel iki test aynı coupon ID'yi kullanıyor.

**İnceleme:** Worker logları ve test data creation kayıtlarında çakışma görülür.

**Hipotez:** Shared test fixture, diğer testin başlangıç koşulunu bozuyor.

**Fix:** Her test run için benzersiz coupon ID/namespace; yalnız kendi datasını cleanup.

**Verification:**
- Test tek başına;
- önce A→B, sonra B→A;
- paralel worker;
- tekrar koşular;
- sistemin gerçek kupon reuse iş kuralı için ayrı product test.

**Rapor:** Hangi koşullarda failure yeniden üretildi, ne değişti, kaç koşuda tekrar denendi, hangi risk test dışı kaldı?

Yalnız “retry=3” eklemek yerine **nedenin gerçekten değiştiğini** kanıtla.

## 37.9 Alıştırma — yeni pipeline olayı

Belge servisi:
- typecheck PASS;
- API tests PASS;
- UI E2E yalnız CI paralel çalıştırıldığında FAIL: “expected PENDING, got APPROVED”.

**Görev:** Üç olası neden, ilk iki gözlem kaynağı ve tek değişkenli deney seç.

**Örnek çözüm:** Testler aynı document ID'yi paylaşıyor; önceki test state'i APPROVED yapmış; ürünün eşzamanlı state güncelleme kusuru var. Önce test data/run ID ve job test sıralaması logları, sonra backend state/audit trace incelenir. Deney: **paralelliği koruyarak yalnız fixture ID'lerini ayrıştır**; sonuç değişirse state çakışması hipotezi güçlenir. Product concurrency riski ayrıca kontrol edilmelidir.

## I5'in sonunda

İlk dört Increment'te öğrendiğimiz bilgileri şu zincirde birleştirdik:

**Contract ve oracle → doğru input ve authorization → idempotent state → UI/browser gözlemi → flaky hypothesis → debugging evidence → CI failure triage.**

Yalnız “test fail oldu” demek yerine **hangi risk, hangi test sınırı, hangi yeniden üretilebilir kanıt ve hangi açık belirsizlik** sorularını cevaplayabiliyoruz.

→ [I5 Çalışma Atölyesi](04-i5-practice-and-interview-companion.md)

**Kaynak:** [GitHub Actions — Monitoring and troubleshooting workflows](https://docs.github.com/en/actions/how-tos/monitor-workflows) · [GitHub Actions — Store and share workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data).
