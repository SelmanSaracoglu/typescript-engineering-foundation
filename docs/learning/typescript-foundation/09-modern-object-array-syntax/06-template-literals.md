# Ders 13 — Template Literals: Okunabilir String Üretimi

## 1. Neden `+` ile string birleştirmek yerine template literal?

Bir test kaydından metin üretmek istediğimizi düşünelim:

```ts
const name = "Login";
const durationMs = 150;
const oldStyle = "Test " + name + " took " + durationMs + "ms";
console.log(oldStyle); // Test Login took 150ms
```

Kod çalışır. Fakat eklenen alan sayısı arttığında çok sayıda tırnak, artı işareti ve boşlukla uğraşmak zorlaşır.

**Template literal**, backtick (`\``) ile çevrilen string sözdizimidir. İçine `${expression}` yerleştirilerek hesaplanmış değerler okunabilir biçimde yazılabilir:

```ts
const name = "Login";
const durationMs = 150;
const message = `Test ${name} took ${durationMs}ms`;
console.log(message); // Test Login took 150ms
```

`+` yöntemi yanlış değildir; template literal değişkenli metinlerde çoğunlukla daha okunabilirdir.

## 2. Sözdizimi: Backtick ve string interpolation

```ts
const product = "Keyboard";
const price = 49;
const message = `${product} costs ${price} EUR`;
console.log(message); // Keyboard costs 49 EUR
```

Buradaki roller:

- Backtick (`\``): Template literal'i başlatır ve bitirir.
- `${...}`: İçindeki **JavaScript expression**'ı değerlendirir.
- Expression sonucu: Metne yerleştirilmek için string gösterimine dönüştürülür.
- Nihai `message`: Bir **string** değeridir.

```ts
console.log(typeof price);   // number
console.log(typeof message); // string
```

`${price}` eklemek `price` değişkenini number olmaktan çıkarmaz; üretilen metnin içine `49` karakterleri yerleştirilir.

### Normal tırnak `${...}` çalıştırmaz

```ts
const name = "Alex";
console.log("Hello ${name}"); // Hello ${name}
console.log('Hello ${name}'); // Hello ${name}
console.log(`Hello ${name}`); // Hello Alex
```

Bu, yeni başlayanların en sık gördüğü hatalardan biridir. Normal tırnakla yazılan `${name}` düz karakterlerden ibarettir.

## 3. Değişken değil, expression değerlendirilir

Interpolation içine sadece değişken adı yazmak zorunda değiliz:

```ts
const subtotal = 100;
const delivery = 20;
console.log(`Total: ${subtotal + delivery} EUR`); // Total: 120 EUR
```

**Çalışma sırası:**

1. `${subtotal + delivery}` içindeki toplama işlemi değerlendirilir.
2. Sonuç `120` number'dır.
3. Sonuç metne çevrilerek yerine yerleştirilir.
4. Template literal bütün hâliyle `"Total: 120 EUR"` string'ini üretir.

Ternary expression da kullanılabilir:

```ts
const passed = false;
const message = `Status: ${passed ? "PASS" : "FAIL"}`;
console.log(message); // Status: FAIL
```

Burada karar mekanizması ternary'dir; template literal yalnızca seçilen değeri gösterir. Karmaşık ifadeleri string'in içine gömmek zorunda değilsin. Çoğu durumda önce ayrı `const status = ...` tanımlamak okunabilirliği artırır.

## 4. `null`, `undefined`, `0`, `false` ve default'lar

Template literal değeri kendiliğinden "mantıklı varsayılan"a dönüştürmez:

```ts
const username: string | undefined = undefined;
console.log(`Hello ${username}`); // Hello undefined
```

İş kuralımız eksik isme `Guest` demekse `??` kullanmalıyız:

```ts
const username: string | undefined = undefined;
const message = `Hello ${username ?? "Guest"}`;
console.log(message); // Hello Guest
```

Geçerli falsy değerler korunmalıdır:

```ts
const retries = 0;
const enabled = false;
console.log(`Retries: ${retries}; enabled: ${enabled}`);
// Retries: 0; enabled: false
```

Hatalı kullanım: `${retries || 3}`. `0` falsy olduğu için `3` yazılır; bu Template Literal sorunu değil, `||` operatörünün kararıdır. `Ders 5 — Nullish Coalescing` ile ilişkilendir.

## 5. Object ve array nasıl string'e çevrilir?

Her tür metne dönüşün anlamlı olacağını varsayma:

```ts
const user = { id: 101, name: "Alex" };
console.log(`User: ${user}`); // User: [object Object]
```

Sıradan object'in varsayılan string gösterimi iş kuralı açısından kullanışlı olmayabilir. Alanları bilinçli seç:

