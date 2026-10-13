# I1 Çalışma Atölyesi — Kavramları birlikte kullanmak

> **Bu dosya isteğe bağlı ikinci aşamadır.** Önce [1–10. dersleri](../01-foundations/01-quality-testing-and-confidence.md) öğren. Burada kavramları gerçekçi bir gereksinimde birleştiriyoruz. İngilizce mülakat ve ISTQB CTFL tekrar soruları **yalnız burada**; ana derslerin akışını bölmez.

## A. Entegre vaka: MiniShop

Aşağıdaki kuralları ürün sahibi **onaylamış** olsun:

- **R1:** STANDARD gönderimde yalnız ACTIVE üyelerin, **indirim sonrası 100 € ve üzeri** sepetleri ücretsiz kargo hakkına sahiptir.
- **R2:** EXPRESS gönderim her durumda 10 €'dur.
- **R3:** STANDARD ücretli kargo 5 €'dur.
- **R4:** Tek kullanımlık kupon, başarılı sipariş oluşturulduğunda USED olur; USED kupon sonraki sipariş için kullanılamaz.
- **R5:** Kullanıcı yalnız kendi siparişini görüntüleyebilir.

> Bunlar eğitim için uydurulmuş iş kurallarıdır; gerçek bir projedeki ödeme, vergi veya güvenlik kontratı olduğu varsayılmamalıdır.

### Adım 1 — Gereksinimden risk çıkar

| Risk | Neden önemli? | Temel kanıt |
|---|---|---|
| Kargo eşiği yanlış hesaplanıyor | Haksız ücret / gelir kaybı | 99,99 / 100,00 / 100,01 |
| Üyelik ve gönderim koşulları yanlış birleşiyor | İş kuralı ihlali | Karar kombinasyonları |
| Kupon iki kere kullanılıyor | Finansal tutarsızlık | İkinci kullanım reddi ve state korunması |
| Sipariş başka kullanıcıya açılıyor | Gizlilik ve güvenlik | Ret + başka hesap verisi görünmemesi |

Burada **test sayısı değil, olumsuz sonucu görünür kılacak kanıt** seçiyoruz.

### Adım 2 — EP ile sınıflandır

Sepet tutarı bakımından: **<100 €** ve **≥100 €** iki iş sınıfıdır. Üyelik ACTIVE/INACTIVE; gönderim STANDARD/EXPRESS ayrı davranış gruplarıdır. Tek başına bu sınıflar **tüm kombinasyonları kapsamaz**.

### Adım 3 — BVA ile kritik geçişi yakala

Para iki ondalık basamakta tanımlanmış olsun. Alt eşiğin 3-value seti:

**99,99 → ücretli; 100,00 → ücretsiz; 100,01 → ücretsiz**

Ama bu örnekler yalnız **ACTIVE ve STANDARD** koşulunda geçerlidir. INACTIVE üye için 100,01 hâlâ ücretlidir. **Oracle, koşullardan bağımsız uydurulmaz.**

### Adım 4 — Decision table oluştur

| Active? | Total ≥100? | Express? | Expected shipping |
|---|---|---|---|
| T | T | F | 0 € |
| T | F | F | 5 € |
| F | T | F | 5 € |
| F | F | F | 5 € |
| T | T | T | 10 € |
| T | F | T | 10 € |
| F | T | T | 10 € |
| F | F | T | 10 € |

Sekiz feasible kombinasyon var. EXPRESS=T satırları aynı sonuç verdiğinden birleştirilebilir; ancak farklı kullanıcı segmentlerinde yüksek risk varsa temsilci kontroller korunabilir.

### Adım 5 — State transition kur

Kupon durumları: **AVAILABLE → (başarılı sipariş) → USED**.

