# Object, Property, Array ve Element Modeli

**Önkoşullar:** [Bölüm 05 giriş](./README.md) · [Bölüm 04](../04-control-flow-iteration/README.md) · [Sonraki](./02-reference-identity-and-aliases.md)

## 1. Neden ihtiyaç duyuyoruz?
Array ile onun içindeki object'i karıştırırsak input/output sözleşmesini ve test verisini yanlış kurarız.

## 2. Tanım ve çalışma mekanizması
**Object** key/property taşıyan değer; **array** sıralı collection'dır. Array'in kendisi de JavaScript'te özel bir object türüdür, ancak öğrenirken **container** ve **element** sorumluluğunu ayrı düşünürüz.

## 3. TypeScript örneği ve gerçek çıktı
```ts
type User = { name: string; score: number };
const users: User[] = [
  { name: "Ali", score: 80 },
  { name: "Ece", score: 45 }
];
console.log(users.length);  // 2
console.log(users[0].name); // "Ali"
console.log(users[1].score); // 45
console.log([]);            // []
console.log([{}]);          // [{}]
```

## 4. Bellek/veri akışı açıklaması
`users.length` element sayısıdır; ilk elementin index'i 0'dır. `users[0]` kayıt object'ini verir; `.name` bu kayıttaki property'dir. `[]` sıfır element, `[{}]` tek boş object element içerir.

## 5. TypeScript type ile runtime reference ilişkisi
`User` object shape'ini açıklar, `User[]` ise tüm elementlerin beklenen shape'ini modeller. Runtime'da JavaScript array'inin başka tipleri içermediğini sırf bu annotation garantilemez.

## 6. Boundary ve kritik ayrımlar
Yanlış index `users[2]` runtime'da `undefined` verebilir; oradan `.name` okumak hataya yol açabilir. TypeScript konfigürasyonuna bağlı olarak index kontrolünü ayrıca ele almak gerekebilir.

## 7. Yaygın bug ve debugging doğrulaması
Bir elemanın tamamen atlandığı senaryoda expected `[]` olmalı; `[{}]` farklı bir yapıyı doğrular. Yanlış nested property yerine doğru container/element ayrımını yap.

## 8. Gerçekçi kullanım
Kayıt filtreleyen function, test fixture veya configuration dönüştüren kodda **kopyalama sözleşmesi** önemlidir. Sonucu kullanan kişinin mutasyonu input'u etkiliyorsa bunu tasarım kararı olarak kaydetmek gerekir.

## 9. Mülakat hazırlığı
*How do arrays and object records relate?* An array stores ordered elements, which may themselves be objects with properties.

## 10. Pekiştirme: önce tahmin, sonra karşılaştırma
`users[0]`, `users[0].score` ve `users.length` hangi tür sonuçları verir? `[]` ile `[{}]` niçin eşit değildir?

## Kaynak ve kanıt notu
Özgün kaynak [I2 — Data Modeling](../../../I2-control-flow-functions-data-modeling.md). Bu kalıcı ders, history/evidence ve H0 düzeyinden bağımsızdır.
