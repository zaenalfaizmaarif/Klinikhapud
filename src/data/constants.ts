import { Patient, ServiceType, SessionName, AdminCredentials, PatientAccount, ExaminationRoom, Doctor } from '../types';

export const DEFAULT_CLINIC_ROOMS: ExaminationRoom[] = [
  {
    id: 'room-1',
    name: 'Ruang Periksa 1 (Poli Umum)',
    polyName: 'Poli Umum & Konsultasi',
    doctorName: 'dr. H. Apud S.',
    description: 'Lantai 1 - Ruang Utama Dekat Ruang Tunggu',
    status: 'Tersedia',
  },
  {
    id: 'room-2',
    name: 'Ruang Periksa 2 (Poli KIA / Ibu & Anak)',
    polyName: 'Pemeriksaan Ibu, Anak & KB',
    doctorName: 'Bidan Hj. Dewi R., S.Tr.Keb',
    description: 'Lantai 1 - Sayap Kanan',
    status: 'Tersedia',
  },
  {
    id: 'room-3',
    name: 'Ruang Tindakan Bedah & Luka',
    polyName: 'Tindakan Medis, Jahit Luka & Operasi Kecil',
    doctorName: 'dr. H. Apud S. & Tim Medis',
    description: 'Lantai 1 - Ruang Steril Tindakan',
    status: 'Tersedia',
  },
  {
    id: 'room-khitan',
    name: 'Ruang Khitan / Sunat Modern',
    polyName: 'Poli Khitan / Sunat Anak & Dewasa',
    doctorName: 'dr. H. Apud S. & Tim Khitan',
    description: 'Lantai 1 - Ruang Khusus Khitan Nyaman, Ramah Anak & Steril',
    status: 'Tersedia',
  },
  {
    id: 'room-4',
    name: 'Ruang Laboratorium & Cek Darah',
    polyName: 'Laboratorium & Diagnostik Cepat',
    doctorName: 'Analis Medis Klinik',
    description: 'Lantai 1 - Sebelah Loket Obat',
    status: 'Tersedia',
  },
  {
    id: 'room-hc',
    name: 'Kunjungan Luar (Home Care)',
    polyName: 'Layanan Medis ke Rumah Pasien',
    doctorName: 'Tim Perawat Home Care',
    description: 'Alamat / Tempat Tinggal Pasien',
    status: 'Tersedia',
  },
];

export const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'dr. H. Apud S.',
    specialty: 'Dokter Umum & Penanggung Jawab Medis',
    sipNumber: '446.1/SIP-D/2023/089',
    phone: '0812-9876-0001',
    assignedPoly: 'Poli Umum & Tindakan Bedah Luka',
    schedule: 'Senin - Sabtu (08:00 - 21:00 WIB)',
    status: 'Praktik',
  },
  {
    id: 'doc-2',
    name: 'Bidan Hj. Dewi R., S.Tr.Keb',
    specialty: 'Kebidanan, KIA, Imunisasi & KB',
    sipNumber: '446.2/SIPB/2022/045',
    phone: '0812-9876-0002',
    assignedPoly: 'Poli KIA / Ibu & Anak',
    schedule: 'Senin - Sabtu (08:00 - 16:00 WIB)',
    status: 'Praktik',
  },
  {
    id: 'doc-3',
    name: 'dr. H. Apud S. & Tim Khitan',
    specialty: 'Khitan / Sunat Modern & Bedah Minor',
    sipNumber: '446.1/SIP-KHITAN/2024/012',
    phone: '0812-9876-0003',
    assignedPoly: 'Ruang Khitan / Sunat Modern',
    schedule: 'Setiap Hari (Sesuai Booking Jadwal)',
    status: 'Praktik',
  },
  {
    id: 'doc-4',
    name: 'Analis Medis Klinik',
    specialty: 'Diagnostik Laboratorium & Patologi Klinis',
    sipNumber: '446.3/SIP-ATLM/2023/102',
    phone: '0812-9876-0004',
    assignedPoly: 'Laboratorium & Cek Darah',
    schedule: 'Senin - Minggu (08:00 - 20:00 WIB)',
    status: 'Praktik',
  },
  {
    id: 'doc-5',
    name: 'Tim Perawat Home Care',
    specialty: 'Perawat Pelayanan Medis Kunjungan Rumah',
    sipNumber: '446.4/SIPP/2023/218',
    phone: '0812-9876-0005',
    assignedPoly: 'Kunjungan Luar (Home Care)',
    schedule: 'Sesuai Janji Kunjungan Pasien',
    status: 'Aktif',
  },
];

