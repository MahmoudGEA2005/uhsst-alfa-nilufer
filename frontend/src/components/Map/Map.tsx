import { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

// Libraries array (must be constant to avoid reload warnings)
const libraries: ("places")[] = ["places"];

// Map container style
const containerStyle = {
  width: "100%",
  height: "100vh",
};

// Default center (Nilüfer, Bursa)
const center = {
  lat: 40.1950,
  lng: 29.0600,
};

// Waypoints for the route
const waypoints = [
  { lat: 40.1950, lng: 29.0600 }, // Ulu Cami
  { lat: 40.2005, lng: 29.0650 }, // Atatürk Cd.
  { lat: 40.2058, lng: 29.0705 }, // Heykel
  { lat: 40.2102, lng: 29.0750 }, // Setbaşı
];

const Map = () => {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  // Helper function to process location
  const processLocation = useCallback((position: GeolocationPosition) => {
    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    };

    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    console.log("📍 Konum Verileri:", {
      Koordinatlar: {
        Enlem: `${locationData.latitude}°`,
        Boylam: `${locationData.longitude}°`,
      },
      Doğruluk: `${locationData.accuracy ? locationData.accuracy.toFixed(2) : 'N/A'} metre`,
      Yükseklik: locationData.altitude ? `${locationData.altitude.toFixed(2)} metre` : 'N/A',
      Yön: locationData.heading ? `${locationData.heading.toFixed(2)}°` : 'N/A',
      Hız: locationData.speed ? `${(locationData.speed * 3.6).toFixed(2)} km/saat` : 'N/A',
      Zaman: new Date(locationData.timestamp).toLocaleString('tr-TR'),
      Ham_Veri: locationData,
    });

    setCurrentLocation(location);
    setLocationError(null);

    if (mapRef.current) {
      mapRef.current.setCenter(location);
      mapRef.current.setZoom(15);
    }
  }, []);

  // Get user's current location with better error handling
  const getLocation = useCallback(() => {
    if (!isLoaded || !("geolocation" in navigator)) {
      setLocationError("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }

    // First try: getCurrentPosition with cached location (fastest)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Konum başarıyla alındı");
        processLocation(position);
      },
      () => {
        // Second try: getCurrentPosition with relaxed options and longer timeout
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("✅ Konum (relaxed options) ile alındı");
            processLocation(position);
          },
          (error) => {
            let errorMessage = "";
            if (error.code === 1) {
              errorMessage = "Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum izni verin ve sayfayı yenileyin.";
            } else if (error.code === 2) {
              errorMessage = "Konum bilgisi alınamadı. GPS'inizin açık olduğundan ve internete bağlı olduğunuzdan emin olun.";
            } else if (error.code === 3) {
              errorMessage = "Konum isteği zaman aşımına uğradı. Konum servisiniz kapalı olabilir veya GPS sinyali zayıf olabilir.";
            } else {
              errorMessage = "Konum alınırken bir hata oluştu.";
            }
            
            console.error("❌ Geolocation Hatası:", {
              Kod: error.code,
              Mesaj: error.message,
              Açıklama: errorMessage
            });
            
            setLocationError(errorMessage);
            setCurrentLocation(null);
          },
          {
            enableHighAccuracy: false, // Lower accuracy = faster
            timeout: 30000, // 30 seconds
            maximumAge: 600000, // Accept cached location up to 10 minutes
          }
        );
      },
      {
        enableHighAccuracy: false, // Start with lower accuracy for speed
        timeout: 15000, // 15 seconds
        maximumAge: 600000, // Accept cached location up to 10 minutes (10 * 60 * 1000)
      }
    );
  }, [isLoaded, processLocation]);

  useEffect(() => {
    if (!isLoaded) return;
    getLocation();
  }, [isLoaded, getLocation]);

  // Calculate route when map is loaded
  useEffect(() => {
    if (!isLoaded) return;

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: waypoints[0],
        destination: waypoints[waypoints.length - 1],
        waypoints: waypoints.slice(1, -1).map((point) => ({
          location: point,
          stopover: true,
        })),
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
        } else {
          console.error(`Directions request failed: ${status}`);
        }
      }
    );
  }, [isLoaded]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "#f3f4f6"
      }}>
        <div style={{ textAlign: "center" }}>
          <p>Harita yükleniyor...</p>
          {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <p style={{ color: "red", marginTop: "10px" }}>
              ⚠️ Google Maps API key bulunamadı. Lütfen .env dosyasına VITE_GOOGLE_MAPS_API_KEY ekleyin.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Location Error Message */}
      {locationError && (
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#ef4444",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          zIndex: 10001,
          fontSize: "14px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          maxWidth: "90%",
          textAlign: "center",
        }}>
          <div style={{ marginBottom: "8px" }}>⚠️ {locationError}</div>
          <button
            onClick={() => {
              setLocationError(null);
              getLocation();
            }}
            style={{
              backgroundColor: "white",
              color: "#ef4444",
              border: "none",
              padding: "6px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
              marginTop: "8px",
            }}
          >
            Tekrar Dene
          </button>
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || center}
        zoom={currentLocation ? 15 : 13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
      {/* User's Current Location Marker */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
          animation={google.maps.Animation.DROP}
          zIndex={10000}
          title="📍 Konumunuz"
        />
      )}
      {/* Route */}
      {directionsResponse && (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            polylineOptions: {
              strokeColor: "#22c55e",
              strokeWeight: 6,
              strokeOpacity: 0.9,
            },
            suppressMarkers: false,
            markerOptions: {
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              },
            },
          }}
        />
      )}

      {/* Start Marker */}
      <Marker
        position={waypoints[0]}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        }}
      />

      {/* End Marker */}
      <Marker
        position={waypoints[waypoints.length - 1]}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        }}
      />
      </GoogleMap>
    </>
  );
};

export default Map;
