import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('admin_token');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const endpoint = `${import.meta.env.VITE_BACKEND_URL}/admins/auth/check`;
        
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.data.authenticated) {
          setIsAuthenticated(true);
          console.log('Authenticated admin:', response.data.admin);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Admin authentication check failed:', error);
        setIsAuthenticated(false);
        // Clear invalid token
        Cookies.remove('admin_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f7f9fa',
        color: '#111827',
        fontSize: '1.25rem',
        fontWeight: 600,
      }}>
        Yükleniyor...
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
