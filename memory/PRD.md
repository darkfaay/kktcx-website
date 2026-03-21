# KKTCX.com - Partner Listeleme Platformu PRD

## Proje Özeti
KKTCX.com, Kuzey ve Güney Kıbrıs'a özel, sosyal eşlik hizmetleri platformudur. Platform, yemek eşliği, davet eşliği, sevgili deneyimi gibi yasal eşlik hizmetleri sunan partnerlerin profillerini listeler ve kullanıcıların bu profilleri filtreleyip mesajlaşmasını sağlar.

## Kullanıcı Rolleri
- **Ziyaretçi**: Profilleri görüntüleyebilir
- **Kullanıcı**: Kayıt olup favorilere ekleyebilir, mesaj gönderebilir
- **Partner**: Profil oluşturabilir, fotoğraf yükleyebilir, paket satın alabilir
- **Admin**: Tüm içerikleri yönetebilir, profilleri onaylayabilir

## Tech Stack
- **Backend**: FastAPI (Python), MongoDB
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Auth**: JWT
- **Storage**: Emergent Object Storage

## Desteklenen Diller
- Türkçe (tr)
- İngilizce (en)
- Rusça (ru)
- Almanca (de)
- Rumca/Yunanca (el)

---

## Tamamlanan Özellikler ✅

### 1. Temel Altyapı (Tamamlandı)
- [x] FastAPI backend yapısı
- [x] MongoDB veritabanı bağlantısı
- [x] JWT kimlik doğrulama sistemi
- [x] React frontend yapısı
- [x] Shadcn UI entegrasyonu

### 2. Erotik/Seksi Tema (Tamamlandı - 20 Mart 2026)
- [x] Koyu arka plan tasarımı
- [x] Pembe/kırmızı vurgu renkleri
- [x] Gradient efektler
- [x] Modern kart tasarımları
- [x] VIP badge'leri

### 3. Premium Vitrin Alanları (Tamamlandı - 20 Mart 2026)
- [x] Ana sayfa premium vitrin bölümü (is_homepage_vitrin)
- [x] Şehir sayfası vitrin bölümü (is_city_vitrin)
- [x] VIP+ ve VIP badge'leri
- [x] Admin toggle endpoint'leri

### 4. Fotoğraf Bulanıklaştırma (Blur) (Tamamlandı - 20 Mart 2026)
- [x] Fotoğraf yükleme sırasında blur seçeneği
- [x] Mevcut fotoğrafları blur toggle etme
- [x] Blur göstergesi (gizli ikonu)
- [x] Partner photos sayfasında blur yönetimi

### 5. Tüm Kıbrıs Şehirleri (Tamamlandı - 21 Mart 2026)
- [x] **Kuzey Kıbrıs (10 şehir)**: Girne, Lefkoşa (Kuzey), Gazimağusa, Güzelyurt, İskele, Lefke, Dipkarpaz, Alsancak, Lapta, Çatalköy
- [x] **Güney Kıbrıs (8 şehir)**: Lefkoşa (Güney), Limasol, Larnaka, Baf, Ayia Napa, Protaras, Paralimni, Polis
- [x] Şehirler bölgeye göre gruplandı (Kuzey/Güney)
- [x] Her şehir için 5 dil desteği (TR, EN, RU, DE, EL)

### 6. Yasal Hizmet Türleri (Tamamlandı - 21 Mart 2026)
**Eski (kaldırıldı):** Eskort, Jigolo, Masöz
**Yeni (eklendi):**
- [x] Yemek Eşliği
- [x] Davet Eşliği
- [x] Uyku Arkadaşlığı
- [x] Sevgili Deneyimi (GF/BF Experience)
- [x] Eş Rolleri (Spouse Roleplay)
- [x] Gezi Eşliği
- [x] Sosyal Etkinlik
- [x] İş Daveti
- [x] Kültür & Sanat
- [x] Spor & Fitness

### 7. Cinsel Yönelim Filtreleri (Tamamlandı)
- [x] Heteroseksüel
- [x] Lezbiyen
- [x] Gay
- [x] Biseksüel
- [x] Trans

### 8. Dil Desteği (Tamamlandı - 21 Mart 2026)
- [x] Rumca (Yunanca) eklendi
- [x] Tüm şehir ve kategori isimlerine el (Greek) çevirileri
- [x] Partner profilinde Rumca dil seçeneği

### 9. Doğrulanmış Profil Rozeti (Tamamlandı)
- [x] is_verified alanı mevcut
- [x] Shield ikonu ile rozet gösterimi
- [x] "Doğrulanmış" etiketi

