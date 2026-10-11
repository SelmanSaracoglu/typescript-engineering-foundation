# Ders 7 — `switch`, `case`, `break`, `return` ve fall-through

> **Öğrenme yolu:** [Dizin](../README.md) → [Bölüm 1](./README.md)  
> **Önkoşul:** [Strict equality](./01-equality.md), `if/else`, fonksiyonlarda `return` ve [Ternary](./06-ternary.md).

## 1. Switch hangi sorunu çözer?

Aynı değişkenin birden fazla olası değerine göre farklı davranış seçmek isteyebiliriz. Örneğin ödeme durumları:

- `"pending"` → Beklemede
- `"paid"` → Ödendi
- `"failed"` → Başarısız
- Diğer durumlar → Bilinmeyen durum

Bu kararı uzun bir `if / else if` zinciri ile yazabiliriz. Alternatif olarak tek bir ifadeyi çok sayıda `case` ile karşılaştıran **`switch` statement** kullanılabilir.

```ts
function paymentMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Payment pending";
    case "paid":
      return "Payment completed";
    case "failed":
      return "Payment failed";
    default:
      return "Unknown payment status";
  }
}

console.log(paymentMessage("failed")); // "Payment failed"
```

Bu fonksiyonda her bilinen durum için açık sonuç var. Bilinmeyen değerleri de `default` branch'i karşılıyor.

## 2. Switch nasıl değerlendirilir?

`switch (expression)` önce **expression değerini bir kez** değerlendirir. Ardından `case` etiketleriyle strict equality yaklaşımı üzerinden eşleşme arar. Eşleşen case'ten itibaren statement'lar yürütülür; `break`, `return` veya başka bir kontrol transferiyle durdurulabilir.

Sözdizimi:

```text
switch (expression) {
  case valueA:
    statements;
    break;
  case valueB:
    statements;
    break;
  default:
    statements;
}
```

**Önemli:** `case "failed":` satırında iki nokta (`:`) bulunur. `:` unutulursa syntax hatası oluşur.

### `switch` tür dönüştürür mü?

Hayır. `switch`, case eşleşmesinde loose equality (`==`) kullanmaz.

```ts
function identifyStatus(code: number | string): string {
  switch (code) {
    case 200:
      return "Numeric success";
    case "200":
      return "String success";
    default:
      return "Other";
  }
}
console.log(identifyStatus(200));   // "Numeric success"
console.log(identifyStatus("200")); // "String success"
```

Aynı karakterlere sahip string ve number, strict equality ile farklı değerlerdir.

## 3. `break` ve `return` aynı şey değildir

**`break`:** İçinde bulunulan en yakın `switch` veya loop'tan çıkar. Switch bir fonksiyonun içindeyse fonksiyon **devam edebilir**.

```ts
function processStatus(status: string): string {
  let message = "Unknown";
  switch (status) {
    case "paid":
      message = "Completed";
      break;
    case "failed":
      message = "Rejected";
      break;
  }
  return `Result: ${message}`;
}
console.log(processStatus("paid")); // "Result: Completed"
```

Burada `break` sonrası `return` satırı çalışır.

**`return`:** İçinde bulunduğu fonksiyon çağrısını sonlandırır.

```ts
function statusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Completed";
    default:
      return "Other";
  }
}
```

`return` kullanıldığı için ayrıca `break` gerekmez. İki kullanımı birlikte gereksiz yere yazmak okunabilirliği artırmaz.

## 4. Fall-through: `break` unutulunca ne olur?

```ts
function showRole(role: string): void {
  switch (role) {
    case "admin":
      console.log("A");
      // break yok!
    case "viewer":
      console.log("B");
      break;
    default:
      console.log("C");
  }
}
showRole("admin");
// A
// B
```

`"admin"` eşleştikten sonra JavaScript `"viewer"` case'inin koşulunu tekrar doğrulamaz. Yürütmeye aşağı doğru devam eder. Buna **fall-through** denir.

**Bu otomatik olarak hata değildir:** Bazen birden çok case aynı davranışı paylaşmalıdır:

```ts
function groupStatus(status: string): string {
  switch (status) {
    case "pending":
    case "processing":
      return "In progress";
    case "paid":
      return "Completed";
    default:
      return "Other";
  }
}
console.log(groupStatus("pending"));    // "In progress"
console.log(groupStatus("processing")); // "In progress"
```

Burada boş bırakılan case'ler bilinçli olarak aynı dönüşe bağlanmıştır.

## 5. `default`: bilinmeyen değerler için davranış

`default`, hiçbir case eşleşmezse kullanılan alternatiftir. Özellikle dışarıdan gelen status string'lerinde bilinmeyen değerin sessizce yanlış bir case'e dönüşmesini önlemek için açık `default` yararlıdır.

```ts
function severityText(severity: string): string {
  switch (severity) {
    case "low": return "Low priority";
    case "high": return "High priority";
    default: return "Unrecognized severity";
  }
}
```

