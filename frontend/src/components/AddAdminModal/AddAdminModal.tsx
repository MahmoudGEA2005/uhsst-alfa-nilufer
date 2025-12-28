import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserCog, Phone, Mail, Hash, Upload, Lock } from 'lucide-react';
import AdminInput from '../AdminInput/AdminInput';
import './AddAdminModal.css';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AdminFormData {
  name: string;
  phone_number: string;
  email: string;
  admin_id_number: string;
  password: string;
  image: FileList;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: AdminFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone_number', data.phone_number);
      formData.append('admin_id_number', data.admin_id_number);
      formData.append('password', data.password);
      
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      // Get admin token from cookies
      const token = Cookies.get('admin_token');

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admins/add`,
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
        // Reload the page to show the new admin
        window.location.reload();
      }
    } catch (error: any) {
      if (error.response) {
        setSubmitError(error.response.data.message || 'Admin eklenirken bir hata oluştu');
      } else {
        setSubmitError('Sunucuya bağlanırken bir hata oluştu');
      }
      console.error('Error creating admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Yeni Admin Ekle</h2>
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
                label="İsim"
                icon={UserCog}
                type="text"
                placeholder="İsim girin"
                register={register}
                name="name"
                validation={{ required: 'İsim gereklidir' }}
                error={errors.name?.message}
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
                label="Admin ID Numarası"
                icon={Hash}
                type="text"
                placeholder="Admin ID numarasını girin"
                register={register}
                name="admin_id_number"
                validation={{ 
                  required: 'Admin ID gereklidir',
                  pattern: {
                    value: /^[0-9]{8,11}$/,
                    message: 'Admin ID 8-11 haneli olmalıdır'
                  }
                }}
                error={errors.admin_id_number?.message}
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
            </div>

            <div className="form-group-full">
              <label className="form-label">
                <Upload size={18} />
                Admin Fotoğrafı
              </label>
              <input 
                type="file" 
                className={`form-file-input ${errors.image ? 'admin-input-error' : ''}`}
                accept="image/*"
                {...register('image')}
              />
              {errors.image && <span className="admin-input-error-message">{errors.image.message}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              İptal
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ekleniyor...' : 'Admin Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddAdminModal;
