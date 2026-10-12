# Ders 3 — Rejection, Throw & Error Propagation

## 1. Promise nasıl başarısız olur?

Promise'in başarısız tamamlanmasına **rejection** denir.

```ts
const success = Promise.resolve("ready");
const failure = Promise.reject(new Error("Not found"));
```

`success` fulfilled, `failure` rejected olur. Rejected Promise'in nedeni burada bir `Error` nesnesidir. **Örneği doğrudan çalıştırırken rejection ele alınmalıdır**; aşağıda bunu gösteriyoruz.

## 2. Async fonksiyondaki `throw`

```ts
async function loadUser(): Promise<string> {
  throw new Error("User not found");
}
```

`throw`, o çalışmanın normal akışını keser. Async fonksiyonda yakalanmayan hata, çağıranın aldığı **rejected Promise** ile temsil edilir. Dönüş tipi `Promise<string>` olsa bile başarılı string sonuç üretilmeyebilir.

```ts
async function createReport(): Promise<string> {
  const user = await loadUser();   // rejection burada hata olarak ortaya çıkar
  return "Report: " + user;        // çalışmaz
}
```

`createReport()` hatayı yakalamaz; onun Promise'i de rejected olur. Buna **error propagation (hata aktarımı)** denir.

## 3. Hata nerede yakalanıyor?

```ts
async function main(): Promise<void> {
  try {
    const report = await createReport();
    console.log(report);
  } catch (error) {
    console.log("Report oluşturulamadı");
  }
}

main();
```

Akış: `loadUser` reject → `createReport` içindeki `await` hata → burada catch yok, rejected Promise üst kata gider → `main` içindeki `await` hata → `main` içindeki `catch` yakalar.

**Her async fonksiyonun kendi catch'i olması gerekmez.** Hata uygun sorumluluk seviyesinde ele alınabilir.

## 4. `.then()` ve `.catch()` ile aynı Promise akışını okumak

```ts
function getScore(): Promise<number> {
  return Promise.resolve(50);
}

getScore()
  .then(score => score * 2)
  .then(doubled => console.log(doubled)) // 100
  .catch(error => console.log("Hata:", error));
```

`.then(callback)` bir Promise başarılı olduğunda callback çalıştırır ve yeni bir Promise döndürür; callback'in sonucu sonraki `.then`'e aktarılabilir. `.catch(callback)` zincirdeki rejection'ı yakalar. Callback'ler Promise zaten settled olsa dahi daha sonraki microtask aşamasında çalışır.

## 5. Gerçek hata ile log yazmayı ayır

`console.log("Error")` tek başına hata üretmez veya ileri aktarmaz. `throw error` ise yakalanan hatayı yeniden fırlatır. Bir hatanın üst katmana gidip gitmediğini anlamak için `catch` içinde **normal return mü, rethrow mu?** sorusunu sor.

## 6. Düşün ve açıkla

```ts
async function inner(): Promise<number> { throw new Error("Bad"); }
async function outer(): Promise<number> {
  const n = await inner();
  return n + 1;
}
```

`outer()` fulfilled mı rejected mı olur? Hata kendi içinde yakalanıyor mu? Bir üst katmanda `await outer()` kullanan `try/catch` neyi gözler?

**Kanıt sınırı:** Hata akışını okumak I7 kapsamındadır; gerçek debugging/stack trace incelemesi I8'e bırakılır.
