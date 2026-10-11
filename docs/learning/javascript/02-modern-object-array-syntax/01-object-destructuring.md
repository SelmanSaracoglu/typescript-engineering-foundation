# Ders 8 — Object Destructuring

[Öğrenme sırası](../README.md) · [Bölüm 2](./README.md)

## Öğrenme hedefi

Property adına göre değişken oluşturulur.

## Temel örnek

```ts
const u={name:'Alex',role:'admin'};
const {name:displayName,role}=u;
console.log(displayName,role); // Alex admin
```

## Sınır davranışı

```ts
type U={nickname?:string|null};
const u:U={nickname:null};
const {nickname='Guest'}=u;
console.log(nickname); // null
```

## Birikimli örnek

```ts
const u={settings:{theme:'dark'}};
const {settings}=u;
settings.theme='light';
console.log(u.settings.theme); // light
```

## Yaygın hata ve debugging

Object property sırası önemsizdir. Yeniden adlandırma `name: displayName` tip anotasyonu değildir. Default yalnız undefined için çalışır; nested referans paylaşılır.

## Pekiştirme

1. Her örneğin çıktısını kod çalıştırmadan açıkla.
2. Son örnekte bir input veya property değiştirerek yeni durum için sonucu öngör.
3. Yanlış varsayımı gösterecek negatif bir test senaryosu tarif et.

> **Kanıt:** Açıklamalar öğretim örnekleridir; gerçek repo çalıştırması ve bağımsız yeterlilik ayrı doğrulanır.
