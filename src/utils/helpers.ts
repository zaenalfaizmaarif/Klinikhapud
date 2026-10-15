import { Patient, ServiceType } from '../types';
import { SERVICE_PREFIXES } from '../data/constants';

/**
 * Generate unique daily queue code that changes every day and avoids collisions.
 * Format: [PREFIX]-[DDMM]-[SEQ] (e.g. A-1410-001, B-1410-001)
 * On day change (e.g. 15 Oct), it produces A-1510-001, ensuring every day has unique codes.
 */
export function generateDailyQueueCode(
  service: ServiceType,
  visitDate: string,
  existingPatients: Patient[]
): string {
  const prefix = SERVICE_PREFIXES[service] || 'A';
  let dayMonth = '0101';
  if (visitDate) {
    const parts = visitDate.split('-');
    if (parts.length === 3) {
      dayMonth = `${parts[2]}${parts[1]}`; // DDMM e.g. '1410'
    }
  }

  // Count patients registered for the same date and service
  const sameDayServicePatients = existingPatients.filter(
    (p) => p.visitDate === visitDate && p.service === service
  );

  let seq = sameDayServicePatients.length + 1;
  let code = `${prefix}-${dayMonth}-${('00' + seq).slice(-3)}`;

  // Guarantee 100% uniqueness across the database
  while (existingPatients.some((p) => p.code.toUpperCase() === code.toUpperCase())) {
    seq++;
    code = `${prefix}-${dayMonth}-${('00' + seq).slice(-3)}`;
  }

  return code;
}

/**
 * Look up existing patient by queue code (old or new), No. RM, phone number, or name.
 * Allows returning patients to easily re-register using their previous queue number.
 */
