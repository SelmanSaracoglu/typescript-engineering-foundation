# 11. Yazılım yaşam döngüsünde testing nerede başlar?

> **Temel soru:** Aynı özelliği geliştirirken testleri ne zaman ve nasıl düşünmek gerekir?

I1'de testin yalnızca kodu çalıştırmak olmadığını, gereksinimden başlayıp beklenen sonuç ve kanıt ürettiğini öğrendik. Şimdi bu işi gerçek bir geliştirme sürecine yerleştireceğiz.

## 11.1 Bir değişiklik talebinin yolculuğu

MiniShop ürününde şu iş isteği var:

> “Aktif üyeler, indirim sonrası sepet toplamı 100 € veya üzerindeyse standart kargoyu ücretsiz kullanabilsin.”

Geliştirme sürecini kabaca düşünelim:

1. Ürün sahibi iş ihtiyacını açıklar.
2. Ekip iş kurallarını ve sınırlarını netleştirir.
3. Tasarım ve gerekli servis değişiklikleri belirlenir.
4. Developer kodu yazar.
5. Testler uygulanır ve sorunlar düzeltilir.
6. Ürün yayımlanır ve gerçek kullanım izlenir.

İlk bakışta **test sadece 5. adım** gibi görünüyor. Oysa iyi bir tester 2. adımda şu soruyu sorabilir:

> “100 € eşiği kupon uygulanmadan önce mi, sonra mı hesaplanıyor?”

Bu soru kod yazılmadan cevaplanırsa yanlış kuralın geliştirilmeye başlanması önlenir. **Test düşüncesi, test execution'dan daha erken başlar.**

## 11.2 SDLC neyi düzenler?

**Software Development Lifecycle (SDLC)**, yazılımın gereksinimden bakıma kadar nasıl geliştirildiğini ve teslim edildiğini düzenleyen yaklaşımdır. Farklı modeller testin amacını değil, **geri bildirimin ritmini, ekip iş birliğini ve test faaliyetlerinin ne zaman görünür hale geldiğini** etkiler.

| Model / yaklaşım | Nasıl işler? | Testçinin dikkat edeceği nokta |
|---|---|---|
| **Sequential / Waterfall** | Aşamalar büyük ölçüde sıralı ilerler | Şartname ve tasarım incelemesini kod sonrasına bırakma |
| **V-Model** | Geliştirme iş ürünleriyle ilişkili test faaliyetleri birlikte planlanır | Her doğrulama seviyesinin hangi kaynağa dayandığını açık tut |
| **Iterative / Incremental** | Ürün küçük parçalar halinde büyür | Her yeni parçayla eski işlevler de etkilenebilir |
| **Agile** | Kısa geri bildirim döngüleri ve ekip iş birliği | Acceptance examples, hızlı test, sürekli yeniden değerlendirme |

Bu bir “hangisi her zaman daha iyi?” yarışması değildir. Örneğin sözleşme ve izlenebilirlik yükümlülüğü ağır bir üründe planlama ve review disiplini önemli olabilir; hızlı değişen üründe kısa geri bildirim döngüsü özellikle değerlidir.

### V-Model'i yanlış anlamayalım

V-Model, “testçiler sağ tarafa geçene kadar hiçbir iş yapmaz” anlamına gelmez. Sol tarafta gereksinim ve tasarım oluşurken ilgili testlerin **test basis'i, amacı ve tasarımı** düşünülebilir; sağ tarafta ürün parçaları çalıştırıldıkça dinamik doğrulama yapılır.

Örnek:
- İş gereksinimi → acceptance hedefi;
- Sistem gereksinimi → system test düşüncesi;
- Bileşen tasarımı → ilgili component/integration test düşüncesi.

Bunları **mutlak bire bir şablon** değil, erken izlenebilirlik ve doğrulama planlama aracı olarak ele al.

## 11.3 Agile olmak “belgesiz ve testsiz” olmak değildir

