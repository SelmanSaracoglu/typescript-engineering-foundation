# Equivalence Partitioning (EP)

**Amaç:** Büyük girdi alanını davranışça eşdeğer sınıflara ayırarak az ama anlamlı veriyle test tasarlamak.  
**ISTQB CTFL v4.0.1:** FL-4.2.1 (**K3**, verilen gereksinimden test türetme).

## 1. Technical Foundation

**Equivalence partition**: Yazılımın aynı şekilde işlemesi beklenen değerlerin oluşturduğu, birbiriyle örtüşmeyen, boş olmayan sınıf. EP bir **black-box** tekniğidir; sınıfları davranış sözleşmesine göre seçeriz, mevcut kodun iç yapısına göre değil.

İş kuralı: Yaş, yalnız tam sayı olarak ve **18–65 dahil** kabul edilir.

| Partition | Küme | Temsilci | Beklenen |
|---|---|---:|---|
| P1 | 18'den küçük tam sayılar | 16 | REJECT |
| P2 | 18–65 arası tam sayılar | 35 | ACCEPT |
| P3 | 65'ten büyük tam sayılar | 70 | REJECT |

Örnek test seti: **16, 35, 70**. Bu üç değer tanımlanmış üç sayısal partition'ı en az bir kez işletir. Ancak girdi sözleşmesi boş, null, ondalık veya harfli string için farklı hata davranışı öngörüyorsa bunlar da ayrı partition olabilir. “Geçerli tek bir sınıf, geçersiz tek bir sınıf” diye otomatik genelleme yapma.

### Uygulama adımları

1. Test basis'i ve input domain'ini belirle.
2. Farklı beklenen davranışlara göre **örtüşmeyen** sınıflar tanımla.
3. Her sınıfın oracle'ını, yani expected result kaynağını doğrula.
4. Her sınıfın bir temsilcisini seç; geçersiz durumları mümkünse birbirinden bağımsız test et.
5. Her partition'ın işletilip işletilmediğini kaydet.
6. Kritik sınırlar veya kombinasyonlar varsa BVA / decision table ile tamamla.

**EP coverage = en az bir testle işletilen partition sayısı / tanımlı toplam partition sayısı × 100.** Üçten ikisi işletildiyse **2/3 = %66,7**; invalid sınıflar da sayılır.

### Çok parametreli alanlarda Each Choice

İki parametre olsun: yaş sınıfları (3) ve müşteri tipi (STANDARD / BUSINESS, 2). **Each Choice** her parametrede her partition'ın en az bir kez görünmesini ister. Bu kriter **3×2=6 kombinasyonun tamamını** otomatik garanti etmez. Özel kombinasyon kurallarını decision table ile değerlendirmek gerekebilir.

## 2. Engineering Perspective

**Ne zaman uygun?** Sayısal giriş aralıkları, roller, kupon türleri, ödeme statüsü kategorileri, hata sınıfları ve kontratın farklı tepki verdiği veri alt kümeleri.

**Ne zaman yetersiz?** Sınırdaki yanlış operatörü yakalamak için [BVA](02-boundary-value-analysis.md); birden fazla iş koşulu birlikte sonucu belirliyorsa [Decision Table](03-decision-table-testing.md); geçmiş durum belirleyiciyse [State Transition](04-state-transition-testing.md) gerekir.

**Yaygın hatalar:**
- Rastgele değer listesini partition zannetmek.
- Üst/alt invalid sınıfı unutmak.
- “Bütün valid değerler aynıdır” varsayımını doğrulamamak; BASIC/PREMIUM gibi farklı kurallar varsa ayrı sınıf gerekir.
- Tüm invalid koşulları tek testte vermek: İlk reddedilen alan diğer kusurları maskeleyebilir.
- EP %100 sonucunu genel test kapsamı %100 diye sunmak.

## 3. Practical Scenario — Kupon tipi

Kural: “BASIC kupon %5; PREMIUM kupon %10 indirim sağlar. Bilinmeyen tür reddedilir.”

| Partition | Input | Expected |
|---|---|---|
| P1 | BASIC | 5% |
| P2 | PREMIUM | 10% |
| P3 | UNKNOWN | REJECT |

BASIC ve PREMIUM ikisi de “valid” olmasına rağmen **aynı expected outcome'u üretmediği için ayrı sınıflardır**.

**Ek risk:** Aynı kuponun iki kez kullanılması bir state / iş akışı problemidir; EP tek başına bunu kanıtlamaz.

## 4. Interview Preparation

**Q1: What is equivalence partitioning?**  
**A:** “It divides test data into groups that are expected to behave in the same way. I choose representative values from valid and invalid partitions to reduce redundant tests.”  
**Follow-up:** Is one example from every partition always sufficient? **It is the baseline for partition coverage, not a guarantee against all defects.**

**Q2: How would you test an integer age field accepting 18 through 65?**  
**A:** “I would select representatives below 18, within 18–65, and above 65. I would also check invalid formats and missing values if the input contract defines separate behavior for them.”

**Q3: Why combine EP with BVA?**  
**A:** “EP identifies behavioral groups. BVA tests the transitions between ordered groups, where inclusive/exclusive defects frequently appear.”

## 5. CTFL Practice — özgün sorular

**S1 (K3):** Sadece 1–10 dahil tam sayı kabul eden alan için sayısal üç partition'ın her birini hangi veri seti temsil eder?  
A) {1,2,10} · B) {0,5,11} · C) {4,6,9} · D) {0,11,12}  
**Yanıt: B.** 0 alt-invalid, 5 valid, 11 üst-invalid. A üst-invalid'i; C her iki invalid'i; D valid sınıfı içermez.

**S2 (K3):** Dört tanımlı partition'dan üçü işletilmişse EP coverage?  
A) %25 · B) %50 · C) %75 · D) %100  
**Yanıt: C.** 3/4.

**S3 (K2):** İki input'ın her partition'ı en az bir kez kullanıldı ama bazı kombinasyonlar yok. Doğru ifade hangisi?  
A) Each Choice sağlanmış olabilir, kombinasyon coverage garanti değildir · B) Bütün kombinasyonlar tamamdır · C) White-box zorunludur · D) Partition'lar otomatik geçersizdir  
**Yanıt: A.** Each Choice, all-combinations değildir.

## Sonuç ve bağlantılar

EP'nin değeri **davranışça anlamlı veri sınıfları** çıkarmaktır. Aralık uçları için [Boundary Value Analysis](02-boundary-value-analysis.md), çok koşullu mantık için [Decision Table](03-decision-table-testing.md).

**Kaynak:** [ISTQB CTFL v4.0.1 §4.2.1](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). Sorular ve örnekler özgündür.
