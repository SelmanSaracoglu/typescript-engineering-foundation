# Ders 5 — Promise Composition & Promise.all

## 1. Birden fazla asenkron işlem

Bağımsız iki işlemimiz olsun:

```ts
async function loadUser(): Promise<string> {
  return "Selman";
}
async function loadScore(): Promise<number> {
  return 100;
}
```

### Sıralı (sequential)

```ts
async function sequential(): Promise<void> {
  const user = await loadUser();
  const score = await loadScore();
  console.log(user, score);
}
```

İkinci çağrı ilk `await` tamamlandıktan sonra başlar. Birbirine bağımlı işlemlerde doğaldır; bağımsız işlemlerde gereksiz bekleme yaratabilir.

### Birlikte başlatıp bekleme

```ts
async function together(): Promise<void> {
  const [user, score] = await Promise.all([
    loadUser(),
    loadScore()
  ]);
  console.log(user, score); // Selman 100
}
```

`loadUser()` ve `loadScore()` çağrıları aynı ifade değerlendirmesinde yapılır. `Promise.all` bu Promise'lerin **hepsinin başarılı sonuçlanmasını** bekler; başarı değerleri input sırasını koruyan array'de gelir. Burada `[user, score]` array destructuring'dir.

“Birlikte başlatmak” **iki ayrı JavaScript thread'inde CPU hesabı yapmak** anlamına gelmez.

## 2. Birisi reject olursa?

```ts
async function brokenScore(): Promise<number> {
  throw new Error("Score unavailable");
}

async function report(): Promise<void> {
  try {
    const [user, score] = await Promise.all([
      loadUser(),
      brokenScore()
    ]);
    console.log(user, score);
  } catch {
    console.log("İşlemlerden biri başarısız");
  }
}
```

`Promise.all` içindeki bir Promise rejected olursa bütün `Promise.all` sonucu rejected olur. Ancak **diğer başlatılan işlemler otomatik iptal edilmez**.

## 3. Diğer combinator'lar — tanıma düzeyi

| Metot | Hangi durumda uygun? | Hata davranışı |
| --- | --- | --- |
| `Promise.all` | Bütün başarılı sonuçlar gerekli | Herhangi biri reject olursa sonuç reject |
| `Promise.allSettled` | Her işin başarılı/başarısız durumunu görmek gerekli | Tüm girdilerin tamamlanmasını bekleyip durumları döndürür |
| `Promise.race` | İlk settled olanın sonucu önemli | İlk settled olan reject ise sonuç reject |
| `Promise.any` | İlk başarılı sonuç yeterli | Tekil reject'leri geçer; hepsi reject olursa aggregate hata |

```ts
const outcomes = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error("Failed"))
]);
// [{ status: "fulfilled", value: 1 },
//  { status: "rejected", reason: Error("Failed") }]
```

Yukarıdaki gösterim yorumdur; `reason` gerçek bir Error nesnesidir. Bu yöntemlerin hiçbiri kalan işlemleri kendiliğinden iptal etmez.

## 4. Seçim sorusu

Üç rapordan ikisi başarılı, biri başarısız. Her raporun durumunu raporlamak istiyorsun: `all` mı, `allSettled` mı ve neden? Diğer senaryoda **yalnız ilk başarılı sunucu yanıtı** önemliyse `race` mi, `any` mi?

**Kanıt sınırı:** Seçme mantığı teorik olarak tanınır; performans, cancellation veya production concurrency tasarımı bu incrementin kapsamı değildir.
