# Ders 3 — Function Types: Parametre ve Return Contract

## 1. Neden öğreniyoruz?

Bir değişkenin `number` mı, `string` mi tutacağını yazabiliyoruz. Peki bir değişkenin veya parametrenin **nasıl bir fonksiyon kabul edeceğini** nasıl ifade ederiz? TypeScript'in **function type** sözdizimi bunu tanımlar.

Şu soruya cevap arıyoruz: “Buraya gönderilebilecek fonksiyon hangi girdiyi kabul etmeli ve hangi sonucu üretmeli?”

## 2. Type alias olarak function contract

```ts
type NumberOperation = (value: number) => number;
```

Bu satır fonksiyon **oluşturmaz** ve çalıştırmaz. Bir tip tanımlar:

- `(value: number)`: Bir sayı parametresi alır.
- `=> number`: Sonuç bir sayı olmalıdır.
- `NumberOperation`: Bu sözleşmeye verdiğimiz isimdir.

Function type içindeki `=>`, arrow function'a benzer görünse de **tip konumundadır**: burada çalışma yapılmaz.

## 3. Sözleşmeye uyan örnekler

```ts
type NumberOperation = (value: number) => number;

function double(value: number): number {
  return value * 2;
}

const addFive: NumberOperation = (value) => value + 5;

const selected: NumberOperation = double;

console.log(addFive(10));  // 15
console.log(selected(10)); // 20
```

`addFive` içinde parametre tipi açıkça yazılmadı. TypeScript, `NumberOperation` nedeniyle `value`'nun `number` olması gerektiğini **bağlamdan çıkarabilir** (*contextual typing*).

Fonksiyonun adı (`double` / `addFive`) değil, parametre/dönüş sözleşmesine uyumu önemlidir.

## 4. Parametre ve return type'ı ayrı kontrol et

```ts
function isPositive(value: number): boolean {
  return value > 0;
}

function greet(name: string): string {
  return `Hello ${name}`;
}

// Aşağıdakiler sözleşmeye UYMAZ:
// const check: NumberOperation = isPositive; // boolean döndürüyor
// const wrong: NumberOperation = greet;       // string alıp string döndürüyor
```

| Fonksiyon | Parametre tipi | Dönüş tipi | `NumberOperation` ile |
| --- | --- | --- | --- |
| `double` | number | number | Uyumlu |
| `addFive` | number | number | Uyumlu |
| `isPositive` | number | boolean | Uyumsuz dönüş |
| `greet` | string | string | Parametre ve dönüş açısından uyumsuz |

Not: Fonksiyon tiplerinin uyumluluğunda isteğe bağlı parametreler, parametre sayıları ve daha ileri TypeScript kuralları da rol oynayabilir. Bu derste odak bir parametreli temel sözleşmedir.

## 5. Callback parametresinin tipi

```ts
type NumberOperation = (value: number) => number;

function execute(
  input: number,
  action: NumberOperation
): number {
  return action(input);
}

function triple(value: number): number {
  return value * 3;
}

console.log(execute(4, triple)); // 12
```

Burada iki düzeyde eşleşme var:

1. `execute` çağrısındaki ilk argument `4`, `input` parametresine gider.
2. İkinci argument `triple` fonksiyon değeri, `action` parametresine gider.
3. `action(input)` yazıldığında `triple(4)` çalışır.
4. Callback `12` döndürür ve `execute` da bu değeri döndürür.

`action: NumberOperation` yerine `action: (value: number) => number` da yazabilirdik. Tip alias, sözleşmeyi isimlendirdiği için tekrar kullanımı ve okumayı kolaylaştırır.

## 6. Inline arrow function ve contextual typing

```ts
console.log(execute(6, (x) => x * 3)); // 18
```

Buradaki `(x) => x * 3` bir **fonksiyon değeri** oluşturur. `execute`'e verildiğinde henüz çağrılmış olmaz.

`execute`, `action(input)` satırına ulaştığında `x = 6` olur. `x` ile dış fonksiyonun `input` parametresi ayrı yerel isimlerdir; aynı sayı değerini taşıyabilirler.

TypeScript, `action: NumberOperation` contract'ından `x` için number çıkarımını yapar.

## 7. TypeScript sözleşmesi çalışma zamanında ne yapmaz?

Function type **compile-time** denetimdir. TypeScript tipleri JavaScript'e çalıştırılabilir kontrol olarak taşınmaz.

```ts
type NumberOperation = (n: number) => number;

function apply(n: number, operation: NumberOperation): number {
  return operation(n);
}
```

Bu fonksiyon JavaScript çalışma anında aldığı `operation` değerinin gerçekten fonksiyon olduğuna dair otomatik runtime validation yapmaz. Dışarıdan doğrulanmamış bir değer gelirse ayrıca runtime kontrol gerekir; TypeScript tip annotation'ı değeri dönüştürmez.

**Fark:** Tip sözleşmesine uymak, hesaplamanın iş kurallarına uygun olduğunu garanti etmez. `(n) => n + 1000` da number alıp number döndürür, fakat belirli bir hesaplama gereksinimini karşılamayabilir.

## 8. Yaygın hata ve debugging

| Hata | Neyi kontrol edersin? |
| --- | --- |
| Yanlış dönüş tipi | Callback'in gerçekten ne döndürdüğünü; number yerine boolean/string üretip üretmediğini |
| Yanlış parametre tipi | Çağıran kodun hangi argument'ı verdiğini |
| Fonksiyon yerine hesap sonucu | `double` mı `double(5)` mi veriliyor? |
| Typecheck geçiyor ama sonuç yanlış | Tip uyumu davranışın doğruluğunu kanıtlamaz; beklenen iş kuralını test et |
| Bir parametre adı farklı | İsimler farklı olabilir; önemli olan tip ve çağrı sırasında eşleşmedir |

## 9. Mülakat hazırlığı

**Question: What is a function type in TypeScript?**

> A function type describes the parameters a function accepts and the type of value it returns. It allows TypeScript to check whether a function passed as a callback matches the expected contract. Type annotations do not validate values at runtime.

**Türkçe:** Function type, fonksiyonun kabul ettiği parametreleri ve dönüş tipini ifade eder. TypeScript callback uyumluluğunu kontrol edebilir; fakat runtime'da otomatik veri doğrulama yapmaz.

## 10. Pekiştirme

```ts
type NumberOperation = (value: number) => number;

const square: NumberOperation = (x) => x * x;
// const check: NumberOperation = (x) => x > 0; // Uyumsuz
```

1. `square` neden uygun?
2. `check` hangi sözleşme bölümüne uymaz?
3. `execute(5, (x) => x - 2)` çağrısının sonucu nedir?
4. `action` ile `x` aynı parametre midir?
5. TypeScript tip kontrolü geçince hesaplamanın doğru olduğunu söyleyebilir miyiz?

**Kontrol:** (1) Number alır ve number döndürür. (2) Boolean döndürür. (3) 3. (4) Hayır: action fonksiyon, x callback'in sayısal parametresi. (5) Hayır, ayrıca davranış testi gerekir.
