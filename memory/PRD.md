# KKTCX.com - Partner Listeleme Platformu PRD

## Proje Özeti
KKTCX.com, Kuzey Kıbrıs'a özel, yetişkin partner listeleme ve profil platformudur. Platform, eskort, jigolo, masöz ve eşlik hizmetleri sunan partnerlerin profillerini listeler ve kullanıcıların bu profilleri filtreleyip mesajlaşmasını sağlar.

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

### 5. Gelişmiş Filtreler (Tamamlandı - 20 Mart 2026)
- [x] Cinsiyet filtresi (Kadın, Erkek, Trans)
- [x] Hizmet türü filtresi (Eskort, Jigolo, Masöz, Eşlik)
- [x] Cinsel yönelim filtresi (Heteroseksüel, Lezbiyen, Gay, Biseksüel, Trans)
- [x] Şehir ve bölge filtresi
- [x] Yaş aralığı filtresi
- [x] Müsaitlik filtresi (Bugün/Bu Gece)

### 6. Partner Profil Yönetimi (Tamamlandı)
- [x] Profil oluşturma wizard
- [x] Hizmet türleri seçimi
- [x] Cinsel yönelim seçimi
- [x] Fiziksel özellikler (boy, vücut tipi, saç/göz rengi)
- [x] Fiyat ve hizmet yeri (incall/outcall)
- [x] WhatsApp ve Telegram iletişim bilgileri

### 7. Admin Panel (Tamamlandı)
- [x] Profil onaylama/reddetme
- [x] Featured toggle
- [x] Vitrin toggle
- [x] Homepage vitrin toggle
- [x] City vitrin toggle
- [x] Paket fiyat düzenleme

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
- [ ] Türkçe, İngilizce, Rusça, Almanca çevirileri
- [ ] URL tabanlı dil yönlendirmesi (/tr, /en, /ru, /de)

### P2: Backend Refaktör
- [ ] server.py'ı modüllere böl
- [ ] Ayrı router dosyaları
- [ ] Service layer

### P2: SEO İyileştirmeleri
- [ ] Meta tag'leri
- [ ] Sitemap oluşturma
- [ ] Schema.org markup

### P3: PostgreSQL Migration (İsteğe Bağlı)
- [ ] MongoDB'den PostgreSQL'e geçiş
- [ ] Kullanıcının Hostinger planına göre değerlendirilecek

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
- `GET /api/cities` - Şehirler
- `GET /api/categories` - Kategoriler

---

## Test Hesapları
- **Admin**: admin@kktcx.com / admin123
- **Test Partner**: test.partner@kktcx.com / testpass123

---

## Son Test Sonuçları (20 Mart 2026)
- Backend: 100% (30/30 test geçti)
- Frontend: 100% (tüm UI akışları çalışıyor)
- Dosya: `/app/test_reports/iteration_1.json`
