# Ders 3 — Node.js, npm, npx, Project Scripts ve Program Output

> **Öğrenme yolu:** [TypeScript Foundation](../README.md) → [01 — Execution & Runtime](./README.md)  
> **Önkoşullar:** [Ders 1 — Type checking/build/runtime](./01-source-check-build-run.md) ve [Ders 2 — Hata sınıfları](./02-type-runtime-logic-errors.md).  
> **Hedef:** Terminalde çalıştırılan komutun hangi aracı kullandığını, hangi dosyayı yürüttüğünü ve sonucu nasıl gözlemleyeceğini açıklamak.  
> **Sonraki:** [02 — Values, Variables & Basic Decisions](../02-values-variables-basic-decisions/README.md).

## 1. Neden üç farklı araçtan söz ediyoruz?

Kod yazarken şu komutları sık görürüz:

```bash
node dist/price.js
npm run typecheck
npm run build
npx tsc --version
```

Bunlar eş anlamlı değildir. `node` JavaScript dosyasını çalıştırır. `npm` projede tanımlanan scriptleri veya paketleri yönetir. `npx` paketlerin sağladığı komutları çağırabilir.

Bir TypeScript projesinde sorunu doğru araştırabilmek için **terminaldeki komutu değil, komutun hangi işlemi başlattığını** anlamalısın.

## 2. Node.js nedir?

**Node.js**, JavaScript'i tarayıcı dışında da çalıştırabilen bir runtime'dır. Node, JavaScript ifadelerini yürütür; dosya ve terminal gibi çalışma ortamı yetenekleri sağlar.

Basit JavaScript dosyası:

```js
// demo.js — JavaScript dosyası
const amount = 100;
console.log(amount - 20);
```

Terminal:

```bash
node demo.js
```

Beklenen çıktı:

```text
80
```

Execution sırası:

1. Terminal `node` programını başlatır.
2. Node `demo.js` dosyasını yükler.
3. `amount` 100 olur.
4. `amount - 20` sonucu hesaplanır.
5. `console.log` ekrana `80` yazar.
6. Başka bekleyen iş yoksa process sonlanır.

Bu örnek **JavaScript** dosyasıdır; `.ts` kaynak dosyası değildir. TypeScript kodunun bu repoda nasıl `.js` dosyasına dönüştüğü [Ders 1](./01-source-check-build-run.md)'de anlatıldı.

## 3. npm nedir? Project script nasıl çalışır?

**npm**, Node.js ekosistemindeki dependency/package yönetimi ve project scripts aracıdır.

Projede bir `package.json` vardır. Örneğin mevcut repo scriptleri:

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

Bir script adını çağırınca:

```bash
npm run typecheck
```

npm:
1. Çalıştığın projedeki `package.json` içindeki `scripts.typecheck` tanımını bulur.
2. İçindeki `tsc --noEmit` komutunu uygun çalışma ortamında başlatır.
3. Çıktıyı ve exit status bilgisini terminale iletir.

**`npm run typecheck` yeni bir compiler değildir.** Var olan TypeScript compiler komutuna projenin tanımladığı bir kısayoldur.

Benzer biçimde:

```bash
npm run build
```

projede `tsc` çalıştırır; `npm test` burada `vitest run` komutunu başlatır. Script adı hangi işin yapıldığını anlatan **etikettir**; esas komutu package.json belirler.

## 4. npx nedir? npm ile farkı ne?

**npx**, paketlerin sunduğu CLI (command-line interface) executable'larını çalıştırmak için kullanılır.

```bash
npx tsc --version
```

Bu komut TypeScript compiler'ın sürüm bilgisini istemek için kullanılabilir. `tsc` çalıştırılması, `.ts` kaynak dosyalarının test edildiği anlamına gelmez; burada yalnız sürüm soruluyor.

**Önemli dikkat:** npx, yerel paket bulunmadığında ayarlara ve npm sürümüne bağlı olarak paketi indirmeye veya onay istemeye çalışabilir. Yeni dependency eklemek istemiyorsak önce projenin paketlerinin kurulu olup olmadığını kontrol ederiz. `npm run typecheck` mevcut script üzerinden daha açık ve tekrar üretilebilir bir seçimdir.

| Araç | Temel sorumluluk | Örnek |
| --- | --- | --- |
| Node | JavaScript yürütmek | `node demo.js` |
| npm | Dependencies / scripts | `npm run build` |
| npx | Bir paketin CLI komutunu çalıştırmak | `npx tsc --version` |
| TypeScript compiler | Typecheck ve JS emit | `tsc --noEmit`, `tsc` |
| Vitest | Tanımlı testleri yürütmek | `vitest run` |

Bu araçlar farklı katmanlarda olsa da birbirine bağlanabilir: örneğin npm, `tsc`'yi veya Vitest'i çağırabilir.

## 5. Mevcut projede gerçek çalışma sırası

Projede `src/price.ts` var; compiler çıkışı `dist/price.js` yoluna yazılır.

