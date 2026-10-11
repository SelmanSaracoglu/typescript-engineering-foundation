# Ders 7 — Gereksinim, Expected Result ve Boundary Testing

## 1. “Kod çalışıyor” neden yeterli bir test sonucu değildir?

Bir fonksiyonun şu gereksinimi gerçekleştirmesi isteniyor:

> İndirim açıksa fiyattan 20 çıkar. İndirimli sonuç negatif olamaz; gerekirse 0 döndür. İndirim kapalıysa fiyatı değiştirme.

Bir öğrenci şu testi yazabilir:

```ts
// Fonksiyonun 100 birim fiyat için ürettiği sonuç:
console.log(100 - 20); // 80
```

Bu hesap **doğrudur**, ancak tek başına gereksinimin tüm koşullarını doğrulamaz.

Aşağıdaki implementasyon da 100 birimlik fiyatta aynı sonucu döndürür:

```ts
function wrongDiscount(price: number, enabled: boolean): number {
  if (enabled) return price - 20;
  return price;
}
console.log(wrongDiscount(100, true)); // 80
```

Fakat `wrongDiscount(19, true)` sonucu `-1` olur. Gereksinime aykırı şekilde negatif fiyat üretilir.

**Dersin temel amacı:** Bir testin yalnız geçip geçmediğine değil, **hangi yanlış davranışı yakalayabildiğine** bakmak.

## 2. Requirement, expected, actual ve assertion

Bu dört kavramı kesin biçimde ayır:

| Kavram | Soru | Örnek |
| --- | --- | --- |
| **Requirement** | Sistem ne yapmalı? | Negatif indirimli fiyat üretme |
| **Expected result** | Seçilen input'ta doğru sonuç ne? | 19 indirimli → 0 |
| **Actual result** | Kod gerçekten ne üretti? | Hatalı kod → -1 |
| **Assertion** | Expected ile actual karşılaştırıldı mı? | `expect(actual).toBe(0)` |

Süreç:

```text
İş gereksinimi
     ↓
Gözlenebilir davranış sözleşmesi
     ↓
Anlamlı test girdisi + expected result
     ↓
Fonksiyonun gerçekten çalıştırılması
     ↓
Actual result
     ↓
Expected vs actual assertion
     ↓
Pass / fail + hata araştırması
```

**Önemli:** Expected result, implementasyonun mevcut hesabından körü körüne kopyalanırsa test mevcut bug'ı **onaylayan** bir teste dönüşebilir.

## 3. Gereksinimi koşullara ayıralım

Gereksinim:

- A: `hasDiscount = false` → aynı fiyat döner.
- B: `hasDiscount = true` ve `price >= 20` → `price - 20` döner.
- C: `hasDiscount = true` ve `price < 20` → `0` döner.

Bunlar yalnız üç yazı cümlesi değil, üç ayrı **control-flow bölgesi**dir.

```ts
function calculateFinalPrice(
  price: number,
  hasDiscount: boolean
): number {
  if (hasDiscount) {
    if (price - 20 < 0) {
      return 0;
    }
    return price - 20;
  }
  return price;
}
```

Bu örnek repodaki mevcut fiyat hesaplama fonksiyonunun davranışını gösterir.

### Her branch'in akışı

**A — İndirim kapalı**

Input `(15, false)`.
1. `hasDiscount` false.
2. Dış `if` atlanır.
3. `return price` çalışır.
4. Sonuç: `15`.

**B — İndirim açık, fiyat yeterli**

Input `(100, true)`.
1. Dış `if` true.
2. `100 - 20 < 0` → false.
3. `return 100 - 20`.
4. Sonuç: `80`.

**C — İndirim açık, fiyat küçük**

Input `(19, true)`.
1. Dış `if` true.
2. `19 - 20 < 0` → true.
3. `return 0`.
4. Sonuç: `0`.

Bu kontrolün amacı yalnız kod satırlarına bakmak değil, **iş sözleşmesindeki her olasılığı** belirlemek.

## 4. Boundary value nedir?

