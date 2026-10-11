# Ders 1 — Equality: `===`, `!==`, `==`, `!=`

> **Öğrenme yolu:** [JavaScript eğitim dizini](../README.md) → [Bölüm 1](./README.md)  
> **Önkoşul:** Değişkenler, primitive tipler (`number`, `string`, `boolean`), object ve `typeof`.  
> **Hedef:** Bir karşılaştırmanın sonucunu ve nedenini açıklamak; tür dönüşümü ile referans eşitliğini ayırt etmek.

## 1. Equality neden önemli?

Bir uygulama sürekli karar verir: Kullanıcının rolü istenen rol mü? Gelen kimlik numarası kayıtla aynı mı? Testte **actual** ve **expected** aynı mı? Bu sorular yanlış operatörle cevaplanırsa program çalışsa bile **yanlış davranış** üretir.

Bir değer karşılaştırması üç ayrı soruyu içerebilir:

1. İki **değer** aynı mı?
2. İki değerin **tipleri** de aynı mı?
3. İki değişken aynı **object referansını** mı gösteriyor?

JavaScript'teki equality operatörlerini öğrenirken bu soruları ayrı tutarız.

## 2. Strict Equality: `===` ve Strict Inequality: `!==`

`===` operatörü, iki operandı *loose equality'deki gibi tür dönüştürerek* eşleştirmez. Primitive değerlerde tür ve değer birlikte önemlidir:

```ts
const receivedId: string = "101";
const storedId: number = 101;

// Karşılaştırılan tipler farklı olduğu için:
console.log(receivedId === String(storedId)); // true
console.log(Number(receivedId) === storedId); // true
```

İlk örnekte dönüşümü **biz açıkça yaptık**. Strict equality operatörü otomatik dönüşüm yapmadı. Doğrudan farklı tipleri karşılaştırırsak çalışma zamanında sonuç `false` olur:

```js
// JavaScript örneği (TypeScript, bazı kesin ayrık tipleri TS2367 ile uyarabilir):
console.log("101" === 101); // false
console.log("101" !== 101); // true
console.log(101 === 101);   // true
console.log(false === 0);   // false
```

`!==`, strict equality'nin tersidir: `a !== b`, `!(a === b)` ile aynı sonucu verir.

> **TypeScript ayrıntısı:** TS, örneğin literal string ile number arasındaki bariz ayrık karşılaştırmaya derleme zamanı uyarısı verebilir. Bu, JavaScript'in runtime karşılaştırma kuralını değiştirmez.

### Adım adım bir kontrol

```ts
function matchesStoredId(input: unknown, storedId: number): boolean {
  return input === storedId;
}

console.log(matchesStoredId(101, 101));   // true
console.log(matchesStoredId("101", 101)); // false
```

`unknown` kullanmamızın nedeni şudur: Gelen değer henüz doğrulanmamıştır. `"101"` ile `101` metinsel olarak benzer görünse de aynı tipte değildir. Veriyi dönüştürmek veya reddetmek uygulamanın **açık gereksinimi** olmalıdır.

## 3. Loose Equality: `==` ve `!=`

`==`, operandlar farklı tiplerdeyse JavaScript'in **abstract equality** dönüşüm kurallarını uygular. Sonuç bazen şaşırtıcıdır:

```js
console.log("101" == 101);        // true
console.log(0 == false);          // true
console.log("" == 0);             // true
console.log(null == undefined);   // true
console.log(null == 0);           // false
console.log("101" != 101);        // false
```

Bunlar ezberlenmesi gereken iş kuralları değil; dönüşümün beklenmedik karşılaştırmalara yol açabildiğinin kanıtıdır. `null == undefined` özel bir loose-equality davranışıdır; bu, `null` ile `0` değerlerinin eşit olduğu anlamına gelmez.

**Önerilen varsayılan:** İş kuralının özel olarak coercion gerektirdiği açıklanmadıkça `===` ve `!==` kullan. String ID'nin sayıya dönüştürülmesi gerekiyorsa dönüşümü ve geçerlilik kontrolünü ayrı yap.

```ts
function isMatchingNumericId(raw: string, expected: number): boolean {
  const converted = Number(raw);
  return Number.isInteger(converted) && converted === expected;
}

console.log(isMatchingNumericId("101", 101)); // true
console.log(isMatchingNumericId("abc", 101)); // false
```

**Dikkat:** `Number("")` sonucu `0`'dır; boş girdi kabul edilmemeliyse ayrıca boşluk/boşluk sonrası kontrol gereklidir. Dönüştürme tek başına validation değildir.

## 4. Object eşitliği: içerik ≠ referans

Object'ler için `===`, iki değişkenin **aynı object'e referans** verip vermediğine bakar; property'leri tek tek karşılaştırmaz.

```ts
const expected = { id: 1, role: "admin" };
const actual = { id: 1, role: "admin" };
const alias = expected;

console.log(actual === expected); // false
console.log(alias === expected);  // true
```

İlk iki object aynı alanlara sahip fakat iki ayrı object olarak oluşturulmuş. `alias` ise yeni object üretmiyor; `expected` ile aynı referansı taşıyor.

