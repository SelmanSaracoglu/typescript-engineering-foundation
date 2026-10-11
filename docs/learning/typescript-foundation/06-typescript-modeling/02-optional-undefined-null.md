# Ders 20 — Optional Property, undefined ve null

## 1. Eksik alanla boş değer neden ayrı?

Bir hesapta takma ad henüz belirtilmemiş olabilir; başka hesapta ikinci ad özellikle `null` olabilir. Bu iki durum object shape'inin farklı sözleşmeleridir.

## 2. Üç tip tanımı arasındaki fark

```ts
type User = {
  name: string;
  nickname?: string;
  middleName: string | null;
};
const user: User = { name:"Ali", middleName:null };
console.log(user.nickname);    // undefined
console.log(user.middleName);  // null
console.log("nickname" in user);   // false
console.log("middleName" in user); // true
```

`nickname?` alanı bulunmayabilir. `middleName: string|null` alanı **zorunlu**, fakat değeri null olabilir. `undefined` ile `null` aynı şey değildir.

## 3. Runtime okuma akışı

1. `user` object'i `name` ve `middleName` property'leriyle kurulur.
2. `user.nickname` property erişimi eksik alanı okumaya çalışır; sonuç undefined.
3. `user.middleName` var olan property'yi okur; değer null.
4. `in` operator'ı varlık kontrolü yapar; value'nun geçerli tipte olduğunun kanıtı değildir.

## 4. Optional property için daraltma

```ts
function display(user: User): string {
  const nickname = user.nickname;
  if (nickname !== undefined) {
    return nickname.toUpperCase();
  }
  return user.name;
}
console.log(display({ name:"Ali", middleName:null })); // Ali
console.log(display({ name:"Ali", nickname:"Al", middleName:null })); // AL
```

`toUpperCase` yalnız string üzerinde kullanılır. Undefined kontrolü bu branch'de güvenli erişim sağlar. Eğer nickname boş string ise sonuç boş string olabilir; onu reddetmek yeni bir iş kuralı ister.

## 5. Nullish fallback ile truthiness

```ts
type Settings = { retries?: number | null };
function retries(s: Settings): number {
  return s.retries ?? 3;
}
console.log(retries({}));               // 3
console.log(retries({ retries:null })); // 3
console.log(retries({ retries:0 }));    // 0
```

`??` yalnız null ve undefined durumunda alternatif seçer. `||` ise 0 gibi falsy değerlerde de alternatif seçebilir. Sıfır geçerli retry değeri ise bu ayrım önemlidir.

## 6. Optional ile union property aynı değildir

```ts
type A = { label?: string };
type B = { label: string | undefined };
const a: A = {};
// const b: B = {}; // B için label gerekli
```

İlk model property'nin **yokluğuna** izin verir. İkincide property zorunludur ama undefined değerini tutabilir. Bazı yazma semantiği farkları `exactOptionalPropertyTypes` compiler ayarına bağlıdır.

## 7. Hatalı property erişimi

```ts
const maybeName: string | undefined = undefined;
// maybeName.toUpperCase(); // runtime güvenli değil
console.log(maybeName ?? "Guest"); // Guest
```

`typeof null === "object"` sonucu null'u gerçek object yapmaz. Nullish değerlerde nested property erişimi exception oluşturabilir.

## 8. Debugging ve test

**Belirti:** Retry 0 verildi, sistem 3 gösterdi. Kodda `s.retries || 3` var mı? Truthiness kaynaklı yanlış fallback olabilir.

**Belirti:** Undefined üzerinde method çağrısı. Hangi property eksik, static model doğru mu, runtime guard var mı?

Test değerlerini ayrı ele al: eksik property, explicit undefined, null, 0, boş string, normal değer.

## 9. Mülakat / pekiştirme

**Question:** What's the difference between an optional and a nullable field?

> Optional fields can be absent. Nullable fields can hold null as a declared value.

**Kontrol:** Nickname yoksa sonuç? MiddleName null olduğunda property var mı? Retry=0 için `??`? `label?:string` ve `label:string|undefined` aynı mı?

<details><summary>Cevaplar</summary>

Undefined; evet; 0; hayır, property varlığı sözleşmesi farklıdır.

</details>

## 10. Derinleştirme: yokluk, null ve boş string farklı davranır

```ts
type Profile = { nickname?: string | null };
function display(profile: Profile): string {
  if (profile.nickname === undefined) return "MISSING";
  if (profile.nickname === null) return "CLEARED";
  if (profile.nickname === "") return "EMPTY";
  return profile.nickname;
}
console.log(display({}));                   // MISSING
console.log(display({nickname:null}));      // CLEARED
console.log(display({nickname:""}));        // EMPTY
console.log(display({nickname:"Ali"}));     // Ali
```

Bu function dört ayrı durumu ayırıyor. Hepsini “boş” saymak, iş kuralı bu ayrımı istiyorsa **veri kaybıdır**.

| Input | Property | Runtime değer | Sonuç |
| --- | --- | --- | --- |
| `{}` | yok | undefined | MISSING |
| `{nickname:null}` | var | null | CLEARED |
| `{nickname:""}` | var | boş string | EMPTY |
| `{nickname:"Ali"}` | var | string | Ali |

**Hatalı alternatif:**

```ts
function wrongDisplay(p: Profile): string {
  return p.nickname || "MISSING";
}
console.log(wrongDisplay({nickname:""})); // MISSING
```

Yanlış sürüm boş string, undefined ve null'u aynı fallback sonucuna indirger.

### Debugging

Kullanıcı nickname'i kasıtlı olarak boş bırakmış, ancak sistem “hiç girilmedi” diyor. Actual property var mı? `"nickname" in profile`, `typeof profile.nickname` ve gerçek değer ne? Hangi ayrımı gereksinim korumalı?

### Yeni görev

`retries?:number|null` alanı için eksik=3, null=0, zero=0, pozitif=sayı davranışını tasarla. Tek `??` ifadesi bütün bu farkı karşılayabilir mi?

<details><summary>Kontrol</summary>

Hayır. `null` için ayrı 0, `undefined` için 3 gerektiğinden açık null ve undefined branch'leri kullanmak gerekir.

</details>
