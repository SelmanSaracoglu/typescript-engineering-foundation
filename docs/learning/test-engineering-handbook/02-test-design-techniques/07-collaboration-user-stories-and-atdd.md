# Collaboration-based Testing — User Stories, Acceptance Criteria & ATDD

**Amaç:** Tester, geliştirici ve iş paydaşının ortak dil geliştirip test edilebilir kabul örneklerini implementasyondan önce belirlemesi.
**CTFL v4.0.1:** FL-4.5.1 **K2**, FL-4.5.2 **K2**, FL-4.5.3 **K3**.

## 1. Technical Foundation

### User story ve 3C

User story çoğunlukla “**As a [role], I want [goal], so that [benefit]**” biçimindedir; kısa hikâye tek başına tam requirement değildir.

**3C (Card, Conversation, Confirmation):**
- **Card:** İş hedefinin kısa ifadesi.
- **Conversation:** Ürün sahibi, developer ve tester'ın örnek/istisna konuşması.
- **Confirmation:** Kabul koşullarının doğrulanabilir hale gelmesi.

Tester'ın rolü yalnız story'ye test case yazmak değildir. Belirsizliği ve karşı örnekleri erken ortaya çıkarır.

### Acceptance Criteria (AC)

AC, user story'nin kabul edilmesi için gerekli koşullardır. İki yaygın biçim:
1. **Rule-oriented:** İş kuralları/bullet veya karar tablosu. Örn. “Active member and cart ≥100 → free shipping.”
2. **Scenario-oriented:** **Given / When / Then** ile somut örnek. Örn. “Given active member and cart 120; When checkout is calculated; Then shipping fee is zero.”

Bu biçimler alternatif sunumdur; ikisi de açık, test edilebilir, çelişkisiz olmalı. Given/When/Then tek başına Cucumber veya otomasyon zorunluluğu yaratmaz.

### Acceptance Test-driven Development (ATDD)

ATDD, **önce kabul testlerini tanımlayan, sonra geliştirmeyi bu ortak örneklere göre yöneten** test-first yaklaşımıdır:

1. Bir story, ilgili paydaşlarla tartışılır.
2. Pozitif, negatif ve sınır örneklerinden somut acceptance tests türetilir.
3. Beklenen sonuçlar **kod yazılmadan önce** netleştirilir.
4. Uygulama bu örnekleri karşılayacak şekilde geliştirilir.
5. Değişiklik olduğunda kabul örnekleri yeniden ele alınır.

**Farklar:** TDD genelde küçük kod davranışlarını testle yönlendirir; ATDD iş kabulünü ortak örneklerle tanımlar. BDD davranışın anlaşılır senaryo dilini vurgular. Bunlar ilişkili ama birebir aynı süreç değildir.

## 2. Engineering Perspective

### İyi story / AC nasıl görünür?

İyi AC belirli actor/permission, başlangıç state'i, input, eşik, expected outcome ve gerektiğinde side effect'i açıklar. “İşlem hızlı olacak” tek başına ölçülebilir değildir; “95. yüzdelikte 2 s, X yük/ortam koşulu” gibi onaylı, doğrulanabilir kural gerekebilir.

### Mühendislik değeri

- Kusur oluşmadan önce yanlış varsayımları tespit etmek (**shift-left**).
- Test oracle'ı bağımsız bir anlaşmaya dayandırmak.
- Sorumluluklar arasında ortak örnek/veri dili oluşturmak.
- Story değiştiğinde test impact analizini kolaylaştırmak.

**Sınır:** AC listesi her güvenlik/performans riskinin tamamı değildir. AC kabul için gereklidir; bağımsız risk ve exploratory testing hâlâ değerlidir.

## 3. Practical Scenario — ATDD ile test türetme

**Story:** “Bir müşteri olarak sepetimdeki ürünler için ücretsiz kargo hakkımı görmek istiyorum.”

**Üzerinde anlaşılan kural:** Sadece ACTIVE üye için, sepet toplamı **100 € veya üstü** ise ücretsiz kargo. Express teslimat ücretsiz kargo kapsamında değildir.

**Acceptance examples:**

| ID | Active? | Total | Express? | Expected shipping |
|---|---|---:|---|---|
| AT1 | Y | 120 | N | FREE |
| AT2 | Y | 99 | N | PAID |
| AT3 | Y | 100 | N | FREE |
| AT4 | N | 120 | N | PAID |
| AT5 | Y | 120 | Y | PAID |

Burada **AT3** inclusive boundary'yi; **AT4** kimlik/üyelik istisnasını; **AT5** express override'ını sınar. Çıktı yanlışsa mevcut kodun yaptığına göre beklentiyi düzeltme; kararlaştırılan kuralı kontrol et.

**Given/When/Then örneği:**

~~~gherkin
Scenario: Active member qualifies for free standard shipping
  Given an active member has a basket total of 100 EUR
  And standard shipping is selected
  When shipping is calculated
  Then the shipping fee is 0 EUR
~~~

Bu, iş davranışını anlatır. CSS selector, buton koordinatı veya uygulama iç method adlarını test kabul cümlesine gömmek gerekmez.

### Açık soru örnekleri

Vergi ve kupon öncesi/sonrası sepet tutarı hangisi? Üyelik checkout sırasında değişirse? İndirim sonradan iade edilirse? Bu sorular için onay gelmeden yeni expected result **uydurma**.

## 4. Interview Preparation

**Q1: How do you contribute to writing user stories?**  
**A:** “I work with product and engineering stakeholders to clarify behavior through examples, edge cases and business rules. We turn the discussion into testable acceptance criteria.”

**Q2: What is ATDD?**  
**A:** “ATDD is a test-first collaborative approach. We agree on concrete acceptance examples before implementation, and those examples guide development and validation.”

**Q3: What makes acceptance criteria testable?**  
**A:** “They describe observable behavior, clear conditions and expected outcomes. I avoid subjective wording and ask for decisions on ambiguities before deriving tests.”

## 5. CTFL Practice — özgün

**S1 (K2):** “Given/When/Then ile senaryo” hangi acceptance criteria biçiminin örneğidir?  
A) Rule-oriented · B) Scenario-oriented · C) Code-oriented only · D) Statement coverage  
**Yanıt: B.** İş senaryosu anlatımıdır; mutlaka otomasyon scripti değildir.

**S2 (K3):** “Aktif kullanıcı 100 € ve üzeri standart kargoda ücretsiz” AC'si için alt eşikte hangisi en anlamlı çift?  
A) 99 → PAID, 100 → FREE · B) 1 → FREE, 500 → FREE · C) 100 → FREE, 200 → FREE · D) 99 → FREE, 100 → PAID  
**Yanıt: A.** Şartnamenin inclusive threshold kuralını ayırır. B ve C alt sınırda değişen sonucu test etmez; D yanlış oracle'dır.

**S3 (K2):** ATDD'de testin temel çıkış noktası nedir?  
A) Çalışan kodun o anki çıktısı · B) Önceden konuşulup üzerinde uzlaşılan kabul örnekleri · C) Test framework'ünün default ayarı · D) Sadece branch coverage  
**Yanıt: B.** ATDD iş kabulünü implementasyondan önce belirler.

## Sonuç ve kaynak

**İyi kabul testi uygulamayı taklit etmez, uzlaşılan iş davranışını ifade eder.** İleri BDD/Cucumber otomasyon tasarımı I4 konusudur.

Devam: [Requirements & Evidence](../01-foundations/03-requirements-expected-behavior-and-evidence.md), [Decision Table](03-decision-table-testing.md).

[ISTQB CTFL v4.0.1 §4.5](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
