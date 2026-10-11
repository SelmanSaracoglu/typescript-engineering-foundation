# Ders 5 — const, let, Assignment, Expression ve Değer Akışı

## 1. Bu mekanizmaya neden ihtiyaç duyuyoruz?

Kodda bir değerin neden eski kaldığını, bir başka değerin neden değiştiğini anlamak için **değişkeni** ve **değişkenin tuttuğu değeri** ayırmak gerekir.

Örneğin alışverişte önce 20, daha sonra 30 birim indirim uygulandığını düşün:

```ts
const basePrice = 120;
let discount = 20;

const firstTotal = basePrice - discount;
discount = 30;
const secondTotal = basePrice - discount;

console.log(firstTotal);  // 100
console.log(secondTotal); // 90
```

`discount` değiştiği hâlde `firstTotal` neden 90 olmadı? Çünkü `firstTotal` bir hesaplama tanımı değil, o anda **hesaplanmış değeri tutan binding**'dir.

Bu küçük ayrım ileride function sonuçlarını okurken, testteki expected/actual farkını araştırırken ve state mutation hatalarında önemlidir.

## 2. Variable, binding, declaration ve initialization

**Variable / binding:** Programda bir değeri isimle kullanmamızı sağlayan bağdır. Değişken adı ve taşınan değer aynı kavram değildir.

**Declaration (bildirim):** `let total;` veya `const price = 100;` gibi bağın tanımlanmasıdır.

**Initialization (başlangıç ataması):** Binding'e ilk değerin verilmesidir.

**Assignment (yeniden atama):** Mevcut `let` binding'ine yeni değer verilmesidir.

```ts
let total: number; // declaration
total = 100;       // ilk değer ataması
total = 120;       // sonraki assignment
console.log(total); // 120
```

`const` ise başlangıçta değer ister:

```ts
const price = 100;
console.log(price); // 100
```

Bu nedenle `const price;` biçimi geçersizdir.

## 3. const ve let tam olarak neyi sınırlar?

| Özellik | `const` | `let` |
| --- | --- | --- |
| İlk değer | Gerekli | Daha sonra atanabilir |
| Binding'e tekrar atama | Yasak | İzinli |
| Block scope | Evet | Evet |
| Object'in property'lerini otomatik dondurma | Hayır | Hayır |

Örnek:

```ts
let quantity = 2;
quantity = 3;
console.log(quantity); // 3
```

Aynısını `const` üzerinde denemek hatalıdır:

```ts
const quantity = 2;
// quantity = 3; // TypeScript: Cannot assign to 'quantity'
```

Burada yanlışlıkla `let` yerine `const` kullanılmışsa **tip tanımını değiştirmek** değil, verinin gerçekten yeniden atanması gerekip gerekmediğini sorgulamak gerekir.

**Tercih yaklaşımı:** Değişkenin yeni bir değere bağlanması gerekmiyorsa `const`; gerçekten gerekiyorsa `let`.

## 4. Expression nedir, statement nedir?

**Expression:** Değerlendirildiğinde bir değer üretir.

Örnekler:
- `10 + 20` → 30
- `price * 2` → sayı
- `score >= 60` → boolean
- `calculate(100)` → fonksiyonun return değeri (varsa)

**Statement:** Programın yürütme yapısını kurar. `if`, `return`, değişken bildirimi ve block buna örnektir.

```ts
const price = 100;                // declaration statement
const isExpensive = price >= 80; // condition expression içerir

if (isExpensive) {
  console.log("high");
}
```

Adım adım:
1. `price` 100 olarak oluşturulur.
2. `price >= 80` değerlendirilir → `true`.
3. `isExpensive` bu boolean değeri tutar.
4. `if` condition'ı true olduğundan block yürütülür.
5. `"high"` yazılır.

`if` ifadesi programın karar akışını kurar; `price >= 80` ise yalnızca karar için kullanılacak değeri üretir.

## 5. Assignment ve karşılaştırmayı karıştırma

`=` atama yapar. `===` iki değeri strict equality kuralıyla karşılaştırır.

