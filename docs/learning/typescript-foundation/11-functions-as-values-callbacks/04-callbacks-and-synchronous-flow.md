# Ders 4 — Callbacks: Named / Inline ve Synchronous Execution Flow

## 1. Callback hangi problemi çözer?

Bir fonksiyonun **hangi işi yapacağını dışarıdan seçmek**, o işi **ne zaman çalıştıracağına içeride karar vermek** isteyebiliriz. Callback, başka bir fonksiyona argument olarak verilen ve o fonksiyonun çağırabildiği fonksiyondur.

Bu sayede aynı `runOperation` kodunu değiştirmeden `double`, `triple` veya başka bir hesaplama davranışı gönderebiliriz.

## 2. En küçük çalışan örnek

```ts
type Operation = (value: number) => number;

function double(value: number): number {
  return value * 2;
}

function runOperation(
  value: number,
  operation: Operation
): number {
  return operation(value);
}

console.log(runOperation(5, double)); // 10
```

İsimlerin rolleri:

| İsim | Görevi |
| --- | --- |
| `runOperation` | Callback kabul eden dış fonksiyon |
| `double` | Dışarıdan verilen callback |
| `value` | Dış fonksiyona gelen sayısal parameter |
| `operation` | Dış fonksiyonun callback'i tuttuğu parameter |
| `operation(value)` | Callback'in **gerçek çağrı anı** |

**Kritik ayrım:** `runOperation(5, double)` satırında `double` gönderilir; `double` henüz çağrılmaz. Çağrı, dış fonksiyondaki `operation(value)` satırına gelindiğinde gerçekleşir.

## 3. Argument → parameter → invocation

Şu çağrıyı oku:

```ts
runOperation(5, double);
```

1. `runOperation` çağrılır.
2. Birinci argument `5`, `value` parametresine bağlanır.
3. İkinci argument `double`, `operation` parametresine bağlanır.
4. `operation(value)` → bu çağrıda `double(5)` anlamına gelir.
5. `double` `10` döndürür.
6. `runOperation` bu `10` değerini dışarı döndürür.

Fonksiyon bir parametreye atanabildiği için adının içeride değişmesi normaldir. `operation` özel JavaScript komutu değildir.

## 4. Named callback ve inline callback

### Named — Önceden oluşturulan fonksiyon

```ts
function triple(n: number): number {
  return n * 3;
}

console.log(runOperation(4, triple)); // 12
```

### Inline — Çağrı sırasında fonksiyon expression oluşturmak

```ts
console.log(runOperation(4, (x) => x * 3)); // 12
```

Bu iki çağrı aynı hesaplamayı yaptırır. Inline biçimde:

- `(x) => x * 3` yeni bir fonksiyon **değeri** üretir.
- Bu değer `operation` parametresine verilir.
- `operation(value)` satırında callback çağrılır.
- `x` callback'in **kendi** parametresidir; `value` ile isimleri aynı olmak zorunda değildir.

`runOperation(4, (x) => x * 3)`, “callback çağrı noktasında hemen çalıştırıldı” demek değildir. **O anda oluşturulup argument olarak gönderildi** demektir.

## 5. Yanlış kullanım: referans yerine sonuç göndermek

```ts
runOperation(4, triple); // Doğru

// Hatalı:
// runOperation(4, triple(4));
```

İkinci biçimde JavaScript çağrı argument'larını değerlendirirken önce `triple(4)`'ü çalıştırır: sonuç `12`. Yani mantıken `runOperation(4, 12)` göndermiş oluruz. Ama `operation` parametresi **fonksiyon** bekliyor.

TypeScript bu çağrıyı uyumsuz tip olarak reddeder. Tip denetiminin atlandığı JavaScript ortamında sayı üzerinde `operation(value)` yapmak `TypeError` oluşturur.

## 6. Synchronous execution — Çalışma sırası

```ts
function execute(
  value: number,
  action: (x: number) => number
): number {
  console.log("B");
  const result = action(value);
  console.log("D");
  return result;
}

console.log("A");

const result = execute(8, (x) => {
  console.log("C");
  return x * 3;
});

console.log(result);
```

Beklenen terminal çıktısı:

