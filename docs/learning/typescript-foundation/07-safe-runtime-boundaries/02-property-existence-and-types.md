# Ders 24 — Property Existence, Runtime Type ve Shape Validation

## 1. Alan var ama yanlış türde olabilir

`{name:"Elma", price:"100"}` bir object'tir ve price property'si vardır. Ancak fiyat **string** olduğu için number bekleyen uygulama modeline doğrudan güvenilir biçimde alınmamalıdır.

## 2. Kontrollerin sırası

```ts
type Product = { name: string; price: number };
function validate(input: unknown): Product | null {
  if (typeof input !== "object" || input === null ||
      Array.isArray(input)) return null;
  if (!("name" in input) || !("price" in input)) return null;
  if (typeof input.name !== "string" ||
      typeof input.price !== "number") return null;
  return { name: input.name, price: input.price };
}
console.log(validate({name:"Elma",price:10}));  // {name:"Elma",price:10}
console.log(validate({name:123,price:10}));     // null
console.log(validate(null));                   // null
```

Önce **container shape**, sonra **property existence**, sonra **property type** kontrol edilir. Bu sıra runtime'da güvenli property erişimi sağlar.

## 3. Girdilerin control-flow tablosu

| Input | Object check | Alan var mı? | Tip doğru mu? | Result |
| --- | --- | --- | --- | --- |
| `null` | red | — | — | null |
| `[]` | red | — | — | null |
| `{}` | geçer | hayır | — | null |
| `{name:123,price:10}` | geçer | evet | hayır | null |
| `{name:"Elma",price:10}` | geçer | evet | evet | Product |

Bu örnekte return null **controlled failure** yoludur, runtime exception değil.

## 4. Property varlığı doğru tip anlamına gelmez

```ts
const item: object = { price: "100" };
console.log("price" in item); // true
```

Bu sadece alanın bulunduğunu bildirir. `typeof` ile gerçek değer tipi ayrıca doğrulanmalıdır.

## 5. Shape ve business validation ayrımı

```ts
console.log(typeof NaN);      // number
console.log(typeof Infinity); // number
```

`typeof price==="number"` kontrolü bu ikisini number olarak görür. İş kuralı sonlu ve negatif olmayan fiyat gerektiriyorsa:

```ts
function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}
console.log(isValidPrice(NaN)); // false
console.log(isValidPrice(-1));  // false
console.log(isValidPrice(0));   // true
```

Runtime type ve business constraints ayrı katmanlardır.

## 6. Yeni model oluşturmak

`return {name:input.name,price:input.price}` yeni object üretir. Input'tan yalnız beklenen alanların taşınması, caller'ın önceden verdiği başka property'leri output'a kopyalamaz. Ancak nested object alanları taşısaydık reference paylaşımı ayrıca incelenmeliydi.

## 7. Debugging

Belirti: `price` alanı var ama hesap sonucu string birleşmesi. Önce property'nin runtime `typeof` sonucunu gözle. Assertion ile string'i number sayma. Testlere doğru object, eksik name, yanlış name type, yanlış price type, null ve array ekle.

## 8. Mülakat ve pekiştirme

**Question:** Is property existence enough for runtime validation?

> No. You also need to verify runtime value types and any relevant business constraints.

**Kontrol:** `{name:"Elma",price:"10"}` niçin reddedilir? `price:NaN` bu shape guard'dan geçer mi? `[]` neden ilk aşamada red?

<details><summary>Cevaplar</summary>

Price string; NaN typeof number olduğu için geçebilir; array object'ten ayrıca ayrılmalıdır.

</details>
