# Karşılaştırmalar ve if/else ile Temel Karar Akışı

**Önkoşul:** [Bu bölümün zihinsel modeli](./README.md) · [Önceki](./02-const-let-assignment-and-expressions.md) · [Bölüm 03](../03-functions-fundamentals/README.md)

## 1. Bu konu neden gerekli?
Kod koşula girmiyorsa önce kullanılan condition expression'ının doğruluğunu çözmek gerekir.

## 2. Tanım
`if` boolean bağlamda değerlendirilen condition'a göre bir block seçer. `else` condition sağlanmadığında alternatif yoldur. `>=`, `>`, `<`, `<=` temel sayısal karşılaştırmalardır; `===` ayrıntısı 08'de işlenir.

## 3. Açıklamalı kod
```ts
function level(score: number): string {
  if (score >= 60) {
    return "passed";
  } else {
    return "failed";
  }
}
console.log(level(59)); // "failed"
console.log(level(60)); // "passed"
console.log(level(61)); // "passed"
```

## 4. Adım adım execution/data flow
Fonksiyonun parameter'ı sırayla 59, 60, 61 olur. 59 için `>= 60` false, diğerleri true; seçilen branch `return` ile function'ı bitirir. Tam 60 exact boundary'dir.

## 5. TypeScript ile ilişkisi
`score: number` beklenen türü belirtir ama business threshold'u doğrulamaz. Doğru sınır davranışı için test koşullarını uygulamadan değil gereksinimden türetmek gerekir.

## 6. Sınır davranışı ve karıştırılan ayrımlar
Yanlışlıkla `>` kullanmak 60 değerini dışarıda bırakır. `score` dışarıdan geliyorsa 61 yerine `'61'` gelebilir; TypeScript annotation dış veriyi runtime'da kontrol etmez.

## 7. Hata araştırma ve gerçek kullanım
Bir sınır testini (`59`, `60`, `61`) karşılaştırma hatasına özel tasarla. Eğer 60 yanlış sınıflandırılıyorsa önce operator'ı incele; uzun kodun diğer bölümlerini değiştirme.

## 8. Interview preparation
*Why do boundary tests matter in comparisons?* They distinguish inclusive from exclusive thresholds, such as `>=` versus `>`.

## 9. Pekiştirme
Yeni kural '80 ve üzeri başarılı' olsun. 79, 80, 81 için beklenen sonucu kod yazmadan tabloya yerleştir; yanlış operatörün hangi testi bozacağını açıkla.

## 10. Tarih ve kanıt ayrımı
Kaynak kavramlar: [I1](../../../I1-execution-model.md), [I2](../../../I2-control-flow-functions-data-modeling.md). Öğretim örneği H0/uygulama başarısı sayılmaz.
