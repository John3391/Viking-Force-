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
  baseWeight?: number; // Carga do lift (1RM ou Peso Base) configurado pelo treinador
  warmup?: WarmupStep[];
  techniqueTips?: string;
  trainerNote?: string;
  videoUrl?: string;
  methodology?: 'standard' | 'backoff' | 'myoreps' | 'clusters' | 'dropset';
  methodologyDetails?: string;
}

export interface WeekWorkout {
  A: Exercise[];
  B: Exercise[];
  C: Exercise[];
  [key: string]: Exercise[];
}

export interface TrainingProgram {
  weeks: Record<number, WeekWorkout>;
}

export interface LoggedSet {
  reps: number;
  weight: number;
  done?: boolean;
}

export interface LoggedExercise {
  name: string;
  rpe: number;
  plannedVolume?: number;
  achievedVolume?: number;
  failed?: boolean;
  sets?: LoggedSet[];
}

export interface LoggedSession {
  id?: string;
  date: string;       // "09/07/2026"
  sessionName: string; // e.g. "Semana 1 - Treino A"
  exercises: LoggedExercise[];
  avgRPE: number;
  note?: string | null;
  totalPlannedVolume?: number;
  totalAchievedVolume?: number;
  volumeDeficit?: number;
  compensationSuggestion?: string | null;
  prsAtSession?: {
    squat: number | null;
    bench: number | null;
    deadlift: number | null;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'trainer' | 'student';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface StudentProfile {
  name: string;
  plan: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  status: 'Ativo' | 'Pendente' | 'Atrasado';
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
  gender?: 'male' | 'female';
  age?: number;
  bodyWeight?: number;
  competitionDate?: string;
  targetEventId?: string | null;
  targetEventName?: string | null;
  publicNote?: string | null;
  dueDate?: string | null;
  accessBlocked?: boolean;
  phone?: string;
  autoMonthlySummary?: boolean;
  monthlySummaryCustomMessage?: string;
  paymentHistory?: {
    id: string;
    amount: number;
    datePaid: string; // ISO string
    plan: string;
    dueDate: string; // The due date this payment covers
  }[];
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
  email: string;
  squat: number;
  bench: number;
  deadlift: number;
  total: number;
  wilks: number;
  gender: 'male' | 'female';
  age: number;
  bodyWeight: number;
  ageDivision: string;
  weightClass: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO format or DD/MM/YYYY
  type: 'competition' | 'test' | 'other';
  description?: string;
}

export interface DbExercise {
  id: string;
  name: string;
  techniqueTips?: string;
  videoUrl?: string;       // YouTube link
  videoBase64?: string;    // Base64 string for mobile uploads
  videoFileType?: string;  // e.g. "video/mp4" or "video/quicktime"
}

