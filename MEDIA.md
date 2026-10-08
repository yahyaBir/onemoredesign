# Medya düzeni

- `images/brand/`: One More Design logoları; navbar ve footer SVG kullanır.
- `images/projects/`: Proje görsellerinin 640, 1280 ve 1920 piksel WebP sürümleri. Kartlar ekran genişliğine göre `srcset` ile seçim yapar.
- `images/references/`: Referans logoları; etraflarındaki şeffaf boşluklar kırpılmıştır.
- `images/posters/`: Videoların yüklenmesi veya otomatik oynatmanın engellenmesi durumunda görünen kapaklar.
- `images/originals/`: Eklenen fotoğraf ve referans logolarının değiştirilmemiş kaynakları.
- `videos/hero-desktop.mp4`: Yatay H.264 video, ses kanalı kaldırılmış ve hızlı başlangıç etkinleştirilmiştir.
- `videos/hero-mobile.mp4`: Dikey H.264 video; en fazla 900 px genişlikteki dikey ekranlarda kullanılır.
- `videos/originals/`: İki videonun değiştirilmemiş kaynakları.
- `docs/Referanslar.pdf`: Eklenen referans dokümanı.

Video seçimi `js/main.js` içindeki `matchMedia` ile yapılır. Ekran boyutu/yönü değişince kaynak güncellenir; aynı anda iki video indirilmez. Hareket azaltma tercihinde video yerine kapak gösterilir. Video görünümden çıktığında veya sekme arka plana geçtiğinde duraklatılır.

Altı proje kartı: Ecopak, Robomation, Kuver Professional, Zeron Lock, Skyart ve Ecopak TRX. Her proje kartı artık kendi `proje-*.html` detay sayfasına bağlıdır. Güncel bölümündeki Ecopak kartı da yerel görsel kullanır. Henüz ilgili fotoğrafları sağlanmayan Hakkımızda ve diğer Güncel kartlarının mevcut görselleri korunmuştur.

Yerel çalıştırma: proje klasöründe `python3 -m http.server 8000`, ardından `http://localhost:8000`.


## Ürün detayları ve iletişim

- `proje-ecopak.html`, `proje-robomation.html`, `proje-kuver.html`, `proje-zeron.html`, `proje-skyart.html`, `proje-ecopak-trx.html`: altı detay sayfası; genel görünüm, tasarım odağı, sonraki proje ve iletişim bağlantısı.
- `iletisim.html`: iletişim bilgileri ve proje briefi formu.
- `css/pages.css`: yeni sayfaların responsive stilleri.
- `js/contact.js`: form doğrulama, e-posta taslağı ve brief kopyalama.

İletişim formu sunucuya gönderim yapmaz. Kullanıcının e-posta uygulamasında taslak açar; gönderimi kullanıcı tamamlar. Kopyalama başarısız olursa seçilebilir metin gösterilir. Mevcut sitedeki `hello@onemoredesign.com` kullanılmıştır; yayından önce adresin doğruluğunu kontrol edin. Doğrudan gönderim istenirse ayrıca bir form servisi/API bağlanmalıdır. Adres, telefon, müşteri sonuçları veya teknik ürün özellikleri eklenmemiştir.

Kontroller: yerel dosya ve sayfa bağlantıları, fragment hedefleri, JavaScript sözdizimi; proje adıyla form doldurma, e-posta metni kodlaması, kopyalama ve boşluk doğrulaması. Bu çalışma ortamında kullanılabilir tarayıcı olmadığından ekran görüntüsüyle görsel kontrol yapılamadı.

## Ürün detay sayfalarının medya alanları
`js/project-media.js` dosyasında her ürün için dosya yollarını değiştirin:
- `pair`: iki adet yatay 4:3 fotoğraf (önerilen: 1600 × 1200).
- `wide`: bir adet yatay 16:9 fotoğraf (önerilen: 1920 × 1080).
- `slides`: üç fotoğraf; slider çerçevesi 16:9. Oklar, klavye ve dokunmatik kaydırma desteklenir.
- `video`: ürün videosunun MP4/WebM yolu. Boş bırakıldığında “Video yakında” görünür.
- `poster`: videonun kapak görseli.

Yeni görseller gelene kadar aynı ürün görseli tekrar kullanılmaktadır. Galeri fotoğrafları `object-fit: contain` ile kırpılmadan gösterilir; çerçeveler ekran yüksekliğine göre sınırlandırılır. Üst kapak görseli ise tam alanı doldurmak için `cover` kullanır. Ana sayfa tanıtım videosu ürün videosu olarak kullanılmamıştır.

Slider 5 saniyede bir ilerler; fare üzerindeyken, klavye odağı içindeyken, sekme gizliyken veya slider ekran dışındayken otomatik geçiş durur. Duraklatma düğmesi bulunur; hareket azaltma tercihi açıkken otomatik geçiş kapalıdır. Navbar aşağı kaydırmada gizlenir, yukarı kaydırmada görünür.

Ürün medyaları tek bir ortalanmış sütunda aynı sağ ve sol kenarları paylaşır. İkili fotoğraflar eşit genişliktedir; tekli görsel, slider ve video sütunun tamamını kullanır.
