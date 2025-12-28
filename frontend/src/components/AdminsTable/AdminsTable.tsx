import React from 'react';
import { UserCog, Phone, Mail, Trash2, Edit } from 'lucide-react';
import './AdminsTable.css';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  admin_id_number: string;
  image: string | null;
  created_at: string;
}

interface AdminsTableProps {
  admins: Admin[];
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
}

const AdminsTable: React.FC<AdminsTableProps> = ({ admins, onEdit, onDelete }) => {
  const storageUrl = import.meta.env.VITE_STORAGE_URL;

  if (admins.length === 0) {
    return (
      <div className="no-admins">
        <UserCog size={48} className="no-admins-icon" />
        <h3>Henüz admin yok</h3>
        <p>Yeni bir admin eklemek için yukarıdaki butonu kullanın</p>
      </div>
    );
  }

  return (
    <div className="admins-table-container">
      <table className="admins-table">
        <thead>
          <tr>
            <th>Fotoğraf</th>
            <th>İsim</th>
            <th>E-posta</th>
            <th>Telefon</th>
            <th>Admin ID</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>
                <div className="admin-avatar">
                  {admin.image ? (
                    <img 
                      src={`${storageUrl}/${admin.image}`} 
                      alt={admin.name}
                      className="admin-image"
                    />
                  ) : (
                    <div className="admin-avatar-placeholder">
                      <UserCog size={24} />
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="admin-name">
                  {admin.name}
                </div>
              </td>
              <td>
                <div className="admin-email">
                  <Mail size={16} className="table-icon" />
                  {admin.email}
                </div>
              </td>
              <td>
                <div className="admin-phone">
                  <Phone size={16} className="table-icon" />
                  {admin.phone_number}
                </div>
              </td>
              <td>{admin.admin_id_number}</td>
              <td>
                <div className="table-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit?.(admin)}
                    title="Düzenle"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete?.(admin)}
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

export default AdminsTable;
