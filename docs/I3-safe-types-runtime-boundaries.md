# I3 — Safe Types, Runtime Boundaries & Error Model

## 1. TypeScript type ile runtime value aynı şey değildir

TypeScript type sistemi kod geliştirilirken ve type-check sırasında beklentileri kontrol eder.

Örneğin:

```ts
type Product = {
  name: string;
  price: number;
  inStock: boolean;
};
```

bu model TypeScript'e şunu söyler:

```text
name    → string
price   → number
inStock → boolean
```

Ancak bu type tanımı runtime sırasında dışarıdan gelen bir object'in gerçekten bu yapıya sahip olduğunu doğrulamaz.

Temel ayrım:

```text
TypeScript type
      ↓
type-check sırasında beklenti


Runtime value
      ↓
program çalışırken gerçekten bulunan değer
```

Bir değer TypeScript tarafından `Product` olarak bekleniyor olsa bile runtime'da eksik veya yanlış type'ta property'ler bulunabilir.

Bu nedenle dışarıdan veya güvenilmeyen bir sınırdan gelen veri ayrıca doğrulanmalıdır.

---

## 2. Optional property

Bir property'nin bulunmayabileceği `?` ile ifade edilebilir.

```ts
type Product = {
  name: string;
  price?: number;
};
```

Burada:

```text
price?: number
```

şu anlama gelir:

```text
price property’si bulunabilir
veya
price property’si bulunmayabilir
```

Bu nedenle `price` okunduğunda TypeScript yalnızca `number` değil, `undefined` ihtimalini de dikkate alır.

Kavramsal olarak:

```text
number | undefined
```

---

## 3. `undefined`

`undefined`, bir değerin tanımlanmamış veya mevcut olmaması durumunu ifade edebilir.

Örneğin:

```ts
const product = {
  name: "Elma",
};
```

`price` bulunmuyorsa:

```ts
product.price;
```

runtime'da `undefined` sonucunu verebilir.

Eksik değeri kontrol etmeden kullanmak runtime hatasına yol açabilir.

Örneğin kavramsal olarak:

```text
price
  ↓
undefined
  ↓
undefined üzerinde number işlemi
  ↓
runtime error
```

---

## 4. `null`

`null`, `undefined` ile aynı şey değildir.

Örneğin:

```ts
type User = {
  nickname?: string;
  middleName: string | null;
};
```

Burada:

```text
nickname?: string
```

property'nin hiç bulunmayabileceğini ifade eder.

Ancak:

```text
middleName: string | null
```

property'nin bulunmasını zorunlu tutar; değer ise bilinçli olarak `null` olabilir.

Örnek:

```ts
{
  middleName: null;
}
```

geçerlidir.

Fakat:

```ts
{
}
```

`middleName` zorunlu olduğu için geçerli değildir.

Temel fark:

```text
undefined
→ değer/property mevcut olmayabilir

null
→ program bilinçli olarak "değer yok" değerini taşır
```

---

## 5. Union type

Union type, bir değerin birden fazla geçerli type'tan biri olabileceğini ifade eder.

Örneğin:

```ts
string | number;
```

bir değerin hem `string` hem de `number` olabileceğini belirtmez.

Şunu belirtir:

```text
value
→ string olabilir

VEYA

value
→ number olabilir
```

Program değeri kullanmadan önce hangi durumda olduğunu anlamak zorunda kalabilir.

---

## 6. Narrowing

Narrowing, daha geniş bir type olasılığının runtime kontrolüyle daraltılmasıdır.

Örnek:

```ts
function normalize(value: string | number) {
  if (typeof value === "string") {
    return value.trim();
  }

  return value * 10;
}
```

Başlangıçta:

```text
value → string | number
```

`if` içinde:

```text
typeof value === "string"
        ↓
value → string
```

`if` branch'i çalışmadığında ise `string` ihtimali elenmiştir.

Geriye:

```text
value → number
```

kalır.

Temel model:

```text
geniş type olasılığı
        ↓
runtime kontrolü
        ↓
daha dar type olasılığı
```

TypeScript burada tahmin yapmaz; programın control flow bilgisinden çıkarım yapar.

