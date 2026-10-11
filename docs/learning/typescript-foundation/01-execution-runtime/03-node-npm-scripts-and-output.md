# Node.js, npm, npx, Script ve Program Çıktısı

**Önkoşul:** [Bölüm 01 giriş](./README.md) · [Önceki ders](./02-type-runtime-logic-errors.md) · [Bölüm 02](../02-values-variables-basic-decisions/README.md)

## 1. Neden ihtiyaç duyuyoruz?
Yanlış komutu çalıştırmak uygulama sorununun nerede olduğunu gizler. Node, npm ve npx farklı sorumluluklar taşır.

## 2. Tanım ve zihinsel model
**Node.js** JavaScript runtime'ıdır. **npm** paket/dependency ve script çalıştırma aracıdır. **npx** paketlerin sunduğu komut satırı executable'larını çalıştırmayı kolaylaştırır. **Program output** yürütme sırasında gözlenen çıktı veya side effect'tir.

## 3. Küçük ve açıklamalı TypeScript örneği
```ts
// src/price.ts gibi bir dosyada:
function showPrice(price: number): void {
  console.log("Price:", price);
}
showPrice(120); // terminal: Price: 120
```

## 4. Execution flow: adım adım
`showPrice(120)` çağrılır; parameter `price=120` olur; `console.log` terminale yazar; `void`, bir iş değeri return edilmediğini belirtir. Program çıktısı üretilir ama runtime'ın bütünü değildir.

## 5. TypeScript ve repository ilişkisi
Bu repodaki komutlar: `npm run typecheck` (`tsc --noEmit`), `npm run build` (`tsc`), `npm run start` (`node dist/price.js`), `npm test` (`vitest run`). `npx tsc --version` derleyici sürümünü gösterir. Kullanılan scriptlerin tam karşılığı `package.json` içinde görülür.

## 6. Sınır davranışı ve kritik ayrım
`npm install` bağımlılıkları kurar, tek başına test yapmaz. `npm test` başarılı olsa bile yeni yazılmamış bir davranışın doğruluğuna ilişkin kanıt değildir.

## 7. Yaygın hata ve sistematik debugging
`npm run start` hedef JS dosyasını bulamıyorsa önce `dist/` çıktısını ve `npm run build` sonucunu kontrol et; kodun hesaplama formülünü rastgele değiştirme.

## 8. Gerçek kullanım
Yukarıdaki ayrım, test otomasyonu veya uygulama kodunda hatanın **hangi katmandan kaynaklandığını** belirlemek için kullanılır. Komutun yeşil olması ile istenen davranışın doğruluğunu birbirine karıştırma.

## 9. Mülakat hazırlığı
**How are Node and npm different?** Node executes JavaScript; npm manages dependencies and project scripts.

## 10. Pekiştirme — çalıştırmadan önce tahmin et
Bir hata için hangisini ilk seçersin: tür uyumsuzluğu → ?, JS dosyası üretilmiyor → ?, çalışıyor ama sonuç yanlış → ? Her seçimini gerekçelendir.

## 11. Kaynak ve kanıt notu
Kaynak: [I1 — Execution Model](../../../I1-execution-model.md). Bu bir **kalıcı öğretim dersi**dir; öğrenci uygulaması, test başarısı veya H0 kanıtı olarak yorumlanmaz.
