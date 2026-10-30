import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Patient, ExaminationRoom, ClinicStatus, AdminCredentials } from '../types';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test helper
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is unreachable.');
    } else {
      console.log('Firebase connection test status:', error);
    }
    return false;
  }
}

// Collections references
const PATIENTS_COL = 'patients';
const ROOMS_COL = 'rooms';
const SETTINGS_COL = 'settings';

/**
 * Real-time listener for Patients collection
 */
export function subscribePatients(
  onData: (patients: Patient[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = collection(db, PATIENTS_COL);
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Patient[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Patient;
        list.push({ ...data, id: d.id });
      });
      // Sort: by createdAt descending or ascending
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, PATIENTS_COL);
      if (onError) onError(error);
    }
  );
}

/**
 * Save / Create / Update a patient in Firestore
 */
export async function syncPatientToFirestore(patient: Patient): Promise<void> {
  try {
    const cleanPatient: Record<string, any> = {
      id: patient.id,
      code: patient.code,
      name: patient.name,
      patientType: patient.patientType,
      phone: patient.phone || '',
      gender: patient.gender,
      dob: patient.dob,
      address: patient.address || '',
      service: patient.service,
      complaint: patient.complaint || '',
      visitDate: patient.visitDate,
      sessionName: patient.sessionName,
      timeSlot: patient.timeSlot,
      status: patient.status,
      assignedRoom: patient.assignedRoom || '',
      doctorName: patient.doctorName || '',
      createdAt: patient.createdAt,
      updatedAt: new Date().toISOString(),
    };
    if (patient.noRM) cleanPatient.noRM = patient.noRM;
    if (patient.diagnosis) cleanPatient.diagnosis = patient.diagnosis;
    if (patient.prescription) cleanPatient.prescription = patient.prescription;
    if (patient.vitalSigns) cleanPatient.vitalSigns = patient.vitalSigns;

    await setDoc(doc(db, PATIENTS_COL, patient.id), cleanPatient, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PATIENTS_COL}/${patient.id}`);
    throw error;
  }
}

/**
 * Delete a patient from Firestore
 */
export async function deletePatientFromFirestore(patientId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PATIENTS_COL, patientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PATIENTS_COL}/${patientId}`);
    throw error;
  }
}

/**
 * Real-time listener for Rooms collection
 */
export function subscribeRooms(
  onData: (rooms: ExaminationRoom[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, ROOMS_COL),
    (snapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const list: ExaminationRoom[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as ExaminationRoom), id: d.id });
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ROOMS_COL);
      if (onError) onError(error);
    }
  );
}

/**
 * Save all rooms to Firestore
 */
export async function syncRoomsToFirestore(rooms: ExaminationRoom[]): Promise<void> {
  try {
    for (const r of rooms) {
      await setDoc(doc(db, ROOMS_COL, r.id), r, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ROOMS_COL);
    throw error;
  }
}

/**
 * Real-time listener for Clinic Status
 */
export function subscribeClinicStatus(
  onData: (status: ClinicStatus) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, SETTINGS_COL, 'clinicStatus'),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as ClinicStatus);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COL}/clinicStatus`);
      if (onError) onError(error);
    }
  );
}

/**
 * Save clinic status to Firestore
 */
export async function syncClinicStatusToFirestore(status: ClinicStatus): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'clinicStatus'), status, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/clinicStatus`);
    throw error;
  }
}

/**
 * Real-time listener for Admin Credentials
 */
export function subscribeAdminCredentials(
  onData: (creds: AdminCredentials) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, SETTINGS_COL, 'adminCredentials'),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as AdminCredentials);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COL}/adminCredentials`);
      if (onError) onError(error);
    }
  );
}

/**
 * Save admin credentials to Firestore
 */
export async function syncAdminCredentialsToFirestore(creds: AdminCredentials): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'adminCredentials'), creds, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/adminCredentials`);
    throw error;
  }
}

