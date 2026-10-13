# 8. Scenario, Negative ve Exploratory Testing

> **Bu bölümün sorusu:** Gereksinimde yazmayan ama gerçek kullanıcı davranışında ortaya çıkabilecek sorunları nasıl buluruz?

## 8.1 Yapılandırılmış teknikler yeterli mi?

Bir kupon servisi düşünelim. Önceki bölümlerde şunları yapabildik:

- EP ile geçerli/geçersiz kupon tiplerini ayırdık;
- BVA ile minimum sepet tutarının kenarını test ettik;
- Decision table ile kullanıcı tipi ve kupon koşullarını birleştirdik;
- State transition ile tek kullanımlık kuponun tekrar kullanımını sınadık.

Peki kullanıcı **öde** butonuna iki kez art arda basarsa? İnternet kesilirse? Geri tuşuna basıp sipariş sayfasına dönerse? İki tarayıcı sekmesinde işlem yaparsa?

Bunların hepsi açık gereksinimde yazmıyor olabilir. Bu, bunları test etmeyeceğimiz anlamına gelmez. Testçiler **ürünün nasıl kullanılacağını ve nasıl yanlış gidebileceğini düşünerek** yeni hipotezler üretir.

## 8.2 Scenario-based düşünmek

**Scenario**, bir aktörün belirli bir hedefe ulaşmak için içinde bulunduğu başlangıç durumunu, eylemleri ve sonucu anlatır.

“Kupon alanına geçerli kod gir” bir adım olabilir. **Gerçek kullanıcı senaryosu** daha geniştir:

1. Aktif kullanıcı ürünleri sepete ekler.
2. Kuponunu uygular.
3. Güncellenen toplamı görür.
4. Ödeme yapar.
5. Sipariş onayını alır.

Bu yolculuk, ayrı sistem parçalarının birlikte doğru çalışıp çalışmadığı konusunda soru sordurur. Ancak her ayrıntıyı pahalı bir UI E2E testiyle tekrar etmek zorunlu değildir. **Scenario kullanıcı amacını anlatır; test seviyesi daha sonra risk ve maliyete göre seçilir.**

### Ana akış ve alternatif akış

- **Main success path:** Kupon geçerli, ödeme başarılı.
- **Alternative path:** Kupon süresi dolmuş; kullanıcı açıklayıcı ret görür.
- **Failure path:** Ödeme sağlayıcısı yanıt vermez; müşteri iki kez tahsil edilmemelidir.

Ana akışın sorunsuz çalışması alternatifleri otomatik doğrulamaz.

## 8.3 Negative testing yalnız hatalı input değildir

**Negative testing**, yasaklanan, geçersiz veya başarısızlık içeren bir durum karşısında sistemin **doğru ve güvenli** davranmasını kontrol etmektir.

Örnekler:
- Gerekli alan boş gönderildi.
- Ödeme isteği ikinci kez gönderildi.
- Kullanıcı başkasına ait siparişi açmayı denedi.
- CANCELLED siparişe ship olayı gönderildi.
- Ödeme anında network bağlantısı koptu.

Her durumda beklenen yanıtın kaynağı **gereksinim / kontrat** olmalıdır. “Negative” her zaman 400 dönecek demek değildir; API status, state, audit ve kullanıcı mesajı sözleşmeye göre değişir.

### Yan etkileri neden kontrol ediyoruz?

Kupon ikinci kullanımda “Bu kupon kullanılmış” mesajı gösteriyor olsun. Ama veri tabanında indirim tutarı yanlışlıkla ikinci kez yazılmış.

UI mesajı doğru olsa da **business state yanlış**. Negatif senaryolarda mümkünse şu ikisini birlikte doğrula:

1. Yasak işlem reddedildi mi?
2. Yasak işlemin yan etkisi **oluşmadı mı**?

Bu SDET açısından güçlü test düşüncesidir.

## 8.4 Error guessing: Deneyimden hipotez üretmek

**Error guessing**, tester'ın geçmiş hata örüntülerine, domain bilgisine ve teknoloji risklerine dayanarak olası kusurları öngörmesidir.

Bir takımın yaşadığı hatalar:
- null yerine boş string geldi;
- UTC ile yerel saat karıştı;
- double-click iki istek üretti;
- eski token kullanımına izin verildi;
- decimal rounding farklı çıktı.

Benzer yeni özelliği test ederken bu şüphelerden yola çıkmak mantıklıdır.

**Sınırlama:** Deneyimin olmadığı yerde tahminler eksik olabilir. Error guessing, EP/BVA/decision table gibi sistematik teknikleri **ikame etmez**, tamamlar. İyi tester “buna neden şüphelendim?” sorusunu açıklayabilir.

## 8.5 Exploratory testing: Plan yok mu?

