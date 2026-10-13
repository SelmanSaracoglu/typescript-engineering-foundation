# I4 Çalışma Atölyesi — Automation & BDD

> **Kullanım:** Önce [23–29. dersleri](01-automation-candidates-and-value.md) oku. Bu dosyada yeni bir framework öğrenmiyoruz; tek bir gereksinimi otomasyon kararı, test mimarisi, Gherkin ve debugging açısından birleştiriyoruz. **İngilizce mülakat ve CTFL pratiği** ana derslerden ayrı tutulur.

## A. Birleşik vaka — MiniShop teslimat ücreti

Bu atölye için iş kuralları:

- ACTIVE üye, **indirim sonrası** sepeti en az 100 € ise STANDARD kargo için 0 € öder.
- Diğer STANDARD gönderimler 5 €'dur.
- EXPRESS her zaman 10 €'dur.
- Kullanılmış kuponla ikinci indirim kaydedilemez.

Sistem: Browser → Order API → Pricing Service → Membership Repository; dış ödeme sağlayıcısı ayrı sınırdır.

### Adım 1 — Otomasyon adayını seç

**Riske göre:**
- Kargo eşik ve üyelik kombinasyonlarını hızlı **component testlerinde** ayrıntılı doğrula.
- Service–membership entegrasyonunu seçilmiş integration testiyle kontrol et.
- Kullanıcının checkout'ta doğru kargo ücretini gördüğü **birkaç kritik UI/E2E akışı** koru.
- Kuponun tekrar kullanımında ret ve state değişmemesi riskini uygun backend/API sınırında ayrıca ele al.

**Gerekçe:** 25 veri varyasyonunu browser'a kopyalamak bekleme, login, selector ve shared state maliyetini büyütür. Detaylı boundary/decision cases daha küçük test sınırında daha kolay teşhis edilir.

### Adım 2 — Gherkin ile business rule yaz

~~~gherkin
Feature: Shipping fees

  Rule: Active members qualify for free standard shipping from 100 EUR

    Scenario Outline: A member sees the correct standard shipping fee
      Given an active member has a basket total of <total> EUR after discounts
      When the member selects standard shipping
      Then the shipping fee is <fee> EUR

      Examples:
        | total | fee |
        | 99    | 5   |
        | 100   | 0   |
        | 101   | 0   |

    Scenario: Express delivery remains paid
      Given an active member has a basket total of 120 EUR after discounts
      When the member selects express shipping
      Then the shipping fee is 10 EUR
~~~

Bu senaryolar **iş davranışıdır**, mevcut uygulamada çalışan testler değildir.

### Adım 3 — Step responsibility tasarla

| Step | İşlev | Gizlenmemesi gereken bilgi |
|---|---|---|
| Given active member has basket | Test-owned customer/basket hazırla | ACTIVE + indirim sonrası toplam |
| When selects standard shipping | Gerekli seviyede seçim/hesaplama | STANDARD |
| Then shipping fee is X | Actual fee ile X oracle'ını karşılaştır | Expected tutar, currency |
| Express scenario | EXPRESS istisnasını doğrula | EXPRESS ücret kuralı |

**Dikkat:** Step definition import'ları, kullanılan Cypress–Cucumber adapter sürümü bilinmeden uydurulmaz. **Ayrı feature ve step dosyalarını birbirine bağlayan gerçek konfigürasyon bu atölyenin kapsamı değildir.**

### Adım 4 — Kararlı selector ve senkronizasyon

Kırılgan UI testi:

~~~typescript
cy.get(".green-btn").click();
cy.wait(4000);
cy.get("div:nth-child(3)").should("contain", "0");
~~~

Daha anlamlı fikir:

~~~typescript
cy.get('[data-cy="delivery-standard"]').click();
cy.get('[data-cy="shipping-fee"]').should("contain", "0");
~~~

Bu kod **uygulamanın böyle data attribute'ları olduğunu varsayar**. Gerçek ürün kontrol edilmeden copy/paste ile çalışacağı iddia edilmez. Ayrıca para biçimi/localization oracle'ı açık olmalı; yalnız “0” substring'i bazen fazla gevşek assertion olabilir. Örneğin `10,00` da “0” içerir. Bu nedenle **tam tutarı ve doğru para birimini** doğrulayacak assertion tasarlanmalıdır.

**Güvenilir yaklaşım:** İlgili öğenin tam ücretini metin/format kontratına göre assert etmek ve önemli iş sonucu için gerekiyorsa API tarafında ek kanıt toplamak.

### Adım 5 — Cypress queue tuzağı

