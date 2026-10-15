import React, { useState, useEffect } from 'react';
import {
  Power,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Sparkles,
  CalendarCheck,
  Settings2,
} from 'lucide-react';
import { ClinicStatus } from '../../types';
import { getWIBTime, computeAutoClinicStatus } from '../../utils/schedule';

interface ClinicStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicStatus: ClinicStatus;
  onUpdateStatus: (status: ClinicStatus) => void;
}

const COMMON_REASONS = [
  'Di luar jam operasional praktik klinik (08:00 - 21:00 WIB)',
  'Pelayanan telah selesai untuk hari ini',
  'Istirahat sementara, buka kembali sesi berikutnya',
  'Tutup sementara (sedang ada tindakan darurat/keperluan)',
  'Klinik tutup hari libur / tanggal merah',
  'Kuota antrean pasien hari ini sudah penuh',
];

export const ClinicStatusModal: React.FC<ClinicStatusModalProps> = ({
  isOpen,
  onClose,
  clinicStatus,
  onUpdateStatus,
}) => {
  const [mode, setMode] = useState<'auto' | 'manual'>(clinicStatus.mode || 'auto');
  const [isOpenState, setIsOpenState] = useState(clinicStatus.isOpen);
  const [reason, setReason] = useState(clinicStatus.reason || COMMON_REASONS[0]);
  const [reopenEstimate, setReopenEstimate] = useState(
    clinicStatus.reopenEstimate || 'Buka kembali besok pukul 08:00 WIB'
  );
  const [wibNow, setWibNow] = useState(getWIBTime());

  useEffect(() => {
    setMode(clinicStatus.mode || 'auto');
    setIsOpenState(clinicStatus.isOpen);
    setReason(clinicStatus.reason || COMMON_REASONS[0]);
    setReopenEstimate(clinicStatus.reopenEstimate || 'Buka kembali besok pukul 08:00 WIB');
  }, [clinicStatus, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setWibNow(getWIBTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (mode === 'auto') {
      const autoCalculated = computeAutoClinicStatus();
      onUpdateStatus({
        isOpen: autoCalculated.isOpen,
        mode: 'auto',
        reason: autoCalculated.reason,
        reopenEstimate: autoCalculated.reopenEstimate,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onUpdateStatus({
        isOpen: isOpenState,
        mode: 'manual',
        reason: isOpenState ? '' : reason.trim(),
        reopenEstimate: isOpenState ? '' : reopenEstimate.trim(),
        updatedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  const autoPreview = computeAutoClinicStatus();

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-2.5 rounded-2xl ${
                isOpenState ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Kelola Status Buka / Tutup</h3>
              <p className="text-xs text-slate-500">
                Waktu WIB Saat Ini: <strong className="text-teal-700">{wibNow.timeString}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Pilih Mode Operasional
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMode('auto');
                setIsOpenState(autoPreview.isOpen);
              }}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-left ${
                mode === 'auto'
                  ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-black">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Otomatis (Jadwal)</span>
              </div>
              <p className="text-[10px] text-slate-500 text-center leading-tight">
                Buka 08:00 WIB & Tutup 21:00 WIB Otomatis
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-left ${
                mode === 'manual'
                  ? 'border-slate-800 bg-slate-900 text-white font-bold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-black">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <span>Manual (Admin)</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Paksa Buka atau Tutup secara manual
              </p>
            </button>
          </div>
        </div>

        {/* Auto Mode Info Card */}
        {mode === 'auto' ? (
          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-teal-900 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-teal-700" />
                <span>Jadwal Otomatis Klinik Aktif</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  autoPreview.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {autoPreview.isOpen ? 'Buka Otomatis' : 'Tutup Otomatis'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Sistem akan otomatis membuka pendaftaran mulai pukul <strong>08:00 WIB</strong> dan
              menutup secara otomatis tepat pada pukul <strong>21:00 WIB</strong> setiap hari.
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-teal-200/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Status Waktu Sekarang ({wibNow.timeString}):</span>
              <strong className={autoPreview.isOpen ? 'text-emerald-700' : 'text-rose-700'}>
                {autoPreview.isOpen ? '✓ KLINIK SEDANG BUKA' : '✗ KLINIK SEDANG TUTUP'}
              </strong>
            </div>
          </div>
        ) : (
          /* Manual Toggle Switch */
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pilih Status Manual
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsOpenState(true)}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                  isOpenState
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-extrabold shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <CheckCircle className={`w-5 h-5 ${isOpenState ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="text-center">
                  <span className="text-xs font-black block">KLINIK BUKA</span>
                  <span className="text-[10px] text-slate-500 font-medium">Buka secara paksa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsOpenState(false)}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                  !isOpenState
                    ? 'border-rose-600 bg-rose-50/60 text-rose-950 font-extrabold shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 ${!isOpenState ? 'text-rose-600' : 'text-slate-400'}`} />
                <div className="text-center">
                  <span className="text-xs font-black block">KLINIK TUTUP</span>
                  <span className="text-[10px] text-slate-500 font-medium">Tutup secara paksa</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Closed Options (Shown when TUTUP in manual mode) */}
        {mode === 'manual' && !isOpenState && (
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center gap-1.5 text-rose-800 font-extrabold">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Pemberitahuan Penutupan untuk Pasien</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alasan Penutupan</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none font-medium text-slate-800 text-xs"
              >
                {COMMON_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Keterangan / Estimasi Buka Kembali
              </label>
              <input
                type="text"
                value={reopenEstimate}
                onChange={(e) => setReopenEstimate(e.target.value)}
                placeholder="Contoh: Buka kembali besok pukul 08:00 WIB"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none font-semibold text-slate-800 text-xs"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Simpan & Sinkronkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
