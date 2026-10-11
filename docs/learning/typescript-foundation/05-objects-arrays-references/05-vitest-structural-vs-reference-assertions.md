# Vitest: toEqual, toBe, Mutation ve Identity Testleri

**Önkoşul:** [Bölüm girişi](./README.md). Bu bölümdeki kavramlar önceki eğitim içeriğinin yeniden düzenlenmesidir; yeni framework veya ileri type/module kapsamı değildir.

## 1. Neden gerekiyor?
Yalnız structural equality testi, aynı object'in iki collection tarafından paylaşılıp paylaşılmadığını ortaya çıkarmaz.

## 2. Kavram ve sözleşme
`toEqual` **yapı/değer** eşitliği, `toBe` object ve array üzerinde **referans identity** kontrolüdür. İlk assertion sonucu doğru gösterir. İkinci yeni dış array'i, üçüncü yeni element object'ini doğrular. Son assertion, result üzerinde mutation yapıldıktan sonra input'un etkilenmediğini gözler. Bunlar birbirini tamamlar; yalnız yeşil test sayısı yeterli değildir. Buradaki `map` kullanımı, I2 sırasında yapılan manuel object-copy davranışını kısa test fixture içinde göstermek içindir; array transformation yöntemlerinin öğretimi gelecek bölümlerdedir.

## 3. Açıklamalı örnek
```ts
import { expect, it } from "vitest";

it("new result objects do not share the input reference", () => {
  const input = [{ name: "Ali", score: 80 }];
  const output = input.map(item => ({
    name: item.name,
    score: item.score
  }));

  expect(output).toEqual([{ name: "Ali", score: 80 }]);
  expect(output).not.toBe(input);
  expect(output[0]).not.toBe(input[0]);

  output[0].score = 10;
  expect(input[0].score).toBe(80);
});
```

## 4. Davranış / sınır tablosu
| Assertion | Hangi soruyu cevaplar? |
| --- | --- |
| `toEqual` | Aynı yapı/değer mi? |
| `not.toBe(input)` | Dış array başka identity mi? |
| `not.toBe(input[0])` | İç element de yeni mi? |
| Mutation sonrası input | Dış değişiklik input'u etkiledi mi? |

## 5. Hata araştırma ve doğrulama
Yanlış test: yalnız `expect(output).not.toBe(input)` yazıp element izolasyonu var sanmak. Bug'ı göstermek için `const output=[input[0]]` ile alternatif düşün; dış array yeni olduğu hâlde element aynı kalacaktır. Bu, [04 — New Array vs Elements](./04-new-array-versus-new-elements.md) dersinin test karşılığıdır.

## 6. Öğretici pratik
**Önce çalıştırmadan tahmin et:** `output=[input[0]]` iken hangi assertion geçer, hangisi başarısız olur? Mutation testi hangi beklenmeyen side effect'i yakalar?

## 7. Kariyer aktarımı
Bu mekanizma uygulama kodu, test otomasyonu ve güvenli veri işleme çalışmalarında aynı temel prensibi korur: beklenen davranış, gerçek runtime değer ve doğrulama kanıtını ayrı tutmak.

## 8. Interview preparation
**Question:** What evidence would distinguish a working example from a verified requirement?  
**Answer:** A requirement-derived expected outcome, appropriate boundary or negative test, and observed behavior after execution.

## 9. Kaynak ve kanıt ayrımı
[İlk çalışma belgesi](../../../I2-control-flow-functions-data-modeling.md) tarihsel bağlamı korur. Buradaki örnek H0 bağımsızlık/competency kanıtı değildir.
