import React, { useState, useEffect } from 'react';
import {
  FileText,
  CalendarClock,
  User,
  Activity,
  Ticket,
  Tv,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Phone,
  MapPin,
  Calendar,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  Sparkles,
  History,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  KeyRound,
  LogOut,
  Share2,
  Building2,
} from 'lucide-react';
import { Patient, PatientTab, ServiceType, SessionName, ClinicStatus, PatientUser, ExaminationRoom } from '../types';
import {
  SESSION_TIME_SLOTS,
  MAX_PATIENTS_PER_SLOT,
  SERVICE_PREFIXES,
  SERVICES_CATALOG,
  getDefaultRoomForPatient,
  DEFAULT_CLINIC_ROOMS,
} from '../data/constants';
import { formatDateIndo, calculateAge, findPatientByQueueOrPhone, generateWhatsAppLink } from '../utils/helpers';

interface PatientViewProps {
  activeTab: PatientTab;
  patients: Patient[];
  clinicRooms?: ExaminationRoom[];
  onRegisterPatient: (patientData: Omit<Patient, 'id' | 'code' | 'status' | 'createdAt'>) => void;
  onOpenCheckTicket: () => void;
  clinicStatus: ClinicStatus;
  initialLookupCode?: string;
  onClearInitialLookupCode?: () => void;
  patientUser?: PatientUser | null;
  onLogoutPatient?: () => void;
  onOpenChangePassword?: () => void;
  onOpenTicket?: (patient: Patient) => void;
  onNavigateTab?: (tab: PatientTab) => void;
}

