# Ders 4 — Chaining & reduce

## 1. Method zinciri: Çıktı sonraki aşamanın girdisi

```ts
const products = [
  { name: "Laptop", active: true },
  { name: "Mouse", active: false },
  { name: "Keyboard", active: true }
];

const names = products
  .filter(product => product.active)
  .map(product => product.name);

console.log(names); // ["Laptop", "Keyboard"]
```

| Aşama | Veri |
| --- | --- |
| Başlangıç | Üç ürün nesnesi |
| `filter` sonrası | Laptop ve Keyboard nesneleri |
| `map` sonrası | ["Laptop", "Keyboard"] |

Her method'un döndürdüğü yeni array, sonraki method'un üzerinde çalıştığı veridir. Uzun zincirler yerine gerektiğinde `activeProducts` gibi ara değişken kullanmak debugging'i kolaylaştırır.

## 2. İşlem sırasının anlamı

```ts
const prices = [90, 110, 200];
const first = prices
  .filter(p => p >= 100)
  .map(p => p * 0.9); // [99, 180]

const second = prices
  .map(p => p * 0.9)
  .filter(p => p >= 100); // [180]
```

`first` **indirim öncesi** fiyatı 100 ve üzeri olanları seçer. `second` **indirimden sonra** 100 ve üzeri kalanları seçer. İkisi de geçerli JavaScript'tir; doğru davranışı **gereksinim** belirler.

## 3. `reduce` ile birden fazla değerden tek sonuç

```ts
const prices = [100, 200, 300];
const total = prices.reduce((sum, price) => sum + price, 0);
console.log(total); // 600
```

- `sum`: accumulator — o ana kadar biriken sonuç.
- `price`: current value — o anda işlenen eleman.
- `0`: initial value — accumulator'ın başlangıcı.

| Adım | Önce sum | price | Sonra sum |
| --- | ---: | ---: | ---: |
| Başlangıç | — | — | 0 |
| 1 | 0 | 100 | 100 |
| 2 | 100 | 200 | 300 |
| 3 | 300 | 300 | 600 |

Callback'in her döndürdüğü değer bir sonraki iteration'ın accumulator'ıdır. Toplam dışında çarpım da yapılabilir:

```ts
const result = [2, 3, 4].reduce((acc, n) => acc * n, 1);
console.log(result); // 24: 1 → 2 → 6 → 24
```

## 4. Initial value ve boş dizide bug

```ts
const empty: number[] = [];
console.log(empty.reduce((sum, n) => sum + n, 0)); // 0
// empty.reduce((sum, n) => sum + n)  // TypeError!
```

Başlangıç değeri verilmezse JavaScript ilk mevcut array elemanını accumulator olarak almaya çalışır ve callback kalan elemanlardan itibaren çalışır. Boş array'de ilk eleman yoktur: runtime hata verir. Başlangıç değerini iş kuralına göre seç.

## 5. Ne zaman `reduce` kullanmamalı?

Yalnız elemanları seçiyorsan `filter`, her birini dönüştürüyorsan `map`, tek kaydı arıyorsan `find` daha açık niyet taşır. `reduce` mümkün diye her problemi karmaşık bir reducer'a çevirme.

## 6. Pekiştirme

- Önce %20 indirim, sonra en az 100 kalan fiyatları seçme kuralında veri akışının her aşamasını yaz.
- Başlangıç değeri 1 olan çarpma reducer'ında accumulator'ın 1 → 2 → 6 → 24 dönüşümünü açıkla.
- Başlangıç değeri olmayan boş dizinin neden hata ürettiğini açıkla.
