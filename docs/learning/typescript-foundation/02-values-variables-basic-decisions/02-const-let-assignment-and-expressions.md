# const, let, Assignment ve Expression

**Önkoşul:** [Bu bölümün zihinsel modeli](./README.md) · [Önceki](./01-primitive-values-and-types.md) · [Sonraki](./03-comparisons-if-else-branching.md)

## 1. Bu konu neden gerekli?
Kodun zamanla değişen state'ini okuyabilmek için değişken bağlamayı ve expression değerlendirmesini ayırmak gerekir.

## 2. Tanım
`const` yeniden atanamayan binding, `let` yeniden atanabilir binding kurar. `=` assignment, `+`, `-`, `*`, `/`, karşılaştırmalar ve function çağrıları expression oluşturabilir. Expression bir değer üretir; statement yürütme adımıdır.

## 3. Açıklamalı kod
```ts
const base = 120;
let discount = 20;
const firstTotal = base - discount;
discount = discount + 10;
const secondTotal = base - discount;
console.log(firstTotal);  // 100
console.log(secondTotal); // 90
```

## 4. Adım adım execution/data flow
Önce `base=120`, `discount=20` oluşur. `firstTotal` hesaplandığı anda 100 değerini alır. Sonraki assignment `discount` binding'ini 30 yapar; `firstTotal` geriye dönük güncellenmez. `secondTotal` artık 90'dır.

## 5. TypeScript ile ilişkisi
Type inference sayesinde `const base = 120` için annotation zorunlu değildir. `let discount` yeniden atanabilir olsa da TypeScript yanlış tür atamalarını type-check sırasında raporlayabilir.

## 6. Sınır davranışı ve karıştırılan ayrımlar
`const` bir object'in **iç alanlarının değişmeyeceğini** garanti etmez: [05 — mutation](../05-objects-arrays-references/README.md). `discount = discount + 10` değer günceller; gerçek iş kurallarında negatif fiyat kontrolü ayrıca tanımlanmalıdır.

## 7. Hata araştırma ve gerçek kullanım
Bir değer beklenmedik şekilde eski kaldığında debugger'da **assignment zamanı** ve hesaplamanın hangi satırda yapıldığını incele. Başka binding'in güncellenmesi daha önce hesaplanan primitive'leri değiştirmez.

## 8. Interview preparation
*Does const make data immutable?* It prevents rebinding the variable. It does not automatically freeze referenced objects.

## 9. Pekiştirme
`discount` 5'e güncellense `firstTotal` değişir mi? `base = 200` assignment'ı denense sorun hangi katmanda ortaya çıkar?

## 10. Tarih ve kanıt ayrımı
Kaynak kavramlar: [I1](../../../I1-execution-model.md), [I2](../../../I2-control-flow-functions-data-modeling.md). Öğretim örneği H0/uygulama başarısı sayılmaz.
