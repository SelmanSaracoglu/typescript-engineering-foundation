# 10 — JSON Boundary

## 1. Bu bölüm neyi çözüyor?

JavaScript kodunun kendi oluşturduğu object'lerle çalışması başka, metin olarak aldığı bir verinin **doğru olduğuna güvenmesi** başka bir problemdir. Örneğin bir JSON dosyasında aşağıdaki satır bulunabilir:

```json
{"id":"101","price":"49"}
```

Bu geçerli JSON'dur ama beklediğimiz `Product` modelindeki `id` ve `price` alanları number ise uygulama için uygun değildir. Bu bölümdeki dört ders, metinle başlayan veriyi kontrollü biçimde doğrulanan tipe taşımayı öğretir.

## 2. Pedagojik öğrenme sırası

| Sıra | Ders | Kazanım | Kavram |
|---|---|---|---|
| 14 | JSON Fundamentals | JSON metni ile runtime object'i ayır; sözdizimini oku. | Object, array, primitive türler |
| 15 | JSON.stringify — Serialization | Metne dönüşümü, veri kaybını ve hata ihtimalini açıkla. | JSON Fundamentals |
| 16 | JSON.parse — Parsing | Metni değere dönüştür; `SyntaxError`, `any` ve `unknown` ayrımını öğren. | JSON + serialization, try/catch |
| 17 | JSON Boundary & Validation | Type/shape, iş kuralı ve kontrollü `Result` modelini birleştir. | Parsing, narrowing, union type |

**Önerilen kullanım:** İlk kez öğreniyorsan sırayla oku. Tek bir kavramı unuttuysan ilgili dersi aç. Mülakat için her dosyanın **Mülakat hazırlığı** bölümünü, pratik için **Pekiştirme** bölümünü kullan.

## 3. Büyük resim: Üç ayrı doğruluk sorusu

```text
Dışarıdan gelen JSON metni (string)
           |
           v
      JSON.parse()
     /           \
SyntaxError     JavaScript değeri (unknown)
     |                 |
INVALID_JSON           v
                Object / property / type kontrolü
                  /              \
           INVALID_SHAPE       Product şekli
                                   |
                                   v
                            Business rules
                              /        \
                     INVALID_PRICE   Geçerli Product
                                          |
                                          v
                               { ok: true, value }
```

Bu örnekte üç soru birbirinden bağımsızdır:

1. **Syntax:** JSON doğru yazılmış mı? (`JSON.parse`)
2. **Shape/type:** Beklenen alanlar mevcut mu ve runtime tipleri doğru mu? (`unknown` + kontroller)
3. **Business rule:** Örneğin fiyat negatif değil mi? (uygulamanın iş kuralı)

`JSON.parse()` ikinci ve üçüncü soruya otomatik cevap vermez.

## 4. Temel ayrımlar — Kısa karşılaştırma

| Kavram | Ne yapar? | Ne yapmaz? |
|---|---|---|
| JSON | Veriyi metin formatında temsil eder. | JavaScript object'i olmak zorunda değildir. |
| `JSON.stringify()` | JavaScript değerinin JSON gösterimini üretir. | Bütün JavaScript değerlerini kusursuz saklamaz. |
| `JSON.parse()` | Geçerli JSON metnini JavaScript değerine dönüştürür. | TypeScript modeline uygunluğu kontrol etmez. |
| `unknown` | Doğrulanmamış verinin yanlışlıkla kullanılmasını zorlaştırır. | Veriyi kendi başına doğrulamaz. |
| Type guard | Gerçek runtime kontrolleriyle TypeScript'in tip daraltmasını sağlar. | Tek başına yazılan `value is T` ifadesi güvenlik garantisi değildir. |
| Business validation | Uygulamanın değer kurallarını uygular. | JSON parsing'in görevi değildir. |
| Discriminated union | Başarı ve hata sonucunu açık tiplere ayırır. | Kontrolleri sihirli biçimde gerçekleştirmez. |

## 5. Bütünleşik öğrenme örneği

