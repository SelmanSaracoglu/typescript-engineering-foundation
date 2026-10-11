# Ders 6 — Comparisons, Conditions ve if/else ile Karar Akışı

## 1. Kod bir kararı nasıl verir?

Bir uygulamanın şu gereksinime sahip olduğunu düşün:

> Skoru 60 veya üzerinde olan kullanıcı başarılı sayılır. Diğerleri başarısızdır.

İnsan için kolay görünen bu kuralda bile yanlış bir operator bütün sınır değerlerini etkileyebilir.

```ts
function getStatus(score: number): string {
  if (score >= 60) {
    return "passed";
  }
  return "failed";
}

console.log(getStatus(59)); // failed
console.log(getStatus(60)); // passed
console.log(getStatus(61)); // passed
```

Bu örnekte **karar (decision)**, `score >= 60` ifadesinin çalışma anında değerlendirilmesiyle verilir.

## 2. Comparison bir expression'dır

Comparison operator iki operandın ilişkisini değerlendirir ve boolean bir değer üretir.

| Operator | Anlam | Örnek | Sonuç |
| --- | --- | --- | --- |
| `>` | Büyüktür | `61 > 60` | true |
| `>=` | Büyük veya eşittir | `60 >= 60` | true |
| `<` | Küçüktür | `59 < 60` | true |
| `<=` | Küçük veya eşittir | `60 <= 60` | true |
| `===` | Strict equality | `60 === 60` | true |
| `!==` | Strict inequality | `60 !== 59` | true |

```ts
const score = 60;
const passed = score >= 60;

console.log(passed);        // true
console.log(typeof passed); // boolean
```

`passed` burada `score` değişkeniyle aynı türde değil; bir boolean sonuçtur.

**Karar modelini katmanlara ayır:**
1. Veri: `score = 60`
2. Condition expression: `score >= 60`
3. Boolean sonuç: `true`
4. Control-flow statement: `if`
5. Gözlenebilir sonuç: `"passed"`

## 3. if/else blokları nasıl çalışır?

```ts
function decide(age: number): string {
  if (age >= 18) {
    return "adult";
  } else {
    return "minor";
  }
}
console.log(decide(17)); // minor
console.log(decide(18)); // adult
```

`if` önce condition'ı değerlendirir. Doğruysa ilk block; yanlışsa `else` block çalışır. Burada iki blok aynı function çağrısında **birlikte çalışmaz**.

**17 girdisi için execution trace**

| Adım | İşlem | Sonuç |
| --- | --- | --- |
| 1 | `decide(17)` çağrısı | age=17 |
| 2 | `17 >= 18` | false |
| 3 | if block | atlanır |
| 4 | else block | `return "minor"` |
| 5 | Function sonucu | minor |

**18 girdisi için** condition true olduğundan `return "adult"` çalışır. `return` çağrıyı bitirdiği için `else` veya başka statement'lara devam edilmez.

## 4. else yazmak her zaman zorunlu mu?

Hayır. Function'ın her normal durumda result üretmesi şartını karşılayacak alternatif akış bulunabilir.

```ts
function decide(age: number): string {
  if (age >= 18) {
    return "adult";
  }
  return "minor";
}
```

İlk condition doğruysa function ilk `return` ile sonlanır. Yanlışsa son satıra ulaşır.

**Eşdeğer davranış:** Bu iki biçim gösterilen input modelinde aynı sonucu üretir. Kod biçimi değil, control flow önemlidir.

**Eksik return riski:**

```ts
// Bilerek problemli örnek:
// function decide(age: number): string {
//   if (age >= 18) return "adult";
// }
// TypeScript bütün yolların string dönmediğini belirtebilir.
```

Burada 17 girdiyle function normal olarak `undefined` döndürür; bu beklenen `string` sözleşmesine aykırıdır.

## 5. Birden fazla koşul: if / else if / else

Diyelim ki skoru 90+ olan "excellent", 60+ olan "passed", geri kalanlar "failed" olsun.

```ts
function grade(score: number): string {
  if (score >= 90) {
    return "excellent";
  } else if (score >= 60) {
    return "passed";
  } else {
    return "failed";
  }
}
console.log(grade(95)); // excellent
console.log(grade(75)); // passed
console.log(grade(59)); // failed
```

