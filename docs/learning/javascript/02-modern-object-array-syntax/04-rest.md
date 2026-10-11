# Ders 11 — Rest Syntax

[Öğrenme sırası](../README.md) · [Bölüm 2](./README.md)

## Öğrenme hedefi

Kalan değerleri array veya object içinde toplar.

## Temel örnek

```ts
const a=[10,20,30];
const [first,...other]=a;
console.log(first,other); // 10 [20,30]
```

## Sınır davranışı

```ts
const u={id:1,name:'Alex',role:'admin'};
const {id,...details}=u;
console.log(details); // {name:'Alex',role:'admin'}
```

## Birikimli örnek

```ts
function sum(...values:number[]):number {
 let r=0;
 for(const v of values) r+=v;
 return r;
}
console.log(sum(...[10,20,30])); // 60
```

## Yaygın hata ve debugging

Rest destructuring'de sonda olmalıdır. Rest nested referansları paylaşır. Çağrıda ...spread, parametrede ...rest'tir.

## Pekiştirme

1. Her örneğin çıktısını kod çalıştırmadan açıkla.
2. Son örnekte bir input veya property değiştirerek yeni durum için sonucu öngör.
3. Yanlış varsayımı gösterecek negatif bir test senaryosu tarif et.

> **Kanıt:** Açıklamalar öğretim örnekleridir; gerçek repo çalıştırması ve bağımsız yeterlilik ayrı doğrulanır.
