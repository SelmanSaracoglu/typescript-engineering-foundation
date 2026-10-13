# 24. Test Automation Architecture — Bakımı yapılabilen test kodu

> **Bu dersin sorusu:** Aynı “sepete ekle” adımını 40 testte kopyalamak neden mühendislik problemidir?

Otomasyona uygun testi seçmek ilk karardı. İkinci kararımız **testin kodunu nasıl düzenleyeceğimiz**. Test kodu da üretim kodu gibi okunabilirlik, sorumluluk ayrımı, hata araştırma ve bakım gerektirir.

## 24.1 Başlangıç problemi: Büyüyen test dosyası

MiniShop'ta her senaryo aynı işlemleri yazıyor:

~~~typescript
cy.visit("/shop");
cy.get('[data-cy="product-add"]').click();
cy.get('[data-cy="basket-open"]').click();
cy.get('[data-cy="shipping-fee"]').should("contain", "0,00");
~~~

Bir süre sonra:
- 40 senaryoda aynı selector var;
- tasarım değişince 40 dosya değişiyor;
- “sepet aç” adımıyla “ücretsiz kargo kuralı” aynı yerde karışıyor;
- başarısızlıkta asıl hangi iş davranışının test edildiği zor görülüyor.

**Soru:** Bütün satırları tek bir dev `doEverything()` fonksiyonuna taşımak doğru çözüm müdür?

Hayır. Bu kez de **testin niyeti görünmez**, helper gizli state ve koşul içermeye başlayabilir.

## 24.2 Test mimarisinde üç farklı sorumluluk

Örneğe ait mantıksal katmanlar:

~~~text
Test / Scenario — "Hangi iş kuralı?"
        ↓
Domain action / reusable helper — "Kullanıcı ne yapıyor?"
        ↓
UI/API interaction — "Bu iş teknik olarak nasıl yapılıyor?"
~~~

Bu bir **kavram haritasıdır**, zorunlu yeni framework veya klasör şablonu değildir.

**Test senaryosu:** ACTIVE üye 100 € sepetle ücretsiz standart kargo alır.

**Domain action:** Belirli ürünleri sepete ekle, STANDARD gönderimi seç.

**Interaction:** Tıklanacak öğeyi güvenilir selector ile bul ve kullanıcı açısından anlamlı sonucu bekle.

İyi abstraction, **iş niyetini saklamadan** teknik tekrarları azaltır.

### Kötü abstraction

~~~typescript
function magicCheckout(flagA: boolean, flagB: boolean, mode: number) {
  // Her şeyi yapar; değişkenlerin anlamı belirsiz.
}
~~~

Böyle bir helper'ı kullanan testte `magicCheckout(true,false,3)` yazmak ürün davranışını anlatmaz.

### Daha anlaşılır arayüz

~~~typescript
// Kavramsal örnek; çalışan bir uygulamaya bağlı değildir.
addProductToBasket("sample-product");
selectDelivery("STANDARD");
expectShippingFee("0,00 €");
~~~

Burada testin okuyucusu teknik selector'a dalmadan **hangi işi kontrol ettiğini** anlar. Ancak `expectShippingFee` iş kuralına göre doğru expected değeri almalı; helper kendi beklenen değerini sistemin actual response'undan üretmemelidir.

## 24.3 Test code'un tek sorumluluğu nasıl anlaşılır?

Bir test mümkünse **bir iş riskini** net ifade etsin; gerekli setup ve ilgili yan etki kontrolleri o riskin parçası olabilir.

**Zayıf senaryo:** Login, kupon, profil güncelleme, yetkilendirme ve e-posta bildirimi kontrolünü aynı E2E testine doldurmak.

**Daha iyi yaklaşım:** Her risk için uygun test seviyesinde bağımsız kontrol; kritik bütünleşik satın alma yolculuğu için seçilmiş bir E2E akışı.

Bu, her assertion için ayrı test yazmak anlamına gelmez. Örneğin “kupon iki kez uygulanamamalı” kuralında **ret response + yeni indirim kaydının oluşmaması** aynı riskin birbirini tamamlayan assertion'larıdır.

## 24.4 Page Object ve Screenplay neyi çözer?

**Page Object** yaklaşımında UI'ya ait locator ve işlemler ekran/bileşen nesnesi arkasına alınabilir.

**Screenplay** yaklaşımı, aktörün görevlerini, eylemleri ve sorgulamaları daha ayrık rollerle modellemeyi hedefler.

