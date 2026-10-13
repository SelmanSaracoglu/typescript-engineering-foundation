# 3. Gereksinimden kanıta: Test case nasıl doğar?

> **Bu bölümün sorusu:** Sistemin verdiği sonucun doğru olup olmadığını nereden biliriz?

## 3.1 Testin başlangıç noktası: test basis

Yeni bir kural düşün:

> **R-01:** Teslim edilmiş bir sipariş için müşteri, teslimat gününden itibaren 14 takvim günü içinde (**14. gün dahil**) iade talebi oluşturabilir. Teslim edilmemiş siparişler için talep reddedilir.

Buradaki R-01 bir **test basis** örneğidir: testin dayandığı yetkili kaynak. Test basis her zaman resmî PDF şartnamesi olmak zorunda değildir; onaylı user story, iş kuralı, API contract, tasarım kararı veya ilgili yasal yükümlülük olabilir.

**Hata:** Uygulamayı açıp “Bugün 15. gün ama kabul etti; demek ki kural böyleymiş” diye expected result üretmek. Bu, implementasyonun yanlışını testin standardına dönüştürür.

Bir tester “Doğru davranışın kaynağı neresi?” diye sorar.

## 3.2 Test condition, test case ve test data

Bunları aynı şeymiş gibi kullanmak test tasarımını zayıflatır:

- **Test condition:** Neyi kontrol edeceğiz? — “14. günde iade kabul edilir.”
- **Test case:** Hangi başlangıç şartı, adım, veri ve beklenen sonuçla kontrol edeceğiz?
- **Test data:** İade denemesi için gerekli sipariş, tarih, kullanıcı ve ürün bilgileri.
- **Test procedure:** Testlerin ve hazırlık/temizleme adımlarının hangi sırayla yapılacağı.
- **Test result:** Çalıştırmada ne gözledik?

Bir test case'i birlikte yazalım.

### TC-01 — 14. günde iade

**Test basis:** R-01  
**Test condition:** Son geçerli günde iade  
**Preconditions:** Kullanıcı sipariş sahibi; sipariş DELIVERED; geçerli iade zaten yok  
**Test data:** Teslim zamanı örnek olarak 2026-10-01 10:00; değerlendirme zamanı ve takvim günü kurala uygun **14. gün** olarak ayarlanmış  
**Action:** Kullanıcı iade talebi gönderir  
**Expected result:** Başvuru kabul edilir; bir adet iade kaydı oluşturulur  
**Observation:** HTTP yanıtı, arayüz mesajı ve iade kaydı durumu kontrol edilir  
**Cleanup:** Test kaydı temizlenir veya izole veri alanında bırakılır

**Saat/tarih uyarısı:** R-01 “teslimat gününden itibaren” derken iş gününü, UTC'yi veya yerel takvim gününü tam açıklamıyorsa örnekteki tarih saat **henüz güvenilir oracle değildir**. Ürün kararı gelmeden “14×24 saat” varsayımı yapmamalıyız.

### TC-02 — 15. gün

Aynı başlangıç koşulları, sadece talep zamanı 15. güne taşınır. Beklenen: **REJECT** ve **hiçbir yeni iade kaydı oluşmaması**.

### TC-03 — Teslim edilmemiş sipariş

Sipariş durumu CREATED iken, teslim günü hesabı ne olursa olsun talep reddedilir. Bu test “gün” kontrolünden **farklı bir iş kuralını** hedefler.

İyi test case'in bütün alanlarını ezberden doldurmak gerekmez. Ama bağımsız tekrar üretim için **başlangıç, işlem, doğru sonuç ve gözlem** anlaşılır olmalı.

## 3.3 Test oracle nedir?

**Test oracle**, beklenen sonucu belirlemeye yarayan güvenilir bilgi kaynağıdır.

Örnek oracle'lar:

- Product owner tarafından onaylanmış iş kuralı;
- Gereksinime uygun API şeması/sözleşmesi;
- Hesaplama formülü ve örneklerle doğrulanmış spesifikasyon;
- Alan uzmanının yazılı olarak netleştirdiği karar;
- Tutarlı ve geçerli referans sistem (bu kaynağın da güvenilirliği doğrulanmalı).

**Yanlış oracle:** “Developer böyle yazmış”, “şu anda sistem bunu yapıyor”, “geçen hafta ekran bu rengi gösteriyordu” — bunlar gözlem olabilir ama tek başına **doğru davranışın normu** değildir.

Oracle belirsizse testin sonucu bazen **blocked / unresolved** olabilir. Yanlış tanımlanmış expected result ile sahte Pass üretmekten iyidir.

## 3.4 Belirsizlik ile karşılaşınca ne yaparız?

Gereksinim: “Kullanıcılar siparişlerini kısa sürede kolayca iade eder.”

Birden fazla sorun var:

| Sorun | Tester'ın somut sorusu |
|---|---|
| **Ambiguity** — “kısa sürede” | En fazla kaç saniyelik işlem süresi? Hangi adım? |
| **Missing requirement** | Hangi sipariş statüleri iade edilebilir? |
| **Assumption** | “14 gün = 336 saat” varsayımını kim onayladı? |
| **Contradiction** | Web dokümanında 14 gün, uygulama kuralında 30 gün görünüyor; hangisi yetkili? |

