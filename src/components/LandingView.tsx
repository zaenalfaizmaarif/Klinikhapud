import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle,
  Search,
  CalendarCheck,
  Activity,
  PhoneCall,
  MapPin,
} from 'lucide-react';
import { Patient, ClinicStatus, PatientUser } from '../types';

interface LandingViewProps {
  onSelectPatientPortal: () => void;
  onRequestAdminAccess: () => void;
  onSearchTicket: (query: string) => void;
  patients: Patient[];
  clinicStatus: ClinicStatus;
  patientUser?: PatientUser | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectPatientPortal,
  onRequestAdminAccess,
  onSearchTicket,
  patients,
  clinicStatus,
  patientUser,
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  const myActiveTicket = patientUser
    ? patients.find((p) => {
        const pPhone = (p.phone || '').replace(/[^0-9]/g, '');
        const uPhone = (patientUser.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = Boolean(pPhone && uPhone && (pPhone === uPhone || pPhone.endsWith(uPhone) || uPhone.endsWith(pPhone)));
        const pName = p.name.trim().toLowerCase();
        const uName = patientUser.name.trim().toLowerCase();
        const matchName = pName === uName || pName.includes(uName) || uName.includes(pName);
        return matchPhone || matchName;
      })
    : null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPatients = patients.filter((p) => p.visitDate === todayStr && p.status !== 'Batal');
  const servingPatient = todayPatients.find((p) => p.status === 'Dipanggil');
  const waitingCount = todayPatients.filter((p) => p.status === 'Menunggu').length;
  const completedCount = todayPatients.filter((p) => p.status === 'Selesai').length;

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      onSearchTicket(quickQuery.trim());
    }
  };

  return (
    <div className="space-y-8 py-4 sm:py-6 animate-in fade-in duration-300">
      {/* Alert Banner when Clinic is Closed */}
      {!clinicStatus.isOpen && (
        <div className="max-w-4xl mx-auto bg-rose-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-white/20 rounded-2xl shrink-0">
              <Clock className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-rose-800 uppercase tracking-wider">
                  Pemberitahuan
                </span>
                <span className="text-xs font-bold text-rose-200">Klinik Sedang Tutup</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {clinicStatus.reason || 'Pelayanan pendaftaran hari ini sedang ditutup'}
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                {clinicStatus.reopenEstimate || 'Silakan cek kembali pada jadwal sesi berikutnya.'}
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-white text-rose-900 hover:bg-rose-50 font-black text-xs rounded-xl shadow-md transition shrink-0 flex items-center gap-2"
          >
            <span>Hubungi Darurat WA</span>
          </a>
        </div>
      )}

      {/* Personalized Patient Banner (Instantly available on Mobile) */}
      {patientUser && (
        <div className="max-w-4xl mx-auto bg-teal-50 border-2 border-teal-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-teal-600/20">
              {patientUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-200/70 text-teal-900 px-2.5 py-0.5 rounded-full">
                  Akun Anda Aktif
                </span>
                {myActiveTicket && (
                  <span className="text-xs font-mono font-black text-teal-800">
                    Tiket: {myActiveTicket.code}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                Halo, {patientUser.name}!
              </h3>
              <p className="text-xs text-slate-600">
                {myActiveTicket
                  ? `Jadwal: ${myActiveTicket.sessionName} (${myActiveTicket.timeSlot} WIB) • Status: ${myActiveTicket.status} • Masuk: ${myActiveTicket.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}`
                  : 'Anda dapat langsung masuk ke portal pasien untuk melihat jadwal atau mendaftar berobat.'}
              </p>
            </div>
          </div>

          <button
            onClick={onSelectPatientPortal}
            className="w-full sm:w-auto px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <span>{myActiveTicket ? 'Buka Tiket Antrean Saya' : 'Buka Akun Saya'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
          <CalendarCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>SISTEM TERINTEGRASI SESI JAM & ANTI BENTROK</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Selamat Datang di <span className="text-teal-700">Klinik H.APUD</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Pusat Pelayanan Kesehatan Klinik H.APUD. Daftarkan diri Anda secara online, pilih jam
          spesifik bebas antre berdesakan, dan pantau status antrean secara langsung.
        </p>
      </div>

      {/* Real-Time Live Status Bar */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Status Klinik Hari Ini
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">
              {servingPatient
                ? `Sedang Diperiksa: Antrean ${servingPatient.code} (${servingPatient.name})`
                : 'Pemeriksaan Aktif Siap Melayani'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-6 text-center">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Menunggu</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-400">{waitingCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Selesai</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">{completedCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Pasien</p>
            <p className="text-xl sm:text-2xl font-extrabold text-white">{todayPatients.length}</p>
          </div>
        </div>
      </div>

      {/* Main Two Portal Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto pt-2">
        {/* Option Card 1: Patient Portal */}
        <div
          onClick={onSelectPatientPortal}
          className="group relative bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6 hover:-translate-y-1 duration-200"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                Akses Pasien & Pendaftaran
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1 group-hover:text-teal-600 transition-colors">
                Pendaftaran Pasien
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                Langsung daftar berobat tanpa perlu login! Untuk pasien baru cukup isi data diri, dan jika mau periksa lagi cukup sesuaikan dengan nomor antrean sebelumnya.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold border border-teal-200">
                ⚡ Langsung Tanpa Login
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold border border-teal-200">
                🔄 Sesuaikan No. Antrean Lama
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                📅 Kode Antrean Unik Tiap Hari
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                ✓ Booking Bebas Bentrok
              </span>
            </div>
          </div>

          <div className="flex items-center font-bold text-sm text-teal-600 gap-2 border-t border-slate-100 pt-4">
            <span>Daftar Berobat Sekarang (Tanpa Login)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Option Card 2: Admin Portal */}
        <div
          onClick={onRequestAdminAccess}
          className="group relative bg-slate-900 border-2 border-slate-800 hover:border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6 text-white hover:-translate-y-1 duration-200"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Khusus Petugas & Admin Klinik
              </span>
              <h2 className="text-2xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                Portal Admin Klinik
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Login petugas untuk mengelola antrean per sesi jam, panggil pasien dengan suara otomatis, atur status buka/tutup (08:00 - 21:00 WIB otomatis), dan catat rekam medis.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                🔒 Sandi Admin Tersinkron
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                📢 Panggilan Suara Otomatis
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                ⏰ Otomatis 08:00 - 21:00 WIB
              </span>
            </div>
          </div>

          <div className="flex items-center font-bold text-sm text-amber-400 gap-2 border-t border-slate-800 pt-4">
            <span>Login Admin Klinik</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Fast Check Ticket Lookup Box */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-teal-600" />
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
            Sudah Mendaftar? Cari Tiket Anda Di Sini
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Ketik Nomor Antrean (contoh: A-001) atau Nomor WhatsApp yang didaftarkan untuk menampilkan
          kembali tiket atau memeriksa status panggilan.
        </p>

        <form onSubmit={handleQuickSearchSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Masukkan No. Antrean (A-001) / No. WhatsApp..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Cari</span>
          </button>
        </form>
      </div>

      {/* Clinic Operating Sessions & Location Info Strip */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">3 Sesi Pelayanan Teratur</h4>
            <p className="text-slate-500 mt-0.5">
              Pagi (08:00 - 12:00) • Siang (13:00 - 17:00) • Malam (18:30 - 21:00)
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Anti Bentrok Jam</h4>
            <p className="text-slate-500 mt-0.5">
              Kapasitas maksimal 5 pasien per jam demi pelayanan teliti dan nyaman.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Klinik H.APUD</h4>
            <p className="text-slate-500 mt-0.5">
              Jl.Sukaresmi Desa Mekarjaya Kecamatan Compreng Kabupaten Subang, Jawa Barat 41258 • WA: 0812-3456-7890
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
