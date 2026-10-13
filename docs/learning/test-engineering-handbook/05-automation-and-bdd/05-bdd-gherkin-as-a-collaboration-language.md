# 27. BDD & Gherkin — İş davranışını ortak dille anlatmak

> **Bu dersin sorusu:** Bir senaryo teknik olarak doğru çalışsa bile neden product owner onun neyi doğruladığını anlayamayabilir?

I1'de acceptance criteria ve ATDD ile **beklenen iş davranışını önce netleştirmeyi** öğrendik. I4'ün bu bölümünde BDD'nin bunu nasıl ortak bir dile çevirdiğini inceliyoruz.

## 27.1 Gherkin kullanmadan önce konuşmamız gereken şey

MiniShop hikâyesi:

> “Aktif üyeler 100 € ve üzeri sepette standart kargoyu ücretsiz kullanmalı.”

Product owner “aktif”, developer “100 €”, tester “standart kargo” ifadelerini farklı yorumlayabilir.

**BDD (Behavior-Driven Development)**, geliştirici, tester ve iş paydaşlarının **somut davranış örnekleri üzerinden ortak anlayış kurmasına** odaklanan yaklaşımdır.

Cucumber veya Gherkin kullanılmasa bile ortak örneklerle konuşmak BDD düşüncesini destekleyebilir. **BDD = otomasyon aracı değildir.** Teknik araç daha sonra gelir.

## 27.2 Three Amigos: Aynı örneğe üç bakış

Bunu bir toplantı adı olarak ezberlemeyelim; iş birliği açısından düşünelim:

- **Business/Product:** Kullanıcı niyeti, iş kuralı ve acceptance.
- **Development:** Teknik sınırlar, veri bağımlılıkları, istisnalar.
- **Testing:** Sınırlar, çelişkiler, negatif senaryolar, gözlenebilir kanıt.

Örnek konuşma:

**Business:** “100 € sepet ücretsiz kargo.”

**Tester:** “Tam 100 € dahil mi? Kupon sonrası mı?”

**Developer:** “Vergi tutarı dahil mi? Express seçilirse ne olur?”

**Business:** “100 dahil; kupon sonrası toplam; Express her durumda ücretli.”

Bu kararlardan sonra yazılan test senaryosu daha sağlam bir **oracle**'a sahip olur.

## 27.3 Gherkin nedir?

**Gherkin**, iş davranışını okunabilir bir yapıyla tarif etmeye yarayan dildir. Sık görülen anahtarlar:

- **Feature:** Özelliğin kullanıcı/iş amacı.
- **Rule:** Bir özelliğe ait belirli iş kuralı.
- **Scenario (Example):** Kuralı somutlaştıran örnek.
- **Given:** Başlangıç bağlamı.
- **When:** Gerçekleşen olay/eylem.
- **Then:** Gözlenebilir beklenen sonuç.
- **And / But:** İlgili cümleleri bağlama.
- **Scenario Outline / Examples:** Aynı senaryonun veri varyasyonları.
- **Background:** Ortak bağlam; her senaryodan önce çalışır.
- **Tags:** Etiketleme; proje runner/adapter'ının nasıl kullandığına bağlıdır.

### Basit bir iş senaryosu

~~~gherkin
Feature: Shipping costs
  Rule: Active members receive free standard shipping from 100 EUR

    Scenario: A member qualifies at the threshold
      Given an active member has a basket total of 100 EUR
      And standard shipping is selected
      When the shipping cost is calculated
      Then the shipping fee is 0 EUR
~~~

Bu metin **hangi CSS class'ın tıklandığını** anlatmaz. İş kuralını ve kabul kanıtını anlatır.

## 27.4 Given, When, Then rollerini ayır

**Given — Başlangıç koşulu**  
“An active member has a basket total of 100 EUR.”

**When — Tetikleyici olay**  
“The shipping cost is calculated.”

**Then — Beklenen observable sonuç**  
“The shipping fee is 0 EUR.”

**Yanlış odak:**

~~~gherkin
Scenario: CSS checkout
  Given I click the blue login button
  When I wait 3000 milliseconds
  Then div:nth-child(3) has class green
~~~

Bu senaryo kullanıcı niyetini değil **UI implementasyonunu** dokümante ediyor. Daha sonra buton rengi veya DOM değişince iş kuralıyla ilgisiz metin değişiklikleri gerekiyor.

### Her Gherkin senaryosu UI testi değildir

