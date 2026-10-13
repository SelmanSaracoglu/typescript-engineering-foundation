# 18. Deterministic & Repeatable Tests — Aynı koşul, aynı sonuç

> **Temel soru:** Testin geçtiği veya başarısız olduğu koşullar değiştiğinde, ürüne ne kadar güvenebiliriz?

Önceki derste test verisini **doğru başlangıç durumuyla** hazırladık. Fakat bu tek başına yeterli olmayabilir. MiniShop'ta aynı kuponla bir test sabah geçiyor, gece yarısında başarısız oluyor. Başka bir test yalnız CI'da kırılıyor.

Böyle durumlarda testin **determinism** ve **repeatability** niteliğini sorgularız.

## 18.1 Deterministic test nasıl davranır?

Basit tanım:

**Deterministic behavior:** Aynı tanımlı başlangıç koşulu ve kontrollü girdilerle aynı sonucu üretir.

**Repeatable test:** Aynı koşullar tekrar kurulduğunda aynı doğrulama sonucunu güvenilir biçimde elde edebiliriz.

“Testin daima PASS olması” determinism değildir. Üründe gerçek kusur varsa test **her çalıştırmada tutarlı FAIL** olabilir. Bu test, rastgele PASS/FAIL üreten testten daha çok bilgi sağlayabilir.

### İki farklı başarısızlık

- **Gerçek ürün kusuru:** 100 € kargo eşiği her çalıştırmada yanlış hesaplanıyor → tutarlı failure.
- **Test güvenilirliği sorunu:** Test, hiç kontrol etmediği eski bir sipariş kaydına bağlı → sırayla çalıştığında PASS, tek başına çalıştığında FAIL.

Testi düzeltmek için önce bunları ayırmalıyız.

## 18.2 Test sonuçlarını neler değiştirir?

| Değişken | Örnek | Nasıl kontrol edilir? |
|---|---|---|
| **Clock / timezone** | Kupon 23:59'da bitiyor | Sabit zaman, açık saat dilimi, clock abstraction |
| **Randomness** | Rastgele seçilen ID başka veriyle çakışıyor | Sabit seed, kaydedilebilir üretilen değer |
| **Shared state** | Bir test kuponu USED yapıyor | Her test kendi verisi / reset |
| **Execution order** | Test B, Test A'nın siparişine güveniyor | Önkoşulları test içinde kur |
| **Asynchronous timing** | UI güncellenmeden assert çalışıyor | Gerçek gözlenebilir koşulu bekle |
| **External service** | Sandbox 503 veya gecikme veriyor | Uygun seviyede kontrollü double ve ayrı contract/integration test |
| **Environment/config** | CI timezone farklı | Açık config, izlenebilir sürüm ve environment |

**Önemli:** Bağımlılıkları kontrol etmek onları ürünün gerçek sınırlarından **tamamen kaldırmak** anlamına gelmez. Küçük testte saati sabitleyebiliriz; kritik timezone entegrasyonunu ayrıca gerçek sınırda doğrulamamız gerekir.

## 18.3 Saat kaynaklı yanlış failure

Kupon kuralı şöyle olsun:

> “Kupon 31 Ekim 2026 günü saat 23:59:59 Europe/Berlin'e kadar kullanılabilir.”

Hatalı test, *testin çalıştığı anı* kullanıyor:

~~~typescript
const now = new Date(); // dış dünyadan gelen kontrolsüz değer
const accepted = couponIsValid(expiry, now);
expect(accepted).toBe(true);
~~~

Bu test bugün geçebilir, belirtilen son tarih sonrasında başarısız olabilir. **Kural değişmedi, testin girdisi değişti**.

Daha açık test:

~~~typescript
const fixedTime = new Date("2026-10-31T22:59:59Z");
// Berlin, 31 Ekim 2026 saat 23:59:59 (CET / UTC+1).
const accepted = couponIsValid(expiry, fixedTime);
expect(accepted).toBe(true);
~~~

**Dikkat:** Almanya'da Ekim sonunda DST geçişi vardır. 31 Ekim 2026'da Berlin'de saat dilimi **CET (UTC+1)** olduğu için `22:59:59Z` gerçekten yerel `23:59:59` anıdır. Başka bir tarihte dönüşüm farklı olabilir. **Sabit zaman kullanmak kadar, business timezone oracle'ını doğru tanımlamak da önemlidir.**

**Daha sağlam mimari:** `couponIsValid(expiry, now)` gibi saati parametre olarak almak veya `Clock` arayüzü enjekte etmek. Böylece test, sistem saatine bağımlı kalmaz.

### Yanlış çözüm: “Tarihi her ay ileri alalım”

Testin her ay bozulmasını önlemek için expiry'yi durmadan uzatmak yalnız semptomu gizler. Sabit/teste ait zaman ve açık time-zone kuralı daha güçlüdür.

## 18.4 Random data ne zaman faydalı, ne zaman zararlı?

Rastgele test verisi daha fazla varyasyonu keşfedebilir, ama **tekrarlanabilirlik** gerektirir.

Zayıf örnek:

