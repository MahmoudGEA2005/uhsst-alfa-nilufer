"""
Priority hesaplama mantığını test eden script
"""
import sys
import os

# Mock the CSV data loading for testing
def test_priority_calculation():
    """Priority hesaplama mantığını test eder"""
    
    print("=" * 70)
    print("PRIORITY HESAPLAMA MANTIĞI TEST")
    print("=" * 70)
    print()
    
    # Örnek lokasyonlar
    locations = [
        {"locationId": 1, "locationName": "Location 1", "coordinates": [40.1950, 29.0600], "distance": 2.5, "people_count": 5000},
        {"locationId": 2, "locationName": "Location 2", "coordinates": [40.1975, 29.0618], "distance": 1.8, "people_count": 8000},
        {"locationId": 3, "locationName": "Location 3", "coordinates": [40.2131, 29.0374], "distance": 3.2, "people_count": 6000},
    ]
    
    # CSV'den gelen veriler (örnek)
    csv_data = {
        1: {"PriorityScore": 50.0, "Doluluk_Riski": 20.0, "DailyWaste_Ton": 10.0, "CurrentOccupancy": 50.0},
        2: {"PriorityScore": 80.0, "Doluluk_Riski": 90.0, "DailyWaste_Ton": 25.0, "CurrentOccupancy": 80.0},
        3: {"PriorityScore": 65.0, "Doluluk_Riski": 40.0, "DailyWaste_Ton": 15.0, "CurrentOccupancy": 30.0},
    }
    
    print("📊 LOKASYON VERİLERİ:")
    print("-" * 70)
    for loc in locations:
        loc_id = loc["locationId"]
        csv_info = csv_data.get(loc_id, {})
        print(f"Location ID {loc_id}:")
        print(f"  - Distance: {loc['distance']} km")
        print(f"  - People Count: {loc['people_count']}")
        if csv_info:
            print(f"  - PriorityScore (CSV): {csv_info.get('PriorityScore', 0)}")
            print(f"  - Doluluk_Riski: {csv_info.get('Doluluk_Riski', 0)}%")
            print(f"  - DailyWaste_Ton: {csv_info.get('DailyWaste_Ton', 0)}")
            print(f"  - CurrentOccupancy: {csv_info.get('CurrentOccupancy', 0)}%")
        print()
    
    print("=" * 70)
    print("PRIORITY SKORU HESAPLAMA (CSV Verisi VARSA):")
    print("=" * 70)
    print()
    
    # Priority score hesaplama
    location_scores = []
    for loc in locations:
        loc_id = loc["locationId"]
        csv_entry = csv_data.get(loc_id)
        
        if csv_entry:
            # CSV verisi varsa ağırlıklı hesaplama
            priority_score_csv = float(csv_entry.get('PriorityScore', 0))
            doluluk_riski = float(csv_entry.get('Doluluk_Riski', 0))
            daily_waste = float(csv_entry.get('DailyWaste_Ton', 0))
            current_occupancy = float(csv_entry.get('CurrentOccupancy', 0))
            
            # Normalize
            priority_score_norm = priority_score_csv / 100.0
            doluluk_norm = doluluk_riski / 100.0
            waste_norm = min(daily_waste / 35.0, 1.0)
            occupancy_norm = current_occupancy / 100.0
            distance_norm = 1.0 / (1.0 + loc['distance'] / 10.0)
            
            # Ağırlıklı kombinasyon
            final_score = (
                0.40 * priority_score_norm +      # 40% - PriorityScore
                0.25 * doluluk_norm +             # 25% - Doluluk_Riski
                0.20 * waste_norm +               # 20% - DailyWaste_Ton
                0.10 * distance_norm +            # 10% - Distance
                0.05 * occupancy_norm             # 5%  - CurrentOccupancy
            )
            
            print(f"Location {loc_id} - CSV ile:")
            print(f"  PriorityScore (40%): {priority_score_norm:.3f}")
            print(f"  Doluluk_Riski (25%): {doluluk_norm:.3f}")
            print(f"  DailyWaste_Ton (20%): {waste_norm:.3f}")
            print(f"  Distance (10%): {distance_norm:.3f}")
            print(f"  CurrentOccupancy (5%): {occupancy_norm:.3f}")
            print(f"  → FINAL SCORE: {final_score:.4f}")
        else:
            # CSV verisi yoksa fallback
            distance_score = 1.0 / (1.0 + loc['distance'])
            people_score = min(loc['people_count'] / 35000.0, 1.0)
            final_score = 0.7 * people_score + 0.3 * distance_score
            
            print(f"Location {loc_id} - Fallback (CSV yok):")
            print(f"  People Count (70%): {people_score:.3f}")
            print(f"  Distance (30%): {distance_score:.3f}")
            print(f"  → FINAL SCORE: {final_score:.4f}")
        
        location_scores.append((loc, final_score))
        print()
    
    # Skorlara göre sırala (yüksekten düşüğe)
    location_scores.sort(key=lambda x: x[1], reverse=True)
    
    print("=" * 70)
    print("SIRALAMA (Yüksek Skor = Yüksek Öncelik):")
    print("=" * 70)
    for idx, (loc, score) in enumerate(location_scores, 1):
        print(f"{idx}. Location {loc['locationId']} - Score: {score:.4f}")
    print()
    
    # Sürücülere dağıtım (round-robin)
    drivers = [
        {"driverId": 1, "driverUserName": "mehmet.yilmaz"},
        {"driverId": 2, "driverUserName": "ahmet.kaya"}
    ]
    
    print("=" * 70)
    print("SÜRÜCÜLERE DAĞITIM (Round-Robin):")
    print("=" * 70)
    
    driver_assignments = {driver["driverId"]: [] for driver in drivers}
    
    for idx, (loc, _) in enumerate(location_scores):
        driver_index = idx % len(drivers)
        driver_id = drivers[driver_index]["driverId"]
        driver_assignments[driver_id].append(loc)
        print(f"Location {loc['locationId']} → Driver {driver_id} ({drivers[driver_index]['driverUserName']})")
    print()
    
    # Final priority assignment (sürücü bazlı)
    print("=" * 70)
    print("FINAL ASSIGNMENT (Sürücü Bazlı Priority):")
    print("=" * 70)
    print()
    
    final_result = []
    for driver in drivers:
        driver_id = driver["driverId"]
        locations = driver_assignments[driver_id]
        
        places_to_collect = []
        for idx, loc in enumerate(locations, 1):
            places_to_collect.append({
                "priority": idx,  # Her sürücü için 1, 2, 3... başlar
                "locationId": loc["locationId"],
                "locationName": loc["locationName"],
                "coordinates": loc["coordinates"]
            })
        
        driver_assignment = {
            "driverId": driver_id,
            "driverUserName": driver["driverUserName"],
            "placesToCollect": places_to_collect
        }
        
        final_result.append(driver_assignment)
        
        print(f"Driver {driver_id} ({driver['driverUserName']}):")
        for place in places_to_collect:
            print(f"  Priority {place['priority']}: Location {place['locationId']} - {place['locationName']}")
        print()
    
    # JSON formatında göster
    print("=" * 70)
    print("JSON OUTPUT:")
    print("=" * 70)
    import json
    print(json.dumps(final_result, indent=2, ensure_ascii=False))
    print()
    
    return final_result

if __name__ == "__main__":
    test_priority_calculation()


