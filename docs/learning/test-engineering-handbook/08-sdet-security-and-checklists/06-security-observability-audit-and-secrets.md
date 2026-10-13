# 43. Security Observability — Audit, Secrets ve Güvenilir Kanıt

> **Temel soru:** Bir erişim reddedildiğini biliyorsak, olay araştırmasında kimin ne denediğini güvenle anlayabilir miyiz?

SDET ve AppSec için testin doğrulanabilir olması önemlidir. Security Operations & Engineering için ise **doğru, yeterli ve güvenli telemetry** gerekir. Bu derste üç kariyer hattının ortak noktasını ele alıyoruz.

## 43.1 Normal log ile audit event farkı

**Application log:** Uygulama bileşeninin çalışmasına dair genel kayıt.

**Audit event:** Belirli bir güvenlik/iş sorumluluğu açısından önemli eylemin izlenebilir kaydı.

Örnek:
- Login FAILED;
- owner dışı order READ DENIED;
- reviewer belge APPROVED;
- ödeme iki kere denenip duplicate işlem engellendi.

Bütün uygulama logları otomatik güvenlik audit kanıtı değildir. **Olayın hangi actor, action, resource ve outcome ile ilişkili olduğu** gerekebilir.

## 43.2 Audit event şemasını birlikte çıkaralım

Eğitim olayı: User A, B siparişini okumayı denedi.

~~~json
{
  "eventType": "ORDER_READ_DENIED",
  "actorId": "test-user-a",
  "action": "READ",
  "resourceType": "ORDER",
  "resourceId": "test-order-b",
  "outcome": "DENIED",
  "reasonCode": "OWNER_MISMATCH",
  "correlationId": "req-test-001",
  "occurredAt": "2026-10-13T10:00:00Z"
}
~~~

**Bu olay sentetik örnektir; gerçek sistemden alınmamıştır.**

Alanların anlamı:
- \`actorId\`: Kimin isteği?
- \`action\`: Hangi işlem?
- \`resourceId\`: Hangi kaynak?
- \`outcome\`: İzin/ret/başarı?
- \`reasonCode\`: Sözleşmeye uygun sınıflandırma;
- \`correlationId\`: Request, API ve servisler arasında ilişkilendirme;
- \`occurredAt\`: Açık timezone ile zaman.

**Dikkat:** \`resourceId\` bile hassas olabilir. Erişim, retention ve maskeleme politikası ürünün gizlilik gereksinimlerine göre seçilir.

## 43.3 Güvenlik logu için beklenen kalite

İyi telemetry şu sorunları çözmeli:

1. **Completeness:** Kritik olaylar eksiksiz kayıt altına alınıyor mu?
2. **Accuracy:** Actor, outcome ve resource doğru mu?
3. **Time:** Saat/timestamp tutarlı mı, sıralama yapılabilir mi?
4. **Correlation:** Tek isteğin adımlarını ilişkilendirebiliyor muyuz?
5. **Integrity:** Kayıtlar yetkisiz değişiklikten korunuyor mu?
6. **Privacy:** Token, parola veya özel veri gereksiz biçimde saklanıyor mu?

Bir test, \`ORDER_READ_DENIED\` event'inin yaratıldığını spy ile gözleyebilir. Ancak event'in gerçek audit pipeline'a ulaşıp kalıcı ve aranabilir olduğuna dair **ayrı integration/operational kanıt** gerekir.

## 43.4 Secret ve kişisel verinin test kanıtında yeri

Cypress screenshots, CI artifacts, API logları ve bug ticketları veri sızıntısı kaynağı olabilir.

**Asla kolaylık için kopyalama:**
- canlı access token;
- session cookie;
- şifre/secret;
- kişisel sipariş adresi;
- ödeme kartı verisi;
- özel belge içeriği.

**Pratik kontroller:**
- sentetik test hesapları;
- masked/sanitized request–response;
- secrets'ı source repo'dan ayrı yetkili ortamda tutmak;
- artifact erişim ve retention kontrolü;
- gerekli oldukça log alanlarını sınırlamak;
- test veri silme/temizleme politikasını uygulamak.

**Maskeleme hata ayıklamayı engellemek zorunda değildir.** Correlation ID, sentetik kullanıcı ID'si ve kontrollü log alanlarıyla çoğu durumda gerekenden fazla veri taşımadan yeniden üretim sağlanır.

## 43.5 Fail-open/fail-closed audit sorusu

Uygulama erişimi reddetti, ama audit pipeline çöktü.

Bu durumda:
- Korunan sipariş yine açıklanmamalı;
- olay kaybının nasıl ele alınacağı ve işin devam edip etmeyeceği güvenlik/operasyon politikasıyla tanımlanmalı;
- test, **yalnız response** değil log/event üretimi ve event delivery sınırını da ayırmalı.

Bütün audit hatalarında otomatik “işlem fail olmalı” kuralı yoktur. Risk bazlı ürün kararı gereklidir.

## 43.6 SOC bağını doğru kur

Bir test şunu göstermiş olsun:
- A→B sipariş isteği DENY;
- \`ORDER_READ_DENIED\` event'i üretildi;
- audit sink'te timestamp/correlation alanları mevcut.

Bu, detection engineering için **potansiyel veri kaynağıdır**. Ama:
- tek olay için SIEM detection'ın doğru yapılandırıldığını;
- false positive/false negative performansını;
- alarm ve eskalasyon sürecini;
- üretim ortamındaki event delivery reliability'yi

**kanıtlamaz**.

SDET kanıtı, AppSec güvenlik kontrolü ve SOC detection/investigation kanıtı **ayrı ayrı** değerlendirilmelidir. Sadece log üretmek SOC uzmanlığı değildir.

## 43.7 Çalışılmış örnek: Ret var, audit yok

**Gözlem:** Yetkisiz GET 403 dönüyor; uygulama logunda event yok.

**Hipotezler:**
- Uygulama audit event'i üretmedi;
- event queue'da kayboldu;
- log pipeline filtresi event'i attı;
- farklı correlation ID ile arıyoruz.

**Deney:**
- Component sınırında event üretimini spy ile doğrula;
- integration sınırında queue publish/consume durumunu izle;
- audit sink'te correlation ID ile sorgula;
- logging politikası hangi ret olayını kaydetmeyi gerektiriyor, onu doğrula.

“403 vardı, security logging tamam” sonucu yanlış olur.

## 43.8 Alıştırma — yeni ürün

Belge sisteminde yetkisiz kullanıcı bir PDF indirmeye çalışıyor. API doğru ret verdi ama security team olayları ilişkilendiremiyor.

**Görev:** Gerekli dört audit alanı, iki privacy kontrolü ve iki test seviyesi seç.

**Örnek çözüm:** Actor, action, resource, outcome; ayrıca correlation ID ve timestamp yararlıdır. Privacy: token kaydetme, belge içeriğini audit event'e koyma. Component testte event oluşturma mantığı; integration testte log pipeline'a doğru veri teslimi. Gerçek SIEM alarmı ayrıca ölçülür.

## Sonraki ders

Artık kontrolü tasarlayabiliyor ve kanıtını okuyabiliyoruz. Şimdi bunları **kısa, uygulanabilir bir güvenlik/test review checklist** içinde birleştireceğiz.

→ [44. Security Regression & SDET Review Checklists](07-security-regression-and-sdet-review-checklists.md)

**Kaynak:** [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) · [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/).
