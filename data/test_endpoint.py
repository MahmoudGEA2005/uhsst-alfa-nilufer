"""
Test script for the AI/Data Backend route assignment endpoints.
Run this after starting the API server.

Usage flow:
1. POST /ai/generate-assignments - Generate daily assignments
2. GET /ai/driver/{driverId} - Get specific driver assignment
3. GET /ai/assignments - Get all assignments
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

# Test data
test_data = {
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
        },
        {
            "locationId": 3,
            "locationName": "Fatih Sultan Mehmet Bulvarı – Residential Block A",
            "coordinates": [40.2131, 29.0374],
            "distance": 3.2,
            "people_count": 6000
        }
    ]
}

def test_generate_assignments():
    """Test POST /ai/generate-assignments"""
    print("=" * 70)
    print("1. Testing POST /ai/generate-assignments")
    print("=" * 70)
    
    url = f"{BASE_URL}/ai/generate-assignments"
    
    try:
        response = requests.post(url, json=test_data)
        response.raise_for_status()
        
        result = response.json()
        print("✅ Success! All assignments generated:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API. Make sure the server is running.")
        return False
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        print(f"Response: {response.text}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_driver_assignment(driver_id):
    """Test GET /ai/driver/{driverId}"""
    print("\n" + "=" * 70)
    print(f"2. Testing GET /ai/driver/{driver_id}")
    print("=" * 70)
    
    url = f"{BASE_URL}/ai/driver/{driver_id}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Success! Driver {driver_id} assignment:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return True
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        if response.status_code == 404:
            print("   Note: Make sure to generate assignments first using POST /ai/generate-assignments")
        else:
            print(f"Response: {response.text}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_all_assignments():
    """Test GET /ai/assignments"""
    print("\n" + "=" * 70)
    print("3. Testing GET /ai/assignments")
    print("=" * 70)
    
    url = f"{BASE_URL}/ai/assignments"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        result = response.json()
        print("✅ Success! All assignments:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return True
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        if response.status_code == 404:
            print("   Note: Make sure to generate assignments first using POST /ai/generate-assignments")
        else:
            print(f"Response: {response.text}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting AI/Data Backend Tests\n")
    
    # Step 1: Generate assignments
    if test_generate_assignments():
        # Step 2: Get specific driver assignment
        test_get_driver_assignment(1)
        test_get_driver_assignment(2)
        
        # Step 3: Get all assignments
        test_get_all_assignments()
    
    print("\n" + "=" * 70)
    print("✅ Tests completed!")
    print("=" * 70)

