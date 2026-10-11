# Ders 9 — Array Destructuring: Pozisyona Göre Değer Çıkarma

> **Öğrenme yolu:** [JavaScript dizini](../README.md) → [Bölüm 2](./README.md)  
> **Önkoşul:** Array, index, `undefined`, [Object Destructuring](./01-object-destructuring.md).  
> **Hedef:** Array destructuring'in sıra temelli olduğunu açıklamak; atlama, default, nested referans ve fonksiyon dönüşlerini doğru yorumlamak.

## 1. Ne problemi çözüyor?

Array'den birkaç değer okumak için index kullanabiliriz:

```ts
const thresholds = [10, 20, 30];
const first = thresholds[0];
const second = thresholds[1];
```

Bu doğru bir çözümdür. **Array destructuring**, elemanları index sırasına göre değişkenlere bağlamayı kolaylaştırır:

```ts
const thresholds = [10, 20, 30];
const [first, second] = thresholds;
console.log(first, second); // 10 20
```

**Tanım:** Array destructuring, bir array gibi iterable kaynaktan değerleri **pozisyonlarına göre** yerel değişkenlere aktarmaya yarayan bir bağlama/atama sözdizimidir. İlk aşamada array'lere odaklanıyoruz; iterator protokolünü bu derste derinleştirmiyoruz.

## 2. Çalışma sırası ve object destructuring farkı

```ts
const labels = ["alpha", "beta", "gamma"];
const [a, b, c] = labels;
```

1. `labels` değerlendirilir.
2. İlk eleman `a`'ya, ikinci `b`'ye, üçüncü `c`'ye bağlanır.
3. Değişken isimleri (`a`, `b`, `c`) elemanlarla eşleşmeyi etkilemez.

```ts
const values = ["A", "B"];
const [second, first] = values;
console.log(second, first); // A B
```

Değişken adları anlamlı olsa da yanlış sırayla yazılırsa yanlış veriyi taşır.

| Karşılaştırma | Object destructuring | Array destructuring |
|---|---|---|
| Eşleştirme anahtarı | Property adı | Eleman pozisyonu |
| Pattern | `{ name, age }` | `[first, second]` |
| Sırayı değiştirince | İsimler aynıysa sonuç değişmez | Eşleşme değişir |
| Eksik değer | Genellikle `undefined` | Genellikle `undefined` |

## 3. Atlanan elemanlar ve kullanılmayan değerler

Her elemanı kullanmak zorunda değiliz:

```ts
const values = ["first", "middle", "last"];
const [first, , last] = values;
console.log(first, last); // first last
```

İki virgül arasında değişken adı yoktur. İkinci pozisyondaki değer yerel değişkene bağlanmaz. Bu, array'den elemanı silmez veya index'leri değiştirmez.

```ts
console.log(values); // ["first", "middle", "last"]
```

**Dikkat:** Bir array'in büyüklüğü, sırası veya elemanlarının mevcut olması üzerinde garanti olmadan yanlış index'i seçmek mantık hatası üretebilir.

## 4. Varsayılan değer ve `undefined` ayrımı

Array beklenen pozisyondan kısa olduğunda eksik değer `undefined` olarak elde edilebilir:

```ts
const values = [10];
const [first, second] = values;
console.log(first, second); // 10 undefined
```

Default yalnız `undefined` için uygulanır:

```ts
const values: Array<number | null | undefined> = [0, null, undefined];
const [a = 10, b = 20, c = 30] = values;
console.log(a, b, c); // 0 null 30
```

`0` geçerli bir değerdir; `null` da `= default` ifadesini tetiklemez. Bu, Object Destructuring ile **aynı default kuralı**dır. `??`, `null` ve `undefined` için ortak fallback gerekiyorsa daha uygundur.

```ts
const attempts: Array<number | null> = [null];
const [firstAttempt] = attempts;
console.log(firstAttempt ?? 3); // 3
```

## 5. Nested array ve object elemanlar

Birden fazla katmanda destructuring yapabiliriz:

```ts
const matrix = [[10, 20], [30, 40]];
const [[topLeft, topRight], [bottomLeft]] = matrix;
console.log(topLeft, topRight, bottomLeft); // 10 20 30
```

Bir array'in içindeki object'i de okuyabiliriz:

```ts
const users = [{ id: 101, name: "Alex" }, { id: 102, name: "Sam" }];
const [{ name: firstName }, { id: secondId }] = users;
console.log(firstName, secondId); // Alex 102
```

Ancak nested pattern eksik bir ara değerin içerisini okumaya çalışırsa runtime hatası çıkabilir. Yeni başlayan biri için her şeyi tek satır nested destructuring ile yazmak yerine bazen iki adım daha okunabilirdir.

```ts
const users = [{ name: "Alex" }];
const [firstUser] = users;
const firstName = firstUser?.name ?? "Unknown";
console.log(firstName); // Alex
```

## 6. Array elemanı object ise referans paylaşılır

```ts
const items = [{ quantity: 1 }, { quantity: 2 }];
const [firstItem] = items;
firstItem.quantity = 9;
console.log(items[0].quantity); // 9
```

