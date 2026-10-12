# 11 — Functions as Values & Callbacks

Bu bölüm fonksiyonları yalnız çalışan kod blokları değil, **değer olarak saklanabilen, parametreye verilebilen ve başka fonksiyon içinde çağrılabilen** JavaScript değerleri olarak ele alır.

## Dersler

1. **Function Forms** — `01-function-forms.md`  
   Declaration, function expression ve arrow function; tanım ile çağrı ayrımı.
2. **Functions as Values** — `02-functions-as-values.md`  
   Fonksiyon referansı, invocation, değişkene fonksiyon atama ve return sonucunu saklama.
3. **Function Types & Contracts** — `03-function-types-and-contracts.md`  
   Callback parametre/dönüş tipleri, uyumlu/uyumsuz fonksiyonlar, contextual typing.
4. **Callbacks & Synchronous Flow** — `04-callbacks-and-synchronous-flow.md`  
   Named/inline callback, argument→parameter eşleşmesi, çağrı zamanı ve execution order.
5. **Higher-Order Functions, `void` & Debugging** — `05-higher-order-functions-void-and-debugging.md`  
   Callback alan HOF, callback sonucunun kullanımı, side effect, `void` ve bütünleşik kod incelemesi.

Dersler kavram → açıklamalı kod → execution flow → kritik ayrım → hata araştırma → mülakat → pekiştirme düzenindedir. Örnek kodu okumak ile gerçek `src/` ve `tests/` uygulaması yapmak ayrı aşamalardır.

**Kapsam dışı:** closure / captured state (I5B), array callback methods (I6), async callback ve Promise (I7), `this` / OOP (sonraki Epic). Bu bölümün hazırlanması tek başına I5A teknik Definition of Done veya H0 bağımsızlık kanıtı değildir.
