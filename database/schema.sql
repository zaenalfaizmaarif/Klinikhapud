-- =========================================================================
-- DATABASE SCHEMA & SEED DATA UNTUK KLINIK H.APUD (MYSQL)
-- Sistem Pendaftaran Online, Antrean Sesi, & Rekam Medis
-- =========================================================================

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS `klinik_hapud`
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `klinik_hapud`;

-- -------------------------------------------------------------------------
-- 2. Tabel Akun Admin & Petugas Medis
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. Tabel Akun Pasien (Login Nama & Kata Sandi)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patient_accounts` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `patient_type` ENUM('Baru', 'Lama') NOT NULL DEFAULT 'Baru',
  `no_rm` VARCHAR(50) DEFAULT '-',
  `dob` DATE DEFAULT NULL,
  `gender` ENUM('Laki-laki', 'Perempuan') NOT NULL DEFAULT 'Laki-laki',
  `address` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 4. Tabel Antrean & Rekam Medis Pasien
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patients` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `patient_type` ENUM('Baru', 'Lama') NOT NULL DEFAULT 'Baru',
  `no_rm` VARCHAR(50) DEFAULT '-',
  `service` VARCHAR(100) NOT NULL,
  `dob` DATE DEFAULT NULL,
  `gender` ENUM('Laki-laki', 'Perempuan') NOT NULL DEFAULT 'Laki-laki',
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `visit_date` DATE NOT NULL,
  `session_name` VARCHAR(50) NOT NULL,
  `time_slot` VARCHAR(20) NOT NULL,
  `complaint` TEXT NOT NULL,
  `status` ENUM('Menunggu', 'Dipanggil', 'Selesai', 'Batal') NOT NULL DEFAULT 'Menunggu',
  `vital_bp` VARCHAR(30) DEFAULT NULL,
  `vital_temp` VARCHAR(30) DEFAULT NULL,
  `vital_weight` VARCHAR(30) DEFAULT NULL,
  `vital_pulse` VARCHAR(30) DEFAULT NULL,
  `diagnosis` TEXT DEFAULT NULL,
  `prescription` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_visit_date` (`visit_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 5. Tabel Status Buka / Tutup Klinik (Sinkronisasi Otomatis 08:00 - 21:00 WIB)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clinic_status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `is_open` TINYINT(1) NOT NULL DEFAULT 1,
  `mode` ENUM('auto', 'manual') NOT NULL DEFAULT 'auto',
  `reason` VARCHAR(255) DEFAULT '',
  `reopen_estimate` VARCHAR(255) DEFAULT '',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- DATA AWAL (SEED DATA)
-- =========================================================================

-- Seed Admin (Sandi Baru: KlinikApud#2026)
INSERT INTO `admins` (`id`, `username`, `password`, `role`)
VALUES ('adm-1', 'admin', 'KlinikApud#2026', 'admin')
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`);

-- Seed Akun Pasien
INSERT INTO `patient_accounts` (`id`, `name`, `password`, `phone`, `patient_type`, `no_rm`, `dob`, `gender`, `address`)
VALUES
  ('acc-1', 'Ibu Siti Aminah', 'siti123', '081298765432', 'Lama', 'RM-2025-081', '1982-04-15', 'Perempuan', 'Dusun Sukamaju RT 02/03'),
  ('acc-2', 'Ahmad Fadilah', 'ahmad123', '081234567890', 'Baru', '-', '1995-08-20', 'Laki-laki', 'Desa Mekarjaya, Compreng'),
  ('acc-3', 'Bpk. Budi Santoso', 'budi123', '085712345678', 'Baru', '-', '1990-11-20', 'Laki-laki', 'Jl. Pemuda No. 45 Desa Karanganyar')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Status Operasional Klinik
INSERT INTO `clinic_status` (`id`, `is_open`, `mode`, `reason`, `reopen_estimate`)
VALUES (1, 1, 'auto', '', 'Operasional normal buka sampai 21:00 WIB')
ON DUPLICATE KEY UPDATE `is_open` = VALUES(`is_open`);

-- Seed Data Antrean Pasien Contoh
INSERT INTO `patients` (`id`, `code`, `name`, `patient_type`, `no_rm`, `service`, `dob`, `gender`, `phone`, `address`, `visit_date`, `session_name`, `time_slot`, `complaint`, `status`, `vital_bp`, `vital_temp`, `vital_weight`, `vital_pulse`, `diagnosis`, `prescription`)
VALUES
  ('pt-1', 'A-001', 'Ibu Siti Aminah', 'Lama', 'RM-2025-081', 'Konsultasi & Berobat Umum', '1982-04-15', 'Perempuan', '081298765432', 'Dusun Sukamaju RT 02/03', CURDATE(), 'Sesi 1', '08:00', 'Demam tinggi 2 hari, meriang, dan pusing berdenyut.', 'Selesai', '115/75', '37.8', '58', '82', 'Febris Akut / Suspek Infeksi Saluran Napas Atas', 'Paracetamol 500mg 3x1 tablet, Vitamin C 500mg 1x1 tablet, Amoxicillin 500mg 3x1 (dihabiskan).'),
  ('pt-2', 'B-001', 'Bpk. Budi Santoso', 'Baru', '-', 'Perawatan Luka & Jahit', '1990-11-20', 'Laki-laki', '085712345678', 'Jl. Pemuda No. 45 Desa Karanganyar', CURDATE(), 'Sesi 1', '08:30', 'Luka robek di telapak kaki terkena pecahan kaca saat bertani.', 'Dipanggil', '130/85', '36.6', '65', '78', 'Vulnus Laceratum Regio Pedis Sinistra', 'Hecting 3 jahitan, Injeksi ATS / Antitetanus, Cefadroxil 500mg 2x1, Asam Mefenamat 500mg 3x1.'),
  ('pt-3', 'C-001', 'Ibu Dewi Lestari', 'Lama', 'RM-2024-119', 'Cek Darah & Tensi', '1975-06-12', 'Perempuan', '081344556677', 'Komplek Asri No. 12', CURDATE(), 'Sesi 1', '09:00', 'Kontrol rutin tensi darah tinggi dan cek gula darah puasa.', 'Menunggu', NULL, NULL, NULL, NULL, NULL, NULL),
  ('pt-4', 'A-002', 'Ahmad Fauzi', 'Baru', '-', 'Konsultasi & Berobat Umum', '2001-09-05', 'Laki-laki', '082155667788', 'Desa Sidomulyo RT 01/01', CURDATE(), 'Sesi 2', '13:00', 'Perut kembung, mual muntah setelah makan pedas.', 'Menunggu', NULL, NULL, NULL, NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
