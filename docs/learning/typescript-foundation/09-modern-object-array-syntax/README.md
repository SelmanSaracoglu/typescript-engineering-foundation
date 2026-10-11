# 09 — Modern Object & Array Syntax

## 1. Bu bölüm hangi sorunu çözüyor?

Bir TypeScript uygulaması kullanıcı, test sonucu, konfigürasyon veya log gibi verilerle çalışır. Sık karşılaşacağın gereksinimler:

- Bir object'ten yalnız `id` ve `status` alanlarını almak.
- Array'deki ilk elemanı diğerlerinden ayırmak.
- Bir konfigürasyona yeni ayar uygularken orijinal nested object'i değiştirmemek.
- Fonksiyonun bilinmeyen sayıdaki argümanını toplamak.
- Kullanıcı profili yoksa `TypeError` fırlatmadan alternatif metin üretmek.
- Sonucu okunabilir string biçiminde göstermek.

Bunları rastgele daha kısa kod üretmek için değil, **hangi mekanizma hangi görevi görüyor** sorusuyla öğreniyoruz.

## 2. Derslerin doğru pedagojik sırası

| Ders | Konu | Öğrencinin açıklayacağı davranış | Önkoşul |
|---|---|---|---|
| 8 | Object Destructuring | Property adına göre alan seçimi, alias, `undefined` default, nested referans | Object, property, reference |
| 9 | Array Destructuring | Sıraya göre eşleştirme, skip, default ve tuple | Array/index, Ders 8 |
| 10 | Spread Syntax | Array/object yayma, son-yazılan-property, shallow copy | Ders 8–9, mutation |
| 11 | Rest Syntax | Kalanları toplama, rest parameter, spread karşılaştırması | Destructuring, spread, function |
| 12 | Optional Chaining | Nullish erişimde short-circuit, `?.[ ]`, `?.()`, `??` | Bölüm 1 `??`, optional |
| 13 | Template Literals | Backtick, interpolation, expression, string dönüşümü, multiline | Expression, ternary, `??` |

**Çalışma yöntemi:** Önce ilgili dersin kavram ve mekanizmasını oku; kodun çıktısını bakmadan tahmin et; karşılaştırma ve debugging kısmında neden farklı sonuç oluştuğunu açıkla; mülakat cevabını kendi cümlenle anlatmayı dene.

## 3. Büyük resim — Aynı görünen sözdizimleri farklı görevler

### Destructuring ile spread/rest

```ts
const source = { id: 1, role: "viewer", active: true };

const { id, ...rest } = source;     // Destructuring + Rest
const merged = { ...rest, id };    // Spread

console.log(id);      // 1
console.log(rest);    // { role: "viewer", active: true }
console.log(merged);  // { role: "viewer", active: true, id: 1 }
```

- `const { id } = source` → property adından **değişken üretir**.
- `const { id, ...rest } = source` → kullanılmayan alanları yeni object'te **toplar**.
- `{ ...rest, id }` → alanları yeni object literal'ine **yayar**.
- Hiçbiri başka bir object'in nested alanlarını otomatik olarak **deep-clone** etmez.

### Array'de sıralama

```ts
const tags = ["smoke", "regression", "critical"];
const [first, ...remaining] = tags;
const reordered = [...remaining, first];
console.log(reordered); // ["regression", "critical", "smoke"]
```

Array destructuring **pozisyon**, object destructuring **property adı** kullanır. Array Rest kalan elemanları alır, Spread yeni array içine açar.

## 4. Üç farklı eksiklik/varsayılan mekanizması

| Sözdizimi | Hangi durumda devreye girer? | `0` korunur mu? | `null` korunur mu? |
|---|---|---|---|
| `const { x = 3 } = obj` | `x === undefined` | Evet | Evet |
| `x ?? 3` | `x === null` veya `undefined` | Evet | Hayır (3 seçilir) |
| `x || 3` | Bütün falsy değerler | **Hayır** | Hayır |

Optional chaining farklı bir görev yapar: `obj?.x`, `obj` nullish olduğunda erişimi durdurup `undefined` döndürür. Varsayılan seçmek için gerekirse ardından `??` kullanırsın.

```ts
type Settings = { retries?: number };
function getRetries(settings: Settings | null): number {
  return settings?.retries ?? 3;
}
console.log(getRetries({ retries: 0 })); // 0
console.log(getRetries(null));           // 3
```

## 5. Referans, identity ve mutation: İki soruyu ayrı sor

`{...obj}`, `[...arr]` ve rest yapıları **yeni dış yapılar** oluşturabilir. Ama nested elemanlar için ayrıca sorman gerekir:

1. "Dış object/array aynı mı?" — genellikle hayır.
2. "İçteki object aynı mı?" — yeni kopya üretmediysek evet olabilir.

```ts
const source = { settings: { theme: "dark" } };
const copy = { ...source };
console.log(copy === source); // false
console.log(copy.settings === source.settings); // true
```

Nested mutation için tehlike burada başlar. Öngörülemeyen yan etki gördüğünde referans identity'sini kontrol et, gerekiyorsa değişecek seviyelerde yeni object üret.

## 6. Bütünleşik TypeScript örneği — Test kaydını özetlemek

Aşağıdaki örnek altı dersin çoğunu bir araya getirir. Amaç karmaşık kod üretmek değil, **mekanizmaların görevini ayrıştırmak**.

