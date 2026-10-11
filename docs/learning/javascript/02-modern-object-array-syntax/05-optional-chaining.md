# Ders 12 — Optional Chaining (`?.`): Eksik Veride Güvenli Erişim

> **Öğrenme yolu:** [JavaScript dizini](../README.md) → [Bölüm 2](./README.md)  
> **Önkoşul:** Object/array property erişimi, `null`/`undefined`, short-circuit, `??`, union types.  
> **Hedef:** Optional chaining'in hangi hatayı önlediğini ve hangi hatayı **önlemediğini** açıklamak; nested veriler için doğru zinciri kurmak.

## 1. Neden bu operatöre ihtiyaç var?

Bir kullanıcının `profile` bilgisi bazen bulunmayabilir:

```ts
type User = { profile?: { city: string } };
const user: User = {};
```

`user.profile.city` ifadesi çalışma zamanında `undefined` üzerindeki `city` property'sini okumaya çalışırsa **TypeError** oluşur. TypeScript strict null kontrolleri bunu zaten işaretleyebilir; yine de gerçek runtime veri sınırında hatayı anlamak önemlidir.

Klasik güvenli kontrol:

```ts
function getCity(user: User): string | undefined {
  if (user.profile === undefined) return undefined;
  return user.profile.city;
}
```

Modern yaklaşım:

```ts
function getCity(user: User): string | undefined {
  return user.profile?.city;
}
```

**Tanım:** Optional chaining, erişimin sol tarafı `null` veya `undefined` ise o erişimi sürdürmek yerine `undefined` döndürür. Böylece eksik ara değer üzerinde property/index/function çağrısının üreteceği belirli hataları önler.

## 2. `?.` tam olarak neyi kontrol eder?

```ts
type User = { profile?: { city?: string } };
const user: User = {};
console.log(user.profile?.city); // undefined
```

Adım adım:

1. `user.profile` değerlendirilir ve `undefined` çıkar.
2. `?.city` bu **sol operandın nullish** olduğunu görür.
3. Property erişimi yapılmaz; ifade `undefined` değerini üretir.

`?.` yalnızca solundaki ifadeyi korur. `user` da `null` olabiliyorsa zincirin oraya da uygulanması gerekir:

```ts
type User = { profile?: { city?: string } };
function city(user: User | null): string | undefined {
  return user?.profile?.city;
}
console.log(city(null)); // undefined
console.log(city({}));   // undefined
console.log(city({ profile: { city: "Berlin" } })); // Berlin
```

İlk `?.` `user` için, ikinci `?.` `profile` için koruma sağlar. `user?.profile.city` yazmak ara `profile` undefined olduğunda hâlâ hata doğurabilir; TypeScript bu risk için uyarabilir.

## 3. Nullish ile falsy değerleri karıştırma

Optional chaining yalnız **`null` ve `undefined`** durumunda kısa devre yapar; `0`, `false` ve boş string'i "eksik" saymaz.

```ts
const item = { stock: 0, enabled: false, note: "" };
console.log(item?.stock);   // 0
console.log(item?.enabled); // false
console.log(item?.note);    // ""
```

Bu ayrım iş kuralları için kritiktir. Örneğin stok 0 olabilir; bu stok bilgisinin *bulunmadığı* anlamına gelmez.

```ts
type Product = { stock?: number };
function getStock(p: Product | null): number {
  return p?.stock ?? 10;
}
console.log(getStock({ stock: 0 })); // 0
console.log(getStock(null));         // 10
```

Yanlış fallback yaklaşımı `p?.stock || 10` olsaydı **0 geçerli değeri kaybolacaktı**. Hata `?.` değil `||` kaynaklıdır.

## 4. Optional chaining + Nullish Coalescing

`?.` eksik veride `undefined` üretir. `??` bunun üzerine varsayılan seçer:

```ts
type User = { profile?: { city?: string | null } };
function displayCity(user: User | null): string {
  return user?.profile?.city ?? "Unknown";
}

console.log(displayCity({ profile: { city: "Bonn" } })); // Bonn
console.log(displayCity({ profile: { city: null } }));   // Unknown
console.log(displayCity({}));                          // Unknown
```

**Görev ayrımı:** `?.` erişimi korur; `??` değer nullish ise fallback seçer. İkisini bir "tek operatör" gibi ezberleme.

### Eksik mi yoksa boş mu?

```ts
const user = { nickname: "" };
console.log(user.nickname ?? "Guest"); // ""
console.log(user.nickname || "Guest"); // Guest
```

Bir kullanıcı boş nickname bırakabiliyorsa hangi davranışın geçerli olduğuna iş kuralı karar verir.

## 5. Array index ve dynamic property: `?.[ ]`

Array veya object erişiminde köşeli parantez kullanıyorsak optional chaining yazımı `?.[index]` biçimindedir.

```ts
function firstLog(logs: string[] | null): string | undefined {
  return logs?.[0];
}

console.log(firstLog(["start", "done"])); // start
console.log(firstLog([]));                // undefined
console.log(firstLog(null));              // undefined
```

**İki farklı undefined nedeni:** Boş array nullish değildir ama `logs[0]` elemanı bulunmadığı için `undefined` çıkar. `null` ise `?.` yüzünden erişim başlamadan `undefined` üretir. Görünen sonuç aynı olabilir; mekanizma farklıdır.

Object'in dinamik anahtarı için de:

```ts
type Counters = Record<string, number>;
function readCounter(data: Counters | undefined, key: string): number | undefined {
  return data?.[key];
}
console.log(readCounter({ attempts: 0 }, "attempts")); // 0
```

## 6. Optional function call: `?.()`

Fonksiyonun varlığı opsiyonelse:

