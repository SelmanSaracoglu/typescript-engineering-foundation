# 32. API Authentication, Authorization & State — Kimlik, izin ve veri bütünlüğü

> **Temel soru:** Bir kullanıcı sisteme giriş yapabiliyorsa başka bir kullanıcının siparişini de görüntüleyebilir mi?

Önceki derste API'nin input ve response sözleşmesini test ettik. Şimdi daha yüksek etkili bir riske geçiyoruz: **Doğru kişiye doğru verinin gösterilmesi**.

## 32.1 Authentication ve authorization farklı sorular

- **Authentication (AuthN):** Çağrıyı yapan kullanıcı/istemci kim?
- **Authorization (AuthZ):** Bu kimlik, **bu kaynak üzerinde bu işlemi** yapabilir mi?

MiniShop:
- Kullanıcı A doğru token ile giriş yaptı → kimliği doğrulandı.
- A, B'nin siparişini açmak istedi → erişim ayrıca **reddedilmelidir**.

İlk kontrol ikincisini garanti etmez.

### UI'da buton gizlemek neden yeterli değil?

Web arayüzü “Siparişi düzenle” düğmesini gizlemiş olabilir. Ancak istemci API'ye doğrudan istek gönderebilir. **API seviyesinde kaynak sahipliği ve rol yetkisi uygulanmıyorsa** UI görünüm kontrolü yetkisiz erişimi engellemez.

Bu nedenle test:
1. A'nın oturumunu kurar;
2. B'ye ait bir sipariş yaratır;
3. A ile B'nin kaynak kimliğine istek gönderir;
4. sözleşmeye uygun ret bekler;
5. **veri açıklanmadığını ve state değişmediğini** doğrular.

Bu, yalnız “403 geldi” kontrolünden daha güçlüdür.

## 32.2 Bir kaynak matrisi tasarla

Eğitim kuralı:
- CUSTOMER kendi siparişini okuyabilir;
- CUSTOMER başkasının siparişini okuyamaz;
- SUPPORT rolü, yalnız tanımlı destek kapsamındaki siparişleri okuyabilir;
- oturumsuz çağrı reddedilir.

| Actor / Token | Sipariş owner | Destek yetkisi | Beklenen |
|---|---|---|---|
| A / geçerli | A | Yok | ALLOW |
| A / geçerli | B | Yok | DENY |
| SUPPORT / geçerli | B | Varsa ve kapsam uygunsa | ALLOW |
| SUPPORT / geçerli | B | Kapsam dışı | DENY |
| Token yok | A | Yok | DENY |

**Destek rolü istisnası** bu eğitim örneğinde açıkça belirtilmiştir; gerçek ürüne kendiliğinden uygulanmaz. Gerçek IAM/policy kuralını her seferinde onaylı kaynaklardan almalıyız.

## 32.3 Response kodu ile sızıntı farkı

Yetkisiz GET çağrısı bazen **403 Forbidden**, bazen varlık bilgisini gizlemek için **404 Not Found** dönebilir. Her iki yaklaşım da **güvenlik/ürün sözleşmesine** uygun tanımlanmalıdır.

**Asıl güvenlik oracle'ı:**
- erişim reddedildi mi?
- Response body, headers veya redirect'te sipariş bilgisi sızdı mı?
- Request state'i değiştirdi mi?
- Loglarda hassas token veya kişisel veri gereksiz kaydedildi mi?

“404 var, dolayısıyla güvenli” kısa yolu hatalı olabilir. Backend yanlışlıkla B'nin e-posta adresini error body'ye koymuşsa bilgi sızıntısı vardır.

## 32.4 BOLA / IDOR kavramını örnekle anlayalım

Bir servis isteğin path'indeki orderId ile DB kaydını getiriyor:

~~~text
GET /api/orders/o-202  (User A oturumuyla)
    ↓
Database: order o-202 belongs to User B
    ↓
Hatalı servis: Sadece order var mı kontrol eder
    ↓
200 + B'nin siparişi  ← güvenlik kusuru
~~~

Kök tasarım hatası: **Kullanıcının bu nesneye erişim yetkisi kontrol edilmemiş**.

Bu risk, OWASP API Security Top 10 2023'te **Broken Object Level Authorization (BOLA)** olarak ele alınır. *IDOR* ise sık kullanılan ilişkili terimdir. Test sadece URL'deki ID'yi değiştirerek yapılmaz; **verinin gerçekten B'ye ait olduğu** kontrollü fixture ile kurulmalıdır.

## 32.5 Authentication negatifleri ayrı

