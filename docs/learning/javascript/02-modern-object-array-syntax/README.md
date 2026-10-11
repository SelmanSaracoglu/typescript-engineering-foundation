# Bölüm 2 — Modern Object & Array Syntax

[İçindekiler](../README.md)

## Öğrenme sırası

1. [object destructuring](./01-object-destructuring.md)
2. [array destructuring](./02-array-destructuring.md)
3. [spread](./03-spread.md)
4. [rest](./04-rest.md)
5. [optional chaining](./05-optional-chaining.md)
6. [template literals](./06-template-literals.md)

## Bütüncül model

Destructuring ayırır; spread yayar; rest toplar. Spread ve rest derin kopyalama yapmaz. Optional chaining nullish erişimi durdurur; template literal expression sonucunu string'e ekler.

## Birikimli örnek

```ts
type Order={id:number;quantity:number;customer?:{name:string}};
function summarize(order:Order):string {
 const {id,quantity,customer}=order;
 const label=quantity===0?'No items':`${quantity} items`;
 return `Order ${id}: ${label} / ${customer?.name??'Guest'}`;
}
console.log(summarize({id:1,quantity:0})); // Order 1: No items / Guest
```

## Bölüm kapanışı için kontrol

- Örnekte karar sırasını ve veri akışını açıkla.
- Normal, sınır ve hata senaryosu yaz.
- Yanlış mantıksal operatörü ya da referans kullanımını hangi testin yakalayacağını belirle.

**Durum:** Teorik çalışma tamamlandı. Bu belge, bağımsız VS Code uygulaması veya başarılı Vitest kanıtı değildir.
