# 23. Automation Strategy — Hangi testi otomatikleştirmeli?

> **Bu dersin sorusu:** Bir testi otomatikleştirebiliyor olmamız, onu otomatikleştirmemiz gerektiği anlamına gelir mi?

I1’de doğru test koşulunu tasarladık. I2’de uygun seviyeyi seçtik. I3’te veri, izolasyon ve kanıtı güvenilir hale getirdik. Şimdi bütün bunları **otomatik çalıştırılabilen testlere** dönüştürmenin ne zaman fayda ürettiğini değerlendireceğiz.

## 23.1 Problem: Her şeyi browser'a taşımak

MiniShop ekibinin 120 manuel kontrolü var. Birisi şöyle diyor:

> “120 testin tamamını Cypress’e aktaralım. Otomasyon oranımız %100 olsun.”

Bu öneri cazip görünüyor ama bazı kontroller:
- Her sürümde tekrar ediliyor ve beklenen sonuç açık;
- Sadece yeni tasarımı keşfetmeye yönelik;
- Sürekli değişen, henüz karar verilmemiş arayüze dayanıyor;
- Küçük bir hesaplamayı test etmek için 20 browser adımı kullanıyor.

Bu testleri aynı şekilde otomatikleştirmek **değer değil, bakım borcu** doğurabilir.

**Test automation**, bir aracın yardımıyla test faaliyetlerinin yürütülmesidir; **doğru test tasarımı** ve **doğru oracle** kendiliğinden oluşmaz.

## 23.2 Otomasyona güçlü aday nasıl görünür?

Adayı değerlendirirken beş soruyu sor:

1. **Tekrarlanma sıklığı:** Bu kontrol her pull request, sprint veya release'te gerekli mi?
2. **Beklenen sonuç açıklığı:** Pass/Fail'i bağımsız, gözlenebilir biçimde belirleyebiliyor muyuz?
3. **Kararlılık:** Test edilen iş kuralı ve arayüz yeterince belirli mi?
4. **Kurulum maliyeti:** Veri, ortam, dış servis ve cleanup kontrol altında mı?
5. **Hata maliyeti:** Bu test başarısız olursa ürün açısından önemli bir riski mi ortaya çıkarır?

| Test adayı | Değerlendirme | İlk karar |
|---|---|---|
| Her sürümde kargo 100 € sınırı | Açık oracle, sık tekrar, küçük sınır | **Otomatik component test** |
| Login ve kritik checkout yolculuğu | Önemli kullanıcı riski; daha maliyetli | **Az sayıda otomatik E2E** |
| Yeni checkout tasarımının anlaşılabilirliği | İnsan algısı, keşif ve değişen ihtiyaç | **Exploratory/usability çalışması** |
| Harici ödeme sağlayıcısının değişken davranışı | Yüksek risk, ama test ortamı kontrolü gerekli | **Seçilmiş integration/contract test** |

**Kritik çıkarım:** Bir test otomasyona uygunsa bile **UI üzerinden** otomatikleştirilmesi şart değildir.

## 23.3 ROI: Bir düşünme modeli, sihirli sayı değil

Otomasyonun değerini kabaca şöyle düşünebiliriz:

**Beklenen fayda = tekrarların kazandırdığı emek + daha hızlı geri bildirim + kusuru erken bulmanın değeri.**

**Toplam maliyet = ilk geliştirme + test verisi ve ortam + sürekli bakım + false failure araştırması + çalışma altyapısı.**

Sadece iş gücü süresine bakmak yeterli değil. Örneğin 10 dakikalık manuel test ayda 20 kez yapılıyorsa otomasyondan tasarruf doğabilir. Ama her UI değişiminde iki saat bakım gerektiren test, beklenenden pahalıya gelebilir.

### Somut karşılaştırma

- **Test A:** 100 € sınır hesaplaması; basit TypeScript fonksiyonunda güvenilir ve hızlı.
- **Test B:** Aynı sınırın UI'da 30 ayrı ürünle test edilmesi; her koşuda login, sepet, loading ve selector riski.

