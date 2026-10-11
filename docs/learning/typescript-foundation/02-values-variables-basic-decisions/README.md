# 02 — Values, Variables & Basic Decisions

**Önkoşul:** [01 — execution modeli](../01-execution-runtime/README.md). **Sonraki:** [03 — functions](../03-functions-fundamentals/README.md).

## Ayrıntılı dersler

1. [Primitive Değerler: Tür, Değer ve Karşılaştırma](./01-primitive-values-and-types.md)
2. [const, let, Assignment ve Expression](./02-const-let-assignment-and-expressions.md)
3. [Karşılaştırmalar ve if/else ile Temel Karar Akışı](./03-comparisons-if-else-branching.md)
4. [Gereksinimden Beklenen Sonuca ve Boundary Testine](./04-requirements-boundaries-and-expected-results.md)

## Neden?
Her karar önce değerlerden ve expression'lardan oluşur. `const` ile `let` değişken bağlama kurallarıdır; bir iş kuralının doğru uygulanmasını tek başına sağlamaz.

## Temel kavramlar
**Primitive değerler:** `number`, `string`, `boolean`, `null`, `undefined`, `bigint`, `symbol`. İlk günlük örneklerde number/string/boolean ile başlanır. **Expression** değer üretir: `price - 20`, `age >= 18`. **Assignment** mevcut `let` bağının değerini günceller.

```ts
const price = 100;              // tekrar atanamaz binding
let discount = 20;              // yeniden atanabilir binding
discount = 25;
const finalPrice = price - discount;
console.log(finalPrice);        // 75
```

## Karar akışı
```ts
const score = 60;
let status: string;
if (score >= 60) {
  status = "passed";
} else {
  status = "failed";
}
console.log(status); // passed
```
Önce `score >= 60` boolean üretir. Sonra yalnız uygun block çalışır. `60` tam sınırdır; `59` farklı branch'e gider. `if` bir statement'tır; `score >= 60` bir expression'dır.

## Yanılgı ve debugging
`=` atama, `===` karşılaştırma anlamına gelir. `const` binding'i korur; object property'sini immutable yapmaz: ayrıntı [05](../05-objects-arrays-references/README.md). `0` false gibi değerlendirilebilir ama sıfırın iş kuralına göre geçersiz olduğu anlamına gelmez: [08](../08-value-and-decision-mechanics/README.md).

**Tahmin et:** `score` sırasıyla 59, 60, 61 olduğunda çıktı ne olur? Neden? **Transfer fikri:** Eşiği değiştirip sınır testini yeniden düşün.

**Mülakat:** *What is the difference between const and let?* `const` binding'in tekrar atanmasını engeller; `let` yeniden atamaya izin verir. İkisi de block scope'a sahiptir.

Bu bölüm I1/I2 kaynaklarındaki dağınık değer/koşul önkoşulunu kavramsal olarak birleştirir; yeni competency kanıtı değildir.
