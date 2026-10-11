# Ders 4 — Primitive Values: Değer, Tür ve Runtime Davranışı

## 1. Neden bu konu önemli?

Bir uygulamanın ürün fiyatını hesapladığını düşünelim. Kullanıcıdan gelen fiyat ekranda `"100"` olarak görünüyor. Kodda da `100` sayısı kullanılıyor. İki ifade insan gözüyle aynı niceliği gösteriyor olabilir; JavaScript açısından **aynı değeri ve aynı türü** ifade etmezler.

```ts
const numericPrice = 100;
const textPrice = "100";

console.log(typeof numericPrice); // number
console.log(typeof textPrice);    // string
console.log(numericPrice + 20);   // 120
console.log(textPrice + 20);      // "10020"
```

Son satırdaki sonuç beklenmedik gelebilir. JavaScript, `+` işleminin operandlarından biri string olduğunda string birleştirme davranışı gösterebilir.

**Buradaki problem TypeScript'in derleme yapmaması değildir.** Program çalışma anında, aldığı gerçek değerlerin türüne göre işlem yapmaktadır.

## 2. Primitive değer nedir?

**Value (değer)** programın taşıdığı somut veridir: `100`, `"Ali"`, `true` gibi.

**Type (tür)** o değerin hangi JavaScript veri kategorisine ait olduğunu belirtir: `number`, `string`, `boolean` gibi.

JavaScript'in primitive türleri:

| Primitive tür | Örnek değer | Günlük kullanım |
| --- | --- | --- |
| `number` | `100`, `-5`, `0.5` | Fiyat, skor, süre |
| `string` | `"Ali"`, `"100"`, `""` | İsim, mesaj, ham form girdisi |
| `boolean` | `true`, `false` | Aktif/pasif kararı |
| `undefined` | `undefined` | Atanmamış veya bulunamayan değer |
| `null` | `null` | Bilinçli boş değer |
| `bigint` | `9007199254740993n` | Belirli büyük tamsayı işlemleri |
| `symbol` | `Symbol("id")` | Benzersiz property anahtarları |

Başlangıçta en çok `number`, `string`, `boolean`, `undefined` ve `null` kullanılır. `bigint` ve `symbol` burada tanınması gereken türlerdir; şimdilik ayrıca kapsamlı kullanım gerektirmez.

Primitive bir nesne değildir. `{ name: "Ali" }` bir object, `["Ali", "Ece"]` ise bir array'dir. Array de JavaScript'in özel bir object türüdür.

## 3. Runtime değerinin türü: typeof

`typeof` JavaScript'te çalışma anında bir ifadenin türünü anlatan bir **string** üretir.

```ts
const age = 33;
const country = "Germany";
const employed = true;

console.log(typeof age);      // "number"
console.log(typeof country);  // "string"
console.log(typeof employed); // "boolean"
```

Execution sırası:

1. `age` bağlamına `33` number değeri verilir.
2. `typeof age` çalışma anında `"number"` string'ini üretir.
3. `console.log` bu string'i yazar.
4. Aynı işlem diğer iki değer üzerinde tekrarlanır.

Burada `typeof age` ifadesinin dönüş türü **string'dir**; incelenen `age` değişkeninin türü ise number'dır. Bu iki düzeyi karıştırma.

```ts
const actualType = typeof 42;
console.log(actualType);        // "number"
console.log(typeof actualType); // "string"
```

## 4. number ve string: Aynı görünüm, farklı işlem

```ts
const first = 10;
const second = "10";

console.log(first + 5);    // 15
console.log(second + 5);   // "105"
console.log(first * 5);    // 50
console.log(second * 5);   // 50
```

Burada iki ayrı davranış var:

- `+`: Operandlardan biri string olduğunda birleştirme yapabilir.
- `*`: Sayısal işlem için uygun string'i number'a dönüştürme yoluna gider.

Ancak bu dönüşümün varlığına güvenip dış girdiyi otomatik kabul etmek **güvenli bir veri sözleşmesi değildir**.

```ts
console.log(Number("10"));     // 10
console.log(Number(" 10 "));   // 10
console.log(Number(""));       // 0
console.log(Number("hello"));  // NaN
```

