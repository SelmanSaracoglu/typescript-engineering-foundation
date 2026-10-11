# Mutation, Side Effect ve const Yanılgısı

**Önkoşullar:** [Bölüm 05 giriş](./README.md) · [Önceki](./02-reference-identity-and-aliases.md) · [Sonraki](./04-new-array-versus-new-elements.md)

## 1. Neden ihtiyaç duyuyoruz?
Fonksiyonun sadece döndürdüğü sonucu görmek, dışarıdaki veriyi istemeden değiştirdiğini gizleyebilir.

## 2. Tanım ve çalışma mekanizması
**Mutation**, mevcut nesne/array state'inin değiştirilmesidir. **Side effect**, fonksiyonun normal return dışında gözlenebilir dış etki üretmesidir. `const` binding'in yeniden atanmasını engeller, object içeriğini dondurmaz.

## 3. TypeScript örneği ve gerçek çıktı
```ts
type Account = { enabled: boolean };
function disable(account: Account): void {
  account.enabled = false; // input object mutate edilir
}
const account: Account = { enabled: true };
disable(account);
console.log(account.enabled); // false
```

## 4. Bellek/veri akışı açıklaması
Caller `Account Object A` yaratır. Function parameter'ı aynı object'e referans alır. Body `enabled=false` yapar. `void` function'ın iş değeri döndürmemesini ifade eder; ancak caller'ın object'i değişmiştir.

## 5. TypeScript type ile runtime reference ilişkisi
`readonly` property TypeScript düzeyinde değişikliği sınırlandırabilir ama tek başına runtime deep-freeze sağlamaz. Bu başlangıç dersi runtime mutation etkisine odaklanır.

## 6. Boundary ve kritik ayrımlar
Mutation her durumda yasak değildir. Bilinçli mutating API'ler bulunabilir; önemli olan contract'ın açık olmasıdır. `const account` satırının ardından `account={...}` yazmak farklı bir hatadır.

## 7. Yaygın bug ve debugging doğrulaması
Fonksiyonun beklenen çıktısı doğru olsa da input'a ait alanların önce/sonra değerlerini karşılaştır. Side effect'in sözleşmeyle uyumlu olup olmadığını tanımla.

## 8. Gerçekçi kullanım
Kayıt filtreleyen function, test fixture veya configuration dönüştüren kodda **kopyalama sözleşmesi** önemlidir. Sonucu kullanan kişinin mutasyonu input'u etkiliyorsa bunu tasarım kararı olarak kaydetmek gerekir.

## 9. Mülakat hazırlığı
*Does a void function necessarily have no effect?* No; it can mutate input state or produce other observable effects.

## 10. Pekiştirme: önce tahmin, sonra karşılaştırma
`disable(account)` çağrısından sonra caller'ın object'i neden değişti? `const` bunu niye engellemedi?

## Kaynak ve kanıt notu
Özgün kaynak [I2 — Data Modeling](../../../I2-control-flow-functions-data-modeling.md). Bu kalıcı ders, history/evidence ve H0 düzeyinden bağımsızdır.
