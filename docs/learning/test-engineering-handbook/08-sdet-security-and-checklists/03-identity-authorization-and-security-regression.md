# 40. Identity, Authorization & Security Regression — Düzeltme gerçekten korunuyor mu?

> **Temel soru:** Yetkisiz sipariş erişimi hatasını düzelttik. Bir sonraki değişiklikte tekrar ortaya çıkmamasını nasıl kontrol ederiz?

I5'te authentication ve authorization'ı ayrı kavramlar olarak öğrendik. I6'da bu kontrolleri **güvenlik gereksinimi → negatif test → fix → regression** döngüsüne taşıyoruz.

## 40.1 Bir erişim kusurunun yolculuğu

MiniShop'un onaylı kuralı: Kullanıcı yalnız kendine ait siparişleri okuyabilir.

**Defect:** User A, User B'nin siparişine GET isteği atınca HTTP 200 ve sipariş bilgisi dönüyor.

**Muhtemel kök neden:** Order API token'ın geçerliliğini kontrol ediyor ama siparişin ownerId'sini **actor'ın yetkisiyle** karşılaştırmıyor.

**Mitigation:** Backend'de her kaynak erişiminde doğru authorization policy'yi uygulamak; query filtresi/policy middleware gibi seçenekler seçilen tasarıma göre değerlendirilebilir.

**Regression:** A→A pozitif, A→B negatif, gerekirse Support rolü/atanma sınırı; hata yanıtında B bilgisi yok, veri değişmiyor.

Bir vulnerability report **yalnız bulgu adıyla** kapanmaz. Düzeltme ve yeniden doğrulama ile davranışın değiştiği gösterilir.

## 40.2 Authentication tek başına security garantisi değildir

**Authentication:** Identity'nin doğrulanması.

**Session management:** Kullanıcının onaylı süre ve yaşam döngüsü boyunca güvenli oturumda tutulması.

**Authorization:** Identity'nin belirli resource/action/state için yetkisi.

Bu katmanların hepsini aynı “login testi”ne indirgemek yanlıştır.

| Kontrol | Pozitif senaryo | Negatif/güvenlik senaryosu |
|---|---|---|
| AuthN | Geçerli kimlikle login | Bozuk/eksik credential, token expiry |
| Session | Geçerli session ile kullanım | Logout sonrası iptal edilen session ile işlem reddi |
| AuthZ | Owner kendi siparişini okur | A, B'nin siparişini okuyamaz |
| Role/state | Reviewer PENDING onaylar | Atanmamış reviewer ve APPROVED belgedeki değişiklik reddedilir |

Her beklenen behavior **uygulamanın onaylı politikasına** bağlıdır; bazı session/token mimarilerinde logout sonrası revocation modeli farklı olabilir. “JWT olduğu için tüm token'lar hemen geçersizleşir” gibi varsayım yapma.

## 40.3 Authorization test matrisi

Belge servisi için eğitim kuralları:
- Owner, PENDING belgeyi düzenleyebilir;
- APPROVED belge düzenlenemez;
- Reviewer yalnız kendisine atanmış PENDING belgeyi onaylayabilir.

| Actor | Resource | State | Action | Expected |
|---|---|---|---|---|
| Owner A | A belgesi | PENDING | EDIT | ALLOW |
| Owner A | A belgesi | APPROVED | EDIT | DENY |
| A | B belgesi | PENDING | EDIT | DENY |
| Reviewer S | Atanan belge | PENDING | APPROVE | ALLOW |
| Reviewer S | Atanmamış belge | PENDING | APPROVE | DENY |
| Anonymous | A belgesi | PENDING | READ | DENY |

**Nasıl test edilir?** Sentetik A/B/reviewer kullanıcılarını ve gerçek sahiplik-atama state'ini fixture'da kur. UI'da bir butonu gizlemek veya istekte \`userId=A\` göndermek gerçek server authorization kanıtı değildir.

## 40.4 Pozitif ve negatif aynı öneme sahip

