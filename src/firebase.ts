import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { StudentProfile, TrainingProgram, VikingPlan, DbExercise } from './types';
import { DEFAULT_STUDENTS, DEFAULT_PROGRAM } from './data';

const firebaseConfig = {
  apiKey: "AIzaSyCHJlWTIKIpKc3duV_9PFe0QO9A9eKnGHI",
  authDomain: "flutter-ai-playground-dc7ae.firebaseapp.com",
  projectId: "flutter-ai-playground-dc7ae",
  storageBucket: "flutter-ai-playground-dc7ae.firebasestorage.app",
  messagingSenderId: "1047815781145",
  appId: "1:1047815781145:web:b80a49fa1d465fd77c2388"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-remixvikingforce-975519ec-fc30-48ed-bba6-b972bb76ae87");
export const auth = getAuth(app);

// --- ERROR HANDLING FOR FIRESTORE (As required by Firebase Integration Skill) ---
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- FIREBASE SYNC METHODS ---

/**
 * Fetch all students from Firestore.
 * If collection is empty, initializes it with DEFAULT_STUDENTS.
 */
export async function fetchStudentsFromFirebase(): Promise<Record<string, StudentProfile>> {
  try {
    const studentsCol = collection(db, 'students');
    const snapshot = await getDocs(studentsCol);
    
    if (snapshot.empty) {
      // First-time setup: write DEFAULT_STUDENTS to Firestore
      const initial: Record<string, StudentProfile> = DEFAULT_STUDENTS;
      for (const email of Object.keys(initial)) {
        await setDoc(doc(db, 'students', email), initial[email]);
      }
      return initial;
    }
    
    const students: Record<string, StudentProfile> = {};
    snapshot.forEach((d) => {
      students[d.id] = d.data() as StudentProfile;
    });
    return students;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'students');
  }
}

/**
 * Subscribe to the 'students' collection in real-time.
 */
export function subscribeStudents(
  onUpdate: (students: Record<string, StudentProfile>) => void
): () => void {
  const colRef = collection(db, 'students');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const students: Record<string, StudentProfile> = {};
      snapshot.forEach((d) => {
        students[d.id] = d.data() as StudentProfile;
      });
      onUpdate(students);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    }
  );
}

/**
 * Save/update a single student document in Firestore.
 */
export async function saveStudentToFirebase(email: string, student: StudentProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'students', email), student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${email}`);
  }
}

/**
 * Delete a student document from Firestore.
 */
export async function deleteStudentFromFirebase(email: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', email));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${email}`);
  }
}

/**
 * Fetch training program from Firestore.
 * If not found, initializes with DEFAULT_PROGRAM.
 */
export async function fetchProgramFromFirebase(): Promise<TrainingProgram> {
  try {
    const programDocRef = doc(db, 'config', 'program');
    const programSnap = await getDoc(programDocRef);
    
    if (programSnap.exists()) {
      return programSnap.data() as TrainingProgram;
    } else {
      // Initialize with DEFAULT_PROGRAM
      await setDoc(programDocRef, DEFAULT_PROGRAM);
      return DEFAULT_PROGRAM;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'config/program');
  }
}

/**
 * Save training program to Firestore.
 */
export async function saveProgramToFirebase(program: TrainingProgram): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'program'), program);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/program');
  }
}

/**
 * Fetch custom viking plans from Firestore.
 */
export async function fetchPlansFromFirebase(): Promise<VikingPlan[] | null> {
  try {
    const plansDocRef = doc(db, 'config', 'plans');
    const plansSnap = await getDoc(plansDocRef);
    
    if (plansSnap.exists()) {
      return (plansSnap.data() as { plans: VikingPlan[] }).plans;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'config/plans');
  }
}

/**
 * Save custom plans to Firestore.
 */
export async function savePlansToFirebase(plans: VikingPlan[]): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'plans'), { plans });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/plans');
  }
}

const SEED_EXERCISES: DbExercise[] = [
  {
    id: 'agachamento_livre',
    name: 'Agachamento Livre',
    techniqueTips: 'Mantenha o peito elevado, force os joelhos para fora na descida e garanta a profundidade abaixo do paralelo.',
    videoUrl: 'https://www.youtube.com/watch?v=F3SByb9LdNo'
  },
  {
    id: 'supino_reto',
    name: 'Supino Reto',
    techniqueTips: 'Pressione firmemente os calcanhares no chão (leg drive), faça a adução de escápulas e mantenha os cotovelos sob os punhos.',
    videoUrl: 'https://www.youtube.com/watch?v=vPctD92mGZ8'
  },
  {
    id: 'levantamento_terra',
    name: 'Levantamento Terra',
    techniqueTips: 'Remova a folga da barra (slack), contraia fortemente os dorsais e empurre o chão como se estivesse fazendo um leg press.',
    videoUrl: 'https://www.youtube.com/watch?v=AweC3UaM14o'
  },
  {
    id: 'remada_curvada',
    name: 'Remada Curvada',
    techniqueTips: 'Mantenha a coluna neutra e puxe a barra em direção ao abdômen inferior.',
    videoUrl: 'https://www.youtube.com/watch?v=G8LyyD_YdfM'
  },
  {
    id: 'agachamento_pausa',
    name: 'Agachamento com Pausa',
    techniqueTips: 'Faça uma pausa de 2 segundos na posição mais baixa (profundidade) mantendo a tensão muscular.',
    videoUrl: 'https://www.youtube.com/watch?v=78_z9ZqL_K4'
  },
  {
    id: 'supino_pausa',
    name: 'Supino com Pausa',
    techniqueTips: 'Faça uma pausa nítida de 1-2 segundos no peito antes de iniciar a subida explosiva.',
    videoUrl: 'https://www.youtube.com/watch?v=bAtA6Tym1c4'
  }
];

/**
 * Fetch all custom/saved exercises from Firestore, seeding with defaults if empty.
 */
export async function fetchDbExercisesFromFirebase(): Promise<DbExercise[]> {
  try {
    const colRef = collection(db, 'exercises');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // Seed initial exercises
      for (const ex of SEED_EXERCISES) {
        await setDoc(doc(db, 'exercises', ex.id), ex);
      }
      return SEED_EXERCISES;
    }
    const exercises: DbExercise[] = [];
    snapshot.forEach(docSnap => {
      exercises.push(docSnap.data() as DbExercise);
    });
    return exercises;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'exercises');
  }
}

/**
 * Save/update a single exercise document in Firestore.
 */
export async function saveDbExerciseToFirebase(exercise: DbExercise): Promise<void> {
  try {
    await setDoc(doc(db, 'exercises', exercise.id), exercise);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `exercises/${exercise.id}`);
  }
}

/**
 * Delete an exercise document from Firestore.
 */
export async function deleteDbExerciseFromFirebase(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'exercises', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `exercises/${id}`);
  }
}