En çok karıştırılan nokta burası. **Exploratory testing rastgele tıklamak değildir.** Öğrenme, test tasarlama ve yürütme **birbirini besleyerek aynı çalışma sırasında gelişir**.

### 20 dakikalık örnek charter

**Hedef:** Kupon tekrar kullanımı ve sepet state tutarlılığı hakkında bilinmeyenleri ortaya çıkarmak.

**Kapsam:** Aynı kuponla ikinci sipariş, hızlı tekrar gönderimi, iki sekme, geri navigasyon.

**Kısıt:** Yalnız izole test hesapları; gerçek ödeme yapılmaz.

**Kaydedilecek:** Başlangıç state'i, izlenen adımlar, beklenen/gerçek, belirsiz sorular, defect adayları ve tekrarlanabilir deliller.

Çalışırken yeni bir gözlem geliyor:

> “Kullanıcı iki sekmede aynı kuponu uygularsa ikisinde de yeşil mesaj görünüyor.”

Buradan yeni bir hipotez doğar: “Kupon kullanımı checkout tamamlanana kadar kilitleniyor mu?” Sonraki deneyi bu hipoteze göre seçersin. **Exploration'ın değeri budur.**

### Exploratory ile adım adım scripted testing karşılaştırması

| Scripted | Exploratory |
|---|---|
| Adımlar ve beklenen sonuç önceden daha nettir | Test boyunca öğrenilen bilgi tasarımı değiştirir |
| Aynı kontrolü tekrar etmek kolaydır | Beklenmedik davranışları araştırma esnekliği yüksektir |
| Regression için çok uygundur | Yeni/az anlaşılan alanlarda güçlüdür |
| Önceden bilinmeyen sorunu kaçırabilir | Yetersiz kayıt varsa tekrar üretim zorlaşır |

İkisi rakip değil; birlikte kullanılır.

## 8.6 Checklist-based testing nasıl yarar sağlar?

Checklist, tekrar unutulan önemli soruları hatırlatır:

- Her gerekli alan boş/null durumunda doğru davranıyor mu?
- Minimum/maksimum sınırlar açık mı?
- Erişim kontrolü backend'de var mı?
- Aynı istek tekrarlanırsa veri tutarlı mı?
- İşlem failure sonrası düzelebiliyor mu?
- Gizli bilgi log veya response'ta sızıyor mu?
- Tarih ve currency hesaplarında boundary tanımlı mı?

Listeyi körlemesine uygulamak yerine **hangi kontrolün bu ürün için anlamlı olduğunu** seç. Geçmişe takılı kalan bir checklist yeni riskleri kaçırabilir.

## 8.7 Çalışılmış örnek: checkout'ta çift tıklama

Test hipotezi: “Kullanıcı ödeme butonuna iki defa basınca en fazla bir charge oluşur.”

**Hazırlık:** Sahte/izole ödeme ortamı, bilinen sepet ve tek kullanımlık sipariş kimliği.

**İşlem:** Aynı kullanıcı iki kez ödeme tetikler.

**Beklenen:** Ürün kontratına göre ikinci isteğin reddi veya aynı sonucun güvenli tekrarı; **birden fazla tahsilat yok**.

**Gözlemler:** UI onayı, ödeme sağlayıcı işlemleri, sipariş state'i ve audit kaydı.

**Ek belirsizlik:** Sistem timeout sonrasında isteği yeniden gönderdiğinde aynı garantiyi sağlıyor mu? Bu yeni bir test koşuludur.

Bu örnekte test fikrinin kaynağı formal decision table değil, **gerçek kullanım/hata örüntüsüdür**.

## 8.8 Alıştırma — küçük keşif tasarla

Özellik: Kullanıcı hesabındaki adresi değiştirebiliyor.

**Görev:** Bir scripted happy-path, iki negative test ve 15 dakikalık exploratory charter öner.

**Örnek çözüm:**
- Scripted: Kullanıcı geçerli adres kaydeder; sonraki sayfa yüklemede yeni adres görünür.
- Negative 1: Yanlış ülke/posta kodu formatı reddedilir; eski adres korunur (ürün kuralı onaylıysa).
- Negative 2: A kullanıcısı B'nin adresini değiştiremez; B'nin verisi değişmez.
- Charter: “Oturum süresi dolması, geri/ileri navigasyon ve aynı kaydı iki sekmeden değiştirme durumlarında adres tutarlılığını araştır.”

Böylece **aynı özelliği üç ayrı düşünme biçimiyle** değerlendirmiş olduk.

## Sonraki bölüm

Şimdi dış davranış ve deneyim üzerinden test tasarlıyoruz. Peki kodun iç yapısını biliyorsak hiç çalışmayan yolları nasıl görebiliriz?

→ [9. White-box Testing](06-white-box-statement-and-branch-testing.md)
