import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './AdminUser.css';

interface Admin {
  id: number;
  name: string;
  email: string;
  image?: string;
}

const AdminUser = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = Cookies.get('admin_token');
        if (!token) return;

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admins/auth/check`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.data.authenticated && response.data.admin) {
          setAdmin(response.data.admin);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  const getImageUrl = () => {
    if (admin?.image) {
      // Remove /api from the backend URL for storage files
      const baseUrl = import.meta.env.VITE_BACKEND_URL.replace('/api', '');
      return `${baseUrl}/storage/${admin.image}`;
    }
    return '/default-avatar.png'; // Fallback image
  };

  return (
    <div className="admin-user">
      <div className="admin-user-avatar">
        <img src={getImageUrl()} alt={admin?.name || 'Admin'} />
      </div>
      <div className="admin-user-info">
        <h3 className="admin-user-name">{admin?.name || 'Loading...'}</h3>
        <p className="admin-user-role">Admin</p>
      </div>
    </div>
  );
};

export default AdminUser;
