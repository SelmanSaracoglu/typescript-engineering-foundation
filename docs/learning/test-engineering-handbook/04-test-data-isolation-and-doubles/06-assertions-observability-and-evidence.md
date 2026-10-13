# 22. Assertions, Observability & Evidence — Testin neyi kanıtladığı

> **Temel soru:** Bir test çalışıp yeşil olduysa, beklenen davranışı gerçekten kontrol etmiş midir?

I1'de **test oracle**'ı; I2'de **doğru test seviyesini**; I3'te **veri, determinism, isolation ve doubles** konularını gördük. Şimdi bunların sonuç ürettiği noktaya geliyoruz: **Assertion'lar ve kanıt kalitesi**.

## 22.1 Assertion ne yapar?

**Assertion**, gözlenen bir değeri/koşulu **onaylı beklenen sonuçla** karşılaştırır.

MiniShop kuralı: “ACTIVE kullanıcı için kupon sonrası 100 € ve üzeri STANDARD kargo ücretsizdir.”

~~~typescript
const fee = shippingFee(true, 100, false);
expect(fee).toBe(0);
~~~

Burada:
- **Actual:** `fee`;
- **Expected:** `0`;
- **Oracle:** Onaylı kargo iş kuralı.

Assertion'ın varlığı tek başına yetmez. **Yanlış beklenen değeri** yazarsak test sistemi yanlış davranışa göre onaylayabilir.

### Test yazmak ile kodu çalıştırmak farklıdır

Şu kontrol yalnız çağrıyı yapar:

~~~typescript
shippingFee(true, 100, false);
~~~

Bu kod bir execution adımıdır. Beklenen sonuç hakkında otomatik karar vermiyorsa **self-checking test** olma niteliği zayıftır.

## 22.2 Üç assertion'ın farklı gücü

Aynı API'nin sipariş oluşturduğunu düşünelim. Beklenen iş kuralı: Başarılı işlemde bir sipariş kaydedilir, toplam 100 € ve müşteri doğru olmalıdır.

**Zayıf:**
~~~typescript
expect(response.status).toBe(201);
~~~

**Daha iyi:**
~~~typescript
expect(response.status).toBe(201);
expect(response.body.total).toBe(100);
expect(response.body.customerId).toBe(expectedCustomerId);
~~~

**Daha kapsamlı, risk gerekiyorsa:**
~~~text
Assert HTTP 201
Assert response order amount/customer fields
Assert persisted order belongs to expected customer
Assert exactly one record exists for idempotency key
~~~

Son blok **pseudo-code**'dur; test seviyesi, DB erişimi ve sözleşmeye göre seçilir.

**Neden her testte her şeyi assert etmiyoruz?** Aşırı geniş assertion seti kök nedeni bulmayı zorlaştırabilir ve bakım maliyeti yaratabilir. Testin hedeflediği **önemli iş sonucunu** ve o riskin kritik yan etkilerini kontrol etmek yeterlidir.

## 22.3 Positive test ile negative testte neye bakılır?

**Positive:** Kupon başarıyla uygulandı → indirim doğru hesaplandı, sipariş kaydına uygun yansıdı.

**Negative:** Kullanılmış kupon reddedildi → HTTP response hatası olabilir; ama daha önemlisi:
- İkinci indirim oluşmadı;
- Kuponun kullanım sayısı artmadı;
- Başka siparişin toplamı bozulmadı.

Bu test yalnız “hata mesajı geldi” derse kritik **data integrity** kusurunu kaçırabilir.

### Assertion biçimini teknikten değil riske göre seç

| Risk | Beklenen kanıt |
|---|---|
| Matematik yanlış | Tam expected tutar ve currency precision |
| Yetkisiz erişim | Ret + başka kullanıcının verisinin açığa çıkmaması |
| Çift işlem | Bir işlem kaydı ve tutarlı final state |
| Event yanlış gönderiliyor | Doğru event içeriği/sayısı + gerekiyorsa kalıcılık |
| Tarih sınırı yanlış | Kontrollü clock + doğru timezone oracle |
| UI yanlış gösteriyor | Kullanıcıya görünen doğru değer; seçilmiş backend çapraz kontrol |

## 22.4 Observability nedir?

**Observability**, sistemin iç durumuna dair gerekli bilgileri dışarıdaki gözlem noktalarından anlayabilme kapasitesidir. Testlerde işe yarayan sinyaller:

- **Response/body ve status**;
- **Application log** ve anlamlı hata kodları;
- **DB state** veya test için uygun repository sorgusu;
- **Event / message queue** kaydı;
- **Network trace**;
- **Artifact** (screenshot, video, test report);
- **Trace/correlation ID** ile ilişkili adımların bağlanması.

**Her test bütün logları okumak zorunda değil.** Gözlem noktası, testin doğruladığı risk için uygun olmalı.

### UI'ın gösterdiği değer DB'yi kanıtlar mı?

Hayır. UI'da `"Payment successful"` görünmesi, tek tahsilat yapıldığını veya siparişin doğru state'te olduğunu tek başına kanıtlamaz. Bu risk önemliyse **uygun sınırda** ödeme kaydı veya provider işlemi kontrolü gerekir.

Aynı şekilde bir DB kaydının doğru olması, kullanıcının mobilde doğru mesaj gördüğünü garanti etmez.

## 22.5 Evidence kalitesini geliştirmek

Bir failure raporu şu soruları cevaplamalı:

1. **Ne test ediliyordu?** Requirement ve risk.
2. **Hangi koşulda?** Test verisi, başlangıç state'i, build ve ortam.
3. **Beklenen neydi?** Oracle ve expected result.
4. **Ne oldu?** Actual result ve varsa yan etkiler.
5. **Nasıl tekrar edilir?** Bağımsız adımlar, request veya test case.
6. **Hangi kanıtlar var?** Response, log, correlation ID veya artifact.
7. **Neler henüz bilinmiyor?** Kök neden hipotezi, doğrulanmamış entegrasyon.

