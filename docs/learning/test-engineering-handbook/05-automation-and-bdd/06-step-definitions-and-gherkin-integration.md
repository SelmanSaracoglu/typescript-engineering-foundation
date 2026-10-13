# 28. Step Definitions — Gherkin ile otomasyon kodu arasındaki köprü

> **Bu dersin sorusu:** Gherkin'de “When the member selects standard shipping” yazdığımızda bilgisayar bunun ne yapacağını nasıl bilir?

Önceki derste okunabilir iş senaryoları hazırladık. Gherkin metni tek başına çalışan test kodu değildir. Bu metni çalıştırılabilir adımlara bağlayan katmana **step definition** denir.

## 28.1 Üç parçayı ayır

~~~text
.feature file
"An active member has a basket of 100 EUR"
                    ↓ step text matching
Step definition
"Bu cümleyi hangi kod karşılıyor?"
                    ↓
Test driver / domain action
"Cypress veya başka test arabirimiyle nasıl yürütülüyor?"
~~~

**Feature file** iş beklentisini; **step definition** metnin kodla eşleşmesini; **driver/helper** teknik etkileşimi temsil edebilir.

Bu, tek zorunlu mimari şablon değildir; **sorumlulukların birbirine karışmaması** için yararlı bir zihinsel modeldir.

## 28.2 Basit bir eşleşme

Gherkin:

~~~gherkin
Scenario: Free standard shipping at the threshold
  Given an active member has a basket total of 100 EUR
  When the member selects standard shipping
  Then the shipping fee is 0 EUR
~~~

Step definition katmanında Cucumber Expressions benzeri bir eşleştirme yapılabilir:

~~~typescript
// Kavramsal TypeScript: runner/adapter importları bilerek verilmedi.
Given("an active member has a basket total of {int} EUR", (total: number) => {
  // İlgili üyeyi ve sepeti kontrollü test verisiyle hazırla.
  // Örn. domain-level arrange helper.
});

When("the member selects standard shipping", () => {
  // Kullanıcı davranışını uygun test katmanında uygula.
});

Then("the shipping fee is {int} EUR", (expectedFee: number) => {
  // Gerçek sonucu onaylı expectedFee ile karşılaştır.
});
~~~

**Bu kod doğrudan çalıştırılabilir örnek değildir:** Kurulu Cypress–Cucumber adapter'ı ve test uygulaması bilinmeden import, step state yönetimi ve komut bağlantısı uydurulmuyor.

**Önemli mantık:** Gherkin'de `100` ve `0`, step expression ile **parametre** olarak karşılanabilir. Step definition'daki expected değer, **üründen okunarak kendi kendine oluşturulmamalı**.

## 28.3 Gherkin anahtar sözcükleri eşleşmeyi belirler mi?

Cucumber'un step matching davranışında `Given`, `When`, `Then` sözcükleri **eşleşme kimliğinin parçası değildir**; eşleştirme esasen sonraki step metniyle yapılır.

Dolayısıyla şu iki adımı düşün:

~~~gherkin
Given the basket total is 100 EUR
Then the basket total is 100 EUR
~~~

Bunlar dil açısından farklı rol oynasa da **aynı metin** için ayrı bağımsız step definition'ları yazmak doğru değildir. Aynı eşleşmenin senaryo içinde farklı anlamı olması tasarım problemidir.

**Daha iyi:**  
Given: “an active member has a basket total of 100 EUR”  
Then: “the displayed basket total is 100 EUR”

Bu cümleler yalnız farklı kelimeler kullanmıyor; **arrange** ve **assert** sorumluluğunu açıklıyor.

## 28.4 Undefined ve ambiguous steps

**Undefined step:** Gherkin metnini karşılayan step definition yok.

Örneğin:

~~~gherkin
When the member confirms payment
~~~

Ama yalnız şu step mevcut:

~~~text
When the member selects standard shipping
~~~

Cucumber hangi işlemi yapacağını bulamaz.

**Ambiguous step:** Bir Gherkin step metni **birden fazla** step definition ile eşleşir. Örneğin bir genel `the member selects {word}` ifadesi ile özel `the member selects standard shipping` ifadesinin aynı adımı eşleştirmesi.

**Yanlış çözüm:** Eşleşme problemini gizlemek için senaryo metnini anlamsız kısaltmak.

**Daha iyi:** İş davranışını açık tut, expression'ları kontrol et, gereksiz/geniş step'leri sınırla, tekrarları ilgili domain altında düzelt.

## 28.5 Reusability: Aynı step'i her yerde paylaşmalı mıyız?

Yaygın istek: “Bir kez tanımladığımız Given her yerde çalışsın.”

Bu, aynı **anlamı** taşıyan adım için iyi olabilir. Ama şu tip genel step'i düşün:

~~~text
Given there is a user
~~~

