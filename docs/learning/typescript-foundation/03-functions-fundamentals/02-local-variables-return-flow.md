# Local Variable, Return Value ve Execution Flow

**Önkoşul:** [Bölüm 02](../02-values-variables-basic-decisions/README.md) · [Bölüm dizini](./README.md) · [Önceki](./01-function-parameter-argument.md) · [Sonraki](./03-scope-shadowing-and-blocks.md)

## Neden ihtiyaç duyuyoruz?
`return`'ün yalnız sonuç yazmak değil ilgili function çağrısını bitirmek olduğunu bilmek hem testte hem debugging'de gereklidir.

## Tanım ve mekanizma
**Local variable** function body içinde kullanılan bağdır. **Return value** çağırana iletilen değerdir. Bir `return` yürütüldüğünde aynı çağrıdaki sonraki statement'lar çalışmaz.

## Açıklamalı örnek
```ts
function classify(score: number): string {
  const threshold = 60;
  if (score < threshold) {
    return "retry";
  }
  const label = "passed";
  return label;
}
console.log(classify(59)); // retry
console.log(classify(60)); // passed
```

## Input → processing → output / execution trace
59 çağrısında `threshold=60`, condition true ve ilk `return` ile function sonlanır; `label` üretilmez. 60 çağrısında if geçilmez; `label='passed'` oluşturulup döndürülür.

## TypeScript ile ilişki
Return type `string` bütün ulaşılabilir normal yolların string üretmesini bekler. `return`'ün kendi başına her durumda doğru branch seçtiğini garanti etmez.

## Sınır davranışları ve kritik ayrımlar
Bir branch'de `return` unutulursa fonksiyon beklenmedik `undefined` döndürebilir. `console.log()` çağırana değer return etmek değildir. `void` dönüş tipi bilinçli şekilde sonuç kullanılmadığında yaygındır.

## Debugging ve gerçek kodu okuma
Hatalı output veya beklenmeyen `undefined` için her branch'i kağıt üzerinde izle ve hangisinin return ile sonlandığını işaretle.

## Mülakat hazırlığı
*Does return just send data?* It returns a value (if given) and ends execution of the current function invocation.

## Kendi kendine pekiştirme
`classify(0)`, `classify(60)` ve `classify(61)` hangi satırlara ulaşır?

**Kapsam:** Bu bölümde **callback, higher-order function ve closure yoktur**. Bunlar daha sonraki Foundation öğrenme bölümlerine aittir.

**Kaynak/kanıt:** [I1](../../../I1-execution-model.md) ve [I2](../../../I2-control-flow-functions-data-modeling.md) içindeki kavramlar yeniden öğretilmiştir; bir öğrencinin H0 performansı hakkında yeni iddia oluşturmaz.
