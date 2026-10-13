# 25. Selector Strategy — Doğru öğeyi, doğru nedenle bulmak

> **Bu dersin sorusu:** “Butonun rengi değişti” gibi önemsiz bir UI değişikliği neden otomasyon testini bozar?

Önceki derste test kodunu sürdürülebilir biçimde düzenledik. Şimdi browser otomasyonunun temel bir bağımlılığına bakacağız: **DOM elementini nasıl seçiyoruz?**

## 25.1 İlk senaryo: Yanlış nesneyi seçmek

MiniShop'ta iki buton var: Sepete ekle ve İstek listesine ekle.

~~~typescript
cy.get("button").first().click();
~~~

Bugün ilk buton “Sepete ekle”. Yarın tasarım ekibi düğmelerin sırasını değiştiriyor. Test artık **başka iş yapıyor**, bazen yanlış davranışı doğruluyor.

Asıl problem görsel değişiklik değil: Testin seçme stratejisi **iş amacına bağlı değildi**.

## 25.2 Selector bir test sözleşmesidir

**Selector**, testin DOM'daki hedef öğeyi bulmak için kullandığı ölçüttür. İyi selector:
- **Belli bir davranışı** hedefler;
- öğe sırası ve dekoratif CSS değişimine gereksiz bağlanmaz;
- gerektiğinde **tekil** olur;
- kullanıcıya anlamlı UI semantiğini bozmaz.

| Yaklaşım | Örnek | Güçlü taraf | Dikkat |
|---|---|---|---|
| Test attribute | `[data-cy="basket-add"]` | Layout/class değişiminden ayrılır | Uygulamada bilinçli test contract'ı gerekir |
| Accessible role/name | “button / Add to basket” | Gerçek kullanıcı semantiğine yakındır | Lokalizasyon ve kopya butonlar dikkate alınır |
| Stable ID | `#basket-submit` | Tekil ve net olabilir | ID'nin gerçekten kararlı olması gerekir |
| CSS class | `.blue-button-lg` | Kolay erişim | Görünüm değişiminden etkilenebilir |
| Sıra/konum | `button:nth-child(2)` | Hızlı ama kırılgan | DOM düzenine aşırı bağlı |

**Tek evrensel sıralama yoktur.** Cypress'in resmî best practices dokümanı değişime dayanıklı `data-*` attribute'larını özellikle önerir. Erişilebilir role/name ile test etme de amaçlı olabilir; Cypress'in çekirdek `cy.get` API'sinin Playwright benzeri bir `getByRole` sunduğu varsayılmamalıdır. Kullanılan adapter veya query yardımcıları doğrulanmalıdır.

## 25.3 Bir selector'ı adım adım güçlendirelim

İlk hali:

~~~typescript
cy.get(".btn.btn-green.large").click();
~~~

Risk: Tasarım sınıfları değişirse test kırılır.

İkinci hali:

~~~typescript
cy.get('[data-cy="basket-add"]').click();
~~~

Daha iyi: Testin amacı “sepete ekleme” davranışıdır. Test attribute'u görsel tasarım değişiminden ayrılmış bir kimlik sağlar.

Fakat aynı sayfada 12 ürün kartının hepsinde aynı attribute var.

Bu durumda **scope** da gerekir:

~~~typescript
cy.get('[data-cy="product-card"][data-product-id="sample-product"]')
  .find('[data-cy="basket-add"]')
  .click();
~~~

Bu örnek, uygulamanın **test için kararlı data attribute'ları sunduğunu varsayar**. Gerçek ürüne bu attribute'lar önceden eklenmiş olduğu iddia edilmiyor.

**Sonuç:** Dayanıklı locator yalnız test attribute'u seçmek değil; **doğru öğeyi doğru kapsama göre tekilleştirmektir**.

## 25.4 “Görünür” olması “doğru davranış” demek mi?

~~~typescript
cy.get('[data-cy="basket-add"]').should("be.visible");
~~~

