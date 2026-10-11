# Ders 16 — JSON Parsing: `JSON.parse()`, `SyntaxError` ve TypeScript Güven Sınırı

## 1. Parsing nedir? Serialization'dan farkı ne?

**Parsing (ayrıştırma)**, bir metni tanımlı dil kurallarına göre okuyarak programın kullanabileceği değerlere dönüştürmektir. `JSON.parse()` geçerli JSON metnini JavaScript değerine çevirir.

```ts
const jsonText = '{"id":101,"username":"Alex","active":true}';

console.log(typeof jsonText); // "string"

const parsed = JSON.parse(jsonText);
console.log(parsed.username); // "Alex"
console.log(typeof parsed);   // "object"
```

**İşlem zinciri:**

1. `jsonText` runtime'da bir JavaScript string'idir.
2. `JSON.parse(jsonText)` string karakterlerini JSON gramerine göre okur.
3. Geçerli JSON ise karşılık gelen JavaScript değerini üretir.
4. Geçersiz JSON ise `SyntaxError` fırlatır.

İki yönü birbirinden ayır:

| İşlem | Girdi | Çıktı | Soru |
|---|---|---|---|
| `JSON.stringify(value)` | JS değeri | JSON metni | Veriyi metne nasıl dönüştürürüm? |
| `JSON.parse(text)` | JSON metni | JS değeri | Bu JSON metni neyi temsil ediyor? |

> **Sık yanılgı:** `JSON.parse()` sonucunun object olması zorunlu değildir.

## 2. Parsing sonrasında hangi tipler gelebilir?

```ts
console.log(JSON.parse("42"));       // 42 (number)
console.log(JSON.parse("false"));    // false (boolean)
console.log(JSON.parse("null"));     // null
console.log(JSON.parse('"Hello"'));  // "Hello" (string)
console.log(JSON.parse("[10,20]"));  // [10, 20] (array)
```

Kök JSON değeri number ise `number`, array ise JavaScript array'i, object ise JavaScript object'i üretilir. `JSON.parse("null")` özel olarak `null` üretir; `typeof null` JavaScript'te tarihsel nedenle `"object"` döndürse de `null` gerçek bir object değildir.

### Tırnak katmanlarını çözmek

```ts
const text = '"Hello"';
const result = JSON.parse(text);
console.log(result);        // Hello
console.log(typeof result); // string
```

Dıştaki `'...'` JavaScript string yazımıdır; içteki `"Hello"` karakterleri JSON'un string değer gösterimidir. Burada sonuç yine string olur; JSON.parse her zaman object dönüştürmez.

## 3. Malformed JSON ve SyntaxError

Aşağıdaki JSON metni hatalıdır:

```ts
const text = '{"id":101,}';
JSON.parse(text); // SyntaxError
```

Neden? JSON'da son property'den sonra virgül bulunamaz. Parsing, geçersiz JSON'u kendiliğinden onarmaz.

| Metin | Parse edilir mi? | Gerekçe |
|---|---|---|
| `{"id":101}` | Evet | Geçerli JSON |
| `{id:101}` | Hayır | Key çift tırnaklı değil |
| `{'id':101}` | Hayır | JSON string'inde tek tırnak geçersiz |
| `{"id":101,}` | Hayır | Trailing comma |
| `{"id":undefined}` | Hayır | JSON değer türü değil |
| `{"id":"101"}` | Evet | JSON geçerli; `id` ise string |

### Hata nerede oluşur?

```ts
const text = '{"id":101,}';

console.log("Before parse");
const parsed = JSON.parse(text);
console.log("After parse", parsed);
```

İlk `console.log` çalışır. `JSON.parse()` `SyntaxError` fırlattığı için normal akış burada kesilir; ikinci log satırına erişilmez (üst seviyede hatayı yakalayan bir mekanizma bulunmadığını varsayıyoruz).