Her switch için zorunlu değildir; örneğin başka bir mekanizma bilinmeyen durumları yönetiyorsa `default` tercihi buna göre yapılır. Ancak davranışın tanımlı olması test edilebilirliği artırır.

## 6. Switch ile `if/else` ve ternary karşılaştırması

| Durum | Genelde okunaklı seçenek |
|---|---|
| İki basit sonuç arasında değer seçimi | Ternary |
| Farklı aralıklar, karmaşık boolean koşullar | `if/else` |
| Tek expression'ın çok sayıda ayrık değerini karşılaştırma | `switch` |

Örneğin yaş aralıkları (`age >= 18 && age < 65`) için `if/else` daha doğaldır. Sabit string statüler için `switch` anlaşılır olabilir. **Tek doğru mekanizma yok; anlaşılır iş kuralı önemli.**

## 7. Scope ve TypeScript ayrıntısı

`switch` case etiketleri otomatik ayrı block scope oluşturmaz. Birden fazla case içinde aynı `const` ismini tanımlamak hata üretebilir. Gerekirse her case'i `{}` ile blokla:

```ts
function formatted(status: string): string {
  switch (status) {
    case "paid": {
      const message = "Paid successfully";
      return message;
    }
    case "failed": {
      const message = "Payment failed";
      return message;
    }
    default:
      return "Unknown";
  }
}
```

İşlevsel olarak `return` kullanılan basit case'lerde bu bloklamaya çoğu zaman gerek yoktur. Ama case içinde lokal değişken tanımlarsan scope konusunu hatırla.

## 8. Gerçekçi örnek: güvenlik olayı sınıflandırması

```ts
type EventStatus = "new" | "investigating" | "resolved";

function eventAction(status: EventStatus): string {
  switch (status) {
    case "new":
      return "Assign analyst";
    case "investigating":
      return "Continue triage";
    case "resolved":
      return "Archive case";
  }
}
```

`EventStatus` union'ındaki üç olasılığın hepsi karşılanmış. Böyle dar bir union'da tüm dallardan `return` çıkışı TypeScript tarafından kontrol edilebilir. Gerçekte dışarıdan doğrulanmamış bir string geliyorsa bu union yalnızca bir **tip iddiası** olarak kullanılmamalı; runtime validation gerekir.

## 9. Debugging: hangi hatayı hangi test yakalar?

| Bug | Test senaryosu | Beklenen |
|---|---|---|
| `break` unutuldu | `"admin"` branch'i | Yanlış ek çıktı olmamalı |
| `case` string/number karışıklığı | `200` ve `"200"` | Ayrı davranış |
| `default` eksikliği | `"unrecognized"` | Tanımlı fallback |
| Yanlış `return` konumu | `"failed"` | Fonksiyon hemen sona ermeli |

### İnceleme sırası

1. Switch expression'ın runtime değeri ve tipi nedir?
2. Hangi case eşleşiyor?
3. Case'in içinde `break` / `return` var mı?
4. Yürütme sonraki case'e sarkıyor mu?
5. Gereksinimde bilinmeyen durum davranışı tanımlı mı?

## 10. Mülakat hazırlığı

**Question: How does a switch statement work in JavaScript?**

> A `switch` evaluates one expression and matches it against case values using strict equality. Execution starts at the matching case. Without a terminating `break` or `return`, execution can fall through into following cases. `default` handles unmatched values.

**Türkçe:** Tek expression değerlendirilir, case değerleri strict equality ile eşleştirilir. Eşleşen case'ten başlayarak yürütülür; break/return olmazsa sonraki case'e sarkabilir.

**Question: What is the difference between `break` and `return`?**

> `break` exits the nearest switch or loop. `return` exits the current function and optionally returns a value.

## 11. Pekiştirme

1. `case "failed"` satırına hangi noktalama işareti gelmeli?
2. `switch` içinde `break` sonrasındaki fonksiyon kodu çalışabilir mi?
3. `case "admin"` içinde `break` yok, ardından `case "viewer"` geliyor. `"admin"` input'unda ne olur?
4. `200` ile `"200"` case'leri neden eşleşmez?

<details><summary>Kontrol cevapları</summary>

1. İki nokta (`:`).
2. Evet. `break` switch'i bitirir, fonksiyonu değil.
3. İlk case'in ardından diğer case'in statement'ları da çalışabilir (fall-through).
4. `switch` loose coercion kullanmaz, tipler farklıdır.
</details>

## 12. Bölüm kapanışı

Equality, truthiness, logical operators, short-circuit, nullish coalescing, ternary ve switch artık tek bir **karar akışı** içinde birbirine bağlanabilir. [Bölüm 1 README](./README.md) birikimli örnek, test matrisi ve genel mülakat yanıtıyla bu bağlantıyı pekiştirir.

> **Kanıt:** Bu belge öğretim kaynağıdır; testlerin çalıştırıldığı veya bağımsız yeterliliğin kanıtlandığı iddiası değildir.
