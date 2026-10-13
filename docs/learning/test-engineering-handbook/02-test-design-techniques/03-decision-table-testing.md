# 6. Decision Table Testing — Koşullar birlikte karar veriyorsa

> **Bu bölümün sorusu:** İki koşulu ayrı ayrı test etmek, bunların birlikte doğru çalıştığını gösterir mi?

## 6.1 Bir kuralı parçalayalım

Alışveriş sistemimizde şu iş kuralı var:

> **S-01:** Ücretsiz **standart** kargo, yalnızca **aktif üyeler** için ve **sepet toplamı 100 € veya üzerindeyse** uygulanır. Diğer durumlarda standart kargo ücretlidir.

İki koşulu fark edelim:

1. Kullanıcı aktif üye mi?
2. Sepet toplamı 100 € veya üzeri mi?

“Ücretsiz kargo özelliği çalışıyor mu?” diye yalnız aktif-120 € testi yapmak yeterli değildir. Mesela pasif-120 € için kod yanlışlıkla ücretsiz kargo verebilir.

**Decision Table Testing**, koşul kombinasyonlarının hangi iş sonucunu üretmesi gerektiğini **tam görünür** kılar.

## 6.2 İlk tabloyu birlikte üretelim

Her koşulun iki olası değeri var: **Evet/Hayır**. Dolayısıyla teorik olarak **2 × 2 = 4** kombinasyon oluşur.

| Kural | Aktif üye? | Toplam ≥100 €? | Beklenen |
|---|---|---|---|
| R1 | Evet | Evet | FREE |
| R2 | Evet | Hayır | PAID |
| R3 | Hayır | Evet | PAID |
| R4 | Hayır | Hayır | PAID |

Bunu test case'e çevirmek kolay:

| Test | Üyelik | Tutar | Beklenen |
|---|---|---:|---|
| TC1 | ACTIVE | 120 € | FREE |
| TC2 | ACTIVE | 80 € | PAID |
| TC3 | INACTIVE | 120 € | PAID |
| TC4 | INACTIVE | 80 € | PAID |

**Bir satırdaki bütün koşulların birlikte sağlanmasına** odaklanıyoruz.

### Neden bu, EP'den farklı?

EP bize “active/inactive” ve “100 altı/üstü” sınıflarını gösterir. Ama şu iki testten ibaret bir set:

- ACTIVE + 120;
- INACTIVE + 80;

iki parametrenin tüm değerlerini temsil ederken **ACTIVE + 80** ve **INACTIVE + 120** kararlarını denememiş olur. Koşulların birlikte işlediği mantık için tablo gerekir.

## 6.3 Aynı kararı sütunlu tabloda göstermek

Aynı tablo sıkça koşulların **satır**, karar kurallarının **sütun** olduğu biçimde gösterilir:

| Condition / Action | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Active? | T | T | F | F |
| Total ≥100? | T | F | T | F |
| FREE shipping | X |  |  |  |
| PAID shipping |  | X | X | X |

Burada:
- **T/F:** Condition true/false;
- **X:** İlgili action uygulanır;
- **R1–R4:** Dört ayrı karar kuralı (coverage item).

İki gösterim **aynı mantığı** anlatır. Tabloyu yatay-dikey biçimiyle ezberlemek yerine **her kombinasyona karşılık bir oracle** yazmayı öğren.

## 6.4 Yeni kural ekleyince ne değişir?

Product owner yeni koşul ekliyor:

> **S-02:** Express shipping **her zaman ücretlidir**, aktif üyeler de dahil.

Artık üçüncü koşulumuz var: “Express mi?”

Üç bağımsız Boolean koşul için tam tablo **2³=8** satır üretir.

| Active? | Total ≥100? | Express? | Beklenen |
|---|---|---|---|
| T | T | F | FREE |
| T | F | F | PAID |
| F | T | F | PAID |
| F | F | F | PAID |
| T | T | T | PAID |
| T | F | T | PAID |
| F | T | T | PAID |
| F | F | T | PAID |

Önemli gözlem: **Express=T olduğunda** diğer iki koşul artık sonuca etki etmiyor. Bu yüzden karar tablosu şöyle **sadeleştirilebilir**:

| Kural | Express? | Active? | Total ≥100? | Beklenen |
|---|---|---|---|---|
| R1 | T | — | — | PAID |
| R2 | F | T | T | FREE |
| R3 | F | T | F | PAID |
| R4 | F | F | — | PAID |

