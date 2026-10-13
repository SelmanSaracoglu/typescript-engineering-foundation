# 7. State Transition Testing — Geçmişin önemli olduğu sistemler

> **Bu bölümün sorusu:** Aynı “iptal et” isteği neden bir durumda kabul, başka bir durumda reddedilir?

## 7.1 Şimdiye kadar neyi test ettik?

Önceki teknikler bize farklı sorular sordurdu:

- **EP:** Girdi hangi davranış grubuna ait?
- **BVA:** Grupların tam sınırında ne oluyor?
- **Decision table:** Koşullar birlikteyken hangi karar veriliyor?

Ama bazı sistemlerde aynı input **farklı zamanlarda** farklı sonuç üretir.

Örnek: Sipariş “henüz hazırlanıyor” durumundayken iptal edilebilir; “teslim edildi” durumundayken aynı iptal isteği reddedilir. Buradaki belirleyici bilgi yalnız input değil, **mevcut state** ve o state'e nasıl gelindiğidir.

Bu tür sistemlerde **State Transition Testing** kullanırız.

## 7.2 Modeli kurmak: state, event ve transition

Örnek sipariş süreci:

~~~text
CREATED --pay--> PAID --ship--> SHIPPED --deliver--> DELIVERED
   |                |
 cancel           cancel
   v                v
CANCELLED <---------+
~~~

Dört kavramı ayıralım:

- **State:** Sistemin iş bakımından anlamlı mevcut durumu; örn. PAID.
- **Event:** Sisteme gelen olay/istek; örn. cancel.
- **Transition:** Bir event sonunda bir state'ten başka state'e geçilmesi; örn. PAID → CANCELLED.
- **Guard / condition:** Geçişe izin veren ek kural; örn. “kargo çıkmamış olmalı”.
- **Action:** Event sonucunda oluşan yan etki; örn. geri ödeme işlemi veya audit kaydı.

Sistem state'i kalıcı veri tabanında tutuyor olabilir; bazen hesaplanan bir durumdur. Tester açısından önemli olan **gözlenebilir davranışın mevcut state'e bağlı olmasıdır**.

## 7.3 State table çıkarma

Önce örneğe ait **onaylı kuralları** sabitleyelim:

- CREATED durumunda pay veya cancel izinli.
- PAID durumunda ship veya cancel izinli.
- SHIPPED durumunda deliver izinli.
- DELIVERED ve CANCELLED terminal state'ler.
- Diğer event'ler reddedilir; state değişmez.

| Current state | pay | ship | deliver | cancel |
|---|---|---|---|---|
| CREATED | PAID | REJECT | REJECT | CANCELLED |
| PAID | REJECT | SHIPPED | REJECT | CANCELLED |
| SHIPPED | REJECT | REJECT | DELIVERED | REJECT |
| DELIVERED | REJECT | REJECT | REJECT | REJECT |
| CANCELLED | REJECT | REJECT | REJECT | REJECT |

**Not:** Gerçek e-ticaret sistemlerinde ödeme iadesi, kısmi teslimat ve geri gönderim çok daha karmaşıktır. Bu tablo öğretim için tanımladığımız **basit modelin sözleşmesidir**; evrensel sistem davranışı değildir.

## 7.4 Testleri sadece butona göre değil, başlangıç state'ine göre yaz

“Cancel butonu çalışıyor mu?” yetersizdir. Daha iyi sorular:

1. **CREATED → cancel:** CANCELLED olur mu?
2. **PAID → cancel:** CANCELLED olur mu; refund süreci doğru tetiklenir mi? (Bu modelde yan etki sözleşmesi ayrıca tanımlanmalı.)
3. **SHIPPED → cancel:** Beklenen ret geliyor mu?
4. **DELIVERED → cancel:** State değişmeden kalıyor mu?
5. **CANCELLED → cancel:** İkinci istek reddediliyor mu? Yoksa idempotent success mi bekleniyor? Bu, **onaylı API sözleşmesine** bağlıdır.

Beş testin hepsinde “cancel” var ama **beş farklı state koşulu** sınanıyor.

### Negative transition'da yalnız response yetmez

