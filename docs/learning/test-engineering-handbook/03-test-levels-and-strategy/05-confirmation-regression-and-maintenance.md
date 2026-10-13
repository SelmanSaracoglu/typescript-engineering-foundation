# 15. Confirmation, Regression ve Maintenance Testing

> **Temel soru:** Bir hata düzeltildikten sonra aynı testi tekrar çalıştırmak yeterli midir?

Önceki derste testlerin farklı seviyelerde farklı riskler için var olduğunu gördük. Bu derste **ürün değiştiğinde** testlerin neden ve nasıl yeniden seçildiğini öğreneceğiz.

## 15.1 Bir defect düzeltildi

MiniShop'ta onaylı iş kuralı:

> ACTIVE üyeler için STANDARD kargo, **100 € ve üstünde** ücretsizdir.

Kodda yanlışlıkla `total > 100` yazılmış. Kullanıcı sepeti tam 100 € olduğunda 5 € kargo ücreti görüyor.

Tester bunu buldu; developer karşılaştırmayı `total >= 100` olarak düzeltti.

Şimdi iki ayrı sorumuz var:

1. **Bilinen defect düzeldi mi?**
2. **Bu değişiklik daha önce çalışan başka durumları bozdu mu?**

Bu iki soru farklı test amaçlarını doğurur.

## 15.2 Confirmation testing — aynı kusur hâlâ var mı?

**Confirmation testing** (çoğu ekipte **retesting**) daha önce failure veren **belirli defect'in giderildiğini** kontrol eder.

İlk failure:
- Input: ACTIVE, STANDARD, 100 €;
- Expected: FREE;
- Actual: PAID.

Fix sonrasında aynı koşullarla tekrar deneriz:
- Input: ACTIVE, STANDARD, 100 €;
- Expected: FREE;
- Actual: FREE.

**Confirmation sonucu:** Bildirdiğimiz sorun test edilen koşulda artık görünmüyor.

Bu iyi haberdir. Ama sistemin geri kalanına dair henüz yeni kanıt üretmedik.

### Neden aynı koşullar önemli?

Başlangıç verisi, sürüm, ortam ve adımlar değişirse artık aynı defect'i doğruluyor muyuz sorusu doğar. Bazı durumlarda fix'in etkisini anlamak için yakın sınırları da denemek gerekir; yine de **“bu kusur düzeldi”** ve **“yan etki var mı?”** iddialarını ayrı tutmak faydalıdır.

## 15.3 Regression testing — neyi istemeden bozduk?

**Regression testing**, bir değişikliğin **önceden çalışan davranışları bozmadığını** araştırır.

Fix küçük görünüyor: yalnız `>` yerine `>=`. Ama servis başka kurallara bağlı olabilir:
- Pasif üye için kargo hâlâ ücretli mi?
- Express gönderim ücretli kalıyor mu?
- Kupon uygulanınca kullanılan tutar hâlâ doğru mu?
- Order API doğru tutarı kaydediyor mu?

| Test | Beklenen | Amaç |
|---|---|---|
| ACTIVE, STANDARD, 100 € → FREE | Sınırdaki eski defect düzeldi | **Confirmation** |
| ACTIVE, STANDARD, 99 € → PAID | Komşu davranış korundu | **Regression** |
| INACTIVE, STANDARD, 120 € → PAID | Üyelik kuralı bozulmadı | **Regression** |
| ACTIVE, EXPRESS, 120 € → ücretli | Express istisnası bozulmadı | **Regression** |
| Order kaydında shipping doğru | Servis etkisi bozulmadı | **Regression / integration** |

**Önemli:** Aynı test hem confirmation hem regression setinde bulunabilir; testin **amacı** ayrı tutulur. “Her retest regression'dır” diye düşünmek yanlıştır.

## 15.4 Smoke ve sanity ne demek?

Bu iki terim günlük ekip dilinde sık geçer. Katı, her organizasyonda aynı şekilde kullanılan iki resmî test seviyesi değildir.

### Smoke testing

Yeni build veya deployment sonrası sistemin **temel sağlık kontrollerini** çalıştırmak.

MiniShop smoke örnekleri:
- Uygulama açılıyor mu?
- Login temel akışı erişilebilir mi?
- Ürün listesi yükleniyor mu?
- Sipariş servisine kritik health/işlem isteği yapılabiliyor mu?

**Smoke geçti** demek “release hazır, bütün iş kuralları doğru” demek değildir.

### Sanity testing

Belirli bir değişiklikten sonra **dar ve odaklı bir çalışma alanını** hızlı kontrol etmek. Örnek: Kargo tutarı fix'i sonrası ilgili sepet gösterimi ve en kritik kargo koşullarını çalıştırmak.

Bir ekip smoke/sanity ayrımını farklı kullanıyorsa isimler yerine şu soruları netleştir:

> “Bu suite'in amacı ne? Hangi koşullarını geçtiğimizde hangi kararı verebiliyoruz?”

**Testing türü / amaç / seviye ayrımı:** Smoke, sanity ve regression etiketleri testin neden çalıştırıldığını açıklar; tek başına component veya system gibi test level değildir.

## 15.5 Maintenance testing yalnız bug fix için mi?

Hayır. Ürün ilk yayından sonra yaşamaya devam eder. **Maintenance testing** mevcut ürüne ilişkin değişiklikleri ve değişen koşulları değerlendirir.

