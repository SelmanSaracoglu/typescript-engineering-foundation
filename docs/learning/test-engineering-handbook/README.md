# Test Engineering Handbook

**Yazılım test etmeyi kavramlardan gerçek mühendislik kararlarına doğru öğrenmek için hazırlanmış Türkçe teknik kaynak.**

> **Okuma durumu — 13 Ekim 2026:** **I1 baştan yazıldı; kullanıcı incelemesine açık.** I2'nin eski dosyaları repository'de korunuyor ancak pedagojik yeniden yazım yapılana kadar **onaylanmış ders materyali sayılmıyor**. I3–I6 henüz açılmadı.

## Nereden başlamalı?

**[Ders 1 — Yazılım kalitesi, test etme ve güven](01-foundations/01-quality-testing-and-confidence.md)**

Bu kaynak hızlı tanım listesi değil. Her bölümde sırasıyla:

**Bir problem gör → kavramı anla → neden gerekli olduğunu sorgula → açıklamalı örneği takip et → karşı örneği incele → yeni küçük problemi kendin çöz.**

Bölümler birbirine bağlıdır. Tekniklerin adlarını öğrenmek hedef değil; **hangi iş kuralından, hangi risk nedeniyle, neden o testin seçildiğini anlatabilmek** hedeftir.

## I1 — Foundations & Test Design

### Birinci bölüm: Testçi nasıl düşünür?

Bu üç dersi sırayla oku; ikinci bölümde bütün teknikler bunların üstüne inşa ediliyor.

| Sıra | Ders | Burada öğreneceğin temel soru |
|---|---|---|
| 1 | [Quality, Testing & Confidence](01-foundations/01-quality-testing-and-confidence.md) | Bir testin geçmesi neyi **kanıtlar**, neyi kanıtlamaz? |
| 2 | [Verification, Validation & Risk](01-foundations/02-verification-validation-and-risk.md) | Bir yazılım şartnameye uyup kullanıcı için yine de başarısız olabilir mi? |
| 3 | [Requirements, Test Oracle & Evidence](01-foundations/03-requirements-expected-behavior-and-evidence.md) | **Doğru sonucu** nereden biliyoruz; hangi kanıt yeterli? |

### İkinci bölüm: Testleri nasıl tasarlarız?

| Sıra | Ders | Burada öğreneceğin temel soru |
|---|---|---|
| 4 | [Equivalence Partitioning](02-test-design-techniques/01-equivalence-partitioning.md) | Sınırsız girdiden anlamlı örnekleri nasıl seçeriz? |
| 5 | [Boundary Value Analysis](02-test-design-techniques/02-boundary-value-analysis.md) | Sınırdaki yanlış operatörü nasıl görünür yaparız? |
| 6 | [Decision Table Testing](02-test-design-techniques/03-decision-table-testing.md) | Birlikte çalışan koşulları nasıl sistematik test ederiz? |
| 7 | [State Transition Testing](02-test-design-techniques/04-state-transition-testing.md) | Aynı işlem neden farklı durumlarda farklı sonuç üretir? |
| 8 | [Scenario, Negative & Exploratory Testing](02-test-design-techniques/05-scenario-negative-exploratory-testing.md) | Yazılmamış ama gerçek riskleri nasıl araştırırız? |
| 9 | [White-box Testing](02-test-design-techniques/06-white-box-statement-and-branch-testing.md) | Kodun tüm satırlarını çalıştırmak yeterli midir? |
| 10 | [User Stories, Acceptance Criteria & ATDD](02-test-design-techniques/07-collaboration-user-stories-and-atdd.md) | Test edilebilir beklentiyi koddan **önce** nasıl netleştiririz? |

### Üçüncü adım: Birleştir, uygula, sonra sınava hazırlan

**[I1 Çalışma Atölyesi — Uygulama, İngilizce mülakat ve isteğe bağlı ISTQB tekrar](02-test-design-techniques/08-i1-practice-and-interview-companion.md)**

