# I2 — Control Flow, Functions & Data Modeling

Bu doküman TypeScript Engineering Foundation projesinin I2 çalışmasında kullanılan temel kavramları, gerçek repo örneklerini ve test yaklaşımını özetler.

I1'de source → typecheck → JavaScript → runtime → output zinciri ve küçük function davranışı ele alınmıştı. I2 bunun üzerine çok kayıtlı veri işleme, array/object modeli, reference/mutation ve test tasarımını ekler.

---

## 1. Function veri akışı

Bir function'ı okurken dört temel noktayı ayırmak gerekir:

```text
argument → parameter → function body → return value
```

Örnek:

```ts
function addTax(price: number): number {
  const result = price + 20;
  return result;
}

const finalPrice = addTax(100);
```

Burada:

- `price` → parameter,
- `100` → argument,
- `result` → function içindeki local variable,
- `120` → return edilen değer,
- `finalPrice` → çağrı sonucunu alan değişken.

`return` yalnız bir değer üretmez. Çalıştığı anda ilgili function çağrısını da sonlandırır.

---

## 2. Scope

Scope, bir değişkenin kodun hangi bölümünden erişilebilir olduğunu belirler.

### Function scope / local değer

```ts
function calculate(): number {
  const result = 10;
  return result;
}
```

`result`, function dışından doğrudan kullanılamaz.

### Block scope

`let` ve `const`, `{ ... }` block'larına göre scope oluşturur.

```ts
const score = 50;

if (true) {
  const score = 80;
  console.log(score); // 80
}

console.log(score); // 50
```

İki `score` aynı isimde olsa da farklı scope'lardadır.

---

## 3. Array ve object aynı şey değildir

I2'nin en önemli ayrımlarından biri şudur:

```text
Array = kayıtları taşıyan collection/container
Object = collection içindeki tek kayıt/model
```

Örnek:

```ts
const users = [
  { name: "Ali", score: 80, active: true },
  { name: "Ece", score: 45, active: true }
];
```

Burada:

- `users` bir array,
- `{ name: "Ali", ... }` bir object,
- `{ name: "Ece", ... }` başka bir object'tir.

JavaScript açısından array'ler de object türünün özel bir formudur; ancak veri modelini anlamak için burada **array container** ile **element object** ayrımı yapılır.

---

## 4. `type` ile object shape modelleme

Repo'daki `User` modeli:

```ts
export type User = {
  name: string;
  score: number;
  active: boolean;
};
```

Bu tanım TypeScript'e bir `User` değerinin beklenen shape'ini söyler.

Örneğin:

```ts
const user: User = {
  name: "Ali",
  score: 80,
  active: true
};
```

`User[]` ise elementleri `User` olan bir array'i ifade eder:

```ts
const users: User[] = [
  { name: "Ali", score: 80, active: true }
];
```

Önemli sınır:

> TypeScript `type` tanımı runtime validation değildir.

Bu Increment yalnız compile-time modellemeyi kullanır; dış girdinin runtime validation konusu sonraki kapsamlara bırakılır.

---

## 5. `for...of` ile array üzerinde ilerleme

I2'de önce imperative çözüm kullanıldı:

```ts
for (const user of users) {
  // her iteration'da user array içindeki bir kaydı temsil eder
}
```

Örnek sıra:

```text
users[0] → Ali
users[1] → Ece
users[2] → Can
users[3] → Zeynep
```

Loop body her element için tekrar çalışır; ancak `return` function'ı erken bitirirse sonraki iteration'lara geçilemez.

---

## 6. Birden fazla koşul

Repo'daki `getQualifiedUsers` davranışında iki koşul birlikte gereklidir:

```ts
if (user.active && user.score >= 60) {
  // kullanıcı seçilir
}
```

`&&` kullanıldığında iki tarafın da `true` olması gerekir.

Örnek karar tablosu:

| active | score | Sonuç |
| --- | ---: | --- |
| true | 80 | dahil |
| true | 60 | dahil |
| true | 59 | hariç |
| false | 90 | hariç |

`score === 60` exact boundary'dir ve `>= 60` nedeniyle dahil edilir.

---

## 7. `const` object'i immutable yapmaz

Şu değişken yeniden başka bir object'e atanamaz:

```ts
const user = {
  name: "Ali",
  active: true
};
```

Ancak object'in property değeri değiştirilebilir:

```ts
user.active = false;
```

Yani `const`, variable binding'in yeniden atanmasını engeller; object'in bütün içeriğini otomatik olarak immutable yapmaz.

---

