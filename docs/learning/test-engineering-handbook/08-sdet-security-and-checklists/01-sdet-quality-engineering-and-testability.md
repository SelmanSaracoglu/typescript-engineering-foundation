# 38. SDET Quality Engineering — Test edilebilir yazılım tasarlamak

> **Temel soru:** Testin zor yazılması yalnız tester'ın problemi midir, yoksa yazılım tasarımına dair bir sinyal mi?

I1'den I5'e kadar gereksinim, test tasarımı, veri, otomasyon, API ve debugging arasında ilerledik. Son Increment'in başlangıcında perspektifi genişletiyoruz: **SDET yalnız hazır yazılımı test eden kişi değil, güvenilir kalite kanıtı üretilebilen sistemi tasarlamaya katkı veren mühendistir.**

## 38.1 Problem: Her test browser açmak zorunda

MiniShop'ta bir fonksiyon kupon indirimini, kargo ücretini, ödeme kayıtlarını ve e-posta gönderimini tek büyük işlemde yapıyor olsun.

Bir tane 100 € sınırını test etmek için:
1. Browser'dan giriş yapılıyor;
2. sepete ürün ekleniyor;
3. ödeme sandbox'ı çağrılıyor;
4. e-posta servisi bekleniyor;
5. UI çıktısı kontrol ediliyor.

Bu zincirde failure olduğunda **hangi iş kuralının bozulduğu** belirsizdir. Üstelik basit bir karşılaştırma kusuru için beş sistemi ayakta tutmak gerekir.

**Soru:** Bu bir test framework problemi mi, yoksa iş mantığının bağımlılıklardan ayrılamaması problemi mi?

## 38.2 Testability ne demek?

**Testability**, yazılımın davranışını kontrollü girdilerle çalıştırabilmemiz ve sonucu anlamlı biçimde gözlemleyebilmemizdir. İki temel boyut:

- **Controllability:** Test için zaman, giriş verisi, bağımlılık yanıtı ve başlangıç state'i kontrol edilebilir mi?
- **Observability:** Hangi iş sonucu, hata, state veya yan etki ortaya çıktı; bunu doğrulayabilir miyiz?

SDET açısından bu boyutlar test kodunu ve **production tasarımını** ilgilendirir.

