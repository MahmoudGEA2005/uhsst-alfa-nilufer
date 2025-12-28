import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Calendar, CheckCircle, XCircle, Users, MapPin } from 'lucide-react';
import './Routes.css';

interface RouteLog {
  id: number;
  generation_date: string;
  generated_at: string;
  admin_id: number | null;
  drivers_count: number;
  locations_count: number;
  status: string;
  created_at: string;
}

const Routes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<RouteLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/routes/logs`);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/routes/generate`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Response from API:', response.data);
      console.log('Drivers:', response.data.data.drivers);
      console.log('Locations:', response.data.data.locations);
      console.log('Drivers Count:', response.data.drivers_count);
      console.log('Locations Count:', response.data.locations_count);

      alert(`Data prepared successfully!\nDrivers: ${response.data.drivers_count}\nLocations: ${response.data.locations_count}\nCheck console for details.`);
      
      // Refresh logs after successful generation
      fetchLogs();
    } catch (error: any) {
      console.error('Error generating routes:', error);
      if (error.response) {
        setError(error.response.data.error || error.response.data.message || 'Error generating routes');
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="routes-page">
      <div className="routes-container">
        <h1>Rota Oluşturma</h1>
        <p className="routes-description">
          Tüm sürücüleri ve konumları alarak rota oluşturma API'sine gönderin.
        </p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <Play size={20} />
          {isGenerating ? 'Oluşturuluyor...' : 'Rota Oluştur'}
        </button>

        <div className="info-box">
          <h3>Nasıl Çalışır?</h3>
          <ul>
            <li>Tüm sürücü verilerini toplar</li>
            <li>Tüm konum verilerini toplar</li>
            <li>Verileri hazırlar ve API'ye gönderir</li>
            <li>Sonucu konsola yazdırır (şimdilik)</li>
            <li>Her gün sadece bir kez rota oluşturulabilir</li>
          </ul>
        </div>

        <div className="logs-section">
          <h2>Rota Oluşturma Geçmişi</h2>
          
          {loadingLogs ? (
            <p className="loading-text">Geçmiş yükleniyor...</p>
          ) : logs.length === 0 ? (
            <div className="no-logs">
              <Calendar size={48} />
              <p>Henüz rota oluşturulmamış</p>
            </div>
          ) : (
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Saat</th>
                    <th>Sürücüler</th>
                    <th>Konumlar</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="log-date">
                          <Calendar size={16} />
                          {formatDate(log.generation_date)}
                        </div>
                      </td>
                      <td>{formatTime(log.generated_at)}</td>
                      <td>
                        <div className="log-count">
                          <Users size={16} />
                          {log.drivers_count}
                        </div>
                      </td>
                      <td>
                        <div className="log-count">
                          <MapPin size={16} />
                          {log.locations_count}
                        </div>
                      </td>
                      <td>
                        <div className={`log-status ${log.status}`}>
                          {log.status === 'success' ? (
                            <>
                              <CheckCircle size={16} />
                              <span>Başarılı</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              <span>Başarısız</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Routes;

