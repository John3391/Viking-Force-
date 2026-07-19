export interface User {
  name: string;
  email: string;
  role: 'student' | 'trainer';
}

export interface MobilityStep {
  name: string;
  sets: number;
  reps: number;
  videoUrl?: string;
  tips?: string;
}

export interface WilksTier {
  name: string;
  targetWilks: number;
  minWilks: number;
  badge: string;
  desc: string;
  nextMin: number;
}

export const WILKS_LEVELS: WilksTier[] = [
  { name: 'Aspirante Viking', targetWilks: 0, minWilks: 0, badge: '🪵', desc: 'Iniciando a jornada nos portões de ferro.', nextMin: 150 },
  { name: 'Recruta Viking', targetWilks: 150, minWilks: 150, badge: '🛡️', desc: 'Primeiras conquistas alcançadas no templo.', nextMin: 250 },
  { name: 'Guerreiro do Clã', targetWilks: 250, minWilks: 250, badge: '⚔️', desc: 'Força relativa expressiva e respeito na tribo.', nextMin: 325 },
  { name: 'Berserker do Norte', targetWilks: 325, minWilks: 325, badge: '🔥', desc: 'Fúria devastadora erguendo grandes pesos.', nextMin: 400 },
  { name: 'Guerreiro de Valhalla', targetWilks: 400, minWilks: 400, badge: '⚡', desc: 'Força extraordinária digna dos deuses.', nextMin: 475 },
  { name: 'Semideus / Jarl', targetWilks: 475, minWilks: 475, badge: '👑', desc: 'Lenda absoluta no topo da montanha de ferro.', nextMin: 999 },
];

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
  videoBase64?: string;
  mobilityReminders?: string;
  mobility?: MobilityStep[];
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
  note?: string;
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
  completedMobility?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'trainer' | 'student';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface CardioSession {
  id: string;
  date: string;
  type: 'running' | 'cycling' | 'rowing' | 'sprints' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  intensity?: 'low' | 'moderate' | 'high';
  sprintSpeedKmh?: number;
  sprintTimeSeconds?: number;
  paceMinPerKm?: string;
  note?: string;
}

export interface CardioGoal {
  id: string;
  type: 'running' | 'cycling' | 'rowing' | 'sprints' | 'other';
  title: string;
  targetDistanceKm?: number;
  targetDurationMinutes?: number;
  targetSprintSpeedKmh?: number;
  deadline?: string;
  completed?: boolean;
  achievedDate?: string;
}

export interface CardioPrescription {
  id: string;
  type: 'running' | 'cycling' | 'rowing' | 'sprints' | 'other';
  frequency: string; // e.g. "2x por semana"
  instructions: string; // e.g. "Sprint 10x 100m Z5"
  targetDistanceKm?: number;
  targetDurationMinutes?: number;
  targetIntensity?: 'low' | 'moderate' | 'high';
  datePrescribed: string;
}

export interface StudentProfile {
  name: string;
  plan: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  status: 'Ativo' | 'Pendente' | 'Atrasado' | 'Pago';
  photoUrl?: string;
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
  cardioSessions?: CardioSession[];
  cardioGoals?: CardioGoal[];
  cardioPrescriptions?: CardioPrescription[];
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
  notifications?: {
    id: string;
    message: string;
    date: string;
    read: boolean;
    type: 'info' | 'success' | 'warning';
    actionData?: { week: number; day: string };
  }[];
  customProgram?: TrainingProgram;
  workoutReady?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
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

export interface DbMobilityExercise {
  id: string;
  name: string;
  videoUrl?: string;
  tips?: string;
}


export interface TrainingProtocol {
  id: string;
  name: string;
  description?: string;
  folder?: string;
  program: TrainingProgram;
  createdAt: string;
}
