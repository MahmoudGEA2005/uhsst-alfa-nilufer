import React, { useState } from 'react';
import axios from 'axios';
import { Play } from 'lucide-react';
import './Routes.css';

const Routes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/routes/generate`,
        {},
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

      // You can also display a success message or update UI
      alert(`Data prepared successfully!\nDrivers: ${response.data.drivers_count}\nLocations: ${response.data.locations_count}\nCheck console for details.`);
    } catch (error: any) {
      console.error('Error generating routes:', error);
      if (error.response) {
        setError(error.response.data.message || 'Error generating routes');
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setIsGenerating(false);
    }
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
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Routes;