### İki raporu karşılaştır

**Zayıf:**
> “Checkout bozuk, test failed.”

**Daha güçlü:**
> “ACTIVE kullanıcıyla, kupon sonrası toplam 100,00 € olan STANDARD siparişte kargo ücreti 5,00 € döndü; onaylı kural gereği 0,00 € bekleniyordu. Build X, test ortamı Y, request correlation ID Z. Başlangıç sepeti ve kupon AVAILABLE durumu doğrulandı. Aynı veriyle yeniden üretildi.”

Bu örnekte X/Y/Z **yer tutucudur**; gerçek kanıt üretildiğinde doldurulur. Uydurma log, zaman veya commit kimliğiyle rapor oluşturma.

## 22.6 Failure, defect ve test sorunu ayrımı

Test failed oldu; bu otomatik ürün defect'i midir? Hayır.

| Olası neden | Hangi gözlem ayırmaya yardımcı? |
|---|---|
| **Product defect** | Onaylı oracle ile aynı kontrollü koşulda sürekli sapma |
| **Test defect** | Yanlış expected result veya bozuk selector/assertion |
| **Test data/setup** | Başlangıç state'i gereksinimi karşılamıyor |
| **Environment/config** | Sadece belirli ortamda servis/konfigürasyon sorunu |
| **Infrastructure/network** | Dış bağımlılık kesintisi veya bağlantı kaybı |
| **Concurrency/race** | Sıra/parallelism ile değişen zamanlama ve state |

Birden fazla neden birlikte bulunabilir. **Gözlem → hipotez → deney** akışı tanı koymadan ilerlemeyi sağlar.

## 22.7 Kanıtı saklarken güvenli kalmak

Screenshot, request ve loglarda gizli veri bulunabilir:

- access token veya session cookie;
- kişisel müşteri bilgileri;
- ödeme detayı;
- belge içeriği;
- dahili service secret.

Test kanıtı, bu değerlerin **kopyalanıp ifşa edilmesi** için gerekçe değildir. Gerekli alanları maskele; güvenli saklama/erişim politikası uygula; correlation ID gibi tanımlayıcılarla gereksiz veri çoğaltmadan iz sür.

## 22.8 Testin gerçekten kusur yakaladığını nasıl sorgularız?

Şu test geçiyor:

~~~typescript
expect(shippingFee(true, 100, false)).toBe(0);
~~~

Kendimize yeni bir soru soralım:

> “Koddaki `>= 100` koşulunu yanlışlıkla `> 100` yapsaydık test FAIL olur muydu?”

**Evet.** Tam 100 sınırı test edildiği için bu kusur gözlenir.

Ama yalnız `shippingFee(true, 120, false) === 0` testi olsaydı yanlış operatör görünmeyebilirdi.

Bu düşünce, **test sensitivity** bakımından değerlidir: Testin gerçekten hedeflenen kusur sınıfına tepki verip vermeyeceğini sorgular. Kasıtlı kontrollü kusur ekleme/mutation yaklaşımı ayrı bir uygulamalı test mühendisliği çalışmasında yapılabilir; bu handbook yeni repo veya çalışan test suite kurmaz.

## 22.9 Çalışılmış örnek: sahte başarı

Bir kupon uygulaması:
- Response: `{"status":"APPLIED"}`;
- Database: kupon hâlâ AVAILABLE;
- UI: “İndirim uygulandı” yazıyor.

Yalnız response'ı kontrol eden test **PASS** verir. Oysa aynı kupon tekrar uygulanabilir.

**Mühendislik değerlendirmesi:**
1. İş kuralı kuponu hangi anda USED yapmayı gerektiriyor? Önce netleştir.
2. Bu andan sonra persisted state'i gözle.
3. İkinci kullanımın sonucunu doğrula.
4. Birinci testin sonucu, yalnız response doğrulamasıyla sınırlıysa raporu buna göre yaz.

Burada **assertion kapsamını iş riskine bağladık**.

## 22.10 Alıştırma — yeni probleme aktar

**Özellik:** Bir kullanıcı şifresini değiştirdiğinde eski oturumların kapatılması gerekiyor (bu senaryoda onaylı kural budur).

**Görev:** Yalnız başarılı HTTP response'a bakmanın neden yetersiz olduğunu açıkla ve iki bağımsız kanıt öner.

**Örnek çözüm:**
- Şifre değiştirme response'u başarılı olsa da eski access token geçerli kalabilir.
- Kanıt 1: Yeni parola ile tekrar giriş yapılabilir.
- Kanıt 2: Şifre değişikliği öncesi alınan eski oturum kimliğiyle korunan kaynağa erişim **reddedilir**.
- Ayrı testler için izole hesap ve token'ların güvenli saklanması gerekir.

**Kazanım:** Testin değerini “kaç assertion var?” yerine **doğru iş sonucu ve kalan bilinmezler** üzerinden ölçüyoruz.

## I3'ü bir araya getir

I3'ün altı dersi tek bir problem etrafında birleşiyor:

**Anlamlı veri kur → kontrolsüz değişkenleri sabitle → testler arası state sızıntısını engelle → uygun bağımlılıkları double ile kontrol et → önemli state/interaction'ı doğrula → yeniden üretilebilir kanıt üret.**

Sonraki dosyada bunu bütünleşik vakada uygulayıp isteğe bağlı mülakat pratiğiyle pekiştireceğiz.

→ [I3 Uygulama Atölyesi](07-i3-practice-and-interview-companion.md)