```text
A
B
C
D
24
```

Neden?

1. `execute` **tanımlanır**, ancak içindeki `B` henüz çalışmaz.
2. Üst düzey `console.log("A")` yürütülür.
3. `execute(...)` çağrılır: `B` basılır.
4. `action(value)` ile callback çağrılır: `C` basılır, `24` döner.
5. Callback biter; dış fonksiyon kaldığı yerden devam eder: `D` basılır.
6. `execute` sonucu döndürür; son `console.log(result)` `24` basar.

**Synchronous callback** çalışırken dış fonksiyon o satırda callback'in bitmesini bekler; sonra devam eder. Burada Promise, event loop veya async davranışı yoktur.

## 7. Başka bir callback: sayı yerine metin

Callback mutlaka sayı almak zorunda değildir:

```ts
function runTask(
  message: string,
  callback: (text: string) => void
): void {
  console.log("Başlangıç");
  callback(message);
  console.log("Bitiş");
}

function printMessage(text: string): void {
  console.log(text);
}

runTask("Merhaba", printMessage);
```

Çıktı:

```text
Başlangıç
Merhaba
Bitiş
```

Burada `callback(message)` çıktıya yol açar. Dış fonksiyon bitmeden önce callback çalıştırılır. `void`'un dönüş değeri kullanımıyla ilişkisini sonraki derste ayrıntılandırıyoruz.

## 8. Debugging: neden callback çalışmadı?

Örnek kusur:

```ts
function brokenRunner(
  value: number,
  operation: (x: number) => number
): number {
  return value; // Callback hiç çağrılmıyor.
}
```

Araştırma sırası:

1. **Reproduce:** `brokenRunner(5, double)` için expected `10`, actual `5`.
2. **Observe:** Fonksiyon gövdesinde `operation(value)` çağrısı var mı?
3. **Hypothesis:** Callback hiç invoke edilmiyor.
4. **Experiment:** Geçici izleme ekle veya debugger ile callback'e girilip girilmediğini incele.
5. **Root cause:** Runner callback'i kullanmadan input'u döndürüyor.
6. **Fix:** Sözleşmeye uygun yerde callback'i çağır.
7. **Reverify:** `double` ve `triple` ile farklı sonuçları yeniden doğrula.

Bu bir **öğretici debugging örneğidir**; gerçek repo üzerinde yapılmış hata araştırması veya bağımsız debugging kanıtı değildir.

## 9. Gerçekçi kullanım — Değişebilen işlem

```ts
function addFive(n: number): number {
  return n + 5;
}

function subtractTwo(n: number): number {
  return n - 2;
}

console.log(runOperation(10, addFive));    // 15
console.log(runOperation(10, subtractTwo)); // 8
```

Runner'ın sorumluluğu callback'e input vermek ve sonucunu döndürmektir. İş kuralını seçmek caller'ın sorumluluğudur. Bu, kod tekrarını azaltabilir ve davranışı test etmeyi kolaylaştırabilir; her küçük hesaplama için zorunlu tasarım değildir.

## 10. Mülakat hazırlığı

**Question: What is a callback, and when does it execute?**

> A callback is a function passed as an argument to another function. Passing the function reference does not execute it. In a synchronous example, the receiving function invokes the callback at a specific line and continues after the callback returns.

**Türkçe:** Callback başka bir fonksiyona argument olarak gönderilir. Referansı göndermek çağırmak değildir; senkron durumda dış fonksiyon çağrı satırına gelince callback çalışır ve ardından kaldığı yerden devam eder.

## 11. Pekiştirme

1. `runOperation(5, double)` içinde callback hangi fonksiyondur?
2. Fonksiyon gerçekte hangi satırda çağrılır?
3. `runOperation(5, double(5))` neden geçerli callback gönderimi değildir?
4. `runOperation(3, (x) => x + 7)` çağrısında `x` kaç olur?
5. `A B C D 24` örneğinde `C` neden `D`'den önce yazılır?

**Kontrol:** (1) `double`. (2) `operation(value)`. (3) Callback yerine hesap sonucu olan number gönderilir. (4) 3. (5) Dış fonksiyon callback tamamlanana kadar o çağrı satırında bekler.
