# Local Scope, Block Scope ve Shadowing

**Önkoşul:** [Bölüm 02](../02-values-variables-basic-decisions/README.md) · [Bölüm dizini](./README.md) · [Önceki](./02-local-variables-return-flow.md) · [Bölüm 04](../04-control-flow-iteration/README.md)

## Neden ihtiyaç duyuyoruz?
Aynı isimde iki değişken olduğunda kodun hangi bağa eriştiğini açıklamak gerekir. Scope hataları yanlış state okumaya sebep olur.

## Tanım ve mekanizma
**Scope** bir binding'in erişilebilir olduğu alandır. `let`/`const` block scope'a sahiptir. Function içindeki local binding doğrudan dışarıdan erişilemez; iç blokta aynı isimle ayrı binding tanımlanması **shadowing**'dir.

## Açıklamalı örnek
```ts
const score = 50;
function printScore(): void {
  const score = 80;
  if (score >= 60) {
    const message = "passed";
    console.log(message); // passed
  }
  console.log(score); // 80
}
printScore();
console.log(score); // 50
```

## Input → processing → output / execution trace
`printScore()` çağrısında function-local `score=80` dıştaki `score=50` binding'ini gölgeler. If block içindeki `message` yalnız o block'tan erişilir. Dıştaki `console.log(score)` 50 yazar.

## TypeScript ile ilişki
TypeScript erişilemeyen bir block-local değişkene başvuruyu derleme sırasında gösterebilir. Scope kuralı yalnız TypeScript özelliği değil JavaScript runtime davranışıdır.

## Sınır davranışları ve kritik ayrımlar
`if` içindeki `const message` if'in dışında doğrudan kullanılmaz. Shadowing yanlış olmasa da aynı isimlerin çok katmanda tekrar edilmesi kod okunabilirliğini düşürebilir.

## Debugging ve gerçek kodu okuma
Debug sırasında Watch panelinde hangi scope frame'de olduğunu kontrol et. Beklediğinden farklı değeri görüyorsan aynı isimli başka binding var mı araştır.

## Mülakat hazırlığı
*What is variable shadowing?* A nearer binding with the same name hides the outer binding in its scope.

## Kendi kendine pekiştirme
Bu örnekte üç `console.log` hangi sırada ne yazar? `message` if'in dışında kullanılabilir mi?

**Kapsam:** Bu bölümde **callback, higher-order function ve closure yoktur**. Bunlar daha sonraki Foundation öğrenme bölümlerine aittir.

**Kaynak/kanıt:** [I1](../../../I1-execution-model.md) ve [I2](../../../I2-control-flow-functions-data-modeling.md) içindeki kavramlar yeniden öğretilmiştir; bir öğrencinin H0 performansı hakkında yeni iddia oluşturmaz.
