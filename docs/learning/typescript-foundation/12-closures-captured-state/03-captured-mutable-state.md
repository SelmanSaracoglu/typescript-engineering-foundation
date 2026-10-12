# Ders 3 — Captured Mutable State

## 1. Neden öğreniyoruz?

Closure yalnızca bir değişkeni okumak için kullanılmaz. Dış scope'taki **değiştirilebilir state** birden fazla çağrı boyunca güncellenebilir. Bu faydalı olabilir; ancak hangi çağrının state'i değiştirdiğini bilmezsek hataya yol açar.

**Captured variable** için yanlış düşünce: “Fonksiyon oluşturulurken değişkenin değeri değişmeyen bir snapshot olarak kopyalanır.” Önemli olan, closure'ın değişkenin **binding'iyle/bağlantısıyla** ilişkiyi korumasıdır.

## 2. Counter: Değer niçin sıfırlanmıyor?

```ts
function createCounter() {
  let count = 0;

  function next(): number {
    count = count + 1;
    return count;
  }

  return next;
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

- `createCounter()` bir kez çağrılır; `count = 0` bu sırada oluşturulur.
- `next` fonksiyonunun referansı döndürülür.
- Her `counter()` çağrısı aynı `count` değişkenini artırır.
- `createCounter()` her seferinde yeniden çalışmadığından `count` sıfırlanmaz.
- `count` global değildir; `createCounter` çağrısının lexical çevresine aittir.

| Adım | count önce | Değişiklik | count sonra / return |
| --- | ---: | --- | ---: |
| Factory çağrısı | — | `count=0` | 0 / return yok |
| İlk `counter()` | 0 | +1 | 1 |
| İkinci `counter()` | 1 | +1 | 2 |
| Üçüncü `counter()` | 2 | +1 | 3 |

## 3. `const` array de değişebilir

```ts
function createRecorder() {
  const messages: string[] = [];

  function record(message: string): number {
    messages.push(message);
    return messages.length;
  }

  return record;
}

const recorder = createRecorder();
console.log(recorder("Hello")); // 1
console.log(recorder("World")); // 2
```

`const`, `messages` değişkeninin **başka bir array'e yeniden atanmasını** engeller. Ama mevcut array'in içeriği `push` ile değiştirilebilir.

| İşlem | Array içeriği | Dönen sayı |
| --- | --- | ---: |
| Factory | `[]` | — |
| `recorder("Hello")` | `["Hello"]` | 1 |
| `recorder("World")` | `["Hello", "World"]` | 2 |

Buradaki ifade `messages = ["Hello"]` değildir; `messages.push("Hello")` mevcut array'i mutate eder. Closure, aynı array'e erişimi korur.

## 4. Gerçekçi fayda ve risk

Bir işlem kaydedici, kendisine şimdiye kadar kaç mesaj gönderildiğini izleyebilir. Ancak çağrılar **aynı state'i değiştirdiği için**, daha sonra yapılan işlem önceki işlemlerden etkilenir. İşin gereksinimi bağımsız kayıt tutmaksa bu state paylaşımı hatadır; toplam kayıt tutmaksa kasıtlı olabilir.

## 5. Debugging yöntemi

Beklenmedik `length` veya `count` gördüğünde:

1. Değişken hangisi? Nerede ve kaç kez oluşturuldu?
2. Hangi fonksiyon bu değişkene erişiyor?
3. Değiştiren satır `count++` / `messages.push(...)` hangisi?
4. Hangi çağrı önce çalıştı?
5. Sonraki çağrı **hangi güncel state'i** okudu?
6. Paylaşım gereksinim mi, yoksa yanlışlıkla mı oluştu?

Yeni test veya implementation kanıtı olarak değil, küçük kodun davranışını tahmin etmek için kullan.

## 6. Mülakat hazırlığı

**Question: Does a closure capture a fixed copy of a variable's value?**

> No. A closure retains access to the captured binding in its lexical environment. If that variable is mutable, later calls can observe its updated value.

**Türkçe:** Hayır. Closure, lexical çevredeki değişken bağına erişimi korur. Değişken değiştirilebiliyorsa sonraki çağrılar güncellenen değeri görür.

## 7. Pekiştirme

1. `counter()` art arda dört kez çağrılırsa son dönüş nedir?
2. Neden `count` her çağrıda `0` olmuyor?
3. `const messages` neden `push` kullanımını engellemez?
4. Üçüncü `recorder("Again")` çağrısının dönüşünü ve array durumunu tahmin et.
5. “Captured snapshot” neden bu örnekler için hatalı açıklamadır?

**Kısa kontrol:** (1) 4. (2) Factory yalnız başlangıçta çalıştı ve aynı binding'e erişiliyor. (3) Yeniden atama ile array mutasyonu farklıdır. (4) 3 ve `["Hello","World","Again"]`.
