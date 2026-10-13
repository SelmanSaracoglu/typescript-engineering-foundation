# Decision Table Testing

**Amaç:** Birden fazla iş koşulunun farklı kombinasyonlarını sistematik test etmek.
**ISTQB CTFL v4.0.1:** FL-4.2.3 (**K3**).

## 1. Technical Foundation

Bir **decision table**, koşulların ve bu koşullara bağlı eylemlerin farklı kurallarını gösterir. **Bir sütun = bir karar kuralı.** Limited-entry tabloda koşullar genelde **T** (true), **F** (false), **–** (irrelevant/don't care), **N/A** (feasible değil) ile ifade edilir. Eylem için **X** uygulanacağını, boş hücre uygulanmayacağını gösterebilir.

Kural: “Müşteri **aktif üyeyse** ve sepet tutarı **100 € veya üstüyse**, standart kargo ücretsizdir. Diğer durumlarda ücretlidir.”

| Koşul / Action | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Üyelik aktif mi? | T | T | F | F |
| Sepet ≥ 100 € mi? | T | F | T | F |
| FREE shipping | X |  |  |  |
| PAID shipping |  | X | X | X |

Bütün dört kombinasyon bu örnekte **feasible** olsun. Test cases:

| Test | Üyelik | Tutar | Expected |
|---|---|---:|---|
| TC1 | aktif | 120 | FREE |
| TC2 | aktif | 80 | PAID |
| TC3 | pasif | 120 | PAID |
| TC4 | pasif | 80 | PAID |

**Coverage = işletilen uygulanabilir karar sütunları / toplam uygulanabilir sütunlar × 100.** Yalnız TC1–TC3 çalıştırıldıysa **3/4 = %75**. Kaç satır veya kaç assertion olduğu bu payda değildir.

### Tam kombinasyon, imkânsız ve önemsiz koşullar

Üç bağımsız Boolean koşulun teorik sayısı **2³=8**. Ancak bazı kombinasyonlar iş kurallarına göre imkânsız olabilir: siparişin aynı anda “iptal edilmiş” ve “teslim edilmiş” olması gibi. Bunlar **N/A** olabilir, feasible coverage paydasına konmaz. Sonucu etkilemeyen koşul **–** ile gösterilerek birden fazla sütun birleştirilebilir; fakat kararların gerçekten aynı sonuç verdiğine emin olmadan sadeleştirme yapılmaz.

**Extended-entry decision table** sadece Boolean değil, çok değerli koşullar da barındırabilir: BASIC/PREMIUM, 0–99/100+, vb.

## 2. Engineering Perspective

**Ne zaman uygun?** Authorization role × ownership, kampanya planı × süre × tutar, iade tipi × sipariş state'i, riskli backend iş kuralları.

**Ne zaman gereksiz?** Tek bir sayısal aralıkta BVA çoğu zaman daha ekonomiktir; event sırası önemliyse state transition gerekir. Decision table kod branch coverage yerine geçmez; kural kombinasyonlarını test eder.

**Yaygın hatalar:**
- Her koşulu yalnız tek başına test edip etkileşimleri atlamak.
- Feasible olmayan satırları körlemesine test etmek.
- Yetkisiz varyasyonların state yan etkisini kontrol etmemek.
- Tüm kombinasyonları azaltırken kritik bir iş kuralını birleştirmek.
- Belirsiz bir sonuç sütununda expected result'ı mevcut koddan çıkarmak.

### Risk kararı

10 koşul varsa teorik 1.024 kombinasyon mümkündür. Hepsini çalıştırmadan önce uygulanamazları çıkar, aynı sonuca giden koşulları gerekçeli birleştir, kalan kombinasyonlarda risk temelli öncelik uygula. “Her şeyi test ettim” iddiası kurma.

## 3. Practical Scenario — yeni kural geldi

Yeni şart: “**Express shipping** her durumda ücretli.”

Bir üçüncü koşul ekle: Express? **T** ise üyelik ve tutar ne olursa olsun PAID, **F** ise eski dört sütunun sonucu geçerli. Tam tablo sekiz feasible kombinasyona genişleyebilir. Express=T için iki diğer koşul sonuç açısından önemsiz olduğundan gerekçeli biçimde **tek don't-care sütunu** ile gösterebilirsin.

Buna rağmen yüksek riskli kullanıcı tipleri için bağımsız doğrulama isteyebilirsin. Test teknikleri risk kabulünün yerine geçmez.

## 4. Interview Preparation

**Q1: When do you use decision table testing?**  
**A:** “When behavior depends on combinations of business conditions. Decision tables expose missing or contradictory rules and provide systematic test cases for feasible combinations.”

**Q2: What do a dash and N/A mean?**  
**A:** “A dash means that the condition does not affect the outcome for that rule. N/A means the combination is infeasible. They are not interchangeable.”

**Q3: How would you reduce a large decision table?**  
**A:** “I would remove impossible combinations, merge rules only when a condition is irrelevant, and prioritize remaining combinations by risk while documenting the gaps.”

## 5. CTFL Practice — özgün sorular

**S1 (K3):** Dört feasible kuraldan üçü test edildi. Coverage?  
A) %25 · B) %50 · C) %75 · D) %100  
**Yanıt: C.** 3/4; koşul sayısı değil kural sütunu sayılır.

**S2 (K2):** Decision table'da “–” ne demektir?  
A) Kural imkânsız · B) Bu koşul sonuca etkisiz · C) Başarısız test · D) Veri yok ve geçersiz  
**Yanıt: B.** İmkânsız durum için N/A kullanılır.

**S3 (K3):** Aktif üye ve ≥100 € ücretsiz kargo kuralında hangi set dört kombinasyonu test eder?  
A) aktif-120, aktif-130, pasif-140, pasif-150 · B) aktif-120, aktif-80, pasif-120, pasif-80 · C) aktif-80, pasif-80 · D) aktif-120, pasif-80  
**Yanıt: B.** İki Boolean koşulun TT/TF/FT/FF kombinasyonları temsil edilir.

## Sonuç

Decision table, “her koşulu denedim” değil **uygulanabilir koşul kombinasyonlarını gözlenebilir sonuçlarla eşleştirdim** demektir.

Devam: [EP](01-equivalence-partitioning.md), [State Transition](04-state-transition-testing.md), [ATDD](07-collaboration-user-stories-and-atdd.md).

[ISTQB CTFL v4.0.1 §4.2.3](https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
