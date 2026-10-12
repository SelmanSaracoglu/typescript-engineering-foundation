# Ders 5 — sort(), comparator ve mutation

## 1. `sort` orijinal array'i değiştirir

```ts
const numbers = [30, 10, 20];
const sorted = numbers.sort((a, b) => a - b);

console.log(sorted);  // [10, 20, 30]
console.log(numbers); // [10, 20, 30]
console.log(sorted === numbers); // true
```

`sort` **yerinde (in-place)** sıralama yapar ve **aynı array referansını döndürür**. Yeni değişken tanımlamak yeni array yaratmaz. `const` değişkenin başka array'e atanmasını engeller, elemanların yeniden sıralanmasını değil.

## 2. Varsayılan sıralama tuzağı

```ts
const prices = [100, 20, 3, 50];
prices.sort();
console.log(prices); // [100, 20, 3, 50]
```

Comparator yoksa sayılar da varsayılan olarak string karşılıklarına göre sıralanır. `"100"`, `"20"`'den önce gelir. Numerik sıralama için:

```ts
const prices = [100, 20, 3, 50];
prices.sort((a, b) => a - b);
console.log(prices); // [3, 20, 50, 100]

prices.sort((a, b) => b - a);
console.log(prices); // [100, 50, 20, 3]
```

## 3. Comparator'ın kuralı

| Callback sonucu | Anlamı |
| --- | --- |
| Negatif sayı | `a`, `b`'den önce |
| Pozitif sayı | `b`, `a`'dan önce |
| `0` | Kıyaslama açısından eşit |

`sort` hangi çiftleri hangi sırada karşılaştıracağını kendi belirler. Comparator'a sıralama dışında yan etki görevi vermek güvenilir değildir.

## 4. Kaynak listeyi korumak

```ts
const scores = [80, 100, 60];
const ranking = [...scores].sort((a, b) => b - a);

console.log(scores); // [80, 100, 60]
console.log(ranking); // [100, 80, 60]
console.log(ranking === scores); // false
```

`[...scores]` önce yeni array üretir, `sort` artık bu array'i mutate eder. Fakat bu **shallow copy**'dir:

```ts
const items = [{ id: 1, score: 4 }];
const copy = [...items];
copy[0].score = 9;
console.log(items[0].score); // 9
```

Array'ler ayrı olsa bile içindeki nesne referansı aynıdır.

## 5. Debugging düşüncesi

**Beklenti:** Sadece raporda puana göre sıra değişecek; kaynak kayıt sırası korunacak. **Gözlem:** Rapor oluşturulduktan sonra orijinal kayıtların sırası da değişti. **Hipotez:** Doğrudan `records.sort(...)` kullanıldı. **Düzeltme:** Gereksinim kaynak array'i korumayı gerektiriyorsa kopyayı sırala.

## 6. Pekiştirme

- `sort` dönüş değerini başka değişkende saklamak neden mutation'ı önlemez?
- Numerik sıralamada niçin comparator kullanırız?
- Sığ kopya ile array sırasını korumak ve nesne içindeki property mutation'ını önlemek neden ayrı problemlerdir?
