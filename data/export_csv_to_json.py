"""
Script to export all CSV data to JSON format using built-in csv module
"""
import csv
import json
import os
from datetime import datetime

def export_csv_to_json():
    """Export all CSV files to a single JSON file"""
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load Master_Optimization_Data.csv
    master_data_path = os.path.join(script_dir, "Master_Optimization_Data.csv")
    doluluk_data_path = os.path.join(script_dir, "07_konteyner_doluluk_tahmini.csv")
    
    print("Loading CSV files...")
    
    # Read Master data
    master_data = {}
    with open(master_data_path, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
        reader = csv.DictReader(f)
        for row in reader:
            # Handle BOM in column names
            location_id_str = row.get('LocationID') or row.get('\ufeffLocationID')
            if location_id_str:
                try:
                    location_id = int(float(location_id_str))
                    master_data[location_id] = row
                except (ValueError, TypeError):
                    continue
    
    # Read Doluluk data
    doluluk_data = {}
    with open(doluluk_data_path, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
        reader = csv.DictReader(f)
        for row in reader:
            # Handle BOM in column names
            location_id_str = row.get('LocationID') or row.get('\ufeffLocationID')
            if location_id_str:
                try:
                    location_id = int(float(location_id_str))
                    doluluk_data[location_id] = row
                except (ValueError, TypeError):
                    continue
    
    # Merge data and create locations list
    locations_list = []
    
    for location_id in sorted(master_data.keys()):
        master_row = master_data[location_id]
        doluluk_row = doluluk_data.get(location_id, {})
        
        # Parse coordinates
        try:
            lat = float(master_row.get('Latitude', 0))
            lon = float(master_row.get('Longitude', 0))
        except (ValueError, KeyError):
            lat, lon = 0.0, 0.0
        
        # Create location entry
        location_entry = {
            "locationId": location_id,
            "mahalleKey": master_row.get('Mahalle_Key', ''),
            "mahalleAdi": master_row.get('Mahalle_Adi', ''),
            "coordinates": [lat, lon],
            "latitude": lat,
            "longitude": lon,
            "population": int(float(master_row.get('Population', 0))),
            "containerCount": int(float(master_row.get('ContainerCount', 0))),
            "dailyWasteTon": float(master_row.get('DailyWaste_Ton', 0)),
            "currentOccupancy": float(master_row.get('CurrentOccupancy', 0)),
            "priorityScore": float(master_row.get('PriorityScore', 0)),
            "requiredVehicleType": master_row.get('RequiredVehicleType', ''),
            "weeklyFrequency": float(master_row.get('WeeklyFrequency', 0)),
            "idleRisk": float(master_row.get('IdleRisk', 0)),
            "dolulukRiski": float(doluluk_row.get('Doluluk_Riski', 0)),
            "dolmaHiziKgSaat": float(doluluk_row.get('Dolma_Hizi_kg_saat', 0)),
            "dolmaSuresiSaat": float(doluluk_row.get('Dolma_Suresi_Saat', 0)),
            "dolmaSuresiGun": float(doluluk_row.get('Dolma_Suresi_Gun', 0)),
            "onerilenHaftalikFrekans": float(doluluk_row.get('Onerilen_Haftalik_Frekans', 0))
        }
        
        locations_list.append(location_entry)
    
    # Create final JSON structure
    output_data = {
        "locations": locations_list,
        "totalLocations": len(locations_list),
        "metadata": {
            "source": "Master_Optimization_Data.csv + 07_konteyner_doluluk_tahmini.csv",
            "exportDate": datetime.now().isoformat()
        }
    }
    
    # Save to JSON file
    output_path = os.path.join(script_dir, "locations_data.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Successfully exported {len(locations_list)} locations to {output_path}")
    print(f"\nSample location (first 3):")
    for loc in locations_list[:3]:
        print(json.dumps(loc, ensure_ascii=False, indent=2))
        print("-" * 50)
    
    return output_path

if __name__ == "__main__":
    export_csv_to_json()
