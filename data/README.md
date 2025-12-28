# AI/Data Backend - Route Assignment API

Bağımsız AI/Data Backend servisi. Sadece veri analizi, önceliklendirme ve dağıtım yapar.
UI veya kullanıcı yönetimiyle ilgilenmez.

## Mimari

Bu backend tamamen bağımsızdır:
- ✅ Sadece veri analizi ve önceliklendirme yapar
- ✅ Ana backend'den veri alır, JSON döner
- ✅ UI veya kullanıcı yönetimiyle ilgilenmez
- ✅ Günde bir kez assignment üretir ve saklar

## Installation

Create a virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Gemini API Key Setup

1. `.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```

2. `.env` dosyasını düzenleyip Gemini API key'inizi ekleyin:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Gemini API key almak için: https://makersuite.google.com/app/apikey

**Not:** Eğer Gemini API key set edilmezse, sistem otomatik olarak fallback (geleneksel) priority hesaplama metodunu kullanır.

## Running the API

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

## Endpoints

### POST `/ai/generate-assignments`

Günlük rota atamalarını oluşturur.

Günlük route assignment'ları oluşturur, memory'de saklar ve döner.

**⚠️ Önemli:** Günde bir kez çağrılmalı (ör. 05:00'da). Aynı gün içinde tekrar çağrılırsa yeniden üretir.

**Request Body:**
```json
{
  "drivers": [
    {
      "driverId": 1,
      "driverName": "Mehmet Yılmaz",
      "driverUserName": "mehmet.yilmaz"
    },
    {
      "driverId": 2,
      "driverName": "Ahmet Kaya",
      "driverUserName": "ahmet.kaya"
    }
  ],
  "locations": [
    {
      "locationId": 1,
      "locationName": "Atatürk Caddesi – Osmangazi Ulu Cami Main Square",
      "coordinates": [40.1950, 29.0600],
      "distance": 2.5,
      "people_count": 5000
    },
    {
      "locationId": 2,
      "locationName": "Santral Garaj Caddesi – Kent Meydanı AVM West Entrance",
      "coordinates": [40.1975, 29.0618],
      "distance": 1.8,
      "people_count": 8000
    }
  ]
}
```

**Response:**
```json
[
  {
    "driverId": 1,
    "driverUserName": "mehmet.yilmaz",
    "placesToCollect": [
      {
        "priority": 1,
        "locationId": 2,
        "locationName": "Santral Garaj Caddesi – Kent Meydanı AVM West Entrance",
        "coordinates": [40.1975, 29.0618]
      },
      {
        "priority": 2,
        "locationId": 1,
        "locationName": "Atatürk Caddesi – Osmangazi Ulu Cami Main Square",
        "coordinates": [40.1950, 29.0600]
      }
    ]
  },
  {
    "driverId": 2,
    "driverUserName": "ahmet.kaya",
    "placesToCollect": [
      {
        "priority": 1,
        "locationId": 1,
        "locationName": "Atatürk Caddesi – Osmangazi Ulu Cami Main Square",
        "coordinates": [40.1950, 29.0600]
      }
    ]
  }
]
```

**Not:** Priority her sürücü için ayrıdır (Driver 1'in priority 1, 2, 3... vs. Driver 2'nin priority 1, 2...)

### GET `/ai/driver/{driverId}`

Belirli bir sürücü için route assignment'ını döner.

**⚠️ Önkoşul:** Önce `POST /ai/generate-assignments` çağrılmalı.

**Response:**
```json
{
  "driverId": 1,
  "driverUserName": "mehmet.yilmaz",
  "placesToCollect": [
    {
      "priority": 1,
      "locationId": 2,
      "locationName": "Santral Garaj Caddesi – Kent Meydanı AVM West Entrance",
      "coordinates": [40.1975, 29.0618]
    },
    {
      "priority": 2,
      "locationId": 1,
      "locationName": "Atatürk Caddesi – Osmangazi Ulu Cami Main Square",
      "coordinates": [40.1950, 29.0600]
    }
  ]
}
```

### GET `/ai/assignments`

Bugün üretilmiş tüm assignment'ları döner.

## Kullanım Akışı (Workflow)

### Önerilen Kullanım:

1. **Gün başında (05:00):**
   ```bash
   POST /ai/generate-assignments
   ```
   - Ana backend bu endpoint'i çağırır
   - Günlük assignment'lar üretilir ve memory'de saklanır

2. **Gün boyunca:**
   ```bash
   GET /ai/driver/{driverId}
   ```
   - Frontend veya ana backend bu endpoint'i çağırır
   - Sürücüye özel assignment döner

### Neden Günde Bir Kez?

✅ **Avantajlar:**
- Gün boyunca stabil görev listesi
- Sürücü ne yapacağını bilir
- Loglama ve raporlama kolay
- Gerçek hayata daha uygun
- CPU/maliyet tasarrufu

❌ **Her istekte üretmek:**
- Aynı gün içinde değişkenlik
- Tutarsızlık
- Gereksiz kaynak kullanımı
- Debug zorluğu

## Algorithm

The assignment algorithm uses comprehensive CSV data for intelligent priority calculation:

1. **Priority Score Calculation** (when CSV data is available):
   - **PriorityScore** from CSV (40% weight) - Pre-calculated priority based on comprehensive analysis
   - **Doluluk_Riski** (25% weight) - Container fullness risk (higher risk = higher priority)
   - **DailyWaste_Ton** (20% weight) - Daily waste tonnage (more waste = higher priority)
   - **Distance** from input (10% weight) - Shorter distance = higher priority
   - **CurrentOccupancy** (5% weight) - Current container occupancy level

2. **Fallback** (when CSV data is not available for a location):
   - Uses `people_count` (70%) and `distance` (30%) from input

3. **Assignment Process**:
   - Sorts locations by priority score (highest first)
   - Distributes locations evenly among drivers using round-robin
   - **Assigns driver-specific priority numbers (1, 2, 3...) to each driver's locations**

**⚠️ Önemli:** Priority sürücü bazlıdır. Her sürücünün kendi priority 1, 2, 3... listesi vardır.

### CSV Data Sources

The algorithm uses the following CSV files:
- `Master_Optimization_Data.csv` - Contains PriorityScore, DailyWaste_Ton, CurrentOccupancy, etc.
- `07_konteyner_doluluk_tahmini.csv` - Contains Doluluk_Riski (container fullness risk)

Location matching is done by `locationId` from the input matching `LocationID` in the CSV files.

