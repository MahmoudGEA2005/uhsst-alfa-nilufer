#!/bin/bash

# API Test Script
# Usage: ./test_api.sh

BASE_URL="http://localhost:8000"

echo "================================================"
echo "   AI/Data Backend - API Test Script"
echo "================================================"
echo ""

# Test 1: Root endpoint
echo "🏠 Test 1: Root Endpoint"
echo "curl -s $BASE_URL/"
curl -s $BASE_URL/ | python3 -m json.tool
echo ""

# Test 2: Health check
echo "❤️ Test 2: Health Check"
echo "curl -s $BASE_URL/health"
curl -s $BASE_URL/health | python3 -m json.tool
echo ""

# Test 3: Generate Assignments
echo "🚛 Test 3: Generate Assignments (POST /ai/generate-assignments)"
echo "Sending drivers and locations..."
curl -s -X POST $BASE_URL/ai/generate-assignments \
  -H "Content-Type: application/json" \
  -d '{
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
        "locationName": "Atatürk Caddesi – Osmangazi Ulu Cami",
        "coordinates": [40.1950, 29.0600],
        "distance": 2.5,
        "people_count": 18806
      },
      {
        "locationId": 2,
        "locationName": "Santral Garaj Caddesi – Kent Meydanı AVM",
        "coordinates": [40.1975, 29.0618],
        "distance": 1.8,
        "people_count": 32489
      },
      {
        "locationId": 3,
        "locationName": "Fatih Sultan Mehmet Bulvarı",
        "coordinates": [40.2131, 29.0374],
        "distance": 3.2,
        "people_count": 28594
      },
      {
        "locationId": 4,
        "locationName": "İhsaniye Mahallesi",
        "coordinates": [40.2178, 28.9858],
        "distance": 4.1,
        "people_count": 28846
      }
    ]
  }' | python3 -m json.tool
echo ""

# Test 4: Get Driver 1 Assignment
echo "👤 Test 4: Get Driver 1 Assignment (GET /ai/driver/1)"
curl -s $BASE_URL/ai/driver/1 | python3 -m json.tool
echo ""

# Test 5: Get All Assignments
echo "📋 Test 5: Get All Assignments (GET /ai/assignments)"
curl -s $BASE_URL/ai/assignments | python3 -m json.tool
echo ""

# Test 6: Mark Location as Collected
echo "✅ Test 6: Mark Location 1 as Collected (POST /ai/mark-collected)"
curl -s -X POST $BASE_URL/ai/mark-collected \
  -H "Content-Type: application/json" \
  -d '{"driverId": 1, "locationId": 1}' | python3 -m json.tool
echo ""

# Test 7: Get Location Status
echo "📍 Test 7: Get Location 1 Status (GET /ai/location/1/status)"
curl -s $BASE_URL/ai/location/1/status | python3 -m json.tool
echo ""

# Test 8: Get All Locations Status
echo "📊 Test 8: Get All Tracked Locations (GET /ai/locations/status)"
curl -s $BASE_URL/ai/locations/status | python3 -m json.tool
echo ""

echo "================================================"
echo "   All tests completed!"
echo "================================================"


