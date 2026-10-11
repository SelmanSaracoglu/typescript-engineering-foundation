# Ders 2 — Type-check Error, Runtime Exception ve Logic Bug

## 1. Neden bütün hataları “kod çalışmıyor” diye adlandırmıyoruz?

Şu üç durumla karşılaştığını düşün:

- TypeScript editörde kırmızı uyarı veriyor.
- Program açılıyor fakat `SyntaxError` ile duruyor.
- Program hiçbir hata mesajı vermeden beklenenden farklı fiyat hesaplıyor.

Bu üç durumda da ortada bir problem var ama çözümün başlayacağı nokta **aynı değil**. Yanlış katmanda çözüm aramak, rastgele paket kurmak, tipleri `any` yapmak veya doğru çalışan kodu bozmak gibi sonuçlar doğurabilir.

**Teknik hedef:** Hatanın *ne zaman* ortaya çıktığını, *hangi araçla* gözlemlendiğini ve *hangi sözleşmeyi* ihlal ettiğini ayırt etmek.

## 2. Üç hata sınıfı: tanım ve kanıt

| Sınıf | Ne bozulur? | Ne zaman gözlenir? | İlk bakılacak kanıt |
| --- | --- | --- | --- |
| **Type-check error** | Statik type sözleşmesi | TypeScript analizinde | `tsc` hata kodu, dosya/satır |
| **Runtime exception** | Yürütme akışı beklenmedik biçimde kesilir | JavaScript çalışırken | Exception türü, mesaj, stack trace |
| **Logic / behavior bug** | Kod, gereksinimin beklediği sonucu üretmez | Program çalıştıktan sonra sonuç değerlendirilince | Expected–actual farkı, seçilen test girdisi |

Bir problem bu kategorilerden yalnız **birinde** kalmak zorunda değildir; bir uygulama aynı anda farklı kusurlar taşıyabilir. Ancak araştırmada hangi *gözlemden* hareket ettiğini belirtmelisin.

## 3. Type-check error: “number beklerken string”

Örneği bilerek geçersiz yazalım:

```ts
const age: number = "33";
console.log(age);
```

Burada:
1. `age` için TypeScript `number` bekliyor.
2. Atanan gerçek ifade `"33"` bir `string`.
3. Type checker iki türün uyuşmadığını bildirir.
4. İlgili tanılama genellikle `TS2322` gibi bir kod, satır ve tip mesajı içerir.

Bu örneği ayrı `.ts` dosyasında `tsc --noEmit` ile incelersen type hatasını görürsün. **Bu bir çalıştırma sonucu örneği değildir**; hatalı kod örneğidir ve mevcut repo kaynak dosyalarına eklenmemelidir.

### Yanlış “çözüm” niçin çözüm değildir?

```ts
// Öğretici anti-pattern: sessizce beklentiyi değiştirip sorunu gizleme.
const age: any = "33";
```

Bu biçim TypeScript kontrolünün bir kısmını devre dışı bırakır; `age` yine string'tir. Veri gerçekten sayıyı temsil etmeliyse dönüşüm, geçersiz girdi politikası ve beklenen tür açıkça tasarlanmalıdır. `Number("33")` sonucu 33 iken `Number("not-a-number")` sonucu `NaN` olabilir.

**Dersin asıl noktası:** Type checker, *beklediğimiz tür* ile *kodda ifade ettiğimiz tür* arasındaki uyuşmazlığı gösterebilir. Runtime'dan gelen her değeri kendiliğinden doğrulamaz.

## 4. Runtime exception: typecheck geçebilir ama yürütme durabilir

```ts
const brokenText = "{broken}";
console.log(JSON.parse(brokenText));
```

Bu kod TypeScript açısından geçerli olabilir: `JSON.parse` bir string alır. Fakat `"{broken}"` geçerli JSON değildir; **çalışırken** `SyntaxError` fırlatır.

Güvenli gözlem için hata yakalayan ayrı örnek:

```ts
try {
  const value: unknown = JSON.parse("{broken}");
  console.log(value); // çalışmaz
} catch (error: unknown) {
  if (error instanceof SyntaxError) {
    console.log("JSON syntax is invalid");
  } else {
    throw error;
  }
}
// JSON syntax is invalid
```

**Adım adım yürütme:**

