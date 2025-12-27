import React from 'react';
import { User, Phone, Mail, Trash2, Edit } from 'lucide-react';
import './DriversTable.css';

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  license_number: string;
  vehicle_number: string;
  id_number: string;
  image: string | null;
  created_at: string;
}

interface DriversTableProps {
  drivers: Driver[];
  onEdit?: (driver: Driver) => void;
  onDelete?: (driver: Driver) => void;
}

const DriversTable: React.FC<DriversTableProps> = ({ drivers, onEdit, onDelete }) => {
  const storageUrl = import.meta.env.VITE_STORAGE_URL;

  if (drivers.length === 0) {
    return (
      <div className="no-drivers">
        <User size={48} className="no-drivers-icon" />
        <h3>Henüz sürücü yok</h3>
        <p>Yeni bir sürücü eklemek için yukarıdaki butonu kullanın</p>
      </div>
    );
  }

  return (
    <div className="drivers-table-container">
      <table className="drivers-table">
        <thead>
          <tr>
            <th>Fotoğraf</th>
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Telefon</th>
            <th>Ehliyet No</th>
            <th>Araç No</th>
            <th>TC Kimlik</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.id}>
              <td>
                <div className="driver-avatar">
                  {driver.image ? (
                    <img 
                      src={`${storageUrl}/${driver.image}`} 
                      alt={`${driver.first_name} ${driver.last_name}`}
                      className="driver-image"
                    />
                  ) : (
                    <div className="driver-avatar-placeholder">
                      <User size={24} />
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="driver-name">
                  {driver.first_name} {driver.last_name}
                </div>
              </td>
              <td>
                <div className="driver-email">
                  <Mail size={16} className="table-icon" />
                  {driver.email}
                </div>
              </td>
              <td>
                <div className="driver-phone">
                  <Phone size={16} className="table-icon" />
                  {driver.phone_number}
                </div>
              </td>
              <td>{driver.license_number}</td>
              <td>{driver.vehicle_number}</td>
              <td>{driver.id_number}</td>
              <td>
                <div className="table-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit?.(driver)}
                    title="Düzenle"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete?.(driver)}
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

export default DriversTable;
