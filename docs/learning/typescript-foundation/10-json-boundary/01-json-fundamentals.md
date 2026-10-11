# Ders 14 — JSON Fundamentals: JSON Nedir, JavaScript Object'ten Farkı Nedir?

## 1. Bu konuyu neden öğreniyoruz?

Bir program, kendi belleğinde JavaScript object'leri ve array'leriyle çalışır. Fakat bu değerlerin başka bir programa, dosyaya veya sistem sınırına **veri olarak** aktarılması gerektiğinde ortak bir gösterime ihtiyaç duyarız. JSON (*JavaScript Object Notation*), yapılandırılmış verileri **metinle temsil eden** yaygın, dilden bağımsız bir formattır.

Örnek kullanım alanları: yapılandırma dosyaları, test fixture'ları, rapor çıktıları ve sistemler arası veri alışverişi. Bu ders için HTTP sunucusu veya başka bir framework kurmamıza gerek yok.

**Mülakatta ilk cümle:** JSON, key–value object'ler, array'ler ve primitive değerler gibi yapılandırılmış bilgiyi temsil eden **bir metin formatıdır**; JavaScript'in bellekteki object tipiyle aynı şey değildir.

## 2. Object ile JSON metni neden aynı değildir?

### JavaScript object — çalışma zamanındaki değer

```ts
const user = {
  id: 101,
  username: "Alex",
  isActive: true
};

console.log(typeof user);  // "object"
console.log(user.username); // "Alex"
```

`user` gerçek bir JavaScript object'idir. `user.username` ifadesiyle property okunabilir. Property isimleri burada tırnaksız yazılabilir.

### JSON metni — string içerisinde veri temsili

```ts
const jsonText = '{"id":101,"username":"Alex","isActive":true}';

console.log(typeof jsonText); // "string"
console.log(jsonText);        // {"id":101,"username":"Alex","isActive":true}
```

`jsonText`, **object değil string** değeridir. İçindeki karakterler JSON söz dizimini oluşturur fakat bu, `jsonText.username` ile bir kullanıcının ismini okuyabileceğimiz anlamına gelmez. JSON metni önce yorumlanmalıdır (`JSON.parse()`, Ders 16).

> **Zihinsel model:** Object = programın kullanacağı değer; JSON text = bu değerin taşınabilir yazılı gösterimi. Dış görünüşleri benzer, runtime tipleri farklıdır.

### Kısa karşılaştırma

| Özellik | JavaScript object literal | JSON object metni |
|---|---|---|
| Örnek | `{ id: 101 }` | `{"id":101}` |
| JavaScript'teki karşılığı | Object değeri | Genellikle `string` içeriği veya `.json` dosyası |
| Property isimleri | Tırnaksız da yazılabilir | **Çift tırnak zorunlu** |
| Fonksiyon property | Olabilir | JSON değer türü değil |
| `undefined` | Olabilir | JSON değer türü değil |
| Son elemandan sonra virgül | Object literal'de mümkün | Yasak |
| Yorum satırı | JavaScript kaynağında mümkün | JSON sözdiziminde yasak |

**Dikkat:** `{"id":101}` metninin kendisi JSON içeriğidir. Bunu `.ts` dosyasında bir *string değişkeni* olarak yazacaksak dışına JavaScript string tırnakları ekleriz: `'{"id":101}'`.

## 3. JSON'un desteklediği değer türleri

JSON'un altı değer kategorisi vardır:

| JSON türü | Doğru örnek | Not |
|---|---|---|
| String | `"hello"` | Çift tırnak gerekir |
| Number | `42`, `-1`, `19.5`, `1e3` | `NaN` veya `Infinity` JSON sayısı değildir |
| Boolean | `true`, `false` | `"true"` string'dir, boolean değildir |
| Null | `null` | `undefined` ile karıştırma |
| Object | `{"id":101}` | Ad–değer çiftleri içerir |
| Array | `[10,20,30]` | Elemanların sırası önemlidir |

Hepsini içeren geçerli JSON:

```json
{
  "username": "Alex",
  "age": 25,
  "isActive": true,
  "nickname": null,
  "roles": ["viewer", "editor"],
  "settings": {
    "theme": "dark",
    "notifications": false
  }
}
```

`settings` iç içe bir object'tir; `roles` array'dir. Ancak JSON metni içindeki bu yapılar parse edilene kadar JavaScript object/array değerleri değildir.

### JSON dosyasının kökünde mutlaka object mi olmalı?

Hayır. Aşağıdakilerin her biri tek başına geçerli JSON değeridir:

```json
42
```

```json
["Git", "TypeScript"]
```

```json
null
```

Bu nedenle "JSON.parse her zaman object üretir" çıkarımı yanlıştır. Sonucun tipi kök JSON değerine bağlıdır.

## 4. Söz dizimi kurallarını neden sıkı öğrenmeliyiz?

Aşağıdaki örneklerin hangisi geçerli?

**Geçerli JSON:**

```json
{"id":101,"name":"Alex","active":true}
```

