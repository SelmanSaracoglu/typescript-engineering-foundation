# Quality, Testing & Confidence

**Amaç:** Testi yalnız hata bulmakla eşitlemeden kaliteye ve release kararına katkısını açıklamak.  
**ISTQB CTFL v4.0.1:** 1.1 (FL-1.1.1 K1, FL-1.1.2 K2), 1.2 (FL-1.2.1 K2, FL-1.2.2 K1, FL-1.2.3 K2), 1.3 (FL-1.3.1 K2), 1.5 (FL-1.5.1 K2, FL-1.5.2 K1, FL-1.5.3 K2).

## 1. Technical Foundation

### Kalite, test ve güven aynı şey değildir

- **Software quality:** Ürünün belirtilen gereksinimler ve amaçlanan kullanıcı/iç paydaş ihtiyaçları açısından ne kadar uygun olduğuna ilişkin özellik. İşlevsellik kadar performans, kullanılabilirlik ve güvenlik gibi nitelikler de önem taşıyabilir.
- **Software testing:** Gereksinim, tasarım, kod ve çalışan yazılım gibi test nesnelerini değerlendirerek kusurlar hakkında bilgi elde eden, kaliteyi değerlendiren ve riske ilişkin kararları destekleyen faaliyetler bütünüdür. Sadece testi çalıştırmak değildir.
- **Quality Control (QC):** Ürün/çıktı odaklı kalite kontrolü; testing bunun önemli araçlarından biridir.
- **Quality Assurance (QA):** Süreç odaklı ve önleyici yaklaşım; örneğin gereksinim review disiplini, Definition of Done, kod inceleme süreci.
- **Confidence:** Toplanan kanıtlara göre ürünün hedeflenen kullanımda makul derecede doğru çalışacağına duyulan güven. Kesinlik veya matematiksel garanti değildir.

Örnek: Checkout için 120 testin geçmesi **kanıttır**; yanlış fiyatlandırma kuralı hiç test edilmediyse bu başarı tek başına güvenli release gerekçesi değildir. Birim testleri olumlu olabilirken ödeme sağlayıcısıyla entegrasyon bozuk olabilir.

### Test hedefleri (test objectives)

Kritik hedefler: iş ürünlerini değerlendirme; kusurları ortaya çıkarma; önemli kapsamı işletme; uygun kalite düzeyi hakkında bilgi sağlama; şartların karşılandığını doğrulama; kullanıcı ihtiyacını geçerleme; riski azaltma ve paydaş kararına girdi sağlama. Bazı projelerde sözleşmesel/yasal uygunluğun doğrulanması da hedeftir.

**Test ve debugging farkı:** Dinamik testte hata gözlemlenir (**failure**); debugging nedenini teşhis edip düzeltir. Düzeltmeyi **confirmation testing** ile doğrular, yan etkiyi **regression testing** ile araştırırız. Statik review'da kusur kod çalıştırılmadan doğrudan saptanabilir.

### Root cause → error → defect → failure

Ekipte hata inceleme örneği:

1. **Root cause:** Kuralın belirsizliği ve review yapılmadan implementasyona geçilmesi.
2. **Error / human mistake:** Geliştiricinin maksimum indirim sınırını yanlış yorumlaması.
3. **Defect (fault/bug):** Kaynak kodda yanlış karşılaştırma operatörü.
4. **Failure:** 30% sınırında yanlış indirim hesaplanması.

Bir defect her koşulda failure üretmeyebilir; hiç çalıştırılmayan yol sessiz kalabilir. Failure'ın her zaman insan yazılım hatasından doğduğunu da varsayma; çevre sorunları etki edebilir.

### CTFL'nin yedi testing ilkesi

| İlke | Mühendislikte karşılığı |
|---|---|
| Testing defects'in varlığını gösterebilir, yokluğunu kanıtlayamaz | Yeşil suite sıfır kusur garantisi değildir |
| Exhaustive testing is impossible | Kombinasyonları risk ve tekniklerle seç |
| Early testing saves time and money | Requirements review'da belirsizliği yakala |
| Defects cluster together | Geçmiş sorun yoğunluğu yüksek modüllere dikkat et |
| Tests wear out | Tekrarlanan suite'i yeni risklerle güncelle; regression tekrarının değeri sürer |
| Testing is context dependent | Sağlık uygulaması ile kampanya landing page'ine aynı kanıt düzeyi gerekmez |
| Absence-of-defects fallacy | Kusursuz görünen ürün yanlış kullanıcı ihtiyacını karşılıyor olabilir |

**Ayrım:** “Tests wear out” testlerin mutlaka silinmesi demek değildir. Mevcut regression korumasına yeni senaryo ve veri eklemek gerekir.

### Testing'de gerekli beceriler

Analitik düşünme, alan bilgisi, risk değerlendirme, iletişim, eleştirel ama yapıcı geri bildirim, iş birliği ve temel teknik okuryazarlık birlikte gerekir. **Whole-team approach:** Kalite yalnız tester'ın sorumluluğu değildir. **Independent testing:** Dış göz kör noktaları azaltabilir; ancak iletişim kopukluğu ve “kalite onların işi” yanılgısı yaratabilir. En iyi seçim bağlama göre farklı bağımsızlık düzeyleridir.