Bu assertion yalnız düğmenin görünürlüğüne kanıttır. Ürünün gerçekten sepete ürün eklediğini kanıtlamaz.

~~~typescript
cy.get('[data-cy="basket-add"]').click();

cy.get('[data-cy="basket-count"]')
  .should("contain", "1");
~~~

Şimdi kullanıcı açısından beklenen bir etkiye bakıyoruz. Ancak **sepette doğru ürünün bulunması** da önemliyse yalnız count=1 yeterli olmayabilir.

**İyi assertion**, riskin beklediği gözlenebilir sonucu kontrol eder; locator'ın bulunmuş olmasını iş başarısıyla karıştırmaz.

## 25.5 Lokalizasyon ve erişilebilirlik

“Add to basket” yazısını kullanarak seçtiğin düğme Almanca arayüzde “In den Warenkorb” olabilir.

- **İşlevsel davranış testi** için kararlı test attribute'u yararlı olabilir.
- **Çeviri testi** için görünür etiketin dilini doğrulamak önemlidir.
- **Erişilebilirlik** için role/name ilişkisi ayrıca test edilmelidir.

Test katmanı ve amacı farklıysa selector seçimi de değişebilir. Görünür metni her zaman görmezden gelmek veya her zaman metne bağlanmak ikisi de aşırı genellemedir.

## 25.6 Kırılgan selector'ın root-cause'u

Bir test `cy.get(".checkout-main > div:nth-child(3) button")` üzerinde timeout aldı.

Araştırma sırası:

1. Hangi **iş davranışı** hedefleniyordu?
2. O öğe gerçekten DOM'da var mı?
3. Selector DOM sırası/görünümüne mi dayanıyor?
4. Eleman geç mi geliyor, yoksa selector yanlış mı?
5. Tekil ve anlamlı bir seçme sözleşmesi tanımlanabilir mi?
6. Düzeltme sonrası test gerçekten intended outcome'u assert ediyor mu?

**Yanlış refleks:** Sadece timeout'u artırmak veya `{ force: true }` eklemek. Yanlış öğeyi seçme riskini çözmez.

## 25.7 Cypress command/actionability bağlantısı

Cypress, `click()` gibi eylemlerden önce öğenin kullanıcı tarafından etkileşilebilir olması için çeşitli **actionability** kontrolleri yapar. Element kapalı, disabled veya başka öğenin altında olabilir.

**Force click**, bu kontrollerin bir bölümünü atlayabilir. Kullanıcının yapamayacağı bir işlemi gerçekleştirip yanlış güven oluşturabilir. Kullanıcı deneyimini doğrulayan senaryoda **körlemesine force** kullanılmaz.

Komut queue/retry mantığı bir sonraki derste ayrıntılandırılacak.

## 25.8 Alıştırma — yeni uygulama

Belge yönetimi ekranında “Approve”, “Reject” ve “Download” düğmeleri var. CSS class'ları sprintten sprinte değişiyor. Listede birden fazla belge bulunuyor.

**Görev:** Approve butonunu **belge kimliğine bağlı** ve kararlı biçimde nasıl seçersin? Hangi iş sonucunu assert edersin?

**Örnek çözüm:** İlgili belge satırını anlamlı/teste özel ID'ye göre scope et; o satırın onay düğmesine tıkla; belgenin state'inin **APPROVED** olduğunu ve diğer belgelerin etkilenmediğini kontrol et. UI state yalnız yüzeyde kalıcı olmayabileceğinden kritik risk varsa uygun API/DB sınırında ayrıca doğrula.

## Sonraki ders

Doğru öğeyi bulduk. Ancak uygulama asenkron çalışıyor. **Cypress komutlarının nasıl sıraya alındığını** doğru anlamazsak testlerimiz yine kırılgan olabilir.

→ [26. Cypress Execution Model](04-cypress-command-queue-retry-and-waits.md)

**Kaynak:** [Cypress Best Practices — Selecting Elements](https://docs.cypress.io/app/core-concepts/best-practices).
