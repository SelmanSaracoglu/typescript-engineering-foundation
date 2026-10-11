# Ders 8 — Object Destructuring: Nesnenin Alanlarını Anlamlı Değişkenlere Ayırmak

> **Öğrenme yolu:** [JavaScript dizini](../README.md) → [Bölüm 2](./README.md)  
> **Önkoşul:** Object, property erişimi (`user.name`), değişkenler, `undefined`, referans kavramı.  
> **Hedef:** Sözdizimini ezberlemek yerine hangi property'nin hangi değişkene bağlandığını, varsayılanların ne zaman çalıştığını ve referans etkisini açıklamak.

## 1. Neden ihtiyaç duyuyoruz?

Bir fonksiyonun kullanıcı verisi aldığını düşünelim. Klasik property erişimiyle her yerde `user.id`, `user.name`, `user.role` yazabiliriz:

```ts
const user = { id: 101, name: "Alex", role: "viewer" };
const id = user.id;
const name = user.name;
console.log(`${id}: ${name}`); // 101: Alex
```

Bu geçerlidir. **Object destructuring**, ihtiyaç duyduğumuz property'leri daha kısa bir ifade ile ayrı değişkenlere bağlamamıza izin verir. Yeni bir object üretmek zorunda değildir; var olan object'ten değer okur.

```ts
const user = { id: 101, name: "Alex", role: "viewer" };
const { id, name } = user;
console.log(`${id}: ${name}`); // 101: Alex
```

**Tanım:** Object destructuring, bir object'teki property değerlerini **property adlarına göre** değişkenlere atayan JavaScript bağlama/atama sözdizimidir. Bir fonksiyona yeni yetenek eklemez; aynı veriyi farklı biçimde okur.

## 2. Çalışma mekanizması: Sağ taraf ve sol taraf

```ts
const account = { status: "active", attempts: 0 };
const { status, attempts } = account;
```

1. Sağdaki `account` ifadesi değerlendirilir.
2. Soldaki `{ status, attempts }` bir **destructuring pattern**'ıdır; burada yeni object oluşturulmaz.
3. JavaScript `account.status` ve `account.attempts` değerlerini bulur.
4. `status` ve `attempts` adlı iki ayrı değişken bağlanır.

Sonuç: `status === "active"`, `attempts === 0`. Değerler property **isimleriyle** bulunur; object'in property sırası bu eşleştirmeyi değiştirmez.

```ts
const data = { second: "B", first: "A" };
const { first, second } = data;
console.log(first, second); // A B
```

**Object literal ile destructuring pattern farkı:** `const copy = { ... }` yeni object kurabilir; `const { x } = source` değişken `x`'i oluşturur. Benzer süslü parantezleri aynı görev sanma.

## 3. Yeniden adlandırma (alias) ve TypeScript tipleri

Bazı property isimleri yerel kullanım için uygun olmayabilir:

```ts
const response = { user_name: "Alex", user_id: 101 };
const { user_name: username, user_id: id } = response;
console.log(username, id); // Alex 101
```

`user_name: username`, "`user_name` property'sini oku, sonucu **`username` isimli değişkene** bağla" demektir. `user_name` adında ayrıca bir yerel değişken oluşturmaz.

Kritik TypeScript ayrımı:

```ts
// `name: localName` bir tip bildirimi değildir.
type User = { name: string; age: number };
const user: User = { name: "Alex", age: 25 };
const { name: displayName } = user;
console.log(displayName); // Alex
```

Property türlerini object modelinde (`type User`) veya pattern'in bütününe uygulanan tipte belirtiriz; `name: string` yazmak, destructuring'de `name` için `string` tip anotasyonu yapmaz, `string` adında değişken bağlamaya çalışır.

## 4. Eksik property ve varsayılan değer

Property bulunmuyorsa erişim sonucu `undefined` olabilir:

```ts
type Settings = { theme?: string };
const settings: Settings = {};
const { theme } = settings;
console.log(theme); // undefined
```

Destructuring default yalnızca değer **`undefined` olduğunda** devreye girer:

```ts
type User = { nickname?: string | null };
const first: User = {};
const second: User = { nickname: null };
const third: User = { nickname: "" };

const { nickname: a = "Guest" } = first;
const { nickname: b = "Guest" } = second;
const { nickname: c = "Guest" } = third;
console.log(a, b, c); // Guest null ""
```

Neden? İlkinde değer `undefined`; diğer ikisinde `null` ve `""` **tanımlı** değerlerdir. `0` ve `false` da default'u tetiklemez.

| Girdi değeri | `const { value = 10 } = data` sonucu |
|---|---|
| Property yok / `undefined` | `10` |
| `null` | `null` |
| `0` | `0` |
| `false` | `false` |

**`??` farkı:** `data.value ?? 10`, hem `null` hem `undefined` için `10` seçer. Destructuring'deki `= 10` yalnız `undefined` için çalışır. Hangi davranışın doğru olduğu iş kuralına bağlıdır.

## 5. Nested destructuring ve güvenli erişim sınırı

```ts
const user = { profile: { city: "Berlin" } };
const { profile: { city } } = user;
console.log(city); // Berlin
```

