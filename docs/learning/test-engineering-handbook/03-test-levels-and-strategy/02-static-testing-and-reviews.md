# 12. Static Testing — Kod çalışmadan nasıl kusur buluruz?

> **Temel soru:** Ortada henüz çalışan bir ürün yokken testing yapılabilir mi?

Önceki derste testing düşüncesinin geliştirme sürecinin başında yer alabildiğini gördük. Şimdi bunu somut bir yöntemle uygulayacağız: **static testing**.

## 12.1 İki cümlelik bir gereksinimi inceleyelim

MiniShop ekibine şu talep geliyor:

> “Premium müşteriler, uygun siparişlerini kısa süre içinde ücretsiz iade edebilir. İade talebi ürün tesliminden sonra 14 gün içinde yapılmalıdır.”

Bu metin henüz kod değil. Yine de inceleyince sorular ortaya çıkıyor:

- **Premium müşteri** tanımı nedir? Geçmişte premium olup şimdi olmayanlar?
- **Uygun sipariş** hangi state'leri kapsar? CREATED sipariş de dahil mi?
- **Kısa süre** ne kadar? Yanıtın kaç saniyede gösterilmesi mi, iadenin kaç günde işlenmesi mi?
- **14 gün** içinde ifadesi 14. günü kapsıyor mu? Hangi saat dilimi?
- **Ücretsiz** olan ne? İade kargo bedeli mi, iade işlemi mi?

Bir tester bu soruları *kod yazılmadan* sorduğunda yanlış anlaşılabilecek noktaları yakalamış olur. İşte **static testing**'in temel gücü budur.

## 12.2 Static testing ile dynamic testing farkı

**Static testing**, bir iş ürününü **çalıştırmadan** inceleyip değerlendirmektir. Bu ürün; requirement, user story, tasarım, kod, test case, veri modeli veya kullanıcı dokümantasyonu olabilir.

**Dynamic testing** ise çalışan yazılımın/uygulamanın bir davranışını yürütüp gözlemlemeyi gerektirir.

| İncelediğimiz şey | Static örneği | Dynamic örneği |
|---|---|---|
| Gereksinim | “14 gün” belirsizliğini fark etmek | 14. ve 15. gün iade talebini çalıştırmak |
| Kod | Hatalı karşılaştırmayı gözden geçirmek | 100 € girdisiyle yanlış sonucu görmek |
| API contract | Alanın tip ve zorunluluklarını kontrol etmek | Response body'sindeki gerçek tipi kontrol etmek |
| Test case | Expected result'ın kaynağını sorgulamak | Testi çalıştırıp actual ile karşılaştırmak |

**Önemli:** Static testing, “manuel testing” demek değildir. İnsanların yaptığı incelemeler de, **static analysis** araçlarının kodu çalıştırmadan yaptığı kontroller de statik olabilir. Ayrıca review yorumu bir **anomali** olabilir; görüşme sonunda bunun gerçekten defect olup olmadığı netleşir.

### Static analysis örneği

Kodda tanımlanmış ama kullanılmayan bir değişken, erişilemeyen kod veya belirli veri akışı hatası araçla işaretlenebilir. Bu otomatik uyarı, sistemin çalışma anında kesin hata vereceğinin kanıtı değildir. Uyarıyı bağlamıyla değerlendirmek gerekir.

## 12.3 Review hangi aşamalardan oluşur?

Diyelim yukarıdaki iade gereksinimini ekipçe inceleyeceğiz. Gelişigüzel “bir bakıp geçmek” yerine makul bir düzen yararlıdır:

**1. Planning:** Neyi, neden ve ne kapsamda inceleyeceğiz? Örneğin 14 gün kuralı, sipariş state'leri ve müşteri statüsü.

**2. Review initiation:** Güncel belge ve karar geçmişi herkeste var mı? Katılımcılar incelemeyi nasıl yapacağını biliyor mu?

