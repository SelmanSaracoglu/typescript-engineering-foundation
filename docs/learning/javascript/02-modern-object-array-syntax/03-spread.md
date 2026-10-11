# Ders 10 — Spread Syntax: Değerleri Açmak, Birleştirmek ve Shallow Copy

> **Öğrenme yolu:** [JavaScript dizini](../README.md) → [Bölüm 2](./README.md)  
> **Önkoşul:** Array, object, referans/identity, mutation, [destructuring](./01-object-destructuring.md).  
> **Hedef:** Spread'in neyi kopyalayıp neyi kopyalamadığını açıklayabilmek; property çakışmalarını, referans aliasing'i ve güvenli güncelleme yöntemlerini çözümleyebilmek.

## 1. Spread neden var?

Birden fazla array'i birleştirmek veya mevcut object'ten yeni bir dış object üretmek isteyebiliriz. Normalde elemanları tek tek yerleştirmek zahmetlidir. `...` operatör sözdizimi, bulunduğu **bağlamda** bir koleksiyonun elemanlarını/alanlarını açmaya yarar.

```ts
const first = ["Git", "TypeScript"];
const second = ["Vitest", "Linux"];
const tools = [...first, ...second];
console.log(tools); // ["Git", "TypeScript", "Vitest", "Linux"]
```

**Tanım:** Spread Syntax, array literal'inde iterable elemanlarını, object literal'inde object'in own enumerable property'lerini veya bir fonksiyon çağrısında iterable argümanlarını genişletir. `...` işaretinin görevi **bulunduğu konuma bağlıdır**. Rest'le aynı üç nokta kullanılır; ancak anlamı farklıdır.

## 2. Array spread: Adım adım çalışma

```ts
const numbers = [10, 20];
const expanded = [0, ...numbers, 30];
console.log(expanded); // [0, 10, 20, 30]
```

JavaScript yeni bir array oluşturur. `0` ilk elemana eklenir, `numbers` içindeki değerler sırayla açılır, `30` son eleman olur. Orijinal `numbers` array'i aynı kalır.

```ts
console.log(numbers);              // [10, 20]
console.log(expanded === numbers); // false
```

Spread bir array'in elemanlarını yeni dış array'e koyar; kaynak array'in elemanlarını değiştirmez. Ancak elemanlardan biri object ise yeni array'in içine **aynı object referansı** yerleştirilebilir.

## 3. Shallow copy: Dış kabuk yeni, iç referans ortak

Bir nested object içeren değer düşünelim:

```ts
const original = {
  username: "Alex",
  settings: {
    theme: "dark"
  }
};

const copy = { ...original };
```

İki karşılaştırmayı dikkatle incele:

```ts
console.log(original === copy);                   // false
console.log(original.settings === copy.settings); // true
```

**Adım adım:**

1. `{ ...original }` yeni bir dış object kurar.
2. `username` property değeri (string) yeni dış object'e konur.
3. `settings` property değeri başka bir **object referansıdır**; o referans yeni dış object'e taşınır.
4. İki dış object farklıdır, ama `settings` alanları bellekteki aynı nested object'i gösterir.

Bu duruma **shallow copy (yüzeysel kopyalama)** denir. Deep clone gerçekleşmediği için:

```ts
copy.settings.theme = "light";
console.log(original.settings.theme); // light
```

Orijinalin içindeki tema da değişti; çünkü `settings` object'i ortaktır. `copy.username = "Sam"` ise dış property atamasıdır; orijinal `username` değişmez.

### Nested object'i değiştirmeden yeni durum üretmek

```ts
const original = {
  username: "Alex",
  settings: { theme: "dark", notifications: true }
};

const updated = {
  ...original,
  settings: {
    ...original.settings,
    theme: "light"
  }
};

console.log(original.settings.theme);            // dark
console.log(updated.settings.theme);             // light
console.log(original.settings === updated.settings); // false
```

Burada değiştireceğimiz **iç seviyeyi ayrıca** kopyaladık. Bu yöntem yalnız kopyaladığımız seviyelerde yeni identity oluşturur; daha derindeki referanslar hâlâ paylaşılabilir. `...` genel amaçlı otomatik deep-clone değildir.

## 4. Object spread: Alanları birleştirmek ve çakışma sırası

```ts
const defaults = { retries: 3, timeoutMs: 1000 };
const userOptions = { timeoutMs: 5000 };
const config = { ...defaults, ...userOptions };
console.log(config); // { retries: 3, timeoutMs: 5000 }
```

Aynı property birden fazla kez bulunursa **son yazılan değer** geçerli olur. `...userOptions` sonra geldiği için `timeoutMs` 5000 olur.

```ts
const configA = { timeoutMs: 5000, ...defaults };
console.log(configA.timeoutMs); // 1000

const configB = { ...defaults, timeoutMs: 5000 };
console.log(configB.timeoutMs); // 5000
```

Bu, çok sık rastlanan bir konfigürasyon bug'ıdır. `defaults` ve `overrides` sırasının iş kuralıyla tutarlı olduğundan emin ol. Normal object property anahtarlarının en son yazılan değeri geçerlidir; property'nin sıralama davranışı ayrı bir konudur ve burada iş kuralı için esas değildir.

## 5. Array spread ve object spread aynı kopyalama işlemi mi?

Her ikisi de yeni bir dış yapı oluşturabilir, ancak bağlamları ve açtıkları öğeler farklıdır:

```ts
const values = [10, 20];
const asArray = [...values];
const asObject = { ...values };

console.log(asArray);  // [10, 20]
console.log(asObject); // { '0': 10, '1': 20 }
```

