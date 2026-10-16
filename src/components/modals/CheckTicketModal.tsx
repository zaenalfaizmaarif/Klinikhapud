import React, { useState } from 'react';
import { Search, X, Ticket, CheckCircle, Clock, RotateCcw, Building2, User, Phone, Filter } from 'lucide-react';
import { Patient, PatientStatus } from '../../types';
import { formatDateIndo, calculateAge } from '../../utils/helpers';

interface CheckTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectTicket: (patient: Patient) => void;
  initialQuery?: string;
  onRecheckWithCode?: (code: string) => void;
}

export const CheckTicketModal: React.FC<CheckTicketModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSelectTicket,
  initialQuery = '',
  onRecheckWithCode,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredPatients = patients.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (!trimmed) return true;
    return (
      p.code.toLowerCase().includes(trimmed) ||
      p.phone.includes(trimmed) ||
      p.name.toLowerCase().includes(trimmed) ||
      (p.noRM || '').toLowerCase().includes(trimmed) ||
      (p.assignedRoom || '').toLowerCase().includes(trimmed) ||
      p.service.toLowerCase().includes(trimmed) ||
      p.complaint.toLowerCase().includes(trimmed)
    );
  });

  const waitingCount = patients.filter((p) => p.status === 'Menunggu').length;
  const callingCount = patients.filter((p) => p.status === 'Dipanggil').length;
  const doneCount = patients.filter((p) => p.status === 'Selesai').length;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl border border-teal-200">
              <Ticket className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg">Cek Tiket Pasien</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                  {patients.length} Tiket Terdaftar
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar seluruh tiket pasien di klinik • Cari berdasarkan nama, nomor antrean, atau WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="space-y-3 pt-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari Nama Pasien / No. Antrean (A-001) / No. WhatsApp / Poli..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({patients.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Menunggu')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                statusFilter === 'Menunggu'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Menunggu ({waitingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Dipanggil')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                statusFilter === 'Dipanggil'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              Dipanggil ({callingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Selesai')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                statusFilter === 'Selesai'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Selesai ({doneCount})
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">Tidak ada tiket yang sesuai kriteria.</p>
              <p className="text-xs text-slate-400">
                {query ? `Tidak ada hasil untuk pencarian "${query}".` : 'Belum ada tiket terdaftar pada filter ini.'}
              </p>
            </div>
          ) : (
            filteredPatients.map((p) => {
              const badgeClass =
                p.status === 'Dipanggil'
                  ? 'bg-teal-100 text-teal-800 border border-teal-300 animate-pulse font-black'
                  : p.status === 'Selesai'
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : p.status === 'Batal'
                  ? 'bg-rose-100 text-rose-800 font-bold'
                  : 'bg-amber-100 text-amber-800 font-bold';

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/20 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group shadow-2xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-teal-800 text-base bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                        {p.code}
                      </span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {p.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {p.patientType === 'Baru' ? 'Pasien Baru' : `Pasien Lama (${p.noRM || 'RM'})`}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-snug">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.gender} • {calculateAge(p.dob)} • WA: {p.phone}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 pt-0.5">
                      <span className="font-semibold text-slate-800">
                        🗓️ {formatDateIndo(p.visitDate)} ({p.sessionName} • {p.timeSlot} WIB)
                      </span>
                      <span>• Layanan: <strong className="text-slate-800">{p.service}</strong></span>
                    </div>

                    {/* Room Destination Box */}
                    <div className="bg-teal-50/80 border border-teal-200 px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-900">
                      <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Ruangan: {p.assignedRoom || 'Ruang Periksa 1 (Poli Umum)'}</span>
                      {p.doctorName && (
                        <span className="text-teal-700 font-normal ml-1">
                          (👨‍⚕️ {p.doctorName})
                        </span>
                      )}
                    </div>

                    {p.complaint && (
                      <p className="text-[11px] text-slate-500 italic truncate max-w-md">
                        "{p.complaint}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
                    {onRecheckWithCode && (
                      <button
                        type="button"
                        onClick={() => {
                          onRecheckWithCode(p.code);
                          onClose();
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer border border-teal-200"
                        title="Periksa lagi menggunakan data nomor antrean ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Periksa Lagi</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTicket(p);
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-600/20"
                    >
                      <Ticket className="w-3.5 h-3.5 text-teal-200" />
                      <span>Buka Tiket</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">
            Menampilkan {filteredPatients.length} dari {patients.length} tiket
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
