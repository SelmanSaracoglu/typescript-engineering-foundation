# 1. Yazılım kalitesi, test etme ve güven

> **Bu bölümün sorusu:** “Testler geçti” dediğimizde gerçekten ne öğrenmiş oluruz?

## Önce bir durum düşünelim

Bir alışveriş uygulamasının giriş ekranını test ediyoruz. Üç test çalıştırdık:

| Deneme | Beklenen | Gözlenen |
|---|---|---|
| Doğru e-posta ve şifre | Giriş yapılır | Giriş yapıldı |
| Yanlış şifre | Giriş reddedilir | Reddedildi |
| Boş şifre | Açıklayıcı hata gösterilir | Gösterildi |

Üç sonuç da başarılı. “Giriş özelliği tamamen doğru çalışıyor” diyebilir miyiz?

**Hayır.** Çünkü yalnızca üç koşul için kanıt topladık. Başka kullanıcının hesabına erişim, oturumun süresi, çok sayıda başarısız deneme, bağlantı kopması veya erişilebilirlik hakkında henüz bir şey bilmiyoruz. Bu, üç testin değersiz olduğu anlamına gelmez: **Testin sonucu, testin kapsamı kadar konuşur.**

Bu ayrım, bütün kitabın temelidir.

## 1.1 Kalite nedir?

Günlük dilde “kaliteli” sözcüğü çoğunlukla “hatasız” ile karıştırılır. Yazılımda kalite daha geniştir. Ürünün **belirlenmiş gereksinimleri** ve **gerçek kullanım ihtiyaçlarını** ne ölçüde karşıladığına bakarız.

Bir ödeme sistemi düşünelim:

- Doğru toplam tutarı hesaplıyor mu? (**functional suitability**)
- Yoğun kullanımda kabul edilebilir hızda mı? (**performance**)
- Yetkisiz kullanıcı ödeme bilgisine erişemiyor mu? (**security**)
- Kullanıcı ne yapacağını anlayabiliyor mu? (**usability**)
- Bağlantı kesildiğinde tutarlı şekilde toparlanıyor mu? (**reliability**)

İşlevsel bir hesaplamanın doğru olması bütün ürünün kaliteli olduğunu göstermez. Bunun tersi de doğrudur: güzel görünen, hızlı açılan bir ekran yanlış fiyat hesaplıyorsa amaçlanan işi doğru yapmıyordur.

**Önemli nüans:** Kaliteyi değerlendirirken hangi özelliklerin kritik olduğuna *bağlam* karar verir. Bir oyun menüsündeki küçük görsel kayma ile ödeme tutarının iki kez tahsil edilmesi aynı ağırlıkta değildir.

## 1.2 Test etme nedir; ne değildir?

**Testing**, yazılımı veya ona ait iş ürünlerini değerlendirmek; gereksinimlere uygunluk, kusur ihtimali ve ürün riski hakkında **karar verilebilir bilgi** üretmektir.

Test sadece “uygulamayı çalıştırıp Pass/Fail görmek” değildir. Bir tester şunları yapar:

1. **Anlar:** İş kuralı, kullanıcı ihtiyacı ve risk nedir?
2. **Sorgular:** Kural belirsiz, eksik veya çelişkili mi?
3. **Tasarla:** Hangi durumlarda farklı sonuç bekliyoruz?
4. **Hazırlar:** Veri, başlangıç koşulu ve gözlem noktaları nelerdir?
5. **Uygular:** Gerçek davranışı gözler.
6. **Değerlendirir:** Beklenen ile gerçekleşeni karşılaştırır; sonucu ve sınırları raporlar.

Örneğin “14 gün içinde iade” ifadesinde 14. günün dahil olup olmadığını **kod yazılmadan önce** sormak, kusuru geç aşamada bulmaktan daha değerli olabilir.

### “Test kanıtlar” sözüne dikkat

Bir testin geçmesi şunu söyleyebilir:

> “Bu sürümde, bu ortamda, bu başlangıç verisi ve bu adımlarla, beklediğimiz sonucu gördük.”

Şunu **söyleyemez**:

> “Sistemde hiçbir kusur yok.”

Bütün olası kullanıcılar, cihazlar, veri kombinasyonları ve olay sıraları tüketilemez. Bu yüzden testing **riski azaltır ve güven üretir**, fakat mutlak garanti vermez.

## 1.3 QA, QC ve Testing arasındaki fark

Bu kavramlar birlikte çalışır ama aynı şey değildir.

| Kavram | Temel soru | Örnek |
|---|---|---|
| **Quality Assurance (QA)** | Kusurların oluşmasını önleyecek süreçleri nasıl iyileştiririz? | Requirement review ve ortak kabul kriteri alışkanlığı |
| **Quality Control (QC)** | Ortaya çıkan ürün/çıktı beklenen kaliteyi karşılıyor mu? | Çıktının kontrolü, inceleme, test |
| **Testing** | Belirli davranışlar, iş ürünleri ve riskler için hangi kanıtı toplarız? | Sınır değeri testi, API doğrulaması, statik inceleme |

Testing QC'nin önemli faaliyetlerindendir; testing'den öğrenilenler QA süreçlerini de iyileştirebilir. **“Kaliteyi tester sağlar; developer kodlar”** anlayışı yanlıştır. Kalite, ekip içinde paylaşılan bir sorumluluktur.

