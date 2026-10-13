# 2. Verification, Validation ve risk ile düşünmek

> **Bu bölümün sorusu:** Bir yazılım, gereksinimlere tamamen uygun olup yine de başarısız sayılabilir mi?

## 2.1 Tek bir ürün, iki farklı doğruluk sorusu

İade sistemi için şu gereksinim yazılmış olsun:

> “Müşteri teslimden sonraki 14 takvim günü içinde iade talebi açabilir.”

Geliştirici kuralı eksiksiz uyguladı. 0., 7. ve 14. günlerde istek kabul, 15. günde ret. Bu **iyi haber**. Peki ürün başarılı mı?

Kullanıcı “iade talebi oluştur” düğmesini bulamıyorsa, mobil uygulamada son güne ne kadar süre kaldığını anlayamıyorsa veya iade koşullarını göremiyorsa, ürünün gerçek ihtiyacı karşılama düzeyi tartışmalı olabilir.

Burada iki farklı soru vardır:

- **Verification:** “Belirlediğimiz şeyi doğru mu geliştirdik?” — belirtilen şart ve teknik sözleşmeyle uygunluk.
- **Validation:** “Geliştirdiğimiz şey gerçek kullanıcı ve paydaş ihtiyacına uygun mu?” — amaçlanan kullanımda değer.

Verification yalnız kod testi, validation yalnız kullanıcı testi **demek değildir**. Gereksinim review'u ile verification yapılabilir; çalışan prototip üzerinde kullanıcı gözlemiyle validation yapılabilir. Aynı test ikisine birden katkı sağlayabilir.

### Yanlış kıyas: “Doğru requirement varsa validation otomatik başarılıdır”

Bir ürün ekibi yanlış problemi çözmüş olabilir. Örneğin kullanıcıların asıl ihtiyacı “teslim edilmiş sipariş için kolay iade” iken ekip, geri gönderim adımlarını yalnız masaüstünde erişilen uzun bir form olarak tanımlamış olabilir. Şartnameye uyum, doğru ihtiyacın yakalandığının garantisi değildir.

Bu nedenle bir tester sadece **“kod gereksinimi karşılıyor mu?”** diye sormaz; zaman zaman **“bu gereksinim amacı gerçekten karşılıyor mu?”** diye de sorgular.

## 2.2 Risk neden testing'in merkezinde?

Bütün olası senaryoları test edemeyeceğimiz için bir seçim yapmalıyız. Seçim rastgele olmamalı. Test stratejisini **olası zarar** yönlendirir.

İki hata düşün:

1. Profil ekranında açıklama metni birkaç piksel kaymış.
2. Ödeme butonuna iki kez basıldığında iki tahsilat yapılmış.

İkisi de defect olabilir. Ancak **iş etkisi** eşit değildir.

Risk hakkında konuşurken iki özellik ayırırız:

- **Likelihood — olasılık:** Bu sorun gerçek kullanımda ne kadar muhtemel?
- **Impact — etki:** Ortaya çıkarsa kullanıcıya/işletmeye ne kadar zarar verir?

Bazı ekipler bunları 1–3 veya 1–5 ölçekleriyle puanlar. Bu sayılar **gerçek istatistik** olmak zorunda değildir; ekip içi karşılaştırma araçlarıdır. Nadir ama çok ciddi bir veri ihlali sırf “olasılık 1” diye otomatik ikinci plana atılmaz.

### Product risk ve project risk farkı

| Risk türü | Soru | Örnek |
|---|---|---|
| **Product risk** | Ürün yanlış davranırsa ne olur? | Müşterinin bir başkasının iadesini görebilmesi |
| **Project risk** | Test veya teslim işini gerçekleştirmemizi ne engeller? | Ödeme sağlayıcısının test ortamının çalışmaması |

Project risk'i ürün kusuru gibi raporlamak da, product risk'i “ortam sorunu” diye yok saymak da doğru değildir.

## 2.3 Riskten teste nasıl geçilir?

Bunu basit bir zincirle yapabiliriz:

**İşlev → olumsuz olay → zarar → test fikri → gözlenecek kanıt**

Örnek, *tek kullanımlık kupon*:

**İşlev:** Bir kupon yalnız bir siparişte kullanılabiliyor.

**Olumsuz olay:** Kullanıcı kuponu iki ayrı siparişte uyguluyor.

**Zarar:** Fazla indirim ve muhasebe tutarsızlığı.

**Test fikri:** Birinci siparişten sonra kuponu ikinci siparişte yeniden uygula.

**Kanıt:** İkinci işlem reddedildi mi? İndirim oluşmadı mı? Kullanım sayısı beklenen durumda mı?

Buna yalnız “negative test” demek yetmez. Özellikle **yan etkinin olmamasını** doğrulamak, mühendislik açısından değerlidir.

### Birden fazla risk, birden fazla kanıt

Aynı kupon özelliğinde ayrı riskler vardır:

