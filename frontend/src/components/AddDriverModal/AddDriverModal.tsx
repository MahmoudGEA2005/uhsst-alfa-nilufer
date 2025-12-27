import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';
import { User, Phone, Mail, Hash, CreditCard, Calendar, Upload, Lock, Truck } from 'lucide-react';
import AdminInput from '../AdminInput/AdminInput';
import './AddDriverModal.css';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DriverFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  id_number: string;
  license_number: string;
  vehicle_number: string;
  password: string;
  license_class: string;
  hire_date: string;
  image: FileList;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DriverFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: DriverFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('email', data.email);
      formData.append('phone_number', data.phone_number);
      formData.append('id_number', data.id_number);
      formData.append('license_number', data.license_number);
      formData.append('vehicle_number', data.vehicle_number);
      formData.append('password', data.password);
      
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      // Get admin token from cookies
      const token = Cookies.get('admin_token');

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/drivers/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        reset();
        onClose();
        // Reload the page to show the new driver
        window.location.reload();
      }
    } catch (error: any) {
      if (error.response) {
        setSubmitError(error.response.data.message || 'Sürücü eklenirken bir hata oluştu');
      } else {
        setSubmitError('Sunucuya bağlanırken bir hata oluştu');
      }
      console.error('Error creating driver:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-driver-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Yeni Sürücü Ekle</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            {submitError && (
              <div className="submit-error-message">
                {submitError}
              </div>
            )}
            
            <div className="form-grid">
              <AdminInput
                label="Ad"
                icon={User}
                type="text"
                placeholder="Adını girin"
                register={register}
                name="first_name"
                validation={{ required: 'Ad gereklidir' }}
                error={errors.first_name?.message}
              />

              <AdminInput
                label="Soyad"
                icon={User}
                type="text"
                placeholder="Soyadını girin"
                register={register}
                name="last_name"
                validation={{ required: 'Soyad gereklidir' }}
                error={errors.last_name?.message}
              />

              <AdminInput
                label="Telefon Numarası"
                icon={Phone}
                type="tel"
                placeholder="Telefon numarasını girin"
                register={register}
                name="phone_number"
                validation={{ 
                  required: 'Telefon numarası gereklidir',
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: 'Geçerli bir telefon numarası girin'
                  }
                }}
                error={errors.phone_number?.message}
              />

              <AdminInput
                label="E-posta"
                icon={Mail}
                type="email"
                placeholder="E-posta adresini girin"
                register={register}
                name="email"
                validation={{ 
                  required: 'E-posta gereklidir',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Geçerli bir e-posta adresi girin'
                  }
                }}
                error={errors.email?.message}
              />

              <AdminInput
                label="TC Kimlik No"
                icon={Hash}
                type="text"
                placeholder="TC Kimlik numarasını girin"
                register={register}
                name="id_number"
                validation={{ 
                  required: 'TC Kimlik No gereklidir',
                  pattern: {
                    value: /^[0-9]{11}$/,
                    message: 'TC Kimlik No 11 haneli olmalıdır'
                  }
                }}
                error={errors.id_number?.message}
              />

              <AdminInput
                label="Ehliyet Numarası"
                icon={CreditCard}
                type="text"
                placeholder="Ehliyet numarasını girin"
                register={register}
                name="license_number"
                validation={{ required: 'Ehliyet numarası gereklidir' }}
                error={errors.license_number?.message}
              />

              <AdminInput
                label="Araç Numarası"
                icon={Truck}
                type="text"
                placeholder="Araç numarasını girin"
                register={register}
                name="vehicle_number"
                validation={{ required: 'Araç numarası gereklidir' }}
                error={errors.vehicle_number?.message}
              />

              <AdminInput
                label="Şifre"
                icon={Lock}
                type="password"
                placeholder="Şifre girin"
                register={register}
                name="password"
                validation={{ 
                  required: 'Şifre gereklidir',
                  minLength: {
                    value: 6,
                    message: 'Şifre en az 6 karakter olmalıdır'
                  }
                }}
                error={errors.password?.message}
              />

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Ehliyet Sınıfı
                </label>
                <select className={`form-select ${errors.license_class ? 'admin-input-error' : ''}`} {...register('license_class', { required: 'Ehliyet sınıfı gereklidir' })}>
                  <option value="">Ehliyet sınıfı seçin</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
                {errors.license_class && <span className="admin-input-error-message">{errors.license_class.message}</span>}
              </div>

              <AdminInput
                label="İşe Başlama Tarihi"
                icon={Calendar}
                type="date"
                register={register}
                name="hire_date"
                validation={{ required: 'İşe başlama tarihi gereklidir' }}
                error={errors.hire_date?.message}
              />
            </div>

            <div className="form-group-full">
              <label className="form-label">
                <Upload size={18} />
                Sürücü Fotoğrafı
              </label>
              <input 
                type="file" 
                className={`form-file-input ${errors.image ? 'admin-input-error' : ''}`}
                accept="image/*"
                {...register('image', { required: 'Sürücü fotoğrafı gereklidir' })}
              />
              {errors.image && <span className="admin-input-error-message">{errors.image.message}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              İptal
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ekleniyor...' : 'Sürücü Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddDriverModal;