Bu model bölümdeki dört dersin ortak noktasıdır:

```ts
type Product = { id: number; price: number };

type Result =
  | { ok: true; value: Product }
  | { ok: false; error: "INVALID_JSON" | "INVALID_SHAPE" | "INVALID_PRICE" };
```

- `'{"id":1,"price":49}'` → doğru syntax, doğru tip, doğru iş kuralı.
- `'{"id":1,}'` → yanlış JSON syntax.
- `'{"id":"1","price":49}'` → doğru syntax, yanlış shape.
- `'{"id":1,"price":-1}'` → doğru syntax ve tip, yanlış iş kuralı.
- `'{"id":1,"price":0}'` → **exact boundary**, geçerli.

Bu akışın gerçek TypeScript implementation'ı ve açıklamalı kodu Ders 17'de bulunur.

## 6. Bölüm sonunda kendini sınama

Kod çalıştırmadan şu soruları cevaplayabiliyor olmalısın:

1. JSON ile JavaScript object neden aynı şey değildir?
2. `undefined` object property ve array elemanı olarak `JSON.stringify()` tarafından nasıl ele alınır?
3. `JSON.parse()` neden her zaman object döndürmez?
4. `JSON.parse()` neden `SyntaxError` fırlatır?
5. `const p: Product = JSON.parse(text)` neden runtime validation değildir?
6. `null`, array ve primitive kök değerleri normal object'ten nasıl ayırırsın?
7. `price = 0` sınırında hangi yanlış koşul bug'a yol açabilir?
8. `INVALID_JSON`, `INVALID_SHAPE`, `INVALID_PRICE` arasındaki fark nedir?
9. Bir type guard içi `return true` olursa neden yeterli değildir?
10. Hangi durumda kontrollü result döndürür, hangi durumda beklenmeyen exception'ı gizlemezsin?

### Mini test tasarımı kontrolü

| Gereksinim | Normal test | Sınır / olumsuz test |
|---|---|---|
| Fiyat negatif olamaz | `price: 49` | `price: 0`, `price: -1` |
| Alanlar number olmalı | `id: 101` | `id: "101"` |
| Kök object olmalı | `{...}` | `null`, `[]`, `42` |
| JSON sözdizimi doğru | `{"id":1}` | `{"id":1,}` |

Test seçimi **gözlenebilir dış davranışa** dayanmalıdır. Implementation satırlarının birebir kopyalanması doğru test tasarımı değildir.

## 7. Mülakat için bir dakikalık genel açıklama

**Question: How do you safely handle JSON data in a TypeScript application?**

> First, I parse the JSON text and handle syntax errors. I then treat the result as untrusted `unknown` data, validate the required properties and their runtime types, and check relevant business constraints. Only after these checks do I use the value as a trusted application model. I prefer explicit success/error results for expected validation failures, and I test normal, boundary, and invalid inputs.

**Türkçe karşılığı:** Önce JSON'u parse ederim. Sözdizimi hatalarını ayrı ele alırım. Sonucu `unknown` kabul edip gerekli property'leri ve runtime tiplerini kontrol ederim. Sonrasında iş kurallarını doğrular, yalnız doğrulanan alanlarla sonucu oluştururum. Başarı ve hata yollarını ayrı test ederim.

## 8. Sözlük

- **JSON:** Yapılandırılmış veri için metin formatı.
- **Serialization:** Değer → JSON metni.
- **Parsing:** JSON metni → JavaScript değeri.
- **Trust boundary:** Dış/güvenilmeyen veri ile iç/doğrulanmış veri arasındaki sınır.
- **Runtime validation:** Program çalışırken gerçek değerin özelliklerini kontrol etme.
- **Narrowing:** Kontroller sonrasında TypeScript'in olası tipleri daraltması.
- **Discriminated union:** `ok: true | false` gibi ayırt edici bir alanla türleri ayırma.
- **Exact boundary:** `>= 0` için `0` gibi, kuralın tam sınırındaki değer.