- AVAILABLE iken henüz başarısız ödeme: R4'e göre durum ne olmalı? **Kural eksik olabilir**; başarılı sipariş dışında tüketilmeyeceği belirtilmiş olsa da rezervasyon davranışı netleştirilmeli.
- USED iken ikinci kullanım: **REJECT; ikinci indirim kaydı oluşmaz**.
- Ağ kesilince tekrar gönderim: **tek işlem garantisi** gerekip gerekmediği API kontratında netleştirilmeli.

### Adım 6 — Negative ve exploratory ekle

**Negative:** A kullanıcısı B'nin siparişini görüntülemeye çalışır → ret; hiçbir sipariş detayı açığa çıkmaz.

**Exploratory charter (15 dk):** Kuponun iki sekmede uygulanması, checkout geri navigasyonu ve bağlantı timeout'u sırasında kupon state'inin tutarlılığını araştır. Test hesabı ve sahte ödeme ortamı kullan; tekrar üretim notu tut.

### Adım 7 — Evidence / release notu

“R1–R3 için sınır ve kombinasyon testlerini doğruladık; R4 için ikinci kullanım, R5 için ownership kontrolünü sınadık. Ağ timeout sonrasında kupon rezervasyon davranışının gereksinimi açık değil; bu alan için daha fazla kanıt ve ürün kararı gerekiyor.”

Bu not **ne yapıldığını ve ne yapılmadığını** aynı anda söyler. “Tüm testler pass, ürün kusursuz” demez.

---

## B. Yeni problem: rehbersiz çözüm

**Kural:** Dosya yükleme servisi yalnız `PDF` ve `PNG` tiplerini, **1–10 MB dahil** boyutta kabul eder. Yalnız ACTIVE kullanıcı yükleyebilir. Dosya gönderildikten sonra `PENDING` → `APPROVED` veya `REJECTED` geçişine sahiptir; terminal durumdan yeniden karar verilmez.

**Yapılacaklar:** (1) EP sınıflarını tanımla, (2) tam sayı MB olarak kabul edilmişse 2-value BVA oluştur, (3) aktiflik × dosya tipi × boyut uygunluğu kararına dört anlamlı test seç, (4) iki invalid transition yaz, (5) bir negatif security riski ekle.

### Örnek değerlendirme

1. Tip: PDF ve PNG, aynı kabul davranışı varsa tek **desteklenen formatlar** partition'ında temsil edilebilir; farklı teknik işlenme yolları varsa ayrı alt sınıflar ve testler gerekir. Diğer formatlar INVALID. Boyut: <1, 1–10, >10; kullanıcı: ACTIVE/INACTIVE. Format parser ve null davranışı ek risk olabilir.
2. Tam sayı MB: **0, 1, 10, 11**. Gerçek dosya boyutu byte ise MB ölçütü ve hassasiyet tanımlanmadan doğrudan bunu kullanmak risklidir.
3. Örnek testler: ACTIVE+PDF+5→ACCEPT; ACTIVE+PNG+10→ACCEPT; ACTIVE+PDF+11→REJECT; INACTIVE+PDF+5→REJECT. **Bu dört test tüm kombinasyonları kapsamaz**; yalnız seçilmiş kuralları doğrular.
4. APPROVED → REJECTED ve REJECTED → APPROVED denemeleri invalid; state değişmemeli.
5. A kullanıcısı B'nin yüklediği belgeyi indirmeye çalışır → erişim reddedilmeli; B'nin belgesi açığa çıkmamalı (indirme yetkisi için ürün/güvenlik sözleşmesi netleştirilmeli).

**Önemli:** Bu örnek tek “doğru test seti” olduğunu iddia etmez. Test koşullarının gerekçesi, oracle ve görünmeyen riskleri açıklamak esas.

---

## C. English interview rehearsal

Bu cevaplar **hazır kişisel deneyim hikâyesi değil**, teknik düşünme örnekleridir. Önce soruyu kendin yanıtla; sonra örnek cevabı karşılaştır.

**1 — What does successful testing actually prove?**  
“It gives evidence about the conditions and risks we tested, not proof that the entire product is defect-free. I describe the scope, environment, oracle, and residual risks.”

