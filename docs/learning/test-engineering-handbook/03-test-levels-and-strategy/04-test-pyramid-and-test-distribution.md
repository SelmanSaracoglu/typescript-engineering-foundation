# 14. Test Pyramid — Doğru testi doğru yerde tutmak

> **Temel soru:** Aynı özelliğin 50 UI testi geçiyorsa neden bu yine de kötü bir test stratejisi olabilir?

Önceki derste component, integration, system ve acceptance düzeylerini tanıdık. Şimdi bu seviyelerde **hangi testten kaç tane ve hangi amaçla** tutacağımızı düşüneceğiz.

## 14.1 Önce bir problem

MiniShop ekibinin ücretsiz kargo kuralı değişti:

> ACTIVE üyeler için STANDARD gönderim, **indirim sonrası 100 € ve üzeri** sepetlerde ücretsiz.

Ekip bütün testleri browser üzerinden otomatikleştirmiş olsun:

1. Browser aç;
2. kullanıcıyı login yap;
3. ürün ekle;
4. sepete git;
5. kupon uygula;
6. kargo ücretini gör;
7. browser'ı kapat.

Bu süreci **99,00; 99,50; 99,99; 100,00; 100,01; 101,00...** gibi çok sayıda veriyle tekrar ediyorlar.

Testler önemli olabilir; fakat basit bir matematik kuralı için her seferinde browser, login, DB ve network bağımlılıklarını çalıştırmak **fazla maliyetli** olabilir.

Hata çıktığında soru büyür:

> “Yanlış hesaplama mı, bozuk test verisi mi, login timeout mu, selector mı, API kesintisi mi?”

Buradaki sorun yalnız test sayısı değil, **yanlış sınırda çok fazla aynı kontrolün yapılmasıdır**.

## 14.2 Test pyramid ne anlatır?

Test pyramid, testlerin kapsam ve işletme maliyetine göre dağılımını düşünmek için kullanılan bir **modeldir**.

~~~text
                 /   E2E / UI    \
                /---------------\
               /  Service/API &  \
              /   Integration    \
             /-------------------\
            /  Unit / Component   \
           /______________________\
~~~

Basit yorum:
- **Altta** çok sayıda küçük, hızlı, izole ve kolay teşhis edilen test;
- **Ortada** bileşenler/servisler arasındaki etkileşimleri hedefleyen test;
- **Üstte** az sayıda, geniş ve gerçekçi ama daha pahalı kullanıcı/sistem akışı.

**Bunun sayısal bir kanunu yok.** “%70 unit, %20 integration, %10 E2E” gibi oranlar bazı ekiplerin tercihi olabilir ama evrensel kural değildir. Ürünün mimarisi, riskleri ve test edilebilirliği dağılımı değiştirir.

### Pyramid, beş test seviyesiyle aynı şey mi?

Hayır. Pyramid, test dağılımının **soyut modeli**dir; katman adları değişebilir. Sektörde “unit/service/UI”, “component/integration/E2E” veya başka adlandırmalar bulunur. API bir **arayüzdür**; zorunlu olarak tek bir seviyede olmak zorunda değildir.

## 14.3 Neden alt düzey kontroller daha hızlıdır?

Kargo fonksiyonunu doğrudan çağıran bir component testini düşün:

~~~typescript
expect(shippingFee(true, 100, false)).toBe(0);
~~~

Bu testin değerlendirmesi basittir. Yanlış sonuç aldığında şu dar hipotezlerden başlayabiliriz:
- Kural yanlış uygulanmış;
- Testin expected value'su yanlış;
- Input/veri dönüşümü yanlış.

Browser'lı E2E testinde çok daha fazla parça devrededir. **Daha geniş gerçekçilik**, çoğu zaman **daha yüksek işletme ve bakım maliyeti** getirir.

