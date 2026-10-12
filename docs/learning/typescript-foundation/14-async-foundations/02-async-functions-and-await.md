# Ders 2 — Async Functions & Await

## 1. `async` ne yapar?

`async` bir fonksiyonun başına yazılan JavaScript anahtar kelimesidir. **Async fonksiyon çağırana her zaman Promise döndürür.** İçeride normal değer döndürülmesi bunu değiştirmez.

```ts
function plain(): number {
  return 50;
}

async function asyncValue(): Promise<number> {
  return 50;
}

const a = plain();      // number: 50
const b = asyncValue(); // Promise<number>, başarılı sonuç: 50
```

`b` bir fonksiyon değil, fonksiyon çağrısının döndürdüğü Promise nesnesidir. `async` yazmak fonksiyonun mutlaka zaman alacağını göstermez.

## 2. `await` ne yapar?

`await`, beklenebilir değeri çözümler; Promise için başarılı sonuç değerini verir. Promise henüz tamamlanmamışsa **bulunduğu async fonksiyonun devamını** bekletir, bütün JavaScript yürütmesini değil.

```ts
async function getPrice(): Promise<number> {
  return 100;
}

async function calculateTotal(): Promise<number> {
  const price = await getPrice(); // price: number, değeri 100
  return price + 20;              // logical result: 120
}

const total = calculateTotal();   // Promise<number>; doğrudan 120 değil
```

Önemli ayrım:

| Yer | Değer/tip |
| --- | --- |
| `getPrice()` hemen döndürdüğü | `Promise<number>` |
| `await getPrice()` sonucu | `number` (`100`) |
| `calculateTotal()` çağırana döndürdüğü | `Promise<number>` (başarılı sonuç `120`) |

`await` unutulursa `const price = getPrice()` satırındaki `price`, `Promise<number>` olur. Bu nesneyle `price + 20` geçerli bir sayı işlemi değildir.

## 3. Çalışma sırası: `await` öncesi / sonrası

```ts
console.log("A");

async function run(): Promise<void> {
  console.log("B");
  await Promise.resolve();
  console.log("C");
}

run();
console.log("D");
```

Çıktı:

```text
A
B
D
C
```

Akış: `A` yazılır → `run()` çağrılır, `B` yazılır → `await` sonrasındaki devam ertelenir ve çağırana kontrol bırakılır → dışarıdaki `D` yazılır → bekletilen devam `C` yazar.

Promise zaten fulfilled olsa dahi `await` sonrasındaki devam aynı senkron satırda yürütülmez. Burada ayrıntılı event-loop iç yapısını bilmemiz gerekmiyor.

## 4. Sık yanlış anlamalar

- “`await` fonksiyondan kalıcı olarak çıkar.” **Yanlış:** Devamı askıya alır; hazır olduğunda kaldığı yerden sürdürür.
- “`await` tüm JavaScript'i durdurur.” **Yanlış:** Yalnız ilgili devamı bekletir.
- “Async fonksiyon `return 120` yazdığı için çağıran `120` alır.” **Yanlış:** Çağıran Promise alır.

## 5. Düşün ve açıkla

```ts
async function score(): Promise<number> { return 30; }

async function calculate(): Promise<number> {
  const value = await score();
  return value + 5;
}
```

`value` ne tutar? `calculate()` çağrısı anında hangi tipi döndürür? Bu iki cevabın neden farklı olduğuna dikkat et.

**Sınır:** `await` burada async fonksiyon gövdesinde gösterilir; top-level await veya framework davranışı bu dersin konusu değildir.
