# I4R — Curriculum Crosswalk (inventory-first)

Başlangıç: `main@e029ec6ce0a1eff8749ceada03b23d97a5905515`.

Bu dosya **envanter ve taşıma kararıdır**, yeni müfredatın tamamlandığı iddiası değildir. Mevcut eski dosyalar bu aşamada silinmemiştir. Kalıcı hedef kök: `docs/learning/typescript-foundation/`.

| Mevcut kaynak | Öğretilen kavram | Kalıcı müfredattaki yeri | Durum |
| --- | --- | --- | --- |
| I1-execution-model.md §1–7, §10 | Source/typecheck/build/runtime/output, npm/node/npx | 01-execution-runtime | genişletilmeli |
| I1-execution-model.md §8; I2 §1–2 | Function, parameters/arguments, return, local/block scope | 03-functions-fundamentals | tekrar ediyor |
| I1-execution-model.md §9; I2 §13–16 | Boundary/test expectations, `toEqual`/`toBe`, mutation assertions | 05-objects-arrays-references | genişletilmeli |
| I2 §5–6, §17 | `for...of`, conditions, early-return bug | 04-control-flow-iteration | genişletilmeli |
| I2 §3, §7–12, §14 | Arrays/objects, shared reference, mutation/side effects, copying | 05-objects-arrays-references | genişletilmeli |
| I2 §4; I3 §1–7 | Object `type`, optional/null/undefined, union, narrowing, unknown | 06-typescript-modeling | tekrar ediyor |
| I3 §8–13, §15–16 | Object runtime checks, expected error, return vs throw, result model | 07-safe-runtime-boundaries | genişletilmeli |
| I3 §14 | Modules/import type/export conceptual introduction | 07-safe-runtime-boundaries (module boundary sidebar) | doğrudan taşınabilir |
| I2 §18–20, I1/I2 verification notes | Observed Product transfer and historical verification | docs/I2-control-flow-functions-data-modeling.md (history kept) | yalnız tarihsel/evidence içeriği |
| I4 01-value-and-decision-mechanics/ 7 lessons | Equality, truthiness, logical, short-circuit, ??, ternary, switch | 08-value-and-decision-mechanics | doğrudan taşınabilir |
| I4 02-modern-object-array-syntax/ 6 lessons | Destructuring, spread/rest, optional chaining, templates | 09-modern-object-array-syntax | doğrudan taşınabilir |
| I4 03-json-boundary/ 4 lessons | JSON, stringify, parse, validation | 10-json-boundary | doğrudan taşınabilir |
| I4 chapter README sections on competency/evidence | H0/H1 status and I4 implementation debt | Historical I4 records; not learning content | yalnız tarihsel/evidence içeriği |
| I1 §8 + I2 §1 + missing primitive/variable bridge | Values/const/let/assignment/expression/basic if | 02-values-variables-basic-decisions | yeni ders olarak ayrılmalı |

## Kesin koruma kararları

- `docs/I1-execution-model.md`, `docs/I2-control-flow-functions-data-modeling.md` ve `docs/I3-safe-types-runtime-boundaries.md` eğitim içeriği ve tarihsel notlar ayrıştırılmadan silinmeyecek.
- Mevcut 17 I4 dersi bire bir korunarak 08/09/10 sırasına taşınacak; mevcut 7+6+4 sıra ve cross-linkler değişim sırasında kontrol edilecek.
- I2 reference/mutation → I4 spread; I3 optional/unknown → I4 nullish/optional chaining; I3 validation → I4 JSON boundary karşılıklı link kuracak.
- `undefined`, `null`, reference ve validation için birer ana öğretim evi olacak; diğer dersler kısa hatırlatma ve linkle yetinecek.
- I4R dokümantasyon çıktısı H0 veya I4 implementation/debugging/transfer kanıtı oluşturmaz.
- Repo `src/`, `tests/`, gerçek test sonuçları ve tüm Markdown bağlantıları geçiş tamamlandığında ayrıca doğrulanacak.
