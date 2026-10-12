# Ders 3 — find, findIndex, some, every & includes

## 1. `find` ile ilk uygun kaydı bulmak

```ts
const users = [
  { id: 1, name: "Ali", active: true },
  { id: 2, name: "Ayşe", active: false },
  { id: 3, name: "Mehmet", active: true }
];
const user = users.find(u => u.id === 2);
console.log(user); // { id: 2, name: "Ayşe", active: false }
```

`find` ilk eşleşmeyi döndürür ve sonrasını aramaz. `filter` bütün eşleşmeleri array olarak verir; `find` **tek değer veya `undefined`** verir. TypeScript'in `User | undefined` olasılığı bu yüzden önemlidir.

```ts
const missing = users.find(u => u.id === 99);
if (missing !== undefined) {
  console.log(missing.name);
} else {
  console.log("Kayıt bulunamadı");
}
```

Kontrol olmadan `missing.name` okumak TypeScript strict null kontrolünde uyarı, JavaScript runtime'da hata doğurabilir.

## 2. `findIndex` ile konumu bulmak

```ts
console.log(users.findIndex(u => u.id === 2));  // 1
console.log(users.findIndex(u => u.id === 99)); // -1
```

İndeksler 0'dan başlar. Bulunamayan kayıt `undefined` değil `-1` verir. `index > 0` ile bulunma kontrolü **ilk elemanı kaçırır**. `index >= 0` ya da `index !== -1` uygundur.

## 3. `some` ve `every`: Boolean kontrol

```ts
const prices = [10, 20, 30, 40];
console.log(prices.some(p => p > 25));  // true
console.log(prices.every(p => p > 15)); // false
```

- `some`: En az biri uygun mu? İlk `true` ile durabilir.
- `every`: Hepsi uygun mu? İlk `false` ile durabilir.

Her ikisi de `boolean` üretir, yeni kayıt listesi üretmez.

## 4. `includes`: Verilen değer listede mi?

```ts
const roles = ["admin", "editor", "viewer"];
console.log(roles.includes("admin")); // true
console.log(roles.includes("guest")); // false
```

`includes` callback almaz. Primitive/değer araması için kullanılır. Nesnelerde **referans kimliği** önemlidir:

```ts
const entry = { id: 1 };
const list = [entry];
console.log(list.includes(entry));     // true
console.log(list.includes({ id: 1 })); // false
```

## 5. Boş array: Kritik iş kuralı sınırı

```ts
const empty: number[] = [];
console.log(empty.some(n => n > 10));      // false
console.log(empty.every(n => n > 10));     // true
console.log(empty.includes(10));           // false
console.log(empty.find(n => n > 10));      // undefined
console.log(empty.findIndex(n => n > 10)); // -1
```

`every` boş dizide `true` döndürür: koşulu ihlal eden hiçbir eleman yoktur. Ancak iş kuralı en az bir eleman da gerektiriyorsa:

```ts
const passwords: string[] = [];
const valid = passwords.length > 0 &&
  passwords.every(password => password.length >= 8);
console.log(valid); // false
```

**Bug düşüncesi:** Teknik method çıktısı ile iş gereksinimi birbirinin yerine geçmez.

## 6. Kavramsal checkpoint

- İlk uygun nesne, indeks, “en az bir”, “hepsi” ve “tam bu değer var mı” sorunlarını ayrı araçlarla eşleştir.
- `find` sonucunda `undefined`, `findIndex` sonucunda `-1` neden kontrol edilmeli?
- Boş array'de `every` sonucu neden kullanıcı kaydı/şifre doğrulaması için tek başına yeterli olmayabilir?