---

## 7. `unknown`

`unknown` şu anlama gelir:

> Bir runtime value var, fakat henüz güvenli biçimde hangi type olduğunu bilmiyoruz.

Örneğin:

```ts
function process(value: unknown) {
  // value henüz doğrudan kullanılamaz
}
```

`unknown`, güvenilmeyen veya henüz doğrulanmamış runtime verisi için güvenli bir başlangıç noktasıdır.

Doğrudan işlem yapmak yerine önce runtime kontrolü gerekir.

Örneğin:

```text
unknown
   ↓
typeof kontrolü
   ↓
narrowing
   ↓
güvenli kullanım
```

`any` bu güvenlik mekanizmasını büyük ölçüde devre dışı bırakacağı için aynı amacı taşımaz.

---

## 8. Object runtime validation

Dışarıdan gelen `unknown` bir değerin belirli bir modele uyup uymadığını kontrol etmek için yalnızca object olup olmadığına bakmak yeterli değildir.

Örneğin:

```ts
typeof value === "object";
```

şunların hepsinde doğru olabilir:

```text
{ name: "Elma" }

{}

[]

null
```

JavaScript'te:

```ts
typeof null === "object";
```

olduğu için `null` ayrıca kontrol edilmelidir.

Bir `Product` benzeri object için validation akışı:

```text
unknown
   ↓
object mı?
   ↓
null değil mi?
   ↓
gerekli property'ler mevcut mu?
   ↓
property type'ları doğru mu?
   ↓
güvenilir model
```

Örneğin aşağıdaki iki kontrol farklı sorulara cevap verir:

```text
"name" property’si var mı?
```

ve:

```text
"name" property’sinin runtime type'ı string mi?
```

Property'nin mevcut olması, değerinin doğru type'ta olduğunu garanti etmez.

Örneğin:

```ts
{
  name: 123;
}
```

`name` property’sine sahiptir fakat beklenen `string` type'ına sahip değildir.

---

## 9. Type tanımı runtime validation değildir

Aşağıdaki TypeScript type:

```ts
type Product = {
  name: string;
  price: number;
  inStock: boolean;
};
```

geliştiriciye ve TypeScript type checker'a modelin ne olması gerektiğini söyler.

Ancak tek başına şunu garanti etmez:

```text
runtime'da gelen gerçek object
gerçekten bu shape'e sahip mi?
```

Bu nedenle güvenilmeyen veri sınırında ayrıca runtime validation yapılmalıdır.

Temel ayrım:

```text
type Product
→ compile/type-check expectation

runtime validation
→ gerçek value üzerinde çalışan kontrol
```

---

## 10. Runtime validation sonucu

Runtime validation sonunda iki temel sonuç olabilir:

```text
unknown input
      ↓
runtime validation
      ↓
valid model | validation error
```

Geçersiz veri her zaman exception olmak zorunda değildir.

Bir validation function için geçersiz input beklenen bir durumsa başarısızlık normal dönüş sözleşmesinin parçası olarak modellenebilir.

Örneğin kavramsal olarak:

```text
success
→ valid Product

error
→ validation başarısız
```

Bu iki durum union type ile modellenebilir.

---

## 11. Kontrollü result modeli

Bir işlem başarısızlığı fonksiyonun beklenen sonuçlarından biriyse fonksiyon bunu normal bir değer olarak döndürebilir.

Kavramsal model:

```text
Result
 ├─ success: true
 │      └─ valid value
 │
 └─ success: false
        └─ error information
```

Çağıran kod bu sonucu kontrol eder ve program normal control flow içinde devam eder.

```text
function call
     ↓
return error result
     ↓
caller sonucu alır
     ↓
caller ne yapacağına karar verir
```

Bu yaklaşım özellikle validation gibi beklenen başarısızlık durumlarında kullanılabilir.

---

## 12. `return` ve `throw` farkı

`return` ile `throw` aynı mekanizma değildir.

### `return`

```text
function
   ↓
return value
   ↓
caller değeri alır
   ↓
normal execution devam eder
```

Fonksiyon normal biçimde tamamlanmıştır.

