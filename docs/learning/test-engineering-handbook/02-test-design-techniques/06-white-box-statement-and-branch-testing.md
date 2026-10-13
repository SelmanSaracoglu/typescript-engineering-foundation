# 9. White-box Testing — Kodun hangi yolları çalıştı?

> **Bu bölümün sorusu:** Kodun bütün satırlarını çalıştırdıysak bütün davranışlarını sınamış olur muyuz?

## 9.1 İki farklı bakış açısı

Bir fonksiyonu düşünelim: `shippingFee`. İş kuralımız “aktif üyeye 100 € ve üzeri standart sepette ücretsiz kargo”.

**Black-box bakış:** Kodu görmek zorunda değilim; 99, 100, 101 €, aktif/pasif ve Express koşulları için **beklenen iş davranışını** doğrularım.

**White-box bakış:** Kodun içindeki kararların, dalların ve deyimlerin hangi testlerle çalıştırıldığını incelerim.

Bu iki yaklaşım birbirinin alternatifi değil: biri **doğruluğun dış ölçütünü**, diğeri **yapının hangi bölümlerinin çalıştığını** görünür kılar.

## 9.2 Küçük bir kodu birlikte okuyalım

Bu örnek için gereksinim yalnız şudur: Sepet tutarı 100 € veya üstüyse kargo ücretsiz; aksi halde 5 €.

~~~typescript
function shippingFee(total: number): number {
  let fee = 5;

  if (total >= 100) {
    fee = 0;
  }

  return fee;
}
~~~

Kodda şu davranışları gözleyebiliriz:

1. `fee` başlangıçta 5 olur.
2. `total >= 100` doğruysa `fee = 0` çalışır.
3. Değilse bu atama atlanır.
4. Son değer döndürülür.

**Neden iki test düşünmeliyiz?**

- `total = 120` → condition **true**, sonuç 0;
- `total = 20` → condition **false**, sonuç 5.

Bir test tek başına bütün karar yönlerini işletmiyor olabilir.

## 9.3 Statement coverage nedir?

**Statement (executable statement)**, çalıştırılabilir bir kod deyimidir. *Statement coverage* çalıştırılan deyimlerin toplam yürütülebilir deyimlere oranını ölçer.

**Temel düşünce:** `total=120` ile kodun gösterilen çalıştırılabilir deyimlerinin hepsine ulaşılabilir; çünkü ücretsiz kargo dalı da yürütülür. Böylece statement coverage %100 olabilir.

Ama bu, `total=20` davranışının doğru olduğunu göstermeyebilir; çünkü **false yönünü hiç denemedik**.

**Hassasiyet:** Gerçek coverage aracı farklı derleme/source-map ve dil yapılarını farklı sayabilir. Buradaki amaç belirli bir aracın sayaç formatı değil, **deyim yürütme ile karar yönlerini ayırabilmektir**.

## 9.4 Branch coverage nedir?

**Branch**, kontrol akışının ayrıldığı yoldur. Bu basit `if` için iki önemli sonuç düşünelim:

- condition true;
- condition false.

| Test | Condition | Çalışan davranış |
|---|---|---|
| total=120 | true | fee=0 |
| total=20 | false | fee=5 |

Sadece total=120 denenmişse bu basit kararın **1/2 yönü** işletilmiştir: %50. Her ikisiyle **2/2**: %100.

Branch coverage genel anlamda kontrol akışındaki dalları sayar; bütün dil yapıları sadece if'in iki yönüne indirgenemez. Ancak başlangıç için doğru zihinsel model budur.

**Kritik ilişki:** %100 **branch coverage**, yürütülebilir statement'ların da kapsanmasını sağlar; fakat %100 **statement coverage**, bütün branch'lerin işletildiğini garanti etmez.

## 9.5 %100 branch coverage neden güvence değil?

Kodu hafifçe yanlış yazalım:

~~~typescript
function shippingFee(total: number): number {
  let fee = 5;
  if (total > 100) { // yanlış: 100 dahil olmalıydı
    fee = 0;
  }
  return fee;
}
~~~

Şu testler çalışıyor:

- 120 → 0 (true dalı);
- 20 → 5 (false dalı).

**Her iki branch çalıştı**, hatta assertion'larımız geçti. Ama **100** hiç denenmedi. Koddaki `>` yerine `>=` olmalıydı.

