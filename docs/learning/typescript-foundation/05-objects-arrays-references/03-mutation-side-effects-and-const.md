# Ders 16 — Mutation, Side Effect ve const Yanılgısı

## 1. Problemi tanıyalım

Bir function doğru return değerini üretirken input object'ini değiştirmiş olabilir. Return edilen değer ile dışarıdan görülen değişiklik ayrı gözlemlerdir. Bu yüzden “function `void` dönüyor, etkisi yok” çıkarımı yanlıştır.

## 2. Tanım ve zihinsel model

**Mutation** mevcut object/array state'ini yerinde değiştirmektir. **Side effect** normal return değeri dışında gözlenebilen etkidir: dış object'i mutate etmek, log üretmek, dosya yazmak gibi. **Rebinding** bir değişkenin farklı değere bağlanmasıdır; mutation ile aynı işlem değildir.

## 3. Açıklamalı örnek

```ts
type Account = { enabled: boolean };

function disable(account: Account): void {
  account.enabled = false; // input mutate edilir
}

const account: Account = { enabled: true };
disable(account);
console.log(account.enabled); // false
```

## 4. Veri ve referans akışı

Caller Object A'yı `enabled=true` ile oluşturur. `disable` parameter'ı A'nın referansını alır. Function A'nın `enabled` property'sini false yapar. `return` ile değer taşınmaz; buna rağmen caller'ın object'i değişmiştir. **Void function yan etkisiz olmak zorunda değildir.**

## 5. Mekanizmanın önemli kullanım durumları

### const property mutation'ı durdurmaz

```ts
const settings = { retries: 3 };
settings.retries = 5;
console.log(settings.retries); // 5
// settings = { retries: 10 }; // const rebinding hatası
```

`const` binding'in yeni object'e atanmasını önler. Object'in property state'ini immutable hâle getirmez.

### Immutable-style dönüşüm

```ts
type Account = { enabled: boolean; name: string };
function disabledCopy(input: Account): Account {
  return { enabled: false, name: input.name };
}
const input: Account = { enabled: true, name: "Ali" };
const result = disabledCopy(input);
console.log(result.enabled); // false
console.log(input.enabled);  // true
console.log(result === input); // false
```

Yeni object literal, bu düz modelde input'tan ayrı object üretir. Böylece caller input'unun mutation'ı önlenir. Object nested ise yalnız ilk düzey kopyalamanın yetip yetmediği ayrıca düşünülmelidir.

### `readonly` çalışma zamanı freeze değildir

```ts
type Config = { readonly retries: number };
const config: Config = { retries: 3 };
// config.retries = 5; // TypeScript hatası
```

Bu statik type kısıtlamasıdır. Runtime'da object'i otomatik `Object.freeze` ile dondurmaz. Bu dersi ilerleyen immutable veri yapılarına genişletmiyoruz.

## 6. Sınır durumları ve TypeScript farkı

Mutation **her zaman yanlış** değildir. Bazı API'ler bilinçli olarak input'larını günceller. Hata, bunun sözleşmeden anlaşılmaması veya yanlış object'in değiştirilmesidir.

Bir function çıktı array'i oluştursa bile içeriğe input object'leri push ederse element mutation'ı input'a yansıyabilir. Bu, output array identity'sinden bağımsızdır.

TypeScript `void` veya `readonly` kullanımı tüm dış etkilerin matematiksel olarak yokluğunu kanıtlamaz.

## 7. Debugging — yanlış davranışı izlemek

Belirti: Bir testin sonucu sonraki testi etkiliyor. Shared fixture object'i mutate edilmiş olabilir. İlk testten önce ve sonra object state'ini karşılaştır; aynı reference farklı testler arasında taşınıyor mu? Hata tekrar üretildikten sonra mutation yapılan property'yi bul. Gereksinim pure-like dönüşüm istiyorsa yeni object oluştur ve identity testini yaz.

## 8. Mülakat ve pekiştirme

**Question:** What is the difference between reassignment and mutation? **Answer:** Reassignment changes which value a variable binding holds; mutation changes the state of an existing object.

**Question:** Can a void function have side effects? **Answer:** Yes, it may mutate inputs or perform I/O even when it returns no useful value.

**Pekiştirme:** `const` neden `account.enabled=false` kodunu engellemez? `disabledCopy` niçin input'u değiştirmez? `readonly` çalışma anında freeze sağlar mı?

<details><summary>Kontrol cevapları</summary>

Const yalnız rebinding'i engeller; yeni object literal input'tan ayrı object yaratır; readonly static kontrollere ilişkindir.

</details>

## 9. Side effect'i görünür kılan test

```ts
type User = { score:number };
function addTen(user: User): number {
  user.score += 10;
  return user.score;
}
const input = {score:80};
const actual = addTen(input);
console.log(actual);       // 90
console.log(input.score);  // 90
```

Bu function **90 return ediyor** ve ayrıca input object'ini mutate ediyor. Sadece `actual===90` assertion'ı side effect hakkında bir bilgi vermez.

### Mutation istemeyen sözleşme

```ts
type User = { score:number };
function addTenWithoutMutation(user: User): number {
  return user.score + 10;
}
const input = {score:80};
const actual = addTenWithoutMutation(input);
console.log(actual);      // 90
console.log(input.score); // 80
```

İki function aynı return sonucunu üretebilir, fakat davranış sözleşmeleri farklıdır. Doğru olanı requirement belirler.

### Expected–actual tablosu

| Kontrol | Mutating function | Non-mutating function |
| --- | --- | --- |
| Return | 90 | 90 |
| Çağrı sonrası input.score | 90 | 80 |
| Input identity | Aynı object | Aynı object |
| Input field değişti mi? | Evet | Hayır |

### Hata araştırma

Bir testin sonucu sonraki testi etkiliyorsa test fixture'ları ortak object reference taşıyor olabilir. Testler arasında shared mutable state olup olmadığına bak; rastgele test sırası değiştirmek kök nedeni gidermez.

### Bağımsız görev

Fonksiyonun return değeri doğru kaldığı hâlde input'u değiştirmemesini isteyen bir test yaz. Hangi assertion sonuç değerini, hangisi input mutation'ını kontrol etmeli?

<details><summary>Kontrol</summary>

Return için `expect(actual).toBe(90)`; input için `expect(input.score).toBe(80)` gibi iki ayrı assertion.

</details>
