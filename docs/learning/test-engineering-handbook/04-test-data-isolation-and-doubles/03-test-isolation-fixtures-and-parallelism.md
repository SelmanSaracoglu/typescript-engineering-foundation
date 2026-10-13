# 19. Test Isolation — Setup, Cleanup ve Paralel Çalışma

> **Temel soru:** Bütün testler tek başına geçiyor fakat beraber çalışınca bozuluyorsa neyi yanlış tasarlamış olabiliriz?

MiniShop testlerini düşünelim:

- **Test A:** `coupon-10` kuponunu uygular ve kuponu USED durumuna getirir.
- **Test B:** Aynı `coupon-10` kuponunun AVAILABLE olduğunu varsayar ve fiyat kontrolü yapar.

B'yi tek başına çalıştırırsak geçebilir. A önce çalışırsa B, “Coupon already used” ile başarısız olabilir. Bu davranış kargo özelliğindeki bir ürün kusuru olmak zorunda değildir: **Testler aynı değiştirilebilir veriyi paylaşmaktadır.**

Bu derste “bir test diğerinden bağımsız nasıl olur?” sorusunu çözeceğiz.

## 19.1 Isolation (izolasyon) neyi ifade eder?

İyi izole edilmiş test, aynı suite'teki başka testlerin **çalıştırılmasına, sırasına veya bıraktığı veriye** ihtiyaç duymadan kendi önkoşullarını kurabilir.

Pratik hedefler:
- Test tek başına çalışabilmeli;
- Testlerin sırası değiştiğinde aynı kuralları kontrol edebilmeli;
- Paralel çalışmada kayıt ve kimlik çakışması olmamalı;
- Testten kalan veriler başka testin davranışını değiştirmemeli.

**Nüans:** Her integration veya E2E testinin fiziksel olarak ayrı bir veritabanı olması zorunlu değildir. **Mantıksal izolasyon** (test başına tenant, benzersiz sipariş, transaction, namespace) de uygun olabilir. Esas koşul testlerin birbirinin sonuçlarını bozmayacak biçimde tasarlanmasıdır.

## 19.2 Setup → Act → Assert → Cleanup

Bir testin okunabilir yapısını şöyle düşünelim:

1. **Setup / Arrange:** Gerekli müşteri, kupon, sipariş ve durumu oluştur.
2. **Act:** Gerçekleştirmek istediğin işlemi tetikle.
3. **Assert:** Beklenen sonucu **ve önemli yan etkileri** kontrol et.
4. **Cleanup / Teardown:** Gerekiyorsa testin oluşturduğu kaynakları temizle.

**Basitleştirilmiş pseudo-code:**

~~~typescript
test("available coupon can be used once", async () => {
  const customer = await createTestCustomer();
  const coupon = await createTestCoupon({ status: "AVAILABLE", ownerId: customer.id });

  try {
    const result = await applyCoupon(customer.id, coupon.id);
    expect(result.status).toBe("APPLIED");
    expect(await getCouponStatus(coupon.id)).toBe("USED");
  } finally {
    await cleanupOwnedTestResources({ couponId: coupon.id, customerId: customer.id });
    // Cleanup ilişkili child kayıtları önce kaldırır; çağrı idempotent tasarlanır.
  }
});
~~~

Bu kod gerçek proje API'lerinin tanımı değildir; **setup–assert–cleanup ilişkisini** göstermek için yazılmış bir kavramsal örnektir. Gerçek ortamda cleanup sırası foreign-key ilişkilerine, log saklama zorunluluğuna ve rollback mekanizmasına göre düzenlenir.

**Neden `finally`?** Assertion hata verdiğinde de cleanup çalışabilsin diye. Ancak cleanup başarısızlığını tamamen yutmak veya ana failure kanıtını yok etmek de hatadır.

## 19.3 Fixture scope neden önemli?

Test framework'lerinde setup işlemleri farklı kapsamlarla tanımlanabilir:

| Kapsam | Tipik örnek | Risk |
|---|---|---|
| **Per-test** | Her test için yeni sepet | Daha çok setup maliyeti, güçlü izolasyon |
| **Per-suite** | Bir suite için ortak read-only referans ürün kataloğu | Suite testleri kataloğu değiştirirse çakışma |
| **Per-worker / session** | Test worker'ına özel DB schema veya auth session | Worker'lar çakışırsa ve identity ayrılmazsa sızıntı |
| **Global** | Test ortamının genel servis kurulumu | Değiştirilebilir global state büyük risk |

**Temel öneri:** Bir testin **değiştirdiği** veriyi başka testlerle paylaşma. Gerçekten read-only ve kontrollü fixture'ları ortak kullanmak verimlilik sağlayabilir.

### beforeEach/afterEach her sorunu çözmez

Bir `beforeEach` tüm DB'yi sıfırlıyorsa paralel çalışan başka testin kaydını silebilir. Bir `afterEach` temizliği, test runner ani sonlandığında hiç çalışmayabilir.

Bu yüzden ideal tasarımda **test-owned data + benzersiz kimlik + idempotent cleanup** birlikte düşünülür.

