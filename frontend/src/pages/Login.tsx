import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import logo from '../assets/main_assets/logo.jpg';
import axios from 'axios';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit } = useForm<LoginFormData>();

  const onLogin = async (data: LoginFormData) => {
    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/drivers/login`;
      console.log("Sending login request to:", endpoint);
      
      const response = await axios.post(endpoint, {
        email: data.email,
        password: data.password,
      });

      if (response.data.token) {
        console.log("Login successful! Token:", response.data.token);
        console.log("Driver data:", response.data.driver);
        console.log("Token expires at:", response.data.token_expires_at);
        
        // Store token in localStorage
        localStorage.setItem('driver_token', response.data.token);
        localStorage.setItem('driver_data', JSON.stringify(response.data.driver));
        
        // You can redirect to main page here
        // window.location.href = '/main';
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Error message:", error.response.data.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>
          <h1 className="login-title">isim sonra</h1>
          <p className="login-subtitle">Rotanıza başlamak için giriş yapın</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onLogin)}>
          <Input
            label="E-posta Adresi"
            icon={Mail}
            type="email"
            placeholder="surucu@atik-sirket.com"
            register={register('email')}
          />

          <Input
            label="Şifre"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            register={register('password')}
          />

          <a href="#" className="forgot-password">
            Şifremi Unuttum?
          </a>

          <Button type="submit">
            Giriş Yap <ArrowRight size={20} />
          </Button>
        </form>

        <div className="login-footer">
          <p>
            Hesabınızla ilgili yardıma mı ihtiyacınız var?{' '}
            <a href="#" className="contact-link">
              Merkez ile İletişim
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
