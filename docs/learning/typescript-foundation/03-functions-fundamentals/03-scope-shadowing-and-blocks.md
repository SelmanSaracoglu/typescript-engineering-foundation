# Ders 10 — Function Scope, Block Scope ve Shadowing

## 1. Neden öğreniyoruz?

Bir debugger aynı anda `score` isimli iki değişken gösterdiğinde hangisinin okunduğunu ayıramazsak doğru kodu yanlışlıkla değiştiririz. Scope aynı isimle tanımlanan farklı binding'leri anlamayı sağlar.

## 2. Temel kavramlar

**Scope**, değişken adının hangi kod bölgesinden erişilebilir olduğunu ifade eder. `let` ve `const` block scope'a sahiptir; function parameter'ları function çağrısının local bağlarıdır. **Shadowing**, iç scope'ta dıştakiyle aynı isimde yeni binding tanımlanmasıdır. Shadowing mevcut dış binding'i değiştirmek anlamına gelmez.

## 3. Açıklamalı TypeScript örneği

```ts
const score = 50;

function showScore(): void {
  const score = 80;
  if (score >= 60) {
    const message = "passed";
    console.log(message); // passed
  }
  console.log(score); // 80
}

showScore();
console.log(score); // 50
```

## 4. Execution flow — adım adım

1. Dış scope'ta `score=50` oluşturulur.
2. `showScore()` çağrısı başlar; local `score=80` binding'i oluşur.
3. İçeride yazılan `score`, en yakın uygun binding olan 80'i gösterir.
4. If condition true; block-local `message` oluşturulur ve passed yazılır.
5. Block sona erer; `message` artık bu scope'un dışında erişilebilir değildir.
6. Function `score` yazar: 80.
7. Caller dıştaki `score`'u yazar: 50.

Beklenen log sırası: **passed**, **80**, **50**. Shadowing outer değeri 80'e dönüştürmedi.

## 5. Farklı durumlarla derinleştirme

### Function-local değişken

```ts
function total(price: number): number {
  const fee = 20;
  return price + fee;
}
console.log(total(100)); // 120
// console.log(fee); // TypeScript: Cannot find name 'fee'
```

`fee` yalnız function içinde kullanılabilir. Caller bu local isme erişmez; yalnız return edilen sonucu görür.

### Block-local değişken

```ts
const ready = true;
if (ready) {
  let status = "OK";
  status = "DONE";
  console.log(status); // DONE
}
// console.log(status); // bu block'ta tanımlanmadı
```

`if` yalnız control-flow değil, süslü parantezle block scope da oluşturur.

### Değiştirmek ile gölgelemek

```ts
let attempts = 1;
if (true) {
  attempts = attempts + 1; // outer binding değişir
}
console.log(attempts); // 2
```

Buna karşılık:

```ts
let attempts = 1;
if (true) {
  let attempts = 10; // yeni inner binding
  attempts++;
  console.log(attempts); // 11
}
console.log(attempts); // 1
```

İki örneğin davranışı farklıdır; ilki outer bağa assignment, ikincisi ayrı binding'de değişiklik yapar.

## 6. TypeScript ile çalışma zamanı farkı

TypeScript block dışında bulunmayan local değişken kullanımını statik olarak raporlayabilir. Fakat **aynı isimli iki geçerli binding** bulunması type error değildir; hangisinin değiştiği semantic/debugging sorusudur.

`const` yeniden atamayı engeller, scope modelini değiştirmez. Bir object'in property mutation'ı da binding shadowing'den farklı mekanizmadır.

**TDZ (temporal dead zone):** `let` ve `const` isimleri block içindeki kendi declaration/initialization'larından önce kullanılamaz. Bu yalnız “undefined döndürür” diye varsayılmamalıdır.

## 7. Sınır ve kritik ayrımlar

```ts
const code = "outer";
{
  const code = "inner";
  console.log(code); // inner
}
console.log(code); // outer
```

