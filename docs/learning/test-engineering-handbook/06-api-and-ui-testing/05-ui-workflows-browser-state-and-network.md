# 34. UI Workflows, Browser State & Network — Görünen davranış ve gerçek sonuç

> **Temel soru:** UI “Sipariş başarılı” gösterdiğinde backend'in doğru çalıştığını kesin olarak bilir miyiz?

I5'in ilk dört dersinde API sözleşmesi, input, yetki, state, idempotency ve concurrency risklerini gördük. Şimdi aynı olayların **browser'daki kullanıcı yolculuğuna** nasıl yansıdığını değerlendireceğiz.

## 34.1 Bir kullanıcı yolculuğu

MiniShop'un onaylı checkout akışı:

1. Kullanıcı login olur.
2. Sepete ürün ekler.
3. Standart/Express kargo seçer.
4. Ödeme isteğini gönderir.
5. Sistem onay gösterir.

Bu akışın tek bir E2E test olarak geçmesi önemli kanıt olabilir. Ama “checkout başarılı” cümlesi geniştir:

- Doğru kullanıcı hesabı mı kullanıldı?
- Sepetteki ürün ve tutar doğru mu?
- İki kez tahsilat oluştu mu?
- Kullanıcıya gösterilen sipariş numarası backend'deki kayıtla aynı mı?
- Sonraki sayfa yenilenmesinde veri tutarlı mı?

**UI testinin görevi**, yalnız tıklamaların gerçekleşmesini değil **kullanıcı için önemli davranışın gerçekleştiğini** doğrulamaktır.

## 34.2 Browser state kaynakları

İki test aynı URL'yi açsa da farklı sonuç görebilir. Çünkü browser ve uygulama farklı state kaynakları kullanır:

| State | Örnek | Testte sorulacak soru |
|---|---|---|
| Cookie | Session cookie | Hangi kullanıcı olarak oturum açıldı? |
| localStorage | Kullanıcı tercihleri | Eski testten veri kaldı mı? |
| sessionStorage | Oturum içi UI state | Yeni test bunu yanlış devralıyor mu? |
| In-memory state | Basket/cart store | Reload olunca ne oluyor? |
| URL/query | Filtre, sayfa veya redirect | Doğrudan link ile açılabiliyor mu? |
| Backend state | Gerçek sipariş/üyelik | UI ile API tutarlı mı? |
| Cache/service worker | Eski response | Test gerçek güncel veriyi mi görüyor? |

**Dikkat:** Her uygulama bu mekanizmaların hepsini kullanmaz. Test tasarımında aktif uygulamanın state modelini anlamalıyız. Cypress'in test isolation ayarları ve session yardımcıları, bu tasarımın yerine geçmez.

## 34.3 Auth session ve kullanıcı değişimi

A kullanıcısıyla checkout testi tamamlandı. Ardından B kullanıcısının siparişi görmemesi gerekiyor.

Yanlış test düzeni:
- A oturumu hâlâ açık;
- Test “B kullanıcısı” sanıyor ama token/cookie A'ya ait;
- Authorization kontrolü yanlış identity ile yapılmış oluyor.

**Daha iyi:**
1. A/B test-owned hesapları oluştur;
2. her testin başlangıcında aktif session identity'sini doğrula;
3. B oturumuyla A'nın kaynağını talep et;
4. response ve sızıntı/state kanıtını kontrol et.

**cy.session** oturum setup'ını yeniden kullanmaya yardımcı olabilir; ancak cache edilen oturumun **doğru kullanıcıya ve geçerli auth state'e** ait olduğunu doğrulamak gerekir. Bu özellik tek başına authorization testi değildir.

## 34.4 cy.request ve cy.intercept karşılaştırması

İkisini I4'te gördük; burada test kanıtına bağlayalım.

**cy.request():** Test kodu doğrudan HTTP isteği gönderir; browser'dan çıkmaz, Cypress'in Node tarafında yürür. Endpoint testi, veri hazırlama ve kontrollü backend doğrulamasında işe yarar.

**cy.intercept():** Browser uygulamasının yaptığı HTTP çağrıları izler veya yanıtını stub'layabilir. Bu araç:
- hangi request gönderildiğini gözleyebilir;
- belirli response'u beklemeyi sağlayabilir;
- hata/gecikme simülasyonuyla UI davranışını test edebilir.

**Kritik teknik sınır:** cy.intercept() **cy.request() çağrılarını yakalamaz**. İki farklı network yolundan söz ediyoruz.

### Spy ile stub aynı kanıtı vermez

Örnek A — gerçek backend response'u:

~~~typescript
cy.intercept("GET", "/api/basket*").as("basket");
cy.visit("/basket");
cy.wait("@basket");
cy.get('[data-cy="basket-total"]').should("contain", "100");
~~~

