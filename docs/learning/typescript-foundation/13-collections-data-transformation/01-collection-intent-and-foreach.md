# Ders 1 — Collection Intent & forEach

## 1. Neden öğreniyoruz?

Array üzerinde hangi işlemi yapacağımıza **niyet** karar verir: her elemanda yan etki, yeni değere dönüşüm, koşula göre seçim, tek kayıt arama, boolean kontrolü veya aggregation. Array method'ları callback alan **higher-order function** örnekleridir. Callback'in dönüş değeri ile method'un dönüş değeri aynı şey olmayabilir.

## 2. Önce imperative `for...of`

```ts
const prices = [10, 20, 30];
const discounted: number[] = [];

for (const price of prices) {
  discounted.push(price * 0.9);
}
console.log(discounted); // [9, 18, 27]
```

Burada yeni array'i biz oluşturduk. Her iteration'da elemanı alıp çarptık ve `push` ile yeni array'e koyduk. Aynı dönüşüm niyetini `map` daha doğrudan anlatır:

```ts
const prices = [10, 20, 30];
const discounted = prices.map(price => price * 0.9);
console.log(discounted); // [9, 18, 27]
```

`map` yalnız kısa olduğu için değil, **her elemandan bir sonuç üretme** amacını gösterdiği için uygundur.

## 3. `forEach`: Her elemanda bir işlem

```ts
const prices = [10, 20, 30];

prices.forEach(price => {
  console.log("Fiyat:", price);
});
// Fiyat: 10
// Fiyat: 20
// Fiyat: 30
```

Her mevcut eleman için callback çağrılır. Log yazmak gibi **side effect** için uygundur. Yan etki, fonksiyon dışından gözlenebilen işlem veya state değişikliğidir. `forEach` yeni dönüştürülmüş array üretmek için tercih edilmez.

## 4. Callback return ≠ method return

```ts
const output = [2, 4, 6].forEach(n => {
  return n * 2;
});

console.log(output); // undefined
```

Callback 4, 8, 12 değerlerini döndürür; ancak `forEach` bunları toplamaz ve **method'un kendisi `undefined` döndürür**. Callback içindeki `return` yalnız o callback çağrısını bitirir.

| İhtiyaç | Uygun method |
| --- | --- |
| Her fiyatı konsola yaz | `forEach` |
| Yeni indirimli fiyat listesi | `map` |
| Belirli fiyatları seç | `filter` |
| Tek toplam üret | `reduce` |

## 5. Bug / debugging düşüncesi

**Beklenti:** `[4, 8, 12]`. **Gözlem:** `undefined`. **Neden:** `forEach` sonucunu yeni array sanmak. **Düzeltme:** Gerçek ihtiyaç dönüşümse `map` kullanmak.

## 6. Pekiştirme

Kayıtları tek tek konsola raporlamak ile her kaydın uzunluğundan yeni bir array üretmek için iki farklı method seçip nedenini açıkla. Program çalıştırmadan önce neyin döneceğini tahmin et.

**Sınır:** Async callback / Promise burada değil, I7'de ele alınır.
