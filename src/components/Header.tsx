import React, { useState, useEffect } from 'react';
import {
  Cross,
  UserPlus,
  Tv,
  Clock,
  Search,
  LogOut,
  User,
  Ticket,
} from 'lucide-react';
import { PortalType, PatientTab, ClinicStatus, PatientUser } from '../types';
import { getWIBTime } from '../utils/schedule';

interface HeaderProps {
  activePortal: PortalType;
  setActivePortal: (portal: PortalType) => void;
  activePatientTab: PatientTab;
  setActivePatientTab: (tab: PatientTab) => void;
  onOpenAdminAuth: () => void;
  onOpenCheckTicket: () => void;
  waitingCount: number;
  clinicStatus: ClinicStatus;
  onStatusBadgeClick: () => void;
  patientUser?: PatientUser | null;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  onLogoutPatient: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePortal,
  setActivePortal,
  activePatientTab,
  setActivePatientTab,
  onOpenAdminAuth,
  onOpenCheckTicket,
  waitingCount,
  clinicStatus,
  onStatusBadgeClick,
  patientUser,
  isAdminLoggedIn,
  onLogoutAdmin,
  onLogoutPatient,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(getWIBTime().timeString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = () => {
    if (activePortal === 'patient') {
      setActivePatientTab('register');
    } else {
      setActivePortal('landing');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center gap-2">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/25 group-hover:bg-teal-700 transition">
              <Cross className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  KLINIK H.APUD
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Pelayanan Kesehatan
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden xs:block">
                Sistem Pendaftaran & Manajemen Sesi Waktu
              </p>
            </div>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clinic Open/Closed Indicator */}
            {activePortal === 'admin' ? (
              <button
                type="button"
                onClick={onStatusBadgeClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition border shadow-xs cursor-pointer select-none group ${
                  clinicStatus.isOpen
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 hover:border-rose-400 animate-pulse'
                }`}
                title="Klik untuk mengubah status Buka / Tutup Klinik (Akses Admin)"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    clinicStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="uppercase tracking-wider text-[11px] font-black">
                  {clinicStatus.isOpen ? 'Buka' : 'Tutup'}
                </span>
                <span className="text-[10px] text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded font-bold ml-0.5 group-hover:bg-teal-200">
                  Ubah
                </span>
              </button>
            ) : (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition border select-none ${
                  clinicStatus.isOpen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                }`}
                title={`Status Klinik: ${clinicStatus.isOpen ? 'Buka' : 'Tutup'}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    clinicStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="uppercase tracking-wider text-[11px] font-black">
                  {clinicStatus.isOpen ? 'Buka' : 'Tutup'}
                </span>
              </div>
            )}

            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{timeStr}</span>
            </div>

            {/* Quick Check Ticket Button (For Patients) */}
            <button
              onClick={onOpenCheckTicket}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
              title="Cek Status Tiket Antrean"
            >
              <Search className="w-4 h-4 text-teal-600" />
              <span className="hidden md:inline">Cek Tiket Saya</span>
            </button>

            {/* Patient Logged In Profile & Logout (No Portal Switcher) */}
            {activePortal === 'patient' && patientUser && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActivePatientTab('my-account')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs transition cursor-pointer"
                  title="Buka Akun & Tiket Saya"
                >
                  <User className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="font-bold text-teal-900 truncate max-w-[110px] sm:max-w-[150px]">
                    {patientUser.name}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onLogoutPatient}
                  title="Keluar dari Akun Pasien"
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 border border-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden xs:inline">Keluar</span>
                </button>
              </div>
            )}

            {/* Admin Portal Logout Button (Only for Admin) */}
            {activePortal === 'admin' && (
              <button
                onClick={onLogoutAdmin}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-900 text-white font-semibold text-xs sm:text-sm transition shadow-xs cursor-pointer"
                title="Keluar dari Portal Admin"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Keluar Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar (Active ONLY in Patient Portal) */}
      {activePortal === 'patient' && (
        <div className="bg-slate-100/90 border-t border-slate-200 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 py-2 text-xs font-semibold scrollbar-none">
            {/* Tab 1: Akun & Tiket Pasien */}
            <button
              onClick={() => setActivePatientTab('my-account')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activePatientTab === 'my-account'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Akun & Tiket Saya</span>
            </button>

            {/* Tab 2: Form Pendaftaran */}
            <button
              onClick={() => setActivePatientTab('register')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activePatientTab === 'register'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Form Pendaftaran</span>
            </button>
            <button
              onClick={() => setActivePatientTab('monitor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap relative ${
                activePatientTab === 'monitor'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Monitor Antrean Real-Time</span>
              {waitingCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activePatientTab === 'monitor'
                      ? 'bg-teal-800 text-white'
                      : 'bg-amber-100 text-amber-800 font-bold'
                  }`}
                >
                  {waitingCount} Antre
                </span>
              )}
            </button>
            <button
              onClick={() => setActivePatientTab('info')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activePatientTab === 'info'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Jadwal Sesi & Biaya</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
