@echo off
title Setup Database MySQL Otomatis - Klinik H.APUD
color 0B

echo =========================================================================
echo       SETUP DATABASE MYSQL OTOMATIS - KLINIK H.APUD
echo =========================================================================
echo.
echo Pastikan Apache dan MySQL di XAMPP / Laragon sudah Anda [START].
echo Menjalankan impor otomatis schema database...
echo.

node setup_database.js

echo.
pause