| Karşılaştırma | Sonuç | Sebep |
|---|---|---|
| `10 === 10` | `true` | Aynı primitive sayı |
| `"10" === 10` | `false` | Farklı tip |
| `a === b` (ayrı object'ler) | `false` | Farklı referans |
| `a === alias` | `true` | Aynı referans |

**Vitest bağlantısı:** Test yazarken `toBe` genellikle `Object.is` tabanlı identity/değer karşılaştırması yapar; `toEqual` ise yapısal içerik karşılaştırır. `toBe` ile `===` çoğu normal durumda benzer olsa da `NaN` ve `+0`/`-0` gibi özel durumlarda aynı algoritma değildir. Bu dersin amacı iki ayrı object'in neden `===` ile eşit olmadığıdır.

## 5. Önemli sınır: `NaN`

`NaN` bir `number` değeridir, ancak kendisine strict equality ile eşit değildir. Aşağıdaki JavaScript anti-pattern'ine TypeScript ayrıca uyarı verebilir:

```js
const value = Number("not-a-number");
console.log(typeof value);        // "number"
console.log(value === NaN);       // false
console.log(Number.isNaN(value)); // true
```

Güvenilir sayı kontrolü için `Number.isNaN` veya `Number.isFinite` gibi açık kontroller kullan. `typeof value === "number"`, değerin kullanılabilir sonlu sayı olduğunu garanti etmez.

## 6. Gerçekçi mühendislik örneği: erişim kararı

Bir kullanıcıya yalnızca rolü tam olarak `"admin"` olduğunda yönetici erişimi verilsin:

```ts
function hasAdminRole(role: unknown): boolean {
  return role === "admin";
}

console.log(hasAdminRole("admin")); // true
console.log(hasAdminRole("Admin")); // false
console.log(hasAdminRole(true));    // false
console.log(hasAdminRole(null));    // false
```

Burada karşılaştırma **case-sensitive**'dir; `"Admin"` reddedilir. Bu bir bug mı, doğru davranış mı? Cevap, rol formatının gereksinimine bağlıdır. Güvenlik açısından normalize etme veya dönüşüm kuralları açıkça tanımlanmadan kabul alanını genişletmemeliyiz.

### Test senaryolarını iş kuralından üret

| Input | Beklenen | Neyi test eder? |
|---|---|---|
| `"admin"` | `true` | Tam eşleşme |
| `"viewer"` | `false` | Farklı rol |
| `"Admin"` | `false` | Büyük/küçük harf ayrımı |
| `null` | `false` | Beklenmeyen tip |

## 7. Debugging: üç tipik hata

**Hata A — Yanlış operatör:** `"0" == 0` sonucu `true` olabilir; beklenmeyen tipleri eşit kabul etme.

**Hata B — Yanlış test beklentisi:** Farklı object'lerin `===` sonucunu `true` beklemek, referans ile içerik eşitliğini karıştırmaktır.

**Hata C — Sessiz type assertion:** `as number`, runtime değerini number'a dönüştürmez. Tip iddiası ile validation farklıdır.

Hata ararken şu sırayı izle: iki operandın **runtime değeri**, **typeof sonucu**, **primitive mi object mi olduğu**, kullanılan **operatör** ve iş kuralı.

## 8. Mülakat hazırlığı

**Question: What is the difference between `===` and `==` in JavaScript?**

> `===` compares values without the type coercion used by loose equality. `==` may convert operands before comparing them. I generally prefer strict equality to avoid unexpected conversions. For objects, strict equality compares reference identity, not deep content.

**Türkçe açıklama:** `===`, loose equality'nin otomatik tür dönüşümünü yapmaz. `==` bazı operandları karşılaştırmadan önce dönüştürür. Object'lerde strict equality içerik değil, referans kimliğidir.

**Question: Why are two identical-looking objects not strictly equal?**

> Because they are separate objects with different references. Their properties can look identical while `a === b` is still false.

## 9. Pekiştirme ve cevap anahtarı

1. `null === undefined` ve `null == undefined` sonuçlarını ve nedenini açıkla.
2. `const a = {x:1}; const b = {x:1};` için `a === b` nedir? `const c = a; a === c` nedir?
3. Kullanıcıdan `"50"` gelen fiyatın number `50` ile eşleşmesi gerekiyorsa neden `==` kullanmak yerine açık dönüştürme + kontrol tercih edilir?

<details><summary>Kontrol cevapları</summary>

1. `false`, `true`; ikinci sonuç loose equality'nin özel `null`/`undefined` kuralıdır.
2. `false`, `true`; iki ayrı object ve tek ortak referans.
3. Tipin nereden dönüştüğünü açık tutar ve boş string/NaN gibi girdilere doğrulama kuralı yazabilirsin.
</details>

## 10. Sonraki derse bağlantı

Equality bir karşılaştırmadan boolean sonuç üretir. Fakat `if (value)` içindeki değer zaten boolean değilse ne olur? [Ders 2 — Truthy / Falsy](./02-truthy-falsy.md) bu soruyu açıklar.

> **Kanıt sınırı:** Bu belge öğrenme kaynağıdır. Gerçek repo uygulaması, typecheck/Vitest çıktısı ve H0–H4 bağımsızlık gözlemi değildir.


---

> **Kalıcı müfredat notu:** Bu ders [TypeScript Foundation öğrenme rotasının](../README.md) parçasıdır. Dokümandaki önceki Increment/yardım durumları tarihsel bağlamdır; güncel bağımsız yeterlilik kanıtı değildir.
