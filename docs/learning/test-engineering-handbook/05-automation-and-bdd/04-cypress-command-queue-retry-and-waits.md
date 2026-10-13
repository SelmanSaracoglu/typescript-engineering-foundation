# 26. Cypress Execution Model — Command Queue, Retry ve Bekleme

> **Bu dersin sorusu:** Cypress komutları neden normal TypeScript fonksiyonları veya Promise'ler gibi çalışmaz?

Cypress testi yazarken TypeScript okuma bilgisi gerekir, ancak Cypress'in **ayrı bir yürütme modeli** vardır. Bu ayrım anlaşılmazsa test, ilk bakışta mantıklı görünen kodla bile hatalı veya flaky olabilir.

## 26.1 Zihinsel model: “Şimdi yap” değil, “sıraya ekle”

Aşağıdaki örneği düşün:

~~~typescript
it("shows basket total", () => {
  cy.visit("/shop");
  cy.get('[data-cy="basket-open"]').click();
  cy.get('[data-cy="basket-total"]').should("contain", "100");
});
~~~

Test fonksiyonu çalışırken Cypress komutları **queue**'ya alınır. Daha sonra Cypress bu komutları **sırayla** yürütür. Bir komutun ardından gelen komutun başlaması önceki komutun ilgili bekleme/koşullarını karşılamasına bağlıdır.

~~~text
Test function executes → commands scheduled
       ↓
visit("/") → query basket-open → click → query basket-total + assertion
       ↓
Each queued step executes with Cypress-specific waiting / retry rules
~~~

**Cypress komutu gerçek JavaScript Promise'i değildir.** Bu yüzden şu varsayım yanlıştır:

~~~typescript
const button = await cy.get('[data-cy="basket-open"]'); // yanlış zihinsel model
button.click();
~~~

Cypress'in `then()` komutu da native `Promise.then()` ile tamamen aynı değildir.

## 26.2 Query, assertion ve action farklı davranır

**Query:** `cy.get()`, `find()` gibi DOM araması. Uygun chain içinde yeniden denenebilir.

**Assertion:** `should()` ile tanımlanan gözlenebilir beklenti. Gerektiğinde bağlantılı query chain'i yeniden çalıştırılabilir.

**Action:** `click()`, `type()` gibi uygulama state'ini değiştirebilen işlem. Cypress, eylemden önce elementin **actionable** olmasını bekleyebilir; ancak eylemi, uygulama state'ini tekrar tekrar değiştirecek şekilde otomatik yeniden çalıştırmaz.

### Somut örnek

~~~typescript
cy.get('[data-cy="basket-total"]')
  .should("contain", "100");
~~~

Toplam ilk anda 0 ise Cypress ilgili query + assertion zincirini belirli timeout sınırına kadar yeniden değerlendirir; uygulama 100 gösterdiğinde assertion başarılı olabilir.

~~~typescript
cy.get('[data-cy="checkout"]').click();
~~~

Click öncesi elementin görünür, etkileşilebilir ve uygun state'te olması beklenebilir. Ama click **gerçekleştikten sonra**, sonraki `should()` başarısız diye Cypress eski click'i otomatik bir kez daha yapmaz.

**Kritik fark:** Retry edilen şeyin **hangi bölüm** olduğunu bilmeden “Cypress her şeyi tekrar dener” demek yanlıştır.

## 26.3 Sabit bekleme neden kırılgan?

Kötü örnek:

~~~typescript
cy.get('[data-cy="basket-add"]').click();
cy.wait(3000);
cy.get('[data-cy="basket-count"]').should("have.text", "1");
~~~

Bu test şu varsayıma dayanıyor: **Üç saniye her koşulda yeterli**.

- Hızlı ortamda iki saniye gereksiz beklenir;
- yavaş ortamda üç saniye yetmeyebilir;
- ürün gerçekten başarısızsa problem yalnız uzun beklemeyle gizlenebilir.

Daha iyi:

~~~typescript
cy.get('[data-cy="basket-add"]').click();
cy.get('[data-cy="basket-count"]')
  .should("have.text", "1");
~~~

Bu kez gerçekten beklediğimiz **gözlenebilir state** üzerinden değerlendirme yapıyoruz.

### Ağ response'u beklemek gerektiğinde

Belirli bir request'in tamamlanması testin bağlamı için önemliyse:

~~~typescript
cy.intercept("GET", "/api/basket*").as("getBasket");
cy.visit("/basket");
cy.wait("@getBasket");
cy.get('[data-cy="basket-total"]').should("contain", "100");
~~~

**Buradaki varsayım:** Test edilen uygulama gerçekten ilgili GET isteğini başlatır. Böyle bir request yoksa alias beklemek timeout verir. Ayrıca `cy.wait("@getBasket")`, **response doğru** demek değildir: İlgili status, body veya UI sonucu testin riskine göre ayrıca doğrulanmalıdır.

**Önemli sınır:** `cy.intercept` ile response'u stub'lıyorsak **gerçek backend entegrasyonunu değil**, stub'lanmış frontend davranışını gözleriz. Spy amaçlı intercept ve stub intercept aynı kanıt gücünü taşımaz.

