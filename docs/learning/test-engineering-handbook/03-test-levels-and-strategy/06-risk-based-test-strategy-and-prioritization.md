# 16. Risk-based Test Strategy — Neyi, neden önce test ederiz?

> **Temel soru:** Release'e iki saat kaldıysa hangi testlerden vazgeçilebilir, hangileri ertelenmemelidir?

I1'de ürün riskini “yanlış davranışın ortaya çıkma ihtimali ve vereceği zarar” olarak tanımladık. I2 boyunca testin seviyesini, maliyetini ve değişiklik etkisini gördük. Şimdi hepsini bir **test stratejisi** kararında birleştireceğiz.

## 16.1 Önce gerçek bir karar problemi

MiniShop yeni kupon sistemini yayınlayacak. Kalan süre **iki saat**.

Ekipte üç test adayı var:
- **A:** Mobil ekranda kupon simgesinin hizalaması — 15 dakika;
- **B:** Başka kullanıcıya ait kuponun uygulanmasının reddedilmesi — 20 dakika;
- **C:** Ödeme timeout sonrası tekrar denemede iki kez tahsilat olup olmadığı — 45 dakika.

Sırf “en kısa testi önce bitirelim” düşüncesiyle A'dan başlamak teknik olarak kolay, fakat iş açısından yanlış olabilir.

**Risk-based testing**, test kapsamının, derinliğinin, sırasının ve kontrol faaliyetlerinin ürünün önemli risklerine göre seçilmesidir.

## 16.2 Riskin iki ayrı boyutu

**Likelihood:** Sorunun gerçekleşme olasılığı veya bu yöndeki değerlendirme.  
**Impact:** Gerçekleşirse zararının ciddiyeti.

Örneğin:

| Risk | Olasılık değerlendirmesi | Olası etki | İlk yaklaşım |
|---|---|---|---|
| R1 — duplicate ödeme | Orta | Çok yüksek | Retry/timeout, charge ve state kontrolü |
| R2 — başkasının kuponuna erişim | Orta | Yüksek | Yetki matrisi ve yan etki yokluğu |
| R3 — küçük görsel hizalama | Orta | Düşük | Seçilmiş UI kontrolü |

Puanlamak istersen göreli ölçek kullanabilirsin (örneğin 1–3). Ancak **2 × 3 = 6** gibi skor, ölçülmüş gerçek olay olasılığı değildir. Ayrıca az olası ama geri dönüşsüz bir güvenlik olayı, düz ordinal skor nedeniyle otomatik düşük öncelikli kabul edilmemelidir.

### Product risk ile project risk

İkisi de yönetilmeli fakat aynı tür olaylar değildir.

- **Product risk:** Ürün yanlış davranırsa zarar ne? Örneğin yetkisiz kullanıcı sipariş verisi görür.
- **Project risk:** Test/teslim faaliyetini ne engelliyor? Örneğin dış ödeme test ortamı kapalı; ekibin yetkisi yok.

Project risk, product risk hakkında kanıt toplama yeteneğimizi azaltabilir. Çalıştıramadığımız ödeme testini “başarılı” diye raporlamayız. **Engeli ve kalan product risk'i iki ayrı kayıt** olarak açıklarız.

## 16.3 Risk listesi nasıl oluşturulur?

İlk adım test isimleri yazmak değil, **olumsuz olayları** somutlaştırmaktır.

MiniShop için:
1. Aynı payment request yeniden gönderildiğinde iki charge oluşuyor.
2. Kullanıcı başka hesap sahibinin siparişini okuyabiliyor.
3. Kargo ücretinin alt sınırı yanlış hesaplanıyor.
4. Express teslimat yanlış sınıflandırılıyor.
5. Kupon kullanımı DB'de kaydedilmese bile UI başarılı gösteriyor.

Bu riskleri yalnız tester kendi başına çıkarmak zorunda değildir. Product owner, developer, security, operasyon ve müşteri destek bilgisi kaynak olabilir. Geçmiş defect'ler, değişen mimari ve gerçek üretim sorunları da risk tanımlarını besler.

**İyi risk ifadesi:** “Şu koşulda şu yanlış davranış olabilir; sonucu şu zarar.”  
**Zayıf risk ifadesi:** “Checkout test edilmeli.” Bu bir risk değil, test görevine benzer.

## 16.4 Riskten teste geçiş: dört adım

**Adım 1 — Riski yaz.**  
“Timeout sonrası iki ödeme alınabilir.”

