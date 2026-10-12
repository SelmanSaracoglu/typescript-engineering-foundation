# 13 — Collections & Data Transformation

Bu bölümde amaç array method'larını ezberlemek değil, yapılacak işe göre doğru yöntemi seçmek ve callback/çıktı davranışını açıklamaktır.

## Dersler

1. [Collection Intent & forEach](01-collection-intent-and-foreach.md) — imperative karşılaştırma, yan etki, dönüş değeri.
2. [map & filter](02-map-and-filter.md) — dönüştürme, seçme, callback return, referans.
3. [find / conditions / includes](03-find-conditions-and-includes.md) — ilk kayıt, indeks, koşul ve boş array.
4. [Chaining & reduce](04-chaining-and-reduce.md) — veri akışı, sıra, accumulator.
5. [sort & mutation](05-sort-and-mutation.md) — comparator, yerinde değişim, shallow copy.
6. [Object enumeration](06-object-enumeration.md) — keys, values, entries.
7. [Map, Set & weak collections](07-map-set-and-weak-collections.md) — key/value, benzersiz değer, weak türleri tanıma.

## Niyet tablosu

| Amaç | Araç |
| --- | --- |
| Her elemanda yan etki | `forEach` |
| Her elemanı dönüştürmek | `map` |
| Eleman seçmek | `filter` |
| İlk uygun eleman veya indeks | `find` / `findIndex` |
| En az biri / hepsi uygun mu? | `some` / `every` |
| Belirli değer var mı? | `includes` |
| Çok değeri tek sonuçta birleştirmek | `reduce` |

**Öğrenme yöntemi:** Önce beklenen çıktıyı tahmin et; sonra callback parametresi, dönüş değeri, veri akışı ve mutation davranışını açıkla. Bug örneklerinde yanlış varsayımı bul.

**Kanıt sınırı:** Bu yedi ders I6 teorik/curriculum çıktısıdır. Gerçek `src/` implementation, Vitest, sistematik repository debugging ve H0 transferi ölçülmüş sayılmaz; Epic 01 bütünleşik uygulamasına bırakılır. Promise/async I7 kapsamındadır.
