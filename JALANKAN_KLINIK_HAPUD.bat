@echo off
title Klinik H.APUD - Menjalankan Aplikasi Otomatis
color 0A

echo =========================================================================
echo             MEMULAI SISTEM APLIKASI KLINIK H.APUD
echo =========================================================================
echo.

:: 1. Cek apakah Node.js sudah terinstal
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [PERINGATAN] Node.js belum terdeteksi di komputer Anda!
    echo Silakan unduh dan instal Node.js terlebih dahulu di:
    echo https://nodejs.org/ (Pilih versi LTS)
    echo.
    pause
    exit /b
)

echo [1/3] Node.js terdeteksi... Siap!

:: 2. Cek apakah folder node_modules sudah ada, jika belum jalankan instalasi
if not exist "node_modules\" (
    echo [2/3] Menginstal paket aplikasi secara otomatis (harap tunggu sebentar)...
    call npm install
) else (
    echo [2/3] Paket dependensi sudah terpasang lengkap.
)

:: 3. Membuka browser otomatis dan menyalakan server lokal
echo [3/3] Menjalankan server Klinik H.APUD di port 3000...
echo Halaman web akan terbuka otomatis di browser Anda (http://localhost:3000).
echo.
echo =========================================================================
echo  Klinik H.APUD Aktif!
echo  Untuk berhenti: Tutup jendela hitam ini atau tekan Ctrl + C.
echo =========================================================================
echo.

:: Tunggu 2 detik lalu buka browser
start "" "http://localhost:3000"
call npm run dev

pause
