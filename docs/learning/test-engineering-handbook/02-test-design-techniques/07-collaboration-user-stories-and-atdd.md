# 10. User Stories, Acceptance Criteria ve ATDD

> **Bu bölümün sorusu:** Testçinin en değerli katkısı bazen neden henüz kod yazılmadan önce ortaya çıkar?

## 10.1 Bir hikâye ile başlayalım

Ürün sahibi şunu yazıyor:

> “Bir müşteri olarak sepetimdeki ücretsiz kargo hakkımı görmek istiyorum; böylece sipariş vermeden önce masrafımı bilirim.”

Bu bir **user story** örneğidir. Kullanıcının **kim olduğunu**, **neyi yapmak istediğini** ve **neden istediğini** anlatır. Ama tek başına şu soruları yanıtlamaz:

- Ücretsiz kargo hangi tutarda başlar?
- Sepet toplamı vergi ve kupon öncesi mi sonrası mı?
- Üyelik gerekiyor mu?
- Express kargoda da ücretsiz mi?
- Kullanıcı oturum açmadan sepeti görüyorsa ne olur?

Bu sorular cevaplanmadığında hem developer hem tester farklı kurallar varsayabilir. **Aynı yanlış varsayım üzerinde çalışan kod ve testler yeşil olabilir.**

## 10.2 Story bir sözleşmenin tamamı değildir

Yaygın user story kalıbı:

**As a [role], I want [goal], so that [value].**

Bu bir konuşma **başlangıcıdır**. Gereksinimin tamamını tek satıra sığdırma zorunluluğu yoktur.

“3C” yaklaşımı bu yüzden yararlıdır:

1. **Card:** İş hedefini kısa ifade et.
2. **Conversation:** Tester, developer ve product owner örneklerle kapsamı konuşur.
3. **Confirmation:** Hangi davranışlarla kabul edileceğinde uzlaşılır.

Tester'ın görevi yalnız “story hazır olduğunda test case yazmak” değildir. Belirsizliği **erken** ortaya çıkarmaktır.

## 10.3 Acceptance criteria nasıl somutlaşır?

Örneğimiz için product owner şu kararları onayladı:

**AC-1:** Kullanıcı ACTIVE üyeyse, standart kargoda sepet toplamı **100 € veya üstünde** ücretsiz kargo uygulanır.

**AC-2:** Diğer durumlarda standart kargo ücretlidir.

**AC-3:** Express kargo, sepet tutarı ve üyelikten bağımsız ücretlidir.

Bu üç ifade **rule-oriented acceptance criteria** örneğidir. İş kuralı doğrudan yazılmıştır.

Tester bunları daha somut örneklere dönüştürebilir:

| Örnek | Üye | Sepet | Tip | Expected |
|---|---|---:|---|---|
| A1 | ACTIVE | 100 € | STANDARD | FREE |
| A2 | ACTIVE | 99 € | STANDARD | PAID |
| A3 | INACTIVE | 120 € | STANDARD | PAID |
| A4 | ACTIVE | 120 € | EXPRESS | PAID |

Tabloda üç önceki teknik birden karşımıza çıktı:
- **BVA:** 99/100 sınırı;
- **Decision table:** üye × tutar × kargo tipi;
- **Negative:** ücretsiz kargoya uygun olmayan durumun doğru reddi.

**Pedagojik sonuç:** Teknikler ayrı ezber kutuları değildir; aynı iş kuralında birbirini tamamlarlar.

## 10.4 Given / When / Then ne işe yarar?

Bir kabul örneğini iş dilinde şöyle yazabiliriz:

~~~gherkin
Scenario: Active member receives free standard shipping
  Given an active member has a basket total of 100 EUR
  And standard delivery is selected
  When shipping cost is calculated
  Then the shipping fee is 0 EUR
~~~

- **Given:** Başlangıç bağlamı, önkoşullar.
- **When:** Kullanıcının yaptığı işlem veya gerçekleşen olay.
- **Then:** Gözlenebilir beklenen iş sonucu.

Bu, otomasyon gerektiren bir kod parçası olmak zorunda değildir. Amaç **iş davranışını insanların aynı şekilde anlayacağı** bir örneğe dönüştürmektir.

### Kötü ve iyi ifade farkı

**Kötü:**

~~~gherkin
Given I click button id #shippingCalc
When I wait 5 seconds
Then I see text in div:nth-child(3)
~~~

Bu, teknik implementasyon ve UI ayrıntısını iş kabul diliyle karıştırır.

**Daha iyi:**

~~~gherkin
Given an active member has a basket worth 100 EUR
When standard shipping is selected
Then shipping is free
~~~

İş kuralı korunur; selector ve bekleme ayrıntıları otomasyon katmanına bırakılır.

