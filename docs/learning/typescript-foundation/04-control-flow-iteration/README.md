# 04 — Control Flow & Iteration

**Önkoşul:** [03 — functions](../03-functions-fundamentals/README.md). **Sonraki:** [05 — references](../05-objects-arrays-references/README.md).

## Ayrıntılı dersler

1. [Conditions, Multiple Conditions ve Branch Seçimi](./01-conditions-multiple-branches.md)
2. [for...of ve Çok Kayıtlı Iteration](./02-for-of-iteration-over-arrays.md)
3. [Early Return ve Loop İçindeki return Bug'ı](./03-return-inside-loop-debugging.md)

## Problem
Tek kaydı kontrol etmek ile çok kayıt üzerinde doğru zamanda karar vermek farklıdır. Döngü içindeki erken return gerçek kayıplara yol açabilir.

```ts
type Entry = { name: string; active: boolean; score: number };

function qualifiedNames(entries: Entry[]): string[] {
  const names: string[] = [];
  for (const entry of entries) {
    if (entry.active && entry.score >= 60) {
      names.push(entry.name);
    }
  }
  return names;
}
console.log(qualifiedNames([
  { name: "Ali", active: true, score: 80 },
  { name: "Ece", active: false, score: 90 },
  { name: "Can", active: true, score: 70 }
])); // ["Ali", "Can"]
```
`for...of` her element üzerinde bir iteration çalıştırır. `&&` iki koşulun da uygun olmasını gerektirir. Loop içindeki block her kayıt için yeniden yürütülür.

## Debugging: loop içinde return
```ts
for (const entry of entries) {
  if (entry.active) names.push(entry.name);
  return names; // HATA: ilk kayıttan sonra function biter
}
```
Bu örnek **üstte tanımlanan** `entries` ve `names` bağlamında hatalı kod parçasıdır; bağımsız çalıştırılabilir tam fonksiyon değildir. Gerçek bug, `return`'un loop gövdesinde bulunmasıdır. Sadece ilk öğe işlendiği için çok kayıtlarda kusur görülür. Doğru tasarımda `return` döngünün sonrasında bulunur.

## Test seçimi
| Input | Beklenen |
| --- | --- |
| boş array | `[]` |
| active=true, score=59 | hariç |
| active=true, score=60 | dahil |
| active=false, score=90 | hariç |
| iki uygun kayıt ve arada uygun olmayan kayıt | ikisi de dahil |

**Önemli:** `[]` boş array, `[{}]` bir element içeren array'dir. [05](../05-objects-arrays-references/README.md)'te element/reference ayrımına geçilir.

**Mülakat:** *Why can returning inside a loop be a bug?* Return fonksiyonun tamamını bitirir; sonraki öğelere geçilmez.

**Pekiştirme:** Üç girdinin her iteration'ında hangi branch çalışır? `return` ikinci iterasyondan sonra olsa hangi kayıtlar kaybolur? Kaynak: [I2](../../../I2-control-flow-functions-data-modeling.md).
