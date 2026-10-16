import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Stethoscope,
  Plus,
  Check,
  UserCheck,
  AlertCircle,
  Users,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ExaminationRoom, Patient } from '../../types';
import { DEFAULT_CLINIC_ROOMS } from '../../data/constants';

interface ManageRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: ExaminationRoom[];
  onSaveRooms: (updatedRooms: ExaminationRoom[]) => void;
  patients: Patient[];
}

export const ManageRoomsModal: React.FC<ManageRoomsModalProps> = ({
  isOpen,
  onClose,
  rooms,
  onSaveRooms,
  patients,
}) => {
  const [localRooms, setLocalRooms] = useState<ExaminationRoom[]>(rooms);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPoly, setNewPoly] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  if (!isOpen) return null;

  const handleUpdateStatus = (roomId: string, status: 'Tersedia' | 'Sedang Digunakan' | 'Sterilisasi') => {
    const updated = localRooms.map((r) => (r.id === roomId ? { ...r, status } : r));
    setLocalRooms(updated);
    onSaveRooms(updated);
  };

  const handleUpdateDoctor = (roomId: string, doctorName: string) => {
    const updated = localRooms.map((r) => (r.id === roomId ? { ...r, doctorName } : r));
    setLocalRooms(updated);
    onSaveRooms(updated);
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    if (localRooms.length <= 1) {
      alert('Minimal harus ada satu ruangan pemeriksaan di klinik!');
      return;
    }
    if (confirm(`Hapus ruangan "${roomName}"? Pasien yang belum diperiksa akan diarahkan ke Ruangan Utama.`)) {
      const updated = localRooms.filter((r) => r.id !== roomId);
      setLocalRooms(updated);
      onSaveRooms(updated);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan konfigurasi ruangan ke daftar standar Klinik H.APUD?')) {
      setLocalRooms(DEFAULT_CLINIC_ROOMS);
      onSaveRooms(DEFAULT_CLINIC_ROOMS);
    }
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPoly.trim()) return;

    const newRoom: ExaminationRoom = {
      id: `room-${Date.now()}`,
      name: newName.trim(),
      polyName: newPoly.trim(),
      doctorName: newDoctor.trim() || 'Dokter Jaga',
      description: newDesc.trim() || 'Lantai 1 Klinik H.APUD',
      status: 'Tersedia',
    };

    const updated = [...localRooms, newRoom];
    setLocalRooms(updated);
    onSaveRooms(updated);

    // Reset
    setNewName('');
    setNewPoly('');
    setNewDoctor('');
    setNewDesc('');
    setIsAddingNew(false);
  };

  // Calculate live patient count per room today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPatients = patients.filter((p) => p.visitDate === todayStr && p.status !== 'Batal');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700/80 flex items-center justify-center text-teal-200 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">Kelola Ruangan Periksa & Poli</h3>
              <p className="text-xs text-teal-200">
                Atur ruangan pemeriksaan, poli pelayanan, dan dokter penanggung jawab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-teal-200 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Add New Room Button Toggle */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="font-extrabold text-slate-900 text-sm">
              Daftar Ruangan Pemeriksaan Aktif ({localRooms.length})
            </span>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNew ? 'Batal Tambah' : '+ Tambah Ruangan Baru'}</span>
            </button>
          </div>

          {/* Form Tambah Ruangan Baru */}
          {isAddingNew && (
            <form onSubmit={handleAddRoom} className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-teal-900">
                Form Tambah Ruangan / Poli Baru
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Ruangan *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Ruang Periksa 3 (Poli Gigi)"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Poli / Pelayanan *</label>
                  <input
                    type="text"
                    required
                    value={newPoly}
                    onChange={(e) => setNewPoly(e.target.value)}
                    placeholder="Contoh: Pelayanan Gigi & Mulut"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dokter / Tenaga Medis Jaga</label>
                  <input
                    type="text"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    placeholder="Contoh: drg. Nurul / Paramedis"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterangan Lokasi</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Contoh: Lantai 1 Sayap Kiri"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3.5 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          )}

          {/* List of Existing Rooms */}
          <div className="grid grid-cols-1 gap-3">
            {localRooms.map((room) => {
              const assignedPatients = todayPatients.filter(
                (p) => (p.assignedRoom || '').toLowerCase() === room.name.toLowerCase()
              );
              const activePatient = assignedPatients.find((p) => p.status === 'Dipanggil');
              const waitingInRoom = assignedPatients.filter((p) => p.status === 'Menunggu').length;

              return (
                <div
                  key={room.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-400 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{room.name}</h4>
                        <p className="text-[11px] text-teal-800 font-semibold">{room.polyName}</p>
                      </div>
                    </div>

                    {/* Status Pill Selector & Delete Room */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      {(['Tersedia', 'Sedang Digunakan', 'Sterilisasi'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(room.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            (room.status || 'Tersedia') === st
                              ? st === 'Tersedia'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : st === 'Sedang Digunakan'
                                ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                                : 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}

                      {localRooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room.id, room.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1 cursor-pointer"
                          title="Hapus Ruangan Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Doctor In Charge Input & Live Occupancy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Dokter / Paramedis Jaga:
                      </span>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <input
                          type="text"
                          value={room.doctorName || ''}
                          onChange={(e) => handleUpdateDoctor(room.id, e.target.value)}
                          placeholder="Nama dokter jaga..."
                          className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Beban Antrean Hari Ini
                          </span>
                          <span className="font-extrabold text-slate-800 text-xs">
                            {waitingInRoom} Menunggu • {assignedPatients.length} Total
                          </span>
                        </div>
                      </div>
                      {activePatient && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono font-bold text-[10px] animate-pulse">
                          Diperiksa: {activePatient.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              title="Reset ke daftar ruangan default Klinik H.APUD"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset Ruangan Default</span>
            </button>
            <span className="text-slate-400 text-[10px] hidden sm:inline">
              Tersinkron real-time ke tiket & monitor pasien
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
