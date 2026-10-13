# 20. Test Doubles — Dummy, Stub, Fake, Spy ve Mock

> **Temel soru:** Gerçek e-posta servisini kullanmadan, sipariş servisinin doğru davranışını nasıl test edebiliriz?

Önceki derslerde test verisini kontrol ettik, zamanı sabitledik ve testleri birbirinden ayırdık. Ancak gerçek bir uygulama çoğu zaman **başka bileşenlere** bağımlıdır. Bir sipariş servisi, ödeme sağlayıcısına, veritabanına ve e-posta servisine çağrı yapabilir.

Bu bağımlılıklardan birini testte **kontrol edilen bir alternatifle** değiştirdiğimizde buna genel olarak **test double** deriz.

## 20.1 Önce problem: Gerçek e-posta mı göndereceğiz?

MiniShop'un sipariş servisi şu işi yapıyor olsun:

1. Sipariş durumunu kontrol et.
2. Siparişi kaydet.
3. Müşteriye onay e-postası gönder.

Amacımız yalnız şu kuralı sınamak:

> “Başarılı siparişten sonra doğru müşteriye bir onay bildirimi gönderilmesi istenir.”

Her component testte gerçek bir e-posta sağlayıcısına gitmek:
- Yavaş olabilir;
- Test kullanıcılarına istemeden e-posta gönderebilir;
- Ağ, hesap kotası ve sağlayıcı kesintisine bağımlıdır;
- Failure'ın kaynağını bulanıklaştırabilir.

Bu nedenle e-posta bağımlılığı yerine **kontrollü bir test double** kullanmak yararlı olabilir.

**Önemli:** Test double gerçek bağımlılığın yerini aldığı için **o entegrasyonu gerçekten test etmiş olmayız**. Bu boşluğu ileride contract/integration testleriyle değerlendirmeliyiz.

## 20.2 Dependency boundary neden önemli?

Küçük bir uygulama arayüzü düşünelim:

~~~typescript
type EmailMessage = {
  to: string;
  subject: string;
};

interface Mailer {
  send(message: EmailMessage): Promise<void>;
}

async function confirmOrder(customerEmail: string, mailer: Mailer) {
  await mailer.send({
    to: customerEmail,
    subject: "Order confirmed",
  });
}
~~~

Buradaki `Mailer` arayüzü, gerçek servis ile testteki alternatifi aynı **sözleşmeye** bağlamamıza yardımcı olur.

Dependency injection gibi yöntemlerde fonksiyon bağımlılığını içeride rastgele oluşturmaz; **dışarıdan alır**. Bu, test edilebilirliği yükseltir.

Arayüz koymak tek başına iyi mimari garantisi değildir; **değişken veya pahalı sınırı** kontrol etmeye yarıyorsa anlamlıdır.

## 20.3 Beş tür double'ı tek ihtiyaç üzerinden öğrenelim

Günlük konuşmada hepsine “mock” denildiğini duyabilirsin. Fakat test tasarımı açısından bunların amaçları farklıdır.

### 1. Dummy — Sadece imzayı doldurur

**Dummy**, kullanılmayan fakat bir parametre veya nesne gereksinimi yüzünden verilen değerdir.

Örnek: `calculateOrderTotal(items, optionalLogger)` fonksiyonu belirli bir senaryoda logger'ı hiç çağırmıyorsa, testte verilen işlevsiz logger bir dummy olabilir.

**Dikkat:** Kod dummy'yi kullanmaya başlarsa test anlamsız biçimde yanlış davranabilir. Gerçek ihtiyaç varsa uygun başka double'a geç.

### 2. Stub — Önceden belirlenmiş cevap verir

Sipariş servisinin müşteri üyeliği bilgisini dış kaynaktan aldığı durumda:

~~~typescript
const membershipStub = {
  async getStatus(_customerId: string) {
    return "ACTIVE" as const;
  },
};
~~~

Bu **stub** çağrıya **kontrollü cevap** verir. Böylece kargo hesaplamasını **ACTIVE müşteri** koşuluyla tekrar edebiliriz.

**Stub'ın temel görevi:** Sisteme test edilebilir **dolaylı input** sağlamak. Kaç kez çağrıldığını kontrol etmek zorunda değildir.

### 3. Fake — Basitleştirilmiş çalışan implementasyon

Gerçek repository'nin yerine küçük bir bellek içi karşılık koyabiliriz:

~~~typescript
class InMemoryCouponRepository {
  private statuses = new Map<string, "AVAILABLE" | "USED">();

  set(id: string, status: "AVAILABLE" | "USED") {
    this.statuses.set(id, status);
  }

  get(id: string) {
    return this.statuses.get(id);
  }
}
~~~

Bu **fake**, sadece tek cevap döndürmekten daha fazlasını yapar: basit ama çalışan **veri tutma davranışı** vardır.

**Avantaj:** Gerçek DB maliyeti olmadan birden fazla state üzerinde test yapabiliriz.

**Risk:** Fake gerçek veritabanıyla aynı transaction, concurrency, constraint veya query davranışını göstermeyebilir. Fake'le bütün testler geçti diye DB entegrasyonu kanıtlanmaz.

### 4. Spy — Ne olduğunu kaydeder

Gerçek e-posta göndermek yerine gönderim isteğini bellekte tutan bir yardımcı:

~~~typescript
class RecordingMailer {
  messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.messages.push(message);
  }
}
~~~

Test sonunda `messages` dizisini inceleyip **hangi çağrının hangi argümanlarla yapıldığını** kontrol edebiliriz. Böyle bir recording double **spy** görevini görür.

