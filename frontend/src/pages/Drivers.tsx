import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import SearchFilterBar from '../components/SearchFilterBar/SearchFilterBar';
import AddDriverModal from '../components/AddDriverModal/AddDriverModal';
import DriversTable from '../components/DriversTable/DriversTable';
import './Drivers.css';

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  license_number: string;
  vehicle_number: string;
  id_number: string;
  image: string | null;
  created_at: string;
}

const Drivers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/all`);
      const data = await response.json();
      
      if (response.ok) {
        setDrivers(data.data || []);
        setError(null);
      } else {
        setError('Sürücüler yüklenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Sunucuya bağlanırken bir hata oluştu');
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddNewDriver = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    console.log('Düzenle:', driver);
    // TODO: Open edit modal
  };

  const handleDelete = (driver: Driver) => {
    console.log('Sil:', driver);
    // TODO: Implement delete functionality
  };

  const handleDownload = () => {
    console.log('İndir');
  };

  const handleSearch = (value: string) => {
    console.log('Arama:', value);
  };

  const handleFilterChange = (filterIndex: number, value: string) => {
    console.log(`Filtre ${filterIndex}:`, value);
  };

  const filters = [
    {
      label: 'Durum',
      options: ['Tüm Durumlar', 'Aktif', 'Pasif', 'İzinli']
    },
    {
      label: 'Araç Tipi',
      options: ['Araç Tipi', 'Kamyon', 'Kamyonet', 'Çöp Kamyonu']
    }
  ];

  return (
    <div className="drivers-page">
      <PageHeader
        title="Kamyon Sürücüleri"
        subtitle="Personeli yönetin ve sürücüleri atık toplama rotalarına atayın."
        breadcrumb={[
          { label: 'Ana Sayfa', path: '/' },
          { label: 'Sürücüler' }
        ]}
      />

      <SearchFilterBar
        searchPlaceholder="İsim, ID veya ehliyet ile ara..."
        filters={filters}
        onAddNew={handleAddNewDriver}
        addButtonText="Yeni Sürücü Ekle"
        onDownload={handleDownload}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="drivers-content">
          <p className="loading-text">Sürücüler yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="drivers-content">
          <p className="error-text">{error}</p>
        </div>
      ) : (
        <DriversTable 
          drivers={drivers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <AddDriverModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Drivers;
