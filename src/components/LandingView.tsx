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
  Stethoscope,
  Scissors,
  HeartPulse,
  TestTube,
  Home,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Patient, ClinicStatus, PatientUser, ServiceType } from '../types';
import { SERVICES_CATALOG } from '../data/constants';

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

  const getServiceIcon = (title: ServiceType) => {
    switch (title) {
      case 'Khitan / Sunat Modern':
        return <Scissors className="w-5 h-5 text-purple-600" />;
      case 'Konsultasi & Berobat Umum':
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
      case 'Perawatan Luka & Jahit':
        return <HeartPulse className="w-5 h-5 text-amber-600" />;
      case 'Cek Darah & Tensi':
        return <TestTube className="w-5 h-5 text-emerald-600" />;
      case 'Layanan Home Care':
        return <Home className="w-5 h-5 text-rose-600" />;
      default:
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-10 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* Alert Banner saat Klinik Tutup */}
      {!clinicStatus.isOpen && (
        <div className="max-w-5xl mx-auto bg-rose-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
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
            className="px-4 py-2.5 bg-white text-rose-900 hover:bg-rose-50 font-black text-xs rounded-xl shadow-md transition shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>Hubungi Darurat WA</span>
          </a>
        </div>
      )}

      {/* Banner Pasien Terdaftar (Jika sudah punya akun aktif) */}
      {patientUser && (
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-300/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-teal-600/20">
              {patientUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-200/80 text-teal-900 px-2.5 py-0.5 rounded-full">
                  Akun Anda Aktif
                </span>
                {myActiveTicket && (
                  <span className="text-xs font-mono font-black text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                    No. Antrean: {myActiveTicket.code}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                Halo, {patientUser.name}!
              </h3>
              <p className="text-xs text-slate-600">
                {myActiveTicket
                  ? `Jadwal: ${myActiveTicket.sessionName} (${myActiveTicket.timeSlot} WIB) • Status: ${myActiveTicket.status} • Tujuan: ${myActiveTicket.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}`
                  : 'Anda dapat langsung masuk ke menu pasien untuk melihat jadwal atau mendaftar berobat.'}
              </p>
            </div>
          </div>

          <button
            onClick={onSelectPatientPortal}
            className="w-full sm:w-auto px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <span>{myActiveTicket ? 'Buka Tiket Antrean Saya' : 'Buka Akun Pasien'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Bersih & Modern */}
      <div className="text-center max-w-4xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs">
          <CalendarCheck className="w-4 h-4 text-teal-600" />
          <span className="tracking-wide uppercase text-[11px]">Sistem Pendaftaran & Antrean Teratur Bebas Bentrok</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Pusat Layanan Medis <span className="text-teal-700">Klinik H.APUD</span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Pendaftaran berobat mudah dan cepat. Pilih jam kedatangan Anda sendiri, pantau nomor antrean langsung dari HP, dan nikmati pelayanan kesehatan yang nyaman serta profesional.
        </p>

        {/* Info Strip Ringkas */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600 pt-2">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Praktik: 08:00 - 21:00 WIB</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Poli Umum, KIA, Khitan, Luka & Lab</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Compreng, Subang</span>
          </span>
        </div>
      </div>

      {/* Real-Time Live Status Bar Antrean */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-800/40">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Status Antrean Hari Ini
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">
              {servingPatient
                ? `Sedang Diperiksa: ${servingPatient.code} — ${servingPatient.name}`
                : 'Pemeriksaan Siap Melayani Pasien'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-6 text-center">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Menunggu</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400">{waitingCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Selesai</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400">{completedCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Terdaftar</p>
            <p className="text-xl sm:text-2xl font-black text-white">{todayPatients.length}</p>
          </div>
        </div>
      </div>

      {/* Dua Pilihan Utama: Pasien & Admin (Tanpa Kata 'Portal') */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {/* Card 1: Pasien */}
        <div
          onClick={onSelectPatientPortal}
          className="group relative bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6 hover:-translate-y-1 duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-teal-100">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Pasien & Pengunjung
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                Pendaftaran & Layanan Pasien
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                Daftar berobat langsung dari HP tanpa antre berdesakan di loket. Pilih jam pemeriksaan sesuai keinginan Anda (Pagi, Siang, atau Malam).
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Pilih jam spesifik bebas bentrok (maksimal 5 pasien per jam)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Tiket antrean digital langsung tampil di layar & bisa dicetak</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Pantau nomor panggilan real-time dari rumah atau ruang tunggu</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between font-bold text-sm text-white bg-teal-600 group-hover:bg-teal-700 py-3.5 px-5 rounded-2xl shadow-md transition-colors">
            <span>Masuk Menu Pasien / Daftar Berobat</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Admin & Petugas Medis */}
        <div
          onClick={onRequestAdminAccess}
          className="group relative bg-slate-900 border-2 border-slate-800 hover:border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6 text-white hover:-translate-y-1 duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-700">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/40">
                Petugas & Dokter
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                Akses Admin & Petugas Medis
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Kelola antrean per sesi jam, panggil pasien dengan pengeras suara otomatis, atur jadwal operasional, dan catat rekam medis secara terintegrasi.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pemanggilan suara otomatis menyebutkan nomor, nama & ruangan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kelola ruangan periksa & poli (Umum, Khitan, KIA, Luka & Lab)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cek tiket seluruh pasien, rekap laporan cetak, dan resep dokter</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between font-bold text-sm text-slate-950 bg-amber-400 group-hover:bg-amber-300 py-3.5 px-5 rounded-2xl shadow-md transition-colors">
            <span>Masuk Dashboard Admin</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Kotak Pencarian Tiket Cepat */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Sudah Mendaftar? Cari Tiket Anda Di Sini
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan Nomor Antrean (contoh: A-001, K-001) atau Nomor WhatsApp yang didaftarkan.
            </p>
          </div>
        </div>

        <form onSubmit={handleQuickSearchSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Contoh: A-001 atau 081234567890..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
          >
            <span>Cari Tiket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Katalog Layanan Medis Unggulan */}
      <div className="max-w-5xl mx-auto space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Layanan Medis
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Poli & Layanan Kesehatan Klinik H.APUD
            </h3>
          </div>
          <button
            onClick={onSelectPatientPortal}
            className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua & Daftar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES_CATALOG.map((srv) => (
            <div
              key={srv.code}
              onClick={onSelectPatientPortal}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-200 transition-colors">
                    {getServiceIcon(srv.title)}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    Kode: {srv.code}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                    {srv.title}
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-500">Estimasi {srv.duration}</span>
                <span className="font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Daftar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Jadwal 3 Sesi Praktik & Alamat Klinik */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0 border border-teal-100">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">3 Sesi Jam Teratur</h4>
            <p className="text-slate-500 leading-relaxed">
              <strong>Sesi 1:</strong> 08:00 - 12:00 WIB<br />
              <strong>Sesi 2:</strong> 13:00 - 17:00 WIB<br />
              <strong>Sesi 3:</strong> 18:30 - 21:00 WIB
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0 border border-amber-100">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Pelayanan Anti Bentrok</h4>
            <p className="text-slate-500 leading-relaxed">
              Setiap slot jam dibatasi maksimal 5 pasien agar waktu konsultasi dokter dan penanganan medis lebih leluasa, teliti, dan nyaman.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0 border border-blue-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Lokasi & Kontak</h4>
            <p className="text-slate-500 leading-relaxed">
              Jl. Sukaresmi Desa Mekarjaya, Kec. Compreng, Kab. Subang, Jawa Barat 41258.<br />
              <strong className="text-teal-700">WhatsApp: 0812-3456-7890</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