## 2. Engineering Perspective

Bir release tavsiyesi verirken “kaç test geçti?”den önce şu soruları cevapla:

- **Neyi hedefledik?** Ödeme, veri bütünlüğü, erişim ve ana kullanıcı yolları?
- **Hangi ortamlarda doğruladık?** Test ortamı production davranışını temsil ediyor mu?
- **Neyi gözlemlemedik?** Çoklu kullanıcı, ağ kaybı, performans, güvenlik, hata kurtarma?
- **Başarısız kalan ne var?** Açık defect etkisi, workaround, etkilenen kullanıcılar.
- **Karar kimin?** Testing kanıt ve öneri sunar; nihai risk kabulünü yetkili paydaş yapar.

Kalite güveni sayısal tek skora indirgemek zorunda değiliz. **Test sonucu + kapsam + risk + ortam güvenilirliği + kalan bilinmezler** birlikte değerlendirilir.

## 3. Practical Scenario — Login release

Gereksinim: Geçerli kimlikle oturum aç; yanlış ve boş şifreyi reddet. Üç senaryo geçti.

**Eksik kritik sorular:** Hesap kilitleme/çok sayıda başarısız giriş, çıkış sonrası session kullanımı, iki kullanıcının veri ayrımı, kesintide hata davranışı ve şifrenin loglanması gibi riskler kapsamda mı? Bunların hepsi bu özelliğin kabul kriteri olmayabilir; gerekli kontrol ve sorumluluklar belirlenmeli.

**Örnek karar:** “Tanımlı üç acceptance senaryosu geçti; ancak güvenlik ve session sınırları için henüz kanıt yok. Bu belirsizlikleri ve iş etkisini paydaşla değerlendirip kontrollü release kararı verilmesini öneriyorum.” Bu ifade sahte kesinlik üretmez.

## 4. Interview Preparation

**Q1 (Foundation): What is the difference between QA and testing?**  
**A:** “Testing evaluates work products and provides evidence about defects and product quality. Quality assurance focuses on improving the processes that prevent defects. Testing supports quality, but it does not replace process improvement.”  
**Follow-up:** Can testers contribute to QA? **Yes:** by feeding recurring defect patterns into review and process improvements.

**Q2 (Mid): All tests pass. Would you approve the release?**  
**A:** “I would review the test objectives, critical risks, coverage, environment, unresolved defects and untested areas. Passing tests is useful evidence, not proof of defect-free software. I would communicate the residual risk so the accountable stakeholder can decide.”  
**Follow-up:** What if time is limited? **Prioritize critical user journeys and high-impact failure modes.**

**Q3 (Advanced): How can independent testing both help and hurt?**  
**A:** “It can challenge assumptions and reduce author bias. However, excessive separation may slow feedback or encourage a false division of quality ownership. I prefer clear accountability with collaborative, sufficiently independent review.”

## 5. CTFL Practice — özgün sorular

**S1 (K2):** Checkout testleri geçiyor; ancak özellik iş açısından gerekli kargo seçeneğini hiç sunmuyor. Bu olayı en çok hangi ilke açıklar?  
A) Defects cluster together · B) Absence-of-defects fallacy · C) Tests wear out · D) Exhaustive testing is impossible  
**Yanıt: B.** Gereksinime uygun görünmek gerçek kullanıcı ihtiyacını karşılama garantisi vermez. A, C, D gerçek ilkeler olsa da bu olaya doğrudan karşılık gelmez.

**S2 (K2):** Bir manuel testte yanlış toplam görülüyor; geliştirici kodda bir operatörü düzeltip aynı senaryoyu tekrar çalıştırıyor. Hangi eşleştirme doğru?  
A) Test = debugging; düzeltme = QA · B) İlk test failure saptar; düzeltme debugging; yeniden çalışma confirmation testing · C) Yeniden çalışma yalnız regression'dır · D) Kod düzeltmesi test execution'dır  
**Yanıt: B.** Confirmation spesifik kusurun giderildiğini; regression başka davranışların etkilenmediğini kontrol eder.

**S3 (K1):** Sürekli aynı test setiyle yeni kusur bulma kapasitesi düşüyorsa en ilgili ilke hangisidir?  
A) Context-dependent · B) Tests wear out · C) Independence · D) Whole-team  
**Yanıt: B.** Diğerleri doğru bağlam kavramlarıdır, bu açıklamayı karşılamaz.

## Sonuç ve bağlantılar

Tek cümle: **Testing, sıfır kusur sertifikası değil, risk ve kalite hakkında karar verilebilir kanıt üretme faaliyetidir.**

Devam: [Verification, Validation & Risk](02-verification-validation-and-risk.md) → [Requirements & Evidence](03-requirements-expected-behavior-and-evidence.md).

**Kaynak:** [ISTQB CTFL Syllabus v4.0.1, Chapter 1](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). Açıklamalar ve sorular özgün yazılmıştır.
