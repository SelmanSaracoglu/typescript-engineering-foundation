# Ders 17 — New Array ≠ New Object Elements: Copy ve Reference Ayrımı

## 1. Problemi tanıyalım

Bir filtre fonksiyonunda `const result=[]` yazdığında yeni array oluşturursun. Ancak `result.push(input[0])` aynı input elementini yeni array'e taşır. Dış array'in yeni olması, içerideki element object'lerinin bağımsız olduğu anlamına **gelmez**.

## 2. Tanım ve zihinsel model

**Outer array identity** ile **element object identity** ayrı kavramlardır. `push(existingObject)`, yeni object yaratmaz. Yeni object literal oluşturmak elementin referansını ayırabilir. **Shallow copy** yalnız ilk düzeydeki object/array yapısını kopyalar; nested object'ler referans paylaşabilir.

## 3. Açıklamalı örnek

```ts
type User = { name: string; score: number };
const input: User[] = [{ name: "Ali", score: 80 }];
const shared: User[] = [];
shared.push(input[0]);
const copied: User[] = [];
copied.push({ name: input[0].name, score: input[0].score });

console.log(shared === input);       // false
console.log(shared[0] === input[0]); // true
console.log(copied[0] === input[0]); // false

shared[0].score = 10;
console.log(input[0].score);  // 10
console.log(copied[0].score); // 80
```

## 4. Veri ve referans akışı

```text
input ───> Array A ───> Object X { score: 10 }
shared ──> Array B ───> Object X (aynı element)
copied ──> Array C ───> Object Y { score: 80 }
```

`shared` ve `input` farklı array'lerdir. Ama `shared[0]` ile `input[0]` aynı Object X'tir. `copied[0]`, yeni oluşturulmuş Y object'idir. X'in mutation'ı Y'yi değiştirmez.

## 5. Mekanizmanın önemli kullanım durumları

### Filtreleyici fonksiyondaki gerçek hata riski

```ts
type User = { name: string; score: number; active: boolean };
function unsafeSelect(users: User[]): User[] {
  const result: User[] = [];
  for (const user of users) {
    if (user.active && user.score >= 60) {
      result.push(user); // aynı element identity
    }
  }
  return result;
}
const users = [{ name:"Ali", score:80, active:true }];
const selected = unsafeSelect(users);
selected[0].score = 0;
console.log(users[0].score); // 0
```

Bu behavior, yalnız `selected!==users` kontrolüyle bulunamaz.

### Düz model için bağımsız element üretimi

```ts
function safeSelect(users: User[]): User[] {
  const result: User[] = [];
  for (const user of users) {
    if (user.active && user.score >= 60) {
      result.push({
        name: user.name,
        score: user.score,
        active: user.active
      });
    }
  }
  return result;
}
const second = safeSelect(users);
console.log(second[0] === users[0]); // false
```

Bu örnek yalnız **düz primitive property** içeren modelde element isolation sağlar. Daha karmaşık nested modellerde ayrıca kopyalama kararı gerekir.

### Nested object örneği

```ts
const first = { profile: { city: "Berlin" } };
const shallow = { ...first };
console.log(shallow === first);                 // false
console.log(shallow.profile === first.profile); // true
shallow.profile.city = "Duisburg";
console.log(first.profile.city); // Duisburg
```

Spread ile dış object yeni olsa da `profile` referansı ortak kalır. Bu örnek shallow-copy davranışını gösterir; ileri kopyalama stratejisi kurma konusu değildir.

## 6. Sınır durumları ve TypeScript farkı

**Kritik ayrım:** `toEqual` içerik benzerliğini, object'ler üzerindeki `toBe` reference identity'yi gözler. `result` yeni array olsa bile eleman aynıysa testte iki ayrı assertion gerekir. `const`, mutation'ı engellemez. Object `push` yalnız referansı taşır.

Buradaki `User[]` type'ı yeni reference izolasyonunu garanti etmez. Bu behavior bir iş/uygulama sözleşmesidir.

## 7. Debugging — yanlış davranışı izlemek

Belirti: Result içindeki user güncellenince source user da değişiyor. 1. `result === input` check. 2. `result[0] === input[0]` check. 3. İkinci true ise ortak reference var. 4. Gereksinim izolasyon istiyorsa **yeni element object** yarat. 5. Mutation testiyle `input[0].score` sabit mi doğrula. Sadece yeni array oluşturmakla bug'ın çözüldüğünü kabul etme.

## 8. Mülakat ve pekiştirme

**Question:** Does creating a new array clone its object elements? **Answer:** No. A new array can still hold references to the original objects; element cloning is a separate operation.

**Pekiştirme:** Yeni array ve aynı object aynı anda mümkün mü? `shared[0]` mutation'ı neden input'u etkiler? Spread nested `profile`'ı kopyalar mı?

<details><summary>Kontrol cevapları</summary>

Evet; dış array ayrı, element referansı aynı olabilir. Element üzerinde mutation her iki array'den görünür. Spread shallow'dur, nested profile paylaşılır.

</details>