SHIPPED siparişi cancel etmeyi denedik ve HTTP 409 döndü (bu response'u ürün sözleşmesinin seçtiğini varsayalım).

Test tamam mı? Hayır. Sistemin yanlışlıkla **CANCELLED** state'ini kaydedip yalnız kullanıcıya hata göstermediğini nasıl biliyoruz?

Beklenen çift kanıt:
- Ret yanıtı;
- Siparişin **SHIPPED** kalması ve yasak yan etkinin oluşmaması.

Bu, stateful sistemlerde temel bir test alışkanlığıdır.

## 7.5 State coverage ile transition coverage neden farklı?

Basitleştirilmiş modelde beş state var:

CREATED, PAID, SHIPPED, DELIVERED, CANCELLED.

Bir test dizisi şu dört state'i ziyaret ediyor:

~~~text
CREATED → PAID → SHIPPED → DELIVERED
~~~

**State coverage = 4 / 5 = %80.** CANCELLED hiç ziyaret edilmedi.

Şimdi CANCELLED'ı da görmek için CREATED → CANCELLED testi ekledik. Beş state'e eriştik: **%100 state coverage**.

Peki tüm **geçerli geçişleri** test ettik mi?

Hayır. PAID → CANCELLED geçişi hâlâ eksik.

Bu modelde geçerli geçişler:

1. CREATED → PAID
2. CREATED → CANCELLED
3. PAID → SHIPPED
4. PAID → CANCELLED
5. SHIPPED → DELIVERED

Dördü işletildiyse **valid-transition coverage = 4/5 = %80**.

**Çıkarım:** Bütün state'leri görmek, bütün geçişlerin çalıştığını **garanti etmez**.

Ayrıca invalid event'lerin reddi de ayrı bir risk alanıdır. Bunları kapsarken kullandığın metriğin yalnız **valid transitions** mı, yoksa tanımlı **valid + invalid** state-event çiftleri mi içerdiğini açık yaz. Örneğin tablodaki 20 hücrenin 5'i valid, 15'i invalid'dir; yalnız geçerli geçiş kapsamını tüm davranış kapsamı diye sunma.

## 7.6 Bir akışta birden çok transition olabilir

CREATED → pay → PAID → ship → SHIPPED → deliver → DELIVERED

Tek test koşusu üç farklı geçişi işletir. Ancak bir hata çıktığında hangi adımın sorun yarattığını teşhis etmek zorlaşabilir. Bu nedenle:

- küçük state transitions'ları uygun sınırda ayrı doğrula;
- az sayıda kritik uzun iş akışını uçtan uca koru;
- her adımın state'ini ve yan etkilerini gözlenebilir kıl.

Bu yaklaşım daha sonra test seviyeleri ve otomasyon mimarisiyle birleşecektir.

## 7.7 Başka bir örnek: hesap kilitleme

Bu örnek için kurallar:

- ACTIVE hesapta üç **ardışık** yanlış şifre denemesi sonrası LOCKED;
- Başarılı giriş sayacı sıfırlar;
- LOCKED hesapta doğru şifre bile giriş sağlamaz;
- Yetkili unlock işlemi LOCKED → ACTIVE yapar.

Şimdi “üç yanlış giriş” yalnız üç adet input değil, **olay dizisidir**. Araya bir doğru giriş girerse sayaç sıfırlanabilir. Bunları yalnız EP veya BVA ile açıklamak zorlaşır; sayacın ve state'in modelini test etmek gerekir.

Test:

~~~text
ACTIVE → wrong → ACTIVE(count=1)
       → wrong → ACTIVE(count=2)
       → correct → ACTIVE(count=0)
       → wrong → ACTIVE(count=1)
       → wrong → ACTIVE(count=2)
       → wrong → LOCKED
~~~

**Kritik nokta:** Model ve lock threshold ürün gereksinimi olarak onaylı olmalı; her login sistemi böyle davranır diye varsayma.

## 7.8 Alıştırma

**Yeni model:** Taslak belge DRAFT → gönder → SUBMITTED → onayla → APPROVED. SUBMITTED → geri çek → DRAFT mümkündür. APPROVED terminaldir.

**Görev:** Şu üç testi sınıflandır: Geçerli mi, geçersiz mi? Expected state nedir?

1. DRAFT durumunda “approve”.
2. SUBMITTED durumunda “withdraw”.
3. APPROVED durumunda “withdraw”.

**Örnek çözüm:**
1. Invalid, DRAFT kalmalı.
2. Valid, DRAFT'a dönmeli.
3. Invalid, APPROVED kalmalı.

Bu üç testte de, onaylı kurallara göre yan etki oluşmaması/oluşması ayrıca değerlendirilebilir.

## Sonraki bölüm

Artık kural temelli teknikler için iyi bir omurgamız var. Ancak gerçek projelerde her risk önceden yazılmış bir requirement olarak gelmez.

→ [8. Scenario, Negative & Exploratory Thinking](05-scenario-negative-exploratory-testing.md)
