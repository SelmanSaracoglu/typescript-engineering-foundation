# Ders 1 — Lexical Scope & Closure

## 1. Neden öğreniyoruz?

Bir fonksiyonun içindeki isimlerin hangi değişkenleri gösterdiğini doğru anlamak, beklenmeyen sonuçları ve yanlış state paylaşımını açıklayabilmenin temelidir. **Scope** “bir isme nereden erişilebilir?”, **closure** ise “bir fonksiyon tanımlandığı lexical çevreyle bağını neden sürdürebilir?” sorusunu ele alır.

## 2. Lexical scope: Kodun yazıldığı konum

```ts
const taxRate = 0.2;

function calculateTax(price: number): number {
  return price * taxRate;
}

console.log(calculateTax(100)); // 20
```

- `price`, `calculateTax` parametresidir; fonksiyonun yerel scope'unda bulunur.
- `taxRate` fonksiyonun dışında tanımlıdır. Fonksiyon onu erişilebilir dış lexical scope'ta bulur.
- JavaScript önce ilgili yerel scope'a, sonra dış lexical çevrelere bakar. Bu **lexical lookup** işlemidir.
- Bu ilişki, fonksiyonu *kimin çağırdığına* değil, *nerede tanımlandığına* dayanır. Lexical scope ile runtime call stack aynı kavram değildir.

### Aynı isim: shadowing

```ts
const message = "Global";

function outer(): string {
  const message = "Outer";

  function inner(): string {
    return message;
  }

  return inner();
}

console.log(outer()); // "Outer"
```

`inner` içindeki `message`, en yakın erişilebilir tanım olan `outer` içindeki değişkendir. Dışarıdaki `"Global"` değeri bu kullanımda gölgelenir (*shadowing*).

## 3. Closure farkı: Dış çağrı sona erdiğinde

İç içe fonksiyon bulunması tek başına anlatmak istediğimiz davranışın tamamı değildir. Asıl kritik örnekte fonksiyon **döndürülür**, daha sonra çağrılır:

```ts
function outer() {
  const message = "Merhaba";

  function inner(): string {
    return message;
  }

  return inner; // inner() DEĞİL: fonksiyonun kendisi
}

const sayHello = outer();
console.log(sayHello()); // "Merhaba"
console.log(sayHello()); // "Merhaba"
```

Yürütme sırası:

1. `outer()` çalışır; `message` oluşturulur.
2. `inner` tanımlanır; kodu henüz çalıştırılmaz.
3. `return inner;` ile fonksiyon değeri döner.
4. `outer()` çağrısı sona erer.
5. `sayHello()`, döndürülen `inner` fonksiyonunu çağırır.
6. `inner`, tanımlandığı lexical çevredeki `message` değişkenini okumaya devam eder.

**Closure**, fonksiyonun oluşturulduğu lexical çevreyle olan bu ilişkisini korumasıdır. `outer` yeniden çalıştırılmaz.

## 4. Yanlış anlamaları ayıralım

| İfade | Doğru yorum |
| --- | --- |
| `function inner() { ... }` | Fonksiyon tanımı; buradaki `()` parametre listesidir. |
| `inner()` | Fonksiyon çağrısıdır. |
| `return inner;` | Fonksiyon değeri döner; çağrı yoktur. |
| `return inner();` | Fonksiyon hemen çağrılır; sonucu döner. |
| “Closure sadece iç içe function yazmaktır.” | Eksik: lexical çevre ile süren bağlantı önemlidir. |
| “Dış fonksiyon her seferinde yeniden çalışır.” | Hayır; `sayHello()` yalnız döndürülmüş `inner`'ı çağırır. |

## 5. Gerçekçi kullanım ve debugging

Bir davranışın dışarıdaki ayar bilgisini hatırlaması yararlıdır. Örneğin daha sonra çağrılacak bir selamlama fonksiyonu, hangi isim için oluşturulduğunu koruyabilir. Bu, global değişken kullanmadan davranışın kendi bağlamıyla tutulmasını sağlar.

Yanlış çıktı gördüğünde şu sırayı izle: (1) hangi `message`? (2) nerede tanımlandı? (3) `inner` nerede oluşturuldu? (4) fonksiyon referansı mı, çağrısı mı döndü? (5) `outer` kaç kez çağrıldı?

## 6. Mülakat hazırlığı

**Question: What is the difference between lexical scope and a closure?**

> Lexical scope determines where variable names can be accessed based on where code is defined. A closure lets a function keep access to variables from that lexical environment, even after the outer function call has finished.

**Türkçe:** Lexical scope, isimlerin kodun tanımlandığı yere göre nereden erişilebileceğini belirler. Closure, fonksiyonun dış çağrı tamamlandıktan sonra da o çevredeki değişkenlere erişmesini sağlar.

## 7. Pekiştirme

1. `calculateTax` içindeki `taxRate` nereden bulunur?
2. `outer` ve global scope aynı isimli `message` içeriyorsa `inner` hangisini okur?
3. `return inner;` ile `return inner();` arasındaki fark nedir?
4. `sayHello()` ikinci kez çağrılınca `outer` yeniden çalışır mı? Neden?
5. Kendi cümlenle closure'ı “iç içe function” tanımından ayır.

**Kısa kontrol:** (1) Erişilebilir dış scope. (2) En yakın tanım: `outer`. (3) Fonksiyon değeri / çağrı sonucu. (4) Hayır; döndürülen fonksiyon çalışır.
