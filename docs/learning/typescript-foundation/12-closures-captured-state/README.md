# 12 — Closures & Captured State

Bu bölüm, bir fonksiyonun tanımlandığı **lexical çevre** ile bağlantısını nasıl koruduğunu ve bu bağlantı üzerinden değişen state'in nasıl davranabildiğini öğretir. I5A'daki function reference ve invocation bilgisi başlangıç kabul edilir; yeni framework veya dependency kullanılmaz.

## Dersler

1. **Lexical Scope & Closure** — [01-lexical-scope-and-closure.md](01-lexical-scope-and-closure.md)  
   İsim arama, shadowing, outer/inner ilişkisi ve dış fonksiyon tamamlandıktan sonra erişim.
2. **Returned Functions & Factories** — [02-returned-functions-and-factories.md](02-returned-functions-and-factories.md)  
   Fonksiyon döndürme, factory çağrıları ve her çağrıda bağlanan farklı parametreler.
3. **Captured Mutable State** — [03-captured-mutable-state.md](03-captured-mutable-state.md)  
   Sayaç, değişkenin güncel değerini görme, `const` array mutation ve çağrılar arası state.
4. **Independent Instances & State Bugs** — [04-independent-instances-and-state-bugs.md](04-independent-instances-and-state-bugs.md)  
   Bağımsız factory invocation, aynı referansı paylaşma, yanlış scope'tan kaynaklanan bug ve debugging.

## Çalışma ilkesi

Önce kodu oku, sonucu çalıştırmadan tahmin et; ardından hangi değişkenin nerede oluşturulduğunu ve hangi çağrının onu değiştirdiğini tabloyla izle. `function inner() { ... }` tanımlama biçimidir; `inner()` ise çağrıdır. `return inner;` çağrı yapmaz, fonksiyon değerini döndürür.

## Kavramsal checkpoint

- Scope ile closure arasındaki farkı açıklamak.
- `outer()` tamamlandıktan sonra `inner` neden dış değişkene erişebiliyor, anlatmak.
- İki ayrı factory çağrısının ve aynı fonksiyon referansının farklı state sonuçlarını karşılaştırmak.
- Yanlışlıkla paylaşılan değişkeni tespit etmek ve doğru scope'a taşımak.
- Closure'ın *değerin sabit kopyasını* değil, erişilebilir dış değişken bağlantısını koruduğunu örnekle göstermek.

**Kanıt sınırı:** Bunlar kavramsal ders notlarıdır. Gerçek `src/` implementation, Vitest, sistematik repo debugging ve H0 bağımsız transferi kanıtlamaz. Collection methods ve async konuları sonraki Incrementlerin kapsamındadır.
