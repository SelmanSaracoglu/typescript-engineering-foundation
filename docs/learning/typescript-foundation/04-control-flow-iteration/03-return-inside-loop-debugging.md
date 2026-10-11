# Early Return ve Loop İçindeki return Bug'ı

**Önkoşullar:** [Functions ve return](../03-functions-fundamentals/README.md), [Bölüm 04 giriş](./README.md). [Önceki](./02-for-of-iteration-over-arrays.md) [Bölüm 05](../05-objects-arrays-references/README.md)

## 1. Neden bu derse ihtiyacımız var?
I2'de gözlenen kritik kusur, birinci kayıt işlendiğinde fonksiyonun tamamının bitmesiydi. Bu bir syntax hatası değil, execution flow hatasıdır.

## 2. Tanım ve mekanizma
`return`, içinde bulunduğu function çağrısını sonlandırır; yalnız `if` veya `for` block'undan çıkmaz. `break` yalnız döngüyü bitirir; `continue` sonraki iteration'a geçer. Bu derste temel vurgu `return`'ün yeri.

## 3. Açıklamalı, çalıştırılabilir örnek
```ts
function firstQualified(names: string[]): string[] {
  const output: string[] = [];
  for (const name of names) {
    output.push(name);
    return output; // BUG: ilk kayıttan sonra döner
  }
  return output;
}
console.log(firstQualified(["Ali", "Can"])); // ["Ali"]

function allNames(names: string[]): string[] {
  const output: string[] = [];
  for (const name of names) {
    output.push(name);
  }
  return output;
}
console.log(allNames(["Ali", "Can"])); // ["Ali", "Can"]
```

## 4. Veri/çalıştırma akışı
Hatalı sürüm: Ali ile iteration başlar; push sonrası return çalışır; `Can` iteration'ına **asla girilmez**. Düzeltilmiş sürüm: Ali sonra Can eklenir; return loop kapandıktan sonra yürür. İki fonksiyon da typecheck'ten geçer; type checker burada gereksinim doğruluğunu bilemez.

## 5. Önceki konularla fark ve TypeScript bağlantısı
Bazı gereksinimler ilk eşleşmeyi bulmayı ister; o durumda loop içinde return **doğru** olabilir. Ancak 'tüm uygun kayıtlar' gereksinimi için bu bug'dır. Dolayısıyla aynı sözdiziminin doğru/yanlış olması iş sözleşmesine bağlıdır.

## 6. Sınır durumları, hata ve test tasarımı
**Tekrarlanabilir debugging:** (1) iki uygun kayıt ver, (2) expected `[Ali,Can]` yaz, (3) actual `[Ali]` gözle, (4) loop iteration sayısına hipotez kur, (5) return satırını debugger ile izle, (6) return'ü döngü sonuna taşı, (7) aynı girdi ve boş girdiyle regresyonu doğrula. Sadece tek kayıtla test bug'ı gizler.

## 7. Mülakat ve pekiştirme
**Question:** How can a loop silently omit valid records? A misplaced early return may terminate the function before the remaining iterations.

`names=[]` için iki function ne döndürür? Bu senaryo bug'ı neden yakalayamaz? `return` ile `break` niçin aynı şey değil?

## 8. Kanıt ve kaynak
Özgün I2 içerik kaynağı: [I2 Control Flow, Functions & Data Modeling](../../../I2-control-flow-functions-data-modeling.md). Bu ders yeni bir Increment uygulaması veya H0 yeterlilik gözlemi değildir.
