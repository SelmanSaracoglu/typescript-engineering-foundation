# Ders 15 — Reference Identity, Alias ve Aynı Nesneyi Paylaşmak

## 1. Problemi tanıyalım

İki farklı değişken aynı object'i işaret ediyorsa birinin yaptığı değişiklik diğerinden görünür. Aynı alanlara sahip iki ayrı object ise kimlik bakımından farklıdır. SDET testlerindeki `toEqual` ve `toBe` ayrımının temelinde bu model bulunur.

## 2. Tanım ve zihinsel model

**Reference identity**, bellekteki object'in aynı nesne olup olmadığı sorusudur. Object assignment yeni kopya yaratmaz; referansı paylaşabilir. **Alias**, aynı object'e ulaşan ikinci isimdir. `===` object'lerde property'leri derinden karşılaştırmaz; aynı reference olup olmadığına bakar.

## 3. Açıklamalı örnek

```ts
const first = { name: "Ali", score: 80 };
const alias = first;
const separate = { name: "Ali", score: 80 };

console.log(first === alias);    // true
console.log(first === separate); // false
alias.score = 10;
console.log(first.score);        // 10
console.log(separate.score);     // 80
```

## 4. Veri ve referans akışı

Object A `first` için oluşturulur. `alias=first` yeni object üretmez; A'ya yeni referans bağlanır. `separate={...}` Object B'yi oluşturur. A üzerindeki property mutation A'yı gören her isimde görünür; B değişmez.

```text
first  ──┐
         ├──> Object A { score: 10 }
alias  ──┘

separate ───> Object B { score: 80 }
```

## 5. Mekanizmanın önemli kullanım durumları

### Primitive assignment farklıdır

```ts
let firstScore = 80;
let secondScore = firstScore;
secondScore = 10;
console.log(firstScore);  // 80
console.log(secondScore); // 10
```

Primitive number değeri paylaşılmış mutable object gibi davranmaz. `secondScore` binding'inin güncellenmesi `firstScore`'u değiştirmez.

### Nested object

```ts
const user = { profile: { city: "Berlin" } };
const settings = user.profile;
settings.city = "Duisburg";
console.log(user.profile.city); // Duisburg
```

`user.profile` ile `settings` aynı nested object'i işaret eder. Yeni değişkene atama **deep copy** değildir.

### Object equality ile structural equality

```ts
const a = { x: 1 };
const b = { x: 1 };
const c = a;
console.log(a === b); // false
console.log(a === c); // true
```

Aynı property/value çiftleri `===` true sonucu için yeterli değildir. Testte farklı bir mekanizma olan deep/structural equality kullanılabilir; bu ders iki kavramın sınırını kurar.

## 6. Sınır durumları ve TypeScript farkı

`const alias=first` alias bağını yeniden atamayı engeller; `alias.score=10` mutation'ını engellemez. Object referansını paylaşmak tek başına bir güvenlik açığı değildir; **bilinmeyen side effect** olduğunda tasarım kusuruna dönüşür.

**Sınır sorusu:** Bir function `input` içindeki object'i döndürürse caller onu değiştirdiğinde input etkilenir mi? Aynı object identity korunuyorsa evet.

**TypeScript:** Aynı `type User` tanımına uyan iki object aynı identity'ye sahip olmak zorunda değildir.

## 7. Debugging — yanlış davranışı izlemek

Belirti: Test sonucundaki `result[0]` değişince `input[0]` da değişti. Hipotez: Aynı object referansı paylaşılıyor. `result[0] === input[0]` koşulunu değerlendir; true ise sorun property kopyalama değil element identity. Beklenen yeni object ise açık yeni object oluştur; yalnız yeni dış array yeterli olmayabilir.

## 8. Mülakat ve pekiştirme

**Question:** Why are two object literals not strictly equal even if they contain identical values? **Answer:** Strict equality on objects compares reference identity, not deep content.

**Pekiştirme:** `first === alias` neden true? Ayrı literal neden false? Primitive `secondScore` güncellenince ilki neden değişmez? Nested object'te ne paylaşılır?

<details><summary>Cevap kontrolü</summary>

İlk ikisi aynı Object A'yı işaret eder; ayrı literal B üretir. Primitive ayrı değer bağlarıdır. Nested property bir object referansı taşıyabilir.

</details>
