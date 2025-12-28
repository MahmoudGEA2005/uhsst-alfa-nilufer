# 🚀 Nilüfer AI Smart Waste Manager - Kurulum Rehberi

## 📋 Gereksinimler

- Python 3.8+
- pip (Python paket yöneticisi)

## 🔧 Kurulum Adımları

### 1. Python Paketlerini Yükle

```bash
cd data
pip install -r requirements.txt
```

### 2. Environment Variables (Opsiyonel - Gemini AI için)

Eğer Gemini AI kullanmak istiyorsanız, `.env` dosyası oluşturun:

```bash
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

**Not:** Gemini API key olmadan da çalışır, fallback hesaplama kullanılır.

### 3. Sunucuyu Başlat

```bash
python app.py
```

veya

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Sunucu başladığında şu mesajı göreceksiniz:
```
🚀 Nilüfer AI Smart Waste Manager V3.3 Ultimate başlatılıyor...
```

### 4. Test Et

Tarayıcıda veya terminalde:
```bash
curl http://localhost:8000/health
```

## 📁 Gerekli Dosyalar

Bu klasörde şu dosyalar olmalı:

### ✅ Zorunlu Dosyalar:
- `app.py` - Ana uygulama
- `requirements.txt` - Python bağımlılıkları
- `Master_Optimization_Data.csv` - Lokasyon master verisi
- `07_konteyner_doluluk_tahmini.csv` - Doluluk tahmin verisi

### 📊 Opsiyonel (Kullanılmıyor ama iyi olur):
- `01_mahalle_oncelik_matrisi.csv`
- `03_operasyonel_kisit_tablosu.csv`
- `04_karbon_maliyet_analizi.csv`
- `06_karbon_sosyal_etki.csv`
- `08_saatlik_rolanti_analizi.csv`
- `09_arac_yakit_standartlari.csv`
- `09_detayli_maliyet_tablosu.csv`

## 🔌 Backend Entegrasyonu

Laravel backend'inizde `.env` dosyasına ekleyin:

```env
AI_BACKEND_URL=http://localhost:8000
```

## 🎯 Nasıl Çalışır?

1. **Backend (Laravel)** → Driver ve Location verilerini veritabanından çeker
2. **Backend** → AI Backend'e POST isteği atar (`/ai/generate-assignments`)
3. **AI Backend (Python)** → Optimize edilmiş rotaları hesaplar ve döner
4. **Backend** → Sonuçları frontend'e gönderir

## 🧪 Test

```bash
# Health check
curl http://localhost:8000/health

# Test endpoint
python test_endpoint.py
```

## ⚠️ Sorun Giderme

### Port 8000 kullanımda
```bash
# Farklı port kullan
uvicorn app:app --host 0.0.0.0 --port 8001
```

### CSV dosyaları bulunamıyor
- Dosyaların `data/` klasöründe olduğundan emin olun
- Dosya isimlerinin tam olarak eşleştiğinden emin olun

### Gemini API hatası
- `.env` dosyasında API key doğru mu kontrol edin
- API key yoksa fallback hesaplama kullanılır (sorun değil)

## 📝 Notlar

- AI backend sadece **karar verme** yapar, veritabanına yazmaz
- State dosyası `api/learning_data/system_state.json` olarak kaydedilir
- Her istekte tüm rotalar yeniden hesaplanır

