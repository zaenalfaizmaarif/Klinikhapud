# Integrasi Database Online Cloud Firestore & Sinkronisasi Real-Time Pasien-Admin

Rencana arsitektur dan langkah implementasi untuk mengaktifkan database online cloud (Firebase Firestore) agar pendaftaran pasien di web yang telah dipublikasi tersinkronisasi langsung secara real-time ke portal admin dan monitor antrean di perangkat manapun, serta penyempurnaan manajemen ruangan khitan dan pengecekan tiket pasien.

## User Review & Critical Decisions

> [!IMPORTANT]
> Konfirmasi Pengguna: Pengguna telah menyetujui aktivasi database online Firebase Firestore agar data pendaftaran pasien di link publik tidak hanya tersimpan di memori browser lokal (`localStorage`), melainkan tersimpan di cloud database sehingga langsung muncul di layar Admin dan Monitor Antrean Klinik secara real-time tanpa refresh.

- **Keputusan Terkonfirmasi**: Mengaktifkan Cloud Firestore via Firebase setup tool untuk mengelola koleksi data `patients`, `clinic_rooms`, dan `clinic_status`.
- **Hybrid Storage & Offline Fallback**: Tetap menyediakan fallback otomatis ke penyimpanan lokal jika perangkat berada di luar jaringan (offline mode), lalu menyinkronkan data saat koneksi kembali pulih.
- **Ruang Khitan**: Memastikan Ruang Khitan terdaftar resmi dalam database poli dan terhubung ke saran otomatis saat pasien memilih keluhan atau tindakan sunat/khitan.
- **Cek Tiket Pasien**: Memastikan tombol di portal Admin bertuliskan "Cek Tiket Pasien" dengan pencarian cepat seluruh data tiket pasien klinik.

---

## 1. Overview & Core Concept

- **Problem**: Saat ini pendaftaran pasien dan nomor antrean hanya tersimpan di `localStorage` masing-masing browser/perangkat. Akibatnya, saat link dipublikasikan dan pasien mengisi formulir dari HP mereka, datanya tidak muncul di komputer Admin klinik maupun layar monitor ruang tunggu.
- **Solution**:
  1. Menginisialisasi Firebase Cloud Firestore sebagai single source of truth untuk antrean klinik.
  2. Memasang listener real-time (`onSnapshot`) pada koleksi `patients` sehingga setiap pendaftaran baru dari pasien manapun di internet langsung memicu notifikasi suara dan update tabel di layar Admin & TV monitor.
  3. Memastikan pembaruan status antrean oleh Admin (Dipanggil, Masuk Poli, Selesai) langsung mengupdate status tiket di HP pasien secara instan.
  4. Memvalidasi ketersediaan Ruang Khitan di master ruangan serta filter lengkap tiket pasien.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Alur Pendaftaran Pasien Online (Multi-Perangkat)**:
   - Pasien membuka web klinik dari HP/laptop di rumah atau tempat kerja.
   - Pasien mendaftar online (misal: Layanan Khitan Modern / Poli Umum).
   - Sistem menyimpan data ke Firestore (`patients`), menghasilkan kode antrean (misal: `K-001` atau `A-005`).
   - Layar admin di klinik berbunyi lonceng notifikasi dan nomor antrean langsung muncul di baris teratas tanpa perlu reload halaman.

2. **Alur Pemanggilan & Kunjungan Ruang Khitan**:
   - Admin memanggil pasien: audio announcement klinik berbunyi *"Nomor Antrean K-001, ananda Rizky, silakan menuju Ruang Khitan / Sunat Modern"*.
   - Status antrean di tiket HP pasien langsung berganti menjadi **Dipanggil** dengan highlight ruangan hijau toska.

3. **Alur Cek Tiket Pasien di Admin**:
   - Admin mengeklik tombol **Cek Tiket Pasien** di toolbar.
   - Modal menampilkan seluruh rekap tiket terdaftar hari ini dengan filter status (Semua, Menunggu, Dipanggil, Selesai) serta pencarian instan berdasarkan Nama, Nomor Antrean, No. WhatsApp, atau Poli/Ruangan.

### Visual Identity & Theme
- Mempertahankan tema profesional medis modern Klinik H.APUD dengan aksen **Emerald & Teal** (`bg-teal-600`, `text-teal-900`, `border-teal-200`) yang higienis, ramah, dan menenangkan.
- Indikator status koneksi Cloud Database yang bersih dan elegan (indikator sinkronisasi cloud real-time yang tidak mengganggu UI).

