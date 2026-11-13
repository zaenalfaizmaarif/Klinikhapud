import React, { useState, useEffect } from 'react';
import {
  Patient,
  PortalType,
  PatientTab,
  PatientStatus,
  VitalSigns,
  ClinicStatus,
  PatientUser,
  AdminCredentials,
  PatientAccount,
  ExaminationRoom,
  StaffRole,
  DoctorAccount,
} from './types';
import {
  INITIAL_PATIENTS,
  SERVICE_PREFIXES,
  MAX_PATIENTS_PER_SLOT,
  DEFAULT_ADMIN_CREDENTIALS,
  INITIAL_PATIENT_ACCOUNTS,
  DEFAULT_CLINIC_ROOMS,
  DEFAULT_DOCTOR_ACCOUNTS,
  getDefaultRoomForPatient,
} from './data/constants';
import { computeAutoClinicStatus } from './utils/schedule';
import { Header } from './components/Header';
import { PatientView } from './components/PatientView';
import { AdminView } from './components/AdminView';
import { AdminLoginView } from './components/auth/AdminLoginView';
import { PatientLoginView } from './components/auth/PatientLoginView';
import { Toast, ToastData } from './components/Toast';
import { AdminAuthModal } from './components/modals/AdminAuthModal';
import { TicketModal } from './components/modals/TicketModal';
import { MedicalNoteModal } from './components/modals/MedicalNoteModal';
import { WalkInModal } from './components/modals/WalkInModal';
import { CheckTicketModal } from './components/modals/CheckTicketModal';
import { ClinicStatusModal } from './components/modals/ClinicStatusModal';
import { ChangeAdminPasswordModal } from './components/modals/ChangeAdminPasswordModal';
import { ChangeDoctorPasswordModal } from './components/modals/ChangeDoctorPasswordModal';
import { AdminForgotPasswordModal } from './components/modals/AdminForgotPasswordModal';
import { ChangePatientPasswordModal } from './components/modals/ChangePatientPasswordModal';
import { PrintPreviewModal } from './components/modals/PrintPreviewModal';
import { PrintableReport } from './components/PrintableReport';
import { speakCallout } from './utils/audio';
import {
  registerPrintPreviewHandler,
  PrintPreviewPayload,
  TicketPrintFormat,
} from './utils/ticketPrinter';
import {
  testConnection,
  subscribePatients,
  syncPatientToFirestore,
  deletePatientFromFirestore,
  subscribeRooms,
  syncRoomsToFirestore,
  subscribeClinicStatus,
  syncClinicStatusToFirestore,
  subscribeAdminCredentials,
  syncAdminCredentialsToFirestore,
  subscribePatientAccounts,
  syncPatientAccountsToFirestore,
  subscribeDoctorAccounts,
  syncDoctorAccountsToFirestore,
} from './services/firebase';

const STORAGE_KEY = 'klinikX_patients_v4';
const CLINIC_STATUS_KEY = 'klinikX_status_v2';
const ADMIN_AUTH_KEY = 'klinikX_admin_auth_v2';
const STAFF_ROLE_KEY = 'klinikX_staff_role_v1';
const LOGGED_DOCTOR_KEY = 'klinikX_logged_doctor_v1';
const DOCTOR_ACCOUNTS_KEY = 'klinikX_doctor_accounts_v1';
const ADMIN_CREDS_KEY = 'klinikX_admin_creds_v2';
const PATIENT_USER_KEY = 'klinikX_patient_user_v2';
const PATIENT_ACCOUNTS_KEY = 'klinikX_patient_accounts_v2';
const CLINIC_ROOMS_KEY = 'klinikX_rooms_v2';

const getPortalFromLocation = (): PortalType => {
  if (typeof window === 'undefined') return 'patient';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const roleParam = (params.get('akses') || params.get('role') || params.get('portal') || '').toLowerCase();

  if (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#/admin' ||
    hash === '#admin' ||
    roleParam === 'admin'
  ) {
    return 'admin';
  }
  return 'patient';
};

