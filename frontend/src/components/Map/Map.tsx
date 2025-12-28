import { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

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
  { lat: 40.1950, lng: 29.0600, address: "Başlangıç Noktası" }, // Ulu Cami
  { lat: 40.2005, lng: 29.0650, address: "Ara Durak" }, // Atatürk Cd.
  { lat: 40.2058, lng: 29.0705, address: "Ara Durak" }, // Heykel
  { lat: 40.2102, lng: 29.0750, address: "Başaran, 1. Güneşli Sk. No:35, 16240 Osmangazi/Bursa, Türkiye" }, // Setbaşı
];

const Map = () => {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  // Get user's current location
  useEffect(() => {
    if (!isLoaded) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("Konum alındı:", location);
          setCurrentLocation(location);

          // Center map on user's location
          if (mapRef.current) {
            mapRef.current.setCenter(location);
            mapRef.current.setZoom(15);
          }
        },
        (error) => {
          console.warn("Geolocation hatası:", error.message);
          // Kullanıcıya izin vermedi veya konum alınamadı
          // Default center kullanılacak
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0, // Her zaman fresh location
        }
      );
    } else {
      console.warn("Geolocation API desteklenmiyor");
    }
  }, [isLoaded]);

  // Calculate route when map is loaded
  useEffect(() => {
    if (!isLoaded) return;

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: { lat: waypoints[0].lat, lng: waypoints[0].lng },
        destination: { lat: waypoints[waypoints.length - 1].lat, lng: waypoints[waypoints.length - 1].lng },
        waypoints: waypoints.slice(1, -1).map((point) => ({
          location: { lat: point.lat, lng: point.lng },
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
            scale: 12,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 4,
            anchor: new google.maps.Point(0, 0),
            labelOrigin: new google.maps.Point(0, -40),
          }}
          label={{
            text: "📍 Konumunuz",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "bold",
          }}
          animation={google.maps.Animation.DROP}
          zIndex={1000}
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
            suppressMarkers: true,
            suppressInfoWindows: true,
          }}
        />
      )}

      {/* Start Marker */}
      <Marker
        position={{ lat: waypoints[0].lat, lng: waypoints[0].lng }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        }}
        onClick={() => {
          setSelectedMarker({
            lat: waypoints[0].lat,
            lng: waypoints[0].lng,
            address: waypoints[0].address
          });
        }}
      />

      {/* End Marker */}
      <Marker
        position={{ lat: waypoints[waypoints.length - 1].lat, lng: waypoints[waypoints.length - 1].lng }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        }}
        onClick={() => {
          setSelectedMarker({
            lat: waypoints[waypoints.length - 1].lat,
            lng: waypoints[waypoints.length - 1].lng,
            address: waypoints[waypoints.length - 1].address
          });
        }}
      />

      {/* InfoWindow for selected marker */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div style={{
            padding: "12px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            minWidth: "220px",
            maxWidth: "280px"
          }}>
            {selectedMarker.address.includes("Başaran") ? (
              <>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: "10px",
                  lineHeight: "1.4"
                }}>
                  📍 Başaran
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: "1.6"
                }}>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Adres:</strong>
                  </div>
                  <div style={{ marginBottom: "6px", paddingLeft: "8px" }}>
                    1. Güneşli Sk. No:35
                  </div>
                  <div style={{ marginBottom: "4px", paddingLeft: "8px" }}>
                    16240 Osmangazi/Bursa
                  </div>
                  <div style={{ paddingLeft: "8px" }}>
                    Türkiye
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#111827"
              }}>
                {selectedMarker.address}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default Map;
