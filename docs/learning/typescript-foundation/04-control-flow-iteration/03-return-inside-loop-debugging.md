# Ders 13 — Early Return Bug: Loop Neden Birinci Kayıtta Durdu?

## 1. Problem ve gereksinim

Gerçek bir liste filtreleyici birinci kaydı doğru sonuçlandırıp sonrasını sessizce atlayabilir. Typecheck'in yeşil olması bu kusuru göstermeyebilir. Bu dersin amacı aynı fonksiyonun yanlış ve doğru control-flow'unu **satır satır** karşılaştırmaktır.

## 2. Kavram / çalışma modeli

`return`, en yakın `if` veya `for` gövdesinden değil, **function'ın tamamından** çıkar. `break` yalnız en yakın uygun loop/switch akışını bitirir; `continue` döngünün sonraki iteration'ına geçer. Bu üç davranış birbirinin yerine geçmez.

## 3. Açıklamalı TypeScript örneği

```ts
function wrongNames(names: string[]): string[] {
  const result: string[] = [];
  for (const name of names) {
    result.push(name);
    return result; // BUG: ilk iteration'da fonksiyon biter
  }
  return result;
}
console.log(wrongNames(["Ali", "Can"])); // ["Ali"]

function allNames(names: string[]): string[] {
  const result: string[] = [];
  for (const name of names) {
    result.push(name);
  }
  return result;
}
console.log(allNames(["Ali", "Can"])); // ["Ali", "Can"]
```

## 4. Iteration ve execution trace

**Yanlış sürüm:** `result=[]` → ilk element Ali → push → `["Ali"]` → **return çağrıyı bitirir**. Can hiçbir iteration'da görülmez.

**Doğru sürüm:** `result=[]` → Ali push → Can push → loop sona erer → return iki isimli array.

| Input | Wrong | Correct | Fark |
| --- | --- | --- | --- |
| `[]` | `[]` | `[]` | yok |
| `["Ali"]` | `["Ali"]` | `["Ali"]` | yok |
| `["Ali","Can"]` | `["Ali"]` | `["Ali","Can"]` | var |

Bu yüzden tek kayıt ve boş array testleri bug'ı **gizler**.

## 5. İkinci örnek ve mekanizmanın sınırı

### Early return her zaman yanlış mıdır?

Hayır. Gereksinim *ilk uygun elementi bulmak* ise loop içindeki return doğru olabilir:

```ts
function firstLongName(names: string[]): string | null {
  for (const name of names) {
    if (name.length >= 5) {
      return name;
    }
  }
  return null;
}
console.log(firstLongName(["Ali", "Ayşe", "Selman"])); // Selman
```

Bu fonksiyon **ilk eşleşmeyi** arar; eşleşince gereksinim tamamlanmıştır. Tekrar etmeye devam etmek gerekmez.

Buna karşılık “bütün uygun kullanıcılar” gereksiniminde loop içinde return kusurdur.

### break vs continue vs return

```ts
function inspect(values: number[]): number[] {
  const seen: number[] = [];
  for (const value of values) {
    if (value < 0) continue; // negatifi atla
    if (value === 0) break;   // loop'u bitir
    seen.push(value);
  }
  return seen; // function burada döner
}
console.log(inspect([2, -1, 3, 0, 5])); // [2, 3]
```

- 2 eklenir.
- -1 için continue, push yapılmaz.
- 3 eklenir.
- 0 için break, loop biter.
- 5 işlenmez; function loop sonrasındaki return'a ulaşır.

Aynı yerde `return seen` olsaydı **function** o anda sonuç döndürür; `break` ise döngüden çıkarak sonraki function satırlarına geçebilir.

## 6. Kritik ayrımlar ve sınır durumları

Boş array'de loop içindeki return hiç yürütülmez. Bir elementli input'ta yanlış ve doğru sürüm aynı sonucu verebilir. Kötü/eksik test bu yüzden geçebilir. TypeScript her iki sürümün de `string[]` döndüğünü görür; **çok kayıt gereksinimi** type ile ifade edilmediğinden logic bug yakalanmaz.

**Loop içinde mutation:** `result.push` output array'ini değiştirebilir; input `names` array'ini değiştirmek zorunda değildir. Bu örnekte string primitive değerler taşınır.

## 7. Debugging — kontrollü hata araştırması

**Reproduce:** İki uygun isim ver; expected iki isim, actual bir isim.

**Hypothesis:** Döngü bir kez çalışıyor.

**Trace:** İlk iteration'da `return` gerçekleşir; ikinci iteration'a girilmez.

**Minimal fix:** `return result` satırını loop'un dışına taşı.

**Regression:** Boş, tek, iki ve üç isimli dizilerle sonucu tekrar sınayıp gereksinimle karşılaştır.

**Gerçek dünyadaki risk:** Kayıt tarama, test raporlama veya filtreleme kodu erken return yüzünden kayıtların tamamını işlemeyebilir. Semptom 'yetersiz veri' olabilir; exception şart değildir.

## 8. Mülakat ve cevaplı pekiştirme

**Question:** Why can an early return inside a loop cause a bug? **Answer:** Return ends the function invocation; later elements are not processed.

**Pekiştirme:** (1) `wrongNames([])` kaç döner? (2) Hangi input bug'ı görünür yapar? (3) `firstLongName` örneğinde return niçin doğru? (4) `break` sonrası function çalışmaya devam eder mi?

<details><summary>Kontrol cevapları</summary>

1. Boş array. 2. En az iki işlenmesi gereken element. 3. İş kuralı ilk eşleşmeyi arar. 4. Evet, loop sonrasındaki satırlara ilerleyebilir.

</details>
