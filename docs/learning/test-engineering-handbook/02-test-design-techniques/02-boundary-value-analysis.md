# 5. Boundary Value Analysis — Sınırdaki hataları aramak

> **Bu bölümün sorusu:** 18–65 yaş aralığını bir geçerli değerle test ettik. Peki 18'in **dahil** olduğundan nasıl emin olacağız?

## 5.1 EP'den BVA'ya neden geçiyoruz?

Önceki bölümde 18–65 dahil tam sayı kuralı için üç sınıf tanımladık:

- 18'den küçük → REJECT;
- 18–65 → ACCEPT;
- 65'ten büyük → REJECT.

EP temsilcilerimiz 12, 34, 71 idi. Üç test de geçebilir; ama geliştirici yanlışlıkla **age > 18** yazmışsa **18** reddedilir. 34'ü test etmek bu hatayı yakalamaz.

Kusurlar, özellikle **sınırların dahil/haric olmasında**, karşılaştırma operatörlerinde, indeks ve tarih hesaplarında görülür. **Boundary Value Analysis (BVA)** sıralı değer grupları arasındaki **geçiş noktalarını** hedefler.

## 5.2 Sınır nasıl bulunur?

Kuralı dikkatle okuyalım:

> Minimum 18, maksimum 65 ve **iki uç da dahil**.

Bu durumda iki geçiş vardır:

~~~text
... 16  17 | 18  19 ... 64  65 | 66  67 ...
  REDDEDİLİR |   KABUL EDİLİR   | REDDEDİLİR
~~~

Alt geçişte 17 ve 18; üst geçişte 65 ve 66 dikkat çekiyor.

**2-value BVA** için asgari anlamlı set:

**17, 18, 65, 66**

Buradaki “iki değer”, her sınırın kendisi ve komşu sınıftaki en yakın değerdir; toplamda mutlaka iki test demek değildir.

**3-value BVA** için her sınıra komşu iki değeri de ekleriz:

**17, 18, 19, 64, 65, 66**

Bu üçüncü değer bazı “yalnız ilk geçerli değer düzgün işleniyor” türü kusurları da ortaya çıkarabilir.

### Neden test sayısı farklı?

| Teknik | Alt geçiş | Üst geçiş | Toplam benzersiz değer |
|---|---|---|---:|
| 2-value | 17, 18 | 65, 66 | 4 |
| 3-value | 17, 18, 19 | 64, 65, 66 | 6 |

Geniş aralıklarda setler böyle ayrılır. Çok dar aralıklarda komşuluk pencereleri örtüşürse tekrar eden sayıları tekilleştiririz.

## 5.3 Bir kusuru adım adım bulalım

Onaylı kural:

~~~text
18 <= age <= 65
~~~

Hatalı implementasyon:

~~~typescript
function isEligible(age: number): boolean {
  return age > 18 && age <= 65;
}
~~~

Burada alt sınır yanlışlıkla dışlanmış.

| Age | Beklenen | Kodun ürettiği | Sonuç |
|---:|---|---|---|
| 17 | false | false | PASS |
| **18** | **true** | **false** | **FAIL** |
| 19 | true | true | PASS |
| 65 | true | true | PASS |
| 66 | false | false | PASS |

**18** testi kusuru görünür kıldı. Ama sadece “FAIL” deyip bırakmayız; beklenen değerin kaynağının iş kuralı olduğunu doğrular, sonra kodu ve giriş dönüşümünü araştırırız.

### BVA ile EP neyi farklı yapıyor?

**EP:** Hangi farklı davranış grupları var?  
**BVA:** Bu grupların **tam geçişinde** sonuç doğru mu?

BVA, EP'nin yerine geçmez; **EP'den türetilen sıralı sınıfların riskli kenarlarını** inceler.

## 5.4 “Her sınır için ±1” her zaman doğru mu?

Hayır. “Bir eksik, bir fazla” yalnız **ayrık ve adımı tanımlı** sayısal domain'de doğrudur.

### Örnek A — Karakter uzunluğu

Parola uzunluğu **8–20 karakter dahil**. Uzunluk bir tam sayı olduğu için 7,8,9 ve 19,20,21 doğaldır. Ancak karakter sayısı Unicode code point mi, grapheme cluster mı? Sistem farklı sayım yapıyorsa bu karar da önemlidir.

### Örnek B — Para

“100 € ve üzeri ücretsiz kargo” kuralı var. Para **iki ondalık basamak** olarak modelleniyorsa:

- 99,99 € → ücretli;
- 100,00 € → ücretsiz;
- 100,01 € → ücretsiz.

Eğer yazılım ondalık hassasiyeti kısıtlamıyorsa 99.999 gibi değerlerin nasıl ele alınacağı ayrıca tanımlanmalıdır. **Üretim parasında floating-point hassasiyeti** ile iş kuralını karıştırmak kolaydır.

### Örnek C — 14 gün

“Teslimden sonraki 14 takvim günü” için komşu değer yalnız “13,14,15” değildir. **Saat dilimi**, gün başlangıcı ve leap day gibi özellikler sınırın ne olduğunu değiştirebilir. Önce ürünün takvim politikası netleştirilir, sonra doğru komşular tasarlanır.

**Genel ilke:** Sınır değerinin **domain içindeki gerçekten en yakın geçerli/komşu değeri** neyse onu seç.

## 5.5 Kapsamı nasıl ölçeriz?

Coverage ölçütünü açık yazmalıyız:

- 2-value modelde yukarıda 4 boundary/komşu öğesi var.
- 3-value modelde 6 öğe var.

Örneğin 3-value setinden **17,18,19,64** test edildi, 65 ve 66 edilmedi.

Coverage = **4 / 6 = %66,7**.

Bu, **3-value BVA coverage** değeridir. Sistemdeki kusurların %66,7'sini yakaladığımız anlamına gelmez.

## 5.6 BVA'nın işe yaramadığı durumlar

Bir kullanıcının ülkesi DE/FR/NL ise bunlar arasında iş kuralınca tanımlı bir komşu sınır yoktur. Bu alan için önce **EP** veya kombinasyona dayalı teknik gerekir.

Ayrıca BVA tek başına şunları cevaplamaz:

- Üyelik aktif değilse 100 € eşiği uygulanır mı?
- Sipariş iptal edilmişse iade istenir mi?
- Bir kupon iki kez kullanılırsa ne olur?
- Başka kullanıcının kaydına erişim engelleniyor mu?

İlk soru **karar kombinasyonu**, ikinci ve üçüncü **durum geçmişi**, dördüncü **yetkilendirme** riskidir.

## 5.7 Alıştırma — bağımsız transfer

**Yeni kural:** Bir API, `quantity` alanında **3–8 dahil tam sayıları** kabul eder.

**Görev A:** 2-value ve 3-value BVA setlerini oluştur.  
**Görev B:** Kod `quantity >= 3 && quantity < 8` kullanıyorsa hangi test defect'i açıkça gösterir?

**Örnek çözüm:**
- **2-value:** 2,3,8,9.
- **3-value:** 2,3,4,7,8,9.
- **Defect:** 8 için beklenen ACCEPT, gerçek REJECT olur. **8** sınır testi problemi yakalar.

Yanlış `< 8` operatörünü düzeltmek coding/debugging işidir; BVA'nın katkısı **hatayı yakalamaya uygun input'u seçmesidir**.

## Sonraki bölüm

Şimdi tek bir sayısal kuralı iyi sınayabiliyoruz. Fakat gerçek iş kararları çoğunlukla **birden çok koşulun birleşimine** bağlıdır.

→ [6. Decision Table Testing](03-decision-table-testing.md)
