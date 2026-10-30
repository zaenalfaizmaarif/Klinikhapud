import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Phone,
  Calendar,
  Building2,
  FileCheck,
  Search,
  UserCheck,
} from 'lucide-react';
import { Doctor } from '../../types';
import { DEFAULT_DOCTORS } from '../../data/constants';

interface ManageDoctorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onSaveDoctors: (doctors: Doctor[]) => void;
}

export const ManageDoctorsModal: React.FC<ManageDoctorsModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onSaveDoctors,
}) => {
  const [localDoctors, setLocalDoctors] = useState<Doctor[]>(doctors || DEFAULT_DOCTORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new/edit doctor
  const [formData, setFormData] = useState<Omit<Doctor, 'id'>>({
    name: '',
    specialty: '',
    sipNumber: '',
    phone: '',
    assignedPoly: 'Poli Umum',
    schedule: 'Senin - Sabtu (08:00 - 15:00 WIB)',
    status: 'Praktik',
  });

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setFormData({
      name: '',
      specialty: 'Dokter Umum & Konsultasi',
      sipNumber: '446.1/SIP-D/2026/',
      phone: '0812-',
      assignedPoly: 'Poli Umum & Konsultasi',
      schedule: 'Senin - Sabtu (08:00 - 15:00 WIB)',
      status: 'Praktik',
    });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleStartEdit = (doc: Doctor) => {
    setFormData({
      name: doc.name,
      specialty: doc.specialty,
      sipNumber: doc.sipNumber || '',
      phone: doc.phone || '',
      assignedPoly: doc.assignedPoly,
      schedule: doc.schedule,
      status: doc.status,
    });
    setEditingId(doc.id);
    setIsAdding(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      const updated = localDoctors.map((d) =>
        d.id === editingId ? { ...formData, id: editingId } : d
      );
      setLocalDoctors(updated);
      onSaveDoctors(updated);
    } else {
      const newDoc: Doctor = {
        ...formData,
        id: `doc-${Date.now()}`,
      };
      const updated = [...localDoctors, newDoc];
      setLocalDoctors(updated);
      onSaveDoctors(updated);
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus data dokter ${name}?`)) {
      const updated = localDoctors.filter((d) => d.id !== id);
      setLocalDoctors(updated);
      onSaveDoctors(updated);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: Doctor['status']) => {
    const nextStatus: Doctor['status'] =
      currentStatus === 'Praktik' ? 'Cuti' : currentStatus === 'Cuti' ? 'Aktif' : 'Praktik';
    const updated = localDoctors.map((d) => (d.id === id ? { ...d, status: nextStatus } : d));
    setLocalDoctors(updated);
    onSaveDoctors(updated);
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan daftar dokter ke data awal bawaan klinik?')) {
      setLocalDoctors(DEFAULT_DOCTORS);
      onSaveDoctors(DEFAULT_DOCTORS);
    }
  };

  const filteredDoctors = localDoctors.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.assignedPoly.toLowerCase().includes(q) ||
      (d.sipNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Stethoscope className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg">Kelola Data Dokter</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
                  {localDoctors.length} Tenaga Medis
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kelola dokter jaga, spesialisasi, SIP, jadwal praktik, dan penugasan poli klinik
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

        {/* Toolbar: Search & Add Button */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokter, spesialisasi, atau poli..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-2">
            {!isAdding && (
              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Dokter</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDefault}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition cursor-pointer"
              title="Reset ke Dokter Default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Tambah / Edit Dokter */}
        {isAdding && (
          <form
            onSubmit={handleSaveForm}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900">
                {editingId ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: dr. H. Apud S."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Spesialisasi / Keahlian *</label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Contoh: Dokter Umum & Bedah Minor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor SIP (Surat Izin Praktik)</label>
                <input
                  type="text"
                  value={formData.sipNumber}
                  onChange={(e) => setFormData({ ...formData, sipNumber: e.target.value })}
                  placeholder="Contoh: 446.1/SIP-D/2026/089"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / Telepon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 0812-9876-5432"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Penugasan Poli / Ruangan</label>
                <input
                  type="text"
                  value={formData.assignedPoly}
                  onChange={(e) => setFormData({ ...formData, assignedPoly: e.target.value })}
                  placeholder="Contoh: Poli Umum & Konsultasi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jadwal Praktik</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="Contoh: Senin - Sabtu (08:00 - 21:00 WIB)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">Status Praktik:</span>
                {(['Praktik', 'Aktif', 'Cuti'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: st })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      formData.status === st
                        ? st === 'Praktik'
                          ? 'bg-emerald-600 text-white'
                          : st === 'Cuti'
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-teal-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingId ? 'Simpan Perubahan' : 'Simpan Dokter'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Daftar Dokter */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl space-y-1 text-slate-400">
              <Stethoscope className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold">Tidak ada data dokter yang sesuai.</p>
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white transition space-y-2 shadow-2xs group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center shrink-0 border border-teal-200">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">{doc.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(doc.id, doc.status)}
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full transition cursor-pointer ${
                            doc.status === 'Praktik'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : doc.status === 'Cuti'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-teal-100 text-teal-800 border border-teal-300'
                          }`}
                          title="Klik untuk ubah status Praktik/Cuti"
                        >
                          {doc.status}
                        </button>
                      </div>
                      <p className="text-teal-700 font-semibold text-xs">{doc.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(doc)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                      title="Edit Data Dokter"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus Dokter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>SIP: <strong className="text-slate-700 font-mono">{doc.sipNumber || '-'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Poli: <strong className="text-slate-700">{doc.assignedPoly}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Jadwal: <strong className="text-slate-700">{doc.schedule}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">
            Data dokter otomatis terhubung ke ruangan periksa & saran poli pasien
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
