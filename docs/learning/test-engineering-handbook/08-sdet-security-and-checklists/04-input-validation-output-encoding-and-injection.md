# 41. Input Validation, Output Encoding & Injection — Veri ve komut karışmasın

> **Temel soru:** Kullanıcının adı bir SQL sorgusunda veya HTML sayfasında kullanıldığında nasıl güvenlik problemine dönüşebilir?

I1'de input validation'ı iş kuralı ve format olarak ayırdık. Şimdi aynı girdinin **farklı yorumlayıcılar** tarafından nasıl değerlendirildiğini göreceğiz.

## 41.1 İki farklı sözleşme

MiniShop'ta müşteri bir teslimat notu yazabiliyor:

> “Kapıya bırakın.”

Bu veri:
- HTTP üzerinden API'ye gelir;
- DB'de saklanır;
- admin veya müşteri arayüzünde gösterilir;
- bazen arama veya rapora eklenir.

Bir alanın **max 300 karakter** olması iş/format kuralıdır. Ancak bu, metnin DB sorgusunda, HTML'de veya logda **komut gibi yorumlanmasını engellediği** anlamına gelmez.

## 41.2 Input validation ne yapar?

**Input validation**, beklenen tip, aralık, biçim, uzunluk ve iş kuralına uygunluğu kontrol eder.

