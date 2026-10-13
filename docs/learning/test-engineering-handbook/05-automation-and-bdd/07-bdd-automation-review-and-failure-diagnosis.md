# 29. BDD Automation Review — Bakım, değişiklik ve hata araştırması

> **Bu dersin sorusu:** Gherkin senaryosu okunabilir, test de yeşil. Peki birkaç sprint sonra hâlâ değerli bir test olacak mı?

I4 boyunca otomasyon adayı seçtik, test kodunu düzenledik, kararlı selector ve Cypress çalışma modelini gördük, Gherkin ile step definition'ı ayırdık. Şimdi bu kararları tek bir **bakım ve debugging yaklaşımına** bağlayacağız.

## 29.1 İlk senaryo: İş kuralı değişiyor

MiniShop'un eski kabul kuralı:

> “ACTIVE üyeler için STANDARD kargo 100 € ve üzeri sepette ücretsiz.”

Yeni karar:

> “Eşik, kupon **sonrası** 120 € olsun. EXPRESS her zaman ücretli kalsın.”

Bir BDD suite'inde değişmesi gerekenler nelerdir?

- **Business examples:** Gherkin senaryolarının kuralı ve verileri.
- **Oracle:** Expected shipping fee.
- **Test data:** Kuponun AVAILABLE ve tutarın kupon sonrası olması.
- **Automation mapping:** Yeni davranış ek helper gerektiriyorsa uygun değişiklik.
- **Regression selection:** Üyelik ve Express istisnalarını koruyan senaryolar.

Ancak **selector'ın değişmesi zorunlu değildir**. Step definition'ların tümünü kopyalayıp yeni set oluşturmak da gereksiz olabilir.

**Bakımın hedefi:** Kuralı tek ve doğru anlamda güncellemek; gizli varsayım bırakmamak.

## 29.2 Değişiklik iki katmanda neyi etkiler?

| Değişiklik | Önce incelenecek katman | Neden? |
|---|---|---|
| Ücretsiz kargo eşiği değişti | Acceptance examples, test data, oracle | İş davranışı değişti |
| Butonun CSS class'ı değişti | Selector / UI helper | İş davranışı aynı olabilir |
| Cypress retry davranışı yanlış anlaşıldı | Cypress interaction/wait stratejisi | Test timing kusuru |
| Gherkin adımı eşleşmiyor | Step text ve expression | Glue katmanı bozuldu |
| Gerçek ödeme sağlayıcısı response değiştirdi | Contract/integration sınırı | Stubbing gerçek problemi gizleyebilir |

**Yanlış yaklaşım:** Her failure'da bütün feature dosyasını yeniden yazmak veya Gherkin örneğini actual sonuca göre değiştirmek.

## 29.3 Failure'ı nerede aramaya başlayalım?

Şu senaryo fail ediyor:

~~~gherkin
Scenario: Free standard shipping at the threshold
  Given an active member has a basket total of 100 EUR
  When standard shipping is calculated
  Then the shipping fee is 0 EUR
~~~

**Gözlenen:** Then adımı timeout aldı.

Tek bir açıklama yok:

1. **Requirement mismatch:** Yeni eşik gerçekten 120 € olmuş olabilir.
2. **Data problem:** ACTIVE müşteri kurulmadı veya kupon indiriminden sonra tutar değişti.
3. **Selector problem:** Ücret öğesi başka DOM attribute'u kullanıyor.
4. **Synchronization:** UI beklenen state'e henüz ulaşmadı.
5. **Product defect:** Hesaplama yanlış.
6. **Step mapping problem:** Then step'inin expected parametresi yanlış parse edildi.
7. **Environment:** Order API veya harici servis erişilemiyor.

**Önce gözlem, sonra hipotez.** “Cypress flaky” demek kök neden değildir.

## 29.4 Dört aşamalı inceleme

**A. Senaryonun niyetini doğrula.**  
Gherkin'deki 100 € expected result hâlâ onaylı mı?

**B. Başlangıç ve iş verisini doğrula.**  
Fixture ACTIVE kullanıcı, STANDARD gönderim ve 100 € gerçek toplamını kurdu mu?

**C. Teknik etkileşimi incele.**  
Doğru DOM öğesi bulunuyor mu? Ağ isteği gidiyor mu? Cypress queue ve query retry beklendiği gibi mi?

**D. Davranışı doğrula.**  
Ürün beklenen sonucu üretmiyorsa gerçek defect adayı; yalnız selector kırıldıysa test code defect'i. İkisi birlikte olabilir.

Bu ayrım, I3'teki evidence ve I5'te derinleştirilecek debugging yaklaşımıyla uyumludur. Burada **tam CI/flaky root-cause lab'ı yapılmıyor**.

## 29.5 BDD senaryosunu ne zaman bölmeli?

Aşağıdaki uzun akışı düşün:

~~~gherkin
Scenario: Everything about a new customer
  Given a new customer exists
  When the customer signs in
  And adds a product to the basket
  And applies a coupon
  And changes the delivery address
  And completes payment
  And edits the profile
  Then all data is correct
~~~

Bu senaryo birden fazla iş riskini aynı testte topluyor. Failure olduğunda hangi davranışın bozulduğu belirsiz; test veri ve dış servis bağımlılığı büyüyor.

