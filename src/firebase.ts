import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { StudentProfile, TrainingProgram, VikingPlan } from './types';
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
    console.error("Failed to fetch students from Firebase:", error);
    // Fallback to local storage if available, handled in App.tsx
    throw error;
  }
}

/**
 * Save/update a single student document in Firestore.
 */
export async function saveStudentToFirebase(email: string, student: StudentProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'students', email), student);
  } catch (error) {
    console.error(`Failed to save student ${email} to Firebase:`, error);
    throw error;
  }
}

/**
 * Delete a student document from Firestore.
 */
export async function deleteStudentFromFirebase(email: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', email));
  } catch (error) {
    console.error(`Failed to delete student ${email} from Firebase:`, error);
    throw error;
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
    console.error("Failed to fetch program from Firebase:", error);
    throw error;
  }
}

/**
 * Save training program to Firestore.
 */
export async function saveProgramToFirebase(program: TrainingProgram): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'program'), program);
  } catch (error) {
    console.error("Failed to save program to Firebase:", error);
    throw error;
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
    console.error("Failed to fetch plans from Firebase:", error);
    throw error;
  }
}

/**
 * Save custom plans to Firestore.
 */
export async function savePlansToFirebase(plans: VikingPlan[]): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'plans'), { plans });
  } catch (error) {
    console.error("Failed to save plans to Firebase:", error);
    throw error;
  }
}
