# Yeni Array ≠ Yeni Element Object: Copy Sınırı

**Önkoşullar:** [Bölüm 05 giriş](./README.md) · [Önceki](./03-mutation-side-effects-and-const.md) · [Bölüm 06](../06-typescript-modeling/README.md)

## 1. Neden ihtiyaç duyuyoruz?
I2'nin kritik ayrımı: birden fazla array farklı olsa bile aynı object elementlerini paylaşabilir. Bu fark sonraki spread syntax ve shallow copy derslerinin önkoşuludur.

## 2. Tanım ve çalışma mekanizması
Yeni collection oluşturmak **outer array identity**'sini değiştirir. Ancak içine `push(user)` ile eklenen `user` hâlâ aynı object'tir. Yeni object literal ile property'leri yeniden kurmak (örnek düz modelde) bağımsız object üretir.

## 3. TypeScript örneği ve gerçek çıktı
```ts
type User = { name: string; score: number };
const input: User[] = [{ name: "Ali", score: 80 }];
const shared: User[] = [];
shared.push(input[0]);
const copied: User[] = [];
copied.push({ name: input[0].name, score: input[0].score });

console.log(shared === input);       // false
console.log(shared[0] === input[0]); // true
console.log(copied[0] === input[0]); // false
shared[0].score = 10;
console.log(input[0].score);         // 10
console.log(copied[0].score);        // 80
```

## 4. Bellek/veri akışı açıklaması
`shared` ayrı array'dir; fakat push edilen input[0] ortak Object A'dır. `copied` ayrı array'e ayrıca Object B üretir. A üzerindeki mutation B'ye geçmez; B'deki primitive `score` kopya anındaki 80'dir.

## 5. TypeScript type ile runtime reference ilişkisi
`User[]` iki array'in de elementlerinin yapısını kontrol eder; **reference isolation** contract'ını garanti etmez. Bunun için kod davranışı ve test gerekir.

## 6. Boundary ve kritik ayrımlar
Bu yeni object örneğinde property'ler primitive olduğu için element izolasyonu sağlanır. Nested object varsa `{ ...user }` bile shallow copy yapar, iç referansları paylaşabilir: [09 spread](../09-modern-object-array-syntax/03-spread.md).

## 7. Yaygın bug ve debugging doğrulaması
Vitest'te `expect(out).not.toBe(input)` tek başına element izolasyonunu kanıtlamaz. `expect(out[0]).not.toBe(input[0])` ve gerekirse mutation sonrası input testi yaz. Array copy ile element copy'yi ayrı doğrula.

## 8. Gerçekçi kullanım
Kayıt filtreleyen function, test fixture veya configuration dönüştüren kodda **kopyalama sözleşmesi** önemlidir. Sonucu kullanan kişinin mutasyonu input'u etkiliyorsa bunu tasarım kararı olarak kaydetmek gerekir.

## 9. Mülakat hazırlığı
*Why can a new result array still mutate the input?* Because the new array may hold references to the original element objects.

## 10. Pekiştirme: önce tahmin, sonra karşılaştırma
`shared[0].name = 'Can'` sonrası input[0].name ne olur? `copied[0]` etkilenir mi? Nested `address` olsa ek kontrol gerekir mi?

## Kaynak ve kanıt notu
Özgün kaynak [I2 — Data Modeling](../../../I2-control-flow-functions-data-modeling.md). Bu kalıcı ders, history/evidence ve H0 düzeyinden bağımsızdır.
