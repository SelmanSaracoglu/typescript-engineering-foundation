# Ders 9 — Local Variables, Return, Early Exit ve Function Flow

## 1. Neden öğreniyoruz?

Bir function bazen birden fazla `return` barındırır. Kodun sonunda bir satır bulunması, her çağrının mutlaka o satıra ulaşacağı anlamına gelmez. Erken return, doğru yerleştirildiğinde gereksiz iç içe koşulları azaltabilir; yanlış yerdeyse işlemeyi yarıda keser.

## 2. Temel kavramlar

**Local variable** function çağrısı içinde kullanılan bağdır. **Return statement** ilgili fonksiyon çağrısının yürütmesini durdurur ve (varsa) caller'a değer döndürür. **Early return**, fonksiyon gövdesinin sonuna varmadan koşullu bir yol üzerinden çıkılmasıdır.

Öğretici model: `argument → parameter binding → local computations → chosen return → caller`. Her control-flow yolunu ayrı izlemek gerekir.

## 3. Açıklamalı TypeScript örneği

```ts
function classify(score: number): string {
  const threshold = 60;
  if (score < threshold) {
    return "retry";
  }
  const result = "passed";
  return result;
}

console.log(classify(59)); // retry
console.log(classify(60)); // passed
console.log(classify(75)); // passed
```

## 4. Execution flow — adım adım

**`classify(59)`:** `score=59`; `threshold=60`; `59<60` true; `return "retry"` çağrıyı bitirir. `result` satırına **ulaşılmaz**.

**`classify(60)`:** `score=60`; `60<60` false; execution sonraki satıra ilerler; `result="passed"`; return passed.

**`classify(75)`:** Aynı ikinci yol seçilir.

| Girdi | Condition | İşlenen return | Sonuç |
| --- | --- | --- | --- |
| 59 | true | ilk | retry |
| 60 | false | son | passed |
| 75 | false | son | passed |

Aynı function tanımının farklı invocation'ları farklı yollar üzerinden biter.

## 5. Farklı durumlarla derinleştirme

### `return` ile `console.log` aynı değil

```ts
function compute(n: number): number {
  console.log("computing");
  return n * 2;
}
const value = compute(5); // computing
console.log(value);       // 10
```

İlk log function gövdesinden, ikinci log caller'dan gelir. Function'ın normal return kanalı `10` değeridir.

### Ulaşılamayan satır

```ts
function absolute(n: number): number {
  if (n < 0) return -n;
  return n;
  // console.log("finished"); // return'den sonra çalışmaz
}
```

Bir `return`'den sonraki expression aynı yolda yürütülmez. Bunun debugging'de önemi büyüktür: “Bu log niye görünmedi?” sorusu bazen yanlış dosyaya değil **erken biten control-flow yoluna** işaret eder.

### Return unutulunca

```ts
// Bilerek yanlış model:
// function isAdult(age: number): boolean {
//   if (age >= 18) return true;
//   // 17 için return yok: yanlış sözleşme
// }
```

TypeScript `boolean` return beklentisiyle bazı execution yollarının `undefined` döneceğini belirtebilir. Bazı fonksiyonların bilinçli olarak `void` dönmesi ayrı tasarım kararıdır.

## 6. TypeScript ile çalışma zamanı farkı

`function classify(score: number): string` her normal yürütme yolunda string dönme sözleşmesi taşır. Bu sözleşme her string'in doğru iş kategorisi olduğunu kanıtlamaz. `"passed"` yerine `"ok"` dönmek type bakımından geçebilir; requirement farklıysa logic bug olur.

`return` exception değildir. `throw`, normal çağrının sonuç kanalını terk eder ve exception handling mekanizmasına ilerler. Şimdilik return mekanizmasını anlamak yeterlidir.

## 7. Sınır ve kritik ayrımlar

**Sınır testi:** 59, 60, 61 tam olarak `<60` operator'ının davranışını ayırır. `score=0` ya da `score=-1` de normal number değerleridir; negatif skorların kabul edilmesi ayrı iş kuralıdır.

