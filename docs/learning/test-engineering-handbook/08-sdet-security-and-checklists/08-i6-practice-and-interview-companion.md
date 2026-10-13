# I6 Çalışma Atölyesi — SDET, AppSec ve Güvenlik Kanıtı

> **Kullanım:** Önce [38–44. dersleri](01-sdet-quality-engineering-and-testability.md) sırayla oku. Bu dosyada tek bir risk üzerinden **test tasarımı, güvenlik düzeltmesi ve kanıt** oluşturmayı öğreneceğiz. İngilizce mülakat ve isteğe bağlı sınav tekrarı **ana derslerin dışında** tutulur.

## A. Birleşik vaka: Support siparişlerine kontrollü erişim

MiniShop'taki onaylı eğitim kuralları:

- CUSTOMER yalnız kendi siparişini görüntüler.
- SUPPORT yalnız **atanmış müşterinin** siparişlerini görüntüler.
- SUPPORT bu siparişlerde değişiklik yapamaz.
- Yetkisiz erişimde kişisel veri açıklanmaz ve sipariş state'i değişmez.
- Denenen yetkisiz okuma, gizli veri içermeyen bir güvenlik audit event'i üretebilir (bu eğitim örneğinde **audit gereklidir**).

**Sistem modeli:**

~~~text
Browser / Support S
        │
        ▼
Order API ── authorization policy
        │               │
        ▼               ▼
Order Service       Assignment Data
        │
        ▼
Order Database
        │
        ▼
Audit event → log pipeline (ayrı doğrulama sınırı)
~~~

### Adım 1 — Threat model

| Varlık / sınır | Soru | Örnek yanıt |
|---|---|---|
| Asset | Neyi koruyoruz? | Siparişin adresi, ürünleri ve ödeme metaverisi |
| Actor | Kim işlem yapıyor? | Owner A, Support S, diğer müşteri B |
| Trust boundary | Güvenilmez veri nerede giriyor? | Browser'dan gelen orderId/actor hints |
| Threat | Ne yanlış gidebilir? | S atanmadığı C siparişine erişir |
| Security requirement | Nasıl engellenmeli? | Server her okuma işleminde assignment + action denetler |
| Evidence | Ne gözlenecek? | Ret + veri yok + state korunmuş + audit event |

### Adım 2 — Negatif ve pozitif test tablosu

| Actor | Atama / sahiplik | İstek | Expected |
|---|---|---|---|
| A | A'nın siparişi | GET | ALLOW |
| S | B'ye atanmış | GET B order | ALLOW |
| S | C'ye atanmamış | GET C order | DENY, veri sızmaz |
| S | B'ye atanmış | PATCH B order | DENY, state aynı |
| A | C siparişi | GET C order | DENY |
| Anonymous | B order | GET | DENY |

**Test verisi:** Sentetik A/B/C/S, gerçek sahiplik ve atama kayıtları. Token ve oturumların doğru kimliğe ait olduğu doğrulanmalı.

### Adım 3 — Test seviyelerini seç