Başarısızlığı temsil eden bir object dönmüş olsa bile bu hâlâ normal return yoludur.

### `throw`

```text
function
   ↓
throw Error
   ↓
normal execution kesilir
   ↓
en yakın uygun catch aranır
```

`throw new Error(...)` içindeki mesaj çağırana `return` edilmez.

Örneğin:

```ts
throw new Error("Invalid number");
```

iki işlem içerir:

```text
new Error(...)
→ Error object oluşturur

throw
→ bu Error object'i exception yoluna gönderir
```

Fonksiyonun normal dönüş değeri oluşmaz.

Temel ayrım:

```text
return
→ normal sonuç kanalı

throw
→ exception kanalı
```

---

## 13. Beklenen hata sonucu mu, exception mı?

Her hata için tek bir evrensel yöntem yoktur.

Karar verirken temel soru:

> Bu durum function'ın beklenen sonuçlarından biri mi, yoksa normal yürütmenin devam edemeyeceği bir durum mu?

Örneğin bir runtime validation function için:

```text
geçersiz input
```

beklenen bir sonuç olabilir.

Bu durumda kontrollü error result anlamlıdır.

Başka bir durumda uygulamanın normal yürütmesi gerçekten devam edemiyorsa exception daha uygun olabilir.

Bu Increment kapsamında yalnız senkron error davranışı ele alınır.

Async error propagation sonraki kapsamdadır.

---

## 14. Module sınırı

Bir module, belirli bir sorumluluğu taşıyan TypeScript dosyası olabilir.

Örneğin mevcut projede:

```text
product.ts
→ Product modeli
→ Product business davranışı
```

Runtime validation ayrı bir sorumluluk haline geldiğinde ayrı bir dosyada tutulabilir:

```text
productValidation.ts
→ unknown input
→ runtime validation
→ valid Product veya controlled error
```

Bir dosyadaki type başka dosyada kullanılacaksa:

```ts
import type { Product } from "./product";
```

kullanılabilir.

Bir function başka module tarafından kullanılacaksa:

```ts
export function ...
```

ile dışarı açılır.

Temel ilişki:

```text
product.ts
    │
    │ export Product
    ↓
productValidation.ts
    │
    │ import Product
    ↓
runtime validation
```

Module ayırmanın amacı daha fazla dosya üretmek değildir.

Amaç farklı sorumlulukları anlaşılır ve test edilebilir biçimde ayırmaktır.

---

## 15. I3 repo uygulamasındaki hedef akış

Gerçek uygulama şu modeli gerçekleştirecektir:

```text
unknown runtime input
        ↓
object/null kontrolü
        ↓
required property kontrolü
        ↓
property type kontrolü
        ↓
     ┌───────────────┐
     │               │
     ↓               ↓
valid Product    validation error
```

Validation sırasında:

- `any` ile type kontrolü bypass edilmeyecek,
- `as Product` ile runtime validation gizlenmeyecek,
- yeni validation library eklenmeyecek,
- HTTP/API kullanılmayacak,
- gereksiz business rule eklenmeyecek.

Gerçek TypeScript implementation bu kavramsal model kullanılarak ayrıca geliştirilecektir.

---

## 16. I3'te doğrulanacak davranışlar

Implementation ve test aşamasında aşağıdaki riskler değerlendirilecektir:

```text
valid object
missing property
wrong property type
null
primitive input
controlled validation error
success branch
```

Testler implementation'ın iç satırlarını kopyalamak yerine dışarıdan gözlenebilir davranışı doğrulamalıdır.

Bütün kombinasyonları test etmek amaç değildir; anlamlı riskleri kapsayan testler seçilmelidir.

---

## Temel zihinsel model

I3'ün şimdiye kadarki ana zinciri:

```text
TypeScript type
       ↓
compile-time expectation

unknown runtime value
       ↓
narrowing + validation
       ↓
trusted model
       ↓
business logic
```

ve hata davranışı:

```text
beklenen başarısızlık
→ controlled result

normal execution'ın devam edemediği hata
→ exception
```

Bu iki ayrım, güvenilmeyen runtime verisini güvenilir uygulama koduna taşırken temel sınırı oluşturur.
