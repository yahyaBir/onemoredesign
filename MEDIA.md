# Medya düzeni

- `images/brand/`: One More Design logoları; navbar ve footer SVG kullanır.
- `images/projects/`: Proje görsellerinin 640, 1280 ve 1920 piksel WebP sürümleri. Detay sayfaları ve ana sayfa proje kartları responsive görselleri `srcset` ile seçer. `images/projects/details/` proje detay galerilerinde kullanılan Drive kaynaklı optimize görselleri içerir.
- `images/references/`: Referans logoları; etraflarındaki şeffaf boşluklar kırpılmıştır.
- `images/posters/`: Videoların yüklenmesi veya otomatik oynatmanın engellenmesi durumunda görünen kapaklar.
- `images/originals/`: Eklenen fotoğraf ve referans logolarının değiştirilmemiş kaynakları.
- `videos/hero-desktop.mp4`: Yatay H.264 video, ses kanalı kaldırılmış ve hızlı başlangıç etkinleştirilmiştir.
- `videos/hero-mobile.mp4`: Dikey H.264 video; en fazla 900 px genişlikteki dikey ekranlarda kullanılır.
- `videos/originals/`: İki videonun değiştirilmemiş kaynakları.
- `docs/Referanslar.pdf`: Eklenen referans dokümanı.

Video seçimi `js/main.js` içindeki `matchMedia` ile yapılır. Ekran boyutu/yönü değişince kaynak güncellenir; aynı anda iki video indirilmez. Hareket azaltma tercihinde video yerine kapak gösterilir. Video görünümden çıktığında veya sekme arka plana geçtiğinde duraklatılır.

Altı proje kartı: Ecopak, Robomation, Kuver Professional, Zeron Lock, Skyart ve Ecopak TRX. Kartlarda önce proje görseli gösterilir; aynı sessiz, döngüsel örnek video fareyle üzerine gelindiğinde veya klavyeyle odaklanıldığında oynar. Hareket azaltma tercihi açıkken görsel kalır. Her kart kendi `proje-*.html` detay sayfasına bağlıdır. Güncel bölümündeki Ecopak kartı yerel görsel kullanır. Henüz ilgili fotoğrafları sağlanmayan Hakkımızda ve diğer Güncel kartlarının mevcut görselleri korunmuştur.

`guncel.html`, ana sayfadaki Güncel kartlarının bağlandığı içerik sayfasıdır. Başlıklar mevcut site metinlerinden, içerik notları ürün tasarımı ve üretim yaklaşımından hazırlanmıştır; yeni şirket tarihleri veya doğrulanmamış başarı verileri eklenmemiştir.

`projeler.html`, navigasyondaki Projeler bağlantısının hedefidir. Projeleri tam ekran bölümlerde listeler; görünür olan tek proje videosu oynatılır, diğerleri poster görsellerinde bekler. Şimdilik bütün maddelerde örnek video kullanılır; proje bazlı videolar sonradan `src/pages/projeler.main.html` içindeki `data-src` değerlerinden atanabilir.

Yerel çalıştırma: proje klasöründe `python3 -m http.server 8000`, ardından `http://localhost:8000`.

Sayfa iskeleti `src/` altındaki partial ve içerik dosyalarından üretilir. Düzenleme sonrası `python3 build.py` çalıştırın; ayrıntılar için `README.md` dosyasına bakın.


## Ürün detayları ve iletişim

- `proje-ecopak.html`, `proje-robomation.html`, `proje-kuver.html`, `proje-zeron.html`, `proje-skyart.html`, `proje-ecopak-trx.html`: altı detay sayfası; kapak, genel görünüm, tasarım odağı, galeri, proje filmi ve iletişim bağlantısı.
- `iletisim.html`: iletişim bilgileri ve proje briefi formu.
- `css/pages.css`: yeni sayfaların responsive stilleri.
- `js/contact.js`: form doğrulama, e-posta taslağı ve brief kopyalama.

İletişim formu sunucuya gönderim yapmaz. Kullanıcının e-posta uygulamasında taslak açar; gönderimi kullanıcı tamamlar. Kopyalama başarısız olursa seçilebilir metin gösterilir. Mevcut sitedeki `hello@onemoredesign.com` kullanılmıştır; yayından önce adresin doğruluğunu kontrol edin. Doğrudan gönderim istenirse ayrıca bir form servisi/API bağlanmalıdır. Adres, telefon, müşteri sonuçları veya teknik ürün özellikleri eklenmemiştir.

Kontroller: `python3 build.py --check` ve `python3 scripts/check_site.py`; yerel dosya ve sayfa bağlantıları, fragment hedefleri, görsel ölçüleri, JavaScript davranışı ve form doğrulaması. Görsel kontrol Chrome ile masaüstü ve mobil ekran görüntüleri üzerinden yapılmıştır.

## Ürün detay sayfalarının medya alanları
`js/project-media.js` dosyasında her ürün için dosya yollarını değiştirin:
- `pair`: iki adet yatay 4:3 fotoğraf (önerilen: 1600 × 1200).
- `wide`: bir adet yatay 16:9 fotoğraf (önerilen: 1920 × 1080).
- `slides`: üç fotoğraf; slider çerçevesi 16:9. Oklar, klavye ve dokunmatik kaydırma desteklenir.
- `video`: ürün videosunun MP4/WebM yolu. Boş bırakıldığında “Video yakında” görünür.
- `poster`: videonun kapak görseli.

Yeni görseller gelene kadar aynı ürün görseli tekrar kullanılmaktadır. `project-media.js` 640/1280/1920 piksel `srcset` sürümlerini otomatik kullanır. Galeri fotoğrafları `object-fit: contain` ile kırpılmadan gösterilir; çerçeveler ekran yüksekliğine göre sınırlandırılır. Üst kapak görseli ise tam alanı doldurmak için `cover` kullanır. Ana sayfa ve proje listesi videoları şimdilik örnek hero videosunu kullanır. Yayınlanan videolar H.264, sessiz ve fast-start olarak sıkıştırılmıştır; kaynak dosyalar `videos/originals/` altında tutulur ve deploy dışında bırakılmalıdır.

Slider 5 saniyede bir ilerler; fare üzerindeyken, klavye odağı içindeyken, sekme gizliyken veya slider ekran dışındayken otomatik geçiş durur. Hareket azaltma tercihi açıkken otomatik geçiş kapalıdır. Navbar aşağı kaydırmada gizlenir, yukarı kaydırmada görünür.

Ürün medyaları tek bir ortalanmış sütunda aynı sağ ve sol kenarları paylaşır. İkili fotoğraflar eşit genişliktedir; tekli görsel, slider ve video sütunun tamamını kullanır.
