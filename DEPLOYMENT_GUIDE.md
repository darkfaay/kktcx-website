# KKTCX.com Deployment Rehberi (Render.com + MongoDB Atlas)

## 1️⃣ MongoDB Atlas Kurulumu (Ücretsiz)

### Hesap Oluşturma:
1. https://www.mongodb.com/cloud/atlas/register adresine gidin
2. Google ile giriş yapın (en hızlısı)
3. "Build a Database" butonuna tıklayın

### Veritabanı Oluşturma:
1. **M0 FREE** seçeneğini seçin (ücretsiz)
2. Provider: **AWS**
3. Region: **Frankfurt (eu-central-1)** - Almanya'ya yakın
4. Cluster Name: `kktcx-cluster`
5. "Create Deployment" tıklayın

### Kullanıcı Oluşturma:
1. Username: `kktcx_admin`
2. Password: Güçlü bir şifre oluşturun (KAYDEDIN!)
3. "Create User" tıklayın

### Network Erişimi:
1. "Network Access" sekmesine gidin
2. "Add IP Address" tıklayın
3. "Allow Access from Anywhere" seçin (0.0.0.0/0)
4. "Confirm" tıklayın

### Connection String Alma:
1. "Database" sekmesine gidin
2. "Connect" butonuna tıklayın
3. "Connect your application" seçin
4. Driver: Python, Version: 3.12 or later
5. Connection string'i kopyalayın:
   ```
   mongodb+srv://kktcx_admin:<password>@kktcx-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. `<password>` yerine şifrenizi yazın
7. Sonuna veritabanı adını ekleyin: `&appName=kktcx`

**Örnek tam URL:**
```
mongodb+srv://kktcx_admin:SIFRENIZ@kktcx-cluster.abc123.mongodb.net/kktcx?retryWrites=true&w=majority&appName=kktcx
```

---

## 2️⃣ Render.com Kurulumu (Ücretsiz)

### Hesap Oluşturma:
1. https://render.com adresine gidin
2. GitHub ile giriş yapın

### Yeni Web Service Oluşturma:
1. Dashboard'da "New +" butonuna tıklayın
2. "Web Service" seçin
3. "Build and deploy from a Git repository" seçin
4. GitHub repo'nuzu bağlayın

### Ayarlar:
- **Name:** `kktcx`
- **Region:** `Frankfurt (EU Central)`
- **Branch:** `main`
- **Runtime:** `Docker`
- **Instance Type:** `Free`

### Environment Variables:
Render Dashboard > Environment sekmesinde ekleyin:

```
MONGO_URL=mongodb+srv://kktcx_admin:SIFRENIZ@kktcx-cluster.xxx.mongodb.net/kktcx?retryWrites=true&w=majority
DB_NAME=kktcx
JWT_SECRET=cok-gizli-bir-key-buraya-yazin-en-az-32-karakter
CORS_ORIGINS=https://kktcx.com,https://www.kktcx.com
```

---

## 3️⃣ Domain Yönlendirme (Hostinger)

### Render'da Custom Domain Ekleme:
1. Render Dashboard > Settings > Custom Domains
2. "Add Custom Domain" tıklayın
3. `kktcx.com` yazın
4. Render size DNS kayıtlarını verecek

### Hostinger DNS Ayarları:
1. Hostinger Panel > Domains > kktcx.com > DNS Zone
2. Mevcut A kaydını silin
3. Yeni kayıtlar ekleyin:

**A Kaydı:**
- Type: A
- Name: @
- Value: (Render'ın verdiği IP)
- TTL: 3600

**CNAME Kaydı (www için):**
- Type: CNAME
- Name: www
- Value: (Render'ın verdiği adres, örn: kktcx.onrender.com)
- TTL: 3600

---

## 4️⃣ SSL Sertifikası
Render otomatik olarak Let's Encrypt SSL sertifikası sağlar. 
Domain bağlandıktan sonra birkaç dakika içinde HTTPS aktif olur.

---

## 5️⃣ Veri Taşıma (Opsiyonel)
Mevcut verilerinizi yeni MongoDB'ye taşımak için:
1. Mevcut veritabanından export alın
2. MongoDB Atlas'a import edin

---

## Sorun Giderme

### Site açılmıyorsa:
1. Render Logs'u kontrol edin
2. Environment variables doğru mu kontrol edin
3. MongoDB bağlantı string'i doğru mu kontrol edin

### DNS yayılma süresi:
Domain yönlendirmesi 24-48 saat sürebilir (genellikle 1-2 saat).
