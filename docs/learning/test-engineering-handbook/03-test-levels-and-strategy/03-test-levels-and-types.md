# 13. Test Levels & Types — Neyi, hangi sınırda test ediyoruz?

> **Temel soru:** Bir kargo ücretinin doğru hesaplandığını kanıtlamak için neden hem küçük bir fonksiyon testi hem de gerçekçi bir alışveriş akışı gerekebilir?

I1'de veri sınıfları, sınırlar ve karar tablolarıyla **hangi durumların test edileceğini** öğrendik. Şimdi ikinci soruya geçiyoruz: **Bu testleri sistemin neresinde çalıştırmalıyız?**

## 13.1 Aynı hata, farklı test sınırları

MiniShop'un kargo kuralı:

> ACTIVE üyeler, indirim sonrası 100 € ve üzeri sepette STANDARD kargoyu ücretsiz kullanır. EXPRESS her zaman ücretlidir.

Bu kural birkaç parçada uygulanıyor olsun:

~~~text
Browser / Mobile UI
       ↓
Order API
       ↓
Shipping Service
       ↓
Member Data / Database
       ↓
External Delivery Provider
~~~

Bir tester şu soruları ayrı ayrı sorabilir:

- Shipping Service içindeki hesaplama doğru mu?
- Service, veritabanından doğru üyelik durumunu okuyor mu?
- API doğru response ve statüyü döndürüyor mu?
- Browser kullanıcıya doğru tutarı gösteriyor mu?
- Dış kargo sağlayıcısına doğru tutar ve seçenek gönderiliyor mu?

Bütün sorular tek bir “kargo özelliği”ne ait olsa da **aynı test nesnesini** değerlendirmiyor.

**Test level**: Testin hedeflediği iş ürünü/sistem sınırını ve amacını açıklar.  
**Test type**: Hangi kalite veya analiz boyutuyla ilgilendiğimizi anlatır.

Bu iki terimi birbirine karıştırmamak çok önemlidir.

## 13.2 İlk seviye: Component testing (Unit)

Bir fonksiyonu düşünelim:

~~~typescript
function shippingFee(active: boolean, total: number, express: boolean): number {
  if (express) return 10;
  if (active && total >= 100) return 0;
  return 5;
}
~~~

Component testleriyle farklı iş kurallarını **küçük ve mümkün olduğunca izole** biçimde sınayabiliriz:

| Girdi | Expected |
|---|---:|
| active=true, total=99, express=false | 5 |
| active=true, total=100, express=false | 0 |
| active=false, total=120, express=false | 5 |
| active=true, total=120, express=true | 10 |

**Kazancı:** Hızlı çalışır; hata varsa kök nedeni dar alanda araştırırız. BVA ve decision table gibi tekniklerle çok sayıda varyasyonu ekonomik biçimde kontrol edebiliriz.

**Sınırı:** Doğru fonksiyon, API'nin doğru kullanıcıyı okuduğunu veya UI'nin bu tutarı doğru gösterdiğini kanıtlamaz.

“Component” bazen frontend'de tek bir UI bileşeni anlamında da kullanılır. Buradaki **component testing** kavramı daha geneldir; test sınırı bir işlev, modül veya uygun biçimde izole bileşen olabilir.

## 13.3 Component integration testing

Shipping Service doğru ücret hesaplıyor. Ancak Membership Repository, veritabanındaki ACTIVE statüsünü yanlış eşliyor ve her kullanıcıyı ACTIVE gösteriyor olsun.

Tek başına `shippingFee` testi geçer. Yine de ürün yanlış kargo ücreti hesaplayabilir.

**Component integration testi**, iç bileşenler arasındaki **arayüz ve etkileşimi** inceler:

~~~text
Order Service ↔ Membership Repository ↔ Database adapter
~~~

Sorular:
- Service üyelik bilgisini doğru alıyor mu?
- Veri bulunmazsa nasıl davranıyor?
- DB timeout'unda hata güvenilir biçimde taşınıyor mu?
- Bir işlem başarısızsa yanlış kayıt oluşuyor mu?

Bu düzeyin amacı, **bileşenlerin ayrı ayrı doğru olup birlikte yanlış davranması** riskini yakalamaktır.

## 13.4 System testing

Şimdi bütün MiniShop ürününü bir sistem olarak düşünelim.

