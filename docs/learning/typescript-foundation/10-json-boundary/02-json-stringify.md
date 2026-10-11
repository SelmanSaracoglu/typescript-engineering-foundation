# Ders 15 — JSON Serialization: `JSON.stringify()`

## 1. Serialization nedir, neden kullanılır?

**Serialization (serileştirme)**, bellekteki bir değeri saklamak veya aktarmak için uygun bir gösterime dönüştürmektir. JSON serialization, JavaScript tarafında çoğunlukla `JSON.stringify()` ile yapılır.

Örneğin:

```ts
const user = { id: 101, username: "Alex", isActive: true };
const jsonText = JSON.stringify(user);

console.log(jsonText);
// {"id":101,"username":"Alex","isActive":true}

console.log(typeof user);     // "object"
console.log(typeof jsonText); // "string"
```

**Adım adım:**

1. `user` çalışma zamanında bir JavaScript object'idir.
2. `JSON.stringify(user)`, object'in JSON ile temsil edilebilen verilerini dolaşır.
3. Sonuç, JSON içeriği taşıyan **bir string** olur.
4. `user` object'i değiştirilmez; `jsonText` yeni bir değerdir.

**Mülakat tanımı:** `JSON.stringify()` JavaScript değerinin JSON metin gösterimini üretir. Bu işlem her JavaScript değerinin eksiksiz saklanacağını garanti etmez.

## 2. Primitive, array ve nested object nasıl davranır?

### Primitive değerler

```ts
console.log(JSON.stringify(42));      // "42"
console.log(JSON.stringify(true));    // "true"
console.log(JSON.stringify(null));    // "null"
console.log(JSON.stringify("Hello")); // "Hello" (çift tırnaklar metnin parçası)
```

Burada birbiriyle karıştırılabilecek **iki farklı tırnak katmanı** vardır: `JSON.stringify("Hello")` sonuç olarak, içeriği `"Hello"` olan bir JavaScript string'i döndürür. JSON'da string değerleri çift tırnaklı yazıldığı için **çıktı metni** de tırnakları içerir.

### Array

```ts
const scores = [80, 90, 100];
const serialized = JSON.stringify(scores);
console.log(serialized); // [80,90,100]
```

Array'in eleman sırası korunur. Çıktı bir JavaScript array'i değil, JSON array gösterimini içeren string'dir.

### İç içe veri

```ts
const report = {
  testId: 7,
  tags: ["smoke", "login"],
  result: { passed: true, durationMs: 120 }
};

console.log(JSON.stringify(report));
// {"testId":7,"tags":["smoke","login"],"result":{"passed":true,"durationMs":120}}
```

`tags` ve `result` içerikleri de metne dönüştürülür. Bunun bir **deep clone** işlemi olduğu sonucunu çıkarmamalıyız; yalnızca bir string üretildi.

## 3. Neden bazı property'ler kaybolur?

Ders 14'te JSON'un `undefined` ve function gibi türleri doğrudan temsil edemediğini gördük. `JSON.stringify()` bunları konumuna göre farklı ele alır.

### Object property değeri `undefined` ise atlanır

```ts
const user = {
  id: 101,
  nickname: undefined,
  active: false
};

console.log(JSON.stringify(user));
// {"id":101,"active":false}

console.log("nickname" in user); // true
```

Önemli ayrım: JSON **çıktısında** `nickname` bulunmaz; orijinal `user` object'inden silinmemiştir.

`false`, `0`, `""` ve `null` değerleri desteklenir; falsy olmaları bu değerlerin otomatik silinmesine yol açmaz.

### Array elemanı `undefined` ise `null` olarak yazılır

```ts
const values = [10, undefined, null, 40];
console.log(JSON.stringify(values));
// [10,null,null,40]
```

Object'te eksik kalan property **atlanırken**, array'de pozisyon korunur ve desteklenmeyen eleman yerine `null` yazılır.

| Girdi | JSON metni | Sebep |
|---|---|---|
| `{a: undefined}` | `{}` | Object property atlanır |
| `[undefined]` | `[null]` | Array eleman konumu korunur |
| `{a: null}` | `{"a":null}` | `null` geçerli JSON değeridir |
| `{a: false}` | `{"a":false}` | `false` geçerli boolean'dır |
| `{a: 0}` | `{"a":0}` | `0` geçerli sayıdır |

