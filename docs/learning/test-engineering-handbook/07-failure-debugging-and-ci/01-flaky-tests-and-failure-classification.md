# 35. Flaky Tests — Kararsız sonucu sınıflandırmak

> **Temel soru:** Aynı commit'teki test bir çalıştırmada PASS, diğerinde FAIL ise bu kimin hatasıdır?

I3'te test isolation ve determinism'i, I4'te Cypress retry'ı öğrendik. Şimdi bunları hata araştırmada uygulayacağız.

## 35.1 İlk olay: CI'da rastgele gibi görünen failure

MiniShop'un checkout testi:

~~~text
Run #101: PASS
Run #102: FAIL — expected 100 EUR, got 0 EUR
Run #103: PASS
Run #104: FAIL — element detached
~~~

Bu örüntü testin **kararsız davranış** gösterebileceğini düşündürür. Ancak iki failure'ın aynı kök nedeni olduğunu söyleyemeyiz.

**Flaky test**, aynı anlamlı koşullarda beklenmedik biçimde tutarsız PASS/FAIL üreten testtir. Test kararsızlığı **gerçek ürün race condition'ı** nedeniyle de ortaya çıkabilir. “Flaky → testte bug var” sonucu otomatik değildir.

## 35.2 Üç ana olasılığı ayır

**Product defect:** Kullanıcıya gerçek ürün davranışı zamanlamaya göre yanlış sonuç gösteriyor.

**Test defect:** Test yanlış selector kullanıyor, beklenmeyen sabit sleep veya paylaşılan veri nedeniyle kendini bozuyor.

**Environment/infrastructure issue:** DB bağlantısı, network, test runner kaynak kıtlığı, dış sandbox kesintisi veya yanlış yapılandırma.

Bir failure'da birden fazla katman rol oynayabilir; amaç ilk şüpheliyi **kanıtla** belirlemek.

### Olası neden matrisi

| Failure belirtisi | İlk hipotez | Ayırt edici deney |
|---|---|---|
| Yalnız tam suite'te FAIL | Shared test data/state | Tek başına ve sıra değiştirerek koş |
| Yalnız CI'da FAIL | CI env/config/resource farkı | Node/browser/config/locale/timezone karşılaştır |
| “Detached element” | DOM re-render ve stale subject | State değişince locator'ı yeniden sorgula |
| Yanlış toplam | İş kuralı, veri veya async race | Response, input ve final DB state'i karşılaştır |
| Belirli saatte FAIL | Clock/timezone/expiry | Clock sabitle ve boundary test et |
| 503 alındı | Dış servis/ürün backpressure | Kayıtlı request ve server health'i karşılaştır |
| Paralel çalışmada FAIL | ID çakışması, shared fixture | Worker başına ayrı namespace/ID |

Bunlar **başlangıç hipotezleri**, kesin teşhis değil.

## 35.3 Debugging'e doğru giriş: yeniden üretim

“Bazen fail oluyor” raporunu açıklayıcı hale getir:

- Hangi commit/build?
- Hangi test case ve hangi expected result?
- Hangi ortam, browser, timezone?
- Hangi fixture/user/order ID?
- Hangi sırada ve kaç worker ile çalıştı?
- Request/response/log/screenshots ne gösterdi?
- Hata **hangi koşulda** tekrarlandı?

**Örnek:** Sadece iki worker aynı couponId ile test başlattığında bir test fail. Bu bulgu shared state hipotezini güçlendirir. Tek worker'da stabil olmasına bakıp “geçti” demek gerçek concurrency riskini çözmez.

## 35.4 Rerun ve retry farkı

**Rerun:** Aynı testi yeniden çalıştırarak failure'ın tekrarlanıp tekrarlanmadığını gözlersin.

**Automatic retry:** Test runner başarısız test koşusunu belirlenen sayıda yeniden çalıştırır.