**Geçersiz — property anahtarı tırnaksız:**

```text
{id:101}
```

**Geçersiz — JSON'da tek tırnak yok:**

```text
{'id':101}
```

**Geçersiz — trailing comma:**

```text
{"id":101,}
```

**Geçersiz — desteklenmeyen değer:**

```text
{"nickname":undefined}
```

**Geçersiz — yorum satırı:**

```text
{"id":101 // kullanıcının kimliği
}
```

### String içindeki özel karakterler

JSON string'leri çift tırnak içerir. String'in içinde çift tırnak göstermek gerekirse kaçış karakteri `\` kullanılır:

```json
{"message":"She said \"Hello\""}
```

Satır sonu gibi denetim karakterleri string içerisinde doğrudan yer almak yerine `\n` gibi escape dizileriyle gösterilir:

```json
{"message":"First line\nSecond line"}
```

Bu, özellikle elle JSON yazarken `SyntaxError` üreten yaygın bir ayrıntıdır.

## 5. Söz dizimi geçerli ≠ veri doğru

Diyelim ki uygulamamız şunu bekliyor:

```ts
type Account = {
  id: number;
  isActive: boolean;
};
```

Şu JSON **sözdizimi olarak geçerli**:

```json
{"id":"101","isActive":"true"}
```

Ancak modelle uyuşmuyor. Çünkü `"101"` bir string, `"true"` da bir string. İlgili alanların sayısal ve boolean **olmasını istiyor olmamız**, bu JSON metninin içindeki tipleri değiştirmez.

Üç ayrı soruyu unutma:

1. **Syntax:** Bu metin JSON dilinin kurallarına uygun mu?
2. **Type/shape:** Parse edilen veri beklediğim property'lere ve runtime tiplere sahip mi?
3. **Business rule:** Örneğin `price >= 0` gibi alan kuralları sağlanıyor mu?

Bu soruların sırası önemlidir. Ders 16 parsing'i, Ders 17 validation ve kontrollü hata sonucunu ele alır.

## 6. Gerçekçi mühendislik örneği: Test sonucu verisi

Bir SDET test sonucu şu bilgileri taşıyabilir:

```json
{
  "testId": 17,
  "name": "Login with valid credentials",
  "passed": true,
  "durationMs": 148,
  "tags": ["smoke", "authentication"]
}
```

Bu yapıyı görünce **JSON olarak yazılmış veri** olduğunu bilmelisin. `"passed": "true"` olsaydı dosya yine geçerli JSON olurdu ama beklenen boolean biçimine uymazdı. Veri türü ile iş kuralını karıştırmadan incelemek test tasarımı ve hata analizinin temelidir.

## 7. Debugging sırasında kontrol listesi

- Property adı **çift tırnak** içinde mi?
- String değerleri çift tırnak mı kullanıyor?
- Son elemandan sonra fazladan virgül var mı?
- `undefined`, `NaN`, `Infinity`, function gibi JSON dışı bir değer mi yazıldı?
- JSON metni ile JavaScript object'ini birbirine karıştırıyor muyum?
- Sayı `42` mi, yoksa string `"42"` mi?
- Boolean `false` mu, yoksa string `"false"` mu?

## 8. Mülakat hazırlığı

**Soru: What is JSON and how is it different from a JavaScript object?**

> JSON is a text-based data-interchange format. A JavaScript object is a runtime value with properties and behavior. JSON has a restricted syntax and data types. We can convert between JSON text and JavaScript values using `JSON.stringify()` and `JSON.parse()`.

**Türkçe açıklama:** JSON bir metin formatıdır; JavaScript object bellekteki bir değerdir. JSON'un daha sınırlı tip ve sözdizimi kuralları vardır. İki yönlü dönüşüm ayrı işlemlerle yapılır.

**Soru: Does valid JSON mean valid application data?**

> No. Valid JSON only confirms the syntax. The parsed value still needs runtime shape and business-rule validation.

## 9. Kendi kendine pekiştirme

1. `{ name: "Alex", active: true }` neden JSON değildir? Geçerli JSON'a dönüştür.
2. `'{"id":"101","active":"false"}'` bir JavaScript değişkenine atanırsa değişkenin runtime tipi nedir? İçerikteki `id` ve `active` JSON türleri nedir?
3. JSON kökünde `[1,2]`, `null` ve `false` kullanılabilir mi? Neden?
4. `{"price":-5}` hem geçerli JSON hem de geçersiz iş verisi olabilir mi? Gerekçelendir.

<details>
<summary>Kontrol cevapları</summary>

1. Property adı çift tırnaklı olmalı: `{"name":"Alex","active":true}`.
2. Değişken `string`'dir; içerideki iki property de JSON string değeridir.
3. Evet. JSON kökünde tek bir geçerli JSON değeri bulunabilir; object zorunlu değildir.
4. Evet. JSON syntax geçerlidir; fiyatın negatif olamayacağı iş kuralına uymaz.

</details>

## 10. Bir sonraki ders ve kanıt sınırı
