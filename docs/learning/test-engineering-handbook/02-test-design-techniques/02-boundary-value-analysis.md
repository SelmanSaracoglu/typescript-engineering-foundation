# Boundary Value Analysis (BVA)

**Amaç:** Sıralı değer kümelerinde sınırların dahil edilip edilmediğine ilişkin off-by-one kusurlarını yakalamak.  
**ISTQB CTFL v4.0.1:** FL-4.2.2 (**K3**), **2-value** ve **3-value** BVA tanımları.

## 1. Technical Foundation

BVA, **ordered partitions** (sıralı ve aralık davranışı tanımlı sınıflar) için kullanılır. Bir partition'ın ilk/son elemanı sınır değeridir. Komşu partition'a geçişte yanlış karşılaştırma ve yanlış yuvarlama gibi kusurlar sıktır.

Kural: “Sipariş miktarı **10–20 dahil**, yalnız tam sayı olabilir.”

| Partition | Değerler | Beklenti |
|---|---|---|
| P1 | ..., 8, 9 | REJECT |
| P2 | 10, 11, ..., 19, 20 | ACCEPT |
| P3 | 21, 22, ... | REJECT |

**2-value BVA:** Her sınır değeri ve **komşu partition'daki en yakın değeri**. İki geçiş için **9,10,20,21**.  
**3-value BVA:** Her sınır değeriyle birlikte **iki komşusu**. İki geçiş için **9,10,11,19,20,21**.

Sıralı tam sayılarda komşu nettir. Ondalıklı veya sürekli domain'de hassasiyet ve en küçük adım belirsizse “10'un hemen altı” test verisi üretilmeden önce netleştirilmelidir. Bir tarih aralığında timezone, saat ve takvim günü politikası da aynı şekilde tanımlanmalıdır.

### CTFL coverage hesabı

- 2-value için payda, modelin **tanımlanmış boundary + adjacent partition neighbor** öğeleridir. Yukarıdaki örnekte 4 test öğesi vardır.
- 3-value için payda, **boundary + iki neighbor** öğeleridir. Yukarıdaki örnekte 6 öğe vardır.
- 3-value setinden 9,10,11,19 işletildiğinde 4/6 = **%66,7**.

Yalnız 10 ve 20'yi test etmek bu CTFL tanımıyla **tam 2-value coverage değildir**. 2-value ve 3-value farklı ölçütlerdir; sayıları aynı payda ile karşılaştırma.

## 2. Engineering Perspective

**Uygun:** Minimum/maksimum uzunluk, yaş, tutar, stok, indirim üst sınırı, fatura tarihi, süre veya hesaplama eşiği.

**Yetersiz:** DE/FR/NL gibi doğal aralık geçişi bulunmayan kategoriler (EP daha uygundur); iş koşulu kombinasyonları (decision table); işlem geçmişine bağlı davranış (state transition); yanlış veri tipi ve format kontrolü (ek negatif test).

**Yaygın hatalar:** Yalnız geçerli uçları çalıştırmak; min=10 için 9'u atlamak; aralık dahil mi sorusunu netleştirmemek; 100% BVA sonucunu tüm ürüne genellemek; para ve tarih hassasiyetini görmezden gelmek.

## 3. Practical Scenario — kusuru yakala

Beklenen kural: **10 ≤ miktar ≤ 20**. Hatalı kod: **10 < miktar ≤ 20**.

| Input | Expected | Hatalı sonuç | Defect saptandı mı? |
|---:|---|---|---|
| 9 | REJECT | REJECT | Hayır |
| 10 | ACCEPT | REJECT | **Evet** |
| 11 | ACCEPT | ACCEPT | Hayır |
| 20 | ACCEPT | ACCEPT | Hayır |
| 21 | REJECT | REJECT | Hayır |

Başka bir hata “sadece miktar=10 ise kabul et” olsaydı, 9 ve 10 testi tek başına hatayı kaçırabilirdi; **11** içeren 3-value alt sınır dizisi yakalayabilirdi.

**Debugging yaklaşımı:** Önce failure'ı tekrar üret, expected-result'ın iş kuralını doğrula, sonra koşuldaki operatörü ve input dönüşümünü incele. Hatalı sonucu “yeni expected” olarak kaydetme.

## 4. Interview Preparation

**Q1: What is boundary value analysis?**  
**A:** “It tests values at the edges of ordered equivalence partitions. It is effective for inclusive/exclusive and off-by-one mistakes.”

**Q2: How do 2-value and 3-value BVA differ in CTFL?**  
**A:** “Two-value BVA checks the boundary value and its closest neighbor in the adjacent partition. Three-value BVA also checks the neighboring value on the other side, which can reveal additional defects.”

**Q3: Why is BVA not enough for a payment amount?**  
**A:** “I would also verify input types, currency precision, cross-field business conditions, and failure responses. Boundary tests answer only a subset of the risks.”

## 5. CTFL Practice — özgün sorular

**S1 (K3):** 30–50 dahil tam sayı kuralı için 2-value BVA tam seti?  
A) {30,50} · B) {29,30,50,51} · C) {29,31,49,51} · D) {30,31,49,50}  
**Yanıt: B.** Her iki geçişte sınır ve dış komşu gerekir. A/C/D bu öğelerden bazılarını içermez.

**S2 (K3):** Aynı domain için 3-value BVA tam seti?  
A) {29,30,31,49,50,51} · B) {29,30,50,51} · C) {30,31,49,50} · D) {30,40,50}  
**Yanıt: A.** İki sınırın kendisi ve hem iç hem dış komşuları vardır.

**S3 (K2):** Neden ülke kodu alanına yaş gibi BVA uygulanmaz?  
A) Ülke kodları sıralı aralıkla tanımlanan iş davranışı içermeyebilir · B) BVA sadece API'de çalışır · C) Ülke kodları daima doğru · D) EP yasaktır  
**Yanıt: A.** Doğal order/boundary modeli yoksa partition bazlı teknik daha anlamlıdır.

## Sonuç

BVA sadece “uç değer yazmak” değildir: **iş kuralına dayalı partition geçişi ve seçilen 2-/3-value coverage kriterini** açıklamaktır.

Devam: [EP](01-equivalence-partitioning.md), [Decision Table](03-decision-table-testing.md).

[ISTQB CTFL v4.0.1 §4.2.2](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