**Boundary (sınır)**, bir condition sonucunun değiştiği değerdir.

Bu örnekte `price - 20 < 0` kontrolü, 20 fiyatının çevresinde davranış değiştirir.

| Price | Discount | Beklenen | Amaç |
| ---: | --- | ---: | --- |
| 100 | true | 80 | Normal indirim |
| 21 | true | 1 | Sınır üstü |
| 20 | true | 0 | Exact boundary |
| 19 | true | 0 | Sınır altı, negatif koruma |
| 0 | true | 0 | Minimum örnek |
| 15 | false | 15 | İndirim kapalı |
| 100 | false | 100 | Büyük fiyat, indirim kapalı |

20, 19 ve 21 yakın değerlerdir; fakat aynı soruyu cevaplamazlar.

- `21` → Normal çıkarma yoluna giriyor mu?
- `20` → Tam sınırda sonuç doğru mu?
- `19` → Negatif koruma gerçekten devreye giriyor mu?

### “20 → 0” niçin negatif korumanın kanıtı değil?

Çünkü hem doğru hem yanlış implementasyon bu input'ta **0 döndürür**:

```ts
function wrongDiscount(price: number): number {
  return price - 20;
}
console.log(wrongDiscount(20)); // 0
console.log(wrongDiscount(19)); // -1
```

`19` girdisi iki implementasyonu **ayırt eder**. Başarılı test senaryosu seçmenin özü budur.

## 5. Happy path, boundary ve negative case

Bu kavramları karıştırma:

**Happy path:** Beklenen normal kullanım akışıdır. `(100, true) → 80`.

**Boundary case:** Kararın değiştiği tam nokta veya hemen yakınındaki durumdur. `19`, `20`, `21`.

**Negative case:** Uygulamanın reddetmesi, sınırlaması veya kontrollü sonuç üretmesi beklenen durumdur. Burada indirim sonrasında negatif fiyat olasılığına karşı `0` döndürülmesi.

“Negative test” mutlaka input'un sayısal olarak negatif olması demek değildir. Uygun olmayan davranışı veya hata yolunu hedefleyen testtir.

## 6. Vitest testi nasıl yazarız?

Bu repoda kullanılan test runner **Vitest**'tir. Birim testinde adlandırılmış davranışı çalıştırıp sonucu kontrol ederiz.

```ts
import { describe, expect, it } from "vitest";
import { calculateFinalPrice } from "../src/price";

describe("calculateFinalPrice", () => {
  it("subtracts 20 when discount is enabled", () => {
    const actual = calculateFinalPrice(100, true);
    expect(actual).toBe(80);
  });

  it("returns zero when price equals the discount", () => {
    const actual = calculateFinalPrice(20, true);
    expect(actual).toBe(0);
  });

  it("does not return a negative discounted price", () => {
    const actual = calculateFinalPrice(19, true);
    expect(actual).toBe(0);
  });

  it("keeps the original price if discount is disabled", () => {
    const actual = calculateFinalPrice(15, false);
    expect(actual).toBe(15);
  });
});
```

Bu örnek bu repodaki `tests/price.test.ts` dosyasının test ettiği davranışları temel alır. Dosyaya yazılmadı; öğretim amaçlı gösterimdir.

### Her assertion hangi ihtimali dışlar?

| Test | Başarısız olması neyi gösterir? |
| --- | --- |
| 100 → 80 | Normal indirim hesabı yanlış |
| 20 → 0 | Tam sınır sonucu yanlış |
| 19 → 0 | Negatif sonuç korunmuyor |
| Discount=false → aynı fiyat | İndirim kapalı branch'i yanlış |

Testler aynı function'ın **farklı karar yollarını** ölçer. Birbirinin kopyası değildir.

## 7. toBe neden kullanılıyor?

Vitest'te `toBe`, bu örnekte number primitive sonucunun beklenen değere uyup uymadığını kontrol eder.

```ts
import { expect, it } from "vitest";

it("compares a primitive result", () => {
  const actual = 100 - 20;
  expect(actual).toBe(80);
});
```