Condition'lar **yukarıdan aşağıya** incelenir. `else if` zincirinde ilk eşleşen branch seçilir.

| Input | `>=90` | `>=60` (gerekirse) | Result |
| ---: | --- | --- | --- |
| 95 | true | hiç değerlendirilmez | excellent |
| 90 | true | hiç değerlendirilmez | excellent |
| 75 | false | true | passed |
| 60 | false | true | passed |
| 59 | false | false | failed |

`score=95` için sonraki condition'ın sonucu doğru olsa bile ona **ulaşılmaz**. Bu işlem sırası, özellikle yüksek öncelikli kurallarda önemlidir.

## 6. Koşulların sırası neden kritik?

Şu kod hatalı olabilir:

```ts
function wrongGrade(score: number): string {
  if (score >= 60) {
    return "passed";
  } else if (score >= 90) {
    return "excellent";
  }
  return "failed";
}
console.log(wrongGrade(95)); // passed — yanlış!
```

**Neden?** 95, zaten `>=60` koşulunu sağlıyor; ilk branch `return` yaptığı için `>=90` hiç çalışmıyor.

Bu **logic bug** TypeScript açısından tür uyumsuzluğu değildir.

**Doğru yaklaşım:** Kurallar birbirini kapsıyorsa daha özel/dar olan koşulu önce değerlendir; ardından daha genel kurala geç. Her zaman koşulların gerçekte birbirini kapsayıp kapsamadığını düşün.

## 7. Bağımsız if ile else-if zinciri farklıdır

```ts
const score = 95;

if (score >= 60) {
  console.log("passed");
}
if (score >= 90) {
  console.log("excellent");
}
// passed
// excellent
```

Burada iki bağımsız `if` vardır; ikisinin de çalışması mümkündür.

```ts
const score = 95;

if (score >= 90) {
  console.log("excellent");
} else if (score >= 60) {
  console.log("passed");
}
// excellent
```

Bu kez zincir ilk eşleşen branch'te durur.

**Ne zaman hangisi?** Birbirinden bağımsız iki davranış gerekiyorsa iki `if`; yalnız **tek sınıf** seçilecekse doğru sıralı `if/else if` daha uygun olabilir.

## 8. AND, OR ve NOT: Temel birleşik koşullar

Gerçek gereksinimler çoğu zaman tek özellik değil, birden fazlasını kontrol eder.

```ts
type User = { active: boolean; score: number };

function canEnter(user: User): boolean {
  return user.active && user.score >= 60;
}
console.log(canEnter({ active: true, score: 80 }));  // true
console.log(canEnter({ active: false, score: 80 })); // false
console.log(canEnter({ active: true, score: 59 }));  // false
```

`&&` iki koşulun da uygun olmasını ister; `||` alternatif koşullardan birini kabul edebilir; `!` boolean değeri tersine çevirebilir.

```ts
const active = false;
const isAdmin = true;

console.log(active && isAdmin); // false
console.log(active || isAdmin); // true
console.log(!active);          // true
```

Buradaki örnek operandlar boolean olduğu için sonuçları doğrudan boolean'dır. JavaScript'te `&&` ve `||` her zaman boolean döndürmek zorunda değildir; operand değerlerini seçen kısa devre davranışı bulunur. Bu derste yalnız boolean condition kullanımı temel alınır.

**Operator precedence:** `&&`, `||`'dan önce değerlendirilir. Okunabilirlik için parentheses kullan:

```ts
const active = true;
const admin = false;
const verified = false;

const allowed = active && (admin || verified);
console.log(allowed); // false
```

## 9. Truthiness ve açık boolean koşul

`if (value)` yazıldığında JavaScript değeri boolean bağlamda yorumlar.

```ts
const attempts = 0;

if (attempts) {
  console.log("has attempts");
} else {
  console.log("no attempts");
}
// no attempts
```

Bu örnek zero'nun falsy sayılmasını kullanır. Ancak **sıfırın geçersiz olduğunu kanıtlamaz**. Gerçek gereksinim `attempts > 0` ise şunu tercih etmek mantıklıdır:

