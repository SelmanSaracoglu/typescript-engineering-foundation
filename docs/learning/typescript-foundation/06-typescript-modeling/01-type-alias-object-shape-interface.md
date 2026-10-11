# type, interface ve Object Shape

**Önkoşul:** [TypeScript modelleme bölümü](./README.md) · [Bölüm 05](../05-objects-arrays-references/README.md) · [Sonraki](./02-optional-undefined-null.md)

## 1. Neden ihtiyaç duyuyoruz?
Bir array'deki kaydın hangi property'leri taşıdığını açık modellemeden, bir fonksiyonun giriş/çıkış sözleşmesi okunamaz.

## 2. Tanım ve mekanizma
`type` mevcut bir veri modeline isim verir; `interface` object shape gibi sözleşmeleri tarif edebilir. Bu aşamada amaç iki sözdizimini yarıştırmak değil, verilen object'in **hangi alanları hangi tiplerde** taşımasının beklendiğini anlamaktır.

## 3. Açıklamalı kod ve çıktı
```ts
type User = { name: string; score: number; active: boolean };
interface UserInfo { name: string; score: number; active: boolean }

function describe(user: User): string {
  return user.active ? user.name : "inactive";
}
const ali: User = { name: "Ali", score: 80, active: true };
const info: UserInfo = ali;
console.log(describe(info)); // Ali
```

## 4. Execution ve veri akışı
`ali` object'i üç property içerir. Type checker alanların isim ve türlerini kontrol eder. TypeScript structurally typed olduğundan `UserInfo` ve `User` aynı gerekli shape'i tanımlar ve örnekte birbirleriyle kullanılabilir.

## 5. TypeScript compile-time ile runtime ayrımı
Tipin adı runtime object'e yeni property eklemez ve doğrulama yapmaz. `type` union/primitive gibi biçimleri de modelleyebilir; `interface`in ana başlangıç kullanım alanı object contract'tır. Derin farklar bu dersin hedefi değildir.

## 6. Sınır davranışları ve kritik farklar
`User[]` bir `User` object'i değil, User elementlerinden oluşan array beklenmesi demektir. TypeScript object'i runtime'da zorla dönüştürmez; dış veri kontrolü Bölüm 07'dedir.

## 7. Yaygın yanlış kullanım / debugging
'Property missing' hatası gördüğünde öncelikle modelin hangi alanı zorunlu tuttuğuna ve caller'ın o alanı gerçekten sunduğuna bak. `as User` ile kontrolü susturmak veri üretmez.

## 8. Gerçek kullanım
Uygulamanın model bekleyen iç fonksiyonları ve dışarıdan veri alan sınır fonksiyonları aynı güven seviyesinde değildir. Compile-time shape bilgisi faydalıdır fakat runtime'daki gerçek değeri anlamak için kontrol gerekir.

## 9. Interview preparation
*Does a TypeScript type create a runtime object?* No; it describes a compile-time expectation, not a runtime constructor or validator.

## 10. Bağımsız pekiştirme
`score` alanı eksik object örneğinin neden typecheck'ten geçmemesi gerektiğini açıkla. `User[]` ile `User` arasındaki farkı iki kayıtla göster.

**Kaynak:** [I2](../../../I2-control-flow-functions-data-modeling.md) ve [I3](../../../I3-safe-types-runtime-boundaries.md). Eğitim içeriği bağımsız öğrenci uygulama/H0 kanıtı değildir.
