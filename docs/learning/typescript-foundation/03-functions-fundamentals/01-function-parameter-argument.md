# Function, Parameter ve Argument

**Önkoşul:** [Bölüm 02](../02-values-variables-basic-decisions/README.md) · [Bölüm dizini](./README.md) · İlk ders · [Sonraki](./02-local-variables-return-flow.md)

## Neden ihtiyaç duyuyoruz?
Bir fonksiyonun input'unu izlemeden çıktısını doğru tahmin etmek mümkün değildir. Fonksiyon tanımı ile fonksiyon çağrısı farklı zamanlarda gerçekleşir.

## Tanım ve mekanizma
**Function** çağrılabilir davranış birimidir. **Parameter** tanım sırasında kullanılan yerel addır; **argument** çağrı sırasında ona verilen gerçek değerdir. TypeScript parameter ve return için tip beklentisi ekler.

## Açıklamalı örnek
```ts
function addTax(price: number): number {
  return price + 20;
}
const result = addTax(100);
console.log(result); // 120
```

## Input → processing → output / execution trace
İlk satırlar fonksiyonu tanımlar; `addTax(100)` çağrısı sırasında `100`, `price` parameter'ına bağlanır. Body `120` hesaplar, return ile sonucu caller'a iletir, `result=120` olur.

## TypeScript ile ilişki
`price: number` çağrı argümanının beklenen tipini bildirir. `: number` return tip sözleşmesidir. Runtime'da bu type annotation'lar kalmaz.

## Sınır davranışları ve kritik ayrımlar
`addTax(0)` 20 döndürür. Bu vergi modelinin doğru olup olmadığı ayrı business rule sorusudur. Bir fonksiyon tanımlandı diye body'nin çalıştığını varsayma.

## Debugging ve gerçek kodu okuma
Output beklenmedikse caller'daki argument, parameter'ın aldığı değer, return edilen expression ve kullanan satırı sırayla incele.

## Mülakat hazırlığı
*What is the difference between a parameter and an argument?* A parameter is the named input in a function definition; an argument is the value passed when calling it.

## Kendi kendine pekiştirme
`addTax(80)` sonucunu tahmin et; `price` dışarıda da 80 adlı değişken olmak zorunda mı?

**Kapsam:** Bu bölümde **callback, higher-order function ve closure yoktur**. Bunlar daha sonraki Foundation öğrenme bölümlerine aittir.

**Kaynak/kanıt:** [I1](../../../I1-execution-model.md) ve [I2](../../../I2-control-flow-functions-data-modeling.md) içindeki kavramlar yeniden öğretilmiştir; bir öğrencinin H0 performansı hakkında yeni iddia oluşturmaz.