Yanıt beklerken test yazılamaz mı? Bazı bağımsız parçalar çalışılabilir; ancak **karar verilmemiş davranış için kesin başarı iddiası** kurulmamalıdır. Assumption belgelenebilir, uygun kişi doğrulamadan “yeni requirement” sayılamaz.

## 3.5 Testing faaliyetleri birbirine nasıl bağlanır?

Testing yalnız execution değildir. Pratikte faaliyetler birbirini besler:

1. **Planning:** Hedef, kapsam, risk ve kaynaklar.
2. **Monitoring and control:** Planlananla gerçekleşeni karşılaştırıp yön verme.
3. **Test analysis:** Test basis'ten **neyi test edeceğimizi** çıkarma.
4. **Test design:** **Nasıl test edeceğimizi** belirleme; durum/veri/expected results.
5. **Test implementation:** Veri, script, prosedür ve ortamı çalıştırılabilir hale getirme.
6. **Test execution:** Testi çalıştırıp expected ile actual'ı karşılaştırma.
7. **Test completion:** Sonuçları, kalan riski, öğrenilenleri ve materyalleri devretme.

Bunlar yaşam döngüsünde tamamen ayrı, yalnız bir kez gerçekleşen basamaklar değildir. Bir bug bulduğumuzda analysis/design'e geri dönebiliriz.

**Örnek:** R-01 için “son gün” koşulunu **analysis** aşamasında görürüz; day 14/day 15 örneklerini **design** aşamasında seçeriz; gerekli tarih/veri kurulumunu **implementation** aşamasında hazırlarız; sonucu **execution** aşamasında gözleriz.

## 3.6 Traceability ve coverage: Aynı mı?

**Traceability**, gereksinim ile ona bağlı test ve bulguların izlenebilir bağlantısıdır.

| Gereksinim | Risk | Test koşulu | Test case | Gözlem |
|---|---|---|---|---|
| R-01 | Geçerli iadenin haksız reddi | Son gün kabul | TC-01 | ACCEPT |
| R-01 | Geç iade kabulü | İlk geçersiz gün ret | TC-02 | REJECT |
| R-01 | Geçersiz state'ten iade | Teslim edilmemiş | TC-03 | REJECT |

Traceability değişiklikte önem kazanır: “14 gün → 30 gün” kararı verilirse hangi testlerin etkilenebileceğini hızlı görürüz.

**Coverage** ise belirli bir ölçüte göre *kaç öğenin* çalıştırıldığını gösterir. Örneğin tanımladığımız üç condition'ın ikisi test edilmişse **2/3** condition coverage. Fakat testin oracle'ı yanlışsa %100 coverage da yanlış güven yaratabilir.

**Requirement coverage** ile **boundary / branch / state coverage** farklı paydalara sahiptir; oranları birbirine karıştırma.

## 3.7 Test evidence nasıl değerlendirilir?

“Pass” kelimesi tek başına zayıf kanıttır.

Daha yararlı bilgi:
- Build/sürüm ve ortam;
- Test condition ve başlangıç verisinin kimliği;
- Gerçek işlem;
- Beklenen ve gözlenen sonuç;
- Zaman bilgisi;
- Gerekliyse response, log, transaction/state görüntüsü;
- Sonucun tekrar üretilmesini sağlayacak yeterli ayrıntı.

Kişisel müşteri verilerini, şifreleri veya oturum token'larını rapora gereksiz kopyalamamak gerekir.

### Örnek failure kaydı

**TC-02 failed:** 15. gün iade başvurusu kabul edildi.  
**Expected:** REJECT, yeni iade kaydı yok (R-01).  
**Actual:** ACCEPT, yeni iade kaydı oluştu.  
**Koşullar:** Sipariş DELIVERED, izolasyon sağlanmış test hesabı, tanımlı takvim zamanı.  
**Şüphe:** Son gün operatörü veya gün hesabı.  
**Sonraki adım:** Oracle'daki gün yorumunu doğrula ve aynı veride tekrar üret.

Burada kodu okumadan **kök neden budur** demiyoruz; failure ile hipotezi ayırıyoruz.

## 3.8 Alıştırma — bir kuraldan test çıkar

**R-02:** Ücretsiz standart kargo yalnız aktif üyeler için ve sepet tutarı **100 € veya daha yüksekse** uygulanır.

**Görev:** R-02'den iki test condition çıkar; her biri için bir test data ve expected result yaz.

**Örnek çözüm:**
1. Aktif üye, toplam **100 €** → **FREE** (eşik dahil).
2. Aktif üye, toplam **99 €** → **PAID** (eşik altı).

**Eksik kalan nokta:** Pasif üyenin 120 € sepeti. Sonraki test tasarımı bölümlerinde koşul kombinasyonlarını sistematik biçimde göreceğiz.

## Sonraki bölüm

Neyi test edeceğimizi ve beklenen sonucu biliyoruz. Şimdi çok geniş bir veri alanından **hangi birkaç örneğin anlamlı olduğunu** öğreneceğiz:

→ [4. Equivalence Partitioning](../02-test-design-techniques/01-equivalence-partitioning.md)
