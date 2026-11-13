import React from 'react';
import {
  Printer,
  Download,
  X,
  Receipt,
  FileText,
  Lock,
  Building2,
  Stethoscope,
  Pill,
  HeartPulse,
  CheckCircle2,
} from 'lucide-react';
import { Patient } from '../../types';
import { formatDateIndo, calculateAge } from '../../utils/helpers';
import {
  TicketPrintFormat,
  PrintDocumentMode,
  buildTicketPrintParts,
  buildPrescriptionPrintParts,
  triggerNativeDocumentPrint,
  downloadTicketImage,
  downloadPrescriptionImage,
} from '../../utils/ticketPrinter';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: PrintDocumentMode;
  patient: Patient | null;
  format: TicketPrintFormat;
  includeMedicalRecord: boolean;
  onChangeFormat: (format: TicketPrintFormat) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  mode,
  patient,
  format,
  includeMedicalRecord,
  onChangeFormat,
}) => {
  if (!isOpen || !patient) return null;

  const isPrescription = mode === 'prescription';
  const isThermal = !isPrescription && format === 'thermal';

  const poly =
    patient.examinedPoly || patient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)';
  const doctor =
    patient.examinedByDoctor || patient.doctorName || 'Dokter Klinik H.APUD';
  const examDate = patient.examinedAt
    ? patient.examinedAt.split('T')[0]
    : patient.visitDate;

  const hasMedicalData =
    patient.status === 'Selesai' &&
    Boolean(
      patient.diagnosis ||
        patient.prescription ||
        patient.vitalSigns?.bp ||
        patient.vitalSigns?.temp ||
        patient.vitalSigns?.pulse ||
        patient.vitalSigns?.weight
    );
  const showMedicalOnTicket = includeMedicalRecord && hasMedicalData;

  const hasVitals = Boolean(
    patient.vitalSigns &&
      (patient.vitalSigns.bp ||
        patient.vitalSigns.temp ||
        patient.vitalSigns.pulse ||
        patient.vitalSigns.weight)
  );

  const handlePrintNow = () => {
    if (isPrescription) {
      triggerNativeDocumentPrint(buildPrescriptionPrintParts(patient));
    } else {
      triggerNativeDocumentPrint(
        buildTicketPrintParts(patient, { format, includeMedicalRecord })
      );
    }
  };

  const handleDownloadPng = () => {
    if (isPrescription) {
      downloadPrescriptionImage(patient);
    } else {
      downloadTicketImage(patient, includeMedicalRecord);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[60] flex items-center justify-center p-3 sm:p-5 no-print animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
              {isPrescription ? (
                <Pill className="w-5 h-5" />
              ) : (
                <Printer className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                {isPrescription
                  ? 'Hasil Cetak Resep Dokter'
                  : 'Hasil Cetak Tiket Antrean'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Pratinjau siap cetak — {patient.code} • {patient.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPrescription && (
              <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => onChangeFormat('standard')}
                  className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                    format === 'standard'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>A5 / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFormat('thermal')}
                  className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                    format === 'thermal'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Struk 80mm</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Print Preview Stage */}
        <div className="flex-1 overflow-y-auto bg-slate-200/80 p-4 sm:p-6 flex justify-center items-start">
          {isPrescription ? (
            /* ============================================================
               PREVIEW: SURAT RESEP DOKTER & HASIL PEMERIKSAAN
               ============================================================ */
            <div className="bg-white w-full max-w-[540px] rounded-2xl border-2 border-teal-700 shadow-lg p-5 sm:p-6 text-slate-900 space-y-4">
              {/* Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b-2 border-slate-900 pb-3.5">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    KLINIK H.APUD
                  </h2>
                  <p className="text-[11px] font-extrabold text-teal-700 tracking-wide">
                    RESEP OBAT &amp; CATATAN PEMERIKSAAN DOKTER
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    Jl. Sukaresmi Desa Mekarjaya Kec. Compreng, Kab. Subang 41258 • WA: 0812-3456-7890
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-extrabold text-emerald-800 shrink-0 self-start">
                  <Lock className="w-3 h-3" />
                  <span>RAHASIA: DOKTER &amp; PASIEN</span>
                </span>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Nama Pasien
                  </span>
                  <strong className="text-slate-900">{patient.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    No. Antrean / No. RM
                  </span>
                  <strong className="text-slate-900">
                    {patient.code} • RM: {patient.noRM || '-'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Kelamin / Usia
                  </span>
                  <strong className="text-slate-900">
                    {patient.gender} • {calculateAge(patient.dob)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Tanggal Pemeriksaan
                  </span>
                  <strong className="text-slate-900">{formatDateIndo(examDate)}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Poli / Ruangan Periksa
                  </span>
                  <strong className="text-teal-800">{poly}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Dokter Pemeriksa
                  </span>
                  <strong className="text-teal-800">{doctor}</strong>
                </div>
              </div>

              {/* Vital Signs */}
              {hasVitals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-teal-700 block">
                      Tekanan Darah
                    </span>
                    <strong className="text-slate-900">
                      {patient.vitalSigns?.bp || '-'}
                    </strong>
                  </div>
                  <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-teal-700 block">
                      Suhu Tubuh
                    </span>
                    <strong className="text-slate-900">
                      {patient.vitalSigns?.temp || '-'}
                    </strong>
                  </div>
                  <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-teal-700 block">
                      Denyut Nadi
                    </span>
                    <strong className="text-slate-900">
                      {patient.vitalSigns?.pulse || '-'}
                    </strong>
                  </div>
                  <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-teal-700 block">
                      Berat Badan
                    </span>
                    <strong className="text-slate-900">
                      {patient.vitalSigns?.weight || '-'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Diagnosis / Temuan Medis</span>
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {patient.diagnosis || 'Belum ada catatan diagnosis'}
                </p>
              </div>

              {/* Rx Box */}
              <div className="border-2 border-slate-300 rounded-xl p-4 min-h-[140px] bg-white space-y-2">
                <div className="text-3xl font-black text-teal-700 font-serif leading-none">
                  &#8478;
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                  {patient.prescription ||
                    'Belum ada resep obat / tindakan yang dicatat.'}
                </p>
              </div>

              {/* Signature Footer */}
              <div className="border-t border-dashed border-slate-300 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-[11px]">
                <p className="text-slate-500 max-w-xs leading-relaxed">
                  <strong className="text-slate-700">Catatan Privasi:</strong> Dokumen resep &amp; rekam medis ini bersifat rahasia dan hanya ditujukan bagi pasien bersangkutan serta dokter pemeriksa Klinik H.APUD.
                </p>
                <div className="text-center self-end sm:self-auto min-w-[170px]">
                  <p className="text-slate-600">
                    Compreng, {formatDateIndo(examDate)}
                  </p>
                  <p className="text-slate-600">Dokter Pemeriksa,</p>
                  <div className="h-10"></div>
                  <p className="font-extrabold text-slate-900 underline">
                    {doctor}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================
               PREVIEW: TIKET ANTREAN (A5 / PDF atau STRUK 80MM)
               ============================================================ */
            <div
              className={`bg-white shadow-lg text-slate-900 space-y-3.5 transition-all ${
                isThermal
                  ? 'w-full max-w-[310px] p-4 rounded-none border border-dashed border-slate-400'
                  : 'w-full max-w-[430px] p-5 sm:p-6 rounded-2xl border border-slate-300'
              }`}
            >
              {/* Clinic Header */}
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <h2
                  className={`font-black tracking-tight text-slate-900 ${
                    isThermal ? 'text-base' : 'text-xl'
                  }`}
                >
                  KLINIK H.APUD
                </h2>
                <p className="text-[10px] font-extrabold text-teal-700 tracking-wide">
                  PUSAT PELAYANAN KESEHATAN MASYARAKAT
                </p>
                <p className="text-[9.5px] text-slate-500 mt-1 leading-snug">
                  Jl. Sukaresmi Desa Mekarjaya Kec. Compreng, Kab. Subang 41258 • WA: 0812-3456-7890
                </p>
              </div>

              {/* Queue Number */}
              <div className="text-center bg-teal-50 border border-teal-200 rounded-xl py-3.5 px-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800">
                  Nomor Antrean Anda
                </p>
                <p
                  className={`font-black text-teal-700 font-mono tracking-wider my-1 ${
                    isThermal ? 'text-4xl' : 'text-5xl'
                  }`}
                >
                  {patient.code}
                </p>
                <p className="text-xs font-bold text-slate-700">{patient.service}</p>
              </div>

              {/* Schedule Bar */}
              <div className="bg-slate-900 text-white rounded-xl p-3 flex justify-between items-center text-[11px]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Jadwal Sesi &amp; Jam
                  </span>
                  <strong className="text-amber-400 text-xs">
                    {patient.sessionName} • {patient.timeSlot} WIB
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Tanggal Kunjungan
                  </span>
                  <strong className="text-white">
                    {formatDateIndo(patient.visitDate)}
                  </strong>
                </div>
              </div>

              {/* Room Box */}
              <div className="bg-teal-50 border border-teal-300 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-teal-800 block">
                    Ruangan / Poli Tujuan
                  </span>
                  <p className="text-xs font-black text-slate-900 truncate">
                    {poly}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-600 truncate">
                    Tenaga Medis: {doctor}
                  </p>
                </div>
              </div>

              {/* Patient Rows */}
              <div className="border-b border-dashed border-slate-400 pb-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Nama Pasien</span>
                  <strong className="text-slate-900 text-right">{patient.name}</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Status Pasien</span>
                  <strong className="text-slate-900 text-right">
                    {patient.patientType === 'Baru'
                      ? 'Pasien Baru'
                      : `Pasien Lama (RM: ${patient.noRM || '-'})`}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Kelamin / Usia</span>
                  <strong className="text-slate-900 text-right">
                    {patient.gender} • {calculateAge(patient.dob)}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">No. WhatsApp</span>
                  <strong className="text-slate-900 text-right">{patient.phone}</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Keluhan</span>
                  <span className="text-slate-700 italic text-right truncate max-w-[200px]">
                    "{patient.complaint}"
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Status Antrean</span>
                  <strong className="text-slate-900 text-right">{patient.status}</strong>
                </div>
              </div>

              {/* Confidential Medical Result if authorized */}
              {showMedicalOnTicket && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-200 pb-1.5 font-black text-emerald-900">
                    <span className="flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                      <span>HASIL REKAM MEDIS</span>
                    </span>
                    <span className="text-[9px] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      RAHASIA
                    </span>
                  </div>
                  {hasVitals && (
                    <div className="flex flex-wrap gap-2 bg-white px-2 py-1.5 rounded-lg border border-emerald-100 text-[10px]">
                      {patient.vitalSigns?.bp && (
                        <span>
                          TD: <strong>{patient.vitalSigns.bp}</strong>
                        </span>
                      )}
                      {patient.vitalSigns?.temp && (
                        <span>
                          Suhu: <strong>{patient.vitalSigns.temp}</strong>
                        </span>
                      )}
                      {patient.vitalSigns?.pulse && (
                        <span>
                          Nadi: <strong>{patient.vitalSigns.pulse}</strong>
                        </span>
                      )}
                      {patient.vitalSigns?.weight && (
                        <span>
                          BB: <strong>{patient.vitalSigns.weight}</strong>
                        </span>
                      )}
                    </div>
                  )}
                  {patient.diagnosis && (
                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="text-[9px] font-bold uppercase text-emerald-700 block">
                        Diagnosis
                      </span>
                      <strong className="text-slate-900">{patient.diagnosis}</strong>
                    </div>
                  )}
                  {patient.prescription && (
                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="text-[9px] font-bold uppercase text-emerald-700 block">
                        Resep &amp; Tindakan
                      </span>
                      <p className="text-slate-800 whitespace-pre-line font-medium">
                        {patient.prescription}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Barcode */}
              <div className="text-center space-y-1 pt-1">
                <div className="h-7 w-44 mx-auto bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_7px,#fff_7px,#fff_9px)]"></div>
                <p className="text-[9px] font-mono tracking-widest text-slate-500">
                  KLINIK-HAPUD-{patient.code}-{(patient.visitDate || '').replace(/-/g, '')}
                </p>
              </div>

              <p className="text-[9.5px] text-slate-500 text-center leading-relaxed">
                Harap tiba di klinik 10 menit sebelum jam sesi ({patient.timeSlot} WIB) untuk verifikasi berkas. Tunjukkan tiket ini kepada petugas loket.
              </p>
            </div>
          )}
        </div>

        {/* Footer Print / Download Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handlePrintNow}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Printer / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isPrescription ? 'Unduh Resep (PNG)' : 'Unduh Tiket (PNG)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-2xl transition cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 text-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Jika browser/HP tidak membuka jendela printer otomatis, gunakan tombol <strong>Unduh (PNG)</strong> untuk menyimpan hasil cetak langsung ke perangkat Anda.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