## 8. Reference nedir?

Object değerleriyle çalışırken değişkenlerin aynı object'i paylaşabilmesi kritik bir davranıştır.

```ts
const ali = {
  name: "Ali",
  score: 80
};

const secondUser = ali;
```

Burada iki ayrı kullanıcı object'i üretilmedi.

```text
ali -----------┐
               ├──► Object A
secondUser ----┘
```

Bu nedenle:

```ts
secondUser.score = 10;
```

sonrasında:

```ts
console.log(ali.score); // 10
```

olur.

İki değişken aynı object reference'ını paylaşır.

---

## 9. Yeni array oluşturmak yeni element object'leri oluşturmaz

Aşağıdaki kod yeni bir array oluşturur:

```ts
const qualifiedUsers: User[] = [];
```

Ancak şu işlem mevcut `user` object'ini array'e ekler:

```ts
qualifiedUsers.push(user);
```

Bellek modelini basitleştirirsek:

```text
users array ----------------------┐
  [0] ----------------------------┼──► User Object A
                                  │
qualifiedUsers array -------------┘
  [0] -------------------------------► aynı User Object A
```

Array'ler farklıdır fakat element object'i ortaktır.

Bu yüzden output'taki object mutate edilirse input da etkilenebilir.

---

## 10. Yeni element object'i üretmek

I2'de seçilen yaklaşım:

```ts
qualifiedUsers.push({
  name: user.name,
  score: user.score,
  active: user.active
});
```

Buradaki object literal `{ ... }` yeni bir object oluşturur.

```text
users[0] ----------► User Object A
result[0] ---------► User Object B
```

A ve B aynı property değerlerine sahip olabilir fakat aynı object değildir.

Bu nedenle:

```ts
result[0].score = 10;
```

input object'inin score değerini değiştirmez.

Not: Bu örnekte property'ler primitive olduğu için doğrudan yeni object üretmek yeterlidir. Nested object'lerde shallow/deep copy ayrı bir konudur ve bu Increment'in kapsamı değildir.

---

## 11. Mutation ve side effect

### Mutation

Mevcut bir object'in state'ini değiştirmek mutation'dır:

```ts
user.score = 10;
```

### Side effect

Bir function yalnız return value üretmek yerine kendi dışındaki gözlenebilir state'i değiştirirse side effect oluşabilir.

Örneğin function'a verilen object'i doğrudan değiştirmek caller tarafından gözlenebilir:

```ts
function deactivate(user: User): void {
  user.active = false;
}
```

Bu function input object'i mutate eder.

Mutation otomatik olarak "kötü" değildir. Önemli olan davranışın bilinçli olması ve function contract'ına uygun olmasıdır.

I2'de tasarlanan `getQualifiedUsers` ve `getAvailablePremiumProducts` davranışları input object'lerini değiştirmemeyi hedefledi.

---

## 12. Repo örneği — `getQualifiedUsers`

I2 sonunda kullanılan temel implementation:

```ts
export type User = {
  name: string;
  score: number;
  active: boolean;
};

export function getQualifiedUsers(users: User[]): User[] {
  const qualifiedUsers: User[] = [];

  for (const user of users) {
    if (user.active && user.score >= 60) {
      qualifiedUsers.push({
        name: user.name,
        score: user.score,
        active: user.active
      });
    }
  }

  return qualifiedUsers;
}
```

Akış:

```text
User[] input
   ↓
for...of
   ↓
active && score >= 60 ?
   ↓ yes
new User object oluştur
   ↓
output array'e push et
   ↓
loop tamamlanınca return
```

---

## 13. Test tasarımı: yalnız happy path yeterli değildir

Bir filtering function için yalnız tek normal örneği test etmek davranışı yeterince tanımlamaz.

I2 test sınıfları:

```text
normal positive case
exact boundary
boundary altı
ikinci condition false
empty input
input mutation kontrolü
array reference kontrolü
object reference kontrolü
multiple-record loop davranışı
```

Örnek boundary:

```ts
const users: User[] = [
  { name: "Ali", score: 60, active: true }
];

expect(getQualifiedUsers(users)).toEqual([
  { name: "Ali", score: 60, active: true }
]);
```

Boundary'nin hemen altı:

```ts
const users: User[] = [
  { name: "Ali", score: 59, active: true }
];

expect(getQualifiedUsers(users)).toEqual([]);
```

Bu iki test birlikte `>= 60` davranışını daha güçlü biçimde tanımlar.

---

## 14. `[]` ile `[{}]` aynı değildir

