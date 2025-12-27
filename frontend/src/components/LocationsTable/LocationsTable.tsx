import React from 'react';
import { MapPin, Users, Home, Building, Store, Trash2, Edit } from 'lucide-react';
import './LocationsTable.css';

interface Location {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  population: number;
  home_residences: number;
  companies: number;
  stores: number;
  created_at: string;
}

interface LocationsTableProps {
  locations: Location[];
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ locations, onEdit, onDelete }) => {
  if (locations.length === 0) {
    return (
      <div className="no-locations">
        <MapPin size={48} className="no-locations-icon" />
        <h3>Henüz konum yok</h3>
        <p>Yeni bir konum eklemek için yukarıdaki butonu kullanın</p>
      </div>
    );
  }

  return (
    <div className="locations-table-container">
      <table className="locations-table">
        <thead>
          <tr>
            <th>Konum Adı</th>
            <th>Koordinatlar</th>
            <th>Nüfus</th>
            <th>Evler</th>
            <th>Şirketler</th>
            <th>Mağazalar</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>
                <div className="location-name">
                  <MapPin size={16} className="table-icon" />
                  {location.name}
                </div>
              </td>
              <td>
                <div className="location-coordinates">
                  <div className="coordinate-line">
                    <span className="coordinate-label">Enlem:</span> {location.latitude}
                  </div>
                  <div className="coordinate-line">
                    <span className="coordinate-label">Boylam:</span> {location.longitude}
                  </div>
                </div>
              </td>
              <td>
                <div className="location-stat">
                  <Users size={16} className="table-icon" />
                  {location.population.toLocaleString()}
                </div>
              </td>
              <td>
                <div className="location-stat">
                  <Home size={16} className="table-icon" />
                  {location.home_residences.toLocaleString()}
                </div>
              </td>
              <td>
                <div className="location-stat">
                  <Building size={16} className="table-icon" />
                  {location.companies.toLocaleString()}
                </div>
              </td>
              <td>
                <div className="location-stat">
                  <Store size={16} className="table-icon" />
                  {location.stores.toLocaleString()}
                </div>
              </td>
              <td>
                <div className="table-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit?.(location)}
                    title="Düzenle"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete?.(location)}
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocationsTable;