`{ ...values }` bir array kopyası üretmez; object'in enumerable index property'lerini taşıyan düz bir object üretir. Array davranışlarına (`map`, `length`) güvenmek istiyorsan object spread kullanmamalısın.

## 6. Fonksiyon çağrısında spread

```ts
function maxOfThree(a: number, b: number, c: number): number {
  return Math.max(a, b, c);
}

const values: [number, number, number] = [7, 3, 9];
console.log(maxOfThree(...values)); // 9
```

Çağrıda `...values`, tuple elemanlarını üç ayrı argüman olarak açar. TypeScript'te argüman sayısı önemli olduğu için burada fixed-length tuple kullandık. Keyfi uzunluktaki `number[]` her zaman üç parametreye açılabilir diye varsayılamaz.

**Spread ile rest farkı:** Fonksiyonu çağırırken `fn(...values)` bir array'i **açar**; fonksiyon tanımında `function fn(...values: number[])` ise argümanları **toplar**. [Ders 11](./04-rest.md) bu ayrımı detaylandırır.

## 7. Değişmeyen veri (immutability) ne demektir?

Immutability, yeni değer üretme sırasında var olan veriyi değiştirmemeyi hedefleyen bir geliştirme yaklaşımıdır. Spread, uygun seviyelerde yeni object/array oluşturarak bunu **destekleyebilir**, fakat tek başına garanti etmez.

Hatalı beklenti:

```ts
const state = { user: { isAdmin: false } };
const next = { ...state };
next.user.isAdmin = true;
console.log(state.user.isAdmin); // true — beklenmeyen mutation
```

Daha kontrollü çözüm:

```ts
const state = { user: { isAdmin: false } };
const next = { ...state, user: { ...state.user, isAdmin: true } };
console.log(state.user.isAdmin); // false
console.log(next.user.isAdmin);  // true
```

Burada kritik soru "Spread kullandın mı?" değil, **"Hangi seviyelerde aynı referans kaldı?"** sorusudur.

## 8. Gerçekçi kullanım: Test konfigürasyonunu oluşturmak

```ts
type TestConfig = {
  timeoutMs: number;
  retries: number;
  logging: { enabled: boolean; level: "info" | "debug" };
};

const defaults: TestConfig = {
  timeoutMs: 1000,
  retries: 2,
  logging: { enabled: true, level: "info" }
};

const forDebug: TestConfig = {
  ...defaults,
  timeoutMs: 3000,
  logging: { ...defaults.logging, level: "debug" }
};

console.log(defaults.timeoutMs, forDebug.timeoutMs); // 1000 3000
console.log(defaults.logging.level, forDebug.logging.level); // info debug
```

Neden `logging: { ...defaults.logging, level: "debug" }` kullandık? Hem `enabled` bilgisini korumak hem orijinal nested object'i değiştirmemek için.

## 9. Debugging: Belirti → hipotez → düzeltme

| Belirti | Muhtemel neden | Nasıl doğrularsın? |
|---|---|---|
| Orijinal nested ayar değişiyor | Paylaşılan referans | `original.settings === copy.settings` |
| Kullanıcı override'ı kayboldu | Spread sırası ters | Son yazılan property'yi izle |
| `map` çalışmıyor | Array yerine `{...array}` üretildi | `Array.isArray(value)` kontrol et |
| Fonksiyonda argüman sayısı hatası | Array/tuple uzunluğu belirsiz | Parametre sayısı ve tuple tipini kontrol et |
| `const copy = [...array]` ile sorun çözülmedi | Eleman bir nested object | Elemanların identity'sini karşılaştır |

Spread bir **validation** aracı değildir. Güvenilmeyen object'in bütün alanlarını `{ ...input }` ile otomatik olarak uygulama modeline taşımak, bilinmeyen alanların da taşınmasına neden olabilir. Veri sınırında bilinçli property seçimi ve runtime kontrol gerekir (Bölüm 3).

## 10. Mülakat hazırlığı

**Question: What does the spread syntax do in JavaScript?**

> Spread syntax expands iterable elements in array literals and function calls, and it copies own enumerable properties into object literals. It can create a new outer array or object, but it performs a shallow copy, so nested object references may remain shared.

**Türkçe:** Spread, array veya fonksiyon çağrısında elemanları açar; object literal'inde enumerable property'leri taşır. Dış yapı yeni olabilir, ama nested object'ler paylaşılmaya devam edebilir.

**Follow-up: What is the difference between shallow and deep copy?**

> A shallow copy creates a new outer container while nested references can remain shared. A deep copy duplicates nested data according to its copy semantics. Spread is not a deep-copy operation.

**Türkçe:** Shallow copy dış kabuğu yeniler, iç referanslar ortak kalabilir. Deep copy iç veriyi de tanımlanan kopyalama kurallarına göre ayırır; spread bunu tek başına yapmaz.

## 11. Pekiştirme

1. `{...{a:1,b:2}, b:9}` sonucunda `b` kaç olur? Ters sıralamada ne değişir?
2. `const a=[{n:1}]; const b=[...a]; b[0].n=3;` sonunda `a[0].n` nedir? Neden?
3. `const b={...a}` ile array oluşturulur mu?
4. Nested `profile.address.city` değerini değiştirmek için hangi seviyelerde yeni object gerekir?
5. Bir `TestConfig` içerisinde `logging` değerini yalnız `level` alanında değiştiren yeni konfigürasyonu yaz.

**Kısa kontrol:** (1) 9; sonra `...{a:1,b:2}` gelirse 2. (2) 3, çünkü array kopyalansa da eleman object'i aynıdır. (3) Hayır, düz object.

**Sonraki ders:** [Rest Syntax](./04-rest.md). **Kanıt:** Öğrenim belgesi; bireysel kodlama, typecheck, test ve debugging başarısı değildir.
