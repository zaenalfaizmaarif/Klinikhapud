import React from 'react';
import { Printer, X, FileText } from 'lucide-react';
import { Patient } from '../types';
import { formatDateIndo, calculateAge } from '../utils/helpers';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  patients,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPatients = patients.filter((p) => p.visitDate === todayStr);

  const sesi1 = todayPatients.filter((p) => p.sessionName === 'Sesi 1');
  const sesi2 = todayPatients.filter((p) => p.sessionName === 'Sesi 2');
  const sesi3 = todayPatients.filter((p) => p.sessionName === 'Sesi 3');
  const selesai = todayPatients.filter((p) => p.status === 'Selesai');
  const menunggu = todayPatients.filter((p) => p.status === 'Menunggu');

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 no-print">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <FileText className="text-teal-600 w-5 h-5" />
              Laporan Rekapitulasi Antrean Pasien
            </h3>
            <p className="text-xs text-slate-500">
              Pratinjau sebelum dicetak untuk arsip klinik harian
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="print-container space-y-6 text-slate-900">
          {/* Official Clinic Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl font-black tracking-wider uppercase">KLINIK H.APUD</h1>
            <p className="text-sm font-bold text-teal-800">
              PUSAT PELAYANAN KESEHATAN MASYARAKAT
            </p>
            <p className="text-xs text-slate-600">
              Jl.Sukaresmi Desa Mekarjaya Kecamatan Compreng Kabupaten Subang, Jawa Barat 41258 • Telp/WhatsApp: 0812-3456-7890
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              SURAT REKAPITULASI PELAYANAN PASIEN HARIAN
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
            <div>
              <p>
                <strong>Tanggal Laporan:</strong> {formatDateIndo(todayStr)}
              </p>
              <p>
                <strong>Penanggung Jawab:</strong> H. APUD, S.Kep., Ners
              </p>
            </div>
            <div className="text-right">
              <p>
                <strong>Total Pendaftaran:</strong> {todayPatients.length} Pasien
              </p>
              <p>
                <strong>Selesai Diperiksa:</strong> {selesai.length} Pasien
              </p>
            </div>
          </div>

          {/* Session Statistics Table */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="border border-slate-200 p-3 rounded-xl">
              <span className="font-bold text-slate-700">Sesi 1 (Pagi 08:00 - 12:00)</span>
              <p className="text-xl font-black text-slate-900 mt-1">{sesi1.length} Pasien</p>
            </div>
            <div className="border border-slate-200 p-3 rounded-xl">
              <span className="font-bold text-slate-700">Sesi 2 (Siang 13:00 - 17:00)</span>
              <p className="text-xl font-black text-slate-900 mt-1">{sesi2.length} Pasien</p>
            </div>
            <div className="border border-slate-200 p-3 rounded-xl">
              <span className="font-bold text-slate-700">Sesi 3 (Malam 18:30 - 21:00)</span>
              <p className="text-xl font-black text-slate-900 mt-1">{sesi3.length} Pasien</p>
            </div>
          </div>

          {/* Detailed Patients List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-800 bg-slate-50">
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Antrean</th>
                  <th className="py-2 px-3">Nama Pasien</th>
                  <th className="py-2 px-3">Sesi / Jam</th>
                  <th className="py-2 px-3">Layanan</th>
                  <th className="py-2 px-3">Keluhan</th>
                  <th className="py-2 px-3">Diagnosis & Tindakan</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {todayPatients.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold font-mono">{p.code}</td>
                    <td className="py-2 px-3">
                      <strong>{p.name}</strong>
                      <span className="block text-[10px] text-slate-500">
                        {p.gender}, {calculateAge(p.dob)}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {p.sessionName}
                      <span className="block text-[10px] text-slate-500">{p.timeSlot} WIB</span>
                    </td>
                    <td className="py-2 px-3">{p.service}</td>
                    <td className="py-2 px-3 text-slate-600 max-w-[150px] truncate">
                      {p.complaint}
                    </td>
                    <td className="py-2 px-3 text-slate-700 max-w-[180px]">
                      {p.diagnosis ? (
                        <>
                          <strong>{p.diagnosis}</strong>
                          {p.prescription && (
                            <span className="block text-[10px] text-slate-500 truncate">
                              Rx: {p.prescription}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-bold">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-10 flex justify-between text-xs">
            <div className="text-center w-48">
              <p>Petugas Administrasi,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Admin Klinik H.APUD</p>
            </div>
            <div className="text-center w-48">
              <p>Penanggung Jawab Klinik,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">H. APUD, S.Kep., Ners</p>
              <p className="text-[10px] text-slate-500">SIP. 446/123/SDK/2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
