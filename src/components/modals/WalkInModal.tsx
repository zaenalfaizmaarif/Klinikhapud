import React, { useState } from 'react';
import { UserPlus, X, Clock, Calendar } from 'lucide-react';
import { Patient, ServiceType, SessionName } from '../../types';
import { SESSION_TIME_SLOTS, MAX_PATIENTS_PER_SLOT } from '../../data/constants';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: Omit<Patient, 'id' | 'code' | 'status' | 'createdAt'>) => void;
  existingPatients: Patient[];
}

export const WalkInModal: React.FC<WalkInModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  existingPatients,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [patientType, setPatientType] = useState<'Baru' | 'Lama'>('Baru');
  const [noRM, setNoRM] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [dob, setDob] = useState('1990-01-01');
  const [phone, setPhone] = useState('08');
  const [address, setAddress] = useState('');
  const [service, setService] = useState<ServiceType>('Konsultasi & Berobat Umum');
  const [sessionName, setSessionName] = useState<SessionName>('Sesi 1');
  const [timeSlot, setTimeSlot] = useState<string>('08:00');
  const [complaint, setComplaint] = useState('');

  if (!isOpen) return null;

  const currentSlots = SESSION_TIME_SLOTS[sessionName] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onRegister({
      name: name.trim(),
      patientType,
      noRM: patientType === 'Lama' ? noRM.trim() || 'RM-Lama' : '-',
      service,
      dob,
      gender,
      phone: phone.trim() || '-',
      address: address.trim() || 'Desa Setempat',
      visitDate: todayStr,
      sessionName,
      timeSlot,
      complaint: complaint.trim() || 'Konsultasi keluhan umum',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Pendaftaran Walk-In / Di Tempat</h3>
              <p className="text-xs text-slate-500">Input cepat pasien yang datang langsung ke klinik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Status Pasien</label>
              <select
                value={patientType}
                onChange={(e) => setPatientType(e.target.value as 'Baru' | 'Lama')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              >
                <option value="Baru">Pasien Baru</option>
                <option value="Lama">Pasien Lama</option>
              </select>
            </div>

            {patientType === 'Lama' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">No. RM</label>
                <input
                  type="text"
                  value={noRM}
                  onChange={(e) => setNoRM(e.target.value)}
                  placeholder="RM-2025-..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Pasien *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Alamat</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dusun / Desa"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Layanan Medis</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as ServiceType)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-medium"
            >
              <option value="Konsultasi & Berobat Umum">Konsultasi & Berobat Umum (Kode: A)</option>
              <option value="Perawatan Luka & Jahit">Perawatan Luka & Jahit (Kode: B)</option>
              <option value="Cek Darah & Tensi">Cek Darah & Tensi (Kode: C)</option>
              <option value="Khitan / Sunat Modern">Khitan / Sunat Modern (Kode: K)</option>
              <option value="Layanan Home Care">Layanan Home Care (Kode: HC)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilihan Sesi</label>
              <select
                value={sessionName}
                onChange={(e) => {
                  const s = e.target.value as SessionName;
                  setSessionName(s);
                  setTimeSlot(SESSION_TIME_SLOTS[s][0] || '08:00');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              >
                <option value="Sesi 1">Sesi 1 (Pagi)</option>
                <option value="Sesi 2">Sesi 2 (Siang)</option>
                <option value="Sesi 3">Sesi 3 (Malam)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Jam</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-teal-800"
              >
                {currentSlots.map((slot) => {
                  const count = existingPatients.filter(
                    (p) =>
                      p.visitDate === todayStr &&
                      p.sessionName === sessionName &&
                      p.timeSlot === slot &&
                      p.status !== 'Batal'
                  ).length;
                  return (
                    <option key={slot} value={slot}>
                      {slot} WIB ({count}/{MAX_PATIENTS_PER_SLOT})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Keluhan Singkat</label>
            <input
              type="text"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Contoh: Sakit kepala dan demam..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-extrabold shadow-sm cursor-pointer"
            >
              Terbitkan Antrean
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
