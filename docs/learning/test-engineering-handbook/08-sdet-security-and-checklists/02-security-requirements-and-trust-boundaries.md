# 39. Security Requirements & Trust Boundaries — Riskten doğrulanabilir kontrole

> **Temel soru:** “Sistem güvenli olmalı” cümlesinden nasıl somut bir test çıkarabiliriz?

SDET testability'yi artırır; AppSec ise **hangi güvenlik kontrolünün neden gerekli olduğunu** sorgular. İkisi birleştiğinde güvenlik, yalnız son aşamadaki penetrasyon testine bırakılmaz.

## 39.1 Başlangıç: MiniShop sipariş servisi

Kural: Kullanıcı kendi siparişini görebilir, başka kullanıcının siparişini göremez.

~~~text
[Browser / kullanıcı A]
         │ HTTPS request, session
         ▼
   [Order API] ← trust boundary
         │ actor + orderId
         ▼
   [Order Service]
         │
         ▼
   [Order Database: A ve B siparişleri]
         │
         └── [Audit event → log pipeline]
~~~

**Asset (varlık):** Siparişe ve müşteriye ait kişisel bilgi, ödeme ve adres bilgisi.

**Actor:** Sipariş sahibi, destek görevlisi, yetkisiz kullanıcı.

**Entry point:** GET /api/orders/{id}.

**Trust boundary (güven sınırı):** Browser'dan gelen \`orderId\` ve diğer değerler **güvenilmez girdidir**. Doğrulanmış kimliğin bile **nesneye özel yetkisi ayrıca kontrol edilir**.

## 39.2 Bir tehdidi somutlaştır

**Threat:** Kullanıcı A, URL'deki orderId'yi B'nin orderId'siyle değiştirerek B'nin siparişini okur.

**Olası etki:** Kişisel verinin gizliliği bozulur.

**Control:** Backend, her okuma işleminde **actor × resource × action** yetkisini doğrular.

**Security requirement:**

> “Order API, sipariş verisini yalnız bu kaynağı okumaya yetkili actor'a döndürmelidir. Yetkisiz istekte sipariş içeriği veya hassas metadata açıklanmamalıdır.”

**Test condition:** A kimliğiyle B'nin gerçek test verisi olarak oluşturulmuş siparişini GET.

**Oracle:** Sözleşmeye uygun ret + hiçbir B verisi sızmaması.

Bu zinciri ezber sloganından ayıran şey **tehdidin gözlenebilir sonuca dönüşmesi**dir.

## 39.3 Tehdit modeli ne değildir?

Bir threat model yalnız “OWASP Top 10 listesinden madde seçmek” değildir. Uygulamaya göre:

1. Sistem ve veri akışını çiz.
2. Korunacak varlıkları belirle.
3. Actor ve yetki sınırlarını ayır.
4. **Nerede hangi güven sınırı geçiliyor** sor.
5. Makul kötüye kullanım/failure senaryosu yaz.
6. Kontrol ve residual risk belirle.
7. Kontrol için pozitif/negatif test kanıtı tasarla.

**Tehdit modeli**, kapsam dahilindeki sistemi ve varsayımları açıkça ifade eder; bütün olası saldırıların sonsuz listesini hedeflemez.

## 39.4 ASVS, Top 10 ve WSTG farklı amaçlar

Resmî OWASP kaynaklarının görevlerini ayıralım:

| Kaynak | Ne için? | Nasıl kullanılmalı? |
|---|---|---|
| **OWASP Top 10:2025** | Yaygın kritik web app risk kategorilerini anlamak | Risk farkındalığı ve örnek tehdidi tartışmak |
| **OWASP ASVS 5.0.0** | Doğrulanabilir app security gereksinimleri | Kontrolün beklenen sonucunu yazmak |
| **OWASP WSTG** | Web güvenlik değerlendirme yaklaşımı | Yetkili ortamda test yöntemini planlamak |
| **OWASP Cheat Sheet Series** | Uygulama ve tasarım rehberliği | Gerekçeli mitigation/secure coding seçmek |

