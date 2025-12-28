import pandas as pd
import numpy as np
import math
import json
import ast
import zipfile
import io
import os
import logging
from datetime import datetime

# ==================== SABİTLER ====================
ZIP_FILE_PATH = r"C:\Yazilim\06_karbon_sosyal_etki.zip"
FLEET_ZIP_PATH = r"C:\Users\Hüseyin\Downloads\NB_hackathon_2025-main.zip"
DEPOT_COORDS = [40.1826, 29.0665]
OUTPUT_JSON_FILE = "nilufer_smart_route_final.json"
LOG_FILE = "fleet_routes.log"

# Loglama: Sadece dosyaya (konsola değil)
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[logging.FileHandler(LOG_FILE, encoding='utf-8', mode='w')],
    force=True
)
logger = logging.getLogger(__name__)

# ==================== YARDIMCI FONKSİYONLAR ====================

def haversine(c1, c2):
    """
    Haversine formülü ile iki koordinat arası mesafe hesaplama (km)
    
    Args:
        c1: [lat, lng] formatında ilk koordinat
        c2: [lat, lng] formatında ikinci koordinat
    
    Returns:
        Mesafe (km) veya 0 (hata durumunda)
    """
    if not c1 or not c2:
        return 0
    try:
        lat1, lon1 = math.radians(c1[0]), math.radians(c1[1])
        lat2, lon2 = math.radians(c2[0]), math.radians(c2[1])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        return 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    except Exception as e:
        logger.error(f"Haversine hesaplama hatası: {e}")
        return 0