Örneğin:
- Kullanıcı oturum açar;
- Sepete ürün ekler;
- Siparişi oluşturur;
- Kargo seçeneğini görür;
- Ödeme tamamlanır.

**System testing**, tüm sistemin belirtilen fonksiyonel ve fonksiyonel olmayan davranışını değerlendirir. Testin kullanıcı arayüzü üzerinden yürütülmesi şart değildir. Bir sistemin API'si üzerinden yapılan test de **sistem düzeyinde** olabilir; önemli olan test ettiğimiz sınır ve amaçtır.

**Kazancı:** Birden fazla gerçek ürün bileşeninin birlikte beklenen sonucu vermesine kanıt sağlar.

**Sınırı:** Test başarısız olduğunda neden UI mı, API mı, veri mi, ağ mı sorusunun yanıtı daha zor olabilir. Testin yürütülme maliyeti de genellikle büyür.

## 13.5 System integration testing

Ürün kendi içinde doğru çalışıyor ama dış kargo sağlayıcısına yanlış servis kodu gönderiyor olsun:

MiniShop: STANDARD = 5 €  
Delivery Provider: “EXPRESS” kodu aldığı için 10 € ücret hesaplıyor.

**System integration testing**, bir sistemin **harici sistemlerle** etkileşimini hedefler.

Örnek dış sınırlar:
- ödeme sağlayıcısı;
- lojistik/kargo servisi;
- harici kimlik doğrulama sağlayıcısı;
- üçüncü taraf envanter/sipariş sistemi.

**Önemli ayrım:** Shipping Service ile şirketin kendi DB adapter'ı arasındaki sınır component integration olabilir; şirketin ürününün dış lojistik sağlayıcısıyla etkileşimi system integration'dır. İkisine de günlük dilde “integration test” denebilir ama **sınırı açık yazmak** gerekir.

Harici servisin sandbox ortamı gerçek üretim davranışını her yönden temsil etmeyebilir. Ne test ettiğimizi ve neyi test etmediğimizi belirtmeliyiz.

## 13.6 Acceptance testing

Bütün teknik parçalar doğru çalışsa bile iş sahibi şu soruyu sorar:

> “Bu özellik müşteriye söz verdiğimiz davranışı sağlıyor mu ve kabul edilebilir mi?”

**Acceptance testing**, ürünün ilgili iş, kullanıcı, sözleşme veya operasyonel ihtiyaçlara göre kabulünü destekleyen kanıt üretir.

Örnekler:
- **User Acceptance Testing (UAT):** Ürün sahibinin onaylı iş senaryolarıyla hedefi doğrulaması;
- **Operational Acceptance:** Operasyon ekibinin yedekleme, geri alma veya izleme gereksinimlerini kontrol etmesi;
- **Contractual / Regulatory Acceptance:** Sözleşmesel veya düzenleyici koşullar;
- **Alpha / Beta:** Hedef kullanıcı gruplarından gerçek kullanım bağlamında geri bildirim.

**Acceptance = mutlaka manuel UI testi** değildir. Önemli olan kabulün amacı ve kriterleridir.

## 13.7 Beş seviyeyi birlikte görelim

| Seviye | Merkezdeki soru | Örnek |
|---|---|---|
| Component | Küçük birim kendi kuralını doğru yapıyor mu? | Kargo ücreti fonksiyonu |
| Component integration | İç bileşenlerin sınırı doğru mu? | Service ↔ member repository |
| System | Ürün bir bütün olarak doğru mu? | Checkout iş akışı |
| System integration | Dış sistem bağlantısı doğru mu? | MiniShop ↔ lojistik sağlayıcı |
| Acceptance | Ürün amaçlanan iş/kullanıcı ihtiyacını karşılıyor mu? | Onaylı ücretsiz kargo kabul örnekleri |

Bu seviyeler **kaliteyi ölçmenin beş ayrı yarışı** değildir. Aynı iş kuralının farklı risklerini farklı sınırlarla kanıtlamaya yarar.

## 13.8 API Testing ve E2E neden ayrı birer seviye olmak zorunda değil?

Mülakatlarda sıkça “Unit, API, E2E” diye üç katman sayılır. Bu kullanım pratik olabilir ama açıklaması eksik kalabilir.