1. `try` block'una girilir.
2. `JSON.parse` metni parse etmeye çalışır.
3. Sözdizimi geçersiz olduğu için `SyntaxError` oluşur.
4. `console.log(value)` satırına **ulaşılmaz**.
5. `catch` çalışır; `error instanceof SyntaxError` kontrolü doğrudur.
6. Kontrollü mesaj yazdırılır.

> `JSON.parse('42')` ise geçerli JSON'dur ve number 42 döndürür. `JSON.parse` çıktısının her zaman object olduğunu varsaymak ayrı bir yanlıştır.

**Önemli ayrım:** `try/catch` bir exception'ı ele alabilir; ama exception yakalamak tek başına giren veriyi doğru business modeline dönüştürmez.

## 5. Logic bug: program çalışıyor ama yanlış cevap veriyor

Gereksinim:

> Fonksiyona verilen sayıyı **ikiyle çarp**.

Kasıtlı hatalı kod:

```ts
function double(value: number): number {
  return value + 2; // BUG: gereksinimde çarpma vardı
}
console.log(double(4)); // 6, beklenen 8
```

Bu function:
- Type checking sırasında number alır ve number döndürür.
- JavaScript'e derlenebilir.
- Runtime'da exception olmadan çalışır.
- **Yanlış sonuç üretir** çünkü uygulanan işlem, gereksinimdeki işlem değildir.

| Girdi | Yanlış `value + 2` | Doğru `value * 2` | Hata fark edilir mi? |
| ---: | ---: | ---: | --- |
| 2 | 4 | 4 | Hayır |
| 4 | 6 | 8 | Evet |
| 0 | 2 | 0 | Evet |
| -2 | 0 | -4 | Evet |

Bu tablo ayrıca önemli bir test tasarımı dersidir: `double(2)` örneği **yanlış implementasyonu bile geçirir**. Dolayısıyla yalnızca çalışan örnek sayısı değil, **kusuru ayırt eden input seçimi** önemlidir.

**Doğru davranışın örneği:**

```ts
function double(value: number): number {
  return value * 2;
}
console.log(double(4)); // 8
```

Bu kodu hazır görev çözümü olarak değil, gereksinim ile implementation arasındaki farkı öğretmek için gösteriyoruz.

## 6. Typecheck geçti; runtime geçti; test geçti — aynı şey mi?

Hayır. Örneğin `double(value) { return value + 2; }` için:

| Gözlem | Olası sonuç | Ne söyleyebiliriz? |
| --- | --- | --- |
| `npm run typecheck` | Başarılı olabilir | Static type beklentisi karşılandı |
| `npm run build` | Başarılı olabilir | JavaScript üretilebildi |
| Fonksiyon çağrısı `double(4)` | 6 | Runtime yürütmesi gerçekleşti |
| Test yalnız `double(2) === 4` | Başarılı | Yetersiz test, bug'ı gizledi |
| Test `double(4) === 8` | Başarısız | İş kuralı ihlali yakalandı |

**Testin gerçekten kusuru yakalaması** esastır. Yeşil test raporu, *yazılmamış testlerin* garanti edildiği anlamına gelmez.

## 7. Gerçek repository örneği: negatif fiyatı önlemek

`src/price.ts` fonksiyonu, indirim aktifken 20 çıkarır ve negatif sonuç yerine 0 döndürür.

```ts
export function calculateFinalPrice(
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

Bu gerçek kaynakta `price - 20 < 0` kontrolü kaldırılırsa `calculateFinalPrice(19, true)` sonucu `-1` olabilir. TypeScript bunu bir type error saymaz: `-1` de bir `number` değeridir. Bu, **business rule** hatasıdır.

### Beklenen davranışı koddan önce tanımla

| Price | hasDiscount | Beklenen | Risk |
| ---: | --- | ---: | --- |
| 100 | true | 80 | Normal |
| 20 | true | 0 | Exact boundary |
| 19 | true | 0 | Negatif sonuç koruması |
| 15 | false | 15 | İndirim yok |

`20 → 0` tek başına korumanın varlığını kanıtlamaz çünkü korumasız `20 - 20` de 0'dır. **19 → 0** kontrolü kusuru daha iyi ayırt eder.

### Test örneği (öğretici parça)

```ts
import { expect, it } from "vitest";
import { calculateFinalPrice } from "../src/price";

