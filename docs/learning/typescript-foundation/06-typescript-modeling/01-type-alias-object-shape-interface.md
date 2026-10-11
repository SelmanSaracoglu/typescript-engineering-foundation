# Ders 19 — Type Alias, Interface ve Object Shape

## 1. Neden modelleme yapıyoruz?

Bir function ürün alıyorsa hangi alanları beklediğini açıklayabilmeliyiz. `name` metin, `price` sayı, `inStock` boolean mı? Bu sözleşme dağınık kullanılırsa caller ve implementasyon aynı şeyi beklemeyebilir.

## 2. TypeScript type tanımı bir runtime nesnesi değildir

```ts
type Product = {
  name: string;
  price: number;
  inStock: boolean;
};
function label(product: Product): string {
  return product.inStock ? product.name : "unavailable";
}
const apple: Product = { name:"Elma", price:100, inStock:true };
console.log(label(apple)); // Elma
```

`type Product` yalnız **statik shape beklentisi** kurar. `apple` gerçek runtime object'idir. Derlenen JavaScript'te type alias bulunmaz; object literal ise gerçek data olarak kalır.

## 3. Adım adım yürütme

1. `apple` üç property'li object olarak oluşur.
2. TypeScript required alanların ve tiplerin uyumluluğunu kontrol eder.
3. `label(apple)` aynı object referansıyla çağrılır.
4. `product.inStock` true olduğu için Elma döner.
5. `label` fonksiyonu ne object kopyalar ne de type tanımından object üretir.

## 4. interface ve structural typing

```ts
interface ListedProduct {
  name: string;
  price: number;
  inStock: boolean;
}
const listed: ListedProduct = {
  name:"Nar", price:110, inStock:false
};
console.log(label(listed)); // unavailable
```

`ListedProduct` ve `Product` adları aynı değil; ancak burada required shape'leri uyumlu. TypeScript çoğu object ilişkisini **structural typing** ile değerlendirir. Interface nesne sözleşmelerini yazmanın diğer yoludur; type alias ise union ve primitive gibi modelleri de isimlendirebilir.

## 5. Eksik alan ve yanlış tip

```ts
// Bilerek statik hata örnekleri:
// const missing: Product = { name:"Elma", price:100 };
// const wrong: Product = { name:"Elma", price:"100", inStock:true };
```

İlkinde required `inStock` yoktur, ikincide `price` string'dir. Modeli `as Product` ile susturmak alan üretmez; dış data runtime'da yanlış kalır.

## 6. Tek kayıt ile array

```ts
const one: Product = { name:"Elma", price:100, inStock:true };
const many: Product[] = [one];
console.log(many.length); // 1
console.log(many[0] === one); // true
```

`Product[]`, Product elementlerinin collection'ı demektir. Array'e object reference eklemek yeni element object üretmez. Aynı type adını paylaşmak object identity ile ilgili garanti değildir.

## 7. İş kuralları type değildir

```ts
const invalidBusinessPrice: Product = {
  name:"Elma", price:-100, inStock:true
};
console.log(invalidBusinessPrice.price); // -100
```

Bu statik olarak geçerli `number`, fakat ürün fiyatı için iş kuralına aykırı olabilir. Runtime validation ve iş kuralı ayrı gereksinimlerdir.

## 8. Debugging

**Property missing:** Önce modelde alan gerçekten zorunlu mu bak; caller eksikse düzelt. Alanı gereksiz yere `?` yapma.

**Runtime değer yanlış:** Dışarıdan gelen object'in gerçek property türünü incele. Type assertion validation sağlamaz.

**Beklenmeyen mutation:** Aynı `Product` modeline uyan iki object'in identity'sini de ayrıca kontrol et.

## 9. Mülakat hazırlığı

**Question:** Do TypeScript interfaces and types create runtime objects?

> No. They describe compile-time contracts. A runtime object is created by JavaScript expressions such as object literals.

**Pekiştirme:** `Product` ile `Product[]` farkı? İki farklı isimli ama aynı shape'li model kullanılabilir mi? `price:-1` type-check'ten geçebilir mi?

<details><summary>Kontrol cevapları</summary>

Tek kayıt ve dizi; uyumlu shape'lerde evet; number tipi negatifi otomatik yasaklamaz.

</details>

## 10. Uygulama örneği: type uyumlu, iş kuralı yanlış

```ts
type Product = { name:string; price:number; inStock:boolean };
function isPremium(product: Product): boolean {
  return product.inStock && product.price >= 100;
}
const cheap: Product = {name:"Elma",price:99,inStock:true};
const exact: Product = {name:"Nar",price:100,inStock:true};
const missingStock: Product = {name:"Üzüm",price:200,inStock:false};
console.log(isPremium(cheap));        // false
console.log(isPremium(exact));        // true
console.log(isPremium(missingStock)); // false
```

Üç object de Product **type shape'ine uygun**. Fakat yalnız exact ürünü premium koşuluna uygundur. Object shape modellemesi, business decision'ı kendiliğinden çözmez.

| Product | Type-check | Business decision |
| --- | --- | --- |
| cheap | geçerli | false |
| exact | geçerli | true |
| missingStock | geçerli | false |

### Yanlış type tanımını “esnetme” tehlikesi

Bir caller `inStock` alanını unutuyorsa onu `inStock?:boolean` olarak değiştirmek yalnız derleyiciyi susturabilir; iş kuralına göre stok bilgisi **zorunluysa** model artık doğru sözleşmeyi yansıtmaz.

### Yeni görev

Product'a `sku:string` alanı eklenecekse hangi object literal'ler güncellenmeli? `Product[]` içinde her element neden aynı yeni zorunlu alanı sağlamalı?

<details><summary>Kontrol</summary>

Model ve onu üreten örnekler/fixture'lar güncellenir. Required alanın tüm Product kayıtlarında bulunması beklenir; runtime kaynaklar ayrıca doğrulanmalıdır.

</details>