def veri_yukle():
    """
    Master CSV dosyasını ZIP'ten yükler ve koordinatları parse eder
    
    Returns:
        DataFrame veya None (hata durumunda)
    """
    logger.info("="*80)
    logger.info("VERI YUKLEME BASLATILDI")
    logger.info(f"ZIP Dosyasi: {ZIP_FILE_PATH}")
    
    if not os.path.exists(ZIP_FILE_PATH):
        logger.error(f"ZIP dosyasi bulunamadi: {ZIP_FILE_PATH}")
        return None
    
    try:
        with zipfile.ZipFile(ZIP_FILE_PATH, 'r') as z:
            # Master CSV dosyasını bul
            csv_files = [f for f in z.namelist() if f.endswith('.csv')]
            target = next((f for f in csv_files if 'master' in f.lower()), None)
            
            if not target:
                logger.warning("Master CSV bulunamadi, ilk CSV kullaniliyor")
                target = csv_files[0] if csv_files else None
            
            if not target:
                logger.error("ZIP dosyasinda CSV bulunamadi")
                return None
            
            # CSV'yi bellekte oku
            df = pd.read_csv(io.BytesIO(z.read(target)), encoding='utf-8', on_bad_lines='skip')
            logger.info(f"CSV yuklendi: {target} ({len(df)} satir)")
            
            # ============ KOORDINAT PARSE ============
            if 'ParsedCoords' not in df.columns:
                if 'Coordinates' in df.columns:
                    def parse_coord(x):
                        """Coordinates sütununu parse et"""
                        try:
                            if pd.isna(x):
                                return None
                            if isinstance(x, str):
                                # String formatı: "[40.12, 29.34]"
                                coord = ast.literal_eval(x)
                                if isinstance(coord, (list, tuple)) and len(coord) >= 2:
                                    lat, lng = float(coord[0]), float(coord[1])
                                    # Bursa koordinat kontrolü
                                    if 39.5 <= lat <= 40.5 and 28.5 <= lng <= 29.5:
                                        return [lat, lng]
                        except Exception as e:
                            logger.debug(f"Koordinat parse hatasi: {e}")
                        return None
                    
                    df['ParsedCoords'] = df['Coordinates'].apply(parse_coord)
                    logger.info(f"Coordinates sütunundan parse edildi: {df['ParsedCoords'].notna().sum()}/{len(df)}")
                
                elif 'Latitude' in df.columns and 'Longitude' in df.columns:
                    df['ParsedCoords'] = df.apply(
                        lambda row: [row['Latitude'], row['Longitude']] 
                        if pd.notna(row['Latitude']) and 39.5 <= row['Latitude'] <= 40.5 
                        else None, 
                        axis=1
                    )
                    logger.info(f"Latitude/Longitude sütunlarından parse edildi: {df['ParsedCoords'].notna().sum()}/{len(df)}")
                else:
                    logger.error("Koordinat sütunu bulunamadi (Coordinates, Latitude/Longitude)")
                    return None
            
            # Geçersiz koordinatları filtrele
            onceki_sayi = len(df)
            df = df.dropna(subset=['ParsedCoords']).copy()
            logger.info(f"Koordinat filtresi: {onceki_sayi} -> {len(df)} satir")
            
            if len(df) == 0:
                logger.error("Gecerli koordinat yok!")
                return None
            
            # ============ COP_KG HESAPLAMA ============
            if 'Cop_kg' not in df.columns:
                if 'DailyWaste_Ton' in df.columns:
                    df['Cop_kg'] = (df['DailyWaste_Ton'] * 1000).astype(int)
                    logger.info("Cop_kg: DailyWaste_Ton * 1000")
                elif 'ContainerCount' in df.columns:
                    df['Cop_kg'] = (df['ContainerCount'] * 180).astype(int)
                    logger.info("Cop_kg: ContainerCount * 180")
                else:
                    df['Cop_kg'] = np.random.randint(200, 800, size=len(df))
                    logger.warning("Cop_kg: Rastgele degerler atandi")
            
            # ============ MAHALLE ADI ============
            mahalle_cols = ['Mahalle_Adi', 'Mahalle_Key', 'LocationID', 'Mahalle']
            mahalle_col = next((col for col in mahalle_cols if col in df.columns), None)
            if mahalle_col:
                df['Mahalle_Adi'] = df[mahalle_col]
            else:
                df['Mahalle_Adi'] = 'Bilinmeyen'
                logger.warning("Mahalle sütunu bulunamadi, varsayilan kullanildi")
            
            # ============ ARAÇ TİPİ ============
            if 'underground_count' in df.columns:
                df['Gereken_Arac'] = df['underground_count'].apply(
                    lambda x: 'VINCLI' if pd.notna(x) and float(x) > 0 else 'STANDARD'
                )
                logger.info("Gereken_Arac: underground_count'dan hesaplandi")
            elif 'RequiredVehicleType' in df.columns:
                df['Gereken_Arac'] = df['RequiredVehicleType'].apply(
                    lambda x: 'VINCLI' if 'Crane' in str(x) or 'Vinc' in str(x) else 'STANDARD'
                )
                logger.info("Gereken_Arac: RequiredVehicleType'dan hesaplandi")
            else:
                # %15 vinçli, %85 standart (gerçekçi dağılım)
                df['Gereken_Arac'] = np.random.choice(['VINCLI', 'STANDARD'], size=len(df), p=[0.15, 0.85])
                logger.warning("Gereken_Arac: Rastgele dagilim kullanildi")
            
            logger.info(f"Veri hazir: {df['Gereken_Arac'].value_counts().to_dict()}")
            logger.info(f"Cop_kg: {df['Cop_kg'].min()}-{df['Cop_kg'].max()} kg (ort: {df['Cop_kg'].mean():.0f})")
            logger.info("VERI YUKLEME TAMAMLANDI")
            
            return df
            
    except Exception as e:
        logger.error(f"Veri yukleme hatasi: {e}", exc_info=True)
        return None