export function findPatientByQueueOrPhone(
  query: string,
  patients: Patient[]
): Patient | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  const upper = trimmed.toUpperCase();
  const cleanAlphaNum = upper.replace(/[^A-Z0-9]/g, '');

  // 1. Direct or alphanumeric match on queue code (e.g. A-1410-001, A1410001, A-001, A001)
  const matchCode = patients.find((p) => {
    const codeClean = p.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return p.code.toUpperCase() === upper || (cleanAlphaNum && codeClean === cleanAlphaNum);
  });
  if (matchCode) return matchCode;

  // 2. Exact match on Medical Record Number (No. RM)
  const matchRM = patients.find(
    (p) => p.noRM && p.noRM !== '-' && p.noRM.trim().toUpperCase() === upper
  );
  if (matchRM) return matchRM;

  // 3. Match on Phone / WhatsApp number (min 5 digits)
  const cleanPhone = trimmed.replace(/[^0-9]/g, '');
  if (cleanPhone.length >= 5) {
    const matchPhone = patients.find((p) => {
      const pPhoneClean = p.phone.replace(/[^0-9]/g, '');
      return pPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(pPhoneClean);
    });
    if (matchPhone) return matchPhone;
  }

  // 4. Exact name match (case-insensitive)
  const matchName = patients.find(
    (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (matchName) return matchName;

  return undefined;
}

export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function calculateAge(dobStr?: string): string {
  if (!dobStr) return '-';
  try {
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${Math.max(0, age)} thn`;
  } catch {
    return '-';
  }
}

export function generateWhatsAppLink(patient: Patient): string {
  const text =
    `*TIKET PENDAFTARAN ONLINE KLINIK H.APUD*\n` +
    `_Layanan Kesehatan Masyarakat_\n` +
    `----------------------------------------\n` +
    `*No. Antrean:* ${patient.code}\n` +
    `*Nama Pasien:* ${patient.name} (${patient.gender}, ${calculateAge(patient.dob)})\n` +
    `*Status Pasien:* ${patient.patientType === 'Baru' ? 'Pasien Baru' : `Pasien Lama (No. RM: ${patient.noRM || '-'})`}\n` +
    `*Layanan:* ${patient.service}\n` +
    `*Tanggal Kunjungan:* ${formatDateIndo(patient.visitDate)}\n` +
    `*Sesi & Jam:* ${patient.sessionName} (${patient.timeSlot} WIB)\n` +
    `*Keluhan:* ${patient.complaint}\n` +
    `----------------------------------------\n` +
    `_Harap hadir 10 menit sebelum jam sesi untuk verifikasi berkas._\n` +
    `Lokasi: Jl.Sukaresmi Desa Mekarjaya Kecamatan Compreng Kabupaten Subang, Jawa Barat 41258\n` +
    `Terima kasih telah mendaftar secara online di Klinik H.APUD.`;

  const phoneSanitized = patient.phone.replace(/[^0-9]/g, '');
  const waTarget = phoneSanitized.startsWith('0')
    ? '62' + phoneSanitized.slice(1)
    : phoneSanitized.startsWith('62')
      ? phoneSanitized
      : '62' + phoneSanitized;

  return `https://wa.me/${waTarget}?text=${encodeURIComponent(text)}`;
}

export function exportToCSV(patients: Patient[]) {
  const headers = [
    'No. Antrean',
    'Nama Pasien',
    'Status Pasien',
    'No. RM',
    'Jenis Kelamin',
    'Tgl Lahir',
    'No. WhatsApp',
    'Alamat',
    'Tanggal Kunjungan',
    'Sesi',
    'Jam Slot',
    'Layanan',
    'Keluhan',
    'Status Antrean',
    'Diagnosis',
    'Resep Obat',
  ];

  const rows = patients.map((p) => [
    `"${p.code}"`,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.patientType}"`,
    `"${p.noRM || '-'}"`,
    `"${p.gender}"`,
    `"${p.dob}"`,
    `"${p.phone}"`,
    `"${p.address.replace(/"/g, '""')}"`,
    `"${p.visitDate}"`,
    `"${p.sessionName}"`,
    `"${p.timeSlot}"`,
    `"${p.service}"`,
    `"${p.complaint.replace(/"/g, '""')}"`,
    `"${p.status}"`,
    `"${(p.diagnosis || '').replace(/"/g, '""')}"`,
    `"${(p.prescription || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rekap_antrean_klinik_hapud_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToMySQLScript(
  patients: Patient[],
  adminPassword = 'KlinikApud#2026'
) {
  const escapeSql = (str?: string | null) => {
    if (!str) return 'NULL';
    return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  };

  let sql = `-- =========================================================================\n`;
  sql += `-- BACKUP DATABASE MYSQL KLINIK H.APUD\n`;
  sql += `-- Tanggal Export: ${new Date().toLocaleString('id-ID')} WIB\n`;
  sql += `-- =========================================================================\n\n`;
  sql += `CREATE DATABASE IF NOT EXISTS \`klinik_hapud\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  sql += `USE \`klinik_hapud\`;\n\n`;

  sql += `-- 1. Tabel Admins\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`admins\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`username\` VARCHAR(100) NOT NULL UNIQUE,\n`;
  sql += `  \`password\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`role\` VARCHAR(50) NOT NULL DEFAULT 'admin',\n`;
  sql += `  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;
  sql += `INSERT INTO \`admins\` (\`id\`, \`username\`, \`password\`, \`role\`) VALUES ('adm-1', 'admin', ${escapeSql(adminPassword)}, 'admin')\n`;
  sql += `ON DUPLICATE KEY UPDATE \`password\` = VALUES(\`password\`);\n\n`;

  sql += `-- 2. Tabel Patients (Antrean & Rekam Medis)\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`patients\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`code\` VARCHAR(20) NOT NULL,\n`;
  sql += `  \`name\` VARCHAR(150) NOT NULL,\n`;
  sql += `  \`patient_type\` ENUM('Baru', 'Lama') NOT NULL DEFAULT 'Baru',\n`;
  sql += `  \`no_rm\` VARCHAR(50) DEFAULT '-',\n`;
  sql += `  \`service\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`dob\` DATE DEFAULT NULL,\n`;
  sql += `  \`gender\` ENUM('Laki-laki', 'Perempuan') NOT NULL DEFAULT 'Laki-laki',\n`;
  sql += `  \`phone\` VARCHAR(30) NOT NULL,\n`;
  sql += `  \`address\` TEXT DEFAULT NULL,\n`;
  sql += `  \`visit_date\` DATE NOT NULL,\n`;
  sql += `  \`session_name\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`time_slot\` VARCHAR(20) NOT NULL,\n`;
  sql += `  \`complaint\` TEXT NOT NULL,\n`;
  sql += `  \`status\` ENUM('Menunggu', 'Dipanggil', 'Selesai', 'Batal') NOT NULL DEFAULT 'Menunggu',\n`;
  sql += `  \`vital_bp\` VARCHAR(30) DEFAULT NULL,\n`;
  sql += `  \`vital_temp\` VARCHAR(30) DEFAULT NULL,\n`;
  sql += `  \`vital_weight\` VARCHAR(30) DEFAULT NULL,\n`;
  sql += `  \`vital_pulse\` VARCHAR(30) DEFAULT NULL,\n`;
  sql += `  \`diagnosis\` TEXT DEFAULT NULL,\n`;
  sql += `  \`prescription\` TEXT DEFAULT NULL,\n`;
  sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  if (patients.length > 0) {
    sql += `INSERT INTO \`patients\` (\`id\`, \`code\`, \`name\`, \`patient_type\`, \`no_rm\`, \`service\`, \`dob\`, \`gender\`, \`phone\`, \`address\`, \`visit_date\`, \`session_name\`, \`time_slot\`, \`complaint\`, \`status\`, \`vital_bp\`, \`vital_temp\`, \`vital_weight\`, \`vital_pulse\`, \`diagnosis\`, \`prescription\`)\nVALUES\n`;
    const patientValues = patients.map((p) => {
      return `(${escapeSql(p.id)}, ${escapeSql(p.code)}, ${escapeSql(p.name)}, ${escapeSql(p.patientType)}, ${escapeSql(p.noRM || '-')}, ${escapeSql(p.service)}, ${escapeSql(p.dob || null)}, ${escapeSql(p.gender)}, ${escapeSql(p.phone)}, ${escapeSql(p.address)}, ${escapeSql(p.visitDate)}, ${escapeSql(p.sessionName)}, ${escapeSql(p.timeSlot)}, ${escapeSql(p.complaint)}, ${escapeSql(p.status)}, ${escapeSql(p.vitalSigns?.bp)}, ${escapeSql(p.vitalSigns?.temp)}, ${escapeSql(p.vitalSigns?.weight)}, ${escapeSql(p.vitalSigns?.pulse)}, ${escapeSql(p.diagnosis)}, ${escapeSql(p.prescription)})`;
    });
    sql += patientValues.join(',\n') + '\n';
    sql += `ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`), \`diagnosis\` = VALUES(\`diagnosis\`), \`prescription\` = VALUES(\`prescription\`);\n\n`;
  }

  const blob = new Blob([sql], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `klinik_hapud_mysql_${new Date().toISOString().split('T')[0]}.sql`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

