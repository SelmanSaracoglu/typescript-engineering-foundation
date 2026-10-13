# 4. Equivalence Partitioning — Anlamlı veri grupları seçmek

> **Bu bölümün sorusu:** Sonsuz sayıda olası girdiden neden bazılarını seçip diğerlerini test etmeyebiliriz?

## 4.1 Sorunu anlamak

Bir üyelik servisi yalnız **18–65 yaş arasındaki tam sayıları (uçlar dahil)** kabul ediyor olsun.

Bütün tam sayıları denemek imkânsızdır. Peki 22, 27, 41, 53 ve 64'ü test etmek beş farklı bilgi sağlar mı?

İş kuralı yalnız “18 ile 65 arasında mı?” diye bakıyorsa bu beş sayıdan **aynı sonuç** beklenir: kabul. Elbette içlerinden birinde beklenmedik bug olabilir; ama temel test tasarımı açısından beşi aynı davranış grubunu temsil ediyor.

**Equivalence Partitioning (EP)** bu fikri kullanır: Sistemden aynı tepkiyi beklediğimiz değerleri **eşdeğer sınıflara** (partitions) ayırır, her sınıftan en az bir anlamlı temsilci seçeriz.

## 4.2 Sınıfları birlikte oluşturalım

Gereksinim: “Age alanı, 18–65 dahil tam sayı kabul eder; diğer tam sayıları reddeder.”

Önce sayısal domain'i üç davranış sınıfına ayırıyoruz:

| Sınıf | Kural | Temsilci | Beklenen |
|---|---|---:|---|
| P1 — alt geçersiz | age < 18 | 12 | REJECT |
| P2 — geçerli | 18 ≤ age ≤ 65 | 34 | ACCEPT |
| P3 — üst geçersiz | age > 65 | 71 | REJECT |

**Temel setimiz:** 12, 34, 71.

Bu seçim rastgele değil. Üç **ayrı expected behavior** grubunun her biri temsil edildi. Bir test başarısız olursa hangi sınıftaki davranışın sorunlu olduğunu görürüz.

### Neden iki sınıf değil?

“Valid” ve “invalid” diye ikiye bölmek ilk bakışta cazip. Ancak **17** ile **66** aynı şekilde reddedilse bile farklı kural kenarlarında bulunur. Alt ve üst geçersiz sınıfları ayrı tutmak test tasarımını daha açıklayıcı kılar ve sonraki boundary çalışmasını mümkün kılar.

### Domain değişirse partition da değişir

Yeni kural: “18–25 yaşındakilere STARTER, 26–65 yaşındakilere STANDARD üyelik verilir.”

Artık 18–65 aralığı **tek valid sınıf değil**. Çünkü 19 ve 40 için expected behavior farklıdır.

| Sınıf | Beklenen |
|---|---|
| 18'den küçük | REJECT |
| 18–25 | STARTER |
| 26–65 | STANDARD |
| 65'ten büyük | REJECT |

**Temel ilke:** Partition'lar bizim kolayımıza göre değil, **kuralın davranış farklarına göre** oluşur.

## 4.3 Tam sayılar dışında ne var?

Bir alan teknik olarak string alıyorsa aşağıdaki girdiler de düşünülmelidir:

- boş değer;
- null veya eksik alan;
- “on dokuz” gibi metin;
- 19.5 gibi ondalık sayı;
- `"19"` gibi sayıyı temsil eden string;
- çok büyük sayısal değer.

Hepsi tek bir “invalid” grubuna mı girer? **Önce sözleşmeye bakılır.** Örneğin boş alana “required” hatası, 19.5'e “integer only” hatası üretiliyorsa bunların ayrı test condition/partition olarak ele alınması anlamlıdır.

Burada iki farklı soruyu ayırıyoruz:

1. **Business-rule validation:** Yaş izin verilen aralıkta mı?
2. **Input-format validation:** Gelen veri geçerli tip ve formatta mı?

İkisini karıştırmak “yaş sınırı” testini istemeden parser testine dönüştürebilir.