Örnek sözleşme:
- \`quantity\`: integer, 1–20 dahil;
- \`deliveryNote\`: optional string, en fazla 300 karakter;
- \`deliveryType\`: STANDARD veya EXPRESS.

~~~typescript
function isValidQuantity(input: unknown): input is number {
  return typeof input === "number" &&
    Number.isInteger(input) &&
    input >= 1 &&
    input <= 20;
}
~~~

**Açıklama:**
- \`unknown\` dış girdinin tipine güvenmez;
- \`typeof\` runtime number kontrolüdür;
- \`Number.isInteger\` ondalıkları reddeder;
- aralık koşulları iş kuralını uygular.

Bu fonksiyon yalnız **quantity** kuralını kontrol eder. \`NaN\` ve \`Infinity\` zaten \`Number.isInteger\` testini geçmez; ama para hassasiyeti, schema ve diğer alanlar ayrıca değerlendirilmeli.

## 41.3 Client-side validation ve server-side validation

UI “quantity 1–20” diye uyarı gösterebilir. Bu iyi kullanıcı deneyimidir. Fakat HTTP istemcisi JavaScript kontrollerini atlayabilir.

**Güvenlik sınırı:** API, güvenmediği girdiyi **server tarafında** doğrulamalıdır. UI kontrolünün varlığı backend validation için kanıt değildir.

Test dağılımı:
- Component: validator'ın EP/BVA örnekleri;
- API: doğrudan yanlış tipe/alanlara sahip request reddi;
- UI: kullanıcıya anlaşılır error feedback ve doğru state.

## 41.4 SQL injection neden oluşur?

**Güvensiz zihinsel model:** Kullanıcı girdisini SQL metniyle birleştirmek.

~~~typescript
// KÖTÜ ÖRNEK: UYGULAMADA KULLANMA
const sql = "SELECT * FROM orders WHERE note = '" + note + "'";
~~~

Bu yaklaşımda kullanıcı verisiyle SQL yapısı **aynı string içinde** birleştiriliyor. Bir alıntı işareti veya özel karakter yorumlamayı bozabilir; saldırgan girdisi daha ciddi sonuçlar doğurabilir.

**Güvenli örnek: parametreli sorgu**

~~~typescript
// DB driver'a göre placeholder sözdizimi değişir.
const sql = "SELECT * FROM orders WHERE note = $1";
const parameters = [note];
~~~

Burada query yapısı ile **veri parametresi** ayrıdır. Üretim uygulamasında kullanılan driver/ORM'un parametre bağlama özellikleri doğrulanır.

**Yanlış çözüm:** “Tırnak işaretini yasaklayalım, sorun kalmasın.” Girdi yasak listesi, SQL parameterization'ın yerini tutmaz.

## 41.5 XSS ve output encoding farklıdır

Müşteri notu HTML ekranda gösterilecek.

**Riskli:** Kullanıcı metnini kontrolsüz \`innerHTML\` ile HTML olarak yorumlamak.

**Daha güvenli yaklaşım:** Metni ilgili UI API'sinde **text content** olarak göstermek veya bağlama uygun output encoding/sanitization uygulamak.

~~~typescript
// Metin göstermek için şematik örnek:
element.textContent = deliveryNote;
~~~

**Önemli ayrım:** HTML element text, HTML attribute, JavaScript string ve URL birbirinden farklı **output context**'lerdir. Bir bağlam için doğru encoding başka bağlamda yeterli olmayabilir. Eğer kullanıcıya gerçekten sınırlı HTML biçimlendirmesi izni veriliyorsa sıradan encoding yerine uygun **HTML sanitization** gerekebilir; onaylı kütüphane/policy gerekir.

**Output encoding ≠ input validation.** Zararsız görünen verinin farklı bağlamda komut olarak yorumlanmamasını sağlamaya çalışır.

## 41.6 Testlerde neyi gözleyeceğiz?

| Risk | Test condition | Expected evidence |
|---|---|---|
| Integer kuralı | quantity=0,1,20,21,1.5, null | Contract'a uygun kabul/ret |
| SQL komut/veri karışması | Apostrof içeren sentetik teslimat notu | Doğru kayıt/arama; sorgu yapısı bozulmaz |
| HTML injection/XSS | HTML olarak yorumlanmaması gereken sentetik metin | Ekranda metin olarak görünür, script çalışmaz |
| Hata mesajında bilgi sızması | Geçersiz input | Sensitive DB/stack bilgisi açığa çıkmaz |
| Uzun veri | max length ve komşusu | Doğru sınır doğrulaması |

**Test etme kuralı:** Yalnız **yetkili laboratuvar/test sistemi** üzerinde çalış. Bu bölüm istismar payload kütüphanesi değil; kontrol ve kanıtın mantığını öğretir.

### API 400 döndü diye injection önlendi mi?

Hayır. Uygulama normal testte 400 verebilir ama başka endpoint'te güvensiz SQL birleştirme bulunabilir. Güvenlik kanıtı için:
- uygulanabilir server-side validation;
- parameterized query veya güvenli veri API'si;
- kritik output context kontrolü;
- code review ve gerektiğinde uygun dynamic test

birlikte değerlendirilir.

## 41.7 Hata örneği ve fix

**Kusur:** Teslimat notu HTML'de biçimlendirme olarak yorumlanıyor.

**Kök neden:** Kullanıcı kontrolündeki string, HTML yorumlayan API'ye filtresiz gönderilmiş.

**Fix:** Notu text olarak render etmek; ürün gerçek HTML desteği istiyorsa güvenilir sanitization politikası uygulamak.

**Regression:** Zararsız metin normal görünür; HTML etiketleri beklenmeyen markup/script oluşturmaz; uzunluk ve encoding testleri ilgili sınırda korunur.

**Karşı örnek:** Her şeyi silip kullanıcı metnini boş göstermek, güvenlik riskini azaltabilir ama ürünü işlevsiz hale getirir. Pozitif davranışı da test et.

## 41.8 Alıştırma — yeni API

Belge API'sinde \`title\` alanı 1–100 karakter; \`pageCount\` 1–500 dahil integer. Başlık DB sorgusunda ve UI ekranında kullanılıyor.

**Görev:** İki BVA testi, iki güvenlik kontrolü ve hangi sınırda kanıt gerektiğini belirt.

**Örnek çözüm:** title uzunluğu 0/1 ve 100/101; pageCount 0/1 ve 500/501. Server validation API'de doğrulanır. Title içindeki apostrof DB sorgu parametresi olarak işlenir; UI'da HTML yerine metin olarak gösterilir. Component validation testi tüm entegrasyonu kanıtlamaz.

## Sonraki ders

Girdi doğru işleniyor ve yetki kontrolü var. Fakat **sistem başarısızlık anında** hangi güvenli davranışı korumalı? Kötüye kullanım ve fail-safe düşüncesine geçeceğiz.

→ [42. Abuse Cases & Fail-safe Behavior](05-abuse-cases-fail-safe-and-exception-handling.md)

**Kaynak:** [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) · [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) · [XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).
