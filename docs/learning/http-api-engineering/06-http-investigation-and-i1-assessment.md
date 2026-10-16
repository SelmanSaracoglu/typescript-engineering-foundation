# Ders 06 — HTTP hata araştırması ve I1 bütünleşik değerlendirmesi

> **Amaç:** HTTP'yi tanım listesinden çıkartıp bir gözlemi açıklama, hipotez kurma, tek değişken değiştirme ve sonuç doğrulama becerisine dönüştürmek.

**Uygulama zamanı:** Önce Ders 01–05 konu anlatımlarını bitiriyoruz. Bu dosyadaki bütünleşik değerlendirme, **I1 sonunda** yapılacak. Önceki mentor anlatımları ve copy/paste komutlar **H0 bağımsızlık kanıtı** değildir.

## 1. HTTP debugging için küçük ve tekrarlanabilir yöntem

1. **Gözlem:** Tam olarak ne görüyoruz? Örneğin `HTTP 200` ama body'de hata; ya da HTTP status hiç yok.
2. **Beklenti:** API sözleşmesine ve istenen davranışa göre ne olmalı? Bu beklenti uygulamanın mevcut yanlış çıktısından türetilmemeli.
3. **Hipotez:** Tek bir olası neden yaz. Örneğin istemci JSON'u yanlış aktarıyor.
4. **Kontrollü deney:** Aynı endpoint'e yalnız bir değişkeni değiştirerek yeniden istek gönder.
5. **Doğrulama:** Status, request/response header'ları, body ve gerekirse sonraki GET ile state'i karşılaştır.
6. **Sonuç / sınır:** Neyi doğruladın, neyi hâlâ bilmiyorsun? «Muhtemelen» ile «kanıtlandı»yı ayır.

### Örnek A — Tırnakların kaybolması

| Adım | Somut gözlem |
| --- | --- |
| Beklenen | `{"price":1200}` JSON body |
| Gerçekte Echo | `data:"{price:1200}"`, `json:null` |
| Hipotez | Shell'den curl'a argüman aktarımında çift tırnaklar kayboluyor olabilir |
| Tek değişken | JSON'u `-d` argümanı yerine stdin/`--data-binary "@-"` üzerinden göndermek |
| Yeni gözlem | `json:{"price":1200}` |
| Kanıt sınırı | Düzeltme doğrulandı; argv düzeyindeki kesin root cause ölçülmedi |

Bu **gerçek uygulamamızdan** alınan rehberli debugging örneğidir; H0 değildir.

### Örnek B — Status doğru, iş sonucu yanlış

**Temsili durum:** `DELETE /products/42` → `204 No Content`; ardından `GET /products/42` → `200 OK` ve aynı ürün.

- **Gözlem:** GET endpoint'i eski ürünü hâlâ döndürüyor.
- **Beklenti:** Sözleşmede silme sonrası kaynak erişilemez olmalıysa beklenmedik davranış vardır.
- **Alternatifler:** Cache, soft delete, yanlış ID, başarısız işlem, sistem gecikmesi.
- **Bilinmeyen:** Veritabanındaki gerçek state; sadece HTTP'den kesin root cause çıkmaz.

Gerçek başka kullanıcının ürününü DELETE etmek için yetki yoktur. Bu örnek sadece senaryodur.

### Örnek C — Yanlış hata sınıfına atlamak

İstemci `404` alıyorsa **HTTP cevabı vardır**. Curl `7` veriyorsa **bu deneyde HTTP cevabı yoktur**. Ayrıca `curl` exit `22`, sunucunun «HTTP status 22» verdiği anlamına gelmez. Bu ayrımlar olmadan teşhis yanlış katmanda başlar.

## 2. Hangi kanıt neyi doğrular?

| Kanıt | Doğruladığı | Tek başına doğrulamadığı |
| --- | --- | --- |
| HTTP `200` | Başarılı HTTP status'u | Doğru kaynak/iş kuralı |
| JSON body | Response'daki değerlerin ne olduğu | Kaynağın veritabanı durumu |
| Echo'nun `headers` alanı | Echo'nun gördüğü request header'ları | Her ara ağ katmanından aynen geçiş |
| `curl exit 0` | Curl'ın kendi başarılı bitişi | HTTP status'un 2xx olması |
| `204` DELETE | Sunucunun başarılı işlem bildirimi | Sonradan okunacak kaynağın durumu |
| Ağ bağlantı hatası | HTTP'den önceki bir bağlantı sorunu | Sunucunun HTTP `500` verdiği |
| Sadece proxy logu | Proxy'nin gördüğü olay | Backend'de gerçekleşen her iç işlem |

Bu tablo, SDET için test oracle; AppSec için trust boundary; SOC için telemetry ve kanıt sınırlaması düşüncesine bağlanır.

## 3. I1 sonunda yapılacak tek bütünleşik çalışma

