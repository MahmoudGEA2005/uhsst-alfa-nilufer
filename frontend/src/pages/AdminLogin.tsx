import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admins/login`, {
        email,
        password,
      });

      if (response.data.token) {
        // Store token in cookies (7 days)
        Cookies.set('admin_token', response.data.token, { expires: 7 });
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-left">
        <div className="admin-login-content">
          <div className="admin-login-branding">
            <div className="admin-login-logo">
              <svg viewBox="0 0 24 24" fill="currentColor" className="logo-svg">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <h1>Nilüfer Akıllı Atık Yönetimi</h1>
            <p>Yıllık 3,522 ton CO₂ tasarrufu ile daha temiz ve sürdürülebilir bir gelecek için akıllı atık yönetimi.</p>
          </div>

          <div className="admin-stats">
            <div className="stat-card">
              <h2>160K+</h2>
              <p>AĞAÇ KURTARILDI</p>
            </div>
            <div className="stat-card">
              <h2>3,523</h2>
              <p>TON CO₂ TASARRUF/YIL</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-login-right">
        <div className="admin-login-form-container">
          <div className="admin-login-header">
            <h2>Yönetim Paneline Giriş Yapın</h2>
            <p>Toplama rotalarını ve filo operasyonlarını yönetin.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>E-posta Adresi</label>
              <div className="input-with-icon">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  placeholder="admin@nilufer.bel.tr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Şifre</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <a href="#" className="forgot-password">Şifremi Unuttum?</a>
            </div>

            <button type="submit" className="admin-login-button" disabled={isLoading}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>

            <p className="contact-admin">
              Hesabınız yok mu? <a href="#">Sistem Yöneticisi ile İletişime Geçin</a>
            </p>
          </form>
        </div>

        <footer className="admin-login-footer">
          © 2024 Nilüfer Belediyesi. Tüm hakları saklıdır.
        </footer>
      </div>
    </div>
  );
};

export default AdminLogin;
