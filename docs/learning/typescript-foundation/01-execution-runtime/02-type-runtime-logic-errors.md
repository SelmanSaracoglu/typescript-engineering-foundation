# Type, Runtime ve Logic Hatalarını Ayırmak

**Önkoşul:** [Bölüm 01 giriş](./README.md) · [Önceki ders](./01-source-check-build-run.md) · [Sonraki ders](./03-node-npm-scripts-and-output.md)

## 1. Neden ihtiyaç duyuyoruz?
Üç farklı hata sınıfına aynı çözümü uygulamak debugging'i rastgele tahmine dönüştürür.

## 2. Tanım ve zihinsel model
**Type-check error** yazılan kodun tip sözleşmesiyle çatışmasıdır. **Runtime exception** çalışırken yürütmenin beklenmeyen şekilde kesilmesidir. **Logic bug** kodun çalışıp yanlış iş sonucu üretmesidir.

## 3. Küçük ve açıklamalı TypeScript örneği
```ts
// 1) Type error: number beklenirken string verilir.
// const age: number = "33";

// 2) Runtime error: yanlış JSON sözdizimi.
// JSON.parse("{broken}");

// 3) Logic bug: typecheck geçer ama sonuç yanlış.
function double(n: number): number {
  return n + 2; // double(4) -> 6; beklenen 8
}
console.log(double(4)); // 6
```

## 4. Execution flow: adım adım
İlk satır açıklama satırı olarak bırakılmıştır; açılırsa type-check hata üretir. İkinci satır da yorumdadır; çalıştırılırsa `SyntaxError` fırlatır. Üçüncü durum çalışır ve 6 üretir, fakat 'ikiyle çarp' gereksinimini ihlal eder.

## 5. TypeScript ve repository ilişkisi
TypeScript tüm runtime hatalarını önlemez; testler de kapsamadıkları iş kurallarını garanti etmez. **Typecheck → runtime → expected behavior** kontrolünü ayrı yürüt.

## 6. Sınır davranışı ve kritik ayrım
Bir runtime exception ile işlevin beklenen `error` result'ı birbirinden farklıdır. İkincisi 07 bölümünde ayrıntılanır.

## 7. Yaygın hata ve sistematik debugging
Hata mesajını, girdi değerini ve expected output'u ayrı yaz. Tek değişkenli deney yap: `double(0)`, `double(4)` karşılaştırmasını kullanıp `+2` yerine `*2` beklenip beklenmediğini gerekçelendir.

## 8. Gerçek kullanım
Yukarıdaki ayrım, test otomasyonu veya uygulama kodunda hatanın **hangi katmandan kaynaklandığını** belirlemek için kullanılır. Komutun yeşil olması ile istenen davranışın doğruluğunu birbirine karıştırma.

## 9. Mülakat hazırlığı
**Can code pass type checking and still be wrong?** Yes. Types cannot prove arbitrary business rules or guarantee safe external runtime inputs.

## 10. Pekiştirme — çalıştırmadan önce tahmin et
`JSON.parse('42')` örneğinde exception olur mu? Dönen değer object mi? Tahmin et, ardından JSON bölümünde nedenini doğrula.

## 11. Kaynak ve kanıt notu
Kaynak: [I1 — Execution Model](../../../I1-execution-model.md). Bu bir **kalıcı öğretim dersi**dir; öğrenci uygulaması, test başarısı veya H0 kanıtı olarak yorumlanmaz.
