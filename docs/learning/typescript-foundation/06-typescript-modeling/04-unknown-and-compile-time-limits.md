# Ders 22 — unknown, any ve Compile-Time Güvenlik Sınırı

## 1. Dışarıdan gelen veri neden şüphelidir?

Uygulama başka bir sistemin verdiği object'i veya kullanıcının gönderdiği metni alır. TypeScript kaynak kodunda bir alanı number ilan etmek, runtime'da string gelmesini **otomatik olarak engellemez**. Bu yüzden doğrulanmamış data için uygun bir type başlangıcı gerekir.

## 2. unknown ve any farkı

**`unknown`** bir değerin türünü henüz güvenli biçimde bilmediğimizi söyler. TypeScript, kontrol olmadan güvenli olmayan property/method kullanımını engeller. **`any`** ise çok sayıda type-check güvenliğini devre dışı bırakır.

```ts
function readLabel(input: unknown): string {
  if (typeof input === "string") {
    return input.trim();
  }
  return "INVALID_TYPE";
}
console.log(readLabel(" ready ")); // ready
console.log(readLabel(42));        // INVALID_TYPE
console.log(readLabel(null));      // INVALID_TYPE
```

`unknown` kendiliğinden hata kodu üretmez. Kontrollü return davranışını bizim condition ve return'ümüz oluşturur.

## 3. Execution trace

String geldiğinde typeof kontrolü true olur; trim çağrılır, sonuç caller'a döner. Number ve null için guard false olur, `"INVALID_TYPE"` döner. Hiçbiri zorunlu olarak exception oluşturmaz.

## 4. any hatayı nasıl gizler?

```ts
// Bilerek riskli model:
function unsafe(input: any): string {
  return input.trim();
}
// unsafe(42); // runtime TypeError riski
```

Type checker `input` hakkında kontrollere zorlanmaz. Oysa runtime number üzerinde `trim()` method'u yoktur. `any`, veri kaynağını güvenilir yapmaz.

## 5. Type assertion dönüşüm yapmaz

```ts
type Product = { name:string; price:number };
const incoming: unknown = { name:"Elma", price:"100" };
const assumed = incoming as Product;
console.log(typeof assumed.price); // string
```

`as Product` object'in real shape'ini değiştirmez. Price field hâlâ string'dir. Yanlış type iddiası sonraki hesaplamada mantık hatası oluşturabilir.

## 6. Object, null ve array ayrımı

```ts
function isRecord(input: unknown): boolean {
  return typeof input === "object" &&
    input !== null &&
    !Array.isArray(input);
}
console.log(isRecord(null)); // false
console.log(isRecord([]));   // false
console.log(isRecord({}));   // true
```

Bu guard yalnız object-benzeri record temel kontrolüdür. `{}` için true dönmesi gereken `name` ve `price` alanlarının doğru olduğunu **kanıtlamaz**.

## 7. Untrusted input için zihinsel model

```text
external/unknown input
    ↓  object/null/array kontrolü
possible record
    ↓  field varlığı ve field type kontrolü
validated application data
    ↓
business operation
```

Bu işlemler birbirine bağlı fakat farklıdır. Runtime validation olmadan statik type assertion güvenli kapı değildir.

## 8. Kritik sınırlar ve debugging

**Belirti:** `input.trim is not a function`. Input'un gerçek typeof değerini gözle. `any` veya `as string` ile statik kontrol gizlenmiş olabilir.

**Belirti:** `price` string geldi, toplama yanlış. External boundary'de field validation yapılıyor mu? `number` annotation runtime conversion değildir.

**Belirti:** Object check geçiyor ama property eksik. Record olmak belirli business model olmak anlamına gelmez.

## 9. Mülakat ve pekiştirme

**Question:** Why is unknown safer than any?

> Unknown requires checking a value before unsafe operations. Any bypasses many static safeguards and can hide runtime type errors.

**Kontrol:** `readLabel([])` sonucu? `as Product` price'ı number yapar mı? `isRecord({})` true ise Product valid midir? `typeof null` neden dikkat ister?

<details><summary>Cevaplar</summary>

INVALID_TYPE; hayır; hayır; null için object döndürür ama null object property taşımaz.

</details>

## 10. Beklenmeyen dış girdinin risk analizi

```ts
function upper(input: unknown): string {
  if (typeof input !== "string") return "INVALID";
  return input.toUpperCase();
}
console.log(upper("safe")); // SAFE
console.log(upper(42));     // INVALID
console.log(upper(null));   // INVALID
```

**Kontrol akışı:** Önce runtime guard, sonra string method. Bu iki aşama aynı function'da bulunur ama görevleri farklıdır: guard gerçek değeri kontrol eder, TypeScript ise geçerli branch'te doğru method kullanımını izleyebilir.

### Assertion yanlışlığı nasıl gizler?

```ts
const input: unknown = {price:"120"};
const claimed = input as {price:number};
console.log(typeof claimed.price); // string
```

TypeScript annotation veya assertion runtime içeriği değiştirmez. Bu değeri number zannederek arithmetic yapılırsa unexpected string concatenation oluşabilir.

### En az beş negatif girdi tasarla

| Input | Beklenen `upper` |
| --- | --- |
| `null` | INVALID |
| `[]` | INVALID |
| `{}` | INVALID |
| `42` | INVALID |
| `false` | INVALID |
| `" ok "` | " OK " |

Bütün wrong input'larda function'ın hata fırlatmadan controlled string dönmesi burada seçilen sözleşmedir; başka API'de başka sözleşme olabilir.

### Bağımsız görev

`isPositiveNumber(input:unknown):boolean` tasarla. `0`, `-1`, `NaN`, `Infinity`, `"5"` ve `5` için expected tabloyu oluştur. Sadece `typeof` kontrolü yeterli olur mu?

<details><summary>Kontrol</summary>

`typeof` tek başına NaN/Infinity değerlerini dışlamaz; `Number.isFinite` ve pozitiflik kontrolü de gerekir.

</details>
