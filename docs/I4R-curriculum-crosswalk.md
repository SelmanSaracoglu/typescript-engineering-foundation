# I4R — Curriculum Migration Record

## Kapsam

Başlangıç: `main@e029ec6ce0a1eff8749ceada03b23d97a5905515`.

Kalıcı eğitim dizini: `docs/learning/typescript-foundation/`. Bu kayıt yalnız göçün dosya/kapsam kararlarını içerir; öğrenci yeterliliği değerlendirmesi değildir.

| Kalıcı bölüm | Ders | Kavram kaynağı |
| --- | ---: | --- |
| 01 Execution & Runtime | 3 | I1 |
| 02 Values & Basic Decisions | 4 | I1–I2 ve eksik temel köprü |
| 03 Functions Fundamentals | 3 | I1–I2 |
| 04 Control Flow & Iteration | 3 | I2 |
| 05 Objects & Reference Identity | 5 | I2 |
| 06 TypeScript Modeling | 4 | I2–I3 |
| 07 Safe Runtime Boundaries | 5 | I3 |
| 08 Value & Decision Mechanics | 7 | I4 JavaScript dersleri |
| 09 Modern Object & Array Syntax | 6 | I4 JavaScript dersleri |
| 10 JSON Boundary | 4 | I4 JSON dersleri |
| **Toplam** | **44** | |

## Tekrarlı dosya temizliği

Eski `docs/learning/javascript/` altındaki 17 ders, 3 bölüm README'si ve ana README **kaldırıldı**. Güncel öğrenme kopyaları yalnız `docs/learning/typescript-foundation/08-...`, `09-...` ve `10-...` altında bulunuyor. Eski dosya geçmişi Git commit history'de kalır.

Eski `docs/I1-execution-model.md`, `docs/I2-control-flow-functions-data-modeling.md` ve `docs/I3-safe-types-runtime-boundaries.md` ise önceki gerçek çalışmanın ve gözlem notlarının tarihsel kayıtları olduğundan korunur. Bunların ders metinleri kalıcı 01–07 içeriğinde yeniden düzenlenmiştir; eski belgeler aktif öğretim adresi değildir.

## Eğitim dosyalarının biçimi

01–10 içindeki ayrı ders dosyaları kavram açıklaması, teknik örnek, execution/data flow, hata/sınır durumu, debugging ve pekiştirme içerir. Ders gövdelerine öğrenme yolu, önkoşul, sonraki ders, başka dosyaya yönlendirme veya tarihsel H0/idari not yerleştirilmez. Chapter README'leri yalnız kısa içerik dizinidir.

## Kontrol sınırı

03–07 arasındaki 20 ders dosyasında göreli gezinme bağlantısı ve istenmeyen idari üstbilgi bulunmadığı kontrol edildi. Kod bloklarının açılıp kapanma sayıları dengeli. Bu biçim denetimi, Markdown kod parçalarının bütününün derlenip çalıştırıldığı anlamına gelmez.

`src/`, `tests/`, `package.json` ve `tsconfig.json` dokümantasyon göçünde değiştirilmedi. Repository genelindeki `npm run typecheck` ve `npm test` sonuçları bu erişim yolunda henüz çalıştırılarak doğrulanmadı; bu doğrulamalar açık kalır.

Belge üretimi öğrencinin bağımsız kod yazma/debugging veya H0–H4 seviyesini yükseltmez.