```text
Repository root
├── package.json
├── tsconfig.json
├── src/
│   └── price.ts
├── tests/
│   └── price.test.ts
└── dist/           ← build output (derlemeden sonra)
    └── price.js
```

Bu şema ilgili dosyaların konumunu gösterir; repo'nun bütün dosyalarının envanteri değildir. `dist/` çıktı klasörü build yapılmadan önce bulunmak zorunda değildir.

Terminalde proje kökünden yürütülecek **önerilen kontrol sırası**:

```bash
npm run typecheck
npm run build
npm test
```

Bu üç komut birbirinin yerine geçmez. Typecheck statik tür kuralını, build JavaScript emit aşamasını, test ise yazılı davranış beklentilerini doğrular. Her komutun actual sonucunu terminalden gözlemlemek gerekir.

**Bağlantı:** `npm run start`, script tanımı gereği `node dist/price.js` çalıştırır. Fakat proje kodundaki `calculateFinalPrice` fonksiyonu kendiliğinden çağrılmıyor.

## 6. Bu repoda “start çalıştı ama hiçbir şey yazmadı” neden normal olabilir?

`src/price.ts` dosyası `calculateFinalPrice` fonksiyonunu dışarı **export** eder. Dosyanın üst seviyesinde otomatik `console.log` çağrısı bulunmaz.

Basitleştirilmiş model:

```ts
export function calculateFinalPrice(price: number, hasDiscount: boolean): number {
  if (!hasDiscount) return price;
  return price - 20 < 0 ? 0 : price - 20;
}
```

Bu blok mevcut kodun **davranışını anlatan kısaltılmış öğretici karşılıktır**; asıl `src/price.ts` dosyası iç içe `if` kullanır.

```bash
npm run build
npm run start
```

Bu projede `start` script'i yalnız modülü çalıştırıyorsa ve hiçbir logging yoksa **terminalde fiyatın yazmaması beklenen durumdur**. Bir process'in sorunsuz tamamlanması için mutlaka `console.log` çağırması gerekmez.

Çalışan function'ın return değerini gözlemek için (önce build, sonra):

```bash
node -e "const { calculateFinalPrice } = require('./dist/price.js'); console.log(calculateFinalPrice(100, true));"
```

Bu komut:
1. `node -e` ile terminalde verilen JavaScript ifadesini yürütür.
2. `require('./dist/price.js')` ile bu repo'nun CommonJS çıktı modülünü yükler.
3. Export edilen `calculateFinalPrice` fonksiyonunu alır.
4. `(100, true)` argümanlarıyla çağırır.
5. Return değerini `console.log` ile yazdırır.

Beklenen çıktı: `80`. Bu komut yeni bir source/test dosyası oluşturmayı gerektirmez; burada tarif edilen beklenen davranışın canlı repoda çalıştırıldığına dair iddia değildir.

## 7. Runtime ve program output neden farklı?

**Runtime**, JavaScript'in yürütüldüğü süreçtir. **Output** bu sürecin dışarıdan görülebilen bazı sonuçlarıdır.

```js
function calculate() {
  const total = 100 - 20;
  return total;
}
calculate();
```

Bu program JavaScript işlemlerini yapar, fakat terminale bir şey yazmaz. Aynı koda `console.log(calculate())` eklense `80` görülür. Sonucun return edilmesi ile terminale loglanması ayrı iki işlemdir.

Ayrıca program bir dosya yazabilir veya exit code ile sonuç bildirebilir; terminaldeki yazı tek olası gözlem değildir.

### stdout, stderr ve exit status

- **stdout:** Normal terminal çıktısı için yaygın akış.
- **stderr:** Hata/tanılama çıktıları için yaygın akış.
- **Exit status / exit code:** Process'in nasıl sonlandığını işletim sistemine bildiren sayısal durum. Genellikle 0 başarı, sıfırdan farklı bir kod başarısızlık bildirir; tam anlamı programın sözleşmesine bağlıdır.

`console.log` çoğunlukla stdout'a yazar. `console.error` stderr için kullanılır. Ama **stderr'e yazı yazılması tek başına process'in exit code'unun mutlaka nonzero olduğu anlamına gelmez**; ve sessiz process de başarısız olabilir.

Çıktı gözlemi ile exit status'ü ayırmak CI ve test otomasyonu için önemlidir.

## 8. En sık karıştırılan dört farklı işlem

| İşlem | Komut / ifade | Beklenen gözlem | Kanıtlamadığı şey |
| --- | --- | --- | --- |
| Type-check | `npm run typecheck` | Diagnostic veya başarılı tamamlama | İş kuralı doğruluğu |
| Build | `npm run build` | JS output ve build sonucu | Her fonksiyonun çağrıldığı |
| Run | `npm run start` | Seçilen JS dosyasının yürütülmesi | Otomatik testlerin geçtiği |
| Test | `npm test` | Vitest test raporu | Yazılmamış bütün senaryolar |

**Kural:** “Komut çalıştı” yerine “hangi komut, hangi gözlem, hangi davranış?” sorularını sor.

## 9. Gerçekçi debugging senaryoları