**Daha iyi:** Kupon, adres güncelleme, yetki, ödeme gibi davranışları uygun seviyelerde ayrı sınamak. Bir kritik satın alma yolculuğunu uçtan uca test etmek yine değerli olabilir; fakat “her şeyi test eden dev senaryo” varsayılan çözüm değildir.

### Scenario başına tek Then mi?

Hayır. Tek iş riskinin **birden fazla gözlenebilir sonucu** olabilir.

Örneğin:

~~~gherkin
When an already-used coupon is applied again
Then the coupon is rejected
And the order total remains unchanged
~~~

Bu iki assertion **aynı iş güvenliği kuralını** destekler. Senaryoyu yalnız “tek Then olmalı” kuralıyla parçalamak pedagojik olarak da mühendislik açısından da yanlış olabilir.

## 29.6 Step duplication ve aşırı soyutlama

**Sorun A — Her senaryoya yeni step:**  
“an active user has a 99 EUR basket”, “an active user has a 100 EUR basket”, “an active user has a 101 EUR basket” için üç ayrı kod bloğu.

**Daha iyi:** Parametreli ama anlamı açık bir step:

~~~text
an active member has a basket total of {int} EUR
~~~

**Sorun B — Tek dev generic step:**

~~~text
I do {string} on {string} with {string} and {string}
~~~

Bu her şeyi eşleştirir ama **iş niyetini gizler**, ambiguity riskini artırır ve karmaşık if/switch kodu yaratabilir.

**İyi tekrar kullanımı**, benzer kelimeleri değil **gerçekten aynı domain eylemini** paylaşır.

## 29.7 “Test geçti” iddiasının sınırı

BDD senaryosu Cypress ile browser'ı sürüyorsa:
- UI'nın o senaryodaki gözlenebilir davranışına kanıt sağlayabilir;
- arka uç stub'lanmışsa gerçek entegrasyonu kanıtlamaz;
- normal kullanıcı akışı geçtiyse güvenlik abuse-case'leri otomatik doğrulanmış olmaz;
- bütün Examples satırları geçtiyse tanımlanmamış başka karar kombinasyonları kalabilir.

**Bütün I4'ün ortak prensibi:** Test aracının gücü değil, **kanıtın sınırını doğru açıklamak** önemlidir.

## 29.8 Kısa test review checklist'i

Bir otomasyon PR'ını incelerken şu soruları sorabilirsin:

1. **Neden bu test?** Hangi requirement ve risk?
2. **Neden bu seviyede?** Daha küçük ve güvenilir test yeterli miydi?
3. **Oracle bağımsız mı?** Expected result kodun gerçek çıktısından kopyalanıyor mu?
4. **Veri izole mi?** Test tek başına/farklı sırada çalışabilir mi?
5. **Selector anlamlı mı?** CSS ve konum değişiminden gereksiz etkileniyor mu?
6. **Bekleme doğru mu?** Sabit sleep yerine gözlenebilir koşul var mı?
7. **BDD dili okunabilir mi?** İş davranışı mı, UI scripti mi anlatıyor?
8. **Step definitions anlamlı mı?** Ambiguity, global state ve over-abstraction var mı?
9. **Failure kanıtı yeterli mi?** Actual, expected, setup ve artifact açık mı?
10. **Hangi risk test dışında kaldı?** Stub, environment veya kapsam sınırı belgelendi mi?

Checklist **tek başına test stratejisinin yerine geçmez**; riskli alanları sistematik hatırlatmaya yardımcı olur.

## 29.9 Alıştırma — üç hata, üç farklı çözüm

Bir testte üç sorun raporlandı:

**A:** Checkout butonu CSS class değişince bulunamıyor.  
**B:** Test son günlerde bazen 0 €, bazen 5 € gösteriyor; sepette ortak kupon kullanılıyor.  
**C:** Senaryoda aynı Gherkin cümlesine iki step definition eşleşiyor.

**Görev:** Her biri için önce inceleyeceğin katmanı ve kalıcı çözümü yaz.

**Örnek değerlendirme:**
- A: Selector sözleşmesi; UI niyetine uygun kararlı locator ve doğru kapsam.
- B: Test data/state isolation; her testte ayrı AVAILABLE kupon, kontrollü input ve doğru assertion. İş kuralı da incelenmeli.
- C: Cucumber step expression'ları; geniş/genel veya tekrarlı tanımı ayır ve tek anlamlı eşleşme sağla.

Bu sorunların hepsi “E2E test fail” olarak görülebilir; fakat **aynı root cause**'a sahip değildir.

## I4'ün sonunda

I4'ün teknik zinciri:

**Test adayını seç → uygun sınırda mimari kur → kararlı element bul → Cypress'i doğru sırala ve bekle → iş kuralını Gherkin'le ifade et → step definition ile bağla → bakım/failure kanıtını değerlendir.**

Sonraki atölyede bütün zinciri tek bir vakada uygulayacağız. **Yeni framework, adapter, repo veya CI kurulmayacak; örnekler öğretici kalacak.**

→ [I4 Çalışma Atölyesi](08-i4-practice-and-interview-companion.md)