**3. Individual review:** Her katılımcı kendi başına okur, sorularını ve olası sorunları kaydeder. Bağımsız hazırlık, toplantıda ilk konuşanın herkesin görüşünü şekillendirmesini azaltabilir.

**4. Communication and analysis:** Bulgular konuşulur. Hangisi gerçek defect, hangisi açıklama ihtiyacı, hangisi yeni ürün kararı? Bunlar ayrılır.

**5. Fixing and reporting:** Belgenin yazarı gerekli düzeltmeleri yapar; kayıtlar, kararlar ve kapanış durumu raporlanır.

Bu sıra gereksinim review'undan teknik tasarım incelemesine kadar uyarlanabilir. Her küçük değişiklikte ağır toplantı yapmak zorunlu değildir; **formaliteyi risk belirler**.

## 12.4 Bir review'u adım adım yürütelim

**İlk metin:**

> “Premium müşteriler, uygun siparişlerini teslimden sonra 14 gün içinde iade edebilir.”

**Aşama A — Bireysel bulgular**

Tester:
- “14. gün dahil mi?”
- “Uygun state'ler hangileri?”
- “İade hakkı kime ait, sipariş sahibine mi?”

Developer:
- “Üyelik statüsünü sipariş gününde mi, başvuru gününde mi okumalıyız?”
- “Zaman hesabını hangi timezone ile yapacağız?”

Product owner:
- “Premium üyeler için teslim edilmiş siparişlerde 14 takvim günü **dahil**; başvuruyu sipariş sahibi yapar.”

**Aşama B — Hâlâ açık kalan karar**

“Üyelik başvuru gününde sona erdiyse ne olur?” sorusunun yanıtı yoksa bunu *uydurup* şartnameye yerleştirmiyoruz; açık karar olarak kaydediyoruz.

**Aşama C — Düzeltilmiş kabul örneği**

> “Başvuru anında Premium statüsünde olan sipariş sahibi, DELIVERED durumundaki siparişi için teslimat gününden başlayarak 14 takvim günü dahil iade başvurusu açabilir. Takvim gününün değerlendirilmesinde [ürünün onaylanmış timezone kuralı] kullanılır.”

Bu metindeki köşeli bölüm, **tamamlanmamış kararı** görünür kılar. Onay geldiğinde doldurulur. Review'un değeri, kusuru kodda aramadan önce requirement'taki açıklık sorununu çözmesidir.

## 12.5 Review türleri neden farklı?

Bütün review'lar aynı formalitede değildir.

| Review türü | Pratik karakteri | Uygun örnek |
|---|---|---|
| **Informal review** | Hafif, resmî süreç şart olmayabilir | Küçük user story'ye hızlı ekip yorumu |
| **Walkthrough** | Yazar iş ürününü diğerlerine adım adım anlatır | Yeni checkout tasarımını ekipçe anlamak |
| **Technical review** | Teknik uzmanların, moderasyonla seçenek ve doğruluğu tartışması | Ödeme transaction sınırı ve retry tasarımını incelemek |
| **Inspection** | En formal; tanımlı roller, adımlar, kayıt ve kriterler | Yüksek riskli, izlenebilirliği kritik iş ürünü |

Bunlar “kötüden iyiye” bir sıralama değildir. **Inspection her iş için en doğru seçenek olmayabilir**; maliyet ve risk önemlidir.

### Walkthrough ne zaman özellikle işe yarar?

Yeni bir developer, kampanya fiyatlandırma akışını çizip ekibe anlatıyor olsun. Diğerleri sorular sorarak anlaşılmayan noktaları keşfeder. Bu **öğrenme ve ortak anlayış** için değerlidir.

### Technical review ne zaman?

Ödeme servisinde retry mekanizmasının nereye yerleştirileceğine karar veriliyor: API gateway mi, order service mi? Review, teknik alternatifleri, trade-off'ları ve kanıtı konuşmaya odaklanır.

### Inspection neden daha formal?

