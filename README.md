# KLINIK H.APUD - Sistem Informasi Pendaftaran Online, Antrean Sesi Bebas Bentrok, & Rekam Medis

Aplikasi manajemen antrean dan pendaftaran online berobat berbasis web untuk **Klinik H.APUD** (Desa Mekarjaya, Compreng, Subang).

---

## ⚡ Jalankan Otomatis (1-Klik untuk Windows)

- Cukup **klik dua kali** file `JALANKAN_KLINIK_HAPUD.bat`.
- Sistem akan otomatis memasang dependensi jika belum ada, menyalakan server lokal, dan langsung membuka browser di `http://localhost:3000`.

---

## 💻 Jalankan di Visual Studio Code (VS Code)

1. Buka VS Code -> **File** -> **Open Folder...** -> Pilih folder `Klinik_H.APUD`.
2. Tekan tombol **`F5`** di keyboard untuk menjalankan aplikasi secara otomatis.
3. Atau jalankan di terminal:
   ```bash
   npm run buka
   ```

---

## 🗄️ Database MySQL Otomatis (XAMPP / Laragon)

- Pastikan MySQL di XAMPP / Laragon sudah aktif (**START**).
- Klik dua kali file `SETUP_DATABASE_MYSQL.bat` untuk membuat database `klinik_hapud` beserta tabel dan data awal secara otomatis.
- Skema mentah SQL juga tersedia di file: `database/schema.sql`.

---

## 📁 Struktur Folder Proyek

```text
Klinik_H.APUD/
├── src/                          # Kode Antarmuka Frontend (React 19 + TypeScript)
│   ├── components/               # Komponen UI (LandingView, PatientView, AdminView, Header)
│   │   ├── auth/                 # Form Login Admin & Pasien
│   │   └── modals/               # Modal Tiket, Rekam Medis, Status Buka/Tutup
│   ├── data/constants.ts         # Katalog layanan & jadwal sesi waktu
│   ├── types.ts                  # Definisi tipe data
│   ├── utils/                    # Helper tanggal, audio suara, export MySQL & CSV
│   ├── App.tsx                   # Aplikasi utama & manajemen antrean
│   └── main.tsx                  # Titik masuk aplikasi
├── server/                       # Backend Express & MySQL (Untuk Lokal)
│   ├── db.ts                     # Pool koneksi MySQL
│   └── server.ts                 # REST API endpoints
├── database/
│   └── schema.sql                # Skema tabel MySQL & Seed Data
├── .vscode/                      # Konfigurasi Otomatis Workspace VS Code (F5 Run)
├── JALANKAN_KLINIK_HAPUD.bat     # Peluncur Otomatis 1-Klik Windows
├── SETUP_DATABASE_MYSQL.bat      # Setup Database Otomatis 1-Klik Windows
├── jalankan_klinik_hapud.sh      # Peluncur Otomatis untuk macOS / Linux
├── setup_database.js             # Skrip setup database otomatis berbasis Node.js
├── PANDUAN_VSCODE_DAN_MYSQL.md   # Panduan praktis bahasa Indonesia
├── package.json                  # Konfigurasi dependensi proyek
└── vite.config.ts                # Konfigurasi Vite
```

---

## 🔐 Kredensial Pengujian

- **Admin Klinik:** Username `admin` | Password `KlinikApud#2026`
- **Akun Pasien:**
  - `Ibu Siti Aminah` (Password: `siti123`)
  - `Ahmad Fadilah` (Password: `ahmad123`)
  - `Bpk. Budi Santoso` (Password: `budi123`)
