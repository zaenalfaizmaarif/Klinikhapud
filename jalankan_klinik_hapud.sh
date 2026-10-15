#!/bin/bash
echo "========================================================================="
echo "            MEMULAI SISTEM APLIKASI KLINIK H.APUD"
echo "========================================================================="
echo ""

# 1. Cek Node.js
if ! command -v node &> /dev/null; then
    echo "[PERINGATAN] Node.js belum terdeteksi! Silakan unduh di https://nodejs.org"
    exit 1
fi

echo "[1/3] Node.js terdeteksi... Siap!"

# 2. Cek dependensi
if [ ! -d "node_modules" ]; then
    echo "[2/3] Menginstal dependensi aplikasi..."
    npm install
else
    echo "[2/3] Paket dependensi sudah terpasang."
fi

# 3. Jalankan server
echo "[3/3] Menjalankan server aplikasi di http://localhost:3000..."
echo "Buka browser Anda di: http://localhost:3000"
echo "========================================================================="

npm run dev