Belirli roller, ön hazırlık, çıkış ölçütleri ve ölçümlerle sistematik inceleme yapılır. Özellikle süreç veya mevzuatın güçlü kayıt istediği durumlarda değeri artabilir.

## 12.6 Review rollerini bir toplantı üzerinden öğrenelim

Bir review'da aynı kişi farklı sorumluluklar üstlenebilir:

- **Author:** İncelenen ürünü yazdı; gerekli düzeltmeleri uygular.
- **Reviewer:** Sorunları, tutarsızlıkları ve önerileri arar.
- **Moderator / facilitator:** Görüşmeyi yapıcı ve planlı yürütür.
- **Scribe / recorder:** Bulguları ve kararları kaydeder.
- **Review leader:** Review'un organizasyonunu, kapsamını ve katılımcılarını yönetir.
- **Manager:** Kaynak sağlar, hangi incelemelerin yapılacağına ilişkin yönetim sorumluluğu taşır.

Roller küçük ekipte birleşebilir. Ancak **formal inspection**'da tarafsızlık ve kayıt sorumluluğu için ek rol kısıtları bulunur; yazarın review leader veya scribe olmaması beklenir.

**Yaygın hata:** Review'u “yazarın performans değerlendirmesi” gibi yürütmek. Amaç kişiyi yargılamak değil, **iş ürünündeki kusurları bulmak ve iyileştirmek** olmalıdır.

## 12.7 Etkili review nasıl yapılır?

Teknik incelemenin başarısı şu ayrıntılara bağlıdır:

1. **Açık hedef:** “İade hakları ve son gün hesabında ambiguity bul.”
2. **Doğru uzmanlık:** Alan bilgisi olan product owner, developer ve tester.
3. **Yeterli ama sınırlı kapsam:** 200 sayfayı son dakika herkese göndermek yerine anlamlı küçük parçalar.
4. **Bireysel hazırlık:** Toplantı sırasında ilk kez okumaya mecbur bırakmamak.
5. **Gerekçeli kayıt:** “Bu yanlış” yerine “R-02 ile R-04 çelişiyor, hangisi geçerli?”
6. **Düzeltmenin takibi:** Review yapıldı diye issue kapatmak yerine yeni metni doğrulamak.

### Static testing neyi tek başına söyleyemez?

Bir SQL sorgusu review'da doğru görünebilir ama gerçek veri hacminde yavaş çalışabilir. Bir requirement kesin olabilir ama uygulama onu yanlış kodlamış olabilir. Static ve dynamic testler **birbirini tamamlar**.

## 12.8 Alıştırma — kendi requirement review'unu yap

İncelemen için metin:

> “Kullanıcılar siparişlerini istediği zaman iptal edebilir. Kargoya verilen siparişler iptal edilemez. İptal işlemi hemen gerçekleşir ve ücret kısa zamanda iade edilir.”

**Görev:** Bir çelişki, iki belirsizlik ve bir test edilebilir kabul örneği öner.

**Örnek çözüm:**
- Çelişki: “İstediği zaman” ile “kargoya verilince iptal edilemez” birlikte açık biçimde sınırlandırılmalı.
- Belirsizlik 1: “Hemen” kaç saniye içinde?
- Belirsizlik 2: “Kısa zamanda” ücret iadesi kaç iş günü içinde; başlangıç olayı ne?
- Kabul örneği: “Given PAID but not SHIPPED order; When owner cancels; Then order becomes CANCELLED and refund process starts.” İadenin tamamlanma süresi ayrıca onaylanmadan test oracle olarak yazılamaz.

**Kazanım:** Kod çalışmasa bile *kusur riski* ve *beklenti eksikliği* hakkında yararlı kanıt üretebiliyoruz.

## Sonraki ders

Şimdiye kadar testin **ne zaman** ve **hangi iş ürünü üzerinde** başladığını gördük. Artık çalışan sistemde hangi sınırın test edildiğini sınıflandıracağız.

→ [13. Test Levels & Types](03-test-levels-and-types.md)
