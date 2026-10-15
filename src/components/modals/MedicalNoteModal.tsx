import React, { useState, useEffect } from 'react';
import { FileText, X, Printer, HeartPulse, Save, Pill } from 'lucide-react';
import { Patient, VitalSigns } from '../../types';
import { formatDateIndo, calculateAge } from '../../utils/helpers';

interface MedicalNoteModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    patientId: string,
    diagnosis: string,
    prescription: string,
    vitalSigns?: VitalSigns
  ) => void;
}

export const MedicalNoteModal: React.FC<MedicalNoteModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSave,
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [pulse, setPulse] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    if (patient) {
      setDiagnosis(patient.diagnosis || '');
      setPrescription(patient.prescription || '');
      setBp(patient.vitalSigns?.bp || '');
      setTemp(patient.vitalSigns?.temp || '');
      setPulse(patient.vitalSigns?.pulse || '');
      setWeight(patient.vitalSigns?.weight || '');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSave = () => {
    onSave(patient.id, diagnosis.trim(), prescription.trim(), {
      bp: bp.trim(),
      temp: temp.trim(),
      pulse: pulse.trim(),
      weight: weight.trim(),
    });
    onClose();
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <FileText className="text-teal-600 w-5 h-5" />
            Catatan Rekam Medis & Resep Obat
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex justify-between items-center">
            <strong className="text-teal-800 text-base font-black">
              {patient.code} - {patient.name}
            </strong>
            <span className="text-xs px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
              {patient.service}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {patient.gender} • Usia: {calculateAge(patient.dob)} • No. RM: {patient.noRM || '-'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Keluhan: <span className="text-slate-800 italic">"{patient.complaint}"</span>
          </p>
        </div>

        {/* Vital Signs (Tanda-Tanda Vital) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            Pemeriksaan Tanda Vital
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Tekanan Darah</span>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80 mmHg"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs mt-0.5"
              />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Suhu Tubuh</span>
              <input
                type="text"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="36.8 °C"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs mt-0.5"
              />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Nadi</span>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="80 bpm"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs mt-0.5"
              />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Berat Badan</span>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60 kg"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Diagnosis Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Diagnosis Pemeriksaan / Temuan Medis
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Contoh: ISPA / Hipertensi Primer / Vulnus Laceratum"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm"
          />
        </div>

        {/* Prescription & Treatment Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-teal-600" />
            Tindakan Medis & Resep Obat (Aturan Pakai)
          </label>
          <textarea
            rows={4}
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            placeholder="Contoh:&#10;1. Paracetamol 500mg 3x1 sesudah makan&#10;2. Amoxicillin 500mg 3x1 (harus habis)&#10;3. Vitamin C 500mg 1x1 tablet"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm"
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 no-print">
          <button
            type="button"
            onClick={handlePrintPrescription}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Resep</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
