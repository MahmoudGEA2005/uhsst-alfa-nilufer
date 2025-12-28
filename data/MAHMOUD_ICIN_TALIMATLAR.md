# 🎯 Mahmoud İçin Hızlı Başlangıç

## ✅ Yapılacaklar (Sadece 3 Adım!)

### 1️⃣ Dosyaları Kontrol Et

Bu klasörde şu dosyalar olmalı:
- ✅ `app.py`
- ✅ `requirements.txt`
- ✅ `Master_Optimization_Data.csv`
- ✅ `07_konteyner_doluluk_tahmini.csv`
- ✅ Diğer CSV dosyaları (opsiyonel)

### 2️⃣ Paketleri Yükle

```bash
pip install -r requirements.txt
```

### 3️⃣ Sunucuyu Başlat

**Yöntem 1: Script ile (Önerilen)**
```bash
./start.sh
```

**Yöntem 2: Manuel**
```bash
python app.py
```

**Yöntem 3: Uvicorn ile**
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

## 🎉 Hazır!

Sunucu başladığında:
- ✅ `http://localhost:8000` adresinde çalışıyor
- ✅ Backend'den gelen istekleri bekliyor
- ✅ Her istekte **TÜM SÜRÜCÜLER** için **EN İYİ ROTALARI** otomatik hesaplıyor

## 🔌 Backend Entegrasyonu

Laravel backend'inizde `.env` dosyasına ekleyin:

```env
AI_BACKEND_URL=http://localhost:8000
```

## 🧪 Test

Tarayıcıda aç:
```
http://localhost:8000/health
```

Başarılıysa şunu göreceksin:
```json
{
  "status": "healthy",
  "version": "3.3.0",
  "ready": true
}
```

## 📝 Nasıl Çalışır?

1. **Frontend'de "Rota Oluştur" butonuna bas**
2. **Backend** → Veritabanından tüm sürücüleri ve lokasyonları çeker
3. **Backend** → AI Backend'e gönderir (`POST /ai/generate-assignments`)
4. **AI Backend** → Her sürücü için optimize edilmiş rotayı hesaplar:
   - ✅ Öncelik skorları (Gemini AI veya fallback)
   - ✅ Coğrafi kümeleme (her sürücüye yakın lokasyonlar)
   - ✅ TSP optimizasyonu (en kısa rota)
   - ✅ CO2 ve yakıt hesaplamaları
5. **Backend** → Sonuçları frontend'e gönderir
6. **Frontend** → Haritada rotaları gösterir

## ⚠️ Sorun mu Var?

### Port 8000 kullanımda
```bash
# Farklı port kullan
uvicorn app:app --host 0.0.0.0 --port 8001
```

### CSV dosyaları bulunamıyor
- Dosyaların `data/` klasöründe olduğundan emin ol
- Dosya isimlerinin tam olarak eşleştiğinden emin ol

### Gemini API hatası
- Sorun değil! Fallback hesaplama kullanılır
- API key istersen `.env` dosyası oluştur: `GEMINI_API_KEY=...`

## 🎯 Özet

**Evet, sadece bu dosyaları atman yeterli!**

1. ✅ `app.py` - Ana kod
2. ✅ `requirements.txt` - Paket listesi
3. ✅ CSV dosyaları - Veri
4. ✅ `start.sh` - Başlatma scripti (opsiyonel)

**Tek tuşla çalışır mı?**
- ✅ Evet! `./start.sh` veya `python app.py` ile başlat
- ✅ Backend'den istek geldiğinde otomatik rotaları hesaplar
- ✅ Her sürücü için en iyi rotayı bulur

**Direkt rotaları çizer mi?**
- ✅ Evet! Her sürücü için optimize edilmiş rota listesi döner
- ✅ Frontend haritada gösterir

**Ne kadar işçi varsa hepsini ayrı rotaya atar mı?**
- ✅ Evet! Tüm sürücüler için ayrı ayrı rotalar hesaplanır
- ✅ Coğrafi kümeleme ile yakın lokasyonlar gruplanır
- ✅ Her sürücü kendi bölgesindeki lokasyonları toplar

