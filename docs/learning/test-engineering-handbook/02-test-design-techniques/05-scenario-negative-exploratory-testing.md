# Scenario, Negative & Experience-based Testing

**Amaç:** Biçimsel tekniklerin kaçırabileceği gerçek kullanım, hata ve istismar biçimlerini anlamlı test hipotezleriyle araştırmak.
**CTFL v4.0.1:** FL-4.1.1 (K2), FL-4.4.1–4.4.3 (K2). **Not:** Use-case testing CTFL v4.0.1'in ayrı bir test tekniği değildir; aşağıda genel mühendislik yaklaşımı olarak yer alır.

## 1. Technical Foundation

### Test tasarım tekniklerini ayırmak

- **Black-box:** Sistemin dış davranışına ve beklenen sözleşmesine dayanır: EP, BVA, decision table, state transition.
- **White-box:** Kodun/akışın iç yapısını inceler: statement, branch coverage. [Ayrı bölüm](06-white-box-statement-and-branch-testing.md).
- **Experience-based:** Testçinin alan, geçmiş kusur ve hata örüntüsü bilgisine dayanır: **error guessing**, **exploratory testing**, **checklist-based testing**. Bu teknikler diğerlerinin **tamamlayıcısıdır**.
- **Scenario/use-case journey:** Gerçek bir hedefe ulaşmak için kullanıcı adımlarını uçtan uca anlamlandırma. CTFL'nin §4.4'ündeki resmî üç teknikle karıştırma.

### Negative testing nedir?

**Negative testing**, geçersiz, yetkisiz veya izin verilmeyen davranışta sistemin **beklenen güvenli tepkiyi** verip vermediğini kontrol etmektir. Yalnız boş input değildir.

Örnekler: yanlış format, süresi dolmuş kupon, başka kullanıcının kaydına müdahale, yinelenen ödeme isteği, iptal edilmiş siparişe teslimat event'i. Negatif testin oracle'ı; kabul edilebilir response, yan etki yokluğu ve gerekliyse log/audit davranışı bulunur.

### Error Guessing

Geçmiş üretim hatalarından, teknoloji ve insan hata eğilimlerinden yararlanarak şüpheli koşulları tahmin etme: UTC/local time karışması, iki kez tıklama, boş string ile null farkı, eski oturumun yeniden kullanılması.

Gücü uzman sezgisidir; sınırı sezginin sınırlı, sistematik coverage ölçümünün zayıf olmasıdır.

### Exploratory Testing

**Eşzamanlı öğrenme, test tasarlama ve yürütmedir.** “Rastgele tıklamak” değildir.

Örnek **charter**: “20 dakika içinde kuponun hata mesajlarını, hızlı tekrar gönderimi ve mobil geri navigasyonu araştır; bulgu, gözlem ve yeni soru kaydet.”  
Elde edilen kanıt: kullanılan build, başlangıç data/state, denenen varyasyonlar, gözlemler, defect adayı ve sonraki hipotez. Önceki senaryodan yeni şüphe doğdukça tasarım değişir.

### Checklist-based Testing

Önceki deneyimden türetilmiş **kontrol maddeleri** ile test yürütme: zorunlu alanlar, hata mesajları, yetki, erişilebilirlik, tarih, tekrar istek, gizli veri, recovery.

Liste odak sağlar ancak **her ürün için aynı checklist yeterli değildir**; eski veya belirsiz maddeler güncellenmelidir. Checklist, katı adım-adım test case ile aynı değildir.

## 2. Engineering Perspective

| Problem | İlk güçlü yaklaşım | Tamamlayıcı |
|---|---|---|
| Yaş aralığı | EP + BVA | Hatalı format, null |
| Kupon şartlarının kombinasyonu | Decision table | Error guessing: eşzamanlı uygulama |
| Sipariş lifecycle | State transition | Exploratory: geri navigasyon |
| Kodda beklenmeyen dal | White-box | Black-box gereksinim kontrolü |
| Yeni UI akışı | Senaryo tabanlı | Exploratory + checklist |

