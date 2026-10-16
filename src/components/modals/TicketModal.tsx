import React from 'react';
import {
  CheckCircle,
  X,
  Printer,
  Share2,
  Calendar,
  Clock,
  User,
  HeartPulse,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { Patient } from '../../types';
import { formatDateIndo, calculateAge, generateWhatsAppLink } from '../../utils/helpers';
import { RotateCcw } from 'lucide-react';

interface TicketModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onRecheckWithCode?: (code: string) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  patient,
  isOpen,
  onClose,
  onRecheckWithCode,
}) => {
  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWA = () => {
    const url = generateWhatsAppLink(patient);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-teal-600 text-white p-4.5 flex justify-between items-center no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-200" />
            <h3 className="font-extrabold text-sm sm:text-base">Tiket Antrean Diterbitkan</h3>
          </div>
          <button
            onClick={onClose}
            className="text-teal-100 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div
          id="printableTicket"
          className="p-6 bg-white space-y-5 overflow-y-auto print-container"
        >
          {/* Clinic Brand Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">KLINIK H.APUD</h2>
            <p className="text-xs font-bold text-teal-800">PUSAT PELAYANAN KESEHATAN</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Jl.Sukaresmi Desa Mekarjaya Kecamatan Compreng Kabupaten Subang, Jawa Barat 41258 • WA: 0812-3456-7890
            </p>
          </div>

          {/* Queue Number Callout */}
          <div className="text-center bg-teal-50/80 p-5 rounded-2xl border border-teal-200">
            <p className="text-[11px] text-teal-800 font-extrabold uppercase tracking-widest">
              Nomor Antrean Anda
            </p>
            <p className="text-5xl font-black text-teal-800 my-1.5 tracking-wider">
              {patient.code}
            </p>
            <p className="text-xs font-bold text-slate-700">{patient.service}</p>
          </div>

          {/* Schedule Highlight Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex justify-between items-center text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Jadwal Sesi & Jam</p>
              <p className="font-extrabold text-amber-400 text-sm mt-0.5">
                {patient.sessionName} • {patient.timeSlot} WIB
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Tanggal</p>
              <p className="font-bold text-slate-200 mt-0.5">{formatDateIndo(patient.visitDate)}</p>
            </div>
          </div>

          {/* Room Destination Box */}
          <div className="p-3.5 bg-teal-50 border-2 border-teal-300 rounded-2xl flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1 truncate">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 block">
                Ruangan Yang Bakal Dimasuki
              </span>
              <p className="text-base font-black text-slate-900 truncate">
                {patient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}
              </p>
              <p className="text-[11px] text-slate-600 font-semibold truncate">
                {patient.doctorName ? `👨‍⚕️ Dokter: ${patient.doctorName}` : 'Pemeriksaan Dokter • Lantai 1 Klinik H.APUD'}
              </p>
            </div>
          </div>

          {/* Patient Details List */}
          <div className="space-y-2 text-xs text-slate-600 border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Nama Pasien:</span>
              <strong className="text-slate-900">{patient.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status Pasien:</span>
              <strong className="text-slate-900">
                {patient.patientType === 'Baru'
                  ? 'Pasien Baru'
                  : `Pasien Lama (RM: ${patient.noRM || '-'})`}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jenis Kelamin / Usia:</span>
              <strong className="text-slate-900">
                {patient.gender} • {calculateAge(patient.dob)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">No. WhatsApp:</span>
              <strong className="text-slate-900">{patient.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Alamat:</span>
              <strong className="text-slate-900 truncate max-w-[200px] text-right">
                {patient.address}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Keluhan:</span>
              <span className="text-slate-700 italic truncate max-w-[200px] text-right">
                "{patient.complaint}"
              </span>
            </div>
          </div>

          {/* Barcode Mock Visual */}
          <div className="text-center space-y-1">
            <div className="h-9 w-48 mx-auto bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_8px,#fff_8px,#fff_10px)] opacity-70"></div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest">
              KLINIK-HAPUD-{patient.code}-{patient.visitDate.replace(/-/g, '')}
            </p>
          </div>

          {/* Instructions note */}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Harap tiba di klinik 10 menit sebelum jam sesi ({patient.timeSlot} WIB) untuk verifikasi
            berkas. Tunjukkan tiket ini kepada petugas.
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 no-print shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleSendWA}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Kirim ke WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Tiket</span>
            </button>
          </div>

          {onRecheckWithCode && (
            <button
              type="button"
              onClick={() => {
                onRecheckWithCode(patient.code);
                onClose();
              }}
              className="w-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
              <span>Mau Periksa Lagi? Sesuaikan dengan No. Antrean Ini ({patient.code})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
