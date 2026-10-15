import React, { useState } from 'react';
import { Search, X, Ticket, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { Patient } from '../../types';
import { formatDateIndo } from '../../utils/helpers';

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

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const searchResults = trimmed
    ? patients.filter(
        (p) =>
          p.code.toLowerCase().includes(trimmed) ||
          p.phone.includes(trimmed) ||
          p.name.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Cek Status & Buka Tiket</h3>
              <p className="text-xs text-slate-500">Cari nomor antrean atau nomor WhatsApp Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: A-001 atau 081234..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ketik minimal 2 karakter untuk melihat hasil.
          </p>
        </div>

        {/* Results */}
        <div className="space-y-2 pt-2">
          {trimmed && searchResults.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400">
                Tidak ada tiket ditemukan untuk pencarian "<strong>{query}</strong>".
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Pastikan nomor antrean atau nomor WhatsApp benar.
              </p>
            </div>
          ) : (
            searchResults.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/20 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-teal-800 text-lg">
                      {p.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Dipanggil'
                          ? 'bg-teal-100 text-teal-800 animate-pulse'
                          : p.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">{p.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {p.sessionName} • {p.timeSlot} WIB ({formatDateIndo(p.visitDate)})
                  </p>
                  <p className="text-[10px] text-teal-700 font-medium">Layanan: {p.service}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  {onRecheckWithCode && (
                    <button
                      type="button"
                      onClick={() => {
                        onRecheckWithCode(p.code);
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
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
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5 text-teal-600" />
                    <span>Buka Tiket</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
