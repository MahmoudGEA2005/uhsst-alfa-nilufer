# AI Model Açıklaması - Türkçe

## 📋 Genel Bakış

Bu AI/Data Backend, çöp toplama işlemleri için sürücülere lokasyon ataması yapan bir sistemdir. Sistem, sürücüler ve lokasyonlar JSON'unu alır, öncelik hesaplar ve sürücülere görev dağıtır.

---

## 🔄 Nasıl Çalışıyor?

### 1. **INPUT (Girdi)**

Sistem 2 tür JSON alır:

#### a) Drivers JSON (Sürücüler)
```json
{
  "drivers": [
    {
      "driverId": 1,
      "driverName": "Mehmet Yılmaz",
      "driverUserName": "mehmet.yilmaz"
    }
  ]
}
```

#### b) Locations JSON (Lokasyonlar)
```json
{
  "locations": [
    {
      "locationId": 1,
      "locationName": "Atatürk Caddesi",
      "coordinates": [40.1950, 29.0600],
      "distance": 2.5,
      "people_count": 5000
    }
  ]
}
```

### 2. **AI MODELİN YAPTIĞI İŞLEMLER**

#### Adım 1: Bayram/Tatil Günü Kontrolü
- Sistem bugünün bayram veya tatil günü olup olmadığını kontrol eder
- Eğer bayram/tatil günüyse:
  - Yüksek nüfuslu yerler (5000+ kişi): %40 çöp artışı
  - Orta nüfuslu yerler (2000-5000): %30 çöp artışı
  - Düşük nüfuslu yerler (<2000): %20 çöp artışı

#### Adım 2: Priority (Öncelik) Skoru Hesaplama

Her lokasyon için bir öncelik skoru hesaplanır. Bu skor şu faktörlere dayanır:

**CSV Verisi Varsa:**
```
FINAL SCORE = 
  (PriorityScore × %40) +        // En önemli faktör
  (Doluluk_Riski × %25) +        // Konteyner ne kadar dolu?
  (DailyWaste_Ton × %20) +       // Günlük çöp miktarı
  (Distance × %10) +             // Mesafe (kısa = yüksek skor)
  (CurrentOccupancy × %5)        // Mevcut doluluk oranı
```

**CSV Verisi Yoksa (Fallback):**
```
FINAL SCORE = 
  (people_count × %70) +         // Nüfus (daha çok kişi = daha çok çöp)
  (distance × %30)               // Mesafe
```

#### Adım 3: Lokasyonları Sıralama
- Tüm lokasyonlar hesaplanan skorlara göre sıralanır
- En yüksek skorlu lokasyon en üstte (öncelik 1)
- En düşük skorlu lokasyon en altta

#### Adım 4: Sürücülere Dağıtım (Round-Robin)
- Lokasyonlar sırayla sürücülere dağıtılır
- Örnek: 3 lokasyon, 2 sürücü varsa:
  - Lokasyon 1 → Sürücü 1
  - Lokasyon 2 → Sürücü 2
  - Lokasyon 3 → Sürücü 1 (tekrar başa dönüyor)

#### Adım 5: Sürücü Bazlı Priority Oluşturma
**ÖNEMLİ:** Her sürücü için kendi priority listesi oluşturulur:
- Sürücü 1: Priority 1, 2, 3... (kendi listesinden)
- Sürücü 2: Priority 1, 2, 3... (kendi listesinden)

Priority global değil, **sürücü bazlıdır**.

### 3. **OUTPUT (Çıktı)**

Sistem şu formatta JSON döner:

```json
[
  {
    "driverId": 1,
    "driverUserName": "mehmet.yilmaz",
    "placesToCollect": [
      {
        "priority": 1,  // Sürücü 1'in kendi priority 1'i
        "locationId": 2,
        "locationName": "Santral Garaj Caddesi",
        "coordinates": [40.1975, 29.0618]
      },
      {
        "priority": 2,  // Sürücü 1'in kendi priority 2'si
        "locationId": 1,
        "locationName": "Atatürk Caddesi",
        "coordinates": [40.1950, 29.0600]
      }
    ]
  },
  {
    "driverId": 2,
    "driverUserName": "ahmet.kaya",
    "placesToCollect": [
      {
        "priority": 1,  // Sürücü 2'nin kendi priority 1'i
        "locationId": 3,
        "locationName": "Fatih Sultan Mehmet Bulvarı",
        "coordinates": [40.2131, 29.0374]
      }
    ]
  }
]
```