**Hatalı zihinsel model:** `const el = await cy.get(...)`; sonra native Promise gibi işlem yapmak.

**Daha doğru:** Cypress komutları queue'da sıralanır; query + assertion retry kurallarına uyar. Click gibi state değiştiren action, assertion başarısız diye otomatik tekrar tıklanmaz.

**Bekleme:** Sabit sleep yerine gözlenebilir state ve gerekirse ilgili network alias. Network tamamlanması **UI'ın doğru business sonucu verdiğini** tek başına kanıtlamaz.

### Adım 6 — Bir failure'ı katmanlandır

**Failure:** 100 € örneğinde Then adımı beklenen 0 €'yu bulamıyor.

| Hipotez | İlk kanıt |
|---|---|
| Business rule 120 € oldu | Product owner'ın onaylı güncel kararı |
| Kupon indirimi sonrası toplam farklı | Test-owned basket ve kupon state |
| Selector yanlış öğeyi okuyor | DOM ve kararlı locator |
| UI henüz güncellenmedi | Network response + görünür state |
| Pricing Service yanlış hesaplıyor | API/component assertion |
| Step yanlış parametre üretiyor | Gherkin expression ve transformed value |

**Sadece timeout artırıp problemi kapatmak** kalıcı çözüm değildir.

---

## B. Bağımsız transfer — dosya inceleme sistemi

**Kural:** Sahip yalnız kendi **PENDING** belgesini düzenleyebilir. Reviewer PENDING belgeyi APPROVED yapabilir. APPROVED belge değiştirilemez.

**Görevler:**
1. Otomasyona aday iki iş riski ve test seviyesi seç.
2. Bir başarılı, bir başarısız Gherkin Scenario yaz.
3. Testleri kırabilecek iki selector/timing anti-pattern'i belirle.
4. Bir reusable step ve **anlamsız aşırı genel** step örneği yaz.
5. Undefined step ile ambiguous step farkını açıkla.
6. Stubbing kullanacaksan **hangi entegrasyon riskini kanıtlamadığını** belirt.

### Örnek çözüm

- Component/API: PENDING→APPROVED geçiş izni ve yanlış role DENY; API/system: başka kullanıcının belge içeriğinin sızmaması.
- Pozitif: Given pending document owned by signed-in member; When member edits; Then changes are saved.
- Negatif: Given approved document; When member requests edit; Then request is denied and content is unchanged.
- Anti-pattern: `button:nth-child(2)` ve `cy.wait(5000)`.
- Anlamlı step: “an approved document belongs to the signed-in member”. Aşırı genel: “I do {string} to {string} with {string}”.
- Undefined = matching step definition yok; ambiguous = aynı step birden çok tanımla eşleşiyor.
- Stub'lanmış repository gerçek DB constraint/transaction davranışını, stub'lanmış authorization endpoint'i gerçek backend yetkisini kanıtlamaz.

---

## C. English interview rehearsal

Bunları önce **kendin yanıtla**; örnek cevaplar kişisel proje deneyimi iddiası değildir.

**1. How do you decide what to automate?**  
“I assess business risk, repeat frequency, stability of the oracle, setup cost and maintenance. Automation should improve feedback and confidence, not just test counts.”

**2. Is every test best automated as E2E?**  
“No. Detailed calculations and rule combinations can be faster and more diagnostic at component level. I keep E2E for critical integrated journeys and UI-specific risks.”

**3. What makes test automation maintainable?**  
“Clear business intent, isolated data, meaningful abstractions, stable selectors and assertions based on an independent requirement.”

**4. What selector strategy do you prefer?**  
“I prefer selectors tied to a stable behavior contract, such as dedicated test attributes or appropriate accessible semantics, rather than styling or DOM position.”

**5. How does Cypress retry work?**  
“Queries and assertions can retry together according to the command chain. State-changing actions are not automatically repeated just because a later assertion fails.”

**6. Why avoid arbitrary waits?**  
“Fixed delays are usually too long or too short. I wait for the relevant observable state or specific network event and verify the business outcome separately.”

**7. What is BDD?**  
“BDD aligns business, development and testing around concrete examples of expected behavior. Cucumber can support it, but an automated Gherkin file alone does not guarantee collaboration.”

**8. What belongs in a Gherkin scenario?**  
“Business context, an event and an observable result. I avoid incidental selectors, fixed sleeps and implementation details.”

**9. What is a step definition?**  
“It binds Gherkin step text to executable logic. I keep definitions focused, avoid ambiguous matching and separate shared domain behavior from UI implementation.”