- **Idempotent cleanup:** Aynı temizleme işlemi tekrar çağrıldığında zarar vermemesi.
- **Orphan cleanup:** Ani düşüş sonrası kalan test verileri için belirli namespace/TTL üzerinden düzenli temizlik.
- **Failure artifact retention:** Hata incelenirken gereken log/state kanıtını silmeden önce saklama.

## 19.4 Shared state tehlikesi nasıl görünür?

Test dizisi:

~~~text
Run 1: Test A → Test B   => A PASS, B FAIL
Run 2: Test B → Test A   => B PASS, A PASS
Run 3: Test B alone      => B PASS
~~~

Bu desen **test-order dependency** ihtimalini güçlendirir. Ancak başka olasılıklar da vardır: dış servis limiti, shared session, zaman veya concurrency.

**Debugging sırası:**
1. B'nin tüm önkoşullarını listele.
2. Test A'nın değiştirdiği paylaşılan state'i bul.
3. B için kendi kuponunu oluştur.
4. Tek başına, A→B ve B→A sıralarında yeniden çalıştır.
5. Paralel çalışmada kimlik/namespace çakışmasını da kontrol et.

Bazen sorun testlerin değil **ürünün global state tasarımının** hatası olabilir. Araştırmada bu ayrımı açık tut.

## 19.5 Paralel testler ve benzersiz kimlik

CI iki worker çalıştırıyor:

~~~text
Worker 1: create user "tester@example.invalid"
Worker 2: create user "tester@example.invalid"
~~~

E-posta benzersiz olmak zorundaysa biri veri kurulumunda başarısız olur. Daha kötüsü iki test aynı hesabı paylaşıp birbirinin siparişlerini silebilir.

Daha sağlam strateji:
- Her test run / worker / case için benzersiz tanımlayıcı;
- Aynı kullanıcıya ilişkin verilerde ayrı tenant veya namespace;
- Global “delete all orders” yerine yalnız **bu testin** kayıtlarını silme;
- Verinin oluşturulduğunu doğrulama;
- Sistem gerektiriyorsa işlemleri transaction içinde yalıtma.

**Sınır:** Teste ait ID'nin benzersiz olması tek başına bütün izolasyonu sağlamaz; session cache, process-level singleton, environment variable veya ortak dosya dizini de state taşıyabilir.

## 19.6 Test bağımsızlığı ile gerçek iş akışı arasındaki gerilim

Sipariş oluşturma → ödeme → kargoya verme sürecini test etmek istiyoruz. “Testler bağımsız olsun” diye bu üç adımı üç teste bölüp her birinin bir önceki testin ürettiği siparişi kullanması kötü bir tasarım olabilir:

- “Test Create” başarısız olursa iki test daha otomatik fail olur;
- Tek başına “Test Ship” çalışamaz;
- Hangi failure'ın gerçek olduğu anlaşılmaz.

**Daha iyi:** Her test kendi başlangıç durumunu kurar:
- Create testi için boş sepetten başla;
- Payment testi için **o teste ait CREATED sipariş** kur;
- Ship testi için **o teste ait PAID sipariş** kur.

Ayrıca bütün yolculuğu doğrulamak istiyorsan **tek bir E2E test içinde** üç eylemi sırasıyla çalıştırabilirsin. Bu, testler arasında bağımlılık oluşturmakla aynı şey değildir.

## 19.7 Teardown başarısız olursa?

Cleanup'ın başarısız olması bazen üründeki bir veri silme kusurunu gösterebilir; bazen ağ/izin problemidir. Test sonucunu sessizce “pass” bırakıp ortamı kirletmek de, asıl assertion failure'ını cleanup hatasıyla maskemek de yanlıştır.

**İyi raporlama:** Test davranışının sonucu ve cleanup sonucu ayrı kaydedilebilir; ilgili kayıtların kimlikleriyle kontrollü sonraki temizlik planlanır.

## 19.8 Alıştırma — yeni probleme aktar

Bir dosya paylaşım servisinin testleri her seferinde `document-123` kimlikli kaydı değiştiriyor. Bazen “already approved”, bazen “not found” hatası oluşuyor.

**Görev:** Testi bağımsız yapacak üç değişiklik ve bir doğrulama planı öner.

**Örnek çözüm:**
1. Her test kendisine ait benzersiz belge oluştursun.
2. Belgede beklenen **PENDING/APPROVED** state setup sırasında açıkça kurulsun.
3. Cleanup yalnız bu testin belgelerini silsin veya test namespace'i kullansın.
4. Testi tek başına, değişen sırada ve paralel birkaç worker'da çalıştırıp kayıt çakışmalarını izle.

**Kazanım:** Test sırası veya komşu testin bıraktığı veri **gizli bir test girdisi** haline gelmemeli.

## Sonraki ders

Bazen gerçek bir veritabanı veya e-posta sağlayıcısını kullanmak istemeyiz. Ama test ettiğimiz servis o bağımlılıklarla konuşuyor. Nasıl kontrollü alternatifler oluşturacağız?

→ [20. Test Doubles](04-test-doubles-dummy-stub-fake-spy-mock.md)
