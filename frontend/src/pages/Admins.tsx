import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import SearchFilterBar from '../components/SearchFilterBar/SearchFilterBar';
import AddAdminModal from '../components/AddAdminModal/AddAdminModal';
import AdminsTable from '../components/AdminsTable/AdminsTable';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import './Admins.css';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  admin_id_number: string;
  image: string | null;
  created_at: string;
}

const Admins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admins/all`);
      const data = await response.json();
      
      if (response.ok) {
        setAdmins(data.data || []);
        setError(null);
      } else {
        setError('Adminler yüklenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Sunucuya bağlanırken bir hata oluştu');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddNewAdmin = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    console.log('Düzenle:', admin);
    // TODO: Open edit modal
  };

  const handleDelete = (admin: Admin) => {
    console.log('Sil:', admin);
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
      options: ['Tüm Durumlar', 'Aktif', 'Pasif']
    },
    {
      label: 'Rol',
      options: ['Tümü', 'Süper Admin', 'Admin', 'Moderatör']
    }
  ];

  if (loading) {
    return (
      <div className="admins-page">
        <LoadingSpinner inline />
      </div>
    );
  }

  return (
    <div className="admins-page">
      <div className="slide-in slide-in-stagger-1">
        <PageHeader
          title="Yönetici Kullanıcılar"
          subtitle="Sistem yöneticilerini yönetin ve yetkileri atayın."
          breadcrumb={[
            { label: 'Ana Sayfa', path: '/' },
            { label: 'Adminler' }
          ]}
        />
      </div>

      <div className="slide-in slide-in-stagger-2">
        <SearchFilterBar
          searchPlaceholder="İsim, ID veya e-posta ile ara..."
          filters={filters}
          onAddNew={handleAddNewAdmin}
          addButtonText="Yeni Admin Ekle"
          onDownload={handleDownload}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error ? (
        <div className="admins-content slide-in slide-in-stagger-3">
          <p className="error-text">{error}</p>
        </div>
      ) : (
        <div className="slide-in slide-in-stagger-3">
          <AdminsTable 
            admins={admins}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <AddAdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Admins;