export const PatientView: React.FC<PatientViewProps> = ({
  activeTab,
  patients,
  clinicRooms = DEFAULT_CLINIC_ROOMS,
  onRegisterPatient,
  onOpenCheckTicket,
  clinicStatus,
  initialLookupCode,
  onClearInitialLookupCode,
  patientUser,
  onLogoutPatient,
  onOpenChangePassword,
  onOpenTicket,
  onNavigateTab,
}) => {
  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [patientType, setPatientType] = useState<'Baru' | 'Lama'>(patientUser?.patientType || 'Baru');
  const [noRM, setNoRM] = useState(patientUser?.noRM || '');
  const [service, setService] = useState<ServiceType>('Konsultasi & Berobat Umum');
  const [visitDate, setVisitDate] = useState<string>(todayStr);
  const [sessionName, setSessionName] = useState<SessionName>('Sesi 1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const [name, setName] = useState(patientUser?.name || '');
  const [dob, setDob] = useState(patientUser?.dob || '');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>(patientUser?.gender || 'Laki-laki');
  const [phone, setPhone] = useState(patientUser?.phone || '');
  const [address, setAddress] = useState(patientUser?.address || '');
  const [complaint, setComplaint] = useState('');

  // Mode Selection: 'baru' | 'periksa_lagi'
  const [registrationMode, setRegistrationMode] = useState<'baru' | 'periksa_lagi'>('baru');
  const [previousQueueInput, setPreviousQueueInput] = useState<string>('');
  const [matchedPreviousPatient, setMatchedPreviousPatient] = useState<Patient | null>(null);
  const [lookupFeedback, setLookupFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Auto-fill when patientUser changes (if any)
  useEffect(() => {
    if (patientUser) {
      setName(patientUser.name);
      setPhone(patientUser.phone);
      setPatientType(patientUser.patientType);
      if (patientUser.noRM) setNoRM(patientUser.noRM);
      if (patientUser.dob) setDob(patientUser.dob);
      if (patientUser.gender) setGender(patientUser.gender);
      if (patientUser.address) setAddress(patientUser.address);
    }
  }, [patientUser]);

  // Lookup patient by previous queue number or phone
  const handleLookupPreviousPatient = (codeToSearch?: string) => {
    const q = codeToSearch !== undefined ? codeToSearch : previousQueueInput;
    const cleanQ = q.trim();
    if (!cleanQ) {
      setLookupFeedback({
        type: 'error',
        message: 'Silakan masukkan nomor antrean sebelumnya (contoh: A-1410-001) atau nomor WhatsApp Anda.',
      });
      return;
    }

    const found = findPatientByQueueOrPhone(cleanQ, patients);
    if (found) {
      setMatchedPreviousPatient(found);
      setPatientType('Lama');
      setName(found.name);
      setPhone(found.phone);
      setDob(found.dob || '');
      setGender(found.gender);
      setAddress(found.address || '');
      setNoRM(found.noRM && found.noRM !== '-' ? found.noRM : found.code);
      setService(found.service);
      setRegistrationMode('periksa_lagi');
      setLookupFeedback({
        type: 'success',
        message: `Data pasien "${found.name}" berhasil dicocokkan dari antrean ${found.code}! Data identitas otomatis disesuaikan.`,
      });
    } else {
      setMatchedPreviousPatient(null);
      setLookupFeedback({
        type: 'error',
        message: `Nomor antrean "${cleanQ}" tidak ditemukan. Pastikan kode benar atau ketik nomor WhatsApp yang pernah didaftarkan.`,
      });
    }
  };

  const handleResetForm = () => {
    setMatchedPreviousPatient(null);
    setPreviousQueueInput('');
    setLookupFeedback(null);
    setName(patientUser?.name || '');
    setPhone(patientUser?.phone || '');
    setAddress(patientUser?.address || '');
    setDob(patientUser?.dob || '');
    setGender(patientUser?.gender || 'Laki-laki');
    setNoRM(patientUser?.noRM || '');
    setPatientType(patientUser?.patientType || 'Baru');
    setComplaint('');
    setSelectedTimeSlot('');
    setRegistrationMode('baru');
    if (onClearInitialLookupCode) onClearInitialLookupCode();
  };

  // Auto lookup if initialLookupCode prop is provided (e.g. from Ticket or Search)
  useEffect(() => {
    if (initialLookupCode) {
      setRegistrationMode('periksa_lagi');
      setPreviousQueueInput(initialLookupCode);
      handleLookupPreviousPatient(initialLookupCode);
    }
  }, [initialLookupCode]);

  // Monitor Tab filter
  const [monitorSessionFilter, setMonitorSessionFilter] = useState<string>('ALL');

  // Stats calculation for today
  const todayPatients = patients.filter((p) => p.visitDate === todayStr && p.status !== 'Batal');
  const servingPatient = todayPatients.find((p) => p.status === 'Dipanggil');
  const waitingPatients = todayPatients.filter((p) => p.status === 'Menunggu');
  const nextPatient = waitingPatients[0];

  // Conflict & Quota check for current form date & session
  const currentSlots = SESSION_TIME_SLOTS[sessionName] || [];

  // Filter registrations/tickets belonging to this logged in patient
  const myTickets = patients.filter((p) => {
    if (!patientUser) return false;
    const pPhone = (p.phone || '').replace(/[^0-9]/g, '');
    const uPhone = (patientUser.phone || '').replace(/[^0-9]/g, '');
    const matchPhone = Boolean(pPhone && uPhone && (pPhone === uPhone || pPhone.endsWith(uPhone) || uPhone.endsWith(pPhone)));
    const pName = p.name.trim().toLowerCase();
    const uName = patientUser.name.trim().toLowerCase();
    const matchName = pName === uName || pName.includes(uName) || uName.includes(pName);
    const matchRM = Boolean(patientUser.noRM && patientUser.noRM !== '-' && p.noRM === patientUser.noRM);
    return matchPhone || matchName || matchRM;
  });

  const activeTicket = myTickets.find((t) => t.status === 'Dipanggil' || t.status === 'Menunggu') || myTickets[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimeSlot) {
      alert('Silakan pilih jam kunjungan spesifik terlebih dahulu!');
      return;
    }

    onRegisterPatient({
      name: name.trim(),
      patientType,
      noRM: patientType === 'Lama' ? noRM.trim() || 'RM-Lama' : '-',
      service,
      dob,
      gender,
      phone: phone.trim(),
      address: address.trim(),
      visitDate,
      sessionName,
      timeSlot: selectedTimeSlot,
      complaint: complaint.trim(),
      assignedRoom: getDefaultRoomForPatient(service, complaint),
    });

    // Reset form fields and navigate to account dashboard
    handleResetForm();
    if (onNavigateTab) {
      onNavigateTab('my-account');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* =========================================================================
          TAB 0: TAMPILAN AKUN PASIEN & TIKET PENDAFTARAN MASING-MASING
         ========================================================================= */}
      {activeTab === 'my-account' && (
        <div className="space-y-6">
          {/* 1. Header Profil Pasien Terdaftar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-teal-600/25 shrink-0">
                  {patientUser?.name.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full inline-block">
                      Akun Pasien
                    </span>
                    <span className="text-xs font-bold text-slate-400">• Terverifikasi</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {patientUser?.name || 'Pasien Klinik'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    Akun pendaftaran resmi pasien di Klinik H.APUD
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {onOpenChangePassword && (
                  <button
                    type="button"
                    onClick={onOpenChangePassword}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    title="Ubah kata sandi akun Anda"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ubah Sandi</span>
                  </button>
                )}
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('register')}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs transition shadow-md shadow-teal-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Daftar Berobat</span>
                  </button>
                )}
                {onLogoutPatient && (
                  <button
                    type="button"
                    onClick={onLogoutPatient}
                    className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition cursor-pointer"
                    title="Keluar dari akun ini"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid Detail Identitas Pasien */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-medium block text-[11px]">Status Kunjungan</span>
                <span className="font-extrabold text-teal-800 text-sm mt-0.5 inline-block">
                  {patientUser?.patientType === 'Baru' ? 'Pasien Baru' : `Pasien Lama (${patientUser?.noRM || 'RM'})`}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-medium block text-[11px]">No. WhatsApp</span>
                <span className="font-extrabold text-slate-800 text-sm mt-0.5 inline-block truncate max-w-full">
                  {patientUser?.phone || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-medium block text-[11px]">Jenis Kelamin & Usia</span>
                <span className="font-extrabold text-slate-800 text-sm mt-0.5 inline-block">
                  {patientUser?.gender || '-'} ({patientUser?.dob ? calculateAge(patientUser.dob) : '-'})
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-medium block text-[11px]">Alamat / Dusun</span>
                <span className="font-extrabold text-slate-800 text-sm mt-0.5 inline-block truncate max-w-full">
                  {patientUser?.address || 'Desa Mekarjaya'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Kartu Tiket Antrean Aktif Pasien */}
          {activeTicket ? (
            <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl transition-all relative overflow-hidden ${
              activeTicket.status === 'Dipanggil'
                ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 ring-4 ring-amber-400/50 animate-pulse'
                : activeTicket.status === 'Menunggu'
                ? 'bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900'
                : 'bg-gradient-to-r from-slate-800 to-slate-900'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                      Tiket Pendaftaran Anda
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      activeTicket.status === 'Dipanggil'
                        ? 'bg-white text-amber-900 font-extrabold'
                        : activeTicket.status === 'Menunggu'
                        ? 'bg-teal-400/30 text-teal-200'
                        : 'bg-emerald-400/30 text-emerald-200'
                    }`}>
                      Status: {activeTicket.status}
                    </span>
                  </div>

                  {activeTicket.status === 'Dipanggil' && (
                    <div className="p-3.5 bg-white text-slate-900 rounded-2xl border-2 border-amber-300 flex items-center gap-3 font-bold text-xs sm:text-sm shadow-lg">
                      <span className="text-2xl animate-bounce">🔔</span>
                      <div>
                        <p className="font-black text-amber-900">NOMOR ANDA SEDANG DIPANGGIL!</p>
                        <p className="text-xs text-slate-700">
                          Silakan langsung menuju: <strong className="text-teal-900 font-black">{activeTicket.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs text-teal-200 font-semibold">Nomor Antrean Anda</p>
                    <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                      {activeTicket.code}
                    </h2>
                  </div>

                  {/* Highlight Ruangan Tujuan Pasien */}
                  {(() => {
                    const roomInfo = clinicRooms.find(
                      (r) => r.name.toLowerCase() === (activeTicket.assignedRoom || '').toLowerCase()
                    );
                    return (
                      <div className="bg-amber-400/20 border border-amber-300/40 p-3.5 rounded-2xl backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-200 block text-[10px] uppercase font-black tracking-wider">
                                Ruangan Yang Bakal Dimasuki
                              </span>
                              {roomInfo?.status && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  roomInfo.status === 'Tersedia'
                                    ? 'bg-emerald-500/80 text-white'
                                    : roomInfo.status === 'Sedang Digunakan'
                                    ? 'bg-amber-500 text-slate-950 font-black'
                                    : 'bg-rose-500 text-white'
                                }`}>
                                  {roomInfo.status}
                                </span>
                              )}
                            </div>
                            <span className="font-black text-white text-base sm:text-lg block">
                              {activeTicket.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}
                            </span>
                            <span className="text-xs text-amber-100 font-medium block">
                              {roomInfo?.polyName ? `Pelayanan: ${roomInfo.polyName}` : 'Pemeriksaan Dokter & Pelayanan Medis'}
                              {roomInfo?.description ? ` • ${roomInfo.description}` : ''}
                            </span>
                          </div>
                        </div>
                        {(activeTicket.doctorName || roomInfo?.doctorName) && (
                          <div className="text-left sm:text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                            <span className="text-[10px] text-white/70 block uppercase font-bold">Dokter / Petugas</span>
                            <span className="text-xs text-white font-extrabold">
                              👨‍⚕️ {activeTicket.doctorName || roomInfo?.doctorName}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-white/90">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                      <span className="text-white/60 block text-[10px]">Jadwal Kunjungan</span>
                      <span className="font-bold">{formatDateIndo(activeTicket.visitDate)}</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                      <span className="text-white/60 block text-[10px]">Sesi & Jam Slot</span>
                      <span className="font-bold">{activeTicket.sessionName} ({activeTicket.timeSlot} WIB)</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                      <span className="text-white/60 block text-[10px]">Layanan Medis</span>
                      <span className="font-bold truncate block">{activeTicket.service}</span>
                    </div>
                  </div>

                  {activeTicket.complaint && (
                    <p className="text-xs text-white/80 bg-white/5 p-3 rounded-xl">
                      <span className="font-semibold text-white/60">Keluhan:</span> "{activeTicket.complaint}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
                  {onOpenTicket && (
                    <button
                      type="button"
                      onClick={() => onOpenTicket(activeTicket)}
                      className="w-full px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-2xl text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-teal-600" />
                      <span>Buka Tiket Digital Lengkap</span>
                    </button>
                  )}

                  <a
                    href={generateWhatsAppLink(activeTicket)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Kirim Tiket ke WhatsApp</span>
                  </a>

                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('monitor')}
                      className="w-full px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>Lihat Monitor Antrean</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Jika Pasien Belum Ada Tiket Kunjungan */
            <div className="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-3xl p-8 sm:p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-2xl mx-auto flex items-center justify-center">
                <CalendarClock className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-xl font-black text-slate-900">Belum Ada Pendaftaran Hari Ini</h3>
                <p className="text-xs text-slate-600">
                  Silakan buat pendaftaran baru untuk memilih sesi waktu dan jam kedatangan berobat tanpa antre berdesakan.
                </p>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('register')}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-teal-600/25 cursor-pointer inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Daftar Berobat Sekarang</span>
                </button>
              )}
            </div>
          )}

          {/* 3. Riwayat Seluruh Pendaftaran Pasien Tersebut */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-teal-600" />
                  <span>Riwayat Pendaftaran & Berobat Pasien</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar kunjungan yang pernah tercatat untuk akun Anda ({myTickets.length} kali)
                </p>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('register')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 transition cursor-pointer"
                >
                  + Tambah Kunjungan
                </button>
              )}
            </div>

            {myTickets.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada riwayat pendaftaran.</p>
            ) : (
              <div className="space-y-3">
                {myTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50/20 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                          {t.code}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Dipanggil'
                            ? 'bg-amber-100 text-amber-800 font-black animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {t.service}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Tanggal: <strong>{formatDateIndo(t.visitDate)}</strong> • {t.sessionName} ({t.timeSlot} WIB)
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-teal-600" />
                          <span>Ruang: {t.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}</span>
                        </span>
                        {t.doctorName && (
                          <span className="text-[11px] text-slate-600 font-semibold">
                            👨‍⚕️ {t.doctorName}
                          </span>
                        )}
                      </div>
                      {t.diagnosis && (
                        <p className="text-[11px] text-teal-900 bg-teal-50/80 px-2 py-1 rounded-md mt-1">
                          <strong>Diagnosis:</strong> {t.diagnosis}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onOpenTicket && (
                        <button
                          type="button"
                          onClick={() => onOpenTicket(t)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Lihat Tiket
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: FORM PENDAFTARAN
         ========================================================================= */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Registration Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>PENDAFTARAN PASIEN (LANGSUNG TANPA LOGIN)</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenCheckTicket}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cek Status / Cari Tiket Saya</span>
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="text-teal-600 w-6 h-6" />
                  Form Pendaftaran Berobat
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Pasien tidak perlu repot login! Cukup isi data diri untuk pasien baru, atau sesuaikan nomor antrean sebelumnya jika ingin periksa lagi.
                </p>
              </div>

              {/* Mode Selection Tabs: Pasien Baru vs Mau Periksa Lagi */}
              <div className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationMode('baru');
                      if (matchedPreviousPatient) {
                        handleResetForm();
                      }
                    }}
                    className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                      registrationMode === 'baru'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-2 ring-teal-500/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <User className="w-4 h-4 text-teal-600" />
                    <span>Pasien Baru (Daftar Pertama Kali)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationMode('periksa_lagi');
                    }}
                    className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                      registrationMode === 'periksa_lagi'
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-2 ring-teal-500/50'
                        : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Mau Periksa Lagi / Pasien Lama</span>
                  </button>
                </div>
              </div>

              {/* Box Lookup Nomor Antrean Sebelumnya (Untuk Pasien yang Mau Periksa Lagi) */}
              {registrationMode === 'periksa_lagi' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50/50 border-2 border-teal-300 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-teal-900">
                        Mau Periksa Lagi? Sesuaikan Nomor Antrean Sebelumnya
                      </h3>
                      <p className="text-[11px] sm:text-xs text-teal-700">
                        Masukkan kode nomor antrean sebelumnya (contoh: <strong className="font-mono">A-1410-001</strong>) atau nomor WhatsApp Anda. Data profil Anda akan otomatis terisi!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={previousQueueInput}
                        onChange={(e) => setPreviousQueueInput(e.target.value)}
                        placeholder="Contoh: A-1410-001 atau 081234567890"
                        className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 bg-white font-mono text-xs sm:text-sm uppercase font-bold text-slate-800 placeholder:normal-case placeholder:font-normal"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleLookupPreviousPatient();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLookupPreviousPatient()}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>Sesuaikan Data Pasien</span>
                    </button>
                  </div>

                  {lookupFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-start sm:items-center gap-2 ${
                        lookupFeedback.type === 'success'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : lookupFeedback.type === 'error'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-teal-100 text-teal-900 border border-teal-300'
                      }`}
                    >
                      {lookupFeedback.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5 sm:mt-0" />
                      )}
                      <span className="font-semibold">{lookupFeedback.message}</span>
                    </div>
                  )}

                  {/* Matched Patient Preview Card */}
                  {matchedPreviousPatient && (
                    <div className="p-3.5 rounded-xl bg-white border border-teal-200 shadow-xs space-y-2 mt-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-extrabold font-mono text-xs">
                            No. Antrean: {matchedPreviousPatient.code}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {matchedPreviousPatient.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="text-[11px] font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                        >
                          Ganti / Bersihkan Data
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">WhatsApp:</span>
                          <span className="font-bold text-slate-700">{matchedPreviousPatient.phone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Usia / Tgl Lahir:</span>
                          <span className="font-bold text-slate-700">
                            {calculateAge(matchedPreviousPatient.dob)} ({matchedPreviousPatient.dob || '-'})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Kunjungan Terakhir:</span>
                          <span className="font-bold text-slate-700">
                            {formatDateIndo(matchedPreviousPatient.visitDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Layanan Sebelumnya:</span>
                          <span className="font-bold text-teal-800 truncate block">
                            {matchedPreviousPatient.service}
                          </span>
                        </div>
                      </div>

                      {matchedPreviousPatient.diagnosis && (
                        <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <span className="font-bold text-slate-700 block">Riwayat Medis Kunjungan Sebelumnya:</span>
                          <p className="mt-0.5">
                            <strong>Diagnosis:</strong> {matchedPreviousPatient.diagnosis}
                            {matchedPreviousPatient.prescription && ` • Resep: ${matchedPreviousPatient.prescription}`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Alert when Clinic is Closed */}
              {!clinicStatus.isOpen && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-black text-sm text-rose-800">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>KLINIK SEDANG TUTUP SEMENTARA</span>
                  </div>
                  <p className="text-xs font-semibold text-rose-800">
                    {clinicStatus.reason || 'Pelayanan pendaftaran hari ini sedang ditutup'}
                  </p>
                  <p className="text-[11px] text-rose-700">
                    {clinicStatus.reopenEstimate || 'Silakan coba kembali pada jadwal buka berikutnya.'}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* 1. Patient Type */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Status Pasien <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition border-2 ${
                      patientType === 'Baru'
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pType"
                      checked={patientType === 'Baru'}
                      onChange={() => setPatientType('Baru')}
                      className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">Pasien Baru</p>
                      <p className="text-[11px] text-slate-500">Belum ada no. rekam medis</p>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition border-2 ${
                      patientType === 'Lama'
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pType"
                      checked={patientType === 'Lama'}
                      onChange={() => setPatientType('Lama')}
                      className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">Pasien Lama / Periksa Lagi</p>
                      <p className="text-[11px] text-slate-500">Sudah punya No. RM / nomor antrean sebelumnya</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Conditional RM Code Input */}
              {patientType === 'Lama' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-800">
                    Nomor Rekam Medis (No. RM) <span className="text-slate-400 font-normal">(jika ingat)</span>
                  </label>
                  <input
                    type="text"
                    value={noRM}
                    onChange={(e) => setNoRM(e.target.value)}
                    placeholder="Contoh: RM-2025-081"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                  />
                  <p className="text-[11px] text-slate-500">
                    Bisa ditemukan di kartu berobat lama Anda. Jika lupa, petugas akan mencarikan arsip Anda.
                  </p>
                </div>
              )}

              {/* 2. Medical Service Choice */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Jenis Layanan Medis <span className="text-rose-500">*</span>
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as ServiceType)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white font-medium"
                >
                  <option value="Konsultasi & Berobat Umum">
                    Konsultasi & Berobat Umum (Kode: A) - Rp 35rb - 65rb
                  </option>
                  <option value="Perawatan Luka & Jahit">
                    Perawatan Luka / Jahit / Verban (Kode: B) - Rp 50rb - 150rb
                  </option>
                  <option value="Cek Darah & Tensi">
                    Cek Darah (Gula/Kolesterol/Asam Urat) & Tensi (Kode: C) - Rp 15rb - 45rb
                  </option>
                  <option value="Khitan / Sunat Modern">
                    Khitan / Sunat Modern (Kode: K) - Rp 650rb - 1.2jt
                  </option>
                  <option value="Layanan Home Care">
                    Layanan Home Care / Panggil Ke Rumah (Kode: HC) - Rp 100rb - 250rb
                  </option>
                </select>
              </div>

              {/* 3. Date, Session & Time Slots (Conflict Prevention Logic) */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-teal-600" />
                    Tanggal, Sesi & Jam Kunjungan
                  </h3>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Maks {MAX_PATIENTS_PER_SLOT} Pasien / Jam
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      1. Tanggal Kunjungan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      min={todayStr}
                      onChange={(e) => {
                        setVisitDate(e.target.value);
                        setSelectedTimeSlot('');
                      }}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2. Pilihan Sesi Praktik <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={sessionName}
                      onChange={(e) => {
                        setSessionName(e.target.value as SessionName);
                        setSelectedTimeSlot('');
                      }}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white font-medium"
                    >
                      <option value="Sesi 1">Sesi 1 (Pagi: 08:00 - 12:00 WIB)</option>
                      <option value="Sesi 2">Sesi 2 (Siang/Sore: 13:00 - 17:00 WIB)</option>
                      <option value="Sesi 3">Sesi 3 (Malam: 18:30 - 21:00 WIB)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Time Slots Grid */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-800">
                      3. Pilih Jam Spesifik Bebas Antre <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-slate-500 text-[11px]">
                      {selectedTimeSlot ? (
                        <span className="font-bold text-teal-700">Terpilih: {selectedTimeSlot} WIB</span>
                      ) : (
                        '(Klik salah satu kotak jam di bawah)'
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {currentSlots.map((slot) => {
                      const bookedCount = patients.filter(
                        (p) =>
                          p.visitDate === visitDate &&
                          p.sessionName === sessionName &&
                          p.timeSlot === slot &&
                          p.status !== 'Batal'
                      ).length;

                      const isFull = bookedCount >= MAX_PATIENTS_PER_SLOT;

                      // Check if time slot is past for today
                      const isToday = visitDate === todayStr;
                      const [h, m] = slot.split(':').map(Number);
                      const now = new Date();
                      const isPastTime =
                        isToday &&
                        (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()));

                      const isDisabled = isFull || isPastTime;
                      const isSelected = selectedTimeSlot === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer relative ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500 font-bold shadow-xs'
                              : isDisabled
                                ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                : 'bg-white border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                          }`}
                        >
                          <span className="text-sm font-extrabold">{slot} WIB</span>
                          <span
                            className={`text-[10px] mt-1 px-2 py-0.5 rounded-md font-semibold ${
                              isFull
                                ? 'bg-rose-100 text-rose-700'
                                : isPastTime
                                  ? 'bg-slate-200 text-slate-500'
                                  : isSelected
                                    ? 'bg-teal-200 text-teal-900'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isFull
                              ? 'PENUH'
                              : isPastTime
                                ? 'Lewat Jam'
                                : `${bookedCount}/${MAX_PATIENTS_PER_SLOT} Terisi`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {!selectedTimeSlot && (
                    <p className="text-[11px] text-amber-600 flex items-center gap-1.5 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Silakan klik salah satu jam di atas untuk melanjutkan pendaftaran.
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Personal Information */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  Identitas Diri Pasien
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap Pasien <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Sesuai KTP / KK (Contoh: Ahmad Fadilah)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Lahir <span className="text-rose-500">*</span>
                      {dob && (
                        <span className="text-teal-700 font-bold ml-1">
                          ({calculateAge(dob)})
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={dob}
                      max={todayStr}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Kelamin <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="081234567890"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Untuk pengiriman notifikasi tiket digital.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Lengkap / Dusun <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="Dusun, RT/RW, Desa"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Complaints */}
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Keluhan Utama / Gejala
                </h3>
                <textarea
                  rows={2}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  required
                  placeholder="Jelaskan secara singkat gejala yang dirasakan (contoh: batuk berdahak 3 hari, demam, nyeri tenggorokan)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm bg-white"
                />

                {/* Rekomendasi Ruangan Otomatis Berdasarkan Poli & Keluhan */}
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-teal-800 block">
                        Rekomendasi Ruangan Pemeriksaan
                      </span>
                      <span className="font-extrabold text-slate-900 truncate block">
                        {getDefaultRoomForPatient(service, complaint)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-teal-800 bg-teal-200/60 font-bold px-2 py-0.5 rounded-full shrink-0">
                    Sesuai Poli & Keluhan
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!clinicStatus.isOpen}
                className={`w-full font-extrabold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 text-sm ${
                  clinicStatus.isOpen
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                {registrationMode === 'periksa_lagi' || patientType === 'Lama' ? (
                  <RotateCcw className="w-5 h-5" />
                ) : (
                  <Ticket className="w-5 h-5" />
                )}
                <span>
                  {clinicStatus.isOpen
                    ? registrationMode === 'periksa_lagi' || patientType === 'Lama'
                      ? 'Daftar Antrean Periksa Lagi (Dapatkan No. Antrean Hari Ini)'
                      : 'Daftar Antrean Pasien Baru Sekarang'
                    : 'Pendaftaran Ditutup Sementara (Klinik Tutup)'}
                </span>
              </button>

              {!clinicStatus.isOpen && (
                <div className="text-center pt-1">
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    <span>Ada Kondisi Darurat? Hubungi WhatsApp Petugas: 0812-3456-7890</span>
                  </a>
                </div>
              )}
            </form>
          </div>

          {/* Sticky Side Column: Live Queue Status & Clinic Info */}
          <div className="space-y-6">
            {/* Live Serving Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  Panggilan Sesi Aktif
                </span>
                {servingPatient && (
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {servingPatient.code}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Klinik H.APUD</h3>
                <p className="text-xs text-slate-400">Jl.Sukaresmi Desa Mekarjaya, Compreng, Subang</p>
              </div>

              <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-5 rounded-2xl text-center">
                <p className="text-xs text-slate-400 font-semibold mb-1">Sedang Diperiksa</p>
                <p className="text-4xl sm:text-5xl font-black text-amber-400 tracking-wider">
                  {servingPatient ? servingPatient.code : '--'}
                </p>
                <p className="text-xs text-slate-200 mt-2 font-bold truncate">
                  {servingPatient ? servingPatient.name : 'Belum Ada Pasien Dipanggil'}
                </p>
                {servingPatient && (
                  <p className="text-[11px] text-teal-300 mt-0.5">
                    {servingPatient.sessionName} • {servingPatient.timeSlot} WIB
                  </p>
                )}
              </div>

              <div className="flex justify-between text-xs text-slate-300 border-t border-slate-800 pt-3">
                <span>
                  Menunggu:{' '}
                  <strong className="text-white font-extrabold">{waitingPatients.length} Pasien</strong>
                </span>
                <span>
                  Total Hari Ini:{' '}
                  <strong className="text-white font-extrabold">{todayPatients.length}</strong>
                </span>
              </div>
            </div>

            {/* Quick Ticket Lookup Shortcut */}
            <div className="bg-teal-50 rounded-3xl p-6 border border-teal-200 space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-700" />
                <h4 className="font-extrabold text-teal-900 text-sm">Sudah Pernah Mendaftar?</h4>
              </div>
              <p className="text-xs text-teal-700 leading-relaxed">
                Kehilangan tiket antrean atau ingin mengecek ulang jam kunjungan? Anda dapat mencari tiket
                kapan saja.
              </p>
              <button
                type="button"
                onClick={onOpenCheckTicket}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buka Tiket Saya</span>
              </button>
            </div>

            {/* Session Rules Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-teal-600" /> Ketentuan Sesi & Jam
              </h4>
              <div className="text-xs text-slate-600 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-teal-900">Sesi 1 (Pagi)</p>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      08:00 - 12:00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Slot jam: 08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-teal-900">Sesi 2 (Siang/Sore)</p>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      13:00 - 17:00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Slot jam: 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-teal-900">Sesi 3 (Malam)</p>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      18:30 - 21:00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Slot jam: 18:30, 19:00, 19:30, 20:00, 20:30
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MONITOR ANTREAN REAL-TIME
         ========================================================================= */}
      {activeTab === 'monitor' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 mb-2">
                <Tv className="w-3.5 h-3.5 text-teal-600" />
                <span>LAYAR MONITOR PASIEN</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                Monitor Antrean Real-Time
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Layar pantau pergerakan antrean pasien Klinik H.APUD per Sesi Jam kunjungan.
              </p>
            </div>
          </div>

          {/* Banner if Closed */}
          {!clinicStatus.isOpen && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <p className="font-black text-sm">KLINIK SEDANG TUTUP</p>
                  <p className="text-xs text-rose-800 mt-0.5">
                    {clinicStatus.reason || 'Pelayanan pemeriksaan antrean sedang diistirahatkan'} •{' '}
                    <span className="font-bold">{clinicStatus.reopenEstimate}</span>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-200 text-rose-900 shrink-0 uppercase tracking-wider">
                Tutup
              </span>
            </div>
          )}

          {/* 3 Main Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Currently Being Examined */}
            <div className="bg-teal-50 border-2 border-teal-500 rounded-3xl p-6 text-center relative overflow-hidden shadow-xs">
              <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <p className="text-xs font-bold text-teal-800 uppercase tracking-widest">
                Sedang Dipanggil / Diperiksa
              </p>
              <p className="text-5xl sm:text-6xl font-black text-teal-800 my-3">
                {servingPatient ? servingPatient.code : '--'}
              </p>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {servingPatient ? servingPatient.name : 'Tidak Ada Pasien'}
              </p>
              {servingPatient && (
                <div className="mt-2 text-xs text-teal-800 font-bold bg-teal-100/80 py-1.5 px-3 rounded-xl inline-block shadow-2xs">
                  🏢 Silakan Masuk: {servingPatient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}
                </div>
              )}
            </div>

            {/* Next in Line */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-center">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                Berikutnya Menunggu
              </p>
              <p className="text-5xl sm:text-6xl font-black text-amber-600 my-3">
                {nextPatient ? nextPatient.code : '--'}
              </p>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {nextPatient ? nextPatient.name : 'Belum Ada'}
              </p>
              {nextPatient && (
                <div className="mt-2 text-xs text-amber-900 font-semibold bg-amber-100/70 py-1 px-2.5 rounded-lg inline-block">
                  {nextPatient.sessionName} • {nextPatient.timeSlot} WIB • 🏢 {nextPatient.assignedRoom || 'Ruang Periksa 1'}
                </div>
              )}
            </div>

            {/* Total Registered Today */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-center flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Terdaftar Hari Ini
              </p>
              <p className="text-5xl sm:text-6xl font-black text-slate-900 my-3">
                {todayPatients.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {waitingPatients.length} Menunggu •{' '}
                {todayPatients.filter((p) => p.status === 'Selesai').length} Selesai
              </p>
            </div>
          </div>

          {/* Visual Board: Status & Ruangan Pemeriksaan Hari Ini */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Daftar Ruangan Pemeriksaan & Poli Klinik ({clinicRooms.length} Ruangan)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Lihat ruangan yang akan Anda masuki, dokter jaga, dan status ruangan secara langsung.
                </p>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Pembaruan Real-Time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {clinicRooms.map((room) => {
                const isMyRoom = activeTicket?.assignedRoom && activeTicket.assignedRoom.toLowerCase() === room.name.toLowerCase();
                const roomPatients = todayPatients.filter(
                  (p) => (p.assignedRoom || '').toLowerCase() === room.name.toLowerCase()
                );
                const currentExamined = roomPatients.find((p) => p.status === 'Dipanggil');
                const waitingInRoomCount = roomPatients.filter((p) => p.status === 'Menunggu').length;

                return (
                  <div
                    key={room.id}
                    className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between space-y-3 ${
                      isMyRoom
                        ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-400 shadow-md'
                        : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    {isMyRoom && (
                      <div className="bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 -mx-4 -mt-4 mb-2 flex items-center justify-between shadow-xs">
                        <span>🎯 Ruangan Bakal Anda Masuki</span>
                        <span>Nomor Anda: {activeTicket.code}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-black text-slate-900 text-sm leading-snug">{room.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                            (room.status || 'Tersedia') === 'Tersedia'
                              ? 'bg-emerald-100 text-emerald-800'
                              : (room.status || 'Tersedia') === 'Sedang Digunakan'
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {room.status || 'Tersedia'}
                        </span>
                      </div>
                      <p className="text-xs text-teal-800 font-bold">{room.polyName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{room.description || 'Lantai 1 Klinik H.APUD'}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span className="text-[11px] text-slate-400">Dokter:</span>
                        <strong className="text-slate-800 text-[11px] truncate">
                          👨‍⚕️ {room.doctorName || 'Dokter Jaga'}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500">
                          {waitingInRoomCount} antrean menunggu
                        </span>
                        {currentExamined ? (
                          <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md text-[10px] animate-pulse">
                            Diperiksa: {currentExamined.code}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[10px]">
                            Siap Pasien Baru
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Header with Session Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Daftar Urutan Pasien Hari Ini ({formatDateIndo(todayStr)})
            </h3>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={monitorSessionFilter}
                onChange={(e) => setMonitorSessionFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="ALL">Semua Sesi</option>
                <option value="Sesi 1">Sesi 1 (Pagi)</option>
                <option value="Sesi 2">Sesi 2 (Siang)</option>
                <option value="Sesi 3">Sesi 3 (Malam)</option>
              </select>
            </div>
          </div>

          {/* Queue Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-extrabold">
                  <th className="p-3.5">No. Antrean</th>
                  <th className="p-3.5">Nama Pasien</th>
                  <th className="p-3.5">Sesi & Jam</th>
                  <th className="p-3.5">Ruangan Tujuan</th>
                  <th className="p-3.5">Layanan</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {todayPatients
                  .filter(
                    (p) =>
                      monitorSessionFilter === 'ALL' || p.sessionName === monitorSessionFilter
                  )
                  .map((p) => {
                    let badge = (
                      <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold text-xs">
                        Menunggu
                      </span>
                    );
                    if (p.status === 'Dipanggil') {
                      badge = (
                        <span className="bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-1 rounded-full font-bold text-xs animate-pulse">
                          Sedang Diperiksa
                        </span>
                      );
                    } else if (p.status === 'Selesai') {
                      badge = (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-xs">
                          Selesai
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={p.id}
                        className={`transition ${
                          p.status === 'Dipanggil'
                            ? 'bg-teal-50/70 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3.5 font-black text-teal-700 text-base">{p.code}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3.5 text-slate-700 font-semibold">
                          {p.sessionName}{' '}
                          <span className="text-xs font-bold text-teal-700">
                            ({p.timeSlot} WIB)
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 inline-flex items-center gap-1.5 text-xs">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>{p.assignedRoom || 'Ruang Periksa 1'}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">{p.service}</td>
                        <td className="p-3.5">{badge}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: JADWAL SESI & BIAYA
         ========================================================================= */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 mb-2">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>INFORMASI KLINIK & TARIF</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Rincian Jam Operasional, Sesi & Estimasi Biaya
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Jadwal pembagian 3 Sesi Pelayanan Klinik H.APUD agar pasien terlayani secara teliti tanpa
              terjadi bentrok jam berobat.
            </p>
          </div>

          {/* 2 Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Card */}
            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 bg-slate-50/50">
              <h3 className="font-extrabold text-teal-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Jadwal 3 Sesi Pelayanan Klinik H.APUD
              </h3>
              <ul className="text-xs text-slate-600 space-y-3.5 divide-y divide-slate-200">
                <li className="pt-2 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Sesi 1 (Pagi)</p>
                    <p className="text-slate-400">Senin s/d Sabtu</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">Kapasitas: Maks 5 Pasien/Jam</p>
                  </div>
                  <strong className="text-teal-700 font-black text-sm">08:00 - 12:00 WIB</strong>
                </li>
                <li className="pt-3 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Sesi 2 (Siang / Sore)</p>
                    <p className="text-slate-400">Senin s/d Sabtu</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">Kapasitas: Maks 5 Pasien/Jam</p>
                  </div>
                  <strong className="text-teal-700 font-black text-sm">13:00 - 17:00 WIB</strong>
                </li>
                <li className="pt-3 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Sesi 3 (Malam)</p>
                    <p className="text-slate-400">Senin s/d Sabtu</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">Kapasitas: Maks 5 Pasien/Jam</p>
                  </div>
                  <strong className="text-teal-700 font-black text-sm">18:30 - 21:00 WIB</strong>
                </li>
              </ul>
            </div>

            {/* Location & Emergency Contact Card */}
            <div className="border border-slate-200 rounded-2xl p-6 space-y-4 bg-slate-50/50">
              <h3 className="font-extrabold text-teal-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Lokasi & Kontak Darurat
              </h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <p className="font-bold text-slate-900">Alamat Klinik:</p>
                  <p className="text-slate-600 mt-0.5">
                    Jl.Sukaresmi Desa Mekarjaya Kecamatan Compreng Kabupaten Subang, Jawa Barat 41258
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Tenaga Medis Penanggung Jawab:</p>
                  <p className="text-slate-600 mt-0.5">
                    H. APUD, S.Kep., Ners (Surat Izin Perawat Resmi)
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Darurat / Konsultasi (0812-3456-7890)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Service Price Catalog */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Daftar Layanan Medis & Estimasi Biaya
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES_CATALOG.map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 transition space-y-3 bg-white"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800">
                      Kode: {item.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.duration}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Estimasi Biaya:</span>
                    <strong className="text-teal-700 font-bold">{item.priceRange}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
