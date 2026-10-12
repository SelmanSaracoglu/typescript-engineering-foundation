# Ders 4 — Independent Instances, Shared State & Common Bugs

## 1. Neden öğreniyoruz?

İki fonksiyonun **aynı kodu kullanması**, aynı state'i paylaştıkları anlamına gelmez. Ancak iki farklı değişkenin **aynı fonksiyon referansını** tutması veya fonksiyonların **ortak dış değişkene** erişmesi state paylaşımı yaratabilir. SDET ve debugging için hangi durumun yaşandığını ayırt etmek önemlidir.

## 2. İki factory çağrısı: Bağımsız state

```ts
function createCounter() {
  let count = 0;

  function next(): number {
    count++;
    return count;
  }

  return next;
}

const first = createCounter();
const second = createCounter();

console.log(first());  // 1
console.log(first());  // 2
console.log(second()); // 1
```

Her `createCounter()` çağrısı yeni bir `count` oluşturur. Bu nedenle `second()`, `first` içindeki `2` değerini görmez.

| Çağrı | first count | second count |
| --- | ---: | ---: |
| Başlangıç | 0 | 0 |
| `first()` | 1 | 0 |
| `first()` | 2 | 0 |
| `second()` | 2 | 1 |

## 3. İki değişken, tek fonksiyon: Ortak state

```ts
const first = createCounter();
const second = first;

console.log(first());  // 1
console.log(second()); // 2
console.log(first());  // 3
```

Burada yalnız **bir** `createCounter()` çağrısı vardır. `second = first` yeni sayaç üretmez; mevcut fonksiyon referansını paylaşır. Dolayısıyla iki isim, **aynı captured `count`** değişkenini kullanır.

## 4. Bug: State yanlış scope'ta

İstenen davranış: Audit ve Debug recorder'larının her biri kendi mesaj sayısını tutsun.

**Hatalı kod:**

```ts
const messages: string[] = [];

function createRecorder() {
  function record(message: string): number {
    messages.push(message);
    return messages.length;
  }

  return record;
}

const auditRecorder = createRecorder();
const debugRecorder = createRecorder();

console.log(auditRecorder("Login")); // 1
console.log(debugRecorder("Error")); // 2 (beklenti 1)
```

Gözlem: İki ayrı factory çağrısı olmasına rağmen `messages` **global/dış scope**'ta yalnız bir kez oluşturulmuştur. Her `record` o aynı array'i değiştirir.

**Düzeltme — Değişkeni factory içine al:**

```ts
function createRecorder() {
  const messages: string[] = [];

  function record(message: string): number {
    messages.push(message);
    return messages.length;
  }

  return record;
}

const auditRecorder = createRecorder();
const debugRecorder = createRecorder();

console.log(auditRecorder("Login")); // 1
console.log(debugRecorder("Error")); // 1
```

Artık her çağrı kendi array'ini oluşturur. Düzeltmenin gerekçesi “fonksiyonlar farklı” olması değil, **state'in oluşturulduğu scope'un değişmesi**dir.

## 5. Sistematik debugging akışı

| Adım | Somut soru |
| --- | --- |
| Beklenti | Recorder'lar bağımsız mı, ortak mı olmalı? |
| Reproduce | Hangi iki çağrıda expected 1/1, actual 1/2 oluyor? |
| Observe | `messages` tam olarak nerede tanımlanmış? |
| Hypothesis | İki closure aynı array'i kullanıyor olabilir mi? |
| Experiment | Değişkeni factory içine taşı; çıktıyı yeniden tahmin et ve çalıştır. |
| Root cause | Shared outer binding yüzünden istemsiz mutation. |
| Verify | İki recorder'ın ilk ve ikinci çağrılarını ayrı ayrı izle. |

Bu, **teorik bug incelemesidir**; gerçek repoda debugger, test veya H0 uygulama kanıtı değildir.

## 6. Kullanım kararı: Hangi tasarım doğru?

Bağımsız test recorder'ları veya kullanıcı başına sayaçlar istiyorsak state'i factory çağrısında oluşturmak mantıklıdır. Tüm işlemlerin *ortak* sayacı gerekiyorsa paylaşılan state kasıtlı olabilir. Closure kendi başına doğru/yanlış değildir; gereksinime uygun state sahipliği önemlidir.

## 7. Mülakat hazırlığı

**Question: Why can two closures share state, and how do you avoid it?**

> Closures can share state if they reference the same outer binding, or if two variables hold the same returned function. To create independent state, place the mutable variable inside the factory so each call creates its own binding.

**Türkçe:** Closure'lar aynı dış değişkeni kullanıyorsa veya iki değişken aynı döndürülmüş fonksiyona işaret ediyorsa state paylaşılır. Bağımsızlık için değiştirilebilir state'i factory içine yerleştirerek her çağrıda yeni bir bağ oluşturabiliriz.

## 8. Pekiştirme ve aktarım

1. `const a = createCounter(); const b = createCounter();` ve `const b = a;` durumlarını karşılaştır.
2. İki factory çağrısının **mutlaka** bağımsız state oluşturduğunu söylemek neden doğru değil?
3. Global `messages` bug'ında beklenen/gerçek çıktıyı ve değiştirilecek satırı açıkla.
4. Yukarıdaki düzeltilmiş recorder için `auditRecorder("Logout")` ve `debugRecorder("Timeout")` çağrılarını ekle. Her birinin sonucu ne olur?
5. Yeni problem: Bir fonksiyon iki bağımsız işlem için kişiye özel puan sayacı döndürecek. Değişkeni nerede oluşturacağını gerekçelendir; hazır çözüm verilmeden önce state tablosunu çiz.

**Kısa kontrol:** (1) Ayrı factory invocation ayrı state üretebilir; alias aynı referansı paylaşır. (2) State factory dışında tutulmuş olabilir. (3) 1/2, `messages` factory içine taşınır. (4) 2/2.

**Sonraki sınır:** Collections ve async ayrı Incrementlerde; gerçek implementation, test, sistematik debugging ve bağımsız transfer bütünleşik uygulamada ölçülecek.
