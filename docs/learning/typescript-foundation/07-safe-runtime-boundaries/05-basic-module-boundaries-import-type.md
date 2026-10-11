# Temel Module Sınırı: export ve import type

**Önkoşul:** [Bölüm girişi](./README.md). Bu bölümdeki kavramlar önceki eğitim içeriğinin yeniden düzenlenmesidir; yeni framework veya ileri type/module kapsamı değildir.

## 1. Neden gerekiyor?
Model tanımı ile runtime validation farklı sorumluluklar taşıdığında farklı dosyalarda tutulabilir. Ancak dosyaları çoğaltmak başlı başına doğru mimari değildir.

## 2. Kavram ve sözleşme
`export type` başka module'ların compile-time model bilgisini kullanmasına izin verir; `import type` runtime değeri olmayan tür bağımlılığını açık gösterir. `export function` runtime'da çağrılacak fonksiyonu dışarı açar. Örnek **iki farklı dosyada** yer alacak biçimde etiketlenmiştir; tek bir `.ts` dosyası olarak birleştirilip çalıştırılmaz. TypeScript compile-time type bağımlılığı, gerçek runtime input'un shape'ini doğrulamaz; fonksiyonun kontrolleri bunu yapar.

## 3. Açıklamalı örnek
```ts
// src/product.ts
export type Product = { name: string; price: number };

// src/productValidation.ts
import type { Product } from "./product";

export function acceptsProduct(value: unknown): value is Product {
  return typeof value === "object" && value !== null &&
    !Array.isArray(value) &&
    "name" in value && typeof value.name === "string" &&
    "price" in value && typeof value.price === "number";
}
```

## 4. Davranış / sınır tablosu
| Kod | Amaç |
| --- | --- |
| `export type Product` | Type modelini paylaşmak |
| `import type { Product }` | Derleme zamanı type bağımlılığı |
| `export function acceptsProduct` | Runtime'da çağrılacak doğrulama davranışı |

## 5. Hata araştırma ve doğrulama
Yanlış yaklaşım: `import type` yaptıktan sonra dış input'un otomatik Product olduğunu sanmak. `as Product` veya dosya ayırma runtime kontrolün yerine geçmez. Bu örnekte `unknown` doğrulama sınırını korur.

## 6. Öğretici pratik
**Önce çalıştırmadan tahmin et:** `import type` çalışma anında Product instance'ı üretir mi? `export type` kullanırken validation neden hâlâ gereklidir?

## 7. Kariyer aktarımı
Bu mekanizma uygulama kodu, test otomasyonu ve güvenli veri işleme çalışmalarında aynı temel prensibi korur: beklenen davranış, gerçek runtime değer ve doğrulama kanıtını ayrı tutmak.

## 8. Interview preparation
**Question:** What evidence would distinguish a working example from a verified requirement?  
**Answer:** A requirement-derived expected outcome, appropriate boundary or negative test, and observed behavior after execution.

## 9. Kaynak ve kanıt ayrımı
[İlk çalışma belgesi](../../../I3-safe-types-runtime-boundaries.md) tarihsel bağlamı korur. Buradaki örnek H0 bağımsızlık/competency kanıtı değildir.