```ts
type TestRecord = {
  id: string;
  passed: boolean;
  tags: string[];
  metadata?: {
    retries?: number;
    owner?: { team?: string };
  };
};

function summarizeTest(record: TestRecord): string {
  // Ders 8: Object destructuring
  const { id, passed, tags, metadata } = record;

  // Ders 9 + 11: Array destructuring + Rest
  const [firstTag, ...otherTags] = tags;

  // Ders 10: Spread (yeni dış array)
  const displayTags = [firstTag ?? "untagged", ...otherTags];

  // Ders 12 + Bölüm 1: Optional chaining ve nullish default
  const retries = metadata?.retries ?? 0;
  const team = metadata?.owner?.team ?? "Unassigned";

  // Bölüm 1: Ternary
  const status = passed ? "PASS" : "FAIL";

  // Ders 13: Template literals
  return `${status} | ${id} | ${displayTags.join(", ")} | retries=${retries} | team=${team}`;
}

const sample: TestRecord = {
  id: "login",
  passed: false,
  tags: ["smoke", "auth"],
  metadata: { retries: 0 }
};

console.log(summarizeTest(sample));
// FAIL | login | smoke, auth | retries=0 | team=Unassigned
console.log(sample.tags); // ["smoke", "auth"] — değişmedi
```

Bu örnekten nasıl akıl yürütürsün?

1. **Input contract:** `TestRecord` alanları ve opsiyonel nested metadata tanımlıdır.
2. **Object okuma:** Alanlar ayrı değişkenlere bağlanır.
3. **Array okuma:** `firstTag` ilk elemanı, `otherTags` kalanları alır.
4. **Yeni array:** `displayTags` yeni array'dir; orijinal `tags` mutation görmez.
5. **Nullish veri:** `retries=0` korunur, eksik `owner` için `Unassigned` seçilir.
6. **Karar:** `passed=false` → FAIL.
7. **Çıktı:** Template literal string üretir.

**Sınır uyarısı:** `tags=[]` olduğunda `firstTag` undefined olur ve `displayTags` `["untagged"]` üretir. Bu davranış tasarım kararımızdır; başka bir gereksinimde `"no tags"` daha uygun olabilir. İş kuralını otomatik varsayma.

## 7. Test ve hata araştırma çalışması

| Test | Input değişikliği | Beklenen davranış | Yakalanabilecek bug |
|---|---|---|---|
| Normal | `tags: ["smoke","auth"]` | İki tag görüntülenir | Array sıra hatası |
| Boş array | `tags: []` | `untagged` görünür | Eksik index, default eksikliği |
| Eksik metadata | `metadata` yok | `retries=0`, `Unassigned` | Korunmasız nested erişim |
| Geçerli sıfır | `retries: 0` | `0` korunur | `||` ile yanlış fallback |
| Nested owner | `owner: {team:"QA"}` | `team=QA` | Yanlış optional chain |
| Mutation kontrolü | Fonksiyon sonrası `sample.tags` | Değişmez | Beklenmeyen in-place dönüşüm |

**Debugging akışı:** Hatalı output'u yeniden üret → ara değişkenleri gözle → hangi operatörün farklı sonuç verdiğine hipotez kur → tek değişiklikle sınır durumunu dene → kök nedeni açıkla → testle yeniden doğrula.

## 8. Mülakat için kısa bütünsel açıklama

**Question: How do destructuring, spread, rest, optional chaining and template literals differ?**

> Destructuring extracts values from arrays or objects. Rest collects remaining values, whereas spread expands them into new arrays, objects or function calls. Optional chaining avoids property-access errors for nullish values, and template literals build readable strings using expressions. Spread and rest do not automatically deep-clone nested objects, and none of these features replaces runtime validation.

**Türkçe karşılığı:** Destructuring alanları/elemanları okur. Rest kalanları toplar, Spread değerleri açar/yayar. Optional chaining nullish erişimde hatayı önlemeye yardımcı olur. Template literals expression sonuçlarından okunabilir string kurar. Bu mekanizmalar nested object'leri otomatik derin kopyalamaz veya dış veriyi doğrulamaz.

## 9. Bölüm sonu bağımsız pekiştirme

1. Object destructuring ile array destructuring arasındaki eşleştirme farkını bir örnekle açıkla.
2. `const { x = 10 } = { x: null }` sonucunu ve `const x = null ?? 10` sonucunu karşılaştır.
3. `{ ...user }` neden her zaman bağımsız nested data üretmez?
4. Rest ile spread aynı `...` işaretini kullanırken anlamı nasıl ayırırsın?
5. `record.metadata?.retries || 3` neden yanlış olabilir? Düzelt.
6. `"Hello ${name}"` ve `` `Hello ${name}` `` davranışları neden farklıdır?
7. `summarizeTest` örneğinden en az bir happy-path, bir sınır ve bir yanlış veri testi tasarla. Hangi kontrol hangi gereksinimi doğrular?
8. `metadata` alanını `null` kabul edecek olsaydık hangi TypeScript tiplerini ve hangi erişimleri gözden geçirmeliyiz?

## 10. Sözlük ve sonraki adım

- **Destructuring:** Object/array değerlerinden değişken bağlama.
- **Alias:** Property'yi farklı bir yerel isimle kullanma.
- **Spread:** Değerleri başka bağlama açıp/yayma.
- **Rest:** Kalan öğeleri toplama.
- **Shallow copy:** Dış yapı yeni, nested referanslar paylaşılabilir.
- **Reference identity:** İki değişkenin aynı object'e işaret edip etmediği.
- **Optional chaining:** Nullish erişimde `undefined` sonucuyla kısa devre.
- **Nullish fallback:** `??` ile `null`/`undefined` için alternatif.
- **Interpolation:** `${...}` içindeki expression sonucunu string'e yerleştirme.

**Sıradaki teori:** Bölüm 3 — JSON Boundary. **Gerçek uygulama:** Aktif I4 iş akışında TypeScript implementation, Vitest, debugging ve bağımsız transfer ayrıca doğrulanmalıdır. Belgeleri okumak H0–H4 yeterlilik kararı değildir.
