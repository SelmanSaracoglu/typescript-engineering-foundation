# for...of ve Çok Kayıtlı Iteration

**Önkoşullar:** [Functions ve return](../03-functions-fundamentals/README.md), [Bölüm 04 giriş](./README.md). [Önceki](./01-conditions-multiple-branches.md) [Sonraki](./03-return-inside-loop-debugging.md)

## 1. Neden bu derse ihtiyacımız var?
Bir function birçok kaydı işlerken değişkenin her iteration'da hangi elemana bağlandığını açıklamak gerekir. Bir kayıt üzerinden çalışan kod çok kayıtlı veride hatalı olabilir.

## 2. Tanım ve mekanizma
Array birden fazla element taşır. `for...of` her iteration'da element **değerini** verir; `for...in` ise anahtar/index odaklı farklı bir yapıdır. Burada günlük basit iteration için `for...of` kullanılır.

## 3. Açıklamalı, çalıştırılabilir örnek
```ts
type User = { name: string; active: boolean; score: number };
function names(users: User[]): string[] {
  const result: string[] = [];
  for (const user of users) {
    if (user.active && user.score >= 60) {
      result.push(user.name);
    }
  }
  return result;
}
const users: User[] = [
  { name: "Ali", active: true, score: 80 },
  { name: "Ece", active: false, score: 90 },
  { name: "Can", active: true, score: 60 }
];
console.log(names(users)); // ["Ali", "Can"]
```

## 4. Veri/çalıştırma akışı
Array üç element içerir. 1. iteration `user=Ali`, condition true, `Ali` eklenir. 2. iteration `user=Ece`, active=false, eklenmez. 3. iteration `user=Can`, iki koşul doğru, `Can` eklenir. Ancak loop bittikten sonra `result` döner.

## 5. Önceki konularla fark ve TypeScript bağlantısı
`for...of` üzerinden tekrar edilen her object hâlâ input array'deki element reference'ıdır. Function yalnız `user.name` string'ini taşıdığı için output'ta object paylaşımı yoktur. Object'leri `push(user)` ile taşısaydı [05](../05-objects-arrays-references/README.md)'teki identity ayrımı devreye girer.

## 6. Sınır durumları, hata ve test tasarımı
Boş `users=[]` için loop body hiç çalışmaz ve `[]` döner. `score=59` ile 60 sınırı ayır. `return`'ün yeri hata oluşturabilir; [sonraki derste](./03-return-inside-loop-debugging.md) ayrıntı.

## 7. Mülakat ve pekiştirme
**Question:** How can a loop silently omit valid records? A misplaced early return may terminate the function before the remaining iterations.

Üç elementin iteration sırasını, `result` değerinin her adımdaki hâlini tabloya yaz. Can 59 olsaydı ne değişirdi?

## 8. Kanıt ve kaynak
Özgün I2 içerik kaynağı: [I2 Control Flow, Functions & Data Modeling](../../../I2-control-flow-functions-data-modeling.md). Bu ders yeni bir Increment uygulaması veya H0 yeterlilik gözlemi değildir.
