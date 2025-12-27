import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';
import { MapPin, Hash, Users, Home, Building, Store } from 'lucide-react';
import AdminInput from '../AdminInput/AdminInput';
import './AddLocationModal.css';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocationFormData {
  name: string;
  longitude: string;
  latitude: string;
  population: string;
  home_residences: string;
  companies: string;
  stores: string;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LocationFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: LocationFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = {
        name: data.name,
        longitude: parseFloat(data.longitude),
        latitude: parseFloat(data.latitude),
        population: parseInt(data.population) || 0,
        home_residences: parseInt(data.home_residences) || 0,
        companies: parseInt(data.companies) || 0,
        stores: parseInt(data.stores) || 0,
      };

      // Get admin token from cookies
      const token = Cookies.get('admin_token');

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/locations/add`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        reset();
        onClose();
        // Reload the page to show the new location
        window.location.reload();
      }
    } catch (error: any) {
      if (error.response) {
        setSubmitError(error.response.data.message || 'Konum eklenirken bir hata oluştu');
      } else {
        setSubmitError('Sunucuya bağlanırken bir hata oluştu');
      }
      console.error('Error creating location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Yeni Konum Ekle</h2>
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
                label="Konum Adı"
                icon={MapPin}
                type="text"
                placeholder="Konum adını girin"
                register={register}
                name="name"
                validation={{ required: 'Konum adı gereklidir' }}
                error={errors.name?.message}
              />

              <AdminInput
                label="Boylam (Longitude)"
                icon={Hash}
                type="number"
                placeholder="Örn: 28.9784"
                register={register}
                name="longitude"
                validation={{ 
                  required: 'Boylam gereklidir',
                  min: {
                    value: -180,
                    message: 'Boylam -180 ile 180 arasında olmalıdır'
                  },
                  max: {
                    value: 180,
                    message: 'Boylam -180 ile 180 arasında olmalıdır'
                  }
                }}
                error={errors.longitude?.message}
                step="0.0000001"
              />

              <AdminInput
                label="Enlem (Latitude)"
                icon={Hash}
                type="number"
                placeholder="Örn: 41.0082"
                register={register}
                name="latitude"
                validation={{ 
                  required: 'Enlem gereklidir',
                  min: {
                    value: -90,
                    message: 'Enlem -90 ile 90 arasında olmalıdır'
                  },
                  max: {
                    value: 90,
                    message: 'Enlem -90 ile 90 arasında olmalıdır'
                  }
                }}
                error={errors.latitude?.message}
                step="0.0000001"
              />

              <AdminInput
                label="Nüfus"
                icon={Users}
                type="number"
                placeholder="Kaç kişi yaşıyor?"
                register={register}
                name="population"
                validation={{ 
                  min: {
                    value: 0,
                    message: 'Nüfus 0 veya daha büyük olmalıdır'
                  }
                }}
                error={errors.population?.message}
              />

              <AdminInput
                label="Ev Sayısı"
                icon={Home}
                type="number"
                placeholder="Konut sayısı"
                register={register}
                name="home_residences"
                validation={{ 
                  min: {
                    value: 0,
                    message: 'Ev sayısı 0 veya daha büyük olmalıdır'
                  }
                }}
                error={errors.home_residences?.message}
              />

              <AdminInput
                label="Şirket Sayısı"
                icon={Building}
                type="number"
                placeholder="Şirket/işletme sayısı"
                register={register}
                name="companies"
                validation={{ 
                  min: {
                    value: 0,
                    message: 'Şirket sayısı 0 veya daha büyük olmalıdır'
                  }
                }}
                error={errors.companies?.message}
              />

              <AdminInput
                label="Mağaza Sayısı"
                icon={Store}
                type="number"
                placeholder="Mağaza/dükkan sayısı"
                register={register}
                name="stores"
                validation={{ 
                  min: {
                    value: 0,
                    message: 'Mağaza sayısı 0 veya daha büyük olmalıdır'
                  }
                }}
                error={errors.stores?.message}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              İptal
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ekleniyor...' : 'Konum Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddLocationModal;