export default function App() {
  const [activePortal, setActivePortal] = useState<PortalType>(getPortalFromLocation);
  const [activePatientTab, setActivePatientTab] = useState<PatientTab>(() => {
    try {
      return localStorage.getItem(PATIENT_USER_KEY) ? 'my-account' : 'register';
    } catch {
      return 'register';
    }
  });

  // Patients state
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return INITIAL_PATIENTS;
  });

  // Admin / Doctor login status & role
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  const [staffRole, setStaffRole] = useState<StaffRole>(() => {
    try {
      return localStorage.getItem(STAFF_ROLE_KEY) === 'dokter' ? 'dokter' : 'admin';
    } catch {
      return 'admin';
    }
  });

  const [loggedInDoctor, setLoggedInDoctor] = useState<DoctorAccount | null>(() => {
    try {
      const stored = localStorage.getItem(LOGGED_DOCTOR_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Synchronized Doctor Accounts
  const [doctorAccounts, setDoctorAccounts] = useState<DoctorAccount[]>(() => {
    try {
      const stored = localStorage.getItem(DOCTOR_ACCOUNTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_DOCTOR_ACCOUNTS;
  });

  // Synchronized Admin Credentials
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_CREDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.password === 'KlinikApud#2026') {
          return DEFAULT_ADMIN_CREDENTIALS;
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_ADMIN_CREDENTIALS;
  });

  // Synchronized Patient Accounts
  const [patientAccounts, setPatientAccounts] = useState<PatientAccount[]>(() => {
    try {
      const stored = localStorage.getItem(PATIENT_ACCOUNTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return INITIAL_PATIENT_ACCOUNTS;
  });

  // Synchronized Clinic Rooms
  const [clinicRooms, setClinicRooms] = useState<ExaminationRoom[]>(() => {
    try {
      const stored = localStorage.getItem(CLINIC_ROOMS_KEY);
      if (stored) {
        const parsed: ExaminationRoom[] = JSON.parse(stored);
        const hasKhitan = parsed.some((r) => r.name.toLowerCase().includes('khitan'));
        if (!hasKhitan) {
          const khitanRoom = DEFAULT_CLINIC_ROOMS.find((r) => r.id === 'room-khitan');
          if (khitanRoom) {
            const merged = [...parsed, khitanRoom];
            localStorage.setItem(CLINIC_ROOMS_KEY, JSON.stringify(merged));
            return merged;
          }
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_CLINIC_ROOMS;
  });

  // Currently logged in Patient User
  const [patientUser, setPatientUser] = useState<PatientUser | null>(() => {
    try {
      const stored = localStorage.getItem(PATIENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Clinic Operational Status with Auto Schedule (08:00 - 21:00 WIB)
  const [clinicStatus, setClinicStatus] = useState<ClinicStatus>(() => {
    try {
      const stored = localStorage.getItem(CLINIC_STATUS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.mode === 'auto') {
          const auto = computeAutoClinicStatus();
          return {
            ...parsed,
            isOpen: auto.isOpen,
            reason: auto.reason,
            reopenEstimate: auto.reopenEstimate,
          };
        }
        return parsed;
      }
    } catch {}

    const auto = computeAutoClinicStatus();
    return {
      isOpen: auto.isOpen,
      mode: 'auto',
      reason: auto.reason,
      reopenEstimate: auto.reopenEstimate,
      updatedAt: new Date().toISOString(),
    };
  });

  const [toast, setToast] = useState<ToastData | null>(null);

  // Modals state
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeTicketPatient, setActiveTicketPatient] = useState<Patient | null>(null);
  const [isMedicalNoteModalOpen, setIsMedicalNoteModalOpen] = useState(false);
  const [activeNotePatient, setActiveNotePatient] = useState<Patient | null>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isCheckTicketModalOpen, setIsCheckTicketModalOpen] = useState(false);
  const [checkTicketQuery, setCheckTicketQuery] = useState('');
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isClinicStatusModalOpen, setIsClinicStatusModalOpen] = useState(false);
  const [openStatusModalAfterAuth, setOpenStatusModalAfterAuth] = useState(false);
  const [isChangeAdminPasswordOpen, setIsChangeAdminPasswordOpen] = useState(false);
  const [isChangeDoctorPasswordOpen, setIsChangeDoctorPasswordOpen] = useState(false);
  const [isAdminForgotPasswordOpen, setIsAdminForgotPasswordOpen] = useState(false);
  const [isChangePatientPasswordOpen, setIsChangePatientPasswordOpen] = useState(false);
  const [printPreviewPayload, setPrintPreviewPayload] = useState<PrintPreviewPayload | null>(null);

  useEffect(() => {
    registerPrintPreviewHandler((payload) => {
      setPrintPreviewPayload(payload);
    });
    return () => {
      registerPrintPreviewHandler(null);
    };
  }, []);

  // Sync activePortal with browser URL navigation (/ vs /admin)
  useEffect(() => {
    const syncPortalFromUrl = () => {
      setActivePortal(getPortalFromLocation());
    };
    window.addEventListener('popstate', syncPortalFromUrl);
    window.addEventListener('hashchange', syncPortalFromUrl);
    return () => {
      window.removeEventListener('popstate', syncPortalFromUrl);
      window.removeEventListener('hashchange', syncPortalFromUrl);
    };
  }, []);

  // Update browser tab title for each dedicated view
  useEffect(() => {
    document.title =
      activePortal === 'admin'
        ? 'Akses Admin & Petugas — Klinik H.APUD'
        : 'Pendaftaran Pasien Online — Klinik H.APUD';
  }, [activePortal]);

  // Synchronize across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CLINIC_STATUS_KEY && e.newValue) {
        try {
          setClinicStatus(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setPatients(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === CLINIC_ROOMS_KEY && e.newValue) {
        try {
          setClinicRooms(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === ADMIN_CREDS_KEY && e.newValue) {
        try {
          setAdminCredentials(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === PATIENT_ACCOUNTS_KEY && e.newValue) {
        try {
          setPatientAccounts(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === PATIENT_USER_KEY) {
        try {
          setPatientUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === DOCTOR_ACCOUNTS_KEY && e.newValue) {
        try {
          setDoctorAccounts(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cloud Firestore Real-time Subscriptions (Sync Across Devices)
  useEffect(() => {
    testConnection().catch(() => {});

    // Listen to patients in real-time
    const unsubPatients = subscribePatients(
      (remotePatients) => {
        if (remotePatients && remotePatients.length > 0) {
          setPatients(remotePatients);
        } else {
          // If Firestore is empty on initial setup, seed with initial patients
          INITIAL_PATIENTS.forEach((p) => {
            syncPatientToFirestore(p).catch(() => {});
          });
        }
      },
      (err) => {
        console.warn('Real-time patients sync fallback to local cache:', err);
      }
    );

    // Listen to examination rooms in real-time
    const unsubRooms = subscribeRooms(
      (remoteRooms) => {
        if (remoteRooms && remoteRooms.length > 0) {
          const hasKhitan = remoteRooms.some((r) => r.name.toLowerCase().includes('khitan'));
          if (!hasKhitan) {
            const khitanRoom = DEFAULT_CLINIC_ROOMS.find((r) => r.id === 'room-khitan');
            if (khitanRoom) {
              const merged = [...remoteRooms, khitanRoom];
              setClinicRooms(merged);
              syncRoomsToFirestore(merged).catch(() => {});
              return;
            }
          }
          setClinicRooms(remoteRooms);
        } else {
          syncRoomsToFirestore(DEFAULT_CLINIC_ROOMS).catch(() => {});
        }
      },
      (err) => {
        console.warn('Real-time rooms sync fallback:', err);
      }
    );

    // Listen to clinic operational status
    const unsubStatus = subscribeClinicStatus(
      (remoteStatus) => {
        if (remoteStatus) {
          setClinicStatus(remoteStatus);
        }
      },
      (err) => {
        console.warn('Real-time clinic status fallback:', err);
      }
    );

    // Listen to admin credentials
    const unsubCreds = subscribeAdminCredentials(
      (remoteCreds) => {
        if (remoteCreds && remoteCreds.password) {
          if (remoteCreds.password === 'KlinikApud#2026') {
            const updated = { ...remoteCreds, password: 'admin123' };
            setAdminCredentials(updated);
            syncAdminCredentialsToFirestore(updated).catch(() => {});
          } else {
            setAdminCredentials(remoteCreds);
          }
        } else {
          syncAdminCredentialsToFirestore(DEFAULT_ADMIN_CREDENTIALS).catch(() => {});
        }
      },
      (err) => {
        console.warn('Real-time admin credentials fallback:', err);
      }
    );

    // Listen to patient accounts
    const unsubAccounts = subscribePatientAccounts(
      (remoteAccounts: PatientAccount[]) => {
        if (remoteAccounts && remoteAccounts.length > 0) {
          setPatientAccounts(remoteAccounts);
        } else {
          syncPatientAccountsToFirestore(INITIAL_PATIENT_ACCOUNTS).catch(() => {});
        }
      },
      (err: unknown) => {
        console.warn('Real-time patient accounts fallback:', err);
      }
    );

    // Listen to doctor accounts
    const unsubDoctors = subscribeDoctorAccounts(
      (remoteDoctors: DoctorAccount[]) => {
        if (remoteDoctors && remoteDoctors.length > 0) {
          setDoctorAccounts(remoteDoctors);
        } else {
          syncDoctorAccountsToFirestore(DEFAULT_DOCTOR_ACCOUNTS).catch(() => {});
        }
      },
      (err: unknown) => {
        console.warn('Real-time doctor accounts fallback:', err);
      }
    );

    return () => {
      unsubPatients();
      unsubRooms();
      unsubStatus();
      unsubCreds();
      unsubAccounts();
      unsubDoctors();
    };
  }, []);

  // Automated Schedule (08:00 - 21:00 WIB) polling check
  useEffect(() => {
    const checkAutoSchedule = () => {
      if (clinicStatus.mode === 'auto') {
        const auto = computeAutoClinicStatus();
        if (auto.isOpen !== clinicStatus.isOpen) {
          const updated: ClinicStatus = {
            isOpen: auto.isOpen,
            mode: 'auto',
            reason: auto.reason,
            reopenEstimate: auto.reopenEstimate,
            updatedAt: new Date().toISOString(),
          };
          setClinicStatus(updated);
          try {
            localStorage.setItem(CLINIC_STATUS_KEY, JSON.stringify(updated));
          } catch {}
          syncClinicStatusToFirestore(updated).catch(() => {});
        }
      }
    };

    checkAutoSchedule();
    const interval = setInterval(checkAutoSchedule, 5000);
    return () => clearInterval(interval);
  }, [clinicStatus.mode, clinicStatus.isOpen]);

  // Save patients to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [patients]);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    setToast({
      id: Date.now().toString(),
      title,
      message,
      type,
    });
  };

  // Update Clinic Status
  const handleUpdateClinicStatus = (newStatus: ClinicStatus) => {
    setClinicStatus(newStatus);
    try {
      localStorage.setItem(CLINIC_STATUS_KEY, JSON.stringify(newStatus));
    } catch (e) {
      console.error(e);
    }
    syncClinicStatusToFirestore(newStatus).catch((err) => {
      console.error('Failed to sync clinic status to Cloud Firestore:', err);
    });
    showToast(
      newStatus.isOpen ? 'Klinik Dibuka' : 'Klinik Ditutup',
      newStatus.isOpen
        ? 'Status klinik kini BUKA. Pendaftaran online pasien telah aktif kembali.'
        : `Status klinik kini TUTUP: ${newStatus.reason || 'Pendaftaran online ditutup sementara.'}`,
      newStatus.isOpen ? 'success' : 'warning'
    );
  };

  // Update Admin Credentials (Sandi Baru Admin)
  const handleUpdateAdminCredentials = (newCreds: AdminCredentials) => {
    setAdminCredentials(newCreds);
    try {
      localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(newCreds));
    } catch (e) {
      console.error(e);
    }
    syncAdminCredentialsToFirestore(newCreds).catch((err) => {
      console.error('Failed to sync admin credentials to Cloud Firestore:', err);
    });
    showToast('Sandi Admin Diperbarui', 'Kata sandi admin baru berhasil disimpan dan tersinkron ke Cloud.', 'success');
  };

  // Update Doctor Password (Sandi Baru Dokter)
  const handleUpdateDoctorPassword = (doctorId: string, newPassword: string) => {
    setDoctorAccounts((prev) => {
      const updated = prev.map((doc) => {
        if (doc.id === doctorId) {
          return { ...doc, password: newPassword, updatedAt: new Date().toISOString() };
        }
        return doc;
      });
      try {
        localStorage.setItem(DOCTOR_ACCOUNTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      syncDoctorAccountsToFirestore(updated).catch((err) => {
        console.error('Failed to sync doctor accounts to Cloud Firestore:', err);
      });
      return updated;
    });
    setLoggedInDoctor((prev) => {
      if (prev && prev.id === doctorId) {
        const nextDoc = { ...prev, password: newPassword, updatedAt: new Date().toISOString() };
        try {
          localStorage.setItem(LOGGED_DOCTOR_KEY, JSON.stringify(nextDoc));
        } catch {}
        return nextDoc;
      }
      return prev;
    });
    showToast('Sandi Dokter Diperbarui', 'Kata sandi dokter baru berhasil disimpan dan tersinkron ke Cloud.', 'success');
  };

  // Register New Patient Account
  const handleRegisterNewAccount = (account: PatientAccount) => {
    setPatientAccounts((prev) => {
      const next = [account, ...prev];
      try {
        localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      syncPatientAccountsToFirestore(next).catch(() => {});
      return next;
    });
    showToast('Akun Pasien Dibuat', `Akun atas nama ${account.name} berhasil terdaftar.`, 'success');
  };

  // Update Patient Password by ID (Lupa Sandi)
  const handleUpdatePatientAccountPassword = (accountId: string, newPass: string) => {
    setPatientAccounts((prev) => {
      const updated = prev.map((acc) => {
        if (acc.id === accountId) {
          return { ...acc, password: newPass };
        }
        return acc;
      });
      try {
        localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      syncPatientAccountsToFirestore(updated).catch((err: unknown) => {
        console.error('Failed to sync patient accounts to Firestore:', err);
      });
      return updated;
    });
    showToast('Sandi Pasien Diperbarui', 'Kata sandi akun pasien Anda berhasil disimpan dan tersinkron.', 'success');
  };

  // Update Patient Password
  const handleUpdatePatientPassword = (name: string, newPass: string): boolean => {
    let success = false;
    setPatientAccounts((prev) => {
      const updated = prev.map((acc) => {
        if (acc.name.trim().toLowerCase() === name.trim().toLowerCase()) {
          success = true;
          return { ...acc, password: newPass };
        }
        return acc;
      });
      if (success) {
        try {
          localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        syncPatientAccountsToFirestore(updated).catch(() => {});
      }
      return updated;
    });
    if (success) {
      showToast('Sandi Pasien Diperbarui', 'Kata sandi akun pasien Anda berhasil disimpan dan tersinkron.', 'success');
    }
    return success;
  };

  // Register New Patient Booking
  const handleRegisterPatient = (
    patientData: Omit<Patient, 'id' | 'code' | 'status' | 'createdAt'>
  ) => {
    if (!clinicStatus.isOpen) {
      showToast(
        'Pendaftaran Ditutup',
        `Saat ini Klinik H.APUD sedang tutup (${clinicStatus.reason || 'diistirahatkan'}).`,
        'error'
      );
      return;
    }

    const slotCount = patients.filter(
      (p) =>
        p.visitDate === patientData.visitDate &&
        p.sessionName === patientData.sessionName &&
        p.timeSlot === patientData.timeSlot &&
        p.status !== 'Batal'
    ).length;

    if (slotCount >= MAX_PATIENTS_PER_SLOT) {
      showToast(
        'Slot Jam Penuh',
        'Slot jam ini baru saja penuh! Silakan pilih jam lain yang masih tersedia.',
        'error'
      );
      return;
    }

    const prefix = SERVICE_PREFIXES[patientData.service] || 'A';
    const sameServiceCount = patients.filter((p) => p.service === patientData.service).length + 1;
    const codeNumber =
      sameServiceCount < 100 ? ('00' + sameServiceCount).slice(-3) : `${sameServiceCount}`;
    const code = `${prefix}-${codeNumber}`;

    const assignedRoom =
      patientData.assignedRoom ||
      getDefaultRoomForPatient(patientData.service, patientData.complaint);
    const matchingRoom = clinicRooms.find(
      (r) => r.name.toLowerCase() === assignedRoom.toLowerCase()
    );

    const newPatient: Patient = {
      ...patientData,
      id: `pt-${Date.now()}`,
      code,
      status: 'Menunggu',
      assignedRoom,
      doctorName: patientData.doctorName || matchingRoom?.doctorName,
      createdAt: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev]);
    // Sync new registered patient to Cloud Firestore
    syncPatientToFirestore(newPatient).catch((err) => {
      console.error('Failed to sync new patient to Cloud Firestore:', err);
    });

    setActiveTicketPatient(newPatient);
    setIsTicketModalOpen(true);
    setActivePatientTab('my-account');

    // Auto-create & activate patientUser so the mobile view immediately has their account & ticket
    if (!patientUser) {
      const autoUser: PatientUser = {
        id: `acc-${Date.now()}`,
        name: newPatient.name,
        phone: newPatient.phone,
        patientType: newPatient.patientType,
        noRM: newPatient.noRM,
        dob: newPatient.dob,
        gender: newPatient.gender,
        address: newPatient.address,
      };
      setPatientUser(autoUser);
      try {
        localStorage.setItem(PATIENT_USER_KEY, JSON.stringify(autoUser));
      } catch {}
    }

    // Ensure account is registered in patientAccounts as well
    setPatientAccounts((prev) => {
      const exists = prev.some(
        (a) => a.name.trim().toLowerCase() === newPatient.name.trim().toLowerCase()
      );
      if (exists) return prev;
      const newAcc: PatientAccount = {
        id: `acc-${Date.now()}`,
        name: newPatient.name,
        password: '123',
        phone: newPatient.phone,
        patientType: newPatient.patientType,
        noRM: newPatient.noRM,
        dob: newPatient.dob,
        gender: newPatient.gender,
        address: newPatient.address,
        createdAt: new Date().toISOString(),
      };
      const updated = [...prev, newAcc];
      try {
        localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(
      'Pendaftaran Berhasil!',
      `Nomor Antrean Anda: ${code} (${newPatient.sessionName} - ${newPatient.timeSlot} WIB)`,
      'success'
    );
  };

  // Manage Clinic Rooms
  const handleSaveRooms = (updatedRooms: ExaminationRoom[]) => {
    setClinicRooms(updatedRooms);
    try {
      localStorage.setItem(CLINIC_ROOMS_KEY, JSON.stringify(updatedRooms));
    } catch {}
    syncRoomsToFirestore(updatedRooms).catch((err) => {
      console.error('Failed to sync rooms to Cloud Firestore:', err);
    });
    showToast('Ruangan Disimpan', 'Daftar ruangan & poli pemeriksaan berhasil diperbarui.', 'success');
  };

  const handleAssignRoom = (patientId: string, roomName: string) => {
    const matchingRoom = clinicRooms.find((r) => r.name.toLowerCase() === roomName.toLowerCase());
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updated = {
            ...p,
            assignedRoom: roomName,
            doctorName: matchingRoom?.doctorName || p.doctorName,
          };
          syncPatientToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );
    showToast('Ruangan Ditetapkan', `Pasien diarahkan menuju ${roomName}.`, 'success');
  };

  // Call Specific Patient
  const handleCallPatient = (patient: Patient) => {
    // Layanan Home Care tidak menggunakan panggilan pengeras suara klinik
    if (patient.service.toLowerCase().includes('home care')) {
      showToast(
        'Layanan Home Care',
        `Pasien ${patient.code} - ${patient.name} adalah layanan Home Care (Kunjungan Rumah). Tidak menggunakan panggilan pengeras suara klinik.`,
        'info'
      );
      return;
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patient.id) {
          const updated = { ...p, status: 'Dipanggil' as PatientStatus };
          syncPatientToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );

    speakCallout(patient.code, patient.name, patient.timeSlot, patient.assignedRoom);
    showToast(
      'Memanggil Pasien',
      `Nomor ${patient.code} - ${patient.name} dipanggil menuju ${patient.assignedRoom || 'ruang periksa'}.`,
      'info'
    );
  };

  // Call Next Patient in Line
  const handleCallNextPatient = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    // Abaikan layanan Home Care dari antrean panggilan pengeras suara klinik
    const nextWaiting = patients.find(
      (p) =>
        p.visitDate === todayStr &&
        p.status === 'Menunggu' &&
        !p.service.toLowerCase().includes('home care')
    );

    if (!nextWaiting) {
      showToast('Antrean Kosong', 'Tidak ada pasien klinik dengan status Menunggu saat ini.', 'warning');
      return;
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.status === 'Dipanggil') {
          const finished = { ...p, status: 'Selesai' as PatientStatus };
          syncPatientToFirestore(finished).catch(() => {});
          return finished;
        }
        if (p.id === nextWaiting.id) {
          const calling = { ...p, status: 'Dipanggil' as PatientStatus };
          syncPatientToFirestore(calling).catch(() => {});
          return calling;
        }
        return p;
      })
    );

    speakCallout(nextWaiting.code, nextWaiting.name, nextWaiting.timeSlot, nextWaiting.assignedRoom);
    showToast(
      'Panggilan Berikutnya',
      `Memanggil ${nextWaiting.code} - ${nextWaiting.name} menuju ${nextWaiting.assignedRoom || 'ruang periksa'}`,
      'success'
    );
  };

  // Change Patient Status
  const handleChangePatientStatus = (patientId: string, status: PatientStatus) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updated = { ...p, status };
          syncPatientToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );

    const target = patients.find((p) => p.id === patientId);
    showToast(
      'Status Diperbarui',
      `Pasien ${target ? target.code : ''} kini berstatus "${status}".`,
      'info'
    );
  };

  // Save Medical Notes (Strictly Doctor Only)
  const handleSaveMedicalNotes = (
    patientId: string,
    diagnosis: string,
    prescription: string,
    vitalSigns?: VitalSigns,
    meta?: {
      examinedPoly: string;
      examinedByDoctor: string;
      markCompleted: boolean;
    }
  ) => {
    const doctorNameRecorded =
      meta?.examinedByDoctor || loggedInDoctor?.name || 'Dokter Klinik H.APUD';
    const examinedAt = new Date().toISOString();

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const polyRecorded =
            meta?.examinedPoly ||
            p.examinedPoly ||
            p.assignedRoom ||
            getDefaultRoomForPatient(p.service, p.complaint);
          const nextStatus: PatientStatus = meta?.markCompleted ? 'Selesai' : p.status;
          const updated: Patient = {
            ...p,
            status: nextStatus,
            assignedRoom: polyRecorded,
            examinedPoly: polyRecorded,
            doctorName: doctorNameRecorded,
            examinedByDoctor: doctorNameRecorded,
            examinedAt,
            diagnosis,
            prescription,
            vitalSigns,
          };
          syncPatientToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );

    showToast(
      'Rekam Medis Tersimpan',
      `Catatan medis oleh ${doctorNameRecorded} berhasil disimpan secara rahasia (hanya Dokter & Pasien).`,
      'success'
    );
  };

  // Delete Patient
  const handleDeletePatient = (patientId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data antrean pasien ini?')) {
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
      deletePatientFromFirestore(patientId).catch(() => {});
      showToast('Data Dihapus', 'Data pasien telah dihapus dari sistem.', 'info');
    }
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (confirm('Kembalikan contoh data pasien awal ke sistem?')) {
      setPatients(INITIAL_PATIENTS);
      INITIAL_PATIENTS.forEach((p) => {
        syncPatientToFirestore(p).catch(() => {});
      });
      showToast('Data Direset', 'Data pasien demo berhasil dimuat ulang.', 'info');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setStaffRole('admin');
    setLoggedInDoctor(null);
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    localStorage.setItem(STAFF_ROLE_KEY, 'admin');
    localStorage.removeItem(LOGGED_DOCTOR_KEY);
    showToast('Login Petugas Berhasil', 'Selamat datang di Panel Petugas Admin Klinik H.APUD!', 'success');
  };

  const handleDoctorLoginSuccess = (doctor: DoctorAccount) => {
    setIsAdminLoggedIn(true);
    setStaffRole('dokter');
    setLoggedInDoctor(doctor);
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    localStorage.setItem(STAFF_ROLE_KEY, 'dokter');
    localStorage.setItem(LOGGED_DOCTOR_KEY, JSON.stringify(doctor));
    showToast(
      'Login Dokter Berhasil',
      `Selamat bertugas, ${doctor.name}! Rekam medis disesuaikan dengan poli pemeriksaan Anda.`,
      'success'
    );
  };

  const handleAdminLogout = () => {
    const prevRole = staffRole;
    setIsAdminLoggedIn(false);
    setStaffRole('admin');
    setLoggedInDoctor(null);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(STAFF_ROLE_KEY);
    localStorage.removeItem(LOGGED_DOCTOR_KEY);
    setActivePortal('admin');
    showToast(
      'Keluar',
      prevRole === 'dokter' ? 'Anda telah keluar dari sesi Dokter.' : 'Anda telah keluar dari sesi Admin.',
      'info'
    );
  };

  const handlePatientLoginSuccess = (user: PatientUser) => {
    setPatientUser(user);
    setActivePatientTab('my-account');
    try {
      localStorage.setItem(PATIENT_USER_KEY, JSON.stringify(user));
    } catch {}
    showToast(
      'Masuk Berhasil',
      `Selamat datang, ${user.name}! Anda masuk ke akun pendaftaran Anda.`,
      'success'
    );
  };

  const handlePatientLogout = () => {
    setPatientUser(null);
    localStorage.removeItem(PATIENT_USER_KEY);
    showToast('Keluar Akun Pasien', 'Anda telah keluar dari akun pasien.', 'info');
  };

  const handleHeaderStatusClick = () => {
    if (activePortal !== 'admin' || staffRole === 'dokter') return;
    if (isAdminLoggedIn) {
      setIsClinicStatusModalOpen(true);
    } else {
      setOpenStatusModalAfterAuth(true);
      setIsAdminAuthOpen(true);
      showToast(
        'Akses Admin Diperlukan',
        'Masukkan Sandi Admin untuk mengubah status Buka / Tutup klinik.',
        'info'
      );
    }
  };

  const handleOpenTicket = (patient: Patient) => {
    setActiveTicketPatient(patient);
    setIsTicketModalOpen(true);
  };

  const handleOpenMedicalNotes = (patient: Patient) => {
    if (!(activePortal === 'admin' && isAdminLoggedIn && staffRole === 'dokter')) {
      showToast(
        'Akses Ditolak (Rahasia Medis)',
        'Hasil rekam medis & resep bersifat rahasia dan hanya dapat dibuka melalui Login Khusus Dokter.',
        'warning'
      );
      return;
    }
    setActiveNotePatient(patient);
    setIsMedicalNoteModalOpen(true);
  };

  const waitingCount = patients.filter((p) => p.status === 'Menunggu').length;
  const isStrictAdminSession = activePortal === 'admin' && isAdminLoggedIn;
  const isStrictDoctorSession = isStrictAdminSession && staffRole === 'dokter' && Boolean(loggedInDoctor);
  const canViewMedicalRecordOnTicket = activePortal === 'patient' || isStrictDoctorSession;

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-800">
      {/* Global Header */}
      <Header
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        activePatientTab={activePatientTab}
        setActivePatientTab={setActivePatientTab}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        onOpenCheckTicket={() => {
          setCheckTicketQuery('');
          setIsCheckTicketModalOpen(true);
        }}
        waitingCount={waitingCount}
        clinicStatus={clinicStatus}
        onStatusBadgeClick={handleHeaderStatusClick}
        patientUser={patientUser}
        isAdminLoggedIn={isStrictAdminSession}
        staffRole={isStrictAdminSession ? staffRole : null}
        loggedInDoctor={isStrictDoctorSession ? loggedInDoctor : null}
        onLogoutAdmin={handleAdminLogout}
        onLogoutPatient={handlePatientLogout}
      />

      {/* Main View Area (Strictly 2 Views: Patient Link vs Admin Link) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {activePortal === 'patient' && (
          !patientUser && activePatientTab === 'my-account' ? (
            <PatientLoginView
              onLoginSuccess={handlePatientLoginSuccess}
              onGoToRegister={() => setActivePatientTab('register')}
              patientAccounts={patientAccounts}
              onRegisterNewAccount={handleRegisterNewAccount}
              onUpdatePatientAccountPassword={handleUpdatePatientAccountPassword}
            />
          ) : (
            <PatientView
              activeTab={activePatientTab}
              patients={patients}
              clinicRooms={clinicRooms}
              onRegisterPatient={handleRegisterPatient}
              onOpenCheckTicket={() => {
                setCheckTicketQuery('');
                setIsCheckTicketModalOpen(true);
              }}
              clinicStatus={clinicStatus}
              patientUser={patientUser}
              onLogoutPatient={handlePatientLogout}
              onOpenChangePassword={() => setIsChangePatientPasswordOpen(true)}
              onOpenTicket={handleOpenTicket}
              onNavigateTab={setActivePatientTab}
            />
          )
        )}

        {activePortal === 'admin' && (
          !isAdminLoggedIn ? (
            <AdminLoginView
              onLoginSuccess={handleAdminLoginSuccess}
              onDoctorLoginSuccess={handleDoctorLoginSuccess}
              adminCredentials={adminCredentials}
              onUpdateAdminCredentials={handleUpdateAdminCredentials}
              doctorAccounts={doctorAccounts}
              onUpdateDoctorPassword={handleUpdateDoctorPassword}
            />
          ) : (
            <AdminView
              patients={patients}
              clinicStatus={clinicStatus}
              clinicRooms={clinicRooms}
              staffRole={staffRole}
              loggedInDoctor={loggedInDoctor}
              onSaveRooms={handleSaveRooms}
              onAssignRoom={handleAssignRoom}
              onOpenClinicStatusModal={() => setIsClinicStatusModalOpen(true)}
              onCallPatient={handleCallPatient}
              onCallNextPatient={handleCallNextPatient}
              onChangePatientStatus={handleChangePatientStatus}
              onOpenMedicalNotes={handleOpenMedicalNotes}
              onOpenTicket={handleOpenTicket}
              onDeletePatient={handleDeletePatient}
              onOpenWalkInModal={() => setIsWalkInModalOpen(true)}
              onOpenCheckTicket={() => {
                setCheckTicketQuery('');
                setIsCheckTicketModalOpen(true);
              }}
              onOpenPrintReport={() => setIsPrintReportOpen(true)}
              onResetDemoData={handleResetDemoData}
              onLogout={handleAdminLogout}
              onOpenChangeAdminPassword={() => setIsChangeAdminPasswordOpen(true)}
              onOpenChangeDoctorPassword={() => setIsChangeDoctorPasswordOpen(true)}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-bold text-slate-700">
            KLINIK H.APUD — Sistem Pendaftaran Online & Manajemen Antrean Pasien
          </p>
          <p className="text-slate-400">
            Terintegrasi 3 Sesi Praktik Bebas Bentrok • Jl.Sukaresmi Desa Mekarjaya Kecamatan Compreng Kabupaten Subang, Jawa Barat 41258 • Jam Praktik: 08:00 - 21:00 WIB
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => {
          setIsAdminAuthOpen(false);
          setOpenStatusModalAfterAuth(false);
        }}
        adminCredentials={adminCredentials}
        onForgotPassword={() => {
          setIsAdminAuthOpen(false);
          setIsAdminForgotPasswordOpen(true);
        }}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsAdminLoggedIn(true);
          setStaffRole('admin');
          setLoggedInDoctor(null);
          localStorage.setItem(ADMIN_AUTH_KEY, 'true');
          localStorage.setItem(STAFF_ROLE_KEY, 'admin');
          localStorage.removeItem(LOGGED_DOCTOR_KEY);
          setActivePortal('admin');
          if (openStatusModalAfterAuth) {
            setIsClinicStatusModalOpen(true);
            setOpenStatusModalAfterAuth(false);
          } else {
            showToast('Akses Diterima', 'Selamat datang di Panel Admin Klinik!', 'success');
          }
        }}
      />

      <TicketModal
        patient={activeTicketPatient}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        canViewMedicalRecord={canViewMedicalRecordOnTicket}
      />

      <MedicalNoteModal
        patient={activeNotePatient}
        isOpen={isMedicalNoteModalOpen}
        onClose={() => setIsMedicalNoteModalOpen(false)}
        loggedInDoctor={loggedInDoctor}
        clinicRooms={clinicRooms}
        onSave={handleSaveMedicalNotes}
      />

      <WalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onRegister={handleRegisterPatient}
        existingPatients={patients}
        rooms={clinicRooms}
      />

      <CheckTicketModal
        isOpen={isCheckTicketModalOpen}
        onClose={() => setIsCheckTicketModalOpen(false)}
        patients={patients}
        onSelectTicket={handleOpenTicket}
        initialQuery={checkTicketQuery}
        isAdminLoggedIn={isStrictAdminSession}
        staffRole={isStrictAdminSession ? staffRole : null}
        loggedInDoctor={isStrictDoctorSession ? loggedInDoctor : null}
        patientUser={activePortal === 'patient' ? patientUser : null}
      />

      <PrintableReport
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        patients={patients}
        hideMedicalRecords={!isStrictDoctorSession}
      />

      <ClinicStatusModal
        isOpen={isClinicStatusModalOpen}
        onClose={() => setIsClinicStatusModalOpen(false)}
        clinicStatus={clinicStatus}
        onUpdateStatus={handleUpdateClinicStatus}
      />

      <ChangeAdminPasswordModal
        isOpen={isChangeAdminPasswordOpen}
        onClose={() => setIsChangeAdminPasswordOpen(false)}
        adminCredentials={adminCredentials}
        onUpdateCredentials={handleUpdateAdminCredentials}
      />

      {loggedInDoctor && (
        <ChangeDoctorPasswordModal
          isOpen={isChangeDoctorPasswordOpen}
          onClose={() => setIsChangeDoctorPasswordOpen(false)}
          doctor={loggedInDoctor}
          onUpdateDoctorPassword={handleUpdateDoctorPassword}
        />
      )}

      <AdminForgotPasswordModal
        isOpen={isAdminForgotPasswordOpen}
        onClose={() => setIsAdminForgotPasswordOpen(false)}
        adminCredentials={adminCredentials}
        onUpdateAdminCredentials={handleUpdateAdminCredentials}
        onSuccessReset={(newPass) => {
          showToast('Sandi Admin Diperbarui', 'Kata sandi admin berhasil diperbarui dan tersinkron ke Cloud!', 'success');
        }}
      />

      {patientUser && (
        <ChangePatientPasswordModal
          isOpen={isChangePatientPasswordOpen}
          onClose={() => setIsChangePatientPasswordOpen(false)}
          patientUser={patientUser}
          onUpdatePatientPassword={handleUpdatePatientPassword}
        />
      )}

      <PrintPreviewModal
        isOpen={Boolean(printPreviewPayload)}
        onClose={() => setPrintPreviewPayload(null)}
        mode={printPreviewPayload?.mode || 'ticket'}
        patient={printPreviewPayload?.patient || null}
        format={printPreviewPayload?.format || 'standard'}
        includeMedicalRecord={Boolean(printPreviewPayload?.includeMedicalRecord)}
        onChangeFormat={(newFormat: TicketPrintFormat) =>
          setPrintPreviewPayload((prev) =>
            prev ? { ...prev, format: newFormat } : prev
          )
        }
      />

      {/* Global Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