---

## 🌐 Endpoint'ler

### 1. POST `/ai/generate-assignments`
**Ne yapar?**
- Sürücüler ve lokasyonlar JSON'unu alır
- AI mantığını çalıştırır (öncelik hesaplama, dağıtım)
- Sonucu memory'de saklar
- Tüm assignment JSON'unu döner

**Ne zaman çağrılır?**
- Günde bir kez (ör. sabah 05:00'da)
- Aynı gün içinde tekrar çağrılırsa yeniden üretir

**Örnek Kullanım:**
```bash
POST http://localhost:8000/ai/generate-assignments
Content-Type: application/json

{
  "drivers": [...],
  "locations": [...]
}
```

### 2. GET `/ai/driver/{driverId}`
**Ne yapar?**
- Daha önce üretilmiş assignment'lardan
- Sadece belirtilen sürücünün assignment'ını döner

**Ne zaman çağrılır?**
- Gün boyunca (sürücüye görevlerini görmek için)
- Frontend veya ana backend çağırabilir

**Örnek Kullanım:**
```bash
GET http://localhost:8000/ai/driver/1
```

**Response:**
```json
{
  "driverId": 1,
  "driverUserName": "mehmet.yilmaz",
  "placesToCollect": [
    {
      "priority": 1,
      "locationId": 2,
      "locationName": "...",
      "coordinates": [40.1975, 29.0618]
    }
  ]
}
```

### 3. GET `/ai/assignments`
**Ne yapar?**
- Bugün üretilmiş tüm assignment'ları döner
- Tüm sürücülerin görevlerini içerir

---

## 🎯 Priority Mantığı Detayı

### Örnek Senaryo:

**Lokasyonlar:**
1. Location 1: Nüfus 5000, Mesafe 2.5 km
2. Location 2: Nüfus 8000, Mesafe 1.8 km
3. Location 3: Nüfus 6000, Mesafe 3.2 km

**Hesaplama:**
1. Location 2 → En yüksek skor (yüksek nüfus + kısa mesafe)
2. Location 3 → Orta skor
3. Location 1 → En düşük skor

**Dağıtım (2 sürücü varsa):**
- Sürücü 1: Location 2 (Priority 1), Location 1 (Priority 2)
- Sürücü 2: Location 3 (Priority 1)

### Bayram Günü Örneği:

Bugün bayram günüyse:
- Location 2 (8000 nüfus): Normal çöp miktarı × 1.4 = %40 artış
- Location 3 (6000 nüfus): Normal çöp miktarı × 1.4 = %40 artış
- Location 1 (5000 nüfus): Normal çöp miktarı × 1.4 = %40 artış

Bu artış, priority skorunu yükseltir ve bayram günlerinde bu lokasyonlar daha yüksek öncelik alır.

---

## 🔧 Teknik Detaylar

### CSV Verileri:
- `Master_Optimization_Data.csv`: PriorityScore, DailyWaste_Ton, CurrentOccupancy
- `07_konteyner_doluluk_tahmini.csv`: Doluluk_Riski

### Bayram Günleri:
- Sistem otomatik olarak Türkiye'nin resmi bayramlarını kontrol eder
- Hafta sonları da tatil olarak kabul edilir
- Bayram listesi `BAYRAM_GUNLERI` değişkeninde tanımlıdır

### Memory Cache:
- Assignment'lar memory'de saklanır
- Her gün yeniden üretilir
- Gün değiştiğinde eski assignment'lar geçersiz olur

---

## 📊 Sonuç

Bu sistem:
- ✅ Sürücülere adil ve mantıklı görev dağıtımı yapar
- ✅ Nüfus, mesafe, çöp miktarı gibi faktörleri dikkate alır
- ✅ Bayram/tatil günlerinde çöp artışını hesaba katar
- ✅ Her sürücü için kendi priority listesi oluşturur
- ✅ Frontend veya ana backend'e JSON formatında veri sağlar
- ✅ Günde bir kez üretir, gün boyunca stabil kalır