def fleet_yukle():
    """
    Fleet CSV dosyasını ZIP'ten yükler veya varsayılan filo oluşturur
    
    Returns:
        List[dict]: Araç listesi [{'id': int, 'type': str, 'name': str}, ...]
    """
    logger.info("="*80)
    logger.info("FLEET YUKLEME BASLATILDI")
    
    # Fleet ZIP'ten dene
    for path in [FLEET_ZIP_PATH, ZIP_FILE_PATH]:
        if not os.path.exists(path):
            logger.debug(f"Fleet ZIP bulunamadi: {path}")
            continue
        
        try:
            with zipfile.ZipFile(path, 'r') as z:
                # Fleet CSV dosyasını bul
                target = next((f for f in z.namelist() if 'fleet.csv' in f.lower() and f.endswith('.csv')), None)
                
                if not target:
                    logger.debug(f"Fleet CSV bulunamadi: {path}")
                    continue
                
                # CSV'yi bellekte oku
                df = pd.read_csv(io.BytesIO(z.read(target)), encoding='utf-8', on_bad_lines='skip')
                logger.info(f"Fleet CSV yuklendi: {target} ({len(df)} satir)")
                
                filo = []
                for idx, row in df.iterrows():
                    if len(filo) >= 15:  # Maksimum 15 araç
                        break
                    
                    # Farklı sütun adlarını dene
                    name = str(row.get('vehicle_name', row.get('Vehicle_Name', row.get('name', f'Arac-{len(filo)+1}'))))
                    vtype_str = str(row.get('vehicle_type', row.get('Vehicle_Type', row.get('type', 'Standard')))).upper()
                    vtype = 'Crane' if any(x in vtype_str for x in ['CRANE', 'VINC', 'VINCLI']) else 'Standard'
                    
                    filo.append({
                        'id': len(filo) + 1,
                        'type': vtype,
                        'name': name
                    })
                
                logger.info(f"Fleet CSV'den {len(filo)} arac yuklendi")
                logger.info("FLEET YUKLEME TAMAMLANDI")
                return filo
                
        except Exception as e:
            logger.warning(f"Fleet yukleme hatasi ({path}): {e}")
            continue
    
    # Varsayılan filo (15 araç: 3 Vinçli, 12 Standart)
    logger.warning("Fleet bulunamadi, varsayilan 15 arac olusturuluyor")
    filo = []
    for i in range(1, 16):
        vtype = 'Crane' if i <= 3 else 'Standard'
        filo.append({
            'id': i,
            'type': vtype,
            'name': f'{vtype}-{i}'
        })
    logger.info(f"Varsayilan filo olusturuldu: {len(filo)} arac")
    logger.info("FLEET YUKLEME TAMAMLANDI")
    return filo

# ==================== ANA ROTA ALGORİTMASI ====================

