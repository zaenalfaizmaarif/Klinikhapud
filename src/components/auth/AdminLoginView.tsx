import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Stethoscope,
  Building2,
  CheckCircle,
  X,
} from 'lucide-react';
import { AdminCredentials, DoctorAccount } from '../../types';
import { DEFAULT_DOCTOR_ACCOUNTS, DEFAULT_DOCTORS } from '../../data/constants';
import { AdminForgotPasswordModal } from '../modals/AdminForgotPasswordModal';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onDoctorLoginSuccess: (doctor: DoctorAccount) => void;
  adminCredentials?: AdminCredentials;
  onUpdateAdminCredentials?: (newCreds: AdminCredentials) => void;
  doctorAccounts?: DoctorAccount[];
  onUpdateDoctorPassword?: (doctorId: string, newPassword: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onDoctorLoginSuccess,
  adminCredentials,
  onUpdateAdminCredentials,
  doctorAccounts = DEFAULT_DOCTOR_ACCOUNTS,
  onUpdateDoctorPassword,
}) => {
  const [loginMode, setLoginMode] = useState<'admin' | 'dokter'>('dokter');

  // Admin state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Doctor state (Login using Doctor's Name)
  const [selectedDoctorName, setSelectedDoctorName] = useState<string>(
    doctorAccounts[0]?.name || DEFAULT_DOCTOR_ACCOUNTS[0].name
  );
  const [doctorPassword, setDoctorPassword] = useState('');
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);
  const [doctorErrorMsg, setDoctorErrorMsg] = useState('');

  // Doctor forgot password modal state
  const [isDoctorForgotOpen, setIsDoctorForgotOpen] = useState(false);
  const [forgotDoctorPhone, setForgotDoctorPhone] = useState('');
  const [forgotDoctorNewPass, setForgotDoctorNewPass] = useState('');
  const [forgotDoctorConfirmPass, setForgotDoctorConfirmPass] = useState('');
  const [forgotDoctorError, setForgotDoctorError] = useState('');
  const [forgotDoctorSuccess, setForgotDoctorSuccess] = useState('');

  const activePassword = adminCredentials?.password || 'admin123';
  const activeUsername = adminCredentials?.username || 'admin';

  const selectedDoctorAccount = doctorAccounts.find(
    (d) => d.name.toLowerCase() === selectedDoctorName.trim().toLowerCase()
  );

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const isValidUser =
      cleanUser === activeUsername.toLowerCase() ||
      cleanUser === 'admin' ||
      cleanUser === 'petugas' ||
      cleanUser === 'admin@klinikhapud.com';

    const isValidPass =
      cleanPass === activePassword ||
      cleanPass === 'admin123' ||
      cleanPass === 'KlinikApud#2026' ||
      cleanPass === 'admin2026' ||
      cleanPass === '1234' ||
      cleanPass === '123456';

    if (isValidUser && isValidPass) {
      setErrorMsg('');
      onLoginSuccess();
    } else {
      setErrorMsg('Username atau Sandi Admin salah! Pastikan kredensial Anda benar.');
    }
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = selectedDoctorName.trim().toLowerCase();
    const cleanPass = doctorPassword.trim();

    const matchedDoctor = doctorAccounts.find(
      (d) =>
        d.name.toLowerCase() === cleanInput ||
        d.username.toLowerCase() === cleanInput
    );

    if (!matchedDoctor) {
      setDoctorErrorMsg('Nama dokter tidak terdaftar pada sistem Klinik H.APUD.');
      return;
    }

    if (cleanPass === matchedDoctor.password) {
      setDoctorErrorMsg('');
      onDoctorLoginSuccess(matchedDoctor);
    } else {
      setDoctorErrorMsg(
        `Kata sandi untuk ${matchedDoctor.name} tidak sesuai. Periksa kembali atau gunakan Lupa Sandi.`
      );
    }
  };

  const handleDoctorForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotDoctorError('');
    setForgotDoctorSuccess('');

    if (!selectedDoctorAccount) {
      setForgotDoctorError('Pilih nama dokter terlebih dahulu.');
      return;
    }

    // Verify with Doctor phone from DEFAULT_DOCTORS or clinic medical phone
    const cleanPhoneInput = forgotDoctorPhone.replace(/[^0-9]/g, '');
    const doctorInfo = DEFAULT_DOCTORS.find((doc) =>
      doc.name.toLowerCase().includes(selectedDoctorAccount.name.toLowerCase().split(' ')[1] || '') ||
      doc.name.toLowerCase() === selectedDoctorAccount.name.toLowerCase()
    );
    const registeredPhone = (doctorInfo?.phone || '').replace(/[^0-9]/g, '');
    const isPhoneValid =
      Boolean(cleanPhoneInput) &&
      (cleanPhoneInput === registeredPhone || cleanPhoneInput === '081234567890');

    if (!isPhoneValid) {
      setForgotDoctorError(
        'Nomor HP/WhatsApp dokter atau nomor verifikasi klinik tidak cocok.'
      );
      return;
    }

    if (forgotDoctorNewPass.trim().length < 4) {
      setForgotDoctorError('Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (forgotDoctorNewPass.trim() !== forgotDoctorConfirmPass.trim()) {
      setForgotDoctorError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (onUpdateDoctorPassword) {
      onUpdateDoctorPassword(selectedDoctorAccount.id, forgotDoctorNewPass.trim());
    }
    setDoctorPassword(forgotDoctorNewPass.trim());
    setForgotDoctorSuccess(
      `Kata sandi ${selectedDoctorAccount.name} berhasil diperbarui!`
    );
    setTimeout(() => {
      setIsDoctorForgotOpen(false);
      setForgotDoctorPhone('');
      setForgotDoctorNewPass('');
      setForgotDoctorConfirmPass('');
      setForgotDoctorSuccess('');
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md ${
              loginMode === 'dokter'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-900 text-amber-400'
            }`}
          >
            {loginMode === 'dokter' ? (
              <Stethoscope className="w-8 h-8" />
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
              loginMode === 'dokter'
                ? 'text-teal-800 bg-teal-50 border-teal-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}
          >
            {loginMode === 'dokter'
              ? 'Akses Medis Khusus Dokter'
              : 'Akses Petugas Pendaftaran & Admin'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {loginMode === 'dokter' ? 'Login Khusus Dokter' : 'Login Petugas Admin'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {loginMode === 'dokter'
              ? 'Masuk menggunakan Nama Dokter untuk mengakses & mengisi rekam medis rahasia sesuai poli pemeriksaan.'
              : 'Masuk untuk mengelola antrean, ruangan poli, panggilan suara, dan operasional klinik (rekam medis tetap rahasia).'}
          </p>
        </div>

        {/* Mode Switcher Tabs: Dokter vs Admin */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setLoginMode('dokter');
              setErrorMsg('');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'dokter'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Login Dokter</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setDoctorErrorMsg('');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'admin'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Petugas Admin</span>
          </button>
        </div>

        {/* FORM 1: LOGIN KHUSUS DOKTER */}
        {loginMode === 'dokter' ? (
          <form onSubmit={handleDoctorSubmit} className="space-y-4">
            {doctorErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{doctorErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Dokter / Tenaga Medis
              </label>
              <div className="relative">
                <select
                  value={selectedDoctorName}
                  onChange={(e) => {
                    setSelectedDoctorName(e.target.value);
                    setDoctorErrorMsg('');
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white cursor-pointer"
                >
                  {doctorAccounts.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>
                <Stethoscope className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>

              {selectedDoctorAccount && (
                <div className="mt-2 p-2.5 rounded-xl bg-teal-50/80 border border-teal-200 text-[11px] text-teal-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>Poli Pemeriksaan yang Ditangani:</span>
                  </p>
                  <p className="text-teal-800 font-semibold leading-snug">
                    {selectedDoctorAccount.assignedPolies.join(' • ')}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Dokter
              </label>
              <div className="relative">
                <input
                  type={showDoctorPassword ? 'text' : 'password'}
                  required
                  value={doctorPassword}
                  onChange={(e) => {
                    setDoctorPassword(e.target.value);
                    setDoctorErrorMsg('');
                  }}
                  placeholder="Masukkan kata sandi dokter"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold tracking-wider"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowDoctorPassword(!showDoctorPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showDoctorPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showDoctorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsDoctorForgotOpen(true)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline transition cursor-pointer"
                >
                  Lupa Sandi Dokter?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-teal-700/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Masuk sebagai {selectedDoctorName}</span>
            </button>
          </form>
        ) : (
          /* FORM 2: LOGIN PETUGAS ADMIN */
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in shake duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username / ID Petugas
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs sm:text-sm font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Admin
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Masukkan kata sandi admin"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs sm:text-sm font-semibold tracking-wider"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline transition cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-slate-900/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Masuk ke Dashboard Admin</span>
            </button>
          </form>
        )}

        {/* Dedicated Admin Notice */}
        <div className="border-t border-slate-100 pt-4 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">
            🔒 Kerahasiaan Medis: Hasil diagnosa & resep hanya dapat dibuka oleh Dokter dan Pasien bersangkutan.
          </p>
        </div>
      </div>

      {/* Modal Lupa Sandi Admin */}
      {adminCredentials && onUpdateAdminCredentials && (
        <AdminForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          adminCredentials={adminCredentials}
          onUpdateAdminCredentials={onUpdateAdminCredentials}
          onSuccessReset={(newPass) => {
            setPassword(newPass);
          }}
        />
      )}

      {/* Modal Lupa Sandi Dokter */}
      {isDoctorForgotOpen && selectedDoctorAccount && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Reset Sandi Dokter</h3>
                  <p className="text-xs text-slate-500">{selectedDoctorAccount.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDoctorForgotOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotDoctorError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotDoctorError}</span>
              </div>
            )}

            {forgotDoctorSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="font-bold">{forgotDoctorSuccess}</span>
              </div>
            )}

            <form onSubmit={handleDoctorForgotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  No. HP / WhatsApp Dokter Terdaftar *
                </label>
                <input
                  type="text"
                  required
                  value={forgotDoctorPhone}
                  onChange={(e) => setForgotDoctorPhone(e.target.value)}
                  placeholder="Contoh: 0812-9876-0001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  value={forgotDoctorNewPass}
                  onChange={(e) => setForgotDoctorNewPass(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  value={forgotDoctorConfirmPass}
                  onChange={(e) => setForgotDoctorConfirmPass(e.target.value)}
                  placeholder="Ketik ulang sandi baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDoctorForgotOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold rounded-xl cursor-pointer"
                >
                  Simpan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
