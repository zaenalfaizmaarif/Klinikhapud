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
  Lock,
  Stethoscope,
  Pill,
  RotateCcw,
  Download,
  Receipt,
} from 'lucide-react';
import { Patient } from '../../types';
import { formatDateIndo, calculateAge, generateWhatsAppLink } from '../../utils/helpers';
import {
  printTicketDocument,
  printPrescriptionDocument,
  downloadTicketImage,
} from '../../utils/ticketPrinter';

interface TicketModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onRecheckWithCode?: (code: string) => void;
  canViewMedicalRecord?: boolean;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  patient,
  isOpen,
  onClose,
  onRecheckWithCode,
  canViewMedicalRecord = false,
}) => {
  if (!isOpen || !patient) return null;

  const handlePrintStandard = () => {
    printTicketDocument(patient, {
      format: 'standard',
      includeMedicalRecord: canViewMedicalRecord,
    });
  };

  const handlePrintThermal = () => {
    printTicketDocument(patient, {
      format: 'thermal',
      includeMedicalRecord: canViewMedicalRecord,
    });
  };

  const handleDownloadPng = () => {
    downloadTicketImage(patient, canViewMedicalRecord);
  };

  const canPrintPrescription =
    canViewMedicalRecord &&
    patient.status === 'Selesai' &&
    Boolean(patient.diagnosis || patient.prescription);

  const handlePrintPrescription = () => {
    printPrescriptionDocument(patient);
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

          {/* Confidential Medical Result (Patient & Doctor ONLY when Selesai) */}
          {patient.status === 'Selesai' &&
            (patient.diagnosis ||
              patient.prescription ||
              patient.vitalSigns?.bp ||
              patient.vitalSigns?.temp ||
              patient.vitalSigns?.pulse ||
              patient.vitalSigns?.weight) && (
              canViewMedicalRecord ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
                    <span className="font-black text-emerald-950 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <span>Hasil Rekam Medis (Rahasia)</span>
                    </span>
                    <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Pasien & Dokter</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-[11px] text-emerald-950">
                    <p>
                      <strong className="text-emerald-800">Poli Pemeriksaan:</strong>{' '}
                      {patient.examinedPoly || patient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}
                    </p>
                    <p className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        <strong className="text-emerald-800">Dokter Pemeriksa:</strong>{' '}
                        {patient.examinedByDoctor || patient.doctorName || 'Dokter Klinik H.APUD'}
                      </span>
                    </p>
                  </div>

                  {patient.vitalSigns &&
                    (patient.vitalSigns.bp ||
                      patient.vitalSigns.temp ||
                      patient.vitalSigns.pulse ||
                      patient.vitalSigns.weight) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white/80 p-2 rounded-xl border border-emerald-100 text-[10px]">
                        {patient.vitalSigns.bp && (
                          <div>
                            <span className="text-slate-400 block">Tensi</span>
                            <strong className="text-slate-800">{patient.vitalSigns.bp}</strong>
                          </div>
                        )}
                        {patient.vitalSigns.temp && (
                          <div>
                            <span className="text-slate-400 block">Suhu</span>
                            <strong className="text-slate-800">{patient.vitalSigns.temp}</strong>
                          </div>
                        )}
                        {patient.vitalSigns.pulse && (
                          <div>
                            <span className="text-slate-400 block">Nadi</span>
                            <strong className="text-slate-800">{patient.vitalSigns.pulse}</strong>
                          </div>
                        )}
                        {patient.vitalSigns.weight && (
                          <div>
                            <span className="text-slate-400 block">BB</span>
                            <strong className="text-slate-800">{patient.vitalSigns.weight}</strong>
                          </div>
                        )}
                      </div>
                    )}

                  {patient.diagnosis && (
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200/70">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                        Diagnosis Dokter
                      </span>
                      <p className="font-extrabold text-slate-900 mt-0.5">{patient.diagnosis}</p>
                    </div>
                  )}

                  {patient.prescription && (
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200/70">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                        <Pill className="w-3 h-3" />
                        <span>Resep Obat & Tindakan</span>
                      </span>
                      <p className="text-slate-800 whitespace-pre-line mt-0.5 font-medium">
                        {patient.prescription}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    <strong>Hasil Rekam Medis Tersimpan:</strong> Bersifat rahasia dan hanya dapat dibuka oleh Dokter pemeriksa atau Pasien yang bersangkutan.
                  </span>
                </div>
              )
            )}

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
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrintStandard}
              className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Tiket (A5/PDF)</span>
            </button>
            <button
              type="button"
              onClick={handlePrintThermal}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Cetak Struk (80mm)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Unduh Tiket (PNG)</span>
            </button>
            <a
              href={generateWhatsAppLink(patient)}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Kirim WhatsApp</span>
            </a>
          </div>

          {canPrintPrescription && (
            <button
              type="button"
              onClick={handlePrintPrescription}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Pill className="w-4 h-4" />
              <span>Cetak Resep Dokter</span>
            </button>
          )}

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