---

## 3. Key Product Decisions & Trade-Offs

- **Firestore Real-time Listener (`onSnapshot`) vs Polling**:
  - *Chosen*: Menggunakan `onSnapshot` Firestore untuk sinkronisasi dua arah seketika (< 300ms) tanpa membebani server dan hemat kuota baca.
  - *Why*: Pasien dan admin membutuhkan informasi antrean yang langsung sinkron saat dipanggil atau saat ada pasien baru mendaftar.
- **Local Fallback Persistence**:
  - *Chosen*: Tetap mempertahankan backup data di `localStorage` sebagai cache dan jaring pengaman bila koneksi internet klinik terputus sementara.
- **Pembersihan Opsi MySQL Export**:
  - *Chosen*: Menghilangkan tombol ekspor MySQL yang membingungkan staf klinik dan mempertahankan ekspor Laporan Cetak Resmi dan CSV Spreadsheet.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                    Klinik H. APUD Web App                     │
└───────┬───────────────────────────────┬───────────────────────┘
        │                               │
        ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│   Pasien (HP / Web)     │   │     Admin & TV Monitor Antrean  │
│ - Isi formulir online   │   │ - Panggil antrean (Text-to-Speech)
│ - Cek status tiket      │   │ - Kelola Ruangan & Poli         │
│ - Pantau antrean live   │   │ - Cek Tiket Pasien (Cari/Cetak) │
└───────────┬─────────────┘   └───────────────┬─────────────────┘
            │                                 │
            │   Real-time Listen & Write      │
            └───────────────┬─────────────────┘
                            ▼
              ┌───────────────────────────┐
              │  Firebase Cloud Firestore │
              │                           │
              │  • /patients/{patientId}  │
              │  • /rooms/{roomId}        │
              │  • /settings/clinicStatus │
              └───────────────────────────┘
```

### Data Model (`patients` Collection)

| Field | Type | Description |
|---|---|---|
| `id` | `string` | ID unik antrean / pendaftaran |
| `code` | `string` | Nomor antrean (misal: `A-001`, `K-002`) |
| `name` | `string` | Nama lengkap pasien |
| `nik` | `string` | NIK KTP / Kartu Identitas |
| `phone` | `string` | Nomor WhatsApp / Telepon aktif |
| `gender` | `'L' \| 'P'` | Jenis kelamin |
| `birthDate` | `string` | Tanggal lahir (YYYY-MM-DD) |
| `address` | `string` | Alamat tempat tinggal |
| `service` | `string` | Poli / Layanan yang dipilih (Khitan, Poli Umum, dll) |
| `complaint` | `string` | Keluhan utama atau keterangan |
| `session` | `string` | Sesi kedatangan (Pagi, Siang, Sore) |
| `status` | `string` | `Menunggu` \| `Dipanggil` \| `Selesai` \| `Batal` |
| `assignedRoom` | `string` | Nama ruangan (misal: `Ruang Khitan / Sunat Modern`) |
| `createdAt` | `string` | Waktu pendaftaran ISO timestamp |

### Execution Steps After Approval

1. **Firebase Provisioning**:
   - Membuka `show_aistudio_ui` dengan `ui_type: "firebase_setup"` untuk konfirmasi terms Firestore.
   - Menjalankan RPC `ProvisionFirebase` untuk mengonfigurasi database cloud resmi bagi aplikasi.
2. **SDK & Dependencies**:
   - Memastikan package `firebase` terpasang di `package.json`.
   - Menginisialisasi `src/services/firebase.ts` menggunakan konfigurasi `firebase-applet-config.json`.
3. **Sinkronisasi Data Real-Time di App.tsx**:
   - Menghubungkan fungsi pendaftaran (`handleRegisterPatient`), pemanggilan (`handleCallPatient`), dan perubahan status ke Firestore dengan listener `onSnapshot`.
4. **Validasi Ruang Khitan & Cek Tiket**:
   - Memastikan master ruangan `DEFAULT_CLINIC_ROOMS` dan koleksi Firestore mencakup Ruang Khitan secara konsisten.
   - Memastikan fitur pencarian dan modal "Cek Tiket Pasien" di Admin berjalan mulus.
5. **Verifikasi & Build**:
   - Melakukan kompilasi dengan `compile_applet` dan verifikasi bebas error.
