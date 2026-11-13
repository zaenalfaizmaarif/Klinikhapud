import { Patient } from '../types';
import { formatDateIndo, calculateAge } from './helpers';

export type TicketPrintFormat = 'standard' | 'thermal';
export type PrintDocumentMode = 'ticket' | 'prescription';

export interface PrintTicketOptions {
  format?: TicketPrintFormat;
  includeMedicalRecord?: boolean;
}

export interface PrintPreviewPayload {
  mode: PrintDocumentMode;
  patient: Patient;
  format: TicketPrintFormat;
  includeMedicalRecord: boolean;
}

type PrintPreviewListener = (payload: PrintPreviewPayload) => void;

let activePreviewListener: PrintPreviewListener | null = null;

export function registerPrintPreviewHandler(
  listener: PrintPreviewListener | null
): void {
  activePreviewListener = listener;
}

const escapeHtml = (value?: string): string => {
  if (!value) return '-';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export function buildTicketPrintParts(
  patient: Patient,
  options: PrintTicketOptions = {}
): { styles: string; bodyHtml: string } {
  const { format = 'standard', includeMedicalRecord = false } = options;

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

  const showMedical = includeMedicalRecord && hasMedicalData;
  const poly =
    patient.examinedPoly || patient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)';
  const doctor =
    patient.examinedByDoctor || patient.doctorName || 'Dokter Klinik H.APUD';

  const medicalHtml = showMedical
    ? `
      <div class="tp-medical-box">
        <div class="tp-medical-title">HASIL REKAM MEDIS (RAHASIA: PASIEN &amp; DOKTER)</div>
        <div class="tp-meta-line"><strong>Poli Periksa:</strong> ${escapeHtml(poly)}</div>
        <div class="tp-meta-line"><strong>Dokter:</strong> ${escapeHtml(doctor)}</div>
        ${
          patient.vitalSigns &&
          (patient.vitalSigns.bp ||
            patient.vitalSigns.temp ||
            patient.vitalSigns.pulse ||
            patient.vitalSigns.weight)
            ? `<div class="tp-vitals">
                ${patient.vitalSigns.bp ? `<span>TD: <strong>${escapeHtml(patient.vitalSigns.bp)}</strong></span>` : ''}
                ${patient.vitalSigns.temp ? `<span>Suhu: <strong>${escapeHtml(patient.vitalSigns.temp)}</strong></span>` : ''}
                ${patient.vitalSigns.pulse ? `<span>Nadi: <strong>${escapeHtml(patient.vitalSigns.pulse)}</strong></span>` : ''}
                ${patient.vitalSigns.weight ? `<span>BB: <strong>${escapeHtml(patient.vitalSigns.weight)}</strong></span>` : ''}
              </div>`
            : ''
        }
        ${
          patient.diagnosis
            ? `<div class="tp-med-item"><span class="tp-med-label">Diagnosis:</span> <strong>${escapeHtml(patient.diagnosis)}</strong></div>`
            : ''
        }
        ${
          patient.prescription
            ? `<div class="tp-med-item"><span class="tp-med-label">Resep &amp; Tindakan:</span><div class="tp-rx-text">${escapeHtml(patient.prescription)}</div></div>`
            : ''
        }
      </div>
    `
    : '';

  const isThermal = format === 'thermal';

  const styles = `
    @page {
      size: ${isThermal ? '80mm auto' : 'A5 portrait'};
      margin: ${isThermal ? '4mm' : '10mm'};
    }
    #print-mount * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #print-mount {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
    }
    #print-mount .tp-ticket {
      width: 100%;
      max-width: ${isThermal ? '74mm' : '440px'};
      margin: 0 auto;
      border: ${isThermal ? 'none' : '1.5px solid #cbd5e1'};
      border-radius: ${isThermal ? '0' : '16px'};
      padding: ${isThermal ? '4px' : '20px'};
      background: #ffffff;
    }
    #print-mount .tp-header {
      text-align: center;
      border-bottom: 1.5px dashed #94a3b8;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    #print-mount .tp-clinic-name {
      font-size: ${isThermal ? '16px' : '20px'};
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 0;
    }
    #print-mount .tp-clinic-sub {
      font-size: 10px;
      font-weight: 700;
      color: #0f766e;
      margin: 2px 0 0;
    }
    #print-mount .tp-clinic-addr {
      font-size: 9px;
      color: #475569;
      margin: 4px 0 0;
      line-height: 1.35;
    }
    #print-mount .tp-queue-box {
      text-align: center;
      background: #f0fdfa;
      border: 1.5px solid #99f6e4;
      border-radius: 12px;
      padding: ${isThermal ? '10px 6px' : '14px 10px'};
      margin-bottom: 10px;
    }
    #print-mount .tp-queue-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #115e59;
      margin: 0;
    }
    #print-mount .tp-queue-code {
      font-size: ${isThermal ? '34px' : '44px'};
      font-weight: 900;
      color: #0f766e;
      margin: 4px 0;
      letter-spacing: 1.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    #print-mount .tp-queue-service {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin: 0;
    }
    #print-mount .tp-schedule-bar {
      background: #0f172a;
      color: #ffffff;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 10px;
    }
    #print-mount .tp-gold {
      color: #fbbf24;
      font-size: 12px;
      font-weight: 800;
      margin-top: 2px;
    }
    #print-mount .tp-muted {
      color: #94a3b8;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
    }
    #print-mount .tp-room-box {
      background: #f0fdfa;
      border: 1.5px solid #5eead4;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    #print-mount .tp-room-label {
      font-size: 9px;
      font-weight: 800;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    #print-mount .tp-room-name {
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      margin: 2px 0;
    }
    #print-mount .tp-room-doc {
      font-size: 10px;
      font-weight: 600;
      color: #334155;
    }
    #print-mount .tp-details {
      border-bottom: 1.5px dashed #94a3b8;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-size: 11px;
    }
    #print-mount .tp-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 5px;
    }
    #print-mount .tp-row .k {
      color: #64748b;
      flex-shrink: 0;
    }
    #print-mount .tp-row .v {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }
    #print-mount .tp-medical-box {
      background: #ecfdf5;
      border: 1.5px solid #6ee7b7;
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 12px;
      font-size: 10px;
    }
    #print-mount .tp-medical-title {
      font-weight: 900;
      color: #064e3b;
      border-bottom: 1px solid #a7f3d0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    #print-mount .tp-meta-line {
      margin-bottom: 3px;
      color: #065f46;
    }
    #print-mount .tp-vitals {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #d1fae5;
      border-radius: 6px;
      padding: 5px 8px;
      margin: 6px 0;
    }
    #print-mount .tp-med-item {
      background: #ffffff;
      border: 1px solid #d1fae5;
      border-radius: 6px;
      padding: 6px 8px;
      margin-top: 5px;
    }
    #print-mount .tp-med-label {
      display: block;
      font-size: 9px;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    #print-mount .tp-rx-text {
      white-space: pre-line;
      font-weight: 600;
      color: #0f172a;
    }
    #print-mount .tp-barcode-wrap {
      text-align: center;
      margin: 10px 0;
    }
    #print-mount .tp-barcode {
      height: 28px;
      width: 180px;
      margin: 0 auto 4px;
      background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 9px);
    }
    #print-mount .tp-barcode-text {
      font-size: 9px;
      font-family: ui-monospace, monospace;
      letter-spacing: 1.5px;
      color: #64748b;
    }
    #print-mount .tp-footer-note {
      font-size: 9.5px;
      color: #475569;
      text-align: center;
      line-height: 1.4;
      margin-top: 8px;
    }
  `;

  const bodyHtml = `
    <div class="tp-ticket">
      <div class="tp-header">
        <h1 class="tp-clinic-name">KLINIK H.APUD</h1>
        <p class="tp-clinic-sub">PUSAT PELAYANAN KESEHATAN MASYARAKAT</p>
        <p class="tp-clinic-addr">
          Jl. Sukaresmi Desa Mekarjaya Kec. Compreng, Kab. Subang 41258<br/>
          WhatsApp: 0812-3456-7890
        </p>
      </div>

      <div class="tp-queue-box">
        <p class="tp-queue-label">Nomor Antrean Anda</p>
        <p class="tp-queue-code">${escapeHtml(patient.code)}</p>
        <p class="tp-queue-service">${escapeHtml(patient.service)}</p>
      </div>

      <div class="tp-schedule-bar">
        <div>
          <div class="tp-muted">Jadwal Sesi &amp; Jam</div>
          <div class="tp-gold">${escapeHtml(patient.sessionName)} • ${escapeHtml(patient.timeSlot)} WIB</div>
        </div>
        <div style="text-align: right;">
          <div class="tp-muted">Tanggal Kunjungan</div>
          <div style="font-weight: 700; margin-top: 2px;">${escapeHtml(formatDateIndo(patient.visitDate))}</div>
        </div>
      </div>

      <div class="tp-room-box">
        <div class="tp-room-label">Ruangan / Poli Tujuan</div>
        <div class="tp-room-name">${escapeHtml(poly)}</div>
        <div class="tp-room-doc">Tenaga Medis: ${escapeHtml(doctor)}</div>
      </div>

      <div class="tp-details">
        <div class="tp-row"><span class="k">Nama Pasien</span><span class="v">${escapeHtml(patient.name)}</span></div>
        <div class="tp-row"><span class="k">Status Pasien</span><span class="v">${patient.patientType === 'Baru' ? 'Pasien Baru' : `Pasien Lama (RM: ${escapeHtml(patient.noRM || '-')})`}</span></div>
        <div class="tp-row"><span class="k">Kelamin / Usia</span><span class="v">${escapeHtml(patient.gender)} • ${escapeHtml(calculateAge(patient.dob))}</span></div>
        <div class="tp-row"><span class="k">No. WhatsApp</span><span class="v">${escapeHtml(patient.phone)}</span></div>
        <div class="tp-row"><span class="k">Keluhan</span><span class="v" style="font-style: italic; font-weight: 500;">"${escapeHtml(patient.complaint)}"</span></div>
        <div class="tp-row"><span class="k">Status Antrean</span><span class="v">${escapeHtml(patient.status)}</span></div>
      </div>

      ${medicalHtml}

      <div class="tp-barcode-wrap">
        <div class="tp-barcode"></div>
        <div class="tp-barcode-text">KLINIK-HAPUD-${escapeHtml(patient.code)}-${escapeHtml((patient.visitDate || '').replace(/-/g, ''))}</div>
      </div>

      <p class="tp-footer-note">
        Harap tiba di klinik 10 menit sebelum jam sesi (${escapeHtml(patient.timeSlot)} WIB) untuk verifikasi berkas. Tunjukkan tiket ini kepada petugas loket.
      </p>
    </div>
  `;

  return { styles, bodyHtml };
}