```ts
type Handler = ((message: string) => void) | undefined;

function notify(handler: Handler, message: string): void {
  handler?.(message);
}

notify(undefined, "event"); // hata yok; çağrı yapılmaz
notify(text => console.log(text), "event"); // event
```

Fonksiyon olmadığında `?.()` çağrıyı atlar. Ancak `?.()` **callable olmayan ama nullish da olmayan** bir runtime değeri otomatik düzeltmez. Örneğin bir `number`'ı fonksiyon gibi çağırmak yine hatadır. TypeScript'in tipi ve runtime verinin doğruluğu ayrı konulardır.

## 7. Short-circuit ve değerlendirme: Neler çalışmaz?

```ts
let index = 0;
const items: string[] | null = null;
const value = items?.[index++];
console.log(value, index); // undefined 0
```

Sol taraf `null` olduğu için `[index++]` ifadesi değerlendirilmez. Böylece yan etki (`index` artışı) gerçekleşmez. Bu davranış özellikle debugging'de "Neden sayaç artmadı?" sorusunun cevabı olabilir.

```ts
const items: string[] = ["A", "B"];
let index = 0;
console.log(items?.[index++]); // A
console.log(index);            // 1
```

Bu ikinci örnekte array mevcut olduğundan index ifadesi çalışır. Optional chaining, kontrol akışına etkisi olan bir **short-circuit** mekanizmasıdır.

## 8. `?.` neleri yapmaz?

- **Validation yapmaz:** `profile?.age` property'si string gelmişse number'a dönüşmez.
- **Her ara halkayı korumaz:** `user?.profile.city` ile `user?.profile?.city` aynı güvenceyi vermez.
- **Geçerli falsy değerleri değiştirmez:** `0`, `false`, `""` korunur.
- **Atama hedefi olmaz:** `user?.name = "Alex"` geçerli JavaScript sözdizimi değildir.
- **Beklenmeyen runtime tipini otomatik düzeltmez:** Var olan property çağrılabilir değilse `handler?.()` yine TypeError verebilir.
- **Sonucun undefined olmayacağını garanti etmez:** Sonraki işlemde fallback ya da explicit kontrol gerekebilir.

## 9. Gerçekçi örnek: Opsiyonel test metadata'sı

```ts
type TestRecord = {
  id: string;
  metadata?: {
    retryCount?: number;
    owner?: { team?: string };
  };
};

function summarize(record: TestRecord): string {
  const retries = record.metadata?.retryCount ?? 0;
  const team = record.metadata?.owner?.team ?? "Unassigned";
  return `${record.id}: retries=${retries}, team=${team}`;
}

console.log(summarize({ id: "login", metadata: { retryCount: 0 } }));
// login: retries=0, team=Unassigned
console.log(summarize({ id: "logout" }));
// logout: retries=0, team=Unassigned
```

Burada neden `?? 0` kullandık? Çünkü gerçek `retryCount: 0` değerini eksik veri sanmadan korumalıyız. `?.` ile `??` birbirini tamamlar.

## 10. Debugging: Sorunu doğru mekanizmaya bağlamak

| Belirti | Olası kök neden | Kontrol |
|---|---|---|
| `Cannot read properties of undefined` | Eksik ara seviye | Her potansiyel nullish halka için `?.` gerekli mi? |
| `0` yerine varsayılan yazılıyor | `||` kullanıldı | `??` ile iş kuralı doğru mu? |
| Beklenmedik `undefined` | Property/array elemanı yok | Kaynağı ve index'i incele |
| Handler çağrılmıyor | Fonksiyon değeri nullish | `?.()` kısa devresi gerçekleşti mi? |
| Beklenmedik TypeError | Runtime değer callable değil | Type guard / veri sınırı kontrolü gerekli mi? |
| Sayaç ilerlemiyor | Sağdaki expression çalışmadı | Optional chaining kısa devre yaptı mı? |

**Güvenlik notu:** Dışarıdan gelen JSON verisine `as User` yazıp `?.` kullanmak property türlerini doğrulamaz. [Bölüm 3](../03-json-boundary/README.md) runtime doğrulamayı ayrıca öğretir.

## 11. Mülakat hazırlığı

**Question: What is optional chaining in JavaScript?**

> Optional chaining (`?.`) safely accesses a property, index or optional function when the value on the left might be `null` or `undefined`. If that value is nullish, evaluation stops and the result is `undefined`. It does not validate runtime types or replace all null checks.

**Türkçe:** Optional chaining, solundaki değer `null`/`undefined` olabilen erişimi güvenli kılar; böyleyse erişimi durdurup `undefined` üretir. Veri doğrulama aracı değildir.

**Follow-up: How does optional chaining differ from nullish coalescing?**

> `?.` controls whether an access is attempted; `??` selects a fallback when a value is `null` or `undefined`.

**Türkçe:** `?.` erişim davranışını kontrol eder, `??` eksik değere varsayılan seçer.

## 12. Pekiştirme

1. `const user = { profile: undefined }; user.profile?.city` sonucu nedir?
2. Neden `user?.profile.city` her nested durum için güvenli değildir?
3. `getStock({stock:0})` için `||` ve `??` karşılaştırması yap.
4. `const logs: string[] | null = []; logs?.[0]` sonucu neden `undefined` olabilir?
5. Opsiyonel `onError` callback'i için doğru çağrı sözdizimini yaz.

**Kısa kontrol:** (1) undefined; (2) `profile` eksikse `.city` korumasız kalır; (3) `||` 0'ı yanlışlıkla fallback'a dönüştürür; (4) array boş olduğundan index'te eleman bulunmaz; (5) `onError?.(message)`.

**Sonraki ders:** [Template Literals](./06-template-literals.md). **Kanıt:** Bu doküman örnekleri bağımsız test/implementation sonucu değildir.