## 10.5 ATDD: Önce ortak örnek, sonra implementasyon

**Acceptance Test-driven Development (ATDD)** bir iş birliği yaklaşımıdır: Kabul davranışını geliştirme başlamadan **önce** örneklerle netleştiririz.

Basit akış:

1. Product owner iş hedefini anlatır.
2. Tester sınır, alternatif ve hata senaryolarını sorar.
3. Developer uygulama sınırlarını ve olası teknik etkileşimleri açıklar.
4. Üç taraf **beklenen örneklerde** uzlaşır.
5. Implementasyon geliştirilir.
6. Örnekler yürütülerek doğrulanır; yeni riskler ayrıca test edilir.

Bu akış “tester testleri tek başına yazdı, diğerleri onayladı” yaklaşımından farklıdır. **Ortak anlayış** üretir.

### TDD, ATDD ve BDD birbirinin aynısı mı?

Hayır.

| Yaklaşım | Ana vurgu | Basit örnek |
|---|---|---|
| **TDD** | Küçük kod davranışını testle yönlendirmek | Önce `calculateShipping` için başarısız unit test yazmak |
| **ATDD** | İş kabulünü somut örneklerle önce netleştirmek | 99/100 €, active/inactive kararlarında uzlaşmak |
| **BDD** | Beklenen davranışı ortak, anlaşılır dille tanımlamak | Given/When/Then senaryolarıyla paydaş iletişimi |

Pratikte birlikte kullanılabilirler. **BDD = Cucumber** demek yanlıştır; Cucumber davranış senaryolarını çalıştırmada kullanılabilen bir araçtır. Aracın bulunması, otomatik olarak iyi iş birliği yapıldığı anlamına gelmez.

## 10.6 Tam örnek: Belirsizliği çözen konuşma

Tester: “100 € tam eşik kabul mü?”  
Product owner: “Evet, **100 dahil**.”

Tester: “Kupon uygulandıktan sonra toplam 98 € olursa ücretsiz kargo kalır mı?”  
Product owner: “Henüz karar vermedik.”

Developer: “Sistem şu an indirimsiz toplamı kullanıyor.”

Bu son bilgi **kuralın doğruluğu** değildir; yalnız mevcut implementasyon gözlemidir.

Tester'ın iyi yaklaşımı:
- Soruyu **açık karar** olarak kaydet;
- Farklı alternatifleri ve müşteri etkisini örnekle;
- Product owner kararı geldikten sonra AC ve testleri güncelle;
- Karar verilmeden “Pass” sonucuyla belirsizliği kapatma.

Bu, testçi mühendisliğinin temel becerisidir.

## 10.7 Kabul testlerinin sınırı

Kabul kriterleri güçlüdür ama bütün ürünü kapsamaz.

AC yalnız sepet kargo ücretini anlatıyorsa:
- Başka hesabın sepetine erişim;
- Ani ağ kopması;
- Performans ve accessibility;
- Paralel request'lerde veri tutarlılığı;

hala ayrıca risk temelli değerlendirme gerektirebilir.

**Acceptance başarılı = bütün kusurlar sıfır** değildir. Kabul testleri, üzerine uzlaşılan iş hedefinin belirli örnekleri için kanıttır.

## 10.8 Alıştırma — yeni story'ye uygula

Story:

> “Bir kullanıcı olarak teslim edilmiş siparişimi iade etmek istiyorum.”

**Görev:**
1. Üç açık soru yaz.
2. Son gün kuralı “14 takvim günü dahil” olarak onaylanırsa iki kabul örneği yaz.
3. Bir negative state örneği yaz.

**Örnek çözüm:**

**Açık sorular:** Teslim tarihinin hangi timezone'u geçerli? Kısmi iade mümkün mü? Aynı siparişe iki açık iade açılabilir mi?

**İki sınır örneği:**
- Given sipariş DELIVERED ve 14. gün; When iade istenir; Then talep kabul.
- Given sipariş DELIVERED ve 15. gün; When iade istenir; Then talep reddedilir, yeni kayıt oluşmaz.

**Negatif state:** Given sipariş CREATED; When iade istenir; Then talep reddedilir, state değişmez.

Bu bölüm tamamlandığında yalnız bir “teknik adı” öğrenmedik. **Belirsiz iş isteğini ortak, test edilebilir davranışa dönüştürme** sürecini kurduk.

## I1'i pekiştirme

Sonraki dosya zorunlu bir sınav dersi değildir. Orada tek bir örnek üzerinden bütün teknikleri bir araya getirip isteğe bağlı İngilizce mülakat ve sertifika pratiğini **ana anlatımdan ayrı** yapacağız.

→ [I1 Uygulama, Tekrar ve Mülakat Çalışması](08-i1-practice-and-interview-companion.md)
