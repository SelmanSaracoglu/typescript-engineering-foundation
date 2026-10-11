# 01 — Execution, Runtime & TypeScript Working Model

**Başlangıç:** Önkoşul yok. **Sonraki:** [02 — Values & Variables](../02-values-variables-basic-decisions/README.md).

## Neden?
TypeScript kodundaki type hatası, çalışan JavaScript'teki exception ve yanlış iş sonucu farklı problemdir. Bunları ayırabilmek debugging'in ilk adımıdır.

## Çalışma zinciri
```text
.ts source → TypeScript type checking → emitted .js → Node.js runtime → observable output
```
Bu zincir bir **kavramsal modeldir**: `tsc --noEmit` yalnız type-check yapabilir, build JavaScript üretebilir, sonrasında Node üretilmiş dosyayı çalıştırabilir.

```ts
const price: number = 100;
console.log(price + 20); // 120
```
Type annotation `number` JavaScript output'ta kalmaz; runtime'da `price` gerçekten 100 değerini tutar. `console.log` tüm runtime değildir, yalnız gözlenebilir bir etkidir.

## Üç farklı hata
```ts
const count: number = "3"; // type-check hatası
JSON.parse("{broken}");    // çalışırken SyntaxError
function double(n: number) { return n + 2; } // 4 için 6: logic bug, beklenen 8
```
İkinci satırın TypeScript bakımından kabul edilmesi JSON metnini doğru yapmaz. Üçüncü satır çalışabilir ama gereksinimi karşılamaz.

## Repository araçları
| Komut | Soru |
| --- | --- |
| `npm run typecheck` | TypeScript kontrolleri geçiyor mu? |
| `npm run build` | JavaScript üretilebiliyor mu? |
| `npm run start` | Node ile program ne yapıyor? |
| `npm test` | Tanımlanmış test beklentileri sağlanıyor mu? |

Node runtime'dır, npm paket ve script yönetir, npx paket CLI'ını çalıştırabilir. `npm run typecheck` bu repoda `tsc --noEmit` çalıştırır. Build ile test aynı garanti değildir.

## Debugging örneği
Bir test yanlış sayısal sonuç veriyorsa önce derleme hatası aramayın: input'u ve gerçekleşen return değerini bulun, hesaplama expression'ını kontrol edin, sonra beklenen davranışla karşılaştırın.

**Mülakat:** *What is the difference between TypeScript checking and JavaScript runtime validation?* Type checking kod yazılırken türleri kontrol eder; runtime validation gerçek veriyi çalışma anında sınar. [06](../06-typescript-modeling/README.md) ve [07](../07-safe-runtime-boundaries/README.md)'de ayrıntısı var.

**Kendi kendine:** `npm run build` geçerse uygulamanın doğru olduğunu neden söyleyemeyiz? `console.log` ile runtime farkı nedir?

Kaynak: [I1 execution model](../../I1-execution-model.md). Bu dosya öğrenme materyalidir, yeterlilik kaydı değildir.