**Spy**, çağrılar hakkında gözlem toplar. Bazı framework spy'ları gerçek metodu çalıştırmaya da devam edebilir; bu nedenle yalnız “spy var” diyerek dış yan etki yok varsayımı yapma.

### 5. Mock — Beklenen etkileşimleri tanımlar ve doğrular

Bir **mock**, genellikle daha test başında **hangi çağrıyı hangi argümanlarla beklediğimizi** tanımlar; test bu etkileşim beklentisine göre doğrulanır.

Sipariş sonrası tam olarak bir `send()` çağrısı beklendiğini test aracıyla belirtmek buna örnektir:

~~~text
Given a completed order
Expect mailer.send({to: customerEmail, subject: "Order confirmed"}) once
When confirmOrder runs
Verify expected interaction happened
~~~

Bu **pseudo-code**'dur; herhangi bir framework komutu veya çalıştırılmış test değildir.

**Mock ile stub farkı:** Stub teste kontrollü **cevap** sağlar; mock testin doğrulamak istediği **etkileşimi** merkeze alır. Pratik framework API'lerinde aynı nesne iki amaçla da kullanılabilir; bu yüzden nesneye değil **testteki rolüne** bak.

## 20.4 Karşılaştırma tablosu

| Double | Ana işlevi | Tipik örnek | Ne değildir? |
|---|---|---|---|
| Dummy | Kullanılmayan parametreyi doldurmak | Kullanılmayan logger | Gerçek doğrulama |
| Stub | Önceden belirlenmiş cevap | `getStatus() → ACTIVE` | Zorunlu çağrı sayacı |
| Fake | Basitleştirilmiş çalışan alternatif | In-memory repository | Gerçek DB garantisi |
| Spy | Çağrıyı/argümanı kaydetmek | Gönderilen e-posta listesi | Mutlaka gerçek servisi durduran araç |
| Mock | Beklenen interaction'ı doğrulamak | `send()` bir kez çağrılmalı | Gerçek email delivery testi |

**Terminoloji nüansı:** Bazı kütüphaneler `mock` sözcüğünü bütün yer değiştirme araçları için kullanır. Kavramsal sınıflandırma bundan daha ayrıntılıdır. Mühendislik konuşmasında **neyi kontrol edip neyi doğruladığını** belirtmek daha önemlidir.

## 20.5 Hangi durumlarda double kullanmayalım?

Örneğin ödeme sağlayıcısına yollanan alanın yanlış isimli olduğu bir hata araştırılıyor.

Component testte `paymentStub.charge() → success` döndürmek servis mantığını çalıştırabilir ama yanlış field mapping'i **gizleyebilir**.

**Doğru karar:** Kod içindeki retry/karar mantığı için kontrollü double kullan; dış sağlayıcı contract'ını doğrulamak için **ayrı entegrasyon testi** tasarla. Test double ile **hangi gerçeği devre dışı bıraktığını** her zaman düşün.

### “Her şeyi mock'layalım” neden riskli?

Gerçek üyelik repository'si, ödeme sağlayıcısı, hesaplama fonksiyonu ve sipariş state güncelleyicisi tamamen mock'lanırsa test yalnız şunu gösterebilir:

> “Mock'a öğrettiğimiz cevaplar geldiğinde, mock'a öğrettiğimiz çağrılar yapıldı.”

Bu, gerçek ürünün çalışacağına ilişkin zayıf kanıt olabilir. **System under test (SUT)** olarak hangi gerçek davranışı sınadığımız açık kalmalı.

## 20.6 Çalışılmış örnek: e-posta bildirimi

Kurallar:
- Sipariş PAID olursa doğru adrese bir bildirim gönderme çağrısı yapılır.
- Sipariş FAILED olursa bildirim gönderilmez.

**Component düzeyinde:**
- Order service gerçek iş kodu;
- Mailer bağımlılığı spy/mock;
- State fixture test tarafından kurulmuş;
- Assertion: PAID → doğru mesaj bir defa; FAILED → sıfır çağrı.

**Bu test neyi gösterir?** Servisin **gönderim isteği kararını** doğrular.

**Neyi göstermez?** E-postanın gerçekten ulaştığını, sağlayıcının authentication'ının doğru olduğunu, e-posta formatının dış sistemde kabul edildiğini. Bu farklı kanıt gerektirir.

## 20.7 Alıştırma — yeni bağımlılıklar

Bir rezervasyon servisi üç bağımlılık kullanıyor:
1. Tarihi veren `Clock`;
2. Odaları saklayan repository;
3. Dış SMS sağlayıcısı.

**Görev:** Her biri için uygun bir double veya gerçek entegrasyon tercihi ve gerekçesi yaz.

**Örnek çözüm:**
- Clock: Sabit cevap veren **stub** ile 23:59 boundary'sini deterministik yap.
- Repository: State değişimini sınamak için **in-memory fake**, ama DB constraint riskini görmek için ayrıca gerçek DB integration testi.
- SMS: “Bildirim istendi mi?” için **spy/mock**; gerçek SMS gateway sözleşmesi için yetkili sandbox'ta ayrı integration testi.

Bu cevap tek zorunlu tasarım değildir. **Hangi riski hangi sınırda kontrol ettiğin**, doğru terimi ezberlemekten önemlidir.

## Sonraki ders

Double'ları tanıdık. Şimdi en kritik tasarım ayrımını çözmeliyiz: **Doğru sonucu mu assert edeceğiz, yoksa hangi metoda kaç kez gidildiğini mi?** Ve fazla mocking, testi nasıl kırılgan hale getirir?

→ [21. State vs Interaction & Over-mocking](05-state-vs-interaction-and-over-mocking.md)
