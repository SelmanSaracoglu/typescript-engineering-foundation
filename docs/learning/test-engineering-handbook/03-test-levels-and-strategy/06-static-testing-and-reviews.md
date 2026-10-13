# Static Testing, Reviews & Early Feedback

**Amaç:** Kod çalışmadan bulunabilecek sorunları yakalamak; review türlerini, rollerini ve sürecini teknik açıdan doğru ayırmak.  
**ISTQB CTFL v4.0.1:** **Bölüm 3'ün tamamı** — FL-3.1.1 (K1), FL-3.1.2–3.1.3 (K2), FL-3.2.1 (K1), FL-3.2.2 (K2), FL-3.2.3 (K1), FL-3.2.4 (K2), FL-3.2.5 (K1).

## 1. Technical Foundation

### Static vs dynamic testing

**Static testing**, test nesnesini **çalıştırmadan** değerlendirmektir. **Reviews** insanlara, **static analysis** araçlarla yapılan kontrole dayanabilir. İncelenebilen *work products*: gereksinim, user story, kabul kriterleri, mimari diyagram, tasarım, kaynak kod, test case, test plan, kullanıcı dokümantasyonu, model ve sözleşmeler. Review'u “yalnız kod review” olarak daraltma.

**Dynamic testing**, çalıştırılan nesnenin davranışını gözler. Static review belirsiz bir requirement'ı daha kod oluşmadan yakalayabilir; dynamic test aynı yanlış yorumun çalışma sırasında neden olduğu failure'ı gösterebilir.

| Boyut | Static | Dynamic |
|---|---|---|
| Test nesnesi çalıştırılır mı? | Hayır | Evet |
| Tipik bulgu | Çelişkili kural, dead code, belirli data-flow anomaly | Yanlış response, state, zamanlama, entegrasyon failure'ı |
| Kanıt | Work-product satırı / review kaydı / analiz bulgusu | Input, expected/actual, log, runtime artifact |
| Limit | Gerçek sistemde çalışma etkisini her zaman kanıtlayamaz | Sınanmayan kural, ölü yol veya gereksinim hatası kaçabilir |

**Static anomaly ≠ doğrulanmış defect:** Bir review yorumu açıklama gereksinimi veya yanlış alarm olabilir; analiz edip karar vermek gerekir. Bir static analyzer uyarısı da manuel değerlendirme gerektirebilir.

### Erken ve sık stakeholder feedback

İş paydaşının “ücretsiz kargo” için hangi tutarın esas alındığına erken açıklık getirmesi, implementation ve otomasyonun yanlış kurala göre yapılmasını önler. Feedback sadece demo sonunda değil, gereksinim taslağında ve review aşamalarında değer yaratır.

### CTFL'nin beş review activity'si

1. **Planning:** Amaç, review kapsamı, risk, exit kriteri, katılımcılar, süre ve destek materyali belirlenir.
2. **Review initiation:** Katılımcıların dokümana, kurallara ve görev bilgisine erişimi sağlanır.
3. **Individual review:** Her reviewer materyali inceler; anomali, öneri ve soruları ayrı kaydeder.
4. **Communication and analysis:** Bulgular müzakere edilir; hangisinin defect olduğu, sahibi ve yapılacak iş netleştirilir.
5. **Fixing and reporting:** Author düzeltir; defect ve review sonuçları kaydedilir; exit criteria ile kabul kararı verilir.

**Genel sıra** budur; büyük iş ürününde parçalar ve döngülerle tekrar edilebilir.

### Review rolleri — CTFL terminolojisi

| Rol | Ana sorumluluk |
|---|---|
| **Manager** | Review'a kaynak sağlamak, hangi iş ürününün değerlendirileceğine karar vermek |
| **Author** | İş ürününü yazmak, gerekli düzeltmeleri uygulamak |
| **Moderator / Facilitator** | Toplantı ve tartışmanın etkili, yapıcı ve zamanında ilerlemesini sağlamak |
| **Scribe / Recorder** | Anomalileri, kararları ve toplantı sonuçlarını kaydetmek |
| **Reviewer** | İş ürününü inceleyip sorun, öneri ve soru üretmek |
| **Review leader** | Bütün review sürecinin organizasyonu ve katılımcıların belirlenmesinden sorumlu olmak |

Küçük ekipte kişi birden fazla role sahip olabilir; ancak **inspection** için aşağıdaki özel kısıtlar geçerlidir.

### Review types — formalite ve amaç

| Tür | Tipik liderlik / özellik | Öne çıkan amaç |
|---|---|---|
| **Informal review** | Önceden tanımlı süreç veya resmî çıktı zorunlu değildir | Anomalileri hızlı saptamak |
| **Walkthrough** | **Author-led**, örneğin tasarımı adım adım anlatır | Anlama, ortak görüş, öğrenme ve hata bulma |
| **Technical review** | **Moderator-led**, teknik uzmanlar katılır | Teknik seçenekleri değerlendirmek, consensus ve karar |
| **Inspection** | En formal tür; tanımlı review adımları ve ölçüm | Sistematik anomali bulma ve süreç iyileştirme |