`Number()` açık dönüşüm isteğidir; ama tek başına "iş kuralına uygun geçerli sayı" anlamına gelmez.

Örneğin boş string'in sıfıra dönüşmesi, boş form alanının geçerli fiyat sayılmasını istemiyorsak bir sorundur.

## 5. NaN ve Infinity: number olmak yeterli değil

`NaN`, **Not-a-Number** kavramını ifade eden özel sayısal değerdir. İsmi tersini düşündürse de JavaScript'te tipi `number`dır.

```ts
const parsed = Number("hello");

console.log(parsed);                   // NaN
console.log(typeof parsed);            // "number"
console.log(Number.isNaN(parsed));     // true
console.log(Number.isFinite(parsed));  // false
```

`Infinity` de number türündedir:

```ts
console.log(typeof Infinity);          // "number"
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isFinite(100));      // true
```

Gerçekçi kural: Ürün fiyatı sonlu bir sayı olmalıysa yalnız `typeof price === "number"` kontrolü **yetersizdir**.

```ts
function isUsablePrice(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

console.log(isUsablePrice(100));       // true
console.log(isUsablePrice(-1));        // false
console.log(isUsablePrice(NaN));       // false
console.log(isUsablePrice("100"));     // false
```

Bu fonksiyonun amacı türü dönüştürmek değil, belirtilmiş üç koşulu sağlayan runtime değere `true` demektir.

## 6. boolean: Bir durumun iki açık değeri

`boolean` türü yalnız `true` ve `false` değerlerini taşır.

```ts
const isActive = true;
const isLocked = false;

console.log(typeof isActive); // "boolean"
console.log(isActive);        // true
console.log(isLocked);        // false
```

**Boolean değer** ile **boolean bağlamda değerlendirilen başka türden değer** farklıdır. Örneğin `if (0)` condition'ı false olarak yorumlanır, fakat `0` değerinin türü boolean'a dönüşüp değişkeni boolean yapmaz.

```ts
const attempts = 0;

console.log(typeof attempts); // "number"

if (attempts) {
  console.log("At least one attempt");
} else {
  console.log("No attempts");
}
// No attempts
```

Koddaki amaç gerçekten `attempts > 0` ise bu niyeti açık ifade etmek daha okunaklıdır.

## 7. undefined ve null: İki farklı boşluk durumu

`undefined` bir değerin atanmadığı veya bir property'nin bulunamadığı durumda sık görülür. `null` ise genellikle uygulamanın bilerek kullandığı boş değerdir.

```ts
let nickname: string | undefined;
const selectedUser: string | null = null;

console.log(nickname);      // undefined
console.log(selectedUser);  // null
```

**Dikkat:** TypeScript, değişkenlerin okunmadan önce atanmasını izler; yukarıdaki `let nickname: string | undefined;` örneğinde okunan değer `undefined` olur. `null` için ise değeri açıkça atadık.

```ts
const user = { name: "Ali" };

console.log(user.name);       // "Ali"
console.log("email" in user); // false
```

Eksik bir property'nin `undefined` okuma davranışı ile `null` verilmiş bir property aynı şey değildir. TypeScript tip modeli property varlığını zorunlu ya da opsiyonel olarak tanımlayabilir.

### typeof null neden şaşırtıcı?

```ts
console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object"
```

`typeof null === "object"` JavaScript'in tarihsel davranışıdır. Bu sonuç `null` değerinin gerçek bir object olduğu veya property erişimini güvenle desteklediği anlamına **gelmez**.

```ts
function isPlainRecord(value: unknown): boolean {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value);
}
console.log(isPlainRecord(null)); // false
console.log(isPlainRecord({}));   // true
console.log(isPlainRecord([]));   // false
```

Bu kod primitive kavramını gerçek veri okuma problemleriyle bağlar: null ve array object benzeri tür sonucuna sahip olabilir; tek kontrol yeterli değildir.

## 8. Primitive değerler neden “immutable” denir?

Primitive değerler **yerinde değiştirilmez**. Değiştirilen şey çoğu zaman, bir değişken bağının hangi primitive değeri tuttuğudur.

