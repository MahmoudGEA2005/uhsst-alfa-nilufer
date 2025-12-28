import { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { Plus, Minus, Maximize2, Navigation, Layers } from "lucide-react";

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

interface Route {
  id: number;
  driver_id: number;
  route_data: {
    Arac: string;
    Tip: string;
    Ozet: {
      Cop_kg: number;
      Durak_Sayisi: number;
      Mesafe_km: number;
      Kapasite_Kullanim: string;
    };
    Rota: Array<{
      Sira: number;
      Mahalle: string;
      Koordinat: {
        Lat: number;
        Lng: number;
      };
      Cop_kg: number;
      Mesafe_km: number;
    }>;
  };
  waypoints: Array<{
    lat: number;
    lng: number;
  }>;
}

interface MapProps {
  route?: Route | null;
}

const Map: React.FC<MapProps> = ({ route }) => {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const isFirstLocationRef = useRef(true);
  const isTrackingLocationRef = useRef(false);

  // Waypoints'i route'dan al veya varsayılan kullan
  const waypoints = route?.route_data?.Rota 
    ? route.route_data.Rota.map((stop) => ({
        lat: stop.Koordinat.Lat,
        lng: stop.Koordinat.Lng,
      }))
    : [
        { lat: 40.1950, lng: 29.0600 }, // Ulu Cami
        { lat: 40.2005, lng: 29.0650 }, // Atatürk Cd.
        { lat: 40.2058, lng: 29.0705 }, // Heykel
        { lat: 40.2102, lng: 29.0750 }, // Setbaşı
      ];

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  // Helper function to process location - optimized to avoid re-renders
  const processLocation = useCallback((position: GeolocationPosition) => {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    console.log("✅ Konum alındı:", location);
    setCurrentLocation(location);
    setLocationError(null);

    if (!mapRef.current) return;

    // If tracking is active, smoothly follow user location
    if (isTrackingLocationRef.current) {
      // Use native panTo for smooth, performant animation (no re-render)
      mapRef.current.panTo(location);
      // Maintain optimal zoom level for text readability (17-18)
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom === undefined || currentZoom < 17) {
        mapRef.current.setZoom(17);
      }
    } else if (isFirstLocationRef.current) {
      // First time getting location, center once without animation
      mapRef.current.setCenter(location);
      mapRef.current.setZoom(15);
      isFirstLocationRef.current = false;
    }
    // If tracking is off and not first location, just update state (no map movement)
  }, []);

  // Get user's current location - simple and reliable
  useEffect(() => {
    if (!isLoaded) return;
    if (!("geolocation" in navigator)) {
      setLocationError("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }

    console.log("🔄 Konum servisi başlatılıyor...");

    // Clear any existing watch first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Use watchPosition directly - it's simpler and more reliable
    // enableHighAccuracy: false = network-based (WiFi/IP), faster and more reliable on Mac
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log("✅ Konum alındı:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: `${position.coords.accuracy?.toFixed(0)}m`,
        });
        processLocation(position);
        setLocationError(null); // Clear any errors on success
      },
      (error) => {
        console.error("❌ Konum hatası:", {
          code: error.code,
          message: error.message,
        });

        if (error.code === 1) {
          // Permission denied
          setLocationError("Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum izni verin ve sayfayı yenileyin.");
        } else if (error.code === 2) {
          // Position unavailable - show helpful message after a delay
          setTimeout(() => {
            // Only show error if we still don't have location (watchPosition might have succeeded by then)
            setLocationError(
              "Konum servisi çalışmıyor. Lütfen:\n" +
              "1. Mac: Sistem Ayarları → Gizlilik ve Güvenlik → Konum Servisleri → AÇIK olmalı\n" +
              "2. Tarayıcınız için (Safari/Chrome) konum izni AÇIK olmalı\n" +
              "3. WiFi'nin açık olduğundan emin olun\n" +
              "4. Sayfayı yenileyin"
            );
          }, 3000); // Wait 3 seconds before showing error (might resolve itself)
          console.log("⏳ Konum servisi geçici olarak kullanılamıyor, tekrar deneniyor...");
        } else if (error.code === 3) {
          // Timeout - don't show error immediately, keep trying
          console.log("⏳ Konum alımı zaman aşımı, tekrar deneniyor...");
        }
      },
      {
        enableHighAccuracy: false, // Network-based (WiFi/IP) - faster and more reliable on Mac
        timeout: 15000, // 15 second timeout
        maximumAge: 300000, // Accept cached location up to 5 minutes (speeds up initial location)
      }
    );

    watchIdRef.current = watchId;
    console.log("✅ watchPosition başlatıldı (sürekli çalışacak)");

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log("🧹 Konum takibi durduruldu");
      }
    };
  }, [isLoaded, processLocation]);

  // Keep tracking ref in sync with state
  useEffect(() => {
    isTrackingLocationRef.current = isTrackingLocation;
  }, [isTrackingLocation]);

  // Calculate route when map is loaded and when current location or route changes
  useEffect(() => {
    if (!isLoaded || waypoints.length === 0) return;

    const directionsService = new google.maps.DirectionsService();
    
    // If we have user's current location, route from current location to first waypoint
    // Otherwise, route between waypoints
    const origin = currentLocation || waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    
    // Eğer kullanıcı konumu varsa, önce kullanıcı konumundan ilk waypoint'e, sonra diğer waypoint'lere
    // Eğer yoksa, waypoints arasında route çiz
    let waypointsList: google.maps.DirectionsWaypoint[] = [];
    
    if (currentLocation && waypoints.length > 0) {
      // Kullanıcı konumundan başlayarak tüm waypoint'lere git
      waypointsList = waypoints.map((point) => ({
        location: point,
        stopover: true,
      }));
    } else if (waypoints.length > 1) {
      // Waypoints arasında route çiz (ilk ve son hariç)
      waypointsList = waypoints.slice(1, -1).map((point) => ({
        location: point,
        stopover: true,
      }));
    }
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypointsList,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false, // Don't optimize when user location is included
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
          console.log("✅ Rota çizildi:", currentLocation ? "Kullanıcı konumundan" : "Waypoints arası");
        } else {
          console.error(`Directions request failed: ${status}`);
        }
      }
    );
  }, [isLoaded, currentLocation, waypoints]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    // Cleanup location tracking when component unmounts
    if (watchIdRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log("🧹 Konum takibi durduruldu");
    }
  }, []);

  // Custom map control handlers
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom !== undefined) {
        mapRef.current.setZoom(currentZoom + 1);
      }
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom !== undefined) {
        mapRef.current.setZoom(currentZoom - 1);
      }
    }
  };

  const handleRecenter = () => {
    if (!mapRef.current || !currentLocation) return;

    const newTrackingState = !isTrackingLocation;
    setIsTrackingLocation(newTrackingState);
    isTrackingLocationRef.current = newTrackingState;

    if (newTrackingState) {
      // Enable tracking: smoothly animate to user location with optimal zoom (17-18)
      mapRef.current.panTo(currentLocation);
      mapRef.current.setZoom(17); // Optimal zoom level for readability
      // Future location updates will smoothly follow via processLocation using panTo
    } else {
      // Disable tracking: just center once without animation
      mapRef.current.setCenter(currentLocation);
      mapRef.current.setZoom(15);
    }
  };

  const handleFullscreen = () => {
    const mapElement = document.querySelector('[role="region"]') as HTMLElement;
    if (mapElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapElement.requestFullscreen();
      }
    }
  };

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const toggleMapType = () => {
    const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(newType);
    if (mapRef.current) {
      mapRef.current.setMapTypeId(newType);
    }
  };

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
          padding: "16px 24px",
          borderRadius: "12px",
          zIndex: 10001,
          fontSize: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          maxWidth: "500px",
          textAlign: "left",
          lineHeight: "1.6",
        }}>
          <div style={{ marginBottom: "12px", fontWeight: "bold", fontSize: "16px" }}>
            ⚠️ Konum Hatası
          </div>
          <div style={{ marginBottom: "16px", opacity: 0.95 }}>
            {locationError}
          </div>
          <button
            onClick={() => {
              setLocationError(null);
              window.location.reload(); // Reload page to retry
            }}
            style={{
              backgroundColor: "white",
              color: "#ef4444",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              width: "100%",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            🔄 Sayfayı Yenile ve Tekrar Dene
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
          disableDefaultUI: true, // Disable all default UI controls
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: "auto", // Allow map dragging and zooming with mouse/touch
          draggable: true,
        }}
      >
      {/* User's Current Location Marker */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
          zIndex={10004}
          title="📍 Konumunuz"
        />
      )}
             {/* Route with thin, modern styling */}
             {directionsResponse && (
               <DirectionsRenderer
                 directions={directionsResponse}
                 options={{
                   polylineOptions: {
                     strokeColor: "#2563eb", // Modern vibrant blue
                     strokeWeight: 4, // Thinner line
                     strokeOpacity: 0.85,
                     icons: [
                       {
                         icon: {
                           path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                           scale: 3,
                           strokeColor: "#2563eb",
                           strokeWeight: 1.5,
                           fillColor: "#2563eb",
                           fillOpacity: 1,
                         },
                         offset: "50%",
                         repeat: "120px",
                       },
                     ],
                   },
                   suppressMarkers: true, // Suppress default markers, we'll use custom ones
                   preserveViewport: true, // Don't auto-center when user moves the map
                 }}
               />
             )}
             
             {/* Shadow/outline layer for depth - thinner */}
             {directionsResponse && (
               <DirectionsRenderer
                 directions={directionsResponse}
                 options={{
                   polylineOptions: {
                     strokeColor: "#1e3a8a", // Darker blue shadow
                     strokeWeight: 6, // Thinner shadow
                     strokeOpacity: 0.2,
                   },
                   suppressMarkers: true,
                   suppressInfoWindows: true,
                   preserveViewport: true, // Don't auto-center when user moves the map
                 }}
               />
             )}
             
             {/* Custom markers for waypoints (trash container stops) - Yuvarlak işaretler */}
             {waypoints.slice(currentLocation ? 0 : 1, -1).map((waypoint, mapIndex) => {
               // Route'dan mahalle bilgisini al (eğer varsa)
               // currentLocation varsa index 0'dan başlar, yoksa 1'den
               const routeIndex = currentLocation ? mapIndex : mapIndex + 1;
               const routeStop = route?.route_data?.Rota?.[routeIndex];
               const mahalleName = routeStop?.Mahalle || `Durak ${mapIndex + 1}`;
               
               return (
                 <Marker
                   key={`waypoint-${mapIndex}`}
                   position={waypoint}
                   icon={{
                     path: google.maps.SymbolPath.CIRCLE,
                     scale: 12, // Daha büyük yuvarlak işaret (konteynerlerin olduğunu gösterir)
                     fillColor: "#f59e0b", // Amber/orange color for trash containers
                     fillOpacity: 0.9,
                     strokeColor: "#ffffff",
                     strokeWeight: 3, // Daha kalın kenarlık
                   }}
                   zIndex={10002}
                   title={mahalleName}
                 />
               );
             })}

      {/* Start Marker - Green yuvarlak (only show if user location is not available) */}
      {!currentLocation && waypoints.length > 0 && (
        <Marker
          position={waypoints[0]}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12, // Daha büyük yuvarlak
            fillColor: "#10b981", // Green for start
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 3, // Daha kalın kenarlık
          }}
          zIndex={10003}
          title={route?.route_data?.Rota?.[0]?.Mahalle || "Başlangıç"}
        />
      )}

      {/* Start Marker - Green yuvarlak for user location (when available) */}
      {currentLocation && waypoints.length > 0 && (
        <Marker
          position={waypoints[0]}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12, // Daha büyük yuvarlak
            fillColor: "#10b981", // Green for start
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 3, // Daha kalın kenarlık
          }}
          zIndex={10003}
          title={route?.route_data?.Rota?.[0]?.Mahalle || "İlk Durak"}
        />
      )}

      {/* End Marker - Red yuvarlak */}
      {waypoints.length > 0 && (
        <Marker
          position={waypoints[waypoints.length - 1]}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12, // Daha büyük yuvarlak
            fillColor: "#ef4444", // Red for end
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 3, // Daha kalın kenarlık
          }}
          zIndex={10003}
          title={route?.route_data?.Rota?.[(route.route_data.Rota?.length || 1) - 1]?.Mahalle || "Bitiş"}
        />
      )}
      </GoogleMap>

      {/* Custom Map Controls */}
      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 10000,
      }}>
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          style={{
            background: "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            cursor: "pointer",
            transition: "all 0.3s",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #22503d 0%, #122621 100%)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Zoom In"
        >
          <Plus size={24} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          style={{
            background: "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            cursor: "pointer",
            transition: "all 0.3s",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #22503d 0%, #122621 100%)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Zoom Out"
        >
          <Minus size={24} />
        </button>

         {/* Track Current Location Button */}
         {currentLocation && (
           <button
             onClick={handleRecenter}
             style={{
               background: isTrackingLocation
                 ? "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)"
                 : "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)",
               border: isTrackingLocation
                 ? "1px solid rgba(59, 130, 246, 0.5)"
                 : "1px solid rgba(255, 255, 255, 0.1)",
               borderRadius: "12px",
               width: "48px",
               height: "48px",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               color: "#ffffff",
               cursor: "pointer",
               transition: "background 0.3s, border 0.3s",
               boxShadow: isTrackingLocation
                 ? "0 4px 12px rgba(59, 130, 246, 0.4)"
                 : "0 4px 12px rgba(0, 0, 0, 0.3)",
             }}
             onMouseEnter={(e) => {
               if (!isTrackingLocation) {
                 e.currentTarget.style.background = "linear-gradient(180deg, #22503d 0%, #122621 100%)";
               }
             }}
             onMouseLeave={(e) => {
               if (!isTrackingLocation) {
                 e.currentTarget.style.background = "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)";
               }
             }}
             title={isTrackingLocation ? "Takibi Durdur" : "Konumumu Takip Et"}
           >
             <Navigation size={24} fill={isTrackingLocation ? "#ffffff" : "none"} />
           </button>
         )}

        {/* Map Type Toggle */}
        <button
          onClick={toggleMapType}
          style={{
            background: "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            cursor: "pointer",
            transition: "all 0.3s",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #22503d 0%, #122621 100%)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={`Switch to ${mapType === 'roadmap' ? 'Satellite' : 'Map'} View`}
        >
          <Layers size={24} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleFullscreen}
          style={{
            background: "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            cursor: "pointer",
            transition: "all 0.3s",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #22503d 0%, #122621 100%)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Toggle Fullscreen"
        >
          <Maximize2 size={24} />
        </button>
      </div>
    </>
  );
};

export default Map;