Yeni bir `firstItem` değişkeni oluşturuldu, ama yeni bir iç object oluşturulmadı. İki referans aynı object'e işaret eder. Sonucu anlamak için **değişkenin kendisi** ile **işaret ettiği değerin identity'sini** ayır.

Karşılık olarak primitive değeri değiştirmenin object üzerinde etkisi yoktur:

```ts
const numbers = [5];
let [first] = numbers;
first = 10;
console.log(numbers[0], first); // 5 10
```

## 7. Yer değiştirme (swap) ve fonksiyon sonucunu açmak

Destructuring assignment ile değişkenleri geçici bir değişken kullanmadan yer değiştirebiliriz:

```ts
let left = "A";
let right = "B";
[left, right] = [right, left];
console.log(left, right); // B A
```

Burada `const [..] = ...` yerine **atama ifadesi** kullanılır. Söz dizimi benzer, fakat var olan değişkenler yeniden atanır.

Fonksiyondan `[value, message]` gibi sabit pozisyonlu bir tuple döndürülebilir:

```ts
function parsePort(text: string): [number | null, string] {
  const port = Number(text);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return [null, "INVALID_PORT"];
  }
  return [port, "OK"];
}

const [port, status] = parsePort("8080");
console.log(port, status); // 8080 OK
```

**Tasarım notu:** Tuple elemanlarının pozisyonlarını yanlış okuyup karıştırmak mümkündür. Çok sayıda veya anlamı belirsiz alan varsa `{ value, error }` gibi isimlendirilmiş bir object daha okunabilir olabilir. Burada `parsePort` yalnızca küçük örnektir, genel parsing güvenlik kütüphanesi değildir.

## 8. Rest ile kalan elemanları toplamak: Önizleme

```ts
const numbers = [10, 20, 30, 40];
const [first, ...remaining] = numbers;
console.log(first);     // 10
console.log(remaining); // [20, 30, 40]
```

Bu yeni sözdiziminin adı **Rest Syntax**'tır. Görevi `remaining` array'inde kullanılmayan değerleri toplamaktır. Tam mantığını [Ders 11](./04-rest.md)'de öğreneceğiz. Dış array yenidir, fakat nested object'ler referanslarını paylaşabilir.

## 9. Gerçekçi örnek: Test sonucu çiftini okumak

```ts
type CheckResult = readonly [boolean, string];

function checkMinimum(value: number): CheckResult {
  return value >= 10 ? [true, "PASS"] : [false, "TOO_SMALL"];
}

const [passed, reason] = checkMinimum(8);
console.log(passed, reason); // false TOO_SMALL
```

Birim testte çağrı sonucunu okurken ilk elemanın boolean, ikinci elemanın açıklama olduğunu bilmemiz gerekir. Array destructuring bu sırayı otomatik doğrulamaz; tuple modeli okunabilirliği ve static type checking'i destekler.

## 10. Hata analizi ve debugging

- Yanlış değişken mi doldu? Array'in **pozisyonunu** kontrol et; isme göre eşleşme yok.
- Beklenmedik `undefined` mi var? Array daha kısa olabilir, eleman boş olabilir.
- Varsayılan neden `null` için çalışmadı? `= default` yalnız `undefined` için çalışır.
- Beklenmedik mutation mı oldu? Destructure edilen eleman nested object olabilir.
- Nested destructuring sırasında TypeError mı aldın? Beklenen iç array/object eksik olabilir.
- Fonksiyon tuple döndürüyorsa eleman sırası değişti mi? İsimlendirilmiş object dönüşü daha açık olabilir.

## 11. Mülakat hazırlığı

**Question: What is array destructuring, and how is it different from object destructuring?**

> Array destructuring binds values to variables by position. It allows skipping elements, defaults and nested patterns. Object destructuring selects properties by name instead. Both can preserve references to nested objects; neither performs a deep clone.

**Türkçe:** Array destructuring değerleri sıraya göre değişkenlere aktarır; object destructuring property adına göre aktarır. İkisinde de default yalnız `undefined` ile devreye girer; nested object referansları paylaşılabilir.

**Follow-up: Does destructuring remove elements from the original array?**  
Hayır. Okuma işlemi orijinal array'i silmez veya küçültmez.

## 12. Pekiştirme

1. `["A", "B", "C"]` kaynağından ilk ve üçüncü elemanı al; orta elemanı atla.
2. `const [a = 5, b = 6] = [0, undefined]` için sonucu açıkla.
3. `const [item] = [{ active: false }]; item.active = true;` neyi değiştirir?
4. `parsePort("0")` ile `parsePort("65535")` sonuçlarını tahmin et.
5. Üç pozisyon döndüren tuple mı, isimli object mi daha okunur? Gerekçelendir.

**Kısa kontrol:** (2) `a=0`, `b=6`; (3) array'in ilk object elemanını; (4) `[null, "INVALID_PORT"]` ve `[65535, "OK"]`.

**Sonraki ders:** [Spread Syntax](./03-spread.md). **Kanıt:** Ders notları tek başına bağımsız implementation veya test başarısı değildir.