Test yazarken önemli bir veri yapısı ayrımı:

```ts
[]
```

0 element içeren array'dir.

```ts
[{}]
```

1 element içeren array'dir; element boş bir object'tir.

Bir kullanıcı tamamen exclude ediliyorsa expected result:

```ts
[]
```

olmalıdır.

---

## 15. `toEqual` ve `toBe`

Vitest/Jest tarzı assertion'larda bu iki matcher farklı sorulara cevap verir.

### `toEqual`

Value/structure eşitliğini kontrol eder:

```ts
expect(result).toEqual([
  { name: "Ali", score: 80, active: true }
]);
```

Burada object'lerin aynı reference olması gerekmez; aynı yapıya/değerlere sahip olmaları yeterlidir.

### `toBe`

Object ve array'lerde identity/reference kontrolü için kullanılabilir:

```ts
expect(result).not.toBe(users);
expect(result[0]).not.toBe(users[0]);
```

Bu assertions:

- output array'in input array ile aynı object olmadığını,
- output elementinin input elementiyle aynı object olmadığını

kontrol eder.

---

## 16. Mutation davranışını test etmek

Reference ayrımını yalnız matcher ile değil davranışla da doğrulayabiliriz:

```ts
const products: Product[] = [
  { name: "Nar", price: 110, inStock: true }
];

const result = getAvailablePremiumProducts(products);

result[0].price = 10;

expect(result[0].price).toBe(10);
expect(products[0].price).toBe(110);
```

Bu test output object'i değiştirildiğinde original input object'in etkilenmediğini gösterir.

---

## 17. Debugging — loop içindeki erken `return`

Kasıtlı bug:

```ts
for (const user of users) {
  if (user.active && user.score >= 60) {
    qualifiedUsers.push({
      name: user.name,
      score: user.score,
      active: user.active
    });
  }

  return qualifiedUsers;
}
```

Çok kayıtlı input:

```text
Ali     true   80
Ece     false  90
Can     true   70
Zeynep  true   40
```

Beklenen:

```text
Ali
Can
```

Actual:

```text
Ali
```

Execution:

```text
1. iteration → Ali
2. Ali condition'dan geçer
3. Ali output'a eklenir
4. return çalışır
5. function biter
6. Ece, Can ve Zeynep iteration'larına hiç geçilmez
```

Kök neden:

> `return` loop tamamlandıktan sonra değil, loop body içinde çalışmıştır.

Doğru yapı:

```ts
for (const user of users) {
  // processing
}

return qualifiedUsers;
```

---

## 18. Bağımsız transfer — `Product`

Öğrenilen model farklı bir domain'e aktarıldı:

```ts
export type Product = {
  name: string;
  price: number;
  inStock: boolean;
};
```

Gereksinim:

```text
inStock === true
AND
price >= 100
```

Selman `getAvailablePremiumProducts` implementation'ını ve testlerini task-specific hazır çözüm almadan tamamladı.

Bu transfer şu kavramların yalnız ezberlenmediğini, başka modele uygulanabildiğini gösterdi:

- type ile object modelleme,
- array input/output,
- for...of,
- birden fazla condition,
- exact boundary,
- yeni output array,
- yeni output object'leri,
- mutation avoidance,
- structural equality,
- reference identity.

---

## 19. Repo doğrulama komutları

TypeScript source kontrolü:

```bash
npm run typecheck
```

Vitest suite:

```bash
npm test
```

Tek test dosyası üzerinde çalışmak için:

```bash
npx vitest run tests/score.test.ts
```

I2 final doğrulamasında `npm run typecheck` ve `npm test` başarılı geçti.

---

## 20. I2 sonunda zihinsel kontrol listesi

Bir array/object function'ı okurken şu sırayla düşün:

```text
1. Input tipi nedir?
2. Output tipi nedir?
3. Loop hangi kayıtlar üzerinde ilerliyor?
4. Condition tam olarak hangi kayıtları seçiyor?
5. Boundary nerede?
6. Output yeni bir array mi?
7. Output elementleri yeni object mi, yoksa eski reference'lar mı?
8. Input mutate ediliyor mu?
9. return hangi noktada function'ı bitiriyor?
10. Testler normal + boundary + empty + mutation/reference davranışını kapsıyor mu?
```

I2'nin en kritik cümlesi:

> **Yeni bir array oluşturmak, içindeki object'lerin otomatik olarak yeni olduğu anlamına gelmez.**

Reference davranışı bilinçli tasarlanmalı ve gerektiğinde test ile doğrulanmalıdır.
