# Ders 1 — TypeScript Source, Type Checking, Build ve JavaScript Runtime

## 1. Neden bu konuyu öğreniyoruz?

Bir test otomasyonunda `npm test` çalıştırdığını düşün. Kırmızı bir hata gördün. Sorun TypeScript tipinde mi, derlenen dosyada mı, çalıştırılan programda mı, yoksa testin beklediği davranışta mı? Bunlar **ayrı sorular**.

Önce şu iki satırı karşılaştıralım:

```ts
const price: number = 100;
console.log(price + 20); // 120
```

Burada `price` çalışan programda 100 değerini taşır. `: number` ise TypeScript'in kodu analiz ederken kullandığı bilgidir. Node.js çalışan JavaScript'te bir `number` annotation'ı okumaz; o annotation derleme sırasında kaldırılır.

**Ana ayrım:** TypeScript'in tip kontrolü, programın yürütülmesi ve terminal çıktısı **aynı olay değildir**.

## 2. Önce beş kavramı tanımla

| Kavram | Ne demek? | Ne demek değil? |
| --- | --- | --- |
| **Source code** | Geliştiricinin yazdığı `.ts` kaynak kodu | Derlenmiş `.js` dosyası |
| **Type checking** | Statik tip ilişkilerinin kontrol edilmesi | Gerçek dış girdinin doğrulanması |
| **Build / transpilation** | Kaynağın çalıştırılabilir JavaScript biçimine dönüştürülmesi | İş kuralının doğruluğunu kanıtlama |
| **Runtime** | Node.js'in JavaScript kodunu yürütmesi | Yalnız terminalde yazı görünmesi |
| **Output** | Çalışmanın gözlenebilir sonucu (ör. terminal çıktısı) | Programın tüm yürütme süreci |

**Compiler (derleyici)** burada TypeScript araç zincirinin `tsc` programıdır. **Node.js** ise derlenen JavaScript'i yürüten runtime'dır.

Basitleştirilmiş zihinsel model:

```text
    price.ts  (TypeScript source)
        |
        +---- tsc --noEmit ----> TypeScript tanılama / hata raporu
        |
        +---- tsc -----------> price.js  (JavaScript output)
                                   |
                                   v
                            Node.js runtime
                                   |
                                   v
                         gözlenebilir davranış
```

Bu şema bir öğrenme modelidir: `typecheck` ve `build` **ayrı komutlarla** çağrılır. Her build'den önce ayrı bir `typecheck` komutu çalıştırılması teknik bir zorunluluk değildir; TypeScript compiler'ın kendi kontrol ve emit davranışı yapılandırmaya bağlıdır.

## 3. Kod satırını tek tek okuyalım

```ts
function addFee(price: number): number {
  const fee = 20;
  const result = price + fee;
  return result;
}

const finalPrice = addFee(100);
console.log(finalPrice); // 120
```

- `function addFee`: Çağrılabilir bir davranış tanımı.
- `price: number`: Fonksiyonun **parameter** adı ve statik tip beklentisi.
- `const fee = 20`: Yerel, tekrar atanamayan binding.
- `price + fee`: Runtime'da hesaplanan expression.
- `return result`: Fonksiyon çağrısını sonlandırır ve sonucu caller'a verir.
- `addFee(100)`: `100` gerçek **argument** değeridir.
- `console.log(finalPrice)`: Hesaplamanın gözlenebilir terminal çıktısı.

**Adım adım execution trace**

| Adım | Runtime işlemi | Değer / sonuç |
| --- | --- | --- |
| 1 | Fonksiyon tanımı kullanılabilir hâle gelir | Henüz `addFee` çağrılmadı |
| 2 | `addFee(100)` çağrısı yapılır | `price = 100` |
| 3 | `fee` oluşturulur | `fee = 20` |
| 4 | Toplama expression'ı değerlendirilir | `result = 120` |
| 5 | `return result` | `120` caller'a döner |
| 6 | `finalPrice` oluşturulur | `120` |
| 7 | `console.log` çalışır | Terminalde `120` görünür |

Fonksiyonun gövdesi yalnız **tanımlandığı için** çağrılmış sayılmaz. Bu distinction ileride test edilen function'ları okurken önemlidir.

