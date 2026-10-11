# TypeScript Foundation — Birikimli Öğrenme Rotası

Bu müfredat **Increment sırası değil, kavramsal önkoşul sırasıdır**. İlk defa öğrenen öğrenci 01'den başlar; tekrar yapan kişi ilgili kavram ve önceki ders bağlantısını kullanır.

| Sıra | Bölüm | Kazanım |
| --- | --- | --- |
| 01 | [Execution, Runtime & Working Model](./01-execution-runtime/README.md) | TypeScript source → checking/build → JavaScript → Node → output |
| 02 | [Values, Variables & Basic Decisions](./02-values-variables-basic-decisions/README.md) | Primitive, expression, assignment, const/let, if/else |
| 03 | [Functions Fundamentals](./03-functions-fundamentals/README.md) | Parameter/argument, return, scope, input→output |
| 04 | [Control Flow & Iteration](./04-control-flow-iteration/README.md) | Conditions, loops, for...of, early return |
| 05 | [Objects, Arrays, References & Mutation](./05-objects-arrays-references/README.md) | Collection, reference identity, new array ≠ new objects |
| 06 | [TypeScript Modeling Fundamentals](./06-typescript-modeling/README.md) | Type, optional, null/undefined, union, narrowing, unknown |
| 07 | [Safe Runtime Boundaries](./07-safe-runtime-boundaries/README.md) | Runtime checks, controlled result, exception |
| 08 | [Value & Decision Mechanics](./08-value-and-decision-mechanics/README.md) | Equality, truthiness, operators, ??, ternary, switch |
| 09 | [Modern Object & Array Syntax](./09-modern-object-array-syntax/README.md) | Destructuring, spread/rest, optional chaining, template literals |
| 10 | [JSON Boundary](./10-json-boundary/README.md) | JSON.stringify/parse ve validation sınırı |

### Gelecek rota (henüz ders değil)
11 — Functions as Values & Callbacks · 12 — Closures & Captured State · 13 — Collections & Data Transformation · 14 — Async Foundations. Bu başlıklar ilgili gelecek çalışmalarda hazırlanacaktır.

## Nasıl çalışılır?
Önce önceki bölümün ana ayrımını açıklayın. Örnekte çalıştırmadan önce sonucu tahmin edin; sonra gözlenen sonuçla karşılaştırın. Bir davranışı değiştirdiğinizde ilgili test ile doğrulayın. **Doküman okumak, yazmak veya AI ile belge düzenlemek bağımsız H0 yeterlilik kanıtı değildir.** Teknik uygulama ve yardım düzeyleri ayrı tarihsel kanıtlarda tutulur.

## Tek ana öğretim evi
- Runtime/compile/output → 01; basit karar/variable → 02; function/scope → 03; loop/early return → 04.
- Reference/mutation → 05. Spread'in shallow davranışı için [09](./09-modern-object-array-syntax/README.md)'a gidin.
- Optional/null/undefined/unknown/narrowing → 06; runtime validation ve Result/throw → 07.
- Truthiness/?? ayrıntısı → 08. JSON syntax/serialization/parsing → 10; doğrulanmamış değerin güvenli modele dönüşümü için [07](./07-safe-runtime-boundaries/README.md).

## Kanıt / tarihçe
Eski `docs/I1-*`, `docs/I2-*`, `docs/I3-*` dosyaları tarihsel çalışma ve doğrulama notları için korunur. [I4R crosswalk](../../I4R-curriculum-crosswalk.md) kaynakları bu müfredata eşler. Eğitimde verilen çözümler uygulama yeterliliği yerine geçmez.