`actual` burada 80 number değeridir. `toBe(80)` beklenen sayı ile karşılaştırır.

Array ve object'lerde referans kimliğiyle yapısal eşitlik farklıdır; fakat bu fonksiyonun return değeri number olduğundan primitive sayı kontrolü yeterlidir.

## 8. Testin yanlış yazılması neye yol açar?

Kötü test:

```ts
import { expect, it } from "vitest";

function wrongDiscount(price: number): number {
  return price - 20;
}

it("agrees with the implementation", () => {
  expect(wrongDiscount(19)).toBe(-1);
});
```

Bu test **geçer**, çünkü yanlış kod gerçekten -1 üretir. Ancak iş gereksinimi negatif fiyatı yasaklıyorsa testin beklenen sonucu yanlış seçilmiştir.

Doğru yaklaşım:
1. İş sözleşmesini koda bakmadan yaz.
2. Input için expected result belirle.
3. Actual result'ı ölç.
4. Farkı hata olarak değerlendir.

**Test geçiyor** önermesi yalnız *yazdığın assertion karşılandı* demektir. **Sistem doğru** sonucuna otomatik gidilmez.

## 9. TypeScript number olmasına rağmen neden negatif çıkabiliyor?

```ts
const numberValue: number = -1;
console.log(numberValue); // -1
```

TypeScript açısından -1 de bir number'dır. `number` tipi “negatif olmayan fiyat” anlamına gelmez.

Bu durumda **business rule** kodda temsil edilmelidir:

```ts
function clampToZero(value: number): number {
  if (value < 0) return 0;
  return value;
}

console.log(clampToZero(-1)); // 0
console.log(clampToZero(0));  // 0
console.log(clampToZero(10)); // 10
```

Bu yardımcı fonksiyon davranışı anlamak için verilmiştir; repo'ya eklenmesi veya mevcut implementation'ın değiştirilmesi önerilmez.

### Geçersiz input sözleşmesi ayrı bir sorudur

Yukarıdaki fiyat gereksinimi **negatif sonuç oluşmasını** ele alır, fakat ham `price=-100`, `NaN`, `Infinity` gibi input'ların nasıl yönetileceğine ilişkin kapsamlı bir doğrulama sözleşmesi tanımlamaz.

Bu nedenle “tüm negatif input'lar reddedilir” veya “NaN otomatik engellenir” gibi varsayımlar **yapılmamalıdır**. Yeni gereksinim varsa ayrı davranış ve test tanımlanır.

## 10. Equality boundary ile branch coverage aynı şey mi?

Hayır. Test tasarımında iki ayrı bakış bulunur.

**Boundary selection:** 19/20/21 gibi kararın değiştiği değerlere odaklanır.

**Branch coverage fikri:** Fonksiyonun farklı branch'lerinin çalıştırılmasını amaçlar. Örneğin indirim açık/kapalı ve negatif sonuç kontrolünün true/false yolları.

Tek normal input `(100,true)` aşağıdaki yolları işler:
- dış `if` true,
- iç `if` false.

Ama şunları işlemeyebilir:
- dış `if` false,
- iç `if` true.

Yani tek normal test bütün branch davranışlarını kapsamaz.

**Önemli:** Yüksek branch coverage, doğru expected assertion yazıldığı anlamına gelmez. Coverage ile correctness farklı göstergelerdir.

## 11. Test verisini kontrollü seçmek

Bir sorunu araştırırken aynı anda beş input özelliğini değiştirmek, hangi değişikliğin sonucu etkilediğini belirsizleştirebilir.

Örneğin:
- `calculateFinalPrice(20,true)`
- `calculateFinalPrice(19,true)`

Bu iki çağrı arasında yalnız `price` değişti. Böylece negatif guard davranışı kolay incelenebilir.

İndirim açık/kapalı farkını izole etmek için:
- `calculateFinalPrice(15,true)` → 0
- `calculateFinalPrice(15,false)` → 15

Yalnız `hasDiscount` değişti. Bu, hangi branch'in farklılaştığını açıklamayı kolaylaştırır.