## 4. Derlenmiş JavaScript'te ne değişir?

Şu TypeScript'i göz önüne al:

```ts
function addFee(price: number): number {
  return price + 20;
}
console.log(addFee(100));
```

Type annotation'ları çıkarıldığında JavaScript'in **kavramsal** karşılığı:

```js
function addFee(price) {
  return price + 20;
}
console.log(addFee(100));
```

İki parçanın runtime hesabı aynı: `100 + 20 = 120`.

Bu gösterim derleyicinin ürettiği dosyanın karakter karakter kopyası değildir. Gerçek JavaScript çıktısına `target`, `module`, `use strict` veya export mekanizması gibi derleyici seçenekleri etki eder. Önemli olan `: number` bilgisinin **runtime'da bir doğrulama ifadesine dönüşmemesidir**.

**Önemli:** Bir değişkeni `number` ilan etmek, dışarıdan gelen `"100"` string'ini çalışma sırasında otomatik olarak sayıya çevirmez.

## 5. Bu repository gerçekten nasıl yapılandırılmış?

Aşağıdaki bilgiler bu projenin mevcut `package.json` ve `tsconfig.json` içeriğine dayanır:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc",
    "start": "node dist/price.js",
    "test": "vitest run"
  }
}
```

Compiler ayarlarından seçilmiş bölüm:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"]
}
```

Bunun anlamı:

1. `src/` içindeki TypeScript dosyaları derlemenin kaynak kümesine girer.
2. `strict: true` daha sıkı statik kontroller açar.
3. `module: "CommonJS"` bu projede modül çıktısının biçimini etkiler; Node'un çalışma modeli sonraki module/toolchain Epic'inde derinleştirilir.
4. `outDir: "./dist"` çıktının `dist/` altına yazılmasını söyler.
5. `tsc --noEmit` JavaScript dosyası üretmeden tanılama yapar; `tsc` ise build komutudur.

**Önemli sınırlama:** `noEmitOnError` gibi compiler seçeneklerine bağlı olarak bazı type hatalarına rağmen JavaScript output üretilebilir. `tsc`'nin bir hata raporlaması ile `dist/` klasöründe dosya bulunması aynı kontrol değildir. Bu projede tip kontrolünü ayrı komutla yapmak bunu gözlemlemeyi kolaylaştırır.

## 6. Gerçek repodaki `src/price.ts` davranışı

Bu dosyada `calculateFinalPrice` adlı **export edilen** bir fonksiyon bulunuyor. Kuralı: indirim açıksa 20 çıkar; sonuç negatif olacaksa 0 döndür; indirim kapalıysa fiyatı koru.

```ts
export function calculateFinalPrice(
  price: number,
  hasDiscount: boolean
): number {
  if (hasDiscount) {
    if (price - 20 < 0) {
      return 0;
    }
    return price - 20;
  }
  return price;
}
```

**Dikkat:** Mevcut `src/price.ts` dosyası kendi başına `console.log` çağırmıyor. Bu nedenle `npm run start` ile `dist/price.js` çalıştırıldığında terminale fiyat yazılmasını **beklememeliyiz**. Fonksiyonun export edilmesi, otomatik çağrıldığı anlamına gelmez.

Build sonrasında, **repo dosyası değiştirmeden** fonksiyonu çağırma örneği:

```bash
npm run build
node -e "const { calculateFinalPrice } = require('./dist/price.js'); console.log(calculateFinalPrice(100, true));"
```

Beklenen sonuç `80` olur; bu burada tarif edilen **beklentidir**, bu metni yazarken bağlı GitHub ortamında komutların çalıştırıldığı iddiası değildir.

Bu örnek hem execution modelini hem **export edilen davranış** ile **otomatik çalışan script** farkını gösterir.

## 7. Test, build ve runtime hangi soruları ayrı yanıtlar?

