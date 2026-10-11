# Ders 3 — Logical Operators: `&&`, `||`, `!`

## 1. Neden mantıksal operatörlere ihtiyacımız var?

İş gereksinimleri sıklıkla **birden fazla koşul** içerir:

- Bir kullanıcı admin **veya** kayıt sahibi olmalıdır.
- Kullanıcı aynı zamanda **engellenmiş olmamalıdır**.
- Fiyat `0` **ve üzeri** ve kabul edilen üst sınırın **altında/eşit** olmalıdır.

Bu ifadeler tek bir karşılaştırmayla kurulamaz. Logical operators koşulları birleştirmeyi sağlar.

| Operatör | Boolean bağlamda anlamı | Örnek |
|---|---|---|
| `&&` | AND — iki koşul da doğru olmalı | `isAdmin && isActive` |
| `||` | OR — en az biri doğru olmalı | `isAdmin || isOwner` |
| `!` | NOT — truthiness sonucunu tersler | `!isBlocked` |

## 2. `&&`: AND

```ts
function canApprove(isAdmin: boolean, isActive: boolean): boolean {
  return isAdmin && isActive;
}
console.log(canApprove(true, true));   // true
console.log(canApprove(true, false));  // false
console.log(canApprove(false, true));  // false
console.log(canApprove(false, false)); // false
```

Adım adım: `isAdmin` false ise ikinci koşul ne olursa olsun sonuç false olacağından sağ taraf değerlendirilmeden işlem bitebilir. `isAdmin` true ise `isActive` sonucuna bakılır. *Değerlendirme sırası* konusunu Ders 4'te ayrıntılandıracağız.

Bir aralık kontrolü:

```ts
function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= 18 && age <= 65;
}
console.log(isValidAge(18));   // true — alt sınır
console.log(isValidAge(65));   // true — üst sınır
console.log(isValidAge(17));   // false
console.log(isValidAge(66));   // false
console.log(isValidAge(18.5)); // false — tam sayı kuralı
```

Bu örnek hem iş kuralını hem **exact boundary** testlerini görünür kılar. `&&` yerine `||` yazmak mantıksal olarak farklı, büyük ihtimalle hatalı bir kural üretirdi.

## 3. `||`: OR

```ts
function hasEditPermission(isAdmin: boolean, isOwner: boolean): boolean {
  return isAdmin || isOwner;
}
console.log(hasEditPermission(true, false));  // true
console.log(hasEditPermission(false, true));  // true
console.log(hasEditPermission(false, false)); // false
```

`||`, "tam olarak biri" değil, **en az biri** anlamına gelir: Her iki operand da true ise sonuç yine true olur.

### Yaygın yanlış kalıp

```js
function wrongStatusCheck(status) {
  return Boolean(status === "pending" || "failed");
}
console.log(wrongStatusCheck("approved")); // true — HATALI
```

Neden? `status === "pending"` false olabilir; ancak ikinci operand olan `"failed"` boş olmayan bir string, yani truthy'dir. JavaScript onu yeni bir eşitlik kontrolü olarak yorumlamaz.

Doğru kullanım:

```ts
function isOpenStatus(status: string): boolean {
  return status === "pending" || status === "failed";
}
console.log(isOpenStatus("approved")); // false
console.log(isOpenStatus("failed"));   // true
```

## 4. `!`: NOT

`!` operandı boolean bağlamda değerlendirir ve ters boolean üretir.

```js
console.log(!true);     // false
console.log(!false);    // true
console.log(!0);        // true
console.log(!"Hello");  // false
```

Bir erişim kuralında:

```ts
const isBlocked = true;
const allowed = !isBlocked;
console.log(allowed); // false
```

`!` ile `!==` farklıdır: `!value` tek operandın truthiness sonucunu tersler; `a !== b` ise iki değerin strict-equality karşılaştırmasının tersini alır.

## 5. Operatör önceliği ve parantez

Karmaşık kararları okurken öncelik önemlidir:

**`!` → `&&` → `||`**

Şu kuralı modelleyelim: *Admin veya owner olmalı, ayrıca engellenmemiş olmalı.*

