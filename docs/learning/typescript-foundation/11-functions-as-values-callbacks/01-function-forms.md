# Ders 1 — Function Declaration, Expression ve Arrow Function

## 1. Neden öğreniyoruz?

TypeScript kodunda aynı davranışı üç farklı biçimde görebiliriz. Bu biçimleri tanımak, özellikle fonksiyonların başka değişkenlere ve callback parametrelerine aktarıldığı kodu okurken önemlidir. **Fonksiyonu tanımlamak**, **fonksiyonu çağırmak** ve **fonksiyonun sonucunu saklamak** farklı işlemlerdir.

## 2. Üç temel yazım biçimi

### Function declaration

```ts
function double(value: number): number {
  return value * 2;
}
```

`function double(...)` bir fonksiyon tanımlar; gövde o anda `value * 2` işlemini yapmaz. Fonksiyonun adı `double`, parametresi `value`, dönüş tipi `number`'dır.

### Function expression

```ts
const doubleExpression = function (value: number): number {
  return value * 2;
};
```

`function (value: number) { ... }` bir **function expression**'dır; ürettiği fonksiyon değeri `doubleExpression` değişkenine atanır. **Dönen sayı atanmaz; fonksiyonun kendisi atanır.**

### Arrow function

```ts
const doubleArrow = (value: number): number => {
  return value * 2;
};
```

Arrow function da bir **function expression** biçimidir. `=>` burada fonksiyon sözdiziminin parçasıdır; tek başına fonksiyonu çağırmaz.

Üç biçim de aynı davranışı gerçekleştirebilir:

```ts
console.log(double(5));           // 10
console.log(doubleExpression(5)); // 10
console.log(doubleArrow(5));      // 10
```

| Biçim | Tanımlama örneği | Nasıl çağrılır? |
| --- | --- | --- |
| Declaration | `function double(x: number) { ... }` | `double(5)` |
| Function expression | `const f = function (x: number) { ... };` | `f(5)` |
| Arrow expression | `const f = (x: number) => { ... };` | `f(5)` |

## 3. Kısa arrow yazımı ve `return`

Tek bir ifade varsa blok süslü parantezleri olmadan sonucu otomatik döndürebiliriz:

```ts
const addFive = (value: number): number => value + 5;
console.log(addFive(10)); // 15
```

Ancak blok açarsak `return` açıkça yazılmalıdır:

```ts
const correct = (value: number): number => {
  return value + 5;
};

// HATALI: number döndürme sözleşmesi var, ama return yok.
// const wrong = (value: number): number => {
//   value + 5;
// };
```

**Önemli:** `console.log(value + 5)` de `return` değildir. Konsola yazmak bir yan etkidir; sonuç döndürmek ise çağıran kodun kullanabileceği bir değer üretir.

## 4. Çalışma sırası: tanım ≠ çağrı

```ts
function greet(): void {
  console.log("Merhaba");
}

console.log("Başlangıç");
greet();
console.log("Bitiş");
```

Çıktı:

```text
Başlangıç
Merhaba
Bitiş
```

JavaScript fonksiyonun gövdesine `greet()` çağrısında girer. Tanımı görmesi, `console.log("Merhaba")` satırını hemen yürüttüğü anlamına gelmez.

Aynı fikir expression için de geçerlidir:

```ts
const greetAgain = function (): void {
  console.log("Tekrar merhaba");
};
// Henüz bir log oluşmaz.
greetAgain(); // Tekrar merhaba
```

**Sınır:** Declaration ve `const` içindeki expression'ların çağrıdan önce erişilebilirliği farklı olabilir. Bu davranışın ayrıntılı hoisting modeli bu dersin amacı değildir; günlük kodda `const` ile oluşturulan fonksiyonu tanımlama satırından sonra kullan.

## 5. Gerçekçi örnek — İşlem kuralını üç biçimde yazmak

```ts
function addServiceFee(price: number): number {
  return price + 10;
}

const subtractDiscount = function (price: number): number {
  return price - 5;
};

const multiplyQuantity = (price: number): number => price * 2;

console.log(addServiceFee(20));    // 30
console.log(subtractDiscount(20)); // 15
console.log(multiplyQuantity(20)); // 40
```

Üçünde de parameter `price` çağrı sırasında değer alır. İş kuralları farklıdır; declaration/expression/arrow ayrımı **hesaplamanın iş anlamını** belirlemez.

## 6. Yaygın karışıklıklar ve debugging

| Belirti / yanlış varsayım | Gerçek neden | Kontrol |
| --- | --- | --- |
| Fonksiyon tanımlandı, ekrana bir şey yazılmadı | Gövde henüz çağrılmadı | `f()` çağrısı nerede? |
| Arrow function `undefined` döndürüyor | Blok içinde `return` eksik olabilir | Süslü parantez ve `return` var mı? |
| `const f = double;` sayı tutuyor sanılıyor | Bu satır fonksiyon referansını tutar | `typeof f` sonucunu incele |
| `const x = double(5);` fonksiyon tutuyor sanılıyor | Fonksiyon çağrılmış ve sonucunu üretmiştir | `typeof x` değerine bak |
| Return yerine console yazılmış | Output ile return karışmış | Caller sonucu kullanabiliyor mu? |

Hata araştırırken: **tanım → çağrı yeri → argüman → parametre → return → caller** zincirini izle.

## 7. Mülakat hazırlığı

**Question: What is the difference between a function declaration and a function expression?**

> A function declaration defines a named function statement. A function expression creates a function value that can be assigned to a variable or passed to another function. Both can be called. Arrow functions are a concise expression syntax, but their runtime behavior is not identical in every situation.

**Türkçe:** Declaration, fonksiyon tanımlayan bir bildirimdir. Expression ise bir değer olarak kullanılabilen fonksiyon üretir. Arrow, expression'ın kısa biçimidir. `this` gibi daha ileri farklar ilgili object model bölümünde ayrıca ele alınır.

## 8. Pekiştirme

1. `const f = function (n: number) { return n * 2; };` tanım mı, expression mı?
2. `const g = (n: number) => n * 2;` ile bloklu yazım arasında `return` açısından ne fark var?
3. Sadece `function print() { console.log("X"); }` yazılırsa niçin `X` basılmaz?
4. `const total = addServiceFee(20);` sonrasında `total` bir fonksiyon mu, sayı mı?
5. Aynı `subtractDiscount` davranışını declaration ve arrow biçimleriyle ayrı ayrı yaz.

**Kontrol:** (1) Function expression. (2) Tek ifadeli kısa yazım sonucu döndürür; blokta açık `return` gerekir. (3) Fonksiyon çağrılmadı. (4) Sayı: 30.
