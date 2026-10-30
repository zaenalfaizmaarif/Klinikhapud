import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Ticket,
  MapPin,
  Phone,
  AlertCircle,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { PatientUser, PatientAccount } from '../../types';
import { PatientForgotPasswordModal } from '../modals/PatientForgotPasswordModal';

interface PatientLoginViewProps {
  onLoginSuccess: (user: PatientUser) => void;
  onBackToLanding?: () => void;
  patientAccounts: PatientAccount[];
  onRegisterNewAccount: (account: PatientAccount) => void;
  onUpdatePatientAccountPassword?: (accountId: string, newPassword: string) => void;
}

export const PatientLoginView: React.FC<PatientLoginViewProps> = ({
  onLoginSuccess,
  patientAccounts,
  onRegisterNewAccount,
  onUpdatePatientAccountPassword,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Login form state
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPatientType, setRegPatientType] = useState<'Baru' | 'Lama'>('Baru');
  const [regNoRM, setRegNoRM] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regGender, setRegGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanName = loginName.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanName || !cleanPass) {
      setLoginError('Harap masukkan Nama Lengkap dan Kata Sandi!');
      return;
    }

    // Find account by matching name
    const found = patientAccounts.find(
      (acc) => acc.name.trim().toLowerCase() === cleanName
    );

    if (!found) {
      setLoginError(
        `Akun pasien dengan nama "${loginName}" belum terdaftar. Silakan daftar akun baru di tab "Daftar Pasien Baru".`
      );
      return;
    }

    if (found.password !== cleanPass) {
      setLoginError('Kata Sandi tidak cocok! Pastikan huruf besar/kecil sesuai.');
      return;
    }

    // Success login
    const patientUser: PatientUser = {
      id: found.id,
      name: found.name,
      phone: found.phone,
      patientType: found.patientType,
      noRM: found.noRM,
      dob: found.dob,
      gender: found.gender,
      address: found.address,
    };

    onLoginSuccess(patientUser);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanName = regName.trim();
    const cleanPass = regPassword.trim();
    const cleanPhone = regPhone.trim();

    if (!cleanName) {
      setRegError('Nama Lengkap wajib diisi!');
      return;
    }
    if (!cleanPhone) {
      setRegError('Nomor WhatsApp wajib diisi!');
      return;
    }
    if (cleanPass.length < 4) {
      setRegError('Kata Sandi minimal 4 karakter!');
      return;
    }
    if (cleanPass !== regConfirmPassword.trim()) {
      setRegError('Konfirmasi Kata Sandi tidak cocok!');
      return;
    }

    // Check if name already registered
    const exists = patientAccounts.some(
      (acc) => acc.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (exists) {
      setRegError('Nama pasien ini sudah memiliki akun terdaftar! Silakan login di tab "Masuk Pasien".');
      return;
    }

    const newAccount: PatientAccount = {
      id: `acc-${Date.now()}`,
      name: cleanName,
      password: cleanPass,
      phone: cleanPhone,
      patientType: regPatientType,
      noRM: regPatientType === 'Lama' ? regNoRM.trim() || 'RM-Lama' : '-',
      dob: regDob || undefined,
      gender: regGender,
      address: regAddress.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onRegisterNewAccount(newAccount);

    const user: PatientUser = {
      id: newAccount.id,
      name: newAccount.name,
      phone: newAccount.phone,
      patientType: newAccount.patientType,
      noRM: newAccount.noRM,
      dob: newAccount.dob,
      gender: newAccount.gender,
      address: newAccount.address,
    };

    onLoginSuccess(user);
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-md">
            <Ticket className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block">
            Pendaftaran Pasien Klinik H.APUD
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Autentikasi Akun Pasien
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Masuk dengan <strong>Nama</strong> dan <strong>Kata Sandi</strong> terdaftar untuk
            memilih sesi waktu berobat dan melihat tiket digital Anda.
          </p>
        </div>

        {/* Tab Toggle: Masuk vs Daftar Akun Baru */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-teal-600" />
            <span>Masuk Pasien</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>Daftar Pasien Baru</span>
          </button>
        </div>

        {/* TAB 1: MASUK PASIEN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in shake duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Pasien *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => {
                    setLoginName(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Contoh: Ibu Siti Aminah / Ahmad Fadilah"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Pasien *
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold tracking-wider"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline transition cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-teal-600/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk dengan Nama & Sandi</span>
            </button>
          </form>
        )}

        {/* TAB 2: DAFTAR AKUN BARU */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs sm:text-sm">
            {regError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in shake duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{regError}</span>
              </div>
            )}

            {/* Status Pasien */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Status Pasien *</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-2xl flex items-center gap-2.5 cursor-pointer transition border-2 ${
                    regPatientType === 'Baru'
                      ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="regPtType"
                    checked={regPatientType === 'Baru'}
                    onChange={() => setRegPatientType('Baru')}
                    className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Pasien Baru</p>
                    <p className="text-[10px] text-slate-500">Pertama kali berkunjung</p>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-2xl flex items-center gap-2.5 cursor-pointer transition border-2 ${
                    regPatientType === 'Lama'
                      ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="regPtType"
                    checked={regPatientType === 'Lama'}
                    onChange={() => setRegPatientType('Lama')}
                    className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Pasien Lama</p>
                    <p className="text-[10px] text-slate-500">Sudah ada No. RM</p>
                  </div>
                </label>
              </div>
            </div>

            {regPatientType === 'Lama' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Rekam Medis (No. RM) <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={regNoRM}
                  onChange={(e) => setRegNoRM(e.target.value)}
                  placeholder="Contoh: RM-2025-081"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Pasien *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Sesuai KTP / KK (Contoh: Ahmad Fadilah)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Buat Kata Sandi *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang sandi"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp Aktif *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs bg-white"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={regDob}
                  onChange={(e) => setRegDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat / Dusun <span className="text-slate-400">(opsional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Dusun, RT/RW, Desa Mekarjaya"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-teal-600/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun & Langsung Masuk</span>
            </button>
          </form>
        )}
      </div>

      {/* Modal Lupa Sandi Pasien */}
      {onUpdatePatientAccountPassword && (
        <PatientForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          patientAccounts={patientAccounts}
          onUpdatePatientAccountPassword={onUpdatePatientAccountPassword}
          onSuccessReset={(account, newPass) => {
            setLoginName(account.name);
            setLoginPassword(newPass);
          }}
        />
      )}
    </div>
  );
};