```ts
function canEdit(
  isAdmin: boolean,
  isOwner: boolean,
  isBlocked: boolean
): boolean {
  return (isAdmin || isOwner) && !isBlocked;
}
console.log(canEdit(true, false, true)); // false
```

Parantezi çıkarıp kuralı yanlış yazarsak:

```ts
const isAdmin = true;
const isOwner = false;
const isBlocked = true;

const wrong = isAdmin || isOwner && !isBlocked;
console.log(wrong); // true — engellenmiş admin'e izin veriliyor
```

JavaScript bunu `isAdmin || (isOwner && !isBlocked)` olarak okur. Admin true olduğunda `||` bütün koşulu true yapar; engel kontrolü admin için uygulanmamış olur.

**Mühendislik kuralı:** Aynı ifadede `&&` ve `||` varsa iş kuralının mantığını açık eden parantezleri kullan.

## 6. Önemli ayrım: `&&` ve `||` her zaman boolean döndürmez

Operandlar boolean ise sonuçlar boolean olabilir. Aşağıdaki kısa ifadeler JavaScript davranışını gösterir; TypeScript bazı sabit truthy/falsy koşullarını ayrıca uyarabilir. JavaScript mantıksal operatörleri **operand değerlerini** de döndürebilir:

```js
console.log(0 && "next");        // 0
console.log(5 && "next");        // "next"
console.log("Alex" || "Guest");   // "Alex"
console.log("" || "Guest");       // "Guest"
```

Bu davranış logical operators ile **short-circuit** kavramını birbirine bağlar. `||` ilk truthy, `&&` ilk falsy operandı (varsa), aksi hâlde son operandı döndürür. Sonucu zorunlu boolean istiyorsan açık `Boolean(expression)` kullan.

`||` kullanarak default seçmek bazen yanlış olur: `0`, `false` ve `""` de değiştirilir. Bunun çözümü olan `??`, Ders 5'te incelenecek.

## 7. Debugging: kod mu, gereksinim mi yanlış?

Şu gereksinimi test edelim:

> Kullanıcı admin **veya** kayıt sahibi olmalı **ve** blocked olmamalı.

| Admin | Owner | Blocked | Beklenen izin |
|---|---|---|---|
| `true` | `false` | `false` | `true` |
| `false` | `true` | `false` | `true` |
| `true` | `false` | `true` | `false` |
| `false` | `false` | `false` | `false` |

Bu tablo koddan *önce* yazılabilir. Özellikle üçüncü satır, eksik parantez bug'ını yakalar. Testi yalnız happy path ile sınırlamak aynı bug'ı gizleyebilir.

## 8. Mülakat hazırlığı

**Question: What is the difference between `&&`, `||`, and `!`?**

> `&&` evaluates to its first falsy operand or the last operand, while `||` returns its first truthy operand or the last operand. `!` converts truthiness to the opposite boolean. When the operands are boolean, these express AND, OR, and NOT conditions.

**Türkçe:** AND/OR mantığının yanında JavaScript'te operand değerlerinin dönebildiği ayrımını da bilmek gerekir. `!` ise her zaman boolean döndürür.

**Question: Why use parentheses in complex conditions?**

> They make the intended grouping explicit. `&&` has higher precedence than `||`, so missing parentheses can silently change access-control logic.

## 9. Pekiştirme

1. `true || false && false` sonucu nedir ve nasıl gruplanır?
2. `status === "open" || "pending"` ifadesini düzelt.
3. `isAdmin = true`, `isOwner = false`, `isBlocked = true` için iki farklı yazımın sonucunu hesapla: `isAdmin || isOwner && !isBlocked` ve `(isAdmin || isOwner) && !isBlocked`.
4. `10 && "ready"` neden `true` değil de string döndürür?

<details><summary>Kontrol cevapları</summary>

1. `true`, çünkü `true || (false && false)`.
2. `status === "open" || status === "pending"`.
3. İlk ifade `true`, doğru gruplanmış ifade `false`.
4. `&&` ilk falsy operandı, yoksa son operandı döndürür; ikinci operand `"ready"`.
</details>

## 10. Sonraki ders

Bir mantıksal operatörün sağ tarafındaki fonksiyon **her zaman çağrılır mı?** Ders 4 — Short-Circuit Evaluation bunun çalışma zamanındaki karşılığını gösterir.
