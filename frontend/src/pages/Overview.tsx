import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface StatsData {
  karbon_sosyal_etki: Record<string, string>;
  mahalleler: Array<{
    mahalle: string;
    atik: number;
    konteyner: number;
    oncelik_skoru: number;
  }>;
  mahalleler_konteyner: Array<{
    mahalle: string;
    atik: number;
    konteyner: number;
    oncelik_skoru: number;
  }>;
  toplam_mesafe: number;
  toplam_yakit: number;
  toplam_co2: number;
  toplam_maliyet: number;
  arac_sayisi: number;
  arac_bazli: Record<string, {
    mesafe: number;
    yakit: number;
    co2: number;
    maliyet: number;
  }>;
  arac_tipleri: Record<string, number>;
  toplam_lokasyon: number;
  toplam_nufus: number;
  toplam_konteyner: number;
  toplam_gunluk_atik: number;
  arac_tipine_gore_lokasyon: Record<string, number>;
  yuksek_oncelik_sayisi: number;
  orta_oncelik_sayisi: number;
  dusuk_oncelik_sayisi: number;
  en_yuksek_oncelik_mahalle: {
    mahalle: string;
    oncelik_skoru: number;
  } | null;
  yuksek_risk_lokasyonlar: number;
  orta_risk_lokasyonlar: number;
  dusuk_risk_lokasyonlar: number;
  en_yogun_saat: number | null;
}