Burada `city` bağlanır; `profile` adlı yerel değişken otomatik oluşturulmaz. Eğer `profile` eksikse nested destructuring hata fırlatabilir. Dış object'i `null` veya `undefined` üzerinden destructure etmek de TypeError ile sonuçlanır.

Opsiyonel nested veri için önce varsayılan object veya optional chaining tercih edilebilir:

```ts
type User = { profile?: { city?: string } };
const user: User = {};
const { profile = {} } = user;
const city = profile.city ?? "Unknown";
console.log(city); // Unknown
```

Bu kod `profile: undefined` için çalışır; `profile: null` kabul eden bir modelde aynı varsayılan davranışı bekleme. Optional Chaining'i [Ders 12](./05-optional-chaining.md)'de ayrı öğreneceğiz.

## 6. Fonksiyon parametresinde destructuring

```ts
type Product = { id: number; price: number; stock: number };

function describeProduct({ id, stock }: Product): string {
  return `Product ${id}: ${stock} in stock`;
}

console.log(describeProduct({ id: 7, price: 49, stock: 0 }));
// Product 7: 0 in stock
```

Fonksiyon **bir object** alır. Parametre pattern'i object'in seçilen alanlarını yerel değişkenlere bağlar. Fonksiyonun tip anotasyonu tüm parametre object'ine uygulanmıştır; `id` ile `stock` ayrı argümanlar değildir.

## 7. Referans ve mutation: Neyi kopyalıyoruz?

Primitive değer object'ten okunup ayrı bir değişkene bağlanır; değişkenin sonradan değişmesi object property'yi değiştirmez:

```ts
const user = { score: 5 };
let { score } = user;
score = 9;
console.log(user.score, score); // 5 9
```

Ama okunan property başka bir object ise **referans aynı object'i gösterir**:

```ts
const user = { settings: { theme: "dark" } };
const { settings } = user;
settings.theme = "light";
console.log(user.settings.theme); // light
```

Bu davranış "destructuring object'i derin kopyaladı" anlamına gelmez. Yeni dış object kopyası istiyorsak [Spread](./03-spread.md) dersindeki farklı mekanizmayı değerlendirmeliyiz.

## 8. Gerçekçi senaryo: Test sonucundan rapor satırı

```ts
type TestResult = {
  testId: string;
  passed: boolean;
  durationMs?: number;
};

function toReportLine(result: TestResult): string {
  const { testId, passed, durationMs = 0 } = result;
  const status = passed ? "PASS" : "FAIL";
  return `${testId} | ${status} | ${durationMs}ms`;
}

console.log(toReportLine({ testId: "login", passed: false }));
// login | FAIL | 0ms
```

Burada destructuring yalnız veri okur. Ternary karar verir. Template Literal string üretir. Üç mekanizmanın görevini ayırabilmek, küçük bir SDET rapor fonksiyonunu okuyabilmenin temelidir.

## 9. Hata analizi / debugging kontrol listesi

- `undefined` mi geliyor? Property adını, büyük/küçük harfi ve kaynak object'i kontrol et.
- `null` değerine rağmen default çalışmıyor mu? `=` yerine gerekiyorsa `??` kullan.
- `const { name: label } = user` sonrası neden `name` değişkeni yok? Alias yalnız `label` oluşturur.
- Nested property okumak hata mı fırlatıyor? `profile` gibi ara seviyeler eksik olabilir.
- Bir değişikliği hem `user` hem `settings` görüyor mu? Aynı nested referansı paylaşıyor olabilirler.
- Kaynak verinin güvenilir olduğunu **varsayma**: Destructuring bir runtime validation aracı değildir.

## 10. Mülakat hazırlığı

**Question: What is object destructuring in JavaScript?**

> Object destructuring is a syntax for extracting property values from an object into variables by property name. It supports renaming, default values and nested patterns. Defaults are applied when the property value is `undefined`, not when it is `null`. Destructuring does not deep-copy nested objects.

**Türkçe:** Object destructuring, object içindeki property'leri isimleriyle değişkenlere ayıran sözdizimidir. Alias, varsayılan değer ve nested pattern destekler. `null` default'u çalıştırmaz; nested object referansları korunur.

**Follow-up: How is it different from array destructuring?**  
Object'te property **adı**, array'de **pozisyonu** önemlidir (Ders 9).

## 11. Kendi kendine pekiştirme

1. `const { status: currentStatus, retries = 3 } = { status: "pending", retries: 0 };` için değerleri tahmin et.
2. `const { profile: { city } } = {}` neden güvenli değildir? İki çözüm yolu açıkla.
3. `const { settings } = user` yaptıktan sonra `settings.theme = "light"` neden `user` üzerinde görülebilir?
4. `name` ve `price` property'si alan, adı ve fiyatı bir string olarak döndüren `describe` fonksiyonunu yaz.

**Kısa kontrol:** (1) `currentStatus = "pending"`, `retries = 0`; (2) `profile` eksik olduğu için nested erişim başarısız olabilir; önce default object ya da `?.` ile güvenli erişim; (3) aynı nested referans; (4) tasarladığın input/output contract'ı açık olmalı.

**Sonraki ders:** [Array Destructuring](./02-array-destructuring.md). **Kanıt durumu:** Teorik eğitim belgesi; gerçek uygulama, typecheck, Vitest, debugging ve H0–H4 bağımsızlık değerlendirmesi değildir.