MiniShop ekibi iki haftalık iterasyonlarla çalışıyor olsun.

**Sprint 1:** Standart kargo hesabı geliştirilir. Tester 99/100 € örneklerini product owner ile netleştirir; developer küçük hesaplama testlerini hazırlar; ürün akışı doğrulanır.

**Sprint 2:** Express gönderim eklenir. Yeni kural, önceki “ücretsiz kargo” davranışını etkileyebilir. Yalnız yeni Express senaryosu değil, **eski standart kargo örnekleri de** gözden geçirilir.

Burada farklı faaliyetler sürekli tekrar eder:
- requirement netleştirme;
- test design;
- küçük testleri çalıştırma;
- değişikliğin etkisini inceleme;
- beklenmeyen sonucu araştırma;
- regression.

**Önemli:** Agile ekiplerin birim testleri vardır diye kabul testleri veya review'lar gereksizleşmez. Tersine roller daha sık konuşmayı gerektirebilir.

## 11.4 “Test-first” yaklaşımları ayıralım

I1'de ATDD'yi gördük. Şimdi üç terimin geliştirme sürecindeki yerini ayıralım.

### TDD — Test-Driven Development

Küçük bir kod davranışı için döngü:

1. Henüz karşılanmayan beklentiyi açıklayan küçük bir test yaz.
2. Testin beklenen nedenle başarısız olduğunu gör (**red**).
3. Testi geçirecek kadar kod yaz (**green**).
4. Davranışı koruyarak kodu sadeleştir (**refactor**).

Örneğin ücret hesaplayıcı için önce “100 € eşiğinde sonuç 0 € olmalı” testi yazılabilir.

**TDD'nin gücü:** hızlı teknik geri bildirim ve test edilebilir küçük tasarım.  
**Sınırı:** Yanlış iş kuralını test etmişsek red-green-refactor süreci bizi **doğru ürüne** götürmeyebilir.

### ATDD — Acceptance Test-Driven Development

Product owner, tester ve developer önce **işe ait kabul örneklerinde** anlaşır.

Örneğin:
- ACTIVE, STANDARD, 100 € → FREE;
- INACTIVE, STANDARD, 120 € → PAID;
- ACTIVE, EXPRESS, 120 € → PAID.

Sonra bu anlaşmaya uygun ürün geliştirilir. ATDD, **iş beklentisinde ortaklaşma** yönüyle TDD'den ayrılır.

### BDD — Behavior-Driven Development

Davranışı ortak, anlaşılır bir dille tarif ederek geliştirme ve doğrulamayı yönlendirir. Given/When/Then sık kullanılır ama tek biçim değildir.

**BDD = Cucumber aracı** demek değildir. Araç, iyi konuşulmamış acceptance criteria'yı kendiliğinden düzeltemez.

| Yaklaşım | Önce sorulan soru |
|---|---|
| TDD | Küçük kod parçası hangi davranışı göstermeli? |
| ATDD | Kullanıcı/iş sahibi hangi somut örneği kabul edecek? |
| BDD | Beklenen davranışı ekip birlikte nasıl net ifade edecek? |

Üçü aynı projede birlikte kullanılabilir; hiçbiri diğerlerinin kapsadığı bütün riskleri otomatik kapatmaz.

## 11.5 Shift-left, DevOps ve continuous testing

**Shift-left testing**, uygun kalite faaliyetlerini daha erken gerçekleştirmektir.

MiniShop'ta:
- story hazırlığında sınır örneklerini tartışmak;
- tasarım aşamasında yanlış yetki varsayımını incelemek;
- API sözleşmesini bağımlı ekiplerle erkenden netleştirmek;
- küçük kod davranışını entegrasyona gitmeden doğrulamak.

Bunlar “bütün testler erkende tamamlanmalı” demek değildir. Gerçek performans, son kullanıcı deneyimi veya dış sistem etkileşimi, ancak belirli bir bütünleşme seviyesinde anlamlı şekilde ölçülebilir.

