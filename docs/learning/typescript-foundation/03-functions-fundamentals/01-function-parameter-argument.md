# Ders 8 — Function, Parameter, Argument ve Çağrı Mekanizması

## 1. Neden öğreniyoruz?

Bir testte `calculateFinalPrice(100, true)` çağrısının hangi sonuç üreteceğini anlayabilmek için function **tanımı** ile function **çağrısını** ayırmalıyız. Function tanımlanırken kodu yazılmıştır; fakat gövdenin gerçekten yürütülmesi için çağrılması gerekir. Aynı function farklı argument değerleriyle farklı sonuç üretebilir.

## 2. Temel kavramlar

**Function declaration** tekrar kullanılabilir davranışı tarif eder. **Parameter** tanımda gelen değere verilen yerel isimdir. **Argument** çağrıda gerçekten gönderilen ifadedir. **Call expression** fonksiyonu yürütür ve onun `return` değerini üretir.

| Kod | Görev |
| --- | --- |
| `function addFee(...)` | Function tanımı |
| `price: number` | Parameter adı ve type beklentisi |
| `addFee(100)` | Çağrı ve argument |
| `return result` | Caller'a değer vermek ve çağrıyı bitirmek |
| `const final = ...` | Caller'ın sonucu kullanması |

Function'ın ismi bir davranışı anlatmalı; bir satır kodu sadece yeni function'a taşımak, doğru abstraction kurulduğunu garanti etmez.

## 3. Açıklamalı TypeScript örneği

```ts
function addFee(price: number, fee: number): number {
  const result = price + fee;
  return result;
}

const total = addFee(100, 20);
console.log(total); // 120

console.log(addFee(50, 10)); // 60
```

## 4. Execution flow — adım adım

1. `addFee` declaration değerlendirilip kullanılabilir olur; body bu noktada fiyat hesaplamaz.
2. `addFee(100,20)` çağrılır; soldan sağa argument'lar değerlendirilir.
3. Birinci argument `price=100`, ikinci `fee=20` parameter'larına bağlanır.
4. Yerel `result` 120 değerini alır.
5. `return result` o çağrıyı bitirir ve 120'yi caller'a verir.
6. `total` 120 olur; ardından terminale 120 yazılır.
7. İkinci çağrı **ayrı** parameter bağlarıyla çalışır ve 60 döndürür.

İlk çağrının `price=100` olması ikinci çağrıdaki `price=50` değerini etkilemez; her çağrıda kendi yürütme bağlamı vardır.

## 5. Farklı durumlarla derinleştirme

### Return value ile console.log farkı

```ts
function logTotal(price: number): void {
  console.log(price + 20);
}
function getTotal(price: number): number {
  return price + 20;
}
const a = logTotal(100); // 120 terminale yazılır
const b = getTotal(100);
console.log(a); // undefined
console.log(b); // 120
```

`void` işaretlemesi return değerinin kullanılmaması niyetini ifade eder. İlk fonksiyon log üretir ama caller'a fiyat değerini vermez. İkinci fonksiyonun return sonucu başka hesaplamada kullanılabilir. **Output ile return birbirinin yerine geçmez.**

### Aynı isim, farklı rol

```ts
const price = 90;
function discount(price: number): number {
  return price - 20;
}
console.log(discount(100)); // 80
console.log(price); // 90
```

Function parameter `price` içeride kendi local binding'idir. Dışarıdaki `price` bu çağrı nedeniyle değişmez.

## 6. TypeScript ile çalışma zamanı farkı

TypeScript'te `price: number`, `fee: number` ve dönüşteki `: number` statik sözleşmedir. Örneğin `addFee("100",20)` doğrudan TS kaynak kodunda tür hatası oluşturur; annotation runtime'da string'i sayıya dönüştürmez. Bir function'ın parametresi `number` olsa da kendi içindeki `+20` iş kuralının doğru olduğunu kanıtlamaz.

**Temel tasarım ayrımı:** Function'ın aldığı input, hesapladığı işlem, return sözleşmesi ve dış etkileri ayrı incelenir. Burada callback, higher-order function veya closure kullanılmıyor.

## 7. Sınır ve kritik ayrımlar

```ts
function timesTwo(n: number): number {
  return n * 2;
}
console.log(timesTwo(0));  // 0
console.log(timesTwo(-3)); // -6
```

