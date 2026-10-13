# Requirements, Expected Behavior & Evidence

**Amaç:** Test basis → test condition → test case → observation → evidence zincirini kurmak; uygulamanın mevcut çıktısını sorgusuz expected result saymamak.  
**CTFL:** FL-1.4.1–1.4.5 (K2), FL-1.5.1–1.5.3 (K1/K2); 4.5.2 acceptance criteria ayrıntısı [ATDD](../02-test-design-techniques/07-collaboration-user-stories-and-atdd.md) içinde.

## 1. Technical Foundation

### Kavramlar ve test süreci

- **Test basis:** Testin dayandığı gereksinim, risk kaydı, user story, arayüz sözleşmesi, tasarım veya düzenleme.
- **Test condition:** Neyi doğrulayacağız? Örnek: “14. günde iade kabul edilir.”
- **Test case:** Başlangıç koşulu, girdi/eylem ve **beklenen sonuç** ile tanımlı özel kontrol.
- **Test oracle:** Doğru sonucun ne olması gerektiğini belirleyen bağımsız dayanak: onaylı şartname, açık iş kuralı, doğrulanmış sözleşme, alan uzmanı kararı. “Sistem böyle yapıyor” oracle değildir.
- **Testware:** Plan, test koşulu, test data, test case, charter, script, test result ve rapor gibi test faaliyetlerinin çıktıları.
- **Evidence:** Gerçek gözlem, zaman, ortam, veri, log, response, ekran kaydı ve test sonucu; tek başına “Pass” yazısı yetmeyebilir.
- **Traceability:** Test basis ile koşullar, testler, sonuçlar ve ilgili defectler arasında izlenebilir bağlantı.

CTFL test faaliyetleri: **planning; monitoring & control; analysis; design; implementation; execution; completion.** Bunlar bir projede katı bir şelale olmak zorunda değildir; yinelemeli ve paralel çalışır. Test **analysis** “what to test?”, **design** “how to test?” sorusunu yanıtlar. Implementation veri/prosedür/ortamı hazırlar; execution beklenen-gerçek sonucu karşılaştırır; completion kalan işleri ve öğrenilenleri kaydeder.

**Rol ayrımı:** Test management rolü planlama, izleme, kontrol ve tamamlanma odaklıdır; testing rolü analiz, tasarım, uygulama ve yürütme odaklıdır. Aynı insan küçük takımda ikisini de yapabilir. Whole-team iş birliği test bağımsızlığını dışlamaz.

### Gereksinim kalitesi: ambiguity, assumption, contradiction

- **Ambiguity:** “Hızlı yanıt” — kaç saniye, hangi veri ve yükte?
- **Assumption:** “Gün = UTC günü” — paydaş onaylamadıysa gizli varsayım.
- **Contradiction:** Bir doküman “14 gün dahil” der, diğeri “14. gün hariç” der.
- **Missing requirement:** İade başvurusunda zaman dilimi hiç yazılmamış.

Çözüm, geliştiricinin mevcut çıktısını “doğru” olarak kabul etmek değil; çelişkiyi açık soruya dönüştürmek ve karar veren kişiyi belirlemektir.

## 2. Engineering Perspective — izlenebilir bir örnek

**Onaylı kural R-17:** Sipariş durumu **DELIVERED** ve teslim tarihinden itibaren **0–14 takvim günü (iki uç dahil)** ise iade başvurusu kabul edilir; aksi halde reddedilir. Saat dilimi ve gün hesabı için ürün kararı ayrıca kaydedilmiş olsun.

| Test basis | Risk | Test condition | Örnek veri | Expected result | Evidence |
|---|---|---|---|---|---|
| R-17 | Haklı iadeyi reddetmek | 14. gün kabul | DELIVERED, day=14 | ACCEPT | response + kayıt durumu |
| R-17 | Geç iadeyi kabul etmek | 15. gün ret | DELIVERED, day=15 | REJECT, state değişmez | response + state |
| R-17 | Teslim edilmemiş sipariş | Geçersiz durumdan iade | CREATED, day=2 | REJECT | response + state |

Bu tabloda **beklenti kuraldan** gelir. Örneğin API day=15 için ACCEPT döndürdüğünde testimizi ACCEPT'e çevirmek değil, failure/defect adayını araştırmak gerekir.

### Coverage kavramları

