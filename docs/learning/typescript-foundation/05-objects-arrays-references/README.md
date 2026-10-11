# 05 — Objects, Arrays, References & Mutation

**Önkoşul:** [04](../04-control-flow-iteration/README.md). **Sonraki:** [06 — type modeling](../06-typescript-modeling/README.md); modern shallow spread için [09](../09-modern-object-array-syntax/README.md).

## Ayrıntılı dersler

1. [Object, Property, Array ve Element Modeli](./01-objects-properties-arrays-elements.md)
2. [Reference Identity: Same Object ve New Object](./02-reference-identity-and-aliases.md)
3. [Mutation, Side Effect ve const Yanılgısı](./03-mutation-side-effects-and-const.md)
4. [Yeni Array ≠ Yeni Element Object: Copy Sınırı](./04-new-array-versus-new-elements.md)
5. [Vitest: toEqual, toBe, Mutation ve Identity Testleri](./05-vitest-structural-vs-reference-assertions.md)

## Neden?
Yeni bir array üretmek, içindeki object'lerin de yeni olduğu anlamına gelmez. Paylaşılan referanslar beklenmedik mutation etkilerine yol açabilir.

## Collection ile kayıt ayrımı
```ts
const users = [
  { name: "Ali", score: 80 },
  { name: "Ece", score: 45 }
];
```
`users` bir array container'dır, her elemanı object kaydıdır. Teknik olarak JavaScript array de özel bir object'tir.

## Identity
```ts
const first = { score: 80 };
const alias = first;
alias.score = 10;
console.log(first.score);  // 10: aynı object
console.log(alias === first); // true
```
`const` binding'i yeniden atanamaz, ama object property mutation yapılabilir.

## Yeni dış yapı, ortak element
```ts
const source = [{ score: 80 }];
const selected = [];
selected.push(source[0]);
console.log(selected === source);       // false
console.log(selected[0] === source[0]); // true
selected[0].score = 10;
console.log(source[0].score);           // 10
```
**Öğrenme kuralı: new array ≠ new element objects.** `push` mevcut referansı taşır. Aynı object'leri paylaşmamak için ihtiyaca göre yeni element object oluştur:

```ts
const independent = [{ score: source[0].score }];
console.log(independent[0] === source[0]); // false
```
Bu örnek property primitive olduğu için basittir. Nested object varsa yüzeysel kopya nested reference'ları paylaşabilir; [09 spread](../09-modern-object-array-syntax/03-spread.md) ayrıntılı mekanizmayı açıklar.

## Mutation ve side effect
Mutation mevcut veriyi değiştirir. Bir function kendisine verilen object'i değiştiriyorsa caller bunu gözleyebilir: bir yan etki yaratır. Mutation otomatik yanlış değildir; sözleşme, referans paylaşımı ve testler belirleyicidir.

## Doğrulama: structure vs identity
```ts
// Vitest test bağlamında:
expect([{ score: 10 }]).toEqual([{ score: 10 }]); // aynı yapı
expect([{ score: 10 }]).not.toBe([{ score: 10 }]); // ayrı array identity
```
`toEqual` içerik/yapıyı, `toBe` object'lerde identity'yi ölçer. Örnek bağımsız Vitest test dosyası değil; assertion mekanizması gösterimidir.

**Mülakat:** *Does spreading an array clone nested objects?* Hayır; yeni dış array oluşturabilir, iç object'ler aynı referansları paylaşabilir.

**Pekiştirme:** İki array'in farklı, iç elemanın aynı olduğu durumu kendi sözlerinle anlat. Değişiklik neden input'a yansır? Kaynak [I2](../../../I2-control-flow-functions-data-modeling.md).