Bu tasarımda network isteği gerçek backend'e ulaşırsa UI–backend birleşimine dair kanıt vardır.

Örnek B — stub response'u:

~~~typescript
cy.intercept("GET", "/api/basket*", {
  statusCode: 200,
  body: { totalMinor: 10000, currency: "EUR" }
}).as("basketStub");
cy.visit("/basket");
cy.wait("@basketStub");
cy.get('[data-cy="basket-total"]').should("contain", "100");
~~~

Bu örnek frontend'in **kontrollü response karşısındaki gösterimini** doğrular; gerçek backend sepet hesabını test etmez.

**Bu kodların ikisi de öğreticidir.** Uygulamada farklı response shape ve selector kullanılıyorsa birebir çalışması beklenmez.

## 34.5 “Request bitti” ile “UI doğru” farklıdır

API GET /basket 200 ile döndü. Browser ekranında hâlâ “Loading...” yazıyor. Bu durumda request başarılı olsa bile UI henüz doğru görünmüyor olabilir.

İyi test akışı:
- gerekli request gözlenir;
- loading veya UI state'in beklenen duruma gelmesi kontrol edilir;
- iş sonucu (doğru tutar/ürün/role) assert edilir.

**Sabit sleep**, state ilişkisini açıklamaz. Cypress query/assertion retry'si yararlı olsa da yanlış veri veya gerçek app bug'ını düzeltmez.

## 34.6 UI workflow riskleri: geri/yenile/iki sekme

Kullanıcılar yalnız düz happy-path izlemez.

**Reload:** Sipariş başarı mesajı yenilemeden sonra aynı siparişe mi bağlanıyor, yoksa tekrar payment request mi gönderiyor?

**Back/forward:** Form geri navigasyonda eski toplamı mı gösteriyor?

**İki sekme:** Aynı kupon iki kez uygulanınca backend'de tek kullanım garantisi var mı?

**Session expiry:** Checkout sırasında token süresi dolunca anlaşılır hata gösteriliyor mu? Gizli sipariş verisi ekranda kalıyor mu?

Her biri **ayrı risktir**. Hepsini tek E2E testte yığmak yerine:
- UI'ya özgü önemli kullanıcı tepkilerini seçilmiş browser testleriyle;
- ödeme/kupon state tutarlılığını API/integration ile;
- authorization'ı backend sınırında da doğrula.

## 34.7 Error handling: 500 mü, ağ kesintisi mi?

**HTTP 500:** Sunucu yanıt verdi; error status mevcut.  
**Network failure:** İstek için geçerli HTTP response alınamayabilir.

UI'nın göstermesi gereken durumlar farklı olabilir:
- Kontrollü hata mesajı;
- tekrar dene eylemi;
- işlem durumunun belirsiz olduğuna dair dürüst bilgi;
- ikinci ödeme oluşturmayacak güvenli retry.

**Yanlış tasarım:** “Payment failed” gösterip kullanıcıya tekrar tıklatmak, oysa ilk ödeme provider'da başarılı olabilir. Böyle akışta UI mesajı ve backend idempotency ayrı ayrı doğrulanmalıdır.

## 34.8 Alıştırma — belge yükleme akışı

Kural: Kullanıcı PDF yükler, upload tamamlandığında belge PENDING görünür. Ağ response'u kaybolursa kullanıcı doğru durum bilgisi almalıdır.

**Görev:** Bir browser testi, bir API testi ve bir UI riskini seç.

**Örnek çözüm:**
- Browser: Seçilmiş PDF yüklendikten sonra belge listesinde doğru ad ve PENDING state görünür.
- API: Gerçek backend'de belge metadata, owner ve file checksum/tutarlılık doğrulanır.
- UI riski: Ağ kesilince kullanıcı belgenin gerçekten kaydedilip kaydedilmediğini bilmiyor; retry duplicate kayıt üretebilir. İstek identity ve backend invariant'a göre çözüm tasarlanmalıdır.

**Kazanım:** UI, API ve browser state farklı kanıt yüzeyleridir; birini diğerinin garantisi olarak sunmuyoruz.

## Sonraki ders

Artık testin hangi sınırda ve hangi state ile çalıştığını biliyoruz. Ancak bazen **aynı test hiç değişmeden geçip sonra başarısız** olur. Bu dalgalanmanın kök nedenini araştıracağız.

→ [35. Flaky Tests & Failure Classification](../07-failure-debugging-and-ci/01-flaky-tests-and-failure-classification.md)

**Kaynaklar:** [Cypress Network Requests](https://docs.cypress.io/app/guides/network-requests) · [cy.request](https://docs.cypress.io/api/commands/request) · [cy.intercept](https://docs.cypress.io/api/commands/intercept).
