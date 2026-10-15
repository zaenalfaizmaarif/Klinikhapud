@echo off
title Menjalankan Klinik H.APUD (CodeIgniter 4)
color 0A

echo =========================================================================
echo       MENJALANKAN KLINIK H.APUD - CODEIGNITER 4 (PHP & MYSQL)
echo =========================================================================
echo.
echo Pastikan Apache dan MySQL di XAMPP / Laragon sudah Anda [START].
echo.

where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [PERINGATAN] PHP belum terdeteksi di PATH komputer Anda!
    echo Jika Anda menggunakan XAMPP, PHP biasanya ada di: C:\xampp\php\php.exe
    echo.
    echo Menjalankan dengan fallback C:\xampp\php\php.exe ...
    set "PATH=%PATH%;C:\xampp\php;C:\laragon\bin\php\php-8.1.10-Win32-vs16-x64"
)

echo Membuka browser ke http://localhost:8080 ...
start "" "http://localhost:8080"
echo.
echo Server CodeIgniter 4 sedang berjalan...
echo Tekan Ctrl + C untuk mematikan server.
echo.

php spark serve
pause