**CTFL kısıtı:** Inspection'da author, **review leader** veya **scribe** rolünü üstlenemez. “Technical review daima author-led” yanlıştır. Formalite, önem, mevzuat, kanıt gereksinimi ve ekip kapasitesiyle seçilir.

### Review'ları etkili yapan koşullar

Açık amaç/ölçülebilir çıkış kriteri; küçük inceleme parçaları; hazırlık zamanı; uygun reviewer uzmanlığı; yönetim desteği; eğitimli roller; psikolojik güvenlik; tarafsız kolaylaştırma; tamamlanan aksiyonların takibi. İncelenen kişinin performansını cezalandırmak **review'un amacı değildir**.

## 2. Engineering Perspective

**Hangi belge önce review edilir?** Risk yüksekse ve iş kuralı belirsizse önce requirement/acceptance criteria. Kod PR review'u yanlış requirement'ın doğru implementasyonunu yalnız başına yakalayamayabilir.

**Örnek kod incelemesi:** Backend kodu request'teki `userId` değerini doğrudan kaydın sahibi sanıyor. Static review, authorization/ownership kontrolünün nerede eksik olduğunu işaretleyebilir; sonraki dynamic negatif test davranışın gerçekten DENY olduğunu ve verinin değişmediğini doğrular.

**Trade-off:** Kritik ödeme akışında kapsamlı teknik review ve denetim izi yüksek değer sağlar; tek satırlık düşük riskli metin düzeltmesinde aynı formalite gereksiz maliyet yaratabilir.

## 3. Practical Scenario — review'u uygula

İncelenecek gereksinim:

> “Premium kullanıcılar uygun siparişlerde kolayca iade talebi oluşturabilir.”

**Individual review:** “Premium” tanımı, “uygun” koşulu, süre sınırı, iptal/teslim durumları, iade miktarı ve başarılı işlemin beklenen sonucu belirsizdir.

**Communication & analysis:** Product owner, “teslim edildi; 14 takvim günü dahil; aynı satır için en fazla bir açık iade” kararlarını onaylar. Saat dilimi ve kısmi iade hâlâ açıksa ayrı not düşülür.

**Fixing/reporting:** AC güncellenir; test koşulları geçerli/son gün/geçersiz state/yinelenen iade şeklinde türetilir; kararlar kaydedilir. İlk belirsiz metne göre yazılmış otomasyonun “pass” olması doğruluk kanıtı değildir.

## 4. Interview Preparation

**Q1: What is static testing, and why is it valuable?**  
**A:** “Static testing evaluates work products without executing software. It can reveal ambiguity, inconsistencies and certain code defects early, often before they become costly implementation problems.”

**Q2: How are walkthrough, technical review and inspection different?**  
**A:** “A walkthrough is usually author-led, a technical review is led by a moderator and focuses on technical decisions, while an inspection is the most formal and systematic review type with defined activities and records.”

**Q3: How do you handle a review comment you disagree with?**  
**A:** “I clarify the evidence and expected requirement, distinguish an anomaly from a confirmed defect, discuss the risk respectfully and record the decision and owner.”

## 5. CTFL Practice — özgün sorular

**S1 (K2):** Henüz kod yok; iki acceptance criterion çelişiyor. Hangi faaliyet kusuru en erken yakalar?  
A) Runtime load test · B) Requirements review · C) Production incident review · D) UI screenshot comparison  
**Yanıt: B.** Static review çalışma öncesi çelişkiyi saptar; diğerleri daha geç veya ilgisizdir.

**S2 (K1):** CTFL inspection için author'ın üstlenmemesi gereken roller hangileridir?  
A) Reviewer ve manager · B) Review leader ve scribe · C) Author ve reviewer · D) Moderator ve manager  
**Yanıt: B.** Resmî inspection kısıtı budur; diğer çiftler için aynı genel kural yoktur.

**S3 (K2):** Yazarın ürünü anlatarak ilerlediği, öğrenme ve ortak anlayış amaçlı review türü hangisi?  
A) Walkthrough · B) Inspection · C) Performance testing · D) Static analysis tool scan  
**Yanıt: A.** Walkthrough author-led'dir; inspection daha formal, scanner ise review toplantısı değildir.

**S4 (K2):** Review toplantısından önce reviewer'ın kendi anomalilerini hazırlaması hangi adımdır?  
A) Planning · B) Individual review · C) Fixing · D) Deployment  
**Yanıt: B.** Düzeltme değil bireysel ön incelemedir.

## Sonuç ve referans

Static testing'in asıl gücü **yanlış varsayımları çalışma aşamasından önce ortaya çıkarmasıdır**. Review bulgusunu doğrulanmış kusurdan ayır; seçilen formaliteyi iş riskine göre gerekçelendir.

- [Requirements & Evidence](../01-foundations/03-requirements-expected-behavior-and-evidence.md) · [SDLC](05-sdlc-devops-and-maintenance-testing.md)
- [ISTQB CTFL v4.0.1 — Chapter 3](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