**Debugging notu:** `SyntaxError` mesajının tam metni, çalışma zamanı sürümüne göre değişebilir. Mesajı sabit bir cümle olarak ezberlemek yerine hatanın sınıfını ve problemli JSON metnini incele.

## 4. `try/catch` ile kontrollü hata yönetimi

```ts
const jsonText = '{"id":101,}';

try {
  const parsed = JSON.parse(jsonText);
  console.log("Success", parsed);
} catch (error) {
  console.log("Invalid JSON");
}
// Invalid JSON
```

**Yürütme adımları:**

1. `try` bloğunda parsing başlar.
2. Geçersiz JSON için exception oluşur.
3. `try` içindeki kalan ifadeler çalışmaz.
4. Kontrol `catch` bloğuna aktarılır.
5. Programın bu kısmındaki başarısızlık kontrollü biçimde ele alınır.

Ancak `catch`, **her türlü hatayı geçersiz JSON saymamalıdır**. JSON.parse işleminin normal sözdizimi hatasını ayırt etmek daha açıklayıcıdır:

```ts
function parseJsonText(jsonText: string): unknown {
  try {
    const parsed: unknown = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log("JSON syntax is invalid");
      return undefined;
    }
    throw error;
  }
}
```

Bu fonksiyon hatada `undefined` döndürür; öğretim açısından kısa olsa da daha büyük bir uygulamada **başarılı JSON `null` değeriyle / başarısız parse ile karışmayan açık bir result modeli** tercih etmek daha iyi olur. Ders 17'de bunu yapacağız.

> Burada `const parsed: unknown` ifadesi, JSON.parse sonucunu güvenilmeyen değer olarak ele aldığımızı açıklar; dönüşümü doğrulamaz.

## 5. TypeScript neden tek başına güvenlik sağlamıyor?

Şimdi en kritik TypeScript davranışı:

```ts
type Product = {
  id: number;
  price: number;
};

const text = '{"id":"wrong","price":"49"}';
const product: Product = JSON.parse(text);
```

Bu atama, standart TypeScript tanımlarında kabul edilebilir. Çünkü `JSON.parse()` dönüş tipi **`any`** olarak tanımlanmıştır; `any` atamada tip kontrolünü aşabilir. Ancak runtime verisi aynı kalır:

```ts
console.log(product.id);          // "wrong"
console.log(typeof product.id);   // "string"
console.log(typeof product.price); // "string"
```

TypeScript'te `Product` olarak tanımladığımız için veriler otomatik sayıya dönüşmez. **Compile-time model = runtime verification değildir.**

### `as Product` ile zorlamak da validation değildir

```ts
const product = JSON.parse(text) as Product;
```

`as Product`, TypeScript'e bir tip iddiasıdır. Runtime'da `typeof product.id` hâlâ `"string"` olur. Yanlış veriyi güvenilir gibi kullanmaya neden olabilir.

### `unknown` ile güven sınırını görünür kılmak

```ts
const parsed: unknown = JSON.parse(text);

// TypeScript izin vermez:
// console.log(parsed.id);
```

`unknown` sayesinde tipe özgü property erişiminden önce doğrulama yapmamız gerekir. Bu, bilinmeyen veriyi farkında olmadan güvenilir kabul etmememizi sağlar.

## 6. İlk runtime kontrolleri: object mi, null mı, array mi?

JSON parse sonucunda `null`, `[]`, `42`, `{}` gibi farklı değerler bulunabilir. Önce gerçekten normal bir object yapısıyla mı çalıştığımızı kontrol edelim:

```ts
function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

const parsed: unknown = JSON.parse('{"id":101}');

if (isObjectRecord(parsed)) {
  console.log(parsed.id); // 101; property'si henüz unknown türünde
}
```

Burada üç farklı riski kapatıyoruz:

- `typeof value === "object"`: Primitive değerlerin çoğunu eler.
- `value !== null`: `null` sonucunu eler.
- `!Array.isArray(value)`: Array'leri eler.

**Ama bu yeterli değil!**

