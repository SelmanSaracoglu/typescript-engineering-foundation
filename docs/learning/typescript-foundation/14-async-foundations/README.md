# 14 — Async Foundations

**Epic 01 / I7 | Teorik Foundation | 12 Ekim 2026**

Bu bölümün hedefi bir fonksiyonun **hemen döndürdüğü Promise** ile Promise'in **sonradan elde edilebilen başarılı sonucunu** ayırmak; `await` akışını, hatanın taşınmasını ve birden fazla işlemin nasıl beklendiğini okuyabilmektir. Bu bölüm uzun uygulama veya bağımsız mühendislik testi değildir.

## Dersler

1. [Sync vs Async & Promise States](01-sync-async-and-promise-states.md) — değer, Promise, pending/fulfilled/rejected.
2. [Async Functions & Await](02-async-functions-and-await.md) — async dönüş modeli, await, çalışma sırası.
3. [Rejection, Throw & Error Propagation](03-rejection-throw-and-propagation.md) — rejected Promise, throw, üst katmana taşıma, then/catch.
4. [Try / Catch / Finally](04-try-catch-finally.md) — başarılı/hatalı yollar, yakalama, yeniden fırlatma, cleanup.
5. [Promise Composition & Promise.all](05-promise-composition.md) — sıralı/eşzamanlı başlangıç, all, diğer combinator'ları tanıma.
6. [Event Loop Mental Model & Async Test Reading](06-event-loop-and-async-test-reading.md) — continuation, forEach uyarısı, async Vitest okuma.

## Kısa referans

| Yapı | Temel işlev |
| --- | --- |
| `Promise<T>` | Başarıda `T` türü değer üretebilen asenkron sonucu temsil eder |
| `async` | Fonksiyon çağırana Promise döndürür |
| `await` | Promise sonucunu bekleyip bulunduğu async akışın devamını erteler |
| `throw` | Async fonksiyon içinde yakalanmazsa rejected Promise'e neden olur |
| `try/catch/finally` | Hata yakalama, yeniden fırlatma ve cleanup akışı |
| `.then() / .catch()` | Promise zincirine başarı/hata callback'i bağlar |
| `Promise.all` | Tüm başarılı sonuçları birlikte elde eder, bir reject'te reject olur |
| `Promise.allSettled` | Her işlemin durumunu ve sonucunu görür |
| `Promise.race` | İlk settled sonucu izler |
| `Promise.any` | İlk fulfilled sonucu izler |

## Öğrenme yöntemi ve kanıt sınırı

Örneklerde önce türü ve çalışma sırasını tahmin et; ardından **caller'ın hemen ne aldığı**, **await sonrasının ne zaman çalıştığı** ve **hata nerede yakalandığı** sorularını açıkla.

Bu altı ders **I7 teorik/curriculum çıktısıdır**. Dosyalardaki örnekler açıklamalı eğitim kodudur; bu Incrementte `src/` uygulaması, gerçek Vitest koşumu, repository debugging ve H0 bağımsız transferi ölçülmedi. Bunlar Epic yönetiminin belirlediği I8 bütünleşik uygulama çalışmasına devredilir.

**Kapsam dışı:** HTTP/fetch, Cypress command queue, Node event-loop phases/libuv, timers internals, workers, streams, retries, advanced concurrency.