```ts
let attempts = 1;
attempts = 2;

console.log(attempts);      // 2
console.log(attempts === 2); // true
console.log(attempts === 1); // false
```

`attempts = 2` mevcut binding'e 2 verir; `attempts === 2` boolean üretir.

Başlangıçta en sık görülen hata, comparison niyetiyle assignment kullanmaktır. TypeScript bazı riskleri tip düzeyinde gösterebilir ama kodun niyetini tamamen bilemez.

```ts
let enabled = false;
if ((enabled = true)) {
  console.log("entered");
}
// entered
```

Bu örnek **kasıtlı anti-pattern**'dir. Koşul içinde `enabled = true` ataması yapılır; atama expression'ının değeri true olduğu için block çalışır. Karşılaştırma amaçlanıyorsa doğru operator'ı ve condition'ı kullanmak gerekir.

## 6. Hesaplama ne zaman güncellenir?

```ts
const base = 120;
let discount = 20;
const first = base - discount;
discount = 30;
const second = base - discount;

console.log(first);  // 100
console.log(second); // 90
```

Zaman çizelgesi:

| Adım | base | discount | first | second |
| --- | ---: | ---: | ---: | ---: |
| İlk iki satır | 120 | 20 | — | — |
| first hesaplandı | 120 | 20 | 100 | — |
| discount yeniden atandı | 120 | 30 | 100 | — |
| second hesaplandı | 120 | 30 | 100 | 90 |

`first` değişkeni bir spreadsheet formula'sı gibi “otomatik güncel kalacak hesaplama” değildir. Expression **çalıştırıldığı anda** hesaplanır.

Yeniden hesaplama isteniyorsa expression yeniden değerlendirilmelidir:

```ts
function afterDiscount(base: number, discount: number): number {
  return base - discount;
}

let currentDiscount = 20;
console.log(afterDiscount(120, currentDiscount)); // 100
currentDiscount = 30;
console.log(afterDiscount(120, currentDiscount)); // 90
```

Burada her function çağrısında ifade yeniden değerlendirilir.

## 7. Operator precedence ve parentheses

Aynı değerleri kullanan iki expression farklı sonuç verebilir.

```ts
console.log(100 - 20 * 2);   // 60
console.log((100 - 20) * 2); // 160
```

İlkinde çarpma çıkarma işleminden önce değerlendirilir. İkincisinde parentheses önce çıkarma işlemini belirtir.

Bu da iş kuralında kritik olabilir:

```ts
const basePrice = 100;
const fee = 20;
const quantity = 2;

const wrong = basePrice + fee * quantity;
const correct = (basePrice + fee) * quantity;

console.log(wrong);   // 140
console.log(correct); // 240
```

Buradaki “correct” yalnız **her ürün başına bir ücret eklenmesi** gereksinimi altında doğrudur. Eğer `fee` sipariş başına tek seferlik ücretse 140 doğru olabilir. **Operator precedence** sabittir; doğru formül iş gereksinimine bağlıdır.

## 8. Compound assignment ve increment

```ts
let counter = 0;
counter = counter + 1;
counter += 2;
counter++;

console.log(counter); // 4
```

İşlemler:

1. Counter 0.
2. `counter = counter + 1` → 1.
3. `counter += 2` → 3.
4. `counter++` → 4.

`counter += 2` çoğunlukla `counter = counter + 2` ile aynı amaçla kullanılır.

**Postfix/prefix farkı:**

```ts
let value = 5;
const beforeIncrement = value++;
console.log(beforeIncrement); // 5
console.log(value);           // 6

const afterIncrement = ++value;
console.log(afterIncrement);  // 7
console.log(value);           // 7
```

`value++` eski değeri expression sonucu olarak verir ve binding'i artırır; `++value` artırılmış değeri verir.

Bir testte farkın neden ortaya çıktığını anlamak için bu evaluation order önemlidir. Basit ve okunabilir kodda artırımı ayrı satıra koymak çoğu zaman daha açıktır.

## 9. Block scope: aynı isim, farklı bağ

`let` ve `const` block scope'a sahiptir.

```ts
const status = "outside";

if (true) {
  const status = "inside";
  console.log(status); // inside
}

console.log(status); // outside
```