- `0` geçerli `number` girdisidir; falsy olduğu için otomatik reddedilmez.
- Negatif number, type bakımından number'dır. İş kuralı izin vermiyorsa ayrıca şart gerekir.
- Çok argument bekleyen fonksiyona eksik argument verilmesi TypeScript kontrolünde saptanabilir; ancak JavaScript runtime başka yerden yanlış çağrı alabilir.
- `return` function'ı sonlandırır; sadece bir `if` bloğunu bitirmez.

## 8. Debugging — kanıttan düzeltmeye

**Belirti:** `addFee(50,10)` için 70 bekleniyor; actual 60.
1. Önce requirement'ı doğrula: ücret sabit 20 mi yoksa argument `fee` mi?
2. Caller'ın verdiği argument'ı (`10`) kontrol et.
3. Function parameter'ının gerçekten `fee=10` olduğunu izle.
4. `50 + 10` doğru hesaplandığı hâlde beklenti 70 ise sorun implementation'da değil, **yanlış expected/requirement** yorumunda olabilir.
5. Gereksinim `fee` argument'ından bağımsız sabit 20 ise signature ve testleri buna göre tutarlı düzenle.

Debugging'i kodu rastgele değiştirerek değil **argument → parameter → operation → return** zincirini izleyerek yap.

## 9. Mülakat hazırlığı ve bağımsız pekiştirme

**Question: What is the difference between a parameter and an argument?**

> A parameter is a named input in the function definition. An argument is the actual value or expression supplied when the function is called.

**Question: Does defining a function execute its body?**

> No. The body executes on invocation; the return value becomes the value of the call expression.

**Kontrol et:** (1) `addFee(0,20)` kaç döner? (2) İlk çağrıda verilen `100` ikinci çağrının sonucunu etkiler mi? (3) `console.log` neden return sayılmaz? (4) `fee` eksikse hangi hata katmanını önce incelersin?

<details><summary>Cevap kontrolü</summary>

1. 20. 2. Hayır, çağrı parametreleri ayrıdır. 3. Biri dış etki, diğeri caller'a verilen değerdir. 4. TypeScript çağrı kontrolü; runtime verisi ayrı sınırdır.

</details>

## 10. Rehberli örnek: iki argument yer değiştirse ne olur?

Şu fonksiyonun parametre adları, caller'ın istediği hesaplama sırasını anlamamıza yardım eder:

```ts
function remainingBudget(budget: number, spent: number): number {
  return budget - spent;
}
console.log(remainingBudget(120, 30)); // 90
console.log(remainingBudget(30, 120)); // -90
```

**Önce tahmin:** İki çağrıda da argument'lar number. Öyleyse TypeScript ikisini de kabul eder. Ama iş anlamları değişir.

| Çağrı | budget | spent | result |
| --- | ---: | ---: | ---: |
| `remainingBudget(120,30)` | 120 | 30 | 90 |
| `remainingBudget(30,120)` | 30 | 120 | -90 |

Bu bir type hatası değil **argument order** kaynaklı davranış hatası olabilir. Parametrelerin adları runtime'da “bu sayı bütçedir” diye doğrulama yapmaz.

### Function tanımından çağrı sonucuna ulaşma

```ts
function calculate(a: number, b: number): number {
  const subtotal = a * 2;
  return subtotal - b;
}
const output = calculate(10, 3);
console.log(output); // 17
```

1. `a` değeri 10, `b` değeri 3.
2. `subtotal` 20.
3. Return expression `20 - 3`.
4. Caller output bağını 17'ye atar.
5. Log 17 yazar.

### Test düşüncesi

`calculate(10,3)` için expected 17 ise, `calculate(3,10)` beklenen -4 olur. **Input sırasına duyarlılık** testinde yalnız aynı argument'ı iki yere yazmak yetersiz olabilir.

### Bağımsız aktarım

Yeni bir `subtractFee(balance, fee)` function'ı düşün. Girdi `(50, 20)` için beklenen 30, `(20,50)` için -30. Function'ın parametre/argument akışını açıklayıp hangi durumda business guard eklenmesi gerektiğini gerekçelendir.

<details><summary>Kontrol</summary>

Arithmetic sonucu number'dır; negatif sonuç type açısından mümkündür. Negatif bakiyenin yasak olup olmadığı ayrı iş kuralıdır.

</details>
