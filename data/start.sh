#!/bin/bash

# Nilüfer AI Smart Waste Manager - Başlatma Scripti

echo "🚀 Nilüfer AI Smart Waste Manager başlatılıyor..."
echo ""

# Python kontrolü
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 bulunamadı! Lütfen Python 3.8+ yükleyin."
    exit 1
fi

# Gerekli paketleri kontrol et
echo "📦 Python paketleri kontrol ediliyor..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠️  Paketler yüklü değil. Yükleniyor..."
    pip install -r requirements.txt
fi

# CSV dosyalarını kontrol et
echo "📁 CSV dosyaları kontrol ediliyor..."
required_files=("Master_Optimization_Data.csv" "07_konteyner_doluluk_tahmini.csv")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Eksik dosyalar: ${missing_files[*]}"
    exit 1
fi

echo "✅ Tüm dosyalar mevcut"
echo ""

# Port kontrolü
PORT=${1:-8000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT kullanımda. Farklı bir port kullanın veya mevcut servisi durdurun."
    exit 1
fi

# Sunucuyu başlat
echo "🌐 Sunucu başlatılıyor: http://localhost:$PORT"
echo "   Durdurmak için: Ctrl+C"
echo ""

python3 app.py

