# Ders 10 — Spread Syntax

[Öğrenme sırası](../README.md) · [Bölüm 2](./README.md)

## Öğrenme hedefi

Değerleri yeni array veya object yapısına yayar.

## Temel örnek

```ts
const a=[1,2],b=[3,4];
const result=[...a,...b];
console.log(result); // [1,2,3,4]
```

## Sınır davranışı

```ts
const defaults={retries:3,timeout:1000};
const config={timeout:5000,...defaults,retries:5};
console.log(config); // { retries:5, timeout:1000 }
```

## Birikimli örnek

```ts
const u={settings:{theme:'dark'}};
const updated={...u,settings:{...u.settings,theme:'light'}};
console.log(u.settings.theme); // dark
console.log(updated.settings.theme); // light
```

## Yaygın hata ve debugging

Shallow copy yeni dış yapı oluşturur; nested object otomatik kopyalanmaz. Property'de son değer kazanır.

## Pekiştirme

1. Her örneğin çıktısını kod çalıştırmadan açıkla.
2. Son örnekte bir input veya property değiştirerek yeni durum için sonucu öngör.
3. Yanlış varsayımı gösterecek negatif bir test senaryosu tarif et.

> **Kanıt:** Açıklamalar öğretim örnekleridir; gerçek repo çalıştırması ve bağımsız yeterlilik ayrı doğrulanır.