**Aşama 1 — Trafiği oku:** Daha önce kullanılmamış, sadece okuma veya yetkili sentetik veri gerektiren HTTP endpoint'ini seç. DevTools ve `curl` ile request URL/method, request headers, response status/headers/body'yi kaydet. Kullanılan HTTP sürümünü gerçek çıktıya göre belirt; HTTP/1.1 gösterimini HTTP/2 aktarımıyla karıştırma.

**Aşama 2 — Tahmin et ve doğrula:** Geçerli bir request ile kontrollü başarısız HTTP response'u karşılaştır. Status kodunu *neden beklediğini* sözleşme veya endpoint dokümantasyonu ile gerekçelendir.

**Aşama 3 — Bağlantı hatasını ayır:** Yerel `127.0.0.1` üzerinde dinlemeyen bir port gibi kontrollü hedefe istek gönder; HTTP response almadan oluşan hata ile 4xx/5xx response'u ayır. Mevcut yerel hizmetlere zarar verme.

**Aşama 4 — Request body kanıtı:** İki farklı request Content-Type veya bozuk/geçerli JSON gönder; server'ın gerçekten aldığı body'yi Echo endpoint'inde veya gerekirse **Node built-in HTTP** ile yazılmış küçük, yerel fixture'da incele. Bu adım mevcut deneyimizde rehberli yapıldı; bağımsız aktarım için yeni varyasyon gerekli.

**Aşama 5 — Hata araştırması:** Bir beklenmeyen sonuç için gözlem → beklenti → hipotez → tek değişkenli deney → doğrulama → sınırlamalar kaydı çıkar. Hazır AI çözümünü bağımsız sayma.

## 4. Rubrik: H0–H4 ve ayrı değerlendirme alanları

- **H0:** Kendi notları/resmî doküman/debugger ile; göreve özgü AI çözümü olmadan.
- **H1:** Genel kavramsal ipucu.
- **H2:** Komut adımı, sözdizimi, iskelet veya kısmi yönlendirme.
- **H3:** Kritik çözüm mentorla birlikte üretilir.
- **H4:** Tam/çoğunlukla hazır çözüm verilir; öğretim olabilir ama bağımsızlık kanıtı değildir.

Açıklama, uygulama, doğrulama, debugging ve yeni göreve transfer **ayrı** kaydedilir. Bir komutun başarıyla çalışması tüm becerilerin tamamlandığını göstermez.

## 5. Mevcut ilerleme: sadece gözlenenler

| Alan | Durum | Not |
| --- | --- | --- |
| Client/server modeli | Açıklandı | İlk kısa anlama cevabı gözlendi |
| URL/method/headers/body | Konu anlatımı yapıldı | Bağımsız yeni request henüz ölçülmedi |
| Echo GET `200` | Gözlendi | Gerçek query/header/JSON çıktı |
| Echo HTTP `404` | Gözlendi | Gerçek status + body |
| Local bağlantı `curl 7` | Gözlendi | HTTP response yok |
| `--fail`: exit `0` → `22` | Gözlendi | Aynı HTTP `404` |
| POST JSON vs text/plain | Gözlendi | Echo nesne/string farkı |
| PUT yanlış JSON ve düzeltilmiş body | Gözlendi | Mentor yönlendirmeli doğrulama |
| DevTools tek request tam kanıtı | Eksik | Network paneli açıldığı belirtildi; ilgili alanlar kaydedilmedi |
| Yeni senaryo H0 debugging/transfer | Eksik | I1 sonunda ölçülecek |

Bu ders dosyasının bulunması, I1'in bittiği anlamına **gelmez**.

## 6. Epic'e aktarılacak Increment Closure Report iskeleti

- **Anforderung:** API-A1.
- **Tamamlanan konular:** Hangi başlıklar kanıtlandı?
- **Gerçek gözlemler:** URL, method, status, güvenli biçimde maskelenmiş header/body.
- **Kullanılan komutlar:** Girdi, beklenen, gözlenen, exit code.
- **Öğrencinin yaptığı bölüm:** Hazır komut mu, değiştirilmiş komut mu, bağımsız uygulama mı?
- **Debugging:** Gözlem → hipotez → deney → kanıt ve belirsizlik.
- **Yardım seviyesi:** Görev bazlı H0–H4.
- **Transfer:** Yeni örnek üzerinde bağımsız açıklama, uygulama ve doğrulama sonucu.
- **Dosya/commit:** Gerçekte eklenen dosyalar ve GitHub commit SHA'ları.
- **Açık DoD / blocker:** Henüz yapılmayanlar açıkça belirtilir.

**Kapsam dışı:** OpenAPI tasarımı (I2), validation/error model engineering (I3), otomatik API testleri (I4), auth/authorization (I5–I6), retry/idempotency (I7), pagination/resilience (I8), capstone (I9). Bu ders bu başlıklara yalnız ihtiyaç duyulan temel ayrımı gösterir.

**Kaynaklar:** [MDN — HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP), [Chrome DevTools — Network](https://developer.chrome.com/docs/devtools/network/), [curl manual](https://curl.se/docs/manpage.html).

**Durum:** Bu belge, I1 sonunda kullanılacak değerlendirme/rapor çerçevesini tanımlar; henüz kapanış raporu değildir.
