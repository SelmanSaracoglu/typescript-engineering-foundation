# Reference Identity: Same Object ve New Object

**Önkoşullar:** [Bölüm 05 giriş](./README.md) · [Önceki](./01-objects-properties-arrays-elements.md) · [Sonraki](./03-mutation-side-effects-and-const.md)

## 1. Neden ihtiyaç duyuyoruz?
İki değişkenin aynı verileri taşıması, aynı object'e işaret etmesi demek değildir.

## 2. Tanım ve çalışma mekanizması
Object assignment var olan **reference identity**'yi yeni bir binding ile paylaşabilir. `===`, object'lerde içerik değil identity karşılaştırır. Ayrı object literal'leri aynı property değerlerine sahip olsa da referansları ayrıdır.

## 3. TypeScript örneği ve gerçek çıktı
```ts
const first = { name: "Ali", score: 80 };
const alias = first;
const separate = { name: "Ali", score: 80 };
console.log(first === alias);    // true
console.log(first === separate); // false
alias.score = 10;
console.log(first.score);        // 10
console.log(separate.score);     // 80
```

## 4. Bellek/veri akışı açıklaması
`first` Object A'ya işaret eder. `alias = first` ikinci bir object üretmez. `separate = {...}` yeni Object B oluşturur. `alias.score=10` Object A'nın state'ini değiştirir; B etkilenmez.

## 5. TypeScript type ile runtime reference ilişkisi
TypeScript `name:string; score:number` gibi shape'i kontrol eder ama iki expression'ın aynı object'e işaret edip etmediğini tip tanımından otomatik çıkarmak mümkün değildir.

## 6. Boundary ve kritik ayrımlar
Primitive assignment ve object reference paylaşımı farklıdır. `let n=10; let m=n; m=5` sonucunda `n` değişmez; object mutation'da paylaşılan nesne değişir.

## 7. Yaygın bug ve debugging doğrulaması
Beklenmeyen input değişikliğinde `result[0] === input[0]` gibi identity kontrolü düşün; Vitest'te `toBe` reference, `toEqual` structure sorusunu cevaplar.

## 8. Gerçekçi kullanım
Kayıt filtreleyen function, test fixture veya configuration dönüştüren kodda **kopyalama sözleşmesi** önemlidir. Sonucu kullanan kişinin mutasyonu input'u etkiliyorsa bunu tasarım kararı olarak kaydetmek gerekir.

## 9. Mülakat hazırlığı
*Are two identical object literals strictly equal?* No. Unless they share the same reference, their identities differ.

## 10. Pekiştirme: önce tahmin, sonra karşılaştırma
`first === separate` neden false? `alias` yeniden başka object'e atanmasaydı ilk object üzerindeki etkisi nedir?

## Kaynak ve kanıt notu
Özgün kaynak [I2 — Data Modeling](../../../I2-control-flow-functions-data-modeling.md). Bu kalıcı ders, history/evidence ve H0 düzeyinden bağımsızdır.
