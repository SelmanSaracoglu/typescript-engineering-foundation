# Bölüm 1 — Value & Decision Mechanics: JavaScript'in karar verme temelleri

> **Öğrenme dizini:** [TypeScript Foundation Öğrenme Rotası](../README.md)  
> **Bölüm amacı:** Bir programın değerleri nasıl karşılaştırdığını, koşulları nasıl değerlendirdiğini ve hangi davranışı ne zaman seçtiğini açıklamak.

## 1. Bu bölüm niçin temel?

Kod okumak yalnızca sözdizimini tanımak değildir. Bir fonksiyonun aynı input için neden farklı output ürettiğini açıklayabilmemiz gerekir.

Şu hatalar ilk bakışta basit görünür, ama gerçek yazılım davranışını etkiler:

- `"101"` (string) ile `101` (number) aynı ID sayılması.
- `0` geçerli stok olduğu hâlde "stok yok" sayılması.
- `&&` yerine `||` yazarak erişim kontrolünün genişletilmesi.
- Kısa devre nedeniyle bir fonksiyonun hiç çalışmaması.
- `||` varsayılanının geçerli `false` ayarını ezmesi.
- Ternary içinde yanlış branch'in seçilmesi.
- `switch` içinde unutulan `break` yüzünden fall-through olması.

Bu yedi ders, bu hataların **neden** gerçekleştiğini anlamamız için birbirini tamamlar.

## 2. Öğrenme sırası ve dersler

| Sıra | Ders | Ne öğrenilecek? | Önkoşul |
|---|---|---|---|
| 1 | [Equality](./01-equality.md) | `===`, `!==`, `==`, `!=`, referans eşitliği | Tipler, değişkenler |
| 2 | [Truthy / Falsy](./02-truthy-falsy.md) | Koşullar değerleri nasıl yorumlar? | Equality, `if` |
| 3 | [Logical Operators](./03-logical-operators.md) | `&&`, `||`, `!`, gruplama | Truthiness |
| 4 | [Short-Circuit](./04-short-circuit.md) | Sağdaki expression neden çalışmayabilir? | Logical operators |
| 5 | [Nullish Coalescing](./05-nullish-coalescing.md) | `??` ile `0`, `false`, `""` değerlerini korumak | Truthiness + short-circuit |
| 6 | [Ternary](./06-ternary.md) | İki sonuç arasında expression ile seçim | Koşul mantığı |
| 7 | [Switch / Case](./07-switch-case.md) | Çoklu değer eşleştirme, `break`, `return` | Strict equality + control flow |

**Nasıl kullanılmalı?** İlk öğrenmede 1'den 7'ye sırayla ilerle. Konuyu unuttuğunda ilgili dosyanın **mekanizma**, **debugging** ve **mülakat** bölümlerine dön. Bütünleşik çalışma için aşağıdaki örneği kod çalıştırmadan analiz et.

## 3. Büyük resim: Tek bir değerden davranışa

```text
             INPUT
               |
               v
       Tip ve değeri belirle
               |
               v
   Equality / truthy-falsy kontrolü
               |
               v
    && / || / ! ile koşul kur
               |
               v
      Short-circuit var mı?
               |
               v
  Eksik veri için ?? fallback seç
               |
               v
    Ternary / switch / if ile
      sonuç veya branch seç
               |
               v
         OUTPUT / ERROR
```

**Bu bir zorunlu execution pipeline değildir.** Bir fonksiyon bütün bu operatörleri kullanmak zorunda değil. Şema kavramların kod okurken nasıl birbirine bağlandığını gösterir.

## 4. Karıştırılmaması gereken ayrımlar

| Kavram | Ne yapar? | Ne yapmaz? |
|---|---|---|
| `===` | Strict equality kontrolü | Object'leri deep compare etmez |
| `==` | Coercion içerebilen equality | Her zaman aynı tip üzerinden kıyaslama yapmaz |
| Truthy/falsy | Boolean bağlamda davranış belirler | İş kuralına göre "geçerli veri"yi kanıtlamaz |
| `&&` | İlk falsy operandı, yoksa son operandı döndürür | Her zaman boolean döndürmez |
| `||` | İlk truthy operandı, yoksa son operandı döndürür | Sadece nullish değerler için fallback yapmaz |
| `!` | Truthiness'in ters boolean sonucunu üretir | `!==` ile aynı operatör değildir |
| `??` | Sadece `null`/`undefined` için fallback | Negatif sayı, `NaN` veya başka yanlış veriyi doğrulamaz |
| Ternary | İki seçenekli expression sonucu üretir | Her karmaşık `if/else` için en okunaklı çözüm değildir |
| `switch` | Tek expression'ı sabit case değerleriyle eşler | Loose coercion kullanmaz; break otomatik değildir |