const Overview = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/stats`);
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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

  if (error || !stats) {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return '₺' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '₺' + (num / 1000).toFixed(1) + 'K';
    return '₺' + num.toFixed(0);
  };

  // Extract CO2 values
  const gunlukCO2 = parseFloat(stats.karbon_sosyal_etki['Mevcut Gunluk CO2 (kg)'] || '0');
  const aylikCO2 = parseFloat(stats.karbon_sosyal_etki['Mevcut Aylik CO2 (kg)'] || '0');
  const yillikCO2 = parseFloat(stats.karbon_sosyal_etki['Mevcut Yillik CO2 (kg)'] || '0');
  const kurtarilanAgac = parseInt(stats.karbon_sosyal_etki['Kurtarilan Agac Sayisi (yillik)'] || '0');
  const co2Tasarruf = parseFloat(stats.karbon_sosyal_etki['Tasarruf Potansiyeli CO2 (yillik kg)'] || '0');
  const agacKarsiligi = parseInt(stats.karbon_sosyal_etki['Agac Karsiligi (yillik)'] || '0');
  const fidanKarsiligi = parseInt(stats.karbon_sosyal_etki['Fidan Karsiligi (yillik)'] || '0');
  const otomobilKm = parseInt(stats.karbon_sosyal_etki['Otomobil km Karsiligi'] || '0');
  const ucakYolculugu = parseInt(stats.karbon_sosyal_etki['Ucak Yolculugu Karsiligi'] || '0');
  const rolantiYuzdesi = parseFloat(stats.karbon_sosyal_etki['Rolanti Kaynakli CO2 (%)'] || '0');

  // Calculate rolanti cost savings (approximate from total cost)
  const rolantiMaliyetTasarrufu = stats.toplam_maliyet * 0.75; // Approximate 75% from rolanti

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Ana Başlık ve İstatistikler */}
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
          Kontrol Paneli
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '2rem'
        }}>
          Sistem genel bakış ve operasyonel özet
        </p>

        {/* Ana İstatistikler - 2x2 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
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
            }}>{formatNumber(kurtarilanAgac)}</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Ağaç Kurtarıldı (Yıllık)</p>
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
            }}>{(co2Tasarruf / 1000).toFixed(0)}</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Ton CO₂ Tasarrufu (Yıllık)</p>
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
            }}>{formatCurrency(rolantiMaliyetTasarrufu)}</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Rolanti Maliyet Tasarrufu</p>
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
            }}>{rolantiYuzdesi.toFixed(1)}%</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Rolanti Kaynaklı CO₂</p>
          </div>
        </div>
      </div>

      {/* Operasyonel İstatistikler */}
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
          Operasyonel İstatistikler
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #86efac'
          }}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#16a34a',
              marginBottom: '0.5rem'
            }}>{stats.arac_sayisi}</h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#166534',
              fontWeight: '500'
            }}>Toplam Araç</p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#eff6ff',
            borderRadius: '12px',
            border: '1px solid #93c5fd'
          }}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2563eb',
              marginBottom: '0.5rem'
            }}>{stats.toplam_lokasyon}</h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#1e40af',
              fontWeight: '500'
            }}>Toplam Lokasyon</p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#fef3c7',
            borderRadius: '12px',
            border: '1px solid #fde047'
          }}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#d97706',
              marginBottom: '0.5rem'
            }}>{stats.mahalleler.length}</h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#92400e',
              fontWeight: '500'
            }}>Mahalle</p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#f3e8ff',
            borderRadius: '12px',
            border: '1px solid #c4b5fd'
          }}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#9333ea',
              marginBottom: '0.5rem'
            }}>{formatNumber(stats.toplam_nufus)}</h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#6b21a8',
              fontWeight: '500'
            }}>Toplam Nüfus</p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#fce7f3',
            borderRadius: '12px',
            border: '1px solid #f9a8d4'
          }}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#db2777',
              marginBottom: '0.5rem'
            }}>{stats.toplam_gunluk_atik.toFixed(0)}</h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#9f1239',
              fontWeight: '500'
            }}>Günlük Atık (Ton)</p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#ecfdf5',
            borderRadius: '12px',
            border: '1px solid #6ee7b7'
          }}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#059669',
              marginBottom: '0.5rem'
            }}>{formatCurrency(stats.toplam_maliyet)}</h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#047857',
              fontWeight: '500'
            }}>Toplam Maliyet</p>
          </div>
        </div>
      </div>

      {/* Tüm Mahalleler - Atık Sıralaması */}
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
          Tüm Mahalleler - Günlük Atık Üretimi (Ton)
        </h2>
        <div style={{
          maxHeight: '600px',
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            {stats.mahalleler.map((item, index) => (
              <div key={index} style={{
                padding: '1rem',
                background: index < 3 ? (index === 0 ? '#fee2e2' : index === 1 ? '#fef3c7' : '#f0fdf4') : '#f9fafb',
                borderRadius: '8px',
                border: `1px solid ${index < 3 ? (index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#10b981') : '#d1d5db'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: index < 3 ? '#374151' : '#6b7280' }}>
                    {index + 1}. {item.mahalle}
                  </div>
                </div>
                <strong style={{ fontSize: '1rem', color: index < 3 ? (index === 0 ? '#dc2626' : index === 1 ? '#d97706' : '#059669') : '#6b7280' }}>
                  {item.atik.toFixed(2)} ton
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tüm Mahalleler - Konteyner Sıralaması */}
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
          Tüm Mahalleler - Konteyner Sayısı
        </h2>
        <div style={{
          maxHeight: '600px',
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            {stats.mahalleler_konteyner.map((item, index) => (
              <div key={index} style={{
                padding: '1rem',
                background: index < 3 ? (index === 0 ? '#eff6ff' : index === 1 ? '#f0fdf4' : '#fef3c7') : '#f9fafb',
                borderRadius: '8px',
                border: `1px solid ${index < 3 ? (index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b') : '#d1d5db'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: index < 3 ? '#374151' : '#6b7280' }}>
                    {index + 1}. {item.mahalle}
                  </div>
                </div>
                <strong style={{ fontSize: '1rem', color: index < 3 ? (index === 0 ? '#2563eb' : index === 1 ? '#059669' : '#d97706') : '#6b7280' }}>
                  {item.konteyner.toLocaleString()} konteyner
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Öncelik Skorlarına Göre Mahalle Dağılımı */}
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
          Öncelik Skorlarına Göre Mahalle Dağılımı
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: '#fee2e2',
            borderRadius: '12px',
            border: '2px solid #ef4444'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem', fontWeight: '500' }}>Yüksek Öncelik (70+)</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>{stats.yuksek_oncelik_sayisi}</div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: '#fef3c7',
            borderRadius: '12px',
            border: '2px solid #f59e0b'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '500' }}>Orta Öncelik (40-70)</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d97706' }}>{stats.orta_oncelik_sayisi}</div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: '#ecfdf5',
            borderRadius: '12px',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#047857', marginBottom: '0.5rem', fontWeight: '500' }}>Düşük Öncelik (&lt;40)</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>{stats.dusuk_oncelik_sayisi}</div>
          </div>
        </div>

        {stats.en_yuksek_oncelik_mahalle && (
          <div style={{
            padding: '1.5rem',
            background: '#fef2f2',
            borderRadius: '12px',
            border: '2px solid #ef4444'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.75rem' }}>
              En Yüksek Öncelikli Mahalle
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.25rem' }}>
              {stats.en_yuksek_oncelik_mahalle.mahalle}
            </div>
            <div style={{ fontSize: '1rem', color: '#991b1b' }}>
              Öncelik Skoru: <strong>{stats.en_yuksek_oncelik_mahalle.oncelik_skoru.toFixed(1)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Sistem Durumu ve Araç Detayları - Devam edecek... */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Araç Tipleri */}
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
            Araç Tipleri ve Lokasyon Dağılımı
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(stats.arac_tipleri).map(([tip, sayi], index) => {
              const colors = [
                { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', value: '#2563eb' },
                { bg: '#f0fdf4', border: '#10b981', text: '#166534', value: '#16a34a' },
                { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', value: '#d97706' },
                { bg: '#f3e8ff', border: '#9333ea', text: '#6b21a8', value: '#9333ea' }
              ];
              const color = colors[index % colors.length];
              return (
                <div key={tip} style={{
                  padding: '1.25rem',
                  background: color.bg,
                  borderRadius: '10px',
                  border: `2px solid ${color.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: color.text }}>
                      {tip === 'Crane Vehicle' ? 'Vinçli Araç' : tip === 'Large Garbage Truck' ? 'Büyük Çöp Kamyonu' : tip === 'Small Garbage Truck' ? 'Küçük Çöp Kamyonu' : tip}
                    </div>
                    {stats.arac_tipine_gore_lokasyon[tip] && (
                      <div style={{ fontSize: '0.875rem', color: color.value }}>
                        {stats.arac_tipine_gore_lokasyon[tip]} Lokasyon
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: color.value }}>{sayi}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Araç Bazlı Performans */}
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
            Araç Bazlı Performans Analizi
          </h2>
          
          {Object.entries(stats.arac_bazli).map(([tip, data], index) => {
            const colorSchemes = [
              { bg: '#f0fdf4', border: '#10b981', text: '#166534', value: '#059669' },
              { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', value: '#2563eb' },
              { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', value: '#d97706' }
            ];
            const colors = colorSchemes[index % colorSchemes.length];
            const tipName = tip === 'Crane Vehicle' ? 'Vinçli Araç' : tip === 'Large Garbage Truck' ? 'Büyük Çöp Kamyonu' : 'Küçük Çöp Kamyonu';
            
            return (
              <div key={tip} style={{ marginBottom: index < Object.keys(stats.arac_bazli).length - 1 ? '1.5rem' : '0' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.75rem' }}>{tipName}</div>
                <div style={{ padding: '1rem', background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: colors.text }}>Mesafe:</span>
                    <strong style={{ color: colors.value }}>{data.mesafe.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} km</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: colors.text }}>Maliyet:</span>
                    <strong style={{ color: colors.value }}>{formatCurrency(data.maliyet)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: colors.text }}>CO₂:</span>
                    <strong style={{ color: colors.value }}>{data.co2.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} kg</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diğer Bölümler - CO2, Doluluk Riski, vb. */}
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
          Mevcut CO₂ Emisyonları
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: '#fef2f2',
            borderRadius: '12px',
            border: '2px solid #ef4444',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem', fontWeight: '500' }}>Günlük</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>{gunlukCO2.toLocaleString('tr-TR')} kg</div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: '#fff7ed',
            borderRadius: '12px',
            border: '2px solid #f97316',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#9a3412', marginBottom: '0.5rem', fontWeight: '500' }}>Aylık</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ea580c' }}>{aylikCO2.toLocaleString('tr-TR')} kg</div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: '#fef3c7',
            borderRadius: '12px',
            border: '2px solid #eab308',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#854d0e', marginBottom: '0.5rem', fontWeight: '500' }}>Yıllık</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ca8a04' }}>{(yillikCO2 / 1000000).toFixed(1)}M kg</div>
          </div>
        </div>
      </div>

      {/* Doluluk Riski ve Rolanti */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
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
            Konteyner Doluluk Riski Analizi
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: '#fee2e2',
              borderRadius: '12px',
              border: '2px solid #ef4444',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem', fontWeight: '500' }}>Yüksek Risk (≥50%)</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>{stats.yuksek_risk_lokasyonlar}</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: '#fef3c7',
              borderRadius: '12px',
              border: '2px solid #f59e0b',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '500' }}>Orta Risk (10-50%)</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d97706' }}>{stats.orta_risk_lokasyonlar}</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: '#ecfdf5',
              borderRadius: '12px',
              border: '2px solid #10b981',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#047857', marginBottom: '0.5rem', fontWeight: '500' }}>Düşük Risk (&lt;10%)</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>{stats.dusuk_risk_lokasyonlar}</div>
            </div>
          </div>
        </div>

        {stats.en_yogun_saat !== null && (
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
              Rolanti Analizi
            </h2>
            <div style={{
              padding: '1.5rem',
              background: '#f3e8ff',
              borderRadius: '12px',
              border: '2px solid #9333ea',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b21a8', marginBottom: '0.5rem', fontWeight: '500' }}>En Yoğun Saat</div>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#9333ea', marginBottom: '0.5rem' }}>
                {stats.en_yogun_saat.toString().padStart(2, '0')}:00
              </div>
              <div style={{ fontSize: '0.875rem', color: '#7c3aed' }}>Sabah En Yoğun Rolanti Saati</div>
            </div>
          </div>
        )}
      </div>

      {/* Ek Çevresel Etkiler */}
      <div style={{
        background: 'linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)',
        borderRadius: '16px',
        padding: '2.5rem',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#ffffff'
        }}>
          Ek Çevresel Etkiler
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem' }}>
              {agacKarsiligi.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>Ağaç Karşılığı (Yıllık)</div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem' }}>
              {fidanKarsiligi.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>Fidan Karşılığı (Yıllık)</div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
              {(otomobilKm / 1000000).toFixed(1)}M km
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>Otomobil Km Karşılığı</div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {ucakYolculugu.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>Uçak Yolculuğu Karşılığı</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