**2 — What is the difference between verification and validation?**  
“Verification checks conformity to specified requirements. Validation checks whether the product meets real stakeholder needs in the intended context. Both matter.”

**3 — How do you derive a test case from an unclear requirement?**  
“I identify the ambiguity, ask for concrete examples, agree on the expected behavior with the relevant stakeholder, and only then select data and assertions.”

**4 — Equivalence partitioning versus boundary value analysis?**  
“Equivalence partitioning groups values expected to behave alike. Boundary value analysis focuses on the transitions between ordered partitions, where off-by-one defects often occur.”

**5 — When would you choose a decision table?**  
“When behavior depends on a combination of conditions. It helps reveal missing or contradictory rules and provides a systematic basis for tests.”

**6 — Why test state transitions?**  
“Because the same event may be valid in one state and invalid in another. I check the expected transition and verify that invalid operations do not create side effects.”

**7 — Is exploratory testing random clicking?**  
“No. I use a clear charter, learn from observations, adapt the next experiments, and keep reproducible evidence.”

**8 — Why is 100% branch coverage not enough?**  
“Structural coverage tells us which branches executed, not whether the expected behavior was correct or whether all business requirements were implemented.”

**9 — What is a good acceptance criterion?**  
“It states observable behavior with clear conditions and outcomes. A team should be able to derive concrete examples without guessing the oracle.”

**10 — What would you say if all tests pass but critical risks remain untested?**  
“I would report the passed scope and the unresolved risks explicitly. Release risk acceptance belongs to the accountable stakeholders, supported by transparent test evidence.”

---

## D. ISTQB Foundation sınavına yönelik isteğe bağlı tekrar

Bu bölüm **CTFL müfredatını ders başlıklarına dayatan bir etiket sistemi değildir**. I1'de öğrendiğimiz temel fikirlerin çoktan seçmeli soruyla ölçülmesine yarar. Sorular **özgündür**, resmî sınav sorusu değildir. K1=hatırlama, K2=anlama, K3=uygulama.

**Önce soruları yanıtla, sonra cevap anahtarını oku.**

**S1 (K2).** “Bütün testler geçti, yazılımda kusur yoktur” cümlesine en doğru itiraz?  
A) Testler hiçbir işe yaramaz · B) Testler yalnız yürütülen koşullarda kanıt sağlar · C) Kod coverage her zaman sıfırdır · D) QA olmadan test yapılamaz

**S2 (K2).** Onaylı requirement'a uygun çalışan uygulama gerçek kullanıcı ihtiyacını karşılamıyor. Bu öncelikle hangi ayrımı gösterir?  
A) Verification ile validation · B) Smoke ile regression · C) Unit ile component · D) Statement ile branch

**S3 (K3).** Sadece 18–65 dahil tam sayı kabul edilen alanda üç sayısal EP sınıfının hepsini hangi set temsil eder?  
A) {18,32,65} · B) {17,32,66} · C) {20,30,60} · D) {17,18,19}

**S4 (K3).** Aynı alan için tam 2-value BVA seti?  
A) {18,65} · B) {17,18,65,66} · C) {17,19,64,66} · D) {17,18,19,64,65,66}

**S5 (K3).** Aynı alan için tam 3-value BVA seti?  
A) {17,18,19,64,65,66} · B) {17,18,65,66} · C) {18,19,64,65} · D) {17,18,65}

**S6 (K3).** İki bağımsız Boolean koşulun dört uygulanabilir karar sütunundan üçü test edildi. Decision table coverage?  
A) %50 · B) %66,7 · C) %75 · D) %100

**S7 (K2).** Decision table'daki “don't care (—)” ne demektir?  
A) Kombinasyon imkânsız · B) Bu kuralda koşul sonuç için önemsiz · C) Test failed · D) Bilinmeyen expected result

