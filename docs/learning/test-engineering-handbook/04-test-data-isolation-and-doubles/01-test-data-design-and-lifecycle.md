# 17. Test verisi — Doğru senaryo doğru başlangıç durumuyla başlar

> **Temel soru:** İki test aynı fonksiyonu çağırdığı halde neden farklı sonuç verebilir?

I1'de **hangi input değerlerinin** anlamlı olduğunu öğrendik. I2'de bu kontrolleri **hangi test seviyesinde** yapacağımızı seçtik. Şimdi üçüncü sorudayız: Testin başlayabilmesi için sistemin **hangi veri ve durumda** olması gerekiyor?

## 17.1 Bir test neden yanlış güven üretebilir?

MiniShop'ta şöyle bir kabul kuralı var:

> “ACTIVE müşteri, kupon sonrası tutarı 100 € veya üzerindeyken standart kargo için ücret ödemez.”

Tester şu girdiyi kullanıyor:

- customer: ACTIVE;
- basket: 120 €;
- coupon: 20 € indirim;
- delivery: STANDARD.

Beklenen kargo: **0 €**.

Fakat test ortamındaki kupon **önceden kullanılmış** ve artık geçersiz. İşlem, kargo hesabına ulaşmadan reddediliyor. Tester “kargo testi başarısız” diyebilir; oysa temel sorun **testin başlangıç verisi**.

Bir testte sadece action ve assertion değil, **önkoşulların doğru kurulması** da gerekir.

## 17.2 Test input, test data ve system state

Bu üç kavram ilişkili ama aynı değildir.

| Kavram | Örnek | Neden önemli? |
|---|---|---|
| **Test input** | Sepet tutarı 120 € | Davranışı tetikleyen değer |
| **Test data** | ACTIVE müşteri, kupon, ürün, sipariş kayıtları | Testin kullanacağı veri bütünü |
| **Initial state** | Kupon AVAILABLE, müşteri oturumu açık, sipariş henüz yok | Aynı input'un sonucunu değiştiren sistem durumu |

**Kural:** Test verisi expected result'ın gerektirdiği başlangıç durumunu sağlamalı. “Kupon AVAILABLE” şartını belirsiz bırakıp yalnız indirim tutarını assert etmek, testin neyi doğruladığını bulanıklaştırır.

### Veri sınıfları test tasarımından gelir

EP ve BVA'da seçtiğimiz 99,99 / 100,00 / 100,01 değerleri hâlâ geçerlidir. Ancak bunları çalıştırabilmek için uygun müşteri ve kupon verisi oluşturmalıyız.

| Test amacı | Gerekli başlangıç | Beklenen |
|---|---|---|
| Eşik altı | ACTIVE müşteri, 99,99 €, kupon yok | PAID shipping |
| Eşik dahil | ACTIVE müşteri, 100,00 €, kupon yok | FREE shipping |
| Kupon sonrası eşik | ACTIVE müşteri, 120 €, geçerli 20 € kupon | FREE shipping |
| İnaktif müşteri | INACTIVE müşteri, 120 €, kupon yok | PAID shipping |

**Dikkat:** Üçüncü testte “20 € kupon” kuralı bu çalışma örneği için sabittir. Gerçek ürün için hesaplanan tutarın vergi ve kupon sırasıyla nasıl oluştuğu onaylanmalıdır.

## 17.3 Test veri yaşam döngüsü

Test verisini **dosyaya birkaç JSON satırı yazmak** gibi düşünme. Gerçekçi bir yaşam döngüsü vardır:

1. **Planla:** Hangi senaryoya hangi veri gerekiyor?
2. **Oluştur veya seç:** Ürün, müşteri, sipariş ve ilişki kayıtlarını hazırla.
3. **Başlangıç koşulunu doğrula:** Müşteri gerçekten ACTIVE mi, kupon AVAILABLE mı?
4. **Kullan:** Test davranışını gerçekleştir.
5. **Gözle:** Yanıtın yanında state ve yan etkileri de incele.
6. **Temizle/ayır:** Testten kalan verinin sonraki testleri etkilemesini önle.
7. **Gerekliyse sakla:** Failure'ı tekrar üretmek için gizli bilgi içermeyen tanımlayıcı/kanıt bırak.

Bu yaşam döngüsü bir test seviyesine özgü değildir. Component test küçük nesneyi bellekte oluşturabilir; integration test DB kaydı hazırlamak zorunda kalabilir.

### İşaretle: data ownership

Bir test için yaratılan veri kime ait?

- **Test-owned data:** O test veya test koşusu tarafından yaratılır; temizleme ve çakışma davranışı belirlenebilir.
- **Shared seed data:** Başka testler de aynı kayda güvenir; değişiklik yapıldığında testler birbirini bozabilir.
- **External reference data:** Kur veya ülke listesi gibi dış kaynak. Sürüm ve güncellik önem kazanır.

