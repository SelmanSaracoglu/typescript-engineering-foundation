# State Transition Testing

**Amaç:** Aynı olayın sistemin mevcut durumuna göre farklı sonuç vermesini modellemek ve geçerli/geçersiz geçişleri test etmek.
**CTFL v4.0.1:** FL-4.2.4 (**K3**).

## 1. Technical Foundation

**State (durum):** Sistemin belirli bir andaki işsel hali. **Event:** Durum geçişini başlatan olay. **Guard:** Olayın geçişe izin vermesi için gereken koşul. **Action:** Geçişin yan etkisi.

Örnek sipariş akışı:

- CREATED → ödeme başarılı → PAID
- PAID → kargoya ver → SHIPPED
- SHIPPED → teslim et → DELIVERED
- CREATED → iptal et → CANCELLED
- PAID → iptal et → CANCELLED (geri ödeme kuralı ayrıca açık olmalı)

State modelinde **aynı “cancel” olayı** SHIPPED durumunda geçersizken CREATED durumunda geçerlidir. Bir test yalnız girdiye değil başlangıç state'ine dayanır.

### Durum tablosu

| Current state | pay | ship | deliver | cancel |
|---|---|---|---|---|
| CREATED | PAID | — | — | CANCELLED |
| PAID | — | SHIPPED | — | CANCELLED |
| SHIPPED | — | — | DELIVERED | — |
| DELIVERED | — | — | — | — |
| CANCELLED | — | — | — | — |

**—** burada bu senaryo modelinde **geçersiz geçiş** anlamındadır; “yeni iş kuralı yok” anlamına gelmez. Geçersiz event yanıtının hata tipi ve state'in değişmemesi uygulama sözleşmesinde ayrıca tanımlanır.

### CTFL coverage ölçütleri

- **All states coverage:** Ziyaret edilen state / toplam state. Beş state'in dördü test edilmişse **4/5 = %80**.
- **Valid transitions coverage / 0-switch:** İşletilen geçerli tekil geçiş / tüm geçerli tekil geçiş. Bu tabloda **5 geçerli geçiş** var: CREATED→PAID, CREATED→CANCELLED, PAID→SHIPPED, PAID→CANCELLED, SHIPPED→DELIVERED. Dördü test edilmişse **4/5 = %80**.
- **All transitions coverage:** Tablodaki **geçerli ve geçersiz** durum-event çiftleri / toplam çift. Burada beş state × dört event = **20 hücre**, bunların 5'i valid, 15'i invalid. Örneğin 5 valid ve 8 invalid denenmişse **13/20 = %65**.

Bir test dizisi birden fazla geçiş işletebilir: CREATED → pay → PAID → ship → SHIPPED → deliver → DELIVERED. Ancak bu, CREATED→CANCELLED veya PAID→CANCELLED geçişlerini test etmez. Bazı geçersiz olayları aynı testte art arda denemek defect masking doğurabilir; ayrı değerlendirmek daha güvenlidir.

**Kapsam ilişkisi:** %100 all-transitions ⇒ %100 valid-transitions ve all-states. Tersi genel olarak geçerli değildir. CTFL'nin state tablosundaki kapsam öğelerini açık tanımlamadan yüzde hesaplama.

## 2. Engineering Perspective

**Uygun:** Sipariş, hesap kilitleme, ödeme, onay akışı, oturum yaşam döngüsü, cihaz bağlantısı, incident durumu. Event zamanlaması ve izin denetimi state'e bağlıysa özellikle güçlüdür.

**Yetersiz:** Sadece yaş aralığı gibi stateless alanlar için BVA daha basittir; çok sayıda bağımsız Boolean iş koşulunda decision table yararlıdır. State sayısı patlıyorsa önce test kapsamını anlamlı iş durumlarına daralt; keyfî UI detaylarını ayrı state yapma.

**Yaygın hatalar:** Başlangıç state'ini belirtmeden test yazmak; yalnız mutlu yolu çalıştırıp “tüm durumlar test edildi” demek; geçersiz event sonrasında DB state'ini doğrulamamak; transition coverage ile state coverage'ı karıştırmak.

## 3. Practical Scenario — Account lock

Varsayılan ve bu örneğe özel iş kuralı: ACTIVE hesaba üç ardışık başarısız girişten sonra LOCKED; LOCKED iken doğru parola bile giriş sağlamaz; admin unlock ile ACTIVE olur. Bu, her gerçek sistemin zorunlu davranışı değildir.

Test zinciri: ACTIVE → fail 1 → ACTIVE → fail 2 → ACTIVE → fail 3 → LOCKED → valid login → LOCKED + DENY → admin unlock → ACTIVE.

Burada yalnız ACTIVE/LOCKED state'lerine ulaşmak yeterli değildir. Yanlış parolaların sayılması, kilit sonrası doğru parolanın reddi ve unlock sonrası normal giriş ayrı **transition/guard** kontrolleridir.

## 4. Interview Preparation

**Q1: When do you use state transition testing?**  
**A:** “When behavior depends on the current state and a sequence of events, such as an order or account lifecycle. I test valid paths and invalid transitions, including persistence of state.”

**Q2: What is the difference between all-states and valid-transitions coverage?**  
**A:** “All-states coverage visits each state, whereas valid-transitions coverage exercises each allowed transition. Visiting every state may still miss transitions between states.”

**Q3: How do you test an invalid transition?**  
**A:** “I establish the initial state, trigger the disallowed event, assert the expected rejection and verify that the state and any side effects remain correct.”

## 5. CTFL Practice — özgün

**S1 (K3):** Yukarıdaki tabloda CREATED→PAID, PAID→SHIPPED, SHIPPED→DELIVERED yolu yürütüldü. Geçerli geçiş coverage oranı kaçtır?  
A) 3/5 = %60 · B) 3/4 = %75 · C) 4/5 = %80 · D) %100  
**Yanıt: A.** Beş geçerli geçişten üçü işletildi. Diğer iki iptal geçişi eksiktir.

**S2 (K2):** Tüm state'lerin ziyaret edilmiş olması neyi garanti etmez?  
A) Her state'in en az bir kez görüldüğünü · B) Her geçerli transition'ın çalıştırıldığını · C) State modelinin varlığını · D) State sayısının bilindiğini  
**Yanıt: B.** State coverage, transition coverage'dan zayıftır.

**S3 (K3):** Beş state ve dört event içeren örnek tablodaki tüm geçerli/geçersiz çiftler toplamı?  
A) 5 · B) 9 · C) 15 · D) 20  
**Yanıt: D.** 5×4=20; 5 valid, 15 invalid.

## Sonuç ve kaynak

State transition testing **geçmiş + mevcut durum + olay** ilişkisini test eder. Bir state'e erişmek o state'ten çıkan bütün geçişleri doğrulamak değildir.

Devam: [Decision Table Testing](03-decision-table-testing.md), [Experience-based Testing](05-scenario-negative-exploratory-testing.md).

[ISTQB CTFL v4.0.1, §4.2.4](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