| Kontrol | Ölçtüğü şey | Tek başına kanıtlamadığı şey |
| --- | --- | --- |
| `npm run typecheck` | Kaynak tip kurallarına uyuyor mu? | İndirim kuralı doğru mu? |
| `npm run build` | JS üretimi/derleme aşaması nasıl sonuçlandı? | Kod çağrıldığında doğru sonucu veriyor mu? |
| `npm run start` | Seçilen JS dosyası çalışıyor mu? | Export edilmiş tüm fonksiyonlar test edildi mi? |
| `npm test` | Yazılmış Vitest testleri geçiyor mu? | Test edilmemiş bütün edge case'ler doğru mu? |

SDET mühendisliğinde `test passed` ifadesini yalnız **mevcut testlerin kontrol ettiği davranışlar** için kullanırız.

## 8. Hata araştırma: yanlış katmanı düzeltme

**Belirti A:** `npm run typecheck` bir tür uyumsuzluğu bildiriyor.  
Önce hata dosyası/satırı ile actual ve expected type'ı karşılaştır. `src/` kodunun iş kuralını rastgele yeniden yazma.

**Belirti B:** `node dist/price.js` çalışıyor ancak terminal boş.  
Hipotez: `src/price.ts` yalnız export yapıyor ve `console.log` yok. Kanıt: kaynak dosyaya bak; giriş noktası ve çağrının mevcut olup olmadığını kontrol et. Boş terminal otomatik olarak hata değildir.

**Belirti C:** `calculateFinalPrice(19, true)` sonucu `-1`.  
Bu bir business logic kusuru olurdu; gereksinim gereği negatif değer engellenmelidir. Typecheck'in yeşil olması bu davranışı doğrulamaz. Sınır testiyle `0` beklentisini açıkla.

**Kontrollü debugging sırası:** Belirti → beklenen davranış → hangi aşama? → tek hipotez → ilgili komut/gözlem → tek düzeltme → tekrar doğrulama.

## 9. Sık karıştırılan kavramlar

- **Transpilation = test** değil: JavaScript üretilmesi iş beklentisini onaylamaz.
- **Type = runtime value** değil: Annotation derlemede kaldırılır.
- **Runtime = output** değil: Kod çıktı yazmadan başarılı şekilde çalışabilir.
- **Function definition = function invocation** değil: Export tek başına çağrı değildir.
- **`typecheck` = `build`** değil: Bu projede birincisi `--noEmit` kullanıyor.

## 10. Mülakat hazırlığı

**Question: What is the difference between type checking, compilation and runtime execution?**

> Type checking verifies TypeScript's static type rules. Compilation emits JavaScript according to the compiler configuration. Runtime execution evaluates that JavaScript and produces observable behavior. None of these stages by itself proves that the business requirement is correct.

**Türkçe karşılığı:** Type checking statik tür kurallarını kontrol eder. Build derleyici ayarlarına göre JavaScript üretir. Runtime JavaScript'i çalıştırır ve davranış oluşturur. Bunların hiçbiri tek başına iş gereksiniminin doğru olduğunu kanıtlamaz.

**Question: Why might a Node script exit successfully without printing anything?**

> The executed module might only define or export functions without invoking a logging operation.

**Türkçe karşılığı:** Çalıştırılan dosya sadece fonksiyon tanımlayıp export edebilir; çıktı üreten bir işlem çağrılmıyorsa terminal boş kalabilir.

## 11. Pekiştirme ve kontrol cevabı

**Önce kendi başına tahmin et:**

1. `const price: number = 100` içindeki `: number` JavaScript çıktı dosyasında kalır mı?
2. `npm run typecheck` neden `dist/` altında JS oluşturmaz?
3. `npm run start` sonunda terminal boşsa programın başarısız olduğunu kanıtlar mı?
4. `calculateFinalPrice(20, true)` ve `calculateFinalPrice(19, true)` sonuçları neden aynı?
5. `npm test` geçerse test edilmemiş bir gereksinim hakkında ne söyleyebiliriz?

<details><summary>Kısa kontrol cevapları</summary>

1. Hayır; type annotation runtime JavaScript'e taşınmaz.
2. Script `tsc --noEmit` çağırır; typecheck sırasında output üretilmez.
3. Hayır; script hiç log yazmadan da çalışabilir.
4. İkisinde de 0; ilkinde indirim tam fiyat kadar, ikincisinde negatif sonuç korumayla 0'a çekilir.
5. O gereksinimin doğruluğu kanıtlanmış değildir.

</details>