export function buildPrescriptionPrintParts(patient: Patient): {
  styles: string;
  bodyHtml: string;
} {
  const poly =
    patient.examinedPoly || patient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)';
  const doctor =
    patient.examinedByDoctor || patient.doctorName || 'Dokter Klinik H.APUD';
  const examDate = patient.examinedAt
    ? patient.examinedAt.split('T')[0]
    : patient.visitDate;

  const hasVitals = Boolean(
    patient.vitalSigns &&
      (patient.vitalSigns.bp ||
        patient.vitalSigns.temp ||
        patient.vitalSigns.pulse ||
        patient.vitalSigns.weight)
  );

  const styles = `
    @page {
      size: A5 portrait;
      margin: 10mm;
    }
    #print-mount * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #print-mount {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
    }
    #print-mount .rx-sheet {
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
      border: 2px solid #0f766e;
      border-radius: 14px;
      padding: 20px 22px;
      background: #ffffff;
    }
    #print-mount .rx-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
      gap: 12px;
    }
    #print-mount .rx-clinic-name {
      font-size: 20px;
      font-weight: 900;
      margin: 0;
      color: #0f172a;
    }
    #print-mount .rx-clinic-sub {
      font-size: 10px;
      font-weight: 800;
      color: #0f766e;
      margin: 2px 0 0;
      letter-spacing: 0.4px;
    }
    #print-mount .rx-clinic-addr {
      font-size: 9px;
      color: #475569;
      margin: 3px 0 0;
      line-height: 1.35;
    }
    #print-mount .rx-badge {
      background: #ecfdf5;
      border: 1px solid #6ee7b7;
      color: #065f46;
      font-size: 9px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 999px;
      white-space: nowrap;
    }
    #print-mount .rx-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 10.5px;
      margin-bottom: 12px;
    }
    #print-mount .rx-meta-item strong {
      color: #0f172a;
      display: block;
      font-size: 11px;
      margin-top: 1px;
    }
    #print-mount .rx-meta-label {
      color: #64748b;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    #print-mount .rx-vitals {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    #print-mount .rx-vital-card {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 8px;
      padding: 6px 8px;
      text-align: center;
      font-size: 10px;
    }
    #print-mount .rx-vital-card span {
      display: block;
      color: #0f766e;
      font-size: 9px;
      font-weight: 700;
    }
    #print-mount .rx-vital-card strong {
      font-size: 11.5px;
      color: #0f172a;
    }
    #print-mount .rx-diag-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    #print-mount .rx-section-label {
      font-size: 9.5px;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    #print-mount .rx-diag-text {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    #print-mount .rx-body {
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      padding: 14px 16px;
      min-height: 150px;
      margin-bottom: 16px;
      position: relative;
      background: #ffffff;
    }
    #print-mount .rx-symbol {
      font-size: 28px;
      font-weight: 900;
      color: #0f766e;
      font-family: Georgia, serif;
      line-height: 1;
      margin-bottom: 8px;
    }
    #print-mount .rx-list {
      white-space: pre-line;
      font-size: 12.5px;
      line-height: 1.65;
      font-weight: 600;
      color: #0f172a;
    }
    #print-mount .rx-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 12px;
      font-size: 10px;
    }
    #print-mount .rx-privacy {
      color: #475569;
      max-width: 60%;
      line-height: 1.4;
    }
    #print-mount .rx-sign {
      text-align: center;
      min-width: 170px;
    }
    #print-mount .rx-sign-space {
      height: 44px;
    }
    #print-mount .rx-sign-name {
      font-weight: 800;
      color: #0f172a;
      text-decoration: underline;
      font-size: 11px;
    }
  `;

  const bodyHtml = `
    <div class="rx-sheet">
      <div class="rx-header">
        <div>
          <h1 class="rx-clinic-name">KLINIK H.APUD</h1>
          <p class="rx-clinic-sub">RESEP OBAT &amp; CATATAN PEMERIKSAAN DOKTER</p>
          <p class="rx-clinic-addr">
            Jl. Sukaresmi Desa Mekarjaya Kec. Compreng, Kab. Subang 41258 • WA: 0812-3456-7890
          </p>
        </div>
        <div class="rx-badge">RAHASIA: DOKTER &amp; PASIEN</div>
      </div>

      <div class="rx-meta-grid">
        <div class="rx-meta-item">
          <span class="rx-meta-label">Nama Pasien</span>
          <strong>${escapeHtml(patient.name)}</strong>
        </div>
        <div class="rx-meta-item">
          <span class="rx-meta-label">No. Antrean / No. RM</span>
          <strong>${escapeHtml(patient.code)} • RM: ${escapeHtml(patient.noRM || '-')}</strong>
        </div>
        <div class="rx-meta-item">
          <span class="rx-meta-label">Kelamin / Usia</span>
          <strong>${escapeHtml(patient.gender)} • ${escapeHtml(calculateAge(patient.dob))}</strong>
        </div>
        <div class="rx-meta-item">
          <span class="rx-meta-label">Tanggal Pemeriksaan</span>
          <strong>${escapeHtml(formatDateIndo(examDate))}</strong>
        </div>
        <div class="rx-meta-item">
          <span class="rx-meta-label">Poli / Ruangan Periksa</span>
          <strong>${escapeHtml(poly)}</strong>
        </div>
        <div class="rx-meta-item">
          <span class="rx-meta-label">Dokter Pemeriksa</span>
          <strong>${escapeHtml(doctor)}</strong>
        </div>
      </div>

      ${
        hasVitals
          ? `<div class="rx-vitals">
              <div class="rx-vital-card"><span>Tekanan Darah</span><strong>${escapeHtml(patient.vitalSigns?.bp || '-')}</strong></div>
              <div class="rx-vital-card"><span>Suhu Tubuh</span><strong>${escapeHtml(patient.vitalSigns?.temp || '-')}</strong></div>
              <div class="rx-vital-card"><span>Denyut Nadi</span><strong>${escapeHtml(patient.vitalSigns?.pulse || '-')}</strong></div>
              <div class="rx-vital-card"><span>Berat Badan</span><strong>${escapeHtml(patient.vitalSigns?.weight || '-')}</strong></div>
            </div>`
          : ''
      }

      <div class="rx-diag-box">
        <div class="rx-section-label">Diagnosis / Temuan Medis</div>
        <p class="rx-diag-text">${escapeHtml(patient.diagnosis || 'Belum ada catatan diagnosis')}</p>
      </div>

      <div class="rx-body">
        <div class="rx-symbol">&#8478;</div>
        <div class="rx-list">${escapeHtml(patient.prescription || 'Belum ada resep obat / tindakan yang dicatat.')}</div>
      </div>

      <div class="rx-footer">
        <div class="rx-privacy">
          <strong>Catatan Privasi:</strong> Dokumen resep &amp; rekam medis ini bersifat rahasia dan hanya ditujukan bagi pasien bersangkutan serta dokter pemeriksa Klinik H.APUD.
        </div>
        <div class="rx-sign">
          <div>Compreng, ${escapeHtml(formatDateIndo(examDate))}</div>
          <div>Dokter Pemeriksa,</div>
          <div class="rx-sign-space"></div>
          <div class="rx-sign-name">${escapeHtml(doctor)}</div>
        </div>
      </div>
    </div>
  `;

  return { styles, bodyHtml };
}

