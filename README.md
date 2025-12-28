# Nilüfer Akıllı Atık Yönetimi

Nilüfer Belediyesi için geliştirilmiş akıllı atık toplama ve rota optimizasyonu sistemi. Bu sistem, sürücüler ve yöneticiler için modern bir arayüz sunarak atık toplama süreçlerini optimize eder.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Yapılandırma](#-yapılandırma)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Proje Yapısı](#-proje-yapısı)

## ✨ Özellikler

### Sürücü Paneli
- **Gerçek Zamanlı Konum Takibi**: GPS tabanlı konum izleme
- **Rota Görüntüleme**: Günlük rotaların haritada görüntülenmesi
- **Durak Listesi**: Yaklaşan durakların detaylı listesi
- **İlerleme Takibi**: Tamamlanan durak sayısı ve tahmini bitiş saati

### Yönetim Paneli
- **Kontrol Paneli**: Sistem istatistikleri ve özet bilgiler
- **Sürücü Yönetimi**: Sürücü ekleme, düzenleme ve listeleme
- **Rota Oluşturma**: Haftalık programa göre otomatik rota optimizasyonu
- **Programlama**: Haftalık toplama programı görüntüleme
- **İstatistikler**: Atık toplama, CO₂ tasarrufu ve maliyet analizleri

### Rota Optimizasyonu
- **Akıllı Algoritma**: Round-robin tabanlı rota optimizasyonu
- **Araç Tipi Optimizasyonu**: Vinçli ve standart araçlar için ayrı rotalar
- **Kapasite Yönetimi**: %95 kapasite limiti ile verimli yükleme
- **Haftalık Program Entegrasyonu**: Günlük toplama programına göre filtreleme

## 🛠 Teknoloji Stack

### Backend
- **Framework**: Laravel 11
- **Veritabanı**: MySQL
- **Kimlik Doğrulama**: Laravel Sanctum
- **API**: RESTful API

### Frontend
- **Framework**: React 18 + TypeScript
- **Rotalama**: React Router
- **Harita**: Google Maps API (@react-google-maps/api)
- **HTTP İstemcisi**: Axios
- **Form Yönetimi**: React Hook Form
- **Stil**: CSS3

### Veri İşleme
- **CSV Parsing**: Özel CSV okuyucu
- **Optimizasyon**: Haversine mesafe hesaplama
- **Rota Algoritması**: Round-robin assignment

## 📦 Kurulum

### Gereksinimler
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0
- Google Maps API Key

### Backend Kurulumu

```bash
# Proje dizinine gidin
cd backend

# Bağımlılıkları yükleyin
composer install

# .env dosyasını oluşturun
cp .env.example .env

# Uygulama anahtarı oluşturun
php artisan key:generate

# Veritabanı bağlantısını .env dosyasında yapılandırın
# DB_DATABASE=uhsst
# DB_USERNAME=root
# DB_PASSWORD=

# Veritabanı migration'larını çalıştırın
php artisan migrate

# Veritabanını seed edin (test verileri)
php artisan db:seed

# Sunucuyu başlatın
php artisan serve
```

Backend `http://localhost:8000` adresinde çalışacaktır.

### Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
cp .env.example .env

# .env dosyasını düzenleyin (backend URL ve Google Maps API key)
# VITE_BACKEND_URL=http://localhost:8000/api
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Geliştirme sunucusunu başlatın
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

## ⚙️ Yapılandırma

### Backend .env Ayarları

```env
APP_NAME="Nilüfer Akıllı Atık Yönetimi"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=uhsst
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

### Frontend .env Ayarları

```env
VITE_BACKEND_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_STORAGE_URL=http://localhost:8000/storage
```

### Google Maps API Key Alma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. "APIs & Services" > "Library" bölümünden "Maps JavaScript API"yi etkinleştirin
4. "Credentials" bölümünden API anahtarı oluşturun
5. Anahtarı `.env` dosyasına ekleyin

## 🚀 Kullanım

### Sürücü Girişi

1. `http://localhost:5173/login` adresine gidin
2. Test sürücü bilgileri ile giriş yapın:
   - **E-posta**: driver@test.com
   - **Şifre**: password123

3. Ana sayfada rotanızı görüntüleyebilirsiniz
4. Haritada konumunuz ve rotanız görüntülenir

### Yönetici Girişi

1. `http://localhost:5173/admin-login` adresine gidin
2. Test admin bilgileri ile giriş yapın:
   - **E-posta**: mahmoud.ea2005@gmail.com
   - **Şifre**: llllllll

3. Yönetim paneline erişebilirsiniz:
   - **Kontrol Paneli**: Sistem istatistikleri
   - **Sürücüler**: Sürücü yönetimi
   - **Rotalar**: Rota oluşturma ve görüntüleme
   - **Programlama**: Haftalık toplama programı

### Rota Oluşturma

1. Yönetim panelinde **"Rotalar"** menüsüne gidin
2. **"Rota Oluştur"** butonuna tıklayın
3. Sistem otomatik olarak:
   - Bugünkü gün için toplanacak lokasyonları filtreler
   - Sürücülere rotaları atar
   - Rotaları veritabanına kaydeder

**Not**: Sistem haftalık programa göre çalışır:
- **Haftada 7 kez**: Her gün toplanır
- **Haftada 6 kez**: Pazartesi-Cumartesi toplanır
- **Haftada 3 kez**: Pazartesi, Çarşamba, Cuma toplanır

## 📡 API Dokümantasyonu

### Authentication Endpoints

#### Driver Login
```http
POST /api/drivers/login
Content-Type: application/json

{
  "email": "driver@test.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "auth_token_here",
  "driver": {
    "id": 1,
    "first_name": "Ahmet",
    "last_name": "Yılmaz",
    "email": "driver@test.com"
  }
}
```

#### Check Authentication
```http
GET /api/drivers/auth/check
Authorization: Bearer {token}
```

### Route Endpoints

#### Generate Routes
```http
GET /api/routes/generate
```

Bugünkü gün için rotaları oluşturur. Programlama sayfasındaki haftalık programa göre filtreleme yapar.

**Response:**
```json
{
  "message": "Rotalar başarıyla oluşturuldu",
  "data": {
    "total_routes": 3,
    "total_waste_kg": 15000,
    "drivers_count": 3,
    "locations_count": 25
  }
}
```

#### Get Driver Routes
```http
GET /api/routes/driver/{driverId}
Authorization: Bearer {token}
```

Belirli bir sürücünün rotalarını getirir.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "driver_id": 1,
      "route_data": {
        "Arac": "Ahmet Yılmaz",
        "Tip": "Standard",
        "Ozet": {
          "Cop_kg": 5000,
          "Durak_Sayisi": 8,
          "Mesafe_km": 45.2,
          "Kapasite_Kullanim": "%62"
        },
        "Rota": [
          {
            "Sira": 1,
            "Mahalle": "KONAK MAHALLESİ",
            "Koordinat": {
              "Lat": 40.2073,
              "Lng": 28.9823
            },
            "Cop_kg": 650,
            "Mesafe_km": 2.3
          }
        ]
      }
    }
  ]
}
```

### Statistics Endpoints

#### Get Statistics
```http
GET /api/stats
```

Sistem istatistiklerini getirir (ağaç kurtarılan, CO₂ tasarrufu, vb.).

## 📁 Proje Yapısı

```
uhsst-alfa-nilufer/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       ├── RouteController.php    # Rota optimizasyonu
│   │   │       ├── DriverController.php   # Sürücü yönetimi
│   │   │       ├── StatsController.php    # İstatistikler
│   │   │       └── ...
│   │   └── Models/
│   │       ├── Driver.php
│   │       ├── AIRoute.php
│   │       └── ...
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── storage/
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/        # Harita komponenti
│   │   │   ├── TaskNav/    # Görev navigasyonu
│   │   │   ├── AdminLayout/
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── MainComponent.tsx
│   │   │   ├── Overview.tsx
│   │   │   ├── Routes.tsx
│   │   │   └── ...
│   │   └── App.tsx
│   └── package.json
│
└── data/                    # CSV Veri Dosyaları
    ├── Master_Optimization_Data.csv
    ├── 01_mahalle_oncelik_matrisi.csv
    ├── 03_operasyonel_kisit_tablosu.csv
    └── ...
