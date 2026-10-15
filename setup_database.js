/**
 * SCRIPT SETUP DATABASE MYSQL OTOMATIS
 * Menjalankan file database/schema.sql ke MySQL lokal (XAMPP / Laragon).
 * Cara pakai: node setup_database.js
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

async function setupDatabase() {
  console.log('=========================================================================');
  console.log('       SETUP DATABASE MYSQL OTOMATIS - KLINIK H.APUD');
  console.log('=========================================================================');
  console.log(`Menghubungkan ke MySQL di ${DB_HOST}:${DB_PORT} (User: ${DB_USER})...`);

  try {
    // 1. Hubungkan ke server MySQL
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    console.log('✓ Terhubung ke server MySQL.');

    // 2. Baca file database/schema.sql
    const schemaPath = path.resolve('database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`[ERROR] File skema tidak ditemukan di: ${schemaPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
    console.log('Mengeksekusi skema database/schema.sql...');

    // 3. Jalankan query
    await connection.query(sqlContent);

    console.log('✓ Berhasil! Database `klinik_hapud` beserta tabel:');
    console.log('   - admins (Akun login admin klinik)');
    console.log('   - patient_accounts (Akun login pasien)');
    console.log('   - patients (Antrean & rekam medis)');
    console.log('   - clinic_status (Status buka/tutup klinik)');
    console.log('   telah dibuat dan diisi data awal secara otomatis.');
    console.log('=========================================================================');

    await connection.end();
  } catch (err) {
    console.error('\n[GAGAL] Tidak dapat menghubungkan ke MySQL:');
    console.error(err.message);
    console.log('\nTips Perbaikan:');
    console.log('1. Pastikan modul MySQL di XAMPP / Laragon sudah dalam status [START].');
    console.log('2. Pastikan password di file .env sudah sesuai dengan MySQL komputer Anda.');
  }
}

setupDatabase();
