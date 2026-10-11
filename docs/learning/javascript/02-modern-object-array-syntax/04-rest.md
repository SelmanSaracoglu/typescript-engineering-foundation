# Ders 11 — Rest Syntax: Kalan Değerleri Toplamak

> **Öğrenme yolu:** [JavaScript dizini](../README.md) → [Bölüm 2](./README.md)  
> **Önkoşul:** Array/object destructuring, fonksiyon parametresi/argümanı, [Spread](./03-spread.md).  
> **Hedef:** Rest'in üç kullanım yerini ve Spread'den neden farklı olduğunu anlatmak; bilinmeyen sayıda argümanla doğru tipler kullanmak.

## 1. `...` aynıysa neden iki isim var?

Spread ve Rest ikisi de üç nokta `...` kullanır. Fakat görevleri birbirinin tersidir:

- **Spread:** Bir array veya object'teki mevcut değerleri başka bağlama **açar / yayar**.
- **Rest:** Destructuring veya fonksiyon parametresinde kullanılmamış değerleri **bir araya toplar**.

```ts
const values = [10, 20, 30];
const [first, ...remaining] = values;  // Rest: kalanları topluyor
const rebuilt = [first, ...remaining]; // Spread: elemanları açıyor
console.log(remaining); // [20, 30]
console.log(rebuilt);   // [10, 20, 30]
```

Bu örnekte `...remaining` iki yerde görünür; hangi yapının **solunda** veya **sağında** bulunduğuna göre anlamı değişir.

## 2. Array destructuring rest: Adım adım

```ts
const attempts = [1, 2, 3, 4];
const [firstAttempt, ...otherAttempts] = attempts;
```

1. İlk eleman `firstAttempt` değişkenine bağlanır.
2. Geri kalan elemanlar yeni bir array olan `otherAttempts` içinde toplanır.
3. Orijinal `attempts` değiştirilmez.

```ts
console.log(firstAttempt); // 1
console.log(otherAttempts); // [2, 3, 4]
console.log(otherAttempts === attempts); // false
```

İlk elemana ihtiyaç yoksa yalnız rest de yazabilirsin:

```ts
const values = ["A", "B"];
const [...all] = values;
console.log(all); // ["A", "B"]
```

Rest pattern'i **sonda** olmalıdır:

```ts
// Geçersiz:
// const [...others, last] = [1, 2, 3];
```

Çünkü kalan elemanları toplama işlemi için desenin geriye kalan bütün pozisyonlarını kapsar.

## 3. Object destructuring rest: Geriye kalan property'ler

```ts
const user = {
  id: 101,
  username: "Alex",
  role: "viewer",
  active: true
};

const { id, ...details } = user;
console.log(id);      // 101
console.log(details); // { username: "Alex", role: "viewer", active: true }
```

Object rest, kullanılan alanları dışarıda bırakıp kalan **own enumerable** property'leri yeni bir object'e toplar. Property sırası object destructuring'deki gibi isimle belirlenir. `details` yeni bir dış object'tir.

```ts
console.log(details === user); // false
```

Ancak **nested object** değerleri referanslarını paylaşabilir; rest, deep copy değildir:

```ts
const config = { secret: "hidden", settings: { theme: "dark" } };
const { secret, ...publicPart } = config;
publicPart.settings.theme = "light";
console.log(config.settings.theme); // light
```

### Güvenlik tuzağı: Rest güvenli whitelist değildir

```ts
const account = {
  id: 101,
  passwordHash: "hashed-value",
  internalNote: "review",
  email: "alex@example.test"
};
const { passwordHash, ...otherFields } = account;
```

Burada `otherFields`, **`internalNote` alanını da içerir**. `passwordHash` ayırmak, kalan her alanı dış dünyaya güvenle açabileceğin anlamına gelmez. Özellikle AppSec perspektifinde response/log üretirken izin verilen alanları **açıkça seçmek** gerekir:

```ts
const safePublicUser = { id: account.id, email: account.email };
```

Rest'in görevi *kalanları toplamak*, güvenlik doğrulaması veya alan izin listesi uygulamak değildir.

## 4. Fonksiyon parametresinde rest: Değişken sayıda argüman

```ts
function sum(...numbers: number[]): number {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
}

console.log(sum(10, 20));       // 30
console.log(sum(10, 20, 30));   // 60
console.log(sum());             // 0
```

`...numbers` bir **rest parameter**'dır: fonksiyon çağrısında verilen bütün argümanları `numbers` adlı gerçek bir array'de toplar. Parametre `number[]` ile tiplenmiştir; böylece string argüman verilmesi TypeScript tarafından reddedilir.

Fonksiyonda başka parametreler de varsa rest parameter en sonda bulunur:

```ts
function formatLog(level: "INFO" | "WARN", ...parts: string[]): string {
  return `[${level}] ${parts.join(" | ")}`;
}

console.log(formatLog("WARN", "auth", "retry", "limit"));
// [WARN] auth | retry | limit
```

Burada `level` ilk argümandır; geri kalan her argüman `parts` içine girer. Rest parameter **tek bir array parametresi geçmekle aynı çağrı biçimi değildir**: `formatLog("WARN", "a", "b")` geçerlidir; `formatLog("WARN", ["a", "b"])` bu tür tanımına uymaz.