### A. “Cannot find module ... dist/price.js”

**Olası neden:** Build yapılmadı veya çıktı dosyası farklı bir konumda.

**Araştırma:**
1. `package.json` start komutunu kontrol et.
2. `tsconfig.json` içindeki `outDir` ve `rootDir` ayarlarını oku.
3. `npm run build` sonucunu incele.
4. `dist/price.js` gerçekten var mı kontrol et.
5. Sonra yeniden start komutunu dene.

**Yapılmaması gereken:** Sırf dosya bulunamadı diye fiyat hesaplama iş mantığını değiştirmek.

### B. “npm run typecheck” bir TS hata kodu verdi

**Olası neden:** TypeScript kaynak kodundaki statik beklenti ihlali.

**Araştırma:** Komutun çalıştığı dizini, `tsconfig` kapsamını, bildirilen dosya/satır ile beklenen/actual type'ı karşılaştır.

**Yapılmaması gereken:** Sorunu düşünmeden `any` veya `as` ile gizlemek.

### C. “npm test geçti ama yanlış fiyat üretiliyor”

**Olası neden:** Testler yanlış senaryoyu kapsıyor olabilir; gerçek logic bug olabilir.

**Araştırma:** Gereksinimden expected tablo hazırla; `calculateFinalPrice(19, true)` gibi kusuru ayırt eden boundary'yi kullan. [Ders 2](./02-type-runtime-logic-errors.md) hataları sınıflandırmayı öğretir.

### D. “npm run start hiçbir çıktı vermedi”

**Olası neden:** Modülde otomatik log veya fonksiyon çağrısı yok.

**Araştırma:** Dosya source'unda hangi ifadelerin **üst seviyede** yürütüldüğünü, hangilerinin yalnız function definition olduğunu ayır. Çıktı yokluğunu otomatik crash kabul etme.

## 10. Hangi araç hangi career becerisini destekler?

- **SDET:** `npm test` sonuçlarıyla typecheck ve runtime failure'ını ayırmak; CI hatalarında yanlış katmana müdahale etmemek.
- **Application Security:** Static typing'in dış veriyi doğrulamadığını bilmek; güven sınırlarını yanlış anlamamak.
- **Security Engineering:** Bir scriptin çalıştırılması, process exit code'u, üretilen log ve gerçek davranış arasında ayrım kurmak.

Bu örnekler **yeni framework, deployment veya başka repo** gerektirmez; yalnız ortak mühendislik zihinsel modelini açıklar.

## 11. Mülakat hazırlığı

**Question: What is the difference between Node.js, npm, and npx?**

> Node.js executes JavaScript. npm manages project dependencies and scripts. npx runs command-line tools provided by packages. A project script can use npm to invoke the TypeScript compiler or a test runner.

**Türkçe karşılığı:** Node JavaScript'i çalıştırır; npm paket ve scriptleri yönetir; npx paketlerin komut satırı araçlarını çağırır. npm script'i TypeScript compiler veya test runner gibi araçları başlatabilir.

**Question: Why can a script succeed without logging anything?**

> A module may only define or export functions. If no statement writes to stdout, there may be no terminal output even though execution succeeds.

**Türkçe karşılığı:** Bir modül yalnız fonksiyon tanımlayıp export edebilir. stdout'a çıktı yazan işlem yoksa başarılı yürütmeye rağmen terminal sessiz kalabilir.

## 12. Pekiştirme ve kontrol cevabı

Önce tahmin et, ardından terminal çıktısıyla doğrula:

1. `npm run typecheck` neden `dist/` klasörünü oluşturmamalıdır?
2. `npm run build` geçerse `calculateFinalPrice(19,true)` davranışının doğru olduğu kanıtlanır mı?
3. `npm run start` başarılı bitti ama çıktı yok; hangi source özelliği buna neden olabilir?
4. `npx tsc --version` ile `npm test` hangi farklı sorulara cevap verir?
5. `console.log(calculate())` ile yalnız `calculate()` arasındaki fark ne?
6. `Cannot find module './dist/price.js'` durumunda önce nereye bakarsın?
7. stdout'da yazı olmaması exit code'un başarı olduğunu garanti eder mi?

<details><summary>Kısa cevaplar</summary>

1. Bu script `tsc --noEmit` çalıştırır.
2. Hayır; build, iş kuralını sınamaz.
3. Modül fonksiyon export ediyor olabilir, çağrı/log bulunmayabilir.
4. Biri compiler sürüm bilgisi, diğeri test yürütmesi.
5. İkinci çağrıda return değeri terminale otomatik yazılmaz.
6. Build sonucu, `dist` dosyasının varlığı ve script path.
7. Hayır; output ve exit code farklı gözlemlerdir.

</details>

**Sonraki öğrenme adımı:** [02 — Values, Variables & Basic Decisions](../02-values-variables-basic-decisions/README.md).  
**Tarihsel kaynak:** [I1 — Execution Model](../../../I1-execution-model.md). Bu içerik eğitim dokümanıdır, H0 bağımsız uygulama kanıtı değildir.
