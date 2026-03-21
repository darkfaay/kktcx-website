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
- ✅ Rumca dil desteği eklendi
- ✅ Yasal hizmet türleri güncellendi (eskort/jigolo kaldırıldı)
- ✅ 10 yeni eşlik hizmet kategorisi eklendi
- ✅ Şehirler bölgelerine göre gruplandırıldı