**En güçlü varsayılan:** Değiştirilebilir test verisini test kendisi oluştursun veya kendisine ayrılmış bir namespace içinde kullansın. Ortak veri gerekliyse kim tarafından ve nasıl güncellendiği açık olmalı.

## 17.4 Fixture ile test data arasındaki fark

**Test fixture**, bir testin koşulunu kurmak için gereken *veri, nesneler, ortam düzeni ve gerektiğinde cleanup düzeni* bütünüdür. Veri bu düzenin bir parçasıdır.

Örneğin:

~~~typescript
type Customer = {
  id: string;
  status: "ACTIVE" | "INACTIVE";
};

function customerFixture(overrides: Partial<Customer> = {}): Customer {
  return {
    id: "customer-example",
    status: "ACTIVE",
    ...overrides,
  };
}

const activeCustomer = customerFixture();
const inactiveCustomer = customerFixture({ status: "INACTIVE" });
~~~

Bu kod yalnız bir **bellek içi veri üretme örneğidir**; repo'da çalıştırılmış bir test değildir.

Burada factory yöntemi, her testte uzun ve alakasız müşteri kayıtlarını kopyalamayı azaltır. Ancak varsayılan ID'nin birden fazla integration testinde ortak kullanılması **çakışma** yaratabilir. Bellek içi örnekte sorun olmayabilir; DB'ye yazan factory'de benzersiz ID ve ownership gerekir.

### Test verisi üretiminde aşırılık

Her alan için rastgele değer üretmek otomatik daha iyi coverage demek değildir. Hatanın tekrarı zorlaşabilir: Hangi kupon/ülke/tarih problemi doğurdu?

Önemli davranışı açığa çıkaran **küçük, anlaşılır ve gerekçeli** veri kümeleri çoğu zaman daha öğreticidir.

## 17.5 Gerçekçilik ve güvenlik

Testlerin gerçek davranışı temsil etmesi için bazen gerçekçi adres, para, rol veya tarih ilişkisi gerekir. Bu **gerçek müşterinin kişisel verisini** aynen kopyalamayı meşru kılmaz.

Güvenli tasarım:
- **Sentetik veri** kullan;
- Gerekirse onaylı biçimde anonimleştirilmiş veri kullan, tekrar tanınabilirlik riskini değerlendir;
- Şifre, token, ödeme kartı ve özel sipariş içeriğini test raporuna taşımaktan kaçın;
- Entegrasyon gereği dış sistemle konuşulacaksa yalnız yetkili sandbox ve test hesapları kullan;
- Hassas verinin ömrünü ve kimlerin erişeceğini belirle.

**Test verisi, prod verisinden daha az değerli diye güvenlik dışına çıkmaz.** Yanlış hazırlanmış veri sahte güven kadar gizlilik ihlali de yaratabilir.

## 17.6 Çalışılmış senaryo: Kupon testindeki failure

**Testin amacı:** AVAILABLE kuponla 100 € eşiğini doğrulamak.  
**Actual:** “Coupon already used.”  
**İlk hipotez:** Test verisindeki kupon USED durumda.  
**İnceleme:** Başlangıç state'ini sorgula.  
**Karar:** Kuponu ayrı test verisi olarak oluştur; AVAILABLE olduğunu gözle; sonra kargo testini tekrar çalıştır.

Test bu kez geçtiğinde şu iki iddiayı ayrı tut:
- **Data/setup sorunu giderildi.**
- **İş kuralı, kurulan koşul altında doğrulandı.**

İlk failure'ı otomatik product defect olarak raporlamadık.

## 17.7 Alıştırma — yeni alana aktar

**Özellik:** Kullanıcı yalnız kendi **APPROVED** belgelerini indirebilir.

**Görev:** Başarılı indirme ve iki negatif test için *minimum başlangıç verisini* tasarla.

**Örnek değerlendirme:**

| Senaryo | Başlangıç verisi | Beklenen |
|---|---|---|
| Kendi onaylı belgesi | A oturumu, A sahibi, APPROVED | ALLOW |
| Başka kullanıcının belgesi | A oturumu, B sahibi, APPROVED | DENY; veri sızmaz |
| Henüz onaylanmamış | A oturumu, A sahibi, PENDING | DENY; state değişmez |

Yalnız `documentId` değiştirmek yeterli olmayabilir; sahiplik ve durum kayıtlarının gerçekten doğru kurulduğunu da gözlemlemek gerekir.

## Sonraki ders

Veriyi doğru kurmayı öğrendik. Fakat **aynı veriyle, aynı kodu tekrar çalıştırdığımız halde** sonuç bazen değişiyorsa ne yapacağız?

→ [18. Deterministic & Repeatable Tests](02-deterministic-repeatable-tests.md)
