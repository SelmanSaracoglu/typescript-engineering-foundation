# Ders 1 — Sync vs Async & Promise States

## 1. Neden öğreniyoruz?

Bir fonksiyonun çağrıldığında **ne döndürdüğü** ile işlemin başarılı **sonuç değerinin ne olduğu** farklı olabilir. TypeScript kodunu doğru okuyabilmek için bu iki şeyi ayırırız.

## 2. Senkron sonuç

```ts
function double(value: number): number {
  return value * 2;
}

const result = double(5);
console.log(result); // 10
```

- `double(5)` çağrılır; hesaplama tamamlanır ve çağırana `10` döner.
- `result` değişkeninin tipi `number` ve değeri `10` olur.
- Çağrı tamamlandığında değer hazırdır.

## 3. Promise ile temsil edilen sonuç

```ts
function getNumber(): Promise<number> {
  return Promise.resolve(10);
}

const result = getNumber();
```

- `getNumber()` çağrısı **`Promise<number>` nesnesi** döndürür.
- `result` değişkeni fonksiyonu değil, fonksiyon çağrısının döndürdüğü Promise'i tutar.
- Promise başarıyla tamamlandığında sonuç `10`'dur. Buna rağmen `result` doğrudan `10` değildir.
- `Promise.resolve(10)` bu örnekte *zaten fulfilled* bir Promise oluşturur. Her Promise mutlaka uzun süre beklemez.

**Zihinsel model:** Promise, asenkron işlemin sonucunu temsil eden nesnedir; sonuç değerinin kendisi değildir.

## 4. Promise durumları (states)

| State | Anlamı |
| --- | --- |
| `pending` | Henüz başarı veya hata ile tamamlanmamıştır |
| `fulfilled` | Başarıyla tamamlanmış; bir sonuç değeri vardır |
| `rejected` | Başarısız tamamlanmış; bir rejection nedeni vardır |

`pending → fulfilled` veya `pending → rejected` olabilir. Settled olmuş Promise sonradan başka bir state'e geçmez.

```ts
const ok = Promise.resolve(42); // fulfilled, sonuç 42
const failed = Promise.reject(new Error("Failed")); // rejected
```

**Not:** İkinci örnekte rejected Promise, ele alınmadan gerçek programda çalıştırılırsa unhandled-rejection uyarısı/hatası yaratabilir. Bu satırlar tek başına uygulama önerisi değil, state örnekleridir.

## 5. Sık hata: Promise'i sayı sanmak

```ts
const result = getNumber();
// result + 5 → number hesabı değildir; Promise<number> ile number karışıyor.
```

Çözüm yolu bir sonraki derste `await` ile başarılı sonucu elde etmektir.

## 6. Düşün ve açıkla

```ts
const a = double(4);
const b = getNumber();
```

`a` ve `b` değişkenlerinin tipleri nedir? Hangisi doğrudan sayı tutar? `b` için başarılı sonuç hangi değerdir?

**Kanıt sınırı:** Açıklama ve örnek; bağımsız repo uygulaması henüz yok.
