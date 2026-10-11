# 01 — Execution Model, Runtime ve Toolchain Temeli

> [TypeScript Foundation ana öğrenme rotası](../README.md)  
> **Önkoşul:** Yok. **Sonraki bölüm:** [02 — Values, Variables & Basic Decisions](../02-values-variables-basic-decisions/README.md).

## Bu bölümün hedefi

TypeScript dosyasından JavaScript yürütmesine kadar hangi aşamada **ne olduğunu** ayırt edebilmek: source, type checking, build, Node.js runtime, output ve test beklentisi. Temel başarı, komutları ezberlemek değil; gördüğün bir hata için doğru katmanı ve kanıtı seçmektir.

## Dersler — önerilen sıra

| Sıra | Ders | Öğrendiğinde açıklayabileceğin şey |
| --- | --- | --- |
| 1 | [TypeScript Source, Type Checking, Build ve Runtime](./01-source-check-build-run.md) | Type annotation neden runtime'da bulunmaz? `.ts` nasıl JS olarak yürütülür? |
| 2 | [Type-check Error, Runtime Exception ve Logic Bug](./02-type-runtime-logic-errors.md) | Bir kusur hangi katmanda ortaya çıkar? Beklenen ile actual sonuç nasıl karşılaştırılır? |
| 3 | [Node.js, npm, npx, Scripts ve Output](./03-node-npm-scripts-and-output.md) | Projede hangi komut hangi aracı çalıştırır? Neden program çıktısı yürütmenin tamamı değildir? |

İlk okumada dersleri sırayla işle. Tekrar yaparken her dosyanın **execution trace**, **hata analizi**, **mülakat** ve **pekiştirme** bölümlerine dön.

## Konuların birbirine bağı

```text
Ders 1: source → typecheck/build → JavaScript → Node runtime
         ↓
Ders 2: hangi hata hangi aşamada ortaya çıkar?
         ↓
Ders 3: komutla çalıştırma, çıktı/exit durumu ve tanılama
         ↓
Bölüm 02: değerler, değişkenler, karar ifadeleri
```

Bu, zorunlu olarak her dosyanın tip kontrolünü geçtikten sonra derleneceğini söyleyen bir pipeline değildir; **öğrenme sırasıdır**.

## Bölüm sonu kontrol

- `npm run typecheck` ile `npm run build` arasındaki farkı anlatabilir misin?
- `npm run start` terminale hiçbir şey yazmazsa otomatik olarak hata olduğunu söyleyebilir misin?
- Typecheck geçen ama iş kuralını yanlış uygulayan küçük bir örnek verebilir misin?
- Bir logic bug ile runtime exception için neden farklı debugging kanıtı toplarsın?

## Tekrar ve tarihçe

Bu README **yalnızca öğrenme navigasyonudur**; üç dersin uzun açıklamalarını ikinci kez kopyalamaz. [Eski I1 çalışması](../../../I1-execution-model.md) geçmiş kaynak olarak mevcut; güncel öğretim için yukarıdaki dersleri kullan. Eski dosyayı kaldırmak, diğer bölümlerde ona verilen bağlantılar incelendikten sonra ayrı bir temizlik kararıdır. Bu dokümanın hazırlanması bağımsız H0 uygulama kanıtı değildir.
