export type ServiceType =
  | 'Konsultasi & Berobat Umum'
  | 'Perawatan Luka & Jahit'
  | 'Cek Darah & Tensi'
  | 'Khitan / Sunat Modern'
  | 'Layanan Home Care';

export type SessionName = 'Sesi 1' | 'Sesi 2' | 'Sesi 3';

export type PatientStatus = 'Menunggu' | 'Dipanggil' | 'Selesai' | 'Batal';

export interface VitalSigns {
  bp?: string; // Tekanan Darah (e.g., 120/80)
  temp?: string; // Suhu tubuh (e.g., 36.8 C)
  weight?: string; // Berat badan (kg)
  pulse?: string; // Denyut nadi (bpm)
}

export interface ExaminationRoom {
  id: string;
  name: string;
  polyName: string;
  doctorName?: string;
  description?: string;
  status?: 'Tersedia' | 'Sedang Digunakan' | 'Sterilisasi';
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  patientType: 'Baru' | 'Lama';
  noRM?: string;
  service: ServiceType;
  dob: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  address: string;
  visitDate: string; // YYYY-MM-DD
  sessionName: SessionName;
  timeSlot: string; // e.g. "08:00"
  complaint: string;
  status: PatientStatus;
  assignedRoom?: string; // Ruang periksa yang dituju
  doctorName?: string; // Dokter/tenaga medis yang memeriksa
  vitalSigns?: VitalSigns;
  diagnosis?: string;
  prescription?: string;
  createdAt: string;
}

export type PortalType = 'landing' | 'patient' | 'admin';
export type PatientTab = 'my-account' | 'register' | 'monitor' | 'info';

export interface ClinicStatus {
  isOpen: boolean;
  mode: 'auto' | 'manual';
  reason?: string;
  reopenEstimate?: string;
  updatedAt?: string;
}

export interface PatientAccount {
  id: string;
  name: string;
  password: string;
  phone: string;
  patientType: 'Baru' | 'Lama';
  noRM?: string;
  dob?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  address?: string;
  createdAt: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt?: string;
}

export interface PatientUser {
  id?: string;
  name: string;
  phone: string;
  patientType: 'Baru' | 'Lama';
  noRM?: string;
  dob?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  address?: string;
}
