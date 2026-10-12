# Ders 6 — Object.keys, Object.values ve Object.entries

## 1. Object property'lerini collection biçiminde okumak

```ts
const scores = {
  Ali: 80,
  Ayse: 95,
  Mehmet: 70
};

console.log(Object.keys(scores));   // ["Ali", "Ayse", "Mehmet"]
console.log(Object.values(scores)); // [80, 95, 70]
console.log(Object.entries(scores));
// [["Ali", 80], ["Ayse", 95], ["Mehmet", 70]]
```

| Method | Döndürdüğü array | Niyet |
| --- | --- | --- |
| `Object.keys` | Property isimleri | Hangi alanlar var? |
| `Object.values` | Property değerleri | Değerleri işle |
| `Object.entries` | `[key, value]` çiftleri | Adı ve değeri birlikte kullan |

Bu method'lar nesnenin kendi **enumerable string-keyed** property'lerini okur. Inherited veya symbol-keyed property'ler otomatik olarak dahil edilmez. Foundation'da düz object örnekleri yeterlidir.

## 2. Array method'larıyla birleştirme

```ts
const grades = Object.values(scores);
const total = grades.reduce((sum, grade) => sum + grade, 0);
const average = total / grades.length;

console.log(total);   // 245
console.log(average); // 81.66666666666667
```

`Object.values` bir array ürettiğinden ardından `reduce` kullanılabilir. Boş object'te `grades.length` sıfırdır; ortalamanın tanımlanabilmesi için iş kuralına göre boş veri kontrolü gerekir.

## 3. İsim ve değer birlikte gerekiyorsa

```ts
const errorCounts = {
  login: 12,
  payment: 3,
  database: 7
};

for (const [type, count] of Object.entries(errorCounts)) {
  console.log(type + ": " + count + " errors");
}
// login: 12 errors
// payment: 3 errors
// database: 7 errors
```

Burada `Object.entries` array içinde ikililer döndürür; `[type, count]` **destructuring** ile ikiliyi iki değişkene ayırır.

## 4. Yaygın hata

```ts
const config = { retries: 3, timeout: 1000 };
const keys = Object.keys(config);
console.log(Array.isArray(keys)); // true
```

`Object.keys` bir object değil, array döndürür. Diğer iki method da array oluşturur; nesne içindeki nested değerler referans taşıyabilir, otomatik deep copy yapılmaz.

## 5. Pekiştirme

Bir log raporunda sadece olay adlarını bulmak, sadece olay sayılarını toplamak ve “login: 12” gibi ad/değer satırları oluşturmak için üç farklı yöntemi seç. Seçimini ihtiyaç duyduğun çıktının şekline göre gerekçelendir.