## 12. Debugging: Bug reproduksiyonundan düzeltmeye

Kasıtlı bozuk sürüm:

```ts
function broken(price: number, enabled: boolean): number {
  if (enabled) {
    return price - 20;
  }
  return price;
}
```

**Belirti:** `broken(19,true)` sonucu -1.

1. **Requirement:** Negatif indirimli sonuç yasak.
2. **Expected:** 0.
3. **Actual:** -1.
4. **Classification:** Type değil, business logic bug.
5. **Hypothesis:** Alt sınır kontrolü eksik.
6. **Minimal fix:** Negatif sonuç için `return 0` koşulu ekle.
7. **Verification:** 19, 20, 21, 100 ve discount=false örneklerini tekrar çalıştır.
8. **Regression:** Önceden doğru çalışan 100 → 80 senaryosu bozulmamalı.

**Kritik:** Bug yalnız 19 girdisiyle ortaya çıktıysa, aynı anda indirim miktarını, type modelini ve toolchain'i değiştirmek mantıklı değildir. Önce hipotezi tek ve kontrol edilebilir düzeltmeyle doğrula.

## 13. Gerçek mühendislik kararını açıklayabilmek

Bir SDET testinde şu ayrımları ifade edebilmelidir:

- **Requirement-based test:** Beklenen sonuç iş kuralından çıkar.
- **Implementation-based reasoning:** Mevcut kodda hangi branch'in neden çalıştığı gözlenir.
- **Regression:** Düzeltme sonrası var olan doğru davranışlar tekrar kontrol edilir.
- **False confidence:** Yeşil test sonucunun kapsamadığı davranışlar için de garanti verdiğinin sanılması.

Application Security çalışmalarında da giriş verisinin doğru type'a sahip olması, iş kuralını sağladığı anlamına gelmez. Başarılı static check veya başarılı HTTP yanıtı bile yanlış yetkilendirme gibi kusurları tek başına dışlamaz. Bu örnekte yalnız temel test mekanizması ele alınır.

## 14. Mülakat hazırlığı

**Question: What is the difference between expected and actual results in a test?**

> Expected results come from the requirement. Actual results come from executing the system. The assertion compares them, and a passing assertion does not automatically prove every untested requirement.

**Question: Why would you test 19 if the discount is 20?**

> An incorrect implementation may return -1 for an input below the discount amount. Testing 19 checks whether the negative-result guard actually works, while testing 20 alone would not distinguish the incorrect implementation.

**Question: Is 100% branch coverage sufficient to prove correctness?**

> No. Branch coverage measures exercised decision paths, but assertions can still be missing or incorrect, and requirements may remain untested.

## 15. Pekiştirme ve cevap anahtarı

Önce kendi çözümünü gerekçelendir:

1. 20 indirimi için 20→0 testi negatif guard'ın varlığını tek başına kanıtlar mı?
2. Neden 19→0 testi bu kusuru yakalamak için daha güçlü?
3. `calculateFinalPrice(15,false)` expected sonucu nedir?
4. `price=-100` input'u hakkında bu gereksinim neleri açıkça söylüyor, neleri söylemiyor?
5. `toBe(-1)` assertion'ı geçen yanlış indirim testi neden tehlikeli?
6. Yalnız `calculateFinalPrice(100,true)` testi hangi branch'leri hiç çalıştırmayabilir?
7. İndirim aktif/pasif farkını görmek için neden aynı fiyatla iki çağrı kullanılır?

<details><summary>Kontrol cevapları</summary>

1. Hayır; korumasız çıkarma da 0 üretir.
2. Korumasız hesap -1 üretir, doğru guard 0 üretir.
3. 15.
4. Negatif **indirimli sonuç** üretilmemesi söylenmiştir; tüm dış input validation kuralları belirtilmemiştir.
5. Assertion kodun yanlış sonucunu expected olarak onaylamaktadır.
6. İndirim kapalı branch'i ve negatif guard'ın true yolunu.
7. Tek değişken `hasDiscount` olduğunda farklı sonucun nedenini izole etmek kolaylaşır.

</details>
