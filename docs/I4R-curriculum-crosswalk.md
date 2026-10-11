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

## I4R uygulama ilerlemesi — 11 Ekim 2026

- Yeni müfredat root'u ve 01–07 öğretim chapter README'leri oluşturuldu.
- Mevcut I4'ün 7 + 6 + 4 = 17 dersinin tamamı 08–10 bölüm yollarında bulunuyor. **Ternary dersi** yeni dizinde özlü bir yeniden yazımdır; önceki uzun sürüm `docs/learning/javascript/01-value-and-decision-mechanics/06-ternary.md` içinde korunuyor.
- Eski `docs/I1-*`, `docs/I2-*`, `docs/I3-*` silinmedi; tarihsel not ve evidence olarak kaldı. Eski `docs/learning/javascript/` da kayıp riskine karşı tutuldu.
- Öğrenme dizininin 11 ana README dosyasında 74 relative link kontrol edildi; bilinen hedeflere göre kırık bağlantı bulunmadı.
- Yeni 17 I4 dersinde 87 relative link ve code-fence etiketleri kontrol edildi; taşınan yeni path'lerde kırık bağlantı bulunmadı. Ternary dersindeki eski sürüm bağlantısı kasıtlıdır.
- TypeScript code block'larının tamamı otomatik type-check edilmedi. `npm run typecheck` ve `npm test` bağlı GitHub arayüzünden çalıştırılamadığı için sonuçları **doğrulanmadı**. Bu eksik koşullar nedeniyle I4R Closure Report henüz kapalı sayılamaz.
- I4 uygulama/debugging/H0 transfer durumu değişmedi.

## I4R backfill tamamlanma denetimi — 11 Ekim 2026

Önceki "yalnız README" aşamasının ardından I1–I3 öğretim içeriği gerçekten **27 ayrıntılı ders** hâlinde oluşturuldu. Hedef kök: `docs/learning/typescript-foundation/`.

| Chapter | Ayrıntılı ders sayısı | Eski kaynak ilişkisi |
| --- | ---: | --- |
| 01 — Execution / Runtime | 3 | I1 source → typecheck → build → runtime → output; Node/npm |
| 02 — Values / Decisions | 4 | I1/I2 değer, değişken, assignment, if/else, expected result ve boundary |
| 03 — Functions | 3 | I1/I2 function, parameter, argument, return, local/block scope |
| 04 — Control Flow | 3 | I2 for...of, birden fazla koşul, loop içindeki return bug |
| 05 — Objects / References | 5 | I2 array/object, shared identity, mutation, independent copy, Vitest equality |
| 06 — TypeScript Modeling | 4 | I2/I3 object shape, optional/null/undefined, union/narrowing, unknown |
| 07 — Safe Runtime Boundaries | 5 | I3 runtime validation, Result, throw/return, export/import type |
| 08 — Decision Mechanics | 7 | Mevcut I4 Bölüm 1 |
| 09 — Modern Syntax | 6 | Mevcut I4 Bölüm 2 |
| 10 — JSON | 4 | Mevcut I4 Bölüm 3 |

**Toplam:** 44 ayrı ders (27 temel backfill + 17 I4), on chapter README'si ve bir ana öğrenme dizini. I4 ternary yeni konumunda yeniden genişletildi; özgün eski sürüm de korunuyor. Bunun dışında I4 eski 16 dersinin gövdesi yeni yerde korunmuştur; cross-linkler yeni chapter numaralarına güncellenmiştir.

**History/evidence kararı:** `docs/I1-execution-model.md`, `docs/I2-control-flow-functions-data-modeling.md`, `docs/I3-safe-types-runtime-boundaries.md` ve `docs/learning/javascript/` bu çalışma sırasında silinmedi. İlk üç dosya hem özgün öğretim örnekleri hem tarihsel uygulama/evidence notlarını saklar. Eski dizin en azından özgün ders gövdelerinin karşılaştırma kopyasıdır. Git history eğitim içeriğini silmek için kullanılmadı.

**Bağlantı ve biçim denetimi:** Yeni 01–03 bölümlerinde 12 dosya/68 göreli link; 04–06 bölümlerinde 14 dosya/83 göreli link; root ve 07 bölümü için 6 dosya/43 göreli link; yeni/yeniden düzenlenen 10 dosya/75 göreli link kontrol edildi. İlk denetimlerde 08–10 için 17 ders/87 göreli link ayrıca kontrol edildi. Taranan dosyalarda bilinen hedefler bakımından kırık relative link ve eşleşmeyen code fence görülmedi. Farklı geçişlerde birden fazla kez sayılan linkler bulunmaktadır; sayılar benzersiz link toplamı değildir.

**TypeScript örnek kontrolü:** Foundation derslerini temsil eden altı örnek grubu yerel TypeScript 5.8.3 ile `tsc --strict --noEmit --target ES2022 --module commonjs` komutunda typecheck'ten geçti. Bu *temsili örnek kontrolüdür*, tüm Markdown snippet'larının tamamı veya gerçek reponun typecheck'i değildir.

**Repository regression:** `npm run typecheck` ve `npm test` gerçek repository checkout'u üzerinde çalıştırılamadı; sonuçları **doğrulanmadı**. GitHub connector'u kaynakları okumaya/yazmaya izin veriyor, fakat çalışma komutu yürütme kabiliyeti vermiyor. I4R DoD'nin bu iki maddesi açık kalır; kapanışta başarılı sayılmamalıdır.

**Competency:** I4R dokümantasyonudur, TypeScript bağımsız uygulama/debugging/H0 değerlendirmesi değildir. I5 açılmadı; framework/dependency/src/tests değişmedi.