**Önemli:** Top 10 bir test checklist'i veya ASVS'in yerine geçen doğrulama standardı değildir. ASVS requirement ID kullanırsan **tam sürümü ve gerçek requirement açıklamasını** kontrol et. Burada doğrulanmamış madde numarası uydurmuyoruz.

## 39.5 İkinci tehdit: Kupon iki kez kullanılıyor

**Varlık:** İndirim hakkı, ödeme ve sipariş tutarlılığı.

**Sınır:** İstemci aynı kupon kullanım işlemini eşzamanlı veya tekrar gönderebilir.

**Threat/abuse:** İki istek aynı AVAILABLE kuponu iki farklı siparişte uygular.

**Control:** Veri katmanında uygun atomicity/transaction veya eşdeğer bir güvenli tek-kullanım kontrolü; UI'da buton disabled yapmak **tek başına** yeterli değildir.

**Test:** Kontrollü paralel kullanım isteği ve **en çok bir indirim** invariant'ı.

Burada güvenlik ile correctness birleşir: Race condition, yalnız test flakiness değil **iş kuralının suistimali** olabilir.

## 39.6 Security review soruları

Yeni bir özelliği incelerken kısa ama anlamlı sorular:
- Veri kime ait?
- Kim, neyi, hangi durumda yapabilir?
- Input hangi trust boundary'den geçiyor?
- Server, browser'a güveniyor mu?
- Hata/timeout sonrası gizlilik ve state korunuyor mu?
- Kontrol başarısız olduğunda nasıl davranılıyor?
- Kayıtlar ve güvenlik olayları olay araştırmasına yeterli mi?
- Test fixture'ları gerçek kişi/production secret içeriyor mu?

Bu liste her özellikte **tamamı uygulansın** diye değil; ilgili risklerin sistematik incelenmesi için vardır.

## 39.7 Açıklamalı test tasarımı

Eğitim örneği: Support rolü yalnız atanmış müşterilerin siparişlerini görebilir.

| Actor | Order owner | Atama | Beklenen |
|---|---|---|---|
| Owner A | A | Gerekmez | ALLOW |
| Support S | B | B'ye atanmış | ALLOW |
| Support S | C | C'ye atanmamış | DENY |
| Customer A | B | Gerekmez | DENY |

**Testin önkoşulu:** A, B, C ve S test hesapları; atamaların doğru hazırlandığının gözlemi.

**Sınır:** Test, role claim'i frontend'de değiştirerek backend security'yi doğru değerlendiremez; gerçek token/actor kimliği ve server policy kullanılmalı.

## 39.8 Alıştırma — yeni belge sistemi

Kural: Belgenin sahibi düzenleme yapabilir; reviewer yalnız kendisine atanan PENDING belgeleri onaylayabilir.

**Görev:** Bir varlık, iki trust boundary, bir abuse-case ve bunu engelleyen security requirement/test oracle yaz.

**Örnek çözüm:** Asset: belge içeriği ve approval state. Boundary: browser→API, API→file storage. Abuse: reviewer başka takıma ait belgeyi APPROVED yapar. Requirement: atanmamış reviewer'ın onay isteği reddedilir ve belge state'i değişmez. Test: ataması doğrulanmış/atanmamış sentetik reviewer hesaplarıyla pozitif/negatif karşılaştırma.

## Sonraki ders

Threat model oluşturduk. Şimdi kimlik, oturum ve yetki kontrollerini **gerçek regresyon testlerine** dönüştüreceğiz.

→ [40. Identity, Authorization & Security Regression](03-identity-authorization-and-security-regression.md)

**Kaynaklar:** [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) · [OWASP Top 10:2025](https://owasp.org/Top10/2025/) · [OWASP WSTG](https://owasp.org/www-project-web-security-testing-guide/).
