import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Ticket,
  CheckCircle,
  Clock,
  RotateCcw,
  Building2,
  User,
  Phone,
  ShieldCheck,
  Lock,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Patient, PatientStatus, PatientUser } from '../../types';
import { formatDateIndo, calculateAge } from '../../utils/helpers';

interface CheckTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectTicket: (patient: Patient) => void;
  initialQuery?: string;
  onRecheckWithCode?: (code: string) => void;
  isAdminLoggedIn?: boolean;
  patientUser?: PatientUser | null;
}

export const CheckTicketModal: React.FC<CheckTicketModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSelectTicket,
  initialQuery = '',
  onRecheckWithCode,
  isAdminLoggedIn = false,
  patientUser = null,
}) => {
  // Admin search state
  const [adminQuery, setAdminQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Patient private verification state
  const [searchCode, setSearchCode] = useState(initialQuery);
  const [searchPhone, setSearchPhone] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Sync initial query when modal opens
  useEffect(() => {
    if (initialQuery) {
      if (isAdminLoggedIn) {
        setAdminQuery(initialQuery);
      } else {
        setSearchCode(initialQuery);
        setHasSearched(true);
      }
    }
  }, [initialQuery, isAdminLoggedIn, isOpen]);

  if (!isOpen) return null;

  // --- LOGIC FOR ADMIN MODE ---
  const trimmedAdminQuery = adminQuery.trim().toLowerCase();
  const adminFilteredPatients = patients.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (!trimmedAdminQuery) return true;
    return (
      p.code.toLowerCase().includes(trimmedAdminQuery) ||
      p.phone.includes(trimmedAdminQuery) ||
      p.name.toLowerCase().includes(trimmedAdminQuery) ||
      (p.noRM || '').toLowerCase().includes(trimmedAdminQuery) ||
      (p.assignedRoom || '').toLowerCase().includes(trimmedAdminQuery) ||
      p.service.toLowerCase().includes(trimmedAdminQuery) ||
      p.complaint.toLowerCase().includes(trimmedAdminQuery)
    );
  });

  const waitingCount = patients.filter((p) => p.status === 'Menunggu').length;
  const callingCount = patients.filter((p) => p.status === 'Dipanggil').length;
  const doneCount = patients.filter((p) => p.status === 'Selesai').length;

  // --- LOGIC FOR PATIENT PRIVATE MODE ---
  // If user is already logged in as patient, find their own registered tickets
  const myAccountTickets = patientUser
    ? patients.filter((p) => {
        const pPhone = (p.phone || '').replace(/[^0-9]/g, '');
        const uPhone = (patientUser.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = Boolean(pPhone && uPhone && (pPhone === uPhone || pPhone.endsWith(uPhone) || uPhone.endsWith(pPhone)));
        const pName = p.name.trim().toLowerCase();
        const uName = patientUser.name.trim().toLowerCase();
        const matchName = pName === uName || pName.includes(uName) || uName.includes(pName);
        return matchPhone || matchName;
      })
    : [];

  // Verified private search lookup
  const cleanCode = searchCode.trim().toLowerCase();
  const cleanPhone = searchPhone.trim().replace(/[^0-9]/g, '');

  const verifiedSearchResults = hasSearched
    ? patients.filter((p) => {
        const pCode = p.code.toLowerCase();
        const pPhone = (p.phone || '').replace(/[^0-9]/g, '');

        if (cleanCode && cleanPhone) {
          const codeMatch = pCode.includes(cleanCode) || cleanCode.includes(pCode);
          const phoneMatch = pPhone.includes(cleanPhone) || cleanPhone.includes(pPhone);
          return codeMatch && phoneMatch;
        }
        if (cleanCode) {
          return pCode === cleanCode;
        }
        if (cleanPhone && cleanPhone.length >= 4) {
          return pPhone.endsWith(cleanPhone) || pPhone === cleanPhone;
        }
        return false;
      })
    : [];

  // Combined private patient tickets (Only their own!)
  const myVisibleTickets: Patient[] = (() => {
    const list: Patient[] = [];
    const seenIds = new Set<string>();

    for (const t of myAccountTickets) {
      if (!seenIds.has(t.id)) {
        seenIds.add(t.id);
        list.push(t);
      }
    }
    for (const t of verifiedSearchResults) {
      if (!seenIds.has(t.id)) {
        seenIds.add(t.id);
        list.push(t);
      }
    }
    return list;
  })();

  const handlePatientVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    if (!cleanCode && !cleanPhone) {
      setVerificationError('Silakan masukkan Nomor Antrean atau Nomor WhatsApp Anda.');
      return;
    }
    setHasSearched(true);
  };

  const handleResetSearch = () => {
    setSearchCode('');
    setSearchPhone('');
    setHasSearched(false);
    setVerificationError('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isAdminLoggedIn
                ? 'bg-slate-900 text-amber-400 border-slate-700'
                : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}>
              {isAdminLoggedIn ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6 text-teal-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg">
                  {isAdminLoggedIn ? 'Cek Tiket Pasien (Petugas)' : 'Cek Tiket Saya'}
                </h3>
                {isAdminLoggedIn ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    {patients.length} Tiket Terdaftar
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Privasi Terlindungi</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdminLoggedIn
                  ? 'Panel rekapitulasi seluruh antrean klinik • Pencarian dan status pasien'
                  : 'Data antrean bersifat rahasia • Hanya Anda yang dapat melihat tiket milik sendiri'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* CASE A: ADMIN VIEW (Full clinical access for staff)            */}
        {/* ============================================================== */}
        {isAdminLoggedIn ? (
          <>
            {/* Search & Status Filter Controls */}
            <div className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={adminQuery}
                  onChange={(e) => setAdminQuery(e.target.value)}
                  placeholder="Cari Nama Pasien / No. Antrean (A-001) / No. WhatsApp / Poli..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs sm:text-sm font-semibold"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {adminQuery && (
                  <button
                    type="button"
                    onClick={() => setAdminQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({patients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Menunggu')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    statusFilter === 'Menunggu'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Menunggu ({waitingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Dipanggil')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    statusFilter === 'Dipanggil'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                  }`}
                >
                  Dipanggil ({callingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Selesai')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    statusFilter === 'Selesai'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Selesai ({doneCount})
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
              {adminFilteredPatients.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                  <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">Tidak ada tiket yang sesuai kriteria.</p>
                  <p className="text-xs text-slate-400">
                    {adminQuery ? `Tidak ada hasil untuk pencarian "${adminQuery}".` : 'Belum ada tiket terdaftar pada filter ini.'}
                  </p>
                </div>
              ) : (
                adminFilteredPatients.map((p) => {
                  const badgeClass =
                    p.status === 'Dipanggil'
                      ? 'bg-teal-100 text-teal-800 border border-teal-300 animate-pulse font-black'
                      : p.status === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : p.status === 'Batal'
                      ? 'bg-rose-100 text-rose-800 font-bold'
                      : 'bg-amber-100 text-amber-800 font-bold';

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/20 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group shadow-2xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-teal-800 text-base bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                            {p.code}
                          </span>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {p.status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {p.patientType === 'Baru' ? 'Pasien Baru' : `Pasien Lama (${p.noRM || 'RM'})`}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-900 text-sm leading-snug">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {p.gender} • {calculateAge(p.dob)} • WA: {p.phone}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 pt-0.5">
                          <span className="font-semibold text-slate-800">
                            🗓️ {formatDateIndo(p.visitDate)} ({p.sessionName} • {p.timeSlot} WIB)
                          </span>
                          <span>• Layanan: <strong className="text-slate-800">{p.service}</strong></span>
                        </div>

                        <div className="bg-teal-50/80 border border-teal-200 px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-900">
                          <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Ruangan: {p.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}</span>
                          {p.doctorName && (
                            <span className="text-teal-700 font-normal ml-1">
                              (👨‍⚕️ {p.doctorName})
                            </span>
                          )}
                        </div>

                        {p.complaint && (
                          <p className="text-[11px] text-slate-500 italic truncate max-w-md">
                            "{p.complaint}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
                        {onRecheckWithCode && (
                          <button
                            type="button"
                            onClick={() => {
                              onRecheckWithCode(p.code);
                              onClose();
                            }}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer border border-teal-200"
                            title="Periksa lagi menggunakan data nomor antrean ini"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Periksa Lagi</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTicket(p);
                            onClose();
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-600/20"
                        >
                          <Ticket className="w-3.5 h-3.5 text-teal-200" />
                          <span>Buka Tiket</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* ============================================================== */
          /* CASE B: PATIENT PRIVATE VIEW (Cannot see other patients)        */
          /* ============================================================== */
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
            {/* Privacy Box Banner */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900 leading-relaxed">
                <strong className="block font-bold text-emerald-950">Privasi Medis Terjaga</strong>
                Sistem Klinik H.APUD menjamin kerahasiaan identitas dan riwayat berobat. Tiket antrean hanya dapat diakses oleh Anda dengan mencocokkan Nomor Antrean atau Nomor WhatsApp yang didaftarkan.
              </div>
            </div>

            {/* Verification & Lookup Form */}
            <form onSubmit={handlePatientVerifySubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor Antrean Anda
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      placeholder="Contoh: A-001 atau K-001"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs font-semibold bg-white"
                    />
                    <Ticket className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP Terdaftar
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs font-semibold bg-white"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {verificationError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{verificationError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {(searchCode || searchPhone || hasSearched) && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verifikasi & Lihat Tiket Saya</span>
                </button>
              </div>
            </form>

            {/* Results: Strictly ONLY the patient's own tickets */}
            <div className="space-y-3 pt-1">
              {myVisibleTickets.length > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1">
                    <span className="flex items-center gap-1.5 text-teal-800">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>Tiket Antrean Terverifikasi Milik Anda ({myVisibleTickets.length})</span>
                    </span>
                  </div>

                  {myVisibleTickets.map((p) => {
                    const badgeClass =
                      p.status === 'Dipanggil'
                        ? 'bg-teal-100 text-teal-800 border border-teal-300 animate-pulse font-black'
                        : p.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : p.status === 'Batal'
                        ? 'bg-rose-100 text-rose-800 font-bold'
                        : 'bg-amber-100 text-amber-800 font-bold';

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl border-2 border-teal-300 bg-white shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in duration-200"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-teal-800 text-base bg-teal-50 px-3 py-0.5 rounded-lg border border-teal-200">
                              {p.code}
                            </span>
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>
                              {p.status}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Milik Anda
                            </span>
                          </div>

                          <div>
                            <h4 className="font-black text-slate-900 text-sm leading-snug">{p.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Layanan: <strong className="text-slate-800">{p.service}</strong> • Sesi: {p.sessionName} ({p.timeSlot} WIB)
                            </p>
                          </div>

                          <div className="bg-teal-50/80 border border-teal-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-2 text-[11px] font-bold text-teal-900 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>Tujuan: {p.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}</span>
                            {p.doctorName && (
                              <span className="text-teal-700 font-normal">
                                • 👨‍⚕️ {p.doctorName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTicket(p);
                              onClose();
                            }}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-600/20"
                          >
                            <Ticket className="w-4 h-4 text-teal-200" />
                            <span>Buka & Cetak Tiket Saya</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : hasSearched ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl space-y-2 p-4">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Tiket Tidak Ditemukan atau Data Tidak Cocok</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Pastikan Nomor Antrean dan Nomor WhatsApp yang dimasukkan sudah sama persis dengan yang Anda daftarkan. Data pasien lain tidak dapat ditampilkan demi menjaga privasi.
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl space-y-2 p-4">
                  <Lock className="w-8 h-8 text-teal-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Pencarian Tiket Pribadi</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Masukkan Nomor Antrean atau Nomor WhatsApp Anda pada formulir di atas untuk menampilkan tiket Anda.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">
            {isAdminLoggedIn
              ? `Menampilkan ${adminFilteredPatients.length} dari ${patients.length} tiket pasien klinik`
              : 'Privasi Pasien Dijamin • Klinik H.APUD'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