**Adım 2 — Hangi olay bunu açığa çıkarır?**  
Aynı işlem kimliğiyle yeniden istek; ağ yanıtı kaybolur ama ilk ödeme gerçekte başarılı olmuş olabilir.

**Adım 3 — Hangi sınırda kanıt gerekir?**  
Tek ödeme kuralı uygulama mantığında test edilebilir; fakat dış ödeme sağlayıcısının gerçek retry davranışı da riskliyse **system integration** kanıtı gerekir.

**Adım 4 — Ne gözleyeceğiz?**  
Bir charge, tutarlı order state, uygun kullanıcıya doğru sonuç ve tekrar isteğinde güvenli davranış.

Böylece **risk → test condition → seviye → expected outcome → evidence** zinciri kurduk.

### Bir risk, birden fazla test seviyesine dağılabilir

Başka kullanıcının siparişini okuyamaması için:
- Component'te izin politikası mantığı;
- Integration'da ownership ve identity bağlamı;
- System/API'de yetkisiz request + veri sızıntısı olmaması.

Bu **gereksiz tekrar** olmak zorunda değildir. Her biri farklı failure mode'u hedefliyorsa toplam kanıt değerini artırır.

## 16.5 Risk analysis ve risk control

Riski belirlemek çalışmanın sonu değil, başlangıcıdır.

**Risk analysis:**
1. **Identification:** Hangi olumsuz olaylar mümkün?
2. **Assessment:** Hangileri hangi olasılık/etki ve belirsizliğe sahip?

**Risk control:**
1. **Mitigation:** Testle belirsizliği azaltmak; gerekiyorsa kod/tasarım/güvenlik kontrolüyle gerçek riski azaltmak.
2. **Monitoring:** Yeni defect, kullanım veya mimari değişiklikleriyle riskleri güncellemek.

**Test etmek ≠ kusuru düzeltmek.** Test olumsuz davranışı görünür yapabilir; hatanın düzeltilmesi ve yan etkilerin kontrolü ayrıca gerekir.

## 16.6 Planlamada risk nasıl kullanılır?

Küçük bir özellik için bile test planında şunların görülmesi yararlıdır:

- **Amaç:** Neye karar verebilmek için test yapıyoruz?
- **Kapsam:** Hangi davranış ve riskler dahil/hariç?
- **Yöntem:** Hangi teknikler ve test seviyeleri?
- **Kaynak/ortam:** Veri, kullanıcı, sandbox, simülasyon ve gözlem araçları.
- **Öncelik:** Hangi testler daha yüksek değer taşıyor?
- **Tamamlanma ölçütü:** Hangi kanıtlar ve hangi açık riskler release değerlendirmesine girecek?
- **Raporlama:** Sonuçları ve kararı kim inceleyecek?

Plan bir defa yazılıp unutulacak belge değildir. Ürün değişirse **test yaklaşımı da değişebilir**.

### Entry / exit düşüncesi

Örnek **entry criteria**: İlgili acceptance rules onaylı; test ortamı hazır; gerekli veri erişilebilir.

Örnek **exit criteria**: Kritik kabul örnekleri işletilmiş; açık severity-1 defect yok; kalan riskler ilgili paydaşlara iletilmiş.

Bunlar **yüzde 100 güvence** değil, test faaliyetinin başlaması/tamamlanması için açık karar koşullarıdır. Ayrıntılı tahmin yöntemleri sonraki çalışmaların konusudur; burada önemli olan **riskin karara bağlanması**dır.

## 16.7 “Önce hangi test?” için üç yaklaşım

### Risk-based prioritization

En yüksek etki/olasılık ve iş kritikliğini ele alan testler önce yürütülür. Yukarıdaki iki saat senaryosunda **B** ve **C**, genellikle **A**'dan önce gelir.

### Requirements-based prioritization

İş sahibinin kritik kabul şartlarını karşılayan testler önce. Örneğin özel müşteriler için ödeme tutarı doğruluğu, görsel renk düzeltmesinden önce olabilir.

### Coverage-based prioritization

Bir testin **ne kadar tanımlı öğeyi kapsadığına** bakılır. Fakat “aynı öğeleri tekrar tekrar görmek” bizi yanıltabilir. Bunun için **additional coverage** yararlıdır.

Örnek:

| Test | Kontrol ettiği gereksinim öğeleri |
|---|---|
| T1 | A, B |
| T2 | B, C, D |
| T3 | D, E |