### `||` ve `??` için özel hatırlatma

```js
console.log(0 || 3);         // 3
console.log(0 ?? 3);         // 0
console.log(false || true);  // true
console.log(false ?? true);  // false
```

Bu dört çıktı şu temel soruyu zorunlu kılar: "Varsayılan değer gerçekten **eksik** olduğu için mi kullanılıyor, yoksa bütün **falsy** değerleri değiştirmek mi istiyoruz?"

## 5. Bütünleşik örnek: Test yürütme kararı

Bir test sistemimiz olsun. **İş kurallarını** önce net tanımlayalım:

1. Kullanıcı admin veya test sahibi olmalı.
2. Engellenmişse hiçbir test başlatamamalı.
3. `retries` verilmemişse varsayılan `3` kullanılmalı, ancak `0` geçerli olmalı.
4. İstek durumu `"queued"` ise ve retry sayısı `0` ise "No retries" bildirilmeli.
5. Durum `"running"` ise çalışıyor mesajı, `"done"` ise tamamlandı mesajı verilmeli.
6. Bilinmeyen durumlar kontrollü biçimde karşılanmalı.

```ts
type TestRequest = {
  status: string;
  retries?: number;
  isAdmin: boolean;
  isOwner: boolean;
  isBlocked: boolean;
};

function describeTestRequest(request: TestRequest): string {
  const isAuthorized =
    (request.isAdmin || request.isOwner) && !request.isBlocked;

  if (!isAuthorized) {
    return "Access denied";
  }

  const retries = request.retries ?? 3;

  switch (request.status) {
    case "queued":
      return retries === 0
        ? "Queued: No retries"
        : `Queued: ${retries} retries`;
    case "running":
      return "Test running";
    case "done":
      return "Test completed";
    default:
      return "Unknown status";
  }
}
```

### Adım adım çözümleme

Örnek girdi (yukarıdaki `TestRequest` tipi ve `describeTestRequest()` fonksiyonuyla birlikte çalıştırılır):

```ts
const request: TestRequest = {
  status: "queued",
  retries: 0,
  isAdmin: true,
  isOwner: false,
  isBlocked: false
};

console.log(describeTestRequest(request));
// "Queued: No retries"
```

1. `(true || false)` ifadesi `true` döndürür.
2. `!false` → `true`; dolayısıyla `true && true` → `true`.
3. Yetki kontrolünü geçer.
4. `retries ?? 3`: `0` nullish değildir, `0` korunur.
5. `switch` içindeki `"queued"` case'i eşleşir.
6. `retries === 0` true olduğu için ternary ilk sonucu döndürür.
7. Fonksiyon `"Queued: No retries"` sonucu ile tamamlanır.

### Test matrisi

| Senaryo | Kritik input | Beklenen |
|---|---|---|
| Yetkili admin | `isAdmin=true`, `isBlocked=false`, queued, retries 0 | `"Queued: No retries"` |
| Engellenmiş admin | `isAdmin=true`, `isBlocked=true` | `"Access denied"` |
| Yetkisiz kullanıcı | `isAdmin=false`, `isOwner=false` | `"Access denied"` |
| Varsayılan retry | `retries=undefined`, queued | `"Queued: 3 retries"` |
| Çalışan test | `status="running"`, yetkili | `"Test running"` |
| Bilinmeyen durum | `status="other"`, yetkili | `"Unknown status"` |

**Önemli sınırlama:** Bu örnek `retries = -1` değerini reddetmiyor. Eğer iş kuralı negatif tekrarı yasaklıyorsa **ayrı bir business validation** eklenmeli. `??`, iş kuralı doğrulaması yapmaz.

## 6. SDET, AppSec ve debugging bağlantısı

**SDET:** Doğru operatörü seçip seçmediğimizi kontrol etmek için happy path yanında exact boundary ve olumsuz testler yazarız. `retries=0` testi, yanlışlıkla `||` kullanılmasını yakalayabilir.