## 5. Rest ve spread'i aynı fonksiyonda görmek

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

const scores = [10, 20, 30];
const result = sum(...scores);
console.log(result); // 60
```

**Çağrı yeri** `sum(...scores)` → `scores` array'inin elemanlarını ayrı argümanlara **yay**. **Fonksiyon tanımı** `(...numbers: number[])` → argümanları `numbers` array'inde **topla**.

Burada `reduce` yöntemi yalnızca toplam hesabını kısaltıyor; Rest'i anlamak için `reduce` bilmek gerekli değil. Bir önceki `for...of` sürümü aynı fonksiyon davranışını daha açık gösterir.

## 6. Rest ile `arguments` neden aynı değil?

Klasik JavaScript'teki `arguments` nesnesi fonksiyon çağrısının argümanlarını sunar, fakat gerçek bir array değildir ve arrow function'da kendi `arguments`'ı bulunmaz. Rest parameter ise gerçek bir array oluşturur; TypeScript ile tiplenmesi daha açıktır.

```ts
function describe(...items: string[]): string {
  return items.join(", ");
}
console.log(describe("A", "B")); // A, B
```

Bu, güncel kodda değişken sayıdaki argümanları tanımlamanın okunabilir yoludur. Her fonksiyonun rest parameter'a ihtiyacı yoktur; sabit argüman kontratında normal parametreler daha açık olabilir.

## 7. Rest, destructuring default'u ve `undefined`

```ts
const [first = 5, ...others] = [undefined, 2, 3];
console.log(first);  // 5
console.log(others); // [2, 3]
```

İlk değişkenin default'u yine **yalnız `undefined`** için çalışır. Rest, geri kalanları array'e toplar. Rest'in kendisi "eksikse alternatif değer seç" mekanizması değildir. Object rest ve array rest'teki yeni dış container'a rağmen nested referanslar paylaşılabilir.

## 8. Gerçekçi örnek: Test hata mesajını birleştirmek

```ts
type Severity = "INFO" | "ERROR";

function buildLogMessage(severity: Severity, ...details: string[]): string {
  const suffix = details.length === 0 ? "(no details)" : details.join("; ");
  return `${severity}: ${suffix}`;
}

console.log(buildLogMessage("ERROR", "login", "timeout"));
// ERROR: login; timeout
console.log(buildLogMessage("INFO"));
// INFO: (no details)
```

Burada `details.length === 0` geçerli boş-array durumunu ele alır. `if (details)` ile boşluğu test etmek yanlış olurdu: **Boş array truthy**'dir (Ders 2). Önceki dersteki truthiness bilgisi burada doğrudan kullanılır.

## 9. Hata ayıklama: Sık karşılaşılan yanlışlar

| Yanlış varsayım | Gerçek davranış |
|---|---|
| `...` her yerde spread'dir | Pattern/parametrede rest; literal/çağrıda spread |
| Rest array orijinal array'i değiştirir | Dış array yenidir, kaynak korunur |
| Rest nested object'leri kopyalar | Nested referanslar paylaşılabilir |
| Rest parametresine array argümanı verilir | Çoklu argümanlar toplanır; çağrıda array'i açmak için spread gerekir |
| `{ privateKey, ...publicData }` otomatik veri güvenliği sağlar | Diğer gizli alanlar kalabilir |
| Boş rest array falsy'dir | `[]` truthy'dir; `length` kontrol edilir |

## 10. Mülakat hazırlığı

**Question: What is the difference between rest and spread syntax?**

> Both use `...`, but their roles depend on the context. Spread expands values into an array literal, an object literal or a function call. Rest collects the remaining array elements, object properties or function arguments into a new container. Neither should be treated as a deep-clone or validation mechanism.

**Türkçe:** İkisi de `...` kullanır. Spread değerleri açar/yayar; Rest kullanılmayan elemanları, property'leri veya fonksiyon argümanlarını toplar. Hiçbiri otomatik deep copy veya veri doğrulama aracı değildir.

**Follow-up: Why is object rest not always safe for building a public response?**  
Çünkü dışarıda bıraktığın alan dışındaki **tüm kalan enumerable alanlar** yeni object'e geçebilir. Güvenilir response için açık alan seçimini tercih et.

## 11. Pekiştirme

1. `const [a,...b]=[1,2,3]` için `a` ve `b` değerleri nedir?
2. `sum(...[4,5])` ile `sum([4,5])` arasındaki TypeScript çağrı farkı nedir?
3. `function f(first: string, ...rest: string[])` çağrısında `f("A", "B", "C")` için `rest` nedir?
4. `const { token, ...remaining } = account` kullanımı neden veri sızdırma riski taşıyabilir?
5. Rest kullanarak ilk elemanı ayıran, kalan değerlerin toplamını hesaplayan fonksiyon tasarla.

**Kısa kontrol:** (1) `a=1`, `b=[2,3]`; (2) ilki ayrı argümanlara açar, ikincisi array'i tek argüman verir ve `number[]` rest sözleşmesine uymaz; (3) `["B","C"]`.

**Sonraki ders:** [Optional Chaining](./05-optional-chaining.md). **Kanıt:** Öğretim notu bağımsız repo geliştirme/test başarısı sayılmaz.