Bir iç blokta aynı ismin kullanılması mümkündür. Ancak aynı scope içinde aynı isimli `const` veya `let` tekrar tanımlanamaz. Bu tür duplikasyon type/parsing düzeyinde hata oluşturabilir.

**Function invocation:** Bir function'ın `counter` local'ı ikinci çağrıya otomatik taşınmaz. İki çağrı arasındaki kalıcı state ile local binding'i karıştırma; closure konusu bu derste öğretilmiyor.

## 8. Debugging — kanıttan düzeltmeye

**Belirti:** İç block'ta `attempts` artırılmış ama dış log hâlâ 1.
1. Hangi `attempts` declaration'ları var? Dosya içindeki isimleri bul.
2. Her okuma ve assignment için en yakın scope'u belirle.
3. İçte `let attempts=10` varsa outer `attempts=1` değişmez.
4. Gereksinim outer state güncelleme istiyorsa ayrı declaration'ın gerekliliğini sorgula.
5. Minimal değişiklik yapıp inner ve outer logları yeniden kontrol et.

Debugging'de “değer niye değişmedi?” sorusunun cevabı çoğu zaman **yanlış binding'i izlemiş olmak**tır.

## 9. Mülakat hazırlığı ve bağımsız pekiştirme

**Question: What is variable shadowing?**

> Shadowing occurs when a declaration in an inner scope uses the same name as a binding in an outer scope. The inner binding is used within its scope; it does not automatically mutate the outer one.

**Question: What is block scope?**

> A let or const binding belongs to the nearest enclosing block and is not generally accessible outside it.

**Pekiştirme:** (1) `showScore` hangi sırayla ne yazar? (2) Function içindeki `fee` dışarıdan kullanılabilir mi? (3) Shadowing ile assignment farkını nasıl anlarsın? (4) `const code="A"; {const code="B"}` geçerli mi?

<details><summary>Cevap kontrolü</summary>

1. passed, 80, 50. 2. Hayır. 3. Yeniden declaration varsa ayrı binding; yoksa uygun scope'taki mevcut binding güncellenebilir. 4. Evet, farklı block scope'ları vardır.

</details>

## 10. Rehberli örnek: aynı isim neden farklı sonuç verir?

```ts
let result = 10;
function update(): void {
  let result = 20;
  result += 5;
  console.log(result); // 25
}
update();
console.log(result); // 10
```

Buradaki iç `let result` **ayrı bir binding** oluşturduğu için dış result 10 kalır. Şimdi iç declaration'ı kaldır:

```ts
let result = 10;
function update(): void {
  result += 5;
}
update();
console.log(result); // 15
```

İkinci örnekte function outer binding'e erişip onu değiştirir. **Yalnız bir kelimelik declaration farkı**, side effect oluşturup oluşturmamayı değiştirir.

### Temporal dead zone sınırı

```ts
// Bilerek çalıştırılmaması gereken örnek:
// console.log(status); // ReferenceError / TypeScript uyarısı
// const status = "ready";
```

`let` ve `const` için declaration öncesi erişim güvenilir “undefined” okuma yöntemi değildir. Scope içine dahil olmak ve **initialized olmak** aynı şey değildir.

### Shadowing test tablosu

| Yapılan işlem | Outer result | Inner result |
| --- | ---: | ---: |
| Inner `let result=20` | 10 | 20 |
| Inner `result += 5` | 10 | 25 |
| Inner declaration yok, outer'a +5 | 15 | ayrı inner binding yok |

### Bağımsız görev

İç block'ta `const account={score:10}` tanımlandığında dış block'ta aynı adlı `account` varsa hangisi okunur? Eğer inner object property mutate edilirse dış account object mutlaka değişir mi?

<details><summary>Kontrol</summary>

En yakın scope'taki binding okunur. Inner ve outer farklı object literal'leriyle yaratılmışsa dış object etkilenmez; aynı referansı taşıyorlarsa etkilenebilir. Scope ile object identity farklı kavramlardır.

</details>