Örnek: Kupon hesabının sistem saatini içeriden \`new Date()\` ile okuması, boundary testlerini kontrolsüz yapar. \`now\` parametresi veya Clock arayüzü, hem tasarımı hem testability'yi iyileştirir.

## 38.3 Bir tasarım iyileştirmesini takip edelim

**İç içe bağımlı yaklaşım (şematik):**

~~~text
checkout()
  → browser/session state
  → DB read
  → coupon calculation
  → payment provider
  → DB update
  → notification
~~~

**Ayrılmış sorumluluklar:**

~~~text
Eligibility & Pricing Rules  ← saf iş kuralları
           ↓
Order Application Service    ← iş akışı / transaction
           ↓
Repository / Payment / Mail  ← kontrollü sınırlar
           ↓
HTTP & UI                    ← adapter / kullanıcı yüzeyi
~~~

Burada:
- **Pure calculation** aynı input'a aynı output verir; kolayca BVA/decision-table testi yapılır.
- **Application service** order state ve birden çok bağımlılığın etkileşimini yönetir.
- **Adapters** dış servis, DB ve HTTP ayrıntısını taşır.
- **UI**, kullanıcı niyetini ve görünür sonucu test etmeye olanak verir.

**Bu, yeni framework veya zorunlu klasör mimarisi değildir.** Test edilebilir sorumluluk ayrımını anlatan bir modeldir.

## 38.4 Küçük TypeScript örneği

Onaylı eğitim kuralı: ACTIVE üye, net tutar en az 10000 cent ve STANDARD ise kargo ücretsiz.

~~~typescript
type Delivery = "STANDARD" | "EXPRESS";

function shippingMinor(
  active: boolean,
  netBasketMinor: number,
  delivery: Delivery
): number {
  if (delivery === "EXPRESS") return 1000;
  return active && netBasketMinor >= 10000 ? 0 : 500;
}
~~~

Artık boundary/decision kombinasyonları doğrudan seçilebilir:

| Input | Expected |
|---|---|
| ACTIVE, 9999, STANDARD | 500 |
| ACTIVE, 10000, STANDARD | 0 |
| INACTIVE, 12000, STANDARD | 500 |
| ACTIVE, 12000, EXPRESS | 1000 |

Bu kod **çalıştırılmış repository testi değil**, açıklamalı bir örnektir.

**Bir eksik daha var:** \`netBasketMinor\` negatif veya ondalıklı gelirse ne olacak? TypeScript'te \`number\` runtime validation sağlamaz. İş fonksiyonu önkoşulu ile **HTTP giriş validasyonu** ayrı tanımlanmalı. Testability güvenliği otomatik sağlamaz.

## 38.5 SDET'nin tasarıma katkısı

Bir tester “bu kontrolü test edemiyorum” dediğinde şu mühendislik sorularını sorabilir:
- Hangi bağımlılık kontrol edilemez?
- Teste özel veri üretmek neden zor?
- Önemli state hiç görünür değil mi?
- Yetki kuralı yalnız UI'da mı?
- Event/log kimliği olmadan failure araştırması mümkün mü?
- Gerçek provider yerine double kullandığımızda hangi risk saklanıyor?

İyi SDET cevabı yalnız “daha fazla assertion” değildir; **sistem sınırlarını daha gözlenebilir ve kontrollü hale getirme önerisi** de içerebilir.

## 38.6 Mutation düşüncesi: Test gerçekten kusur yakalar mı?

Geliştirici yanlışlıkla:

~~~typescript
netBasketMinor > 10000
~~~

yazarsa 10000 sınırı hatalı olur. Yukarıdaki sınır testi bunu yakalayacak mı? **Evet**; beklenen 0 yerine 500 döner.

Ama yalnız 12000 örneğimiz olsaydı yanlış \`>\` operatörü görünmeyecekti. Bu tür kasıtlı küçük bozuklukla **testin duyarlılığını** sorgulamaya mutation düşüncesi diyebiliriz. Bu bir mutation testing aracı kurulduğu anlamına gelmez.

## 38.7 Kalite metriği neden tek başına hedef değil?

- **100% statement coverage:** Her iş kuralı ve güvenlik gereksinimi doğrulandı anlamına gelmez.
- **500 E2E tests:** Hepsi aynı happy path ise etkisiz tekrar olabilir.
- **Yeşil CI:** Çalıştırılmayan senaryolar hâlâ açıktır.
- **Az flaky test:** Riskli ama hiç test edilmeyen parçalar olabilir.

Metrikleri **kararları desteklemek** için kullan. Hangi riskin hangi kanıtla kontrol edildiğini söyle.

## 38.8 Alıştırma — yeni sistem

Bir belge servisinde \`approveDocument()\` hem rolü kontrol ediyor, hem DB'ye yazıyor, hem dış e-posta gönderiyor. Testler yalnız E2E'de çalışıyor.

**Görev:** İki ayrıştırılabilir sorumluluk, bir component testi, bir integration testi ve hâlâ gerekli bir E2E kontrolü öner.

**Örnek çözüm:** Yetki/state kararını ayrı sınamak; kalıcılık ve bildirimi application service/adapters düzeyinde yönetmek. Component'te PENDING→APPROVED geçiş izni, integration'da DB state/transaction, E2E'de reviewer'ın doğru belge durumunu görmesi. Double'lı bildirim testi gerçek mail teslimini kanıtlamaz.

## Sonraki ders

Testability'yi yalnız hız için değil, güvenlik için de kullanabiliriz. Şimdi **varlık, trust boundary, tehdit ve test edilebilir güvenlik gereksinimi** zincirini kuracağız.

→ [39. Security Requirements & Threat Modeling](02-security-requirements-and-trust-boundaries.md)