İçteki `status` dıştakini değiştirmez; yeni bir local binding oluşturur. Bu davranışa **shadowing** denir.

Önemli bir sınır: `const` veya `let` binding'i kendi block'unda **başlangıç atamasından önce kullanmak** güvenli değildir. Buradaki konu değişkenin scope'u ve başlatılma zamanıdır; sadece tip eşleşmesi sorunu değildir.

## 10. const, object'i immutable yapmaz

```ts
const settings = { retries: 3 };

settings.retries = 5;
console.log(settings.retries); // 5
```

`settings` binding'i hâlâ aynı object'e işaret eder. Değişen şey `settings.retries` property'sidir.

Fakat şu kod yeniden atama yapmaya çalışır:

```ts
const settings = { retries: 3 };
// settings = { retries: 5 }; // const binding yeniden atanamaz
```

**Mutation (mevcut object'i değiştirme)** ve **rebinding (değişkene farklı değer atama)** farklı mekanizmalardır. Aynı object referansını paylaşan başka değişkenler property mutation'ını görebilir.

## 11. TypeScript inference: Her satıra annotation yazmalı mıyız?

```ts
const quantity = 2;
let discount = 20;

discount = 30; // geçerli
// discount = "30"; // type-check hatası
```

TypeScript çoğu durumda ilk değerden type inference yapabilir. Bu örnekte `discount` için number bekler.

`const` ile `let` farkı her zaman annotation zorunluluğu değildir. Bağın yeniden atanabilir olup olmadığı ve inferred type'ın kapsamı farklı sorulardır.

Ayrıca inference runtime validation değildir; dış input'un gerçek değerini kontrol etmeden business-safe ilan etmek hatalıdır.

## 12. Debugging: Üç tipik hata

**A. “İlk sonuç neden güncellenmedi?”**

- Expected: İndirim değişince tekrar hesaplanmış toplam.
- Actual: İlk toplam eski kaldı.
- Kontrol: `firstTotal` nerede ve ne zaman hesaplandı?
- Sebep: Daha önce hesaplanmış primitive sonuç otomatik güncellenmez.
- Çözüm: Değişen state'e göre expression'ı yeniden değerlendir.

**B. “Toplam neden 140 değil 240?”**

- Expected formülü iş kuralından yaz.
- Parentheses kullanıldığında ve kullanılmadığında evaluation order'ı incele.
- Tek değişiklikle formülü düzelt, iki ürün ve bir ürün durumlarını tekrar dene.

**C. “TypeScript neden const yeniden atamasını kabul etmiyor?”**

- Atama object property'sine mi, variable binding'ine mi?
- Gerçekten variable'ın yeni değere bağlanması gerekli mi?
- Gereksiz `let` kullanmadan doğru tasarımı seç.

## 13. Mülakat hazırlığı

**Question: What is the difference between const and let?**

> Both create block-scoped bindings. A let binding can be reassigned; a const binding cannot. Const does not automatically make a referenced object immutable.

**Question: What is the difference between an expression and an assignment?**

> An expression produces a value. Assignment writes a value to a binding or property; in JavaScript an assignment is itself an expression that evaluates to the assigned value.

## 14. Pekiştirme ve cevap anahtarı

1. `let n=5; const old=n; n=10;` → `old` kaç?
2. `100 - 20 * 2` ve `(100 - 20) * 2` kaç?
3. `const user={active:true}; user.active=false` geçerli mi?
4. `const user={active:true}; user={active:false}` neden hatalı?
5. `let count=1; const old=count++;` → `old`, `count`?
6. Koşulda `enabled = true` ile `enabled === true` farkı nedir?
7. `const amount=120; let discount=20; const total=amount-discount; discount=40` sonrası total kaçtır?

<details><summary>Kontrol cevapları</summary>

1. 5; primitive değer önce kopyalanmıştır.
2. 60 ve 160.
3. Evet, property mutation yapılabilir.
4. Const binding tekrar atanamaz.
5. old=1, count=2.
6. İlkinde atama ve truthy result, ikincisinde karşılaştırma var.
7. 100; total otomatik yeniden hesaplanmaz.

</details>
