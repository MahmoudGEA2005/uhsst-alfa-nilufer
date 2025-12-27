import { Outlet, NavLink } from 'react-router-dom';
import AdminUser from '../AdminUser';
import './AdminLayout.css';
import { LayoutDashboard, Users, Route, MapPin, Calendar, FileText, Settings } from 'lucide-react';
import logo from '../../assets/main_assets/logo.jpg';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="logo-icon">
              <img src={logo} alt="Logo" />
            </div>
            <div>
              <h1>AtıkYönetim</h1>
              <p>Yönetim Paneli</p>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/dashboard/overview" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            <span>Kontrol Paneli</span>
          </NavLink>
          <NavLink to="/dashboard/drivers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={20} />
            <span>Sürücüler</span>
          </NavLink>
          <NavLink to="/dashboard/routes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Route size={20} />
            <span>Rotalar</span>
          </NavLink>
          <NavLink to="/dashboard/locations" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <MapPin size={20} />
            <span>Konumlar</span>
          </NavLink>
          <NavLink to="/dashboard/schedule" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Calendar size={20} />
            <span>Programa</span>
          </NavLink>
          <NavLink to="/dashboard/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={20} />
            <span>Raporlar</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="settings-button">
            <Settings size={20} />
            <span>Ayarlar</span>
          </button>
          <AdminUser />
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
