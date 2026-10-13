# White-box Testing — Statement & Branch Coverage

**Amaç:** Kodun çalıştırılan yapısal yollarını ölçmek, bu ölçümün neleri söyleyemediğini açıklamak.
**CTFL v4.0.1:** FL-4.3.1–4.3.3 (**K2**) ve FL-4.1.1 (K2).

## 1. Technical Foundation

**White-box (structure-based) testing:** Test tasarımının implementasyon veya iç yapı bilgisine dayandığı yöntemdir. **Black-box** beklenen davranışı dış sözleşmeden türetirken white-box hangi kod yapılarının işletildiğini gösterir; ikisi tamamlayıcıdır.

### Statement coverage

**Ölçü:** En az bir kez çalıştırılan **executable statements** / toplam executable statements × 100.

Örnek sözde kod:

~~~text
function shipping(total):
    fee = 5
    if total >= 100:
        fee = 0
    return fee
~~~

Bu örnekte amaç kod dosyasına otomasyon eklemek değil, kontrol akışını düşünmektir. Test **total=120** ile tüm gösterilen executable statement'lar çalışabilir; ama **total=20** için koşulun false tarafı denenmemiş olur. Araçların source-map, statement sayma ve branch metrikleri farklı olabilir; örnek yalnız zihinsel modeldir.

### Branch coverage

**Ölçü:** En az bir kez işletilen control-flow **branches** / toplam branches × 100. CTFL'de branch kavramı yalnız if'in true/false sonucu ile sınırlı değildir; control-flow graph'taki koşullu/koşulsuz geçişlerdir. Temel if örneğinde kararın **true** ve **false** yönlerini düşünmek yeterli bir başlangıçtır.

Yukarıdaki örnek:
- **total=120:** koşul true → fee=0.
- **total=20:** koşul false → fee=5.

İki test beraber kararın iki yönünü de işletir. Yalnız total=120, **statement coverage %100'e ulaşsa bile** branch açısından eksik kalabilir. Yalnız bir branch işletilmişse bu basitleştirilmiş karar için **1/2=%50**, ikisiyle **2/2=%100** olur; gerçek araç toplam branch ölçümünü kendi CFG'sine göre yapar.

**Önemli ilişki:** CTFL v4.0.1'e göre **%100 branch coverage ⇒ %100 statement coverage**; tersi doğru değildir. Fakat **%100 branch coverage da** bütün iş kurallarının, veri kombinasyonlarının, path'lerin ve hataların test edildiğini **kanıtlamaz**.

### Coverage ve correctness birbirinden farklıdır

Örnek hatalı kural: Sistem “100 € ve üzeri ücretsiz kargo” istiyor, implementasyon “100 € üstü” yapıyor.

total=120 ve total=20 testleri iki branch'i de çalıştırır, fakat **100** sınırını kaçırabilir. **BVA** eklemek gerekir. Diğer örnek: Ücretsiz kargo özelliği hiç implement edilmemişse bir kodun %100 statement ve branch çalıştırılması **missing requirement**'ı saptamayabilir.

## 2. Engineering Perspective

**Ne zaman kullanılır?** Küçük domain fonksiyonları, karmaşık conditional, hata yolları, refactoring sırasında gözlenmemiş branch'leri bulma; branch coverage raporu yeni test fikirleri üretebilir.

**Ne zaman yetersiz?** Gereksinim eksikliği, yanlış oracle, erişim politikası, veri bütünlüğü, performans ve kullanıcı ihtiyacı gibi riskler yapısal ölçümden doğrudan çıkmaz.

**Riskli davranış:** “Coverage %100 olsun” diye assert içermeyen veya değeri kontrol etmeyen test yazmak; koşulu çalıştırmak onun doğru çıktıyı verdiği anlamına gelmez. Coverage yüksekliği **gerekli ama tek başına yeterli olmayan** bazı kalite göstergelerinden biridir.

## 3. Practical Scenario — kritik eksik koşul

Policy: “Ücretsiz kargo sadece **aktif üyeye** ve **total ≥100** olduğunda.”

Kod yalnız total'ı kontrol edip üyelik koşulunu **hiç içermiyorsa**, mevcut kodun tamamı 100% covered olabilir. Bu **defect of omission** için solution: [Decision Table](03-decision-table-testing.md) ile aktif/pasif × eşik kombinasyonlarını onaylı kuraldan türet. Sonra uygulama kodu branch analizini ekle.

## 4. Interview Preparation

**Q1: What is the difference between statement and branch coverage?**  
**A:** “Statement coverage checks which executable statements ran. Branch coverage checks which control-flow branches ran. Full branch coverage subsumes statement coverage, but the reverse is not true.”

**Q2: Does 100% code coverage mean defect-free software?**  
**A:** “No. A test can execute code without asserting the correct behavior, and missing requirements may not exist in the implementation at all. I combine structural coverage with requirement-based testing.”

**Q3: How would you use a coverage report effectively?**  
**A:** “I inspect uncovered decision paths, assess their risk, add assertions and relevant data, and avoid optimizing the metric without improving the behavior we verify.”

## 5. CTFL Practice — özgün

**S1 (K2):** Bir test tüm executable statements'ları işletiyor, ancak if'in false sonucu hiç yaşanmıyor. En doğru ifade?  
A) Statement %100 olabilir, branch %100 olmayabilir · B) Branch mutlaka %100 · C) Test gereksiz · D) Product risk kalmaz  
**Yanıt: A.** Her statement'ın çalışması tüm yolların çalışmasını gerektirmez.

**S2 (K2):** CTFL'ye göre hangi kapsama ilişkisi doğrudur?  
A) %100 statement ⇒ %100 branch · B) %100 branch ⇒ %100 statement · C) %100 branch ⇒ %100 requirements · D) %100 branch ⇒ sıfır defect  
**Yanıt: B.** Branch daha güçlü yapısal ölçüttür; diğer iddialar yanlıştır.

**S3 (K2):** Kodda hiç bulunmayan gereksinim için en uygun ek kontrol?  
A) Aynı statement testini 20 kez tekrar etmek · B) Sözleşmeden black-box test türetmek · C) Test sayısını gizlemek · D) Sadece log formatını değiştirmek  
**Yanıt: B.** Missing-functionality riskini şartnameye karşı test etmeliyiz.

## Sonuç

**Code coverage = nerenin yürütüldüğüne dair gözlem. Behavior correctness = neyin doğru olduğuna dair doğrulama.** İkisini karıştırma.

Devam: [EP](01-equivalence-partitioning.md), [BVA](02-boundary-value-analysis.md), [Decision Table](03-decision-table-testing.md).

[ISTQB CTFL v4.0.1 §§4.1, 4.3](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