Sadece bütün istekleri DENY eden bir uygulama saldırıya kapalı gibi görünebilir ama ürün çalışmaz. Güvenlik testinde hem:
- Yetkili actor'ın ilgili işlemi gerçekten gerçekleştirebildiği;
- Yetkisiz actor'ın veya yasak state'in reddedildiği

doğrulanmalıdır.

Negatifte **ret status + veri sızıntısı olmaması + yan etki oluşmaması** ayrı gözlem noktalarıdır.

### Status tercihi

401/403/404 gibi yanıtların hangisi bekleniyor **ürün sözleşmesi ve güvenlik politikasından** alınmalıdır. 404, kaynak varlığını gizlemek için seçilmiş olabilir. Yanlış status bekleyip “güvenlik başarısız” etiketi vermeden önce kontratı kontrol et.

## 40.5 Hata düzeltmesinin regresyonunu nasıl tasarlarız?

Örnek patch, orderId sorgusuna owner filtresi ekledi.

**Confirmation:** Eskiden A→B ile data sızan test artık DENY; response'ta B verisi yok.

**Regression:** A→A hâlâ ALLOW; SUPPORT erişimi sözleşmeye uygun; doğrudan kaynak ID ve list/search endpoint'leri aynı policy'yi koruyor.

**Risk:** Yalnız GET /orders/:id endpoint'i düzeltildiyse GET /orders?ownerId=B veya export endpoint'i ayrı veri sızıntısı yüzeyi olabilir.

**SDET–AppSec kesişimi:** Güvenlik açığını kapatan regression testi, testin aynı hatayı yeniden yakalayabileceği şekilde tasarlanmalı. Bug'ı ortaya çıkaran input'u koru; yanında yetkili akışı da kontrol et.

## 40.6 Gerçek token, sentetik hesap

Güvenlik testi için:
- İki ayrı test-owned identity ve resource;
- Yetkili laboratuvar/test ortamı;
- Uygun test token'ları;
- Request/response evidence;
- Gizli credential'ın source'a, screenshot'a veya loga yazılmaması.

Token'ı elle değiştirip başka kullanıcıymış gibi davranmak, token doğrulama modeli bilinmeden güvenilir auth test yöntemi değildir.

### Browser ve API farkı

UI testinde B kaydı görünmüyor → UI gizleme davranışına kanıt.

A oturumuyla B kaydına doğrudan API isteği DENY → **backend authorization** konusunda daha ilgili kanıt.

İkisini karıştırma; test hedefiyle uyumlu sınırı seç.

## 40.7 Güvenli failure davranışı

Policy service veya kullanıcı rol verisi erişilemiyor diyelim. Uygulama “policy yok, herkes geçsin” diye varsaymamalı. İzin kararını güvenle veremiyorsa **fail-safe / fail-closed** yaklaşımını uygun sözleşmede değerlendirmek gerekir.

Ancak “bütün hatalarda HTTP 403” demek de doğru değildir. Hatanın kaynağı ve yanıt politikası ayrı tanımlanabilir; **kritik nokta yetkisiz eylemin gerçekleşmemesidir**.

## 40.8 Alıştırma — yeni kullanıcı rolü

Bir belge sistemine \`AUDITOR\` rolü ekleniyor. Yalnız audit yetkisi olan belgelerin metadata'sını okuyabilecek; içeriğini değiştiremeyecek.

**Görev:** İki pozitif, üç negatif senaryo; bir regression riski ve bir kalıcı yan etki kontrolü yaz.

**Örnek çözüm:** Yetkili metadata okuma ve normal owner okuma pozitif. Auditor'a atanmamış metadata, auditor'ın belge içerik edit'i, anonymous erişim negatif. Regression: Eski owner/reviewer izinlerinin yanlış genişlememesi. Negatif edit'te belge içeriği, state ve audit metadata beklenmedik biçimde değişmemeli.

## Sonraki ders

Yetki doğru olsa bile **gönderilen içeriğin güvenli işlenmesi** gerekir. Şimdi input validation, output encoding ve injection risklerini ayıracağız.

→ [41. Input Validation & Secure Data Handling](04-input-validation-output-encoding-and-injection.md)
