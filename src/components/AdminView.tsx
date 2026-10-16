import React, { useState } from 'react';
import {
  Volume2,
  Printer,
  FileSpreadsheet,
  PlusCircle,
  LogOut,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  FileText,
  Ticket,
  Trash2,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Power,
  KeyRound,
  Database,
  FolderArchive,
} from 'lucide-react';
import { Patient, PatientStatus, SessionName, ClinicStatus } from '../types';
import { formatDateIndo, calculateAge, exportToCSV, exportToMySQLScript } from '../utils/helpers';
import { speakCallout, playChime } from '../utils/audio';

interface AdminViewProps {
  patients: Patient[];
  clinicStatus: ClinicStatus;
  onOpenClinicStatusModal: () => void;
  onCallPatient: (patient: Patient) => void;
  onCallNextPatient: () => void;
  onChangePatientStatus: (patientId: string, status: PatientStatus) => void;
  onOpenMedicalNotes: (patient: Patient) => void;
  onOpenTicket: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onOpenWalkInModal: () => void;
  onOpenPrintReport: () => void;
  onResetDemoData: () => void;
  onLogout: () => void;
  onOpenChangeAdminPassword?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  patients,
  clinicStatus,
  onOpenClinicStatusModal,
  onCallPatient,
  onCallNextPatient,
  onChangePatientStatus,
  onOpenMedicalNotes,
  onOpenTicket,
  onDeletePatient,
  onOpenWalkInModal,
  onOpenPrintReport,
  onResetDemoData,
  onLogout,
  onOpenChangeAdminPassword,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters state
  const [filterSession, setFilterSession] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDateMode, setFilterDateMode] = useState<'today' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered list
  const filteredPatients = patients.filter((p) => {
    if (filterDateMode === 'today' && p.visitDate !== todayStr) return false;
    if (filterSession !== 'ALL' && p.sessionName !== filterSession) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchPhone = p.phone.includes(q);
      const matchRM = (p.noRM || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchPhone && !matchRM) return false;
    }
    return true;
  });

  // Today specific counts
  const todayPatients = patients.filter((p) => p.visitDate === todayStr);
  const totalToday = todayPatients.length;
  const sesi1Count = todayPatients.filter((p) => p.sessionName === 'Sesi 1').length;
  const sesi2Count = todayPatients.filter((p) => p.sessionName === 'Sesi 2').length;
  const sesi3Count = todayPatients.filter((p) => p.sessionName === 'Sesi 3').length;
  const completedToday = todayPatients.filter((p) => p.status === 'Selesai').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Admin Control Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-400 border border-teal-500/30 uppercase tracking-widest">
              Akses Petugas / Admin
            </span>
            <span className="text-xs text-slate-400">• Terhubung Real-Time</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Panel Kelola Antrean & Sesi Jam
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Atur urutan per Sesi jam, panggil pasien dengan suara otomatis, dan catat rekam medis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Clinic Open/Closed Toggle Button */}
          <button
            onClick={onOpenClinicStatusModal}
            className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
              clinicStatus.isOpen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 ring-2 ring-rose-400 animate-pulse'
            }`}
            title="Klik untuk mengubah status Buka / Tutup Klinik (Tersinkron langsung ke layar pasien)"
          >
            <Power className="w-4 h-4" />
            <span>{clinicStatus.isOpen ? 'Status: BUKA' : 'Status: TUTUP'}</span>
          </button>

          {/* Call Next Button */}
          <button
            onClick={onCallNextPatient}
            className="flex-1 sm:flex-initial px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Panggil Berikutnya</span>
          </button>

          {/* Quick Register / Walk-in */}
          <button
            onClick={onOpenWalkInModal}
            className="px-3.5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Daftar Pasien Langsung di Tempat"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Walk-In</span>
          </button>

          {/* Print Report */}
          <button
            onClick={onOpenPrintReport}
            className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Cetak Laporan Rekapitulasi"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Laporan</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportToCSV(patients)}
            className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Export Database MySQL (.sql) */}
          <button
            onClick={() => exportToMySQLScript(patients)}
            className="px-3.5 py-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Download File Database MySQL (.sql) untuk VS Code & phpMyAdmin"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export MySQL</span>
          </button>

          {/* Download Project Source Code ZIP */}
          <a
            href="/Klinik_H.APUD.zip"
            download="Klinik_H.APUD.zip"
            className="px-3.5 py-3 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Download Seluruh Folder Proyek untuk Dibuka di VS Code"
          >
            <FolderArchive className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Download Proyek (VS Code)</span>
          </a>

          {/* Change Admin Password */}
          {onOpenChangeAdminPassword && (
            <button
              onClick={onOpenChangeAdminPassword}
              className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Ubah Sandi Baru Admin"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Ubah Sandi</span>
            </button>
          )}

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemoData}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl text-xs transition cursor-pointer"
            title="Reset Contoh Data Antrean"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-3 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-2xl text-xs transition cursor-pointer"
            title="Keluar dari Portal Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Stats Row (Per Session Today) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Hari Ini</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{totalToday}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pasien terdaftar</p>
        </div>

        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 shadow-xs">
          <p className="text-xs text-blue-900 font-bold uppercase tracking-wider">Sesi 1 (Pagi)</p>
          <p className="text-3xl font-black text-blue-700 mt-2">{sesi1Count}</p>
          <p className="text-[11px] text-blue-500 mt-0.5">08:00 - 12:00 WIB</p>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-xs text-amber-900 font-bold uppercase tracking-wider">Sesi 2 (Siang)</p>
          <p className="text-3xl font-black text-amber-700 mt-2">{sesi2Count}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">13:00 - 17:00 WIB</p>
        </div>

        <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 shadow-xs">
          <p className="text-xs text-indigo-900 font-bold uppercase tracking-wider">Sesi 3 (Malam)</p>
          <p className="text-3xl font-black text-indigo-700 mt-2">{sesi3Count}</p>
          <p className="text-[11px] text-indigo-500 mt-0.5">18:30 - 21:00 WIB</p>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-xs text-emerald-900 font-bold uppercase tracking-wider">Selesai Diperiksa</p>
          <p className="text-3xl font-black text-emerald-700 mt-2">{completedToday}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Sudah tertangani</p>
        </div>
      </div>

      {/* Main Patient Data Table Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        {/* Table Filters Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <User className="text-teal-600 w-5 h-5" />
              Daftar Pasien Terdaftar
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredPatients.length} dari total {patients.length} data pasien
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Date Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold text-slate-600">
              <button
                onClick={() => setFilterDateMode('today')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterDateMode === 'today' ? 'bg-white text-slate-900 shadow-xs' : ''
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setFilterDateMode('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterDateMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : ''
                }`}
              >
                Semua Tanggal
              </button>
            </div>

            {/* Session Filter */}
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">Semua Sesi</option>
              <option value="Sesi 1">Sesi 1 (Pagi)</option>
              <option value="Sesi 2">Sesi 2 (Siang)</option>
              <option value="Sesi 3">Sesi 3 (Malam)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Dipanggil">Dipanggil</option>
              <option value="Selesai">Selesai</option>
              <option value="Batal">Batal</option>
            </select>

            {/* Search Box */}
            <div className="relative flex-1 md:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama / Kode..."
                className="w-full pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-teal-500 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-extrabold">
                <th className="p-3.5">No. Antrean</th>
                <th className="p-3.5">Identitas Pasien</th>
                <th className="p-3.5">Sesi & Jam</th>
                <th className="p-3.5">Layanan & Keluhan</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                    Tidak ada data pendaftaran yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  let badge = (
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">
                      Menunggu
                    </span>
                  );
                  if (p.status === 'Dipanggil') {
                    badge = (
                      <span className="bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                        Dipanggil
                      </span>
                    );
                  } else if (p.status === 'Selesai') {
                    badge = (
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        Selesai
                      </span>
                    );
                  } else if (p.status === 'Batal') {
                    badge = (
                      <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        Batal
                      </span>
                    );
                  }

                  const hasMedicalNotes = Boolean(p.diagnosis || p.prescription);

                  return (
                    <tr
                      key={p.id}
                      className={`transition ${
                        p.status === 'Dipanggil'
                          ? 'bg-teal-50/70 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Queue Code & Type */}
                      <td className="p-3.5">
                        <span className="font-black text-teal-800 text-base block">{p.code}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {p.patientType === 'Baru' ? 'Pasien Baru' : `Lama (${p.noRM})`}
                        </span>
                      </td>

                      {/* Patient Identity */}
                      <td className="p-3.5">
                        <p className="font-extrabold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {p.gender} • {calculateAge(p.dob)} • WA: {p.phone}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.address}</p>
                      </td>

                      {/* Session & Time Slot */}
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 text-xs">{p.sessionName}</p>
                        <p className="text-[11px] font-extrabold text-teal-700">
                          {p.timeSlot} WIB
                        </p>
                        <p className="text-[10px] text-slate-400">{formatDateIndo(p.visitDate)}</p>
                      </td>

                      {/* Service & Complaint & Notes Indicator */}
                      <td className="p-3.5 max-w-xs">
                        <p className="font-semibold text-slate-900 text-xs">{p.service}</p>
                        <p className="text-[11px] text-slate-500 italic truncate" title={p.complaint}>
                          "{p.complaint}"
                        </p>
                        {hasMedicalNotes && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            <HeartPulse className="w-3 h-3" />
                            Ada Catatan Resep
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{badge}</td>

                      {/* Action Controls */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Call / Speak (Excluded for Home Care) */}
                          {p.service.toLowerCase().includes('home care') ? (
                            <span
                              className="px-2 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold rounded-xl flex items-center justify-center select-none"
                              title="Layanan Home Care (Kunjungan Rumah) - Petugas datang ke lokasi, tanpa panggilan pengeras suara klinik"
                            >
                              Home Care
                            </span>
                          ) : (
                            <button
                              onClick={() => onCallPatient(p)}
                              title="Panggil Suara Pasien"
                              className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Complete Check */}
                          <button
                            onClick={() => onChangePatientStatus(p.id, 'Selesai')}
                            title="Tandai Selesai Diperiksa"
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          {/* Medical Notes & Prescription */}
                          <button
                            onClick={() => onOpenMedicalNotes(p)}
                            title="Catatan Rekam Medis & Resep"
                            className={`p-2 rounded-xl transition cursor-pointer ${
                              hasMedicalNotes
                                ? 'bg-teal-600 text-white hover:bg-teal-700'
                                : 'bg-teal-100 hover:bg-teal-200 text-teal-900'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* View Ticket */}
                          <button
                            onClick={() => onOpenTicket(p)}
                            title="Lihat / Cetak Tiket"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                          >
                            <Ticket className="w-4 h-4" />
                          </button>

                          {/* Cancel or Restore */}
                          {p.status === 'Batal' ? (
                            <button
                              onClick={() => onChangePatientStatus(p.id, 'Menunggu')}
                              title="Kembalikan ke Menunggu"
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onChangePatientStatus(p.id, 'Batal')}
                              title="Batalkan Antrean"
                              className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl transition cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => onDeletePatient(p.id)}
                            title="Hapus Data"
                            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
