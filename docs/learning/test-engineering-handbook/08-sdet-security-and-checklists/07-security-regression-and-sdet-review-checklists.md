# 44. SDET & Security Review — Test checklist'inden gerçek karara

> **Temel soru:** Bir security checklist'i işaretlemek, yazılımın güvenli olduğuna dair yeterli kanıt mıdır?

Son altı derste test edilebilir tasarım, trust boundary, authorization, input handling, fail-safe davranış ve telemetry öğrendik. Şimdi bu bilgileri **gerçek bir değişiklik incelemesinde** kullanacağız.

## 44.1 Önce değişikliğin ne olduğunu anla

MiniShop'a yeni özellik ekleniyor:

> “Destek çalışanı, kendisine atanmış müşterinin sipariş ayrıntısını görüntüleyebilir.”

Buna yalnızca “support rolüne izin ver” demek yetersiz:
- Hangi müşteri atanmış?
- Siparişin hangi alanları görülebilir?
- Atama geri alınırsa erişim biter mi?
- Support üyesi adresi değiştirebilir mi?
- Audit event gerekiyor mu?
- Politika servisi erişilemezse ne olur?

Checklist **bağlama göre ilgili gereksinimi** hatırlatır. Sorulara yanıt verilmiyorsa otomatik “PASS” yazılmaz.

## 44.2 Kısa bir review yaklaşımı

**1 — Requirement & ownership**
- Veri sahibi ve amaç tanımlı mı?
- Actor × resource × action × state politikası açık mı?
- Beklenen response ve yan etki belirli mi?

**2 — Trust boundary & input**
- Browser'dan gelen actorId veya orderId güvenilir mi?
- Server-side validation var mı?
- Query parametreli mi; içerik bağlama uygun encode ediliyor mu?

**3 — Negative & abuse**
- Başka kullanıcının kaydı reddediliyor mu?
- İptal edilmiş atamayla erişim engelleniyor mu?
- Timeout/tekrar/concurrent request tutarlı mı?
- Yasak işlemde **state değişmiyor ve veri sızmıyor mu**?

**4 — Automation evidence**
- Uygun component/integration/API/UI seviyeleri seçildi mi?
- Test data izole ve tekrar edilebilir mi?
- Oracle uygulamanın actual'ından bağımsız mı?
- Stub'lanan gerçek entegrasyon boşluğu açık mı?

**5 — Debugging & telemetry**
- Failure yeniden üretim kanıtı yeterli mi?
- Audit event actor/action/resource/outcome içeriyor mu?
- Log/artifact secret sızdırıyor mu?
- Release riskleri açıkça raporlandı mı?

### Checklist kullanırken temel hata

Her soruya “yes” yazmak ama neden yazıldığını bilmemek. Örneğin yalnız UI'da “Support erişimi yok” demek, doğrudan API ile veri sızmadığını kanıtlamaz. Checklist her maddede **gözlenebilir sonuç ve gerekiyorsa kanıt bağlantısı** gerektirir.

## 44.3 Güvenlik regresyonunu katmanlara dağıt

| Risk | En düşük anlamlı sınır | Gerekli ek kanıt |
|---|---|---|
| Role/policy kararı | Component policy test | API'de gerçek actor/resource bağlantısı |
| Ownership mapping | Integration | Sistem/API'de veri sızmaması |
| Input validation | Component | HTTP request ile server ret |
| SQL komut/veri ayrımı | Code review + DB integration | Gerçek driver'ın parameter binding'i |
| HTML'de kullanıcı metni | UI/component | Gerçek render'da metin olarak görünme |
| Timeout / repeat ödeme | Application integration | Provider contract ve single-charge invariant |
| Audit event | Component event test | Audit pipeline delivery ve privacy |

Bu tablo “bütün riskler her seviyede test edilmeli” demiyor; **her riske uygun kanıt sınırını seç** diyor.

## 44.4 Traceability: Riskten teste

Örnek kayıt:

