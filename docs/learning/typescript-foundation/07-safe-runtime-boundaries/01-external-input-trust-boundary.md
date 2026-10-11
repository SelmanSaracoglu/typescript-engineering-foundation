# Ders 23 — External Input ve Trust Boundary

## 1. Güven sınırı nedir?

Uygulama, kendi oluşturduğu nesneleri okuyabilir fakat kullanıcıdan, JSON'dan, dosyadan veya dış servisten gelen verinin gerçekten beklenen yapıda olduğunu otomatik bilemez. **Trust boundary**, kontrol edilmemiş veriyle doğrulanmış uygulama modeli arasındaki sınırdır.

TypeScript `type Product` tanımı dış veriyi runtime'da kontrol etmez. Bu nedenle doğrulanmamış input önce `unknown` olarak ele alınabilir.

## 2. İlk savunma: object, null, array

```ts
function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" &&
    input !== null &&
    !Array.isArray(input);
}
console.log(isRecord(null));       // false
console.log(isRecord([]));         // false
console.log(isRecord({ price:3 })); // true
```

JavaScript'te `typeof null==="object"` olduğundan null ayrıca elenir; array de object sınıfında göründüğü için ayrıca `Array.isArray` kontrolü yapılır. Bu üç koşul birlikte verinin array olmayan object-benzeri yapı olduğunu söyler.

## 3. Gerçek execution flow

1. `isRecord(null)` → typeof object → null kontrolü false → reddet.
2. `isRecord([])` → typeof object, null değil → Array.isArray true → reddet.
3. `isRecord({price:3})` → object, null değil, array değil → true.

**Kritik:** Üçüncü girdinin valid Product olduğu sonucu çıkmaz. Name ve inStock alanları henüz kontrol edilmemiştir.

## 4. Type predicate nasıl çalışır?

`input is Record<string,unknown>` imzası, function true döndüğünde TypeScript'in input'u record gibi değerlendirebilmesini sağlar. Ancak predicate'in gerçekten doğru olması geliştiricinin sorumluluğudur.

```ts
function unsafeGuard(x: unknown): x is { name: string } {
  return true; // kasıtlı yanlış!
}
const input: unknown = 42;
if (unsafeGuard(input)) {
  // input.name varmış gibi kabul edilebilir; runtime'da yanlış varsayım
}
```

Her şey için true döndüren guard type checker'ı yanıltabilir. **Type predicate yeni runtime güvenliği yaratmaz; body'deki kontroller yaratır.**

## 5. Bütün veri akışını ayır

```text
External value (unknown)
    ↓
Object / null / array kontrolü
    ↓
Property existence
    ↓
Property runtime types
    ↓
Business constraints
    ↓
Trusted application representation
```

Bunlar tek bir `typeof` ile tamamlanmaz.

## 6. Assertion ile sınırı atlamak

```ts
type Product = { name: string; price: number };
const external: unknown = { name:"Elma", price:"100" };
const assumed = external as Product;
console.log(typeof assumed.price); // string
```

`as Product` field'i dönüştürmez. Bu kod gerçek runtime veriyi yanlış kabul eder; sonraki hesaplamalar beklenmedik sonuç verebilir.

## 7. Debugging

Belirti: Dış data runtime'da property hatası oluşturdu. Kaynağın güvenilir olup olmadığını sor. `unknown` kontrolünü nerede kaybettin? First guard null/array ayrımını içeriyor mu? Property varlığının kontrolünü value type kontrolünden ayrı yapıyor musun?

Test matrisi: null, array, number, boş object, gerekli property'leri olan object, yanlış field tipi.

## 8. Mülakat ve pekiştirme

**Question:** Why is a trust boundary important in TypeScript?

> TypeScript types are compile-time declarations. Real external inputs must be checked at runtime before being used as trusted application data.

**Kontrol:** `isRecord({})` true olması geçerli Product kanıtı mı? `typeof null` neden yanlış pozitif olabilir? Type predicate bütün durumlar için true döndürürse ne olur?

<details><summary>Cevaplar</summary>

Hayır, field'ler henüz doğrulanmadı; typeof null object döner; kötü predicate statik analizi yanıltabilir.

</details>

## 9. Güven sınırı uygulaması: ham object'e güvenme

```ts
type Product = {name:string;price:number};
function isProduct(input: unknown): input is Product {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  if (!("name" in input) || !("price" in input)) return false;
  return typeof input.name === "string" &&
         typeof input.price === "number";
}
console.log(isProduct({name:"Elma",price:10})); // true
console.log(isProduct({name:"Elma",price:"10"})); // false
```

Bu fonksiyon iki temel aşamayı birleştirir: record guard + field type check. Dış veriyi kullanmadan önce runtime'a bakar.

**Zihinsel ayrım:** Type predicate bildirimi modelle eşleşmeye yardım eder; body gerçek kontrolleri uygular.

| Input | Record? | Alan type? | Sonuç |
| --- | --- | --- | --- |
| `null` | hayır | — | false |
| `[]` | hayır | — | false |
| `{}` | evet | eksik | false |
| `{name:"Elma",price:10}` | evet | doğru | true |
| `{name:"Elma",price:"10"}` | evet | yanlış | false |

### Bağımsız görev

`inStock:boolean` alanını da zorunlu hale getir. Test et: eksik inStock, `inStock:"true"`, `inStock:true`. Kodunu yazmadan önce expected tablo çıkar.

<details><summary>Kontrol</summary>

İlk iki durum reddedilir; boolean true geçerli field type'dır. Ancak bütün iş kuralları bununla doğrulanmış olmaz.

</details>
