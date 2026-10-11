# Ders 18 — Vitest: toEqual, toBe, Mutation ve Identity Testleri

## 1. Problemi tanıyalım

“Sonuç doğru görünüyor” ile “sonuç input'tan bağımsız object'ler taşıyor” iki farklı gereksinimdir. Testte yalnız içerik karşılaştırması yaparsak element identity bug'ını kaçırabiliriz.

## 2. Tanım ve zihinsel model

`toEqual` beklenen yapısal içeriği kıyaslar. Vitest'teki `toBe`, `Object.is` benzeri değer/identity karşılaştırması yapar; object'lerde aynı referansı gerektirir. **Mutation test** sonuç üzerinde değişiklik yapıldıktan sonra input'un etkilenmemesi şartını sınayabilir.

`toBe` ile `===` normal object identity için benzer sonuç verir; `NaN` ve signed zero gibi primitive sınırlarında aynı algoritma değildir.

## 3. Açıklamalı örnek

```ts
import { expect, it } from "vitest";

it("returns equal content with independent objects", () => {
  const input = [{ name: "Ali", score: 80 }];
  const result: { name: string; score: number }[] = [];
  for (const user of input) {
    result.push({ name: user.name, score: user.score });
  }

  expect(result).toEqual([{ name: "Ali", score: 80 }]);
  expect(result).not.toBe(input);
  expect(result[0]).not.toBe(input[0]);

  result[0].score = 10;
  expect(input[0].score).toBe(80);
});
```

## 4. Veri ve referans akışı

`result` yeni array, içindeki object yeni literal'dir. İlk assertion içerik doğru mu sorusunu cevaplar; ikinci dış array farklı mı, üçüncü element object farklı mı sorusunu cevaplar. Son assertion output'u mutate ederek input'un etkilenmediğini gösterir. **Dört kontrol farklı iddiaları doğrular.**

## 5. Mekanizmanın önemli kullanım durumları

### Yanlış güven: sadece array identity

```ts
const input = [{ score: 80 }];
const output = [input[0]];
console.log(output === input);       // false
console.log(output[0] === input[0]); // true
```

Sadece `expect(output).not.toBe(input)` geçer. Ama element izolasyonu **yoktur**.

### Aynı içerik farklı identity

```ts
const a = [{ score: 80 }];
const b = [{ score: 80 }];
console.log(a === b);       // false
console.log(a[0] === b[0]); // false
```

Vitest `toEqual` iki yapıyı eşit kabul edebilir. Bu object'ler aynı identity'yi taşımadıkları için `toBe` ile eşleşmez.

### Hangi assertion?

| Gereksinim | Assertion |
| --- | --- |
| Sonuç içeriği doğru | `toEqual(expected)` |
| Dış array yeni | `not.toBe(input)` |
| İç object yeni | `not.toBe(input[0])` |
| Result mutation input'u etkilemiyor | Değişiklik sonrası `input` beklentisi |

Yalnız assertion sayısını artırmak kalite değildir; her assertion bir **açık sözleşme**yi test etmelidir.

### `[]` ve `[{}]`

```ts
import { expect, it } from "vitest";
it("returns no records", () => {
  const result: object[] = [];
  expect(result).toEqual([]);
  expect(result).not.toEqual([{}]);
});
```

Boş collection, boş object içeren collection değildir.

## 6. Sınır durumları ve TypeScript farkı

Identity izolasyonu her senaryoda gerekli olmayabilir. Bir fonksiyon açıkça var olan object'leri referans olarak döndürmek için tasarlanmışsa `result[0] === input[0]` doğru davranıştır. **Test beklentisi fonksiyon sözleşmesinden çıkar.**

Nested object varsa yeni element literal bile nested reference paylaşabilir. Böyle durumda ayrı nested identity testleri gerekebilir; her kod için otomatik deep copy hedefi koymak yanlış olur.

## 7. Debugging — yanlış davranışı izlemek

Belirti: `toEqual` geçti ama input beklenmedik değişti. 1. Hangi property mutation yaptı? 2. `result[0] === input[0]` true mu? 3. Testte yalnız deep equality mi kontrol ediliyor? 4. Gereksinimin independent copy olup olmadığını doğrula. 5. New object literal ile düzeltip mutation assertion'ı ekle.

**False positive güven:** Teste “does not mutate input” adını vermek yeterli değildir; assertion gerçekten before/after input durumunu gözlemlemelidir.

## 8. Mülakat ve pekiştirme

**Question:** When would you use toEqual rather than toBe? **Answer:** I use toEqual for structural content, and toBe to check reference identity or primitive equality semantics.

**Question:** Can a new array share its element references with the source? **Answer:** Yes; array and element identities must be checked separately.

**Pekiştirme:** `[input[0]]` ile yeni array üretildiğinde hangi test geçer? `toEqual` neden identity'yi ispatlamaz? Mutation testi hangi davranışı doğrular?

<details><summary>Cevap kontrolü</summary>

Dış array farklıdır; element aynı kalır. Structural equality içerik karşılaştırır. Mutation testi input'un değişmeden kalmasını gözler.

</details>

## 9. Testlerin gösterdiği ve göstermediği şey

```ts
import { expect, it } from "vitest";

it("checks both structure and identity", () => {
  const input = [{value:10}];
  const output = [input[0]];

  expect(output).toEqual([{value:10}]); // geçer
  expect(output).not.toBe(input);       // geçer
  // expect(output[0]).not.toBe(input[0]); // BAŞARISIZ olurdu
});
```

İlk assertion değer/yapı doğru der. İkinci dış array'in yeni olduğunu ispatlar. Ama element aynı object olduğundan üçüncü assertion'ın **başarısız olması** beklenir. Bir testin kırmızı olması, bazen tam aradığımız doğru kanıttır: implementation sözleşmeyi ihlal ediyor.

### Mutasyon sonrası kıyas

```ts
const input = [{score:80}];
const output = [input[0]];
output[0].score = 0;
console.log(input[0].score); // 0
```

Bu code snippet, paylaşılan identity'nin dış etkisini gözlemler. Testte return value tek başına bu hatayı göstermez.

### Düzeldiğini nasıl kanıtlarsın?

Yeni element object'i üreten implementation için üç assertion kur:

1. Expected structure.
2. Expected independent element identity.
3. Result üzerinde mutation sonrası input unchanged.

Dördüncü olarak empty input sonucunu `[]` kontrolüyle ele al.

### Bağımsız görev

Ayrı object'lerle aynı içerik taşıyan iki array oluştur. `toEqual`, `toBe` ve `not.toBe` sonuçlarını kodu yürütmeden gerekçelendir.

<details><summary>Kontrol</summary>

Ayrı literal'lerde yapısal eşitlik olabilir fakat array ve element identity farklıdır; `toEqual` geçebilir, `toBe` geçmez.

</details>