- **Component:** Policy \`canRead(actor, order, assignment)\` iş kararı.
- **Component integration:** Gerçek assignment repository → authorization policy eşleşmesi.
- **System/API:** S ile atanmadığı sipariş GET → ret, data leakage yok.
- **UI:** S'nin kullanıcı deneyiminde yalnız atanmış siparişleri görebilmesi.
- **Audit integration:** Ret event'i gerçekten güvenli pipeline'a teslim ediliyor mu?

**Önemli:** Stub'lanmış assignment data, gerçek DB query/mapping sorununu dışarıda bırakır. UI'da butonun gizlenmesi backend authorization kanıtı değildir.

### Adım 4 — Örnek defect → fix → regression

**Defect (kurgu):** Support rolü bütün siparişleri görebiliyor.

**Kök neden hipotezi:** Servis yalnız \`role=SUPPORT\` kontrol ediyor; \`assignedCustomerId\` ilişkisini kontrol etmiyor.

**Fix fikri:** Kaynağa özgü assignment kontrolü, güvenilir backend veri kaynağı üzerinden.

**Confirmation:** Atanmamış C siparişi ret ve veri sızmaması.

**Regression:** S→atanmış B hâlâ ALLOW; customer A→A ALLOW; S→B PATCH DENY; list/export uçlarında aynı kapsamın korunması ayrıca incelenir.

**Kalan risk:** Servisin başka export/search endpoint'lerinin tamamı test edilmediyse bu açıkça raporlanır.

### Adım 5 — Telemetry ve gizlilik

Onaylı security event alanları:

~~~json
{
  "eventType": "ORDER_READ_DENIED",
  "actorId": "test-support-s",
  "resourceId": "test-order-c",
  "action": "READ",
  "outcome": "DENIED",
  "correlationId": "run-123"
}
~~~

**Assert:** Uygulama event'i üretiyor mu? Actor, outcome ve correlation doğru mu? Sensitive order detail veya token yanlışlıkla loga kondu mu?

**Sınır:** Birim düzeyinde spy ile event'in yaratıldığını görmek, gerçek audit pipeline ve SIEM alarmını doğrulamaz.

### Adım 6 — SDET review

Bir PR'daki test koduna bak:
- Risk ve expected result açık mı?
- Her testin A/B/C/S fixture'ı bağımsız mı?
- Yeni assignment bilgisi setup'ta kanıtlanıyor mu?
- Negative request'te response ve DB state birlikte kontrol ediliyor mu?
- Testin geçmesi yanlış policy koduna rağmen mümkün mü?
- Event/log kanıtı yeterli ve güvenli mi?
- Dış dependency stub'lanınca açık kalan entegrasyon nedir?

Buradaki cevaplar **öğretici tasarımdır**. Gerçek repo'da authorization kodu değişmedi veya gerçek test çalıştırılmadı.

---

## B. Bağımsız transfer — DocumentHub

**Onaylı kurallar:**
- OWNER kendi PENDING dosyasını düzenleyebilir.
- REVIEWER yalnız atandığı PENDING dosyayı APPROVED yapabilir.
- AUDITOR yalnız atandığı projelerin metadata'sını görüntüler; belge içeriğini indiremez.
- Yetkisiz işlem hiçbir veri değişikliğine neden olmaz; ilgili olay güvenli biçimde kayıt altına alınır.

**Görevler:**
1. İki asset ve iki trust boundary çiz.
2. Üç güvenlik requirement'ı test edilebilir biçimde yaz.
3. Actor × document × state × action için **en az altı** test condition tasarla.
4. Önceki reviewer kontrolünde ownerId kıyaslaması kaldırılmışsa bunu yakalayacak **regression** testini belirle.
5. Policy service timeout olduğunda beklenen güvenli davranışı gerekçelendir.
6. Hangi component/integration/API/UI/audit kanıtlarını toplarsın?
7. Bir failure report yaz: Observation, hypothesis, experiment ve residual risk ayrı dursun.

### Örnek değerlendirme (kendi çözümünden sonra oku)

**Varlıklar:** Document body, proje üyelik/assignment bilgisi.  
**Sınırlar:** Browser→Document API; API→storage/policy data.

**Gereksinimler:** Atanmamış reviewer onaylayamaz; auditor içerik indiremez; APPROVED belge owner tarafından düzenlenemez. Her negatifte data leakage ve state değişmemesi kontrol edilir.

**Testler:** Owner/PENDING EDIT ALLOW; owner/APPROVED EDIT DENY; Reviewer/assigned/PENDING APPROVE ALLOW; Reviewer/unassigned/PENDING APPROVE DENY; Auditor/assigned READ metadata ALLOW; Auditor/assigned DOWNLOAD body DENY; Anonymous READ DENY.

**Regression:** Reviewer'ın onay yetkisi atamaya bağlıdır; farklı sahibin/atanmamış belgesi onaylanamaz.

**Fail-safe:** Policy bilgisi doğrulanamıyorsa korunan belgenin değiştirilmesi reddedilir. Hata kodu ve kullanıcı mesajı ürün kontratına göre belirlenir.

**Kanıt dağılımı:** Component policy test, assignment DB integration, system/API negatif ve pozitif kontrol, UI affordance; audit event üretimi ile pipeline teslimi ayrı.

**Rapor:** Beklenen vs actual, aynı başlangıç kimliği/state, sanitized request, ID/correlation; henüz doğrulanmayan export ve asenkron event delivery açık risk.

**Bağımsızlık ölçütü:** Hazır matrisi kopyalamak değil, yeni alan için oracle ve trust boundary'yi **kendi gerekçenle** türetmek gerekir.

---

## C. English interview rehearsal

Bunlar **kişisel iş deneyimi iddiası değil**, teknik örnek cevap şablonlarıdır.

**1. What does an SDET contribute beyond writing tests?**  
“An SDET improves testability, automation architecture and diagnostic feedback. I work on reliable data, meaningful assertions and boundaries that let the team find defects earlier.”

**2. How do you derive security tests from requirements?**  
“I identify assets, actors and trust boundaries, describe a credible abuse case, choose a control and translate its intended behavior into positive and negative test conditions.”

**3. What is the difference between authentication and authorization?**  
“Authentication establishes the caller's identity; authorization determines whether that identity can perform an action on a specific resource in a given state.”

**4. How do you test a broken object-level authorization risk?**  
“I set up two separate users and an object owned by one of them, then request it with the other user's identity. I verify the expected denial, no information leakage and no unauthorized state change.”

**5. Why is input validation not enough to prevent SQL injection?**  
“Validation constrains business input, while parameterized queries separate data from SQL structure. I verify both the input contract and the real database binding behavior.”

**6. How do you approach XSS regression?**  
“I verify that user-controlled content is rendered safely for the actual output context and that normal text still works. Encoding and sanitization are context-dependent.”

**7. What does fail-closed mean?**  
“When an authorization decision cannot be made safely, a protected action should not be allowed by default. The error response and operational behavior still follow the agreed contract.”

**8. How do you verify a security fix?**  
“I reproduce the original failure in an authorized environment, identify the root cause, verify the fix blocks the abuse case, and run positive and negative regression tests.”

**9. Why do audit logs matter for security testing?**  
“They provide observable evidence about actor, action, resource and outcome. I verify correctness, privacy and delivery; the existence of a log does not prove SIEM detection.”

**10. What does 100% code coverage tell you about security?**  
“It shows structural execution under the selected metric, not complete security verification. Requirements, abuse cases, state invariants and residual risk still matter.”

---

## D. İsteğe bağlı ISTQB Foundation pekiştirmesi

Bu sorular **özgündür**, resmi CTFL sınavı değildir. I6'nın AppSec içeriği **CTFL'nin birebir zorunlu security modülüymüş gibi** sunulmaz; burada temel testing ilkelerinin güvenlik örneklerine uygulanması ölçülür.

**S1.** Yeni sipariş kuralında product owner belirsizliği koddan önce tartışılıyor. Hangi faaliyet desteklenir?  
A) Static review · B) Yalnız load test · C) Deployment · D) API mocking

**S2.** Yetkisiz erişim kontrolünde yalnız HTTP 403 doğrulandı. Eksik kalabilecek önemli kanıt?  
A) Font rengi · B) Veri sızıntısı ve state'in değişmemesi · C) Git branch ismi · D) Video uzunluğu

**S3.** Testler PASS ama export endpoint'i henüz kontrol edilmedi. Hangisi doğru?  
A) Ürün kusursuz · B) Sınanan koşullar için kanıt var; export riski açık · C) Release zorunlu · D) Tüm riskler sıfır

**S4.** Bir kuralın 99/100/101 sınırında davranışını hangi teknik hedefler?  
A) BVA · B) Only state transition · C) Load testing · D) Audit logging

**S5.** Tester, farklı kullanıcı rolleri ve assignment koşullarını birlikte değerlendiriyor. Uygun sistematik teknik?  
A) Decision table · B) Statement-only · C) Screenshot · D) Unbounded retry

**S6.** Bir security fix'ten sonra asıl açığın giderildiğini görmek?  
A) Confirmation · B) Only smoke · C) Source control tagging · D) Exploratory only

**S7.** Düzeltmenin daha önce çalışan yetkili akışı bozmadığını kontrol etmek?  
A) Regression · B) Silent skip · C) Credential rotation · D) Test data deletion

**S8.** Test framework'ünde her şey mock'lanmış; gerçek DB constraint sınanmadı. Doğru sonuç?  
A) Tam entegrasyon kanıtı · B) Sınır dışında kalan DB davranışı için ek test gerekebilir · C) Sıfır kusur · D) API gereksiz

### Cevaplar

| Soru | Yanıt | Gerekçe |
|---|---|---|
| S1 | **A** | Belge/requirement kod yürütmeden incelenir. |
| S2 | **B** | Ret kodu tek başına gizlilik ve bütünlük garantisi değildir. |
| S3 | **B** | Pass oranı yalnız test edilmiş kapsama ilişkindir. |
| S4 | **A** | Boundary geçişini hedefler. |
| S5 | **A** | Birden çok koşulun kombinasyonunu sistematik ele alır. |
| S6 | **A** | Bilinen defect'in düzeldiğini doğrular. |
| S7 | **A** | Değişikliğin eskiden çalışan davranışı bozmamasını inceler. |
| S8 | **B** | Double gerçek entegrasyonun yerine kanıt üretmez. |

## E. Kaynaklar ve dürüst yeterlilik kaydı

- [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/releases/tag/v5.0.0_release)
- [OWASP WSTG](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [ISTQB CTFL v4.0.1](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)

**Bu belge AI destekli öğretim içeriğidir (H4 içerik üretimi).** Selman'ın kendi eliyle security test uygulaması, exploit reproduction, fix, CI debugging ve H0 transferi bu çalışma sırasında gözlenmedi. SDET, AppSec ve SOC yeterlilikleri birbirine devredilmiş sayılmaz.

→ [Handbook genel kapsam ve CTFL denetimi](09-handbook-and-ctfl-coverage-audit.md)