Aynı iş kuralı UI üzerinden veya API/component düzeyinde doğrulanabilir. Gherkin **iş örneği dilidir**, otomatik olarak browser E2E zorunluluğu değildir.

## 27.5 Scenario Outline: Veri varyasyonları

BVA örneklerini dört kez kopyalamak yerine:

~~~gherkin
Scenario Outline: Shipping fee at the boundary
  Given an active member has a basket total of <total> EUR
  And standard shipping is selected
  When the shipping cost is calculated
  Then the shipping fee is <fee> EUR

  Examples:
    | total | fee |
    | 99    | 5   |
    | 100   | 0   |
    | 101   | 0   |
~~~

Her veri satırı **ayrı örnek/senaryo yürütmesi** oluşturur. Buradaki fiyatların tam sayı olması yalnız öğretim kolaylığıdır; para hassasiyeti ürün sözleşmesine göre belirlenir.

**Ne zaman uygun?** Aynı kurala ait, yalnız veri/expected sonucu değişen varyasyonlar.

**Ne zaman kötü?** Farklı iş davranışlarını tek, çok parametreli senaryo içine zorlamak. Tablo 30 sütunlu hale geldiyse neyi anlattığı kaybolabilir.

## 27.6 Background ve Rule

İki senaryonun ikisinde de “aktif üye” gerektiğini düşün.

~~~gherkin
Feature: Shipping costs
  Background:
    Given an active member has a basket

  Rule: Standard shipping is free from 100 EUR
    Scenario: Below threshold
      Given the basket total is 99 EUR
      When standard shipping is calculated
      Then the fee is 5 EUR

    Scenario: At threshold
      Given the basket total is 100 EUR
      When standard shipping is calculated
      Then the fee is 0 EUR
~~~

**Background her senaryo için tekrar çalışır.** Çok uzun Background okuyucunun senaryoyu anlamasını zorlaştırır. Aynı zamanda gereksiz teknik setup'ın gizlendiği bir yer olmamalıdır.

**Rule** gruplaması bir iş kararını görünür kılar; dosya sayısını veya framework mimarisini zorunlu olarak değiştirmez.

## 27.7 Negative behavior da iş dilinde olmalı

Yetki kuralı: “Bir kullanıcı yalnız kendi siparişini görüntüler.”

~~~gherkin
Scenario: A member cannot view another member's order
  Given member A is signed in
  And an order belongs to member B
  When member A requests that order
  Then access is denied
  And the order details are not disclosed
~~~

Bu senaryonun gücü “login olur ve butona tıklar” demesinde değil; **authorization davranışının ve güvenlik sonucunun** anlaşılır olmasında.

## 27.8 BDD'nin başarısız kullanımı

“Gherkin dosyamız var, BDD yapıyoruz” iddiası yetersiz olabilir.

Sorun işaretleri:
- Senaryolar product owner tarafından okunamıyor;
- Bütün step'ler `click, type, wait` seviyesinde;
- Beklenen sonuç koddan kopyalanıyor;
- Her sprint aynı belirsizlikler tekrar soruluyor;
- Yüzlerce aynı step tanımı çatışıyor;
- İstisna ve alternatif kullanıcı örnekleri hiç yok.

**BDD'nin değeri test scripti üretmekten önce **ortak davranış anlayışı** yaratmasıdır.**

## 27.9 Alıştırma — yeni story

Kural:

> “Belge sahibi, PENDING belgesini silebilir; APPROVED belge silinemez.”

**Görev:** Bir pozitif, bir negatif Gherkin senaryosu yaz. Teknik selector ekleme.

**Örnek çözüm:**

~~~gherkin
Scenario: Owner deletes a pending document
  Given a pending document belongs to the signed-in member
  When the member requests deletion
  Then the document is deleted

Scenario: Approved document is protected
  Given an approved document belongs to the signed-in member
  When the member requests deletion
  Then the request is rejected
  And the document remains approved
~~~

Bu örneklerde deletion'ın HTTP status'u belirtilmiyor; o **API sözleşmesinde** netleştirilmeli. İş davranışı açısından önemli state ve yan etki yazıldı.

## Sonraki ders

Gherkin metni iş dilidir. Peki bu cümleler **hangi kodla eşleşir**, değerleri nasıl taşır ve Cypress komutlarıyla nasıl çalışır? Step definition tasarımına geçiyoruz.

→ [28. Step Definitions & Glue](06-step-definitions-and-gherkin-integration.md)

**Kaynak:** [Cucumber Gherkin Reference](https://cucumber.io/docs/gherkin/reference/).