### Top-level değer bizzat `undefined` ise

```ts
const result = JSON.stringify(undefined);
console.log(result); // undefined
```

Bu durumda bir JSON string'i **üretilmez**. Dolayısıyla her `JSON.stringify()` çağrısının koşulsuz string döndürdüğünü varsaymamalıyız.

## 4. Function, Symbol, NaN ve Infinity

Object içindeki function veya `undefined` değerleri normalde atlanır:

```ts
const account = {
  id: 101,
  login: () => true,
  nickname: undefined
};
console.log(JSON.stringify(account));
// {"id":101}
```

Array içindeki function ve `undefined` elemanları ise `null` olur:

```ts
console.log(JSON.stringify([undefined, () => true]));
// [null,null]
```

`NaN` ve `Infinity` JSON sayı türünde bulunmadığı için serialization sırasında `null` olur:

```ts
console.log(JSON.stringify({ temperature: NaN, maximum: Infinity }));
// {"temperature":null,"maximum":null}
```

**Debugging sonucu:** Çıktıda `null` görmek, input'un mutlaka `null` olduğu anlamına gelmez. Örneğin `NaN` bir `null` çıktısına dönüşmüş olabilir.

## 5. Date, BigInt ve circular reference

### Date — tip korunmaz

```ts
const event = { occurredAt: new Date("2026-10-10T14:30:00.000Z") };
const text = JSON.stringify(event);
console.log(text);
// {"occurredAt":"2026-10-10T14:30:00.000Z"}
```

Geçerli bir `Date` değeri, varsayılan davranışta ISO biçimli string'e dönüştürülür (`Date.toJSON()` mekanizması). JSON metnini daha sonra parse ettiğimizde Date nesnesi kendiliğinden geri oluşmaz: ilgili alan string olur. Bu, birebir round-trip beklentisinin neden tehlikeli olduğuna örnektir.

### BigInt — normalde hata

```ts
try {
  JSON.stringify(100n);
} catch (error) {
  console.log(error instanceof TypeError); // true
}
```

`BigInt`, JSON'un standart sayı kategorisinde değildir. Özel bir dönüşüm uygulanmadığı varsayımında `JSON.stringify()` TypeError fırlatır.

### Circular reference — normalde hata

```ts
const user: { name: string; friend?: unknown } = { name: "Alex" };
user.friend = user;

try {
  JSON.stringify(user);
} catch (error) {
  console.log(error instanceof TypeError); // true
}
```

`user.friend` tekrar aynı `user` object'ine işaret ettiği için dönüştürme döngüsel referansla karşılaşır. JSON bu referans ilişkisini varsayılan şekilde temsil edemez.

**Sonuç:** Serialization her input'ta başarılı olmaz; çağrının hata üretebileceği bağlamlarda bunun ayrıca ele alınması gerekir.

## 6. Okunabilir JSON üretmek: `space` parametresi

`JSON.stringify()` üç parametre alabilir:

```ts
JSON.stringify(value, replacer, space)
```

`value` serileştirilecek değer, `replacer` seçici/dönüştürücü, `space` ise girinti parametresidir. Bu derste temel kullanımımız `replacer` için `null` vererek varsayılan davranışı korumaktır.

```ts
const result = { id: 101, passed: true };

console.log(JSON.stringify(result, null, 2));
// {
//   "id": 101,
//   "passed": true
// }
```

Biçimlendirme sadece okunabilirliği değiştirir; burada temsil edilen alanlar ve tipler değişmez. Ancak whitespace miktarı arttığı için dosya/metin boyutu büyüyebilir.

## 7. Gerçekçi örnek: Test sonucu serileştirmek

```ts
type TestResult = {
  testId: number;
  name: string;
  passed: boolean;
  durationMs?: number;
};

function serializeTestResult(result: TestResult): string {
  return JSON.stringify(result);
}

const first: TestResult = {
  testId: 17,
  name: "Login Test",
  passed: true,
  durationMs: 150
};

const second: TestResult = {
  testId: 18,
  name: "Logout Test",
  passed: false
};

console.log(serializeTestResult(first));
// {"testId":17,"name":"Login Test","passed":true,"durationMs":150}
console.log(serializeTestResult(second));
// {"testId":18,"name":"Logout Test","passed":false}
```