/**
 * Triggers native browser print using a dedicated #print-mount element
 * on document.body (reliable across desktop, mobile, and embedded previews).
 */
export function triggerNativeDocumentPrint(parts: {
  styles: string;
  bodyHtml: string;
}): void {
  let styleEl = document.getElementById('print-mount-style') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'print-mount-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = parts.styles;

  let mountEl = document.getElementById('print-mount');
  if (!mountEl) {
    mountEl = document.createElement('div');
    mountEl.id = 'print-mount';
    document.body.appendChild(mountEl);
  }
  mountEl.innerHTML = parts.bodyHtml;

  document.body.classList.add('is-printing-document');

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove('is-printing-document');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  setTimeout(() => {
    try {
      window.focus();
      window.print();
    } finally {
      setTimeout(cleanup, 2500);
    }
  }, 80);
}

/**
 * Opens the in-app Print Preview modal for a Patient Ticket (and triggers native print on demand).
 */
export function printTicketDocument(
  patient: Patient,
  options: PrintTicketOptions = {}
): void {
  const { format = 'standard', includeMedicalRecord = false } = options;

  if (activePreviewListener) {
    activePreviewListener({
      mode: 'ticket',
      patient,
      format,
      includeMedicalRecord,
    });
    return;
  }

  triggerNativeDocumentPrint(buildTicketPrintParts(patient, options));
}