**10. How would you investigate a failing BDD test?**  
“I verify the requirement and test data first, then step matching, selectors, command timing, product behavior and environment evidence before selecting a fix.”

---

## D. ISTQB Foundation — isteğe bağlı tekrar

CTFL, **test automation benefits and risks**, farklı testing approaches ve test faaliyetleri açısından bu Increment'le ilişkilidir. Gherkin adapter/step syntax ve bütün Cypress API'leri **CTFL'nin birebir sınav konusuymuş gibi sunulmaz**. Sorular özgündür, resmî örnek sınav değildir.

**S1.** Her PR'da yinelenen, basit kargo hesabı için ilk güçlü test sınırı hangisi?  
A) Yalnız UI E2E · B) Component ve seçilmiş entegrasyon kontrolleri · C) Yalnız manuel demo · D) Screenshot

**S2.** Otomasyon yatırımının riskini hangisi artırır?  
A) Açık oracle · B) İzole veri · C) Sürekli değişen kararsız arayüz ve kırılgan selector · D) Hızlı geri bildirim

**S3.** Gherkin'de `Given` en çok neyi ifade eder?  
A) Başlangıç bağlamı · B) Çalışma sonrası defect raporu · C) Zorunlu CSS selector · D) CI config

**S4.** `Scenario Outline` ve `Examples` nasıl ilişkilidir?  
A) Her satır yeni örnek yürütmesi yaratır · B) Sadece yorumdur · C) Test runner olmadan otomatik backend oluşturur · D) Her satır aynı global state'i paylaşmak zorundadır

**S5.** Cucumber step matching'de Given/When/Then sözcükleri doğru ifadeyi seçmek için nasıl kullanılır?  
A) Step text eşleşmesinin belirleyici parçası değildir · B) Aynı metin için üç bağımsız zorunlu tanım gerekir · C) Yalnız Then yürütülür · D) Eşleşme CSS ile yapılır

**S6.** `click()` sonrası `should()` başarısız olursa Cypress'in click'i otomatik yeniden çalıştıracağını varsaymak?  
A) Doğru · B) Yanlış; query/assertion retry ile state-changing action'ı ayırmalıyız · C) Sadece Firefox'ta doğru · D) Her zaman gerekli

**S7.** Stub'lanmış payment response ile geçen test neyi **kanıtlamaz**?  
A) Kontrollü success branch testi yapılabildiğini · B) Gerçek provider contract'ının kesin doğru olduğunu · C) Input seçilebildiğini · D) Assertion kurulabildiğini

**S8.** BDD senaryosunda hangi Then daha anlamlı iş kanıtıdır?  
A) `div:nth-child(4)` yeşil · B) Yetkisiz işlem reddedildi ve başka hesaba ait veri değişmedi · C) 3000 ms beklendi · D) Kullanıcı sağdaki butona tıkladı

### Cevap anahtarı

| Soru | Yanıt | Gerekçe |
|---|---|---|
| S1 | **B** | Küçük hesaplamanın çok sayıda varyasyonu düşük seviyede daha güvenilir; kritik birleşim ayrı sınanabilir. |
| S2 | **C** | Sürekli bakım ve yanlış failure maliyetini artırır. |
| S3 | **A** | Given başlangıç state/bağlamını anlatır. |
| S4 | **A** | Outline, Examples satırlarıyla somutlaştırılır. |
| S5 | **A** | Match edilen kısım anahtar sözcükten sonraki step metnidir. |
| S6 | **B** | Cypress'te query/assertion ve action retry kuralları farklıdır. |
| S7 | **B** | Stub gerçek dış sistemi çalıştırmaz. |
| S8 | **B** | Yetki kuralının gözlenebilir sonucu ve yan etkisini doğrular. |

---

## E. Resmî kaynaklar ve uygulama sınırı

- [Cypress Introduction / Command Queue](https://docs.cypress.io/app/core-concepts/introduction-to-cypress)
- [Cypress Retry-ability](https://docs.cypress.io/app/core-concepts/retry-ability)
- [Cypress Best Practices](https://docs.cypress.io/app/core-concepts/best-practices)
- [Cucumber Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Cucumber Step Definitions](https://cucumber.io/docs/cucumber/step-definitions/)
- [ISTQB CTFL](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

**I4'ün çıktısı bir öğretim dokümanıdır.** Yeni Cypress–Cucumber adapter'ı, çalışan feature runner'ı, CI pipeline'ı veya uygulama kodu oluşturulmadı. Bu dosyanın hazırlanması Selman'ın bağımsız otomasyon becerisinin doğrulandığı anlamına gelmez.