Retry faydalı bir **teşhis/ara geçici operasyon** aracı olabilir; ama **kalıcı kök neden düzeltmesi değildir**. Test tekrar geçtiğinde ilk failure'ı inceleme kayıtlarından silmek, gerçek ürün kusurunu gizleyebilir.

Şunu özellikle ayır:
- Cypress query/assertion **retry-ability** — beklenen state'e kadar uygun query zinciri tekrar edilir;
- Test runner seviyesinde **whole-test retries** — başarısız test baştan yeniden çalıştırılır.

İkisi aynı mekanizma değildir; birinde aynı test akışının belirli assertion sorgusu, diğerinde daha geniş test yürütmesi yeniden başlar.

## 35.5 Timing ve race örneği

Sepet update oluyor:

~~~text
T=0ms: kullanıcı sepete ürün ekler
T=40ms: browser eski toplamı gösterir (0)
T=120ms: API response gelir
T=180ms: UI yeni toplamı gösterir (100)
~~~

Test 100ms'de anlık \`then()\` okuma yaparsa eski sonucu görebilir. Cypress'in doğru query/assertion zinciri beklenen 100'e kadar retry edebilir.

Ancak request response 100 döndürdüğü halde UI **kalıcı olarak** 0 gösteriyorsa bu sadece test bekleme sorunu değildir; frontend state management kusuru olabilir.

**Araştırma:** Network response ve UI event timeline'ını karşılaştır; sonra hypothesis dene.

## 35.6 Shared fixture: Aynı test neden sıraya bağlı?

- Test A coupon-01'i USED yapar;
- Test B coupon-01'i AVAILABLE varsayar.

A→B sıralamasında B fail; B→A sıralamasında ikisi de pass olabilir.

**Kalıcı düzeltme:** Test-owned data ve açık başlangıç state'i. Sadece suite sırasını sabitlemek test bağımlılığını gizler.

## 35.7 Flaky test inceleme döngüsü

1. **Observe:** Hata mesajı, kayıt, screenshot, request.
2. **Reproduce:** Aynı build/data/env ile kontrollü koş.
3. **Hypothesize:** En az iki farklı olası açıklama.
4. **Experiment:** Tek değişkeni değiştir (ör. paralellik, sabit clock).
5. **Explain:** Hangi kanıt hipotezi destekledi/çürüttü?
6. **Fix:** Ürün/test/ortam için kalıcı düzeltme.
7. **Verify:** Tek başına, tam suite, uygun paralel koşul ve regresyon.
8. **Report:** Öncesi/sonrası gözlem, kalan belirsizlik.

Bu süreç özellikle önemlidir: **Rastgele sleep artırmak “debugging yaptım” demek değildir.**

## 35.8 Alıştırma — yeni probleme aktar

Belge testleri tek başına PASS. Paralel CI'da bazen “document already approved”, bazen “document not found”.

**Görev:** Üç hipotez ve her biri için **ayrı deney** yaz.

**Örnek çözüm:**
- Shared document ID: Her test için benzersiz belge oluştur, paralel yeniden koş.
- Cleanup çakışması: Bir testin diğerine ait kayıtları silip silmediğini logla; cleanup scope'u daralt.
- Gerçek ürün race: İki farklı kullanıcı aynı belgeyi eşzamanlı güncelliyorsa version/state ve transaction kanıtını incele.

**Kazanım:** Dalgalı sonuç yalnız zaman aşımı ayarı değil; **test kodu, state ve ürün concurrency** arasında kanıta dayalı ayrım gerektirir.

## Sonraki ders

Flaky failure için hipotez kurduk. Şimdi bunu **yeniden üretilebilir defect kaydı**, anlamlı log/trace kanıtı ve kalıcı düzeltmeyle nasıl tamamlarız?

→ [36. Debugging, Triage & Evidence](02-debugging-triage-and-root-cause.md)

**Kaynaklar:** [Cypress Retry-ability](https://docs.cypress.io/app/core-concepts/retry-ability) · [Cypress Debugging](https://docs.cypress.io/app/guides/debugging).