| Özellik | Küçük component testi | Integration testi | Geniş UI E2E |
|---|---|---|---|
| Genellikle hız | Çok hızlı | Orta | Daha yavaş |
| Başarısızlığın nedeni | Daha kolay yerelleştirilir | Sınır etkileşiminde aranır | Birçok olası kaynak |
| Bağımlılık | Az | Orta | Çok |
| Kanıtın gücü | Tek davranış | Parçalar arası sözleşme | Gerçekçi kullanıcı akışı |
| Tek başına göremediği | Network, DB, UI | Tam kullanıcı deneyimi | Çok sayıda küçük kural varyasyonunu ekonomik biçimde sınamak |

Bu tablo mutlak değildir. İyi tasarlanmış bazı integration testleri de son derece hızlı olabilir; gereksiz browser UI animasyonları testleri yavaşlatabilir.

## 14.4 Örnek: 30 benzer UI testini nasıl yeniden dağıtırız?

Şu riskleri ayrı ayrı yazalım:

| Risk | En az maliyetle nerede görünür? | Ek test gerekebilir mi? |
|---|---|---|
| 100 € sınırı yanlış | Component: 99,99/100/100,01 | UI'da bir tutar gösterme testi |
| ACTIVE bilgisi yanlış okunuyor | Component integration: service ↔ repository | API/system düzeyinde bir akış |
| Kargo ücretinin UI'ya iletilmesi yanlış | System/API ve seçilmiş UI akışı | Evet, farklı sınır |
| Dış sağlayıcıya yanlış kargo kodu gidiyor | System integration | Sağlayıcı sandbox/contract kontrolü |
| Kullanıcı ödeme akışını tamamlayamıyor | Seçilmiş E2E | Evet, gerçek kullanıcı yolculuğu |

**İyileştirme sırası:**
1. 30 UI testinin **hangi iş risklerini** tekrar ettiğini belirle.
2. Yalnız hesaplama varyasyonlarını küçük deterministik testlere taşı.
3. DB ve service sınırı için seçilmiş integration testleri tut.
4. UI'da gerçekten **UI'ya özgü** riskleri kontrol et: doğru gösterim, navigation, seçili kargo tipinin aktarımı.
5. Gerçek dış sağlayıcı etkileşimini uygun integration koşulunda doğrula.
6. Önce/sonra **test süresi, false failure ve yakalanan kusur türlerini** karşılaştır.

**Dikkat:** “Her şeyi unit'e taşı” da yanlıştır. İyi çalışan bir fonksiyon, UI'nın yanlış para formatı göstermediğini veya order service'in yanlış kargo tipini yollamadığını kanıtlamaz.

## 14.5 Failure localization neden önemlidir?

İki test aynı gün fail oldu:

- **Component test:** `shippingFee(true, 100, false)` beklenen 0 yerine 5 verdi.
- **E2E test:** Login sonrası checkout ekranı yüklenmedi.

İlk testte failure'ın kaynağı daha dar. İkinci testte:
- login mi bozuk?
- network mü?
- order API mı?
- test data mı?
- browser selector mü değişti?

Testleri doğru katmanlarda dağıtmanın değeri sadece hız değil, **debugging süresini kısaltmak ve hata sinyalini anlaşılır kılmaktır**.

Aynı zamanda üst düzey testler “alt testlerde hiç görülemeyen gerçek birleşim sorunlarını” keşfeder. Bu yüzden **en az ama anlamlı geniş akışlar** korumalıyız.

## 14.6 Pyramid dışında iki bakış daha

Bazı ekipler integration testlerine daha fazla ağırlık verir; örneğin dağıtık servislerin etkileşimi kritik olabilir. **Testing trophy**, integration testlerinin değerini öne çıkaran alternatif bir dağılım fikridir. Çok sayıda manuel UI testi ve az sayıda küçük otomatik test bulunan **inverted pyramid / ice cream cone** ise sıklıkla bakım ve geri bildirim maliyetini artırır.