Hangi kullanıcı? ACTIVE mi? Admin mi? Hangi permission? Hangi state?

Bu adımı 50 feature'a dağıtmak kısa vadede kod tekrarını azaltır ama her senaryoya **gizli varsayımlar** taşır.

Daha güvenilir:

~~~gherkin
Given an active member owns a pending document
~~~

Bu cümle, testin ihtiyacı olan **görünür business state'i** kurar. Eğer farklı feature'larda gerçekten aynı davranışı anlatıyorsa yeniden kullanılabilir; değilse zorla ortaklaştırma.

**Prensip:** Reuse, **anlam tekrarından** doğmalı; sözcük benzerliğinden değil.

## 28.6 Test state'i: Senaryolar birbirine veri taşımamalı

Gherkin Scenario Outline farklı veri satırları için bağımsız senaryo yürütmeleri oluşturur.

İyi tasarımda:
- Her scenario kendi gerekli önkoşullarını kurar.
- Her scenario için test-owned veri kullanılır.
- Bir scenario'nun step'i, önceki scenario'nun global değişkenine ihtiyaç duymaz.
- Step kodu global değiştirilebilir state üzerinden paralel çalışan testleri kirletmez.

**Yanlış örnek:** Scenario A sipariş oluşturur; Scenario B “lastCreatedOrder” global değişkenini kullanarak iptal eder.

**Daha iyi:** Scenario B kendi iptal edilebilir siparişini Given adımıyla kurar. Uzun sipariş→iptal yolculuğu önemliyse aynı Scenario içinde iş akışı olarak doğrulanabilir.

Bu, I3'teki **test isolation** ilkesinin BDD katmanına uygulanmasıdır.

## 28.7 Step definition ile Cypress command queue uyumu

Step kodu Cypress komutları çağırıyorsa **Cypress'in yürütme modelini** bozmamalı.

Yaygın anti-pattern'ler:
- Cypress chain'i native Promise gibi `await` etmek;
- UI state değişmeden sabit sleep eklemek;
- `should` callback'inde yan etkili işlemleri tetiklemek;
- step içinde hiçbir assertion olmadan başarı varsaymak;
- step'in tamamlandığını, gerçekten beklenen Cypress komutları bitmeden bildirmek.

**Önemli sürüm/adapter sınırı:** Cypress + Cucumber kullanımı çekirdek Cypress'in otomatik yerleşik özelliği değildir; gerçek bağlanma, kullanılan **adapter ve sürüme** göre değişir. Bu handbook özellikle doğrulanmamış bir paket import'u veya konfigürasyon dosyası üretmez.

Gerçek repo/çalışma ortamındaki adapter ve TypeScript ayarları ayrı uygulama görevinde kontrol edilmelidir.

## 28.8 Step sayısını artırmak mı, anlamlı davranışı ifade etmek mi?

**Kırılgan:**

~~~gherkin
When I click the top-right button
And I wait 2 seconds
And I type "100" into input number 3
Then element 12 has class active
~~~

**Daha güçlü:**

~~~gherkin
Given an active member has a basket total of 100 EUR
When standard shipping is calculated
Then the shipping fee is 0 EUR
~~~

Test etme katmanı UI ise ikinci senaryo da browser üzerinden uygulanabilir. Sadece **teknik ayrıntı iş davranışının yerini almıyor**.

Ancak bir UX testi özel olarak “düğme görünür ve accessible name doğru” şartını ölçüyorsa UI ayrıntısı **iş gereksiniminin parçasıdır**; onu da gizlemek yanlış olur.

## 28.9 Alıştırma — step sözlüğü tasarla

Özellik: “Yalnız belge sahibi PENDING belgeyi silebilir.”

Aşağıdaki üç Gherkin adımı için sorumluluğu belirt:

~~~gherkin
Given a pending document belongs to the signed-in member
When the member deletes the document
Then the document no longer exists
~~~

**Görev:** Hangi adım setup, hangisi action, hangisi assertion? Nasıl test-owned veri kullanırsın?

**Örnek çözüm:** Given adımında testin kendi üyesi, belge kimliği ve PENDING state'i hazırlanır; When adımı o belgeyi siler; Then adımı aynı belge ID'sinin artık bulunmadığını veya sözleşmedeki deleted state'i kontrol eder. Doğru oracle için hard delete / soft delete kararının önceden bilinmesi gerekir.

## Sonraki ders

Artık senaryo metnini doğru step'lere bağlayabiliyoruz. Son adım: BDD otomasyonunu **uzun vadede okunabilir ve hata ayıklanabilir** halde tutmak.

→ [29. BDD Automation Maintainability](07-bdd-automation-review-and-failure-diagnosis.md)

**Kaynaklar:** [Cucumber Step Definitions](https://cucumber.io/docs/cucumber/step-definitions/) · [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/).
