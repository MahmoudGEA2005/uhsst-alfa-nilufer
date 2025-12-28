<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\Driver;
use App\Models\Location;
use App\Models\RouteGenerationLog;
use App\Models\AIRoute;
use Carbon\Carbon;

class RouteController extends Controller
{
    // Nilüfer Belediyesi koordinatları (Depot)
    const DEPOT_LAT = 40.1826;
    const DEPOT_LNG = 29.0665;
    
    // Kapasiteler (kg)
    const CRANE_CAPACITY = 12000;
    const STANDARD_CAPACITY = 8000;
    const CAPACITY_LIMIT = 0.95; // %95 kapasite limiti (Python kodundaki gibi)

    /**
     * Haversine mesafe hesaplama (km) - Python kodundaki mantık
     */
    private function haversine($lat1, $lng1, $lat2, $lng2)
    {
        if (!$lat1 || !$lng1 || !$lat2 || !$lng2) {
            return 0;
        }
        
        try {
            $earthRadius = 6371; // km
            $dLat = deg2rad($lat2 - $lat1);
            $dLng = deg2rad($lng2 - $lng1);
            $a = sin($dLat / 2) * sin($dLat / 2) +
                 cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
                 sin($dLng / 2) * sin($dLng / 2);
            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
            return $earthRadius * $c;
        } catch (\Exception $e) {
            \Log::error("Haversine hesaplama hatası: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Bugünkü gün için toplanacak lokasyonları filtrele (Programlama mantığı)
     * - Haftada 7 kez: Her gün (frekans 7)
     * - Haftada 6 kez: Pazartesi-Cumartesi (frekans 6, gün 1-6)
     * - Haftada 3 kez: Pazartesi, Çarşamba, Cuma (frekans 3, gün 1,3,5)
     */
    private function filterLocationsForToday($allLocations, $todayDayOfWeek)
    {
        // 0=Pazar, 1=Pazartesi, 2=Salı, 3=Çarşamba, 4=Perşembe, 5=Cuma, 6=Cumartesi
        $filtered = [];
        
        foreach ($allLocations as $location) {
            $weeklyFrequency = isset($location['weekly_frequency']) ? (float)$location['weekly_frequency'] : 0;
            
            // Haftada 7 kez: Her gün
            if ($weeklyFrequency >= 7) {
                $filtered[] = $location;
                continue;
            }
            
            // Haftada 6 kez: Pazartesi-Cumartesi (1-6)
            if ($weeklyFrequency >= 6) {
                if ($todayDayOfWeek >= 1 && $todayDayOfWeek <= 6) {
                    $filtered[] = $location;
                }
                continue;
            }
            
            // Haftada 3 kez: Pazartesi(1), Çarşamba(3), Cuma(5)
            if ($weeklyFrequency >= 3) {
                if ($todayDayOfWeek === 1 || $todayDayOfWeek === 3 || $todayDayOfWeek === 5) {
                    $filtered[] = $location;
                }
                continue;
            }
        }
        
        return $filtered;
    }

    /**
     * CSV dosyasını parse et
     */
    private function parseCSV($filePath)
    {
        if (!file_exists($filePath)) {
            return [];
        }
        
        $rows = [];
        $handle = fopen($filePath, 'r');
        
        if ($handle === false) {
            return [];
        }
        
        // Read BOM if exists
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }
        
        // Read header
        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);
            return [];
        }
        
        // Clean headers (remove BOM)
        $headers = array_map(function($header) {
            return trim(str_replace("\xEF\xBB\xBF", '', $header));
        }, $headers);
        
        // Read rows
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) !== count($headers)) {
                continue;
            }
            $rows[] = array_combine($headers, $row);
        }
        
        fclose($handle);
        return $rows;
    }

    /**
     * Master CSV'den lokasyon verilerini yükle (Python kodundaki mantık)
     */
    private function loadLocationsFromCSV()
    {
        $basePath = base_path('../data');
        $csvPath = $basePath . '/Master_Optimization_Data.csv';
        
        if (!file_exists($csvPath)) {
            \Log::error("Master CSV bulunamadı: " . $csvPath);
            return [];
        }
        
        $rows = $this->parseCSV($csvPath);
        $locations = [];
        
        foreach ($rows as $row) {
            // Koordinat parse et
            $lat = null;
            $lng = null;
            
            if (!empty($row['Latitude']) && !empty($row['Longitude'])) {
                $lat = (float)$row['Latitude'];
                $lng = (float)$row['Longitude'];
            } elseif (!empty($row['Coordinates'])) {
                // Coordinates string formatında: "[40.12, 29.34]"
                try {
                    $coords = json_decode($row['Coordinates'], true);
                    if (is_array($coords) && count($coords) >= 2) {
                        $lat = (float)$coords[0];
                        $lng = (float)$coords[1];
                    }
                } catch (\Exception $e) {
                    // Ignore
                }
            }
            
            // Bursa koordinat kontrolü (39.5 <= lat <= 40.5 and 28.5 <= lng <= 29.5)
            if (!$lat || !$lng || $lat < 39.5 || $lat > 40.5 || $lng < 28.5 || $lng > 29.5) {
                continue;
            }
            
            // Çöp miktarını hesapla (Python kodundaki mantık)
            $wasteKg = 0;
            if (!empty($row['DailyWaste_Ton'])) {
                $wasteKg = (int)((float)$row['DailyWaste_Ton'] * 1000);
            } elseif (!empty($row['ContainerCount'])) {
                $wasteKg = (int)((float)$row['ContainerCount'] * 180);
            } else {
                // Rastgele 200-800 kg (Python kodundaki fallback)
                $wasteKg = rand(200, 800);
            }
            
            // Gerekli araç tipini belirle (Python kodundaki mantık)
            $requiredVehicle = 'STANDARD';
            if (!empty($row['RequiredVehicleType'])) {
                $vtype = strtoupper($row['RequiredVehicleType']);
                if (strpos($vtype, 'CRANE') !== false || strpos($vtype, 'VINC') !== false) {
                    $requiredVehicle = 'VINCLI';
                }
            } else {
                // %15 vinçli, %85 standart (Python kodundaki rastgele dağılım)
                $rand = rand(1, 100);
                $requiredVehicle = $rand <= 15 ? 'VINCLI' : 'STANDARD';
            }
            
            // Mahalle adı
            $mahalleAdi = !empty($row['Mahalle_Adi']) ? $row['Mahalle_Adi'] : 
                         (!empty($row['Mahalle_Key']) ? $row['Mahalle_Key'] : 
                         (!empty($row['LocationID']) ? 'Lokasyon-' . $row['LocationID'] : 'Bilinmeyen'));
            
            // Haftalık frekans (Programlama için gerekli)
            $weeklyFrequency = !empty($row['WeeklyFrequency']) ? (float)$row['WeeklyFrequency'] : 0;
            
            $locations[] = [
                'id' => !empty($row['LocationID']) ? (int)$row['LocationID'] : count($locations) + 1,
                'name' => $mahalleAdi,
                'latitude' => $lat,
                'longitude' => $lng,
                'waste_kg' => $wasteKg,
                'required_vehicle' => $requiredVehicle,
                'weekly_frequency' => $weeklyFrequency, // Programlama için eklendi
            ];
        }
        
        return $locations;
    }

    /**
     * Rota oluşturma ana fonksiyonu (Python kodundaki mantık)
     */
    public function sendToApi(Request $request)
    {
        DB::beginTransaction();
        try {
            $today = Carbon::today()->toDateString();
            $generatedAt = now();

            // Tüm sürücüleri al
            $drivers = Driver::all();
            if ($drivers->isEmpty()) {
                return response()->json([
                    'message' => 'Sürücü bulunamadı',
                    'error' => 'No drivers found'
                ], 400);
            }

            // CSV'den lokasyonları yükle (Python kodundaki mantık)
            $allLocations = $this->loadLocationsFromCSV();
            if (empty($allLocations)) {
                return response()->json([
                    'message' => 'Konum bulunamadı (CSV dosyasından)',
                    'error' => 'No locations found from CSV'
                ], 400);
            }

            // Bugünkü gün için toplanacak lokasyonları filtrele (Programlama mantığı)
            $todayDayOfWeek = Carbon::now()->dayOfWeek; // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
            $locations = $this->filterLocationsForToday($allLocations, $todayDayOfWeek);
            
            if (empty($locations)) {
                return response()->json([
                    'message' => 'Bugün toplanacak konum bulunamadı',
                    'error' => 'No locations scheduled for today'
                ], 400);
            }
            
            \Log::info("Bugünkü gün: " . $todayDayOfWeek . " (0=Pazar, 1=Pazartesi, ..., 6=Cumartesi)");
            \Log::info("Toplam lokasyon: " . count($allLocations) . " -> Bugün toplanacak: " . count($locations));

            // Bugün için daha önce rota oluşturulmuş mu kontrol et
            $existingRoutes = AIRoute::whereDate('created_at', $today)->exists();
            if ($existingRoutes) {
                // Mevcut rotaları sil (yeniden oluşturulacak)
                AIRoute::whereDate('created_at', $today)->delete();
            }

            // Önce bugünkü işleri say
            $craneJobsCount = count(array_filter($locations, fn($loc) => $loc['required_vehicle'] === 'VINCLI'));
            $standardJobsCount = count(array_filter($locations, fn($loc) => $loc['required_vehicle'] === 'STANDARD'));
            
            // Sürücüleri filo olarak hazırla (Python kodunda maksimum 15 araç)
            // Araç tiplerini bugünkü iş yüküne göre dağıt
            $fleet = [];
            $maxVehicles = min(15, $drivers->count()); // Maksimum 15 araç veya mevcut sürücü sayısı
            
            // İdeal filo dağılımını hesapla (minimum 0 vinçli, maksimum 3 vinçli)
            // Eğer vinçli iş yoksa, hiç vinçli araç kullanma
            $idealCraneCount = 0;
            if ($craneJobsCount > 0) {
                // Vinçli iş varsa, en fazla 3 vinçli araç (Python kodundaki mantık)
                $idealCraneCount = min(3, max(1, (int)ceil($craneJobsCount / 10)));
            }
            $idealStandardCount = $maxVehicles - $idealCraneCount;
            
            $driversArray = $drivers->take($maxVehicles); // Maksimum 15 araç
            $craneCount = 0;
            $standardCount = 0;
            
            foreach ($driversArray as $index => $driver) {
                // İdeal dağılıma göre araç tipini belirle
                if ($craneCount < $idealCraneCount) {
                    $vehicleType = 'Crane';
                    $craneCount++;
                } else {
                    $vehicleType = 'Standard';
                    $standardCount++;
                }
                
                $fleet[] = [
                    'id' => $driver->id,
                    'type' => $vehicleType,
                    'name' => $driver->first_name . ' ' . $driver->last_name,
                    'vehicle_number' => $driver->vehicle_number,
                ];
            }
            
            \Log::info("Filo hazırlandı: Toplam " . count($fleet) . " araç -> {$craneCount} vinçli, {$standardCount} standart");
            \Log::info("İş havuzu: {$craneJobsCount} vinçli iş, {$standardJobsCount} standart iş");
            
            if ($drivers->count() > $maxVehicles) {
                \Log::info("Toplam {$drivers->count()} sürücü var, ancak maksimum {$maxVehicles} araç kullanılıyor (Python kodundaki MAX_ARAC_SAYISI limiti)");
            }

            // Lokasyonları Python kodundaki formata çevir
            $jobs = [];
            foreach ($locations as $location) {
                $jobs[] = [
                    'id' => $location['id'],
                    'name' => $location['name'],
                    'latitude' => $location['latitude'],
                    'longitude' => $location['longitude'],
                    'waste_kg' => $location['waste_kg'],
                    'required_vehicle' => $location['required_vehicle'],
                    'assigned' => false,
                ];
            }

            // İşleri vinçli ve standart olarak ayır (Python kodundaki mantık)
            $craneJobs = array_filter($jobs, fn($job) => $job['required_vehicle'] === 'VINCLI');
            $standardJobs = array_filter($jobs, fn($job) => $job['required_vehicle'] === 'STANDARD');
            
            // Array indexlerini düzelt
            $craneJobs = array_values($craneJobs);
            $standardJobs = array_values($standardJobs);
            
            \Log::info("İş havuzu: " . count($craneJobs) . " vinçli, " . count($standardJobs) . " standart");

            \Log::info("İş havuzu: " . count($craneJobs) . " vinçli, " . count($standardJobs) . " standart");

            // Her sürücü için rota başlat
            $routes = [];
            foreach ($fleet as $vehicle) {
                $capacity = $vehicle['type'] === 'Crane' ? self::CRANE_CAPACITY : self::STANDARD_CAPACITY;
                $routes[$vehicle['id']] = [
                    'driver_id' => $vehicle['id'],
                    'vehicle' => $vehicle,
                    'stops' => [],
                    'total_waste' => 0,
                    'current_location' => [self::DEPOT_LAT, self::DEPOT_LNG],
                    'total_distance' => 0,
                    'capacity' => $capacity,
                ];
            }

            // Round-robin döngüsü (Python kodundaki mantık)
            $turn = 0;
            $maxTurns = 1000; // Yeterince büyük limit
            
            while ($turn < $maxTurns) {
                $turn++;
                $assignmentsThisTurn = 0;
                $activeVehicles = 0;

                foreach ($fleet as $vehicle) {
                    $route = &$routes[$vehicle['id']];
                    $limit = $route['capacity'];
                    
                    // Kapasite kontrolü (%95 limit - Python kodundaki gibi)
                    if ($route['total_waste'] >= $limit * self::CAPACITY_LIMIT) {
                        continue;
                    }

                    // Hangi iş havuzundan alacak?
                    if ($vehicle['type'] === 'Crane') {
                        $jobPool = &$craneJobs;
                    } else {
                        $jobPool = &$standardJobs;
                    }
                    $poolSize = count($jobPool);
                    
                    // Henüz atanmamış işleri bul ve mesafe hesapla
                    $candidates = [];
                    for ($i = 0; $i < $poolSize; $i++) {
                        if ($jobPool[$i]['assigned']) {
                            continue;
                        }
                        
                        $job = $jobPool[$i];
                        $distance = $this->haversine(
                            $route['current_location'][0],
                            $route['current_location'][1],
                            $job['latitude'],
                            $job['longitude']
                        );
                        
                        // Kapasiteye sığacak mı?
                        if ($route['total_waste'] + $job['waste_kg'] <= $limit * self::CAPACITY_LIMIT) {
                            $candidates[] = [
                                'index' => $i,
                                'job' => $job,
                                'distance' => $distance,
                            ];
                        }
                    }

                    if (empty($candidates)) {
                        continue; // Bu tipte iş kalmadı veya hiçbiri kapasiteye sığmıyor
                    }

                    // En yakın olanı seç
                    usort($candidates, fn($a, $b) => $a['distance'] <=> $b['distance']);
                    $selectedIndex = $candidates[0]['index'];
                    $selected = &$jobPool[$selectedIndex];

                    // İşaretle ve rotaya ekle
                    $selected['assigned'] = true;
                    $route['total_waste'] += $selected['waste_kg'];
                    $route['total_distance'] += $candidates[0]['distance'];
                    $route['current_location'] = [$selected['latitude'], $selected['longitude']];
                    
                    $route['stops'][] = [
                        'Sira' => count($route['stops']) + 1,
                        'Mahalle' => $selected['name'],
                        'Koordinat' => [
                            'Lat' => $selected['latitude'],
                            'Lng' => $selected['longitude'],
                        ],
                        'Cop_kg' => (int)$selected['waste_kg'],
                        'Mesafe_km' => round($candidates[0]['distance'], 2),
                    ];

                    $assignmentsThisTurn++;
                    $activeVehicles++;
                }

                // Bu turda hiç atama olmadıysa dur
                if ($assignmentsThisTurn === 0) {
                    \Log::info("Tüm işler dağıtıldı (Tur {$turn})");
                    break;
                }
                
                // Her 20 turda bir ilerleme logla
                if ($turn % 20 == 0) {
                    $kalanVincli = count(array_filter($craneJobs, fn($j) => !$j['assigned']));
                    $kalanStandart = count(array_filter($standardJobs, fn($j) => !$j['assigned']));
                    \Log::info("TUR {$turn}: {$assignmentsThisTurn} atama → Kalan: {$kalanVincli} vinçli, {$kalanStandart} standart");
                }
            }

            // Veritabanına kaydet ve istatistikleri topla
            $createdRoutes = [];
            $totalWaste = 0;
            
            foreach ($routes as $route) {
                if (empty($route['stops'])) {
                    continue; // Boş rotaları kaydetme
                }

                // Depoya dönüş mesafesi
                $returnDistance = $this->haversine(
                    $route['current_location'][0],
                    $route['current_location'][1],
                    self::DEPOT_LAT,
                    self::DEPOT_LNG
                );
                $totalRouteDistance = $route['total_distance'] + $returnDistance;

                // Waypoints oluştur
                $waypoints = [];
                foreach ($route['stops'] as $stop) {
                    $waypoints[] = [
                        'lat' => $stop['Koordinat']['Lat'],
                        'lng' => $stop['Koordinat']['Lng'],
                    ];
                }

                // AIRoute kaydet
                $airoute = AIRoute::create([
                    'driver_id' => $route['driver_id'],
                    'route_data' => [
                        'Arac' => $route['vehicle']['name'],
                        'Tip' => $route['vehicle']['type'],
                        'Ozet' => [
                            'Cop_kg' => (int)$route['total_waste'],
                            'Durak_Sayisi' => count($route['stops']),
                            'Mesafe_km' => round($totalRouteDistance, 1),
                            'Kapasite_Kullanim' => '%' . (int)($route['total_waste'] / $route['capacity'] * 100),
                        ],
                        'Rota' => $route['stops'],
                    ],
                    'waypoints' => $waypoints,
                    'status' => 'pending',
                    'scheduled_at' => $today . ' 08:00:00',
                ]);

                $createdRoutes[] = [
                    'id' => $airoute->id,
                    'driver_id' => $airoute->driver_id,
                    'route_data' => $airoute->route_data,
                ];
                $totalWaste += $route['total_waste'];
            }

            // Log kaydet
            $log = RouteGenerationLog::create([
                'generation_date' => $today,
                'generated_at' => $generatedAt,
                'admin_id' => null, // TODO: Auth'dan al
                'drivers_count' => count($fleet),
                'locations_count' => count($locations),
                'status' => 'success',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Rotalar başarıyla oluşturuldu',
                'data' => [
                    'total_routes' => count($createdRoutes),
                    'total_waste_kg' => (int)$totalWaste,
                    'drivers_count' => count($fleet),
                    'locations_count' => count($locations),
                    'routes' => $createdRoutes,
                ],
                'log' => $log,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error("Rota oluşturma hatası: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            // Hata logu
            try {
                RouteGenerationLog::create([
                    'generation_date' => Carbon::today()->toDateString(),
                    'generated_at' => now(),
                    'admin_id' => null,
                    'drivers_count' => 0,
                    'locations_count' => 0,
                    'status' => 'failed',
                ]);
            } catch (\Exception $logError) {
                // Log hatası görmezden gel
            }

            return response()->json([
                'message' => 'Rota oluşturulurken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tüm sürücü rotalarını getir
     */
    public function getAllDriverRoutes()
    {
        $routes = AIRoute::with('driver')->get();
        return response()->json([
            'data' => $routes
        ]);
    }

    /**
     * Belirli bir sürücünün rotalarını getir
     */
    public function getDriverRoutes($driverId)
    {
        $routes = AIRoute::where('driver_id', $driverId)
            ->with('driver')
            ->get();
            
        return response()->json([
            'data' => $routes
        ]);
    }
}
