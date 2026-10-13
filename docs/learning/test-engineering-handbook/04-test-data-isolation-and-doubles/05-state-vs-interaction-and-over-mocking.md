# 21. State vs Interaction Verification — Fazla mocking'in maliyeti

> **Temel soru:** Bir metot beklediğimiz sayıda çağrıldıysa, sistemin doğru çalıştığını kanıtlamış olur muyuz?

Test double'ları artık biliyoruz. Fakat **hangi şeyi assert edeceğimize** karar vermek, hangi double sınıfını kullandığımız kadar önemlidir.

## 21.1 İki farklı test düşüncesi

MiniShop'ta “sipariş başarılı olduğunda durum PAID olarak kaydedilir ve kullanıcı bilgilendirilir” kuralı olsun.

İki farklı doğrulama sorusu çıkar:

**State verification — Son durumda ne değişti?**
- Sipariş `PAID` oldu mu?
- Toplam doğru mu?
- İkinci bir charge kaydı var mı?

**Interaction verification — Hangi etkileşim gerçekleşti?**
- `mailer.send` çağrısı yapıldı mı?
- Çağrı doğru alıcı ve içerikle mi yapıldı?
- Gerekirse gönderim isteği **bir kez** mi yapıldı?

İkisi aynı şey değildir. Kullanıcı açısından doğru state'i doğrulayan test bazı iç metot isimlerine bağlanmayabilir. Öte yandan e-posta gibi dış yan etki test sırasında gerçekten gerçekleştirilemiyorsa interaction doğrulaması işe yarayabilir.

## 21.2 Bir örneği birlikte çöz

Kural: “Başarılı siparişten sonra yalnız bir bildirim isteği gönderilir.”

**SUT:** Gerçek order service.  
**Dependency:** Dış mailer yerine `RecordingMailer` spy.

~~~typescript
const mailer = new RecordingMailer();
await confirmOrder("a@example.invalid", mailer);

expect(mailer.messages).toEqual([
  { to: "a@example.invalid", subject: "Order confirmed" }
]);
~~~

Bu test mesajın gönderilmesini değil, **gönderim isteğinin oluşturulmasını** doğrular. Ulaşıp ulaşmadığı ayrı entegrasyon problemidir.

Şimdi order service içeride iki private yardımcı metot çağırıyor diye test yazdığımızı düşünelim:

~~~text
expect(service.validateCustomer).toHaveBeenCalledOnce()
expect(service.buildEmail).toHaveBeenCalledOnce()
expect(service.queueEmail).toHaveBeenCalledOnce()
~~~

Oysa son davranış aynı kalacak şekilde üç yardımcı metot tek metoda dönüştürülebilir. Ürün davranışı değişmediği halde test bozulur.

**Kritik ayrım:** İş açısından önemli dış etkileşimi test etmek, iç implementation adımlarını gereksiz yere kilitlemek değildir.

## 21.3 Over-mocking neye yol açar?

**Over-mocking**, SUT'un gerçek davranışının çok büyük bölümünü double'larla değiştirip doğrulamayı implementation ayrıntılarına bağlamak olabilir.

### Sahte güven örneği

Order Service şu sırayla çalışıyor olsun:

1. `repository.save(order)`;
2. `paymentProvider.charge(amount)`.

Testte repository `save` işlemi her zaman success, provider da her zaman success döndürüyor. Test **PASS**.

Gerçek sistemde ödeme başarısız olur, ama sipariş çoktan PAID olarak kaydedilmiş olabilir. Tamamen stub'lanmış happy-path test bu transaction tutarsızlığını görmez.

**Ne yapmalı?**
- Component testte ödeme başarısızlığı için **kontrollü stub** kullanarak failure branch'ini çalıştır;
- Repository state sonucunu doğrula;
- Gerçek transaction/rollback özelliğini ilgili **integration test** sınırında kontrol et;
- Harici sağlayıcı retry/contract'ını gerektiğinde ayrıca doğrula.

Bu yaklaşım double kullanmayı yasaklamaz; **test kanıtının sınırını dürüstçe çizer**.

## 21.4 İç implementasyon ayrıntısıyla iş sözleşmesini ayır

İki olası assertion karşılaştır:

**A — İç metot çağrısına kilitlenen:**

~~~text
expect(orderService.applyDiscountInternal).toHaveBeenCalledTimes(2)
~~~

**B — Gözlenebilir sonuca odaklanan:**

~~~text
Given valid 20 EUR coupon and 120 EUR basket
When the order is calculated
Then total after discount equals 100 EUR
And only one coupon usage is recorded
~~~

**B**, iş sözleşmesi buysa refactoring'e daha dayanıklıdır. **A** yalnız çağrı sayısı işin doğruluğunu etkiliyorsa veya gerçekten hedeflediğimiz interaction contract ise güçlüdür.

### Interaction assertion ne zaman çok değerlidir?

