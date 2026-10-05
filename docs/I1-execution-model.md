# I1 — TypeScript Execution Model

## 1. TypeScript çalışma zinciri

Bu Incrementte kullandığımız temel çalışma modeli:

```text
TypeScript source (.ts)
        ↓
Type checking
        ↓
JavaScript output (.js)
        ↓
Node.js runtime
        ↓
Program output
```

Bu aşamalar aynı şey değildir.

## 2. TypeScript source

TypeScript kaynak dosyası hem runtime'da kullanılacak değerleri hem de TypeScript'in kontrol amacıyla kullandığı type bilgilerini içerebilir.

```ts
const price: number = 100;
```

Burada:

- `price` runtime sırasında `100` değerini taşır.
- `number` TypeScript'in type-check sırasında kullandığı type bilgisidir.

Type bilgisi derlenen JavaScript'in parçası olarak kalmaz.

---

## 3. Type checking

Type checking, kod çalıştırılmadan önce type kurallarının kontrol edilmesidir.

Örnek:

```ts
const price: number = "100";
```

`price` için `number` beklenirken `string` verildiği için TypeScript hata üretir.

Projede:

```bash
npm run typecheck
```

komutu:

```bash
tsc --noEmit
```

çalıştırır.

`--noEmit`, TypeScript'in kodu kontrol etmesini fakat JavaScript üretmemesini sağlar.

---

## 4. Build

```bash
npm run build
```

TypeScript kaynak kodunu JavaScript'e derler.

Bu projede temel akış:

```text
src/*.ts
   ↓
tsc
   ↓
dist/*.js
```

Derlenen JavaScript'te `: number`, `: boolean` gibi TypeScript type bilgileri bulunmaz.

---

## 5. Runtime

Node.js JavaScript runtime'dır.

```bash
npm run start
```

ile derlenmiş JavaScript Node.js tarafından çalıştırılır.

Runtime sırasında:

- değişkenler değer taşır,
- koşullar değerlendirilir,
- function'lar çağrılır,
- `return` çalışır,
- runtime hataları oluşabilir,
- `console.log()` gibi işlemler çıktı üretebilir.

---

## 6. Program output

Program output, runtime'ın kendisi değildir.

Örneğin:

```ts
console.log(result);
```

program çalışırken terminalde gözlemleyebildiğimiz bir çıktı üretir.

Runtime bütün program yürütme sürecidir; output ise bu sürecin gözlenebilir sonuçlarından biridir.

---

## 7. Üç farklı problem türü

### Type-check problemi

```ts
const age: number = "33";
```

TypeScript kod çalıştırılmadan önce problemi yakalayabilir.

### Runtime problemi

```ts
JSON.parse("{broken}");
```

Kod type-check'ten geçebilir fakat program çalışırken işlem başarısız olabilir.

### Behavior / logic problemi

Gereksinim:

> Değeri ikiyle çarp.

Kod:

```ts
function double(value: number): number {
  return value + 2;
}
```

Kod type açısından geçerlidir ve runtime sırasında çalışır, fakat iş sonucu yanlıştır.

---

## 8. Function temel kavramları

```ts
function calculateFinalPrice(
  price: number,
  hasDiscount: boolean
): number {
  // ...
}
```

`price` ve `hasDiscount` → **parameter**

```ts
calculateFinalPrice(100, true);
```

`100` ve `true` → **argument**

```ts
return 80;
```

`return` → function'ın ürettiği sonucu çağıran yere geri verir ve ilgili function çağrısını sonlandırır.

---

## 9. Test yaklaşımı

Test yazmadan önce:

```text
Gereksinim
    ↓
Beklenen davranış
    ↓
Test verisi
    ↓
Actual result vs expected result
```

ilişkisi kurulmalıdır.

Örneğin indirim miktarı `20` ise:

```text
100 → normal davranış
20  → exact boundary
19  → boundary'nin hemen altı
```

`20 → 0` testi tek başına negatif fiyat korumasını kanıtlamaz.

`19 → 0` testi ise normal hesap `-1` üreteceği için negatif fiyatı engelleyen kontrolü gerçekten doğrular.

---

## 10. npm, npx ve Node.js

### Node.js

JavaScript kodunu çalıştıran runtime.

```bash
node dist/price.js
```

### npm

Node.js projesindeki package/dependency ve proje scriptlerini yönetir.

Örnek:

```bash
npm install
npm run typecheck
npm run build
npm run test
```

### npx

Kurulu bir npm paketinin sağladığı executable/CLI komutunu doğrudan çalıştırabilir.

Örnek:

```bash
npx tsc --version
```

---

## I1 sonunda kullanılan temel komutlar

```bash
npm run typecheck
npm run build
npm run start
npm run test
```

Her komut farklı bir soruya cevap verir:

```text
typecheck → TypeScript kurallarına uygun mu?
build     → JavaScript üretilebiliyor mu?
start     → Program runtime'da nasıl davranıyor?
test      → Seçilmiş davranışlar beklentiyle uyuşuyor mu?
```