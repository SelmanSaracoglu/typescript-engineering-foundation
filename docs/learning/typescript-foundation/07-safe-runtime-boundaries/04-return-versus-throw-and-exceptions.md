# Ders 26 — return, throw, Error ve Exception Akışı

## 1. Normal sonuç ve exception aynı akış değildir

Bir function hesaplama yapıp geçersiz input'ta `null` veya error result dönebilir. Başka bir function ciddi hata durumunda `throw` ile yürütmenin normal yolunu bırakabilir. Bu iki davranışı karıştırmak debugging'i zorlaştırır.

## 2. Return normal sonuç kanalıdır

```ts
function divide(a: number, b: number): number | null {
  if (b === 0) return null;
  return a / b;
}
console.log(divide(6,3)); // 2
console.log(divide(6,0)); // null
```

`divide(6,0)` exception fırlatmaz; caller'a normal sonuç olarak null verir. Function'ın return type'ı normal iki alternatifi bildirir.

## 3. throw normal return değildir

```ts
function requirePositive(n: number): number {
  if (n <= 0) throw new Error("NON_POSITIVE");
  return n;
}
try {
  console.log(requirePositive(2)); // 2
  requirePositive(-1);
  console.log("never reached");
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message); // NON_POSITIVE
  }
}
```

İlk çağrı normal return eder. İkinci çağrıda `throw` normal yürütmeyi keser; `"never reached"` log'u çalışmaz. Control flow uygun `catch` bloğuna aktarılır.

## 4. Error nesnesi ve throw ayrı roller

`new Error("message")` bir Error object'i yaratır. `throw` bu değeri exception olarak fırlatır. `return new Error("message")` ise başka bir davranıştır: function **Error object'ini normal sonuç** olarak döndürür.

```ts
function returnsError(): Error {
  return new Error("NOT_THROWN");
}
const e = returnsError();
console.log(e.message); // NOT_THROWN
```

Caller'ın `try/catch`'i sırf bir Error object'i return edildi diye otomatik devreye girmez.

## 5. Catch value neden unknown?

JavaScript'te farklı değerler throw edilebilir. `catch(error: unknown)` kullanmak erişimden önce kontrol etmeyi teşvik eder.

```ts
try {
  throw "plain text";
} catch (error: unknown) {
  if (typeof error === "string") {
    console.log(error); // plain text
  }
}
```

Her catch value'nun Error instance olduğunu varsaymak güvenilir değildir.

## 6. Hangi strateji doğru?

Beklenen, sık karşılaşılan input validation başarısızlığı için `Result` union açık ve anlaşılır olabilir. Normal yürütmeyi sürdüremeyen veya exceptional sayılan durumda throw kullanılabilir. **Her invalid input mutlaka throw etmelidir** diye genel kural yoktur.

Bu bölüm senkron exception handling ile sınırlıdır. Async/Promise rejection kapsamı ayrı konudur.

## 7. Hata araştırması

Belirti: Beklenen log hiç görünmüyor. Önce exception veya early return nedeniyle execution'ın daha önce bitip bitmediğini incele. Stack trace'i fırlatma noktasına kadar takip et.

Belirti: Catch çalışmadı. Function gerçekten throw mu yapıyor yoksa error result mı döndürüyor? Çağrı doğru try bloğunda mı?

## 8. Sınır tablosu

| Çağrı | Normal return | Exception |
| --- | --- | --- |
| `divide(6,3)` | 2 | yok |
| `divide(6,0)` | null | yok |
| `requirePositive(1)` | 1 | yok |
| `requirePositive(-1)` | yok | Error |

## 9. Mülakat ve pekiştirme

**Question:** How does throw differ from return?

> Return completes the function normally with a value. Throw interrupts the normal execution path and transfers control to exception handling.

**Kontrol:** `return new Error` catch tetikler mi? `throw new Error` sonrası satır yürür mü? Beklenen validation failure için her zaman throw şart mı?

<details><summary>Cevaplar</summary>

Hayır; hayır; hayır, açık Result kullanılabilir.

</details>

## 10. Aynı koşul için iki farklı hata sözleşmesi

```ts
function safeDivide(a: number, b: number): number | null {
  if (b === 0) return null;
  return a / b;
}
function strictDivide(a: number, b: number): number {
  if (b === 0) throw new Error("DIVIDE_BY_ZERO");
  return a / b;
}
console.log(safeDivide(6,0)); // null
try {
  strictDivide(6,0);
} catch(error: unknown) {
  if (error instanceof Error) console.log(error.message); // DIVIDE_BY_ZERO
}
```

Her iki function da b=0 durumunu **engeller**, ancak caller'ın ele alması gereken kanal farklıdır.

| Çağrı | Normal return | Exception |
| --- | --- | --- |
| `safeDivide(6,0)` | null | yok |
| `strictDivide(6,0)` | yok | Error |
| `safeDivide(6,3)` | 2 | yok |
| `strictDivide(6,3)` | 2 | yok |

### Reproduction ve debugging

Strict fonksiyonda catch tetiklenmediğini düşün. Gerçekte `strictDivide` mı çağrıldı, yoksa `safeDivide` gibi normal error sonucu dönen başka bir fonksiyon mu? Throw olup olmadığını önce doğrula.

### Bağımsız aktarım

Bir `parsePort(input:string)` function'ı tasarla. Boş string, `"0"`, `"8080"`, `"abc"` durumları için normal error result mı, exception mı kullanılacağını seç ve nedenini açıkla. Yalnız isimden otomatik karar verme.

<details><summary>Kontrol</summary>

İş sözleşmesi invalid input'u beklenen sonuç olarak tanımlıyorsa explicit Result uygun olabilir. Gerçek exception politikası API sözleşmesine bağlıdır.

</details>
