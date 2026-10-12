# Ders 5 — Higher-Order Functions, Return Value, Side Effect ve `void`

## 1. Neden öğreniyoruz?

Bir fonksiyon başka bir fonksiyonu argument olarak kabul ediyorsa **higher-order function (HOF)** olarak adlandırılır. Bu yaklaşım, **hangi davranışın seçileceğini** ve **ne zaman çalıştırılacağını** ayırmamızı sağlar.

Higher-order function'ların fonksiyon döndürebilen biçimleri de vardır; **bu ders yalnız callback alan biçimiyle ilgilenir**. Dış kapsamdan değer yakalama (closure) ayrı çalışılacaktır.

## 2. Aynı runner, farklı iş kuralları

```ts
type Operation = (value: number) => number;

function execute(
  input: number,
  action: Operation
): number {
  return action(input);
}

function double(n: number): number {
  return n * 2;
}

function triple(n: number): number {
  return n * 3;
}

console.log(execute(5, double)); // 10
console.log(execute(5, triple)); // 15
```

Burada `execute` **higher-order function**, `double` ve `triple` ise ona gönderilen **callback**'lerdir. Runner'ın kodu değişmez; dışarıdan verilen fonksiyon davranışı belirler.

## 3. Callback'in return değeri başka bir return'e dönüşebilir

```ts
function processAmount(
  amount: number,
  operation: Operation
): number {
  console.log("İşlem başladı");
  const calculated = operation(amount);
  console.log("İşlem tamamlandı");
  return calculated + 10;
}

console.log(processAmount(20, double));
```

Çıktı:

```text
İşlem başladı
İşlem tamamlandı
50
```

Veri akışı:

1. `amount = 20` ve `operation = double`.
2. `operation(amount)` → `double(20)` → **40**.
3. `calculated` **40** olur.
4. Dış fonksiyon `calculated + 10` → **50** döndürür.
5. Caller'ın `console.log(...)` satırı **50** yazar.

**Callback'in return değeri (40)** ve **higher-order function'ın return değeri (50)** ayrı olabilir.

## 4. Return ile side effect aynı şey değildir

```ts
function printMessage(message: string): void {
  console.log(message);
}

function makeMessage(name: string): string {
  return `Hello ${name}`;
}
```

- `printMessage("Hi")` terminale metin yazar: dışarıdan gözlenebilir **side effect**.
- `makeMessage("Ada")` bir string döndürür. Caller bunu saklayabilir veya başka yerde kullanabilir.
- Her log yapan fonksiyon mutlaka `void` olmak zorunda değildir; aynı fonksiyon hem yan etki üretebilir hem değer döndürebilir.

```ts
const message = makeMessage("Ada"); // string: "Hello Ada"
printMessage(message);             // Terminal: "Hello Ada"
```

`return` değerin çağıran yere gitmesini, `console.log` terminale çıktı üretilmesini sağlar. İkisi birbirinin yerine geçmez.

## 5. `() => void` sözleşmesinin anlamı

```ts
type Reporter = (message: string) => void;

function runTask(
  message: string,
  reporter: Reporter
): void {
  reporter(message);
}
```

`Reporter`, “bir string alan, dönüş sonucu **kullanılmayacak** fonksiyon” beklentisini ifade eder.

Önemli TypeScript nüansı:

```ts
function runTask(callback: () => void): void {
  callback();
  console.log("Görev tamamlandı");
}

function calculate(): number {
  console.log("Hesaplama yapıldı");
  return 100;
}

runTask(calculate);
```

Çıktı:

```text
Hesaplama yapıldı
Görev tamamlandı
```

`calculate` gerçekte **100** döndürür. Ancak `runTask` o değeri kullanmaz. Bu nedenle TypeScript, **number döndüren fonksiyonun** `() => void` beklenen callback pozisyonuna atanmasına izin verir.

Bu özel **function type uyumluluğunu**, “`function f(): void` şeklinde açıkça tanımladığım fonksiyondan sayı döndürebilirim” diye yorumlama. Açık `: void` dönüş tipi olan normal bir fonksiyonda sayı döndürmek tip hatasıdır.

## 6. Bütünleşik örnek — Hesaplama ve raporlama callback'leri

Aşağıdaki örnekte iki ayrı callback sözleşmesi birlikte çalışır:

```ts
type Operation = (value: number) => number;
type Reporter = (message: string) => void;

function addFive(value: number): number {
  return value + 5;
}

function printReport(message: string): void {
  console.log(message);
}

function processNumber(
  input: number,
  operation: Operation,
  reporter: Reporter
): number {
  reporter("İşlem başladı");

  const result = operation(input);

  reporter("Hesaplama tamamlandı");
  reporter(`Sonuç: ${result}`);
  reporter("İşlem başarıyla tamamlandı");

  return result;
}

const selectedOperation = addFive;
const finalResult = processNumber(10, selectedOperation, printReport);
console.log(finalResult);
```

Beklenen çıktı:

```text
İşlem başladı
Hesaplama tamamlandı
Sonuç: 15
İşlem başarıyla tamamlandı
15
```

**Fonksiyonların görevleri:**

