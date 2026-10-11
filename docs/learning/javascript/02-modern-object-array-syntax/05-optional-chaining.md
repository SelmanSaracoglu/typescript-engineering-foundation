# Ders 12 — Optional Chaining

[Öğrenme sırası](../README.md) · [Bölüm 2](./README.md)

## Öğrenme hedefi

Nullish değer üzerinden güvenli erişim.

## Temel örnek

```ts
type U={profile?:{city?:string}};
function city(u:U|null){return u?.profile?.city;}
console.log(city(null)); // undefined
```

## Sınır davranışı

```ts
function display(u:U|null){return u?.profile?.city??'Unknown';}
console.log(display({})); // Unknown
```

## Birikimli örnek

```ts
function first(a:string[]|null){return a?.[0];}
console.log(first([])); // undefined
console.log(first(null)); // undefined
```

## Yaygın hata ve debugging

user?.profile.city, profile da undefined ise hâlâ hatalıdır. user?.profile?.city kullan. Validation yerine geçmez.

## Pekiştirme

1. Her örneğin çıktısını kod çalıştırmadan açıkla.
2. Son örnekte bir input veya property değiştirerek yeni durum için sonucu öngör.
3. Yanlış varsayımı gösterecek negatif bir test senaryosu tarif et.

> **Kanıt:** Açıklamalar öğretim örnekleridir; gerçek repo çalıştırması ve bağımsız yeterlilik ayrı doğrulanır.
