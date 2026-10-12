# Ders 2 — Functions as Values: Reference, Invocation ve Return

## 1. Neden öğreniyoruz?

JavaScript'te bir fonksiyon yalnızca çalıştırılacak satırlar değildir: **bir değerdir**. Sayıyı değişkende tutabildiğimiz gibi fonksiyonu da tutabiliriz. Böylece aynı davranışı farklı isimlerle çağırabilir veya onu başka bir fonksiyona gönderebiliriz.

Bu bölümdeki en önemli ayrım: **`double` fonksiyon değeridir; `double(5)` ise bir fonksiyon çağrısıdır.**

## 2. Basit zihinsel model

```ts
const age = 30;           // Bir number değerini saklar.
const label = "ready";    // Bir string değerini saklar.

function double(n: number): number {
  return n * 2;
}

const operation = double; // Bir function değerini saklar.
```

Burada yeni bir `double` kopyası oluşturulmaz. `operation` ve `double` aynı fonksiyon değerini gösterir.

```ts
console.log(operation === double); // true
console.log(typeof operation);     // "function"
console.log(operation(5));         // 10
console.log(double(5));            // 10
```

`operation` JavaScript'in özel sözcüğü değildir; değişkene verdiğimiz sıradan bir isimdir. `const action = double;` da aynı mantıkla çalışır.

## 3. Reference ile invocation'ı ayırmak

```ts
function double(n: number): number {
  console.log("Fonksiyon çalıştı");
  return n * 2;
}

const operation = double;
const result = operation(5);
```

İşlem sırası:

1. `double` tanımlanır. Henüz konsola bir şey basılmaz.
2. `operation = double` ile **fonksiyonun kendisi** saklanır. Hâlâ çağrı yoktur.
3. `operation(5)` fonksiyonu çağırır; `n = 5` olur.
4. Konsola `Fonksiyon çalıştı` basılır.
5. Fonksiyon `10` döndürür; `result = 10` olur.

Son durumda:

| İfade | Runtime değeri | Çağrılabilir mi? |
| --- | --- | --- |
| `double` | Fonksiyon | Evet: `double(5)` |
| `operation` | Aynı fonksiyon | Evet: `operation(5)` |
| `result` | 10 sayısı | Hayır: `result(5)` geçersiz |
| `double(5)` | Çağrı ifadesinin sonucu: 10 | Sonuç bir sayı |

`const result = operation(5)` kendi başına `10` sayısını terminale yazmaz. Bunu görmek için ayrıca `console.log(result)` gerekir. `return` ile `console.log` aynı iş değildir.

## 4. Neden `f` ile `f()` aynı değil?

Parantezlerle birlikte yazılan `f(...)` çağrı yapar. Parantez olmadan `f` ise fonksiyonun kendisine erişir.

```ts
function getTen(): number {
  return 10;
}

const savedFunction = getTen;   // function değeri
const savedResult = getTen();  // number: 10

console.log(savedFunction());  // 10
console.log(savedResult);      // 10
// savedResult();               // TypeScript: sayı çağrılamaz
```

`()`, “ileride çağırmak üzere kaydetme” işaretçisi değil, **şimdi çağrı yapma** sözdizimidir. Fonksiyon parametre bekliyorsa örneğin `double(5)` yazmamız gerekir; `double()`, TypeScript'te eksik argument hatası verir.

## 5. Çağrı ifadesi ne zaman değerlendirilir?

Fonksiyona argument olarak başka bir **çağrı** yazıldığında önce içerideki çağrı değerlendirilir:

```ts
function triple(n: number): number {
  console.log("triple çalıştı");
  return n * 3;
}

function printNumber(n: number): void {
  console.log(n);
}

printNumber(triple(4));
```

Beklenen çıktı:

```text
triple çalıştı
12
```

Çünkü `printNumber` gövdesine geçilmeden, `triple(4)` çağrı ifadesi değerlendirilip `12` argument'ı elde edilir.

Fakat `const selected = triple;` satırında `triple` çalıştırılmaz. **Bir işin seçilmesi ile işin gerçekleştirilmesi ayrı anlardır.**

## 6. Fonksiyon göndermek ile sonuç göndermek

```ts
type Operation = (n: number) => number;

function apply(n: number, action: Operation): number {
  return action(n);
}

function triple(n: number): number {
  return n * 3;
}

console.log(apply(4, triple)); // 12
```

Çağrıdaki `triple` fonksiyon olarak gönderilir. `apply` içinde parametrenin adı `action` olmuştur; `action(n)` çağrısı aslında `triple(4)`'ü yürütür.

**Yanlış kullanım:**

```ts
// apply(4, triple(4));
// triple(4) önce 12 sayısını üretir.
// apply ikinci argument olarak fonksiyon beklediği için TypeScript bunu reddeder.
```

Burada `triple` fonksiyonuna “ulaşamama” sorunu yoktur; tersine, fonksiyon **gereğinden erken çalıştırılmıştır**.

## 7. İşe yaradığı yer

Bir hesaplama işinin seçimini, o işi kimin ve ne zaman çalıştıracağından ayırabiliriz:

```ts
function addFive(n: number): number {
  return n + 5;
}

const selectedOperation = addFive;
// Başka bir satırda ve başka bir fonksiyon içinde:
console.log(selectedOperation(10)); // 15
```

Böylece bir sistemi tekrar yazmadan farklı davranışlar verebiliriz. Bir sonraki adım, bu fonksiyonu callback olarak dışarıdan alan yapıyı anlamaktır.

## 8. Debugging

- `TypeError: action is not a function`: `action` runtime'da gerçekten fonksiyon mu, yoksa fonksiyon sonucunun sayısı mı?
- `TS2345` veya benzeri tip hatası: Gönderilen değer beklenen function type ile uyuşuyor mu?
- “Değişkene atadım ama çalışmadı”: Atama ile invocation ayrı şeylerdir.
- “Return 10 ama terminal boş”: `return`, `console.log` değildir.

Önce `typeof action` ve caller'da kullanılan `action` / `action(...)` biçimini incele; hatalı davranışı tek değişken üzerinde yeniden üret.

## 9. Mülakat hazırlığı

**Question: What does it mean that functions are first-class values in JavaScript?**

> Functions can be stored in variables, passed as arguments, and used as values. Referring to a function does not call it. An invocation such as f(5) executes it and produces its return value.

**Türkçe:** Fonksiyonlar da JavaScript değeridir; değişkende tutulabilir ve argument olarak verilebilir. Fonksiyon referansı çağrı değildir; `f(5)` gerçekten çalıştırır.

## 10. Pekiştirme

1. `const a = triple; const b = triple(4);` için `a` ve `b`'nin tiplerini açıkla.
2. `a(2)` çağrılabilir mi? `b(2)` neden çağrılamaz?
3. Fonksiyonun içinde `console.log` varsa sadece değişkene atanırken bu log çalışır mı?
4. `apply(4, triple)` ile `apply(4, triple(4))` arasındaki fark nedir?
5. `const check = selectedOperation;` satırı yeni fonksiyon mu yaratır, mevcut değeri mi tutar?

**Kontrol:** (1) `a` fonksiyon, `b` number (12). (2) `a(2)` sonucu 6; sayı çağrılamaz. (3) Hayır. (4) Birinde referans verilir, diğerinde 12 sayısı. (5) Mevcut fonksiyon referansı.
