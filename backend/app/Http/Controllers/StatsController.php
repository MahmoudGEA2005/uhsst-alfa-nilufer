<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class StatsController extends Controller
{
    /**
     * Get all statistics from CSV files
     */
    public function getStats()
    {
        $basePath = base_path('../data');
        
        $stats = [];
        
        try {
            // 1. Karbon Sosyal Etki
            $karbonSosyalEtki = $this->parseCSV($basePath . '/06_karbon_sosyal_etki.csv');
            $stats['karbon_sosyal_etki'] = [];
            foreach ($karbonSosyalEtki as $row) {
                $metrik = $row['Metrik'] ?? '';
                $deger = $row['Deger'] ?? '';
                // Remove quotes and commas from numbers
                $deger = str_replace(['"', ','], '', $deger);
                $stats['karbon_sosyal_etki'][$metrik] = $deger;
            }
            
            // 2. Mahalle Öncelik Matrisi - All mahalles
            $mahalleOncelik = $this->parseCSV($basePath . '/01_mahalle_oncelik_matrisi.csv');
            $mahallelerUnsorted = [];
            foreach ($mahalleOncelik as $row) {
                if (empty($row['Mahalle_Adi'])) continue;
                $mahallelerUnsorted[] = [
                    'mahalle' => $row['Mahalle_Adi'],
                    'atik' => floatval($row['Gunluk_Tahmini_Atik_Ton'] ?? 0),
                    'konteyner' => intval($row['Toplam_Konteyner'] ?? 0),
                    'oncelik_skoru' => floatval($row['Oncelik_Skoru'] ?? 0),
                ];
            }
            
            // Sort by atik descending
            $stats['mahalleler'] = $mahallelerUnsorted;
            usort($stats['mahalleler'], function($a, $b) {
                return $b['atik'] <=> $a['atik'];
            });
            
            // Sort by konteyner descending for konteyner list (copy array first)
            $stats['mahalleler_konteyner'] = [];
            foreach ($mahallelerUnsorted as $mahalle) {
                $stats['mahalleler_konteyner'][] = $mahalle;
            }
            usort($stats['mahalleler_konteyner'], function($a, $b) {
                return $b['konteyner'] <=> $a['konteyner'];
            });
            
            // 3. Karbon Maliyet Analizi
            $karbonMaliyet = $this->parseCSV($basePath . '/04_karbon_maliyet_analizi.csv');
            $stats['toplam_mesafe'] = 0;
            $stats['toplam_yakit'] = 0;
            $stats['toplam_co2'] = 0;
            $stats['toplam_maliyet'] = 0;
            $stats['arac_sayisi'] = 0;
            $stats['arac_bazli'] = [];
            
            foreach ($karbonMaliyet as $row) {
                $aracTipi = $row['Arac_Tipi'] ?? '';
                if (empty($aracTipi)) continue;
                
                $mesafe = floatval($row['Toplam_Mesafe_km'] ?? 0);
                $yakit = floatval($row['Toplam_Yakit_Litre'] ?? 0);
                $co2 = floatval($row['Toplam_CO2_kg'] ?? 0);
                $maliyet = floatval($row['Toplam_Maliyet_TL'] ?? 0);
                
                $stats['toplam_mesafe'] += $mesafe;
                $stats['toplam_yakit'] += $yakit;
                $stats['toplam_co2'] += $co2;
                $stats['toplam_maliyet'] += $maliyet;
                $stats['arac_sayisi']++;
                
                if (!isset($stats['arac_bazli'][$aracTipi])) {
                    $stats['arac_bazli'][$aracTipi] = [
                        'mesafe' => 0,
                        'yakit' => 0,
                        'co2' => 0,
                        'maliyet' => 0,
                    ];
                }
                $stats['arac_bazli'][$aracTipi]['mesafe'] += $mesafe;
                $stats['arac_bazli'][$aracTipi]['yakit'] += $yakit;
                $stats['arac_bazli'][$aracTipi]['co2'] += $co2;
                $stats['arac_bazli'][$aracTipi]['maliyet'] += $maliyet;
            }
            
            // 4. Araç Yakıt Standartları
            $aracYakit = $this->parseCSV($basePath . '/09_arac_yakit_standartlari.csv');
            $stats['arac_tipleri'] = [];
            foreach ($aracYakit as $row) {
                $aracTipi = $row['Arac_Tipi'] ?? '';
                if (empty($aracTipi)) continue;
                $stats['arac_tipleri'][$aracTipi] = intval($row['Arac_Sayisi'] ?? 0);
            }
            
            // 5. Master Data
            $masterData = $this->parseCSV($basePath . '/Master_Optimization_Data.csv');
            $stats['toplam_lokasyon'] = count($masterData);
            $stats['toplam_nufus'] = 0;
            $stats['toplam_konteyner'] = 0;
            $stats['toplam_gunluk_atik'] = 0;
            $stats['arac_tipine_gore_lokasyon'] = [];
            
            foreach ($masterData as $row) {
                $stats['toplam_nufus'] += intval($row['Population'] ?? 0);
                $stats['toplam_konteyner'] += intval($row['ContainerCount'] ?? 0);
                $stats['toplam_gunluk_atik'] += floatval($row['DailyWaste_Ton'] ?? 0);
                
                $aracTipi = $row['RequiredVehicleType'] ?? 'Standard';
                if (!isset($stats['arac_tipine_gore_lokasyon'][$aracTipi])) {
                    $stats['arac_tipine_gore_lokasyon'][$aracTipi] = 0;
                }
                $stats['arac_tipine_gore_lokasyon'][$aracTipi]++;
            }
            
            // 6. Öncelik skorları analizi (use unsorted list)
            $stats['yuksek_oncelik_sayisi'] = 0;
            $stats['orta_oncelik_sayisi'] = 0;
            $stats['dusuk_oncelik_sayisi'] = 0;
            $stats['en_yuksek_oncelik_mahalle'] = null;
            $maxSkor = 0;
            
            foreach ($mahallelerUnsorted as $mahalle) {
                $skor = $mahalle['oncelik_skoru'];
                if ($skor >= 70) {
                    $stats['yuksek_oncelik_sayisi']++;
                } elseif ($skor >= 40) {
                    $stats['orta_oncelik_sayisi']++;
                } else {
                    $stats['dusuk_oncelik_sayisi']++;
                }
                
                if ($skor > $maxSkor) {
                    $maxSkor = $skor;
                    $stats['en_yuksek_oncelik_mahalle'] = [
                        'mahalle' => $mahalle['mahalle'],
                        'oncelik_skoru' => $skor
                    ];
                }
            }
            
            // 7. Doluluk Riski
            $doluluk = $this->parseCSV($basePath . '/07_konteyner_doluluk_tahmini.csv');
            $stats['yuksek_risk_lokasyonlar'] = 0;
            $stats['orta_risk_lokasyonlar'] = 0;
            $stats['dusuk_risk_lokasyonlar'] = 0;
            
            foreach ($doluluk as $row) {
                $risk = floatval($row['Doluluk_Riski'] ?? 0);
                if ($risk >= 50) {
                    $stats['yuksek_risk_lokasyonlar']++;
                } elseif ($risk >= 10) {
                    $stats['orta_risk_lokasyonlar']++;
                } else {
                    $stats['dusuk_risk_lokasyonlar']++;
                }
            }
            
            // 8. Rolanti Analizi
            $rolanti = $this->parseCSV($basePath . '/08_saatlik_rolanti_analizi.csv');
            $stats['en_yogun_saat'] = null;
            $maxDuraklama = 0;
            foreach ($rolanti as $row) {
                $duraklama = intval($row['Toplam_Duraklama_Saniye'] ?? 0);
                if ($duraklama > $maxDuraklama) {
                    $maxDuraklama = $duraklama;
                    $stats['en_yogun_saat'] = intval($row['Saat'] ?? 0);
                }
            }
            
            return response()->json($stats);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Veriler yüklenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Parse CSV file and return array of rows
     */
    private function parseCSV($filePath)
    {
        if (!file_exists($filePath)) {
            return [];
        }
        
        $rows = [];
        $handle = fopen($filePath, 'r');
        
        if ($handle === false) {
            return [];
        }
        
        // Read BOM if exists
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }
        
        // Read header
        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);
            return [];
        }
        
        // Clean headers (remove BOM)
        $headers = array_map(function($header) {
            return trim(str_replace("\xEF\xBB\xBF", '', $header));
        }, $headers);
        
        // Read rows
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) !== count($headers)) {
                continue;
            }
            $rows[] = array_combine($headers, $row);
        }
        
        fclose($handle);
        return $rows;
    }
}