## 4.4 Kapsam (coverage) hesabı

Bir EP modelindeki **coverage item**, tanımlı partition'dır.

Örneğin ilk üç sınıftan sadece P1 ve P2'yi çalıştırırsak:

**EP coverage = 2 işletilen partition / 3 tanımlı partition = %66,7.**

Üç sınıfın tamamından birer örnekle **%100 EP coverage** sağlanır.

**Bu neyi garanti etmez?** Her geçerli yaşın doğru işlendiğini, uç değerlerde hata olmadığını veya iki farklı input'un kombinasyonlarının doğru sonuç vereceğini garanti etmez. Yalnız tasarladığımız partition modelinin kapsandığını gösterir.

## 4.5 Birden fazla parametre varsa

Kampanya kuralında iki input olsun:

- customerType: STANDARD / PREMIUM;
- couponStatus: VALID / EXPIRED.

Burada bir parametrenin her değerini en az bir defa denemek, **tüm kombinasyonları** denemek değildir.

Örneğin şu iki test her iki parametrenin değerlerini kapsar:

| Test | customerType | couponStatus |
|---|---|---|
| T1 | STANDARD | VALID |
| T2 | PREMIUM | EXPIRED |

Ancak **STANDARD + EXPIRED** ve **PREMIUM + VALID** hiç denenmedi. Sistemin tepkisi kombinasyona bağlıysa daha sonra **decision table** kullanacağız.

Bu, **Each Choice** yaklaşımının faydalı ama sınırlı olduğunu gösterir.

## 4.6 Sık görülen yanlışlar

**Yanlış 1 — “Geçerli bütün sayılar ayrı testtir.”**  
Benzer input sayısını artırmak her zaman yeni davranış kapsamak değildir.

**Yanlış 2 — “Yalnız valid veriler yeterli.”**  
Alt ve üst reddetme davranışları da gereksinimin parçasıdır.

**Yanlış 3 — “EP, sınır hatalarını kesin yakalar.”**  
P2'yi 34 ile temsil ettik; 18'de yanlış `>` hatası varsa bu test onu görmeyebilir.

**Yanlış 4 — “Partition'lar geliştiricinin koduna göre belirlenir.”**  
Sınıflar onaylanmış kuraldan türetilir; implementasyondan değil.

## 4.7 Çalışılmış ikinci örnek: kupon tipi

Kural: “BASIC kupon %5, PREMIUM kupon %10, bilinmeyen tip hata üretir.”

İki geçerli tip olsa da aynı partition değildir:

| Input | Expected | Sınıf |
|---|---|---|
| BASIC | %5 | Valid-P1 |
| PREMIUM | %10 | Valid-P2 |
| UNKNOWN | REJECT | Invalid-P3 |

“Geçerli” olmak tek başına eşdeğer olmak demek değildir. **Aynı davranışı beklemek** şarttır.

## 4.8 Alıştırma

**Yeni kural:** Sipariş ağırlığı **0 kg'dan büyük** ve **20 kg'a kadar (20 dahil)** ise normal kargo kabul edilir; 0 ve altı geçersiz, 20 üzeri özel kargo gerektirir.

**Görev:** Partition tablosunu ve her sınıf için bir temsilci oluştur.

**Örnek çözüm:**

| Partition | Temsilci | Beklenen |
|---|---:|---|
| weight ≤ 0 | 0 | INVALID |
| 0 < weight ≤ 20 | 8 | NORMAL |
| weight > 20 | 23 | SPECIAL |

Bu sınıflar ağırlığın sayısal ve kabul edilen hassasiyette olduğunu varsayar. 20.001'in nasıl temsil edildiği veri tipine bağlıdır.

**Bir sonraki soru:** 8 yerine 19.9 seçmek hangi yeni kanıtı sağlar? EP açısından hâlâ aynı gruptayız. Fakat sınır yakınlarında özel kusur ihtimali var. Bunun için BVA'ya geçiyoruz.

→ [5. Boundary Value Analysis](02-boundary-value-analysis.md)