```ts
if (attempts > 0) {
  console.log("has attempts");
}
```

Sayı türü doğru olsa bile `NaN` veya negatif değer gibi input'lar için ayrıca kural gerekebilir.

## 10. Tam sınır: >= ile > arasındaki fark

Gereksinim 60 **dahil** diyorsa:

```ts
score >= 60 // doğru
score > 60  // 60 için yanlış
```

| Score | `>= 60` | `> 60` |
| ---: | --- | --- |
| 59 | false | false |
| 60 | true | false |
| 61 | true | true |

Bu nedenle yalnız 80 gibi normal bir başarılı kullanıcıyla test yapmak yanlış operator'ı yakalayamayabilir.

**Sınırın hemen altı / sınır / hemen üstü** kontrolü hatayı açık gösterir.

## 11. Yanlış veri türü: string score

TypeScript'de:

```ts
function grade(score: number): string {
  return score >= 60 ? "passed" : "failed";
}
```

Burada `number` bir statik sözleşmedir. Dış kaynaktan gelen `"60"` metin değeri runtime'da otomatik olarak number veri modeline dönüştürülmez.

JavaScript bazı karşılaştırmalarda type coercion uygulayabilir, ama doğru sonuç görünmesi input'un doğrulandığı anlamına gelmez. Gerçek uygulamada input sınırı ayrı belirlenmelidir.

## 12. Gerçekçi örnek: premium ürün seçimi

Gereksinim:

> Ürün stokta olacak ve fiyatı 100 veya üzeri olacak.

```ts
type Product = {
  name: string;
  price: number;
  inStock: boolean;
};

function qualifies(product: Product): boolean {
  if (!product.inStock) {
    return false;
  }
  if (product.price >= 100) {
    return true;
  }
  return false;
}

console.log(qualifies({ name: "A", price: 100, inStock: true }));  // true
console.log(qualifies({ name: "B", price: 99, inStock: true }));   // false
console.log(qualifies({ name: "C", price: 150, inStock: false })); // false
```

Control flow: Önce stok durumu; stok yoksa fiyat incelenmeden return false. Stok varsa fiyatın sınırı kontrol edilir. Bu yaklaşım birden fazla koşulun hangi sırayla değerlendirildiğini görünür kılar.

## 13. Debugging: 95 neden “passed” oldu?

Belirti: 95 puanlı kullanıcı "excellent" yerine "passed".

1. **Expected:** 95 → excellent.
2. **Actual:** passed.
3. **Condition trace:** 95 >= 60 → true.
4. **Control-flow:** İlk branch return yaptı.
5. **Hypothesis:** Genel threshold daha özel threshold'u gölgeliyor.
6. **Fix:** 90 kontrolünü önce koy.
7. **Regression:** 59, 60, 89, 90, 95 ile tekrar doğrula.

Bu hata TypeScript type checker'ın çözebileceği bir tür sorunu değildir. Kontrol sırasını gereksinim belirler.

## 14. Mülakat hazırlığı

**Question: How does an if/else-if chain differ from independent if statements?**

> An if/else-if chain selects the first matching branch. Independent if statements are evaluated separately and more than one may execute.

**Question: Why do boundary tests matter for comparisons?**

> They distinguish inclusive and exclusive operators. For example, the input exactly at a threshold reveals whether >= was implemented as >.

## 15. Pekiştirme ve cevap anahtarı

1. `score=60` için `score > 60` ve `score >= 60` sonuçları?
2. `score=95` neden yanlış sıralanmış `if/else if` zincirinde "passed" olabilir?
3. İki bağımsız if block'u aynı çağrıda çalışabilir mi?
4. `active=true`, `score=59` için `active && score>=60`?
5. `qualifies({name:"A",price:150,inStock:false})` ne döner, hangi branch'te?
6. `if (0)` block'u çalışır mı? 0'ın number olması değişir mi?

<details><summary>Kontrol cevapları</summary>

1. false ve true.
2. Genel `>=60` koşulu ilk seçilir ve return edilir.
3. Evet; birbirlerinden bağımsızdırlar.
4. false.
5. false; ilk `!inStock` kontrolünde.
6. Çalışmaz; 0 hâlâ number değeridir.

</details>
