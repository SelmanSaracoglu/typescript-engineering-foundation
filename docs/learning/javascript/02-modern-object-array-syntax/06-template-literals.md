# Ders 13 — Template Literals

[Öğrenme sırası](../README.md) · [Bölüm 2](./README.md)

## Öğrenme hedefi

Backtick ile expression değerini string içine ekler.

## Temel örnek

```ts
const name='Alex';
console.log('Hello ${name}'); // Hello ${name}
console.log(`Hello ${name}`); // Hello Alex
```

## Sınır davranışı

```ts
const retries:number|undefined=0;
console.log(`Retries: ${retries??3}`); // Retries: 0
```

## Birikimli örnek

```ts
type Order={id:number;customer?:{name:string}};
function label(o:Order):string {
 return `Order ${o.id}: ${o.customer?.name??'Guest'}`;
}
console.log(label({id:7})); // Order 7: Guest
```

## Yaygın hata ve debugging

Normal tırnak interpolation yapmaz. Çok satırlı string'in boşlukları korunur. Otomatik validation veya escaping yoktur.

## Pekiştirme

1. Her örneğin çıktısını kod çalıştırmadan açıkla.
2. Son örnekte bir input veya property değiştirerek yeni durum için sonucu öngör.
3. Yanlış varsayımı gösterecek negatif bir test senaryosu tarif et.

> **Kanıt:** Açıklamalar öğretim örnekleridir; gerçek repo çalıştırması ve bağımsız yeterlilik ayrı doğrulanır.