Bunları birbirini dışlayan ideolojiler gibi kullanma. Sorulması gereken:

> “Bu ürünün kritik kusurlarını hangi test sınırı, yeterli gerçekçilikle ve kabul edilebilir maliyetle gösterebilir?”

### Her testin düşük katmanda olması her zaman mümkün mü?

Hayır. Kullanılabilirlik, gerçek üçüncü taraf timeout'u, üretime benzer performans, erişilebilirlik veya dağıtık işlem tutarlılığı gibi sorunlar daha bütünleşik gözleme ihtiyaç duyabilir.

## 14.7 Agile Testing Quadrants — başka bir sınıflandırma

Pyramid “**testleri sistemin nerelerinde dağıtıyoruz?**” sorusuna yardımcı olur. Agile testing quadrants ise **test faaliyetinin kime ve hangi amaca hizmet ettiğini** anlamamızı sağlar.

İki eksen:
- **Business-facing ↔ Technology-facing**;
- **Support the team ↔ Critique the product**.

| Quadrant | Bakış | Tipik örnek |
|---|---|---|
| **Q1** | Teknik, geliştirmeyi destekler | Component ve component integration testleri |
| **Q2** | İş odaklı, geliştirmeyi destekler | Acceptance examples, user story testleri, iş davranışına yönelik API örnekleri |
| **Q3** | İş odaklı, ürünü eleştirel değerlendirir | Exploratory, usability, UAT |
| **Q4** | Teknik, ürünü eleştirel değerlendirir | Performance, security, smoke ve diğer non-functional kontroller (usability hariç) |

**Quadrant, test level değildir.** Belirli bir testin farklı amaçlara katkısı olabilir. Amaç, takımın yalnız teknik doğruluğa veya yalnız kullanıcı demosuna odaklanıp diğer kalite boyutlarını unutmasını önlemektir.

### Aynı kargo özelliğini dört quadrant'ta düşün

- **Q1:** Ücret hesaplama fonksiyonu doğru mu?
- **Q2:** Product owner ile 99/100 € kabul örneklerinde anlaştık mı?
- **Q3:** Kullanıcı kuponu değiştirdiğinde ücret mesajını anlayabiliyor mu?
- **Q4:** Yoğun istek altında checkout kabul edilebilir yanıt süresini koruyor mu?

Bu, testleri piramit katmanlarıyla yeniden adlandırmak değil; **farklı kalite sorularını görünür tutmak** demektir.

## 14.8 Alıştırma — iki testin yerini değiştir

Bir ekipte aşağıdaki testler var:
- **T1:** Browser ile 20 farklı sepet tutarı ve üyelik kombinasyonunu test ediyor.
- **T2:** Kargo servisinin dış lojistik API'sine doğru kod gönderdiğini test ediyor.
- **T3:** Ürün sayfasında ücretsiz kargo mesajının doğru göründüğünü test ediyor.

**Görev:** Hangisini alt düzeye taşıyabilirsin, hangilerini korursun? Neden?

**Örnek çözüm:**
- T1'in **iş kuralı varyasyonları** component testlerine ayrılabilir; seçilmiş bir–iki bütünleşik doğrulama korunur.
- T2 harici interface riskini kontrol ettiği için system integration sınırında anlamlıdır.
- T3 UI'ya özgü görünürlük ve doğru mesaj riskini kontrol ettiği için belirli UI sistem akışında kalabilir.

**Kazanım:** Test dağılımını “alışkanlıkla E2E yazmak” yerine **risk, hız ve failure localization** üzerinden tartabiliyoruz.

## Sonraki ders

Testlerimizi doğru seviyelere dağıttık. Ürün değiştiğinde hangilerini yeniden çalıştırmalı, hangilerini yalnız belirli düzeltme için kullanmalıyız?

→ [15. Confirmation, Regression & Maintenance](05-confirmation-regression-and-maintenance.md)
