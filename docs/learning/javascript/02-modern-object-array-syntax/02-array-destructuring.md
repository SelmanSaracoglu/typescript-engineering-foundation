# Ders 9 — Array Destructuring

[Öğrenme sırası](../README.md) · [Bölüm 2](./README.md)

## Öğrenme hedefi

Index sırasına göre eleman alınır.

## Temel örnek

```ts
const tools=['Git','Docker','Linux'];
const [first,,third]=tools;
console.log(first,third); // Git Linux
```

## Sınır davranışı

```ts
const values=[0,null,undefined];
const [a=10,b=20,c=30]=values;
console.log(a,b,c); // 0 null 30
```

## Birikimli örnek

```ts
const items=[{price:50}];
const [first]=items;
first.price=75;
console.log(items[0].price); // 75
```

## Yaygın hata ve debugging

Eksik eleman undefined olabilir. Default yalnız undefined için kullanılır. İç object referansı paylaşılır.

## Pekiştirme

1. Her örneğin çıktısını kod çalıştırmadan açıkla.
2. Son örnekte bir input veya property değiştirerek yeni durum için sonucu öngör.
3. Yanlış varsayımı gösterecek negatif bir test senaryosu tarif et.

> **Kanıt:** Açıklamalar öğretim örnekleridir; gerçek repo çalıştırması ve bağımsız yeterlilik ayrı doğrulanır.
