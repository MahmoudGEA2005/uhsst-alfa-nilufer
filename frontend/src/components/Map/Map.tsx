import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// Marker images
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* --------------------------------------------------
   ✅ REAL ROUTE COMPONENT (ROADS, NOT STRAIGHT)
---------------------------------------------------*/
const RealRoute = () => {
  const map = useMap();

  useEffect(() => {
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(40.1950, 29.0600), // Ulu Cami
        L.latLng(40.2005, 29.0650), // Atatürk Cd.
        L.latLng(40.2058, 29.0705), // Heykel
        L.latLng(40.2102, 29.0750), // Setbaşı
      ],

      // 🔑 OSRM free public server
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1"
      }),

      lineOptions: {
        styles: [
          { color: "#22c55e", weight: 6, opacity: 0.9 }
        ]
      },

      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false, // hide instruction panel
      createMarker: () => null // ❌ no default markers
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map]);

  return null;
};

const Map = () => {
  const center: [number, number] = [40.1950, 29.0600];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />

      {/* ✅ REAL ROAD ROUTE */}
      <RealRoute />

      {/* Optional markers */}
      <Marker position={[40.1950, 29.0600]} icon={customIcon}>
        <Popup>Start: Ulu Cami</Popup>
      </Marker>

      <Marker position={[40.2102, 29.0750]} icon={customIcon}>
        <Popup>End: Setbaşı</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