**Önemli:** Her şeyi E2E üzerinden test etmek pahalı ve kök neden teşhisini zorlaştırabilir. Senaryo doğru bağlamı kurar; detaylı seviye seçimi I2'nin konusudur.

### False positive / false negative düşüncesi

Gözlenen kusur adayı bazen test verisi veya ortam farkından kaynaklanır; her başarısızlık ürün kusuru değildir. Öte yandan eski testler yeni iş kuralını hiç kontrol etmiyorsa sessiz false confidence oluşur. Hipotezi, kanıtı ve doğrulanamayan kısmı ayır.

## 3. Practical Scenario — kuponu keşfetme

Kural: “Tek kullanımlık kupon yalnız ödeme yapılmamış sepette kullanılabilir.”

**Senaryo A (nominal):** Geçerli kupon → fiyat güncellenir → ödeme tamamlanır → sipariş tek indirimle kaydedilir.

**Negatif B:** Aynı kupon başka siparişte yeniden kullanılır → REJECT, indirim/kayıt oluşmaz.

**Exploratory C:** Kullanıcı hızlı çift tıklar, geri gider, sekmeyi kopyalar, oturum yenilenir, düşük internet hızında tekrar dener. Beklenti net değilse bunları product sahibine açık soru olarak döndür.

**Checklist D:** State değişimi, error message, idempotency/retry, ownership, audit, mobil network, erişilebilirlik, para yuvarlama.

“Yalnız API 400 döndü” kanıtı yeterli olmayabilir: başarısız işlemin DB'de indirim yaratmadığını da incelemek gerekir (bu inceleme sonraki uygulama Epiclerine aittir).

## 4. Interview Preparation

**Q1: What is exploratory testing?**  
**A:** “It combines learning, designing and executing tests. I work with a time-boxed charter, take notes on observations and risks, and follow useful clues rather than clicking randomly.”

**Q2: How is negative testing different from entering invalid text?**  
**A:** “Negative testing covers any disallowed or failure condition, including unauthorized access, invalid state transitions, duplicate operations and system errors. I also verify the absence of unintended side effects.”

**Q3: How do you use error guessing without relying only on intuition?**  
**A:** “I derive heuristics from past defects and architecture risks, combine them with structured techniques, and keep evidence of what was explored and what remains uncovered.”

## 5. CTFL Practice — özgün

**S1 (K2):** Tester geçmişte çoklu ödeme hatası gördüğü için yeni checkout'ta hızlı çift tıklamayı deniyor. Hangi CTFL tekniği?  
A) Equivalence partitioning · B) Error guessing · C) Statement testing · D) State coverage  
**Yanıt: B.** Önceki kusur örüntüsüne dayanıyor. Diğer tekniklerde farklı coverage öğeleri kullanılır.

**S2 (K2):** Keşif oturumunda tester hipotezi değiştirerek yeni adımları aynı anda tasarlayıp uyguluyor.  
A) Exploratory testing · B) Sabit scripted testing · C) Branch testing · D) Test completion  
**Yanıt: A.** Tasarım ve yürütme birlikte gelişir; plansızlık anlamına gelmez.

**S3 (K2):** Checklist yaklaşımının sınırlaması nedir?  
A) Yalnız otomasyonla uygulanabilir · B) Maddeler güncellenmezse yeni riski atlayabilir · C) Risk düşüncesini tamamen kaldırır · D) Doğru sonuç gerektirmez  
**Yanıt: B.** Liste yararlı fakat bağlam ve güncellik gerektirir.

## Sonuç ve kaynak

Struktürel test teknikleri **neyi kapsadığını**, deneyime dayalı yaklaşım **hangi beklenmedik durumun akla gelebileceğini** destekler; ikisi birbirinin yerine geçmez.

Devam: [White-box](06-white-box-statement-and-branch-testing.md), [State Transition](04-state-transition-testing.md).

[ISTQB CTFL v4.0.1 §§4.1, 4.4](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
