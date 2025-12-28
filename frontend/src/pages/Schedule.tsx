import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ScheduleData {
  frekanslar: Record<string, Array<{
    mahalle: string;
    arac_tipi: string;
  }>>;
  arac_tipleri: Record<string, number>;
  gunluk_toplama_noktasi: number;
}

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Pazartesi');

  const daysOfWeek = [
    { key: 'Pazartesi', label: 'Pazartesi', short: 'Pzt' },
    { key: 'Salı', label: 'Salı', short: 'Sal' },
    { key: 'Çarşamba', label: 'Çarşamba', short: 'Çar' },
    { key: 'Perşembe', label: 'Perşembe', short: 'Per' },
    { key: 'Cuma', label: 'Cuma', short: 'Cum' },
    { key: 'Cumartesi', label: 'Cumartesi', short: 'Cmt' },
    { key: 'Pazar', label: 'Pazar', short: 'Paz' }
  ];

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        // For now, use mock data - we can create a backend endpoint later
        const mockData: ScheduleData = {
          frekanslar: {
            '3': [
              { mahalle: 'KONAK MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'İHSANİYE MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'BALAT MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'BALKAN MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'ÇALI MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'ATAEVLER MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
            ],
            '6': [
              { mahalle: 'FETHİYE MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'KONAK MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'İHSANİYE MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
            ],
            '7': [
              { mahalle: 'DUMLUPINAR MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
              { mahalle: 'GÖRÜKLE MAHALLESİ', arac_tipi: 'Large Garbage Truck' },
            ]
          },
          arac_tipleri: {
            'Large Garbage Truck': 21,
            'Crane Vehicle': 20,
            'Small Garbage Truck': 4
          },
          gunluk_toplama_noktasi: 65
        };
        setScheduleData(mockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Program verileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '1rem' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !scheduleData) {
    return (
      <div style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Hata</div>
          <div>{error || 'Veriler yüklenemedi'}</div>
        </div>
      </div>
    );
  }

  // Calculate which mahalles are collected on which days based on frequency
  const getDaySchedule = (dayKey: string) => {
    const dayIndex = daysOfWeek.findIndex(d => d.key === dayKey);
    const allMahalles: Array<{ mahalle: string; arac_tipi: string; frekans: number }> = [];
    
    Object.entries(scheduleData.frekanslar).forEach(([frekans, mahalleler]) => {
      const freq = parseInt(frekans);
      mahalleler.forEach(m => {
        allMahalles.push({ ...m, frekans: freq });
      });
    });

    // Filter mahalles based on frequency and day
    return allMahalles.filter(item => {
      if (item.frekans === 7) return true; // Collected every day
      if (item.frekans === 6) return dayIndex < 6; // Collected Monday-Saturday
      if (item.frekans === 3) {
        // Collected 3 times per week - typically Mon, Wed, Fri
        return dayIndex % 2 === 0 && dayIndex < 6;
      }
      return false;
    });
  };

  const daySchedule = getDaySchedule(selectedDay);
  const totalForDay = daySchedule.length;

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Ana Başlık */}
      <div style={{
        background: 'linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)',
        borderRadius: '16px',
        padding: '3rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: '#ffffff'
        }}>
          Haftalık Toplama Programı
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '2rem'
        }}>
          Günlük toplama rotaları ve zamanlaması
        </p>

        {/* Günlük İstatistikler */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#10b981'
            }}>{totalForDay}</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Günlük Toplama Noktası</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#3b82f6'
            }}>45</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Aktif Araç</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#f59e0b'
            }}>8</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Ortalama Süre (Saat)</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#8b5cf6'
            }}>98%</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Tamamlanma Oranı</p>
          </div>
        </div>
      </div>

      {/* Haftalık Takvim */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#1a3d2e'
        }}>
          Haftalık Program
        </h2>
        
        {/* Gün Seçimi */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          {daysOfWeek.map((day) => {
            const isSelected = selectedDay === day.key;
            const dayScheduleCount = getDaySchedule(day.key).length;
            
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                style={{
                  padding: '1.5rem 1rem',
                  background: isSelected ? '#1a3d2e' : '#f3f4f6',
                  color: isSelected ? 'white' : '#374151',
                  border: isSelected ? '2px solid #10b981' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: isSelected ? '600' : '500',
                  fontSize: '0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
              >
                <div>{day.label}</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: isSelected ? '#10b981' : '#6b7280'
                }}>
                  {dayScheduleCount}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  opacity: 0.8
                }}>Nokta</div>
              </button>
            );
          })}
        </div>

        {/* Seçilen Günün Detayları */}
        <div style={{
          padding: '2rem',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#1a3d2e'
          }}>
            {selectedDay} Günü Toplama Programı ({totalForDay} Nokta)
          </h3>

          <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {daySchedule.map((item, index) => {
              const aracTipiColors: Record<string, { bg: string; border: string; text: string }> = {
                'Large Garbage Truck': { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
                'Crane Vehicle': { bg: '#f0fdf4', border: '#10b981', text: '#166534' },
                'Small Garbage Truck': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }
              };
              
              const colors = aracTipiColors[item.arac_tipi] || { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
              const aracTipiLabel = item.arac_tipi === 'Large Garbage Truck' ? 'Büyük Çöp Kamyonu' : 
                                   item.arac_tipi === 'Crane Vehicle' ? 'Vinçli Araç' : 
                                   item.arac_tipi === 'Small Garbage Truck' ? 'Küçük Çöp Kamyonu' : item.arac_tipi;

              return (
                <div
                  key={index}
                  style={{
                    padding: '1.25rem',
                    background: colors.bg,
                    borderRadius: '10px',
                    border: `2px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: colors.text, marginBottom: '0.25rem' }}>
                      {item.mahalle}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {aracTipiLabel} • Haftada {item.frekans} kez
                    </div>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: colors.border,
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Frekans Dağılımı */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#1a3d2e'
        }}>
          Haftalık Toplama Frekansları
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {Object.entries(scheduleData.frekanslar).map(([frekans, mahalleler]) => (
            <div key={frekans} style={{
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a3d2e' }}>
                  Haftada {frekans} Kez
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  {mahalleler.length}
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                {mahalleler.length} mahalle
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Araç Tipi Program */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#1a3d2e'
        }}>
          Araç Tipine Göre Program
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {Object.entries(scheduleData.arac_tipleri).map(([tip, sayi], index) => {
            const colors = [
              { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
              { bg: '#f0fdf4', border: '#10b981', text: '#166534' },
              { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }
            ];
            const color = colors[index % colors.length];
            const tipLabel = tip === 'Large Garbage Truck' ? 'Büyük Çöp Kamyonu' :
                            tip === 'Crane Vehicle' ? 'Vinçli Araç' :
                            tip === 'Small Garbage Truck' ? 'Küçük Çöp Kamyonu' : tip;

            return (
              <div key={tip} style={{
                padding: '1.5rem',
                background: color.bg,
                borderRadius: '12px',
                border: `2px solid ${color.border}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: color.text, marginBottom: '0.75rem' }}>
                  {tipLabel}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: color.border }}>
                  {sayi}
                </div>
                <div style={{ fontSize: '0.875rem', color: color.text, marginTop: '0.5rem' }}>
                  Araç
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
