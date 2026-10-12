# Ders 7 — Map, Set & Weak Collections

## 1. `Map` ile array `.map()` aynı şey değildir

`array.map(callback)`, elemanları yeni değerlere dönüştüren **bir array method'udur**. Büyük harfle `Map` ise ayrı bir **key/value (anahtar/değer) koleksiyonudur**.

```ts
const doubled = [2, 4].map(n => n * 2); // [4, 8]
const scores = new Map<string, number>();
scores.set("Ali", 80);
scores.set("Ayse", 95);
```

## 2. `Map`: Temel işlemler

```ts
const scores = new Map<string, number>();

scores.set("Ali", 80);   // Ekle
scores.set("Ayse", 90);  // Ekle
scores.set("Ali", 100);  // Aynı key: değeri güncelle

console.log(scores.get("Ali"));    // 100
console.log(scores.has("Mehmet")); // false
console.log(scores.size);          // 2

scores.delete("Ayse");
console.log(scores.size);          // 1
```

`set` her zaman kayıt sayısını artırmaz: Aynı key mevcutsa **değer güncellenir**. `get` anahtar yoksa `undefined` döndürür. Kayıt varlığı kontrolünde `has` kullanmak bu yüzden önemlidir.

```ts
for (const [name, score] of scores) {
  console.log(name, score); // Ali 100
}
```

`Map` anahtar olarak object dahil farklı veri türlerini kullanabilir. Kayıtları eklenme sırasına göre dolaşır. Dinamik key/value kaydı için yararlıdır; sabit alanlı kullanıcı veya config modellerinde plain object çoğu zaman daha doğaldır.

## 3. `Set`: Benzersiz değerler

```ts
const roles = new Set<string>();
roles.add("admin");
roles.add("viewer");
roles.add("admin");

console.log(roles.size);         // 2
console.log(roles.has("viewer")); // true
roles.delete("viewer");
console.log(roles.size);         // 1
```

`Set` ayrı key/value eşlemesi değil, tekil değerler saklar. Array'deki tekrarlı primitive değerleri kaldırmak için:

```ts
const numbers = [10, 20, 10, 30, 20];
const unique = [...new Set(numbers)];
console.log(unique); // [10, 20, 30]
```

`Set` değerleri eklenme sırasıyla dolaşılabilir; bu örnekte `for (const value of unique)` array üzerinde, `for (const value of new Set(numbers))` doğrudan Set üzerinde ilerler.

## 4. Nesnelerde referans kimliği

```ts
const user = { id: 1 };
const users = new Set([user, user, { id: 1 }]);
console.log(users.size); // 2
```

İlk iki giriş aynı referansı gösterir; üçüncü giriş aynı property'lere sahip olsa da **başka nesnedir**. `Set` nesneleri `id` alanına göre otomatik tekilleştirmez. `Map` nesne key'lerinde de referans kimliği önemlidir.

## 5. `WeakMap` ve `WeakSet`: Yalnız tanıma düzeyinde

- `WeakMap`, nesne referanslarıyla bağlantılı key/value verisi saklamak için tasarlanmış weak collection türüdür.
- `WeakSet`, nesne referanslarını weak biçimde benzersiz tutmak için kullanılır.
- Normal `Map` / `Set` gibi içeriği doğrudan `for...of` ile listelenmez; standart bir `size` özelliği yoktur.
- Weak olarak tutulan nesne referansları sırf bu koleksiyonda bulundukları için garbage collection'dan korunmaz.

İleri garbage collection, performans ve özel weak collection tasarımları Foundation kapsamı dışındadır.

## 6. Yaygın bug sınıfları

| Yanlış varsayım | Düzeltici açıklama |
| --- | --- |
| “`Map` her elemanı dönüştürür.” | Array `.map()` dönüştürür, `Map` key/value saklar. |
| “Üç `set` çağrısı üç kayıt üretir.” | Aynı key tekrar `set` edilirse güncellenir. |
| “İki ayrı `{id:1}` Set'te aynı öğedir.” | Nesne referansları farklıdır. |
| “Set uzunluğunu `length` ile okurum.” | `Set.size` kullanılır. |

## 7. Pekiştirme

Bir uygulamanın benzersiz kullanıcı rolleri için `Set`, kullanıcı ID → puan eşlemesi için `Map` neden uygun olabilir? Sabit property'leri olan bir kullanıcı kaydı için plain object neden hâlâ mantıklı olabilir? Üç kullanımın çıktısının nasıl bir veri olması gerektiğini açıkla.

**Kanıt sınırı:** Bu dersler teori ve açıklamalı kod içerir. Gerçek implementation, Vitest, sistematik debugging ve H0 transfer henüz ölçülmez.