Tetikleyiciler:
- Yeni özellik eklenmesi;
- Bir kusurun düzeltilmesi;
- Veritabanı şeması veya veri migrasyonu;
- Runtime/OS veya bağımlılık güncellemesi;
- Harici sağlayıcının API sürümünün değişmesi;
- Sistem bileşeninin emekliye ayrılması ve verinin taşınması.

**“Uygulama kodu değişmedi, o yüzden test gereksiz”** varsayımı tehlikelidir. Örneğin DB motoru güncellenince tarih hesapları veya decimal precision farklı davranabilir.

## 15.6 Impact analysis — değişiklik nereye dokunuyor?

Bir değişikliğin hangi ürün davranışlarını ve bağımlılıklarını etkileyebileceğini düşünmeye **impact analysis** deriz.

MiniShop'ta “kupon sonrası tutar hesaplama” değişti.

### Adım 1 — Doğrudan değişen alan

Sepet toplamının hangi aşamada hesaplandığı.

### Adım 2 — Dolaylı bağımlılıklar

- Kargo ücretsiz eşiği;
- Vergi hesabı;
- Ödeme tutarı;
- Siparişe kaydedilen toplam;
- Fatura;
- UI'da gösterilen fiyat.

### Adım 3 — Riskleri sırala

Ödemeden fazla para alınması, yanlış fatura oluşturulması ve ücretsiz kargo hakkının kaybı farklı önemlere sahiptir.

### Adım 4 — Uygun test sınırlarını seç

- Hesaplama varyasyonları → component;
- Order/payment mapping → integration;
- Kritik bir müşteri checkout'u → system/E2E;
- Gerçek dış ödeme sistemi etkileşimi → gerekiyorsa system integration.

### Adım 5 — Kalan boşluğu yaz

Gerçek dış sağlayıcı sandbox'ı erişilemiyorsa bu testi “pass” yapma. Ortam engelini ve test edilmemiş iş riskini ayrı kaydet.

## 15.7 Hangi regression testlerini seçelim?

Üç yaygın yaklaşım vardır:

1. **Retest all:** Bütün mevcut suite. Geniş geri bildirim sağlar fakat her değişiklikte maliyetli olabilir.
2. **Regression test selection:** Değişikliğin etki alanıyla ilişkili alt kümeyi seç.
3. **Prioritization:** Kritik iş ve kullanıcı risklerini kontrol edenleri önce çalıştır.

Bunlar farklı kararları çözer: **Ne kadar çalıştıracağız? Hangilerini önce?**

Basit bir kargo metin düzeltmesinde tüm ödeme sağlayıcı testleri çalıştırmak zorunlu olmayabilir. Ama ödeme tutarı hesaplaması değiştiğinde “sadece bu dosyada değişiklik var” diyerek diğer bileşenleri atlamak da risklidir.

### Bir failure her zaman product defect değildir

Regression testi kırıldığında olası kaynaklar:
- gerçek ürün defect'i;
- yanlış test oracle'ı;
- bozulmuş test verisi;
- test kodundaki selector veya bekleme hatası;
- ağ / dış servis / environment kesintisi.

Önce kanıtı toplar ve failure'ı yeniden üretmeye çalışırız. **Flaky test** ise aynı koşullarda tutarsız pass/fail üretebilen testtir; tekrar denemek kök nedeni çözmez. Ayrıntılı debugging I5'in konusudur.

## 15.8 Çalışılmış karar: Üç farklı değişiklik

| Değişiklik | İlk kontrol | Genişleme gerekçesi |
|---|---|---|
| 100 € sınırı `>` → `>=` | Spesifik confirmation ve sınır regression | İlgili kargo kuralları ve API mapping |
| DB decimal precision değişti | Migration doğruluğu, tutar hesaplama | Fatura/ödeme ve geçmiş kayıt tutarlılığı |
| Browser güncellendi, UI testi fail | Test selector ve browser davranışı | Ürün gerçekten mi bozuldu, yoksa test mi? |

Bunların hiçbirinde “her değişiklik için aynı 300 testi çalıştır” tek doğru strateji değildir.

## 15.9 Alıştırma — yeni probleme aktar

**Durum:** Profil sayfasındaki e-posta değiştirme hatası düzeltildi. Önceden yeni e-posta kaydediliyor fakat eski e-postaya hâlâ bildirim gidiyordu.

**Görev:**
1. Bir confirmation testi yaz.
2. İki olası regression riskini belirle.
3. Smoke kontrolünün neyi kanıtlayabileceğini tek cümleyle açıkla.

**Örnek çözüm:**
1. E-posta değişimi sonrası onaylı notification kuralına göre doğru adrese bildirim gittiğini ve yanlış adrese gitmediğini doğrula.
2. Login/hesap kurtarma akışı yeni e-postayla çalışıyor mu? Başka hesabın e-postası yanlış etkileniyor mu?
3. Smoke, uygulamanın temel erişilebilirlik/sağlık koşullarını gösterebilir; e-posta bildirimlerinin bütün sınırlarını doğrulamaz.

**Kazanım:** “Fix geçti” ve “sürümdeki risk azaldı” farklı kanıt seviyeleridir.

## Sonraki ders

Artık farklı seviyeleri, maliyeti ve değişiklik sonrası kontrolleri biliyoruz. Peki zaman sınırlıyken **hangi risk için hangi testi önce** seçmeliyiz?

→ [16. Risk-based Test Strategy](06-risk-based-test-strategy-and-prioritization.md)