| İsim | Rol | Return / etki |
| --- | --- | --- |
| `processNumber` | HOF; iki callback kabul eder | number döndürür |
| `addFive` | Hesaplama callback'i | number döndürür |
| `printReport` | Raporlama callback'i | Konsola yazar, `void` |
| `operation(input)` | Hesaplamayı çağırır | `result = 15` |
| `reporter(...)` | Bilgilendirme işini çağırır | Return kullanılmaz |
| `finalResult` | HOF'un sonucu | number 15 |

`selectedOperation = addFive` satırı fonksiyonu çalıştırmaz. `processNumber` içindeki `operation(input)` ise çalıştırır. **Son `15` çıktısı**, hesaplama callback'inin logundan değil, `console.log(finalResult)` satırından gelir.

## 7. Yaygın üç callback bug'ı

### Bug A — Sonucu yanlış zamanda göndermek

```ts
// execute(5, double(5));  // Callback yerine number gönderme hatası.
execute(5, double);        // Function reference gönder.
```

### Bug B — Callback'i hiç çağırmamak

```ts
function brokenExecute(input: number, action: Operation): number {
  return input; // Action kullanılıyor sanıldı, ama invoke edilmiyor.
}
```

### Bug C — Callback'in sonucunu yanlış kullanmak

```ts
function brokenAmount(input: number, action: Operation): number {
  action(input);
  return input + 10; // Callback'in return değeri kayboldu.
}
```

Örneğin `brokenAmount(5, double)` için `20` bekliyorsak actual `15` olur: `double(5)` 10 döndürür ama sonuç kullanılmaz, `5 + 10` hesaplanır.

## 8. Sistematik debugging

| Adım | Sorulacak soru |
| --- | --- |
| Reproduce | Hangi input ve callback ile expected/actual farklı? |
| Observe | Callback'e gerçekten giriliyor mu, doğru argument gidiyor mu? |
| Hypothesis | Referans mı sonuç mu gönderdik? Return'u göz ardı mı ettik? |
| Experiment | Tek değişiklik yapınca hangi çıktı değişiyor? |
| Root cause | Hangi satır ve hangi yanlış varsayım kusuru oluşturdu? |
| Fix | Callback uygun yerde çağrılıyor ve sonucu gereği gibi kullanılıyor mu? |
| Reverify | Farklı callback ve sınır değerinde davranış doğru mu? |

Bu örnekler **ders örnekleridir**; real-world hata çözümü ve repo testlerinin çalıştığı kanıtı değildir.

## 9. Test tasarımı: Ne kanıtlamak istiyoruz?

Bir runner geliştirdiğinde şu davranışları ayrı kontrol et:

| Gereksinim | Örnek | Beklenen |
| --- | --- | --- |
| Callback çağrısı | `execute(5, double)` | 10 |
| Başka callback | `execute(5, triple)` | 15 |
| Sıfır sınırı | `execute(0, double)` | 0 |
| Eksi sayı | `execute(-2, triple)` | -6 |
| Callback sonucu işleme | `processAmount(20, double)` | 50 |
| Reporter çağrıları | `processNumber(10, addFive, printReport)` | Doğru sıra ve metin |

Bunlar **aday test senaryoları**dır; gerçek `tests/` dosyaları ve Vitest çalıştırma kanıtı yerine geçmez. Uygulama aşamasında gerekçelendirilmiş test seçimi, failed test gözlemi ve tekrar doğrulama gerekir.

## 10. Mülakat hazırlığı

**Question: What is a higher-order function?**

> A higher-order function takes another function as an argument or returns a function. In this example, it receives a callback and invokes it. This separates the reusable workflow from the specific behavior.

**Türkçe:** HOF başka bir fonksiyonu argument olarak alabilir veya fonksiyon döndürebilir. Bu örnekte callback alan biçimi kullanıldı: akış aynı kaldı, davranış dışarıdan seçildi.

**Question: What does a void callback type mean?**

> A callback typed as () => void is used when the caller does not rely on its return value. TypeScript may accept a function returning a value in this position because the caller ignores that value.

**Türkçe:** `() => void`, çağıran tarafın callback'in return değerine güvenmeyeceğini belirtir. Callback'in gerçekte hiçbir değer üretemeyeceği anlamına gelmez.

## 11. Pekiştirme ve aktarım

1. `processAmount(10, triple)` çağrısının `calculated` ve nihai return değerlerini hesapla.
2. `reporter("Başladı")` ile `return "Başladı"` arasındaki fark nedir?
3. Hangi fonksiyon higher-order, hangileri callback?
4. `() => void` callback yerine number döndüren fonksiyon verildiğinde TypeScript neden kabul edebilir?
5. `brokenAmount(5, double)` neden 20 yerine 15 döndürür?
6. **Yeni aktarım fikri:** Sayı alan bir `transformAndDescribe` fonksiyonu, dışarıdan hesaplama callback'i ve metin raporlama callback'i kabul etsin. Sonuç değerini döndürsün ve belirlenen sırada mesaj oluştursun. Önce imzayı ve expected-result örneklerini tasarla; hazır çözümü kopyalama.

**Kısa kontrol:** (1) 30 ve 40. (2) İlkinde callback'e message verilir, ikincisinde caller'a değer döner. (3) `processNumber` HOF; `addFive` / `printReport` callback. (4) Çağıran dönüş değerini kullanmaz. (5) Callback return değeri göz ardı edilir.

**Kapsam sınırı:** Dış kapsamı yakalayan closure'lar I5B; collection methods ve async callback'ler sonraki konulardır.
