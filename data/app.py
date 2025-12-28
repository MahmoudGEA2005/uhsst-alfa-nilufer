"""
╔══════════════════════════════════════════════════════════════════════════════╗
║            NİLÜFER AI SMART WASTE MANAGER - V3.3 ULTIMATE                   ║
║                                                                              ║
║  Hibrit Zeka: Gemini AI + Matematiksel Kümeleme + TSP Optimizasyonu         ║
║  Kalıcı Hafıza: JSON tabanlı state persistence                              ║
║  Zig-Zag Önleme: Coğrafi kümeleme + En yakın komşu algoritması              ║
║                                                                              ║
║  Geliştirici: AI/Data Backend Team                                          ║
║  Versiyon: 3.3.0 Ultimate                                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Tuple
import os
import json
import csv
import math
from datetime import datetime, date
from pathlib import Path

# ═══════════════════════════════════════════════════════════════════════════════
# ENVIRONMENT & CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

# .env dosyasını yükle
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️ python-dotenv yüklü değil, .env dosyası okunamayacak")

# Gemini API
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
        GEMINI_ENABLED = True
        print("✅ Gemini API yapılandırıldı")
    else:
        GEMINI_ENABLED = False
        gemini_model = None
        print("⚠️ GEMINI_API_KEY bulunamadı, fallback hesaplama kullanılacak")
except ImportError:
    GEMINI_ENABLED = False
    gemini_model = None
    print("⚠️ google-generativeai yüklü değil")

# ═══════════════════════════════════════════════════════════════════════════════
# PATHS & DIRECTORIES
# ═══════════════════════════════════════════════════════════════════════════════

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "api" / "learning_data"
STATE_FILE = DATA_DIR / "system_state.json"

# Klasörleri oluştur
os.makedirs(DATA_DIR, exist_ok=True)
print(f"📁 Data dizini: {DATA_DIR}")

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

# Yol faktörü (kuş uçuşu mesafeyi gerçek yol mesafesine çevirmek için)
ROAD_FACTOR = 1.35

# Bayram ve tatil günleri (2025)
BAYRAM_GUNLERI = [
    # Yılbaşı
    date(2025, 1, 1),
    # Ramazan Bayramı (tahmini)
    date(2025, 3, 30), date(2025, 3, 31), date(2025, 4, 1),
    # Ulusal Egemenlik ve Çocuk Bayramı
    date(2025, 4, 23),
    # Emek ve Dayanışma Günü
    date(2025, 5, 1),
    # Atatürk'ü Anma, Gençlik ve Spor Bayramı
    date(2025, 5, 19),
    # Kurban Bayramı (tahmini)
    date(2025, 6, 6), date(2025, 6, 7), date(2025, 6, 8), date(2025, 6, 9),
    # Demokrasi ve Milli Birlik Günü
    date(2025, 7, 15),
    # Zafer Bayramı
    date(2025, 8, 30),
    # Cumhuriyet Bayramı
    date(2025, 10, 29),
]

# Araç yakıt ve CO2 verileri (CSV'den düzeltilmiş değerler)
VEHICLE_DATA = {
    "Crane": {
        "co2_per_km": 6.29,
        "fuel_per_100km": 234.77,
        "cost_per_km": 105.65
    },
    "Large Garbage Truck": {
        "co2_per_km": 1.59,
        "fuel_per_100km": 59.5,
        "cost_per_km": 26.78
    },
    "Small Garbage Truck": {
        # HARDCODE FIX: CSV'deki 6376.69 değeri hatalı, 25.0 olarak düzeltildi
        "co2_per_km": 0.67,
        "fuel_per_100km": 25.0,  # Düzeltildi!
        "cost_per_km": 11.25
    },
    "Standard": {
        "co2_per_km": 1.59,
        "fuel_per_100km": 59.5,
        "cost_per_km": 26.78
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI APP
# ═══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="Nilüfer AI Smart Waste Manager",
    description="Hibrit Zeka ile Çöp Toplama Optimizasyonu",
    version="3.3.0"
)

# ═══════════════════════════════════════════════════════════════════════════════
# GLOBAL STATE (Kalıcı Hafıza)
# ═══════════════════════════════════════════════════════════════════════════════

class SystemState:
    """Sistem durumunu yöneten sınıf - Kalıcı hafıza"""
    
    def __init__(self):
        self.location_states: Dict[int, Dict] = {}  # {location_id: {last_collected_at, collected_by, occupancy}}
        self.daily_assignments: Optional[Dict] = None
        self.last_generation_date: Optional[str] = None
        self.csv_cache: Optional[Dict] = None
        
    def to_dict(self) -> Dict:
        """State'i JSON'a dönüştür"""
        return {
            "location_states": {
                str(k): {
                    **v,
                    "last_collected_at": v.get("last_collected_at").isoformat() if v.get("last_collected_at") else None
                }
                for k, v in self.location_states.items()
            },
            "last_generation_date": self.last_generation_date,
            "last_updated": datetime.now().isoformat()
        }
    
    def from_dict(self, data: Dict):
        """JSON'dan state'i yükle"""
        if "location_states" in data:
            for loc_id, state in data["location_states"].items():
                self.location_states[int(loc_id)] = {
                    "last_collected_at": datetime.fromisoformat(state["last_collected_at"]) if state.get("last_collected_at") else None,
                    "collected_by": state.get("collected_by"),
                    "occupancy": state.get("occupancy", 0)
                }
        self.last_generation_date = data.get("last_generation_date")

# Global state instance
_state = SystemState()

# ═══════════════════════════════════════════════════════════════════════════════
# PERSISTENCE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def save_state_sync():
    """State'i dosyaya kaydet (senkron)"""
    try:
        with open(STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump(_state.to_dict(), f, ensure_ascii=False, indent=2)
        print(f"💾 State kaydedildi: {STATE_FILE}")
    except Exception as e:
        print(f"❌ State kaydetme hatası: {e}")

def save_state_background(background_tasks: BackgroundTasks):
    """State'i arka planda kaydet (asenkron, hız için)"""
    background_tasks.add_task(save_state_sync)

def load_state():
    """Başlangıçta state'i yükle"""
    global _state
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            _state.from_dict(data)
            print(f"✅ State yüklendi: {len(_state.location_states)} lokasyon durumu")
        except Exception as e:
            print(f"⚠️ State yükleme hatası: {e}, yeni state oluşturulacak")
    else:
        print("📝 State dosyası bulunamadı, yeni oluşturulacak")

# ═══════════════════════════════════════════════════════════════════════════════
# STARTUP EVENT
# ═══════════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    """Sunucu başladığında state'i yükle"""
    print("\n" + "="*60)
    print("🚀 Nilüfer AI Smart Waste Manager V3.3 Ultimate başlatılıyor...")
    print("="*60)
    load_state()
    load_csv_data()  # CSV'leri önden yükle
    print("="*60 + "\n")

# ═══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class Driver(BaseModel):
    driverId: int
    driverName: str
    driverUserName: str

class Location(BaseModel):
    locationId: int
    locationName: str
    coordinates: List[float]
    distance: float
    people_count: int

class LocationAssignment(BaseModel):
    priority: int
    locationId: int
    streetName: str  # JSON formatına uyum için locationName → streetName
    coordinates: List[float]
    estimatedOccupancy: Optional[float] = None

class RouteStats(BaseModel):
    total_distance_km: float = 0.0
    estimated_co2_kg: float = 0.0
    estimated_fuel_liters: float = 0.0
    estimated_cost_tl: float = 0.0
    optimization_method: str = "TSP Nearest Neighbor"

class DriverAssignment(BaseModel):
    driverId: int
    driverName: str  # JSON formatına uyum için driverUserName → driverName
    placesToCollect: List[LocationAssignment]
    routeStats: Optional[RouteStats] = None
    clusterInfo: Optional[str] = None

class AssignmentRequest(BaseModel):
    drivers: List[Driver]
    locations: List[Location]

class CollectionRequest(BaseModel):
    driverId: int
    locationId: int

class AssignmentResponse(BaseModel):
    success: bool
    message: str
    assignments: List[DriverAssignment]
    metadata: Dict

# ═══════════════════════════════════════════════════════════════════════════════
# CSV DATA LOADING
# ═══════════════════════════════════════════════════════════════════════════════

def load_csv_data() -> Dict:
    """
    Tüm CSV dosyalarını yükle.
    Hata olursa çökme, boş dict döndür.
    """
    global _state
    
    if _state.csv_cache is not None:
        return _state.csv_cache
    
    all_data = {
        "master_data": {},
        "doluluk_data": {},
        "oncelik_matrisi": {},
        "operasyonel_kisit": {}
    }
    
    csv_files = {
        "master_data": ("Master_Optimization_Data.csv", "LocationID"),
        "doluluk_data": ("07_konteyner_doluluk_tahmini.csv", "LocationID"),
    }
    
    for key, (filename, id_field) in csv_files.items():
        file_path = BASE_DIR / filename
        if not file_path.exists():
            print(f"⚠️ CSV bulunamadı: {filename}")
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    loc_id_str = row.get(id_field) or row.get(f'\ufeff{id_field}')
                    if loc_id_str:
                        try:
                            loc_id = int(float(loc_id_str))
                            all_data[key][loc_id] = row
                        except (ValueError, TypeError):
                            continue
            print(f"✅ CSV yüklendi: {filename} ({len(all_data[key])} kayıt)")
        except Exception as e:
            print(f"❌ CSV yükleme hatası ({filename}): {e}")
    
    _state.csv_cache = all_data
    return all_data

# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def is_holiday(check_date: date = None) -> bool:
    """Bugün bayram/tatil mü?"""
    if check_date is None:
        check_date = date.today()
    # Hafta sonu
    if check_date.weekday() >= 5:
        return True
    # Resmi tatil
    return check_date in BAYRAM_GUNLERI

def haversine_distance(coord1: List[float], coord2: List[float]) -> float:
    """
    Haversine formülü ile mesafe hesapla (km).
    Sonucu ROAD_FACTOR ile çarp (gerçek yol mesafesi tahmini).
    """
    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    r = 6371  # Dünya yarıçapı (km)
    
    # Kuş uçuşu mesafe × Yol faktörü
    return r * c * ROAD_FACTOR

def calculate_route_stats(locations: List[Location], vehicle_type: str = "Standard") -> Tuple[float, RouteStats]:
    """Rota istatistiklerini hesapla"""
    if len(locations) < 2:
        return 0.0, RouteStats()
    
    total_distance = 0.0
    for i in range(len(locations) - 1):
        dist = haversine_distance(locations[i].coordinates, locations[i+1].coordinates)
        total_distance += dist
    
    # Araç verilerini al
    v_data = VEHICLE_DATA.get(vehicle_type, VEHICLE_DATA["Standard"])
    
    co2 = total_distance * v_data["co2_per_km"]
    fuel = total_distance * v_data["fuel_per_100km"] / 100
    cost = total_distance * v_data["cost_per_km"]
    
    return total_distance, RouteStats(
        total_distance_km=round(total_distance, 2),
        estimated_co2_kg=round(co2, 2),
        estimated_fuel_liters=round(fuel, 2),
        estimated_cost_tl=round(cost, 2),
        optimization_method="TSP Nearest Neighbor + Clustering"
    )

def get_dynamic_occupancy(location_id: int, csv_data: Dict) -> float:
    """
    Dinamik doluluk hesapla.
    Son toplamadan bu yana geçen süreye göre doluluk artar.
    """
    state = _state.location_states.get(location_id, {})
    last_collected = state.get("last_collected_at")
    
    # CSV'den dolma süresi
    doluluk_entry = csv_data.get("doluluk_data", {}).get(location_id, {})
    try:
        dolma_suresi_saat = float(doluluk_entry.get("Dolma_Suresi_Saat", 24))
        if dolma_suresi_saat <= 0:
            dolma_suresi_saat = 24
    except:
        dolma_suresi_saat = 24
    
    if last_collected is None:
        # Hiç toplanmamış, CSV'deki değeri kullan
        master_entry = csv_data.get("master_data", {}).get(location_id, {})
        try:
            return float(master_entry.get("CurrentOccupancy", 50))
        except:
            return 50.0
    
    # Toplama sonrası doluluk hesapla
    hours_since = (datetime.now() - last_collected).total_seconds() / 3600
    occupancy = (hours_since / dolma_suresi_saat) * 100
    
    return min(occupancy, 100.0)

# ═══════════════════════════════════════════════════════════════════════════════
# GEMINI AI INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

def gemini_get_priority(location: Location, csv_data: Dict, is_holiday_today: bool) -> Optional[float]:
    """
    Gemini AI ile aciliyet puanı al (0-100).
    Prompt'a nüfus, doluluk ve bayram bilgisi verilir.
    """
    if not GEMINI_ENABLED or gemini_model is None:
        return None
    
    try:
        # Dinamik doluluk
        occupancy = get_dynamic_occupancy(location.locationId, csv_data)
        
        # CSV verileri
        master = csv_data.get("master_data", {}).get(location.locationId, {})
        doluluk = csv_data.get("doluluk_data", {}).get(location.locationId, {})
        
        prompt = f"""Sen bir çöp toplama aciliyet değerlendirme AI'ısın. 0-100 arası aciliyet puanı ver.

LOKASYON: {location.locationName} (ID: {location.locationId})

VERİLER:
- Nüfus: {location.people_count:,} kişi
- Mevcut Doluluk: %{occupancy:.1f}
- Mesafe: {location.distance} km
- Günlük Çöp: {master.get('DailyWaste_Ton', 'N/A')} ton
- Dolma Süresi: {doluluk.get('Dolma_Suresi_Saat', 'N/A')} saat
- Doluluk Riski: {doluluk.get('Doluluk_Riski', 'N/A')}%

BUGÜN BAYRAM/TATİL: {'✅ EVET - Çöp artar!' if is_holiday_today else '❌ Hayır'}

KURALLAR:
- Doluluk %80+ → 85-100 puan
- Doluluk %50-80 → 60-84 puan
- Bayramda puanı %20 artır
- Nüfus çok fazlaysa öncelik ver

SADECE 0-100 ARASI BİR SAYI YAZ. Açıklama yapma."""

        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        
        # Sayıyı çıkar
        import re
        match = re.search(r'(\d+)', text)
        if match:
            score = int(match.group(1))
            return max(0, min(100, score))
        
        return None
        
    except Exception as e:
        print(f"⚠️ Gemini hatası (Location {location.locationId}): {e}")
        return None

def fallback_priority(location: Location, csv_data: Dict, is_holiday_today: bool) -> float:
    """Gemini çalışmazsa fallback hesaplama"""
    occupancy = get_dynamic_occupancy(location.locationId, csv_data)
    
    # CSV verileri
    master = csv_data.get("master_data", {}).get(location.locationId, {})
    doluluk = csv_data.get("doluluk_data", {}).get(location.locationId, {})
    
    try:
        dolma_suresi = float(doluluk.get("Dolma_Suresi_Saat", 24))
        daily_waste = float(master.get("DailyWaste_Ton", 10))
    except:
        dolma_suresi = 24
        daily_waste = 10
    
    # Bayram çarpanı
    holiday_mult = 1.3 if is_holiday_today else 1.0
    
    # Skor hesapla
    occupancy_score = (occupancy / 100) * 40  # Maks 40
    dolma_score = max(0, (1 - dolma_suresi / 72)) * 25  # Maks 25
    waste_score = min(daily_waste / 30, 1) * 20  # Maks 20
    people_score = min(location.people_count / 30000, 1) * 15  # Maks 15
    
    total = (occupancy_score + dolma_score + waste_score + people_score) * holiday_mult
    
    return min(100, total)

def get_priority_score(location: Location, csv_data: Dict, is_holiday_today: bool) -> float:
    """Öncelik skoru al (Gemini veya fallback)"""
    gemini_score = gemini_get_priority(location, csv_data, is_holiday_today)
    
    if gemini_score is not None:
        print(f"  🤖 Gemini: Location {location.locationId} → {gemini_score}")
        return gemini_score
    
    fallback_score = fallback_priority(location, csv_data, is_holiday_today)
    print(f"  📊 Fallback: Location {location.locationId} → {fallback_score:.1f}")
    return fallback_score

# ═══════════════════════════════════════════════════════════════════════════════
# CLUSTERING & TSP ALGORITHMS
# ═══════════════════════════════════════════════════════════════════════════════

def cluster_locations(locations: List[Location], n_clusters: int) -> List[List[Location]]:
    """
    Lokasyonları coğrafi olarak kümele.
    Açısal bölme: Merkez noktadan açıya göre eşit parçalara böl.
    """
    if n_clusters <= 0 or len(locations) == 0:
        return []
    
    if n_clusters >= len(locations):
        return [[loc] for loc in locations]
    
    # Merkez nokta
    avg_lat = sum(loc.coordinates[0] for loc in locations) / len(locations)
    avg_lon = sum(loc.coordinates[1] for loc in locations) / len(locations)
    
    # Açıya göre sırala (saat yönünde)
    def angle(loc: Location) -> float:
        return math.atan2(loc.coordinates[0] - avg_lat, loc.coordinates[1] - avg_lon)
    
    sorted_locs = sorted(locations, key=angle)
    
    # Eşit parçalara böl
    clusters = []
    size = len(sorted_locs) // n_clusters
    remainder = len(sorted_locs) % n_clusters
    
    start = 0
    for i in range(n_clusters):
        chunk = size + (1 if i < remainder else 0)
        clusters.append(sorted_locs[start:start + chunk])
        start += chunk
    
    return clusters

def tsp_nearest_neighbor(locations: List[Location], priority_scores: Dict[int, float]) -> List[Location]:
    """
    TSP - En Yakın Komşu Algoritması.
    
    1. En yüksek öncelikli lokasyondan başla
    2. Her adımda: Öncelik (%60) + Yakınlık (%40) kombinasyonu ile sonraki noktayı seç
    """
    if len(locations) <= 1:
        return locations
    
    result = []
    remaining = list(locations)
    
    # En yüksek öncelikli ile başla
    remaining.sort(key=lambda x: priority_scores.get(x.locationId, 0), reverse=True)
    current = remaining.pop(0)
    result.append(current)
    
    while remaining:
        best_idx = 0
        best_score = -1
        
        for i, loc in enumerate(remaining):
            # Öncelik skoru (normalize)
            priority = priority_scores.get(loc.locationId, 50) / 100
            
            # Yakınlık skoru
            dist = haversine_distance(current.coordinates, loc.coordinates)
            proximity = 1 / (1 + dist)
            
            # Kombine skor
            combined = 0.60 * priority + 0.40 * proximity
            
            if combined > best_score:
                best_score = combined
                best_idx = i
        
        current = remaining.pop(best_idx)
        result.append(current)
    
    return result

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ASSIGNMENT FUNCTION
# ═══════════════════════════════════════════════════════════════════════════════

def generate_optimized_assignments(
    drivers: List[Driver], 
    locations: List[Location]
) -> Tuple[List[DriverAssignment], Dict]:
    """
    Ana atama fonksiyonu.
    
    İşlem sırası:
    1. Bayram kontrolü
    2. Gemini ile puanlama
    3. Coğrafi kümeleme
    4. TSP ile rota optimizasyonu
    5. CO2/Yakıt hesaplama
    """
    csv_data = load_csv_data()
    is_holiday_today = is_holiday()
    
    print(f"\n{'='*60}")
    print(f"🚛 ROTA OPTİMİZASYONU BAŞLADI")
    print(f"   Sürücü: {len(drivers)} | Lokasyon: {len(locations)}")
    print(f"   Bayram/Tatil: {'✅ EVET' if is_holiday_today else '❌ Hayır'}")
    print(f"{'='*60}")
    
    # === ADIM 1: Her lokasyon için öncelik skoru al ===
    print("\n📊 Öncelik skorları hesaplanıyor...")
    priority_scores: Dict[int, float] = {}
    for loc in locations:
        score = get_priority_score(loc, csv_data, is_holiday_today)
        priority_scores[loc.locationId] = score
    
    # === ADIM 2: Coğrafi kümeleme ===
    print(f"\n🗺️ Lokasyonlar {len(drivers)} kümeye ayrılıyor...")
    clusters = cluster_locations(locations, len(drivers))
    
    # Kümeleri toplam önceliğe göre sırala
    cluster_info = []
    for i, cluster in enumerate(clusters):
        total_priority = sum(priority_scores.get(loc.locationId, 50) for loc in cluster)
        cluster_info.append((cluster, total_priority, f"Bölge-{i+1}"))
    
    cluster_info.sort(key=lambda x: x[1], reverse=True)
    
    # Sürücüleri ID'ye göre sırala
    sorted_drivers = sorted(drivers, key=lambda x: x.driverId)
    
    # === ADIM 3: Her küme için TSP optimizasyonu ===
    print("\n🔄 TSP rota optimizasyonu yapılıyor...")
    assignments = []
    total_distance = 0
    total_co2 = 0
    
    for i, driver in enumerate(sorted_drivers):
        if i < len(cluster_info):
            cluster, _, region_name = cluster_info[i]
            
            # TSP ile sırala
            optimized = tsp_nearest_neighbor(cluster, priority_scores)
            
            # Rota istatistikleri
            route_dist, route_stats = calculate_route_stats(optimized)
            total_distance += route_dist
            total_co2 += route_stats.estimated_co2_kg
            
            print(f"  🚛 {driver.driverName}: {len(optimized)} lokasyon, "
                  f"{route_stats.total_distance_km:.1f} km, "
                  f"{route_stats.estimated_co2_kg:.1f} kg CO2")
        else:
            optimized = []
            route_stats = RouteStats()
            region_name = "Boş"
        
        # Atama oluştur
        places = [
            LocationAssignment(
                priority=idx + 1,
                locationId=loc.locationId,
                streetName=loc.locationName,  # locationName → streetName
                coordinates=loc.coordinates,
                estimatedOccupancy=round(get_dynamic_occupancy(loc.locationId, csv_data), 1)
            )
            for idx, loc in enumerate(optimized)
        ]
        
        assignments.append(DriverAssignment(
            driverId=driver.driverId,
            driverName=driver.driverName,  # driverUserName → driverName
            placesToCollect=places,
            routeStats=route_stats,
            clusterInfo=region_name
        ))
    
    # Metadata
    metadata = {
        "generated_at": datetime.now().isoformat(),
        "is_holiday": is_holiday_today,
        "total_distance_km": round(total_distance, 2),
        "total_co2_kg": round(total_co2, 2),
        "optimization_method": "Gemini AI + Clustering + TSP",
        "gemini_enabled": GEMINI_ENABLED
    }
    
    print(f"\n{'='*60}")
    print(f"✅ OPTİMİZASYON TAMAMLANDI")
    print(f"   Toplam Mesafe: {total_distance:.1f} km")
    print(f"   Toplam CO2: {total_co2:.1f} kg")
    print(f"{'='*60}\n")
    
    return assignments, metadata

# ═══════════════════════════════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/ai/generate-assignments", response_model=AssignmentResponse)
async def generate_assignments(request: AssignmentRequest):
    """
    ═══════════════════════════════════════════════════════════════════════════════
    AI DATA BACKEND - ANA ENDPOINT
    
    Görev: JSON al → AI ile karar ver → JSON dön
    
    Bu endpoint:
    ✅ Öncelik hesaplar (Gemini AI)
    ✅ Rota optimizasyonu yapar (Clustering + TSP)
    ✅ CO2/Yakıt hesaplar
    
    Bu endpoint YAPMAZ:
    ❌ Veritabanına yazmaz (Internal Backend'in işi)
    ❌ State kaydetmez (Internal Backend'in işi)
    ❌ Frontend ile ilgilenmez
    
    Sadece: JSON alır → JSON döner
    ═══════════════════════════════════════════════════════════════════════════════
    """
    if not request.drivers:
        raise HTTPException(status_code=400, detail="En az bir sürücü gerekli")
    
    if not request.locations:
        return AssignmentResponse(
            success=True,
            message="Lokasyon bulunamadı",
            assignments=[
                DriverAssignment(
                    driverId=d.driverId,
                    driverName=d.driverName,
                    placesToCollect=[]
                )
                for d in request.drivers
            ],
            metadata={"generated_at": datetime.now().isoformat()}
        )
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # AI İŞLEMİ: Karar verme ve optimizasyon
    # ═══════════════════════════════════════════════════════════════════════════════
    assignments, metadata = generate_optimized_assignments(
        request.drivers, 
        request.locations
    )
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ÇIKTI: Sadece JSON döndür (State'e kaydetme YOK - Internal Backend yapacak)
    # ═══════════════════════════════════════════════════════════════════════════════
    return AssignmentResponse(
        success=True,
        message=f"{len(assignments)} sürücü için rota oluşturuldu",
        assignments=assignments,
        metadata=metadata
    )

@app.get("/")
async def root():
    """
    ═══════════════════════════════════════════════════════════════════════════════
    AI DATA BACKEND - API Bilgisi
    
    Bu backend sadece karar verme ile ilgilenir.
    Veritabanı, frontend, state kaydetme işleri Internal Backend'de yapılır.
    ═══════════════════════════════════════════════════════════════════════════════
    """
    return {
        "name": "AI Data Backend - Nilüfer Smart Waste Manager",
        "version": "3.3.0",
        "role": "Sadece karar verme ve optimizasyon (JSON al → JSON dön)",
        "features": {
            "gemini_ai": GEMINI_ENABLED,
            "clustering": True,
            "tsp_optimization": True,
            "co2_tracking": True,
            "holiday_awareness": True
        },
        "endpoints": {
            "generate_assignments": "POST /ai/generate-assignments",
            "description": "Sürücüler ve lokasyonlar JSON'unu alır, optimize edilmiş rota JSON'u döner"
        },
        "note": "Diğer işlemler (DB kayıt, sürücü rotası getirme, vb.) Internal Backend'de yapılır"
    }

@app.get("/health")
async def health():
    """Sistem sağlık durumu"""
    csv_data = load_csv_data()
    
    return {
        "status": "healthy",
        "version": "3.3.0",
        "role": "AI Data Backend",
        "gemini_enabled": GEMINI_ENABLED,
        "csv_loaded": len(csv_data.get("master_data", {})) > 0,
        "is_holiday": is_holiday(),
        "ready": True
    }

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