Bu kalıplar farklı soyutlama stratejileridir; **otomasyon için ikisinden birini mecburen kullanmak gerekmez**. Küçük suite'te açık helper'lar yeterli olabilir.

Cypress özelinde:
- DOM selector'ı birkaç yerde kullanılıyorsa uygun merkezileştirme yararlı olabilir;
- aşırı “sayfa sınıfı” ve uzun abstraction zinciri Cypress'in okunabilir komut akışını gizleyebilir;
- bir helper, testin iş akışı niyetini korumalı ve Cypress komutlarının yürütme modeline uymalıdır.

**Amaç class sayısını artırmak değil; değişiklik etkisini yerelleştirmek.**

## 24.5 DRY ile okunabilirlik arasında denge

**DRY (Don't Repeat Yourself)** “iki testte aynı satır göründüyse mutlaka helper yaz” demek değildir.

Örneğin iki acceptance scenario'daki şu ifadelerin tekrarı bilerek korunabilir:

~~~gherkin
When the member selects standard shipping
Then the shipping fee is 0 EUR
~~~

Bunlar iş dilinin bir parçasıysa tekrar, **okumayı kolaylaştırabilir**. Teknik selector veya API setup tekrarı ise bakım yükü oluşturabilir.

**İyi soru:** Bu tekrar aynı **bilgiye** mi ait, yoksa benzer sözcüklerle ifade edilen iki farklı davranış mı?

## 24.6 Test piramidiyle bağlantı

Şu durumda test mimarisi yanlış seviyeye odaklanmış olabilir:

- 35 kargo hesaplama testinin tamamı UI'da;
- biri fail olunca uygulama logu, selector ve sepet state'i inceleniyor;
- basit fiyat fonksiyonunun component testi yok.

I2'de gördüğümüz gibi sınır hesaplarını küçük testlere almak **mimari karar**dır. Helper sayısını artırarak yanlış test seviyesinin maliyetini bütünüyle gideremeyiz.

## 24.7 Refactoring sırasında ne korunmalı?

Refactor ettiğimiz testte şunlar aynı kalmalıdır:

- Test edilen iş kuralı;
- başlangıç koşulları;
- **oracle / expected result**;
- önemli negatif yollar ve yan etkiler;
- aynı kusuru yakalama kabiliyeti.

Değişenler:
- selector organizasyonu;
- tekrar eden hazırlık kodu;
- helper isimleri;
- okunabilirlik ve gereksiz implementation coupling.

**Tehlikeli refactoring:** Test yeşil olsun diye `should("equal", 0)` assertion'ını kaldırmak veya expected değeri actual'dan oluşturmak. Bu, kodu temizlemek değil testin amacını silmektir.

## 24.8 Çalışılmış değişiklik: Selector değişiyor

UI'da “Sepeti aç” bağlantısının CSS class'ı değişti.

**Kırılgan test düzeni:** 40 senaryoda `.basket-button-primary` aranıyor.

**Daha sağlam:** Uygulamayla üzerinde uzlaşılan bir `data-cy="basket-open"` test contract'ı veya uygun erişilebilir role/name kullanmak. Bu selector tek bir anlamlı helper'da bulunabilir.

**Dikkat:** Aynı sayfada iki sepet aç düğmesi varsa locator çok geniş olabilir. Her zaman **hedef öğenin tekilliğini ve doğru bağlamı** kontrol et.

## 24.9 Alıştırma — küçük bir tasarım kararı

Bir testte şu üç işlem hep yineleniyor:
1. Test hesabı oluştur;
2. giriş yap;
3. `[data-cy="basket-open"]` düğmesine tıkla.

**Görev:** Hangilerini merkezi yardımcıya almak mantıklı? Hangisinin test açısından görünür olması gerekir?

**Örnek değerlendirme:** Hesap oluşturma/test data factory I3'teki izolasyonla uyumlu bir helper olabilir; login için tekrar kullanılabilir bir domain action seçilebilir; selector UI helper'da saklanabilir. Ancak **kullanıcı rolü** ve **testin amaçladığı business state** senaryodan kaybolmamalıdır. Bu işlemlerin tümünü tek sihirli boolean helper'a dönüştürmek yerine sorumlulukları ayır.

## Sonraki ders

Mimarimiz temiz. Peki bir UI değişikliğinde neden bazı locator'lar kırılırken diğerleri dayanıklı kalır? Ve test yanlış butona tıklıyorsa bunun sebebi ne olabilir?

→ [25. Selectors & UI Contracts](03-selectors-and-ui-contracts.md)
