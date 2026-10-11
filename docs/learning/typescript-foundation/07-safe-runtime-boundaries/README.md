# 07 — Safe Runtime Boundaries

**Önkoşul:** [06](../06-typescript-modeling/README.md). **Sonraki:** [08](../08-value-and-decision-mechanics/README.md). JSON text/parsing ayrıntısı için [10](../10-json-boundary/README.md).

## Neden?
Compile-time type yalnız geliştirici beklentisidir. Kullanıcıdan, dosyadan veya JSON'dan gelen veri başka bir gerçek runtime shape'ine sahip olabilir.

## Güven sınırı
```text
unknown input → object/null kontrolü → property var mı? → property tipi doğru mu?
             → valid model / controlled error
```
JavaScript'te `typeof null === "object"` olduğundan `null` ayrıca reddedilmelidir; array de object olarak raporlanır.

```ts
type Product = { name: string; price: number };
type Result =
  | { ok: true; value: Product }
  | { ok: false; error: "INVALID_SHAPE" };

function validateProduct(input: unknown): Result {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "INVALID_SHAPE" };
  }
  if (!("name" in input) || typeof input.name !== "string") {
    return { ok: false, error: "INVALID_SHAPE" };
  }
  if (!("price" in input) || typeof input.price !== "number") {
    return { ok: false, error: "INVALID_SHAPE" };
  }
  return { ok: true, value: { name: input.name, price: input.price } };
}
console.log(validateProduct({ name: "Elma", price: 3 }).ok); // true
console.log(validateProduct({ name: 123, price: 3 }).ok);    // false
```
Property'nin varlığı, doğru runtime tipinde olduğunu göstermez. Bu örnekte yalnız **shape** kontrolü yapılır; negatif veya `NaN` fiyat gibi business validation ayrıca tanımlanmalıdır.

## Return vs throw
```ts
function safeDivide(a: number, b: number): number | null {
  if (b === 0) return null; // beklenen başarısızlık: normal return
  return a / b;
}
```
`return` çağırana sonuç gönderir ve fonksiyon normal tamamlanır. `throw new Error("...")` normal yürütmeyi keser ve uygun `catch` arar. Geçersiz input beklenen iş sonucuysa `Result` union kullanılabilir; gerçekten beklenmeyen çalışma hatası exception olabilir. **Bu bölüm senkron davranışla sınırlıdır**; async error handling henüz burada öğretilmez.

## Sorumluluk sınırı
`Product` type modeli ile `validateProduct` başka modüllerde tutulabilir; `import type { Product } from "./product";` compile-time type bağımlılığı içindir. Daha fazla dosya açmak başlı başına hedef değildir.

## JSON bağlantısı
`JSON.parse` metnin syntax'ını işler ama Product modelini doğrulamaz. [10 — JSON](../10-json-boundary/README.md) parse/stringify davranışını öğretir ve buradaki validation algoritmasına geri döner.

**Mülakat:** *When should a function return a failure result instead of throwing?* Beklenen, yönetilebilir başarısızlık normal result olabilir; exception olağan akışı kesen durumlar içindir.

**Pekiştirme:** `null`, `[]`, `{}`, eksik name, name=123 için hangi kontrol reddeder? Kaynak [I3](../../../I3-safe-types-runtime-boundaries.md).
