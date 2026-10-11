# Ders 4 — Short-Circuit Evaluation: JavaScript ne zaman durur?

## 1. Short-circuit neden önemlidir?

JavaScript bir ifadeyi değerlendirirken bazı sonuçlar ilk operanddan bellidir. Böyle bir durumda ikinci operandı değerlendirmesi gerekmez. Bu özelliğe **short-circuit evaluation (kısa devre değerlendirme)** denir.

Bu, yalnız performans konusu değildir. Sağ operand bir **fonksiyon çağrısı**, **loglama**, **hata atabilecek property erişimi** veya **side effect** içeriyorsa programın davranışı değişir.

Üç temel kural:

- `a && b` → `a` falsy ise `b` değerlendirilmez.
- `a || b` → `a` truthy ise `b` değerlendirilmez.
- `a ?? b` → `a` nullish **değilse** `b` değerlendirilmez (Ders 5).

## 2. `&&`: ilk falsy operand veya son değer

```ts
function checkAccess(): boolean {
  console.log("Checking access");
  return true;
}

const isEnabled = false;
const result = isEnabled && checkAccess();
console.log(result);
```

Çıktı yalnız:

```text
false
```

`"Checking access"` yazılmaz; fonksiyon **çağrılmamıştır**.

**Yürütme izleme:**

1. `isEnabled` okunur → `false`.
2. `&&`, sol operand falsy olduğu için bunu sonuç olarak seçer.
3. Sağdaki `checkAccess()` yürütülmez.
4. `result` değeri `false` olur.

Sol taraf true olsaydı fonksiyon çağrılırdı:

```ts
function checkAccess(): boolean {
  console.log("Checking access");
  return true;
}

const isEnabled = true;
const result = isEnabled && checkAccess();
console.log(result);
// Checking access
// true
```

## 3. `||`: ilk truthy operand veya son değer

```ts
function getFallbackName(): string {
  console.log("Fallback called");
  return "Guest";
}

const name = "Alex";
const label = name || getFallbackName();
console.log(label);
// Alex
```

`name` truthy olduğu için fallback fonksiyonu çalışmaz. İfade "Alex" string'ini döndürür, boolean `true` değerini değil.

```ts
function getFallbackName(): string {
  console.log("Fallback called");
  return "Guest";
}

const name = "";
const label = name || getFallbackName();
console.log(label);
// Fallback called
// Guest
```

İkinci örnekte boş string falsy'dir; sağ taraf değerlendirilir.

## 4. Operatör sonucunun neden boolean olmadığını anlamak

İki mantıksal operatörün davranışını yan yana düşün:

| İfade | Sonuç | Neden? |
|---|---|---|
| `0 && "run"` | `0` | İlk falsy |
| `10 && "run"` | `"run"` | Solda falsy yok, son operand |
| `"Alex" || "Guest"` | `"Alex"` | İlk truthy |
| `"" || "Guest"` | `"Guest"` | İlk operand falsy |
| `null && 5` | `null` | İlk falsy |

İş kuralı bir boolean istiyorsa iki tarafın da boolean olması veya `Boolean(...)` ile açık dönüştürme yapılması daha okunaklı olabilir.

```ts
function hasNonEmptyText(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}
console.log(hasNonEmptyText("A")); // true
console.log(hasNonEmptyText(5));   // false
```

Bu örnekte `typeof value === "string"` false olduğunda `.length` erişimi çalıştırılmaz. Ayrıca TypeScript, `&&` zincirindeki tipi daraltır.

## 5. Side effect ve evaluation order

```ts
let calls = 0;
function incrementAndApprove(): boolean {
  calls += 1;
  return true;
}

false && incrementAndApprove();
true || incrementAndApprove();
console.log(calls); // 0

true && incrementAndApprove();
console.log(calls); // 1
```

Bir fonksiyonun sağ operand olarak **yazılması**, onun her zaman çalışacağı anlamına gelmez.

**Test tasarımı açısından:** Bir mock fonksiyonun çağrılması bekleniyorsa önce hangi branch'in etkin olduğunu tespit et. Testin başarısız olmasının nedeni bazen fonksiyon içeriği değil, kısa devre nedeniyle hiç çağrılmamasıdır.