it("never returns a negative discounted price", () => {
  expect(calculateFinalPrice(19, true)).toBe(0);
});
```

Bu örnek proje içindeki `tests/` konumundan import düşünülerek yazılmıştır. Yeni dosya oluşturulmadı. Aynı test yaklaşımı mevcut I1 testlerinde de bulunur.

## 8. Sistematik debugging: hipotez değil rastgele değişiklik mi?

Kusur: `calculateFinalPrice(19, true) = -1`. Nasıl araştırılır?

1. **Reproduce:** Girdiyi ve actual result'ı tekrar üret.
2. **Expected:** Gereksinimde negatif fiyatın yasaklandığını doğrula. Beklenen `0`.
3. **Classify:** Typechecker'ın `-1` sayısını kabul etmesi şaşırtıcı değildir → logic bug şüphesi.
4. **Hypothesis:** Negatif guard eksik veya yanlış koşulda.
5. **Experiment:** Yalnız `price - 20 < 0` dalının çalışıp çalışmadığını debugger ile izle.
6. **Root cause:** Yanlış operator veya eksik guard varsa somut satırı belirle.
7. **Fix & verify:** Kontrolü düzelt, 19/20/100 ve disabled senaryolarını tekrar çalıştır.

Sırf terminalde bir hata gördüğün için `npm install`, TypeScript sürümünü değiştirme veya `as number` ekleme: bunlar ancak kanıt uygun katmanı işaret ediyorsa anlamlıdır.

## 9. Hata türleri ve sık yapılan yanlışlar

**Yanılgı 1:** “`tsc` başarılıysa implementation doğrudur.”  
**Düzeltme:** Tip sözleşmesi iş sözleşmesinin tüm mantığını ifade etmez.

**Yanılgı 2:** “Runtime'da exception yoksa bug yoktur.”  
**Düzeltme:** Sessizce yanlış sonuç üretilebilir.

**Yanılgı 3:** “`throw new Error` ve `return {error: ...}` aynıdır.”  
**Düzeltme:** Birincisi exception kanalına, ikincisi normal return kanalına gider; bunlar iki farklı kontrol akışıdır.

**Yanılgı 4:** “Stack trace her sorunu bulur.”  
**Düzeltme:** Logic bug her zaman exception üretmez; expected–actual karşılaştırması gerekir.

**Yanılgı 5:** “Kodda `: number` yazmak veri doğrulamadır.”  
**Düzeltme:** Dış girdinin runtime shape'ini ayrıca doğrulamak gerekir.

## 10. Mülakat hazırlığı

**Question: How would you distinguish a type error, a runtime error and a logic bug?**

> A type error is detected by TypeScript's static checker when code violates a type rule. A runtime error occurs while the JavaScript executes and may throw an exception. A logic bug can execute successfully but violate the expected requirement. I classify the observed failure and select tests or debugging evidence for that layer.

**Türkçe karşılığı:** Type error statik tür kuralının ihlalidir. Runtime exception çalışma anındaki akışı etkiler. Logic bug ise kod hata fırlatmasa bile yanlış iş sonucu üretmesidir. Önce problemi sınıflandırır, ardından o katmana uygun kanıt toplarım.

**Question: Why might a passing test fail to detect a bug?**

> The test input or assertion may not distinguish the incorrect implementation from the required behavior.

**Türkçe karşılığı:** Test girdisi veya assertion, yanlış implementasyonu doğru davranıştan ayırt edecek kadar güçlü olmayabilir.

## 11. Pekiştirme ve cevap kontrolü

Kodları çalıştırmadan aşağıdaki senaryoları sınıflandır:

1. `const x: boolean = 123;` → Hangi katman?
2. `JSON.parse("{broken}")` → Hangi katman?
3. `double(2) === 4` testinin geçmesi → Bug bulunmadığı söylenebilir mi?
4. `calculateFinalPrice(19, true)` için `-1` → Type mi logic mi?
5. `JSON.parse("42")` → Runtime exception olur mu?
6. `try/catch` ile SyntaxError yakalanması, JSON içindeki `price` alanının doğru türde olduğunu kanıtlar mı?

<details><summary>Kısa cevap anahtarı</summary>

1. Type-check hatası: boolean beklenirken number verildi.
2. Runtime SyntaxError.
3. Hayır; `value + 2` kusuru bu girdide görünmez.
4. Logic/business rule bug; sonuç bir number olsa da negatifi yasaklayan gereksinime aykırıdır.
5. Hayır, number 42 döner.
6. Hayır; parsing syntax düzeyidir, shape ve business validation ayrıca gerekir.

</details>