def rota_olustur():
    """
    Ana optimizasyon fonksiyonu - Round-Robin algoritması ile rota planlama
    """
    # Başlık (sadece konsola)
    print("\n" + "="*80)
    print("NILUFER BELEDIYESI - AKILLI ROTA OPTIMIZASYONU")
    print("="*80 + "\n")
    
    logger.info("="*80)
    logger.info("ROTA OLUSTURMA SISTEMI BASLATILDI")
    logger.info(f"Tarih: {datetime.now()}")
    logger.info("="*80)
    
    # Veri yükleme
    df = veri_yukle()
    filo = fleet_yukle()
    
    if df is None or not filo:
        print("[HATA] Kritik hata: Veri veya filo yuklenemedi.\n")
        logger.error("Veri veya filo yuklenemedi, sistem sonlandiriliyor")
        return
    
    # Havuz hazırlığı
    vincli_havuz = df[df['Gereken_Arac'] == 'VINCLI'].copy()
    std_havuz = df[df['Gereken_Arac'] != 'VINCLI'].copy()
    
    vincli_havuz['Atandi'] = False
    std_havuz['Atandi'] = False
    
    # Rota başlatma
    rotalar = {
        a['id']: {
            'arac': a,
            'duraklar': [],
            'yuk': 0,
            'km': 0,
            'konum': DEPOT_COORDS[:]
        } for a in filo
    }
    
    # Başlangıç bilgileri (sadece konsola)
    vincli_sayisi = len([a for a in filo if a['type'] == 'Crane'])
    standart_sayisi = len([a for a in filo if a['type'] == 'Standard'])
    
    print(f"[IS YUKU] {len(vincli_havuz)} Vincli Nokta | {len(std_havuz)} Standart Nokta")
    print(f"[FILO] {vincli_sayisi} Vinc | {standart_sayisi} Kamyon")
    print(f"[ALGORITMA] Round-Robin + En Yakin Is Secimi\n")
    print("[BASLADI] Rota hesaplamasi basladi...\n")
    
    logger.info(f"Is havuzu: {len(vincli_havuz)} vincli, {len(std_havuz)} standart")
    logger.info(f"Filo: {vincli_sayisi} Vinc, {standart_sayisi} Kamyon")
    
    # ============ ROUND-ROBIN DÖNGÜSÜ ============
    tur = 0
    aktif_arac = len(filo)
    
    while aktif_arac > 0:
        tur += 1
        aktif_arac = 0
        atama_sayisi = 0
        
        for arac in filo:
            rid = arac['id']
            info = rotalar[rid]
            limit = 12000 if arac['type'] == 'Crane' else 8000
            
            # Kapasite kontrolü (%95)
            if info['yuk'] >= limit * 0.95:
                continue
            
            # Havuz seçimi
            havuz = vincli_havuz if arac['type'] == 'Crane' else std_havuz
            adaylar = havuz[havuz['Atandi'] == False].copy()
            
            if adaylar.empty:
                continue
            
            # Mesafe hesapla
            adaylar['Mesafe'] = adaylar['ParsedCoords'].apply(
                lambda x: haversine(info['konum'], x)
            )
            
            # Kapasite filtresi
            uygunlar = adaylar[adaylar['Cop_kg'] + info['yuk'] <= limit].copy()
            
            if uygunlar.empty:
                continue
            
            # En yakını seç
            secilen_idx = uygunlar['Mesafe'].idxmin()
            secilen = uygunlar.loc[secilen_idx]
            
            # Atama yap
            havuz.at[secilen_idx, 'Atandi'] = True
            
            info['duraklar'].append({
                "Sira": len(info['duraklar']) + 1,
                "Mahalle": str(secilen['Mahalle_Adi']),
                "Koordinat": {
                    "Lat": float(secilen['ParsedCoords'][0]),
                    "Lng": float(secilen['ParsedCoords'][1])
                },
                "Cop_kg": int(secilen['Cop_kg']),
                "Mesafe_km": round(secilen['Mesafe'], 2)
            })
            
            info['yuk'] += secilen['Cop_kg']
            info['km'] += secilen['Mesafe']
            info['konum'] = secilen['ParsedCoords'][:]
            
            atama_sayisi += 1
            aktif_arac += 1
            
            logger.debug(f"TUR {tur} | {arac['name']}: {len(info['duraklar'])}. durak ({secilen['Mahalle_Adi']}, {int(secilen['Cop_kg'])}kg)")
        
        # İlerleme raporu (her 20 turda bir konsola yaz)
        if tur % 20 == 0 or aktif_arac == 0:
            kalan_vincli = len(vincli_havuz[~vincli_havuz['Atandi']])
            kalan_standart = len(std_havuz[~std_havuz['Atandi']])
            kalan_toplam = kalan_vincli + kalan_standart
            
            logger.info(f"TUR {tur}: {atama_sayisi} atama -> Kalan: {kalan_toplam} is ({kalan_vincli} vincli, {kalan_standart} standart)")
            
            if tur % 20 == 0 and aktif_arac > 0:
                print(f"[TUR {tur}] {atama_sayisi} atama yapildi (Kalan: {kalan_toplam} is)")
    
    print(f"[TAMAMLANDI] Islem tamamlandi: {tur} turda tum isler dagitildi\n")
    logger.info(f"Islem tamamlandi: {tur} tur")
    
    # ============ SONUÇLAR (Tablo Formatı) ============
    sonuc_json = []
    tablo_data = []
    toplam_cop = 0
    toplam_yol = 0
    
    for rid, info in rotalar.items():
        if not info['duraklar']:
            continue
        
        # Depoya dönüş mesafesi
        donus = haversine(info['konum'], DEPOT_COORDS)
        info['km'] += donus
        
        kapasite = 12000 if info['arac']['type'] == 'Crane' else 8000
        doluluk = (info['yuk'] / kapasite) * 100
        
        tablo_data.append({
            'arac': info['arac']['name'],
            'tip': info['arac']['type'],
            'durak': len(info['duraklar']),
            'yuk': int(info['yuk']),
            'km': round(info['km'], 1),
            'doluluk': f"%{int(doluluk)}"
        })
        
        toplam_cop += info['yuk']
        toplam_yol += info['km']
        
        sonuc_json.append({
            "Arac": info['arac']['name'],
            "Tip": info['arac']['type'],
            "Ozet": {
                "Cop_kg": int(info['yuk']),
                "Durak_Sayisi": len(info['duraklar']),
                "Mesafe_km": round(info['km'], 1)
            },
            "Rota": info['duraklar']
        })
    
    # Tablo yazdır (konsola)
    print("="*95)
    print(f"{'ARAC ADI':<25} | {'TIP':<10} | {'DURAK':<6} | {'YUK (kg)':<12} | {'MESAFE (km)':<12} | {'DOLULUK':<8}")
    print("-"*95)
    
    for row in tablo_data:
        print(f"{row['arac']:<25} | {row['tip']:<10} | {row['durak']:<6} | {row['yuk']:<12,} | {row['km']:<12.1f} | {row['doluluk']:<8}")
    
    print("-"*95)
    
    # Özet istatistikler (konsola)
    durak_sayilari = [r['durak'] for r in tablo_data]
    print(f"\nOZET ISTATISTIKLER")
    print("-"*80)
    print(f"Calisan Arac      : {len(sonuc_json)}/{len(filo)}")
    print(f"Toplam Atik      : {int(toplam_cop):,} kg ({toplam_cop/1000:.1f} ton)")
    print(f"Toplam Mesafe    : {toplam_yol:,.1f} km")
    print(f"Durak Dagilimi   : Min={min(durak_sayilari)}, Max={max(durak_sayilari)}, Ort={sum(durak_sayilari)/len(durak_sayilari):.1f}")
    print(f"JSON Dosyasi     : {OUTPUT_JSON_FILE}")
    print(f"Log Dosyasi      : {LOG_FILE}")
    print("-"*80 + "\n")
    
    # JSON kaydet
    final_data = {
        "Meta": {
            "Tarih": datetime.now().isoformat(),
            "Toplam_Atik_kg": int(toplam_cop),
            "Toplam_Mesafe_km": round(toplam_yol, 1),
            "Toplam_Arac": len(sonuc_json)
        },
        "Rotalar": sonuc_json
    }
    
    try:
        with open(OUTPUT_JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
        logger.info(f"JSON dosyasi kaydedildi: {OUTPUT_JSON_FILE}")
    except Exception as e:
        logger.error(f"JSON kaydetme hatasi: {e}")
    
    logger.info("="*80)
    logger.info("SISTEM BASARIYLA TAMAMLANDI")
    logger.info(f"Toplam Atik: {int(toplam_cop):,} kg")
    logger.info(f"Toplam Mesafe: {toplam_yol:,.1f} km")
    logger.info(f"Calisan Arac: {len(sonuc_json)}/{len(filo)}")
    logger.info("="*80)
    
    print("[OK] Islem basariyla tamamlandi!\n")
    
    return final_data

if __name__ == "__main__":
    rota_olustur()

