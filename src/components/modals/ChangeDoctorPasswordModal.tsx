import React, { useState } from 'react';
import { KeyRound, X, Stethoscope, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { DoctorAccount } from '../../types';

interface ChangeDoctorPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorAccount;
  onUpdateDoctorPassword: (doctorId: string, newPassword: string) => void;
}

export const ChangeDoctorPasswordModal: React.FC<ChangeDoctorPasswordModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onUpdateDoctorPassword,
}) => {
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (currentPasswordInput.trim() !== doctor.password) {
      setErrorMsg('Sandi lama dokter yang Anda masukkan tidak sesuai!');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('Sandi baru minimal 4 karakter!');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg('Konfirmasi sandi baru tidak cocok!');
      return;
    }

    onUpdateDoctorPassword(doctor.id, newPassword.trim());
    setSuccessMsg(`Kata sandi ${doctor.name} berhasil diperbarui dan tersinkron ke Cloud!`);
    setTimeout(() => {
      onClose();
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Ubah Sandi Dokter</h3>
              <p className="text-xs text-slate-500">{doctor.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sandi Lama Dokter *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="Masukkan sandi saat ini"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sandi Baru Dokter *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan sandi baru (minimal 4 karakter)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ulangi Sandi Baru *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang sandi baru"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPass ? 'Sembunyikan Sandi' : 'Lihat Sandi'}</span>
            </button>
            <span className="text-[11px] text-slate-400">Poli: {doctor.assignedPolies.length} ruang</span>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Simpan Sandi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