export function getDefaultRoomForPatient(service: ServiceType, complaint: string = ''): string {
  const lowerService = service.toLowerCase();
  const lowerComplaint = complaint.toLowerCase();

  if (lowerService.includes('home care')) {
    return 'Kunjungan Luar (Home Care)';
  }
  if (
    lowerService.includes('khitan') ||
    lowerService.includes('sunat') ||
    lowerComplaint.includes('khitan') ||
    lowerComplaint.includes('sunat')
  ) {
    return 'Ruang Khitan / Sunat Modern';
  }
  if (
    lowerService.includes('luka') ||
    lowerComplaint.includes('jahit') ||
    lowerComplaint.includes('luka') ||
    lowerComplaint.includes('robek') ||
    lowerComplaint.includes('darah mengalir')
  ) {
    return 'Ruang Tindakan Bedah & Luka';
  }
  if (
    lowerService.includes('darah') ||
    lowerService.includes('laboratorium') ||
    lowerComplaint.includes('kolesterol') ||
    lowerComplaint.includes('gula darah') ||
    lowerComplaint.includes('asam urat')
  ) {
    return 'Ruang Laboratorium & Cek Darah';
  }
  if (
    lowerComplaint.includes('hamil') ||
    lowerComplaint.includes('kandungan') ||
    lowerComplaint.includes('anak') ||
    lowerComplaint.includes('bayi') ||
    lowerComplaint.includes('balita') ||
    lowerComplaint.includes('kb') ||
    lowerComplaint.includes('imunisasi')
  ) {
    return 'Ruang Periksa 2 (Poli KIA / Ibu & Anak)';
  }
  return 'Ruang Periksa 1 (Poli Umum)';
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_PATIENT_ACCOUNTS: PatientAccount[] = [
  {
    id: 'acc-1',
    name: 'Ibu Siti Aminah',
    password: 'siti123',
    phone: '081298765432',
    patientType: 'Lama',
    noRM: 'RM-2025-081',
    dob: '1982-04-15',
    gender: 'Perempuan',
    address: 'Dusun Sukamaju RT 02/03',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    name: 'Ahmad Fadilah',
    password: 'ahmad123',
    phone: '081234567890',
    patientType: 'Baru',
    noRM: '-',
    dob: '1995-08-20',
    gender: 'Laki-laki',
    address: 'Desa Mekarjaya, Compreng',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    name: 'Bpk. Budi Santoso',
    password: 'budi123',
    phone: '085712345678',
    patientType: 'Baru',
    noRM: '-',
    dob: '1990-11-20',
    gender: 'Laki-laki',
    address: 'Jl. Pemuda No. 45 Desa Karanganyar',
    createdAt: new Date().toISOString(),
  },
];

export const SESSION_TIME_SLOTS: Record<SessionName, string[]> = {
  'Sesi 1': ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  'Sesi 2': ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  'Sesi 3': ['18:30', '19:00', '19:30', '20:00', '20:30'],
};

export const MAX_PATIENTS_PER_SLOT = 5;

export const SERVICE_PREFIXES: Record<ServiceType, string> = {
  'Konsultasi & Berobat Umum': 'A',
  'Perawatan Luka & Jahit': 'B',
  'Cek Darah & Tensi': 'C',
  'Khitan / Sunat Modern': 'K',
  'Layanan Home Care': 'HC',
};

export interface ServiceDetail {
  title: ServiceType;
  code: string;
  badgeColor: string;
  priceRange: string;
  description: string;
  duration: string;
}

export const SERVICES_CATALOG: ServiceDetail[] = [
  {
    title: 'Konsultasi & Berobat Umum',
    code: 'A',
    badgeColor: 'blue',
    priceRange: 'Rp 35.000 - Rp 65.000',
    description: 'Pemeriksaan keluhan demam, batuk, flu, lambung, hipertensi, dan obat standar.',
    duration: '10 - 15 Menit',
  },
  {
    title: 'Perawatan Luka & Jahit',
    code: 'B',
    badgeColor: 'amber',
    priceRange: 'Rp 50.000 - Rp 150.000',
    description: 'Pembersihan luka, hecting/jahit luka terbuka, angkat jahitan, dan ganti balutan modern.',
    duration: '20 - 30 Menit',
  },
  {
    title: 'Cek Darah & Tensi',
    code: 'C',
    badgeColor: 'emerald',
    priceRange: 'Rp 15.000 - Rp 45.000',
    description: 'Tes cepat Gula Darah Sewaktu, Asam Urat, Kolesterol Total, serta cek tensi digital & manual.',
    duration: '5 - 10 Menit',
  },
  {
    title: 'Khitan / Sunat Modern',
    code: 'K',
    badgeColor: 'purple',
    priceRange: 'Rp 650.000 - Rp 1.200.000',
    description: 'Metode sunat laser / cincin / lem minim rasa sakit, cepat sembuh untuk anak dan dewasa.',
    duration: '30 - 45 Menit',
  },
  {
    title: 'Layanan Home Care',
    code: 'HC',
    badgeColor: 'rose',
    priceRange: 'Rp 100.000 - Rp 250.000',
    description: 'Layanan kunjungan petugas medis ke rumah pasien untuk pasang infus, selang NGT, kateter, perawatan lansia.',
    duration: 'Sesuai Jadwal',
  },
];

const getTodayString = () => new Date().toISOString().split('T')[0];
const getTodayDayMonth = () => {
  const now = new Date();
  const d = ('0' + now.getDate()).slice(-2);
  const m = ('0' + (now.getMonth() + 1)).slice(-2);
  return `${d}${m}`;
};

const dm = getTodayDayMonth();

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pt-1',
    code: `A-${dm}-001`,
    name: 'Ibu Siti Aminah',
    patientType: 'Lama',
    noRM: 'RM-2025-081',
    service: 'Konsultasi & Berobat Umum',
    dob: '1982-04-15',
    gender: 'Perempuan',
    phone: '081298765432',
    address: 'Dusun Sukamaju RT 02/03',
    visitDate: getTodayString(),
    sessionName: 'Sesi 1',
    timeSlot: '08:00',
    complaint: 'Demam tinggi 2 hari, meriang, dan pusing berdenyut.',
    status: 'Selesai',
    assignedRoom: 'Ruang Periksa 1 (Poli Umum)',
    doctorName: 'dr. H. Apud S.',
    vitalSigns: { bp: '115/75', temp: '37.8', pulse: '82', weight: '58' },
    diagnosis: 'Febris Akut / Suspek Infeksi Saluran Napas Atas',
    prescription: 'Paracetamol 500mg 3x1 tablet, Vitamin C 500mg 1x1 tablet, Amoxicillin 500mg 3x1 (dihabiskan).',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'pt-2',
    code: `B-${dm}-001`,
    name: 'Bpk. Budi Santoso',
    patientType: 'Baru',
    noRM: '-',
    service: 'Perawatan Luka & Jahit',
    dob: '1990-11-20',
    gender: 'Laki-laki',
    phone: '085712345678',
    address: 'Jl. Pemuda No. 45 Desa Karanganyar',
    visitDate: getTodayString(),
    sessionName: 'Sesi 1',
    timeSlot: '08:30',
    complaint: 'Luka robek di telapak kaki terkena pecahan kaca saat bertani.',
    status: 'Dipanggil',
    assignedRoom: 'Ruang Tindakan Bedah & Luka',
    doctorName: 'dr. H. Apud S. & Tim Medis',
    vitalSigns: { bp: '130/85', temp: '36.6', pulse: '78', weight: '65' },
    diagnosis: 'Vulnus Laceratum Regio Pedis Sinistra',
    prescription: 'Hecting 3 jahitan, Injeksi ATS / Antitetanus, Cefadroxil 500mg 2x1, Asam Mefenamat 500mg 3x1.',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'pt-3',
    code: `C-${dm}-001`,
    name: 'Ibu Dewi Lestari',
    patientType: 'Lama',
    noRM: 'RM-2024-119',
    service: 'Cek Darah & Tensi',
    dob: '1975-06-12',
    gender: 'Perempuan',
    phone: '081344556677',
    address: 'Komplek Asri No. 12',
    visitDate: getTodayString(),
    sessionName: 'Sesi 1',
    timeSlot: '09:00',
    complaint: 'Kontrol rutin tensi darah tinggi dan cek gula darah puasa.',
    status: 'Menunggu',
    assignedRoom: 'Ruang Laboratorium & Cek Darah',
    doctorName: 'Analis Medis Klinik',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'pt-4',
    code: `A-${dm}-002`,
    name: 'Ahmad Fauzi',
    patientType: 'Baru',
    noRM: '-',
    service: 'Konsultasi & Berobat Umum',
    dob: '2001-09-05',
    gender: 'Laki-laki',
    phone: '082155667788',
    address: 'Desa Sidomulyo RT 01/01',
    visitDate: getTodayString(),
    sessionName: 'Sesi 2',
    timeSlot: '13:00',
    complaint: 'Perut kembung, mual muntah setelah makan pedas.',
    status: 'Menunggu',
    assignedRoom: 'Ruang Periksa 1 (Poli Umum)',
    doctorName: 'dr. H. Apud S.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pt-5',
    code: `K-${dm}-001`,
    name: 'M. Rizky Pratama (Anak)',
    patientType: 'Baru',
    noRM: '-',
    service: 'Khitan / Sunat Modern',
    dob: '2016-07-10',
    gender: 'Laki-laki',
    phone: '081233445566',
    address: 'Dusun Mekarsari RT 04/02',
    visitDate: getTodayString(),
    sessionName: 'Sesi 1',
    timeSlot: '10:00',
    complaint: 'Tindakan khitan sunat modern anak metode cincin & lem tanpa perban.',
    status: 'Menunggu',
    assignedRoom: 'Ruang Khitan / Sunat Modern',
    doctorName: 'dr. H. Apud S. & Tim Khitan',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];
