# Ders 11 — Multiple Conditions: Doğru Branch Nasıl Seçilir?

## 1. Problem ve gereksinim

Tek bir `if` çok basit görünür. Ancak “kullanıcı aktif olacak, skoru en az 60 olacak; devre dışıysa ayrıca sebep gösterilecek” gibi bir gereksinimde kararların **önceliği** sonucu etkiler. Bir branch'in çalışıp return etmesi, sonraki condition'ların hiç değerlendirilmemesine neden olabilir.

## 2. Kavram / çalışma modeli

Bir condition boolean bağlamda değerlendirilir. `if / else if / else` **zinciri** ilk uygun branch'e göre yürür; bağımsız iki `if` ayrı ayrı çalışabilir. `&&` iki koşulu, `||` alternatif koşulları, `!` boolean'ın tersini ifade eder. Bu derste operandlarımız boolean karşılaştırmalardır; `&&` ve `||` için JavaScript'in genel operand-döndürme ayrıntısına geçmiyoruz.

## 3. Açıklamalı TypeScript örneği

```ts
type Candidate = { active: boolean; score: number };
function classify(user: Candidate): string {
  if (!user.active) {
    return "inactive";
  }
  if (user.score >= 60) {
    return "qualified";
  }
  return "below-threshold";
}

console.log(classify({ active: false, score: 100 })); // inactive
console.log(classify({ active: true, score: 60 }));   // qualified
console.log(classify({ active: true, score: 59 }));   // below-threshold
```

## 4. Iteration ve execution trace

İlk çağrıda `!user.active` true olduğu için "inactive" döner. Skor 100 olsa bile ikinci kontrol **çalışmaz**. İkinci çağrıda inactive branch'i geçilir; skor 60 eşit sınır olduğu için qualified olur. Üçüncü çağrıda iki kontrol de return etmediği için son satır below-threshold döner.

| active | score | İlk check | Skor check | Sonuç |
| --- | ---: | --- | --- | --- |
| false | 100 | true | çalışmaz | inactive |
| true | 59 | false | false | below-threshold |
| true | 60 | false | true | qualified |
| true | 100 | false | true | qualified |

## 5. İkinci örnek ve mekanizmanın sınırı

**Sırayı ters yazmanın etkisi:**

```ts
function wrong(user: Candidate): string {
  if (user.score >= 60) return "qualified";
  if (!user.active) return "inactive";
  return "below-threshold";
}
console.log(wrong({ active: false, score: 100 })); // qualified: yanlış!
```

Kullanıcı inactive olsa bile skor 100 kontrolü önce seçildi. Bu, TypeScript type error değildir; iş kuralına aykırı kontrol sırası bug'ıdır.

**Bağımsız iki if:**

```ts
const active = true;
const score = 100;
if (active) console.log("active");
if (score >= 60) console.log("qualified");
// active
// qualified
```

Burada iki mesaj da istenebilir. Yalnız bir sınıf dönecekse return'lü zincir daha uygun olur.

**Birleşik koşul:**

```ts
const allowed = active && score >= 60;
console.log(allowed); // true
```

`false && ...` durumunda sağ operand değerlendirilmez (short-circuit). Bu kod iki kontrolü yalnız **tek boolean sonuçta** birleştirir; inactive ve low-score gibi farklı hata nedenlerini ayrı raporlamaz.

## 6. Kritik ayrımlar ve sınır durumları

**Sınır:** `score=59`, `60`, `61` için `>=` ile `>` farkını kontrol et. **Boş/yanlış veri:** TypeScript `Candidate` tipi dış girdinin runtime biçimini otomatik doğrulamaz; bu dersin koşulları doğru tipte object'e uygulanır. **Öncelik:** Stok/aktiflik gibi hard-stop kararlarını gereksinim önceliğine göre sıralamak gerekir. **Negation:** `!user.active` active boolean false olduğunda true olur; tersini yazarsan dal anlamı değişir.

## 7. Debugging — kontrollü hata araştırması

Belirti: 100 puanlı inactive kullanıcı qualified dönüyor. Hipotez: skor branch'i önce çalışıyor. Debugger ile `score>=60` true olduğunda return satırına ulaşılıp ulaşılmadığına bak. Minimal düzeltme: inactive guard'ını öne al. Regression: inactive/100, active/59, active/60 ve active/100 test et. Rastgele bütün condition'ları `&&` ile birleştirme; hata açıklaması da gereksinimin parçası olabilir.

## 8. Mülakat ve cevaplı pekiştirme

**Question:** Why can changing the order of if statements change behavior? **Answer:** An early return ends the invocation, so later checks may never execute.

**Kendi kendine:** (1) active=false, score=10 sonucu? (2) active=false, score=100 için yanlış sürümün hatası? (3) Tek boolean sonuçla hata nedeni bilgisi korunabilir mi? (4) `score > 60` yazılsaydı tam 60 ne olurdu?

<details><summary>Kontrol cevapları</summary>

1. inactive. 2. Qualified diye yanlış kabul eder. 3. Hayır; tek true/false sonuç sebebi ayırmaz. 4. Qualified yerine below-threshold döner.

</details>

## 9. Rehberli senaryo: yetki ve aktiflik birbirine karışmasın

Bir endpoint'e erişim için kullanıcı hem aktif hem admin olmalıdır.

```ts
type Access = { active: boolean; role: "admin" | "viewer" };

function reason(user: Access): string {
  if (!user.active) return "ACCOUNT_DISABLED";
  if (user.role !== "admin") return "INSUFFICIENT_ROLE";
  return "ALLOWED";
}
console.log(reason({ active:false, role:"admin" })); // ACCOUNT_DISABLED
console.log(reason({ active:true, role:"viewer" })); // INSUFFICIENT_ROLE
console.log(reason({ active:true, role:"admin" })); // ALLOWED
```

**İki kontrol farklı sorulara cevap verir:** Account açık mı? Role yeterli mi? Function'ın return değeri yalnız boolean olmadığı için reddin nedenini de bildirir.

| active | role | İlk check | Result |
| --- | --- | --- | --- |
| false | admin | disabled | ACCOUNT_DISABLED |
| false | viewer | disabled | ACCOUNT_DISABLED |
| true | viewer | devam | INSUFFICIENT_ROLE |
| true | admin | devam | ALLOWED |

**Risk:** İlk koşulun `user.role === "admin"` olması hâlinde inactive admin yanlışlıkla kabul edilebilir. İki koşulun birlikte gerekli olması sorumluluğu kodda açık tutulmalıdır.

### Bağımsız transfer

Yeni kural: Admin olmak yetmez; `verified` alanı da true olmalıdır. Önce expected truth table oluştur. Hangi durumda `ACCOUNT_DISABLED`, hangi durumda `INSUFFICIENT_ROLE`, hangi durumda yeni `NOT_VERIFIED` döneceğini sıralı tasarla.

<details><summary>Kontrol</summary>

Öncelikler gereksinime göre belirlenir. Örnekte inactive önce, sonra role, sonra verified kontrol edilebilir. Her error code için en az bir negatif ve bir pozitif case düşün.

</details>
