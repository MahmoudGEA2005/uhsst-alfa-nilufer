import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import logo from '../assets/main_assets/logo.jpg';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onLogin = async (data: LoginFormData) => {
    setErrorMessage('');
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
        
        // Store token in cookie (expires in 7 days)
        Cookies.set('driver_token', response.data.token, { expires: 7 });
        
        // Navigate to main page
        navigate('/main');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage('E-posta adresi veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.');
      } else {
        setErrorMessage('Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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
          <h1 className="login-title">Sürücü Paneli</h1>
          <p className="login-subtitle">Görevlerinize başlamak için giriş yapın</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onLogin)}>
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          
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
              Yardım Merkezi ile İletişime Geçin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