İkisi aynı iş kuralını görünür kılıyorsa A'nın detaylı kontrolü ve B'nin yalnız seçilmiş kullanıcı görünürlüğü kontrolü daha iyi dağılım olabilir.

**Amaç otomasyon sayısını artırmak değil, en düşük kabul edilebilir maliyetle güçlü kanıt üretmektir.**

## 23.4 Automation ROI'yi bozabilen koşullar

**Belirsiz requirement:** Testin expected result'ı sürekli ürün davranışına göre değiştiriliyorsa kod otomatik ama oracle güvensizdir.

**Kırılgan selector:** CSS class değişince tüm suite kırılıyorsa ürünün gerçek davranışıyla ilgili olmayan bakım yükü var.

**Paylaşılan state:** Bir testin ürettiği siparişi başka test kullanıyorsa zamanla flaky sonuçlar oluşur.

**Kontrolsüz dış servis:** Demo ortamındaki sağlayıcı birkaç saatte bir kesiliyorsa failure sinyali bulanıklaşır.

**Sahte coverage:** 100 yeşil UI testi yalnız aynı happy-path'i tekrarlıyorsa yüksek test sayısı risk kontrolü sağlamaz.

Bu sorunların çözümü sadece daha fazla otomasyon değildir; I1–I3'te öğrendiğimiz test tasarımı, seviyeler ve izolasyondur.

## 23.5 Automation kararını nasıl belgeleriz?

Test otomasyonu için kısa bir karar kaydı yeterli olabilir:

| Alan | MiniShop örneği |
|---|---|
| **Risk** | Yanlış ücretsiz kargo eşiği |
| **Oracle** | ACTIVE + STANDARD + 100,00 € → 0 € |
| **Öncelik** | Her fiyat değişikliğinde tekrar edilmeli |
| **Seviye** | Component; seçilmiş UI doğrulaması |
| **Gerekli veri** | ACTIVE müşteri, deterministik tutar |
| **Maliyet/bağımlılık** | Component düşük; browser/DB daha yüksek |
| **Kalan risk** | UI gösterimi ve dış lojistik servis ayrı kontrol |

Bu tablo “test otomatik olsun” kararını **gerekçeli mühendislik seçimine** çevirir.

## 23.6 Automation ve manual testing rakip değil

Otomasyon tekrar eden, kararlı ve açık oracle'lı davranışlar için güçlüdür. İnsan odaklı exploratory testing ise sistemin **beklenmedik kullanımını**, belirsiz gereksinimleri ve yeni hipotezleri araştırmada önemlidir.

Örneğin kullanıcı yanlış kupon mesajını anlamıyorsa otomatik test “error text göründü” diye geçebilir. Mesajın gerçekten açık ve kullanılabilir olup olmadığını ayrıca değerlendirmek gerekir.

**İyi test stratejisi, her iki yaklaşımı birbirinin yerine zorlamaz.**

## 23.7 Alıştırma — yeni ürüne aktar

Bir belge yönetim sisteminde şu kontroller var:

A. Dosya boyutu 10 MB sınırında reddetme/kabul.  
B. İlk kez kullanan kişinin “Belge yükle” ekranını anlayıp anlamadığı.  
C. Başkasına ait özel belgenin API üzerinden indirilememesi.  
D. Yeni tasarımın hangi hata mesajlarını gerektirdiğini ürün ekibiyle keşfetme.

**Görev:** Hangilerini otomatikleştirir, hangilerini önce insan odaklı yürütürsün? Hangi test seviyesinde?

**Örnek çözüm:** A için component/API sınırı; C için sistem/API authorization kontrolü otomasyona güçlü adaydır. B için usability çalışması, D için collaborative review/exploratory çalışma önce gelir. B ve D'den net, tekrarlı acceptance criteria çıkarsa sonradan seçilmiş otomasyon eklenebilir.

## Sonraki ders

Neyi otomatikleştireceğimizi seçtik. Şimdi **aynı amaca hizmet eden test kodunu**, kopyalanmış adımlar yığınına dönüşmeden nasıl düzenleyeceğimizi öğreneceğiz.

→ [24. Test Automation Architecture](02-automation-architecture-and-maintainability.md)