**S8 (K2).** Tüm state'ler ziyaret edilmiş ama bir valid transition hiç işletilmemiş. Hangisi doğru?  
A) Valid-transition coverage zorunlu %100 · B) State coverage %100 iken valid-transition coverage daha düşük olabilir · C) Model geçersizdir · D) Test otomatik başarısız sayılır

**S9 (K2).** Önceki defect tecrübelerinden hareketle çok hızlı iki ödeme isteğini denemek hangi tekniğe örnek?  
A) Branch testing · B) Error guessing · C) Equivalence partitioning · D) Static review

**S10 (K2).** Testçi yürütme sırasında öğrenip bir sonraki testi tasarlıyor.  
A) Exploratory testing · B) Yalnız scripted testing · C) Configuration management · D) Test completion

**S11 (K2).** Hangi ifade doğrudur?  
A) %100 statement daima %100 branch demektir · B) %100 branch, %100 statement gerektirir; doğruluğu garanti etmez · C) %100 branch tüm iş kurallarını kapsar · D) Hiçbiri

**S12 (K2).** ATDD'ye en uygun başlangıç?  
A) Kodun bugünkü davranışını doğru saymak · B) Stakeholder'larla kabul örneklerinde implementasyondan önce uzlaşmak · C) Önce selector yazmak · D) Sadece E2E raporuna bakmak

### Açıklamalı cevap anahtarı

| Soru | Yanıt | Gerekçe |
|---|---|---|
| S1 | **B** | Test sonuçları, çalışılan durumların sınırlarında kanıttır; A/C/D mantıksal olarak ilgisiz veya aşırıdır. |
| S2 | **A** | Şartnameye uyum ve gerçek ihtiyaca uygunluk farklı sorulardır. |
| S3 | **B** | 17 alt-invalid, 32 valid, 66 üst-invalid. A/C yalnız valid; D üst-invalid'i atlar. |
| S4 | **B** | İki geçişte boundary ve diğer partition'daki en yakın komşular gerekir. D 3-value setidir. |
| S5 | **A** | Her sınırın iki komşusu vardır; diğer şıklar öğe eksiltir. |
| S6 | **C** | 3/4 = %75; satır veya condition sayılmaz. |
| S7 | **B** | “—” sonuç açısından önemsiz koşuldur; imkânsız kombinasyon ile aynı değildir. |
| S8 | **B** | Bütün state'ler görülse de bütün geçerli geçişler denenmemiş olabilir. |
| S9 | **B** | Geçmiş kusur örüntüsünden hipotez üretilmiştir. |
| S10 | **A** | Öğrenme, tasarım ve yürütme birlikte gelişir. |
| S11 | **B** | Yapısal kapsamın daha güçlü olması tüm davranışı doğrulamaz. |
| S12 | **B** | ATDD önce ortak kabul davranışını somutlaştırır. |

### Sınav notu

CTFL v4.0.1 Chapter 1 ve Chapter 4 için ilgili konulara çalıştık. **Müfredatın diğer bölümleri ve resmî örnek sınavlar henüz tamamlanmadı**; bu 12 soruyu çözmek sınava hazır olma kanıtı değildir.

Resmî kaynaklar:
- [CTFL sertifikasyon ve örnek sınav sayfası](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISTQB Glossary](https://glossary.istqb.org/)

## E. Öz değerlendirme

Bir konuyu gerçekten anladığına dair en güçlü işaret yalnız açıklamayı tanımak değildir. Daha önce görmediğin bir kuralda:
1. **Doğru expected result kaynağını** bulabilmen;
2. **Neyi neden test edeceğini** gerekçelendirebilmen;
3. **Sınırlı test verisini** mantıkla seçebilmen;
4. **Kalan riski** açıkça söyleyebilmen;
5. **Failure ile hipotezi** ayırabilmendir.

Bu dosyanın hazırlanması veya örnek cevapların okunması bağımsız uygulamalı yeterlilik kanıtı değildir.
