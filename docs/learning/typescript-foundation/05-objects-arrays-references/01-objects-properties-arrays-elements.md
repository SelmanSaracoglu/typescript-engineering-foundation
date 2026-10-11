# Ders 14 — Object, Property, Array ve Element Modeli

## 1. Problemi tanıyalım

Bir listedeki kullanıcı sayısı, ilk kullanıcının adı ve listeden seçilen tek bir kayıt farklı verilerdir. Array ile içindeki object'i karıştırırsak fonksiyon yanlış türde sonuç döndürebilir; testte `[]` yerine `[{}]` gibi yanlış beklentiler yazılabilir.

## 2. Tanım ve zihinsel model

**Object** property/value çiftlerinden oluşan veri yapısıdır. **Property** object'in alanıdır. **Array** sıralı element container'ıdır. **Element** array'de tutulan değerdir; primitive de object de olabilir. Array, JavaScript'te özel bir object türüdür. Index 0'dan başlar; `length` element sayısını bildirir.

## 3. Açıklamalı örnek

```ts
type User = { name: string; score: number; active: boolean };
const users: User[] = [
  { name: "Ali", score: 80, active: true },
  { name: "Ece", score: 45, active: false }
];

console.log(users.length);       // 2
console.log(users[0].name);      // Ali
console.log(users[1].score);     // 45
console.log(Array.isArray(users)); // true
```

## 4. Veri ve referans akışı

`users` iki element tutan dış array'dir. `users[0]`, birinci object'tir; `users[0].name`, bu object'in string property'sidir. `users[1].score`, ikinci object'in number değeridir. **Array**, **element object** ve **element property** üç farklı erişim düzlemidir.

## 5. Mekanizmanın önemli kullanım durumları

### Boş array ve boş object

```ts
const emptyArray: object[] = [];
const oneEmptyRecord: object[] = [{}];
console.log(emptyArray.length);     // 0
console.log(oneEmptyRecord.length); // 1
console.log(Array.isArray({}));     // false
console.log(Array.isArray([]));     // true
```

`[]` içinde **hiç kayıt yoktur**. `[{}]` içinde **bir boş object kaydı vardır**. İki output'u eşdeğer kabul eden bir test davranışı yanlış yorumlar.

### Property okuma

```ts
const item = { label: "test", attempts: 0 };
console.log(item.label);       // test
console.log(item["attempts"]); // 0
console.log("label" in item);  // true
console.log("missing" in item); // false
```

Dot erişimi ve bracket erişimi property okumada kullanılabilir; bracket, dinamik property adlarında da işe yarar. `"missing" in item` property varlığını ölçer, doğru property type'ını değil.

### Filtrelenen result

```ts
function activeNames(data: User[]): string[] {
  const names: string[] = [];
  for (const user of data) {
    if (user.active) names.push(user.name);
  }
  return names;
}
console.log(activeNames(users)); // ["Ali"]
```

Fonksiyon **User object array'i değil, string array** döndürür. Return type `string[]` bunu açıkça gösterir.

## 6. Sınır durumları ve TypeScript farkı

Yanlış index `users[2]` runtime'da `undefined` dönebilir; `users[2].name` erişimi exception üretebilir. `length` kontrolü veya güvenli veri modeli gerekir. TypeScript'in index erişimi için statik uyarıları compiler yapılandırmasına bağlıdır; `User[]` her index'in mevcut olduğunu garanti etmez.

Dışarıdan array bekleyen fonksiyona object gelmesi ayrı runtime validation konusudur. **`typeof [] === "object"`** olsa da `Array.isArray` array'i ayırt eder.

## 7. Debugging — yanlış davranışı izlemek

Belirti: Boş input'ta fonksiyon `[{}]` döndürüyor. Expected `[]` ise output array'in nasıl initialize edildiğini kontrol et; `const results = [{}]` bir element oluşturur. Belirti: İlk kullanıcı yanlış. `[0]` ve `[1]` index sırasını takip et. Belirti: `Cannot read properties of undefined`. Erişilen index gerçekten var mı? Önce onu kontrol et.

## 8. Mülakat ve pekiştirme

**Question:** What is the difference between an array and an object stored in that array? **Answer:** The array is an ordered container; an element is a value stored at an index and may itself be an object with properties.

**Pekiştirme:** `[]` ve `[{}]` neden farklı? `users[0].score` hangi tür? `users[2]` neden güvenilir değil? `activeNames` niçin `string[]` dönüyor?

<details><summary>Cevap kontrolü</summary>

Birincinin length'i 0, ikincinin 1; `users[0].score` number; üçüncü index out-of-range olabilir; fonksiyon `user.name` string'ini push eder.

</details>

## 9. İkinci örnek: iç içe object ve array'e ulaşmak

```ts
type Team = {
  title: string;
  members: { name: string; active: boolean }[];
};
const team: Team = {
  title:"QA",
  members:[
    {name:"Ali",active:true},
    {name:"Ece",active:false}
  ]
};
console.log(team.title);              // QA
console.log(team.members.length);     // 2
console.log(team.members[0].name);    // Ali
```

Şu erişim zincirini oku: `team` object → `members` array property → `[0]` ilk member object → `.name` string property. Bir katmanı atlamak yanlış biçimli erişim oluşturabilir.

### Yanlış index'i ayırt et

```ts
const names = ["A", "B"];
console.log(names[1]);  // B
console.log(names[2]);  // undefined
```

Array length=2 olması son index'in 2 olduğu anlamına gelmez; index 0 ve 1'dir. `names[2].toUpperCase()` doğrudan yürütülse runtime hata riski doğar.

### Kayıt sayısı ile aktif kayıt sayısı

```ts
let activeCount = 0;
for (const member of team.members) {
  if (member.active) activeCount++;
}
console.log(activeCount); // 1
```

`team.members.length` 2; aktif member sayısı 1. Container uzunluğu iş filtresinin sonucunu otomatik vermez.

### Bağımsız görev

Üç üyeli bir team düşün: ikisi inactive, biri active. Hem `length` hem `activeCount` sonuçlarını tahmin et. Boş `members=[]` için hangi değerler çıkar?

<details><summary>Kontrol</summary>

Length 3, activeCount 1. Boş array için ikisi de 0.

</details>