| Alan | Değer |
|---|---|
| **RISK** | Support atanmadığı müşterinin siparişini okur |
| **REQ** | Yalnız atanmış müşteri siparişlerine READ |
| **TEST** | Support S, B'ye atanmış / C'ye atanmamış |
| **EXPECTED** | B=ALLOW, C=DENY + C verisi sızmaz |
| **EVIDENCE** | API response, sahiplik fixture, audit event |
| **RESIDUAL RISK** | Export/list endpoint'leri ayrıca taranmalı |

**ASVS eşlemesi** gerekiyorsa ASVS **5.0.0** kaynağındaki tam requirement seçilip ID, sürüm, açıklama, test ve sonuç kaydedilir. Bu bölüm, doğrulanmamış madde ID'si atamaz.

## 44.5 Test kodu review'unda SDET soruları

- İlgili test gerçekten bir **iş riski** mi kontrol ediyor?
- Yanlış kod yazılsaydı assertion fail olur muydu?
- Test gereksiz UI/E2E maliyeti taşıyor mu?
- Sadece kendi fixture datasını temizliyor mu?
- Clock ve concurrency varsayımları açık mı?
- Step definitions teknik implementasyonu iş kuralı gibi mi gösteriyor?
- Aşırı mocking gerçek entegrasyonu gizliyor mu?
- CI artifact'ı debug için yeterli, privacy için güvenli mi?

**SDET = çok test dosyası yazmak** değildir. Mühendislik değeri doğru sınır, iyi oracle, sürdürülebilir test ve anlaşılır failure kanıtıdır.

## 44.6 Tam vaka: Yetki fix'i

**Bulgu:** Support S, atanmadığı C siparişini API ile okuyabiliyor.

**Kök neden:** Backend yalnız \`role=SUPPORT\` kontrol ediyor; atama ilişkisini kontrol etmiyor.

**Düzeltme:** Support için kaynak bazlı assignment doğrulaması.

**Kontroller:**
1. Atanmış B siparişine erişim devam eder;
2. Atanmamış C siparişi reddedilir;
3. C veri içeriği error'da sızmaz;
4. export/list veya benzer erişim yolları ayrıca incelenir;
5. audit kaydı policy'ye uygun üretilir;
6. policy servisi erişilemezse fail-safe davranış kontrol edilir.

**Önemli:** Bu vaka tasarımsal örnektir. Gerçek bir bug fix/CI yürütüldüğü iddia edilmez.

## 44.7 Kariyer hatlarını birbirine karıştırma

- **SDET çıktısı:** Test architecture, otomasyon, veri izolasyonu, root-cause debugging.
- **AppSec çıktısı:** Threat model, vulnerability reproduction, secure fix ve security regression.
- **Security Operations çıktısı:** Kaliteli audit log, detection hypothesis, false-positive/false-negative ve investigation.

Aynı özellik üç hatta veri sağlayabilir, ama **biri diğerinin otomatik kanıtı değildir**.

## 44.8 Alıştırma — yeni gereksinim

Belge servisi, bir projedeki belgeleri auditor rolüne **salt okunur** sunacak; projeye atanmış olmayan auditor içerik göremeyecek.

**Görev:** Dört test condition, iki test level ve bir residual risk kaydı yaz.

**Örnek çözüm:**
- Atanmış auditor okur;
- atanmamış auditor reddedilir;
- atanmış auditor düzenleme isteği reddedilir ve state korunur;
- anonymous okuma reddedilir.
- Component policy + system/API ownership testleri.
- Kalan risk: export/download/search endpoint'lerinin tamamında aynı scope'un uygulandığı henüz doğrulanmadı.

## I6 ana derslerinin sonucu

Öğretim zinciri burada tamamlanır:

**Gereksinim → risk → test tasarımı → test seviyesi → veri/otomasyon → API/UI kanıtı → debugging → güvenlik doğrulaması → kalan risk.**

Sonraki dosyalar ayrı **uygulama/mülakat atölyesi** ve bütün handbook için **gerçek kapsam denetimi** içerir. Bu aşama, bağımsız uygulamalı uzmanlığın doğrulandığı anlamına gelmez.

→ [I6 Çalışma Atölyesi](08-i6-practice-and-interview-companion.md)