```

## 🔧 Rota Optimizasyonu Algoritması

Sistem, Python script'inden uyarlanan round-robin algoritması kullanır:

1. **Veri Yükleme**: CSV'den lokasyon verilerini yükler
2. **Günlük Filtreleme**: Haftalık programa göre bugün toplanacak lokasyonları filtreler
3. **Filo Hazırlama**: Sürücüleri araç tiplerine göre dağıtır (Vinçli/Standart)
4. **Round-Robin Atama**: Her sürücüye sırayla en yakın uygun işi atar
5. **Kapasite Kontrolü**: %95 kapasite limiti ile kontrol eder
6. **Mesafe Hesaplama**: Haversine formülü ile mesafe hesaplar
7. **Rota Kaydetme**: Optimize edilmiş rotaları veritabanına kaydeder

## 📊 Veri Dosyaları

Sistem aşağıdaki CSV dosyalarını kullanır:

- `Master_Optimization_Data.csv`: Ana lokasyon verileri (koordinatlar, atık miktarı, araç tipi, frekans)
- `01_mahalle_oncelik_matrisi.csv`: Mahalle öncelik skorları
- `04_karbon_maliyet_analizi.csv`: Karbon ve maliyet analizleri
- `06_karbon_sosyal_etki.csv`: Çevresel etki verileri
- `07_konteyner_doluluk_tahmini.csv`: Konteyner doluluk tahminleri

## 🐛 Sorun Giderme

### Rota Oluşturulmuyor
- Bugünkü gün için toplanacak lokasyon olup olmadığını kontrol edin
- Log dosyalarını kontrol edin: `backend/storage/logs/laravel.log`
- Sürücü sayısının yeterli olduğundan emin olun (minimum 1)

### Harita Görünmüyor
- Google Maps API key'in doğru yapılandırıldığından emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin
- API key'in "Maps JavaScript API" için etkinleştirildiğinden emin olun

### Konum Servisi Çalışmıyor
- Tarayıcı konum iznini kontrol edin
- HTTPS bağlantısı kullanın (localhost haricinde)
- Network tabanlı konum kullanılıyor (daha güvenilir)

## 📝 Notlar

- Sistem test ortamı için yapılandırılmıştır
- Production ortamında güvenlik ayarlarını gözden geçirin
- Google Maps API kullanım limitlerini kontrol edin
- CSV dosyaları güncel tutulmalıdır

## 👥 Katkıda Bulunanlar

Nilüfer Belediyesi - Akıllı Atık Yönetimi Projesi

## 📄 Lisans

Bu proje Nilüfer Belediyesi için geliştirilmiştir.

