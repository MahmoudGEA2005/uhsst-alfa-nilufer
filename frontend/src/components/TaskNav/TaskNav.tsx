import React from 'react';
import "./TaskNav.css";
import WorkerUser from '../WorkerUser/WorkerUser';
import StatCard from '../StatCard/StatCard';
import StopCard from '../StopCard/StopCard';
import { CheckCircle, Clock, Settings, ChevronRight, LogOut } from 'lucide-react';

interface Route {
  id: number;
  driver_id: number;
  route_data: {
    Arac: string;
    Tip: string;
    Ozet: {
      Cop_kg: number;
      Durak_Sayisi: number;
      Mesafe_km: number;
      Kapasite_Kullanim: string;
    };
    Rota: Array<{
      Sira: number;
      Mahalle: string;
      Koordinat: {
        Lat: number;
        Lng: number;
      };
      Cop_kg: number;
      Mesafe_km: number;
    }>;
  };
  waypoints: Array<{
    lat: number;
    lng: number;
  }>;
}

interface TaskNavProps {
  isOpen: boolean;
  navRef: React.RefObject<HTMLDivElement | null>;
  route?: Route | null;
}

const TaskNav: React.FC<TaskNavProps> = ({ isOpen, navRef, route }) => {
  const handleLogout = () => {
    document.cookie = "driver_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  // Stops'ları route'dan oluştur - route yoksa boş liste
  const stops = route?.route_data?.Rota 
    ? route.route_data.Rota.map((stop, index) => ({
        number: stop.Sira,
        address: stop.Mahalle,
        info: index === 0 ? "Mevcut Hedef • Konut" : `${stop.Mesafe_km.toFixed(1)} km • ${stop.Cop_kg} kg`,
        badges: index === 0 ? [`${stop.Cop_kg} kg`] : undefined,
        isActive: index === 0,
      }))
    : [];

  // Stats'ları route'dan al - route yoksa 0 göster
  const completedStops = route?.route_data?.Rota 
    ? Math.floor(route.route_data.Rota.length * 0.5) // %50 tamamlanmış varsayım
    : 0;
  const totalStops = route?.route_data?.Rota 
    ? route.route_data.Rota.length
    : 0;
  
  // Tahmini bitiş saatini hesapla (örnek: saat 8'de başlayıp her durak için 5 dakika varsayımı)
  const estimatedFinishTime = route?.route_data?.Rota && route.route_data.Rota.length > 0
    ? (() => {
        const startHour = 8;
        const minutesPerStop = 5;
        const totalMinutes = route.route_data.Rota.length * minutesPerStop;
        const finishHour = Math.floor(startHour + totalMinutes / 60);
        const finishMinute = totalMinutes % 60;
        return `${finishHour.toString().padStart(2, '0')}:${finishMinute.toString().padStart(2, '0')}`;
      })()
    : "--:--";

  return (
    <div 
      ref={navRef}
      className={`task-nav ${isOpen ? 'open' : ''}`}
    >
      
      
      <WorkerUser />
      
      <div className='stats-container'>
        <StatCard 
          icon={CheckCircle}
          label="Tamamlanan"
          value={completedStops}
          subValue={`/${totalStops}`}
        />
        <StatCard 
          icon={Clock}
          label="Tahmini Bitiş"
          value={estimatedFinishTime}
          subValue=""
        />
      </div>
      
      {stops.length > 0 && (
        <div className='stops-section'>
          <h3 className='section-title'>YAKLAŞAN DURAKLAR</h3>
          
          <div className='stops-list'>
            {stops.map((stop) => (
              <StopCard 
                key={stop.number}
                number={stop.number}
                address={stop.address}
                info={stop.info}
                badges={stop.badges}
                isActive={stop.isActive}
              />
            ))}
          </div>
        </div>
      )}
      
      {stops.length === 0 && (
        <div className='stops-section'>
          <h3 className='section-title'>YAKLAŞAN DURAKLAR</h3>
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            Henüz rota atanmamış
          </div>
        </div>
      )}
      
      <button className='settings-btn'>
        <Settings size={24} />
        <span>Rota Ayarları</span>
        <ChevronRight size={20} />
      </button>
      
      <button className='settings-btn' onClick={handleLogout} style={{ marginTop: '8px', backgroundColor: '#dc2626' }}>
        <LogOut size={24} />
        <span>Çıkış Yap</span>
      </button>
    </div>
  )
}

export default TaskNav