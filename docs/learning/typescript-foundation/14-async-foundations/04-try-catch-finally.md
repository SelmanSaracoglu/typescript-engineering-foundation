# Ders 4 — Try / Catch / Finally

## 1. Üç bloğun sorumluluğu

- `try`: Hata ihtimali bulunan kodu çalıştırır.
- `catch`: Ortaya çıkan ve bu bloğa ulaşan hatayı yakalayıp ele alabilir.
- `finally`: Başarı veya hata sonrası kaynak temizliği gibi ortak işlemler için çalışır.

```ts
async function getUser(): Promise<string> {
  throw new Error("User not found");
}

async function showUser(): Promise<void> {
  try {
    const user = await getUser();
    console.log("A:", user);
  } catch (error) {
    console.log("B: Hata yakalandı");
  } finally {
    console.log("C: Temizlik yapıldı");
  }

  console.log("D: Devam edildi");
}

showUser();
```

Çıktı:

```text
B: Hata yakalandı
C: Temizlik yapıldı
D: Devam edildi
```

`A` yazılmaz çünkü `await getUser()` rejected Promise nedeniyle hata verir. `catch` hatayı ele alır; `finally` çalışır; ardından kod `D` satırından devam eder.

## 2. Hata yoksa?

```ts
async function example(): Promise<void> {
  try {
    console.log("A");
  } catch {
    console.log("B");
  } finally {
    console.log("C");
  }
  console.log("D");
}

example(); // A, C, D
```

Hata yoksa `catch` atlanır; `finally` yine çalışır. Bu nedenle `finally`'yi sadece hata mesajı için değil, temizleme davranışı için düşün.

## 3. Yakalamak ile yeniden fırlatmak

### Catch hatayı ele alır

```ts
async function report(): Promise<string> {
  try {
    return await getUser();
  } catch {
    return "Rapor hazırlanamadı"; // fulfilled Promise, fallback string
  }
}
```

Burada hata yakalanır ve fonksiyon fallback değeriyle başarılı tamamlanır. Üst katmandaki `catch` bu hata için çalışmaz.

### Catch hatayı yeniden fırlatır

```ts
async function report(): Promise<string> {
  try {
    return await getUser();
  } catch (error) {
    console.log("İç katmanda yakalandı");
    throw error;
  }
}
```

Bu sürümde üst katman da rejection'ı görebilir. **Log yazmak ≠ yeniden fırlatmak.**

## 4. `finally` ve cleanup

Dosya/kaynak kapatma gibi işler başarıda da hatada da yapılmak isteyebilir. `finally` bu niyeti ifade eder. Gerçek dil davranışında `finally` içinde yeni bir `throw` veya `return` önceki sonucu değiştirebilir; bu başlangıç dersindeki örneklerde böyle bir kontrol akışı kullanılmaz.

## 5. Düşün ve açıkla

```ts
async function task(): Promise<void> {
  try { console.log("1"); }
  catch { console.log("2"); }
  finally { console.log("3"); }
  console.log("4");
}
task();
```

Sıra nedir? Aynı kodun `try` bloğuna `throw new Error("x")` eklenirse hangi satırlar çalışır?

**Kanıt sınırı:** Bu ders hata yolu okuma öğretir; production resource cleanup implementation'ı hedeflemez.
