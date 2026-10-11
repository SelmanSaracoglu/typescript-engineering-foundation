# Source, Type Checking, Build ve Runtime

**Önkoşul:** [Bölüm 01 giriş](./README.md) · [Bölüm dizini](./README.md) · [Sonraki ders](./02-type-runtime-logic-errors.md)

## 1. Neden ihtiyaç duyuyoruz?
TypeScript dosyasının çalıştırılabilir JavaScript ile aynı şey olmadığını anlamadan type hatasını runtime hatası sanmak kolaydır. Bir dosyada tip doğruyken iş kuralı yanlış olabilir.

## 2. Tanım ve zihinsel model
**Source** geliştiricinin yazdığı `.ts` dosyasıdır. **Type checking** statik tür tutarlılığını denetler. **Emitted JavaScript** build çıktısıdır. **Runtime**, Node.js'in JavaScript ifadelerini çalıştırdığı aşamadır; **output** bu yürütmenin gözlenebilir sonucudur.

## 3. Küçük ve açıklamalı TypeScript örneği
```ts
const basePrice: number = 100;
function total(price: number): number {
  return price + 20;
}
console.log(total(basePrice)); // 120
```

## 4. Execution flow: adım adım
1. `basePrice` runtime'da `100` taşır. 2. TypeScript `number` annotation'ı kontrol eder. 3. JavaScript çıktısından bu annotation çıkarılır. 4. Node `total(100)` çağrısını değerlendirir; `120` yazılır. Type annotation çalışma anında değer kontrolü yapmaz.

## 5. TypeScript ve repository ilişkisi
`npm run typecheck` → `tsc --noEmit` yalnız kontrol eder. `npm run build` → `tsc` çıktı üretir. Sonrasında `npm run start` → `node dist/price.js` çalışır. `build`, runtime'da iş kurallarının doğru olduğunu kanıtlamaz.

## 6. Sınır davranışı ve kritik ayrım
Bir `.ts` dosyasını Node'a göndermek ile oluşturulmuş `.js` dosyasını Node'da çalıştırmak aynı sözleşme değildir. Repo'nun aktif araç zinciri ve `package.json` scriptleri esas alınır.

## 7. Yaygın hata ve sistematik debugging
`price + 20` beklenen indirim değilse typecheck yeşil olsa bile logic bug vardır. Önce beklenen davranışı yaz, ardından gerçek input ve return değerini karşılaştır.

## 8. Gerçek kullanım
Yukarıdaki ayrım, test otomasyonu veya uygulama kodunda hatanın **hangi katmandan kaynaklandığını** belirlemek için kullanılır. Komutun yeşil olması ile istenen davranışın doğruluğunu birbirine karıştırma.

## 9. Mülakat hazırlığı
**What happens to TypeScript types at runtime?** Type annotations are checked before execution and are not present as runtime validators in emitted JavaScript.

## 10. Pekiştirme — çalıştırmadan önce tahmin et
`total(0)` ve `total(-10)` sonuçlarını tahmin et. Başarılı build'in bu sonuçların iş kurallarına uygunluğunu neden kanıtlamadığını açıkla.

## 11. Kaynak ve kanıt notu
Kaynak: [I1 — Execution Model](../../../I1-execution-model.md). Bu bir **kalıcı öğretim dersi**dir; öğrenci uygulaması, test başarısı veya H0 kanıtı olarak yorumlanmaz.