**API testing**, testin **hangi arayüz üzerinden** yürütüldüğünü anlatır. Tek başına test level belirlemez.

- İzole endpoint handler'ı sınadığında component davranışını kontrol ediyor olabilirsin.
- API çağrısı gerçek service+DB'yi çalıştırıyorsa integration hedefin olabilir.
- Tam ürünün dış sözleşmesini test ediyorsan system-level davranışı gözlüyor olabilirsin.
- Partner API uyumluluğu için dış sistemle konuşuyorsan system integration olabilir.

**E2E (End-to-End)** ise birden çok parçadan geçen geniş bir iş akışını anlatır. Browser UI içeriyor olabilir ama **UI şart değildir**. API'den başlayan bir sipariş oluşturma–ödeme–kayıt akışı da E2E niteliğinde olabilir.

Bu nedenle iyi bir test açıklaması sadece “API test yazdım” demez:

> “Gerçek order service ve test veritabanıyla checkout'un sipariş durumunu doğruladım; harici ödeme sağlayıcısı bu testte simüle edildi.”

Bu cümle **hangi gerçek sınırların test edildiğini**, **hangilerinin edilmediğini** gösterir.

## 13.9 Test type başka bir boyuttur

Test type'ı seviyeden ayıralım:

| Type | Örnek soru |
|---|---|
| **Functional testing** | Kullanıcı gerçekten ücretsiz kargoya hak kazanıyor mu? |
| **Non-functional testing** | Aynı hesaplama yoğun kullanımda yeterince hızlı ve güvenilir mi? |
| **Black-box testing** | İç kodu görmeden şartnameye uygun davranış var mı? |
| **White-box testing** | İç kodun hangi dalları/akışları yürütüldü? |

Bunlar birbirini mutlaka dışlayan tek seçimli etiketler değildir: Bir component testi **functional ve white-box**, bir system testi **non-functional ve black-box** olabilir.

Ayrıca “regression” değişiklik sonrası **eski davranışı koruma amacı**dır; burada tanımlanan beş seviyeden ayrı bir seviye değildir.

## 13.10 Çalışılmış karar: Yetkilendirme kuralı

Kural: “Bir kullanıcı yalnız kendisine ait siparişi okuyabilir.”

- **Component:** `canView(actor, owner)` mantığı.
- **Component integration:** Order Service, kimlik bilgisini güvenilir token/context'ten alıyor ve gerçek ownership verisiyle eşliyor mu?
- **System/API:** A oturumuyla B siparişi istenirse beklenen ret ve **veri sızıntısının olmaması**.
- **UI:** Başka hesabın “görüntüle” düğmesinin gizlenmesi kullanıcı deneyimi açısından yararlı, ancak **backend authorization kanıtı değildir**.
- **Acceptance:** İş sahibinin onayladığı gizlilik davranışına uyum.

Yalnız component testinin geçmesi authorization entegrasyonunu garanti etmez; yalnız UI düğmesini gizlemek de güvenlik sağlamaz.

## 13.11 Alıştırma

Yeni özellik: “Kullanıcı siparişine ait PDF faturayı indirebilir.”

**Görev:** Aşağıdaki soruları hangi seviyede test etmek daha anlamlı olabilir?

1. PDF'deki toplam hesaplaması doğru mu?
2. Fatura servisi doğru sipariş kayıtlarını okuyabiliyor mu?
3. Müşteri “Faturayı indir” işleminden sonra geçerli belge alıyor mu?
4. PDF üretimi dış bir imzalama servisine bağlıysa arayüz doğru mu?
5. Fatura iş biriminin gerekli alanlarını taşıyor mu?

**Örnek değerlendirme:**
1. Component hesaplama testi;
2. Component integration;
3. System;
4. System integration;
5. Acceptance (gerekli koşulların kaynağı iş/regülasyon kararları olabilir).

Aynı doğrulama birden fazla seviyede anlamlı olabilir. **Neden o sınırda test ettiğini açıklamak**, etiketi ezberlemekten önemlidir.

## Sonraki ders

Seviyeleri biliyoruz. Ama bütün iş kurallarını her seviyede tekrar edersek yavaş ve zor bakılan bir test suite oluşabilir.

→ [14. Test Pyramid & Distribution](04-test-pyramid-and-test-distribution.md)