~~~typescript
const amount = Math.random() * 200;
expect(calculateFee(amount)).toBe(/* ... */);
~~~

Failure olduğunda hangi değer üretildi? Test koşusunda farklı bir sayı seçilince hata kaybolabilir.

Daha iyi yaklaşım:
- Boundary ve iş kuralı testlerinde **seçilmiş sabit değerler** kullan;
- Property-based/random test yazıyorsan **seed'i kaydet**, en küçük başarısız örneği raporla;
- Veri çakışması için UUID gibi benzersiz kimlikler gerekiyorsa **üretilen ID'yi failure evidence'ına ekle**.

**Rastgeleliğin kendisi kötü değildir; açıklanamayan ve yeniden üretilemeyen rastgelelik kötüdür.**

## 18.5 Asynchronous test: “Beklemek” ne demek?

UI'da sepete ürün eklendiğinde hesaplama request'i gidiyor, response geliyor ve ekran güncelleniyor olsun.

Şu yaklaşım kırılgandır:

~~~typescript
clickAddProduct();
await sleep(1000); // "bir saniye yeter" varsayımı
expect(total).toBe("100 €");
~~~

Bazı koşullarda bir saniye fazla, bazılarında yetersizdir.

**Doğru prensip:** Belirli bir süre geçmesini değil, **ilgili gözlenebilir koşulun gerçekleşmesini** bekle. Örneğin response tamamlandı mı, sepet toplamı beklenen değere ulaştı mı, loading durumu sona erdi mi?

Bu noktada **Cypress command queue/retry mantığını Promise/await ile eşitleme**. Yukarıdaki kod kavramsal örnektir; Cypress'in komutlarını native promise gibi `await` etmek doğru genel kural değildir. Cypress yürütme modeli sonraki uygulama çalışmasında ayrıca öğretilir.

### Ne zaman sabit bekleme gerekli olabilir?

Testin konusu gerçekten **geçen sürenin kendisi** ise (örneğin 5 saniyelik timeout politikası) belirli süre koşulunun anlamı vardır. Yine de controlled clock/timer ve gerçek timeout entegrasyonunun ayrımı korunmalıdır.

## 18.6 Flaky test için ilk araştırma modeli

Test bir kez PASS, bir kez FAIL üretiyor. Rastgele sleep eklemek yerine:

1. **Reproduce:** Aynı build ve aynı veride tekrar dene.
2. **Observe:** Başlangıç zamanı, test sıra numarası, response, state ve logları kaydet.
3. **Hypothesize:** Zamanlama mı, shared state mi, environment mı, ürün race condition mı?
4. **Experiment:** Tek bir değişkeni kontrol et; örneğin saati sabitle veya tek başına çalıştır.
5. **Reverify:** Düzeltmeden sonra aynı koşulda ve paralel/sıralı çalışmalarda doğrula.

Bu kısa yöntem I5'te ayrıntılı debugging ve CI triage'a bağlanacak. **Flaky = yalnız test hatası** demek de yanlış; gerçek ürün race condition'ı flaky testte ortaya çıkabilir.

## 18.7 Çalışılmış örnek: gece yarısı kuponu

**Gözlem:** Test her gece yarısına yakın bazen FAIL.

**Hipotez A:** Son kullanma tarihi timezone dönüştürmesinde farklı yorumlanıyor.  
**Hipotez B:** Test, `new Date()` ile gerçek zamanı kullanıyor.  
**Deney:** Aynı belirlenmiş `now` ile fonksiyonu çalıştır; diğer ortam girdilerini sabitle.

**Sonuçları ayır:**
- Sabit zamanda tutarlı sonuç; canlı zamanda değişken sonuç → test girişindeki zaman bağımlılığı olabilir.
- Sabit zamanda da timezone'a göre farklı sonuç → ürünün tarih dönüşümünde gerçek bir kusur olabilir.

Yalnız `retry: 3` eklemek gerçek ayrımı yapmaz.

## 18.8 Alıştırma — farklı bir ürün

Bir rezervasyon sisteminin testi, “bugünden sonraki ilk uygun gün”ü kullanarak oda ayırtıyor. CI'da bazen hiç oda yok.

**Görev:** Üç kontrolsüz değişken ve bunların her biri için bir çözüm öner.

**Örnek değerlendirme:**
1. **Sistem zamanı:** Sabit referans tarihi veya kontrollü clock.
2. **Rezervasyon stok state'i:** Teste ait envanter/oda oluşturma.
3. **Paralel kullanıcılar:** Test kimliğine ayrılmış oda veya izole namespace.

**Kazanım:** Tekrar edilebilirliği artırırken **hangi gerçek entegrasyon riskini test dışında bıraktığımızı** da ifade etmeliyiz.

## Sonraki ders

Sabit zaman ve kontrollü veriye sahip olsak bile **testlerin birbirinin verisini değiştirmesi** sorun olabilir. Şimdi isolation, setup ve cleanup tasarlayacağız.

→ [19. Test Isolation, Setup & Cleanup](03-test-isolation-fixtures-and-parallelism.md)