Authentication'ın başarısızlık koşullarını da test et:
- Token yok;
- Token hatalı/bozulmuş;
- Süresi dolmuş token;
- İptal edilmiş session (ürün kuralı gereği);
- Gerekli role/claim yok;
- Bir kullanıcı logout veya şifre değişiminden sonra eski session'la erişmeyi deniyor (session policy onaylıysa).

**Önemli:** “Token string'inin süresi doldu” ile “token gerçekten server tarafından reddedildi” aynı şey değildir. Başlangıç durumu, doğrulama ve response kanıtı gerekir.

### Cypress session/test isolation

Cypress testinde auth state kurarken cookie, localStorage/sessionStorage ve önceden oluşturulmuş test hesabı birbirine karışabilir. I3'te öğrendiğimiz gibi A ve B kullanıcılarının **oturumları ve test verileri** bilinçli ayrılmalı.

**Token'ı source control'e ekleme.** Test token'ları sentetik ve yetkili test ortamına ait olmalı; log ve screenshot'ta maskelenmelidir.

## 32.6 Authorization + stateful işlem

Şimdi okuma değil UPDATE yapalım:

~~~http
PATCH /api/orders/o-202
Authorization: Bearer <USER_A_TOKEN>
Content-Type: application/json

{"deliveryAddress":"new-test-address"}
~~~

B siparişinin sahibi. Sözleşme A'nın düzenlemesini yasaklıyor.

**İki doğrulama gerekir:**
1. A'nın işlemi DENY ile sonuçlandı;
2. B siparişinin **deliveryAddress değeri değişmedi**.

Üçüncü yararlı kontrol: B sahibi olarak kendi siparişini **izin verilen state'te** güncelleyebiliyor mu? Yalnız negatif ret testi, geçerli işlevin bozulmadığını garanti etmez.

## 32.7 State transition ile authorization birleşebilir

Eğitim kuralı: Sipariş **CREATED** iken sahibi adres değiştirebilir, **SHIPPED** olduktan sonra değiştiremez.

| Actor | State | Expected |
|---|---|---|
| Owner | CREATED | ALLOW |
| Non-owner | CREATED | DENY |
| Owner | SHIPPED | DENY |
| Non-owner | SHIPPED | DENY |

Bu tabloda iki değişken var: **kim** ve **sipariş hangi durumda**. Authorization veya state kontrolünü ayrı ayrı doğrulamak yeterli olmayabilir; kombinasyonlar karar tablosu testini gerektirir.

## 32.8 Çalışılmış hata araştırması

**Gözlem:** A ile B siparişine PATCH atıldığında 200 dönüyor.

**Hipotezler:**
- Authorization kontrolü yok;
- Test fixture aslında siparişi A'ya ait oluşturmuş;
- Test token'ı A yerine admin;
- API 200 dönse de değişiklik uygulamamış (yine de sözleşmeye aykırı olabilir).

**Doğrulama:**
1. A ve B identity/ownership bilgisini bağımsız doğrula;
2. A token'ının claim/scope'larını kontrol et;
3. PATCH response ve persisted B siparişini incele;
4. aynı isteği doğru fixture ile tekrar et.

Bu, **test setup hatası** ile gerçek access control kusurunu kanıtla ayırır.

## 32.9 Alıştırma — farklı alan

Belge servisi: Kullanıcı yalnız kendi PENDING belgesini düzenleyebilir; APPROVED belgeler değiştirilemez.

**Görev:** İki kullanıcı, iki state kullanarak dört davranış kombinasyonunu ve negatiflerde iki kanıtı yaz.

**Örnek çözüm:** A'nın PENDING kendi belgesi ALLOW; B'nin PENDING belgesi A için DENY; A'nın APPROVED belgesi DENY; B'nin APPROVED belgesi A için DENY. Negatiflerde (1) sözleşmeye uygun ret ve gizli içerik sızmaması; (2) veritabanındaki belge/state içeriğinin değişmemesi doğrulanır.

**Kazanım:** Yetki testi sadece “login oldu mu?” değil; **actor × resource × action × state** matrisidir.

## Sonraki ders

Aynı doğru kullanıcı, aynı işlemi **iki kez** yaptığında ne olur? Özellikle ağ timeout'unda ödeme ve kupon kullanımını güvenli doğrulamak için idempotency ve concurrency'ye geçeceğiz.

→ [33. Idempotency, Retries & Concurrency](04-api-idempotency-retries-and-concurrency.md)

**Kaynak:** [OWASP API Security — Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/).