**— (don't care)** işareti, bu kural için koşulun sonuca etki etmediğini ifade eder. “Bilmiyoruz” veya “hatalı veri” demek değildir.

Bu sadeleştirme, iş kuralları gerçekten aynı sonucu veriyorsa geçerlidir. Eğer Express için ayrı vergi veya üyelik ücreti hesaplanıyorsa “PAID” sonucuna bakıp bütün davranışların eşdeğer olduğunu varsaymak yeterli olmayabilir.

### “Impossible combination” ile “don't care” farklıdır

Diyelim tek seçimli bir kargo tipinde hem STANDARD hem EXPRESS aynı anda seçilemez. Böyle bir koşul **infeasible/N/A** olabilir: Gerçek dünyada oluşturulabilen bir iş durumu değildir.

**Don't care** ise iş durumu mümkündür, sadece **o kuralın sonucunu değiştirmez**.

Bu iki işaretin farkını bilmek yanlış test sayısı ve hatalı coverage hesaplarını önler.

## 6.5 Decision table coverage hesabı

İlk iki koşullu tam tabloda dört feasible karar sütunu vardı.

Dört kuraldan üçünü test ettiysek:

**Coverage = 3/4 = %75**.

Sadeleştirilmiş tabloda coverage paydası, **tanımlı feasible karar kurallarıdır**. Ancak “—” ile birleştirdiğimiz bir sütunun tüm varyasyonları hakkında aynı derinlikte kanıt ürettiğimizi iddia etmeyiz. Yüksek risk varsa birleşmiş gruptan ek temsilci seçebiliriz.

## 6.6 Tester'ın asıl katkısı: eksik kuralı fark etmek

Şu yeni durumda mevcut requirements eksik:

> “Kupon tanımlı; toplam 100 € ve üstü; müşteri aktif; ancak kupon geçersiz olduğunda ücretsiz kargo hesabı neye göre yapılır?”

Burada **kupon sonrası mı, önceki toplam mı** kullanıldığı belirlenmemiş olabilir.

Zayıf yaklaşım: Sistemi çalıştır, ne yaptıysa expected kabul et.

Mühendislik yaklaşımı: Belirsiz kombinasyonu tabloda görünür yap, product owner'a somut alternatifleri sor, onaylı kararı test oracle'a dönüştür.

Decision table yalnız test case üretmez, **requirements review** için de güçlü bir araçtır.

## 6.7 Hangi durumlarda doğru teknik değildir?

- Tek sayısal eşikte geçişi araştırıyorsan önce **BVA**.
- Aynı olayın önceki işlemlere göre farklı sonuç verdiği bir sistemde **State Transition**.
- Uygulamanın iç kod dallarını sayıyorsan **White-box/branch testing**.
- Kullanıcının beklenmedik davranışlarını keşfediyorsan **Exploratory testing**.

Testler kombinasyon patlamasına uğrarsa “2¹⁰=1.024, hepsini çalıştırmalıyım” sonucu çıkarmak doğru değildir. Önce geçersiz kombinasyonları, önemsiz koşulları, riskli durumları ayır.

## 6.8 Alıştırma

**Kural:** Bir kullanıcı belgeyi indirebilir, eğer **hesap aktif** ve (**belge sahibi** veya **admin**) ise.

**Görev:** Active, Owner, Admin koşulları için erişime izin verilen kombinasyonları düşün. Pasif admin indirebilir mi?

**Örnek çözüm:**

| Active | Owner | Admin | Beklenen |
|---|---|---|---|
| T | T | F | ALLOW |
| T | F | T | ALLOW |
| T | F | F | DENY |
| F | T | F | DENY |
| F | F | T | DENY |
| T | T | T | ALLOW |
| F | T | T | DENY |
| F | F | F | DENY |

Pasif adminin reddedilmesi, “active” koşulunun **zorunlu** olmasından gelir. Uygulamada admin istisnası isteniyorsa **iş kuralı değişmelidir**; tester sessizce istisna uydurmaz.

## Sonraki bölüm

Şimdi iş koşullarının **aynı anda** nasıl çalıştığını anladık. Bir sonraki teknikte karar, yalnız anlık koşullara değil **sistemin geçmişte hangi olayları yaşadığına** bağlı olacak.

→ [7. State Transition Testing](04-state-transition-testing.md)