**Yanlış konum:** Döngüyle çok kayıt işleyen function'ın içine yanlış `return` koymak ilk kayıt sonrası bütün çağrıyı bitirir; `return`'ü if/loop'tan çıkış sanmamak gerekir.

**Yan etki:** Log, input object mutation veya dosya yazma gibi etkiler return edilen değerden bağımsız olabilir. Function'ın doğru sonuç dönmesi yan etki oluşturmadığını kanıtlamaz.

## 8. Debugging — kanıttan düzeltmeye

**Belirti:** 59 için yanlışlıkla "passed" geliyor.
1. Beklenen sınıflandırmayı gereksinimden yaz.
2. Gerçekte hangi `score` argument'ının geçtiğini doğrula.
3. `score < threshold` condition'ının runtime sonucunu izle.
4. Threshold yanlışsa minimum değişikliği yap.
5. 59/60/61 testlerini yeniden çalıştır.

**Belirti:** `console.log("finished")` hiç görünmüyor. Önce `return` veya exception nedeniyle execution'ın daha erken bitip bitmediğini kontrol et; otomatik olarak logger hatası sanma.

## 9. Mülakat hazırlığı ve bağımsız pekiştirme

**Question: What does a return statement do?**

> It completes the current function invocation and optionally supplies a value to the caller. It does not merely leave the nearest if block.

**Question: Is an early return always a bug?**

> No. It is useful when the function should stop once a condition is met. It is a bug when the requirement needs additional work after that return.

**Pekiştirme:** (1) `classify(60)` hangi return'a gider? (2) `return` sonrası satır neden çalışmaz? (3) İki çağrı aynı local `threshold` binding'ini mi paylaşır? (4) Tüm yolların return üretmesi neden önemlidir?

<details><summary>Cevap kontrolü</summary>

1. Son return. 2. Çağrı tamamlanır. 3. Her çağrı kendi local execution bağlamına sahiptir. 4. Caller'ın normal return sözleşmesi tutarlı olmalıdır.

</details>

## 10. Rehberli hata analizi: yanlış sıradaki return

Gereksinim: Negatif miktar geçersiz, sıfır miktar boş, pozitif miktar geçerli sayılsın.

```ts
function state(amount: number): string {
  if (amount <= 0) return "empty";
  if (amount < 0) return "invalid";
  return "available";
}
console.log(state(-1)); // empty — gereksinime aykırı!
```

**Neden?** `-1 <= 0` true olduğu için ilk return çalışır. İkinci condition'a hiçbir zaman ulaşılmaz. Yalnız ikinci condition'ı daha doğru yazmak bug'ı çözmez; **branch order** önemlidir.

Doğru öncelik:

```ts
function state(amount: number): string {
  if (amount < 0) return "invalid";
  if (amount === 0) return "empty";
  return "available";
}
console.log(state(-1)); // invalid
console.log(state(0));  // empty
console.log(state(1));  // available
```

| amount | İlk kontrol | İkinci kontrol | Dönüş |
| ---: | --- | --- | --- |
| -1 | true | çalışmaz | invalid |
| 0 | false | true | empty |
| 1 | false | false | available |

İki kod da string return eder ve typecheck'ten geçebilir. İş kuralını **hangi sırayla** uyguladığımız belirleyicidir.

### Debugging deneyi

Hatalı kodda `console.log("second branch")` satırını ikinci `if` içine koyduğunu düşün. -1 girdisinde bu log neden görünmez? İlk return, fonksiyonun tamamını bitirir.

### Bağımsız görev

`classifyTemperature` fonksiyonunda 0'ın “freezing”, negatiflerin “below freezing”, diğerlerinin “above freezing” olmasını istiyoruz. Üç durumu hangi sırayla test edersin? Önce beklenen tabloyu kur, sonra function body'yi yaz.

<details><summary>Kontrol</summary>

Önce `n < 0`, sonra `n === 0`, geri kalanlar için genel sonuç. `n <= 0` kontrolü önce yapılırsa iki özel durumu tek branch'te birleştirir.

</details>