Bu örnekte dönüş tipi `string` olarak belirtilmiştir; fonksiyonun **TypeScript tarafından beklenen `TestResult` object girdisi** içindeki alanlar JSON ile temsil edilebilir olduğu için bu örneklerde string üretilir. Ancak tip bildirimi runtime doğrulama yapmaz; güvenilmeyen input için ayrıca validation gerekir (Ders 17).

### Güvenlik notu: Serialization otomatik gizleme değildir

```ts
const account = { username: "Alex", password: "secret-value" };
console.log(JSON.stringify(account));
// {"username":"Alex","password":"secret-value"}
```

JSON.stringify hassas property'leri otomatik olarak gizlemez. Dışarı aktarılacak veri gerekiyorsa izin verilen alanları **açıkça seçmek** gerekir. Gerçek parolaları loglamak veya böyle bir örneği üretimde kullanmak doğru değildir.

## 8. `JSON.stringify(JSON.parse(...))` ve kopyalama yanılgısı

Sık görülen bir yaklaşım:

```ts
// Tanımak için; genel amaçlı deep clone çözümü olarak önerilmez.
const copy = JSON.parse(JSON.stringify(original));
```

Bu yöntemin riskleri:

- `undefined` alanı kaybolur.
- Date nesnesi string'e dönüşebilir.
- `NaN` / `Infinity`, `null` olur.
- `BigInt` ve döngüsel referanslarda işlem hata verebilir.
- Object'in prototip bilgisi ve fonksiyon davranışı aynı şekilde korunmaz.

Bu nedenle **JSON serialization ile güvenilir deep clone aynı şey değildir.** Ders 10'daki shallow copy ayrımı burada da önemlidir.

## 9. Debugging ve test düşüncesi

Kodda JSON çıktısı eksik görünüyorsa sırayla sor:

1. Girdideki property gerçekten var mı? Değeri `undefined` mı?
2. Veri object içinde mi, array içinde mi? İkisinde farklı kurallar var.
3. `NaN` veya `Infinity` gibi özel number mı üretildi?
4. `Date`, `BigInt` veya döngüsel referans var mı?
5. String üretildiğinde hangi property'ler açığa çıkıyor? Hassas alan dahil mi?

Örnek test fikirleri:

| Girdi | Beklenen davranış |
|---|---|
| `{status:false}` | `{"status":false}` |
| `{nickname:undefined}` | `{}` |
| `[undefined]` | `[null]` |
| `{score:NaN}` | `{"score":null}` |
| Döngüsel object | `TypeError` |

Bu testler **tasarım örneğidir**; mevcut repository'de çalıştırıldıkları iddia edilmez.

## 10. Mülakat hazırlığı

**Soru: What does `JSON.stringify()` do?**

> It serializes a JavaScript value into a JSON-formatted string. It is not a universal deep-cloning mechanism, and some values can be omitted, transformed, or cause an error.

**Soru: How does `JSON.stringify()` handle `undefined`?**

> In a normal object property it omits that property. In an array element it produces `null`. When the top-level value is `undefined`, it returns JavaScript `undefined` instead of a JSON string.

**Türkçe öz:** Serialization = metne dönüştürme. `undefined` bağlama göre atlanır, `null` olur veya sonuç hiç string olmaz. Bu nedenle çıktı birebir kopya değildir.

## 11. Kendi kendine pekiştirme

1. `{id:1, active:false, nickname:undefined}` çıktısı nedir?
2. `[undefined, null, 0]` çıktısı nedir? `0` neden korunur?
3. `JSON.stringify(new Date("2026-01-01T00:00:00.000Z"))` sonucu neden Date object değildir?
4. Bir uygulama `password` property'li object'i stringify edip loglarsa problem nedir?
5. `JSON.stringify()` sonucunun her durumda `string` olacağını söylemek neden yanlıştır?

<details>
<summary>Kontrol cevapları</summary>

1. `{"id":1,"active":false}`; `nickname` atlanır.
2. `[null,null,0]`; `0` JSON'un desteklediği number değeridir.
3. JSON Date türü taşımaz; tarih string olarak temsil edilir.
4. Hassas değerin çıktıya dahil edilmesi bilgi sızıntısına yol açabilir; açık alan seçimi gerekir.
5. Top-level `undefined` dönüşü `undefined` olabilir; döngüsel referans veya BigInt hata oluşturabilir.

</details>
