# Ders 2 — map & filter: Dönüştürme ve seçim

## 1. `map`: Her elemana karşılık bir çıktı

```ts
const names = ["Ali", "Ayşe", "Mehmet"];
const lengths = names.map(name => name.length);
console.log(lengths); // [3, 4, 6]
```

`map` callback'in **return ettiği değeri** yeni array'e ekler. Normal bir dolu dizide input ve output uzunluğu eşittir; çıktı değerlerinin tipi farklı olabilir. Örneğin:

```ts
const prices = [50, 120, 200];
console.log(prices.map(price => price >= 100));
// [false, true, true]
```

`map` bu boolean sonuçları *filtre olarak kullanmaz*; yeni array elemanı yapar.

## 2. Önemli hata: `return` unutmak

```ts
const bad = [2, 4, 6].map(n => {
  n * 2; // return yok
});
console.log(bad); // [undefined, undefined, undefined]
```

Süslü parantezli callback gövdesinde açık `return` gerekir:

```ts
const a = [2, 4, 6].map(n => { return n * 2; });
const b = [2, 4, 6].map(n => n * 2);
// a ve b: [4, 8, 12]
```

İkinci yazımda ifade gövdesi değeri örtük biçimde döndürür.

## 3. `filter`: Elemanları koşula göre seçmek

```ts
const prices = [50, 100, 150, 200];
const selected = prices.filter(price => price >= 100);
console.log(selected); // [100, 150, 200]
```

| Eleman | Koşul | Alınır mı? |
| ---: | --- | --- |
| 50 | false | Hayır |
| 100 | true | Evet |
| 150 | true | Evet |
| 200 | true | Evet |

`filter` koşul sonucunu seçim kararı olarak yorumlar. Sonuç uzunluğu değişebilir ve **eleman kendiliğinden dönüştürülmez**. JavaScript truthy/falsy değerlere izin verse de açık boolean predicate daha okunaklıdır.

## 4. Aynı callback, farklı method sonucu

```ts
const prices = [50, 120, 200];
console.log(prices.filter(p => p >= 100)); // [120, 200]
console.log(prices.map(p => p >= 100));    // [false, true, true]
```

İkisi de yeni array üretir. Fark, callback sonucunun *neyi ifade ettiğidir*: `filter` için seçim; `map` için yeni değer.

## 5. Referans / mutation sınırı

`map` ve `filter` yeni array oluşturur fakat otomatik **deep copy** yapmaz:

```ts
const items = [{ id: 1, status: "open" }];
const chosen = items.filter(item => item.id === 1);
chosen[0].status = "closed";
console.log(items[0].status); // "closed"
```

Çünkü seçilen eleman hâlâ aynı nesne referansıdır. Buna karşılık callback yeni nesne döndürürse kaynak nesne kendiliğinden değişmez:

```ts
const updated = items.map(item => ({ ...item, status: "review" }));
console.log(items[0].status);   // "closed"
console.log(updated[0].status); // "review"
```

## 6. Debugging ve pekiştirme

Bug 1: `map` sonrası `undefined` değerleri → callback `return` yolunu incele. Bug 2: Filtrelenen nesneyi değiştirmek kaynak listeyi de değiştirdi → referans kimliğini incele.

Yeni örnek: “Her personelin adının karakter sayısını üret” ve “yalnız ad uzunluğu 5 ve üzeri personeli seç” gereksinimlerini ayır. Method adını değil, *çıktının nasıl bir veri olması gerektiğini* gerekçelendir.
