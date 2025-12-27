import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Plus, Minus, Navigation, Layers } from 'lucide-react';

// 1. Import the images explicitly
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// 2. Create the icon object
const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom Zoom Controls Component
const CustomZoomControls = () => {
  const map = useMap();

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    map.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    map.zoomOut();
  };

  return (
    <div style={{
      position: 'absolute',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 1000
    }}>
      {/* ZOOM IN BUTTON */}
      <button 
        onClick={handleZoomIn}
        className="action-btn"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <Plus size={24} />
      </button>

      {/* ZOOM OUT BUTTON */}
      <button 
        onClick={handleZoomOut}
        className="action-btn"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <Minus size={24} />
      </button>

      {/* NAVIGATION BUTTON */}
      <button 
        className="action-btn navigate"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: '#22c55e',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#16a34a'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#22c55e'}
      >
        <Navigation size={24} fill="currentColor" />
      </button>

      {/* LAYERS BUTTON */}
      <button 
        className="action-btn"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <Layers size={24} />
      </button>
    </div>
  );
};

const Map = () => {
    const bursaPosition: [number, number] = [40.1950, 29.0600];

    return (
        <MapContainer 
            center={bursaPosition} 
            zoom={13} 
            zoomControl={false}
            style={{ height: "100vh", width: "100%", borderRadius: "12px", background: '#191a1a' }}
        >
            {/* 3. CHANGED: Use the 'dark_all' URL instead of 'light_all' */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
                // Optional: This filter adds a slight blue/teal tint to match your #001220 preference
                // If you want pure black/grey, remove the className or the style.
                eventHandlers={{
                  add: (e) => {
                    const container = e.target.getContainer();
                    // This CSS filter increases contrast and shifts the grey towards blue
                    container.style.filter = "brightness(0.8) contrast(1.2) hue-rotate(10deg)";
                  }
                }}
            />
            
            {/* Custom Zoom Controls */}
            <CustomZoomControls />
            
            <Marker position={bursaPosition} icon={customIcon}>
                <Popup>
                    Bursa | Ulu Cami<br />
                    City Center
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default Map;