/**
 * Opens the in-app Print Preview modal for a Doctor's Prescription (Resep Dokter).
 */
export function printPrescriptionDocument(patient: Patient): void {
  if (activePreviewListener) {
    activePreviewListener({
      mode: 'prescription',
      patient,
      format: 'standard',
      includeMedicalRecord: true,
    });
    return;
  }

  triggerNativeDocumentPrint(buildPrescriptionPrintParts(patient));
}

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const rawLines = (text || '-').split('\n');
  const wrapped: string[] = [];

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      wrapped.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) wrapped.push(current);
  }
  return wrapped.length > 0 ? wrapped : ['-'];
}

/**
 * Render and download the ticket as a crisp PNG image using HTML5 Canvas.
 */
export function downloadTicketImage(
  patient: Patient,
  includeMedicalRecord = false
): void {
  const hasMedicalData =
    includeMedicalRecord &&
    patient.status === 'Selesai' &&
    Boolean(patient.diagnosis || patient.prescription);

  const width = 720;
  const height = hasMedicalData ? 1160 : 940;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer card border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(24, 24, width - 48, height - 48, 24);
  ctx.stroke();

  // Header Banner
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.roundRect(24, 24, width - 48, 118, [24, 24, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 30px system-ui, -apple-system, sans-serif';
  ctx.fillText('KLINIK H.APUD', width / 2, 70);

  ctx.fillStyle = '#ccfbf1';
  ctx.font = '700 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('PUSAT PELAYANAN KESEHATAN MASYARAKAT', width / 2, 96);

  ctx.font = '500 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Jl. Sukaresmi Desa Mekarjaya, Compreng, Subang • WA: 0812-3456-7890', width / 2, 120);

  // Queue Number Box
  ctx.fillStyle = '#f0fdfa';
  ctx.strokeStyle = '#99f6e4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(54, 168, width - 108, 160, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#115e59';
  ctx.font = '800 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('NOMOR ANTREAN ANDA', width / 2, 200);

  ctx.fillStyle = '#0f766e';
  ctx.font = '900 64px ui-monospace, monospace';
  ctx.fillText(patient.code, width / 2, 270);

  ctx.fillStyle = '#334155';
  ctx.font = '700 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(patient.service, width / 2, 306);

  // Schedule Dark Box
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(54, 348, width - 108, 86, 16);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('JADWAL SESI & JAM', 76, 378);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '800 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${patient.sessionName} • ${patient.timeSlot} WIB`, 76, 408);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('TANGGAL KUNJUNGAN', width - 76, 378);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(formatDateIndo(patient.visitDate), width - 76, 408);

  // Room Destination Box
  const poly = patient.examinedPoly || patient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)';
  const doctor = patient.examinedByDoctor || patient.doctorName || 'Dokter Klinik H.APUD';

  ctx.fillStyle = '#f0fdfa';
  ctx.strokeStyle = '#5eead4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(54, 454, width - 108, 92, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f766e';
  ctx.font = '800 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('RUANGAN / POLI TUJUAN', 76, 482);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(poly.slice(0, 48), 76, 510);

  ctx.fillStyle = '#475569';
  ctx.font = '600 14px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Tenaga Medis: ${doctor}`, 76, 534);

  // Patient Details Rows
  const detailRows: [string, string][] = [
    ['Nama Pasien', patient.name],
    [
      'Status Pasien',
      patient.patientType === 'Baru' ? 'Pasien Baru' : `Pasien Lama (RM: ${patient.noRM || '-'})`,
    ],
    ['Kelamin / Usia', `${patient.gender} • ${calculateAge(patient.dob)}`],
    ['No. WhatsApp', patient.phone],
    ['Status Antrean', patient.status],
    ['Keluhan', `"${(patient.complaint || '-').slice(0, 46)}"`],
  ];

  let y = 584;
  for (const [label, val] of detailRows) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(label, 58, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(val, width - 58, y);
    y += 34;
  }

  // Optional Confidential Medical Box
  if (hasMedicalData) {
    ctx.fillStyle = '#ecfdf5';
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(54, y + 6, width - 108, 175, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#065f46';
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('HASIL REKAM MEDIS (RAHASIA: PASIEN & DOKTER)', 74, y + 34);

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Diagnosis: ${(patient.diagnosis || '-').slice(0, 55)}`, 74, y + 66);

    ctx.fillStyle = '#334155';
    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    const rxLines = (patient.prescription || '-').split('\n').slice(0, 3);
    rxLines.forEach((line, idx) => {
      ctx.fillText(`${idx === 0 ? 'Resep: ' : ''}${line.slice(0, 60)}`, 74, y + 96 + idx * 24);
    });
    y += 200;
  }

  // Barcode stripes
  const barcodeY = y + 20;
  const barcodeStartX = (width - 280) / 2;
  let bx = barcodeStartX;
  const pattern = [3, 2, 5, 2, 2, 4, 3, 2, 6, 2, 3, 3, 4, 2, 2, 5, 3, 2, 4, 3, 2, 6, 2, 3];
  pattern.forEach((w, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? '#0f172a' : '#ffffff';
    ctx.fillRect(bx, barcodeY, w * 3.5, 42);
    bx += w * 3.5;
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '600 12px ui-monospace, monospace';
  ctx.fillText(
    `KLINIK-HAPUD-${patient.code}-${(patient.visitDate || '').replace(/-/g, '')}`,
    width / 2,
    barcodeY + 62
  );

  ctx.fillStyle = '#475569';
  ctx.font = '500 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `Harap hadir 10 menit sebelum jam sesi (${patient.timeSlot} WIB). Tunjukkan tiket ini ke petugas.`,
    width / 2,
    barcodeY + 92
  );

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `Tiket-Antrean-${patient.code}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Render and download the Doctor's Prescription (Resep Dokter) as a crisp PNG image.
 */
export function downloadPrescriptionImage(patient: Patient): void {
  const width = 760;
  const scale = 2;

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCtx.font = '600 16px system-ui, -apple-system, sans-serif';
  const rxWrapped = wrapCanvasLines(
    tempCtx,
    patient.prescription || 'Belum ada resep obat / tindakan yang dicatat.',
    width - 150
  );
  tempCtx.font = '800 18px system-ui, -apple-system, sans-serif';
  const diagWrapped = wrapCanvasLines(
    tempCtx,
    patient.diagnosis || 'Belum ada catatan diagnosis',
    width - 150
  );

  const hasVitals = Boolean(
    patient.vitalSigns &&
      (patient.vitalSigns.bp ||
        patient.vitalSigns.temp ||
        patient.vitalSigns.pulse ||
        patient.vitalSigns.weight)
  );

  const vitalsOffset = hasVitals ? 84 : 0;
  const diagBoxHeight = 56 + diagWrapped.length * 26;
  const rxBoxHeight = Math.max(180, 74 + rxWrapped.length * 28);
  const height = 430 + vitalsOffset + diagBoxHeight + rxBoxHeight + 150;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer card border
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(24, 24, width - 48, height - 48, 22);
  ctx.stroke();

  // Header
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.roundRect(24, 24, width - 48, 118, [22, 22, 0, 0]);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('KLINIK H.APUD', 52, 68);

  ctx.fillStyle = '#ccfbf1';
  ctx.font = '800 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('RESEP OBAT & CATATAN PEMERIKSAAN DOKTER', 52, 92);

  ctx.font = '500 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Jl. Sukaresmi Desa Mekarjaya, Compreng, Subang • WA: 0812-3456-7890', 52, 116);

  // Confidentiality pill in header
  ctx.fillStyle = '#ecfdf5';
  ctx.beginPath();
  ctx.roundRect(width - 252, 52, 200, 32, 16);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46';
  ctx.font = '800 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('RAHASIA: DOKTER & PASIEN', width - 152, 72);

  const poly =
    patient.examinedPoly || patient.assignedRoom || 'Ruang Periksa 1 (Poli Umum)';
  const doctor =
    patient.examinedByDoctor || patient.doctorName || 'Dokter Klinik H.APUD';
  const examDate = patient.examinedAt
    ? patient.examinedAt.split('T')[0]
    : patient.visitDate;

  // Meta Box
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(48, 164, width - 96, 178, 16);
  ctx.fill();
  ctx.stroke();

  const metaPairs: [string, string, number, number][] = [
    ['NAMA PASIEN', patient.name, 68, 192],
    ['NO. ANTREAN / NO. RM', `${patient.code} • RM: ${patient.noRM || '-'}`, 396, 192],
    ['KELAMIN / USIA', `${patient.gender} • ${calculateAge(patient.dob)}`, 68, 248],
    ['TANGGAL PEMERIKSAAN', formatDateIndo(examDate), 396, 248],
    ['POLI / RUANGAN PERIKSA', poly.slice(0, 34), 68, 304],
    ['DOKTER PEMERIKSA', doctor.slice(0, 34), 396, 304],
  ];

  ctx.textAlign = 'left';
  for (const [lbl, val, mx, my] of metaPairs) {
    ctx.fillStyle = '#64748b';
    ctx.font = '800 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(lbl, mx, my);
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(val, mx, my + 20);
  }

  let cursorY = 362;

  // Vitals
  if (hasVitals) {
    const vitals: [string, string][] = [
      ['TEKANAN DARAH', patient.vitalSigns?.bp || '-'],
      ['SUHU TUBUH', patient.vitalSigns?.temp || '-'],
      ['DENYUT NADI', patient.vitalSigns?.pulse || '-'],
      ['BERAT BADAN', patient.vitalSigns?.weight || '-'],
    ];
    const cardW = (width - 96 - 30) / 4;
    vitals.forEach(([lbl, val], idx) => {
      const vx = 48 + idx * (cardW + 10);
      ctx.fillStyle = '#f0fdfa';
      ctx.strokeStyle = '#99f6e4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(vx, cursorY, cardW, 64, 12);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f766e';
      ctx.font = '800 10px system-ui, -apple-system, sans-serif';
      ctx.fillText(lbl, vx + cardW / 2, cursorY + 24);
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(val, vx + cardW / 2, cursorY + 48);
    });
    cursorY += 84;
  }

  // Diagnosis Box
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(48, cursorY, width - 96, diagBoxHeight, 14);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#047857';
  ctx.font = '800 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('DIAGNOSIS / TEMUAN MEDIS', 68, cursorY + 24);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 18px system-ui, -apple-system, sans-serif';
  diagWrapped.forEach((line, idx) => {
    ctx.fillText(line, 68, cursorY + 50 + idx * 26);
  });

  cursorY += diagBoxHeight + 18;

  // Rx Box
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(48, cursorY, width - 96, rxBoxHeight, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f766e';
  ctx.font = '900 34px Georgia, serif';
  ctx.fillText('℞', 68, cursorY + 42);

  ctx.fillStyle = '#0f172a';
  ctx.font = '600 16px system-ui, -apple-system, sans-serif';
  rxWrapped.forEach((line, idx) => {
    ctx.fillText(line, 74, cursorY + 76 + idx * 28);
  });

  cursorY += rxBoxHeight + 28;

  // Footer & Doctor Signature
  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = '500 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Dokumen resep & rekam medis ini bersifat rahasia khusus', 52, cursorY + 14);
  ctx.fillText('untuk pasien bersangkutan & dokter pemeriksa Klinik H.APUD.', 52, cursorY + 32);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Compreng, ${formatDateIndo(examDate)}`, width - 165, cursorY + 8);
  ctx.fillText('Dokter Pemeriksa,', width - 165, cursorY + 26);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 14px system-ui, -apple-system, sans-serif';
  ctx.fillText(doctor, width - 165, cursorY + 82);

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `Resep-Dokter-${patient.code}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
