# 42. Abuse Cases & Fail-safe Behavior — Normal akış bozulduğunda

> **Temel soru:** API yanıt vermezse veya sistem beklenmedik bir girdi alırsa hangi güvenlik garantileri korunmalıdır?

Güvenli uygulama yalnız **başarılı istekte** doğru çalışan yazılım değildir. Ağ kesintisi, yanlış state, tekrar istek ve bağımlılık arızasında da kritik invariants korunmalıdır.

## 42.1 Happy path ve abuse case farkı

MiniShop'ta alışverişin normal akışı:
- ACTIVE müşteri sepete ürün ekler;
- kupon uygular;
- ödeme yapar;
- sipariş PAID olur.

**Abuse case (kötüye kullanım senaryosu)**, bir actor'ın işlevi tasarlanmamış biçimde kullanması veya suistimal etmeye çalışmasıdır.

Örnekler:
- Aynı kuponu paralel iki siparişte kullanmak;
- Başkasının orderId'sini denemek;
- İzin verilmeyen state'te ödeme/iade denemesi;
- Miktar alanına negatif veya beklenmedik çok büyük değer göndermek;
- Ödeme yanıtı gelmeden işlemi tekrar etmek.

Bunların bazıları kasıtlı saldırıdır, bazıları olağan kullanıcı/ağ koşulunda kendiliğinden gerçekleşebilir. **Güvenli tasarım ikisini de düşünür.**

## 42.2 Exception handling = hatayı gizlemek değildir

HTTP API bir DB hatası yaşıyor. Zayıf davranış:

~~~json
{"error":"SQL query failed with internal database connection string and password"}
~~~

Bu hem iç yapı hem secret sızdırabilir.

**Daha güvenli düşünce:**
- İstemciye sözleşmeye uygun, gereksiz iç bilgi açmayan hata;
- server tarafında izlenebilir correlation ID;
- yetkili kayıt sisteminde nedeni araştırmaya yetecek log;
- işlemin atomik/tutarlı final state'i;
- hata sonrası tekrar denemenin güvenli tasarlanması.

**“Her hatada 500 dönsün” çözüm değil.** Validation 4xx, auth ret 401/403/404, service kesintisi 5xx gibi kategoriler sözleşmede açıklanmalıdır.

## 42.3 Fail-safe / fail-closed kararını somutlaştır

Order Service, authorization kararını Policy Service'ten alıyor. Policy Service timeout oldu.

**Güvensiz kural:**
> “Yetki kontrolü çalışmadı; kullanıcıyı kabul et.”

**Korunması gereken invariant:**
> “Yetki doğrulanmadan korunan sipariş verisi açıklanmaz veya değişmez.”

Beklenen HTTP status ve hata mesajı ayrı seçilebilir; asıl güvenlik sonucu **yetkisiz işlemin yapılmamasıdır**.

**Nüans:** Fail-safe her sistemde “bütün iş durur” anlamına gelmez. Kritik erişim için güvenli ret, bir sağlık gözlem endpoint'i için sınırlı degrade veya read-only davranış gibi farklı tasarımlar olabilir. Güvenlik gerekçesi ve iş etkisi birlikte açıklanmalıdır.

## 42.4 Graceful degradation ve consistency

Ödeme sağlayıcısı geçici kesildi. Kullanıcıya:
- “Ödeme sonucunu henüz doğrulayamıyoruz” mesajı;
- işlem kimliğiyle durumu sorgulama;
- yeniden denemenin duplicate charge üretmemesi

gibi davranışlar gerekebilir.

**Yanlış iddia:** Ağ timeout = ödeme başarısız. I5'te gördüğümüz gibi charge gerçekleşmiş, yanıt kaybolmuş olabilir.

**Test koşulu:** İstek sonrası response kaybolur; yeniden deneme olur; **bir mantıksal ödeme = bir charge** invariant'ı korunur. UI mesajının doğruluğu ayrıca test edilir.

## 42.5 Exception path için test tasarımı

| Arıza / kötüye kullanım | Kritik beklenen |
|---|---|
| Authorization service unavailable | Korunan kaynak açıklanmaz |
| DB write fails mid-operation | Uygun rollback/compensation, tutarlı state |
| Payment timeout | Double charge oluşmaz; durum doğru yönetilir |
| İki paralel coupon apply | En fazla bir kullanım |
| Geçersiz input | Uygun ret; iş verisi istemeden değişmez |
| Unexpected exception | Secret/stack trace public response'a sızmaz |
| Audit pipeline unavailable | Politikanın belirlediği güvenli davranış ve olay kaybı yönetimi |

**Not:** Audit pipeline kesilince işin durması mı devam etmesi mi gerektiği, risk ve ürün sözleşmesine bağlıdır. Beklenen davranış yoksa tester **karar isteği** açar, kendi başına uydurmaz.

## 42.6 Sadece ret koduna bakmak niçin yetmez?

Bir API 403 döndürdü ama DB'de siparişin adresi değişti. Hata response'u doğru görünür; güvenlik invariant'ı yanlıştır.

Önemli negatif senaryolarda:
1. API/iş hatası doğrulanır;
2. **yetkisiz yan etki oluşmadığı** kontrol edilir;
3. gizli bilgi sızıntısı sorgulanır;
4. hata kaydı güvenle izlenebilir olmalıdır.

Bu kontrollerin tümü **aynı test seviyesinde** yapılmak zorunda değildir. Component policy, integration state ve system API testleri farklı kanıt üretir.

## 42.7 Alıştırma — yeni alan

Belge sisteminde reviewer atama servisi çalışmıyor. Buna rağmen bir reviewer PENDING belgeyi onaylamak istiyor.

**Görev:** Bir güvenli varsayılan, bir işlevsel etkisi, bir negatif test ve kalan riski yaz.

**Örnek çözüm:** Atanma doğrulanamıyorsa APPROVE isteği uygulanmaz. Kullanıcı görevini geçici tamamlayamayabilir (availability etkisi). Negatif testte atama servisi kontrollü timeout verir; belge PENDING kalır, belge içeriği sızmaz. İş sürekliliği için önceden belirlenmiş alternatif izin modeli yoksa ürün kararı gerekir.

## Sonraki ders

Hata sırasında veriyi koruduk. Peki bir olay oluştuğunda **hangi log, audit kaydı ve izleme sinyaliyle** araştırma yapacağız?

→ [43. Security Observability & Evidence](06-security-observability-audit-and-secrets.md)