## 26.4 “then” ile “should” ne zaman kullanılır?

~~~typescript
cy.get('[data-cy="basket-total"]').should("contain", "100");
~~~

`should()` assertion'ı, query zincirinin retry mantığıyla çalışır.

~~~typescript
cy.get('[data-cy="basket-total"]').then(($el) => {
  const text = $el.text();
  // Burada elde edilen o andaki değerle çalışılır.
});
~~~

`then()` callback'i normalde otomatik olarak tekrar çağrılmaz; içindeki anlık okumayı “UI sonunda güncellenecek” beklentisiyle yazmak risklidir. Özellikle **retry etmek istediğin koşulu** `should()` içinde veya uygun query/assertion zincirinde ifade etmeyi düşün.

### “should” callback'inde yan etki yapma

~~~typescript
// Riskli yaklaşım: assertion callback'i tekrar çalışabilir.
cy.get('[data-cy="status"]').should(($el) => {
  // Burada tekrarlı POST veya click başlatmak doğru yaklaşım değildir.
  expect($el.text()).to.include("READY");
});
~~~

`should(cb)` callback'i tekrar çalışabileceği için burada **kontrolsüz side effect** oluşturma. Cypress komutlarıyla kontrol akışını native async/await yaklaşımıyla karıştırma.

## 26.5 İki farklı bekleme hedefi

**A. Network tamamlandı mı?**  
Cypress alias/intercept ile belirli HTTP olayını gözlemleyebilir.

**B. Kullanıcının gördüğü sonuç doğru mu?**  
DOM'da belirli status, tutar veya state'i assert etmek gerekir.

Biri diğerinin garantisi değildir. Network request tamamlanmış olabilir ama UI güncellenmemiştir; UI eski cache verisini gösterebilir. Test **hangi risk için hangi kanıtı** hedefliyorsa o düzeyi seçmelidir.

## 26.6 Timeout artırmak ne zaman makul?

Bazı işler doğal olarak daha uzun sürer. Kontrollü bir bekleme sınırını artırmak gerekebilir:

~~~typescript
cy.get('[data-cy="report-ready"]', { timeout: 15000 })
  .should("be.visible");
~~~

Bu, ilgili işlemin belirli sürede sonuçlanmasının beklendiği açık durumda uygundur. Ancak **yanlış selector**, eksik network isteği veya paylaşılan data yüzünden oluşan failure'ı timeout artırarak geçici gizlemek kalıcı çözüm değildir.

### Query chain ve re-render

Modern UI yeniden render olduğunda daha önce bulunan DOM öğesi değişmiş olabilir. Elementi alıp uzun zincirde taşıyarak daha sonra action yapmak kırılganlaşabilir.

**Pratik yaklaşım:** State değiştiren eylemden sonra **öğeyi yeniden sorgula** ve yeni durumun gözlenebilir sonucunu assert et. Cypress'in query/retry sınırlarını gerçek kodda anlayarak ilerle.

## 26.7 Hata inceleme örneği

**Failure:** `cy.get('[data-cy="basket-total"]').should("contain","100")` timeout.

Zayıf yaklaşım: “`cy.wait(10000)` ekle.”

Güçlü araştırma:
1. Sepet state'i gerçekten 100 mü olmalı?
2. Selector doğru öğeyi mi buluyor?
3. İlgili network isteği gönderildi ve başarılı mı?
4. UI update tamamlandı mı?
5. Data setup doğru customer/coupon/state'i üretti mi?
6. Uygulama bug mı, testin expected sonucu mu, ortam mı?

**Sonuç:** Retry doğru koşulu beklemeye yardımcıdır; yanlış oracle'ı veya bozuk veri kurulumunu düzeltmez.

## 26.8 Alıştırma — neden yanlış?

Aşağıdaki kodu düşün:

~~~typescript
cy.get('[data-cy="save"]').click();
cy.wait(5000);
cy.get('[data-cy="toast"]').then(($toast) => {
  expect($toast.text()).to.include("Saved");
});
~~~

**Görev:** İki kırılgan noktayı bul ve daha anlamlı kontrol yaz.

**Örnek çözüm:**

~~~typescript
cy.get('[data-cy="save"]').click();
cy.get('[data-cy="toast"]')
  .should("contain", "Saved");
~~~

Sabit beş saniyelik bekleme kaldırıldı; assertion retry edilebilir query zincirinde. Ancak kritik veri değişikliği için yalnız toast metni yeterli değilse **kaydedilen state** uygun seviyede ayrıca doğrulanmalıdır.

## Sonraki ders

Cypress'in teknik çalışma modelini öğrendik. Şimdi teknik kod ile iş davranışı cümlelerini bilinçli biçimde ayıracağız: **BDD ve Gherkin neden kullanılır?**

→ [27. BDD & Gherkin](05-bdd-gherkin-as-a-collaboration-language.md)

**Kaynaklar:** [Cypress Introduction](https://docs.cypress.io/app/core-concepts/introduction-to-cypress) · [Retry-ability](https://docs.cypress.io/app/core-concepts/retry-ability) · [Best Practices](https://docs.cypress.io/app/core-concepts/best-practices).
