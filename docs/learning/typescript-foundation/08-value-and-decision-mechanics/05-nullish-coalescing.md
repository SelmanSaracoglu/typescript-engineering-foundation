# Ders 5 — Nullish Coalescing: `??` ve doğru varsayılan değer seçimi

## 1. Hangi problemi çözüyor?

Bir ayarın değeri bulunmazsa varsayılan bir değer seçmek isteriz. Ama **bulunmayan değer** ile **mevcut fakat falsy değer** aynı şey değildir.

Örneğin kullanıcının:

- `retries = 0` tercihi olabilir (hiç tekrar deneme),
- `notificationsEnabled = false` tercihi olabilir (bildirim kapalı),
- `nickname = ""` tercihi olabilir (gösterilecek takma ad yok).

Bunlar yanlışlıkla varsayılan değerle değiştirilmemelidir. `||` tüm falsy değerler için fallback seçebilir; `??` yalnızca **`null` veya `undefined`** için seçer.

**Tanım:** `left ?? right` ifadesi, `left` nullish (`null` ya da `undefined`) ise `right` sonucunu; değilse doğrudan `left` değerini döndürür.

## 2. `||` ve `??` aynı değildir

```ts
const retries = 0;
console.log(retries || 3); // 3 — 0 kayboldu
console.log(retries ?? 3); // 0 — 0 korundu
```

Adım adım:

- `0 || 3` → `0` falsy; sağdaki `3` değerlendirilir ve döner.
- `0 ?? 3` → `0`, ne `null` ne `undefined`; sol değer korunur, sağ operandın değerlendirilmesine gerek yoktur.

| Sol değer | `left || "fallback"` | `left ?? "fallback"` |
|---|---|---|
| `undefined` | `"fallback"` | `"fallback"` |
| `null` | `"fallback"` | `"fallback"` |
| `false` | `"fallback"` | `false` |
| `0` | `"fallback"` | `0` |
| `""` | `"fallback"` | `""` |
| `"Alex"` | `"Alex"` | `"Alex"` |

Burada sağ operand bir string olduğu için tabloda farklı tip sonuçlar görebiliriz. JavaScript, `??` sonucunu otomatik belirli bir tipe dönüştürmez.

## 3. Birden fazla gerçekçi örnek

### Retry sayısı

```ts
function effectiveRetries(requested: number | undefined): number {
  return requested ?? 3;
}
console.log(effectiveRetries(0));         // 0
console.log(effectiveRetries(2));         // 2
console.log(effectiveRetries(undefined)); // 3
```

`0` geçerli olduğu için korunur. `undefined` ise "bilgi verilmedi" olarak modellenmiştir.

### Boolean tercihi

```ts
function notifications(requested: boolean | null): boolean {
  return requested ?? true;
}
console.log(notifications(false)); // false
console.log(notifications(null));  // true
```

`false` kullanıcının bilinçli tercihi olabilir; `|| true` yazılsaydı bildirimler yanlışlıkla yeniden açılırdı.

### Boş string

```ts
function displayNickname(nickname: string | undefined): string {
  return nickname ?? "Guest";
}
console.log(displayNickname(""));        // ""
console.log(displayNickname(undefined)); // "Guest"
```

Boş string'in geçerli sayılıp sayılmayacağı gereksinime bağlıdır. `??`, boş string'i korur; eğer gereksinim boş string'i de reddediyorsa bunu **ayrı kontrol** etmeliyiz.

## 4. Short-circuit: fallback fonksiyonu ne zaman çalışır?

```ts
let fallbackCalls = 0;
function computeDefault(): number {
  fallbackCalls++;
  return 3;
}

const retries = 0;
const result = retries ?? computeDefault();
console.log(result);        // 0
console.log(fallbackCalls); // 0
```

Sol değer nullish olmadığı için fonksiyon çağrılmıyor. Bu davranış Ders 4'teki short-circuit mantığının devamıdır.

```ts
let fallbackCalls = 0;
function computeDefault(): number {
  fallbackCalls++;
  return 3;
}

const retries: number | undefined = undefined;
const result = retries ?? computeDefault();
console.log(result);        // 3
console.log(fallbackCalls); // 1
```

## 5. `??` validation değildir

`??`, sadece iki değerin yokluğunu kontrol eder. Başka hatalı değerleri düzeltmez. Buradaki sabit değerli örnekler JavaScript değerlendirmesini göstermektedir; TypeScript bariz nullish-olmayan literal için ayrıca uyarı verebilir:

```js
console.log(-5 ?? 10);       // -5
console.log(NaN ?? 10);      // NaN
console.log("wrong" ?? 10); // "wrong"
```

`-5` geçersiz fiyat olabilir; ama nullish değildir. `NaN`, JavaScript'te number tipinde olsa da nullish değildir. `??` bunları kabul veya reddetme sorumluluğunu üstlenmez.

```ts
function validRetryCount(raw: number | undefined): number | null {
  const value = raw ?? 3;
  if (!Number.isInteger(value) || value < 0) return null;
  return value;
}
console.log(validRetryCount(-5)); // null
console.log(validRetryCount(0));  // 0
```

Bu örnek varsayılan değer seçimi ve iş kuralı doğrulamasını bilinçli olarak ayırır.

## 6. Syntax kuralı: `??`, `&&` ve `||`

JavaScript, `??` operatörünü `&&`/`||` ile **parantezsiz doğrudan** karıştırmaya izin vermez:

```js
// SyntaxError — PARANTEZSİZ GEÇERSİZ
// const value = a ?? b || c;
```

Niyetini açıkça belirt:

```ts
const a: number | null = null;
const b = 0;
const c = 5;

console.log((a ?? b) || c); // 5
console.log(a ?? (b || c)); // 5
```

İki örneğin aynı sonucu üretmesi bütün input'larda eşdeğer oldukları anlamına gelmez. Asıl önemli olan **hangi kararın önce uygulanacağını** açıkça göstermektir.

## 7. `??` ve destructuring default farkı

Bölüm 2'de destructuring sırasında şöyle bir default kullanılır:

```ts
const data: { nickname?: string | null } = { nickname: null };
const { nickname = "Guest" } = data;
console.log(nickname); // null
```

Destructuring `= "Guest"`, yalnızca değer `undefined` ise devreye girer. `null` olduğunda devreye girmez.

Aynı değer için:

```ts
const data: { nickname?: string | null } = { nickname: null };
console.log(data.nickname ?? "Guest"); // "Guest"
```

Bu fark, mülakatlarda sık sorulur. Aynı `default` kelimesi kullanılsa da mekanizmalar farklıdır.

## 8. Debugging ve test tasarımı

**Problem:** `retryCount = 0` olmasına rağmen 3 kez deneme yapılıyor.

**İzleme:**

1. Gelen runtime değer gerçekten `0` mı?
2. Kod `retries || 3` mi kullanıyor?
3. Requirement `0` değerini geçerli sayıyor mu?
4. `??` düzeltmesinden sonra `undefined` yine 3 üretiyor mu?

| Test verisi | Beklenen |
|---|---|
| `undefined` | 3 |
| `null` (model izin veriyorsa) | 3 |
| `0` | 0 |
| `2` | 2 |
| `-1` | İş kuralına göre ayrıca reddedilmeli |

**Önemli:** `??` yalnızca nullish olmayı kontrol eder, `-1` gibi geçersiz değeri yakalayacak testi biz tasarlarız.

## 9. Mülakat hazırlığı

**Question: What is the difference between `||` and `??` in JavaScript?**

> `||` uses the right-hand operand when the left-hand operand is falsy. `??` uses it only when the left-hand operand is `null` or `undefined`. I use `??` when values such as zero, false, or an empty string are valid and should not be overwritten.

**Türkçe açıklama:** `||` tüm falsy değerlerde fallback yapabilir; `??` yalnız nullish değerlerde yapar. Geçerli sıfır/false/boş string tercihlerini korumak için `??` uygundur.

**Question: Does nullish coalescing validate data?**

> No. It only provides a fallback for `null` and `undefined`. Invalid non-nullish values still require separate validation.

## 10. Pekiştirme

1. `false ?? true` ve `false || true` sonuçları nedir?
2. `"" ?? "Guest"` ve `"" || "Guest"` sonuçlarını karşılaştır.
3. `price = -5` için neden `price ?? 0` yeterli güvenlik kontrolü değildir?
4. `??` ile `||` birlikte yazılacaksa syntax açısından ne yapmalıyız?

<details><summary>Kontrol cevapları</summary>

1. `false` ve `true`.
2. `""` ve `"Guest"`.
3. `-5` nullish değildir; negatif fiyat kuralı ayrı doğrulanmalıdır.
4. Gruplamayı parantezle açıklamalıyız: örn. `(a ?? b) || c`.
</details>