Bu ayrı dosyada:
- Bir senaryo üzerinden EP, BVA, decision table, state, negative ve risk düşüncesi bir arada;
- Daha önce görmediğin bir gereksinim için **çözümlü transfer görevi**;
- İngilizce, teknik mülakatlarda kullanılabilecek **10 örnek soru/cevap**;
- **12 özgün CTFL Foundation** tarzı soru ve gerekçeli cevap anahtarı bulunur.

**Ana dersleri bölüp her sayfayı CTFL ve mülakat etiketleriyle doldurmuyoruz.** Önce kavramı öğren, sonra istersen sınav/konuşma pratiğine geç.

## Pedagojik rota: Her adım neden bu sırada?

~~~text
Quality & Confidence
        ↓
Verification / Validation / Risk
        ↓
Requirement → Test condition → Expected result → Evidence
        ↓
EP → BVA → Decision table → State transition
        ↓
Negative / Exploratory → White-box
        ↓
Acceptance Criteria & ATDD
        ↓
Entegre vaka → Yeni problem → Mülakat ve sınav tekrarı
~~~

**Örnek dünyamız:** Sepet, kargo ücreti, kupon, sipariş state'i ve iade kuralları. Aynı iş alanını farklı tekniklerle ele almak, her derste sıfırdan yeni bir ürün öğrenme yükünü azaltır. Bütün örnek kurallar eğitim için oluşturulmuştur; gerçek bir sisteme ilişkin doğrulanmış ürün politikası değildir.

## Nasıl çalışmalı?

1. Bir dersin ilk örneğine bakıp sonucu **kendin tahmin et**.
2. Açıklamayı okuyup nedenini anlayarak tabloyu yeniden kur.
3. **Alıştırma** bölümünü örnek çözüme bakmadan çöz.
4. Kendi çözümünle farkları karşılaştır; beklenen sonucun kaynağını ve kalan riski açıklamaya çalış.
5. Bölümü bitirince bir sonraki derse geç. Mülakat veya sınav sorularını **zorunlu önkoşul** yapma.

İleride canlı eğitim/pratik oturumlarında bağımsız çalışma ve debugging ayrıca gözlenir. **AI tarafından yazılmış dokümanların varlığı, öğrencinin bağımsız SDET yetkinliği kanıtı değildir.**

## Kapsam, durum ve sonraki adımlar

| Aşama | Durum | Açıklama |
|---|---|---|
| **I1 — Foundations & Test Design** | **Yeniden yazıldı; incelemeye açık** | 10 açıklamalı ders + 1 bütünleştirici çalışma atölyesi |
| **I2 — Levels & Strategy** | **Eski taslak; yeniden yazılacak** | Önceden üretilen dosyalar silinmedi, henüz önerilen okuma rotasında değil |
| I3 — Data, Isolation & Doubles | Planlı | Yeni ders yok |
| I4 — Automation & BDD | Planlı | Yeni ders yok |
| I5 — API, UI & Failure Engineering | Planlı | Yeni ders yok |
| I6 — SDET, Security & Final Review | Planlı | Yeni ders yok |

**CTFL hedefi:** Bu öğretim serisi sınav hazırlığını da desteklemeyi hedefler, ancak tek başına 10 dersi okumak CTFL müfredatının tamamını kapsamaz. Sınav hazırlığını ayrı çalışma atölyesi ve nihai syllabus coverage kontrolünde takip edeceğiz. Resmî bilgi: [ISTQB CTFL](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) ve [Glossary](https://glossary.istqb.org/).

## Repository sınırları

Bu handbook, mevcut `docs/learning/typescript-foundation/` materyallerinden bağımsızdır. `src/`, `tests/`, mevcut TypeScript dersleri ve diğer Increment klasörleri bu I1 yeniden yazımında değiştirilmemiştir.

**Bir genel README** vardır; alt klasörlerde README oluşturulmaz.