- Aynı ödeme isteğinin tekrar gönderilmemesi isteniyor;
- Bildirim yalnız **bir kez** kuyruğa eklenmeli;
- Güvenlik audit event'i belirli bir ret işleminde yazılmalı;
- Retry policy belirli limit ve sırayla uygulanmalı;
- Sağlayıcı API'sine tam beklenen request map'i gönderilmeli.

Bu örneklerde etkileşimin kendisi **sözleşmenin parçasıdır**. O zaman mock/spy çağrı sayıları ve argümanları anlamlıdır.

**Önemli:** “Tam olarak bir çağrı” yalnız iş kuralı öyle gerektiriyorsa assert edilmelidir. Örneğin retry yapan bir adapter'da birden fazla ağ çağrısı doğru davranış olabilir.

## 21.5 Contract drift: Double doğru, entegrasyon yanlış

Bir ödeme sağlayıcı sözleşmesi değişmiş:

Eskiden:
~~~json
{"amount": 10000, "currency": "EUR"}
~~~

Yeni sözleşme:
~~~json
{"amount_minor": 10000, "currency": "EUR"}
~~~

Component testte ödeme stub'ı hangi alan gelirse gelsin success döndürüyorsa test **yeşil** kalabilir. Gerçek sağlayıcı eski `amount` alanını artık tanımıyor olabilir.

**Çözüm:**
- SUT'un dışarı gönderdiği request mapping'i contract'a göre doğrula;
- Gerçek API'nin (yetkili sandbox'ta) desteklediği sözleşmeyi integration/contract test ile kontrol et;
- Double'ı gerçek sözleşmeye göre güncelle.

**Stubbing bir optimizasyon**, gerçek partner uyumluluğunun yerine geçmez.

## 21.6 Test double seçiminde karar ağacı

Şu soruları sırayla sor:

1. **Neyi gerçekten doğruluyorum?** Hesaplama/state mi, önemli bir dış çağrı mı?
2. Bağımlılık **yavaş, kontrolsüz, maliyetli veya tehlikeli** mi?
3. **SUT hangi bölüm olmalı?** İç hesaplamayı mı, service–DB etkileşimini mi test edeceğiz?
4. Double hangi gerçek davranışı **maskeler**?
5. Gizlenen gerçek davranış için ayrıca **hangi entegrasyon kanıtı** var?

Örnek:

| Hedef | Test sınırı | Uygun double / gerçek nesne |
|---|---|---|
| Kupon matematiği | Component | Gerçek hesaplama; DB gerekmiyorsa double yok |
| Üyelik durumuna göre karar | Component | Membership stub |
| Kuponun DB'de bir kez tüketilmesi | Integration | Gerçek test DB; kontrollü kullanıcı |
| Bildirimin kuyruklanma kararı | Component | Recording spy veya mock |
| Gerçek SMS teslimi | System integration | Yetkili test sağlayıcısı, mock değil |

**Kural:** “Daha çok mock = daha iyi isolation” değil. **Doğru sınır + doğru kanıt** önemlidir.

## 21.7 Bir failure'ın kaynağını doğru okuma

Test, `send()` bir kez çağrılsın diye bekliyor ama iki kez çağrıldı.

Olasılıklar:
- Ürün iki bildirim isteği yarattı;
- Retry mechanism beklenen davranış olarak iki deneme yaptı;
- Aynı spy önceki testten temizlenmedi;
- Test yanlış mock setup ile fazladan çağrı oluşturdu.

**Araştırma:**
1. Beklenen çağrı sayısının iş sözleşmesinden geldiğini doğrula.
2. Spy/mock geçmişini her testte sıfırla.
3. Aynı event tek kez mi tetiklendi, replay var mı bak.
4. Yan etkiyi uygun test seviyesinde doğrula.

Tek bir `toHaveBeenCalledTimes` başarısızlığı, ek bağlam olmadan **otomatik ürün kusuru** değildir.

## 21.8 Alıştırma — başka bir alan

Bir sistem, başarısız login sonrası güvenlik olayını audit servisine gönderiyor.

**Görev:** Hangi kontrol için state verification, hangisi için interaction verification daha anlamlı? Hangi gerçek entegrasyon riski kalıyor?

**Örnek çözüm:**
- State: Başarısız giriş sonrası kullanıcı oturumu **oluşmamış** olmalı; başarısız deneme sayacı sözleşmeye uygun güncellenmeli.
- Interaction: `audit.record` çağrısına doğru actor/event/outcome alanları verilmiş olmalı.
- Kalan entegrasyon riski: Gerçek audit servisi isteği alıyor ve kalıcı depoluyor mu; kuyruk ve network failure durumlarında kayıp oluyor mu?

**Kazanım:** Interaction ile state kontrollerini, implementation ayrıntısı ve business requirement ayrımı yaparak seçebiliyoruz.

## Sonraki ders

“Doğru metot çağrıldı” veya “doğru state oluştu” dedik. Ama bir assertion'ın **gerçek bir kusuru yakaladığını** ve failure kanıtının yeterli olduğunu nasıl anlarız?

→ [22. Assertions, Observability & Evidence](06-assertions-observability-and-evidence.md)
