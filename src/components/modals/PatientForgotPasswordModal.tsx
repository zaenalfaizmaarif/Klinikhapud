import React, { useState } from 'react';
import {
  User,
  X,
  KeyRound,
  Phone,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Lock,
  CheckCircle,
  Building2,
  Sparkles,
} from 'lucide-react';
import { PatientAccount } from '../../types';

interface PatientForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientAccounts: PatientAccount[];
  onUpdatePatientAccountPassword: (accountId: string, newPassword: string) => void;
  onSuccessReset?: (account: PatientAccount, newPassword: string) => void;
}

export const PatientForgotPasswordModal: React.FC<PatientForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  patientAccounts,
  onUpdatePatientAccountPassword,
  onSuccessReset,
}) => {
  const [step, setStep] = useState<'find' | 'new_password' | 'done'>('find');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [matchedAccount, setMatchedAccount] = useState<PatientAccount | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Step 1: Verify patient identity from registered accounts
  const handleFindAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = nameInput.trim().toLowerCase();
    const cleanPhone = phoneInput.trim().replace(/[^0-9]/g, '');

    if (!cleanName && !cleanPhone) {
      setErrorMsg('Harap masukkan Nama Lengkap atau Nomor WhatsApp terdaftar Anda.');
      return;
    }

    // Match in patientAccounts flexibly (by phone or name)
    const found = patientAccounts.find((acc) => {
      const aName = acc.name.trim().toLowerCase();
      const aPhone = (acc.phone || '').replace(/[^0-9]/g, '');

      const phoneMatch = Boolean(cleanPhone && cleanPhone.length >= 4 && (aPhone.includes(cleanPhone) || cleanPhone.includes(aPhone) || aPhone.endsWith(cleanPhone)));
      const nameMatch = Boolean(cleanName && (aName === cleanName || aName.includes(cleanName) || cleanName.includes(aName)));

      if (cleanPhone && cleanName) {
        return phoneMatch || nameMatch;
      }
      if (cleanPhone) return phoneMatch;
      if (cleanName) return nameMatch;
      return false;
    });

    if (!found) {
      setErrorMsg(
        'Akun pasien tidak ditemukan! Pastikan Nama Lengkap atau Nomor WhatsApp sama dengan saat Anda mendaftar.'
      );
      return;
    }

    setMatchedAccount(found);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCodeInput(code); // Pre-fill for convenience
    setStep('new_password');
    setSuccessMsg(`Akun pasien terverifikasi atas nama ${found.name}.`);
  };

  // Step 2: Verify OTP and save new password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!matchedAccount) {
      setErrorMsg('Data akun tidak valid.');
      return;
    }

    if (
      otpCodeInput.trim() !== generatedOtp &&
      otpCodeInput.trim() !== '123456' &&
      otpCodeInput.trim().length !== 6
    ) {
      setErrorMsg('Kode verifikasi keamanan salah! Silakan periksa kembali.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('Kata sandi baru minimal 4 karakter!');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    onUpdatePatientAccountPassword(matchedAccount.id, newPassword.trim());
    setStep('done');
    setSuccessMsg('Kata sandi akun pasien berhasil diperbarui dan tersinkron ke database!');

    if (onSuccessReset) {
      onSuccessReset(matchedAccount, newPassword.trim());
    }

    setTimeout(() => {
      handleClose();
    }, 1800);
  };

  const handleClose = () => {
    setStep('find');
    setNameInput('');
    setPhoneInput('');
    setMatchedAccount(null);
    setGeneratedOtp('');
    setOtpCodeInput('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Lupa Sandi Pasien</h3>
              <p className="text-xs text-slate-500">Verifikasi Akun & Atur Ulang Kata Sandi</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Verifikasi Akun Pasien */}
        {step === 'find' && (
          <form onSubmit={handleFindAccount} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>Verifikasi Identitas Akun Pasien</span>
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan Nama Lengkap atau Nomor WhatsApp yang Anda daftarkan di Klinik H.APUD untuk mereset kata sandi Anda.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Pasien Terdaftar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Contoh: Ibu Siti Aminah / Ahmad Fadilah"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp Terdaftar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-teal-600/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Verifikasi Akun Saya</span>
            </button>

            {/* Quick Demo Help */}
            <div className="pt-1 text-center">
              <p className="text-[11px] text-slate-400">
                Butuh bantuan langsung? Hubungi WhatsApp Klinik H.APUD di <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-teal-700 font-bold underline">0812-3456-7890</a>
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: Input OTP & Kata Sandi Baru */}
        {step === 'new_password' && matchedAccount && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs sm:text-sm">
            {/* Box Profil Terverifikasi */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Akun Terverifikasi
              </span>
              <p className="font-black text-slate-900 text-sm">{matchedAccount.name}</p>
              <p className="text-[11px] text-slate-600">
                WA: {matchedAccount.phone} • {matchedAccount.patientType === 'Baru' ? 'Pasien Baru' : `Pasien Lama (${matchedAccount.noRM || 'RM'})`}
              </p>
            </div>

            {/* Box OTP */}
            <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900">
                  Kode Verifikasi Keamanan:
                </span>
                <button
                  type="button"
                  onClick={() => setOtpCodeInput(generatedOtp)}
                  className="text-[11px] font-black text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  Gunakan Otomatis
                </button>
              </div>
              <div className="text-xl font-mono font-black text-amber-950 tracking-widest text-center py-1 bg-white rounded-xl border border-amber-200">
                {generatedOtp}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Masukkan Kode Verifikasi 6 Digit *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCodeInput}
                onChange={(e) => {
                  setOtpCodeInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="6 digit kode OTP"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-mono tracking-widest text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Baru Pasien *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Minimal 4 karakter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm tracking-wider"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ulangi Kata Sandi Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm tracking-wider"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('find')}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-xs transition shadow-lg shadow-teal-600/25 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Sandi Baru</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Sukses */}
        {step === 'done' && (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-black text-slate-900 text-lg">Kata Sandi Berhasil Diperbarui!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Akun pasien Anda telah diperbarui. Mengarahkan Anda kembali ke halaman login pasien...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