### 10. Partner Profil Yönetimi (Tamamlandı)
- [x] Profil oluşturma wizard
- [x] Hizmet türleri seçimi (yeni yasal türler)
- [x] Cinsel yönelim seçimi
- [x] Fiziksel özellikler (boy, vücut tipi, saç/göz rengi)
- [x] WhatsApp ve Telegram iletişim bilgileri

---

## Devam Eden / Placeholder Özellikler 🚧

### P1: Gerçek Zamanlı Sohbet
- [ ] WebSocket bağlantısı (placeholder)
- [ ] Mesaj gönderme/alma
- [ ] Okundu bildirimi
- **Dosya**: `/app/frontend/src/pages/user/ConversationPage.js`

### P1: Ödeme Sistemi (Stripe)
- [ ] Paket satın alma akışı
- [ ] Stripe Checkout entegrasyonu
- [ ] Ödeme onay sayfası
- **Not**: Stripe playbook alındı, endpoint placeholder

### P1: Fotoğraf Yükleme
- [ ] Fotoğraf yükleme UI tamamlandı
- [ ] Object storage entegrasyonu hazır
- **Not**: Fonksiyonel ama test edilmedi

### P1: SMS Bildirimleri (Netgsm)
- [ ] Yeni mesaj bildirimi
- [ ] API key admin panelden girilecek
- **Not**: Placeholder endpoint mevcut

---

## Gelecek Görevler (Backlog) 📋

### P2: Çoklu Dil Desteği (i18n)
- [ ] react-i18next entegrasyonu
- [ ] Türkçe, İngilizce, Rusça, Almanca, Rumca çevirileri
- [ ] URL tabanlı dil yönlendirmesi (/tr, /en, /ru, /de, /el)

### P2: Backend Refaktör
- [ ] server.py'ı modüllere böl
- [ ] Ayrı router dosyaları
- [ ] Service layer

### P2: SEO İyileştirmeleri
- [ ] Meta tag'leri
- [ ] Sitemap oluşturma
- [ ] Schema.org markup

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Kullanıcı bilgisi

### Partners
- `GET /api/partners` - Partner listesi (filtreli)
- `GET /api/partners/{slug}` - Partner detay
- `POST /api/partner/profile` - Profil oluştur
- `PUT /api/partner/profile` - Profil güncelle
- `POST /api/partner/upload-image` - Fotoğraf yükle
- `PUT /api/partner/images/{id}/blur` - Blur toggle
- `PUT /api/partner/images/{id}/cover` - Kapak fotoğraf ayarla

### Admin
- `GET /api/admin/profiles` - Profil listesi
- `PUT /api/admin/profiles/{id}/approve` - Onayla
- `PUT /api/admin/profiles/{id}/featured` - Featured toggle
- `PUT /api/admin/profiles/{id}/vitrin` - Vitrin toggle
- `PUT /api/admin/profiles/{id}/homepage-vitrin` - Homepage vitrin toggle
- `PUT /api/admin/profiles/{id}/city-vitrin` - City vitrin toggle

### Diğer
- `GET /api/homepage` - Ana sayfa verileri
- `GET /api/cities` - Şehirler (18 şehir: 10 Kuzey + 8 Güney)
- `GET /api/categories` - Kategoriler (10 hizmet türü)

---

## Test Hesapları
- **Admin**: admin@kktcx.com / admin123
- **Test Partner**: test.partner@kktcx.com / testpass123

---

## Son Güncellemeler (21 Mart 2026)
- ✅ 18 Kıbrıs şehri eklendi (Kuzey + Güney)
- ✅ Rumca dil desteği eklendi (Ελληνικά)
- ✅ Yasal hizmet türleri güncellendi (eskort/jigolo kaldırıldı)
- ✅ 10 yeni eşlik hizmet kategorisi eklendi
- ✅ Şehirler bölgelerine göre gruplandırıldı
- ✅ Ana sayfa filtreleri düzeltildi (cinsiyet/yönelim tekrarı kaldırıldı)
- ✅ Hakkımızda sayfası modern tasarım ile yenilendi
- ✅ İletişim sayfası modern tasarım ile yenilendi
- ✅ Login sayfası modern ve mobil uyumlu tasarım
- ✅ Register sayfası modern ve mobil uyumlu tasarım (Kullanıcı/Partner seçimi)
- ✅ **+18 Yaş Doğrulama Popup'ı** - Yasal uyarı ile site girişinde görünür
- ✅ **Ana Sayfa Yeniden Tasarlandı** - Daha seksi, modern ve erotik görünüm:
  - "Tutkunun Adresi" başlığı (gradient text)
  - Animasyonlu arka plan orb'ları
  - Sexy card hover efektleri
  - Emoji'li cinsiyet butonları
  - Premium VIP kartları için glow animasyonları

