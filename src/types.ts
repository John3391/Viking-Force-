export interface User {
  name: string;
  email: string;
  role: 'student' | 'trainer';
}

export interface WarmupStep {
  percent: number; // e.g., 0.4 for 40%
  reps: number;    // number of repetitions
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  intensity: number | string; // e.g., 0.80 (for 80%) or "carga livre"
  targetRPE: number;
  main: boolean;
  warmup?: WarmupStep[];
  techniqueTips?: string;
  videoUrl?: string;
}

export interface WeekWorkout {
  A: Exercise[];
  B: Exercise[];
  C: Exercise[];
}

export interface TrainingProgram {
  weeks: Record<number, WeekWorkout>;
}

export interface LoggedExercise {
  name: string;
  rpe: number;
}

export interface LoggedSession {
  date: string;       // "09/07/2026"
  sessionName: string; // e.g. "Semana 1 - Treino A"
  exercises: LoggedExercise[];
  avgRPE: number;
  note?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'trainer' | 'student';
  text: string;
  timestamp: string;
}

export interface StudentProfile {
  name: string;
  plan: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  status: 'Pago' | 'Pendente' | 'Atrasado';
  prs: {
    squat: number | null;
    bench: number | null;
    deadlift: number | null;
  };
  preferredTime?: string;
  prevPrs?: {
    squat: number | null;
    bench: number | null;
    deadlift: number | null;
  };
  chatHistory?: ChatMessage[];
  sessions: LoggedSession[];
}

export interface VikingPlan {
  id: string;
  badge: string;
  name: string;
  price: number;
  period: string;
  description: string;
}

export interface GymLeaderboardEntry {
  position: number;
  name: string;
  squat: number;
  bench: number;
  deadlift: number;
  total: number;
  wilks: number;
}