```ts
const parsed: unknown = JSON.parse('{"id":"wrong"}');
```

Bu değer de object'tir. Ancak `id` beklenen `number` değildir. `isObjectRecord()` yalnızca dış yapıyı daraltır; her property'nin doğru tipte olduğunu garanti etmez.

## 7. Güvenlik açısından hata ayırımı

Bu üç input'a bakalım:

```ts
const a = '{"id":101,}';          // syntax hatası
const b = '{"id":"101"}';        // syntax doğru, tip yanlış olabilir
const c = '{"id":101,"price":-5}'; // syntax doğru, iş kuralı yanlış olabilir
```

Sorunları tek kategoride toplamak tanılama kalitesini düşürür:

| Hata türü | Örnek | Kimin sorumluluğu? |
|---|---|---|
| `INVALID_JSON` | Trailing comma | Parser / Syntax |
| `INVALID_SHAPE` | String olması gereken alanda number | Runtime validator |
| `INVALID_PRICE` | Negatif fiyat | Business validator |

Bu hata isimleri **uygulamanın kendi kontrollü sonuç etiketleridir**; `JSON.parse()` kendiliğinden bu etiketleri döndürmez. `JSON.parse()` hatalı sözdiziminde exception fırlatır.

## 8. Test ve debugging tasarımı

Girdi → beklenen gözlenebilir davranış:

| JSON metni | `JSON.parse` sonucu |
|---|---|
| `'42'` | number `42` |
| `'[1,2]'` | array `[1,2]` |
| `'null'` | `null` |
| `'{"name":"Alex"}'` | object |
| `'{'` | `SyntaxError` |
| `'{"active":"true"}'` | object, ama `active` string |

**Debugging sorusu:** "Parse başarılı; neden uygulama hata veriyor?" Yanıt: Parse edilen değer, *uygulamanın beklediği şekil/tip/iş kuralına* uygun olmayabilir. Bu problem parsing başarısından sonra ortaya çıkar.

## 9. Mülakat hazırlığı

**Soru: What does `JSON.parse()` return?**

> It parses valid JSON text and returns the corresponding JavaScript value. Depending on the JSON, that can be an object, array, string, number, boolean, or null. Invalid JSON syntax throws a `SyntaxError`.

**Soru: Is `JSON.parse()` type-safe in TypeScript?**

> Not by itself. Its standard return type is `any`, and it does not validate the parsed value against our TypeScript interfaces. A safer boundary treats the result as `unknown` and checks its runtime shape before use.

**Türkçe öz:** Parse işlemi JSON syntax'ını çözer, TypeScript modelini doğrulamaz. `unknown` ve runtime validation ayrı gereklidir.

## 10. Kendi kendine pekiştirme

1. `JSON.parse('"Hello"')` ile `JSON.parse('Hello')` arasındaki fark nedir?
2. `JSON.parse('{"active":"false"}')` neden boolean `false` üretmez?
3. `JSON.parse('{"id":1,}')` neden başarılı değildir? `try/catch` akışında hangi kod çalışır?
4. `const product: Product = JSON.parse(text)` niçin runtime doğrulaması değildir?
5. `typeof value === "object"` kontrolüne niçin hem `value !== null` hem de `!Array.isArray(value)` ekleyebiliriz?

<details>
<summary>Kontrol cevapları</summary>

1. İlkinde geçerli JSON string'i parse edilir ve JS string'i elde edilir; ikincisi geçersiz JSON'dur, SyntaxError oluşur.
2. Çift tırnak içindeki `"false"` bir string'dir.
3. Trailing comma yasaktır; exception sonrası try'daki sonraki satırlar çalışmaz, catch devreye girer.
4. `JSON.parse()` standartta any döndürür; atama veriyi dönüştürmez/doğrulamaz.
5. `typeof null === "object"` ve `typeof [] === "object"` olduğundan bunları normal object'ten ayırmak gerekir.

</details>
