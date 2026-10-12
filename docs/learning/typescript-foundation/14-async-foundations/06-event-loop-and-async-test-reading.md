# Ders 6 — Event Loop Mental Model & Async Test Reading

## 1. Neden çalışma sırası önemlidir?

Asenkron bir fonksiyonun içindeki kod, çağıran fonksiyonun çevresindeki kodla beklenenden farklı sırada çalışabilir. Temel model: **önce mevcut senkron akış; `await` sonrası continuation daha sonra**.

```ts
console.log("A");

async function run(): Promise<void> {
  console.log("B");
  await Promise.resolve();
  console.log("C");
}

run();
console.log("D");
```

Çıktı:

```text
A
B
D
C
```

Adımlar: (1) `A`; (2) `run()` başlar, `B`; (3) `await` sonrasındaki devam ertelenir; (4) dışarıdaki `D`; (5) devam eden microtask `C`. `run()` en baştan yeniden çalışmaz; kaldığı yerden devam eder.

**Öğrenilecek sınır:** Bir Promise'in fulfilled olması bile `await` sonrasını aynı senkron anda çalıştırmaz. Browser ve Node görev kuyruklarının ayrıntılı iç aşamaları bu dersin konusu değildir.

## 2. `forEach(async ...)` neden risklidir?

```ts
async function processItems(): Promise<void> {
  const items = [1, 2];

  items.forEach(async item => {
    await Promise.resolve();
    console.log("Item:", item);
  });

  console.log("Done");
}
processItems();
```

Bu örneğin çıktısı:

```text
Done
Item: 1
Item: 2
```

`forEach` callback'leri çağırır ama callback'lerin döndürdüğü Promise'leri **toplayıp bekleyen bir Promise döndürmez**; kendisi `undefined` döndürür. Dolayısıyla `processItems()` tamamlandı diye iç callback'lerin de tamamlandığı genel olarak söylenemez. `Done` bir “bütün işler bitti” kanıtı değildir.

Burada yalnız **async callback'lerin otomatik beklenmemesi** uyarısı hedeflenir; alternatif collection/concurrency pattern tasarımı I8'e bırakılır.

## 3. Async Vitest testini okumak

```ts
async function loadValue(): Promise<number> {
  return 10;
}

it("loads the value", async () => {
  const result = await loadValue();
  expect(result).toBe(10);
});
```

- `it` içindeki callback ayrı bir **async fonksiyondur**; `loadValue`'ın async olması test callback'ini otomatik async yapmaz.
- `await loadValue()` başarılı sonucu `number` olarak alır.
- Vitest callback'in döndürdüğü Promise'in tamamlanmasını bekler.
- Assertion başarısızsa test başarısız olur.

### Başarı ve rejection testlerini tanıma

```ts
it("resolves with 10", async () => {
  await expect(loadValue()).resolves.toBe(10);
});

async function failToLoad(): Promise<number> {
  throw new Error("Load failed");
}

it("rejects on failure", async () => {
  await expect(failToLoad()).rejects.toThrow("Load failed");
});
```

`.resolves` başarılı sonuç, `.rejects` rejected sonucu doğrular. Assertion'ın Promise'ini **`await` etmek veya testten döndürmek** test runner'ın beklemesi açısından gereklidir. Test edilen fonksiyonun hata üretmesi, hata **bekleniyorsa**, testin başarısız olacağı anlamına gelmez.

## 4. Teorik bug okuma

```ts
it("checks score", () => {
  expect(loadValue()).resolves.toBe(10);
});
```

Bu örnek async assertion'ı ne `await` eder ne test callback'inden `return` eder. Doğrulamanın tamamlanması güvenilir biçimde beklenmez. Üstelik `await` eklemek istiyorsak callback de `async` olmalıdır.

## 5. Düşün ve açıkla

`forEach` örneğinde `processItems()` tamamlanınca iç callback'lerin de tamamlanmış olduğu garanti edilir mi? Yanıtı, **hangi Promise'in gerçekten beklendiği** üzerinden açıkla.

**Kanıt sınırı:** Bu bölüm yalnız async test **okuma** ve risk tanımadır. Gerçek `tests/` dosyasına ekleme, test çalıştırma, failure inceleme ve H0 transferi I8'e bırakılmıştır.
