# Ders 2 — Returned Functions & Closure Factories

## 1. Neden öğreniyoruz?

Bazen bir işi hemen yapmak değil, **belirli bir ayarla daha sonra çalıştırılabilecek bir fonksiyon oluşturmak** isteriz. Fonksiyon döndüren fonksiyon bu ihtiyacı karşılar. Bu tür fonksiyon da bir *higher-order function* (HOF) örneğidir; I5A'da callback **alan** HOF biçimini görmüştük.

Yeni bir yazım biçimine ihtiyaç duymadan, bildiğimiz `function inner() { ... }` ve `return inner;` üzerinden ilerleyelim.

## 2. Açıklamalı örnek: Çarpan oluşturan factory

```ts
function createMultiplier(factor: number) {
  function multiply(value: number): number {
    return value * factor;
  }

  return multiply;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));   // 10
console.log(triple(5));   // 15
console.log(double(10));  // 20
```

Adım adım:

1. `createMultiplier(2)` çalışır; bu çağrının `factor` değeri 2 olur.
2. `multiply` fonksiyonu oluşturulur, ama henüz çağrılmaz.
3. `return multiply;` fonksiyon değerini döndürür; `double` ona referans tutar.
4. Dış çağrı biter. `double(5)` daha sonra çalışınca `value = 5` ve yakalanan `factor = 2` kullanılır.
5. `createMultiplier(3)` ayrı bir çağrıdır; kendi `factor = 3` çevresinde başka bir `multiply` oluşturur.

| İfade | Nedir? | Sonuç |
| --- | --- | --- |
| `createMultiplier(2)` | Factory çağrısı | Fonksiyon döndürür |
| `double` | Döndürülmüş fonksiyon referansı | Çağrı henüz yok |
| `double(5)` | Döndürülmüş fonksiyon çağrısı | 10 |
| `triple(5)` | Başka closure instance çağrısı | 15 |

Dış çağrının bitmiş olması, fonksiyonun eriştiği `factor` değişkeninin bağlantısını kesmez.

## 3. Function factory ne demek?

**Factory**, çağrıldığında yeni bir fonksiyon üreten fonksiyondur. `createMultiplier` her çağrısında farklı bir ayara sahip fonksiyon döndürebilir.

Fonksiyonlar aynı kodu kullanabilir; ama çağrıldıkları factory invocation'ların **lexical çevreleri farklıdır**. Bu nedenle `double` ve `triple` farklı `factor` değerlerine erişir.

## 4. İkinci kullanım: Etiketli mesaj

```ts
function createPrefix(prefix: string) {
  function addPrefix(message: string): string {
    return prefix + ": " + message;
  }

  return addPrefix;
}

const audit = createPrefix("AUDIT");
const debug = createPrefix("DEBUG");

console.log(audit("Login"));  // "AUDIT: Login"
console.log(debug("Login"));  // "DEBUG: Login"
```

Gerçekçi gerekçe: Etiketleme kararını her çağrıda yeniden yazmak yerine `audit` ve `debug` fonksiyonları kendi ayarlarını taşır. Burada yeni bir framework, özel kütüphane veya global durum gerekmez.

## 5. Hangi hata oluşabilir?

```ts
const doubleFunction = createMultiplier(2); // function
const result = doubleFunction(5);            // number: 10

// result(10); // Yanlış: number çağrılamaz.
```

Bir başka yaygın yanlış okuma: `double(5)` çağrıldığında `createMultiplier(2)` yeniden çalışıyor sanmak. Hayır; yalnız daha önce döndürülmüş `multiply` çalışır.

Debugging soruları: Hangi factory çağrısı hangi fonksiyonu üretti? `factor` hangi çağrıda oluşturuldu? Fonksiyonun kendisini mi sakladım, döndürdüğü sayıyı mı? Hangi satır gerçekten çağrı yapıyor?

## 6. Mülakat hazırlığı

**Question: What is a function factory and how does closure help?**

> A function factory returns a new function. That returned function can access variables from the factory call in which it was created, so different calls can produce functions with different configurations.

**Türkçe:** Function factory yeni bir fonksiyon döndürür. Döndürülen fonksiyon kendi oluşturulduğu çağrının dış değişkenlerini kullanabilir; böylece farklı ayarlara sahip fonksiyonlar elde edilir.

## 7. Pekiştirme

1. `const timesFour = createMultiplier(4);` satırında `timesFour` fonksiyon mu sayı mı tutar?
2. `timesFour(3)` hangi iki değişkeni çarpar?
3. `createMultiplier(2)` ve `createMultiplier(3)` aynı `factor` değişkenini mi paylaşır?
4. `createPrefix("INFO")` için `info("Ready")` çıktısını tahmin et.
5. Bir factory'nin callback alan HOF'tan farkını açıkla.

**Kısa kontrol:** (1) Fonksiyon. (2) `value=3` ve `factor=4`, sonuç 12. (3) Hayır, farklı çağrı çevreleri. (4) `"INFO: Ready"`. (5) Biri fonksiyon döndürür, diğeri parametre olarak fonksiyon alır.