## 1.4 Hata zinciri: mistake → defect → failure

Aynı sorunu anlatan üç farklı aşama vardır:

1. **Human error / mistake:** Geliştirici “100 € ve üzeri” kuralını “100 € üzeri” diye yorumladı.
2. **Defect / fault / bug:** Kodda 100'ü dışarıda bırakan karşılaştırma oluştu.
3. **Failure:** Müşterinin 100 € sepetinde ücretsiz kargo uygulanmadı.

**Root cause** daha geride olabilir: Gereksinim örneklerle gözden geçirilmedi, eşik değeri review'da konuşulmadı.

Bir defect her çalışmada failure üretmeyebilir. Örneğin kusurlu sınır karşılaştırması 120 € testinde görünmez. Tersine çalışma anındaki her failure da otomatik olarak uygulama kodu kusuru değildir; yanlış test verisi veya ağ/ortam arızası da neden olabilir.

**Testing ile debugging farkı:** Testing başarısız davranışı saptar ve kanıtlar; debugging nedenini araştırıp düzeltir. Sonra düzeltmenin işe yaradığını tekrar test etmek gerekir.

## 1.5 Güven (confidence) nasıl oluşur?

Güven tek başına “100 testin 100'ü geçti” oranı değildir. Şu soruların birleşimidir:

- **Risk:** En çok zarar verecek hataları düşündük mü?
- **Kapsam:** Testler farklı davranış sınıflarını, sınırları ve durumları temsil ediyor mu?
- **Beklenen sonuç:** Doğruluğu nereden biliyoruz? Mevcut kodu mu taklit ettik?
- **Gerçekçilik:** Test ortamı kritik dış bağımlılıkları temsil ediyor mu?
- **Kanıt kalitesi:** Sonuç tekrar üretilebilir ve bağımsız incelenebilir mi?
- **Kalan belirsizlik:** Hiç test etmediğimiz noktalar neler?

Yeşil test suite, **tanımlı sınırlar içinde güven sağlar**. Sorumlu release önerisi, bu sınırları gizlemez.

### Yedi temel test ilkesi — günlük karşılıklarıyla

1. **Testing kusurların varlığını gösterebilir, yokluğunu değil.** Üç başarılı login testi tüm login davranışlarını garanti etmez.
2. **Exhaustive testing mümkün değildir.** Tüm şifreler, cihazlar ve bağlantı durumları denenemez; seçim yaparız.
3. **Early testing zaman ve maliyet kazandırır.** “14 gün dahil mi?” sorusunu koddan önce sorarız.
4. **Defects cluster together.** Çok kusur görülen ödeme modülü yakından izlenebilir; geçmiş tek ölçüt değildir.
5. **Tests wear out.** Aynı testler tekrar tekrar aynı bölgeleri kontrol eder; yeni risklere göre geliştirmek gerekir.
6. **Testing context dependent.** Bankacılık transferi ile basit içerik sayfasının kanıt ihtiyacı farklıdır.
7. **Absence-of-defects fallacy.** Şartnameye uygun görünen ürün kullanıcı ihtiyacını karşılamıyorsa başarı değildir.

Bu ilkeler **test seçimi ve iddia sınırı** hakkında düşünmek içindir; ezber cümleler olarak bırakılmamalıdır.

## 1.6 Çalışılmış örnek: bir release konuşması

Ürün sahibi: “Login için yazdığımız bütün testler geçti. Yayına çıkalım.”

Zayıf yanıt: “Evet, bütün testler yeşil.”

Daha iyi yanıt:

> “Geçerli, yanlış ve boş şifre davranışlarını doğruladık. Ancak oturum süresi, hesaplar arası erişim ve tekrar deneme riskleri hakkında bu çalışma henüz kanıt sunmuyor. Release öncesinde bunlardan hangilerinin kritik olduğunu birlikte önceliklendirelim.”

Bu yanıt release'i keyfî olarak durdurmaz. **Kanıtı, bilinmeyeni ve karar sahibini** ayırır.

## 1.7 Kendi başına düşün

Bir uygulamanın kupon ekranında 40 test geçti ama hiçbir test aynı kuponun iki kez kullanımını incelemiyor.

**Soru:** “40/40 pass” sayısı neden yanıltıcı olabilir? Hangi **tek** ek test en çok bilgi üretir?

**Örnek değerlendirme:** Test sayısı çok olsa da önemli bir iş kuralı hiç ele alınmamış olabilir. Aynı kuponun başka siparişte tekrar kullanılmasını ve **indirim kaydının değişmemesini** doğrulamak daha anlamlı bir kanıt üretebilir. Kesin beklenti için önce kuponun tek kullanımlık olduğunun onaylanması gerekir.

## Bir sonraki adım

Artık **neyi test ettiğimizi** ve **hangi iddiayı kurabileceğimizi** biliyoruz. Sonraki bölümde “gereksinimi doğru uygulamak” ile “doğru kullanıcı ihtiyacını çözmek” ayrımına ve riskin test kararını nasıl yönlendirdiğine geçiyoruz:

→ [2. Verification, Validation & Risk](02-verification-validation-and-risk.md)