- Minimum sepet sınırı yanlış: **boundary** testleri.
- Premium/basic koşulları yanlış birleşmiş: **decision table**.
- Kupon tekrar kullanılmış: **state transition**.
- İstek ağ kesintisinde yeniden gönderilmiş: **retry ve veri bütünlüğü**.
- Başka hesaba ait kupon kabul edilmiş: **authorization**.

Bu tekniklerin ayrıntıları ileride gelecek. Buradaki kazanım: **Test tekniğini modaya göre değil, riski görünür kılacağı için seçmek.**

## 2.4 Risk bazlı önceliklendirme: adım adım

Örnek ürünün üç riskini inceleyelim:

| Risk | Beklenen iş etkisi | Yaklaşım |
|---|---|---|
| R1 — çift tahsilat | Çok yüksek | Ödeme tekrar denemeleri, transaction state ve yan etkiler |
| R2 — yanlış ücretsiz kargo eşiği | Orta | Eşik ve sepet kombinasyonları |
| R3 — küçük görsel hizalama | Düşük | Seçilmiş ekran/cihaz kontrolü |

**Adım 1:** Önce ürün amacını öğren: finansal doğruluk mu, veri gizliliği mi, kullanıcı etkileşimi mi kritik?

**Adım 2:** Her riskin *nasıl gerçekleşebileceğini* anlat: “Çift tahsilat” tekrar istek, eşzamanlı işlem veya ağ timeout'undan doğabilir.

**Adım 3:** Bu olayı ortaya çıkaracak en uygun test şartını seç: aynı ödeme isteğini güvenli test ortamında tekrar yürütmek.

**Adım 4:** Sadece HTTP yanıtını değil, gerçek iş sonucunu izle: kaç işlem kaydedilmiş, toplam ne olmuş?

**Adım 5:** Çalıştırılamayan testi “geçti” sayma; nedenini, alternatif kanıtı ve kalan riski açık bırak.

Bu mantık **test sayısı az olduğunda da** **test sayısı çok olduğunda da** işe yarar.

## 2.5 Risk ile confidence'ın ilişkisi

İlk bölümde gördüğümüz güven kavramını burada geliştirelim.

Bir ödeme testinin geçmesi, “doğrudan denediğimiz ödeme koşullarında davranış doğru göründü” demektir. Ancak başka banka kartı, farklı currency, sağlayıcı kesintisi ve paralel istekler hâlâ belirsiz olabilir.

**Confidence = kanıt kalitesi + kapsanan önemli riskler + görünür kalan bilinmezler hakkında dürüstlük.**

Sadece sayısal coverage yüksek diye artık risk yok demeyiz. Tersine büyük riskleri etkin kontrollerle ele almış küçük ama iyi tasarlanmış bir suite çok değerli olabilir.

### Release kararının sahibi

Tester, **teknik bulguları ve residual risk'i** görünür kılar. Riskin kabulünü ürün/iş/güvenlik gibi ilgili yetkili paydaşlar yapar. Bu ayrım “sorumluluk almamak” değildir; kararın doğru bilgilerle ve doğru sorumlulukta verilmesidir.

## 2.6 Karşı örnek: İyi görünen ama yanıltıcı test

İade kuralı “14 gün dahil” olsun. Test, uygulamanın döndürdüğü “kabul edildi” yanıtını expected olarak kaydediyor. Sonra aynı yanıtı her çalışmada karşılaştırıyor.

Bu test **mevcut davranışı tekrarlar** ama davranışın **doğruluğunu bağımsız bir gereksinime göre** sınamaz. Yanlış kod baştan “15 gün dahil” yapsaydı da yeşil kalabilirdi.

Beklenen sonucu nereden aldığımızın önemini bir sonraki derste ayrıntılı inceleyeceğiz.

## 2.7 Alıştırma — yeni probleme aktar

Kural: “Satılan dijital üyelik yalnız hesap sahibi tarafından iptal edilebilir.”

**Görev:** Bu kural için bir product risk, bir test fikri ve gözlenecek iki kanıt söyle.

**Örnek çözüm:**
- Risk: Başka bir kullanıcı, bir hesabın üyeliğini iptal edebilir.
- Test fikri: Kullanıcı A'nın oturumuyla B'ye ait üyeliğin iptalini dene.
- Kanıt 1: İsteğin sözleşmeye uygun şekilde reddedilmesi.
- Kanıt 2: B'nin üyelik kaydının ve fatura durumunun **değişmemesi**.

UI'da “iptal” butonunun görünmemesi tek başına backend izninin uygulanmış olduğunu göstermez.

## Sonraki bölüm

Test fikrimiz var. Şimdi bunu **tekrar üretilebilir bir test case'e** dönüştürmek için gereksinimi, beklenen sonucu ve kanıtı birbirinden ayıracağız.

→ [3. Requirements, Test Oracle & Evidence](03-requirements-expected-behavior-and-evidence.md)
