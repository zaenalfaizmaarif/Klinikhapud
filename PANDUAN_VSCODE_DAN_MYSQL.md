# Panduan Praktis Menjalankan Klinik H.APUD di Komputer & VS Code

Aplikasi sistem informasi pendaftaran online, tiket antrean sesi bebas bentrok, dan rekam medis untuk **Klinik H.APUD**.

---

## ⚡ CARA 1-KLIK (PALING MUDAH & OTOMATIS)

Jika Anda menggunakan komputer Windows, Anda tidak perlu mengetik perintah terminal yang rumit:

### 1. Menjalankan Aplikasi Secara Otomatis
- Cukup **klik dua kali (double-click)** pada file:
  📁 `JALANKAN_KLINIK_HAPUD.bat`
- File ini akan otomatis:
  1. Memeriksa Node.js di komputer Anda.
  2. Menginstal paket dependensi (`npm install`) secara otomatis jika belum ada.
  3. Menjalankan server aplikasi di port 3000.
  4. Langsung otomatis membuka browser ke halaman: **http://localhost:3000**!

### 2. Setup Database MySQL Otomatis (XAMPP / Laragon)
- Pastikan Apache & MySQL di XAMPP / Laragon sudah dalam status **[START]**.
- Cukup **klik dua kali (double-click)** pada file:
  📁 `SETUP_DATABASE_MYSQL.bat`
- Database `klinik_hapud` beserta seluruh tabel (`admins`, `patient_accounts`, `patients`, `clinic_status`) dan data contoh akan langsung dibuat secara otomatis tanpa perlu membuka phpMyAdmin!

---

## 💻 CARA MENJALANKAN DI VISUAL STUDIO CODE (VS CODE)

1. **Buka Folder:**
   Buka aplikasi **VS Code** -> Klik menu **File** -> **Open Folder...** -> Pilih folder `Klinik_H.APUD`.

2. **Jalankan Otomatis dengan F5 (Run & Debug):**
   Folder ini sudah dilengkapi konfigurasi `.vscode/launch.json`.
   Cukup tekan tombol **`F5`** pada keyboard Anda atau klik tombol hijau **Play** di menu *Run and Debug* di bilah samping kiri VS Code. Aplikasi akan langsung berjalan otomatis.

3. **Atau Melalui Terminal VS Code:**
   Buka Terminal (`Ctrl + \``) lalu ketik:
   ```bash
   npm run buka
   ```
   *(Perintah ini akan menjalankan server sekaligus otomatis membuka browser)*

---

## 🗄️ STRUKTUR BERKAS LENGKAP & RAPI

- `src/` : Seluruh kodingan antarmuka React 19 + TypeScript + Tailwind CSS v4.
- `database/schema.sql` : Skema tabel MySQL siap pakai.
- `server/` : Backend Express dan koneksi MySQL untuk pengujian lokal.
- `JALANKAN_KLINIK_HAPUD.bat` : Peluncur otomatis 1-klik untuk Windows.
- `SETUP_DATABASE_MYSQL.bat` : Pengimpor database otomatis 1-klik ke MySQL.
- `.vscode/` : Pengaturan otomatis workspace VS Code (F5 Run & Debug).

---

## 🔐 KREDENSIAL LOGIN BAWAAN UNTUK PENGUJIAN

### Akun Petugas & Admin
- **Halaman Login:** Masuk ke kartu **Portal Admin Klinik**
- **Username:** `admin`
- **Kata Sandi:** `KlinikApud#2026`
*(Kata sandi dapat diubah kapan saja di dashboard admin)*

### Akun Pasien Terdaftar
- **Halaman Login:** Masuk ke kartu **Portal Pasien**
  - **Nama:** `Ibu Siti Aminah` | Sandi: `siti123`
  - **Nama:** `Ahmad Fadilah` | Sandi: `ahmad123`
  - **Nama:** `Bpk. Budi Santoso` | Sandi: `budi123`
- Pasien baru juga bisa mendaftar akun baru kapan saja lewat tab **"Daftar Pasien Baru"**.