Yani **%100 branch coverage olsa da sınır kusuru saklanabilir**.

Çözüm? Kodu rastgele daha fazla çalıştırmak değil; **onaylı gereksinime göre BVA testi** eklemek:

- 99 → 5;
- **100 → 0**;
- 101 → 0.

100 testi başarısız olacak, defect görünür hale gelecek.

### Daha ciddi bir sorun: eksik iş kuralı

Asıl kural “yalnız aktif üye, 100 € ve üzeri, standart kargo” ise, yukarıdaki fonksiyonda **üyelik ve kargo tipi kontrolü hiç yok**. Var olan kodun %100 çalıştırılması, olmayan bir şartın doğrulandığını kanıtlamaz.

Bu yüzden **requirement-based test** ve **structure-based test** birbirini tamamlar.

## 9.6 Coverage ile assertion'ı ayır

Şu test iyi görünmez:

~~~typescript
test("shippingFee executes", () => {
  shippingFee(120); // hiçbir expected result kontrolü yok
});
~~~

Bu test kodu çalıştırabilir; ama sonuç yanlış olsa bile sessizce geçebilir.

Daha anlamlı:

~~~typescript
test("100 EUR qualifies for free shipping", () => {
  expect(shippingFee(100)).toBe(0);
});
~~~

**Birinci kontrol:** Test kodu bir yeri **yürüttü mü?**  
**İkinci kontrol:** Doğru sonucu **doğruladı mı?**

Sadece metrik için test yazmak kötü optimizasyondur. Aynı zamanda assertion olması testin oracle'ının doğru olduğunu otomatik garanti etmez; beklenen 0'ın kaynağı kural olmalıdır.

## 9.7 Karar sayısı büyürse

Örneğin:

~~~typescript
function canEdit(active: boolean, owner: boolean): boolean {
  if (!active) return false;
  if (!owner) return false;
  return true;
}
~~~

Üç pratik test tasarlayalım:

| active | owner | Expected | Neden önemli? |
|---|---|---|---|
| false | true | false | İlk guard |
| true | false | false | İkinci guard |
| true | true | true | İzin verilen yol |

Böylece kodun iki `if` kararının true/false olabildiğini gözleriz. Ancak `false,false` kombinasyonu ayrıca iş kuralı açısından önemli olabilir. Branch coverage'ın tüm Boolean kombinasyonları otomatik kapsadığını iddia etmeyiz.

Bu farkı [Decision Table](03-decision-table-testing.md) bölümündeki koşul kombinasyonu mantığıyla bağla.

## 9.8 Nerede ne kadar kullanılır?

**White-box bilgisi faydalıdır**:
- yeni eklenen koşulların hiç test edilmediğini görmek için;
- refactoring sırasında eksik error path'leri belirlemek için;
- kaynak kodun karmaşık kısmında riskli kontrol akışını anlamak için.

**Tek başına yetersizdir**:
- kullanıcı beklentisini doğrulamak;
- yetki ve gizlilik sınırlarını kapsamlı ölçmek;
- ürünün dış sistemle doğru çalıştığını göstermek;
- performans, kullanılabilirlik veya gerçek kullanım kalitesini değerlendirmek için.

Bu bölümün amacı Vitest/Cypress konfigürasyonu kurmak değildir. O araçlarla gerçek coverage raporu üretme daha sonraki kod pratiğinde ele alınır.

## 9.9 Alıştırma

~~~typescript
function access(active: boolean, admin: boolean): string {
  if (!active) return "DENY";
  if (admin) return "ADMIN";
  return "USER";
}
~~~

**Görev:**
1. Hangi üç input çifti üç farklı sonucu görür?
2. `active=false, admin=true` için sonuç nedir?
3. Üç farklı sonucu görmek tüm kombinasyonları kapsamak mıdır?

**Örnek çözüm:**
1. (false,false) → DENY; (true,true) → ADMIN; (true,false) → USER.
2. DENY; ilk guard işlemi bitirir.
3. Hayır. `(false,true)` kombinasyonu denenmedi; iş riskine göre ayrıca test edilebilir.

## Sonraki bölüm

Kodun iç kontrol akışını görebiliyoruz. Son önemli düşünce: Doğru iş beklentisini **kod yazılmadan önce ekipçe** nasıl ortaklaştırırız?

→ [10. User Stories, Acceptance Criteria & ATDD](07-collaboration-user-stories-and-atdd.md)
