# Verification, Validation & Risk

**Amaç:** Bir ürünün şartnameyi karşılaması ile kullanıcı ihtiyacını karşılamasını ayırmak ve test kararlarını risk temeline oturtmak.  
**CTFL v4.0.1:** 1.1 (verification/validation), 1.2.1 (testing's contribution), 1.3 (context/absence-of-defects); Chapter 5.2'nin ayrıntılı risk management süreci **I2/I6 için planlıdır**.

## 1. Technical Foundation

### Verification vs validation

- **Verification:** Ürün veya iş ürünü belirtilen gereksinimleri karşılıyor mu? Örnek: İndirim şartnamesi %10 üst sınır diyorsa 11% girişini reddetmesi.
- **Validation:** Ürün hedef kullanıcıların ve paydaşların gerçek kullanım ihtiyaçlarını karşılıyor mu? Örnek: Şartname yalnız kupon kodunu destekliyor ancak mobil kullanıcılar kodu bulamıyor; gereksinim doğru uygulanmış olsa da deneyim başarısız olabilir.

Bu iki kavram birbirini dışlamaz. Bir acceptance testi hem şartname uygunluğuna hem kullanıcı değerine kanıt sağlayabilir; hangi iddiayı sınadığını belirtmek gerekir. “Verification = static, validation = dynamic” **yanlıştır**; bu ayrımlar farklı boyutlardır.

### Risk iki boyutludur: olasılık ve etki

- **Product risk:** Üründeki bir kusurun kullanıcıya, veriye, güvenliğe veya işletmeye olumsuz etkisi. Örnek: Hesap verisinin başka kullanıcıya gösterilmesi.
- **Project risk:** Test projesinin/teslimin yürütülmesini engelleyen etmen. Örnek: Test ortamının zamanında hazır olmaması, uzman bulunmaması.

Basit düşünme aracı: **risk seviyesi ≈ olasılık × etki**. Sayı kullanılıyorsa ölçeğin ekip içi göreli karar aracı olduğu, gerçek istatistiksel olasılık olmadığı açıklanmalıdır. Çok düşük olasılıklı ama geri dönüşsüz bir güvenlik ihlalinin etkisi yine kritiktir.

### Testing ile risk azaltımı

Bir testin geçmesi riskin sıfırlandığı anlamına gelmez; yalnız sınanan koşullara ilişkin bilinmezliği azaltabilir. Testin kusuru yakalaması doğrudan daha yüksek kalite yaratmaz: Kusurun giderilmesi ve tekrar doğrulama gerekir. Risk azaltma ayrıca tasarım değişikliği, erişim kontrolü, monitoring veya kullanıcı sınırlamasıyla desteklenebilir.

## 2. Engineering Perspective

### İki örnek karar

**Kupon fonksiyonu:** UI rengi yanlış — düşük finansal etki, geniş görünürlük. **Ödeme toplamı yanlış** — veri/para etkisi yüksek, release öncesi kritik. Aynı başarısız test sayısı aynı öncelik değildir.

**Login:** Yanlış şifrenin reddedilmesi verification kanıtıdır. Yaşlı kullanıcıların erişilebilir bir hata mesajıyla tekrar deneyebilmesi validation boyutudur. Bu iki durum farklı test verisi, gözlem ve paydaş gerektirir.

### Release için kısa risk konuşması

| Soru | Örnek kanıt |
|---|---|
| En ağır olumsuz sonuç ne? | Çift ödeme, başka hesabın verisine erişim |
| Hangi koşulda ortaya çıkabilir? | Retry, eşzamanlı işlem, yetki sınırı |
| Bunu ne kadar gözledik? | Negatif akış, kayıtların state doğrulaması |
| Eksik kanıt nedir? | Üçüncü taraf timeout, gerçek benzeri veri yükü |
| Karar sahibi kim? | Product/security/operasyon yetkilisi |

**Önemli:** “Bu testleri yaptım, güvenlidir” yerine “Bu risklerin şu davranışlarını test ettim; kalan riski şunlar oluşturuyor” de.

## 3. Practical Scenario — İade kuralı

Gereksinim: “Teslimattan itibaren 14 gün içinde iade başvurusu yapılabilir.”

- **Verification test:** Teslimattan 14 gün sonra kabul, 15 gün sonra ret; tarih hesabı için saatin ve timezone'un nasıl yorumlandığı netleştirilmeli.
- **Validation görüşmesi:** Kullanıcı teslim tarihini bilemediğinde nasıl hareket ediyor? Tatil gününde başvuru mümkün mü? Bu sorular yeni ürün gereksinimi doğurabilir; otomatik mevcut defect sayılmaz.
- **Product risk:** Uygun iadelerin reddedilmesi (hak kaybı), uygunsuz iadelerin kabulü (maliyet).
- **Project risk:** Tarih/saat altyapısının test ortamında sabitlenememesi.

**Mühendislik tercihi:** Önce ambiguous “gün” tanımını ürün sahibiyle netleştir; sonra boundary ve state testlerini kur. Belirsiz beklenti üzerine yeşil test yazmak güven üretmez.

## 4. Interview Preparation

**Q1 (Foundation): What is the difference between verification and validation?**  
**A:** “Verification checks conformance to specified requirements. Validation checks whether the solution meets real stakeholder needs in its intended context. A feature can pass verification and still fail validation.”  
**Follow-up:** Can one test contribute to both? **Yes, if its evidence is relevant to both claims.**

**Q2 (Mid): How do you decide what to test first?**  
**A:** “I consider product risks: potential impact, likelihood, business criticality and the confidence we already have. I prioritize high-impact scenarios and explain any residual uncertainty.”  
**Follow-up:** Is a fixed numeric risk score always necessary? **No; an explicit qualitative rationale can be more honest.**

**Q3 (Advanced): Why isn't test coverage alone enough for release?**  
**A:** “Coverage measures a chosen set of items exercised, not correctness or business value. A suite can cover every specified rule while missing an important user need or security threat.”

## 5. CTFL Practice — özgün sorular

**S1 (K2):** İş kuralına birebir uyan bir rapor, kullanıcıların yasal zorunlu alanları görmesini sağlamıyor. Hangisi doğru?  
A) Verification başarısız, validation başarılı · B) Verification başarılı olabilir, validation başarısız olabilir · C) İkisi kesin başarılı · D) Testing gereksiz  
**Yanıt: B.** Şartname doğru uygulanmış olabilir; kullanıcı ihtiyacı karşılanmamıştır. Diğer seçenekler iki amacı ters veya eksik yorumlar.

**S2 (K2):** Test ortamının kurulamaması hangi risk tipine daha doğrudan örnektir?  
A) Product risk · B) Project risk · C) Security vulnerability · D) Test oracle  
**Yanıt: B.** Ortam yokluğu çalışmanın yürütülebilirliğini etkiler; ürün kusurunun sonuçlarını değil.

**S3 (K2):** Başarılı negatif authorization testi neyi gösterir?  
A) Hiç zafiyet kalmadı · B) Test edilen aktör/işlem/veri kombinasyonunda yetkisiz erişim gözlenmedi · C) Tüm kullanıcılar güvende · D) Uygulama saldırı geçirmez  
**Yanıt: B.** Tek bir test kapsamına ait sınırlı kanıttır.

## Sonuç ve bağlantılar

Verification “gereksinime uyum”, validation “gerçek ihtiyaca uygunluk” boyutunu sorgular. Risk hangi belirsizliğe önce odaklanacağımızı belirler.

Devam: [Requirements & Evidence](03-requirements-expected-behavior-and-evidence.md) ve [BVA](../02-test-design-techniques/02-boundary-value-analysis.md).

**Kaynak:** [CTFL v4.0.1, §§1.1, 1.2, 1.3; 5.2 sonraki kapsam](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