**DevOps**, geliştirme ile operasyon arasında teslim, güvenilirlik ve geri bildirim sorumluluklarını yakınlaştırır. **CI (Continuous Integration)** değişikliklerde otomatik build/test kontrolleriyle hızlı sinyal sağlar. **CD** teslimi/dağıtımı düzenler; her pipeline'ın production'a otomatik deployment yaptığını varsayma.

**Continuous testing** tek bir uzun test suite'ini sürekli çalıştırmak değildir. Uygun testler, değişikliğin riskine ve hız gereksinimine göre yaşam döngüsünün farklı noktalarında çalıştırılır.

### CI yeşilse ürün kesin doğru mu?

Hayır. CI yalnız tanımlanan kontrollerin belirli ortamda başarılı olduğunu gösterir. Örneğin bir test ortamında ödeme sağlayıcısı simülasyonu varken gerçek sağlayıcıya ilişkin gecikme ve mapping riskleri henüz tam kanıtlanmamış olabilir.

## 11.6 Retrospective ile testing'i iyileştirmek

İki iterasyonda peş peşe şu sorun yaşandı: Tester, “100 € eşiği kupon sonrası mı?” sorusunu developer kodu bitirdikten sonra sorabildi. İki kez yeniden iş yapıldı.

İyi retrospective çıktısı, yalnız “iletişimi iyileştirelim” değildir.

**Somut aksiyon:** “Yeni fiyatlandırma story'leri geliştirmeye alınmadan önce product owner ve tester en az bir alt-sınır, eşik ve üst-sınır örneğinde anlaşacak. Sonraki iki iterasyonda yeniden açılan requirement sayısını izleyeceğiz.”

Bu, tekil defect düzeltmesinden **kalıcı süreç iyileştirmesine** geçmektir.

## 11.7 Çalışılmış karar: Aynı özellik iki farklı takımda

**Takım A:** Üç ayda bir büyük sürüm çıkarıyor. Kargo kuralı için gereksinim incelemesi, planlanan test seviyeleri ve release kabul kriterleri erken hazırlanır. Uzun entegrasyon testleri daha sonra yürütülse bile bunların **tasarımı** ertelenmez.

**Takım B:** Her gün küçük değişiklik dağıtıyor. Aynı kargo kuralı için product-owner örnekleri, hızlı component testleri, birkaç integration kontrolü ve deployment sonrası görünürlük gerekir. Hız arttıkça **deterministik ve hızlı geri bildirim** değeri yükselir.

İki takım da doğru mühendislik yapabilir. Fark, **kanıtın zamanlaması ve organizasyonu**dur.

## 11.8 Alıştırma — yeni duruma uygula

Yeni özellik: “Premium üyeler, haftada bir kez ücretsiz kargo kuponu alır.”

**Görev:** Kod yazılmadan sorulacak üç soru ve CI öncesi uygun iki erken kontrol öner.

**Örnek çözüm:**
- Sorular: “Hafta hangi timezone'da başlıyor?”, “Kullanılmamış kupon sonraki haftaya taşınır mı?”, “Üyelik haftanın ortasında iptal edilirse ne olur?”
- Erken kontroller: Product owner ile hafta başlangıcı ve quota örneklerini netleştirmek; tarih/quota iş mantığını küçük izole testlerle doğrulamak.

**Kazanım:** Testing'in yalnız son aşamaya eklenen bir kontrol değil, **ürünün karar sürecine erken katkı** olduğunu açıklayabiliyoruz.

## Sonraki ders

Bir sonraki adımımız test fikrini **kod çalıştırmadan** kullanmak: Gereksinim, tasarım ve kod incelemesiyle kusurları nasıl erken buluruz?

→ [12. Static Testing & Reviews](02-static-testing-and-reviews.md)