**Application Security:** `(isAdmin || isOwner) && !isBlocked` parantezleri erişim kuralını belirler. Operatör önceliği hatası kullanıcıya gereksiz yetki verebilir. Kodun çalışması, güvenlik gereksinimine uyduğu anlamına gelmez.

**Debugging:** Önce actual input değerini ve tipini, sonra expression değerlendirme sırasını, ardından seçilen branch'i takip ederiz. Fonksiyon hiç çağrılmadıysa short-circuit ihtimalini kontrol ederiz.

Bunlar bu derslerin uygulama bağlantılarıdır; yeni framework veya deployment kapsamı eklemez.

## 7. Bölüm sonu mülakat tekrarı

**Question: How does JavaScript decide which branch to execute?**

> JavaScript evaluates expressions based on their values and truthiness. Equality operators compare values, logical operators combine conditions and can short-circuit, and conditional expressions or statements select the path. I pay attention to coercion, operator precedence, nullish values, and whether a `switch` case can fall through.

**Türkçe:** JavaScript koşulları değerlerin ve tiplerin değerlendirmesine göre yürütür. Equality, truthiness, logical operators ve branch seçimi birlikte karar akışını belirler. Coercion, öncelik, nullish davranışı ve fall-through risklerini özellikle kontrol ederim.

### Mülakatta hatırlanacak birer cümle

- **Equality:** Strict equality loose coercion yapmaz; object identity ile içerik eşitliği farklıdır.
- **Truthy/Falsy:** Boolean bağlamdaki yorum veri doğrulaması değildir.
- **Logical Operators:** `&&`, `||`, `!` koşulları birleştirir; öncelik iş kuralını etkiler.
- **Short-Circuit:** Gerekmeyen sağ operand hiç değerlendirilmez.
- **Nullish Coalescing:** `??` geçerli `0`, `false`, `""` değerlerini korur.
- **Ternary:** Koşula göre iki expression'dan yalnız biri değerlendirilir.
- **Switch:** Case eşleşmesi strict'tir; çıkış yapılmazsa fall-through oluşabilir.

## 8. Bağımsız öğrenme kontrolü

Bu soruları kod çalıştırmadan çöz. Sonra gerekçeni açıklayabilirsen örneği çalıştırıp karşılaştır:

1. `0 || 5` ile `0 ?? 5` niçin farklı?
2. `"10" === 10` neden false?
3. İki ayrı `{id:1}` object'i strict equality ile eşit mi?
4. `false && sendNotification()` ifadesinde fonksiyon çağrılır mı?
5. `isAdmin || isOwner && !isBlocked` hangi sırayla yorumlanır?
6. `score >= 60 ? "Passed" : "Failed"` için 59, 60 ve 61 sonuçları?
7. `switch` case'inde `break` unutulursa olası sonuç nedir?
8. `retries=0` iken yanlış fallback seçilmesini hangi test yakalar?

<details><summary>Kısa cevap anahtarı</summary>

1. İlk ifade falsy gördüğü için `5`, ikincisi `0` nullish olmadığı için `0`.
2. Tipler farklıdır; strict equality coercion yapmaz.
3. Hayır, referansları farklıdır.
4. Hayır, sol operand falsy.
5. `isAdmin || (isOwner && !isBlocked)`; business rule için parantez gerekebilir.
6. `Failed`, `Passed`, `Passed`.
7. Bir sonraki case'in statement'ları da çalışabilir.
8. `retries=0` ve beklenen `0` korunumu testi.
</details>

## 9. Öğrenme durumu, kanıt ve sonraki bölüm

Bu bölümdeki yedi ders **teorik başvuru kaynakları** olarak hazırlanmıştır. Öğretici örneklerin doğru okunması ile bağımsız kod geliştirme, test çalıştırma, debugging ve başka bir göreve aktarma **aynı başarı ölçütü değildir**. Gerçek uygulama kanıtları I4 çalışma sürecinde, gözlenen yardım seviyesi H0–H4 ile ayrı değerlendirilmelidir.

**Sonraki kavramsal bölüm:** [Bölüm 2 — Modern Object & Array Syntax](../09-modern-object-array-syntax/README.md). Bu belgelerin mevcut içeriği daha sonra aynı pedagojik standarda göre yeniden düzenlenecektir.


---

> **Kalıcı müfredat notu:** Bu ders [TypeScript Foundation öğrenme rotasının](../README.md) parçasıdır. Dokümandaki önceki Increment/yardım durumları tarihsel bağlamdır; güncel bağımsız yeterlilik kanıtı değildir.