## 6. Kısa devre ve güvenli property erişimi

Eski bir JavaScript kalıbı:

```ts
function getCity(user: { profile?: { city: string } } | null): string | null | undefined {
  return user && user.profile && user.profile.city;
}

console.log(getCity(null)); // null
```

Burada `user` falsy ise property erişimi atlanır. Ancak sonuç `null` veya `undefined` gibi farklı falsy değerler olabilir; kod okumak zorlaşabilir.

Modern TypeScript'te aynı amaç için daha açık **optional chaining** kullanılır (Ders 12): `user?.profile?.city`. Bu ifade nullish durumda `undefined` döndürür. İki yapı sonuç ve davranış bakımından **her zaman birebir eşdeğer değildir**; `&&` tüm falsy değerlerde, `?.` yalnız nullish değerlerde durur.

## 7. Short-circuit ve fallback bug'ı

Bir konfigürasyonda `retries = 0` geçerli ve anlamlıdır (örneğin hiç tekrar deneme):

```ts
function getRetries(retries: number | undefined): number {
  return retries || 3;
}
console.log(getRetries(0)); // 3 — iş kuralı açısından yanlış
```

Burada kısa devre doğru çalışıyor; **yanlış olan operatör seçimi**. `0` falsy olduğundan sağ operand seçiliyor. Eksik değer için fallback isteniyorsa `??` kullanılmalıdır:

```ts
function getRetries(retries: number | undefined): number {
  return retries ?? 3;
}
console.log(getRetries(0));         // 0
console.log(getRetries(undefined)); // 3
```

## 8. Debugging yöntemi: önce yürütme sırasını çıkar

Bir ifade beklenmeyen sonuç ürettiyse:

1. Sol operandın runtime değerini ve truthiness sonucunu belirle.
2. `&&` mi `||` mi kullanılmış? Sağ operandın değerlendirilme koşulunu yaz.
3. Sağ operand fonksiyon çağrısıysa gerçekten çağrılıp çağrılmadığını kontrol et.
4. Sonucun boolean mı, yoksa operandın kendisi mi olduğunu belirle.
5. Gereksinimin **falsy** mi **nullish** mi kabul ettiğini netleştir.

### Küçük test tablosu

| Sol operand | İşlem | Sağ fonksiyon çağrılır mı? |
|---|---|---|
| `false` | `&&` | Hayır |
| `true` | `&&` | Evet |
| `"Alex"` | `||` | Hayır |
| `""` | `||` | Evet |
| `0` | `??` | Hayır |
| `undefined` | `??` | Evet |

## 9. Mülakat hazırlığı

**Question: What is short-circuit evaluation in JavaScript?**

> JavaScript evaluates logical expressions from left to right and can stop before evaluating the right-hand operand. With `&&`, it stops when it finds a falsy value. With `||`, it stops when it finds a truthy value. This matters when the right-hand side calls a function or causes a side effect.

**Türkçe açıklama:** Sonuç soldaki değerden belirlenebiliyorsa sağdaki ifade hiç çalışmaz. Bu, fonksiyon çağrısının ve side effect'in gerçekleşip gerçekleşmeyeceğini etkiler.

**Question: Do `&&` and `||` always return booleans?**

> No. They return one of their operand values. For example, `0 || 5` evaluates to `5`, while `10 && "ready"` evaluates to the string `"ready"`.

## 10. Pekiştirme

1. `"OK" || log()` için `log` çalışır mı? Neden?
2. `0 && 99` sonucu ve tipi nedir?
3. Bir `isEnabled && sendAlert()` ifadesi hiç alert üretmiyor. İlk hangi değeri kontrol edersin?
4. `false || "fallback"` sonucu neden boolean değildir?

<details><summary>Kontrol cevapları</summary>

1. Hayır; sol operand truthy'dir.
2. Number `0`; ilk falsy operand döner.
3. `isEnabled` değerini ve koşulun business rule'unu.
4. `||` ikinci operand string'i döndürür.
</details>
