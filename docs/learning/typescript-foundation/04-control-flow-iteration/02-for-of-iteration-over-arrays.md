# Ders 12 — for...of: Bir Array İçindeki Her Kaydı İşlemek

## 1. Problem ve gereksinim

Tek bir object'i değerlendirmek ile bir array'deki **bütün** object'leri değerlendirmek aynı problem değildir. Çok kayıtlı veride iteration sırasını, güncel element'i, output'un nasıl biriktiğini ve neden döngünün bittiğini açıklamak gerekir.

## 2. Kavram / çalışma modeli

**Array** sıralı element collection'ıdır. **Iteration**, döngünün her tekrarıdır. `for (const user of users)` her iteration'da sıradaki element değerini `user` ismine bağlar. `users` collection ile `user` tek elementtir; isim benzerliği yüzünden rollerini karıştırma.

## 3. Açıklamalı TypeScript örneği

```ts
type User = { name: string; active: boolean; score: number };

function qualifiedNames(users: User[]): string[] {
  const result: string[] = [];
  for (const user of users) {
    if (user.active && user.score >= 60) {
      result.push(user.name);
    }
  }
  return result;
}
const data: User[] = [
  { name: "Ali", active: true, score: 80 },
  { name: "Ece", active: false, score: 90 },
  { name: "Can", active: true, score: 60 }
];
console.log(qualifiedNames(data)); // ["Ali", "Can"]
```

## 4. Iteration ve execution trace

| Iteration | user | active? | >=60? | result |
| ---: | --- | --- | --- | --- |
| Başlangıç | — | — | — | `[]` |
| 1 | Ali | true | true | `["Ali"]` |
| 2 | Ece | false | gerekmez | `["Ali"]` |
| 3 | Can | true | true | `["Ali","Can"]` |
| Son | element yok | — | — | `return ["Ali","Can"]` |

`result` **loop başlamadan** oluşturuldu. Her iteration'da sıfırlansaydı birikim kaybolurdu. Return **loop sonrasında** olduğundan bütün elementler işlenebilir.

## 5. İkinci örnek ve mekanizmanın sınırı

### `for...of` ve index ile erişim

```ts
const names = ["Ali", "Ece"];
for (const name of names) {
  console.log(name);
}
// Ali
// Ece
console.log(names[0]); // Ali
console.log(names.length); // 2
```

`for...of` element değerini, `names[0]` sabit index'teki elementi verir. `for...in` object property keys/indexes amaçlıdır; array elementleri için bu girişte tercihimiz `for...of`tur.

### Boş ve tek elementli giriş

```ts
console.log(qualifiedNames([])); // []
console.log(qualifiedNames([
  { name:"Ada", active:true, score:59 }
])); // []
```

Boş array'de loop body **hiç çalışmaz**. Tek elementli ama filtre dışı listede bir iteration olur, yine output boş kalır. İki farklı execution path aynı `[]` sonucunu üretebilir.

### Array ile element identity

```ts
const users = [{ name: "Ali" }];
for (const user of users) {
  user.name = "Can";
}
console.log(users[0].name); // Can
```

Loop'taki `user`, object elementinin **aynı referansını** taşır. `const user` object's properties'ini immutable yapmaz. İhtiyaç yoksa input mutation yapma; sözleşme belirleyicidir.

## 6. Kritik ayrımlar ve sınır durumları

**`result.push(user.name)`** string değerleri taşır; yeni object copy gerektirmez. `result.push(user)` olsaydı output elementlerinin source ile referans paylaşımı tartışılmalıydı.

**Iteration sayısı:** Elemanları gezerken aynı array'i `push`/splice ile değiştirmek sonuçları etkileyebilir. Bu derste input array'i iteration sırasında değiştirmiyoruz.

**Tip:** `User[]` bütün elementlerin beklenen yapısını ifade eder. Gerçek dış data için runtime validation ayrı gerekliliktir.

## 7. Debugging — kontrollü hata araştırması

Belirti: Sonuçta yalnız son kullanıcı var. Önce `result`'ın nerede initialize edildiğine bak; yanlışlıkla her iteration'da `const result=[]` yapılıyorsa birikim silinebilir.

Belirti: İlk kullanıcıdan sonra işleme duruyor. `return`'ün loop gövdesine taşınıp taşınmadığını kontrol et.

Test matrisi: boş array, bir uygun, bir uygunsuz, eşik=60, active=false yüksek skor, birden fazla uygun. **İki uygun kayıt** yalnız tek iterasyon çalışan bug'ı yakalamak için gereklidir.

## 8. Mülakat ve cevaplı pekiştirme

**Question:** What does a for...of loop yield for an array of objects? **Answer:** Each iteration binds the next element value; object elements are references to their objects.

**Pekiştirme:** (1) Boş array'de kaç iteration? (2) Ece neden atlandı? (3) Can score 59 olsaydı result? (4) `push(user)` ile `push(user.name)` farkı?

<details><summary>Kontrol cevapları</summary>

1. Sıfır. 2. active=false. 3. ["Ali"]. 4. Object referansı vs string primitive değer.

</details>

## 9. Rehberli çoklu kayıt testi: neden iki uygun kayıt gerekir?

```ts
type Item = { id: string; enabled: boolean };
function enabledIds(items: Item[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.enabled) ids.push(item.id);
  }
  return ids;
}
const sample = [
  {id:"A",enabled:true},
  {id:"B",enabled:false},
  {id:"C",enabled:true}
];
console.log(enabledIds(sample)); // ["A", "C"]
```

**Adım izleme:**

1. İlk iterasyonda ids `["A"]` olur.
2. İkinci iterasyonda condition false; ids değişmez.
3. Üçüncü iterasyonda `"C"` eklenir.
4. Son return yalnız döngü bittikten sonra gerçekleşir.

**Hatalı fikir:** Döngü içindeki her elemanda `return ids` çalıştırmak. Bu durumda ilk elementten sonra durulur ve C kaydı asla değerlendirilemez.

| Input | Doğru beklenen |
| --- | --- |
| `[]` | `[]` |
| `[{id:"A",enabled:true}]` | `["A"]` |
| `[{id:"A",enabled:false}]` | `[]` |
| A açık, B kapalı, C açık | `["A","C"]` |

### Neden test input sırası önemli?

İlk öğe disabled olduğunda yanlış erken return `[]` döndürebilir; ilk öğe enabled olduğunda yalnız ilk ID döndürebilir. **Farklı sıralar**, yanlış control-flow varsayımlarını açığa çıkarır.

### Bağımsız görev

`score >= 60` koşulunu da ekle. A score 60, B score 90 ama disabled, C score 59 olduğunda beklenen ID'leri yaz; ardından sıfır elementli array'in davranışını açıkla.

<details><summary>Kontrol</summary>

Yalnız A seçilir. Boş array'de döngü body'si hiç çalışmaz ve boş output döner.

</details>