```ts
let label = "open";
const original = label;

label = "closed";

console.log(label);    // "closed"
console.log(original); // "open"
```

Burada `"open"` string değeri değişmedi; `label` başka bir string değerini göstermeye başladı. `original` önceki değeri tutmaya devam eder.

Bunu object ile karıştırma:

```ts
const state = { label: "open" };
const alias = state;

alias.label = "closed";

console.log(state.label); // "closed"
```

Burada iki binding aynı object'i gösterir; değiştirdiğimiz şey object property'sidir. Primitive değer güncelleme ile object mutation farklı mekanizmalardır.

## 9. TypeScript type annotation runtime dönüşüm değildir

```ts
function increment(value: number): number {
  return value + 1;
}
console.log(increment(10)); // 11
```

`value: number` TypeScript'in statik beklentisini belirtir. Runtime'da dış kaynak `"10"` string'i verirse TypeScript annotation onu sayıya çevirmez.

JavaScript'in gerçek çalışma davranışını görmek için:

```js
// JavaScript örneği: TypeScript annotation burada yoktur.
function increment(value) {
  return value + 1;
}
console.log(increment("10")); // "101"
```

Bu yüzden TypeScript kullanmak değerlerin **gerçekte** doğru tipte geldiğini garanti etmez.

## 10. Debugging: Yanlış fiyat neden metin gibi birleşti?

Belirti: `"10020"` görüyoruz, beklenen `120`.

Sistematik araştırma:

1. **Expected:** Başlangıç fiyatı sayı 100; eklenen tutar sayı 20.
2. **Actual:** `"10020"` string sonucu.
3. **Hypothesis:** İlk operand number değil string olabilir.
4. **Observation:** `typeof price` sonucunu kontrol et.
5. **Root cause:** Program ham form değerini dönüşüm/validation yapmadan topluyor.
6. **Fix decision:** Sözleşmeye göre ya string reddedilir ya kontrollü sayısal dönüşüm uygulanır.
7. **Regression:** `"100"`, `""`, `"hello"`, `0`, `-1` durumları ayrı beklenenlerle denenir.

Yanlış hızlı çözüm: Sonucu yalnız `Number(result)` ile çevirmek. Bu, yanlış işlem zincirini gizleyebilir; kaynak değer ve iş kuralı önce netleşmelidir.

## 11. Mülakat hazırlığı

**Question: What is the difference between a primitive value and an object in JavaScript?**

> A primitive value is an immutable value such as a number, string or boolean. Objects have reference identity and properties. Assigning a primitive copies its value, while assigning an object reference can make two variables refer to the same object.

**Türkçe:** Primitive değerler yerinde değişmez. Object'ler ise referans kimliği ve property taşır; aynı object farklı değişkenlerden gözlemlenebilir.

**Question: Is typeof enough to validate a number?**

> No. A value can have type number and still be NaN or Infinity. Business rules may also require a non-negative or bounded value.

## 12. Pekiştirme ve cevap anahtarı

Önce sonuçları kendin tahmin et:

1. `typeof "50"` ve `typeof 50` nedir?
2. `"50" + 5` sonucu neden `"505"` olabilir?
3. `Number("")` neden güvenli bir fiyat doğrulaması değildir?
4. `typeof NaN` ne döndürür?
5. `typeof null` ne döndürür ve neden bu yanıltıcı olabilir?
6. `let a = "X"; const b = a; a = "Y";` sonrası `b` nedir?
7. `isUsablePrice(0)` ile `isUsablePrice(-1)` arasında ne fark var?

<details><summary>Kontrol cevapları</summary>

1. `"string"` ve `"number"`.
2. `+` string operand gördüğünde birleştirme yapabilir.
3. Boş string 0'a dönebilir; iş kuralında boş fiyatı kabul etmek istemeyebiliriz.
4. `"number"`.
5. `"object"`; null gerçek, erişilebilir bir object değildir.
6. `"X"`; b eski primitive değeri tutar.
7. 0 geçerli, -1 negatif olduğu için geçersizdir.

</details>
