# Primitive Değerler: Tür, Değer ve Karşılaştırma

**Önkoşul:** [Bu bölümün zihinsel modeli](./README.md) · [Bölüm 01](../01-execution-runtime/README.md) · [Sonraki](./02-const-let-assignment-and-expressions.md)

## 1. Bu konu neden gerekli?
Bir fonksiyonun neden `100` ile `'100'` değerlerine farklı davrandığını anlayabilmek için runtime değer türünü bilmek gerekir.

## 2. Tanım
JavaScript'te primitive değerler arasında `string`, `number`, `boolean`, `undefined`, `null`, `bigint`, `symbol` bulunur. Bu girişte günlük kod için ilk dört tür ön plandadır. **Değer** ile **type** farklı sorulardır: `100` sayıdır, `'100'` metindir.

## 3. Açıklamalı kod
```ts
const count = 100;
const textCount = "100";
const enabled = false;
let missing: string | undefined = undefined;
console.log(typeof count);     // "number"
console.log(typeof textCount); // "string"
console.log(typeof enabled);   // "boolean"
console.log(missing);          // undefined
```

## 4. Adım adım execution/data flow
`typeof` çalışma anındaki değer türünü raporlar. `count` ve `textCount` gözle benzer yazılabilir, fakat tipleri farklıdır. `missing` bir değerin yokluğunu ifade eder. `null` için tarihsel JavaScript davranışı olan `typeof null === 'object'` ayrıca hatırlanmalı; ayrıntı 06'da.

## 5. TypeScript ile ilişkisi
TypeScript'in `string`, `number`, `boolean` açıklamaları static checking'te kullanılır. TypeScript anotasyonu runtime'daki string'i otomatik sayıya dönüştürmez.

## 6. Sınır davranışı ve karıştırılan ayrımlar
`NaN` bir `number` türündedir ama birçok sayı iş kuralında geçerli değildir. `0` veya `false` değerlerinin iş kuralı bakımından anlamlı olması mümkündür.

## 7. Hata araştırma ve gerçek kullanım
Hatalı sonuçta önce `typeof` veya debugger ile gerçek runtime değeri gözle. `===`/truthiness derinliği [Bölüm 08](../08-value-and-decision-mechanics/README.md)'de açıklanır.

## 8. Interview preparation
*How can a number and a string look similar but behave differently?* Their runtime types are different; JavaScript operations and strict comparisons respect those differences.

## 9. Pekiştirme
`typeof 0`, `typeof '0'`, `typeof false` sonuçlarını tahmin et. `null` değerinde `typeof` için neden özel dikkat gerekir?

## 10. Tarih ve kanıt ayrımı
Kaynak kavramlar: [I1](../../../I1-execution-model.md), [I2](../../../I2-control-flow-functions-data-modeling.md). Öğretim örneği H0/uygulama başarısı sayılmaz.
