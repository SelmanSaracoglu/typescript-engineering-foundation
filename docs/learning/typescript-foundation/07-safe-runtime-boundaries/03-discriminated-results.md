# Ders 25 — Discriminated Result Union: Başarı ve Beklenen Hata

## 1. Beklenen başarısızlık da bir sonuçtur

Dış veriyi doğrulayan bir function invalid input'a sık sık rastlar. Bu normal bir durumsa caller'ın exception yakalamak yerine result'ın başarı mı hata mı olduğunu açıkça görebilmesi yararlı olabilir.

## 2. Discriminated union sözleşmesi

```ts
type Product = { name: string };
type Result =
  | { ok: true; value: Product }
  | { ok: false; error: "INVALID_SHAPE" };

function validate(input: unknown): Result {
  if (typeof input !== "object" || input === null ||
      Array.isArray(input) || !("name" in input) ||
      typeof input.name !== "string") {
    return { ok:false, error:"INVALID_SHAPE" };
  }
  return { ok:true, value:{name:input.name} };
}
```

`ok` ortak **discriminant** alanıdır. True branch value taşır, false branch error taşır. İki branch'in shape'i TypeScript tarafından ayrıştırılır.

## 3. Caller nasıl güvenle tüketir?

```ts
const result = validate({name:"Ali"});
if (result.ok) {
  console.log(result.value.name); // Ali
} else {
  console.log(result.error);
}
```

Caller `result.ok` kontrolü yapmadan `result.value` alanını kullanmamalıdır. Boolean literal kontrolü sayesinde TypeScript hangi property'nin o branch'te bulunduğunu anlar.

## 4. Data flow

```text
input unknown
   |
   +---- invalid ----> {ok:false,error:"INVALID_SHAPE"}
   |
   +---- valid ------> {ok:true,value:{name:"..."}}
                                  |
                                caller
                                  |
                           ok kontrolü
```

Burada invalid input exception oluşturmak zorunda değildir. Result union, programın **normal return kanalı** içinde iki olasılık modeller.

## 5. Return ile throw farkı

```ts
function positive(n: number): {ok:true;value:number}|{ok:false;error:string} {
  if (n <= 0) return {ok:false,error:"NON_POSITIVE"};
  return {ok:true,value:n};
}
console.log(positive(-2)); // {ok:false,error:"NON_POSITIVE"}
```

Caller bu sonucu doğrudan inceleyebilir. `throw new Error("...")` yazılsaydı normal return akışı kesilirdi.

## 6. Result modelinin sınırı

Bu örnekte error code yalnız invalid shape'i temsil eder. İleride business validation ayrı error kodu isteyebilir; her hata tek generic koda indirgenmek zorunda değildir.

Bir Result type tanımı da dışarıdan gelen veriyi runtime'da otomatik doğrulamaz. Function içindeki gerçek check'ler gereklidir.

## 7. Test tasarımı

| Girdi | Beklenen |
| --- | --- |
| `{name:"Ali"}` | `ok:true` ve name Ali |
| `{}` | `ok:false` + INVALID_SHAPE |
| `{name:123}` | `ok:false` + INVALID_SHAPE |
| `null` | `ok:false` + INVALID_SHAPE |
| `[]` | `ok:false` + INVALID_SHAPE |

Sadece `ok:false` assertion'ı sözleşmenin bütününü kontrol etmez; error kodunu da test et.

## 8. Debugging

Belirti: Invalid input success dönüyor. Hangi guard yanlış? Property existence kontrolü yapılıyor mu? Name type doğru kontrol ediliyor mu? Null ve array durumları atlanıyor mu? Tek bir failing case üzerinde minimal düzeltme yap ve valid input regressions'ı tekrar çalıştır.

## 9. Mülakat ve pekiştirme

**Question:** Why use a discriminated union for validation?

> A shared literal property such as ok makes the success and failure shapes explicit and allows safe narrowing at the call site.

**Kontrol:** `validate({})` hangi dal? Success'te `error` var mı? Result return etmek exception mı?

<details><summary>Cevaplar</summary>

Failure; hayır; normal return kanalıdır.

</details>