**İlk adım:** T2 üç öğeyi (B,C,D) kapsıyor → önce T2.  
**Sonra:** Henüz görülmeyenler A ve E. T1 yeni A, T3 yeni E getiriyor. Önceliği risk/efor veya ürün ihtiyacıyla belirleyebilirsin. Her iki test tamamlandığında A–E öğeleri kapsanır.

**Önemli:** Additional coverage ile **kaç yeni öğeyi** kattığımızı hesaplıyoruz; bir testteki assertion sayısını veya tüm yazılımın doğruluğunu değil.

### Bağımlılıklar önceliği değiştirebilir

Çok kritik C testi ancak özel sandbox erişimi varsa çalışabiliyor. Önce test verisi ve erişimi hazırlamak gerekir. Hazır olmayan bir testi sürekli yeniden çalıştırmak veya beklemek yerine uygulanabilir alternatif kontroller yapılabilir. **Ancak gerçek sağlayıcı testi eksikse bu boşluk açık bırakılır.**

## 16.8 Residual risk: Release konuşmasını nasıl yaparız?

Testler tamamlandığında hâlâ bilinmezler bulunabilir. Buna **residual risk** (kalan risk) açısından bakarız.

Kötü rapor:

> “Tüm testler yeşil. Release yapabiliriz.”

Daha açıklayıcı rapor:

> “Kargo eşiği, üyelik kombinasyonları ve yetkisiz kupon erişimi doğrulandı. Tekrarlı ödeme için servis testi geçti, ancak harici sağlayıcı timeout senaryosu sandbox kesintisi nedeniyle tamamlanamadı. Bu riskin olası etkisi yüksek; release kararı öncesi ilgili iş/teknik sorumlularla değerlendirilmesini öneriyoruz.”

Bu yaklaşım “testçi release'e karar vermez” bahanesi değildir. Testçi **teknik öneri, kanıt ve sınırlamaları** net sunar; nihai risk kabulü yetkili paydaşın sorumluluğudur.

## 16.9 Çalışılmış örnek: İki saatlik zaman kutusu

A (15 dk), B (20 dk), C (45 dk) toplam **80 dakika**. İlk bakışta hepsi iki saate sığıyor. Ama test verisi hazırlığı, yeniden çalıştırma ve beklenmedik failure'ın araştırılması için süre gerekeceğini de düşünmeliyiz.

**Makul sıra:**
1. B — yetkisiz erişim ve data side effect;
2. C — duplicate ödeme ve sağlayıcı state'i;
3. A — görsel hizalama;
4. Kalan zamanı yeni failure, ortam engeli ve rapora ayır.

Bu sıra **evrensel zorunluluk değildir**. C'nin gerçek ödeme akışı hazırlığı daha erken başlatılabilir; parallel çalışma ve dependent test data planı sıralamayı değiştirir.

Temel ilke: **Önceliği tesadüfe veya testin kolaylığına bırakma.**

## 16.10 Alıştırma — yeni üründe öncelik seç

Dosya paylaşım servisi şu riskleri taşıyor:
- **R1:** Kullanıcı başkasının özel dosyasını indirebiliyor.
- **R2:** Dosya adı bazen yanlış hizalanıyor.
- **R3:** Büyük dosya yüklemesi sonunda dosya sessizce bozulabiliyor.

**Görev:** İlk iki test riskini seç; her biri için bir test ve hangi kanıtı gözleyeceğini yaz.

**Örnek çözüm:**
1. **R1:** A oturumuyla B'ye ait private file erişimi → sözleşmeye uygun DENY, içerik sızmaması ve kayıtların değişmemesi.
2. **R3:** Sınır büyüklüğünde dosya yükle/download → doğrulanabilir checksum ve dosya bütünlüğü; hata durumunda yanlış “success” olmaması.

R2 de kalite sorunudur; ancak veri güvenliği ve bütünlüğü açısından ilk iki riskin daha ciddi olması beklenebilir. Gerçek öncelik ürün bağlamına göre yeniden değerlendirilmelidir.

## I2'nin sonunda ne öğrendik?

Bu bölümün altı ana dersi tek mühendislik sorusuna yanıt veriyor:

> “**Hangi riski, geliştirme yaşam döngüsünün hangi anında, sistemin hangi sınırında, hangi kanıtı sağlayacak testle ele almalıyım?**”

Şimdi bunları yeni bir vaka üzerinde birleştirip isteğe bağlı İngilizce mülakat ve ISTQB Foundation pratiğine geçebiliriz.

→ [I2 Uygulama Atölyesi ve Mülakat Çalışması](07-i2-practice-and-interview-companion.md)