### Bug Fixes (21 Mart 2026 - Session 2)
- ✅ **Partnerler Sayfası Filtre Düzeltmesi** - Desktop'ta mükerrer quick filters kaldırıldı, sadece sidebar filtreleri kaldı
- ✅ **Rumca Dil Rotası Düzeltmesi** - /el rotası App.js'e eklendi, artık 404 vermiyor
- ✅ **Rumca Çeviriler Eklendi** - AppContext.js'e tam Yunanca çeviri seti eklendi
- ✅ **Yaş Doğrulama Modalı Çoklu Dil Desteği** - TR, EN, RU, DE, EL dillerinde gösterim

### P1 Özellikler (21 Mart 2026 - Session 2)
- ✅ **Partner Profil Sayfası Yeniden Tasarımı**:
  - Kapak fotoğrafı (cover photo) bölümü
  - Profil avatarı ve isim/yaş bilgisi
  - Quick info kartları (cinsiyet, yönelim, boy, vücut tipi)
  - Müsaitlik badge'leri (bugün, bu akşam, incall, outcall)
  - Sunulan hizmetler bölümü
  - Sağ sidebar: Saatlik ücret, İletişim (Mesaj, WhatsApp, Telegram), Favoriler, İstatistikler
  - Lightbox fotoğraf galerisi
  - Mobil action bar
- ✅ **Yeni Logo Tasarımı**:
  - Gradient animasyonlu logo (KKT=pembe, CX=altın)
  - 18+ badge
  - Hover glow efekti
- ✅ **Geliştirilmiş Footer**:
  - 5 sütunlu layout
  - Marka + Sosyal medya ikonları (Instagram, Twitter, Telegram)
  - Kuzey Kıbrıs şehirleri (Girne, Lefkoşa, Gazimağusa, Güzelyurt, İskele)
  - Güney Kıbrıs şehirleri (Limasol, Larnaka, Baf, Ayia Napa, Protaras)
  - Platform ve Yasal linkler
  - Copyright ve yetişkin içerik uyarısı

### Admin Panel Modernizasyonu (21 Mart 2026 - Session 2)
- ✅ **Yeni Admin Layout**:
  - Modern sidebar (5 kategori, 14 menü öğesi)
  - Breadcrumbs navigasyon
  - Arama çubuğu
  - Bildirim ikonu
  - Kullanıcı bilgi kartı
- ✅ **Admin Dashboard Yenilendi**:
  - 4 ana istatistik kartı (Toplam Kullanıcı, Aktif Partner, Onay Bekleyen, Toplam Gelir)
  - 4 ikincil istatistik (Aktif İlanlar, Vitrin, Mesaj, Görüntüleme)
  - Hızlı işlemler (Profil Onayları, Site Ayarları, SEO, İçerik)
  - Sistem durumu paneli
- ✅ **Site Ayarları Sayfası** (5 Tab):
  - Genel: Site adı, slogan, iletişim, bölgesel ayarlar, bakım modu
  - Marka: Logo/Favicon URL, renk paleti (ana, ikincil, vurgu), önizleme
  - Sosyal: Facebook, Instagram, Twitter, Telegram
  - Özellikler: 7 toggle (Mesajlaşma, Favoriler, Değerlendirmeler, Rezervasyon, Ödeme, SMS, E-posta)
  - Anasayfa: Hero metinleri, bölüm toggle'ları, partner sayısı
- ✅ **SEO Yönetimi Sayfası** (4 Tab):
  - Genel SEO: Site başlığı (60 kar), açıklama (160 kar), anahtar kelimeler, OG image, Twitter handle
  - Sayfa SEO: Sayfa seçici, sayfa başına meta bilgiler
  - Robots & Sitemap: İndeksleme/takip toggle'ları, sitemap URL, özel kurallar, önizleme
  - Analytics: Google Analytics, Search Console, Facebook Pixel, Schema.org yapılandırılmış veri
- ✅ **İçerik Yönetimi Sayfası**:
  - 5 sayfa (Ana Sayfa, Hakkımızda, İletişim, SSS, Footer)
  - 5 dil desteği (TR, EN, RU, DE, EL) bayraklı seçici
  - Tüm metinler düzenlenebilir
  - SSS madde ekleme/silme
- ✅ **Partner/Kullanıcı Dashboard Yenilendi**:
  - Modern kullanıcı kartı (avatar, isim, rol, istatistikler)
  - Yeni sidebar tasarımı
  - Alt işlem butonları (Siteyi Görüntüle, Çıkış)
  - Mobil uyumlu bottom nav