- **Requirement coverage:** Her gereksinimin en az bir testle bağlantılı olması (genişlik göstergesi).
- **Condition/partition/branch coverage:** Belirli bir test tekniğinin kapsama öğelerinin işletilme oranı.
- **Risk coverage:** Yüksek öncelikli risklerin uygun senaryolarla ele alınma durumu.

**%100 requirement coverage ≠ doğru oracle, yeterli boundary veya güvenlik testi.** Çok sayıda testle aynı basit şartı tekrar edip kritik senaryoyu kaçırmak mümkündür. Coverage metriğinde **pay, payda ve hangi öğelerin sayıldığı** belirtilmeli.

### Kanıt kalitesi

Yeniden üretilebilir kanıt örneği: sürüm/commit, ortam, test veri kimliği (kişisel veri olmadan), başlangıç state'i, aksiyon, beklenen-gerçek, timestamp, artefact bağlantısı, gerekli temizleme notu. Screenshot tek başına backend state'i kanıtlamaz.

**Önerilen QA alışkanlığı:** Bir defect raporunun yeniden üretim adımlarını başka bir mühendisin uygulayabilmesini hedefle.

## 3. Practical Scenario — kupon kuralını netleştirme

User story: “Üye kullanıcı olarak kampanya kuponumu sepetimde kullanmak istiyorum.”

Sorulacaklar: Kupon aynı anda kaç kez kullanılabilir? Süresi hangi timezone'da biter? Sepet alt limiti indirim öncesi mi sonrası mı? Kullanıcı kuponu art arda uygularsa ne olur? Kupon diğer indirimle birleşir mi?

Bu sorular yanıtlanmadan “geçerli kupon çalışır” testinin **expected result**'ı zayıftır. Ürün sahibiyle açık örnek ve karar tablosu oluşturulmalı. Gereksinim değişirse test basis ve ilgili testler izlenebilir biçimde güncellenir.

## 4. Interview Preparation

**Q1 (Foundation): What is a test oracle?**  
**A:** “A test oracle is a source used to determine the expected result. It can be an approved requirement, contract or validated domain rule. I avoid copying the current implementation's output as the expected value.”

**Q2 (Mid): How do you test ambiguous acceptance criteria?**  
**A:** “I record the ambiguity, propose concrete examples and clarify them with the accountable stakeholder. I make assumptions explicit and only then derive expected results and test cases.”  
**Follow-up:** What if no stakeholder is available? **Document assumptions and block or limit claims about correctness.**

**Q3 (Advanced): Why maintain traceability if you already have many automated tests?**  
**A:** “Test counts do not tell us which requirements and risks are supported. Traceability helps impact analysis, review of gaps and communication when a rule changes.”

## 5. CTFL Practice — özgün sorular

**S1 (K2):** “Bir siparişin son gününde iade kabulü” ifadesinden spesifik girdili örnek oluşturma hangi adımla en çok ilişkilidir?  
A) Test design · B) Test completion · C) Configuration management · D) Release deployment  
**Yanıt: A.** Analizde koşul belirlenir; tasarımda test case oluşturulur.

**S2 (K2):** Hangi kayıt traceability'nin doğrudan örneğidir?  
A) Her test dosyasının alfabetik sırası · B) R-17 → TC-14 → Run-82 → Defect-4 bağlantısı · C) Selenium sürümünün kaydı · D) Tester'ın toplantı sayısı  
**Yanıt: B.** Test basis ve ilgili çıktıların ilişkisini açıklar; diğerleri ilişki kurmaz.

**S3 (K2):** Spec “en fazla 14 gün” diyor, implementasyon 15 günü kabul ediyor. Test oracle için ilk tercih nedir?  
A) Mevcut kod çıktısı · B) Onaylı kuralın açıklaştırılmış yorumu · C) En sık görülen UI sonucu · D) Geliştiricinin tahmini  
**Yanıt: B.** Oracle bağımsız ve yetkili dayanak olmalıdır.

## Sonuç ve bağlantılar

İyi test: **neyi neden ölçtüğünü, doğru sonucun kaynağını ve gerçekte ne gözlediğini** ayırır.

Devam: [Equivalence Partitioning](../02-test-design-techniques/01-equivalence-partitioning.md) ve [Collaboration/ATDD](../02-test-design-techniques/07-collaboration-user-stories-and-atdd.md).

**Kaynak:** [ISTQB CTFL v4.0.1, §§1.4–1.5](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