```ts
console.log(`User: ${user.name} (#${user.id})`);
// User: Alex (#101)
```

Array de dönüştürme kurallarına tabidir:

```ts
const roles = ["viewer", "editor"];
console.log(`Roles: ${roles}`); // Roles: viewer,editor
console.log(`Roles: ${roles.join(", ")}`); // Roles: viewer, editor
```

`join(", ")` çıktıyı açıkça biçimlendirmemizi sağlar. Bir object'i JSON metnine dönüştürmek başka bir mekanizmadır: `JSON.stringify()` (Bölüm 3). Template literal bir serializer değildir.

## 6. Multiline string ve whitespace

Backtick içinde gerçek satır sonları bulunabilir:

```ts
const name = "Alex";
const message = `Hello ${name}
Welcome back`;
console.log(message);
// Hello Alex
// Welcome back
```

Normal tırnakta iki satır elde etmek için `\n` kullanılabilir:

```ts
const message = "Hello Alex\nWelcome back";
```

**Whitespace tuzağı:**

```ts
const text = `
  Hello
  World
`;
```

Buradaki baştaki/sondaki satır sonları ve iki boşlukluk girintiler **gerçek string içeriğine** dahildir. Testlerde `toBe` gibi exact string eşitliği kullanıldığında boşluk farkları bug gibi görünebilir. `trim()` belli durumlarda işe yarar; ancak her whitespace'i otomatik silmek iş kuralını değiştirebilir.

## 7. Escaping: Literal backtick ve `${` yazmak

Template literal'in özel sözdizimini gerçekten metin olarak göstermek istiyorsak escape kullanabiliriz:

```ts
const price = 42;
console.log(`Value is \${price}`); // Value is ${price}
console.log(`Use a backtick: \``); // Use a backtick: `
```

İlk satır interpolation yapmaz; `${price}` karakterlerini olduğu gibi üretir. İkinci satır backtick karakterini string'in içinde yazdırır. Bu ayrım özellikle dokümantasyon veya log açıklaması oluştururken yararlıdır.

## 8. Güvenlik sınırı: Interpolation sanitization değildir

Template literal, içine konulan içeriği güvenli HTML, SQL veya komut hâline **otomatik olarak dönüştürmez**.

```ts
const userInput = '<img src=x onerror=alert(1)>';
const message = `Submitted: ${userInput}`;
console.log(message);
// Submitted: <img src=x onerror=alert(1)>
```

Bu örnekte yalnızca string üretildi. Eğer bu string daha sonra HTML olarak yorumlanan bir alana kontrolsüz yerleştirilirse XSS riski doğabilir. SQL gibi ortamlarda da string birleştirmek yerine **parameterized query** kullanılmalıdır. Bu ders SQL/DOM uygulaması kurmaz; temel ilke şudur: **String interpolation, bağlama uygun encoding/escaping/validation yerine geçmez.**

## 9. Gerçekçi TypeScript örneği: Sipariş özeti

```ts
type Order = {
  id: number;
  product: string;
  quantity: number;
  customer?: { name: string };
};

function createOrderSummary(order: Order): string {
  const { id, product, quantity, customer } = order;
  const customerName = customer?.name ?? "Guest";
  const quantityLabel = quantity === 0 ? "No items" : `${quantity} items`;
  return `Order #${id}: ${product} - ${quantityLabel} - ${customerName}`;
}

console.log(createOrderSummary({ id: 101, product: "Keyboard", quantity: 0 }));
// Order #101: Keyboard - No items - Guest
```

Bu fonksiyonda: **destructuring** alanları okur, **optional chaining** eksik müşteri üzerinden erişimi durdurur, **`??`** alternatif isim seçer, **ternary** adet açıklamasını üretir, **template literal** metni birleştirir. Aynı kodda birden çok sözdizimi görmek onları aynı mekanizma yapmaz.

## 10. Debugging ve karşılaştırma

| Belirti | Neden | Ne yaparsın? |
|---|---|---|
| Çıktıda `${name}` görünüyor | Normal tırnak kullanılmış | Backtick kullan |
| `Hello undefined` | Değer eksik ve fallback yok | İş kuralına göre `??` veya kontrol |
| `0` yerine `3` | Interpolation içinde `||` kullanıldı | `??` ile karşılaştır |
| `[object Object]` görünüyor | Nesnenin varsayılan metin dönüşümü | Anlamlı property'leri seç |
| Testte string farklı | Gizli newline / girinti | `JSON.stringify(text)` ile görünür hâle getir, whitespace'i incele |
| Kullanıcı girdisi güvenli sanılıyor | Interpolation validation/encoding değildir | Çıktı bağlamının güvenli kurallarını uygula |

## 11. Mülakat hazırlığı

**Question: What are template literals in JavaScript?**

> Template literals are strings written with backticks. They support expression interpolation using `${...}` and can contain multiline text. Interpolated expressions are evaluated and converted into string content. Template literals improve readability but do not validate or automatically escape untrusted input.

**Türkçe:** Template Literal, backtick ile oluşturulan string sözdizimidir. `${...}` ile expression sonucu metne yerleştirilir ve çok satırlı string yazılabilir. Ancak güvenilmeyen veriyi otomatik güvenli hâle getirmez.

**Follow-up: Is the result of `${10 + 20}` a number?**  
Template literal'in tamamının sonucu **string**'dir; iç expression `30` sayısını üretse de string'e yerleştirilir.

## 12. Pekiştirme

1. `"Hello ${name}"` neden interpolation yapmaz?
2. `` `Total: ${10 + 20}` `` ifadesinin değeri ve `typeof` sonucu nedir?
3. `retries = 0` için `${retries || 3}` neden 3 yazar, nasıl düzeltirsin?
4. `{id:101}` object'ini `${obj}` ile göstermek neden istenen JSON metnini üretmez?
5. `name`, `price` alanları alan `getProductMessage` fonksiyonunu yaz; `"Keyboard costs 49 EUR"` formatında string döndürsün.

**Kısa kontrol:** (1) Çift tırnak düz string'dir; (2) `"Total: 30"`, `string`; (3) `||` 0'ı falsy sayar; `${retries ?? 3}`; (4) object'in varsayılan dönüşümü JSON değildir.
