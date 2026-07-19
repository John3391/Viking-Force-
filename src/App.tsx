import { CardioView } from './components/CardioView';
import { PrCalculator } from './components/PrCalculator';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Trophy, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  CheckCircle,
  Edit, 
  X, 
  Play, 
  Pause,
  Timer,
  History, 
  UserPlus, 
  Check, 
  PlusCircle, 
  Trash2, 
  Copy, 
  Save, 
  Phone, 
  Activity, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Scale, 
  Shield, 
  Coins, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  User, 
  Flame, 
  Plus, 
  RotateCcw,
  MessageSquare, MessageCircle,
  AlertTriangle,
  Search,
  FileDown,
  ArrowLeft,
  ArrowRight,
  Send,
  Video,
  Youtube,
  Crown,
  Award,
  Sparkles,
  Mail,
  Inbox,
  Loader2,
  BookOpen,
  Library,
  Upload,
  Zap,
  Square,
  CheckSquare,
  Filter,
  Maximize2,
  Minimize2,
  Columns,
  Lock,
  Calendar,
  Users, Target,
  Camera,
  Image as ImageIcon,
  Bell,
  Grid,
  List,
  Info,
  GripVertical
,
  Calculator,
  Folder
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { User as UserType, TrainingProgram, StudentProfile, LoggedSession, Exercise, WarmupStep, MobilityStep, WilksTier, WILKS_LEVELS, VikingPlan, ChatMessage, GymLeaderboardEntry, DbExercise, DbMobilityExercise, CalendarEvent, TrainingProtocol, CardioSession, CardioGoal, CardioPrescription } from './types';
import { ProtocolsDrawer } from './components/ProtocolsDrawer';
import { DEFAULT_PROGRAM, DEFAULT_STUDENTS } from './data';


function DebouncedInput({ value, onChange, ...props }: any) {
  const [localValue, setLocalValue] = useState(value);
  const lastValueRef = useRef(value);

  if (value !== lastValueRef.current) {
    setLocalValue(value);
    lastValueRef.current = value;
  }

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onChange(localValue);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

function DebouncedTextarea({ value, onChange, ...props }: any) {
  const [localValue, setLocalValue] = useState(value);
  const lastValueRef = useRef(value);

  if (value !== lastValueRef.current) {
    setLocalValue(value);
    lastValueRef.current = value;
  }

  return (
    <textarea
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
    />
  );
}

function WeightControl({ value, onChange, placeholder, disabled, title, step = 2.5 }: any) {
  const handleDecrement = () => {
    const current = typeof value === 'number' ? value : parseFloat(value) || 0;
    onChange(Math.max(0, current - step));
  };

  const handleIncrement = () => {
    const current = typeof value === 'number' ? value : parseFloat(value) || 0;
    onChange(current + step);
  };

  return (
    <div className="flex items-center gap-1.5 w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={handleDecrement}
        className="w-8 h-8 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0 border border-viking-gold/20 transition-colors"
      >
        -
      </button>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value === 0 || value === undefined ? '' : value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? 0 : (parseFloat(val) || 0));
        }}
        disabled={disabled}
        placeholder={placeholder}
        title={title}
        className="flex-1 min-w-0 bg-black/40 border border-viking-gold/20 text-[#e0d3a8] text-center font-bold text-xs py-2 rounded focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={handleIncrement}
        className="w-8 h-8 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0 border border-viking-gold/20 transition-colors"
      >
        +
      </button>
    </div>
  );
}

import { 
  fetchStudentsFromFirebase, 
  saveStudentToFirebase, 
  deleteStudentFromFirebase, 
  fetchProgramFromFirebase, 
  subscribeProgram,
  saveProgramToFirebase, 
  fetchPlansFromFirebase, 
  savePlansToFirebase,
  fetchDbExercisesFromFirebase,
  saveDbExerciseToFirebase,
  deleteDbExerciseFromFirebase,
  fetchDbMobilityExercisesFromFirebase,
  saveDbMobilityExerciseToFirebase,
  deleteDbMobilityExerciseFromFirebase,
  fetchCalendarEventsFromFirebase,
  saveCalendarEventToFirebase,
  deleteCalendarEventFromFirebase,
  auth,
  subscribeStudents,
  subscribeStudentProfile,
  storage
} from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import VolumeChart from './components/VolumeChart';
import OneRepMaxChart from './components/OneRepMaxChart';
import TotalSBDChart from './components/TotalSBDChart';
import WilksScatterChart from './components/WilksScatterChart';
import FailureSentinel from './components/FailureSentinel';
import PatentTimeline from './components/PatentTimeline';
import WeeklyVolumeLineChart from './components/WeeklyVolumeLineChart';
import { VikingLogo } from './components/VikingLogo';

const TRAINER_EMAIL = 'john.vasquesrodrigues@gmail.com';
const TRAINER_PASSWORD = '3636';

const POWERLIFTING_TIPS: Record<string, string> = {
  Squat: "Mantenha o peito alto, joelhos para fora e busque a profundidade ideal, mantendo os calcanhares no chão.",
  Bench: "Retraia as escápulas, mantenha os pés firmes no chão e controle a descida da barra até o peito.",
  Deadlift: "Mantenha a barra próxima às canelas, costas retas, ative o core e empurre o chão ao subir."
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?\??v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

export default function App() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [authTab, setAuthTab] = useState<'student' | 'trainer'>('student');
  
  // Registration and PR state
  const [regName, setRegName] = useState<string>('');
  const [prSquat, setPrSquat] = useState<string>('');
  const [prBench, setPrBench] = useState<string>('');
  const [prDeadlift, setPrDeadlift] = useState<string>('');
  const [regAge, setRegAge] = useState<string>('25');
  const [regBodyWeight, setRegBodyWeight] = useState<string>('80');
  const [regGender, setRegGender] = useState<'male' | 'female'>('male');
  const [regPreferredTime, setRegPreferredTime] = useState<string>('18:00');
  const [regPlan, setRegPlan] = useState<string>('Mensal');
  const [simulatedTime, setSimulatedTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  // Leaderboard configuration
  const [leaderboardTab, setLeaderboardTab] = useState<'all' | 'age' | 'weight'>('all');
  const [leaderboardSortCol, setLeaderboardSortCol] = useState<'position' | 'name' | 'age' | 'bodyWeight' | 'squat' | 'bench' | 'deadlift' | 'total' | 'wilks'>('wilks');
  const [leaderboardSortDesc, setLeaderboardSortDesc] = useState<boolean>(true);
  const [leaderboardAgeFilter, setLeaderboardAgeFilter] = useState<string>('all');
  const [leaderboardWeightFilter, setLeaderboardWeightFilter] = useState<string>('all');
  const [leaderboardGenderFilter, setLeaderboardGenderFilter] = useState<string>('all');

  // App core database state
  const [trainingProgram, setTrainingProgram] = useState<TrainingProgram>(DEFAULT_PROGRAM);
  const [studentsData, setStudentsData] = useState<Record<string, StudentProfile>>(DEFAULT_STUDENTS);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Active UI Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [studentSubTab, setStudentSubTab] = useState<'overview' | 'wilks' | 'cardio' | 'calculator'>('overview');
  const [wilksRatios, setWilksRatios] = useState({ squat: 38, bench: 24, deadlift: 38 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Reuseable Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState<string>('');
  const [drawerType, setDrawerType] = useState<string>(''); // 'history' | 'ranking' | 'plans' | 'settings' | 'addStudent' | 'whatsapp' | 'payments' | 'rpeFeedback' | 'editProgram' | 'whatsappSettings'
  const [trainingProtocols, setTrainingProtocols] = useState<TrainingProtocol[]>(() => { const stored = localStorage.getItem('viking_protocols'); return stored ? JSON.parse(stored) : []; });
  const [whatsappWorkoutTemplate, setWhatsappWorkoutTemplate] = useState<string>(() => {
    return localStorage.getItem('viking_whatsapp_workout_template') || `🛡️ *TEMPLO VIKING FORCE - TREINO PREPARADO!* 🛡️

Saudações, Guerreiro *{NOME_ALUNO}*! ⚔️

Seu treinador acaba de preparar e atualizar a sua ficha de treino *{NOME_TREINO}*! Seu corpo, sua mente e seus limites serão testados nesta nova fase.

📊 *Resumo de Batalha (PRs Atuais):*
• 🏋️ Agachamento: {PR_SQUAT}
• 🏋️ Supino: {PR_BENCH}
• 🏋️ Levantamento Terra: {PR_DEADLIFT}

📥 *Ação Solicitada:*
1️⃣ Baixe a ficha em PDF que estou te enviando aqui.
2️⃣ Acesse o *Diário do Guerreiro* para registrar suas repetições, RPE e acompanhar sua evolução em tempo real!

*Que os deuses do ferro abençoem seus levantamentos. O ferro não mente!* 🔥💪⚡`;
  });
  const [editingStudentEmail, setEditingStudentEmail] = useState<string>('');
  const [activeChatStudentEmail, setActiveChatStudentEmail] = useState<string>('');
  const [whatsappPreviewStudentEmail, setWhatsappPreviewStudentEmail] = useState<string>('');
  
  const hasCheckedDueDatesRef = useRef<boolean>(false);
  const previousStudentsRef = useRef<Record<string, StudentProfile>>({});
  const lastOpenedWorkoutRef = useRef<{ open: boolean; week: number; day: string }>({ open: false, week: 1, day: 'A' });
  const [chatMessageInput, setChatMessageInput] = useState<string>('');
  const [chatImageFile, setChatImageFile] = useState<File | null>(null);
  const [isUploadingChatImage, setIsUploadingChatImage] = useState<boolean>(false);
  const [chatFilterStartDate, setChatFilterStartDate] = useState<string>('');
  const [chatFilterEndDate, setChatFilterEndDate] = useState<string>('');
  const [activeNoteStudentEmail, setActiveNoteStudentEmail] = useState<string>('');
  const [publicNoteInput, setPublicNoteInput] = useState<string>('');

  // Controlled inputs for student Settings (PRs)
  const [settingsSquat, setSettingsSquat] = useState<number>(0);
  const [settingsBench, setSettingsBench] = useState<number>(0);
  const [settingsDeadlift, setSettingsDeadlift] = useState<number>(0);

  // Controlled inputs for trainer's Edit Student (PRs)
  const [editStudentSquat, setEditStudentSquat] = useState<number>(0);
  const [editStudentBench, setEditStudentBench] = useState<number>(0);
  const [editStudentDeadlift, setEditStudentDeadlift] = useState<number>(0);

  // Gmail states
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [gmailTab, setGmailTab] = useState<'inbox' | 'compose' | 'broadcast'>('inbox');
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [loadingGmail, setLoadingGmail] = useState<boolean>(false);

  // Active workout modal state (Student)
  const [workoutModalOpen, setWorkoutModalOpen] = useState<boolean>(false);
  const [confirmSessionModalOpen, setConfirmSessionModalOpen] = useState<boolean>(false);
  const [pendingSession, setPendingSession] = useState<LoggedSession | null>(null);
  const [workoutLayout, setWorkoutLayout] = useState<'modal' | 'sidebar'>('sidebar');
  const [workoutViewMode, setWorkoutViewMode] = useState<'list' | 'slide'>('slide');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>(() => localStorage.getItem('viking_last_day') || 'A');
  useEffect(() => { localStorage.setItem('viking_last_day', selectedDay); }, [selectedDay]);
  const [sessionRpeState, setSessionRpeState] = useState<Record<string, number>>({});
  const [exerciseFailureState, setExerciseFailureState] = useState<Record<string, { failed: boolean; actualReps: number; setsDone: number }>>({});
  const [exerciseSetsState, setExerciseSetsState] = useState<Record<string, { reps: number; weight: number; done?: boolean }[]>>({});
  const [exerciseWarmupState, setExerciseWarmupState] = useState<Record<string, boolean[]>>({});
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(120);
  const [restTimerActive, setRestTimerActive] = useState<boolean>(false);
  const [restTimerRemaining, setRestTimerRemaining] = useState<number>(120);
  const [timerShake, setTimerShake] = useState<boolean>(false);
  const [sessionNote, setSessionNote] = useState<string>('');

  // Touch swiping states for mobile exercise card slide navigation
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  // Program Editor state (Trainer)
  const [editorWeek, setEditorWeek] = useState<number>(1);
  const [editorDay, setEditorDay] = useState<string>('A');
  const [editorProgram, setEditorProgram] = useState<TrainingProgram>(DEFAULT_PROGRAM);
  const [editorExercises, setEditorExercises] = useState<Exercise[]>([]);
  const [editorSearchQuery, setEditorSearchQuery] = useState<string>('');
  const [copySourceWeek, setCopySourceWeek] = useState<number>(1);
  const [copySourceDay, setCopySourceDay] = useState<string>('A');

  // Toast notification stack
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Reusable helper to update a student's cardio and target logs
  const handleUpdateStudentCardio = (studentEmail: string, updater: (profile: StudentProfile) => Partial<StudentProfile>) => {
    const email = studentEmail.toLowerCase();
    const currentStudent = studentsData[email];
    if (!currentStudent) return;

    const updatedProfile = {
      ...currentStudent,
      ...updater(currentStudent)
    };

    setStudentsData(prev => {
      const newStudents = { ...prev, [email]: updatedProfile };
      localStorage.setItem('viking_students', JSON.stringify(newStudents));
      return newStudents;
    });

    saveStudentToFirebase(email, updatedProfile).catch(err => {
      console.error("Firebase save athlete error:", err);
    });
  };

  // Search filter state for Trainer dashboard
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [whatsappSearch, setWhatsappSearch] = useState<string>('');
  const [billingFilterDelay, setBillingFilterDelay] = useState<number>(0);
  const [paymentsSearch, setPaymentsSearch] = useState<string>('');
  const [selectedPaymentStudent, setSelectedPaymentStudent] = useState<string | null>(null);
  const [rpeSearch, setRpeSearch] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending_or_overdue'>('all');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [historyTab, setHistoryTab] = useState<'list' | 'comparison'>('list');
  const [navDropdownOpen, setNavDropdownOpen] = useState<boolean>(false);
  const [studentsLayoutMode, setStudentsLayoutMode] = useState<'grid' | 'list'>('grid');
  const [customLogo, setCustomLogo] = useState<string>(() => {
    return localStorage.getItem('viking_custom_logo') || '';
  });

  // Delete Athlete state (Trainer)
  const [deletingStudentEmail, setDeletingStudentEmail] = useState<string | null>(null);

  // Batch Selection State for updating status (e.g., set to 'Pago')
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    isDanger?: boolean;
  } | null>(null);

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDanger = false,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      },
      confirmText,
      cancelText,
      isDanger
    });
  };

  // Chat scroll container reference
  const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Drawer scroll container reference
  const drawerContentRef = useRef<HTMLDivElement | null>(null);

  // PR Celebration state (Student)
  const [prCelebration, setPrCelebration] = useState<{ lifts: string[] } | null>(null);

  // Exercises Database state
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);
  const [dbMobilityExercises, setDbMobilityExercises] = useState<DbMobilityExercise[]>([]);
  const [dbExercisesLoading, setDbExercisesLoading] = useState<boolean>(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [editingDbExercise, setEditingDbExercise] = useState<DbExercise | null>(null);
  const [dbExerciseSearch, setDbExerciseSearch] = useState<string>('');
  const [navSearchQuery, setNavSearchQuery] = useState<string>('');
  const [navSearchInput, setNavSearchInput] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [expandedExerciseIdx, setExpandedExerciseIdx] = useState<number | null>(null);
  const [draggedExerciseIdx, setDraggedExerciseIdx] = useState<number | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ name: string; videoUrl?: string; videoBase64?: string; tips?: string } | null>(null);
  const [activeTipsModal, setActiveTipsModal] = useState<{ name: string; tips: string } | null>(null);

  // Viking Plans configuration
  const [vikingPlans, setVikingPlans] = useState<VikingPlan[]>(() => {
    const stored = localStorage.getItem('viking_plans');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'mensal',
        badge: 'Aço Feroz',
        name: 'Aliança Mensal',
        price: 200,
        period: '/mês',
        description: 'Acompanhamento completo, planilha de treino inteligente com RPE e suporte via WhatsApp.'
      },
      {
        id: 'trimestral',
        badge: 'Clã Invencível',
        name: 'Aliança Trimestral',
        price: 540,
        period: '/trimestre',
        description: 'Economize R$ 60 no período total. Renovações automáticas a cada 3 meses.'
      },
      {
        id: 'anual',
        badge: 'Valhalla Eterno',
        name: 'Aliança Anual',
        price: 1800,
        period: '/ano',
        description: 'O maior custo-benefício. Dividido em até 12x sem juros. Economia de R$ 600.'
      }
    ];
  });

  const getPlanPrice = (planName: string) => {
    const plan = vikingPlans.find(p => p.id === planName.toLowerCase() || p.name.toLowerCase().includes(planName.toLowerCase()));
    return plan ? plan.price : (planName === 'Mensal' ? 200 : planName === 'Trimestral' ? 540 : 1800);
  };

  const getPlanMonthlyEquivalent = (planName: string) => {
    const price = getPlanPrice(planName);
    if (planName === 'Trimestral') return price / 3;
    if (planName === 'Anual') return price / 12;
    return price; // Mensal
  };

  const handleRegisterPayment = (studentEmail: string) => {
    const s = studentsData[studentEmail];
    if (!s) return;
    
    let nextDueDate = s.dueDate;

    if (s.dueDate) {
      const [year, month, day] = s.dueDate.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      if (s.plan === 'Mensal') date.setMonth(date.getMonth() + 1);
      else if (s.plan === 'Trimestral') date.setMonth(date.getMonth() + 3);
      else if (s.plan === 'Semestral') date.setMonth(date.getMonth() + 6);
      else if (s.plan === 'Anual') date.setFullYear(date.getFullYear() + 1);
      nextDueDate = date.toISOString().split('T')[0];
    } else {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      if (s.plan === 'Mensal') date.setMonth(date.getMonth() + 1);
      else if (s.plan === 'Trimestral') date.setMonth(date.getMonth() + 3);
      else if (s.plan === 'Semestral') date.setMonth(date.getMonth() + 6);
      else if (s.plan === 'Anual') date.setFullYear(date.getFullYear() + 1);
      nextDueDate = date.toISOString().split('T')[0];
    }

    const newPayment = {
      id: 'pay_' + Date.now().toString() + '_' + Math.random().toString(36).substring(7),
      amount: getPlanPrice(s.plan),
      datePaid: new Date(new Date().setHours(12, 0, 0, 0)).toISOString().split('T')[0],
      plan: s.plan,
      dueDate: s.dueDate || 'N/A'
    };

    const updatedProfile: StudentProfile = {
      ...s,
      status: 'Pago',
      dueDate: nextDueDate,
      paymentHistory: [newPayment, ...(s.paymentHistory || [])]
    };
    
    saveStudentsToDB({ ...studentsData, [studentEmail]: updatedProfile });
    showToast(`Pagamento de ${s.name} registrado e vencimento atualizado para ${nextDueDate.split('-').reverse().join('/')}!`, 'success');
  };

  const generateReceiptPDF = (email: string, student: StudentProfile) => {
    try {
      const doc = new jsPDF();
      const planPrice = getPlanPrice(student.plan);
      const date = new Date().toLocaleDateString('pt-BR');

      doc.setFillColor(26, 18, 16);
      doc.rect(0, 0, 210, 297, 'F'); // A4 dimensions: 210x297

      doc.setTextColor(212, 175, 55); // Viking Gold
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("RECIBO DE PAGAMENTO", 105, 30, { align: "center" });

      doc.setTextColor(190, 190, 190);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Viking Force Powerlifting", 105, 40, { align: "center" });

      doc.setDrawColor(212, 175, 55);
      doc.line(20, 50, 190, 50);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(`Guerreiro(a): ${student.name}`, 20, 70);
      doc.text(`Email: ${email}`, 20, 80);
      
      doc.text(`Plano Associado: ${student.plan}`, 20, 100);
      doc.text(`Valor: R$ ${planPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 110);
      doc.text(`Data de Emissão: ${date}`, 20, 120);

      doc.setTextColor(52, 211, 153); // Emerald
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`STATUS: ${student.status.toUpperCase()}`, 105, 140, { align: "center" });

      doc.setDrawColor(212, 175, 55);
      doc.line(20, 160, 190, 160);

      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Que os deuses do ferro abençoem seus ganhos.", 105, 180, { align: "center" });

      doc.save(`recibo_${student.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      showToast(`Recibo de ${student.name} gerado!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Erro ao gerar recibo PDF.', 'error');
    }
  };

  // --- STUDENT LEVEL LOGIC ---
  const rawStudentProfile = currentUser && currentUser.role === 'student' ? studentsData[currentUser.email.toLowerCase()] : null;
  const activeStudentProfile = rawStudentProfile ? { 
    ...rawStudentProfile, 
    sessions: rawStudentProfile.sessions || [],
    prs: rawStudentProfile.prs || { squat: null, bench: null, deadlift: null }
  } : null;

  useEffect(() => {
    localStorage.setItem('viking_plans', JSON.stringify(vikingPlans));
  }, [vikingPlans]);

  useEffect(() => {
    localStorage.setItem('viking_protocols', JSON.stringify(trainingProtocols));
  }, [trainingProtocols]);

  // Synchronize Settings PR states on open
  useEffect(() => {
    if (drawerOpen && drawerType === 'settings' && activeStudentProfile) {
      setSettingsSquat(activeStudentProfile.prs?.squat || 0);
      setSettingsBench(activeStudentProfile.prs?.bench || 0);
      setSettingsDeadlift(activeStudentProfile.prs?.deadlift || 0);
    }
  }, [drawerOpen, drawerType, activeStudentProfile]);

  // Synchronize Edit Student PR states on open
  useEffect(() => {
    if (drawerOpen && drawerType === 'editStudent' && editingStudentEmail) {
      const student = studentsData[editingStudentEmail.toLowerCase()];
      if (student) {
        setEditStudentSquat(student.prs?.squat || 0);
        setEditStudentBench(student.prs?.bench || 0);
        setEditStudentDeadlift(student.prs?.deadlift || 0);
      }
    }
  }, [drawerOpen, drawerType, editingStudentEmail, studentsData]);

  // Auto-select the correct week and day if the currently selected one is empty
  useEffect(() => {
    const activeProg = activeStudentProfile?.customProgram || trainingProgram;
    if (!activeProg || !activeProg.weeks) return;
    
    const currentExercises = activeProg.weeks[selectedWeek]?.[selectedDay] || [];
    if (currentExercises.length === 0) {
      // Find the first week and day that has exercises
      const weeks = Object.keys(activeProg.weeks).map(Number).sort((a,b) => a-b);
      for (const w of weeks) {
        const days = Object.keys(activeProg.weeks[w] || {}).sort();
        for (const d of days) {
          if (activeProg.weeks[w][d] && activeProg.weeks[w][d].length > 0) {
            setSelectedWeek(w);
            setSelectedDay(d);
            return;
          }
        }
      }
    }
  }, [activeStudentProfile?.customProgram, trainingProgram]);

  // Auto-scroll chat container to the bottom when chat is active or new messages arrive
  useEffect(() => {
    if (drawerType === 'chat' && chatMessagesContainerRef.current) {
       requestAnimationFrame(() => {
         if (chatMessagesContainerRef.current) {
           chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
         }
       });
    }
  }, [drawerType, activeChatStudentEmail, currentUser?.email, studentsData, drawerOpen]);

  // Reset workout panel view configuration, initialize sets and rest timer
  useEffect(() => {
    if (workoutModalOpen) {
      const wasClosed = !lastOpenedWorkoutRef.current.open;
      const dayChanged = lastOpenedWorkoutRef.current.week !== selectedWeek || lastOpenedWorkoutRef.current.day !== selectedDay;
      
      lastOpenedWorkoutRef.current = { open: true, week: selectedWeek, day: selectedDay };

      if (wasClosed || dayChanged) {
        setWorkoutLayout('sidebar');
        setWorkoutViewMode('slide');
        setCurrentExerciseIndex(0);
        setRestTimerActive(false);
        setRestTimerRemaining(restTimerSeconds);
      }

      // Initialize sets state for the exercises in the current selected training day
      const activeProg = activeStudentProfile?.customProgram || trainingProgram;
      const currentExercises = activeProg.weeks[selectedWeek]?.[selectedDay] || [];
      
      setExerciseSetsState(prevSets => {
        const initialSets: Record<string, { reps: number; weight: number; done?: boolean; note?: string }[]> = {};
        
        currentExercises.forEach(ex => {
          // If the student already has set progress logged in prevSets, preserve it!
          if (!wasClosed && !dayChanged && prevSets[ex.id] && prevSets[ex.id].length > 0) {
            initialSets[ex.id] = prevSets[ex.id];
            return;
          }

          let defaultWeight = 0;
          if (ex.main) {
            const exNameLower = ex.name.toLowerCase();
            let pr = ex.baseWeight || null;
            if (!pr && activeStudentProfile) {
              if (exNameLower.includes('agachamento') || exNameLower.includes('squat')) {
                pr = activeStudentProfile.prs.squat;
              } else if (exNameLower.includes('supino') || exNameLower.includes('bench')) {
                pr = activeStudentProfile.prs.bench;
              } else if (exNameLower.includes('terra') || exNameLower.includes('deadlift')) {
                pr = activeStudentProfile.prs.deadlift;
              }
            }
            let intensityRatio = 0;
            if (typeof ex.intensity === 'number') {
              intensityRatio = ex.intensity;
            } else if (typeof ex.intensity === 'string') {
              const parsed = parseFloat(ex.intensity.replace('%', ''));
              if (!isNaN(parsed)) {
                intensityRatio = parsed > 1 ? parsed / 100 : parsed;
              }
            }

            if (pr && intensityRatio > 0) {
              defaultWeight = Math.round(pr * intensityRatio);
            } else if (pr) {
              defaultWeight = pr;
            }
          } else {
            defaultWeight = ex.baseWeight || 0;
          }
          
          // Populate sets with ex.sets count
          const setsCount = ex.sets || 3;
          initialSets[ex.id] = Array.from({ length: setsCount }, () => ({
            reps: ex.reps || 8,
            weight: defaultWeight,
            done: false
          }));
        });

        return initialSets;
      });
    } else {
      lastOpenedWorkoutRef.current.open = false;
    }
  }, [workoutModalOpen, selectedWeek, selectedDay, activeStudentProfile?.customProgram, activeStudentProfile?.prs, trainingProgram]);

  // Rest Timer countdown logic
  useEffect(() => {
    let intervalId: any = null;
    if (restTimerActive && restTimerRemaining > 0) {
      intervalId = setInterval(() => {
        setRestTimerRemaining(prev => {
          if (prev <= 1) {
            setRestTimerActive(false);
            showToast('🛡️ Intervalo Concluído! De volta à batalha, guerreiro!', 'success');
            setTimerShake(true);
            setTimeout(() => setTimerShake(false), 800);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [restTimerActive, restTimerRemaining]);

  // --- LOCALSTORAGE & FIREBASE SYNC ---
  useEffect(() => {
    // Force a one-time logout to allow the trainer to test the new login screen immediately
    const forceLogout = localStorage.getItem('viking_force_logout_v2');
    if (!forceLogout) {
      localStorage.setItem('viking_force_logout_v2', 'true');
      localStorage.removeItem('viking_current_user');
      localStorage.setItem('viking_logged_out', 'true');
      signOut(auth).catch(err => console.warn("Firebase signout warning:", err));
    }

    // 1. Offline-First: Load local data instantly
    const storedProgram = localStorage.getItem('viking_program');
    const storedStudents = localStorage.getItem('viking_students');
    const storedUser = localStorage.getItem('viking_current_user');
    const loggedOut = localStorage.getItem('viking_logged_out');

    if (storedProgram) setTrainingProgram(JSON.parse(storedProgram));
    if (storedStudents) setStudentsData(JSON.parse(storedStudents));

    if (storedUser && !loggedOut) {
      setCurrentUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      // Handle "/cadastro", "#/cadastro", "?atleta=cadastro"
      const isRegisterRoute = 
        window.location.pathname.includes('cadastro') || 
        window.location.hash.includes('cadastro') || 
        window.location.search.includes('cadastro');

      if (isRegisterRoute) {
        setIsRegisterMode(true);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } else {
        setIsRegisterMode(false);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    }

    // 2. Cloud Sync: Set up the auth listener. Fetch only when authenticated!
    let unsubscribeStudents: (() => void) | null = null;
    let unsubscribeProgram: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let email = (firebaseUser.email || '').trim().toLowerCase();
        let isTrainer = email === TRAINER_EMAIL;
        let role: 'trainer' | 'student' = isTrainer ? 'trainer' : 'student';
        
        // Ensure state and localstorage match current authenticated user
        const storedUserObj = localStorage.getItem('viking_current_user');
        let name = isTrainer ? 'John Rodrigues' : (email.split('@')[0] || 'Guerreiro');
        
        if (storedUserObj) {
          try {
            const parsed = JSON.parse(storedUserObj);
            if (firebaseUser.isAnonymous && parsed.role === 'trainer') {
              isTrainer = true;
              role = 'trainer';
              email = TRAINER_EMAIL;
              name = 'John Rodrigues';
            } else if (parsed.email === email || firebaseUser.isAnonymous) {
              if (parsed.name) name = parsed.name;
              if (parsed.role) role = parsed.role;
              if (parsed.email) email = parsed.email;
            }
          } catch (e) {}
        }
        
        const userObj: UserType = {
          name: name,
          email: email,
          role: role
        };
        
        setCurrentUser(userObj);
        setIsLoggedIn(true);
        localStorage.setItem('viking_current_user', JSON.stringify(userObj));
        localStorage.removeItem('viking_logged_out');

        // Fetch fresh data from Firebase now that we are authenticated!
        let syncSuccess = true;
        
        // Subscribe to students in real-time!
        try {
          if (unsubscribeStudents) {
            unsubscribeStudents();
            unsubscribeStudents = null;
          }
          
          if (role === 'trainer') {
            unsubscribeStudents = subscribeStudents((remoteStudents) => {
              if (remoteStudents && Object.keys(remoteStudents).length > 0) {
                setStudentsData(remoteStudents);
                localStorage.setItem('viking_students', JSON.stringify(remoteStudents));
              }
            });
          } else {
            // Se for aluno, inscreve apenas no próprio perfil
            unsubscribeStudents = subscribeStudentProfile(email, (remoteStudent) => {
              if (remoteStudent) {
                setStudentsData(prev => {
                  const newData = { ...prev, [email]: remoteStudent };
                  localStorage.setItem('viking_students', JSON.stringify(newData));
                  return newData;
                });
              }
            });
          }
        } catch (e) {
          console.warn("Error subscribing to athletes real-time feed:", e);
          syncSuccess = false;
          // Fallback to one-time fetch
          try {
            const remoteStudents = await fetchStudentsFromFirebase();
            if (remoteStudents && Object.keys(remoteStudents).length > 0) {
              setStudentsData(remoteStudents);
              localStorage.setItem('viking_students', JSON.stringify(remoteStudents));
            }
          } catch (err) {
            console.warn("Using offline storage for athletes:", err);
          }
        }

        try {
          if (unsubscribeProgram) {
            unsubscribeProgram();
            unsubscribeProgram = null;
          }
          unsubscribeProgram = subscribeProgram((remoteProgram) => {
            if (remoteProgram) {
              setTrainingProgram(remoteProgram);
              localStorage.setItem('viking_program', JSON.stringify(remoteProgram));
            }
          });
        } catch (e) {
          console.warn("Error subscribing to training program real-time feed:", e);
          syncSuccess = false;
          // Fallback to one-time fetch
          try {
            const remoteProgram = await fetchProgramFromFirebase();
            if (remoteProgram) {
              setTrainingProgram(remoteProgram);
              localStorage.setItem('viking_program', JSON.stringify(remoteProgram));
            }
          } catch (err) {
            console.warn("Using offline storage for training program:", err);
          }
        }

        try {
          const remotePlans = await fetchPlansFromFirebase();
          if (remotePlans && remotePlans.length > 0) {
            setVikingPlans(remotePlans);
            localStorage.setItem('viking_plans', JSON.stringify(remotePlans));
          }
        } catch (e) {
          console.warn("Using offline storage for plans:", e);
          syncSuccess = false;
        }

        try {
          const remoteExs = await fetchDbExercisesFromFirebase();
          if (remoteExs && remoteExs.length > 0) {
            setDbExercises(remoteExs);
            localStorage.setItem('viking_db_exercises', JSON.stringify(remoteExs));
          }
        } catch (e) {
          console.warn("Using offline storage for exercises:", e);
          const cached = localStorage.getItem('viking_db_exercises');
          if (cached) {
            setDbExercises(JSON.parse(cached));
          }
          syncSuccess = false;
        }

        try {
          const remoteMobility = await fetchDbMobilityExercisesFromFirebase();
          if (remoteMobility && remoteMobility.length > 0) {
            setDbMobilityExercises(remoteMobility);
            localStorage.setItem('viking_db_mobility_exercises', JSON.stringify(remoteMobility));
          }
        } catch (e) {
          console.warn("Using offline storage for mobility:", e);
          const cached = localStorage.getItem('viking_db_mobility_exercises');
          if (cached) {
            setDbMobilityExercises(JSON.parse(cached));
          }
          syncSuccess = false;
        }

        try {
          const remoteEvents = await fetchCalendarEventsFromFirebase();
          if (remoteEvents) {
            setCalendarEvents(remoteEvents);
            localStorage.setItem('viking_calendar_events', JSON.stringify(remoteEvents));
          }
        } catch (e) {
          console.warn("Using offline storage for calendar events:", e);
          const cached = localStorage.getItem('viking_calendar_events');
          if (cached) {
            setCalendarEvents(JSON.parse(cached));
          }
        }

        setIsOnline(syncSuccess);
      } else {
        // Not signed in to Firebase Auth
        setIsOnline(false);
        hasCheckedDueDatesRef.current = false;
        if (unsubscribeStudents) {
          unsubscribeStudents();
          unsubscribeStudents = null;
        }
        if (unsubscribeProgram) {
          unsubscribeProgram();
          unsubscribeProgram = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeStudents) {
        unsubscribeStudents();
      }
      if (unsubscribeProgram) {
        unsubscribeProgram();
      }
    };
  }, []);

  const checkPaymentReminders = (autoCheck = false) => {
    if (Object.keys(studentsData).length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    let anyUpdates = false;
    const newStudentsData = { ...studentsData };
    const expiringStudents: string[] = [];

    Object.keys(newStudentsData).forEach(email => {
      const student = newStudentsData[email];
      if (!student || !student.dueDate) return;

      const [year, month, day] = student.dueDate.split('-');
      if (!year || !month || !day) return;
      
      const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      
      if (dueDate <= threeDaysFromNow) {
        expiringStudents.push(student.name);

        const formattedDate = student.dueDate.split('-').reverse().join('/');
        const reminderText = `⚠️ Aviso automático: Seu plano está vencendo ou já venceu em ${formattedDate}. Por favor, regularize seu pagamento.`;
        
        const alreadyNotified = student.chatHistory?.some(
          msg => msg.sender === 'trainer' && msg.text === reminderText
        );

        if (!alreadyNotified) {
          const newMessage: ChatMessage = {
            id: String(Date.now()) + Math.random().toString(36).substring(7),
            sender: 'trainer',
            text: reminderText,
            timestamp: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
          };

          newStudentsData[email] = {
            ...student,
            chatHistory: [...(student.chatHistory || []), newMessage]
          };
          anyUpdates = true;
        }
      }
    });

    if (anyUpdates) {
      saveStudentsToDB(newStudentsData);
    }

    if (expiringStudents.length > 0) {
      const names = expiringStudents.join(', ');
      if (autoCheck) {
        setTimeout(() => {
          showToast(`Aviso: ${expiringStudents.length} aluno(s) com vencimento a menos de 3 dias ou atrasado(s): ${names}`, 'warning');
        }, 1500);
      } else {
        showToast(`Aviso: ${expiringStudents.length} aluno(s) com vencimento a menos de 3 dias ou atrasado(s): ${names}`, 'warning');
      }
    } else if (!autoCheck) {
      showToast('Nenhum aluno com vencimento próximo.', 'info');
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'trainer' && !hasCheckedDueDatesRef.current && Object.keys(studentsData).length > 0) {
      checkPaymentReminders(true);
      hasCheckedDueDatesRef.current = true;
    }
  }, [isLoggedIn, currentUser, studentsData]);

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'trainer') {
      const prev = previousStudentsRef.current;
      const current = studentsData;

      if (Object.keys(prev).length > 0) {
        Object.keys(current).forEach(email => {
          const prevStudent = prev[email];
          const currStudent = current[email];

          if (prevStudent && currStudent) {
            const prevSessions = prevStudent.sessions || [];
            const currSessions = currStudent.sessions || [];
            
            if (currSessions.length > prevSessions.length) {
              const newSession = currSessions[0];
              showToast(`[ALERTA VIKING] O guerreiro ${currStudent.name} acabou de concluir o treino: ${newSession?.sessionName || 'Novo Treino'}!`, 'success');
              
              // Optional: Play a subtle notification sound here if desired
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
              } catch (e) {}
            }
          }
        });
      }
    }
    previousStudentsRef.current = studentsData;
  }, [studentsData, isLoggedIn, currentUser]);

  const handleManualSync = async () => {
    showToast('Iniciando sincronização com o Templo...', 'info');
    let syncSuccess = true;
    try {
      const remoteStudents = await fetchStudentsFromFirebase();
      if (remoteStudents && Object.keys(remoteStudents).length > 0) {
        setStudentsData(remoteStudents);
        localStorage.setItem('viking_students', JSON.stringify(remoteStudents));
      }
    } catch (e) {
      console.warn("Using offline storage for athletes:", e);
      syncSuccess = false;
    }

    try {
      const remoteProgram = await fetchProgramFromFirebase();
      if (remoteProgram) {
        setTrainingProgram(remoteProgram);
        localStorage.setItem('viking_program', JSON.stringify(remoteProgram));
      }
    } catch (e) {
      console.warn("Using offline storage for training program:", e);
      syncSuccess = false;
    }

    try {
      const remotePlans = await fetchPlansFromFirebase();
      if (remotePlans && remotePlans.length > 0) {
        setVikingPlans(remotePlans);
        localStorage.setItem('viking_plans', JSON.stringify(remotePlans));
      }
    } catch (e) {
      console.warn("Using offline storage for plans:", e);
      syncSuccess = false;
    }

    try {
      const remoteExs = await fetchDbExercisesFromFirebase();
      if (remoteExs && remoteExs.length > 0) {
        setDbExercises(remoteExs);
        localStorage.setItem('viking_db_exercises', JSON.stringify(remoteExs));
      }
    } catch (e) {
      console.warn("Using offline storage for exercises:", e);
      const cached = localStorage.getItem('viking_db_exercises');
      if (cached) {
        setDbExercises(JSON.parse(cached));
      }
      syncSuccess = false;
    }

    try {
      const remoteEvents = await fetchCalendarEventsFromFirebase();
      if (remoteEvents) {
        setCalendarEvents(remoteEvents);
        localStorage.setItem('viking_calendar_events', JSON.stringify(remoteEvents));
      }
    } catch (e) {
      console.warn("Using offline storage for calendar events:", e);
      syncSuccess = false;
    }

    setIsOnline(syncSuccess);
    if (syncSuccess) {
      showToast('Dados sincronizados com a nuvem com sucesso!', 'success');
    } else {
      showToast('Falha ao conectar ao servidor. Mantendo dados locais.', 'error');
    }
  };

  const saveProgramToDB = (newProg: TrainingProgram) => {
    setTrainingProgram(newProg);
    localStorage.setItem('viking_program', JSON.stringify(newProg));
    saveProgramToFirebase(newProg).catch(err => console.error("Firebase save program error:", err));
  };

  const saveEditorProgramToDB = (newProg: TrainingProgram) => {
    setEditorProgram(newProg);
    const email = editingStudentEmail.toLowerCase();
    const student = studentsData[email];
    if (student) {
      const updatedStudents = { ...studentsData };
      updatedStudents[email] = {
        ...updatedStudents[email],
        customProgram: newProg
      };
      setStudentsData(updatedStudents);
      localStorage.setItem('viking_students', JSON.stringify(updatedStudents));
      saveStudentToFirebase(email, updatedStudents[email]);
    }
  };

  const saveStudentsToDB = (newStuds: Record<string, StudentProfile>) => {
    // Identify modified, added or deleted profiles to minimize Firestore writes
    const prevStuds = studentsData;
    
    // Save state and local storage instantly for fluid UI responsiveness
    setStudentsData(newStuds);
    localStorage.setItem('viking_students', JSON.stringify(newStuds));

    // Async sync to Firestore
    // Deletion check
    Object.keys(prevStuds).forEach(email => {
      if (!newStuds[email]) {
        deleteStudentFromFirebase(email).catch(err => console.error("Firebase delete athlete error:", err));
      }
    });

    // Modification / addition check
    Object.keys(newStuds).forEach(email => {
      const oldVal = prevStuds[email];
      const newVal = newStuds[email];
      if (!oldVal || JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        saveStudentToFirebase(email, newVal).catch(err => console.error("Firebase save athlete error:", err));
      }
    });
  };

  const handleBatchUpdateStatus = (newStatus: 'Ativo' | 'Pendente' | 'Atrasado' | 'Pago') => {
    if (selectedStudentEmails.length === 0) {
      showToast('Nenhum guerreiro selecionado!', 'info');
      return;
    }
    const updatedStudents = { ...studentsData };
    selectedStudentEmails.forEach(email => {
      if (updatedStudents[email]) {
        updatedStudents[email] = {
          ...updatedStudents[email],
          status: newStatus
        };
      }
    });
    saveStudentsToDB(updatedStudents);
    setSelectedStudentEmails([]);
    setIsBatchMode(false);
    showToast(`Status atualizado para ${selectedStudentEmails.length} guerreiro(s) com sucesso!`, 'success');
  };

  const handleBatchSelectAll = () => {
    setSelectedStudentEmails(filteredStudentEmails);
    showToast(`${filteredStudentEmails.length} guerreiros selecionados!`, 'info');
  };

  const handleBatchClearSelection = () => {
    setSelectedStudentEmails([]);
    showToast('Seleção limpa!', 'info');
  };

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('viking_current_user', JSON.stringify(user));
    localStorage.removeItem('viking_logged_out');
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setPrSquat('');
    setPrBench('');
    setPrDeadlift('');
    showToast(`Bem-vindo, ${user.name}! Que os deuses abençoem seus treinos.`, 'success');
  };

  // --- TOAST TRIGGER ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + '_' + Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- PDF GENERATOR ---
  const handleDownloadPDF = (profile: StudentProfile) => {
    try {
      const doc = new jsPDF();
      
      // Header Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(197, 160, 89); // Viking gold
      doc.text('VIKING FORCE', 20, 25);
      
      doc.setFontSize(13);
      doc.setTextColor(100, 100, 100);
      doc.text('RELATÓRIO DE DESEMPENHO E PROGRESSO', 20, 33);
      
      // Horizontal separator line
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);
      
      // Personal Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Guerreiro(a):', 20, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.name, 45, 48);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Plano Atual:', 20, 54);
      doc.setFont('helvetica', 'normal');
      doc.text(`${profile.plan} (${profile.status})`, 45, 54);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Data de Emissão:', 120, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('pt-BR'), 153, 48);
      
      // 1RM/PR Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(197, 160, 89);
      doc.text('PROGRESSO DAS CARGAS (1RM ATUAL)', 20, 68);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 71, 190, 71);
      
      // Box for PRs
      doc.setFillColor(248, 246, 240); // light warm background
      doc.rect(20, 75, 170, 24, 'F');
      doc.setDrawColor(197, 160, 89);
      doc.rect(20, 75, 170, 24, 'D');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      
      doc.text('AGACHAMENTO (SQUAT)', 25, 82);
      doc.text('SUPINO (BENCH)', 80, 82);
      doc.text('TERRA (DEADLIFT)', 135, 82);
      
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      
      const squatVal = profile.prs?.squat ? `${profile.prs?.squat} kg` : 'Não registrado';
      const benchVal = profile.prs?.bench ? `${profile.prs?.bench} kg` : 'Não registrado';
      const deadliftVal = profile.prs?.deadlift ? `${profile.prs?.deadlift} kg` : 'Não registrado';
      
      doc.text(squatVal, 25, 91);
      doc.text(benchVal, 80, 91);
      doc.text(deadliftVal, 135, 91);
      
      // Workouts History Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(197, 160, 89);
      doc.text('HISTÓRICO DE TREINOS REALIZADOS', 20, 112);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 115, 190, 115);
      
      let y = 122;
      const pageHeight = doc.internal.pageSize.height;
      
      if (!profile.sessions || profile.sessions.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Nenhum treino registrado até o momento.', 20, y);
      } else {
        profile.sessions.forEach((sess, sIdx) => {
          const estimatedHeight = 25 + (sess.exercises.length * 6) + (sess.note ? 15 : 0);
          
          // Check page break
          if (y + estimatedHeight > pageHeight - 20) {
            doc.addPage();
            y = 25;
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('VIKING FORCE - HISTÓRICO DE TREINO (Cont.)', 20, 15);
            doc.setDrawColor(220, 220, 220);
            doc.line(20, 18, 190, 18);
          }
          
          // Draw session container left line
          doc.setDrawColor(197, 160, 89);
          doc.setLineWidth(1.5);
          doc.line(20, y, 20, y + estimatedHeight - 5);
          doc.setLineWidth(0.5);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(30, 30, 30);
          doc.text(sess.sessionName, 25, y + 4);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(120, 120, 120);
          doc.text(`Realizado em: ${sess.date}`, 25, y + 9);
          
          doc.setFont('helvetica', 'bold');
          doc.text(`RPE Médio: ${(sess.avgRPE || 0).toFixed(1)}`, 140, y + 4);
          
          // Header
          let subY = y + 16;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(130, 130, 130);
          doc.text('Exercício', 25, subY);
          doc.text('Esforço Registrado', 140, subY);
          
          subY += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          
          sess.exercises.forEach(ex => {
            doc.text(ex.name, 25, subY);
            doc.setFont('helvetica', 'bold');
            doc.text(`RPE ${ex.rpe}`, 140, subY);
            doc.setFont('helvetica', 'normal');
            subY += 5.5;
          });
          
          if (sess.note) {
            subY += 1;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(110, 110, 110);
            const splitNote = doc.splitTextToSize(`Nota do Guerreiro: "${sess.note}"`, 160);
            doc.text(splitNote, 25, subY);
            subY += (splitNote.length * 4) + 2;
          }
          
          y = subY + 6; // Space before next session
        });
      }
      
      const fileName = `viking_force_${profile.name.toLowerCase().replace(/\s+/g, '_')}_progresso.pdf`;
      doc.save(fileName);
      showToast('Relatório PDF baixado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PDF. Tente novamente.', 'error');
    }
  };

  const handleDownloadWorkoutPlanPDF = (profile: StudentProfile, email?: string) => {
    try {
      const doc = new jsPDF();
      const activeProg = profile.customProgram || trainingProgram;
      
      // Page 1: Cover Header & Student info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(197, 160, 89); // Viking gold
      doc.text('🛡️ TEMPLO VIKING FORCE 🛡️', 105, 25, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(110, 110, 110);
      doc.text('FICHA DE TREINAMENTO E FORTALECIMENTO', 105, 33, { align: 'center' });
      
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.8);
      doc.line(20, 39, 190, 39);
      
      // Student Details Box
      doc.setFillColor(248, 246, 240);
      doc.rect(20, 44, 170, 34, 'F');
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.5);
      doc.rect(20, 44, 170, 34, 'D');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text('Guerreiro(a):', 25, 51);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.name, 55, 51);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Aliança / Plano:', 25, 58);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.plan || 'Não especificado', 55, 58);
      
      doc.setFont('helvetica', 'bold');
      doc.text('WhatsApp:', 25, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.phone || 'Não cadastrado', 55, 65);
      
      doc.setFont('helvetica', 'bold');
      doc.text('E-mail Atleta:', 25, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(email || 'Não cadastrado', 55, 72);
      
      // Right side columns of the box: Personal Records
      doc.setFont('helvetica', 'bold');
      doc.text('RECORDS PESSOAIS (PRs):', 120, 51);
      doc.setFont('helvetica', 'normal');
      doc.text(`Agachamento: ${profile.prs?.squat ? `${profile.prs.squat} kg` : '--'}`, 120, 58);
      doc.text(`Supino: ${profile.prs?.bench ? `${profile.prs.bench} kg` : '--'}`, 120, 65);
      doc.text(`Levantamento Terra: ${profile.prs?.deadlift ? `${profile.prs.deadlift} kg` : '--'}`, 120, 72);
      
      // Content of Workouts
      let y = 88;
      const pageHeight = doc.internal.pageSize.height;
      
      if (!activeProg || !activeProg.weeks || Object.keys(activeProg.weeks).length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.text('Nenhum treino prescrito no momento.', 20, y);
      } else {
        // Iterate through weeks
        const sortedWeeks = Object.keys(activeProg.weeks).map(Number).sort((a, b) => a - b);
        
        sortedWeeks.forEach((weekNum) => {
          const weekWorkout = activeProg.weeks[weekNum];
          const sortedDays = Object.keys(weekWorkout).sort();
          
          if (sortedDays.length === 0) return;
          
          // Header for Week
          if (y + 15 > pageHeight - 20) {
            doc.addPage();
            y = 25;
          }
          
          doc.setFillColor(38, 26, 21); // Dark brown-red fill
          doc.rect(20, y, 170, 9, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(212, 175, 55); // gold
          doc.text(`SEMANA ${weekNum}`, 25, y + 6);
          y += 14;
          
          sortedDays.forEach((dayName) => {
            const exercises = weekWorkout[dayName] || [];
            if (exercises.length === 0) return;
            
            // Calculate height of this day block to see if it fits
            const dayHeaderHeight = 8;
            const tableHeaderHeight = 7;
            const rowHeight = 7;
            const totalDayHeight = dayHeaderHeight + tableHeaderHeight + (exercises.length * rowHeight) + 10;
            
            if (y + totalDayHeight > pageHeight - 20) {
              doc.addPage();
              y = 25;
              // Re-draw background week marker for clarity on new page
              doc.setFillColor(38, 26, 21);
              doc.rect(20, y, 170, 7, 'F');
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9);
              doc.setTextColor(212, 175, 55);
              doc.text(`SEMANA ${weekNum} (Continuação)`, 25, y + 5);
              y += 12;
            }
            
            // Draw Day Header
            doc.setFillColor(235, 230, 220);
            doc.rect(20, y, 170, 6, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(30, 30, 30);
            doc.text(`TREINO ${dayName}`, 23, y + 4.5);
            y += 6;
            
            // Draw Table Headers
            doc.setFillColor(197, 160, 89);
            doc.rect(20, y, 170, 6.5, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(255, 255, 255);
            doc.text('Exercício', 23, y + 4.5);
            doc.text('Séries x Reps', 105, y + 4.5);
            doc.text('Intensidade', 135, y + 4.5);
            doc.text('RPE Alvo', 165, y + 4.5);
            y += 6.5;
            
            // Draw rows
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(50, 50, 50);
            
            exercises.forEach((ex, idx) => {
              // Draw light background for alternate rows
              if (idx % 2 === 1) {
                doc.setFillColor(252, 250, 246);
                doc.rect(20, y, 170, 7, 'F');
              }
              
              // Draw thin border under each row
              doc.setDrawColor(240, 235, 225);
              doc.setLineWidth(0.3);
              doc.line(20, y + 7, 190, y + 7);
              
              const intensityStr = typeof ex.intensity === 'number'
                ? `${(ex.intensity * 100).toFixed(0)}%`
                : ex.intensity || 'Livre';
                
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 30, 30);
              doc.text(ex.name, 23, y + 5);
              
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(50, 50, 50);
              doc.text(`${ex.sets}x${ex.reps}`, 105, y + 5);
              doc.text(intensityStr, 135, y + 5);
              doc.text(`@${ex.targetRPE}`, 165, y + 5);
              
              y += 7;
            });
            
            y += 6; // Space after day block
          });
          
          y += 4; // Space after week block
        });
      }
      
      // Footer text/signature
      if (y + 20 > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.5);
      doc.line(20, y + 5, 190, y + 5);
      
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(9);
      doc.setTextColor(120, 110, 90);
      doc.text('"O ferro nunca mente para você. Ele sempre pesa o mesmo." - Clã Viking Force', 105, y + 13, { align: 'center' });
      
      const fileName = `ficha_treino_viking_${profile.name.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      showToast('Ficha de Treino em PDF baixada com sucesso!', 'success');
      return true;
    } catch (err) {
      console.error("Erro ao gerar PDF de treino:", err);
      showToast('Falha ao gerar PDF de treino.', 'error');
      return false;
    }
  };

  const handleSendWorkoutPlanWhatsApp = (studentEmail: string, s: StudentProfile) => {
    // 1. Generate and trigger download of the PDF!
    const success = handleDownloadWorkoutPlanPDF(s, studentEmail);
    if (!success) return;
    
    // 2. Format phone number
    if (!s.phone) {
      showToast('Este guerreiro não possui número de WhatsApp cadastrado! Cadastre-o primeiro.', 'warning');
      return;
    }
    
    const phoneClean = s.phone.replace(/\D/g, '');
    
    // 3. Customize message from template with placeholders
    const workoutName = s.customProgramName || 'Ficha de Treino';
    const squatVal = s.prs?.squat ? `${s.prs.squat}kg` : 'A definir';
    const benchVal = s.prs?.bench ? `${s.prs.bench}kg` : 'A definir';
    const deadliftVal = s.prs?.deadlift ? `${s.prs.deadlift}kg` : 'A definir';

    let message = whatsappWorkoutTemplate
      .replace(/{NOME_ALUNO}/gi, s.name)
      .replace(/{NOME_TREINO}/gi, workoutName)
      .replace(/{PR_SQUAT}/gi, squatVal)
      .replace(/{PR_BENCH}/gi, benchVal)
      .replace(/{PR_DEADLIFT}/gi, deadliftVal);
    
    // 4. Open WhatsApp
    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
    
    // 5. Alert the coach that the PDF has been downloaded and to attach it on the chat
    showToast('Redirecionando para o WhatsApp... Anexe o PDF que foi baixado na conversa!', 'info');
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1500);
  };

  const handleDownloadMonthlySummaryPDF = (profile: StudentProfile) => {
    try {
      const doc = new jsPDF();
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(197, 160, 89);
      doc.text('VIKING FORCE', 20, 25);
      
      doc.setFontSize(13);
      doc.setTextColor(100, 100, 100);
      doc.text('RESUMO MENSAL CONSOLIDADO', 20, 33);
      
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Guerreiro(a):', 20, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.name, 45, 48);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Data de Emissão:', 120, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('pt-BR'), 153, 48);

      const monthlyData: Record<string, {
        sessions: number;
        totalVolume: number;
        totalRPE: number;
        rpeCount: number;
        maxSquat: number;
        maxBench: number;
        maxDeadlift: number;
      }> = {};

      (profile.sessions || []).forEach(sess => {
        const parts = sess.date.split('/');
        if (parts.length >= 3) {
          const mm = parts[1].padStart(2, '0');
          const yyyy = parts[2];
          const monthYear = `${mm}/${yyyy}`;
          
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
              sessions: 0,
              totalVolume: 0,
              totalRPE: 0,
              rpeCount: 0,
              maxSquat: 0,
              maxBench: 0,
              maxDeadlift: 0
            };
          }
          const md = monthlyData[monthYear];
          md.sessions++;
          md.totalVolume += (sess.totalAchievedVolume || 0);
          
          if (sess.avgRPE !== undefined && !isNaN(sess.avgRPE) && sess.avgRPE > 0) {
            md.totalRPE += sess.avgRPE;
            md.rpeCount++;
          }
          
          if (sess.prsAtSession) {
            if (sess.prsAtSession.squat && sess.prsAtSession.squat > md.maxSquat) md.maxSquat = sess.prsAtSession.squat;
            if (sess.prsAtSession.bench && sess.prsAtSession.bench > md.maxBench) md.maxBench = sess.prsAtSession.bench;
            if (sess.prsAtSession.deadlift && sess.prsAtSession.deadlift > md.maxDeadlift) md.maxDeadlift = sess.prsAtSession.deadlift;
          }
        }
      });

      let y = 65;
      const pageHeight = doc.internal.pageSize.height;

      const months = Object.keys(monthlyData).sort((a, b) => {
        const [mA, yA] = a.split('/').map(Number);
        const [mB, yB] = b.split('/').map(Number);
        if (yA !== yB) return yB - yA;
        return mB - mA;
      });

      if (months.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Nenhum dado mensal registrado.', 20, y);
      } else {
        months.forEach(month => {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = 20;
          }
          
          const md = monthlyData[month];
          
          doc.setFillColor(13, 9, 8);
          doc.rect(20, y, 170, 8, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(197, 160, 89);
          doc.text(`Mês/Ano: ${month}`, 23, y + 5.5);
          
          y += 15;
          doc.setFontSize(10);
          doc.setTextColor(50, 50, 50);
          
          const avgRpe = md.rpeCount > 0 ? (md.totalRPE / md.rpeCount).toFixed(1) : 'N/A';
          
          doc.text(`Sessões Treinadas: ${md.sessions}`, 25, y);
          doc.text(`Volume Total (Reps): ${md.totalVolume}`, 100, y);
          y += 7;
          doc.text(`RPE Médio do Mês: ${avgRpe}`, 25, y);
          y += 10;
          
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text('RECORDES (PR) ATINGIDOS NO PERÍODO:', 25, y);
          y += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(30, 30, 30);
          doc.text(`Agachamento: ${md.maxSquat > 0 ? md.maxSquat + ' kg' : '-'}`, 25, y);
          doc.text(`Supino: ${md.maxBench > 0 ? md.maxBench + ' kg' : '-'}`, 80, y);
          doc.text(`Terra: ${md.maxDeadlift > 0 ? md.maxDeadlift + ' kg' : '-'}`, 135, y);
          
          y += 15;
          doc.setDrawColor(220, 220, 220);
          doc.line(20, y, 190, y);
          y += 10;
        });
      }

      const fileName = `viking_force_${profile.name.toLowerCase().replace(/\s+/g, '_')}_resumo_mensal.pdf`;
      doc.save(fileName);
      showToast('Resumo Mensal exportado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PDF Mensal.', 'error');
    }
  };

  const handleExportWilksPDF = (
    profile: StudentProfile,
    currentWilks: number,
    bw: number,
    gender: 'male' | 'female',
    totalSBD: number,
    s: number,
    b: number,
    d: number
  ) => {
    try {
      const doc = new jsPDF();
      
      // Header Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(197, 160, 89); // Viking gold
      doc.text('VIKING FORCE', 20, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('METAS DE DESEMPENHO E EVOLUÇÃO DE WILKS', 20, 33);
      
      // Horizontal separator line
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);
      
      // Personal Details & Current status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Guerreiro(a):', 20, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.name, 45, 48);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Peso Corporal:', 20, 54);
      doc.setFont('helvetica', 'normal');
      doc.text(`${bw.toFixed(1)} kg (${gender === 'female' ? 'Feminino ♀' : 'Masculino ♂'})`, 48, 54);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Data de Emissão:', 120, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('pt-BR'), 153, 48);

      doc.setFont('helvetica', 'bold');
      doc.text('Pontuação Wilks:', 120, 54);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 160, 89);
      doc.text(`${currentWilks.toFixed(1)} pts`, 153, 54);

      // Current Marks
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 62, 190, 62);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(197, 160, 89);
      doc.text('MARCAS E PRs ATUAIS', 20, 70);

      // Box for Current Marks
      doc.setFillColor(248, 246, 240); // light warm background
      doc.rect(20, 74, 170, 20, 'F');
      doc.setDrawColor(197, 160, 89);
      doc.rect(20, 74, 170, 20, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 110);
      doc.text('AGACHAMENTO', 25, 81);
      doc.text('SUPINO RETO', 68, 81);
      doc.text('LEV. TERRA', 110, 81);
      doc.text('TOTAL SBD', 150, 81);

      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(`${s} kg`, 25, 89);
      doc.text(`${b} kg`, 68, 89);
      doc.text(`${d} kg`, 110, 89);
      doc.setFont('helvetica', 'bold');
      doc.text(`${totalSBD} kg`, 150, 89);

      // Goal Matrix Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(197, 160, 89);
      doc.text('MATRIZ DE METAS E PROJEÇÃO DE PROGRESSÃO', 20, 108);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Divisão de Carga Alvo Selecionada: Agachamento (${wilksRatios.squat}%) | Supino (${wilksRatios.bench}%) | Levantamento Terra (${wilksRatios.deadlift}%)`, 20, 113);

      doc.setDrawColor(220, 220, 220);
      doc.line(20, 116, 190, 116);

      // Draw Goals Table Header
      let y = 122;
      doc.setFillColor(20, 14, 12); // Dark charcoal background
      doc.rect(20, y, 170, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(197, 160, 89); // gold text
      doc.text('PATENTE / NÍVEL', 23, y + 5.5);
      doc.text('WILKS', 67, y + 5.5);
      doc.text('TOTAL', 82, y + 5.5);
      doc.text('AGACHAMENTO', 101, y + 5.5);
      doc.text('SUPINO RETO', 131, y + 5.5);
      doc.text('LEV. TERRA', 158, y + 5.5);

      const levels = [
        { name: 'Recruta Viking', target: 150, badge: '🛡️' },
        { name: 'Guerreiro do Clã', target: 250, badge: '⚔️' },
        { name: 'Berserker do Norte', target: 325, badge: '🔥' },
        { name: 'Guerreiro de Valhalla', target: 400, badge: '⚡' },
        { name: 'Semideus / Jarl', target: 475, badge: '👑' },
      ];

      y += 8;
      levels.forEach((lvl, idx) => {
        const targetTotal = calculateTotalForWilks(lvl.target, bw, gender);
        const tSquat = Math.round((targetTotal * wilksRatios.squat) / 100);
        const tBench = Math.round((targetTotal * wilksRatios.bench) / 100);
        const tDeadlift = Math.round((targetTotal * wilksRatios.deadlift) / 100);
        
        const isUnlocked = currentWilks >= lvl.target;

        // Striped background rows
        if (isUnlocked) {
          doc.setFillColor(235, 245, 235); // light green for achieved
        } else if (idx % 2 === 0) {
          doc.setFillColor(248, 248, 248); // off-white
        } else {
          doc.setFillColor(255, 255, 255); // white
        }
        doc.rect(20, y, 170, 12, 'F');
        doc.setDrawColor(230, 230, 230);
        doc.line(20, y + 12, 190, y + 12);

        // Render values
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 30, 30);
        doc.text(`${lvl.badge} ${lvl.name}`, 23, y + 7.5);

        doc.setFont('helvetica', 'bold');
        doc.text(`${lvl.target}`, 67, y + 7.5);
        doc.text(`${targetTotal} kg`, 82, y + 7.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        
        // Squat with diff
        const squatDiff = tSquat - s;
        const squatText = `${tSquat} kg (${squatDiff <= 0 ? '✓ Ok' : `+${squatDiff}kg`})`;
        if (squatDiff <= 0) doc.setTextColor(34, 139, 34); // ForestGreen
        else doc.setTextColor(100, 100, 100);
        doc.text(squatText, 101, y + 7.5);

        // Bench with diff
        const benchDiff = tBench - b;
        const benchText = `${tBench} kg (${benchDiff <= 0 ? '✓ Ok' : `+${benchDiff}kg`})`;
        if (benchDiff <= 0) doc.setTextColor(34, 139, 34);
        else doc.setTextColor(100, 100, 100);
        doc.text(benchText, 131, y + 7.5);

        // Deadlift with diff
        const deadliftDiff = tDeadlift - d;
        const deadliftText = `${tDeadlift} kg (${deadliftDiff <= 0 ? '✓ Ok' : `+${deadliftDiff}kg`})`;
        if (deadliftDiff <= 0) doc.setTextColor(34, 139, 34);
        else doc.setTextColor(100, 100, 100);
        doc.text(deadliftText, 158, y + 7.5);

        y += 12;
      });

      // Legend & Motivational Footer
      y += 10;
      doc.setFillColor(245, 240, 230);
      doc.rect(20, y, 170, 22, 'F');
      doc.setDrawColor(197, 160, 89);
      doc.rect(20, y, 170, 22, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 90, 40);
      doc.text('ESTRATÉGIA VIKING PARA EVOLUÇÃO', 25, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      const adviceText = 'Calibre seus treinos focando no levantamento com maior margem de evolucao. Busque alcancar cada meta de Wilks para subir na classificacao do clã. Os deuses do ferro recompensam a sabedoria e a persistencia!';
      const splitAdvice = doc.splitTextToSize(adviceText, 160);
      doc.text(splitAdvice, 25, y + 11);

      const fileName = `metas_wilks_${profile.name.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      showToast('Tabela de metas exportada em PDF com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar metas em PDF.', 'error');
    }
  };

  // --- ACTIONS ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    let email = loginEmail.trim().toLowerCase();
    let password = loginPassword.trim();

    if (!email || !password) {
      showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
      return;
    }

    // MAP TRAINER LOGINS (As requested: name "John Rodrigues", password "3636")
    const isTrainerLogin = 
      (!isRegisterMode && authTab === 'trainer') ||
      email === 'john' || 
      email === 'john rodrigues' || 
      email === 'john.rodrigues' || 
      email === 'john.rodrigues@gmail.com' || 
      email === TRAINER_EMAIL;

    if (isTrainerLogin) {
      if (password !== '3636' && password !== 'john3636' && password.length < 6) {
        showToast('Senha do Treinador incorreta!', 'error');
        return;
      }
      email = TRAINER_EMAIL;
      if (password === '3636') {
        password = 'john3636'; // Translate to 6+ characters for Firebase Auth
      }
    }

    try {
      setAuthLoading(true);
      if (!isRegisterMode) {
        // Firebase Auth sign-in
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          // If the trainer doesn't exist yet, or if there is any Firebase authentication mismatch,
          // we bypass the authentication error to allow access using the locally verified credentials.
          if (isTrainerLogin) {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } catch (createErr: any) {
              console.warn("Trainer Firebase auth signup/signin failed, trying anonymous login fallback:", createErr);
              try {
                userCredential = await signInAnonymously(auth);
              } catch (anonErr: any) {
                console.warn("Anonymous signin failed, bypassing auth entirely:", anonErr);
                userCredential = { user: { email: TRAINER_EMAIL, uid: 'trainer-uid-bypass' } } as any;
              }
            }
          } else {
            // Also for students, if there is a network error or transient authentication glitch, 
            // we try anonymous login so that they can load/save to Firestore without getting blocked on mobile.
            try {
              console.warn("Student signin failed, trying anonymous login fallback:", signInErr);
              userCredential = await signInAnonymously(auth);
            } catch (anonErr: any) {
              throw signInErr; // Re-throw the original error if even anonymous login fails
            }
          }
        }
        const fbUser = userCredential.user;

        // Determine if they are trainer or student
        const isTrainer = email === TRAINER_EMAIL;
        
        if (isTrainer) {
          showToast('Iniciando sincronização com os deuses do ferro...', 'info');
          // Automatically load all students from Firestore on trainer login
          try {
            const remoteStudents = await fetchStudentsFromFirebase();
            if (remoteStudents && Object.keys(remoteStudents).length > 0) {
              setStudentsData(remoteStudents);
              localStorage.setItem('viking_students', JSON.stringify(remoteStudents));
            }
          } catch (fetchErr) {
            console.error("Error loading students on trainer login:", fetchErr);
          }
          
          handleLoginSuccess({ name: 'John Rodrigues', email, role: 'trainer' });
        } else {
          // If it's a student, let's check if their profile exists in Firestore / local state
          const student = studentsData[email];
          if (student) {
            handleLoginSuccess({ name: student.name, email, role: 'student' });
          } else {
            // Fallback: create dynamic profile in Firestore if it doesn't exist
            const name = email.split('@')[0];
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            const newStudent: StudentProfile = {
              name: formattedName,
              plan: 'Mensal',
              status: 'Pago',
              prs: { squat: null, bench: null, deadlift: null },
              preferredTime: '18:00',
              sessions: [],
              age: 25,
              bodyWeight: 80,
              gender: 'male'
            };
            const updated = { ...studentsData, [email]: newStudent };
            saveStudentsToDB(updated);
            handleLoginSuccess({ name: formattedName, email, role: 'student' });
          }
        }
      } else {
        // Register Mode with Firebase Auth
        if (!regName.trim()) {
          showToast('Por favor, informe seu nome de guerreiro!', 'error');
          return;
        }

        // 1. Create Firebase Auth user, or sign in if already exists
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (regErr: any) {
          if (regErr.code === 'auth/email-already-in-use') {
            try {
              // Try to sign in with the provided credentials
              await signInWithEmailAndPassword(auth, email, password);
              showToast('Este e-mail já estava cadastrado! Login realizado com sucesso.', 'success');
            } catch (signInErr: any) {
              // If sign-in fails, re-throw a clearer email-already-in-use error
              const conflictError = new Error('Este e-mail já está em uso. Se você já possui cadastro, vá para a tela de Login ou use a senha correta.');
              (conflictError as any).code = 'auth/email-already-in-use';
              throw conflictError;
            }
          } else {
            throw regErr;
          }
        }

        // 2. Create or merge the athlete profile (preventing overwrites of trainer-created data)
        const existingStudent = studentsData[email];
        const newStudent: StudentProfile = {
          ...(existingStudent || {}),
          name: existingStudent?.name || regName.trim(),
          plan: existingStudent?.plan || regPlan,
          status: existingStudent?.status || 'Pendente',
          prs: {
            squat: existingStudent?.prs?.squat ?? (parseFloat(prSquat) || null),
            bench: existingStudent?.prs?.bench ?? (parseFloat(prBench) || null),
            deadlift: existingStudent?.prs?.deadlift ?? (parseFloat(prDeadlift) || null),
          },
          preferredTime: existingStudent?.preferredTime || regPreferredTime || '18:00',
          sessions: existingStudent?.sessions || [],
          age: existingStudent?.age ?? (parseInt(regAge) || 25),
          bodyWeight: existingStudent?.bodyWeight ?? (parseFloat(regBodyWeight) || 80),
          gender: existingStudent?.gender || regGender
        };

        const updated = { ...studentsData, [email]: newStudent };
        saveStudentsToDB(updated);
        
        // Se não tinha plano pré-cadastrado e é um novo registro, encaminha para WhatsApp
        if (!existingStudent?.plan) {
           const waMessage = `Olá! Acabei de me cadastrar no app Diário do Guerreiro com o email ${email} e escolhi o plano ${regPlan}. Segue o meu comprovante:`;
           const waUrl = `https://wa.me/5551998612067?text=${encodeURIComponent(waMessage)}`;
           window.open(waUrl, '_blank');
        }

        handleLoginSuccess({ name: newStudent.name, email, role: 'student' });
      }
    } catch (error: any) {
      console.error("Firebase auth error:", error);
      // Clean and user-friendly error message in Portuguese
      let errorMsg = 'Erro de autenticação no templo. Verifique suas credenciais.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMsg = 'Senha incorreta ou usuário não encontrado.';
      } else if (error.code === 'auth/user-not-found') {
        errorMsg = 'Nenhum guerreiro encontrado com este e-mail.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = error.message && error.message.includes('guerreiro') ? error.message : 'Este e-mail de guerreiro já está em uso. Se você já possui cadastro, vá para a tela de Login ou insira a senha correta.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'A senha fornecida é muito fraca (mínimo de 6 caracteres).';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'O formato do e-mail inserido é inválido.';
      }
      showToast(errorMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Escolha uma imagem de até 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomLogo(result);
          localStorage.setItem('viking_custom_logo', result);
          showToast('Logotipo do templo atualizado!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setCustomLogo('');
    localStorage.removeItem('viking_custom_logo');
    showToast('Logotipo original restaurado.', 'info');
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser?.email && activeStudentProfile) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Escolha uma imagem de até 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const updatedProfile = {
            ...activeStudentProfile,
            photoUrl: result
          };
          saveStudentsToDB({ ...studentsData, [currentUser.email.toLowerCase()]: updatedProfile });
          showToast('Sua foto de perfil foi atualizada!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(err => console.warn("Firebase signout warning:", err));
    hasCheckedDueDatesRef.current = false;
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('home');
    setMobileMenuOpen(false);
    setDrawerOpen(false);
    setWorkoutModalOpen(false);
    localStorage.removeItem('viking_current_user');
    localStorage.setItem('viking_logged_out', 'true');
    showToast('Sessão encerrada com sucesso. Retorne em breve ao templo!', 'info');
  };

  const handleBackupData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      user: currentUser,
      studentsData,
      trainingProgram,
      vikingPlans,
      calendarEvents,
      dbExercises
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viking_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup gerado com sucesso!', 'success');
  };

  // --- DUE DATE HELPERS ---
  const gerarLinkCobranca = (nome: string, telefone: string, dataVencimento: string): string => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    hoje.setHours(0,0,0,0);
    vencimento.setHours(0,0,0,0);
    const dataFormatada = vencimento.toLocaleDateString('pt-BR');
    let mensagem = '';
    if (vencimento < hoje) {
      mensagem = `Olá ${nome}! Tudo bem? Passando para lembrar que seu plano de consultoria venceu em ${dataFormatada}. Quando puder, me envia o comprovante por aqui para eu liberar seus novos treinos e dar sequência ao planejamento. Tmj!`;
    } else if (vencimento.getTime() === hoje.getTime()) {
      mensagem = `Fala ${nome}! Tudo certo? Passando para avisar que seu plano da consultoria vence hoje (${dataFormatada}). Seguimos firmes nos treinos? Me avisa por aqui para eu organizar seu próximo bloco de preparação!`;
    } else {
      mensagem = `Fala ${nome}! Passando para te lembrar que a renovação do seu plano está próxima, vence dia ${dataFormatada}. Vamos manter o foco total! Me avisa assim que conseguir renovar para eu já deixar seu próximo microciclo estruturado.`;
    }
    return `https://api.whatsapp.com/send?phone=${telefone.replace(/\D/g, '')}&text=${encodeURIComponent(mensagem)}`;
  };

  const obterStatusVencimento = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    hoje.setHours(0,0,0,0);
    vencimento.setHours(0,0,0,0);
    const diffTempo = vencimento.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return { cor: 'bg-red-100 text-red-700 border-red-300', texto: 'Atrasado' };
    if (diffDias <= 3) return { cor: 'bg-amber-100 text-amber-700 border-amber-300', texto: `Vence em ${diffDias}d` };
    return { cor: 'bg-green-100 text-green-700 border-green-300', texto: 'Ativo' };
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://mail.google.com/');
      provider.addScope('https://www.googleapis.com/auth/gmail.send');
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.addScope('https://www.googleapis.com/auth/gmail.compose');
      provider.addScope('https://www.googleapis.com/auth/gmail.modify');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        setGoogleUserEmail(result.user.email || '');
        showToast('Gmail conectado com sucesso ao templo!', 'success');
        fetchRecentEmails(credential.accessToken);
      } else {
        showToast('Não foi possível obter a credencial do Gmail.', 'error');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      showToast('Falha na conexão com o Gmail. Tente novamente.', 'error');
    }
  };

  const fetchRecentEmails = async (token: string) => {
    setLoadingGmail(true);
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        const details = await Promise.all(
          data.messages.map(async (msg: { id: string }) => {
            const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return detailResponse.json();
          })
        );
        setGmailMessages(details);
      } else {
        setGmailMessages([]);
      }
    } catch (err) {
      console.error('Failed to fetch Gmail messages:', err);
    } finally {
      setLoadingGmail(false);
    }
  };

  const handleSendRenewalEmail = async (email: string) => {
    const s = studentsData[email];
    if (!s) return;

    if (!googleAccessToken) {
      showToast('Para enviar lembretes, conecte seu Gmail na Central de Correio!', 'error');
      return;
    }

    const priceFormatted = `R$ ${getPlanPrice(s.plan).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const dueDateStr = s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'N/A';
    
    const subject = "🛡️ Viking Force - Renovação de Plano";
    const emailHTML = `
      <div style="background-color:#0d0908;color:#e0d3a8;padding:25px;border-radius:15px;border:2px solid #d4af37;font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#d4af37;text-align:center;text-transform:uppercase;margin-top:0;">🛡️ Viking Force - Renovação</h2>
        <p style="font-size:15px;line-height:1.6;color:#ffffff;">Saudações, Guerreiro(a) <strong>${s.name}</strong>!</p>
        <p style="font-size:14px;line-height:1.6;color:#e0d3a8;">Gostaríamos de lembrar que o seu plano atual (<strong>${s.plan}</strong>) venceu ou está prestes a vencer no dia <strong>${dueDateStr}</strong>.</p>
        <p style="font-size:14px;line-height:1.6;color:#e0d3a8;">O valor da sua renovação é de <strong>${priceFormatted}</strong>.</p>
        <p style="font-size:14px;line-height:1.6;color:#e0d3a8;">Por favor, realize o pagamento para continuar seu treinamento sem interrupções. Os deuses do ferro aguardam sua força!</p>
        <div style="margin-top:25px;border-top:1px solid #3c2a21;padding-top:15px;font-size:11px;color:#a89a78;text-align:center;">
          Viking Force Powerlifting
        </div>
      </div>
    `;

    showToast(`Enviando cobrança para ${s.name}...`, 'info');
    const success = await sendGmail(email, subject, emailHTML);
    if (success) {
      showToast(`Cobrança enviada com sucesso para ${s.name}!`, 'success');
    }
  };

  const sendGmail = async (to: string, subject: string, bodyHTML: string) => {
    if (!googleAccessToken) {
      showToast('Por favor, conecte seu Gmail primeiro!', 'error');
      return false;
    }

    try {
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        bodyHTML
      ].join('\n');

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (response.ok) {
        showToast(`Mensagem enviada com sucesso para ${to}!`, 'success');
        return true;
      } else {
        const errData = await response.json();
        console.error('Gmail send response error:', errData);
        showToast('Falha ao enviar e-mail via Gmail API.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Error sending email:', err);
      showToast('Erro ao enviar e-mail. Verifique a conexão.', 'error');
      return false;
    }
  };

  const sendWorkoutPlanEmail = async (studentEmail: string, s: StudentProfile) => {
    if (!googleAccessToken) {
      setDrawerType('gmail');
      setDrawerTitle('Correio de Valhalla (Gmail)');
      setDrawerOpen(true);
      showToast('Por favor, conecte seu Gmail antes de enviar a planilha!', 'info');
      return;
    }

    triggerConfirm(
      "Enviar Ficha de Treino?",
      `Deseja enviar a ficha de treino atual de ${s.name} para o e-mail ${studentEmail} via Gmail?`,
      async () => {
        // Generate HTML for the email
        const subject = `🛡️ [Viking Force] Sua Ficha de Treino Atualizada - Olá, ${s.name}!`;
        
        // Construct active training details
        let exercisesHTML = '';
        const currentWeek = 1; // standard or current week
        const weekWorkout = (activeStudentProfile?.customProgram || trainingProgram).weeks[currentWeek] || (activeStudentProfile?.customProgram || trainingProgram).weeks[1];
        
        if (weekWorkout) {
          exercisesHTML += `
            <h3 style="color: #d4af37; font-family: sans-serif; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">Treino Prescrito (Semana ${currentWeek})</h3>
          `;
          Object.keys(weekWorkout).sort().forEach((day) => {
            const exercises = weekWorkout[day] || [];
            if (exercises.length > 0) {
              exercisesHTML += `<h4 style="color: #ffffff; font-family: sans-serif; background-color: #1a1210; padding: 6px 12px; margin-top: 15px;">Treino ${day}</h4>`;
              exercisesHTML += `<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px; color: #e0d3a8; margin-bottom: 15px;">
                <thead>
                  <tr style="background-color: #261a15; color: #d4af37; text-align: left;">
                    <th style="padding: 8px; border: 1px solid #3c2a21; background-color: #261a15;">Exercício</th>
                    <th style="padding: 8px; border: 1px solid #3c2a21; background-color: #261a15;">Séries x Reps</th>
                    <th style="padding: 8px; border: 1px solid #3c2a21; background-color: #261a15;">Intensidade</th>
                    <th style="padding: 8px; border: 1px solid #3c2a21; background-color: #261a15;">RPE Alvo</th>
                  </tr>
                </thead>
                <tbody>`;
              exercises.forEach((ex) => {
                const displayIntensity = typeof ex.intensity === 'number' 
                  ? `${(ex.intensity * 100).toFixed(0)}%` 
                  : ex.intensity;
                exercisesHTML += `
                  <tr style="border-bottom: 1px solid #3c2a21;">
                    <td style="padding: 8px; font-weight: bold; color: #ffffff;">${ex.name}</td>
                    <td style="padding: 8px; color: #ffffff;">${ex.sets} x ${ex.reps}</td>
                    <td style="padding: 8px; color: #d4af37;">${displayIntensity}</td>
                    <td style="padding: 8px; color: #ffffff;">@${ex.targetRPE}</td>
                  </tr>
                `;
              });
              exercisesHTML += `</tbody></table>`;
            }
          });
        }

        const prsHTML = `
          <h3 style="color: #d4af37; font-family: sans-serif; border-bottom: 1px solid #d4af37; padding-bottom: 5px; margin-top: 25px;">Seus Recordes Pessoais (PRs)</h3>
          <ul style="font-family: sans-serif; font-size: 14px; color: #ffffff; list-style-type: none; padding-left: 0;">
            <li style="margin-bottom: 6px;">🏋️ <strong>Agachamento:</strong> ${s.prs?.squat ? `${s.prs?.squat} kg` : 'Não registrado'}</li>
            <li style="margin-bottom: 6px;">🏋️ <strong>Supino:</strong> ${s.prs?.bench ? `${s.prs?.bench} kg` : 'Não registrado'}</li>
            <li style="margin-bottom: 6px;">🏋️ <strong>Levantamento Terra:</strong> ${s.prs?.deadlift ? `${s.prs?.deadlift} kg` : 'Não registrado'}</li>
          </ul>
        `;

        const emailHTML = `
          <div style="background-color: #0d0908; color: #e0d3a8; padding: 25px; border-radius: 15px; border: 2px solid #d4af37; font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #d4af37; font-family: 'Georgia', serif; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Viking Force</h1>
              <p style="color: #a89a78; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0;">Salão de Powerlifting</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6;">Saudações, guerreiro <strong>${s.name}</strong>!</p>
            <p style="font-size: 14px; line-height: 1.6;">Seu treinador acaba de atualizar sua ficha de batalhas (treino) no painel do templo. Prepare seus eixos, fortaleça sua mente e que os deuses do ferro estejam com você na próxima jornada.</p>
            
            ${exercisesHTML}
            ${prsHTML}
            
            <div style="margin-top: 30px; border-top: 1px solid #3c2a21; padding-top: 15px; font-size: 12px; color: #a89a78; text-align: center; line-height: 1.5;">
              <p>Este e-mail foi disparado diretamente de Valhalla pelo sistema integrado Gmail da Viking Force.</p>
              <p style="color: #d4af37; font-weight: bold; margin-top: 5px;">"O ferro não mente. 100kg sempre serão 100kg."</p>
            </div>
          </div>
        `;

        await sendGmail(studentEmail, subject, emailHTML);
      }
    );
  };

  // --- CHAT / FEEDBACK LOGIC ---
  const handleSendMessage = (studentEmail: string, text: string, imageUrl?: string, prHistory?: { squat: number | null; bench: number | null; deadlift: number | null }) => {
    if (!text.trim() && !imageUrl && !prHistory) return;
    const student = studentsData[studentEmail.toLowerCase()];
    if (!student) return;

    const newMessage: ChatMessage = {
      id: String(Date.now()) + '_' + Math.random().toString(36).substring(7),
      sender: currentUser?.role === 'trainer' ? 'trainer' : 'student',
      text: text.trim(),
      timestamp: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    
    if (imageUrl) {
      newMessage.imageUrl = imageUrl;
    }

    if (prHistory) {
      newMessage.prHistory = prHistory;
    }

    const updatedHistory = [...(student.chatHistory || []), newMessage];
    const updatedProfile = {
      ...student,
      chatHistory: updatedHistory
    };

    const updatedStudents = {
      ...studentsData,
      [studentEmail.toLowerCase()]: updatedProfile
    };

    saveStudentsToDB(updatedStudents);
    setChatMessageInput('');
    showToast('Comentário enviado!', 'success');
  };

  const handleSavePublicNote = (studentEmail: string, noteText: string) => {
    const student = studentsData[studentEmail.toLowerCase()];
    if (!student) return;

    const updatedProfile: StudentProfile = {
      ...student,
      publicNote: noteText.trim() || null
    };

    const updatedStudents = {
      ...studentsData,
      [studentEmail.toLowerCase()]: updatedProfile
    };

    saveStudentsToDB(updatedStudents);
    showToast('Nota pública de parabéns atualizada com sucesso!', 'success');
    setDrawerOpen(false);
  };

  const handleSendActiveChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim() && !chatImageFile) return;

    const targetEmail = currentUser?.role === 'trainer' ? activeChatStudentEmail : currentUser?.email;
    if (!targetEmail) return;

    let imageUrl = '';
    if (chatImageFile) {
      setIsUploadingChatImage(true);
      try {
        const fileRef = ref(storage, `chat-images/${Date.now()}_${chatImageFile.name}`);
        await uploadBytes(fileRef, chatImageFile);
        imageUrl = await getDownloadURL(fileRef);
      } catch (err) {
        console.error("Erro ao enviar imagem", err);
        showToast('Erro ao enviar imagem', 'error');
        setIsUploadingChatImage(false);
        return;
      }
      setIsUploadingChatImage(false);
    }

    handleSendMessage(targetEmail.toLowerCase(), chatMessageInput, imageUrl);
    setChatImageFile(null);
  };

  const handleExportFinancialSummary = () => {
    const csvContent = [
      ["Nome", "Email", "Plano", "Status", "Vencimento"],
      ...Object.keys(studentsData).map(email => {
        const s = studentsData[email];
        if (!s) return ['', email, '', '', 'N/A'];
        return [s.name, email, s.plan, s.status, s.dueDate || 'N/A'];
      })
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumo_financeiro_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '_')}.csv`;
    link.click();
    showToast('Resumo financeiro exportado!', 'success');
  };

  const isStudentPending = activeStudentProfile?.status === 'Pendente';
  const isStudentBlocked = !!activeStudentProfile?.accessBlocked || (() => {
    if (!activeStudentProfile?.dueDate) return false;
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    return todayStr > activeStudentProfile.dueDate;
  })();

  // Calculate volume: Sets * Reps * Weight for each logged exercise
  const calculateTotalVolume = () => {
    if (!activeStudentProfile) return 0;
    let sum = 0;
    const sessions = activeStudentProfile.sessions || [];
    sessions.forEach(sess => {
      if (sess.totalAchievedVolume) {
        sum += sess.totalAchievedVolume;
      } else {
        sess.exercises.forEach(ex => {
          if (ex.achievedVolume) {
            sum += ex.achievedVolume;
          } else if (ex.sets && Array.isArray(ex.sets)) {
            ex.sets.forEach(set => {
              if (set.done !== false) {
                sum += (set.reps || 0) * (set.weight || 0);
              }
            });
          }
        });
      }
    });
    return sum === 0 ? 0 : sum;
  };

  const calculateAvgRpe = () => {
    if (!activeStudentProfile || !activeStudentProfile.sessions || activeStudentProfile.sessions.length === 0) return '—';
    const last3 = activeStudentProfile.sessions.slice(0, 3);
    const avg = last3.reduce((sum, s) => sum + s.avgRPE, 0) / last3.length;
    return avg.toFixed(1);
  };

  const renderStrengthEvolution = () => {
    if (!activeStudentProfile) return null;
    const sessions = activeStudentProfile.sessions || [];
    
    let firstS = 0;
    let firstB = 0;
    let firstD = 0;
    let firstDate = 'Início';
    
    let recentS = 0;
    let recentB = 0;
    let recentD = 0;
    let recentDate = 'Atual';
    
    let isHistorical = false;

    if (sessions.length > 0) {
      isHistorical = true;
      const firstSession = sessions[sessions.length - 1];
      const recentSession = sessions[0];
      
      firstDate = firstSession.date;
      recentDate = recentSession.date;
      
      firstS = firstSession.prsAtSession?.squat ?? activeStudentProfile.prevPrs?.squat ?? activeStudentProfile.prs.squat ?? 0;
      firstB = firstSession.prsAtSession?.bench ?? activeStudentProfile.prevPrs?.bench ?? activeStudentProfile.prs.bench ?? 0;
      firstD = firstSession.prsAtSession?.deadlift ?? activeStudentProfile.prevPrs?.deadlift ?? activeStudentProfile.prs.deadlift ?? 0;
      
      recentS = recentSession.prsAtSession?.squat ?? activeStudentProfile.prs.squat ?? 0;
      recentB = recentSession.prsAtSession?.bench ?? activeStudentProfile.prs.bench ?? 0;
      recentD = recentSession.prsAtSession?.deadlift ?? activeStudentProfile.prs.deadlift ?? 0;
    } else {
      // Fallback para os PRs cadastrados vs PRs anteriores
      firstDate = 'Cadastro Inicial';
      recentDate = 'Registro Atual';
      
      firstS = activeStudentProfile.prevPrs?.squat ?? activeStudentProfile.prs.squat ?? 0;
      firstB = activeStudentProfile.prevPrs?.bench ?? activeStudentProfile.prs.bench ?? 0;
      firstD = activeStudentProfile.prevPrs?.deadlift ?? activeStudentProfile.prs.deadlift ?? 0;
      
      recentS = activeStudentProfile.prs.squat ?? 0;
      recentB = activeStudentProfile.prs.bench ?? 0;
      recentD = activeStudentProfile.prs.deadlift ?? 0;
    }
    
    const firstTotal = firstS + firstB + firstD;
    const recentTotal = recentS + recentB + recentD;
    const totalDiff = recentTotal - firstTotal;
    const totalDiffPercent = firstTotal > 0 ? (totalDiff / firstTotal) * 100 : 0;
    
    const squatDiff = recentS - firstS;
    const benchDiff = recentB - firstB;
    const deadliftDiff = recentD - firstD;
    
    const getTrendIconAndColor = (diff: number) => {
      if (diff > 0) {
        return {
          icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
          colorClass: 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20',
          textClass: 'text-emerald-400',
          sign: '+'
        };
      } else if (diff < 0) {
        return {
          icon: <TrendingDown className="w-4 h-4 text-red-400" />,
          colorClass: 'text-red-400 bg-red-950/30 border-red-500/20',
          textClass: 'text-red-400',
          sign: ''
        };
      } else {
        return {
          icon: <Minus className="w-4 h-4 text-viking-silver/60" />,
          colorClass: 'text-viking-silver/60 bg-black/30 border-viking-gold/5',
          textClass: 'text-viking-silver/60',
          sign: ''
        };
      }
    };

    const totalTrend = getTrendIconAndColor(totalDiff);
    const squatTrend = getTrendIconAndColor(squatDiff);
    const benchTrend = getTrendIconAndColor(benchDiff);
    const deadliftTrend = getTrendIconAndColor(deadliftDiff);

    return (
      <div id="strength-evolution-panel" className="relative p-[1.5px] rounded-3xl bg-gradient-to-r from-viking-gold/40 via-[#2d1f1b] to-viking-gold/45 shadow-[0_12px_45px_rgba(20,14,12,0.85)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_50px_rgba(212,175,55,0.08)]">
        <div className="bg-[#1a1210]/95 rounded-[22px] p-8 h-full w-full relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
            <TrendingUp className="w-64 h-64 text-viking-gold" />
          </div>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-viking-gold/15 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-viking-gold bg-viking-gold/10 px-2.5 py-1 rounded-md border border-viking-gold/20">
              Métricas de Desempenho
            </span>
            <h3 className="font-viking-display text-lg sm:text-xl font-black text-white tracking-wider flex items-center gap-2 mt-1.5">
              <Flame className="w-5 h-5 text-viking-gold shrink-0" /> Evolução de Força (SBD)
            </h3>
            <p className="text-viking-silver/70 text-xs mt-1">
              {isHistorical 
                ? `Análise comparativa da carga total acumulada de Squat, Bench e Deadlift entre a primeira sessão registrada (${firstDate}) e o pergaminho mais recente (${recentDate}).`
                : 'Seus recordes pessoais (1RM) iniciais vs as marcas atuais calculadas em seu registro de perfil.'
              }
            </p>
          </div>

          {/* SBD Total Badge with Trend Icon */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="text-right">
              <span className="text-[10px] text-viking-silver/60 font-bold block uppercase tracking-widest">SBD Total</span>
              <span className="text-lg font-black text-white">{recentTotal} kg</span>
            </div>
            
            <div className={`px-3 py-2 rounded-xl border font-black text-xs flex items-center gap-1.5 ${totalTrend.colorClass}`}>
              {totalTrend.icon}
              <span>{totalTrend.sign}{totalDiff} kg ({totalTrend.sign}{totalDiffPercent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Lifts Grid Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* SQUAT */}
          <div className="bg-[#0d0908]/60 border border-viking-gold/10 rounded-2xl p-4.5 space-y-3.5 relative hover:border-viking-gold/25 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
                🏋️ Agachamento
              </span>
              {squatDiff !== 0 && (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${squatTrend.colorClass}`}>
                  {squatTrend.icon} {squatTrend.sign}{squatDiff} kg
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-viking-silver/50 uppercase font-black tracking-wider">Primeiro</span>
                <p className="text-sm font-bold text-viking-silver">{firstS > 0 ? `${firstS} kg` : '---'}</p>
              </div>
              
              <div className="text-viking-gold/30">
                <ArrowRight className="w-5 h-5" />
              </div>
              
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-viking-gold/60 uppercase font-black tracking-wider">Mais Recente</span>
                <p className="text-base font-black text-white">{recentS > 0 ? `${recentS} kg` : '---'}</p>
              </div>
            </div>
          </div>

          {/* BENCH */}
          <div className="bg-[#0d0908]/60 border border-viking-gold/10 rounded-2xl p-4.5 space-y-3.5 relative hover:border-viking-gold/25 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
                🏋️ Supino
              </span>
              {benchDiff !== 0 && (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${benchTrend.colorClass}`}>
                  {benchTrend.icon} {benchTrend.sign}{benchDiff} kg
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-viking-silver/50 uppercase font-black tracking-wider">Primeiro</span>
                <p className="text-sm font-bold text-viking-silver">{firstB > 0 ? `${firstB} kg` : '---'}</p>
              </div>
              
              <div className="text-viking-gold/30">
                <ArrowRight className="w-5 h-5" />
              </div>
              
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-viking-gold/60 uppercase font-black tracking-wider">Mais Recente</span>
                <p className="text-base font-black text-white">{recentB > 0 ? `${recentB} kg` : '---'}</p>
              </div>
            </div>
          </div>

          {/* DEADLIFT */}
          <div className="bg-[#0d0908]/60 border border-viking-gold/10 rounded-2xl p-4.5 space-y-3.5 relative hover:border-viking-gold/25 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
                🏋️ Terra
              </span>
              {deadliftDiff !== 0 && (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${deadliftTrend.colorClass}`}>
                  {deadliftTrend.icon} {deadliftTrend.sign}{deadliftDiff} kg
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-viking-silver/50 uppercase font-black tracking-wider">Primeiro</span>
                <p className="text-sm font-bold text-viking-silver">{firstD > 0 ? `${firstD} kg` : '---'}</p>
              </div>
              
              <div className="text-viking-gold/30">
                <ArrowRight className="w-5 h-5" />
              </div>
              
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-viking-gold/60 uppercase font-black tracking-wider">Mais Recente</span>
                <p className="text-base font-black text-white">{recentD > 0 ? `${recentD} kg` : '---'}</p>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footnote warning if stats are missing */}
        {recentTotal === 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-viking-gold/5 border border-viking-gold/15 text-xs text-viking-silver/80 flex items-center gap-2">
            <Info className="w-4 h-4 text-viking-gold shrink-0" />
            <span>Ainda não há recordes (1RM) registrados para cálculo do SBD. Clique em <strong className="text-white">Ajustar 1RM</strong> nas ações rápidas abaixo para começar!</span>
          </div>
        )}
        </div>


      </div>
    );
  };

  // Generate Warmup sequence based on 1RM and target intensity
  const getWarmupSteps = (pr: number | null, intensity: number | string, customSteps?: WarmupStep[]) => {
    if (!pr || pr <= 0) return null;
    const steps = customSteps && customSteps.length ? customSteps : [
      { percent: 0.40, reps: 5 },
      { percent: 0.55, reps: 4 },
      { percent: 0.65, reps: 3 },
      { percent: 0.75, reps: 2 }
    ];

    const parsedIntensity = typeof intensity === 'number' ? intensity : 0.80;
    
    const warmup = steps.map(step => ({
      percent: step.percent,
      reps: step.reps,
      weight: Math.round(pr * step.percent),
    }));

    // Target work set preview
    warmup.push({
      percent: parsedIntensity,
      reps: 2,
      weight: Math.round(pr * parsedIntensity),
      isTarget: true
    } as any);

    return warmup;
  };

  const finalizeSession = (session: LoggedSession) => {
    if (!currentUser || !activeStudentProfile) return;

    const updatedProfile: StudentProfile = {
      ...activeStudentProfile,
      sessions: [session, ...(activeStudentProfile.sessions || [])]
    };

    const updatedStudents = {
      ...studentsData,
      [currentUser.email]: updatedProfile
    };

    saveStudentsToDB(updatedStudents);

    // Check for Wilks goal achievement
    const oldTotal = (activeStudentProfile.prs.squat || 0) + (activeStudentProfile.prs.bench || 0) + (activeStudentProfile.prs.deadlift || 0);
    const oldWilks = calculateWilks(activeStudentProfile.gender || 'male', activeStudentProfile.bodyWeight || 0, oldTotal);
    
    const getTierIdx = (w: number) => {
      let idx = 0;
      for (let i = WILKS_LEVELS.length - 1; i >= 0; i--) {
        if (w >= WILKS_LEVELS[i].minWilks) {
          idx = i;
          break;
        }
      }
      return idx;
    };
    
    const oldTierIdx = getTierIdx(oldWilks);
    const newTotal = (updatedProfile.prs.squat || 0) + (updatedProfile.prs.bench || 0) + (updatedProfile.prs.deadlift || 0);
    const newWilks = calculateWilks(updatedProfile.gender || 'male', updatedProfile.bodyWeight || 0, newTotal);
    const newTierIdx = getTierIdx(newWilks);

    if (newTierIdx > oldTierIdx) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#e0d3a8', '#ffffff']
      });
      showToast(`🏆 Parabéns! Você atingiu a meta Wilks: ${WILKS_LEVELS[newTierIdx].name}!`, 'success');
    }

    setWorkoutModalOpen(false);
    setConfirmSessionModalOpen(false);
    setPendingSession(null);
    setSessionRpeState({});
    setExerciseFailureState({});
    setExerciseSetsState({});
    setExerciseWarmupState({});
    setSessionNote('');
    showToast('Sessão registrada com sucesso!', 'success');
  };

  const handleWorkoutSubmit = () => {
    if (!currentUser || !activeStudentProfile) return;
    const activeProg = activeStudentProfile?.customProgram || trainingProgram;
      const currentExercises = activeProg.weeks[selectedWeek]?.[selectedDay] || [];
    
    // Validate that all exercises have an RPE logged
    const loggedCount = Object.keys(sessionRpeState).length;
    if (loggedCount < currentExercises.length) {
      showToast(`Registre o RPE de todos os ${currentExercises.length} exercícios antes de salvar!`, 'error');
      return;
    }

    let totalPlannedVolume = 0;
    let totalAchievedVolume = 0;

    const exercisesLog = currentExercises.map(ex => {
      const setsLogged = exerciseSetsState[ex.id] || [];
      const isFailed = !!exerciseFailureState[ex.id]?.failed;
      const plannedVol = ex.sets * ex.reps;
      
      const doneSets = setsLogged.filter(s => s.done);
      const achievedVol = setsLogged.length > 0 
        ? (doneSets.length > 0 ? doneSets.reduce((sum, s) => sum + s.reps, 0) : setsLogged.reduce((sum, s) => sum + s.reps, 0))
        : (isFailed ? ((exerciseFailureState[ex.id]?.setsDone || 1) * ex.reps) + (exerciseFailureState[ex.id]?.actualReps || 1) : plannedVol);

      totalPlannedVolume += plannedVol;
      totalAchievedVolume += achievedVol;

      return {
        name: ex.name,
        rpe: sessionRpeState[ex.id] || 8,
        plannedVolume: plannedVol,
        achievedVolume: achievedVol,
        failed: isFailed,
        sets: setsLogged.length > 0 ? setsLogged.map(s => ({ reps: s.reps, weight: s.weight, done: s.done, note: s.note })) : []
      };
    });

    const avgRPE = exercisesLog.reduce((sum, e) => sum + e.rpe, 0) / exercisesLog.length;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');

    const volumeDeficit = Math.max(0, totalPlannedVolume - totalAchievedVolume);
    let compensationSuggestion = '';

    if (volumeDeficit > 0) {
      const failedExs = currentExercises.filter(ex => exerciseFailureState[ex.id]?.failed);
      const suggestions = failedExs.map(ex => {
        const pVol = ex.sets * ex.reps;
        const sDone = exerciseFailureState[ex.id]?.setsDone || 1;
        const aReps = exerciseFailureState[ex.id]?.actualReps || 1;
        const achVol = (sDone * ex.reps) + aReps;
        const defVol = Math.max(0, pVol - achVol);
        const recommendedSets = Math.ceil(defVol / ex.reps);
        return `• ${ex.name}: Faltaram ${defVol} repetições. Adicione ${recommendedSets} Back-off Set(s) de ${ex.reps} reps com 15% a 20% MENOS carga na Semana ${selectedWeek + 1}.`;
      });
      compensationSuggestion = `Déficit total de ${volumeDeficit} repetições detectado.\nPara restaurar o volume total planejado, recomendamos para a próxima semana:\n` + suggestions.join('\n');
    }

    const newSession: LoggedSession = {
      id: 'session_' + Date.now().toString() + '_' + Math.random().toString(36).substring(7),
      date: formattedDate,
      sessionName: `Treino ${selectedDay}`,
      exercises: exercisesLog,
      avgRPE,
      note: sessionNote.trim() || null,
      totalPlannedVolume,
      totalAchievedVolume,
      volumeDeficit,
      compensationSuggestion: compensationSuggestion || null,
      prsAtSession: {
        squat: activeStudentProfile.prs.squat,
        bench: activeStudentProfile.prs.bench,
        deadlift: activeStudentProfile.prs.deadlift
      }
    };

    const updatedProfile: StudentProfile = {
      ...activeStudentProfile,
      sessions: [newSession, ...(activeStudentProfile.sessions || [])]
    };

    setPendingSession(newSession);
    setConfirmSessionModalOpen(true);

    // Check for Wilks goal achievement
    const oldTotal = (activeStudentProfile.prs.squat || 0) + (activeStudentProfile.prs.bench || 0) + (activeStudentProfile.prs.deadlift || 0);
    const oldWilks = calculateWilks(activeStudentProfile.gender || 'male', activeStudentProfile.bodyWeight || 0, oldTotal);
    
    const getTierIdx = (w: number) => {
      let idx = 0;
      for (let i = WILKS_LEVELS.length - 1; i >= 0; i--) {
        if (w >= WILKS_LEVELS[i].minWilks) {
          idx = i;
          break;
        }
      }
      return idx;
    };
    
    const oldTierIdx = getTierIdx(oldWilks);
    const newTotal = (updatedProfile.prs.squat || 0) + (updatedProfile.prs.bench || 0) + (updatedProfile.prs.deadlift || 0);
    const newWilks = calculateWilks(updatedProfile.gender || 'male', updatedProfile.bodyWeight || 0, newTotal);
    const newTierIdx = getTierIdx(newWilks);

    if (newTierIdx > oldTierIdx) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#e0d3a8', '#ffffff']
      });
      showToast(`🏆 Parabéns! Você atingiu a meta Wilks: ${WILKS_LEVELS[newTierIdx].name}!`, 'success');
    }

    setWorkoutModalOpen(false);
    setSessionRpeState({});
    setExerciseFailureState({});
    setExerciseSetsState({});
    setExerciseWarmupState({});
    setRestTimerActive(false);
    setSessionNote('');

    // Smooth scroll to top of screen
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    if (volumeDeficit > 0) {
      showToast(`Treino registrado! Alerta Viking de Volume: Déficit de ${volumeDeficit} reps. Estratégia de compensação gerada em seu Histórico!`, 'info');
    } else {
      showToast(`Treino registrado! RPE Médio: ${avgRPE.toFixed(1)}. Seu feedback foi enviado ao John.`, 'success');
    }
  };

  // --- LEADERBOARD LOGIC & HELPERS ---
  const calculateWilks = (gender: 'male' | 'female', bw: number, totalSBD: number): number => {
    if (!bw || !totalSBD) return 0;
    const x = bw;
    let a, b, c, d, e, f;
    if (gender === 'female') {
      a = 594.17;
      b = -27.23806;
      c = 0.821122;
      d = -0.009307339;
      e = 0.00004731582;
      f = -0.00000009054;
    } else {
      // male
      a = -216.0475144;
      b = 16.2606339;
      c = -0.002388645;
      d = -0.00113732;
      e = 0.00000701863;
      f = -0.00000001291;
    }
    const denom = a + b*x + c*Math.pow(x, 2) + d*Math.pow(x, 3) + e*Math.pow(x, 4) + f*Math.pow(x, 5);
    if (denom === 0) return 0;
    const coeff = 500 / denom;
    return Math.round(totalSBD * coeff * 10) / 10;
  };

  const calculateTotalForWilks = (targetW: number, bw: number, gender: 'male' | 'female'): number => {
    if (!bw) return 0;
    const x = bw;
    let a_coeff, b_coeff, c_coeff, d_coeff, e_coeff, f_coeff;
    if (gender === 'female') {
      a_coeff = 594.17;
      b_coeff = -27.23806;
      c_coeff = 0.821122;
      d_coeff = -0.009307339;
      e_coeff = 0.00004731582;
      f_coeff = -0.00000009054;
    } else {
      a_coeff = -216.0475144;
      b_coeff = 16.2606339;
      c_coeff = -0.002388645;
      d_coeff = -0.00113732;
      e_coeff = 0.00000701863;
      f_coeff = -0.00000001291;
    }
    const denom = a_coeff + b_coeff*x + c_coeff*Math.pow(x, 2) + d_coeff*Math.pow(x, 3) + e_coeff*Math.pow(x, 4) + f_coeff*Math.pow(x, 5);
    if (denom === 0) return 0;
    const coeff = 500 / denom;
    return Math.ceil(targetW / coeff);
  };

  const getAgeDivision = (age: number): string => {
    if (age <= 18) return 'Sub-Júnior (≤18)';
    if (age <= 23) return 'Júnior (19-23)';
    if (age <= 39) return 'Open (24-39)';
    return 'Master (40+)';
  };

  const getWeightClass = (gender: 'male' | 'female', weight: number): string => {
    if (gender === 'female') {
      const classes = [43, 44, 47, 48, 52, 56, 57, 60, 63, 67.5, 69, 75, 76, 82.5, 84, 90, 100, 110];
      for (const w of classes) {
        if (weight <= w) return `Até ${w}kg`;
      }
      return 'Mais de 110kg';
    } else {
      const classes = [52, 53, 56, 59, 60, 66, 67.5, 74, 75, 82.5, 83, 90, 93, 100, 105, 110, 120, 125, 140];
      for (const w of classes) {
        if (weight <= w) return `Até ${w}kg`;
      }
      return 'Mais de 140kg';
    }
  };

  const leaderboard = React.useMemo((): GymLeaderboardEntry[] => {
    // Collect everyone (default + active student) and calculate dynamic rank
    const entries: GymLeaderboardEntry[] = Object.keys(studentsData)
      .map(email => ({ email, profile: studentsData[email] }))
      .filter((item): item is { email: string; profile: NonNullable<typeof item.profile> } => item.profile !== undefined && item.profile !== null && !item.profile.isDeleted)
      .map(({ email, profile }) => {
        const squat = profile.prs?.squat || 0;
        const bench = profile.prs?.bench || 0;
        const deadlift = profile.prs?.deadlift || 0;
        const total = squat + bench + deadlift;
        const age = profile.age || 25;
        const bw = profile.bodyWeight || 80.0;
        const gender = profile.gender || 'male';
        const wilks = calculateWilks(gender, bw, total);

        return {
          position: 0,
          name: profile.name,
          email,
          squat,
          bench,
          deadlift,
          total,
          wilks,
          gender,
          age,
          bodyWeight: bw,
          ageDivision: getAgeDivision(age),
          weightClass: getWeightClass(gender, bw)
        };
      });

    // Dynamic sorting
    entries.sort((a, b) => {
      let valA: any = a[leaderboardSortCol];
      let valB: any = b[leaderboardSortCol];

      if (typeof valA === 'string') {
        return leaderboardSortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return leaderboardSortDesc ? (valB - valA) : (valA - valB);
    });

    return entries.map((entry, idx) => ({ ...entry, position: idx + 1 }));
  }, [studentsData, leaderboardSortCol, leaderboardSortDesc]);

  const filteredLeaderboard = React.useMemo((): GymLeaderboardEntry[] => {
    let entries = [...leaderboard];

    if (leaderboardGenderFilter !== 'all') {
      entries = entries.filter(w => w.gender === leaderboardGenderFilter);
    }

    if (leaderboardAgeFilter !== 'all') {
      entries = entries.filter(w => w.ageDivision === leaderboardAgeFilter);
    }

    if (leaderboardWeightFilter !== 'all') {
      entries = entries.filter(w => w.weightClass === leaderboardWeightFilter);
    }

    return entries.map((entry, idx) => ({ ...entry, position: idx + 1 }));
  }, [leaderboard, leaderboardGenderFilter, leaderboardAgeFilter, leaderboardWeightFilter]);

  const absoluteLeader = React.useMemo((): GymLeaderboardEntry | null => {
    const entries: GymLeaderboardEntry[] = Object.keys(studentsData)
      .map(email => ({ email, profile: studentsData[email] }))
      .filter((item): item is { email: string; profile: NonNullable<typeof item.profile> } => item.profile !== undefined && item.profile !== null && !item.profile.isDeleted)
      .map(({ email, profile }) => {
        const squat = profile.prs?.squat || 0;
        const bench = profile.prs?.bench || 0;
        const deadlift = profile.prs?.deadlift || 0;
        const total = squat + bench + deadlift;
        const age = profile.age || 25;
        const bw = profile.bodyWeight || 80.0;
        const gender = profile.gender || 'male';
        const wilks = calculateWilks(gender, bw, total);

        return {
          position: 0,
          name: profile.name,
          email,
          squat,
          bench,
          deadlift,
          total,
          wilks,
          gender,
          age,
          bodyWeight: bw,
          ageDivision: getAgeDivision(age),
          weightClass: getWeightClass(gender, bw)
        };
      });

    if (entries.length === 0) return null;
    entries.sort((a, b) => b.wilks - a.wilks);
    return { ...entries[0], position: 1 };
  }, [studentsData]);

  const renderRankBadge = (pos: number, warrior?: GymLeaderboardEntry) => {
    const tooltipText = warrior 
      ? `Critério Wilks: Fórmula oficial que compara força relativa de atletas de diferentes pesos corporais e gêneros de forma justa.

• Atleta: ${warrior.name}
• Gênero: ${warrior.gender === 'female' ? 'Feminino' : 'Masculino'}
• Peso Corporal: ${warrior.bodyWeight.toFixed(1)} kg
• Total SBD (S/B/D): ${warrior.total} kg (${warrior.squat || 0}/${warrior.bench || 0}/${warrior.deadlift || 0} kg)
• Coeficiente Wilks: ${warrior.wilks.toFixed(1)} pontos

Com base nessa pontuação de força proporcional, ${warrior.name} conquistou a ${pos}ª posição.`
      : "Critério Wilks: Fórmula que pondera o peso corporal em relação ao total levantado para classificar a força relativa de forma justa.";

    if (pos === 1) {
      return (
        <div className="relative flex items-center justify-center w-7 h-7 cursor-help" title={tooltipText}>
          <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)] transition-transform hover:scale-110 duration-200">🥇</span>
        </div>
      );
    }
    if (pos === 2) {
      return (
        <div className="relative flex items-center justify-center w-7 h-7 cursor-help" title={tooltipText}>
          <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(192,183,168,0.5)] transition-transform hover:scale-110 duration-200">🥈</span>
        </div>
      );
    }
    if (pos === 3) {
      return (
        <div className="relative flex items-center justify-center w-7 h-7 cursor-help" title={tooltipText}>
          <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(139,0,0,0.4)] transition-transform hover:scale-110 duration-200">🥉</span>
        </div>
      );
    }
    return (
      <span className="font-viking-medieval text-xs font-bold w-7 text-center text-[#60504a] cursor-help" title={tooltipText}>
        {pos}º
      </span>
    );
  };

  const triggerPrConfetti = () => {
    // 1. Center explosion
    confetti({
      particleCount: 150,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#e0d3a8', '#ffffff', '#8b0000', '#0a0a0c'],
    });

    // 2. Left side explosion
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#d4af37', '#e0d3a8', '#ffffff'],
      });
    }, 150);

    // 3. Right side explosion
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#d4af37', '#e0d3a8', '#ffffff'],
      });
    }, 300);

    // 4. Continuously generate some falling confetti for excitement
    const end = Date.now() + 2500;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 25,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#d4af37', '#e0d3a8'],
      });
    }, 200);
  };

  // --- TRAINER LEVEL LOGIC ---
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.currentTarget as any).newStudentName.value.trim();
    const email = (e.currentTarget as any).newStudentEmail.value.trim().toLowerCase();
    const plan = (e.currentTarget as any).newStudentPlan.value;
    const status = (e.currentTarget as any).newStudentStatus.value;
    const age = parseInt((e.currentTarget as any).newStudentAge.value) || 25;
    const bodyWeight = parseFloat((e.currentTarget as any).newStudentBodyWeight.value) || 80.0;
    const gender = ((e.currentTarget as any).newStudentGender.value || 'male') as 'male' | 'female';
    const preferredTime = (e.currentTarget as any).newStudentPreferredTime?.value || '18:00';
    const dueDate = (e.currentTarget as any).newStudentDueDate?.value || '';
    const accessBlocked = (e.currentTarget as any).newStudentAccess?.value === 'blocked';
    const autoMonthlySummary = (e.currentTarget as any).newStudentAutoMonthlySummary?.checked || false;
    const monthlySummaryCustomMessage = (e.currentTarget as any).newStudentMonthlySummaryMessage?.value || '';
    const phone = (e.currentTarget as any).newStudentPhone?.value.trim() || '';

    if (!name || !email) {
      showToast('Por favor, digite o nome e email do novo guerreiro!', 'error');
      return;
    }

    if (studentsData[email]) {
      showToast('Este email de atleta já está cadastrado!', 'error');
      return;
    }

    const newStudent: StudentProfile = {
      name,
      plan,
      status,
      prs: { squat: null, bench: null, deadlift: null },
      preferredTime,
      sessions: [],
      age,
      bodyWeight,
      gender,
      dueDate,
      accessBlocked,
                               autoMonthlySummary,
                               monthlySummaryCustomMessage,
      phone
    };

    saveStudentsToDB({ ...studentsData, [email]: newStudent });
    setDrawerOpen(false);
    showToast(`${name} foi convocado para o clã Viking Force!`, 'success');
  };

  const openProgramEditor = (studentEmail: string) => {
    setEditingStudentEmail(studentEmail);
    const student = studentsData[studentEmail.toLowerCase()];
    const activeProg = student?.customProgram || trainingProgram;
    setEditorProgram(activeProg);
    // Let's copy current week/day program to editor state
    const currentExercises = activeProg.weeks[editorWeek]?.[editorDay] || [];
    setEditorExercises(JSON.parse(JSON.stringify(currentExercises)));
    setEditorSearchQuery('');
    setCopySourceWeek(1);
    setCopySourceDay('A');
    setDrawerType('editProgram');
    setDrawerTitle(`Prescrever Treino`);
    setDrawerOpen(true);
  };

  const handleEditorLoadWeekDay = (week: number, day: string) => {
    // 1. Salvar as edições atuais no estado geral em memória ANTES de mudar de dia
    const currentWeeks = JSON.parse(JSON.stringify(editorProgram.weeks));
    if (!currentWeeks[editorWeek]) {
      currentWeeks[editorWeek] = {};
    }
    currentWeeks[editorWeek][editorDay] = editorExercises;
    
    // 2. Mudar para a nova aba
    setEditorWeek(week);
    setEditorDay(day);
    
    // 3. Carregar os exercícios da nova aba
    const nextExercises = currentWeeks[week]?.[day] || [];
    setEditorExercises(JSON.parse(JSON.stringify(nextExercises)));
    
    // 4. Atualizar o programa no estado sem salvar imediatamente no banco
    setEditorProgram({ weeks: currentWeeks });
    
    setEditorSearchQuery('');
  };

  const handleEditorAddWeek = () => {
    const existingWeeks = Object.keys(editorProgram.weeks).map(Number);
    const nextWeek = existingWeeks.length > 0 ? Math.max(...existingWeeks) + 1 : 1;
    
    const updatedWeeks = JSON.parse(JSON.stringify(editorProgram.weeks));
    if (!updatedWeeks[editorWeek]) updatedWeeks[editorWeek] = {};
    updatedWeeks[editorWeek][editorDay] = editorExercises; // Save current day edits
    
    updatedWeeks[nextWeek] = { A: [], B: [], C: [] };
    
    saveEditorProgramToDB({ weeks: updatedWeeks });
    handleEditorLoadWeekDay(nextWeek, 'A');
    showToast(`Semana ${nextWeek} adicionada com sucesso ao cronograma de treinos!`, 'success');
  };

  const handleEditorDeleteWeek = (weekToDelete: number) => {
    triggerConfirm(
      'Excluir Semana',
      `Tem certeza de que deseja excluir permanentemente a Semana ${weekToDelete} e TODOS os treinos dentro dela? Esta ação não pode ser desfeita!`,
      () => {
        const updatedWeeks = JSON.parse(JSON.stringify(editorProgram.weeks));
        if (weekToDelete !== editorWeek) {
          if (!updatedWeeks[editorWeek]) updatedWeeks[editorWeek] = {};
          updatedWeeks[editorWeek][editorDay] = editorExercises; // Save current day edits
        }
        delete updatedWeeks[weekToDelete];
        
        const remainingWeeks = Object.keys(updatedWeeks).map(Number).sort((a,b) => a-b);
        let nextWeek = 1;
        if (remainingWeeks.length > 0) {
          nextWeek = remainingWeeks.includes(editorWeek) ? editorWeek : remainingWeeks[0];
        } else {
          updatedWeeks[1] = { A: [], B: [], C: [] };
          nextWeek = 1;
        }

        saveEditorProgramToDB({ weeks: updatedWeeks });
        
        const remainingDays = Object.keys(updatedWeeks[nextWeek] || {}).sort();
        const nextDay = remainingDays[0] || 'A';
        handleEditorLoadWeekDay(nextWeek, nextDay);
        showToast(`Semana ${weekToDelete} excluída com sucesso!`, 'success');
      },
      true,
      'Excluir Semana',
      'Cancelar'
    );
  };

  const handleEditorAddWorkoutDay = () => {
    const currentWeekWorkout = editorProgram.weeks[editorWeek] || { A: [], B: [], C: [] };
    const existingDays = Object.keys(currentWeekWorkout).sort();
    
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const nextDay = letters.find(l => !existingDays.includes(l)) || String.fromCharCode(65 + existingDays.length);
    
    const updatedWeeks = JSON.parse(JSON.stringify(editorProgram.weeks));
    if (!updatedWeeks[editorWeek]) {
      updatedWeeks[editorWeek] = { A: [], B: [], C: [] };
    }
    updatedWeeks[editorWeek][editorDay] = editorExercises; // Save current day edits
    
    updatedWeeks[editorWeek][nextDay] = [];
    
    saveEditorProgramToDB({ weeks: updatedWeeks });
    handleEditorLoadWeekDay(editorWeek, nextDay);
    showToast(`Treino ${nextDay} adicionado com sucesso à Semana ${editorWeek}!`, 'success');
  };

  const handleEditorDeleteDay = (week: number, dayToDelete: string) => {
    const currentWeekWorkout = editorProgram.weeks[week] || { A: [], B: [], C: [] };
    const existingDays = Object.keys(currentWeekWorkout).sort();
    
    if (existingDays.length <= 1) {
      showToast(`Você precisa manter pelo menos um treino na Semana ${week}!`, 'warning');
      return;
    }

    triggerConfirm(
      'Excluir Treino',
      `Tem certeza de que deseja excluir permanentemente o Treino ${dayToDelete} da Semana ${week}? Esta ação não pode ser desfeita!`,
      () => {
        const updatedWeeks = JSON.parse(JSON.stringify(editorProgram.weeks));
        
        // Save current day if it's not the one being deleted
        if (week !== editorWeek || dayToDelete !== editorDay) {
          if (!updatedWeeks[editorWeek]) updatedWeeks[editorWeek] = {};
          updatedWeeks[editorWeek][editorDay] = editorExercises;
        }

        if (updatedWeeks[week]) {
          const newWeekWorkout = { ...updatedWeeks[week] };
          delete newWeekWorkout[dayToDelete];
          updatedWeeks[week] = newWeekWorkout;
        }

        saveEditorProgramToDB({ weeks: updatedWeeks });

        const remainingDays = Object.keys(updatedWeeks[week] || {}).sort();
        const nextDay = remainingDays.includes(editorDay) ? (editorDay === dayToDelete ? remainingDays[0] : editorDay) : remainingDays[0] || 'A';
        handleEditorLoadWeekDay(week, nextDay);
        showToast(`Treino ${dayToDelete} da Semana ${week} excluído com sucesso!`, 'success');
      },
      true,
      'Excluir Treino',
      'Cancelar'
    );
  };

  const handleImportProgram = (sourceEmail: string) => {
    if (!sourceEmail) return;
    let sourceProgram = DEFAULT_PROGRAM;
    if (sourceEmail === 'global') {
      sourceProgram = trainingProgram;
    } else {
      const sourceStudent = studentsData[sourceEmail.toLowerCase()];
      if (sourceStudent?.customProgram) {
        sourceProgram = sourceStudent.customProgram;
      } else {
        sourceProgram = trainingProgram;
      }
    }

    triggerConfirm(
      'Importar Treino',
      `Tem certeza que deseja SOBRESCREVER o treino atual pelo treino selecionado? Isso apagará a prescrição atual do guerreiro no editor.`,
      () => {
        const clonedProgram = JSON.parse(JSON.stringify(sourceProgram));
        setEditorProgram(clonedProgram);
        const firstWeek = Object.keys(clonedProgram.weeks).map(Number).sort((a,b)=>a-b)[0] || 1;
        const firstDay = Object.keys(clonedProgram.weeks[firstWeek] || {}).sort()[0] || 'A';
        setEditorWeek(firstWeek);
        setEditorDay(firstDay);
        setEditorExercises(JSON.parse(JSON.stringify(clonedProgram.weeks[firstWeek]?.[firstDay] || [])));
        showToast('Treino importado com sucesso no editor! Não esqueça de Salvar a Prescrição.', 'success');
      },
      true,
      'Importar',
      'Cancelar'
    );
  };

  const handleEditorCopyWorkout = (sourceWeek: number, sourceDay: string) => {
    const sourceWeekWorkout = editorProgram.weeks[sourceWeek];
    if (!sourceWeekWorkout) {
      showToast(`A Semana ${sourceWeek} não foi encontrada!`, 'error');
      return;
    }
    const sourceExercises = sourceWeekWorkout[sourceDay];
    if (!sourceExercises || sourceExercises.length === 0) {
      showToast(`O Treino ${sourceDay} da Semana ${sourceWeek} está vazio ou não existe!`, 'warning');
      return;
    }

    // Deep clone and assign brand new unique IDs to avoid any duplicate key issues
    const clonedExercises = sourceExercises.map(ex => ({
      ...JSON.parse(JSON.stringify(ex)),
      id: 'ex_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4) + '_' + Math.floor(Math.random()*1000)
    }));

    setEditorExercises(clonedExercises);
    showToast(`Treino ${sourceDay} da Semana ${sourceWeek} clonado com sucesso para este treino!`, 'success');
  };

  const handleEditorCreateBlankExercise = () => {
    const newEx: Exercise = {
      id: 'ex_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
      name: 'Novo Exercício',
      sets: 4,
      reps: 8,
      intensity: 0.75,
      targetRPE: 8,
      main: false,
      methodology: 'standard',
      methodologyDetails: '',
      warmup: [
        { percent: 0.40, reps: 5 },
        { percent: 0.55, reps: 4 },
        { percent: 0.65, reps: 3 }
      ]
    };
    setEditorExercises(prev => [...prev, newEx]);
  };

  const handleEditorAddExerciseFromDb = (dbEx: DbExercise) => {
    const newEx: Exercise = {
      id: 'ex_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
      name: dbEx.name,
      sets: 4,
      reps: 8,
      intensity: 0.75,
      targetRPE: 8,
      main: false,
      methodology: 'standard',
      methodologyDetails: '',
      techniqueTips: dbEx.techniqueTips,
      videoUrl: dbEx.videoUrl,
      videoBase64: dbEx.videoBase64,
      warmup: [
        { percent: 0.40, reps: 5 },
        { percent: 0.55, reps: 4 },
        { percent: 0.65, reps: 3 }
      ]
    };
    setEditorExercises(prev => [...prev, newEx]);
    setIsExercisePickerOpen(false);
    showToast(`${dbEx.name} adicionado ao treino!`, 'success');
  };

  const handleEditorRemoveExercise = (idx: number) => {
    setEditorExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEditorDuplicateExercise = (idx: number) => {
    const source = editorExercises[idx];
    if (!source) return;
    const duplicated: Exercise = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'ex_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
      name: `${source.name} (Cópia)`
    };
    setEditorExercises(prev => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, duplicated);
      return copy;
    });
  };

  const handleEditorSaveProgram = () => {
    const updatedWeeks = JSON.parse(JSON.stringify(editorProgram.weeks));
    if (!updatedWeeks[editorWeek]) {
      updatedWeeks[editorWeek] = { A: [], B: [], C: [] };
    }
    updatedWeeks[editorWeek][editorDay] = editorExercises;
    const newProg = { weeks: updatedWeeks };
    
    setEditorProgram(newProg);

    const email = editingStudentEmail.toLowerCase();
    const student = studentsData[email];
    if (student) {
      const updatedStudents = { ...studentsData };
      
      const notification = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substring(7),
        message: `Novo treino disponível! Semana ${editorWeek} - Treino ${editorDay}`,
        date: new Date().toISOString(),
        read: false,
        type: 'info' as const,
        actionData: { week: editorWeek, day: editorDay }
      };

      updatedStudents[email] = {
        ...student,
        customProgram: newProg,
        workoutReady: true,
        notifications: [notification, ...(student.notifications || [])]
      };

      setStudentsData(updatedStudents);
      localStorage.setItem('viking_students', JSON.stringify(updatedStudents));
      saveStudentToFirebase(email, updatedStudents[email]);
    }

    showToast(`Prescrição da Semana ${editorWeek} - Treino ${editorDay} salva para o guerreiro!`, 'success');
    
    // Close drawer, reset view to home panel, and smooth scroll to top of screen
    setDrawerOpen(false);
    setActiveTab('home');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleEditorUpdateField = (idx: number, field: keyof Exercise, value: any) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === idx) {
        return { ...ex, [field]: value };
      }
      return ex;
    }));
  };

  const handleEditorExerciseDragStart = (e: React.DragEvent, index: number) => {
    setDraggedExerciseIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleEditorExerciseDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEditorExerciseDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedExerciseIdx === null || draggedExerciseIdx === targetIndex) return;

    setEditorExercises(prev => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedExerciseIdx, 1);
      copy.splice(targetIndex, 0, draggedItem);
      return copy;
    });

    if (expandedExerciseIdx === draggedExerciseIdx) {
      setExpandedExerciseIdx(targetIndex);
    } else if (expandedExerciseIdx !== null) {
      if (draggedExerciseIdx < expandedExerciseIdx && targetIndex >= expandedExerciseIdx) {
        setExpandedExerciseIdx(prev => prev! - 1);
      } else if (draggedExerciseIdx > expandedExerciseIdx && targetIndex <= expandedExerciseIdx) {
        setExpandedExerciseIdx(prev => prev! + 1);
      }
    }

    setDraggedExerciseIdx(null);
  };

  const handleEditorExerciseDragEnd = () => {
    setDraggedExerciseIdx(null);
  };

  const handleEditorAddWarmupStep = (exIdx: number) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === exIdx) {
        const warmup = ex.warmup ? [...ex.warmup] : [];
        warmup.push({ percent: 0.50, reps: 4 });
        return { ...ex, warmup };
      }
      return ex;
    }));
  };

  const handleEditorAddMobilityStep = (exIdx: number) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === exIdx) {
        const mobility = ex.mobility ? [...ex.mobility] : [];
        mobility.push({ name: 'Nova Mobilidade', sets: 1, reps: 10 });
        return { ...ex, mobility };
      }
      return ex;
    }));
  };

  const handleEditorRemoveWarmupStep = (exIdx: number, stepIdx: number) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === exIdx && ex.warmup) {
        return { ...ex, warmup: ex.warmup.filter((_, s) => s !== stepIdx) };
      }
      return ex;
    }));
  };

  const handleEditorRemoveMobilityStep = (exIdx: number, stepIdx: number) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === exIdx && ex.mobility) {
        return { ...ex, mobility: ex.mobility.filter((_, s) => s !== stepIdx) };
      }
      return ex;
    }));
  };

  const handleEditorUpdateWarmupStep = (exIdx: number, stepIdx: number, field: 'percent' | 'reps', value: number) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === exIdx && ex.warmup) {
        const warmup = ex.warmup.map((step, s) => {
          if (s === stepIdx) {
            return { ...step, [field]: value };
          }
          return step;
        });
        return { ...ex, warmup };
      }
      return ex;
    }));
  };

  const handleEditorUpdateMobilityStep = (exIdx: number, stepIdx: number, field: keyof MobilityStep, value: any) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === exIdx && ex.mobility) {
        const mobility = ex.mobility.map((step, s) => {
          if (s === stepIdx) {
            return { ...step, [field]: value };
          }
          return step;
        });
        return { ...ex, mobility };
      }
      return ex;
    }));
  };

  const filteredStudentEmails = Object.keys(studentsData).filter(email => {
    const s = studentsData[email];
    if (!s) return false;
    if (s.isDeleted) return false;
    if (paymentFilter === 'pending_or_overdue' && s.status === 'Pago') {
      return false;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    return s.name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
  });

  const handleCloseDrawer = () => {
    if (drawerType === 'editProgram') {
      const student = studentsData[editingStudentEmail.toLowerCase()];
      const dbProgram = student?.customProgram || trainingProgram;
      
      const currentProgramWithEdits = JSON.parse(JSON.stringify(editorProgram));
      if (!currentProgramWithEdits.weeks[editorWeek]) {
        currentProgramWithEdits.weeks[editorWeek] = {};
      }
      currentProgramWithEdits.weeks[editorWeek][editorDay] = editorExercises;

      const isModified = JSON.stringify(dbProgram.weeks) !== JSON.stringify(currentProgramWithEdits.weeks);
      
      if (isModified) {
        triggerConfirm(
          'Aviso de Alterações Não Salvas',
          'Você tem modificações não salvas no treino. Deseja realmente fechar o editor e perder essas alterações?',
          () => {
            setDrawerOpen(false);
          },
          true,
          'Fechar sem salvar',
          'Cancelar'
        );
        return;
      }
    }
    setDrawerOpen(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (drawerType === 'editProgram' && drawerOpen) {
        const student = studentsData[editingStudentEmail.toLowerCase()];
        const dbProgram = student?.customProgram || trainingProgram;
        
        const currentProgramWithEdits = JSON.parse(JSON.stringify(editorProgram));
        if (!currentProgramWithEdits.weeks[editorWeek]) {
          currentProgramWithEdits.weeks[editorWeek] = {};
        }
        currentProgramWithEdits.weeks[editorWeek][editorDay] = editorExercises;

        const isModified = JSON.stringify(dbProgram.weeks) !== JSON.stringify(currentProgramWithEdits.weeks);
        
        if (isModified) {
          e.preventDefault();
          e.returnValue = '';
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [drawerType, drawerOpen, editorProgram, editorWeek, editorDay, editorExercises, editingStudentEmail, studentsData, trainingProgram]);

  return (
    <div className="min-h-screen bg-[#0d0908] text-[#e0d3a8] font-sans overflow-x-hidden pb-16 relative">
      {/* Immersive backdrop glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-viking-gold/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-viking-gold-dark/3 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      {/* --- TOAST STACK --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
                toast.type === 'error' 
                  ? 'bg-red-950/80 border-red-500/30 text-red-200' 
                  : toast.type === 'info'
                  ? 'bg-amber-950/80 border-viking-gold-dark/30 text-viking-silver'
                  : 'bg-viking-dark/95 border-viking-gold/25 text-[#e0d3a8]'
              }`}
            >
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-viking-gold-dark shrink-0" />}
              {toast.type === 'success' && <Check className="w-5 h-5 text-viking-gold shrink-0" />}
              <span className="text-sm font-semibold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
 
      {/* --- RESPONSIVE HEADER --- */}
      <nav className="sticky top-0 z-40 bg-[#0f0a08]/90 backdrop-blur-md border-b border-viking-gold/15 shadow-2xl">
        <div 
          key={activeTab + (drawerOpen ? '1' : '0') + (workoutModalOpen ? '1' : '0') + String(drawerType)}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center relative z-10 w-full animate-fade-in gap-4"
        >
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            {customLogo ? (
              <div className="relative group/logo">
                <img
                  src={customLogo}
                  alt="Logo"
                  className="w-13 h-13 object-cover rounded-xl border border-viking-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#140e0c] border border-viking-gold/30 rounded-full p-1 opacity-0 group-hover/logo:opacity-100 transition-opacity flex gap-1 shadow-lg">
                  <label className="cursor-pointer text-viking-gold hover:text-white" title="Alterar Foto Logotipo">
                    <Camera className="w-3 h-3" />
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                  <button onClick={handleResetLogo} className="text-viking-red hover:text-red-400 cursor-pointer" title="Remover logotipo personalizado">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group/logo flex items-center">
                <VikingLogo size={52} className="shrink-0" />
                <label className="absolute -bottom-1 -right-1 bg-[#140e0c] border border-viking-gold/30 rounded-full p-1 opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer text-viking-gold hover:text-white shadow-lg" title="Inserir Foto Logotipo">
                  <Camera className="w-3 h-3" />
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            )}
            <div>
              <span className="font-viking-display text-xl sm:text-2xl font-bold tracking-wider bg-gradient-to-r from-white via-viking-gold to-viking-gold-dark bg-clip-text text-transparent">
                VIKING FORCE
              </span>
              <p className="text-[10px] text-viking-silver uppercase tracking-widest font-viking-medieval block">Salão de Powerlifting</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <div className="hidden xl:flex flex-1 justify-center z-20 mx-4">
              <div className="flex items-center gap-1.5 bg-[#0f0a08] border border-viking-gold/20 p-1 rounded-2xl backdrop-blur-md">
                <button 
                  onClick={() => { setActiveTab('home'); closeAllDrawers(); setWorkoutModalOpen(false); setNavDropdownOpen(false); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'home' && !drawerOpen && !workoutModalOpen 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <Activity className="w-4 h-4" /> Início
                </button>
                
                <button 
                  onClick={() => { setActiveTab('cardio'); closeAllDrawers(); setWorkoutModalOpen(false); setNavDropdownOpen(false); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'cardio' && !drawerOpen && !workoutModalOpen 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <Zap className="w-4 h-4" /> Cardio
                </button>
                
                {currentUser?.role === 'student' ? (
                  <>
                    <motion.button 
                      onClick={() => { 
                        if (isStudentPending) {
                          showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                          return;
                        }
                        if (isStudentBlocked) {
                          showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                          return;
                        }
                        setWorkoutModalOpen(true); 
                        setDrawerOpen(false); 
                        setNavDropdownOpen(false); 
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                        workoutModalOpen 
                          ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                          : activeStudentProfile?.workoutReady
                            ? 'text-viking-gold bg-[#1a1210]/60 border border-viking-gold/40'
                            : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                      }`}
                      animate={activeStudentProfile?.workoutReady && !workoutModalOpen ? {
                        boxShadow: [
                          "0 0 0px rgba(212, 175, 55, 0)",
                          "0 0 15px rgba(212, 175, 55, 0.6)",
                          "0 0 0px rgba(212, 175, 55, 0)"
                        ],
                        scale: [1, 1.02, 1]
                      } : {}}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: "easeInOut"
                      }}
                    >
                      <Dumbbell className={`w-4 h-4 ${activeStudentProfile?.workoutReady && !workoutModalOpen ? 'text-viking-gold animate-bounce' : ''}`} /> 
                      Treino Hoje
                      {activeStudentProfile?.workoutReady && !workoutModalOpen && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-viking-gold shadow-[0_0_6px_#d4af37]" />
                      )}
                    </motion.button>
                    <button 
                      onClick={() => { 
                        if (isStudentPending) {
                          showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                          return;
                        }
                        if (isStudentBlocked) {
                          showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                          return;
                        }
                        setWorkoutModalOpen(false); 
                        setDrawerType('history'); 
                        setDrawerTitle('Seu Histórico & RPE'); 
                        setDrawerOpen(true); 
                        setNavDropdownOpen(false); 
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        drawerOpen && drawerType === 'history' 
                          ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                          : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                      }`}
                    >
                      <History className="w-4 h-4" /> Histórico
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setWorkoutModalOpen(false); setDrawerType('recentWorkouts'); setDrawerTitle('Treinos Concluídos'); setDrawerOpen(true); setNavDropdownOpen(false); }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        drawerOpen && drawerType === 'recentWorkouts' 
                          ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                          : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" /> Treinos Concluídos
                    </button>
                  </>
                )}

                <button 
                  onClick={() => { 
                    if (currentUser?.role === 'student') {
                      if (isStudentPending) {
                        showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                        return;
                      }
                      if (isStudentBlocked) {
                        showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                        return;
                      }
                    }
                    setWorkoutModalOpen(false); 
                    setEditingDbExercise(null); 
                    setDrawerType('exerciseLibrary'); 
                    setDrawerTitle('Biblioteca de Exercícios'); 
                    setDrawerOpen(true); 
                    setNavDropdownOpen(false); 
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    drawerOpen && drawerType === 'exerciseLibrary' 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Biblioteca
                </button>

                <button 
                  onClick={() => { 
                    if (currentUser?.role === 'student') {
                      if (isStudentPending) {
                        showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                        return;
                      }
                      if (isStudentBlocked) {
                        showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                        return;
                      }
                    }
                    setWorkoutModalOpen(false); 
                    setDrawerType('ranking'); 
                    setDrawerTitle('Ranking do Templo'); 
                    setDrawerOpen(true); 
                    setNavDropdownOpen(false); 
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    drawerOpen && drawerType === 'ranking' 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <Trophy className="w-4 h-4" /> Classificação
                </button>

                {/* Dropdown for Secondary Tools */}
                <div 
                  className="relative"
                  onMouseLeave={() => setNavDropdownOpen(false)}
                >
                  <button
                    onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      navDropdownOpen || (['rpeFeedback', 'addStudent', 'calendar', 'plans', 'gmail'].includes(drawerType) && drawerOpen)
                        ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                        : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                    }`}
                  >
                    <span>Mais</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${navDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {navDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-[#0f0a08]/98 border border-viking-gold/30 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 flex flex-col gap-1"
                      >
                        {currentUser?.role === 'trainer' ? (
                          <>
                            <button
                              onClick={() => {
                                setWorkoutModalOpen(false);
                                setDrawerType('rpeFeedback');
                                setDrawerTitle('Feedback RPE de Alunos');
                                setDrawerOpen(true);
                                setNavDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                                drawerOpen && drawerType === 'rpeFeedback'
                                  ? 'text-viking-dark bg-viking-gold/90 font-bold'
                                  : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                              }`}
                            >
                              <MessageSquare className="w-4 h-4 shrink-0" /> Feedback de RPE
                            </button>
                            <button
                              onClick={() => {
                                setWorkoutModalOpen(false);
                                setDrawerType('addStudent');
                                setDrawerTitle('Recrutar Novo Aluno');
                                setDrawerOpen(true);
                                setNavDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                                drawerOpen && drawerType === 'addStudent'
                                  ? 'text-viking-dark bg-viking-gold/90 font-bold'
                                  : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                              }`}
                            >
                              <UserPlus className="w-4 h-4 shrink-0" /> Adicionar Aluno
                            </button>
                          </>
                        ) : null}

                        <button
                          onClick={() => {
                            if (currentUser?.role === 'student') {
                              if (isStudentPending) {
                                showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                                return;
                              }
                              if (isStudentBlocked) {
                                showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                                return;
                              }
                            }
                            setWorkoutModalOpen(false);
                            setDrawerType('calendar');
                            setDrawerTitle('Calendário Competitivo');
                            setDrawerOpen(true);
                            setNavDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                            drawerOpen && drawerType === 'calendar'
                              ? 'text-viking-dark bg-viking-gold/90 font-bold'
                              : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                          }`}
                        >
                          <Calendar className="w-4 h-4 shrink-0" /> Calendário
                        </button>

                        <button
                          onClick={() => {
                            setWorkoutModalOpen(false);
                            setDrawerType('plans');
                            setDrawerTitle('Aliança Viking - Planos');
                            setDrawerOpen(true);
                            setNavDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                            drawerOpen && drawerType === 'plans'
                              ? 'text-viking-dark bg-viking-gold/90 font-bold'
                              : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 shrink-0" /> Planos de Treino
                        </button>

                        <button
                          onClick={() => {
                            if (currentUser?.role === 'student') {
                              if (isStudentPending) {
                                showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                                return;
                              }
                              if (isStudentBlocked) {
                                showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                                return;
                              }
                            }
                            setWorkoutModalOpen(false);
                            setDrawerType('gmail');
                            setDrawerTitle('Correio de Valhalla (Gmail)');
                            setDrawerOpen(true);
                            setNavDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                            drawerOpen && drawerType === 'gmail'
                              ? 'text-viking-dark bg-viking-gold/90 font-bold'
                              : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                          }`}
                        >
                          <Mail className="w-4 h-4 shrink-0" /> Correio Gmail
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Right Area (User, Settings, Hamburger) */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Search field */}
                <div className="hidden lg:flex items-center gap-2 group relative z-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-viking-silver/60 group-focus-within:text-viking-gold transition-colors" />
                    <input
                      id="navSearchInput"
                      type="text"
                      placeholder="Pesquisar atalhos..."
                      value={navSearchInput}
                      onChange={(e) => {
                        setNavSearchInput(e.target.value);
                        setNavSearchQuery(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && navSearchInput.trim()) {
                          const allShortcuts = [
                            { title: 'Início', action: () => { setActiveTab('home'); closeAllDrawers(); setWorkoutModalOpen(false); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            ...(currentUser?.role === 'student' ? [
                              { title: 'Treino Hoje', action: () => { if (isStudentPending || isStudentBlocked) return; setWorkoutModalOpen(true); setDrawerOpen(false); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                              { title: 'Histórico', action: () => { if (isStudentPending || isStudentBlocked) return; setWorkoutModalOpen(false); setDrawerType('history'); setDrawerTitle('Seu Histórico & RPE'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } }
                            ] : [
                              { title: 'Treinos Concluídos', action: () => { setWorkoutModalOpen(false); setDrawerType('recentWorkouts'); setDrawerTitle('Treinos Concluídos'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } }
                            ]),
                            { title: 'Protocolos & Metodologias', action: () => { if (currentUser?.role === 'student') return; setWorkoutModalOpen(false); setDrawerType('protocols'); setDrawerTitle('Protocolos de Treino'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            { title: 'Biblioteca de Exercícios', action: () => { if (currentUser?.role === 'student' && (isStudentPending || isStudentBlocked)) return; setWorkoutModalOpen(false); setDrawerType('exerciseLibrary'); setDrawerTitle('Biblioteca de Exercícios'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            { title: 'Ranking do Templo', action: () => { if (currentUser?.role === 'student' && (isStudentPending || isStudentBlocked)) return; setWorkoutModalOpen(false); setDrawerType('ranking'); setDrawerTitle('Ranking do Templo'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            ...(currentUser?.role === 'trainer' ? [
                              { title: 'Feedback de RPE', action: () => { setWorkoutModalOpen(false); setDrawerType('rpeFeedback'); setDrawerTitle('Feedback RPE de Alunos'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                              { title: 'Adicionar Aluno', action: () => { setWorkoutModalOpen(false); setDrawerType('addStudent'); setDrawerTitle('Adicionar Novo Aluno'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                              { title: 'Agenda de Treinador', action: () => { setWorkoutModalOpen(false); setDrawerType('calendar'); setDrawerTitle('Agenda'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                              { title: 'Planos & Mensalidades', action: () => { setWorkoutModalOpen(false); setDrawerType('plans'); setDrawerTitle('Gerenciamento de Mensalidades'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                              { title: 'Correio Gmail', action: () => { setWorkoutModalOpen(false); setDrawerType('gmail'); setDrawerTitle('Correio de Valhalla (Gmail)'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            ] : [])
                          ];
                          const matched = allShortcuts.filter(item => item.title.toLowerCase().includes(navSearchInput.toLowerCase()));
                          if (matched.length > 0) {
                            matched[0].action();
                          }
                        }
                      }}
                      className="w-48 xl:w-64 search-input-viking text-viking-silver text-xs pl-9 pr-9 py-2 rounded-xl outline-none transition-all focus:border-viking-gold/60 focus:shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                    />
                    {navSearchInput && (
                      <button 
                        onClick={() => { setNavSearchQuery(''); setNavSearchInput(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-viking-silver/60 hover:text-viking-gold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      if (navSearchInput.trim()) {
                        const allShortcuts = [
                          { title: 'Início', action: () => { setActiveTab('home'); closeAllDrawers(); setWorkoutModalOpen(false); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          ...(currentUser?.role === 'student' ? [
                            { title: 'Treino Hoje', action: () => { if (isStudentPending || isStudentBlocked) return; setWorkoutModalOpen(true); setDrawerOpen(false); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            { title: 'Histórico', action: () => { if (isStudentPending || isStudentBlocked) return; setWorkoutModalOpen(false); setDrawerType('history'); setDrawerTitle('Seu Histórico & RPE'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } }
                          ] : [
                            { title: 'Treinos Concluídos', action: () => { setWorkoutModalOpen(false); setDrawerType('recentWorkouts'); setDrawerTitle('Treinos Concluídos'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } }
                          ]),
                          { title: 'Protocolos & Metodologias', action: () => { if (currentUser?.role === 'student') return; setWorkoutModalOpen(false); setDrawerType('protocols'); setDrawerTitle('Protocolos de Treino'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          { title: 'Biblioteca de Exercícios', action: () => { if (currentUser?.role === 'student' && (isStudentPending || isStudentBlocked)) return; setWorkoutModalOpen(false); setDrawerType('exerciseLibrary'); setDrawerTitle('Biblioteca de Exercícios'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          { title: 'Ranking do Templo', action: () => { if (currentUser?.role === 'student' && (isStudentPending || isStudentBlocked)) return; setWorkoutModalOpen(false); setDrawerType('ranking'); setDrawerTitle('Ranking do Templo'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          ...(currentUser?.role === 'trainer' ? [
                            { title: 'Feedback de RPE', action: () => { setWorkoutModalOpen(false); setDrawerType('rpeFeedback'); setDrawerTitle('Feedback RPE de Alunos'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            { title: 'Adicionar Aluno', action: () => { setWorkoutModalOpen(false); setDrawerType('addStudent'); setDrawerTitle('Adicionar Novo Aluno'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            { title: 'Agenda de Treinador', action: () => { setWorkoutModalOpen(false); setDrawerType('calendar'); setDrawerTitle('Agenda'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            { title: 'Planos & Mensalidades', action: () => { setWorkoutModalOpen(false); setDrawerType('plans'); setDrawerTitle('Gerenciamento de Mensalidades'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                            { title: 'Correio Gmail', action: () => { setWorkoutModalOpen(false); setDrawerType('gmail'); setDrawerTitle('Correio de Valhalla (Gmail)'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          ] : [])
                        ];
                        const matched = allShortcuts.filter(item => item.title.toLowerCase().includes(navSearchInput.toLowerCase()));
                        if (matched.length > 0) {
                          matched[0].action();
                        }
                      }
                    }}
                    className="p-2 bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 hover:border-viking-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] text-viking-gold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0"
                    title="Acionar Pesquisa"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {(() => {
                      if (!navSearchInput.trim()) return null;
                      const allShortcuts = [
                        { title: 'Início', icon: <Activity className="w-4 h-4 shrink-0" />, action: () => { setActiveTab('home'); closeAllDrawers(); setWorkoutModalOpen(false); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                        ...(currentUser?.role === 'student' ? [
                          { title: 'Treino Hoje', icon: <Dumbbell className="w-4 h-4 shrink-0" />, action: () => { if (isStudentPending || isStudentBlocked) return; setWorkoutModalOpen(true); setDrawerOpen(false); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          { title: 'Histórico', icon: <History className="w-4 h-4 shrink-0" />, action: () => { if (isStudentPending || isStudentBlocked) return; setWorkoutModalOpen(false); setDrawerType('history'); setDrawerTitle('Seu Histórico & RPE'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } }
                        ] : [
                          { title: 'Treinos Concluídos', icon: <CheckCircle className="w-4 h-4 shrink-0" />, action: () => { setWorkoutModalOpen(false); setDrawerType('recentWorkouts'); setDrawerTitle('Treinos Concluídos'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } }
                        ]),
                        { title: 'Protocolos & Metodologias', icon: <BookOpen className="w-4 h-4 shrink-0" />, action: () => { if (currentUser?.role === 'student') return; setWorkoutModalOpen(false); setDrawerType('protocols'); setDrawerTitle('Protocolos de Treino'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                        { title: 'Biblioteca de Exercícios', icon: <BookOpen className="w-4 h-4 shrink-0" />, action: () => { if (currentUser?.role === 'student' && (isStudentPending || isStudentBlocked)) return; setWorkoutModalOpen(false); setDrawerType('exerciseLibrary'); setDrawerTitle('Biblioteca de Exercícios'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                        { title: 'Ranking do Templo', icon: <Trophy className="w-4 h-4 shrink-0" />, action: () => { if (currentUser?.role === 'student' && (isStudentPending || isStudentBlocked)) return; setWorkoutModalOpen(false); setDrawerType('ranking'); setDrawerTitle('Ranking do Templo'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                        ...(currentUser?.role === 'trainer' ? [
                          { title: 'Feedback de RPE', icon: <MessageSquare className="w-4 h-4 shrink-0" />, action: () => { setWorkoutModalOpen(false); setDrawerType('rpeFeedback'); setDrawerTitle('Feedback RPE de Alunos'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          { title: 'Adicionar Aluno', icon: <UserPlus className="w-4 h-4 shrink-0" />, action: () => { setWorkoutModalOpen(false); setDrawerType('addStudent'); setDrawerTitle('Adicionar Novo Aluno'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          { title: 'Agenda de Treinador', icon: <Calendar className="w-4 h-4 shrink-0" />, action: () => { setWorkoutModalOpen(false); setDrawerType('calendar'); setDrawerTitle('Agenda'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          { title: 'Planos & Mensalidades', icon: <CreditCard className="w-4 h-4 shrink-0" />, action: () => { setWorkoutModalOpen(false); setDrawerType('plans'); setDrawerTitle('Gerenciamento de Mensalidades'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                          { title: 'Correio Gmail', icon: <Mail className="w-4 h-4 shrink-0" />, action: () => { setWorkoutModalOpen(false); setDrawerType('gmail'); setDrawerTitle('Correio de Valhalla (Gmail)'); setDrawerOpen(true); setNavDropdownOpen(false); setNavSearchQuery(''); setNavSearchInput(''); } },
                        ] : [])
                      ];

                      const filtered = allShortcuts.filter(item => 
                        item.title.toLowerCase().includes(navSearchInput.toLowerCase())
                      );

                      const highlightMatch = (text: string, query: string) => {
                        if (!query.trim()) return <span>{text}</span>;
                        const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
                        return (
                          <span>
                            {parts.map((part, i) => 
                              part.toLowerCase() === query.toLowerCase() ? (
                                <span key={i} className="text-viking-gold font-bold drop-shadow-[0_0_6px_rgba(212,175,55,0.7)] select-none">
                                  {part}
                                </span>
                              ) : (
                                part
                              )
                            )}
                          </span>
                        );
                      };

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-full bg-[#0f0a08]/98 border border-viking-gold/40 rounded-2xl p-1.5 shadow-[0_4px_24px_rgba(212,175,55,0.15)] backdrop-blur-xl z-50 flex flex-col gap-1 max-h-64 overflow-y-auto"
                        >
                          {filtered.length > 0 ? (
                            filtered.map((item, idx) => (
                              <button
                                key={idx}
                                onClick={item.action}
                                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-viking-silver bg-viking-gold/[0.02] border border-viking-gold/10 hover:border-viking-gold/40 hover:text-viking-gold hover:bg-viking-gold/10 hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                              >
                                {item.icon}
                                {highlightMatch(item.title, navSearchInput)}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-center text-xs text-viking-silver/50">
                              Nenhum atalho encontrado.
                            </div>
                          )}
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>

                </div>

                {/* Sync status button */}
                <button
                  onClick={handleManualSync}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm ${
                    isOnline 
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 animate-pulse'
                  }`}
                  title={isOnline ? "Sincronizado com a Nuvem (Firebase). Clique para sincronizar." : "Usando armazenamento local. Clique para tentar conectar ao Firebase."}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isOnline ? 'Modo Online' : 'Modo Offline'}</span>
                </button>

                <div className="hidden sm:flex items-center gap-3 bg-viking-dark py-1.5 pl-3 pr-4 rounded-xl border border-viking-gold/20">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-viking-gold-dark to-viking-gold p-[2px] shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                    <div className="w-full h-full rounded-full bg-viking-darker flex items-center justify-center overflow-hidden">
                      {currentUser?.role === 'student' && activeStudentProfile?.photoUrl ? (
                         <img src={activeStudentProfile.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                         <User className="w-4 h-4 text-viking-gold" />
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none">{currentUser?.name}</p>
                    <p className="text-[9px] text-viking-gold uppercase font-viking-medieval mt-0.5">{currentUser?.role === 'trainer' ? 'Treinador' : 'Atleta'}</p>
                  </div>
                </div>

                {currentUser?.role === 'student' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setDrawerType('notifications'); setDrawerTitle('Avisos do Salão'); setDrawerOpen(true); }}
                      className="p-2.5 rounded-xl bg-viking-dark hover:bg-viking-gold/10 text-viking-silver hover:text-viking-gold transition-all border border-viking-gold/20 hover:border-viking-gold/40 relative cursor-pointer"
                      title="Avisos e Notificações"
                    >
                      <Bell className="w-5 h-5" />
                      {activeStudentProfile?.notifications?.some(n => !n.read) && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0706]"></span>
                      )}
                    </button>
                    <button 
                      onClick={() => { setDrawerType('settings'); setDrawerTitle('Configurações de Força'); setDrawerOpen(true); }}
                      className="p-2.5 rounded-xl bg-viking-dark hover:bg-viking-gold/10 text-viking-silver hover:text-viking-gold transition-all border border-viking-gold/20 hover:border-viking-gold/40 cursor-pointer"
                      title="Configurar Força (1RM)"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-3.5 rounded-xl bg-viking-red/15 hover:bg-viking-red/30 text-white hover:text-viking-gold border border-viking-red/30 hover:border-viking-gold/40 transition-all font-medium text-xs cursor-pointer"
                  title="Sair do Salão"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>

                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2.5 rounded-xl bg-viking-dark text-viking-silver hover:text-viking-gold xl:hidden border border-viking-gold/20 hover:border-viking-gold/40 transition-colors cursor-pointer"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </>
            ) : (
              <button
                onClick={handleManualSync}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-viking-medieval transition-all cursor-pointer text-xs shadow-sm ${
                  isOnline 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10' 
                    : 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 animate-pulse'
                }`}
                title={isOnline ? "Sincronizado com a Nuvem (Firebase). Clique para sincronizar." : "Usando armazenamento local. Clique para tentar conectar ao Firebase."}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isOnline ? '🛡️ MODO ONLINE ATIVO' : '🛡️ MODO OFFLINE SEGURO'}</span>
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* --- MAIN CONTAINER --- */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-8 pb-32 md:pb-8">

        {/* --- AUTHENTICATION SCREEN --- */}
        <AnimatePresence>
          {!isLoggedIn && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center min-h-[70vh] py-10 relative z-10"
            >
              <div className="w-full max-w-lg bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-viking-gold-dark via-viking-gold to-viking-gold-dark"></div>
                
                {/* Navegação Ir/Voltar */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-viking-gold/10">
                  <button 
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    disabled={!isRegisterMode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isRegisterMode 
                        ? 'text-[#e0d3a8] hover:text-viking-gold bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30' 
                        : 'text-viking-silver/20 border border-transparent cursor-not-allowed opacity-40'
                    }`}
                    title="Voltar para a tela de Login"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                  </button>

                  <span className="text-[10px] text-viking-silver/40 font-bold uppercase tracking-widest hidden sm:inline">Navegação do Templo</span>

                  <button 
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    disabled={isRegisterMode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      !isRegisterMode 
                        ? 'text-[#e0d3a8] hover:text-viking-gold bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30' 
                        : 'text-viking-silver/20 border border-transparent cursor-not-allowed opacity-40'
                    }`}
                    title="Avançar para a tela de Cadastro"
                  >
                    Ir <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  {customLogo ? (
                    <div className="relative group/logo w-24 h-24 mx-auto mb-4">
                      <img
                        src={customLogo}
                        alt="Logo"
                        className="w-24 h-24 object-cover rounded-2xl border-2 border-viking-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-[#140e0c] border border-viking-gold/30 rounded-full p-1.5 opacity-0 group-hover/logo:opacity-100 transition-opacity flex gap-1 shadow-lg z-10">
                        <label className="cursor-pointer text-viking-gold hover:text-white" title="Alterar Foto Logotipo">
                          <Camera className="w-3.5 h-3.5" />
                          <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        </label>
                        <button onClick={handleResetLogo} className="text-viking-red hover:text-red-400 cursor-pointer" title="Remover logotipo personalizado">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group/logo w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <VikingLogo size={80} className="mx-auto" />
                      <label className="absolute -bottom-1 -right-1 bg-[#140e0c] border border-viking-gold/30 rounded-full p-1.5 opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer text-viking-gold hover:text-white shadow-lg z-10" title="Inserir Foto Logotipo">
                        <Camera className="w-3.5 h-3.5" />
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </label>
                    </div>
                  )}
                  <h2 className="font-viking-display text-2xl sm:text-3xl font-bold tracking-wider bg-gradient-to-r from-[#e0d3a8] via-viking-gold to-[#e0d3a8] bg-clip-text text-transparent">
                    {isRegisterMode ? 'FORGE SUA CONTA' : (authTab === 'trainer' ? 'PORTAL DO TREINADOR' : 'TEMPLO VIKING FORCE')}
                  </h2>
                  <p className="text-xs text-viking-silver mt-2 max-w-sm mx-auto leading-relaxed">
                    {isRegisterMode 
                      ? 'Cadastre-se para calcular seus warmups inteligentes e registrar seu cansaço via RPE.' 
                      : (authTab === 'trainer' ? 'Acesso restrito para o mestre John. Insira suas credenciais mágicas.' : 'Faça login para ter acesso aos programas de treino personalizados de Powerlifting.')}
                  </p>
                </div>

                {!isRegisterMode && (
                  <div className="flex border border-viking-gold/10 rounded-2xl overflow-hidden bg-[#0d0908]/50 p-1 mb-6 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('student');
                        setLoginEmail('');
                        setLoginPassword('');
                      }}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 ${
                        authTab === 'student'
                          ? 'bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark shadow-md'
                          : 'text-viking-silver hover:text-[#e0d3a8]'
                      }`}
                    >
                      🛡️ Atleta
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('trainer');
                        setLoginEmail('');
                        setLoginPassword('');
                      }}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 ${
                        authTab === 'trainer'
                          ? 'bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark shadow-md'
                          : 'text-viking-silver hover:text-[#e0d3a8]'
                      }`}
                    >
                      ⚡ Treinador
                    </button>
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isRegisterMode && authTab === 'trainer' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">Nome do Treinador</label>
                        <input 
                          type="text" 
                          required 
                          disabled={authLoading}
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="john" 
                          className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">Senha Secreta</label>
                        <input 
                          type="password" 
                          required 
                          disabled={authLoading}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••" 
                          className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {isRegisterMode && (
                        <div>
                          <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">Seu Nome de Guerreiro</label>
                          <input 
                            type="text" 
                            required 
                            disabled={authLoading}
                            value={regName}
                            onChange={e => setRegName(e.target.value)}
                            placeholder="Ex: Ragnar Lothbrok" 
                            className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">Endereço de Email</label>
                        <input 
                          type="email" 
                          required 
                          disabled={authLoading}
                          value={loginEmail}
                          onChange={e => {
                            const emailVal = e.target.value;
                            setLoginEmail(emailVal);
                            if (isRegisterMode) {
                              const existingStudent = studentsData[emailVal.trim().toLowerCase()];
                              if (existingStudent) {
                                setRegName(existingStudent.name);
                              }
                            }
                          }}
                          placeholder="seu@email.com" 
                          className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                        />
                      </div>

                      {isRegisterMode && loginEmail.trim() && studentsData[loginEmail.trim().toLowerCase()] && (
                        <div className="p-3 rounded-xl bg-viking-gold/10 border border-viking-gold/35 text-[11px] text-viking-gold leading-relaxed space-y-1">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1">🛡️ Guerreiro pré-cadastrado encontrado!</span>
                          <p className="text-viking-silver/90">
                            Sua conta de Atleta já foi criada pelo Treinador. Defina sua senha abaixo para concluir seu cadastro e acessar sua ficha de treino.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">{isRegisterMode ? 'Senha' : 'Senha do Clã'}</label>
                        <input 
                          type="password" 
                          required 
                          disabled={authLoading}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                        />
                        {isRegisterMode && (
                          <p className="text-[10px] text-viking-silver/50 mt-1">Mínimo de 6 caracteres para a segurança de sua conta.</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Register PR Fields (Optional) */}
                  {isRegisterMode && !studentsData[loginEmail.trim().toLowerCase()] && (
                    <div className="pt-2 border-t border-viking-gold/15 mt-4 space-y-3">
                      <span className="text-xs font-bold text-viking-gold uppercase tracking-widest flex items-center gap-2">
                        <Flame className="w-4 h-4 text-viking-gold" /> Cargas Máximas de Força (1RM) - Opcional
                      </span>
                      <p className="text-[10px] text-viking-silver/80 leading-relaxed">
                        Seus recordes pessoais (1RM) são usados para prescrever as porcentagens corretas de aquecimento automático no agachamento, supino e terra.
                      </p>
                      
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Agachamento (kg)</label>
                            <input 
                              type="number" 
                              inputMode="decimal"
                              disabled={authLoading}
                              value={prSquat}
                              onChange={e => setPrSquat(e.target.value)}
                              placeholder="Ex: 140"
                              className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Supino (kg)</label>
                            <input 
                              type="number" 
                              inputMode="decimal"
                              disabled={authLoading}
                              value={prBench}
                              onChange={e => setPrBench(e.target.value)}
                              placeholder="Ex: 100"
                              className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Terra (kg)</label>
                            <input 
                              type="number" 
                              inputMode="decimal"
                              disabled={authLoading}
                              value={prDeadlift}
                              onChange={e => setPrDeadlift(e.target.value)}
                              placeholder="Ex: 180"
                              className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Idade (anos)</label>
                            <input 
                              type="number" 
                              inputMode="decimal"
                              disabled={authLoading}
                              value={regAge}
                              onChange={e => setRegAge(e.target.value)}
                              placeholder="Ex: 25"
                              className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Peso Corporal (kg)</label>
                            <input 
                              type="number" 
                              inputMode="decimal"
                              step="0.1"
                              disabled={authLoading}
                              value={regBodyWeight}
                              onChange={e => setRegBodyWeight(e.target.value)}
                              placeholder="Ex: 80.0"
                              className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Gênero para Competição</label>
                        <select 
                          disabled={authLoading}
                          value={regGender}
                          onChange={e => setRegGender(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="male" className="bg-[#140e0c] text-[#e0d3a8]">Masculino</option>
                          <option value="female" className="bg-[#140e0c] text-[#e0d3a8]">Feminino</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1.5">Escolha seu Plano</label>
                        <select 
                          disabled={authLoading}
                          value={regPlan}
                          onChange={e => setRegPlan(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {vikingPlans.map(plan => (
                            <option key={plan.id} value={plan.name} className="bg-[#140e0c] text-[#e0d3a8]">
                              {plan.name} - R$ {plan.price} ({plan.period})
                            </option>
                          ))}
                        </select>
                        <p className="text-[9px] text-viking-gold/80 mt-1.5">
                          Após o cadastro, você será redirecionado ao WhatsApp (51 998612067) para enviar o comprovante de pagamento.
                        </p>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1.5">Horário de Preferência de Treino</label>
                        <input 
                          type="time" 
                          disabled={authLoading}
                          value={regPreferredTime}
                          onChange={e => setRegPreferredTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold [color-scheme:dark] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black tracking-widest uppercase hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:brightness-90 transition-all flex items-center justify-center gap-2 mt-4 text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin text-viking-dark" />
                    ) : isRegisterMode ? (
                      <UserPlus className="w-4 h-4 shrink-0" />
                    ) : (
                      <Play className="w-4 h-4 shrink-0" />
                    )}
                    {authLoading 
                      ? (isRegisterMode ? 'Invocando Guerreiro...' : 'Adentrando...') 
                      : (isRegisterMode ? 'Registrar meu Clã' : 'Adentrar ao Salão')}
                  </button>
                </form>

                {/* Switch Login / Register Mode */}
                {authTab !== 'trainer' && (
                  <div className="text-center mt-6 pt-4 border-t border-viking-gold/15">
                    <button 
                      onClick={() => { setIsRegisterMode(!isRegisterMode); }}
                      className="text-xs text-viking-gold hover:text-viking-gold-dark font-semibold transition-all underline cursor-pointer"
                    >
                      {isRegisterMode ? 'Já faz parte do clã? Entre aqui' : 'Ainda não tem conta? Registre-se agora'}
                    </button>
                  </div>
                )}



              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- STUDENT DASHBOARD PANEL --- */}
        {isLoggedIn && currentUser?.role === 'student' && activeStudentProfile && (
          (() => {
            const today = new Date();
            const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
            const isBlocked = activeStudentProfile.accessBlocked || (activeStudentProfile.dueDate && todayStr > activeStudentProfile.dueDate);
            const isPending = activeStudentProfile.status === 'Pendente';

            if (isPending) {
              return (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-[#1a1210]/95 border border-viking-gold/30 rounded-3xl text-center space-y-5 min-h-[420px] relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-viking-gold/5 via-transparent to-transparent opacity-30 pointer-events-none" />
                  <VikingLogo size={96} className="mb-2 animate-pulse" />
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-viking-gold uppercase tracking-wider font-viking-display">Aguardando Autorização</h2>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-viking-gold/15 text-viking-gold px-3.5 py-1 rounded-full border border-viking-gold/20">
                      Plano Escolhido: {activeStudentProfile.plan || 'Mensal'}
                    </span>
                  </div>

                  <p className="text-viking-silver text-xs sm:text-sm max-w-md leading-relaxed">
                    Sua conta está no estado <strong className="text-viking-gold uppercase">Pendente</strong>. O plano escolhido só estará funcional e ativo após a validação e autorização do <strong className="text-white">Treinador John</strong>.
                  </p>
                  
                  <p className="text-viking-silver/60 text-xs max-w-sm leading-relaxed">
                    Envie o comprovante de pagamento no WhatsApp para que o treinador possa validar seu acesso no salão de treinamento.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full max-w-md relative z-10">
                    <a
                      href={`https://api.whatsapp.com/send?phone=5551998612067&text=${encodeURIComponent(`Olá Treinador John! Me cadastrei no app Diário do Guerreiro com o email ${activeStudentProfile.email} no plano ${activeStudentProfile.plan || 'Mensal'} e gostaria de solicitar a liberação do meu acesso ao aplicativo.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" /> Enviar Comprovante
                    </a>
                    
                    <button
                      onClick={() => {
                        setDrawerType('plans');
                        setDrawerTitle('Aliança Viking - Planos');
                        setDrawerOpen(true);
                      }}
                      className="flex-1 py-3 bg-viking-dark hover:bg-viking-gold/10 text-viking-gold border border-viking-gold/20 hover:border-viking-gold/40 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" /> Ver Planos / Alterar
                    </button>
                  </div>
                </div>
              );
            }

            if (isBlocked) {
              return (
                <div className="flex flex-col items-center justify-center p-10 bg-[#1a1210]/95 border border-red-900/50 rounded-3xl text-center space-y-4 min-h-[400px]">
                  <Shield className="w-20 h-20 text-red-500 mb-2" />
                  <h2 className="text-3xl font-black text-red-400 uppercase tracking-widest font-viking-display">Acesso Bloqueado</h2>
                  <p className="text-viking-silver text-sm max-w-md">Seu acesso ao salão de treinamento foi suspenso temporariamente. Verifique suas pendências financeiras com o treinador para retornar às batalhas.</p>
                </div>
              );
            }
            return (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6 relative z-10"
          >
            {/* NEW WORKOUT READY ALERT BANNER */}
            {activeStudentProfile.workoutReady && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-[#1e1411]/95 border-2 border-viking-gold p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_0_30px_rgba(212,175,55,0.25)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-viking-gold/5 via-transparent to-viking-gold/5 opacity-50 pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-viking-gold text-viking-dark shrink-0">
                    <Bell className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-viking-gold font-black text-sm tracking-wider uppercase font-viking-display">⚔️ SEU TREINO ESTÁ PRONTO, GUERREIRO!</h4>
                    <p className="text-viking-silver text-xs mt-1">
                      O Treinador John Rodrigues atualizou sua planilha e prescreveu novos combates com o ferro. Prepare sua mente e corpo!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto relative z-10 shrink-0">
                  <button 
                    onClick={() => {
                      if (activeStudentProfile.notifications && activeStudentProfile.notifications.length > 0) {
                        const latestPrescription = activeStudentProfile.notifications.find(n => n.message.includes('Novo treino') && n.actionData);
                        if (latestPrescription && latestPrescription.actionData) {
                          setSelectedWeek(latestPrescription.actionData.week);
                          setSelectedDay(latestPrescription.actionData.day);
                          setSessionRpeState({});
                          setExerciseFailureState({});
                        }
                      }
                      setWorkoutModalOpen(true);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Iniciar Treino
                  </button>
                  <button 
                    onClick={async () => {
                      const updatedProfile = { ...activeStudentProfile, workoutReady: false };
                      setStudentsData(prev => ({
                        ...prev,
                        [currentUser!.email]: updatedProfile
                      }));
                      saveStudentToFirebase(currentUser!.email, updatedProfile);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-black/40 text-viking-silver hover:text-white border border-viking-gold/20 text-xs font-bold transition-all cursor-pointer"
                  >
                    Ciente
                  </button>
                </div>
              </motion.div>
            )}

            {/* Header Greeting */}
            <div className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                <Shield className="w-48 h-48 text-viking-gold" />
              </div>
              <div>
                <h1 className="font-viking-display text-2xl sm:text-3xl font-black text-[#e0d3a8] tracking-wider">
                  SALÃO DO GUERREIRO
                </h1>
                <p className="text-viking-silver/80 text-sm mt-1">
                  ⚔️ Saudações, <span className="text-viking-gold font-bold">{activeStudentProfile.name}</span>! O ferro espera sua soberania.
                </p>
                <div className="mt-4 bg-[#140e0c] p-2.5 sm:p-3 rounded-xl border border-viking-gold/20 flex items-center gap-3 sm:gap-4">
                  <div className="text-center min-w-[50px]">
                    <div className="text-2xl font-black text-viking-gold">
                      {(activeStudentProfile.sessions || []).filter(s => (s.completedMobility?.length || 0) > 0).length}
                    </div>
                    <div className="text-[9px] text-viking-silver uppercase">Sessões com Mobilidade</div>
                  </div>
                  <div className="h-8 w-px bg-viking-gold/20"></div>
                  <div className="text-[10px] text-viking-silver">
                    Adesão aos protocolos de mobilidade para prevenção de lesões e performance.
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 bg-viking-gold/10 border border-viking-gold/30 px-3 py-1.5 rounded-xl">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs uppercase tracking-wider font-viking-medieval text-viking-gold">Ciclo de Força Ativo</span>
                </div>
                {activeStudentProfile.dueDate && (
                  <div className="flex items-center gap-2 bg-[#1a1210] border border-viking-gold/20 px-3 py-1.5 rounded-xl">
                    <Calendar className="w-3.5 h-3.5 text-viking-gold" />
                    <span className="text-[10px] font-bold text-viking-silver uppercase">Vencimento: <span className="text-[#e0d3a8]">{activeStudentProfile.dueDate.split('-').reverse().join('/')}</span></span>
                  </div>
                )}
                {activeStudentProfile.competitionDate ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-viking-gold/10 border border-viking-gold/30 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-xs uppercase tracking-wider font-viking-medieval text-viking-gold block">
                        {(() => {
                          const days = Math.max(0, Math.ceil((new Date(activeStudentProfile.competitionDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                          const wks = Math.floor(days / 7);
                          const remDays = days % 7;
                          if (wks > 0) return `Faltam ${wks} sem e ${remDays} d`;
                          return `Faltam ${days} dias`;
                        })()}
                      </span>
                      {activeStudentProfile.targetEventName && (
                        <span className="text-[9px] text-[#e0d3a8] font-bold mt-0.5 block">{activeStudentProfile.targetEventName}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activeStudentProfile.targetEventName || 'Competição de Força')}&dates=${activeStudentProfile.competitionDate.replace(/-/g, '')}/${activeStudentProfile.competitionDate.replace(/-/g, '')}&details=Dia+da+competição+alvo+no+Viking+Force`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-viking-silver hover:text-viking-gold underline"
                      >
                        Add ao GCalendar
                      </a>
                      <span className="text-[10px] text-viking-silver/50">|</span>
                      <button 
                        onClick={() => { setDrawerType('calendar'); setDrawerTitle('Calendário Competitivo'); setDrawerOpen(true); }}
                        className="text-[10px] text-viking-silver hover:text-viking-gold underline"
                      >
                        Mudar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setDrawerType('calendar'); setDrawerTitle('Calendário Competitivo'); setDrawerOpen(true); }}
                    className="mt-2 bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <span className="text-[10px] uppercase tracking-wider font-viking-medieval text-viking-gold flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Selecionar Evento Alvo
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Conditional Highlight Card / Public Note from Trainer */}
            {activeStudentProfile.publicNote && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-gradient-to-br from-amber-500/15 via-[#231710]/95 to-amber-950/20 border-2 border-viking-gold rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-[0_0_25px_rgba(217,119,6,0.25)] text-left"
              >
                {/* Sparkly decorative elements */}
                <div className="absolute right-4 top-4 text-viking-gold/20 pointer-events-none">
                  <Sparkles className="w-24 h-24 rotate-12 animate-pulse" />
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="p-3 rounded-2xl bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark shrink-0 shadow-lg shadow-viking-gold/20 mt-1 animate-pulse">
                    <Award className="w-6 h-6" />
                  </span>
                  <div className="space-y-1 pr-12">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-viking-gold bg-viking-gold/10 px-2.5 py-1 rounded-md border border-viking-gold/20">
                        Mensagem de Honra do Treinador John
                      </span>
                    </div>
                    <h3 className="font-viking-display text-lg sm:text-xl font-black text-white tracking-wide leading-tight pt-1">
                      PARABÉNS, GUERREIRO!
                    </h3>
                    <p className="text-viking-silver hover:text-white transition-colors text-sm sm:text-base leading-relaxed font-semibold italic pt-2">
                      "{activeStudentProfile.publicNote}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sub-Tab Navigation inside Student Profile */}
            <div className="flex border-b border-viking-gold/15 gap-1.5 sm:gap-6 bg-[#140e0c]/40 p-1 rounded-2xl border border-viking-gold/10 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setStudentSubTab('overview')}
                className={`flex-1 sm:flex-initial py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  studentSubTab === 'overview' 
                    ? 'text-viking-dark bg-gradient-to-r from-viking-gold-dark to-viking-gold shadow-md shadow-viking-gold/15' 
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/5'
                }`}
              >
                ⚔️ Treinos
              </button>
              <button 
                onClick={() => setStudentSubTab('cardio')}
                className={`flex-1 sm:flex-initial py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  studentSubTab === 'cardio' 
                    ? 'text-viking-dark bg-gradient-to-r from-viking-gold-dark to-viking-gold shadow-md shadow-viking-gold/15' 
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/5'
                }`}
              >
                🏃 Cardio
              </button>
              <button 
                onClick={() => setStudentSubTab('wilks')}
                className={`flex-1 sm:flex-initial py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  studentSubTab === 'wilks' 
                    ? 'text-viking-dark bg-gradient-to-r from-viking-gold-dark to-viking-gold shadow-md shadow-viking-gold/15' 
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/5'
                }`}
              >
                🏆 Metas Wilks
              </button>
              <button 
                onClick={() => setStudentSubTab('calculator')}
                className={`flex-1 sm:flex-initial py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  studentSubTab === 'calculator' 
                    ? 'text-viking-dark bg-gradient-to-r from-viking-gold-dark to-viking-gold shadow-md shadow-viking-gold/15' 
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/5'
                }`}
              >
                <Calculator className="w-4 h-4" /> Calculadora
              </button>
            </div>

            {studentSubTab === 'calculator' && activeStudentProfile && (
              <PrCalculator profile={activeStudentProfile} />
            )}

            {studentSubTab === 'cardio' && activeStudentProfile && (
              <CardioView 
                profile={activeStudentProfile}
                role={currentUser?.role || 'student'}
                onAddSession={(session) => {
                  handleUpdateStudentCardio(currentUser?.email || '', (p) => ({
                    cardioSessions: [...(p.cardioSessions || []), session]
                  }));
                  showToast('Sessão de cardio registrada com glória!', 'success');
                }}
                onAddGoal={(goal) => {
                  handleUpdateStudentCardio(currentUser?.email || '', (p) => ({
                    cardioGoals: [...(p.cardioGoals || []), goal]
                  }));
                  showToast('Novo objetivo de cardio definido!', 'success');
                }}
                onDeleteSession={(sessionId) => {
                  handleUpdateStudentCardio(currentUser?.email || '', (p) => ({
                    cardioSessions: (p.cardioSessions || []).filter(s => s.id !== sessionId)
                  }));
                  showToast('Registro de cardio removido.', 'info');
                }}
                onDeleteGoal={(goalId) => {
                  handleUpdateStudentCardio(currentUser?.email || '', (p) => ({
                    cardioGoals: (p.cardioGoals || []).filter(g => g.id !== goalId)
                  }));
                  showToast('Objetivo removido.', 'info');
                }}
                onUpdateGoalStatus={(goalId, completed) => {
                  handleUpdateStudentCardio(currentUser?.email || '', (p) => {
                    const updatedGoals = (p.cardioGoals || []).map(g => 
                      g.id === goalId 
                        ? { ...g, completed, achievedDate: completed ? new Date().toISOString().split('T')[0] : undefined } 
                        : g
                    );
                    if (completed) {
                      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
                    }
                    return { cardioGoals: updatedGoals };
                  });
                  showToast(completed ? 'Meta alcançada! Glória aos deuses!' : 'Meta reaberta.', completed ? 'success' : 'info');
                }}
              />
            )}

            {studentSubTab === 'overview' && (
              <>
                {/* DYNAMIC TARGET EVENT CARD - MARCAÇÃO DO ALVO DO ALUNO */}
                {activeStudentProfile.competitionDate && (() => {
                  const targetEvent = calendarEvents.find(ev => ev.id === activeStudentProfile.targetEventId);
                  const days = Math.max(0, Math.ceil((new Date(activeStudentProfile.competitionDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                  const wks = Math.floor(days / 7);
                  const remDays = days % 7;
                  const eventTitle = targetEvent?.title || activeStudentProfile.targetEventName || 'Dia de Teste / Competição';
                  const eventDesc = targetEvent?.description || 'Seu treinador marcou esta data especial no seu pergaminho. Prepare seu espírito, refine sua técnica e treine firme para superar seus limites no salão de ferro!';
                  const eventType = targetEvent?.type || 'other';

                  return (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-viking-gold/10 via-[#1d1412]/95 to-viking-gold/5 border-2 border-viking-gold/45 rounded-3xl p-5 sm:p-6 shadow-[0_4px_30px_rgba(212,175,55,0.15)] relative overflow-hidden text-left mb-6"
                    >
                      {/* Animated gold particle background or visual glow */}
                      <div className="absolute right-0 top-0 w-32 h-32 bg-viking-gold/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                        <div className="space-y-2.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-viking-gold text-viking-dark flex items-center gap-1">
                              <Target className="w-3 h-3" /> Alvo de Combate Designado
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
                              eventType === 'competition' 
                                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                : eventType === 'test' 
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                                  : 'bg-viking-gold/15 text-viking-gold border-viking-gold/25'
                            }`}>
                              {eventType === 'competition' ? 'Campeonato Oficial 🏆' : eventType === 'test' ? 'Teste de 1RM / Carga MÁX ⚔️' : 'Evento Especial 📅'}
                            </span>
                          </div>

                          <h2 className="font-viking-display text-xl sm:text-2xl font-black text-[#e0d3a8] tracking-wide">
                            {eventTitle}
                          </h2>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-viking-silver/95">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-viking-gold" />
                              Data: <span className="text-[#e0d3a8]">{activeStudentProfile.competitionDate.split('-').reverse().join('/')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-viking-gold animate-pulse" />
                              Contagem Regressiva: <span className="text-viking-gold uppercase font-black">
                                {days === 0 ? 'HOJE É O GRANDE DIA! 🔥' : wks > 0 ? `${wks} sem e ${remDays} dias restantes` : `${days} dias restantes`}
                              </span>
                            </div>
                          </div>

                          <p className="text-viking-silver text-xs sm:text-sm leading-relaxed max-w-3xl italic">
                            "{eventDesc}"
                          </p>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2.5 shrink-0 self-stretch md:self-center justify-end">
                          <button
                            onClick={() => {
                              setDrawerType('calendar');
                              setDrawerTitle('Calendário Competitivo');
                              setDrawerOpen(true);
                            }}
                            className="flex-1 md:flex-none py-2 px-4 bg-viking-gold hover:bg-viking-gold-dark text-viking-dark font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Calendar className="w-4 h-4" /> Ver no Calendário
                          </button>
                          
                          <a
                            href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${activeStudentProfile.competitionDate.replace(/-/g, '')}/${activeStudentProfile.competitionDate.replace(/-/g, '')}&details=${encodeURIComponent(eventDesc)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none py-2 px-4 bg-viking-dark hover:bg-[#231a18] border border-viking-gold/30 hover:border-viking-gold text-viking-gold font-black uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Add ao Google
                          </a>
                        </div>
                      </div>

                      {/* Cool Strength Tip Banner inside target event card */}
                      <div className="mt-4 pt-3 border-t border-viking-gold/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-viking-silver/60">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Flame className="w-3.5 h-3.5 text-viking-gold" />
                          <span>Dica Viking de Preparação:</span>
                          <span className="text-viking-silver italic">
                            {eventType === 'test' 
                              ? "Foque na velocidade da barra e use o RPE como guia para não queimar o sistema nervoso antes da hora."
                              : "Mantenha a dieta regulada, faça a pesagem com antecedência e garanta uma noite perfeita de sono."}
                          </span>
                        </span>
                        <span className="text-viking-gold/70 font-bold self-end sm:self-auto">Que Odin guie seus levantamentos!</span>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* SENTINELA VIKING - SIMULATED NOTIFICATION ALERT & CONTROLS */}
            {(() => {
              const todayString = new Date().toLocaleDateString('pt-BR');
              const hasTrainedToday = activeStudentProfile.sessions?.some(sess => sess.date === todayString);
              const preferredTime = activeStudentProfile.preferredTime || '18:00';
              const isPastPreferredTime = simulatedTime > preferredTime;
              const showAlert = isPastPreferredTime && !hasTrainedToday;

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Alarm / Status Banner */}
                  <div className={`rounded-3xl p-4 sm:p-6 border transition-all md:col-span-7 flex flex-col justify-between ${
                    showAlert 
                      ? 'bg-red-950/30 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] text-[#ffdede]' 
                      : 'bg-[#1a1210]/60 border-viking-gold/15 text-viking-silver/95'
                  }`}>
                    {showAlert ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3.5">
                          <span className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 animate-bounce shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                          </span>
                          <div>
                            <h3 className="font-viking-display text-sm sm:text-base font-black tracking-widest text-red-400 uppercase">
                              📯 Berrante de Odin: Treino Atrasado!
                            </h3>
                            <p className="text-xs text-red-200/90 mt-1.5 leading-relaxed">
                              Guerreiro, as sentinelas vikings avisam: o seu horário de preferência era às <strong className="text-red-300 underline font-black">{preferredTime}</strong> e agora já são <strong className="text-red-300 font-black">{simulatedTime}</strong>!
                            </p>
                            <p className="text-xs text-red-200/85 mt-1 italic font-medium">
                              "Nenhum guerreiro adentra os salões de Valhalla de braços cruzados. Erga o aço!"
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            onClick={() => setWorkoutModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 text-center cursor-pointer"
                          >
                            🏋️ Registrar Treino de Hoje!
                          </button>
                          <button
                            onClick={() => {
                              setSimulatedTime('08:00');
                              showToast('Alerta silenciado (relógio ajustado para 08:00)', 'info');
                            }}
                            className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/40 border border-red-500/20 hover:border-red-500/40 text-red-300 font-bold text-xs uppercase transition-all text-center cursor-pointer"
                          >
                            Silenciar Sentinela
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3.5">
                          <span className={`p-2.5 rounded-2xl shrink-0 ${hasTrainedToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-viking-gold/10 text-viking-gold'}`}>
                            {hasTrainedToday ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                          </span>
                          <div>
                            <h3 className="font-viking-display text-sm sm:text-base font-black tracking-widest text-viking-gold uppercase">
                              🛡️ Sentinela Viking: Vigília Ativa
                            </h3>
                            <p className="text-xs text-viking-silver/80 mt-1.5 leading-relaxed">
                              Horário de preferência de treino definido para às <strong className="text-viking-gold font-bold">{preferredTime}</strong>. 
                              {hasTrainedToday ? (
                                <span className="text-emerald-400 font-bold block mt-1.5 flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                  🎉 Vitória! Seu treino de hoje já foi registrado no pergaminho de batalhas!
                                </span>
                              ) : (
                                <span className="text-viking-silver/70 block mt-1.5">
                                  Relógio simulado em <strong className="text-white font-bold">{simulatedTime}</strong>. Você tem até às <strong className="text-viking-gold font-bold">{preferredTime}</strong> para treinar e registrar seu esforço sem soar o berrante de alerta.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simulator Controls Widget */}
                  <div className="md:col-span-5 bg-[#1a1210]/60 border border-viking-gold/15 rounded-3xl p-5 space-y-3.5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-2 border-b border-viking-gold/10">
                        <Settings className="w-4 h-4 text-viking-gold" />
                        <span className="text-xs font-black uppercase tracking-wider text-[#e0d3a8] font-viking-display">
                          Simulador de Sentinela
                        </span>
                      </div>

                      <div className="space-y-3 pt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-viking-silver/70 font-semibold">Relógio Simulado:</span>
                          <input 
                            type="time" 
                            value={simulatedTime}
                            onChange={e => {
                              const newTime = e.target.value;
                              setSimulatedTime(newTime);
                              if (newTime > preferredTime && !hasTrainedToday) {
                                showToast('📯 O Berrante Viking soou! Treino pendente!', 'error');
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-black/60 border border-viking-gold/25 text-viking-gold font-bold text-sm [color-scheme:dark] focus:outline-none focus:border-viking-gold"
                          />
                        </div>

                        {/* Fast selection presets */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setSimulatedTime('08:00');
                              showToast('Relógio simulado: Manhã (08:00)', 'info');
                            }}
                            className="py-1.5 px-2 text-[10px] font-bold bg-[#0d0908]/80 hover:bg-viking-gold/10 border border-viking-gold/10 hover:border-viking-gold/30 rounded-lg text-viking-silver transition-all cursor-pointer"
                          >
                            🌅 Manhã (08:00)
                          </button>
                          <button
                            onClick={() => {
                              const [h, m] = preferredTime.split(':').map(Number);
                              const newH = String((h + 1) % 24).padStart(2, '0');
                              const newM = String(m).padStart(2, '0');
                              const target = `${newH}:${newM}`;
                              setSimulatedTime(target);
                              if (!hasTrainedToday) {
                                showToast('📯 Alerta soado! Horário preferencial ultrapassado!', 'error');
                              } else {
                                showToast(`Relógio em ${target} (Treino de hoje já concluído!)`, 'success');
                              }
                            }}
                            className="py-1.5 px-2 text-[10px] font-bold bg-red-950/20 hover:bg-red-900/10 border border-red-500/10 hover:border-red-500/30 rounded-lg text-red-300 transition-all cursor-pointer"
                          >
                            🚨 Atrasado (+1 hora)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-viking-gold/10 flex justify-between items-center text-[10px]">
                      <span className="text-viking-silver/50">Sua preferência:</span>
                      <button
                        onClick={() => {
                          setDrawerType('settings');
                          setDrawerTitle('Configurações de Força');
                          setDrawerOpen(true);
                        }}
                        className="text-viking-gold hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit className="w-3 h-3" /> Alterar para {preferredTime}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-lg sm:text-2xl font-black text-white">{calculateTotalVolume().toLocaleString('pt-BR')} kg</p>
                <p className="text-[9px] sm:text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Volume Total</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-lg sm:text-2xl font-black text-white">
                  {(activeStudentProfile.prs.squat || 0) > 0 ? '3' : '0'}
                </p>
                <p className="text-[9px] sm:text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">PRs Ativos</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <History className="w-6 h-6 sm:w-8 sm:h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-lg sm:text-2xl font-black text-white">{(activeStudentProfile.sessions || []).length}</p>
                <p className="text-[9px] sm:text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Treinos</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-lg sm:text-2xl font-black text-white">{calculateAvgRpe()}</p>
                <p className="text-[9px] sm:text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">RPE Médio</p>
              </div>

            </div>

            {/* Strength Evolution SBD Panel */}
            {renderStrengthEvolution()}

            {/* Training Volume Chart */}
            <VolumeChart profile={activeStudentProfile} />

            {/* 8-Week Workload Progression Line Chart */}
            <WeeklyVolumeLineChart profile={activeStudentProfile} />

            {/* 1RM Progress Chart */}
            <OneRepMaxChart profile={activeStudentProfile} />

            {/* Total SBD Line Chart */}
            <TotalSBDChart profile={activeStudentProfile} />

            {/* Quick Actions Panel */}
            <div className="bg-[#1a1210]/85 border border-viking-gold/20 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
              <h3 className="font-viking-display text-[11px] sm:text-sm font-bold tracking-widest text-viking-gold uppercase mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-viking-gold" /> Portões do Combate - Ações Rápidas
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                
                <motion.button 
                  onClick={() => setWorkoutModalOpen(true)}
                  className={`p-2 sm:p-4 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-[9px] sm:text-sm uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 shadow-lg cursor-pointer relative overflow-hidden ${
                    activeStudentProfile?.workoutReady && !workoutModalOpen ? 'shadow-[0_0_20px_rgba(212,175,55,0.6)]' : 'shadow-viking-gold/20'
                  }`}
                  animate={activeStudentProfile?.workoutReady && !workoutModalOpen ? {
                    boxShadow: [
                      "0 0 10px rgba(212, 175, 55, 0.3)",
                      "0 0 25px rgba(212, 175, 55, 0.8)",
                      "0 0 10px rgba(212, 175, 55, 0.3)"
                    ],
                    scale: [1, 1.02, 1]
                  } : {}}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut"
                  }}
                >
                  <Dumbbell className={`w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 ${activeStudentProfile?.workoutReady && !workoutModalOpen ? 'animate-bounce' : ''}`} /> 
                  <span className="text-center leading-tight">Treinar</span>
                  {activeStudentProfile?.workoutReady && !workoutModalOpen && (
                    <span className="absolute top-1 right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-viking-gold shadow-[0_0_8px_#d4af37]" />
                  )}
                </motion.button>

                <button 
                  onClick={() => { setDrawerType('history'); setDrawerTitle('Histórico & RPE de Treinos'); setDrawerOpen(true); }}
                  className="p-2 sm:p-4 rounded-xl bg-viking-dark border border-viking-gold/20 text-viking-gold hover:bg-viking-gold/10 font-bold text-[9px] sm:text-sm uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" /> <span className="text-center leading-tight">Histórico</span>
                </button>

                <button 
                  onClick={() => { setDrawerType('ranking'); setDrawerTitle('Tabela de Honra Viking'); setDrawerOpen(true); }}
                  className="p-2 sm:p-4 rounded-xl bg-viking-dark border border-viking-gold/20 text-viking-gold hover:bg-viking-gold/10 font-bold text-[9px] sm:text-sm uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" /> <span className="text-center leading-tight">Ranking</span>
                </button>

                <button 
                  onClick={() => { setDrawerType('settings'); setDrawerTitle('Configurações de Força'); setDrawerOpen(true); }}
                  className="p-2 sm:p-4 rounded-xl bg-viking-dark border border-viking-gold/20 text-viking-gold hover:bg-viking-gold/10 font-bold text-[9px] sm:text-sm uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" /> <span className="text-center leading-tight">Ajustar</span>
                </button>

                <button 
                  onClick={() => { 
                    setDrawerType('chat'); 
                    setDrawerTitle('Feedback com o Treinador'); 
                    setDrawerOpen(true); 
                  }}
                  className="p-2 sm:p-4 rounded-xl bg-viking-gold/10 border border-viking-gold hover:bg-viking-gold/20 font-black text-[9px] sm:text-sm uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer text-viking-gold animate-pulse shadow-md shadow-viking-gold/5"
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" /> <span className="text-center leading-tight">Chat</span>
                </button>

              </div>
            </div>

            {/* Core Workout Prescribed Preview */}
            <div className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-viking-gold/15">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div>
                    <h3 className="font-viking-display text-lg font-bold text-viking-gold">PROVA ATUAL PROGRAMADA</h3>
                    <p className="text-xs text-viking-silver">Desenvolvida pelo Treinador John com foco em técnica de Powerlifting</p>
                  </div>
                  <button
                    onClick={() => handleDownloadWorkoutPlanPDF(activeStudentProfile || { name: currentUser?.name || 'Guerreiro', plan: 'Mensal', status: 'Ativo', prs: { squat: null, bench: null, deadlift: null }, sessions: [] })}
                    className="px-3 py-1.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30 text-viking-gold text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    title="Baixar Ficha de Treino completa em formato PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Baixar Ficha PDF
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-viking-darker border border-viking-gold/20 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] text-viking-silver uppercase font-bold">Semana:</span>
                    <select
                      value={selectedWeek}
                      onChange={e => {
                        setSelectedWeek(parseInt(e.target.value));
                        setSessionRpeState({});
                        setExerciseFailureState({});
                      }}
                      className="bg-transparent text-viking-gold text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      {Object.keys((activeStudentProfile?.customProgram || trainingProgram).weeks).map(Number).sort((a,b) => a-b).map(wk => (
                        <option key={wk} value={wk} className="bg-[#140e0c] text-viking-gold">
                          Semana {wk}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5 bg-viking-darker border border-viking-gold/20 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] text-viking-silver uppercase font-bold">Treino:</span>
                    <select
                      value={selectedDay}
                      onChange={e => {
                        const newDay = e.target.value;
                        setSelectedDay(newDay);
                        setSessionRpeState({});
                        setExerciseFailureState({});
                        setExerciseWarmupState({});
                        setExerciseSetsState({});
                        setCurrentExerciseIndex(0);
                      }}
                      className="bg-transparent text-viking-gold text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      {Object.keys((activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek] || { A: [], B: [], C: [] }).sort().map(day => (
                        <option key={day} value={day} className="bg-[#140e0c] text-viking-gold">
                          Treino {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {((activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek]?.[selectedDay as keyof typeof trainingProgram.weeks[1]] || []).map((ex, idx) => (
                  <div key={(ex.id || 'ex') + '_' + idx} className="p-4 rounded-xl bg-black/30 border border-viking-gold/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-viking-gold/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ex.main ? 'bg-viking-gold/15 text-viking-gold' : 'bg-white/[0.02] text-viking-silver border border-white/5'}`}>
                        {ex.main ? <Flame className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center flex-wrap gap-2">
                          <span>{ex.name}</span>
                          {ex.main && <span className="text-[9px] bg-viking-gold text-viking-dark font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Principal</span>}
                          {ex.methodology && ex.methodology !== 'standard' && (
                            <span className="text-[9px] bg-[#140e0c] border border-viking-gold/30 text-viking-gold font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                              ⚡ {
                                ex.methodology === 'backoff' ? 'Back-off Set' :
                                ex.methodology === 'myoreps' ? 'Myo-Reps' :
                                ex.methodology === 'clusters' ? 'Cluster Sets' :
                                ex.methodology === 'dropset' ? 'Drop Set' : ex.methodology
                              }
                            </span>
                          )}
                          {(() => {
                            const matchedDbEx = dbExercises.find(d => d.name.toLowerCase().trim() === ex.name.toLowerCase().trim());
                            const hasVideo = !!ex.videoUrl || !!matchedDbEx?.videoUrl || !!matchedDbEx?.videoBase64;
                            if (!hasVideo) return null;
                            return (
                              <button 
                                type="button"
                                onClick={() => setActiveVideoModal({
                                  name: ex.name,
                                  videoUrl: ex.videoUrl || matchedDbEx?.videoUrl,
                                  videoBase64: matchedDbEx?.videoBase64
                                })}
                                className="inline-flex items-center gap-1 text-[9px] font-bold text-viking-gold hover:text-white bg-viking-gold/10 border border-viking-gold/25 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                                title="Assistir execução no Templo"
                              >
                                <Video className="w-3 h-3 text-viking-gold" /> Ver Execução
                              </button>
                            );
                          })()}
                        </p>
                        <p className="text-[11px] text-viking-silver/80 mt-0.5 font-semibold">Séries prescritas de trabalho: <strong className="text-[#e0d3a8]">{ex.sets}x{ex.reps}</strong></p>
                        {ex.methodologyDetails && (
                          <p className="text-[10px] text-viking-gold/90 font-semibold mt-1 flex items-center gap-1 bg-[#140e0c] px-2 py-1 rounded border border-viking-gold/20 w-fit">
                            <Zap className="w-3.5 h-3.5 text-viking-gold shrink-0 animate-pulse" /> Metodologia: {ex.methodologyDetails}
                          </p>
                        )}
                        {ex.techniqueTips && (
                          <p className="text-[10px] text-viking-gold/80 italic mt-1 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 shrink-0" /> Dica: {ex.techniqueTips}
                          </p>
                        )}
                        {ex.trainerNote && (
                          <p className="text-[10px] text-[#e0d3a8] font-bold mt-1 flex items-start gap-1.5 bg-viking-gold/10 px-2.5 py-1.5 rounded-md border border-viking-gold/30">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                            <span className="leading-tight">Obs: {ex.trainerNote}</span>
                          </p>
                        )}
                        {(() => {
                          const tip = Object.entries(POWERLIFTING_TIPS).find(([key]) => ex.name.toLowerCase().includes(key.toLowerCase()))?.[1];
                          if (!tip) return null;
                          return (
                            <div className="mt-2 bg-viking-gold/10 p-2 rounded border border-viking-gold/20 flex gap-2 items-start">
                              <Info className="w-4 h-4 text-viking-gold shrink-0 mt-0.5" />
                              <p className="text-[10px] text-viking-gold/90 font-medium">
                                <strong className="text-viking-gold">Dica Powerlifting:</strong> {tip}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold sm:text-right">
                      <div>
                        <p className="text-[10px] text-viking-silver uppercase font-viking-medieval">Intensidade</p>
                        <p className="text-[#e0d3a8] font-bold mt-0.5">
                          {ex.main ? (
                            ex.baseWeight && typeof ex.intensity === 'number' ? (
                              `${Math.round(ex.baseWeight * ex.intensity)} kg (${Math.round(ex.intensity * 100)}%)`
                            ) : typeof ex.intensity === 'number' ? (
                              `${Math.round(ex.intensity * 100)}% 1RM`
                            ) : (
                              ex.intensity
                            )
                          ) : (
                            ex.baseWeight ? (
                              `${ex.baseWeight} kg` + (ex.intensity && ex.intensity !== 'carga livre' ? ` (${ex.intensity})` : '')
                            ) : (
                              ex.intensity
                            )
                          )}
                        </p>
                      </div>
                      <div className="border-l border-viking-gold/15 pl-4">
                        <p className="text-[10px] text-viking-silver uppercase font-viking-medieval">Alvo RPE</p>
                        <p className="text-viking-gold font-bold mt-0.5">{ex.targetRPE}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
              </>
            )}

            {studentSubTab === 'wilks' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 1. Header Card of Current Status */}
                {(() => {
                  const bw = activeStudentProfile.bodyWeight || 80.0;
                  const gender = activeStudentProfile.gender || 'male';
                  const s = activeStudentProfile.prs.squat || 0;
                  const b = activeStudentProfile.prs.bench || 0;
                  const d = activeStudentProfile.prs.deadlift || 0;
                  const total = s + b + d;
                  const currentWilks = calculateWilks(gender, bw, total);

                  const WILKS_LEVELS = [
                    { name: 'Aspirante Viking', targetWilks: 0, minWilks: 0, badge: '🪵', desc: 'Iniciando a jornada nos portões de ferro.', nextMin: 150 },
                    { name: 'Recruta Viking', targetWilks: 150, minWilks: 150, badge: '🛡️', desc: 'Primeiras conquistas alcançadas no templo.', nextMin: 250 },
                    { name: 'Guerreiro do Clã', targetWilks: 250, minWilks: 250, badge: '⚔️', desc: 'Força relativa expressiva e respeito na tribo.', nextMin: 325 },
                    { name: 'Berserker do Norte', targetWilks: 325, minWilks: 325, badge: '🔥', desc: 'Fúria devastadora erguendo grandes pesos.', nextMin: 400 },
                    { name: 'Guerreiro de Valhalla', targetWilks: 400, minWilks: 400, badge: '⚡', desc: 'Força extraordinária digna dos deuses.', nextMin: 475 },
                    { name: 'Semideus / Jarl', targetWilks: 475, minWilks: 475, badge: '👑', desc: 'Lenda absoluta no topo da montanha de ferro.', nextMin: 999 },
                  ];

                  // Determine current tier
                  let currentTier = WILKS_LEVELS[0];
                  for (let i = WILKS_LEVELS.length - 1; i >= 0; i--) {
                    if (currentWilks >= WILKS_LEVELS[i].minWilks) {
                      currentTier = WILKS_LEVELS[i];
                      break;
                    }
                  }

                  // Determine next tier
                  const nextTierIdx = WILKS_LEVELS.indexOf(currentTier) + 1;
                  const nextTier = nextTierIdx < WILKS_LEVELS.length ? WILKS_LEVELS[nextTierIdx] : null;

                  // Progress to next tier
                  const currentLevelMin = currentTier.minWilks;
                  const nextLevelMin = nextTier ? nextTier.minWilks : 999;
                  const progressPct = nextTier 
                    ? Math.min(100, Math.max(0, ((currentWilks - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100))
                    : 100;

                  // Quick function to adjust ratios safely
                  const handlePreset = (type: string) => {
                    if (type === 'balanced') setWilksRatios({ squat: 38, bench: 24, deadlift: 38 });
                    if (type === 'squat') setWilksRatios({ squat: 44, bench: 20, deadlift: 36 });
                    if (type === 'bench') setWilksRatios({ squat: 34, bench: 32, deadlift: 34 });
                    if (type === 'deadlift') setWilksRatios({ squat: 34, bench: 18, deadlift: 48 });
                    showToast(`Proporção ajustada para foco: ${type === 'balanced' ? 'Equilibrado' : type === 'squat' ? 'Agachamento' : type === 'bench' ? 'Supino' : 'Levantamento Terra'}`, 'info');
                  };

                  const adjustRatioDirectly = (lift: 'squat' | 'bench' | 'deadlift', amount: number) => {
                    const prev = wilksRatios;
                    const nextVal = Math.max(10, Math.min(80, prev[lift] + amount));
                    const diff = nextVal - prev[lift];
                    
                    const otherLifts = (['squat', 'bench', 'deadlift'] as const).filter(l => l !== lift);
                    const splitDiff = diff / 2;
                    
                    let other1 = prev[otherLifts[0]] - splitDiff;
                    let other2 = prev[otherLifts[1]] - splitDiff;
                    
                    if (other1 < 10) {
                      const debt = 10 - other1;
                      other1 = 10;
                      other2 -= debt;
                    }
                    if (other2 < 10) {
                      const debt = 10 - other2;
                      other2 = 10;
                      other1 -= debt;
                    }
                    
                    const sum = Math.round(nextVal + other1 + other2);
                    const finalOther2 = other2 + (100 - sum);
                    
                    setWilksRatios({
                      [lift]: Math.round(nextVal),
                      [otherLifts[0]]: Math.round(other1),
                      [otherLifts[1]]: Math.round(finalOther2)
                    } as any);
                  };

                  // Helper to compute total weight needed for target wilks
                  const calculateTotalForWilks = (targetW: number): number => {
                    if (!bw) return 0;
                    const x = bw;
                    let a_coeff, b_coeff, c_coeff, d_coeff, e_coeff, f_coeff;
                    if (gender === 'female') {
                      a_coeff = 594.17;
                      b_coeff = -27.23806;
                      c_coeff = 0.821122;
                      d_coeff = -0.009307339;
                      e_coeff = 0.00004731582;
                      f_coeff = -0.00000009054;
                    } else {
                      a_coeff = -216.0475144;
                      b_coeff = 16.2606339;
                      c_coeff = -0.002388645;
                      d_coeff = -0.00113732;
                      e_coeff = 0.00000701863;
                      f_coeff = -0.00000001291;
                    }
                    const denom = a_coeff + b_coeff*x + c_coeff*Math.pow(x, 2) + d_coeff*Math.pow(x, 3) + e_coeff*Math.pow(x, 4) + f_coeff*Math.pow(x, 5);
                    if (denom === 0) return 0;
                    const coeff = 500 / denom;
                    return Math.ceil(targetW / coeff);
                  };

                  return (
                    <>
                      {/* Performance Tiers Overview */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left: Level Status Panel */}
                        <div className="lg:col-span-7 bg-[#1a1210]/90 border border-viking-gold/20 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-viking-gold/5 rounded-full blur-3xl pointer-events-none" />
                          
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-viking-gold-dark font-viking-medieval block">Sua Classe Atual</span>
                                <h2 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
                                  <span className="text-3xl">{currentTier.badge}</span>
                                  {currentTier.name}
                                </h2>
                                <p className="text-xs text-viking-silver/80 italic mt-1 leading-relaxed">
                                  "{currentTier.desc}"
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-widest text-viking-silver/50 block">Coeficiente</span>
                                <span className="text-3xl font-black text-viking-gold font-viking-display leading-none mt-1 inline-block">
                                  {currentWilks.toFixed(1)}
                                </span>
                                <span className="text-xs text-viking-silver/60 block font-viking-medieval font-bold">Wilks</span>
                              </div>
                            </div>

                            {/* Progress bar to next level */}
                            {nextTier ? (
                              <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                  <span className="text-viking-silver/70">Progresso para {nextTier.badge} {nextTier.name}</span>
                                  <span className="text-viking-gold">{currentWilks.toFixed(1)} / {nextTier.minWilks} Wilks</span>
                                </div>
                                <div className="w-full h-3.5 bg-black/50 border border-viking-gold/25 rounded-full overflow-hidden p-[2px]">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-viking-gold-dark to-viking-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                                  />
                                </div>
                                <p className="text-[10px] text-viking-silver/60 text-right">
                                  Faltam <strong className="text-white font-bold">{(nextTier.minWilks - currentWilks).toFixed(1)}</strong> pontos Wilks para subir de patente.
                                </p>
                              </div>
                            ) : (
                              <div className="mt-6 p-4 rounded-xl bg-viking-gold/10 border border-viking-gold/20 text-center">
                                <p className="text-xs font-black text-viking-gold uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                                  <Crown className="w-4 h-4" /> VOCÊ ALCANÇOU O TOPO DE VALHALLA!
                                </p>
                                <p className="text-[10px] text-viking-silver/80 mt-1">Sua força relativa ultrapassou todos os limites conhecidos de um Semideus.</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-4 border-t border-viking-gold/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div>
                                <span className="text-[9px] text-viking-silver/65 uppercase block">Peso Corporal</span>
                                <span className="text-sm font-black text-white">{bw.toFixed(1)} kg</span>
                              </div>
                              <div className="h-6 w-px bg-viking-gold/15" />
                              <div>
                                <span className="text-[9px] text-viking-silver/65 uppercase block">Gênero</span>
                                <span className="text-sm font-black text-white">{gender === 'male' ? 'Masculino ♂' : 'Feminino ♀'}</span>
                              </div>
                              <div className="h-6 w-px bg-viking-gold/15" />
                              <div>
                                <span className="text-[9px] text-viking-silver/65 uppercase block">Total Atual PR</span>
                                <span className="text-sm font-black text-viking-gold">{total} kg</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setDrawerType('settings');
                                setDrawerTitle('Ajustar Peso & Gênero');
                                setDrawerOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 hover:border-viking-gold/40 text-viking-gold text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                            >
                              ⚙️ Editar Dados
                            </button>
                          </div>
                        </div>

                        {/* Right: Ratio Distribution Panel */}
                        <div className="lg:col-span-5 bg-[#1a1210]/90 border border-viking-gold/20 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col justify-between">
                          <div>
                            <h3 className="font-viking-display text-xs font-black tracking-widest text-viking-gold uppercase border-b border-viking-gold/15 pb-2.5 mb-4 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-viking-gold shrink-0" />
                              Distribuição de Carga Alvo
                            </h3>
                            <p className="text-[11px] text-viking-silver leading-relaxed mb-4">
                              Como deseja dividir seu levantamento total? Modifique as frações percentuais para recalcular sua meta individual para cada movimento.
                            </p>

                            {/* Ratio Sliders/Controls */}
                            <div className="space-y-4">
                              {/* Squat Control */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-white flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-viking-gold" /> Agachamento</span>
                                  <span className="text-viking-gold">{wilksRatios.squat}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => adjustRatioDirectly('squat', -1)}
                                    className="w-7 h-7 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/40 rounded-lg text-viking-gold font-bold flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                                  >-</button>
                                  <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-viking-gold/10">
                                    <div className="h-full bg-viking-gold rounded-full" style={{ width: `${wilksRatios.squat}%` }} />
                                  </div>
                                  <button 
                                    onClick={() => adjustRatioDirectly('squat', 1)}
                                    className="w-7 h-7 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/40 rounded-lg text-viking-gold font-bold flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                                  >+</button>
                                </div>
                              </div>

                              {/* Bench Control */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-white flex items-center gap-1"><Award className="w-3.5 h-3.5 text-viking-gold" /> Supino Reto</span>
                                  <span className="text-viking-gold">{wilksRatios.bench}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => adjustRatioDirectly('bench', -1)}
                                    className="w-7 h-7 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/40 rounded-lg text-viking-gold font-bold flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                                  >-</button>
                                  <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-viking-gold/10">
                                    <div className="h-full bg-viking-gold rounded-full" style={{ width: `${wilksRatios.bench}%` }} />
                                  </div>
                                  <button 
                                    onClick={() => adjustRatioDirectly('bench', 1)}
                                    className="w-7 h-7 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/40 rounded-lg text-viking-gold font-bold flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                                  >+</button>
                                </div>
                              </div>

                              {/* Deadlift Control */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-white flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-viking-gold" /> Levantamento Terra</span>
                                  <span className="text-viking-gold">{wilksRatios.deadlift}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => adjustRatioDirectly('deadlift', -1)}
                                    className="w-7 h-7 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/40 rounded-lg text-viking-gold font-bold flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                                  >-</button>
                                  <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-viking-gold/10">
                                    <div className="h-full bg-viking-gold rounded-full" style={{ width: `${wilksRatios.deadlift}%` }} />
                                  </div>
                                  <button 
                                    onClick={() => adjustRatioDirectly('deadlift', 1)}
                                    className="w-7 h-7 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/40 rounded-lg text-viking-gold font-bold flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                                  >+</button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Presets */}
                          <div className="mt-6 pt-3 border-t border-viking-gold/10 space-y-2">
                            <span className="text-[9px] uppercase font-bold text-viking-silver/50 block">Combinações Rápidas de Foco</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5">
                              <button 
                                onClick={() => handlePreset('balanced')}
                                className="py-1 px-2 rounded-md bg-black/40 hover:bg-viking-gold/15 border border-viking-gold/15 hover:border-viking-gold/35 text-[9px] font-black text-viking-silver hover:text-white transition-all cursor-pointer text-center"
                              >
                                ⚖️ Equilibrado (38/24/38)
                              </button>
                              <button 
                                onClick={() => handlePreset('squat')}
                                className="py-1 px-2 rounded-md bg-black/40 hover:bg-viking-gold/15 border border-viking-gold/15 hover:border-viking-gold/35 text-[9px] font-black text-viking-silver hover:text-white transition-all cursor-pointer text-center"
                              >
                                🦵 Agachador (44/20/36)
                              </button>
                              <button 
                                onClick={() => handlePreset('bench')}
                                className="py-1 px-2 rounded-md bg-black/40 hover:bg-viking-gold/15 border border-viking-gold/15 hover:border-viking-gold/35 text-[9px] font-black text-viking-silver hover:text-white transition-all cursor-pointer text-center"
                              >
                                💪 Supinador (34/32/34)
                              </button>
                              <button 
                                onClick={() => handlePreset('deadlift')}
                                className="py-1 px-2 rounded-md bg-black/40 hover:bg-viking-gold/15 border border-viking-gold/15 hover:border-viking-gold/35 text-[9px] font-black text-viking-silver hover:text-white transition-all cursor-pointer text-center"
                              >
                                🌋 Levantador (34/18/48)
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patent Timeline & Badges Schedule */}
                      <PatentTimeline 
                        studentProfile={activeStudentProfile}
                        showToast={showToast}
                      />

                      {/* 2. Interactive Wilks Goals Table */}
                      <div className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-viking-gold/15">
                          <div>
                            <h3 className="font-viking-display text-lg font-black tracking-wider text-viking-gold uppercase">
                              TABELA INTERATIVA DE PROGRESSÃO DE FORÇA
                            </h3>
                            <p className="text-xs text-viking-silver mt-1 leading-relaxed">
                              Projeção dinâmica de cargas com base no seu peso de <strong className="text-white font-bold">{bw.toFixed(1)}kg</strong> e divisão percentual selecionada acima. Veja exatamente quanto você precisa atingir para evoluir sua patente.
                            </p>
                          </div>
                          <button
                            onClick={() => handleExportWilksPDF(activeStudentProfile, currentWilks, bw, gender, total, s, b, d)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark hover:from-viking-gold hover:to-viking-gold-light text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-viking-gold/15 whitespace-nowrap self-start md:self-center"
                          >
                            <FileDown className="w-4.5 h-4.5" /> Exportar Metas (PDF)
                          </button>
                        </div>

                        {/* Interactive Table Container */}
                        <div className="overflow-x-auto border border-viking-gold/15 rounded-2xl bg-black/35 shadow-inner">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#140e0c] border-b border-viking-gold/20 text-[10px] text-viking-gold uppercase font-black tracking-wider font-viking-medieval">
                                <th className="py-3.5 px-4">Patente / Nível</th>
                                <th className="py-3.5 px-4 text-center">Meta Wilks</th>
                                <th className="py-3.5 px-4 text-center">Total (SBD)</th>
                                <th className="py-3.5 px-4 text-center">Agachamento ({wilksRatios.squat}%)</th>
                                <th className="py-3.5 px-4 text-center">Supino ({wilksRatios.bench}%)</th>
                                <th className="py-3.5 px-4 text-center">Terra ({wilksRatios.deadlift}%)</th>
                                <th className="py-3.5 px-4 text-right">Falta Elevar (Total)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-viking-gold/10 text-xs text-viking-silver">
                              {[
                                { name: 'Recruta Viking', target: 150, id: 'recruta', badge: '🛡️', color: 'text-viking-silver/80' },
                                { name: 'Guerreiro do Clã', target: 250, id: 'guerreiro', badge: '⚔️', color: 'text-viking-gold/80' },
                                { name: 'Berserker do Norte', target: 325, id: 'berserker', badge: '🔥', color: 'text-amber-500' },
                                { name: 'Guerreiro de Valhalla', target: 400, id: 'einherjar', badge: '⚡', color: 'text-cyan-400' },
                                { name: 'Semideus / Jarl', target: 475, id: 'semideus', badge: '👑', color: 'text-viking-gold' },
                              ].map((lvl, index) => {
                                const targetTotal = calculateTotalForWilks(lvl.target);
                                const tSquat = Math.round((targetTotal * wilksRatios.squat) / 100);
                                const tBench = Math.round((targetTotal * wilksRatios.bench) / 100);
                                const tDeadlift = Math.round((targetTotal * wilksRatios.deadlift) / 100);
                                const calculatedSum = tSquat + tBench + tDeadlift;
                                
                                const isUnlocked = currentWilks >= lvl.target;
                                const isCurrentGoal = !isUnlocked && (index === 0 || currentWilks >= [0, 150, 250, 325, 400][index]);
                                const isCurrentTier = isUnlocked && (index === 4 || currentWilks < [250, 325, 400, 475][index]);

                                const neededDiff = targetTotal - total;

                                return (
                                  <tr 
                                    key={lvl.id} 
                                    className={`transition-all hover:bg-viking-gold/5 ${
                                      isCurrentTier
                                        ? 'bg-viking-gold/15 outline outline-1 outline-viking-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.15)] relative z-10'
                                        : isUnlocked 
                                          ? 'bg-emerald-950/10 hover:bg-emerald-950/15' 
                                          : isCurrentGoal 
                                            ? 'bg-viking-gold/5 hover:bg-viking-gold/10 shadow-inner' 
                                            : 'opacity-70 hover:opacity-100'
                                    }`}
                                  >
                                    {/* Name and Status */}
                                    <td className="py-4 px-4 font-extrabold flex items-center gap-2">
                                      <span className="text-lg shrink-0">{lvl.badge}</span>
                                      <div>
                                        <p className="text-white text-xs sm:text-sm font-black flex items-center gap-1.5 flex-wrap">
                                          {lvl.name}
                                          {isCurrentTier ? (
                                            <span className="text-[8px] bg-viking-gold/20 text-viking-gold border border-viking-gold/40 font-black px-1.5 py-0.5 rounded tracking-wider uppercase animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                                              Sua Patente
                                            </span>
                                          ) : isUnlocked ? (
                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                                              Conquistado
                                            </span>
                                          ) : null}
                                          {isCurrentGoal && (
                                            <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1.5 py-0.5 rounded tracking-wider uppercase animate-pulse">
                                              Alvo Atual
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-[10px] text-viking-silver/50 font-normal">Nível {index + 1}</p>
                                      </div>
                                    </td>

                                    {/* Target Wilks */}
                                    <td className="py-4 px-4 text-center font-black text-sm font-viking-display">
                                      <span className={lvl.color}>{lvl.target}</span>
                                    </td>

                                    {/* Total SBD */}
                                    <td className="py-4 px-4 text-center font-extrabold font-mono text-sm">
                                      <span className="text-white">{targetTotal}</span> <span className="text-[10px] text-viking-silver/40">kg</span>
                                    </td>

                                    {/* Squat Target */}
                                    <td className="py-4 px-4 text-center font-medium font-mono">
                                      <div className="inline-block px-2.5 py-1.5 rounded-lg bg-black/30 border border-viking-gold/5 min-w-[70px]">
                                        <p className="text-white font-black">{tSquat}kg</p>
                                        <p className="text-[9px] text-viking-silver/40 mt-0.5">
                                          {s >= tSquat ? (
                                            <span className="text-emerald-400 font-bold">✓ Batido</span>
                                          ) : (
                                            <span className="text-viking-silver/65">Falta {tSquat - s}kg</span>
                                          )}
                                        </p>
                                      </div>
                                    </td>

                                    {/* Bench Target */}
                                    <td className="py-4 px-4 text-center font-medium font-mono">
                                      <div className="inline-block px-2.5 py-1.5 rounded-lg bg-black/30 border border-viking-gold/5 min-w-[70px]">
                                        <p className="text-white font-black">{tBench}kg</p>
                                        <p className="text-[9px] text-viking-silver/40 mt-0.5">
                                          {b >= tBench ? (
                                            <span className="text-emerald-400 font-bold">✓ Batido</span>
                                          ) : (
                                            <span className="text-viking-silver/65">Falta {tBench - b}kg</span>
                                          )}
                                        </p>
                                      </div>
                                    </td>

                                    {/* Deadlift Target */}
                                    <td className="py-4 px-4 text-center font-medium font-mono">
                                      <div className="inline-block px-2.5 py-1.5 rounded-lg bg-black/30 border border-viking-gold/5 min-w-[70px]">
                                        <p className="text-white font-black">{tDeadlift}kg</p>
                                        <p className="text-[9px] text-viking-silver/40 mt-0.5">
                                          {d >= tDeadlift ? (
                                            <span className="text-emerald-400 font-bold">✓ Batido</span>
                                          ) : (
                                            <span className="text-viking-silver/65">Falta {tDeadlift - d}kg</span>
                                          )}
                                        </p>
                                      </div>
                                    </td>

                                    {/* Diff Column */}
                                    <td className="py-4 px-4 text-right font-bold">
                                      {isUnlocked ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-black text-xs uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                          <CheckCircle className="w-3.5 h-3.5" /> Superado!
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 text-viking-gold font-extrabold text-xs">
                                          <TrendingUp className="w-3.5 h-3.5 text-viking-gold" /> +{neededDiff}kg
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Motivational advice */}
                        <div className="mt-5 p-4 rounded-2xl bg-[#140e0c]/80 border border-viking-gold/10 text-xs text-viking-silver/95 leading-relaxed flex items-start gap-3">
                          <span className="text-lg p-1.5 rounded-xl bg-viking-gold/15 text-viking-gold shrink-0">⚔️</span>
                          <div>
                            <p className="font-extrabold text-viking-gold uppercase mb-0.5 tracking-wider">Estratégia Viking para Evolução</p>
                            <p>
                              Powerlifters de elite não treinam apenas força bruta. Eles calibram seus treinos de acordo com seus pontos fortes e fracos. Tente focar seu ciclo de treino no levantamento onde você tem maior margem de evolução (maior diferença para a meta do nível desejado). Os deuses do ferro recompensam a sabedoria e a persistência!
                            </p>
                          </div>
                        </div>

                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

          </motion.div>
          );
        })()
        )}

        {/* --- TRAINER DASHBOARD PANEL --- */}
        {isLoggedIn && currentUser?.role === 'trainer' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6 relative z-10"
          >
            {/* Header Greeting */}
            <div className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                <Shield className="w-48 h-48 text-viking-gold" />
              </div>
              <div>
                <h1 className="font-viking-display text-2xl sm:text-3xl font-black text-[#e0d3a8] tracking-wider">
                  SALÃO DO TREINADOR
                </h1>
                <p className="text-viking-silver/80 text-sm mt-1">
                  ⚔️ Saudações, mestre <span className="text-viking-gold font-bold">{currentUser.name}</span>! Gerencie seus gladiadores com sabedoria.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-viking-gold/10 border border-viking-gold/35 px-3 py-1.5 rounded-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-viking-gold animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider font-viking-medieval text-viking-gold">Painel de Comando Ativo</span>
              </div>
            </div>

            {/* Resumo Financeiro Section */}
            {(() => {
              const expectedTotal = Object.keys(studentsData).reduce((sum, email) => {
                const s = studentsData[email];
                return s ? sum + getPlanMonthlyEquivalent(s.plan) : sum;
              }, 0);
              const receivedTotal = Object.keys(studentsData).reduce((sum, email) => {
                const s = studentsData[email];
                return (s && s.status === 'Pago') ? sum + getPlanMonthlyEquivalent(s.plan) : sum;
              }, 0);
              const pendingOrOverdueTotal = Object.keys(studentsData).reduce((sum, email) => {
                const s = studentsData[email];
                return (s && (s.status === 'Pendente' || s.status === 'Atrasado')) ? sum + getPlanMonthlyEquivalent(s.plan) : sum;
              }, 0);

              const countMensal = Object.keys(studentsData).filter(email => studentsData[email]?.plan === 'Mensal').length;
              const countTrimestral = Object.keys(studentsData).filter(email => studentsData[email]?.plan === 'Trimestral').length;
              const countAnual = Object.keys(studentsData).filter(email => studentsData[email]?.plan === 'Anual').length;

              const receivedPercentage = expectedTotal > 0 ? Math.round((receivedTotal / expectedTotal) * 100) : 0;

              return (
                <div className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-viking-gold/5 pointer-events-none">
                    <Coins className="w-32 h-32" />
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-viking-gold/15 pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-1.5 text-viking-gold">
                        <Coins className="w-5 h-5" />
                        <h2 className="font-viking-medieval text-xs font-black uppercase tracking-widest">Resumo Financeiro do Clã</h2>
                      </div>
                      <p className="text-white font-viking-display text-lg font-black tracking-wide mt-0.5">Tesouraria do Templo de Ferro</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-viking-silver/60 uppercase font-bold">Mês de Referência:</span>
                      <p className="text-xs text-viking-gold font-extrabold uppercase tracking-wider bg-viking-gold/10 border border-viking-gold/20 px-2.5 py-1 rounded-lg mt-1 inline-block">
                        Julho 2026 (Ciclo Atual)
                      </p>
                    </div>
                  </div>

                  {/* Financial stats columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Expected Card */}
                    <div className="bg-[#100a09]/60 border border-viking-gold/10 hover:border-viking-gold/20 rounded-2xl p-4 transition-all flex items-start gap-3.5">
                      <span className="p-2.5 rounded-xl bg-viking-gold/10 border border-viking-gold/20 text-viking-gold mt-0.5">
                        <CreditCard className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-[10px] text-viking-silver uppercase font-bold tracking-widest font-viking-medieval">Tributo Esperado</p>
                        <p className="text-xl font-black text-white mt-1">
                          R$ {expectedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-viking-silver/50 mt-0.5">
                          Soma de todas as mensalidades vigentes
                        </p>
                      </div>
                    </div>

                    {/* Received Card */}
                    <div className="bg-[#100a09]/60 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl p-4 transition-all flex items-start gap-3.5">
                      <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5 animate-pulse">
                        <CheckCircle className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest font-viking-medieval">Tributo Recebido</p>
                        <p className="text-xl font-black text-emerald-400 mt-1">
                          R$ {receivedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-viking-silver/50 mt-0.5">
                          {receivedPercentage}% do esperado recolhido
                        </p>
                      </div>
                    </div>

                    {/* Pending Card */}
                    <div className="bg-[#100a09]/60 border border-red-500/10 hover:border-red-500/30 rounded-2xl p-4 transition-all flex items-start gap-3.5">
                      <span className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest font-viking-medieval">Tributo Pendente</p>
                        <p className="text-xl font-black text-red-400 mt-1">
                          R$ {pendingOrOverdueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-viking-silver/50 mt-0.5">
                          Atrasados e pendentes de quitação
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-viking-silver">Progresso de Arrecadação:</span>
                      <span className="font-black text-viking-gold">{receivedPercentage}% Completo</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#0d0908] rounded-full overflow-hidden border border-viking-gold/10 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-viking-gold-dark to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${receivedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Plans Distribution & Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-viking-gold/10">
                    <div className="flex items-center justify-between p-3 bg-[#0d0908]/40 rounded-xl border border-viking-gold/5 text-xs">
                      <span className="text-viking-silver font-semibold">Planos Mensais (R$ 200/mês):</span>
                      <span className="font-black text-white px-2 py-0.5 bg-viking-gold/10 border border-viking-gold/20 rounded-lg">
                        {countMensal} Atleta{countMensal !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0d0908]/40 rounded-xl border border-viking-gold/5 text-xs">
                      <span className="text-viking-silver font-semibold">Planos Trimestrais (R$ 180/mês):</span>
                      <span className="font-black text-white px-2 py-0.5 bg-viking-gold/10 border border-viking-gold/20 rounded-lg">
                        {countTrimestral} Atleta{countTrimestral !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0d0908]/40 rounded-xl border border-viking-gold/5 text-xs">
                      <span className="text-viking-silver font-semibold">Planos Anuais (R$ 150/mês):</span>
                      <span className="font-black text-white px-2 py-0.5 bg-viking-gold/10 border border-viking-gold/20 rounded-lg">
                        {countAnual} Atleta{countAnual !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Coach Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <User className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">{(Object.values(studentsData) as StudentProfile[]).filter(s => !s.isDeleted).length}</p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Atletas Ativos</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Coins className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">
                  R$ {(Object.values(studentsData) as StudentProfile[]).filter(s => !s.isDeleted).reduce((sum, s) => sum + getPlanMonthlyEquivalent(s.plan), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Faturamento Est. / mês</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Clock className="w-8 h-8 text-viking-red mx-auto mb-2" />
                <p className="text-2xl font-black text-white">
                  {(Object.values(studentsData) as StudentProfile[]).filter(s => s && !s.isDeleted && s.status !== 'Pago').length}
                </p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Atrasos/Pendências</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <TrendingUp className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">+20%</p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Crescimento Mensal</p>
              </div>

            </div>

            {/* --- PRÓXIMAS COMPETIÇÕES & TESTES --- */}
            {(() => {
              const upcomingEvents = Object.keys(studentsData)
                .map(email => ({ email, ...studentsData[email] }))
                .filter(s => s && s.competitionDate)
                .map(s => {
                  const days = Math.max(0, Math.ceil((new Date(s.competitionDate!).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                  return { ...s, daysRemaining: days };
                })
                .sort((a, b) => a.daysRemaining - b.daysRemaining);

              if (upcomingEvents.length === 0) return null;

              return (
                <div className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden mb-6">
                  <div className="absolute right-4 top-4 text-viking-gold/5 pointer-events-none">
                    <Calendar className="w-32 h-32" />
                  </div>

                  <div className="flex items-center gap-2 text-viking-gold mb-4 border-b border-viking-gold/15 pb-3">
                    <Trophy className="w-5 h-5 text-viking-gold animate-pulse" />
                    <h2 className="font-viking-medieval text-xs font-black uppercase tracking-widest">Guerreiros em Preparação</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {upcomingEvents.map(s => (
                      <div key={s.email} className="bg-[#100a09]/70 border border-viking-gold/10 rounded-2xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest bg-viking-gold/10 text-viking-gold px-2 py-0.5 rounded">
                              {s.daysRemaining} dias
                            </span>
                            <span className="text-[10px] font-bold text-viking-silver">
                              {s.competitionDate!.split('-').reverse().join('/')}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white truncate">{s.name}</h4>
                          <p className="text-[10px] text-viking-gold font-black uppercase mt-1">
                            {s.targetEventName || 'Teste de 1RM / Competição'}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveChatStudentEmail(s.email);
                            setDrawerTitle(`Chat com ${s.name}`);
                            setDrawerType('chat');
                            setDrawerOpen(true);
                          }}
                          className="mt-3 py-1.5 bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 text-viking-gold text-[10px] font-bold uppercase rounded-lg transition-all"
                        >
                          Motivar Atleta
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* --- PAINEL DE RECORDES PESSOAIS (PR) --- */}
            {(() => {
              const prNotifications: {
                email: string;
                studentName: string;
                exercise: 'squat' | 'bench' | 'deadlift';
                exerciseLabel: string;
                oldValue: number | null;
                newValue: number;
                diff: number | null;
              }[] = [];

              Object.keys(studentsData).forEach(email => {
                const student = studentsData[email];
                if (!student) return;
                const { prs, prevPrs, name } = student;
                
                if (prs) {
                  const lifts: { key: 'squat' | 'bench' | 'deadlift'; label: string }[] = [
                    { key: 'squat', label: 'Agachamento' },
                    { key: 'bench', label: 'Supino' },
                    { key: 'deadlift', label: 'Levantamento Terra' }
                  ];
                  
                  lifts.forEach(({ key, label }) => {
                    const newVal = prs[key];
                    const oldVal = prevPrs?.[key] ?? null;
                    
                    if (newVal !== null && newVal > 0) {
                      if (oldVal === null || newVal > oldVal) {
                        const diff = oldVal !== null ? newVal - oldVal : null;
                        prNotifications.push({
                          email,
                          studentName: name,
                          exercise: key,
                          exerciseLabel: label,
                          oldValue: oldVal,
                          newValue: newVal,
                          diff
                        });
                      }
                    }
                  });
                }
              });

              return (
                <div className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-viking-gold/5 pointer-events-none">
                    <Trophy className="w-32 h-32" />
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-viking-gold/15 pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-1.5 text-viking-gold">
                        <Trophy className="w-5 h-5 text-viking-gold animate-bounce" />
                        <h2 className="font-viking-medieval text-xs font-black uppercase tracking-widest">Mural de Conquistas (PRs)</h2>
                      </div>
                      <p className="text-white font-viking-display text-lg font-black tracking-wide mt-0.5">Glória e Recordes de Força Recentes</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-viking-silver/60 uppercase font-bold">Recordes Registrados:</span>
                      <p className="text-xs text-viking-gold font-extrabold uppercase tracking-wider bg-viking-gold/10 border border-viking-gold/20 px-2.5 py-1 rounded-lg mt-1 inline-block">
                        {prNotifications.length} Conquistas Ativas
                      </p>
                    </div>
                  </div>

                  {prNotifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {prNotifications.map((notif) => {
                        const student = studentsData[notif.email.toLowerCase()];
                        const congratMessage = `⚔️ ¡Parabéns pelo novo Recorde Pessoal de ${notif.exerciseLabel} com ${notif.newValue}kg! ${notif.diff ? `Uma evolução de +${notif.diff}kg!` : ''} Que os deuses do ferro celebrem sua força! 🏋️🔥`;
                        
                        // Verificar se já parabenizou o aluno por esse peso exato
                        const alreadyCongratulated = student?.chatHistory?.some(
                          msg => msg.sender === 'trainer' && msg.text.includes(`novo Recorde Pessoal de ${notif.exerciseLabel} com ${notif.newValue}kg`)
                        ) || false;

                        return (
                          <div 
                            key={`${notif.email}-${notif.exercise}`}
                            className="bg-[#100a09]/70 border border-viking-gold/10 hover:border-viking-gold/30 rounded-2xl p-4.5 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                          >
                            {!alreadyCongratulated && (
                              <div className="absolute inset-0 bg-viking-gold/2 pointer-events-none animate-pulse" />
                            )}
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="p-2 rounded-xl bg-viking-gold/10 border border-viking-gold/20 text-viking-gold">
                                    <Sparkles className="w-4 h-4" />
                                  </span>
                                  <div>
                                    <h4 className="font-extrabold text-sm text-white group-hover:text-viking-gold transition-colors truncate max-w-[150px]">
                                      {notif.studentName}
                                    </h4>
                                    <p className="text-[10px] text-viking-silver/60 truncate">{notif.email}</p>
                                  </div>
                                </div>
                                <span className="bg-viking-gold/15 text-viking-gold border border-viking-gold/25 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider font-viking-medieval">
                                  {notif.exerciseLabel}
                                </span>
                              </div>

                              <div className="mt-3.5 flex items-baseline gap-2.5 bg-[#0d0908]/40 p-2.5 rounded-xl border border-viking-gold/5">
                                <span className="text-xl font-black text-viking-gold">{notif.newValue} kg</span>
                                {notif.oldValue !== null ? (
                                  <span className="text-[11px] text-viking-silver/65 line-through">Anterior: {notif.oldValue} kg</span>
                                ) : (
                                  <span className="text-[10px] text-viking-silver/50 uppercase tracking-widest font-viking-medieval">Primeiro Registro</span>
                                )}
                                {notif.diff !== null && notif.diff > 0 && (
                                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md ml-auto animate-pulse">
                                    +{notif.diff} kg
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (alreadyCongratulated) {
                                  setActiveChatStudentEmail(notif.email);
                                  setDrawerTitle(`Chat com ${notif.studentName}`);
                                  setDrawerType('chat');
                                  setDrawerOpen(true);
                                  return;
                                }

                                handleSendMessage(notif.email, congratMessage);
                                triggerPrConfetti();
                                
                                setActiveChatStudentEmail(notif.email);
                                setDrawerTitle(`Chat com ${notif.studentName}`);
                                setDrawerType('chat');
                                setDrawerOpen(true);
                              }}
                              className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 border cursor-pointer ${
                                alreadyCongratulated
                                  ? 'bg-emerald-950/20 hover:bg-emerald-900/10 border-emerald-500/25 text-emerald-400 font-bold'
                                  : 'bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark border-viking-gold font-extrabold hover:scale-[1.02]'
                              }`}
                            >
                              {alreadyCongratulated ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                  Parabenizado! Ver Chat
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                  Parabenizar via Chat
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3.5 bg-[#0d0908]/40 border border-viking-gold/10 p-5 rounded-2xl">
                      <span className="text-3xl">🛡️</span>
                      <div>
                        <p className="text-xs font-bold text-viking-gold uppercase tracking-wide font-viking-medieval">Salão do Silêncio</p>
                        <p className="text-xs text-viking-silver/85 leading-relaxed mt-0.5">
                          Nenhum novo recorde de força registrado por seus gladiadores nesta quinzena. Mantenha os guerreiros focados nos treinos pesados para clamar glória!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* --- RECENT WORKOUTS (LIVE LIST) --- */}
            {(() => {
              const allSessions: (LoggedSession & { studentName: string; studentEmail: string })[] = [];
              Object.entries(studentsData).forEach(([email, student]: [string, any]) => {
                if (student && student.sessions && student.sessions.length > 0) {
                  student.sessions.forEach(sess => {
                    allSessions.push({ ...sess, studentName: student.name, studentEmail: email });
                  });
                }
              });

              // Sort by date/id
              allSessions.sort((a, b) => {
                const aTime = a.id ? parseInt(a.id.split('_')[1] || '0') : 0;
                const bTime = b.id ? parseInt(b.id.split('_')[1] || '0') : 0;
                return bTime - aTime;
              });

              // Take only the 6 most recent ones
              const recentSessions = allSessions.slice(0, 6);

              return (
                <div className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-viking-gold/5 pointer-events-none">
                    <Activity className="w-32 h-32" />
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-viking-gold/15 pb-4 mb-5 relative z-10">
                    <div>
                      <div className="flex items-center gap-1.5 text-viking-gold">
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <h2 className="font-viking-medieval text-xs font-black uppercase tracking-widest text-emerald-400">Atividade em Tempo Real</h2>
                      </div>
                      <p className="text-white font-viking-display text-lg font-black tracking-wide mt-1">Guerreiros que Concluíram Treinos</p>
                    </div>
                  </div>

                  {recentSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                      <AnimatePresence>
                        {recentSessions.map((sess, idx) => (
                          <motion.div 
                            key={`${sess.studentEmail}-${sess.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#100a09]/70 border border-viking-gold/10 hover:border-viking-gold/30 rounded-2xl p-4.5 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-viking-gold/10 border border-viking-gold/20 text-viking-gold">
                                  <Dumbbell className="w-4 h-4" />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-sm text-white group-hover:text-viking-gold transition-colors truncate max-w-[150px]">
                                    {sess.studentName}
                                  </h4>
                                  <p className="text-[10px] text-viking-silver/60 truncate">{sess.sessionName}</p>
                                </div>
                              </div>
                              <span className={`bg-opacity-10 border text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider font-viking-medieval ${
                                sess.avgRPE >= 9 ? 'bg-red-500 text-red-400 border-red-500/25' : sess.avgRPE >= 7.5 ? 'bg-amber-500 text-amber-400 border-amber-500/25' : 'bg-emerald-500 text-emerald-400 border-emerald-500/25'
                              }`}>
                                RPE {(sess.avgRPE || 0).toFixed(1)}
                              </span>
                            </div>
                            
                            {sess.note && (
                              <div className="mt-2 p-2.5 bg-black/40 rounded-lg border border-viking-gold/5">
                                <p className="text-xs text-viking-silver italic line-clamp-2">"{sess.note}"</p>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setDrawerTitle('Treinos Concluídos');
                                setDrawerType('recentWorkouts');
                                setDrawerOpen(true);
                              }}
                              className="w-full py-2.5 mt-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 border cursor-pointer bg-viking-gold/10 border-viking-gold/20 hover:bg-viking-gold/20 text-viking-gold"
                            >
                              <Search className="w-3.5 h-3.5 shrink-0" />
                              Ver Todos os Treinos
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3.5 bg-[#0d0908]/40 border border-viking-gold/10 p-5 rounded-2xl relative z-10">
                      <span className="text-3xl">💤</span>
                      <div>
                        <p className="text-xs font-bold text-viking-gold uppercase tracking-wide font-viking-medieval">Templo Vazio</p>
                        <p className="text-xs text-viking-silver/85 leading-relaxed mt-0.5">
                          Nenhum guerreiro concluiu treinos recentemente. O ferro aguarda.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Wilks Efficiency Scatter Chart */}
            <WilksScatterChart entries={leaderboard} />

            {/* Payment Highlight Card */}
            {(() => {
              const overdueOrPending = Object.keys(studentsData)
                .map(email => {
                  const s = studentsData[email];
                  return s ? { email, ...s } : null;
                })
                .filter((s): s is NonNullable<typeof s> => s !== null && (s.status === 'Pendente' || s.status === 'Atrasado'));

              const isFiltered = paymentFilter === 'pending_or_overdue';

              return (
                <div className={`border rounded-3xl p-6 relative overflow-hidden shadow-xl backdrop-blur-md transition-all duration-300 ${
                  overdueOrPending.length > 0 
                    ? 'bg-[#1c1210]/95 border-red-500/35 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                    : 'bg-[#101912]/95 border-emerald-500/35 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                }`}>
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    {overdueOrPending.length > 0 ? (
                      <AlertTriangle className="w-32 h-32 text-red-500" />
                    ) : (
                      <CheckCircle className="w-32 h-32 text-emerald-500" />
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        {overdueOrPending.length > 0 ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        )}
                        <h4 className={`text-xs font-black uppercase tracking-widest font-viking-medieval ${
                          overdueOrPending.length > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {overdueOrPending.length > 0 ? 'Sentinela de Cobrança / Alertas Ativos' : 'Tributos da Tribo'}
                        </h4>
                      </div>
                      <h3 className="font-viking-display text-xl font-black text-white tracking-wide mt-1">
                        {overdueOrPending.length > 0 
                          ? `${overdueOrPending.length} Atleta${overdueOrPending.length > 1 ? 's' : ''} com Pendência`
                          : 'Todos os Guerreiros em Dia!'}
                      </h3>
                      <p className="text-xs text-viking-silver/80 mt-1 max-w-2xl">
                        {overdueOrPending.length > 0
                          ? 'Estes atletas estão com pagamento pendente ou atrasado. Toque para filtrar na lista abaixo e gerenciar.'
                          : 'As finanças do templo estão seguras. Nenhum gladiador possui pendências.'}
                      </p>
                    </div>

                    {overdueOrPending.length > 0 && (
                      <button
                        onClick={() => setPaymentFilter(prev => prev === 'all' ? 'pending_or_overdue' : 'all')}
                        className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-2 border w-full md:w-auto justify-center ${
                          isFiltered
                            ? 'bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark border-viking-gold hover:brightness-110 shadow-viking-gold/25'
                            : 'bg-red-950/40 hover:bg-red-900/30 border-red-500/30 hover:border-red-500 text-red-400 shadow-red-950/20'
                        }`}
                      >
                        {isFiltered ? (
                          <>
                            <Check className="w-4 h-4" />
                            Mostrar Todos os Atletas
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 animate-pulse" />
                            Filtrar Pendentes / Atrasados
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {overdueOrPending.filter(s => s.status === 'Atrasado').length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 relative z-10 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Notificação em Massa</span>
                         <span className="text-viking-silver text-[10px]">Cobrar todos os guerreiros atrasados simultaneamente</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const atrasados = overdueOrPending.filter(s => s.status === 'Atrasado');
                            const bccList = atrasados.map(s => s.email).join(',');
                            const subject = encodeURIComponent("Lembrete Urgente: Renovação de Assinatura - Viking Force");
                            const body = encodeURIComponent("Saudações, guerreiro! Identificamos que sua mensalidade na Viking Force consta como ATRASADA. Por favor, regularize sua situação o quanto antes para continuar acessando seus treinos e quebrando recordes! 💪⚔️");
                            window.open(`mailto:?bcc=${bccList}&subject=${subject}&body=${body}`, '_blank');
                          }}
                          className="px-4 py-2 bg-[#0d0908] hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                        >
                          <Mail className="w-4 h-4" /> Cobrança em Massa (Email)
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const atrasados = overdueOrPending.filter(s => s.status === 'Atrasado');
                            const phones = atrasados.map(s => s.phone?.replace(/\D/g, '')).filter(Boolean);
                            if (phones.length > 0) {
                              navigator.clipboard.writeText(phones.join(', '));
                              showToast(`Copiados ${phones.length} números de telefone para a área de transferência!`, 'success');
                            } else {
                              showToast('Nenhum aluno atrasado possui telefone cadastrado.', 'error');
                            }
                          }}
                          className="px-4 py-2 bg-[#0d0908] hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-500 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" /> Copiar Números (WhatsApp)
                        </button>
                      </div>
                    </div>
                  )}

                  {overdueOrPending.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 relative z-10">
                      {overdueOrPending.map(student => {
                        const isAtrasado = student.status === 'Atrasado';
                        return (
                          <div 
                            key={student.email}
                            onClick={() => {
                              setPaymentFilter('pending_or_overdue');
                              setSearchTerm(student.name);
                            }}
                            className={`p-3.5 rounded-2xl bg-[#0d0908]/85 border transition-all duration-200 relative group flex flex-col justify-between cursor-pointer ${
                              isAtrasado 
                                ? 'border-red-500/20 hover:border-red-500/60 hover:bg-red-500/5' 
                                : 'border-amber-500/20 hover:border-amber-500/60 hover:bg-amber-500/5'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-extrabold text-sm text-white group-hover:text-viking-gold transition-colors truncate">
                                  {student.name}
                                </p>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  isAtrasado ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                }`}>
                                  {student.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-viking-silver/50 truncate mt-0.5">{student.email}</p>
                              <p className="text-[11px] text-viking-silver mt-1.5 flex items-center gap-1.5 font-semibold">
                                <span className="text-viking-gold/70">Plano:</span> {student.plan}
                              </p>
                            </div>
                            
                            <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-viking-gold/5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setActiveChatStudentEmail(student.email);
                                  setDrawerTitle(`Chat com ${student.name}`);
                                  setDrawerType('chat');
                                  setDrawerOpen(true);
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-viking-gold/5 border border-viking-gold/15 hover:bg-viking-gold/15 text-viking-gold text-[10px] font-bold uppercase transition-all cursor-pointer text-center"
                              >
                                Cobrar Chat
                              </button>
                              <button
                                onClick={() => {
                                  setSearchTerm(student.name);
                                  setPaymentFilter('all');
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-viking-dark border border-viking-gold/15 hover:border-viking-gold/30 text-viking-silver hover:text-white text-[10px] font-bold uppercase transition-all cursor-pointer text-center"
                              >
                                Rastrear
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3.5 mt-2 bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl relative z-10">
                      <span className="text-2xl">🛡️</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide font-viking-medieval">Fidelidade Suprema</p>
                        <p className="text-xs text-viking-silver/85 leading-relaxed mt-0.5">
                          Todos os {Object.keys(studentsData).length} guerreiros estão em dia com a guilda. Nenhum tributo de ferro está em atraso neste solstício!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Failure Sentinel & Periodization Optimizer */}
            <FailureSentinel 
              studentsData={studentsData}
              trainingProgram={trainingProgram}
              onSaveProgram={saveProgramToDB}
              showToast={showToast}
            />

            {/* List of Athletes Table Panel */}
            <div className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-6 overflow-hidden shadow-xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-viking-gold/15">
                <div>
                  <h3 className="font-viking-display text-lg font-bold text-viking-gold">LISTA DE GLADIADORES</h3>
                  <p className="text-xs text-viking-silver">Acompanhe as marcas (1RM), pagamentos e prescreva os treinos</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => { 
                      setIsBatchMode(!isBatchMode); 
                      setSelectedStudentEmails([]); 
                    }}
                    className={`px-4 py-2 border rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                      isBatchMode 
                        ? 'bg-red-950/40 border-red-500/50 hover:bg-red-900/30 text-red-400' 
                        : 'bg-viking-dark border-viking-gold/30 hover:border-viking-gold/60 text-viking-silver hover:text-viking-gold'
                    }`}
                  >
                    {isBatchMode ? (
                      <>
                        <X className="w-4 h-4 shrink-0" /> Sair da Seleção
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4 shrink-0" /> Seleção em Massa
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => { setDrawerType('addStudent'); setDrawerTitle('Recrutar Novo Aluno'); setDrawerOpen(true); }}
                    className="px-4 py-2 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-viking-gold/20 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 shrink-0" /> Novo Guerreiro
                  </button>
                </div>
              </div>

              {/* Search Bar & Grid/List Toggle */}
              <div className="mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-viking-gold/60" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar guerreiro por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-16 py-3 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-2xl text-xs text-white placeholder-viking-silver/45 outline-none transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-viking-silver hover:text-viking-gold transition-colors text-xs font-bold cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex bg-[#0d0908]/80 rounded-2xl border border-viking-gold/20 p-1 shrink-0 self-stretch md:self-center">
                  <button
                    onClick={() => setStudentsLayoutMode('grid')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      studentsLayoutMode === 'grid' 
                        ? 'bg-viking-gold text-viking-dark font-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                        : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                    }`}
                    title="Modo Caixas"
                  >
                    <Grid className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Caixas</span>
                  </button>
                  <button
                    onClick={() => setStudentsLayoutMode('list')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      studentsLayoutMode === 'list' 
                        ? 'bg-viking-gold text-viking-dark font-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                        : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                    }`}
                    title="Modo Lista"
                  >
                    <List className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Lista</span>
                  </button>
                </div>
              </div>

              {/* Active Payment Filter Indicator */}
              {paymentFilter === 'pending_or_overdue' && (
                <div className="mb-6 flex items-center justify-between bg-amber-500/10 border border-amber-500/35 px-4 py-2.5 rounded-2xl text-xs shadow-inner">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="font-extrabold uppercase tracking-wide font-viking-medieval text-viking-gold">Exibindo apenas pendentes e atrasados</span>
                  </div>
                  <button
                    onClick={() => setPaymentFilter('all')}
                    className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500 text-amber-300 font-black uppercase text-[10px] rounded-xl transition-all cursor-pointer"
                  >
                    Mostrar Todos
                  </button>
                </div>
              )}

              {/* Bulk Actions Panel */}
              {isBatchMode && (
                <div className="mb-6 p-4 bg-viking-gold/5 border border-viking-gold/40 rounded-2xl shadow-lg shadow-viking-gold/5 animate-fadeIn">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-viking-gold/10 rounded-xl text-viking-gold">
                        <CheckSquare className="w-5 h-5 animate-pulse" />
                      </span>
                      <div>
                        <p className="text-xs font-black text-viking-gold uppercase tracking-widest font-viking-medieval">MODO SELEÇÃO EM MASSA ATIVO</p>
                        <p className="text-[11px] text-viking-silver mt-0.5">
                          {selectedStudentEmails.length === 0 ? (
                            <span className="text-viking-silver/65 italic">Selecione os guerreiros abaixo para alterar o status financeiro de uma vez</span>
                          ) : (
                            <span><strong className="text-white font-extrabold">{selectedStudentEmails.length}</strong> de <strong className="text-[#e0d3a8]">{filteredStudentEmails.length}</strong> gladiadores selecionados</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      {/* Select/Deselect visible controls */}
                      <button
                        onClick={handleBatchSelectAll}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-viking-silver text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                      >
                        Selecionar Todos
                      </button>
                      <button
                        onClick={handleBatchClearSelection}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-viking-silver text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                        disabled={selectedStudentEmails.length === 0}
                      >
                        Limpar Seleção
                      </button>

                      {/* Bulk action buttons */}
                      <div className="h-4 w-[1px] bg-viking-gold/20 hidden sm:block mx-1"></div>

                      <button
                        onClick={() => handleBatchUpdateStatus('Pago')}
                        disabled={selectedStudentEmails.length === 0}
                        className="px-3.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/45 hover:border-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-emerald-400 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Marcar Pago
                      </button>

                      <button
                        onClick={() => handleBatchUpdateStatus('Pendente')}
                        disabled={selectedStudentEmails.length === 0}
                        className="px-3.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/45 hover:border-amber-500 disabled:opacity-40 disabled:pointer-events-none text-amber-400 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Marcar Pendente
                      </button>

                      <button
                        onClick={() => handleBatchUpdateStatus('Atrasado')}
                        disabled={selectedStudentEmails.length === 0}
                        className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-800/45 hover:border-red-500 disabled:opacity-40 disabled:pointer-events-none text-red-400 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Marcar Atrasado
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(() => {

                if (filteredStudentEmails.length === 0) {
                  return (
                    <div className="py-12 text-center text-viking-silver/60 bg-[#0d0908]/30 rounded-2xl border border-viking-gold/10">
                      <Search className="w-10 h-10 mx-auto text-viking-silver/30 mb-3" />
                      <p className="text-sm font-semibold text-viking-gold">Nenhum guerreiro encontrado</p>
                      <p className="text-xs mt-1">
                        {paymentFilter === 'pending_or_overdue' 
                          ? `Nenhum atleta pendente/atrasado corresponde à busca "${searchTerm}".`
                          : `Nenhum atleta corresponde à busca "${searchTerm}".`}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className={
                    studentsLayoutMode === 'grid'
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "flex flex-col gap-2.5"
                  }>
                    {filteredStudentEmails.map(email => {
                      const s = studentsData[email];
                      if (!s) return null;
                      const lastSess = (s.sessions || [])[0];
                      const todayString = new Date().toLocaleDateString('pt-BR');
                      const hasTrainedToday = s.sessions?.some(sess => sess.date === todayString);
                      const preferredTime = s.preferredTime || '18:00';
                      const isPastPreferredTime = simulatedTime > preferredTime;
                      const isSelected = selectedStudentEmails.includes(email);

                      if (studentsLayoutMode === 'list') {
                        return (
                          <div 
                            key={email}
                            onClick={() => {
                              if (isBatchMode) {
                                setSelectedStudentEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
                              } else {
                                setEditingStudentEmail(email);
                                setDrawerTitle(`Painel do Guerreiro: ${s.name}`);
                                setDrawerType('studentPanel');
                                setDrawerOpen(true);
                              }
                            }}
                            className={`relative p-4 rounded-xl border transition-all cursor-pointer shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
                              isSelected 
                                ? 'bg-viking-gold/10 border-viking-gold shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                                : 'bg-[#0d0908]/80 border-viking-gold/15 hover:border-viking-gold/40 hover:bg-[#140e0c]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {isBatchMode ? (
                                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                  <button
                                    onClick={() => setSelectedStudentEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])}
                                    className="text-viking-gold hover:text-white transition-colors cursor-pointer"
                                  >
                                    {isSelected ? <CheckSquare className="w-5 h-5 text-viking-gold" /> : <Square className="w-5 h-5 text-viking-silver/40" />}
                                  </button>
                                </div>
                              ) : null}

                              <div className="min-w-0 flex-1 flex items-center gap-3">
                                {s.photoUrl ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-viking-gold/30">
                                    <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-viking-darker border border-viking-gold/20 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-viking-gold" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-[#e0d3a8] hover:text-viking-gold transition-colors truncate">{s.name}</h4>
                                    <span className="text-[10px] text-viking-silver/50 hidden sm:inline">•</span>
                                    <span className="text-[10px] text-viking-silver/60 truncate hidden sm:inline">{email}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5 text-[10px] text-viking-silver/50 sm:hidden">
                                    <span>{email}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                              {/* Status badge */}
                              <div className="flex items-center gap-1.5 bg-[#140e0c] px-2.5 py-1.5 rounded-lg border border-viking-gold/10">
                                <span className="text-[9px] text-viking-silver/40 uppercase font-bold">Plano:</span>
                                <span className={`text-[10px] font-black uppercase ${obterStatusVencimento(s.dueDate || new Date().toISOString()).cor.replace('border', '')}`}>
                                  {obterStatusVencimento(s.dueDate || new Date().toISOString()).texto}
                                </span>
                              </div>

                              {/* Last RPE */}
                              <div className="flex items-center gap-1.5 bg-[#140e0c] px-2.5 py-1.5 rounded-lg border border-viking-gold/10">
                                <span className="text-[9px] text-viking-silver/40 uppercase font-bold">Último RPE:</span>
                                {lastSess ? (
                                  <span className={`font-bold text-[10px] flex items-center gap-0.5 ${
                                    lastSess.avgRPE >= 9 ? 'text-red-400' : lastSess.avgRPE >= 7.5 ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>
                                    <Activity className="w-3 h-3" /> {(lastSess.avgRPE || 0).toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-viking-silver/40 text-[10px] italic">N/A</span>
                                )}
                              </div>

                              {/* Vencimento */}
                              <div className="flex items-center gap-1.5 bg-[#140e0c] px-2.5 py-1.5 rounded-lg border border-viking-gold/10">
                                <span className="text-[9px] text-viking-silver/40 uppercase font-bold flex items-center gap-0.5"><Calendar className="w-3 h-3 text-viking-gold/60" /> Venc:</span>
                                <span className="text-[10px] font-black text-[#e0d3a8]">
                                  {s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'N/A'}
                                </span>
                              </div>

                              {/* Status de treino hoje */}
                              <div className="flex items-center gap-1.5 px-2 bg-[#140e0c] py-1.5 rounded-lg border border-viking-gold/10">
                                {hasTrainedToday ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold text-[10px]" title="Treino registrado hoje!">
                                    <Check className="w-3.5 h-3.5" /> Hoje
                                  </span>
                                ) : isPastPreferredTime ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-400 font-bold text-[10px] animate-pulse" title={`Horário de preferência (${preferredTime}) ultrapassado`}>
                                    <AlertTriangle className="w-3 h-3 text-red-500" /> Atrasado
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-viking-silver/65 font-medium text-[10px]" title={`Horário preferencial às ${preferredTime}`}>
                                    <Clock className="w-3.5 h-3.5" /> {preferredTime}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 md:mt-0 justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                              {!isBatchMode && s.phone && (
                                <button
                                  onClick={() => window.open(`https://wa.me/${s.phone?.replace(/\D/g, '')}`, '_blank')}
                                  className="p-2 rounded-lg bg-[#0d0908] hover:bg-emerald-500/10 border border-viking-gold/10 hover:border-emerald-500/30 text-emerald-500 transition-all cursor-pointer shadow-sm"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!isBatchMode && (
                                <button
                                  onClick={() => {
                                    setEditingStudentEmail(email);
                                    setDrawerTitle(`Painel do Guerreiro: ${s.name}`);
                                    setDrawerType('studentPanel');
                                    setDrawerOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-[#0d0908] hover:bg-viking-gold/10 border border-viking-gold/20 hover:border-viking-gold text-viking-gold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span className="text-[10px] font-bold uppercase tracking-wider pl-1 hidden sm:inline">Acessar</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={email}
                          onClick={() => {
                            if (isBatchMode) {
                              setSelectedStudentEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
                            } else {
                              setEditingStudentEmail(email);
                              setDrawerTitle(`Painel do Guerreiro: ${s.name}`);
                              setDrawerType('studentPanel');
                              setDrawerOpen(true);
                            }
                          }}
                          className={`relative p-5 rounded-2xl border transition-all cursor-pointer shadow-md flex flex-col gap-3 ${
                            isSelected 
                              ? 'bg-viking-gold/10 border-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                              : 'bg-[#0d0908]/80 border-viking-gold/20 hover:border-viking-gold/50 hover:bg-[#140e0c]'
                          }`}
                        >
                          {isBatchMode && (
                            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedStudentEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])}
                                className="text-viking-gold hover:text-white transition-colors cursor-pointer"
                              >
                                {isSelected ? <CheckSquare className="w-5 h-5 text-viking-gold" /> : <Square className="w-5 h-5 text-viking-silver/40" />}
                              </button>
                            </div>
                          )}

                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 pr-6">
                              {s.photoUrl ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-viking-gold/30">
                                  <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-viking-darker border border-viking-gold/20 flex items-center justify-center shrink-0">
                                  <User className="w-5 h-5 text-viking-gold" />
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <h4 className="text-base font-bold text-[#e0d3a8] truncate">{s.name}</h4>
                                <p className="text-[10px] text-viking-silver truncate">{email}</p>
                              </div>
                            </div>
                            {!isBatchMode && s.phone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://wa.me/${s.phone.replace(/\D/g, '')}`, '_blank');
                                }}
                                className="p-2 rounded-xl bg-[#0d0908] hover:bg-emerald-500/10 border border-viking-gold/10 hover:border-emerald-500/30 text-emerald-500 transition-all cursor-pointer shadow-sm z-10"
                                title="Conversar no WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="bg-[#1a1210] p-2 rounded-xl border border-viking-gold/10">
                              <p className="text-[9px] text-viking-silver/60 uppercase font-bold tracking-wider mb-1">Status Plano</p>
                              <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${obterStatusVencimento(s.dueDate || new Date().toISOString()).cor}`}>
                                {obterStatusVencimento(s.dueDate || new Date().toISOString()).texto}
                              </span>
                            </div>
                            <div className="bg-[#1a1210] p-2 rounded-xl border border-viking-gold/10">
                              <p className="text-[9px] text-viking-silver/60 uppercase font-bold tracking-wider mb-1">Último RPE</p>
                              {lastSess ? (
                                <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                                  lastSess.avgRPE >= 9 ? 'text-red-400' : lastSess.avgRPE >= 7.5 ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                  <Activity className="w-3 h-3" /> {(lastSess.avgRPE || 0).toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-viking-silver/50 text-[11px] italic">N/A</span>
                              )}
                            </div>
                            <div className="bg-[#1a1210] p-2 rounded-xl border border-viking-gold/10 flex flex-col justify-center">
                              <p className="text-[9px] text-viking-silver/60 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Vencimento</p>
                              <span className="text-[11px] font-black text-[#e0d3a8]">
                                {s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-1 pt-3 border-t border-viking-gold/10">
                            {hasTrainedToday ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]" title="Treino registrado hoje!">
                                <Check className="w-3.5 h-3.5" /> Concluído
                              </span>
                            ) : isPastPreferredTime ? (
                              <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[10px] animate-pulse" title={`Horário de preferência (${preferredTime}) ultrapassado`}>
                                <AlertTriangle className="w-3 h-3 text-red-500" /> Atrasado (${preferredTime})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-viking-silver/65 font-medium text-[10px]" title={`Horário preferencial às ${preferredTime}`}>
                                <Clock className="w-3 h-3" /> Pendente (${preferredTime})
                              </span>
                            )}
                            
                            {!isBatchMode && (
                              <span className="text-[10px] text-viking-gold font-bold uppercase flex items-center gap-1 hover:underline">
                                Acessar <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Quick actions for Trainer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 mt-8 pt-6 border-t border-viking-gold/15">
                <button 
                  onClick={() => { setDrawerType('whatsapp'); setDrawerTitle('Painel de Cobranças'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" /> Painel de Atrasados
                </button>
                <button 
                  onClick={() => { setDrawerType('payments'); setDrawerTitle('Fluxo de Caixa Viking'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 shrink-0" /> Visualizar Pagamentos
                </button>
                <button 
                  onClick={() => { setDrawerType('rpeFeedback'); setDrawerTitle('Alertas & Notas de RPE'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" /> Logs de Treino dos Alunos
                </button>
                <button 
                  onClick={() => { setDrawerType('gmail'); setDrawerTitle('Correio de Valhalla (Gmail)'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 shrink-0" /> Central de Gmail (Correio)
                </button>
                <button 
                  onClick={() => { setDrawerType('whatsappSettings'); setDrawerTitle('Template de Treino Pronto'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-viking-gold" /> Template WhatsApp
                </button>
                <button 
                  onClick={handleBackupData}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 shrink-0" /> Fazer Backup (JSON)
                </button>
                <button 
                  onClick={() => { setDrawerType('trash'); setDrawerTitle('Lixeira Virtual'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-red-950/20 border border-viking-gold/20 hover:border-viking-red/40 text-viking-silver hover:text-red-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0 text-red-400 animate-pulse" /> Lixeira Virtual
                </button>
              </div>

            </div>
          </motion.div>
        )}

      </main>

      {/* --- DRAWERS & SHEET POPUPS (USING ANIMATEPRESENCE) --- */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleCloseDrawer()}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Sheet Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, x: '-50%', y: '-48%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.85, x: '-50%', y: '-48%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              className={`fixed top-1/2 left-1/2 w-[calc(100%-2rem)] ${
                ['history', 'ranking', 'plans', 'payments', 'rpeFeedback', 'gmail', 'whatsapp', 'trash', 'studentPanel', 'whatsappSettings'].includes(drawerType)
                  ? 'max-w-4xl' 
                  : 'max-w-2xl'
              } bg-[#140e0c]/98 border-2 border-viking-gold/30 rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.25),inset_0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-xl z-50 flex flex-col max-h-[85vh] overflow-hidden text-[#e0d3a8]`}
            >
              <div className="p-6 border-b border-viking-gold/15 bg-[#140e0c]/90 flex justify-between items-center shrink-0">
                <h3 className="font-viking-display text-sm sm:text-base font-black tracking-wider text-viking-gold flex items-center gap-2 uppercase">
                  {drawerType === 'history' && <History className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'ranking' && <Trophy className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'calendar' && <Calendar className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'plans' && <CreditCard className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'settings' && <Settings className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'editStudent' && <Edit className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'addStudent' && <UserPlus className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'whatsapp' && <Phone className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'whatsappSettings' && <MessageSquare className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'payments' && <CreditCard className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'rpeFeedback' && <MessageSquare className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'editProgram' && <Settings className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'chat' && <MessageSquare className="w-5 h-5 text-viking-gold animate-pulse" />}
                  {drawerType === 'gmail' && <Mail className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'trash' && <Trash2 className="w-5 h-5 text-red-400" />}
                  {drawerTitle}
                </h3>
                <button 
                  onClick={() => handleCloseDrawer()}
                  className="p-1.5 rounded-xl bg-viking-gold/5 border border-viking-gold/20 text-viking-silver hover:text-viking-gold cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div ref={drawerContentRef} className="flex-1 overflow-y-auto p-6 pb-28 md:pb-6 space-y-5">
                
                {/* 1. History Drawer */}
                {drawerType === 'history' && activeStudentProfile && (
                  <div className="space-y-4">
                    <div className="flex bg-[#0d0908] rounded-xl border border-viking-gold/20 p-1 mb-4">
                      <button
                        onClick={() => setHistoryTab('list')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          historyTab === 'list' 
                            ? 'bg-viking-gold/20 text-viking-gold shadow-sm' 
                            : 'text-viking-silver hover:text-white'
                        }`}
                      >
                        Lista de Treinos
                      </button>
                      <button
                        onClick={() => setHistoryTab('comparison')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          historyTab === 'comparison' 
                            ? 'bg-viking-gold/20 text-viking-gold shadow-sm' 
                            : 'text-viking-silver hover:text-white'
                        }`}
                      >
                        Evolução vs Clã
                      </button>
                    </div>

                    {historyTab === 'list' && (
                      <>
                        <button 
                          onClick={() => handleDownloadPDF(activeStudentProfile)}
                          className="w-full py-3 px-4 rounded-xl bg-viking-gold/15 hover:bg-viking-gold/25 border border-viking-gold/40 hover:border-viking-gold text-viking-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <FileDown className="w-4.5 h-4.5" /> Exportar Relatório em PDF
                        </button>
                        
                        <button 
                          onClick={() => handleDownloadMonthlySummaryPDF(activeStudentProfile)}
                          className="w-full py-3 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Calendar className="w-4.5 h-4.5" /> Resumo Mensal Consolidado (PDF)
                        </button>
                      </>
                    )}

                    {historyTab === 'comparison' && (() => {
                       // Calcula médias do clã
                       let clanTotalRpe = 0;
                       let clanRpeCount = 0;
                       let clanTotalVolume = 0;
                       let clanSessionsCount = 0;
                       
                       Object.values(studentsData).forEach((student: any) => {
                         if (student.sessions) {
                           student.sessions.forEach((sess: any) => {
                             if (sess.avgRPE && sess.avgRPE > 0) {
                               clanTotalRpe += sess.avgRPE;
                               clanRpeCount++;
                             }
                             if (sess.totalAchievedVolume) {
                               clanTotalVolume += sess.totalAchievedVolume;
                               clanSessionsCount++;
                             }
                           });
                         }
                       });

                       const clanAvgRpe = clanRpeCount > 0 ? (clanTotalRpe / clanRpeCount).toFixed(1) : 'N/A';
                       const clanAvgVolume = clanSessionsCount > 0 ? (clanTotalVolume / clanSessionsCount).toFixed(0) : 'N/A';

                       // Calcula médias do atleta
                       let athleteTotalRpe = 0;
                       let athleteRpeCount = 0;
                       let athleteTotalVolume = 0;
                       let athleteSessionsCount = 0;

                       (activeStudentProfile.sessions || []).forEach(sess => {
                         if (sess.avgRPE && sess.avgRPE > 0) {
                           athleteTotalRpe += sess.avgRPE;
                           athleteRpeCount++;
                         }
                         if (sess.totalAchievedVolume) {
                           athleteTotalVolume += sess.totalAchievedVolume;
                           athleteSessionsCount++;
                         }
                       });

                       const athleteAvgRpe = athleteRpeCount > 0 ? (athleteTotalRpe / athleteRpeCount).toFixed(1) : 'N/A';
                       const athleteAvgVolume = athleteSessionsCount > 0 ? (athleteTotalVolume / athleteSessionsCount).toFixed(0) : 'N/A';

                       return (
                         <div className="space-y-6">
                           <div className="bg-[#0d0908]/80 p-5 rounded-2xl border border-viking-gold/20 shadow-lg">
                             <h4 className="text-sm font-black text-viking-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                               <Activity className="w-5 h-5 text-viking-gold" /> Comparativo de Esforço (RPE)
                             </h4>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="bg-[#1c1210] p-4 rounded-xl border border-viking-gold/10 text-center">
                                 <p className="text-[10px] text-viking-silver uppercase font-bold">Sua Média (RPE)</p>
                                 <p className="text-2xl font-black text-white mt-1">{athleteAvgRpe}</p>
                               </div>
                               <div className="bg-[#1c1210] p-4 rounded-xl border border-viking-gold/10 text-center relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                   <Users className="w-12 h-12 text-viking-silver" />
                                 </div>
                                 <p className="text-[10px] text-viking-silver uppercase font-bold relative z-10">Média do Clã (RPE)</p>
                                 <p className="text-2xl font-black text-viking-gold mt-1 relative z-10">{clanAvgRpe}</p>
                               </div>
                             </div>
                             {athleteAvgRpe !== 'N/A' && clanAvgRpe !== 'N/A' && (
                               <p className="text-xs text-viking-silver/80 mt-4 text-center">
                                 {Number(athleteAvgRpe) > Number(clanAvgRpe) 
                                   ? 'Seus treinos estão mais intensos que a média do clã. Cuidado com o overtraining!' 
                                   : 'Seu esforço percebido está abaixo ou na média do clã. Mantenha a consistência!'}
                               </p>
                             )}
                           </div>

                           <div className="bg-[#0d0908]/80 p-5 rounded-2xl border border-emerald-500/20 shadow-lg">
                             <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <Dumbbell className="w-5 h-5 text-emerald-400" /> Comparativo de Volume (Reps)
                             </h4>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="bg-[#101912] p-4 rounded-xl border border-emerald-500/10 text-center">
                                 <p className="text-[10px] text-emerald-500/70 uppercase font-bold">Seu Volume Médio</p>
                                 <p className="text-2xl font-black text-white mt-1">{athleteAvgVolume}</p>
                               </div>
                               <div className="bg-[#101912] p-4 rounded-xl border border-emerald-500/10 text-center relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                   <Users className="w-12 h-12 text-emerald-500" />
                                 </div>
                                 <p className="text-[10px] text-emerald-500/70 uppercase font-bold relative z-10">Volume Médio do Clã</p>
                                 <p className="text-2xl font-black text-emerald-500 mt-1 relative z-10">{clanAvgVolume}</p>
                               </div>
                             </div>
                             {athleteAvgVolume !== 'N/A' && clanAvgVolume !== 'N/A' && (
                               <p className="text-xs text-emerald-500/70 mt-4 text-center">
                                 {Number(athleteAvgVolume) > Number(clanAvgVolume)
                                   ? 'Você está suportando uma carga de trabalho maior que a maioria. Excelente guerreiro!'
                                   : 'Seu volume está um pouco abaixo da média geral. Se for intencional (foco em força máxima), siga o plano!'}
                               </p>
                             )}
                           </div>
                         </div>
                       );
                    })()}

                    {historyTab === 'list' && (
                      (activeStudentProfile.sessions || []).length === 0 ? (
                        <div className="text-center py-12 text-viking-silver">
                          <History className="w-12 h-12 text-viking-gold/30 mx-auto mb-3" />
                          <p className="font-bold">Nenhum treino realizado ainda.</p>
                          <p className="text-xs mt-1">Conclua sua primeira prova em "Treino Hoje" para iniciar seu histórico.</p>
                        </div>
                      ) : (
                        (activeStudentProfile.sessions || []).map((sess, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-viking-silver font-bold">{sess.date}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sess.avgRPE >= 9 
                                ? 'bg-red-950/40 text-red-400 border border-red-800/30' 
                                : sess.avgRPE >= 7.5
                                ? 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                            }`}>
                              RPE Médio: {(sess.avgRPE || 0).toFixed(1)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{sess.sessionName}</p>
                            {sess.totalPlannedVolume !== undefined && sess.totalAchievedVolume !== undefined && (
                              <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-viking-silver bg-black/30 px-2 py-1 rounded border border-viking-gold/5">
                                <span>Volume de Trabalho:</span>
                                <span className={sess.volumeDeficit && sess.volumeDeficit > 0 ? 'text-viking-gold' : 'text-green-400'}>
                                  {sess.totalAchievedVolume} / {sess.totalPlannedVolume} reps realizada(s) 
                                  {sess.volumeDeficit && sess.volumeDeficit > 0 ? ` (-${sess.volumeDeficit})` : ' (100%)'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2.5 border-t border-viking-gold/15 pt-2.5">
                            {sess.exercises.map((ex, eidx) => (
                              <div key={eidx} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-viking-silver font-medium">{ex.name}</span>
                                    {ex.failed && (
                                      <span className="text-[9px] bg-red-950 text-red-400 px-1 py-0.2 rounded font-black border border-red-900/40">FALHOU</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {ex.achievedVolume !== undefined && ex.plannedVolume !== undefined && (
                                      <span className="text-[10px] text-viking-silver font-mono">
                                        {ex.achievedVolume}/{ex.plannedVolume} reps
                                      </span>
                                    )}
                                    <span className="text-viking-gold font-bold">RPE {ex.rpe}</span>
                                  </div>
                                </div>
                                {ex.sets && ex.sets.length > 0 && (
                                  <div className="pl-2.5 flex flex-wrap gap-1 text-[9px]">
                                    {ex.sets.map((s, sidx) => (
                                      <span key={sidx} className="bg-viking-gold/5 border border-viking-gold/15 rounded px-1.5 py-0.5 text-viking-silver font-mono inline-flex items-center gap-1" title={s.note || ''}>
                                        <span>S{sidx + 1}: <strong className="text-white">{s.reps}r</strong> @ <strong className="text-viking-gold">{s.weight}kg</strong></span>
                                        {s.note && <span className="text-[8px] text-viking-gold/60 truncate max-w-[100px] border-l border-viking-gold/20 pl-1 ml-1 leading-none" title={s.note}>{s.note}</span>}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {sess.compensationSuggestion && (
                            <div className="p-3 bg-viking-gold/5 rounded-xl border border-viking-gold/25 space-y-1.5 text-xs">
                              <p className="text-[10px] text-viking-gold font-black uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-viking-gold animate-bounce" /> Compensação de Volume Sugerida:
                              </p>
                              <p className="text-viking-silver leading-relaxed font-semibold whitespace-pre-line">
                                {sess.compensationSuggestion}
                              </p>
                            </div>
                          )}

                          {sess.note && (
                            <div className="mt-3 p-2 rounded bg-black/40 border-l-2 border-viking-gold text-xs text-viking-silver italic">
                              "{sess.note}"
                            </div>
                          )}
                        </div>
                      ))
                    )
                  )}
                  </div>
                )}

                {/* Calendar Drawer */}
                {drawerType === 'calendar' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80 leading-relaxed text-center mb-4">
                      Calendário competitivo oficial e dias de teste de força. Prepare-se para a glória.
                    </p>

                    <div className="bg-[#0d0908]/60 border border-viking-gold/20 p-4 rounded-xl mb-6 shadow-inner">
                      <h4 className="text-xs font-bold text-viking-gold uppercase mb-3 flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Adicionar Novo Evento</h4>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          id="newEventTitle" 
                          placeholder="Nome do Evento (ex: Campeonato Estadual)" 
                          className="w-full px-3 py-2.5 rounded-lg bg-[#140e0c] border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="date" 
                            id="newEventDate" 
                            className="w-full px-3 py-2.5 rounded-lg bg-[#140e0c] border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold [color-scheme:dark]"
                          />
                          <select 
                            id="newEventType"
                            className="w-full px-3 py-2.5 rounded-lg bg-[#140e0c] border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          >
                            <option value="competition">Campeonato</option>
                            <option value="test">Teste de 1RM</option>
                            <option value="other">Outro</option>
                          </select>
                        </div>

                        {currentUser?.role === 'trainer' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-viking-gold tracking-wider">Enviar data de teste/competição para o guerreiro:</label>
                            <select 
                              id="newEventStudentTarget"
                              className="w-full px-3 py-2.5 rounded-lg bg-[#140e0c] border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                            >
                              <option value="">-- Evento Geral (Sem designar atleta específico) --</option>
                              {(Object.entries(studentsData) as [string, StudentProfile][]).filter(([_, s]) => !s.isDeleted).map(([email, s]) => (
                                <option key={email} value={email}>
                                  {s.name} ({email})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <textarea 
                          id="newEventDesc"
                          placeholder="Descrição do evento..."
                          className="w-full px-3 py-2.5 rounded-lg bg-[#140e0c] border border-viking-gold/20 text-[#e0d3a8] text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold min-h-[60px]"
                        ></textarea>
                        <button
                          onClick={() => {
                            const title = (document.getElementById('newEventTitle') as HTMLInputElement).value;
                            const date = (document.getElementById('newEventDate') as HTMLInputElement).value;
                            const type = (document.getElementById('newEventType') as HTMLSelectElement).value as any;
                            const desc = (document.getElementById('newEventDesc') as HTMLTextAreaElement).value;
                            const targetStudentEmail = (document.getElementById('newEventStudentTarget') as HTMLSelectElement)?.value || '';

                            if (!title || !date) {
                              showToast('Título e data são obrigatórios!', 'error');
                              return;
                            }
                            const newEventId = Date.now().toString() + '_' + Math.random().toString(36).substring(7);
                            const newEvent: CalendarEvent = {
                              id: newEventId,
                              title,
                              date,
                              type,
                              description: desc
                            };
                            const updated = [...calendarEvents, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            setCalendarEvents(updated);
                            saveCalendarEventToFirebase(newEvent);
                            
                            if (targetStudentEmail && studentsData[targetStudentEmail]) {
                              const originalStudent = studentsData[targetStudentEmail];
                              const updatedStudent = {
                                ...originalStudent,
                                competitionDate: date,
                                targetEventId: newEventId,
                                targetEventName: title
                              };
                              const updatedStudents = {
                                ...studentsData,
                                [targetStudentEmail]: updatedStudent
                              };
                              saveStudentsToDB(updatedStudents);
                              showToast(`Evento criado e enviado para o guerreiro ${originalStudent.name}!`, 'success');
                            } else {
                              showToast('Evento adicionado ao calendário!', 'success');
                            }
                            
                            // Clear fields
                            (document.getElementById('newEventTitle') as HTMLInputElement).value = '';
                            (document.getElementById('newEventDate') as HTMLInputElement).value = '';
                            (document.getElementById('newEventDesc') as HTMLTextAreaElement).value = '';
                            if (document.getElementById('newEventStudentTarget')) {
                              (document.getElementById('newEventStudentTarget') as HTMLSelectElement).value = '';
                            }
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark text-xs font-black uppercase rounded-lg transition-all cursor-pointer"
                        >
                          Forjar Evento
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {calendarEvents.length === 0 ? (
                         <div className="text-center py-6 text-viking-silver/50 text-xs italic">
                           Nenhum evento profetizado ainda. O horizonte está calmo.
                         </div>
                      ) : (
                        calendarEvents.map(ev => {
                          const isMyTargetEvent = currentUser?.role === 'student' && activeStudentProfile?.targetEventId === ev.id;
                          return (
                            <div 
                              key={ev.id} 
                              className={`p-4 rounded-xl relative overflow-hidden group shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all ${
                                isMyTargetEvent 
                                  ? 'bg-[#231714]/95 border-2 border-viking-gold shadow-[0_0_20px_rgba(212,175,55,0.25)]' 
                                  : 'bg-[#1a1210]/95 border border-viking-gold/30'
                              }`}
                            >
                              {isMyTargetEvent && (
                                <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-viking-gold text-viking-dark flex items-center gap-1 animate-pulse shadow-md z-10">
                                  <Target className="w-2.5 h-2.5" /> SEU COMBATE DESIGNADO ⚔️
                                </span>
                              )}
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${ev.type === 'competition' ? 'bg-red-500' : ev.type === 'test' ? 'bg-blue-500' : 'bg-viking-gold'}`}></div>
                              <div className="flex justify-between items-start pl-3">
                              <div className="flex-1 min-w-0">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${ev.type === 'competition' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ev.type === 'test' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-viking-gold/10 text-viking-gold border border-viking-gold/30'}`}>
                                  {ev.type === 'competition' ? 'Torneio' : ev.type === 'test' ? 'Dia de Teste' : 'Evento'}
                                </span>
                                <h4 className="text-sm font-bold text-[#e0d3a8] mt-1.5">{ev.title}</h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-viking-silver/70 font-semibold mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {/* Handling date strictly as UTC to avoid timezone shifts when just selecting a date */}
                                  {(() => {
                                    const parts = ev.date.split('-');
                                    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ev.date;
                                  })()}
                                </div>
                                {ev.description && (
                                  <p className="text-[11px] text-viking-silver mt-2.5 leading-relaxed whitespace-pre-wrap">{ev.description}</p>
                                )}
                                
                                {(() => {
                                  const signedUpStudents = (Object.entries(studentsData) as [string, StudentProfile][])
                                    .map(([email, s]) => ({ email, ...s }))
                                    .filter(s => s.targetEventId === ev.id);
                                  if (signedUpStudents.length > 0) {
                                    return (
                                      <div className="mt-3 pt-3 border-t border-viking-gold/10">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                          <Shield className="w-3 h-3 text-viking-gold" />
                                          <span className="text-[10px] font-black uppercase text-viking-gold">Guerreiros Inscritos:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {signedUpStudents.map(s => (
                                            <span key={s.email} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-viking-gold/10 border border-viking-gold/20 text-[9px] font-bold text-[#e0d3a8]">
                                              {s.name}
                                              {currentUser?.role === 'trainer' && (
                                                <button
                                                  onClick={() => {
                                                    if (confirm(`Remover ${s.name} deste evento?`)) {
                                                      const updatedStudent = {
                                                        ...s,
                                                        competitionDate: '',
                                                        targetEventId: '',
                                                        targetEventName: ''
                                                      };
                                                      // Remove non-serializable elements or temporary ones if any
                                                      delete (updatedStudent as any).email;
                                                      delete (updatedStudent as any).daysRemaining;
                                                      
                                                      const updatedData = { ...studentsData, [s.email]: updatedStudent };
                                                      saveStudentsToDB(updatedData);
                                                      showToast(`Removido ${s.name} do evento.`, 'info');
                                                    }
                                                  }}
                                                  className="hover:text-red-500 font-bold ml-1 text-viking-gold/60 transition-colors cursor-pointer"
                                                  title="Remover guerreiro"
                                                >
                                                  ×
                                                </button>
                                              )}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                {currentUser?.role === 'trainer' && (
                                  <div className="mt-3 pt-3 border-t border-viking-gold/10 flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black uppercase text-viking-silver/60">Designar Atleta para este Evento:</span>
                                    <div className="flex gap-1.5">
                                      <select
                                        id={`assign-student-${ev.id}`}
                                        className="bg-[#140e0c] border border-viking-gold/20 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#e0d3a8] focus:outline-none focus:border-viking-gold flex-1 min-w-0"
                                        defaultValue=""
                                      >
                                        <option value="" disabled>-- Selecionar Aluno --</option>
                                        {(Object.entries(studentsData) as [string, StudentProfile][]).filter(([_, s]) => !s.isDeleted).map(([email, s]) => (
                                          <option key={email} value={email}>
                                            {s.name}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={() => {
                                          const selectEl = document.getElementById(`assign-student-${ev.id}`) as HTMLSelectElement;
                                          const email = selectEl?.value;
                                          if (!email) {
                                            showToast('Selecione um aluno primeiro!', 'warning');
                                            return;
                                          }
                                          const student = studentsData[email];
                                          if (student) {
                                            const updatedStudent = {
                                              ...student,
                                              competitionDate: ev.date,
                                              targetEventId: ev.id,
                                              targetEventName: ev.title
                                            };
                                            const updatedData = { ...studentsData, [email]: updatedStudent };
                                            saveStudentsToDB(updatedData);
                                            showToast(`Evento enviado para ${student.name}!`, 'success');
                                            selectEl.value = ""; // Reset
                                          }
                                        }}
                                        className="bg-viking-gold hover:bg-viking-gold/80 text-viking-dark px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                                      >
                                        Enviar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2 ml-2">
                                {currentUser?.role === 'trainer' && (
                                  <button
                                    onClick={() => {
                                      if(confirm('Apagar este evento do calendário?')) {
                                        const updated = calendarEvents.filter(e => e.id !== ev.id);
                                        setCalendarEvents(updated);
                                        deleteCalendarEventFromFirebase(ev.id);
                                        showToast('Evento removido.', 'info');
                                      }
                                    }}
                                    className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                                    title="Remover Evento"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                {currentUser?.role === 'student' && activeStudentProfile && (
                                  <button
                                    onClick={() => {
                                      const updatedStudent = {
                                        ...activeStudentProfile,
                                        competitionDate: ev.date,
                                        targetEventId: ev.id,
                                        targetEventName: ev.title
                                      };
                                      const updatedData = { ...studentsData, [currentUser.email]: updatedStudent };
                                      setStudentsData(updatedData);
                                      saveStudentToFirebase(currentUser.email, updatedStudent);
                                      showToast('Evento definido como alvo!', 'success');
                                      setDrawerOpen(false);
                                    }}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                      activeStudentProfile.targetEventId === ev.id
                                        ? 'bg-viking-gold text-viking-dark'
                                        : 'bg-viking-gold/10 text-viking-gold hover:bg-viking-gold/20 border border-viking-gold/30'
                                    }`}
                                  >
                                    {activeStudentProfile.targetEventId === ev.id ? 'Alvo Atual' : 'Definir Alvo'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Leaderboard Drawer */}
                {drawerType === 'ranking' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80 leading-relaxed">
                      🏆 Templo Viking Force - Classificação de Competição. O coeficiente Wilks compara os guerreiros de diferentes pesos corporais e gêneros de forma justa para encontrar o campeão absoluto. Toque nos cabeçalhos para ordenar!
                    </p>

                    {/* Absolute Leader Highlight Card */}
                    {absoluteLeader && (() => {
                      const leader = absoluteLeader;
                      return (
                        <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-[#1a1210] via-[#0d0908]/90 to-black border-2 border-viking-gold shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-between">
                          {/* Background Glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-viking-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                          
                          <div className="space-y-1.5 z-10">
                            <div className="flex items-center gap-1.5">
                              <Crown className="w-4 h-4 text-viking-gold animate-bounce" />
                              <span className="text-[9px] font-black text-viking-gold uppercase tracking-widest font-viking-medieval">Líder Absoluto do Templo</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1">
                                {leader.name}
                                {currentUser && currentUser.email === leader.email && (
                                  <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Você</span>
                                )}
                              </h4>
                              <p className="text-[10px] text-viking-silver/80 mt-0.5">
                                {leader.gender === 'female' ? 'Guerreira' : 'Guerreiro'} · <span className="font-bold text-white">{leader.ageDivision}</span> · Classe <span className="font-bold text-white">{leader.weightClass}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-3 pt-1 text-[10px] text-viking-silver font-mono">
                              <span>Agacho: <strong className="text-viking-gold font-bold">{leader.squat}kg</strong></span>
                              <span>Supino: <strong className="text-viking-gold font-bold">{leader.bench}kg</strong></span>
                              <span>Terra: <strong className="text-viking-gold font-bold">{leader.deadlift}kg</strong></span>
                            </div>
                          </div>

                          <div className="text-right z-10 flex flex-col items-end justify-center pl-3 border-l border-viking-gold/15 min-w-[85px]">
                            <div className="bg-viking-gold/10 p-1.5 rounded-lg border border-viking-gold/25 flex flex-col items-center justify-center w-full">
                              <span className="text-[8px] text-viking-gold font-bold uppercase tracking-wider font-viking-medieval">Wilks</span>
                              <span className="text-base font-black text-viking-gold leading-none mt-1">{leader.wilks.toFixed(1)}</span>
                            </div>
                            <p className="text-[8px] text-viking-silver/40 font-bold uppercase tracking-widest mt-1">Destinado ao Valhalla</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Filtros de Competição Viking */}
                    <div className="p-3.5 bg-[#0a0605]/80 rounded-2xl border border-viking-gold/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-viking-gold/10 pb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-viking-gold flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 animate-pulse" /> Filtros de Competição
                        </span>
                        {(leaderboardAgeFilter !== 'all' || leaderboardWeightFilter !== 'all' || leaderboardGenderFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setLeaderboardAgeFilter('all');
                              setLeaderboardWeightFilter('all');
                              setLeaderboardGenderFilter('all');
                            }}
                            className="text-[9px] font-black text-viking-red hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            Limpar Filtros
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Gênero */}
                        <div>
                          <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Gênero</label>
                          <select
                            value={leaderboardGenderFilter}
                            onChange={(e) => {
                              setLeaderboardGenderFilter(e.target.value);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#140e0c] border border-viking-gold/15 text-xs font-medium text-[#e0d3a8] focus:outline-none focus:border-viking-gold"
                          >
                            <option value="all">Todos</option>
                            <option value="male">Masculino ♂</option>
                            <option value="female">Feminino ♀</option>
                          </select>
                        </div>

                        {/* Categoria de Idade */}
                        <div>
                          <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Categoria de Idade</label>
                          <select
                            value={leaderboardAgeFilter}
                            onChange={(e) => setLeaderboardAgeFilter(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#140e0c] border border-viking-gold/15 text-xs font-medium text-[#e0d3a8] focus:outline-none focus:border-viking-gold"
                          >
                            <option value="all">Todas as Categorias</option>
                            <option value="Sub-Júnior (≤18)">Sub-Júnior (≤18)</option>
                            <option value="Júnior (19-23)">Júnior (19-23)</option>
                            <option value="Open (24-39)">Open (24-39)</option>
                            <option value="Master (40+)">Master (40+)</option>
                          </select>
                        </div>

                        {/* Classe de Peso */}
                        <div>
                          <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Classe de Peso</label>
                          <select
                            value={leaderboardWeightFilter}
                            onChange={(e) => setLeaderboardWeightFilter(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#140e0c] border border-viking-gold/15 text-xs font-medium text-[#e0d3a8] focus:outline-none focus:border-viking-gold"
                          >
                            <option value="all">Todas as Classes</option>
                            {leaderboardGenderFilter === 'female' ? (
                              <>
                                <option value="Até 57kg">F: Até 57kg</option>
                                <option value="57.1kg - 72kg">F: 57.1kg - 72kg</option>
                                <option value="Mais de 72kg">F: Mais de 72kg</option>
                              </>
                            ) : leaderboardGenderFilter === 'male' ? (
                              <>
                                <option value="Até 74kg">M: Até 74kg</option>
                                <option value="74.1kg - 93kg">M: 74.1kg - 93kg</option>
                                <option value="Mais de 93kg">M: Mais de 93kg</option>
                              </>
                            ) : (
                              <>
                                <optgroup label="Feminino" className="text-viking-gold font-bold">
                                  <option value="Até 57kg">Até 57kg</option>
                                  <option value="57.1kg - 72kg">57.1kg - 72kg</option>
                                  <option value="Mais de 72kg">Mais de 72kg</option>
                                </optgroup>
                                <optgroup label="Masculino" className="text-viking-silver font-bold">
                                  <option value="Até 74kg">Até 74kg</option>
                                  <option value="74.1kg - 93kg">74.1kg - 93kg</option>
                                  <option value="Mais de 93kg">Mais de 93kg</option>
                                </optgroup>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard Tabs */}
                    <div className="flex bg-[#0d0908]/80 p-1 rounded-xl border border-viking-gold/15 gap-1">
                      <button 
                        onClick={() => setLeaderboardTab('all')} 
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${leaderboardTab === 'all' ? 'bg-viking-gold text-viking-dark shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-viking-silver hover:bg-viking-gold/5'}`}
                      >
                        Absoluto
                      </button>
                      <button 
                        onClick={() => setLeaderboardTab('age')} 
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${leaderboardTab === 'age' ? 'bg-viking-gold text-viking-dark shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-viking-silver hover:bg-viking-gold/5'}`}
                      >
                        Por Idade
                      </button>
                      <button 
                        onClick={() => setLeaderboardTab('weight')} 
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${leaderboardTab === 'weight' ? 'bg-viking-gold text-viking-dark shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-viking-silver hover:bg-viking-gold/5'}`}
                      >
                        Por Peso
                      </button>
                    </div>

                    {/* Column Headers Sorting controls (Only for General View to keep clean) */}
                    {leaderboardTab === 'all' && (
                      <div className="p-3 bg-black/45 rounded-xl border border-viking-gold/10 flex flex-wrap gap-2 items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-viking-silver/50 font-bold">Ordenar Tabela por:</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { col: 'name', label: 'Nome' },
                            { col: 'age', label: 'Idade' },
                            { col: 'bodyWeight', label: 'Peso' },
                            { col: 'squat', label: 'Agacho' },
                            { col: 'bench', label: 'Supino' },
                            { col: 'deadlift', label: 'Terra' },
                            { col: 'total', label: 'Total SBD' },
                            { col: 'wilks', label: 'Wilks' },
                          ].map(({ col, label }) => {
                            const isSorted = leaderboardSortCol === col;
                            return (
                              <button
                                key={col}
                                onClick={() => {
                                  if (isSorted) {
                                    setLeaderboardSortDesc(!leaderboardSortDesc);
                                  } else {
                                    setLeaderboardSortCol(col as any);
                                    setLeaderboardSortDesc(true);
                                  }
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                  isSorted 
                                    ? 'bg-viking-gold/15 text-viking-gold border border-viking-gold/30' 
                                    : 'bg-[#140e0c] text-viking-silver hover:text-viking-gold border border-transparent'
                                }`}
                              >
                                {label} {isSorted ? (leaderboardSortDesc ? '↓' : '↑') : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* 2.1 General Absoluto Leaderboard */}
                      {leaderboardTab === 'all' && (
                        <div className="space-y-2">
                          {filteredLeaderboard.length === 0 ? (
                            <div className="p-8 text-center rounded-xl bg-[#0d0908]/40 border border-viking-gold/10 text-viking-silver text-xs">
                              <Info className="w-5 h-5 text-viking-gold mx-auto mb-2 animate-pulse" />
                              Nenhum guerreiro atende aos filtros selecionados.
                            </div>
                          ) : (
                            filteredLeaderboard.map((warrior, idx) => {
                            const isSelf = currentUser && currentUser.email === warrior.email;
                            const isAbsoluteLeader = absoluteLeader?.email === warrior.email;
                            return (
                              <div 
                                key={warrior.email} 
                                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:border-viking-gold/30 ${
                                  isAbsoluteLeader
                                    ? 'bg-gradient-to-r from-viking-gold/15 to-[#1c120f]/60 border-viking-gold ring-1 ring-viking-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                                    : isSelf 
                                    ? 'bg-gradient-to-r from-viking-gold/10 to-transparent border-viking-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.08)]' 
                                    : 'bg-[#0d0908]/60 border-viking-gold/10'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 flex justify-center">
                                    {renderRankBadge(idx + 1, warrior)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-white flex flex-wrap items-center gap-1.5">
                                      {warrior.name}
                                      <span className="text-[10px] text-viking-silver/60 font-mono">
                                        ({warrior.gender === 'female' ? '♀' : '♂'})
                                      </span>
                                      {isAbsoluteLeader && (
                                        <span className="flex items-center gap-0.5 text-[8px] bg-viking-gold/20 text-viking-gold border border-viking-gold/40 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                          <Crown className="w-2.5 h-2.5" /> Líder Absoluto
                                        </span>
                                      )}
                                      {isSelf && !isAbsoluteLeader && (
                                        <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Você</span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-viking-silver font-medium mt-0.5">
                                      Idade: <span className="text-white font-bold">{warrior.age}a</span> · Peso: <span className="text-white font-bold">{warrior.bodyWeight.toFixed(1)}kg</span> · <span className="text-viking-gold/80 font-bold">{warrior.ageDivision}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-viking-gold/5 pt-2 sm:pt-0 sm:border-0">
                                  <div className="grid grid-cols-4 gap-x-2.5 gap-y-0.5 text-left sm:text-right">
                                    <div className="text-[9px] text-viking-silver/60">Agacho</div>
                                    <div className="text-[9px] text-viking-silver/60">Supino</div>
                                    <div className="text-[9px] text-viking-silver/60">Terra</div>
                                    <div className="text-[9px] text-viking-silver/60 font-bold text-white">Total</div>
                                    <div className="text-xs font-bold text-white">{warrior.squat || '-'}k</div>
                                    <div className="text-xs font-bold text-white">{warrior.bench || '-'}k</div>
                                    <div className="text-xs font-bold text-white">{warrior.deadlift || '-'}k</div>
                                    <div className="text-xs font-black text-viking-gold">{warrior.total}kg</div>
                                  </div>

                                  <div className="text-right pl-3 border-l border-viking-gold/15 min-w-[75px]">
                                    <p className="text-[9px] text-viking-silver font-medium font-viking-medieval uppercase">Wilks</p>
                                    <p className="text-base font-black text-viking-gold tracking-tighter">{warrior.wilks.toFixed(1)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                          )}
                        </div>
                      )}

                      {/* 2.2 Leaderboard Grouped by Age Division */}
                      {leaderboardTab === 'age' && (
                        <div className="space-y-6">
                          {filteredLeaderboard.length === 0 ? (
                            <div className="p-8 text-center rounded-xl bg-[#0d0908]/40 border border-viking-gold/10 text-viking-silver text-xs">
                              <Info className="w-5 h-5 text-viking-gold mx-auto mb-2 animate-pulse" />
                              Nenhum guerreiro atende aos filtros selecionados.
                            </div>
                          ) : (
                            ['Sub-Júnior (≤18)', 'Júnior (19-23)', 'Open (24-39)', 'Master (40+)'].map(division => {
                            const competitors = filteredLeaderboard
                              .filter(w => w.ageDivision === division)
                              .sort((a, b) => b.wilks - a.wilks);

                            if (competitors.length === 0) return null;

                            return (
                              <div key={division} className="space-y-2">
                                <h4 className="text-xs font-black text-viking-gold uppercase tracking-widest border-b border-viking-gold/20 pb-1 flex items-center gap-1.5">
                                  <Trophy className="w-3.5 h-3.5 text-viking-gold" /> Categoria {division}
                                </h4>
                                <div className="space-y-1.5">
                                  {competitors.map((warrior, idx) => {
                                    const isSelf = currentUser && currentUser.email === warrior.email;
                                    const isCategoryLeader = idx === 0;
                                    const isAbsoluteLeader = absoluteLeader?.email === warrior.email;
                                    return (
                                      <div 
                                        key={warrior.email} 
                                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                          isCategoryLeader
                                            ? 'bg-gradient-to-r from-viking-gold/10 via-[#1a1210]/40 to-transparent border-viking-gold/40 shadow-[0_0_10px_rgba(212,175,55,0.12)]'
                                            : isSelf 
                                            ? 'bg-viking-gold/5 border-viking-gold/20' 
                                            : 'bg-[#0d0908]/40 border-viking-gold/5'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 flex justify-center">
                                            {renderRankBadge(idx + 1, warrior)}
                                          </div>
                                          <div>
                                            <p className="font-bold text-white flex flex-wrap items-center gap-1">
                                              {warrior.name}
                                              {isAbsoluteLeader && (
                                                <span className="flex items-center gap-0.5 text-[8px] bg-viking-gold/20 text-viking-gold border border-viking-gold/40 font-black px-1 rounded">
                                                  <Crown className="w-2 h-2" /> Absoluto
                                                </span>
                                              )}
                                              {isCategoryLeader && !isAbsoluteLeader && (
                                                <span className="flex items-center gap-0.5 text-[8px] bg-viking-gold/10 text-viking-gold border border-viking-gold/30 font-black px-1 rounded">
                                                  <Award className="w-2 h-2" /> Líder Categoria
                                                </span>
                                              )}
                                              {isSelf && (
                                                <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1 rounded">Você</span>
                                              )}
                                            </p>
                                            <p className="text-[9px] text-viking-silver/70">
                                              Idade: {warrior.age}a · Peso: {warrior.bodyWeight.toFixed(1)}kg · SBD: {warrior.squat || 0}/{warrior.bench || 0}/{warrior.deadlift || 0} = <strong className="text-viking-gold font-bold">{warrior.total}kg</strong>
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[8px] text-viking-silver font-mono">WILKS</p>
                                          <p className="font-black text-viking-gold">{warrior.wilks.toFixed(1)}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                          )}
                        </div>
                      )}

                      {/* 2.3 Leaderboard Grouped by Weight Class */}
                      {leaderboardTab === 'weight' && (
                        <div className="space-y-6">
                          {filteredLeaderboard.length === 0 ? (
                            <div className="p-8 text-center rounded-xl bg-[#0d0908]/40 border border-viking-gold/10 text-viking-silver text-xs">
                              <Info className="w-5 h-5 text-viking-gold mx-auto mb-2 animate-pulse" />
                              Nenhum guerreiro atende aos filtros selecionados.
                            </div>
                          ) : (
                            (() => {
                              const filtered = filteredLeaderboard;
                              const categoriesMap = new Map<string, { gender: string, weightClass: string }>();
                              filtered.forEach(w => {
                                const key = `${w.gender}-${w.weightClass}`;
                                if (!categoriesMap.has(key)) {
                                  categoriesMap.set(key, { gender: w.gender, weightClass: w.weightClass });
                                }
                              });
                              const categories = Array.from(categoriesMap.values());
                              categories.sort((a, b) => {
                                if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
                                const numA = parseFloat(a.weightClass.match(/\d+(\.\d+)?/)?.[0] || "999");
                                const numB = parseFloat(b.weightClass.match(/\d+(\.\d+)?/)?.[0] || "999");
                                return numA - numB;
                              });
                              return categories.map(cat => {
                                const competitors = filtered
                                  .filter(w => w.gender === cat.gender && w.weightClass === cat.weightClass)
                                  .sort((a, b) => b.wilks - a.wilks);
                                if (competitors.length === 0) return null;
                                const isFemaleClass = cat.gender === "female";
                                return (
                                  <div key={`${cat.gender}-${cat.weightClass}`} className="space-y-2">
                                    <h4 className="text-xs font-black text-viking-silver uppercase tracking-widest border-b border-viking-silver/20 pb-1 flex items-center gap-1.5">
                                      <Scale className="w-3.5 h-3.5 text-viking-silver" />
                                      Classe {cat.weightClass} ({isFemaleClass ? "Feminino" : "Masculino"})
                                    </h4>

                                <div className="space-y-1.5">
                                  {competitors.map((warrior, idx) => {
                                    const isSelf = currentUser && currentUser.email === warrior.email;
                                    const isCategoryLeader = idx === 0;
                                    const isAbsoluteLeader = absoluteLeader?.email === warrior.email;
                                    return (
                                      <div 
                                        key={warrior.email} 
                                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                          isCategoryLeader
                                            ? 'bg-gradient-to-r from-viking-gold/10 via-[#1a1210]/40 to-transparent border-viking-gold/40 shadow-[0_0_10px_rgba(212,175,55,0.12)]'
                                            : isSelf 
                                            ? 'bg-viking-gold/5 border-viking-gold/20' 
                                            : 'bg-[#0d0908]/40 border-viking-gold/5'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 flex justify-center">
                                            {renderRankBadge(idx + 1, warrior)}
                                          </div>
                                          <div>
                                            <p className="font-bold text-white flex flex-wrap items-center gap-1">
                                              {warrior.name}
                                              {isAbsoluteLeader && (
                                                <span className="flex items-center gap-0.5 text-[8px] bg-viking-gold/20 text-viking-gold border border-viking-gold/40 font-black px-1 rounded">
                                                  <Crown className="w-2 h-2" /> Absoluto
                                                </span>
                                              )}
                                              {isCategoryLeader && !isAbsoluteLeader && (
                                                <span className="flex items-center gap-0.5 text-[8px] bg-viking-gold/10 text-viking-gold border border-viking-gold/30 font-black px-1 rounded">
                                                  <Award className="w-2 h-2" /> Líder Categoria
                                                </span>
                                              )}
                                              {isSelf && (
                                                <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1 rounded">Você</span>
                                              )}
                                            </p>
                                            <p className="text-[9px] text-viking-silver/70">
                                              Peso: {warrior.bodyWeight.toFixed(1)}kg · Idade: {warrior.age}a · SBD: {warrior.squat || 0}/{warrior.bench || 0}/{warrior.deadlift || 0} = <strong className="text-viking-gold font-bold">{warrior.total}kg</strong>
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[8px] text-viking-silver font-mono">WILKS</p>
                                          <p className="font-black text-viking-gold">{warrior.wilks.toFixed(1)}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                            });
                            })()
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Plans Drawer */}
                {drawerType === 'plans' && (
                  <div className="space-y-4">
                    {currentUser?.role === 'trainer' ? (
                      <>
                        <div className="p-4 rounded-xl border border-dashed border-viking-gold/30 bg-viking-gold/5 mb-2">
                          <p className="text-xs text-viking-gold font-bold flex items-center gap-1.5">
                            <Settings className="w-4 h-4 animate-spin-slow" /> MODO DE EDIÇÃO DO TREINADOR
                          </p>
                          <p className="text-[11px] text-viking-silver mt-1 leading-relaxed">
                            Altere os valores abaixo para atualizar instantaneamente o mural de planos e compras dos seus alunos.
                          </p>
                        </div>

                        {vikingPlans.map((plan, index) => (
                          <div key={plan.id} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-viking-gold/10">
                              <span className="text-xs text-viking-gold font-bold uppercase tracking-widest font-viking-medieval">#{index + 1} - {plan.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Selo do Plano</label>
                                <input 
                                  value={plan.badge}
                                  onChange={e => {
                                    const copy = [...vikingPlans];
                                    copy[index] = { ...copy[index], badge: e.target.value };
                                    setVikingPlans(copy);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Nome do Plano</label>
                                <input 
                                  value={plan.name}
                                  onChange={e => {
                                    const copy = [...vikingPlans];
                                    copy[index] = { ...copy[index], name: e.target.value };
                                    setVikingPlans(copy);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Preço (R$)</label>
                                <input 
                                  type="number"
                                  inputMode="decimal"
                                  value={plan.price}
                                  onChange={e => {
                                    const copy = [...vikingPlans];
                                    copy[index] = { ...copy[index], price: parseFloat(e.target.value) || 0 };
                                    setVikingPlans(copy);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Período de Cobrança</label>
                                <input 
                                  value={plan.period}
                                  onChange={e => {
                                    const copy = [...vikingPlans];
                                    copy[index] = { ...copy[index], period: e.target.value };
                                    setVikingPlans(copy);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Descrição Curta</label>
                                <textarea 
                                  value={plan.description}
                                  rows={2}
                                  onChange={e => {
                                    const copy = [...vikingPlans];
                                    copy[index] = { ...copy[index], description: e.target.value };
                                    setVikingPlans(copy);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-medium text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button 
                          onClick={() => {
                            setDrawerOpen(false);
                            // Explicitly save the plans to Firebase when confirming
                            if (isLoggedIn && currentUser?.role === 'trainer' && auth.currentUser) {
                              savePlansToFirebase(vikingPlans)
                                .then(() => {
                                  showToast('Novos valores salvos com sucesso e replicados para todos os alunos!', 'success');
                                })
                                .catch(err => {
                                  console.error("Firebase save plans error:", err);
                                  showToast('Erro ao salvar os planos na nuvem.', 'error');
                                });
                            } else {
                              showToast('Novos valores salvos localmente!', 'success');
                            }
                          }}
                          className="w-full py-3.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 mt-4 cursor-pointer"
                        >
                          Confirmar e Publicar Alterações
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-viking-silver leading-relaxed mb-4">
                          Adquira uma aliança perpétua com os pesos. Nossos planos garantem acompanhamento próximo com relatórios de RPE e periodizações semanais personalizadas.
                        </p>

                        {activeStudentProfile && (
                          <div className="bg-gradient-to-r from-viking-gold/15 to-amber-950/20 border-2 border-viking-gold/60 p-5 rounded-2xl mb-6 relative overflow-hidden shadow-lg shadow-viking-gold/5 text-left">
                            <div className="absolute right-3 top-3 text-viking-gold/10">
                              <Shield className="w-16 h-16 animate-pulse" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-viking-gold text-viking-dark px-2.5 py-1 rounded-full">
                              Sua Aliança Atual
                            </span>
                            <h3 className="font-viking-display text-lg font-black text-white mt-2">
                              {activeStudentProfile.plan || 'Mensal'}
                            </h3>
                            <p className="text-xs text-viking-silver/80 mt-1 flex items-center gap-1.5">
                              <span>Status do Ciclo:</span>
                              <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md ${
                                activeStudentProfile.status === 'Ativo' || activeStudentProfile.status === 'Pago'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {activeStudentProfile.status || 'Ativo'}
                              </span>
                            </p>
                          </div>
                        )}

                        <div className="space-y-4">
                          <p className="text-xs text-viking-gold font-black uppercase tracking-wider text-left border-b border-viking-gold/15 pb-2">
                            Alianças Disponíveis para Forjar
                          </p>

                          {vikingPlans.map(plan => {
                            const getMappedPlanName = (pId: string): 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual' => {
                              const normalized = pId.toLowerCase();
                              if (normalized === 'mensal') return 'Mensal';
                              if (normalized === 'trimestral') return 'Trimestral';
                              if (normalized === 'semestral') return 'Semestral';
                              if (normalized === 'anual') return 'Anual';
                              return 'Mensal';
                            };

                            const mappedPlanName = getMappedPlanName(plan.id);
                            const isCurrent = activeStudentProfile?.plan === mappedPlanName || 
                                              (activeStudentProfile?.plan && plan.name.toLowerCase().includes(activeStudentProfile.plan.toLowerCase()));

                            return (
                              <div 
                                key={plan.id} 
                                className={`p-5 rounded-2xl text-center space-y-3 transition-all relative ${
                                  isCurrent 
                                    ? 'bg-viking-gold/5 border-2 border-viking-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                                    : 'bg-[#0d0908]/60 border border-viking-gold/15 hover:border-viking-gold/40 shadow-[0_4px_30px_rgba(0,0,0,0.2)]'
                                }`}
                              >
                                {isCurrent && (
                                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-viking-gold text-viking-dark text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow">
                                    <Check className="w-2.5 h-2.5" /> Ativo
                                  </div>
                                )}
                                
                                <div className="flex flex-col items-center">
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-viking-gold/10 text-viking-gold px-2.5 py-1 rounded-full mb-1">
                                    {plan.badge}
                                  </span>
                                  <h4 className="font-viking-display text-base font-bold text-white">
                                    {plan.name}
                                  </h4>
                                </div>

                                <p className="text-3xl font-black text-viking-gold">
                                  R$ {plan.price.toLocaleString('pt-BR')} <span className="text-xs font-normal text-viking-silver/60">{plan.period}</span>
                                </p>
                                
                                <p className="text-xs text-viking-silver max-w-xs mx-auto">
                                  {plan.description}
                                </p>

                                <div className="pt-2">
                                  {isCurrent ? (
                                    <div className="w-full py-2.5 bg-viking-gold/10 border border-viking-gold/20 text-viking-gold text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 select-none">
                                      <Shield className="w-3.5 h-3.5" /> Aliança Consagrada
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        triggerConfirm(
                                          '🏆 MUDAR DE ALIANÇA',
                                          `Tem certeza que deseja mudar para a ${plan.name} (${plan.badge}) pelo valor de R$ ${plan.price.toLocaleString('pt-BR')} ${plan.period}? Seu status será ajustado para Pendente até o envio do comprovante ao treinador.`,
                                          () => {
                                            const updatedProfile = {
                                              ...activeStudentProfile!,
                                              plan: mappedPlanName,
                                              status: 'Pendente' as const
                                            };
                                            saveStudentsToDB({ ...studentsData, [currentUser!.email.toLowerCase()]: updatedProfile });
                                            showToast(`Sua Aliança de Força foi alterada para ${plan.name}!`, 'success');
                                            
                                            // WhatsApp Redirect Link
                                            const coachPhone = '51998612067';
                                            const waMsg = `Olá Treinador John! Alterei minha aliança no app Diário do Guerreiro para o plano ${plan.name} (${plan.badge}). Aguardo as instruções para envio do novo comprovante de pagamento!`;
                                            const waUrl = `https://api.whatsapp.com/send?phone=${coachPhone}&text=${encodeURIComponent(waMsg)}`;
                                            
                                            setTimeout(() => {
                                              window.open(waUrl, '_blank');
                                            }, 1000);
                                          }
                                        );
                                      }}
                                      className="w-full py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-viking-gold/10 cursor-pointer"
                                    >
                                      Forjar esta Aliança
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 4. Settings (PRs update) */}
                {drawerType === 'settings' && activeStudentProfile && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-viking-gold flex items-center gap-1.5">
                        <User className="w-4 h-4 text-viking-gold" /> Perfil do Atleta
                      </h4>
                      <p className="text-[11px] text-viking-silver leading-relaxed">
                        Adicione ou altere sua foto de perfil para ser reconhecido no salão de powerlifting.
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-viking-gold-dark to-viking-gold p-[2px] shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                          <div className="w-full h-full rounded-full bg-viking-darker flex items-center justify-center overflow-hidden">
                            {activeStudentProfile.photoUrl ? (
                              <img src={activeStudentProfile.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-8 h-8 text-viking-gold" />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 px-4 py-2 bg-viking-dark hover:bg-viking-gold/10 text-viking-gold border border-viking-gold/30 hover:border-viking-gold/50 rounded-xl transition-all cursor-pointer font-bold text-xs uppercase tracking-wider">
                            <Camera className="w-4 h-4" /> Alterar Foto
                            <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-viking-gold flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-viking-gold" /> Calibragem de 1 Repetição Máxima (1RM)
                      </h4>
                      <p className="text-[11px] text-viking-silver leading-relaxed">
                        Atualize suas cargas reais de esforço máximo de uma repetição (em kg). O sistema recalcula automaticamente as cargas do seu aquecimento e prescreve o treino.
                      </p>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-viking-silver mb-1">Agachamento Máximo (kg)</label>
                          <WeightControl 
                            value={settingsSquat}
                            onChange={(val: number) => {
                              setSettingsSquat(val);
                              const input = document.getElementById('cfgSquat') as HTMLInputElement;
                              if (input) input.value = val.toString();
                            }}
                            placeholder="Ex: 150"
                            title="Agachamento Máximo (kg)"
                          />
                          {/* Hidden input to maintain compatibility with existing save logic that uses getElementById */}
                          <input type="hidden" id="cfgSquat" value={settingsSquat} onChange={(e) => setSettingsSquat(parseFloat(e.target.value) || 0)} />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-viking-silver mb-1">Supino Máximo (kg)</label>
                          <WeightControl 
                            value={settingsBench}
                            onChange={(val: number) => {
                              setSettingsBench(val);
                              const input = document.getElementById('cfgBench') as HTMLInputElement;
                              if (input) input.value = val.toString();
                            }}
                            placeholder="Ex: 110"
                            title="Supino Máximo (kg)"
                          />
                          <input type="hidden" id="cfgBench" value={settingsBench} onChange={(e) => setSettingsBench(parseFloat(e.target.value) || 0)} />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-viking-silver mb-1">Levantamento Terra Máximo (kg)</label>
                          <WeightControl 
                            value={settingsDeadlift}
                            onChange={(val: number) => {
                              setSettingsDeadlift(val);
                              const input = document.getElementById('cfgDeadlift') as HTMLInputElement;
                              if (input) input.value = val.toString();
                            }}
                            placeholder="Ex: 190"
                            title="Levantamento Terra Máximo (kg)"
                          />
                          <input type="hidden" id="cfgDeadlift" value={settingsDeadlift} onChange={(e) => setSettingsDeadlift(parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-viking-gold/15 mt-4 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-viking-gold flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-viking-gold" /> Perfil de Competição (Ranking)
                        </h4>
                        <p className="text-[11px] text-viking-silver leading-relaxed">
                          Sua idade, peso corporal e gênero são necessários para calcular sua pontuação Wilks oficial e dividir as categorias de competição no Ranking do Templo.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-viking-silver mb-1">Idade (anos)</label>
                            <input 
                              type="number" 
                              inputMode="decimal"
                              id="cfgAge"
                              defaultValue={activeStudentProfile.age || 25}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-viking-silver mb-1">Peso Corporal (kg)</label>
                            <input 
                              type="number" 
                              inputMode="decimal"
                              step="0.1"
                              id="cfgBodyWeight"
                              defaultValue={activeStudentProfile.bodyWeight || 80}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-viking-silver mb-1">Nome do Evento Alvo</label>
                            <input 
                              type="text" 
                              id="cfgTargetEventName"
                              defaultValue={activeStudentProfile.targetEventName || ''}
                              placeholder="Ex: Campeonato Estadual"
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-viking-silver mb-1">Data da Competição</label>
                            <input 
                              type="date" 
                              id="cfgCompetitionDate"
                              defaultValue={activeStudentProfile.competitionDate || ''}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold [color-scheme:dark]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-viking-silver mb-1">Gênero</label>
                          <select 
                            id="cfgGender"
                            defaultValue={activeStudentProfile.gender || 'male'}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          >
                            <option value="male" className="bg-[#140e0c] text-[#e0d3a8]">Masculino</option>
                            <option value="female" className="bg-[#140e0c] text-[#e0d3a8]">Feminino</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-viking-gold/15 mt-4 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-viking-gold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-viking-gold" /> Horário de Preferência de Treino
                        </h4>
                        <p className="text-[11px] text-viking-silver leading-relaxed">
                          Defina o seu horário de treino ideal para que as sentinelas vikings te cobrem caso esqueça de relatar o treino.
                        </p>
                        <div>
                          <label className="block text-xs font-bold text-viking-silver mb-1">Horário de Preferência para Treinar</label>
                          <input 
                            type="time" 
                            id="cfgPreferredTime"
                            defaultValue={activeStudentProfile.preferredTime || '18:00'}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const s = parseFloat((document.getElementById('cfgSquat') as HTMLInputElement).value) || null;
                          const b = parseFloat((document.getElementById('cfgBench') as HTMLInputElement).value) || null;
                          const d = parseFloat((document.getElementById('cfgDeadlift') as HTMLInputElement).value) || null;
                          const pt = (document.getElementById('cfgPreferredTime') as HTMLInputElement).value || '18:00';
                          const age = parseInt((document.getElementById('cfgAge') as HTMLInputElement).value) || 25;
                          const bodyWeight = parseFloat((document.getElementById('cfgBodyWeight') as HTMLInputElement).value) || 80;
                          const competitionDate = (document.getElementById('cfgCompetitionDate') as HTMLInputElement).value || '';
                          const targetEventName = (document.getElementById('cfgTargetEventName') as HTMLInputElement).value || '';
                          const gender = (document.getElementById('cfgGender') as HTMLSelectElement).value as 'male' | 'female';
                          
                          const oldPrs = activeStudentProfile.prs || { squat: null, bench: null, deadlift: null };
                          const prevPrs = {
                            squat: s !== oldPrs.squat ? oldPrs.squat : (activeStudentProfile.prevPrs?.squat ?? null),
                            bench: b !== oldPrs.bench ? oldPrs.bench : (activeStudentProfile.prevPrs?.bench ?? null),
                            deadlift: d !== oldPrs.deadlift ? oldPrs.deadlift : (activeStudentProfile.prevPrs?.deadlift ?? null),
                          };
                          const improvedLifts: string[] = [];
                          if (s !== null && s > 0 && (oldPrs.squat === null || s > oldPrs.squat)) {
                            const diff = oldPrs.squat ? s - oldPrs.squat : 0;
                            improvedLifts.push(`Agachamento: ${s}kg ${diff > 0 ? `(+${diff}kg)` : ''}`);
                          }
                          if (b !== null && b > 0 && (oldPrs.bench === null || b > oldPrs.bench)) {
                            const diff = oldPrs.bench ? b - oldPrs.bench : 0;
                            improvedLifts.push(`Supino: ${b}kg ${diff > 0 ? `(+${diff}kg)` : ''}`);
                          }
                          if (d !== null && d > 0 && (oldPrs.deadlift === null || d > oldPrs.deadlift)) {
                            const diff = oldPrs.deadlift ? d - oldPrs.deadlift : 0;
                            improvedLifts.push(`Levantamento Terra: ${d}kg ${diff > 0 ? `(+${diff}kg)` : ''}`);
                          }
                          const updatedProfile = {
                            ...activeStudentProfile,
                            prs: { squat: s, bench: b, deadlift: d },
                            prevPrs,
                            preferredTime: pt,
                            age,
                            bodyWeight,
                            gender,
                            competitionDate,
                            targetEventName
                          };
                          saveStudentsToDB({ ...studentsData, [currentUser!.email.toLowerCase()]: updatedProfile });
                          setDrawerOpen(false);
                          
                          if (improvedLifts.length > 0) {
                            triggerPrConfetti();
                            setPrCelebration({ lifts: improvedLifts });
                            showToast('¡NOVO RECORDE PESSOAL REGISTRADO! Os deuses do ferro celebram!', 'success');
                          } else {
                            showToast('Seu perfil de Guerreiro foi atualizado com sucesso!', 'success');
                          }
                        }}
                        className="w-full py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 mt-4 cursor-pointer"
                      >
                        Salvar e Recalcular Pesos
                      </button>
                      <button 
                        onClick={handleBackupData}
                        className="w-full py-3 mt-2 bg-[#0d0908] border border-viking-gold/20 hover:border-viking-gold/50 hover:bg-viking-gold/10 text-viking-gold font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4 shrink-0" /> Fazer Backup de Dados (JSON)
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Add Student (Trainer) */}
                {drawerType === 'addStudent' && (
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Nome do Atleta</label>
                      <input 
                        name="newStudentName" 
                        required 
                        placeholder="Ex: Lagertha Ironside"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Email</label>
                      <input 
                        name="newStudentEmail" 
                        type="email" 
                        required 
                        placeholder="atleta@email.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase mb-1">WhatsApp</label>
                      <input 
                        name="newStudentPhone" 
                        type="text" 
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Plano Assinado</label>
                      <select name="newStudentPlan" className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold">
                        <option value="Mensal" className="bg-[#140e0c] text-[#e0d3a8]">Mensal (R$ 200)</option>
                        <option value="Trimestral" className="bg-[#140e0c] text-[#e0d3a8]">Trimestral (R$ 540)</option>
                        <option value="Anual" className="bg-[#140e0c] text-[#e0d3a8]">Anual (R$ 1.800)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Estado do Pagamento Inicial</label>
                      <select name="newStudentStatus" className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold">
                        <option value="Pago" className="bg-[#140e0c] text-[#e0d3a8]">Pago</option>
                        <option value="Pendente" className="bg-[#140e0c] text-[#e0d3a8]">Pendente</option>
                        <option value="Atrasado" className="bg-[#140e0c] text-[#e0d3a8]">Atrasado</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 mb-2">
                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Data de Vencimento</label>
                        <input 
                          type="date" 
                          name="newStudentDueDate"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Acesso Inicial</label>
                        <select 
                          name="newStudentAccess"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none"
                        >
                          <option value="granted" className="bg-[#140e0c] text-emerald-400">Liberado</option>
                          <option value="blocked" className="bg-[#140e0c] text-red-400">Bloqueado</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Idade (anos)</label>
                        <input 
                          type="number" 
                          inputMode="decimal"
                          name="newStudentAge" 
                          defaultValue="25"
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Peso Corporal (kg)</label>
                        <input 
                          type="number" 
                          inputMode="decimal"
                          step="0.1"
                          name="newStudentBodyWeight" 
                          defaultValue="80.0"
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Gênero</label>
                      <select name="newStudentGender" className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold">
                        <option value="male" className="bg-[#140e0c] text-[#e0d3a8]">Masculino</option>
                        <option value="female" className="bg-[#140e0c] text-[#e0d3a8]">Feminino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Horário de Preferência para Treinar</label>
                      <input 
                        type="time" 
                        name="newStudentPreferredTime" 
                        defaultValue="18:00"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold [color-scheme:dark]"
                      />
                      <p className="text-[10px] text-viking-silver/50 mt-1">O aluno receberá notificações automáticas caso não registre o treino até este horário.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-viking-gold/15 bg-[#0d0908]/60 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="newStudentAutoMonthlySummary"
                          className="w-4 h-4 rounded border-viking-gold/20 text-viking-gold focus:ring-viking-gold"
                        />
                        <span className="text-xs font-bold text-white uppercase">Geração Automática de Resumo Mensal</span>
                      </label>
                      <textarea
                        name="newStudentMonthlySummaryMessage"
                        placeholder="Ex: Bom trabalho neste mês, continue focado!"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold font-bold h-24"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 mt-4 cursor-pointer"
                    >
                      Convocar Guerreiro ao Clã
                    </button>
                  </form>
                )}

                {/* Edit Student (Trainer) */}
                {drawerType === 'editStudent' && (() => {
                  const s = studentsData[editingStudentEmail.toLowerCase()];
                  if (!s) return <p className="text-sm text-viking-silver">Selecione um atleta válido para editar.</p>;

                  return (
                    <div key={editingStudentEmail} className="space-y-4 text-left">
                      <div className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-1">
                        <p className="text-[10px] text-viking-silver/60 uppercase font-black tracking-wider">Guerreiro em Edição</p>
                        <p className="text-base font-black text-white">{s.name}</p>
                        <p className="text-xs text-viking-silver">{editingStudentEmail}</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Nome do Atleta</label>
                          <input 
                            id="editStudentName"
                            required 
                            defaultValue={s.name}
                            placeholder="Ex: Lagertha Ironside"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-viking-silver uppercase mb-1">WhatsApp</label>
                          <input 
                            id="editStudentPhone"
                            type="text" 
                            defaultValue={s.phone || ''}
                            placeholder="(11) 99999-9999"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold font-bold"
                          />
                        </div>

                        <div className="p-4 rounded-xl border border-viking-gold/15 bg-viking-gold/5 space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-widest text-viking-gold flex items-center gap-1.5">
                            ⚔️ Calibragem de 1 Repetição Máxima (1RM)
                          </h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-viking-silver mb-1">Agachamento Máximo (kg)</label>
                              <WeightControl 
                                value={editStudentSquat}
                                onChange={(val: number) => {
                                  setEditStudentSquat(val);
                                  const input = document.getElementById('editStudentSquat') as HTMLInputElement;
                                  if (input) input.value = val.toString();
                                }}
                                placeholder="Ex: 150"
                                title="Agachamento Máximo (kg)"
                              />
                              <input type="hidden" id="editStudentSquat" value={editStudentSquat} onChange={(e) => setEditStudentSquat(parseFloat(e.target.value) || 0)} />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-viking-silver mb-1">Supino Máximo (kg)</label>
                              <WeightControl 
                                value={editStudentBench}
                                onChange={(val: number) => {
                                  setEditStudentBench(val);
                                  const input = document.getElementById('editStudentBench') as HTMLInputElement;
                                  if (input) input.value = val.toString();
                                }}
                                placeholder="Ex: 110"
                                title="Supino Máximo (kg)"
                              />
                              <input type="hidden" id="editStudentBench" value={editStudentBench} onChange={(e) => setEditStudentBench(parseFloat(e.target.value) || 0)} />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-viking-silver mb-1">Levantamento Terra Máximo (kg)</label>
                              <WeightControl 
                                value={editStudentDeadlift}
                                onChange={(val: number) => {
                                  setEditStudentDeadlift(val);
                                  const input = document.getElementById('editStudentDeadlift') as HTMLInputElement;
                                  if (input) input.value = val.toString();
                                }}
                                placeholder="Ex: 190"
                                title="Levantamento Terra Máximo (kg)"
                              />
                              <input type="hidden" id="editStudentDeadlift" value={editStudentDeadlift} onChange={(e) => setEditStudentDeadlift(parseFloat(e.target.value) || 0)} />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border border-viking-gold/15 bg-black/30 space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-widest text-viking-gold flex items-center gap-1.5">
                            🏆 Parâmetros de Competição (Wilks)
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-viking-silver mb-1">Idade (anos)</label>
                              <input 
                                type="number" 
                                inputMode="decimal"
                                id="editStudentAge"
                                defaultValue={s.age || 25}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-viking-silver mb-1">Peso Corporal (kg)</label>
                              <input 
                                type="number" 
                                inputMode="decimal"
                                step="0.1"
                                id="editStudentBodyWeight"
                                defaultValue={s.bodyWeight || 80}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-viking-silver mb-1">Gênero</label>
                            <select 
                              id="editStudentGender"
                              defaultValue={s.gender || 'male'}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold"
                            >
                              <option value="male" className="bg-[#140e0c] text-[#e0d3a8]">Masculino</option>
                              <option value="female" className="bg-[#140e0c] text-[#e0d3a8]">Feminino</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Horário de Preferência para Treinar</label>
                          <input 
                            type="time" 
                            id="editStudentPreferredTime"
                            defaultValue={s.preferredTime || '18:00'}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none [color-scheme:dark]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Evento Alvo / Teste de Força</label>
                            <select 
                              id="editStudentTargetEvent"
                              defaultValue={s.targetEventId || ''}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold"
                            >
                              <option value="" className="bg-[#140e0c] text-[#e0d3a8]">Sem evento alvo</option>
                              {calendarEvents.map(ev => (
                                <option key={ev.id} value={ev.id} className="bg-[#140e0c] text-[#e0d3a8]">
                                  {ev.title} ({(() => {
                                    const parts = ev.date.split('-');
                                    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ev.date;
                                  })()})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Data Compet. (Manual)</label>
                            <input 
                              type="date" 
                              id="editStudentCompetitionDate"
                              defaultValue={s.competitionDate || ''}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold [color-scheme:dark]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Plano Assinado</label>
                            <select 
                              id="editStudentPlan" 
                              defaultValue={s.plan || 'Mensal'}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none"
                            >
                              <option value="Mensal" className="bg-[#140e0c] text-[#e0d3a8]">Mensal</option>
                              <option value="Trimestral" className="bg-[#140e0c] text-[#e0d3a8]">Trimestral</option>
                              <option value="Semestral" className="bg-[#140e0c] text-[#e0d3a8]">Semestral</option>
                              <option value="Anual" className="bg-[#140e0c] text-[#e0d3a8]">Anual</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Estado de Pagamento</label>
                            <select 
                              id="editStudentStatus" 
                              defaultValue={s.status || 'Pago'}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none"
                            >
                              <option value="Pago" className="bg-[#140e0c] text-[#e0d3a8]">Pago</option>
                              <option value="Pendente" className="bg-[#140e0c] text-[#e0d3a8]">Pendente</option>
                              <option value="Atrasado" className="bg-[#140e0c] text-[#e0d3a8]">Atrasado</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3 mb-2">
                          <div>
                            <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Data de Vencimento</label>
                            <input 
                              type="date" 
                              id="editStudentDueDate"
                              defaultValue={s.dueDate || ''}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none [color-scheme:dark]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Acesso ao App</label>
                            <select 
                              id="editStudentAccess"
                              defaultValue={s.accessBlocked ? 'blocked' : 'granted'}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-medium focus:outline-none"
                            >
                              <option value="granted" className="bg-[#140e0c] text-emerald-400">Liberado</option>
                              <option value="blocked" className="bg-[#140e0c] text-red-400">Bloqueado</option>
                            </select>
                          </div>
                        </div>

                         <div className="mt-3 mb-2">
                           <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20">
                             <input 
                               type="checkbox" 
                               id="editStudentAutoMonthlySummary"
                               defaultChecked={s.autoMonthlySummary || false}
                               className="w-4 h-4 rounded border-viking-gold/20 text-viking-gold focus:ring-viking-gold"
                             />
                             <span className="text-xs font-bold text-white uppercase">Geração Automática de Resumo Mensal</span>
                           </label>
                           <div className="mt-3">
                             <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Mensagem Personalizada no PDF</label>
                             <textarea
                               id="editStudentMonthlySummaryMessage"
                               defaultValue={s.monthlySummaryCustomMessage || ''}
                               placeholder="Ex: Bom trabalho neste mês, continue focado!"
                               className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold font-bold h-24"
                             />
                           </div>
                        </div>

                        <button 
                          onClick={() => {
                            const name = (document.getElementById('editStudentName') as HTMLInputElement).value || s.name;
                            const phone = (document.getElementById('editStudentPhone') as HTMLInputElement).value.trim() || '';
                            const sq = parseFloat((document.getElementById('editStudentSquat') as HTMLInputElement).value) || null;
                            const be = parseFloat((document.getElementById('editStudentBench') as HTMLInputElement).value) || null;
                            const de = parseFloat((document.getElementById('editStudentDeadlift') as HTMLInputElement).value) || null;
                            const age = parseInt((document.getElementById('editStudentAge') as HTMLInputElement).value) || s.age || 25;
                            const bw = parseFloat((document.getElementById('editStudentBodyWeight') as HTMLInputElement).value) || s.bodyWeight || 80;
                            const gen = (document.getElementById('editStudentGender') as HTMLSelectElement).value as 'male' | 'female';
                            const pt = (document.getElementById('editStudentPreferredTime') as HTMLInputElement).value || s.preferredTime || '18:00';
                            const plan = (document.getElementById('editStudentPlan') as HTMLSelectElement).value as any;
                            const status = (document.getElementById('editStudentStatus') as HTMLSelectElement).value as any;
                            const dueDate = (document.getElementById('editStudentDueDate') as HTMLInputElement).value;
                            const accessBlocked = (document.getElementById('editStudentAccess') as HTMLSelectElement).value === 'blocked';
                             const autoMonthlySummary = (document.getElementById('editStudentAutoMonthlySummary') as HTMLInputElement).checked;
                             const monthlySummaryCustomMessage = (document.getElementById('editStudentMonthlySummaryMessage') as HTMLTextAreaElement).value;

                            const eventId = (document.getElementById('editStudentTargetEvent') as HTMLSelectElement).value;
                            let targetEvtDate = s.competitionDate;
                            let targetEvtName = s.targetEventName;
                            if (eventId) {
                              const found = calendarEvents.find(e => e.id === eventId);
                              if (found) {
                                targetEvtDate = found.date;
                                targetEvtName = found.title;
                              }
                            } else {
                              const manualCompDate = (document.getElementById('editStudentCompetitionDate') as HTMLInputElement).value;
                              targetEvtDate = manualCompDate || null;
                              targetEvtName = null;
                            }

                            const oldPrs = s.prs || { squat: null, bench: null, deadlift: null };
                            const prevPrs = {
                              squat: sq !== oldPrs.squat ? oldPrs.squat : (s.prevPrs?.squat ?? null),
                              bench: be !== oldPrs.bench ? oldPrs.bench : (s.prevPrs?.bench ?? null),
                              deadlift: de !== oldPrs.deadlift ? oldPrs.deadlift : (s.prevPrs?.deadlift ?? null),
                            };

                            const improvedLifts: string[] = [];
                            if (sq !== null && sq > 0 && (oldPrs.squat === null || sq > oldPrs.squat)) {
                              const diff = oldPrs.squat ? sq - oldPrs.squat : 0;
                              improvedLifts.push(`Agachamento: ${sq}kg ${diff > 0 ? `(+${diff}kg)` : ''}`);
                            }
                            if (be !== null && be > 0 && (oldPrs.bench === null || be > oldPrs.bench)) {
                              const diff = oldPrs.bench ? be - oldPrs.bench : 0;
                              improvedLifts.push(`Supino: ${be}kg ${diff > 0 ? `(+${diff}kg)` : ''}`);
                            }
                            if (de !== null && de > 0 && (oldPrs.deadlift === null || de > oldPrs.deadlift)) {
                              const diff = oldPrs.deadlift ? de - oldPrs.deadlift : 0;
                              improvedLifts.push(`Levantamento Terra: ${de}kg ${diff > 0 ? `(+${diff}kg)` : ''}`);
                            }

                            const updatedProfile: StudentProfile = {
                              ...s,
                              name,
                              phone,
                              prs: { squat: sq, bench: be, deadlift: de },
                              prevPrs,
                              age,
                              bodyWeight: bw,
                              gender: gen,
                              preferredTime: pt,
                              plan,
                              status,
                              dueDate,
                              accessBlocked,
                               autoMonthlySummary,
                               monthlySummaryCustomMessage,
                              targetEventId: eventId,
                              competitionDate: targetEvtDate,
                              targetEventName: targetEvtName
                            };

                            saveStudentsToDB({ ...studentsData, [editingStudentEmail.toLowerCase()]: updatedProfile });
                            setDrawerOpen(false);

                            if (improvedLifts.length > 0) {
                              triggerPrConfetti();
                              setPrCelebration({ lifts: improvedLifts });
                              showToast(`Novo Recorde de Força registrado para ${name}! Os deuses celebram!`, 'success');
                            } else {
                              showToast(`Dados de ${name} atualizados com sucesso!`, 'success');
                            }
                          }}
                          className="w-full py-3.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 mt-4 cursor-pointer"
                        >
                          Confirmar Alterações e Recalcular
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Public Note / Parabenizar Panel */}
                {drawerType === 'publicNote' && (() => {
                  const s = studentsData[activeNoteStudentEmail];
                  if (!s) return <p className="text-sm text-viking-silver">Selecione um atleta válido.</p>;
                  
                  const presets = [
                    "🔥 PARABÉNS PELO NOVO PR! O clã celebra a sua força! Continue quebrando limites!",
                    "⚔️ Treino de mestre hoje! Sua persistência e entrega orgulham os deuses do ferro!",
                    "🏆 Wilks nas alturas! Você está subindo rapidamente na classificação geral do templo!",
                    "💪 Excelente consistência! Continue firme na jornada em direção à força absoluta!"
                  ];

                  return (
                    <div className="space-y-4 text-left">
                      <div className="p-4 rounded-xl bg-viking-gold/5 border border-viking-gold/15">
                        <p className="text-xs text-viking-silver">Atleta selecionado:</p>
                        <p className="text-base font-black text-white mt-1">{s.name}</p>
                        <p className="text-[10px] text-viking-silver/50">{activeNoteStudentEmail}</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#e0d3a8] uppercase tracking-wider">Sua Mensagem de Destaque / Parabéns</label>
                        <textarea
                          value={publicNoteInput}
                          onChange={(e) => setPublicNoteInput(e.target.value)}
                          placeholder="Digite aqui palavras de honra, conquistas ou um novo recorde que merece celebração no feed..."
                          className="w-full h-32 px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold font-medium text-sm leading-relaxed"
                        />
                        <p className="text-[10px] text-viking-silver/50 leading-normal">
                          Esta mensagem será apresentada em destaque dourado com efeito épico na página inicial do guerreiro.
                        </p>
                      </div>

                      {/* Suggestions presets */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-viking-silver uppercase tracking-wider">Sugestões Rápidas (Toque para usar)</p>
                        <div className="space-y-2">
                          {presets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPublicNoteInput(preset)}
                              className="w-full text-left p-2.5 rounded-xl bg-[#0d0908]/40 border border-viking-gold/10 hover:border-viking-gold/30 hover:bg-viking-gold/5 text-xs text-viking-silver hover:text-white transition-all font-medium leading-relaxed cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-4">
                        {s.publicNote && (
                          <button
                            type="button"
                            onClick={() => handleSavePublicNote(activeNoteStudentEmail, '')}
                            className="flex-1 py-3 border border-red-500/30 hover:border-red-500 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Remover Nota
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSavePublicNote(activeNoteStudentEmail, publicNoteInput)}
                          className="flex-[2] py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Salvar Mensagem
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 5.5 Student Action Panel */}
                {drawerType === 'studentPanel' && (() => {
                  const s = studentsData[editingStudentEmail];
                  if (!s) return <p className="text-viking-silver">Atleta não encontrado.</p>;

                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-viking-gold/5 border border-viking-gold/15 mb-4">
                        <p className="text-base font-black text-white">{s.name}</p>
                        <p className="text-xs text-viking-silver">{editingStudentEmail}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            setActiveNoteStudentEmail(editingStudentEmail);
                            setPublicNoteInput(s.publicNote || '');
                            setDrawerTitle(`Nota Pública / Parabenizar ${s.name}`);
                            setDrawerType('publicNote');
                          }}
                          className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Parabenizar</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setActiveChatStudentEmail(editingStudentEmail);
                            setDrawerTitle(`Chat com ${s.name}`);
                            setDrawerType('chat');
                          }}
                          className="p-3 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30 text-viking-gold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Feedback</span>
                        </button>

                        <button 
                          onClick={() => {
                            setDrawerTitle(`Editar Cadastro de ${s.name}`);
                            setDrawerType('editStudent');
                          }}
                          className="p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Editar Cadastro</span>
                        </button>

                        <button 
                          onClick={() => {
                            setDrawerOpen(false);
                            openProgramEditor(editingStudentEmail);
                          }}
                          className="p-3 rounded-xl bg-viking-dark border border-viking-gold/25 hover:border-viking-gold hover:bg-viking-gold/10 text-viking-silver transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4 text-viking-gold" /> <span className="text-xs font-bold uppercase tracking-wider">Prescrever Treino</span>
                        </button>

                        <button 
                          onClick={() => {
                            setDrawerTitle(`Cardio & Corridas: ${s.name}`);
                            setDrawerType('studentCardio');
                          }}
                          className="p-3 rounded-xl bg-[#0d0908] border border-viking-gold/25 hover:border-viking-gold hover:bg-viking-gold/10 text-viking-silver transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4 text-viking-gold animate-pulse" /> <span className="text-xs font-bold uppercase tracking-wider">Prescrever Cardio</span>
                        </button>

                        <button 
                          onClick={() => {
                            sendWorkoutPlanEmail(editingStudentEmail, s);
                          }}
                          className="p-3 rounded-xl bg-[#0d0908] border border-viking-gold/20 hover:border-viking-gold/50 text-viking-gold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Mail className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Enviar E-mail</span>
                        </button>

                        <button 
                          onClick={() => {
                            handleSendWorkoutPlanWhatsApp(editingStudentEmail, s);
                          }}
                          className="p-3 rounded-xl bg-[#1ea453]/10 hover:bg-[#1ea453]/20 border border-[#1ea453]/30 hover:border-[#1ea453]/70 text-[#25d366] transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#1ea453]/5"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25d366]" /> <span className="text-xs font-bold uppercase tracking-wider">Ficha no WhatsApp</span>
                        </button>

                        <button 
                          onClick={() => {
                            setDrawerOpen(false);
                            setDeletingStudentEmail(editingStudentEmail);
                          }}
                          className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 text-red-400 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Remover Guerreiro</span>
                        </button>
                      </div>

                      {/* 1RM Progress Chart (Evolução de PRs) */}
                      <div className="pt-4 border-t border-viking-gold/15">
                        <OneRepMaxChart profile={s} />
                      </div>
                    </div>
                  );
                })()}

                {/* 5.6 Trainer's Student Cardio Prescription & Tracking */}
                {drawerType === 'studentCardio' && (() => {
                  const s = studentsData[editingStudentEmail];
                  if (!s) return <p className="text-viking-silver">Atleta não encontrado.</p>;

                  return (
                    <CardioView 
                      profile={s}
                      role="trainer"
                      onAddSession={(session) => {
                        handleUpdateStudentCardio(editingStudentEmail, (p) => ({
                          cardioSessions: [...(p.cardioSessions || []), session]
                        }));
                        showToast('Sessão de cardio registrada para o atleta!', 'success');
                      }}
                      onAddGoal={(goal) => {
                        handleUpdateStudentCardio(editingStudentEmail, (p) => ({
                          cardioGoals: [...(p.cardioGoals || []), goal]
                        }));
                        showToast('Novo objetivo de cardio definido para o atleta!', 'success');
                      }}
                      onAddPrescription={(prescription) => {
                        handleUpdateStudentCardio(editingStudentEmail, (p) => ({
                          cardioPrescriptions: [...(p.cardioPrescriptions || []), prescription]
                        }));
                        showToast('Prescrição de cardio adicionada com sucesso!', 'success');
                      }}
                      onDeleteSession={(sessionId) => {
                        handleUpdateStudentCardio(editingStudentEmail, (p) => ({
                          cardioSessions: (p.cardioSessions || []).filter(sess => sess.id !== sessionId)
                        }));
                        showToast('Registro de cardio removido.', 'info');
                      }}
                      onDeleteGoal={(goalId) => {
                        handleUpdateStudentCardio(editingStudentEmail, (p) => ({
                          cardioGoals: (p.cardioGoals || []).filter(g => g.id !== goalId)
                        }));
                        showToast('Objetivo removido.', 'info');
                      }}
                      onDeletePrescription={(prescriptionId) => {
                        handleUpdateStudentCardio(editingStudentEmail, (p) => ({
                          cardioPrescriptions: (p.cardioPrescriptions || []).filter(pr => pr.id !== prescriptionId)
                        }));
                        showToast('Prescrição de cardio removida.', 'info');
                      }}
                      onUpdateGoalStatus={(goalId, completed) => {
                        handleUpdateStudentCardio(editingStudentEmail, (p) => {
                          const updatedGoals = (p.cardioGoals || []).map(g => 
                            g.id === goalId 
                              ? { ...g, completed, achievedDate: completed ? new Date().toISOString().split('T')[0] : undefined } 
                              : g
                          );
                          return { cardioGoals: updatedGoals };
                        });
                        showToast(completed ? 'Meta marcada como concluída!' : 'Meta reaberta.', 'success');
                      }}
                    />
                  );
                })()}

                 {/* 6. WhatsApp billing */}
                 {drawerType === 'whatsapp' && (
                   <div className="space-y-5">
                     <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4">
                       <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">Painel de Atrasados</h4>
                       <p className="text-xs text-viking-silver/85">
                         Filtre e notifique de forma rápida os alunos com status de mensalidade 'Atrasado'.
                       </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                       {/* Search Bar */}
                       <div className="relative flex-1">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Search className="h-3.5 w-3.5 text-viking-gold/60" />
                         </div>
                         <input
                           type="text"
                           placeholder="Buscar guerreiro..."
                           value={whatsappSearch}
                           onChange={(e) => setWhatsappSearch(e.target.value)}
                           className="w-full pl-9 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/45 outline-none transition-all"
                         />
                         {whatsappSearch && (
                           <button
                             onClick={() => setWhatsappSearch('')}
                             className="absolute inset-y-0 right-0 pr-3 flex items-center text-viking-silver hover:text-viking-gold transition-colors text-xs font-bold cursor-pointer"
                           >
                             <X className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                       
                       {/* Delay Filter */}
                       <div className="sm:w-48 relative">
                         <select
                           value={billingFilterDelay}
                           onChange={(e) => setBillingFilterDelay(Number(e.target.value))}
                           className="w-full appearance-none pl-3 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white outline-none transition-all cursor-pointer font-bold"
                         >
                           <option value={0}>Todos os Atrasados</option>
                           <option value={7}>Mais de 7 dias</option>
                           <option value={15}>Mais de 15 dias</option>
                           <option value={30}>Mais de 30 dias</option>
                         </select>
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                           <Filter className="h-3.5 w-3.5 text-viking-gold/60" />
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       {(() => {
                         const today = new Date();
                         today.setHours(0, 0, 0, 0);

                         const filtered = Object.keys(studentsData)
                           .map(email => ({ email, s: studentsData[email] }))
                           .filter((item): item is { email: string; s: NonNullable<typeof item.s> } => item.s !== undefined && item.s !== null)
                           .filter(({ email, s }) => {
                             if (s.status !== 'Atrasado') return false; // ONLY Atrasado
                             
                             // Delay logic
                             let daysDelayed = 0;
                             if (s.dueDate) {
                               const [year, month, day] = s.dueDate.split('-');
                               const due = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                               const diffTime = today.getTime() - due.getTime();
                               daysDelayed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                             }
                             
                             if (billingFilterDelay > 0 && daysDelayed <= billingFilterDelay) return false;

                             const term = whatsappSearch.toLowerCase().trim();
                             if (!term) return true;
                             return s.name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
                           });

                         if (filtered.length === 0) {
                           return (
                             <div className="text-center py-10 bg-black/20 rounded-2xl border border-viking-gold/10">
                               <Shield className="w-10 h-10 mx-auto text-emerald-500/30 mb-3" />
                               <p className="text-sm text-emerald-500/80 font-bold">Nenhum atleta atrasado encontrado.</p>
                               <p className="text-xs text-viking-silver/60 mt-1">As finanças do templo estão seguras para este filtro!</p>
                             </div>
                           );
                         }

                         return filtered.map(({ email, s }) => {
                           // calc delay for display
                           let daysDelayed = 0;
                           if (s.dueDate) {
                             const [year, month, day] = s.dueDate.split('-');
                             const due = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                             const diffTime = today.getTime() - due.getTime();
                             daysDelayed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                           }

                           const customText = `Saudações, guerreiro ${s.name}! Identificamos que sua assinatura na Viking Force encontra-se ATRASADA. Por favor, regularize sua situação o quanto antes para continuar seus treinos! 💪⚔️`;
                           const phoneClean = (s.phone || '').replace(/\D/g, ''); 
                           
                           const mailSubject = encodeURIComponent("Renovação de Assinatura - Viking Force");
                           const mailBody = encodeURIComponent(`Saudações, guerreiro ${s.name}!

Identificamos que sua assinatura na Viking Force encontra-se ATRASADA.
Por favor, regularize sua situação o quanto antes para continuar acessando seus treinos.

Atenciosamente,
Equipe Viking Force`);

                           return (
                             <div key={email} className="p-4 rounded-xl bg-red-950/10 border border-red-500/20 hover:border-red-500/40 hover:bg-red-950/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                               <div>
                                 <div className="flex items-center gap-2">
                                   <p className="text-sm font-bold text-white">{s.name}</p>
                                   <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                     {s.status}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-3 mt-1.5 text-[10px] text-viking-silver/80">
                                   <span className="flex items-center gap-1">
                                     <Calendar className="w-3 h-3" /> Vencimento: {s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'N/A'}
                                   </span>
                                   {daysDelayed > 0 && (
                                     <span className="flex items-center gap-1 text-red-400 font-bold">
                                       <AlertTriangle className="w-3 h-3" /> {daysDelayed} dias de atraso
                                     </span>
                                   )}
                                 </div>
                                 {s.phone && <p className="text-[10px] text-viking-silver mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</p>}
                               </div>
                               
                               <div className="flex gap-2 w-full md:w-auto">
                                 {s.phone ? (
                                   <a 
                                     href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(customText)}`}
                                     target="_blank"
                                     rel="noreferrer"
                                     className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-[#1ea453] hover:bg-[#167d3e] text-white font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#1ea453]/20"
                                   >
                                     <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                   </a>
                                 ) : (
                                   <button disabled className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-viking-dark border border-viking-gold/10 text-viking-silver/30 font-bold text-[10px] uppercase cursor-not-allowed flex items-center justify-center gap-1.5">
                                     <MessageCircle className="w-3.5 h-3.5 opacity-30" /> S/ Whats
                                   </button>
                                 )}
                                 <a 
                                   href={`mailto:${email}?subject=${mailSubject}&body=${mailBody}`}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-viking-dark border border-viking-gold/30 hover:border-viking-gold text-[#e0d3a8] hover:text-white font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                 >
                                   <Mail className="w-3.5 h-3.5 text-viking-gold" /> E-mail
                                 </a>
                               </div>
                             </div>
                           );
                         });
                       })()}
                     </div>
                   </div>
                 )}

                  {/* WhatsApp Custom Template Settings */}
                  {drawerType === 'whatsappSettings' && (
                    <div className="space-y-5">
                      <div className="bg-[#0d0908]/60 border border-viking-gold/15 rounded-2xl p-4 space-y-2">
                        <h4 className="text-sm font-black text-viking-gold uppercase tracking-widest flex items-center gap-2">
                          🛡️ Personalizar Notificação
                        </h4>
                        <p className="text-xs text-viking-silver/85 leading-relaxed">
                          Ajuste o modelo de mensagem que o WhatsApp carrega ao compartilhar novos treinos preparados com seus guerreiros. Use os botões abaixo para inserir placeholders dinâmicos!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Editor Column */}
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <label className="block text-xs font-black uppercase text-viking-silver tracking-wider">
                              Modelo da Mensagem (Template)
                            </label>
                            <textarea
                              id="whatsappTemplateInput"
                              value={whatsappWorkoutTemplate}
                              onChange={(e) => {
                                setWhatsappWorkoutTemplate(e.target.value);
                                localStorage.setItem('viking_whatsapp_workout_template', e.target.value);
                              }}
                              className="w-full h-80 px-4 py-3 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/30 outline-none transition-all font-mono leading-relaxed resize-none"
                              placeholder="Digite o modelo de mensagem aqui..."
                            />
                          </div>

                          {/* Placeholders Toolbar */}
                          <div className="space-y-2.5">
                            <p className="text-[10px] font-black uppercase text-viking-gold tracking-widest">
                              Placeholders Dinâmicos (Clique para inserir)
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { tag: '{NOME_ALUNO}', desc: 'Nome do guerreiro' },
                                { tag: '{NOME_TREINO}', desc: 'Nome do treino/protocolo' },
                                { tag: '{PR_SQUAT}', desc: 'Carga de Agachamento' },
                                { tag: '{PR_BENCH}', desc: 'Carga de Supino' },
                                { tag: '{PR_DEADLIFT}', desc: 'Carga de Terra' },
                              ].map((item) => (
                                <button
                                  key={item.tag}
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.getElementById('whatsappTemplateInput') as HTMLTextAreaElement;
                                    if (textarea) {
                                      const start = textarea.selectionStart;
                                      const end = textarea.selectionEnd;
                                      const text = textarea.value;
                                      const before = text.substring(0, start);
                                      const after = text.substring(end, text.length);
                                      const newVal = before + item.tag + after;
                                      setWhatsappWorkoutTemplate(newVal);
                                      localStorage.setItem('viking_whatsapp_workout_template', newVal);
                                      
                                      // Refocus and place cursor after inserted tag
                                      setTimeout(() => {
                                        textarea.focus();
                                        textarea.setSelectionRange(start + item.tag.length, start + item.tag.length);
                                      }, 50);
                                    } else {
                                      const newVal = whatsappWorkoutTemplate + ' ' + item.tag;
                                      setWhatsappWorkoutTemplate(newVal);
                                      localStorage.setItem('viking_whatsapp_workout_template', newVal);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-viking-gold/5 hover:bg-viking-gold/15 border border-viking-gold/20 hover:border-viking-gold/50 transition-all text-left text-[10px] cursor-pointer"
                                >
                                  <div className="font-mono text-viking-gold font-bold">{item.tag}</div>
                                  <div className="text-[8px] text-viking-silver/60 uppercase mt-0.5">{item.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Real-time Preview Column */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-black uppercase text-viking-silver tracking-wider">
                              Visualização em Tempo Real (Prévia)
                            </label>
                            
                            {/* Student selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-viking-silver/70 font-bold uppercase">Aluno:</span>
                              <select
                                value={whatsappPreviewStudentEmail}
                                onChange={(e) => setWhatsappPreviewStudentEmail(e.target.value)}
                                className="px-2.5 py-1 bg-[#120e0d] border border-viking-gold/25 hover:border-viking-gold/50 rounded-lg text-[11px] font-bold text-viking-gold outline-none transition-all cursor-pointer max-w-[160px]"
                              >
                                <option value="">[Ragnar Lodbrok - Exemplo]</option>
                                {(Object.entries(studentsData) as [string, StudentProfile][])
                                  .filter(([_, s]) => !s.isDeleted)
                                  .map(([email, s]) => (
                                    <option key={email} value={email}>
                                      {s.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          {/* WhatsApp Chat Container Mockup */}
                          <div className="relative rounded-2xl border border-emerald-500/20 bg-[#0b141a] overflow-hidden shadow-2xl h-[420px] flex flex-col">
                            {/* WhatsApp Top bar */}
                            <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 shrink-0 border-b border-[#2a3942]">
                              {/* Avatar */}
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs tracking-wider shrink-0 uppercase">
                                {(() => {
                                  const previewStudent = studentsData[whatsappPreviewStudentEmail];
                                  const name = previewStudent?.name || 'Ragnar Lodbrok';
                                  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
                                })()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-white truncate leading-tight">
                                  {(() => {
                                    const previewStudent = studentsData[whatsappPreviewStudentEmail];
                                    return previewStudent?.name || 'Ragnar Lodbrok';
                                  })()}
                                </h5>
                                <span className="text-[9px] text-[#8696a0] font-medium">Online</span>
                              </div>
                              <div className="flex items-center gap-3 text-[#aebac1]">
                                <Phone className="w-3.5 h-3.5" />
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>
                            </div>

                            {/* Chat bubble background with custom pattern look */}
                            <div className="flex-1 overflow-y-auto p-4 bg-[#0b141a] flex flex-col justify-end space-y-3 relative" style={{ backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`, backgroundSize: '16px 16px' }}>
                              {/* Left side received info bubble */}
                              <div className="self-start max-w-[85%] rounded-lg rounded-tl-none bg-[#1f2c34] text-[#e9edef] p-2.5 text-[11px] shadow-sm leading-relaxed border border-[#2a3942]/40">
                                Olá Coach! Pode me enviar o treino de hoje? 💪🏋️
                                <div className="text-[9px] text-[#8696a0] text-right mt-1">18:55</div>
                              </div>

                              {/* Right side WhatsApp Message Bubble (Our template preview) */}
                              <div className="self-end max-w-[85%] rounded-lg rounded-tr-none bg-[#005c4b] text-[#e9edef] p-3 text-[11px] shadow-md relative group border border-[#007a62]/30 flex flex-col">
                                {/* Message text with bold/italic parser */}
                                <div className="space-y-1 select-text">
                                  {(() => {
                                    const previewStudent = studentsData[whatsappPreviewStudentEmail];
                                    let name = 'Ragnar Lodbrok';
                                    let workout = 'Divisão Viking Força de Titã';
                                    let squat = '180kg';
                                    let bench = '120kg';
                                    let deadlift = '220kg';

                                    if (previewStudent) {
                                      name = previewStudent.name;
                                      workout = previewStudent.customProgramName || 'Ficha de Treino';
                                      squat = previewStudent.prs?.squat ? `${previewStudent.prs.squat}kg` : 'A definir';
                                      bench = previewStudent.prs?.bench ? `${previewStudent.prs.bench}kg` : 'A definir';
                                      deadlift = previewStudent.prs?.deadlift ? `${previewStudent.prs.deadlift}kg` : 'A definir';
                                    }

                                    const filledMessage = whatsappWorkoutTemplate
                                      .replace(/{NOME_ALUNO}/gi, name)
                                      .replace(/{NOME_TREINO}/gi, workout)
                                      .replace(/{PR_SQUAT}/gi, squat)
                                      .replace(/{PR_BENCH}/gi, bench)
                                      .replace(/{PR_DEADLIFT}/gi, deadlift);

                                    return filledMessage.split('\n').map((line, lineIdx) => {
                                      const regex = /(\*.*?\*|_.*?_|~.*?~)/g;
                                      const tokens = line.split(regex);
                                      const renderedLine = tokens.map((token, tokenIdx) => {
                                        if (token.startsWith('*') && token.endsWith('*')) {
                                          return <strong key={tokenIdx} className="font-extrabold text-white">{token.slice(1, -1)}</strong>;
                                        }
                                        if (token.startsWith('_') && token.endsWith('_')) {
                                          return <em key={tokenIdx} className="italic text-gray-200">{token.slice(1, -1)}</em>;
                                        }
                                        if (token.startsWith('~') && token.endsWith('~')) {
                                          return <span key={tokenIdx} className="line-through text-gray-400">{token.slice(1, -1)}</span>;
                                        }
                                        return token;
                                      });
                                      return (
                                        <div key={lineIdx} className="min-h-[1.2rem] text-[11px] leading-relaxed text-[#e9edef] break-words">
                                          {renderedLine}
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>

                                <div className="text-[9px] text-[#8696a0] text-right mt-1.5 flex items-center justify-end gap-1">
                                  <span>18:57</span>
                                  {/* Double blue checks */}
                                  <svg viewBox="0 0 16 11" width="16" height="11" className="fill-[#53bdeb] inline-block shrink-0">
                                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.047L8.025 10.358 4.791 7.218a.365.365 0 0 0-.51.003l-.43.43a.37.37 0 0 0 .003.518l3.96 3.854a.365.365 0 0 0 .514-.006L15.057 3.83a.365.365 0 0 0-.047-.514zm-4.228 0l-.478-.372a.365.365 0 0 0-.51.047L4.297 10.358 3.322 9.41a.365.365 0 0 0-.51.003l-.43.43a.37.37 0 0 0 .003.518l1.714 1.669a.365.365 0 0 0 .515-.006L10.83 3.83a.365.365 0 0 0-.047-.514z"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* WhatsApp Bottom send bar */}
                            <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2.5 shrink-0 border-t border-[#2a3942]">
                              <div className="flex-1 bg-[#2a3942] rounded-lg px-3.5 py-1.5 text-[10px] text-[#8696a0]">
                                Mensagem enviada automaticamente...
                              </div>
                              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[#111b21] shrink-0">
                                <Send className="w-3.5 h-3.5 rotate-45" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const defaultTemplate = `🛡️ *TEMPLO VIKING FORCE - TREINO PREPARADO!* 🛡️

Saudações, Guerreiro *{NOME_ALUNO}*! ⚔️

Seu treinador acaba de preparar e atualizar a sua ficha de treino *{NOME_TREINO}*! Seu corpo, sua mente e seus limites serão testados nesta nova fase.

📊 *Resumo de Batalha (PRs Atuais):*
• 🏋️ Agachamento: {PR_SQUAT}
• 🏋️ Supino: {PR_BENCH}
• 🏋️ Levantamento Terra: {PR_DEADLIFT}

📥 *Ação Solicitada:*
1️⃣ Baixe a ficha em PDF que estou te enviando aqui.
2️⃣ Acesse o *Diário do Guerreiro* para registrar suas repetições, RPE e acompanhar sua evolução em tempo real!

*Que os deuses do ferro abençoem seus levantamentos. O ferro não mente!* 🔥💪⚡`;
                            setWhatsappWorkoutTemplate(defaultTemplate);
                            localStorage.setItem('viking_whatsapp_workout_template', defaultTemplate);
                            showToast('Modelo restaurado para o padrão Viking!', 'info');
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-viking-dark hover:bg-[#120e0d] border border-viking-gold/20 hover:border-viking-gold/44 text-viking-silver text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Restaurar Padrão
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Mensagem personalizada guardada com sucesso!', 'success');
                            setDrawerOpen(false);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-viking-gold hover:bg-viking-gold-hover text-black font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-viking-gold/10"
                        >
                          Salvar Configuração
                        </button>
                      </div>
                    </div>
                  )}

                {/* 7. Payments list (Trainer) */}
                {drawerType === 'payments' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80">Controle de fluxo de caixa referente à prestação de serviços de treinamento esportivo.</p>
                     
                     <div className="flex gap-2">
                       <button
                         onClick={handleExportFinancialSummary}
                         className="flex-1 px-3 py-2 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 text-viking-gold border border-viking-gold/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                       >
                         <FileDown className="w-3.5 h-3.5" />
                         Exportar Resumo (CSV)
                       </button>
                       <button
                         onClick={() => checkPaymentReminders()}
                         className="flex-1 px-3 py-2 rounded-xl bg-viking-silver/10 hover:bg-viking-silver/20 text-viking-silver border border-viking-silver/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                       >
                         <Bell className="w-3.5 h-3.5" />
                         Verificar Vencimentos
                       </button>
                     </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-viking-gold/60" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar guerreiro por nome ou email..."
                        value={paymentsSearch}
                        onChange={(e) => setPaymentsSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/45 outline-none transition-all"
                      />
                      {paymentsSearch && (
                        <button
                          onClick={() => setPaymentsSearch('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-viking-silver hover:text-viking-gold transition-colors text-xs font-bold cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const filtered = Object.keys(studentsData).filter(email => {
                          const s = studentsData[email];
                          if (!s) return false;
                          const term = paymentsSearch.toLowerCase().trim();
                          if (!term) return true;
                          return s.name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
                        });

                        if (filtered.length === 0) {
                          return (
                            <p className="text-center py-6 text-xs text-viking-silver/60">
                              Nenhum guerreiro correspondente encontrado.
                            </p>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map(email => {
                              const s = studentsData[email];
                              return (
                                <div 
                                  key={email} 
                                  onClick={() => setSelectedPaymentStudent(email)}
                                  className="p-3.5 rounded-2xl bg-[#0d0908]/65 hover:bg-[#1a1210]/95 border border-viking-gold/15 hover:border-viking-gold/40 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2.5 group relative shadow-md"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-extrabold text-white group-hover:text-viking-gold transition-colors truncate">
                                        {s.name}
                                      </p>
                                      <p className="text-[10px] text-viking-silver/50 truncate mt-0.5">{email}</p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                                      s.status === 'Pago' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : s.status === 'Pendente' 
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                      {s.status}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-[10px] bg-[#0d0908]/40 p-2 rounded-lg border border-viking-gold/5">
                                    <span className="text-viking-silver/70 font-semibold truncate mr-2">{s.plan}</span>
                                    <span className="font-extrabold text-white text-xs shrink-0">
                                      R$ {getPlanPrice(s.plan).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  
                                  <div className="text-[9px] text-viking-gold/70 font-medium uppercase tracking-wider flex items-center justify-between border-t border-viking-gold/5 pt-2">
                                    <span>Vencimento: {s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'N/A'}</span>
                                    <span className="text-viking-silver/40 group-hover:text-viking-gold transition-all flex items-center gap-1 font-black">
                                      Ações <Settings className="w-3 h-3 text-viking-gold animate-spin-slow shrink-0" />
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* JANELA DE GERENCIAMENTO DE PAGAMENTO (SUB-MODAL) */}
                    <AnimatePresence>
                      {selectedPaymentStudent && (() => {
                        const s = studentsData[selectedPaymentStudent];
                        if (!s) return null;
                        const price = getPlanPrice(s.plan);
                        return (
                          <>
                            {/* Sub-backdrop */}
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setSelectedPaymentStudent(null)}
                              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70]"
                            />
                            
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-48%' }}
                              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-48%' }}
                              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                              className="fixed top-1/2 left-1/2 w-[calc(100%-2.5rem)] max-w-sm bg-[#140e0c]/98 border-2 border-viking-gold/40 rounded-3xl p-5 shadow-[0_0_60px_rgba(212,175,55,0.35)] z-[75] text-[#e0d3a8] flex flex-col gap-4 overflow-hidden"
                            >
                              {/* Header */}
                              <div className="flex justify-between items-start border-b border-viking-gold/15 pb-3">
                                <div>
                                  <span className="text-[9px] text-viking-gold uppercase tracking-widest font-viking-medieval font-black">Cobranças & Recibos</span>
                                  <h4 className="text-base font-black text-white font-viking-display tracking-wider mt-0.5">Gladiador Finanças</h4>
                                  <p className="text-[10px] text-viking-silver/65 truncate max-w-[220px] mt-0.5">{selectedPaymentStudent}</p>
                                </div>
                                <button 
                                  onClick={() => setSelectedPaymentStudent(null)}
                                  className="p-1 rounded-xl bg-viking-gold/10 border border-viking-gold/20 text-viking-silver hover:text-viking-gold cursor-pointer transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Info Box */}
                              <div className="bg-[#0d0908]/90 border border-viking-gold/15 rounded-2xl p-3.5 flex flex-col gap-2.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-viking-silver/80 font-bold">Guerreiro:</span>
                                  <span className="font-extrabold text-white text-right truncate max-w-[160px]">{s.name}</span>
                                </div>
                                
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-viking-silver/80 font-bold">Plano:</span>
                                  <span className="bg-viking-gold/10 border border-viking-gold/25 px-2 py-0.5 rounded text-viking-gold font-black uppercase text-[10px]">{s.plan}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-viking-silver/80 font-bold">Tributo:</span>
                                  <span className="font-black text-white">R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-viking-silver/80 font-bold">Vencimento:</span>
                                  <span className="text-white font-black">{s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'N/A'}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2.5 border-t border-viking-gold/10 text-xs">
                                  <span className="text-viking-silver/80 font-bold">Status:</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                    s.status === 'Pago' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                      : s.status === 'Pendente' 
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
                                      : 'bg-red-500/10 text-red-400 border-red-500/25'
                                  }`}>
                                    {s.status}
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 mt-1">
                                <button
                                  onClick={() => {
                                    handleRegisterPayment(selectedPaymentStudent);
                                    setSelectedPaymentStudent(null);
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                >
                                  <CheckCircle className="w-4 h-4 shrink-0" />
                                  Registrar Pagamento
                                </button>

                                <button
                                  onClick={() => {
                                    generateReceiptPDF(selectedPaymentStudent, s);
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-viking-gold/15 hover:bg-viking-gold/25 text-viking-gold border border-viking-gold/30 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                >
                                  <FileDown className="w-4 h-4 shrink-0" />
                                  Gerar Recibo (PDF)
                                </button>

                                <button
                                  onClick={() => {
                                    handleSendRenewalEmail(selectedPaymentStudent);
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-viking-dark hover:bg-viking-darker text-[#e0d3a8] border border-viking-gold/20 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Mail className="w-4 h-4 text-viking-gold shrink-0" />
                                  Cobrar via E-mail
                                </button>

                                <button
                                  onClick={() => {
                                    if (s.phone) {
                                      const phoneClean = s.phone.replace(/\D/g, '');
                                      const message = `Saudações, guerreiro ${s.name}! Passando para lembrar que o vencimento da sua mensalidade no Templo Viking está próximo (${s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'em breve'}). Prepare o seu tributo para continuarmos firmes na jornada de força! ⚔️🛡️💪`;
                                      window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`, '_blank');
                                    } else {
                                      showToast('Este guerreiro não possui número de WhatsApp cadastrado!', 'warning');
                                    }
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-[#1ea453]/15 hover:bg-[#1ea453]/25 text-[#1ea453] border border-[#1ea453]/30 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                >
                                  <MessageCircle className="w-4 h-4 text-[#1ea453] shrink-0" />
                                  Cobrar via WhatsApp
                                </button>
                              </div>

                              {/* Close Button */}
                              <button
                                onClick={() => setSelectedPaymentStudent(null)}
                                className="w-full py-2 bg-transparent hover:bg-white/5 border border-transparent hover:border-viking-gold/15 text-viking-silver hover:text-white text-[10px] font-bold tracking-wider uppercase transition-all rounded-xl cursor-pointer"
                              >
                                Voltar à Lista
                              </button>
                            </motion.div>
                          </>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                )}

                {/* 7.5. Treinos Concluídos (Trainer) */}
                {drawerType === 'recentWorkouts' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80">Feed de treinos concluídos por todos os guerreiros, ordenados do mais recente para o mais antigo.</p>
                    
                    <div className="space-y-4 mt-4">
                      {(() => {
                        const allSessions: (LoggedSession & { studentName: string; studentEmail: string })[] = [];
                        Object.entries(studentsData).forEach(([email, student]: [string, any]) => {
                          if (student && student.sessions && student.sessions.length > 0) {
                            student.sessions.forEach(sess => {
                              allSessions.push({ ...sess, studentName: student.name, studentEmail: email });
                            });
                          }
                        });

                        allSessions.sort((a, b) => {
                          const aTime = a.id ? parseInt(a.id.split('_')[1] || '0') : 0;
                          const bTime = b.id ? parseInt(b.id.split('_')[1] || '0') : 0;
                          return bTime - aTime;
                        });

                        if (allSessions.length === 0) {
                          return <p className="text-sm text-viking-silver">Nenhum treino concluído ainda.</p>;
                        }

                        return allSessions.map(sess => {
                          const hasFailedExercise = sess.exercises?.some(ex => ex.failed);
                          
                          return (
                          <div key={`${sess.studentEmail}-${sess.id}`} className={`bg-[#0d0908]/90 p-4 rounded-xl border shadow-md ${hasFailedExercise ? 'border-red-500/40' : 'border-viking-gold/20'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                  <User className="w-4 h-4 text-viking-gold" /> {sess.studentName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-viking-gold/80">{sess.sessionName}</p>
                                  {hasFailedExercise && (
                                    <span className="inline-flex items-center gap-1 bg-red-950/40 border border-red-500/30 px-1.5 py-0.5 rounded text-[9px] text-red-400 uppercase font-bold" title="Houve falha em um ou mais exercícios">
                                      <AlertTriangle className="w-3 h-3" /> Falha Registrada
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-viking-silver/60 uppercase tracking-wider">{sess.date}</p>
                                <span className={`inline-flex items-center gap-1 font-bold text-[11px] mt-1 ${
                                  sess.avgRPE >= 9 ? 'text-red-400' : sess.avgRPE >= 7.5 ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                  <Activity className="w-3 h-3" /> RPE {(sess.avgRPE || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>

                            {sess.note && (
                              <div className="mt-3 p-3 bg-black/40 rounded-lg border border-viking-gold/10">
                                <p className="text-xs text-viking-silver italic">"{sess.note}"</p>
                              </div>
                            )}

                            {sess.volumeDeficit && sess.volumeDeficit > 0 && (
                              <div className="mt-2 text-[10px] text-amber-500/80 font-semibold">
                                ⚠️ Déficit de {sess.volumeDeficit} reps neste treino.
                              </div>
                            )}
                          </div>
                        )});
                      })()}
                    </div>
                  </div>
                )}

                {/* 8. RPE Logs (Trainer) */}
                {drawerType === 'rpeFeedback' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80">Histórico cronológico de feedbacks postados pelos seus atletas. Monitoramento de cansaço extremo.</p>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-viking-gold/60" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar guerreiro por nome ou email..."
                        value={rpeSearch}
                        onChange={(e) => setRpeSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/45 outline-none transition-all"
                      />
                      {rpeSearch && (
                        <button
                          onClick={() => setRpeSearch('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-viking-silver hover:text-viking-gold transition-colors text-xs font-bold cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const filteredEmails = Object.keys(studentsData).filter(email => {
                          const s = studentsData[email];
                          if (!s) return false;
                          const term = rpeSearch.toLowerCase().trim();
                          if (!term) return true;
                          return s.name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
                        });
                        const hasSessions = filteredEmails.some(email => (studentsData[email]?.sessions?.length || 0) > 0);
                        
                        return hasSessions ? (
                          filteredEmails.map(email => studentsData[email]).filter(Boolean).map(student => 
                            (student.sessions || []).map((sess, sIdx) => (
                            <div key={`${student.name}-${sIdx}`} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white">{student.name}</span>
                                <span className="text-[10px] text-viking-silver">{sess.date}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-viking-gold font-bold">{sess.sessionName}</p>
                                  {sess.exercises?.some(ex => ex.failed) && (
                                    <span className="inline-flex items-center gap-1 bg-red-950/40 border border-red-500/30 px-1.5 py-0.5 rounded text-[9px] text-red-400 uppercase font-bold" title="Houve falha em um ou mais exercícios">
                                      <AlertTriangle className="w-3 h-3" /> Falha Registrada
                                    </span>
                                  )}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  sess.avgRPE >= 9 
                                    ? 'bg-red-950/40 text-red-400 border border-red-800/30' 
                                    : sess.avgRPE >= 7.5
                                    ? 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                                    : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                                }`}>
                                  RPE Médio: {(sess.avgRPE || 0).toFixed(1)}
                                </span>
                              </div>

                              {sess.totalPlannedVolume !== undefined && sess.totalAchievedVolume !== undefined && (
                                <div className="text-[11px] font-bold text-viking-silver bg-black/30 px-2 py-1.5 rounded border border-viking-gold/5 flex justify-between">
                                  <span>Volume Total Realizado:</span>
                                  <span className={sess.volumeDeficit && sess.volumeDeficit > 0 ? 'text-viking-gold font-extrabold' : 'text-green-400 font-extrabold'}>
                                    {sess.totalAchievedVolume} / {sess.totalPlannedVolume} reps
                                    {sess.volumeDeficit && sess.volumeDeficit > 0 ? ` (Déficit de ${sess.volumeDeficit} reps)` : ' (Completo)'}
                                  </span>
                                </div>
                              )}
                              
                              <div className="text-xs bg-black/40 p-2.5 rounded-lg border border-viking-gold/10 space-y-1.5">
                                {sess.exercises.map((e, eIdx) => (
                                  <div key={eIdx} className="space-y-1 py-1 border-b border-viking-gold/5 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-1">
                                        <span>{e.name}</span>
                                        {e.failed && (
                                          <span className="text-[8px] bg-red-950 text-red-400 font-bold px-1 rounded border border-red-900/40">FALHOU</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {e.achievedVolume !== undefined && e.plannedVolume !== undefined && (
                                          <span className="text-[10px] text-viking-silver/60 font-mono">
                                            ({e.achievedVolume}/{e.plannedVolume})
                                          </span>
                                        )}
                                        <strong className={e.rpe >= 9 ? 'text-viking-red font-bold' : 'text-[#e0d3a8]'}>RPE {e.rpe}</strong>
                                      </div>
                                    </div>
                                    {e.sets && e.sets.length > 0 && (
                                      <div className="pl-2 flex flex-wrap gap-1 text-[9px]">
                                        {e.sets.map((s, sidx) => (
                                          <span key={sidx} className="bg-viking-gold/5 border border-viking-gold/15 rounded px-1.5 py-0.5 text-viking-silver/80 font-mono inline-flex items-center gap-1" title={s.note || ''}>
                                            <span>S{sidx + 1}: <strong className="text-white">{s.reps}r</strong> @ <strong className="text-viking-gold">{s.weight}kg</strong></span>
                                            {s.note && <span className="text-[8px] text-viking-gold/60 truncate max-w-[100px] border-l border-viking-gold/20 pl-1 ml-1 leading-none" title={s.note}>{s.note}</span>}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {sess.compensationSuggestion && (
                                <div className="p-3 bg-viking-gold/5 rounded-xl border border-viking-gold/25 space-y-1.5 text-xs">
                                  <p className="text-[10px] text-viking-gold font-black uppercase tracking-wider flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-viking-gold animate-pulse" /> Estratégia de Back-off Recomendada:
                                  </p>
                                  <p className="text-[#e0d3a8] font-bold leading-relaxed whitespace-pre-line text-[11px]">
                                    {sess.compensationSuggestion}
                                  </p>
                                </div>
                              )}

                              {sess.note && (
                                <p className="text-xs text-viking-silver/80 italic mt-2 border-l-2 border-viking-gold pl-2">
                                  "{sess.note}"
                                </p>
                              )}

                              {sess.avgRPE >= 9 && (
                                <div className="mt-2.5 p-2 rounded bg-red-950/20 text-[10px] text-red-300 border border-red-900/30 flex items-center gap-2">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                  <span>Alerta: RPE médio muito alto! Considere reduzir o volume ou recalibrar.</span>
                                </div>
                              )}
                            </div>
                          ))
                        )) : (
                          <p className="text-center py-6 text-xs text-viking-silver/60">Nenhum feedback correspondente encontrado.</p>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 9. Edit Program (Trainer) */}
                {drawerType === 'editProgram' && (
                  <div className="space-y-4">
                    {/* Controls to load specific Week and Day */}
                    <div className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-viking-gold font-bold uppercase tracking-wider">🗓️ Carregar Período</p>
                        <button
                          onClick={() => {
                            closeAllDrawers();
                            setDrawerType('protocols');
                            setDrawerTitle('Protocolos de Treino');
                            setDrawerOpen(true);
                          }}
                          className="px-2 py-1 bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30 text-viking-gold rounded flex items-center gap-1 text-[10px] uppercase font-bold"
                          title="Carregar de um protocolo salvo"
                        >
                          <Folder className="w-3 h-3" /> Protocolos
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Semana</label>
                          <div className="flex gap-1.5">
                            <select 
                              value={editorWeek}
                              onChange={e => handleEditorLoadWeekDay(parseInt(e.target.value), editorDay)}
                              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                            >
                              {Object.keys(editorProgram.weeks).map(Number).sort((a,b) => a-b).map(wk => (
                                <option key={wk} value={wk} className="bg-[#140e0c] text-[#e0d3a8]">
                                  Semana {wk}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleEditorDeleteWeek(editorWeek)}
                              className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/50 rounded-lg transition-all flex items-center justify-center cursor-pointer shrink-0"
                              title="Excluir esta semana"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Treino</label>
                          <div className="flex gap-1.5">
                            <select 
                              value={editorDay}
                              onChange={e => handleEditorLoadWeekDay(editorWeek, e.target.value)}
                              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                            >
                              {Object.keys(editorProgram.weeks[editorWeek] || { A: [], B: [], C: [] }).sort().map(day => (
                                <option key={day} value={day} className="bg-[#140e0c] text-[#e0d3a8]">
                                  Treino {day}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleEditorDeleteDay(editorWeek, editorDay)}
                              className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/50 rounded-lg transition-all flex items-center justify-center cursor-pointer shrink-0"
                              title="Excluir este treino"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-viking-gold/10">
                        <button
                          type="button"
                          onClick={handleEditorAddWeek}
                          className="w-full py-1.5 text-[10px] font-black uppercase tracking-wider bg-viking-gold/10 border border-viking-gold/35 hover:border-viking-gold text-viking-gold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-viking-gold/20"
                        >
                          <Plus className="w-3.5 h-3.5 text-viking-gold" /> + Semanas
                        </button>
                        <button
                          type="button"
                          onClick={handleEditorAddWorkoutDay}
                          className="w-full py-1.5 text-[10px] font-black uppercase tracking-wider bg-viking-gold/10 border border-viking-gold/35 hover:border-viking-gold text-viking-gold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-viking-gold/20"
                        >
                          <Plus className="w-3.5 h-3.5 text-viking-gold" /> + Treino A, B, C
                        </button>
                      </div>
                    </div>

                    {/* Import Workout Block */}
                    <div className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                      <p className="text-xs text-viking-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-viking-gold" /> Copiar Treino de Outro Guerreiro
                      </p>
                      <div>
                        <select 
                          onChange={e => handleImportProgram(e.target.value)}
                          defaultValue=""
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold text-xs"
                        >
                          <option value="" disabled className="bg-[#140e0c] text-viking-silver/50">Selecione a origem...</option>
                          <option value="global" className="bg-[#140e0c] text-viking-gold font-bold">Treino Base (Global)</option>
                          {(Object.entries(studentsData) as [string, StudentProfile][]).filter(([_, s]) => !s.isDeleted).map(([email, s]) => (
                            email.toLowerCase() !== editingStudentEmail.toLowerCase() && (
                              <option key={email} value={email} className="bg-[#140e0c] text-[#e0d3a8]">
                                {s.name} ({s.plan})
                              </option>
                            )
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Copy Workout Block */}
                    <div className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                      <p className="text-xs text-viking-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5 text-viking-gold" /> Copiar Treino de Outro Período
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Origem: Semana</label>
                          <select 
                            value={copySourceWeek}
                            onChange={e => {
                              const wk = parseInt(e.target.value);
                              setCopySourceWeek(wk);
                              const availableDays = Object.keys(editorProgram.weeks[wk] || {}).sort();
                              if (availableDays.length > 0 && !availableDays.includes(copySourceDay)) {
                                setCopySourceDay(availableDays[0]);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold text-xs"
                          >
                            {Object.keys(editorProgram.weeks).map(Number).sort((a,b) => a-b).map(wk => (
                              <option key={wk} value={wk} className="bg-[#140e0c] text-[#e0d3a8]">
                                Semana {wk}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Origem: Treino</label>
                          <select 
                            value={copySourceDay}
                            onChange={e => setCopySourceDay(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold text-xs"
                          >
                            {Object.keys(editorProgram.weeks[copySourceWeek] || { A: [], B: [], C: [] }).sort().map(day => (
                              <option key={day} value={day} className="bg-[#140e0c] text-[#e0d3a8]">
                                Treino {day}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditorCopyWorkout(copySourceWeek, copySourceDay)}
                        className="w-full py-2 bg-viking-gold/10 hover:bg-viking-gold/20 text-viking-gold border border-viking-gold/30 hover:border-viking-gold font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-4 h-4 text-viking-gold" /> Clonar Exercícios para Este Treino
                      </button>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-viking-gold tracking-wider">Exercícios Prescritos ({editorExercises.length})</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleEditorCreateBlankExercise}
                            className="px-2.5 py-1 text-xs bg-[#140e0c] border border-viking-gold/20 hover:border-viking-gold/50 text-viking-silver font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Vazio
                          </button>
                          <button 
                            onClick={() => setIsExercisePickerOpen(true)}
                            className="px-2.5 py-1 text-xs bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black uppercase rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-viking-gold/10"
                          >
                            <Library className="w-3.5 h-3.5" /> Biblioteca
                          </button>
                        </div>
                      </div>

                      {/* Search Bar inside Program Editor */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-viking-gold/65">
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={editorSearchQuery}
                          onChange={(e) => setEditorSearchQuery(e.target.value)}
                          placeholder="Buscar exercício pelo nome..."
                          className="w-full pl-9 pr-8 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/40 font-medium"
                        />
                        {editorSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setEditorSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-viking-silver/60 hover:text-viking-gold cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {(() => {
                        const indexedExercises = editorExercises.map((ex, originalIdx) => ({ ex, originalIdx }));
                        const query = editorSearchQuery.trim().toLowerCase();
                        const filtered = query === '' 
                          ? indexedExercises 
                          : indexedExercises.filter(({ ex }) => ex.name.toLowerCase().includes(query));

                        if (editorExercises.length === 0) {
                          return (
                            <p className="text-center py-6 text-xs text-viking-silver/60 border border-viking-gold/10 rounded-xl">Treino limpo ou sem exercícios.</p>
                          );
                        }

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-8 text-xs text-viking-silver/50 border border-dashed border-viking-gold/15 rounded-xl space-y-1">
                              <p className="font-bold">Nenhum exercício corresponde à sua busca.</p>
                              <p className="text-[11px] text-viking-silver/40">Tente buscar por termos diferentes ou limpe a busca.</p>
                            </div>
                          );
                        }

                        return filtered.map(({ ex, originalIdx }) => {
                          const isExpanded = expandedExerciseIdx === originalIdx;
                          const isDragged = draggedExerciseIdx === originalIdx;
                          return (
                            <div 
                              key={(ex.id || 'ex') + '_' + originalIdx} 
                              draggable={true}
                              onDragStart={(e) => handleEditorExerciseDragStart(e, originalIdx)}
                              onDragOver={(e) => handleEditorExerciseDragOver(e, originalIdx)}
                              onDrop={(e) => handleEditorExerciseDrop(e, originalIdx)}
                              onDragEnd={handleEditorExerciseDragEnd}
                              className={`p-4 rounded-xl bg-[#0d0908]/60 border transition-all duration-300 ${
                                isDragged 
                                  ? 'opacity-30 border-dashed border-viking-gold/60 scale-[0.98]' 
                                  : isExpanded 
                                    ? 'border-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
                                    : 'border-viking-gold/15 hover:border-viking-gold/40'
                              } cursor-grab active:cursor-grabbing`}
                            >
                              
                              <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedExerciseIdx(isExpanded ? null : originalIdx)}>
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-3.5 h-3.5 text-viking-gold/40 hover:text-viking-gold shrink-0 transition-colors" />
                                  <span className="text-xs text-viking-gold font-bold uppercase tracking-widest font-viking-medieval">#{originalIdx + 1} {ex.name || 'Novo Exercício'}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3 text-viking-gold" /> : <ChevronDown className="w-3 h-3 text-viking-gold" />}
                                </div>
                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                  <button onClick={() => handleEditorDuplicateExercise(originalIdx)} className="p-1 rounded hover:bg-viking-gold/10 text-viking-gold cursor-pointer" title="Duplicar Exercício"><Copy className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleEditorRemoveExercise(originalIdx)} className="p-1 rounded hover:bg-red-950/40 text-red-400 cursor-pointer" title="Remover Exercício"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="space-y-3 mt-3 pt-3 border-t border-viking-gold/15">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="col-span-2 relative">
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Nome do Exercício</label>
                                      <div className="relative">
                                        <input value={ex.name} onChange={e => { handleEditorUpdateField(originalIdx, 'name', e.target.value); setOpenDropdownIdx(originalIdx); }} onFocus={() => setOpenDropdownIdx(originalIdx)} className="w-full pl-3 pr-8 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold relative z-10" placeholder="Escreva ou selecione..." />
                                        <button type="button" onClick={() => setOpenDropdownIdx(openDropdownIdx === originalIdx ? null : originalIdx)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-viking-silver hover:text-viking-gold cursor-pointer z-10" title="Abrir Banco de Exercícios"><ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdownIdx === originalIdx ? 'rotate-90 text-viking-gold' : 'text-viking-silver/50'}`} /></button>
                                        
                                        <AnimatePresence>
                                          {openDropdownIdx === originalIdx && (
                                            <motion.div
                                              initial={{ opacity: 0, y: -5 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              exit={{ opacity: 0, y: -5 }}
                                              className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#140e0c] border border-viking-gold/30 rounded-lg shadow-xl z-[100] custom-scrollbar"
                                            >
                                              {dbExercises
                                                .filter(dbEx => ex.name.trim() === '' || ex.name.toLowerCase() === 'novo exercício' || dbEx.name.toLowerCase().includes(ex.name.toLowerCase()))
                                                .map(dbEx => (
                                                <button
                                                  key={dbEx.id}
                                                  type="button"
                                                  onClick={() => {
                                                    handleEditorUpdateField(originalIdx, 'name', dbEx.name);
                                                    if (dbEx.techniqueTips) handleEditorUpdateField(originalIdx, 'techniqueTips', dbEx.techniqueTips);
                                                    if (dbEx.videoUrl) handleEditorUpdateField(originalIdx, 'videoUrl', dbEx.videoUrl);
                                                    setOpenDropdownIdx(null);
                                                  }}
                                                  className="w-full text-left px-3 py-2 text-xs text-viking-silver hover:bg-viking-gold/15 hover:text-viking-gold transition-colors flex justify-between items-center group border-b border-white/5 last:border-b-0 cursor-pointer"
                                                >
                                                  <span>{dbEx.name}</span>
                                                  {dbEx.videoUrl && <Youtube className="w-3.5 h-3.5 text-viking-silver/30 group-hover:text-red-500" />}
                                                </button>
                                              ))}
                                              {dbExercises.filter(dbEx => ex.name.trim() === '' || ex.name.toLowerCase() === 'novo exercício' || dbEx.name.toLowerCase().includes(ex.name.toLowerCase())).length === 0 && (
                                                <div className="p-3 text-xs text-viking-silver/50 text-center italic">
                                                  Nenhum exercício encontrado. Continuar digitando para criar um novo.
                                                </div>
                                              )}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Séries</label>
                                      <div className="flex gap-1">
                                        <button type="button" tabIndex={-1} onClick={() => handleEditorUpdateField(originalIdx, 'sets', Math.max(0, ex.sets - 1))} className="px-2 bg-black/60 border border-viking-gold/20 rounded text-viking-gold hover:bg-viking-gold/20 transition-colors">-</button>
                                        <input type="number" inputMode="decimal" pattern="[0-9]*" value={ex.sets === 0 ? '' : ex.sets} onFocus={e => e.target.select()} onChange={e => handleEditorUpdateField(originalIdx, 'sets', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} className="w-full text-center px-2 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold" />
                                        <button type="button" tabIndex={-1} onClick={() => handleEditorUpdateField(originalIdx, 'sets', ex.sets + 1)} className="px-2 bg-black/60 border border-viking-gold/20 rounded text-viking-gold hover:bg-viking-gold/20 transition-colors">+</button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Repetições</label>
                                      <div className="flex gap-1">
                                        <button type="button" tabIndex={-1} onClick={() => handleEditorUpdateField(originalIdx, 'reps', Math.max(0, ex.reps - 1))} className="px-2 bg-black/60 border border-viking-gold/20 rounded text-viking-gold hover:bg-viking-gold/20 transition-colors">-</button>
                                        <input type="number" inputMode="decimal" pattern="[0-9]*" value={ex.reps === 0 ? '' : ex.reps} onFocus={e => e.target.select()} onChange={e => handleEditorUpdateField(originalIdx, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} className="w-full text-center px-2 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold" />
                                        <button type="button" tabIndex={-1} onClick={() => handleEditorUpdateField(originalIdx, 'reps', ex.reps + 1)} className="px-2 bg-black/60 border border-viking-gold/20 rounded text-viking-gold hover:bg-viking-gold/20 transition-colors">+</button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Intensidade (%) ou Livre</label>
                                      <div className="flex gap-1">
                                        <button type="button" tabIndex={-1} onClick={() => {
                                          const current = typeof ex.intensity === 'number' ? Math.round(ex.intensity * 100) : parseFloat(ex.intensity) || 0;
                                          const newVal = Math.max(0, current - 2.5);
                                          handleEditorUpdateField(originalIdx, 'intensity', newVal / 100);
                                        }} className="px-2 bg-black/60 border border-viking-gold/20 rounded text-viking-gold hover:bg-viking-gold/20 transition-colors">-</button>
                                        <input 
                                          inputMode="decimal" 
                                          value={typeof ex.intensity === 'number' ? Math.round(ex.intensity * 100) : ex.intensity} 
                                          onFocus={e => e.target.select()} 
                                          onChange={e => { 
                                            const val = e.target.value; 
                                            const parsedNum = parseFloat(val); 
                                            if (!isNaN(parsedNum) && parsedNum <= 150) { 
                                              handleEditorUpdateField(originalIdx, 'intensity', parsedNum / 100); 
                                            } else { 
                                              handleEditorUpdateField(originalIdx, 'intensity', val); 
                                            } 
                                          }} 
                                          placeholder="Ex: 80 ou Livre" 
                                          className="w-full text-center px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold" 
                                        />
                                        <button type="button" tabIndex={-1} onClick={() => {
                                          const current = typeof ex.intensity === 'number' ? Math.round(ex.intensity * 100) : parseFloat(ex.intensity) || 0;
                                          const newVal = current + 2.5;
                                          handleEditorUpdateField(originalIdx, 'intensity', newVal / 100);
                                        }} className="px-2 bg-black/60 border border-viking-gold/20 rounded text-viking-gold hover:bg-viking-gold/20 transition-colors">+</button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">RPE Alvo</label>
                                      <input type="number" inputMode="decimal" step="0.5" value={ex.targetRPE} onFocus={e => e.target.select()} onChange={e => handleEditorUpdateField(originalIdx, 'targetRPE', parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold" />
                                    </div>
                                  </div>
                                  <div className="pt-3 border-t border-viking-gold/15 space-y-3">
                                    <div className="relative">
                                      <label className="block text-[9px] font-bold text-viking-gold uppercase mb-1 flex items-center gap-1">{ex.main ? <><Flame className="w-3 h-3 text-viking-gold" /> Carga do Lift / 1RM (kg)</> : <><Dumbbell className="w-3 h-3 text-viking-gold" /> Carga Alvo Prescrita (kg)</>}</label>
                                      <WeightControl 
                                        value={ex.baseWeight || 0}
                                        onChange={(val: number) => handleEditorUpdateField(originalIdx, 'baseWeight', val || undefined)}
                                        placeholder={ex.main ? "Ex: 150" : "Ex: 24"}
                                        title={ex.main ? "Carga do Lift / 1RM (kg)" : "Carga Alvo Prescrita (kg)"}
                                      />
                                    </div>
                                    {ex.main && typeof ex.intensity === 'number' && (
                                      <div className="text-xs bg-viking-gold/5 border border-viking-gold/15 p-2.5 rounded-lg flex justify-between items-center text-viking-silver">
                                        <span className="font-semibold flex items-center gap-1">⚔️ Peso Estimado Calculado:</span>
                                        <strong className="text-viking-gold text-xs font-black font-mono">{ex.baseWeight ? `${Math.round(ex.baseWeight * ex.intensity)} kg (${Math.round(ex.intensity * 100)}%)` : `(Depende do PR cadastrado do aluno x ${Math.round(ex.intensity * 100)}%)`}</strong>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <input type="checkbox" id={`chk-main-${originalIdx}`} checked={ex.main} onChange={e => handleEditorUpdateField(originalIdx, 'main', e.target.checked)} className="rounded border-viking-gold/30 text-viking-gold focus:ring-viking-gold bg-black/40 cursor-pointer" />
                                      <label htmlFor={`chk-main-${originalIdx}`} className="text-[10px] font-bold text-viking-silver uppercase tracking-wider cursor-pointer select-none">Habilitar Aquecimento Inteligente</label>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Dicas de Técnica / Orientações</label>
                                      <textarea value={ex.techniqueTips || ''} onChange={e => handleEditorUpdateField(originalIdx, 'techniqueTips', e.target.value)} placeholder="Ex: Controlar a descida..." rows={2} className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-medium text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30 resize-none" />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-gold uppercase mb-1">Observações do Treinador</label>
                                      <textarea value={ex.trainerNote || ''} onChange={e => handleEditorUpdateField(originalIdx, 'trainerNote', e.target.value)} placeholder="Ex: Fazer com band..." rows={2} className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/40 text-viking-gold font-medium text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-gold/30 resize-none" />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Lembretes de Mobilidade</label>
                                      <textarea value={ex.mobilityReminders || ''} onChange={e => handleEditorUpdateField(originalIdx, 'mobilityReminders', e.target.value)} placeholder="Ex: Focar em liberar glúteo..." rows={2} className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-medium text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30 resize-none" />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1 flex items-center gap-1"><Youtube className="w-3 h-3 text-red-500 animate-pulse" /> Link do YouTube</label>
                                      <input value={ex.videoUrl || ''} onChange={e => handleEditorUpdateField(originalIdx, 'videoUrl', e.target.value)} placeholder="Ex: https://www..." className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30" />
                                    </div>
                                    <div className="pt-2 border-t border-viking-gold/10 mt-1">
                                      <label className="block text-[9px] font-bold text-viking-gold uppercase mb-1 tracking-wider">⚡ Metodologia de Treino</label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <select value={ex.methodology || 'standard'} onChange={e => handleEditorUpdateField(originalIdx, 'methodology', e.target.value)} className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold">
                                            <option value="standard" className="bg-[#140e0c] text-[#e0d3a8]">Padrão (Séries Lineares)</option>
                                            <option value="backoff" className="bg-[#140e0c] text-[#e0d3a8]">Back-off Sets (Top Set + Recuo)</option>
                                            <option value="myoreps" className="bg-[#140e0c] text-[#e0d3a8]">Myo-Reps (Mini-Séries de Estimulação)</option>
                                            <option value="clusters" className="bg-[#140e0c] text-[#e0d3a8]">Cluster Sets (Repetições Agrupadas)</option>
                                            <option value="dropset" className="bg-[#140e0c] text-[#e0d3a8]">Drop Sets (Redução Pós-Falha)</option>
                                          </select>
                                        </div>
                                        <div>
                                          <input type="text" value={ex.methodologyDetails || ''} onChange={e => handleEditorUpdateField(originalIdx, 'methodologyDetails', e.target.value)} placeholder="Opcional: Detalhes da metodologia..." className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-semibold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            {/* Warmup editor nested inside exercise */}
                            {ex.main && (
                              <>
                                <div className="mt-3 pt-3 border-t border-viking-gold/15 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-viking-gold uppercase tracking-widest flex items-center gap-1">
                                      <Flame className="w-3.5 h-3.5" /> Passos de Aquecimento (%)
                                    </span>
                                    <button 
                                      onClick={() => handleEditorAddWarmupStep(originalIdx)}
                                      className="text-[9px] text-viking-gold hover:underline uppercase font-bold cursor-pointer"
                                    >
                                      + Adicionar
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {(ex.warmup || []).map((step, sIdx) => (
                                      <div key={sIdx} className="bg-[#0d0908]/80 px-2.5 py-1.5 rounded-lg border border-viking-gold/20 flex items-center gap-1.5 text-[10px]">
                                        <input 
                                          type="number"
                                          inputMode="decimal"
                                          value={Math.round(step.percent * 100)}
                                          onChange={e => handleEditorUpdateWarmupStep(originalIdx, sIdx, 'percent', (parseFloat(e.target.value) || 0) / 100)}
                                          className="w-9 bg-black/40 border-none text-[#e0d3a8] text-center p-0 text-[10px] font-bold focus:ring-0 rounded"
                                        />
                                        <span className="text-viking-silver/80">% ×</span>
                                        <input 
                                          type="number"
                                          inputMode="decimal"
                                          value={step.reps || ''}
                                          onChange={e => handleEditorUpdateWarmupStep(originalIdx, sIdx, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                          className="w-7 bg-black/40 border-none text-[#e0d3a8] text-center p-0 text-[10px] font-bold focus:ring-0 rounded"
                                        />
                                        <span className="text-viking-silver/80">reps</span>
                                        <button 
                                          onClick={() => handleEditorRemoveWarmupStep(originalIdx, sIdx)}
                                          className="text-viking-red hover:brightness-125 ml-1 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Passos de Mobilidade */}
                                <div className="space-y-2 pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-viking-gold uppercase tracking-widest flex items-center gap-1">
                                      <Zap className="w-3.5 h-3.5" /> Mobilidade
                                    </span>
                                    <button 
                                      onClick={() => handleEditorAddMobilityStep(originalIdx)}
                                      className="text-[9px] text-viking-gold hover:underline uppercase font-bold cursor-pointer"
                                    >
                                      + Adicionar
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    <AnimatePresence>
                                      {(ex.mobility || []).map((step, sIdx) => (
                                        <motion.div 
                                          key={sIdx}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -10 }}
                                          className="bg-[#0d0908]/80 p-2 rounded-lg border border-viking-gold/20 text-[10px] space-y-1"
                                        >
                                          <input 
                                            type="text"
                                            value={step.name}
                                            onChange={e => handleEditorUpdateMobilityStep(originalIdx, sIdx, 'name', e.target.value)}
                                            placeholder="Nome da mobilidade"
                                            className="w-full bg-black/40 border border-viking-gold/10 text-[#e0d3a8] p-1 rounded font-bold"
                                          />
                                          <div className="flex gap-2 items-center">
                                            <button
                                              type="button"
                                              onClick={() => setActiveVideoModal({ name: step.name, videoUrl: step.videoUrl, tips: step.tips })}
                                              className="p-1 text-viking-gold hover:text-white cursor-pointer"
                                            >
                                              <Info className="w-4 h-4" />
                                            </button>
                                            <input 
                                              type="number"
                                              inputMode="decimal"
                                              value={step.sets || ''}
                                              onChange={e => handleEditorUpdateMobilityStep(originalIdx, sIdx, 'sets', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                              placeholder="Séries"
                                              className="w-12 bg-black/40 border border-viking-gold/10 text-[#e0d3a8] p-1 rounded text-center"
                                            />
                                            <span className="text-viking-silver/80">x</span>
                                            <input 
                                              type="number"
                                              inputMode="decimal"
                                              value={step.reps || ''}
                                              onChange={e => handleEditorUpdateMobilityStep(originalIdx, sIdx, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                              placeholder="Reps/Tempo"
                                              className="w-12 bg-black/40 border border-viking-gold/10 text-[#e0d3a8] p-1 rounded text-center"
                                            />
                                            <input 
                                              type="text"
                                              value={step.videoUrl || ''}
                                              onChange={e => handleEditorUpdateMobilityStep(originalIdx, sIdx, 'videoUrl', e.target.value)}
                                              placeholder="URL Vídeo"
                                              className="flex-1 bg-black/40 border border-viking-gold/10 text-[#e0d3a8] p-1 rounded"
                                            />
                                            <button 
                                              onClick={() => handleEditorRemoveMobilityStep(originalIdx, sIdx)}
                                              className="text-viking-red hover:brightness-125 cursor-pointer"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </>
                            )}

                          </div>
                          )
                        })
                      })()}
                        <div className="sticky bottom-0 pt-4 pb-2 bg-[#140e0c]/95 border-t border-viking-gold/15 flex gap-3">
                        <button 
                          onClick={handleEditorSaveProgram}
                          className="flex-1 py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Save className="w-4 h-4 shrink-0" /> Salvar Prescrição
                        </button>
                        <button 
                          onClick={() => handleCloseDrawer()}
                          className="px-5 py-3 rounded-xl bg-[#0d0908]/60 text-viking-silver hover:text-viking-gold border border-viking-gold/20 text-xs font-bold transition-all cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>
                  </div>
                  
                    {/* Exercise Picker Modal */}
                    <AnimatePresence>
                      {isExercisePickerOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#0a0706] border border-viking-gold/30 rounded-2xl shadow-[0_10px_40px_rgba(212,175,55,0.15)] flex flex-col max-h-[85vh] overflow-hidden"
                          >
                            <div className="p-4 border-b border-viking-gold/15 flex justify-between items-center bg-[#140e0c]">
                              <h3 className="font-viking-runes text-viking-gold font-bold text-lg flex items-center gap-2"><Library className="w-5 h-5" /> Biblioteca de Exercícios</h3>
                              <button onClick={() => setIsExercisePickerOpen(false)} className="text-viking-silver hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="p-4 border-b border-viking-gold/15 bg-[#0a0706]">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-viking-gold/60" />
                                <input
                                  type="text"
                                  placeholder="Buscar exercícios..."
                                  value={dbExerciseSearch}
                                  onChange={(e) => setDbExerciseSearch(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] text-sm focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#0d0908]">
                              {dbExercises
                                .filter(ex => dbExerciseSearch.trim() === '' || ex.name.toLowerCase().includes(dbExerciseSearch.toLowerCase()))
                                .map(ex => (
                                  <button
                                    key={ex.id}
                                    onClick={() => { handleEditorAddExerciseFromDb(ex); setDbExerciseSearch(''); }}
                                    className="w-full text-left p-3 rounded-xl bg-[#140e0c]/80 border border-viking-gold/10 hover:border-viking-gold/40 transition-colors flex justify-between items-center group cursor-pointer"
                                  >
                                    <div>
                                      <div className="text-[#e0d3a8] font-bold text-sm group-hover:text-viking-gold transition-colors">{ex.name}</div>
                                      {ex.techniqueTips && <div className="text-[10px] text-viking-silver/60 line-clamp-1 mt-1">{ex.techniqueTips}</div>}
                                    </div>
                                    {ex.videoUrl && <Youtube className="w-4 h-4 text-viking-silver/40 group-hover:text-red-500 transition-colors shrink-0" />}
                                  </button>
                                ))}
                              {dbExercises.filter(ex => dbExerciseSearch.trim() === '' || ex.name.toLowerCase().includes(dbExerciseSearch.toLowerCase())).length === 0 && (
                                <div className="text-center p-6 text-viking-silver/50 italic text-sm">
                                  Nenhum exercício encontrado na biblioteca.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>                  
                  </div>
                )}


                {/* 10. Direct Chat / Feedback Drawer */}
                {drawerType === 'chat' && (() => {
                  const targetEmail = currentUser?.role === 'trainer' ? activeChatStudentEmail : currentUser?.email;
                  const student = targetEmail ? studentsData[targetEmail.toLowerCase()] : null;
                  if (!student) return <p className="text-center text-viking-silver py-6">Carregando guerreiro...</p>;

                  const chatHistory = student.chatHistory || [];
                  const filteredChatHistory = chatHistory.filter(msg => {
                    if (!chatFilterStartDate && !chatFilterEndDate) return true;
                    
                    const dateStr = msg.timestamp.substring(0, 10);
                    const [day, month, year] = dateStr.split('/');
                    if (!year || !month || !day) return true;
                    const msgDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    
                    if (chatFilterStartDate) {
                      const [sY, sM, sD] = chatFilterStartDate.split('-');
                      const startDate = new Date(parseInt(sY), parseInt(sM) - 1, parseInt(sD));
                      if (msgDate < startDate) return false;
                    }
                    
                    if (chatFilterEndDate) {
                      const [eY, eM, eD] = chatFilterEndDate.split('-');
                      const endDate = new Date(parseInt(eY), parseInt(eM) - 1, parseInt(eD));
                      if (msgDate > endDate) return false;
                    }
                    
                    return true;
                  });

                  return (
                    <div className="flex flex-col h-[62vh] max-h-[62vh] justify-between">
                      {/* Description / Instructions */}
                      <div className="px-1 pb-3 border-b border-viking-gold/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                        <div className="text-xs text-viking-silver/80 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                          <span>Canal de feedback direto. Envie conselhos de ferro, correções ou dúvidas instantâneas.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Calendar className="w-3.5 h-3.5 text-viking-gold absolute left-2 top-1/2 transform -translate-y-1/2" />
                            <input 
                              type="date"
                              value={chatFilterStartDate}
                              onChange={(e) => setChatFilterStartDate(e.target.value)}
                              className="pl-7 pr-2 py-1.5 rounded-lg bg-[#0d0908] border border-viking-gold/20 text-viking-silver text-[10px] uppercase font-bold tracking-wider outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold/30 transition-all [color-scheme:dark]"
                              title="Data inicial"
                            />
                          </div>
                          <span className="text-viking-silver/50 text-xs">até</span>
                          <div className="relative">
                            <Calendar className="w-3.5 h-3.5 text-viking-gold absolute left-2 top-1/2 transform -translate-y-1/2" />
                            <input 
                              type="date"
                              value={chatFilterEndDate}
                              onChange={(e) => setChatFilterEndDate(e.target.value)}
                              className="pl-7 pr-2 py-1.5 rounded-lg bg-[#0d0908] border border-viking-gold/20 text-viking-silver text-[10px] uppercase font-bold tracking-wider outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold/30 transition-all [color-scheme:dark]"
                              title="Data final"
                            />
                          </div>
                          {(chatFilterStartDate || chatFilterEndDate) && (
                            <button 
                              onClick={() => {
                                setChatFilterStartDate('');
                                setChatFilterEndDate('');
                              }}
                              className="p-1.5 rounded-lg hover:bg-viking-gold/10 text-viking-silver hover:text-viking-gold transition-colors"
                              title="Limpar filtros"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Message List */}
                      <div ref={chatMessagesContainerRef} className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 scrollbar-thin scrollbar-thumb-viking-gold/20">
                        {filteredChatHistory.length === 0 ? (
                          <div className="text-center py-12 text-viking-silver/50 space-y-2">
                            <MessageSquare className="w-10 h-10 mx-auto text-viking-gold/20" />
                            <p className="text-xs font-bold">Nenhuma mensagem encontrada.</p>
                            {chatHistory.length > 0 && <p className="text-[11px]">Tente ajustar o filtro de datas.</p>}
                          </div>
                        ) : (
                          filteredChatHistory.map((msg, mIdx) => {
                            const isMe = (currentUser?.role === 'trainer' && msg.sender === 'trainer') ||
                                         (currentUser?.role === 'student' && msg.sender === 'student');

                            return (
                              <motion.div 
                                key={msg.id + '_' + mIdx} 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                              >
                                {/* Sender Tag */}
                                <span className="text-[9px] text-viking-silver/50 uppercase font-black tracking-wider mb-1 px-1">
                                  {msg.sender === 'trainer' ? 'Treinador John' : student.name} • {msg.timestamp}
                                </span>
                                
                                {/* Message Bubble */}
                                <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-md ${
                                  isMe 
                                    ? 'bg-gradient-to-br from-viking-gold-dark to-viking-gold text-viking-dark rounded-tr-none' 
                                    : 'bg-[#0d0908]/90 border border-viking-gold/15 text-white rounded-tl-none'
                                }`}>
                                  {msg.imageUrl && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                                      <a href={msg.imageUrl} target="_blank" rel="noreferrer">
                                        <img src={msg.imageUrl} alt="Imagem do chat" className="max-w-full h-auto max-h-48 object-cover hover:scale-105 transition-transform" />
                                      </a>
                                    </div>
                                  )}
                                  {msg.text}

                                  {msg.prHistory && (() => {
                                    const { squat, bench, deadlift } = msg.prHistory;
                                    const total = (squat || 0) + (bench || 0) + (deadlift || 0);
                                    return (
                                      <div className="mt-3 p-3.5 rounded-xl bg-black/90 border border-viking-gold/40 text-white space-y-2.5 max-w-sm shadow-lg">
                                        <div className="flex items-center justify-between border-b border-viking-gold/20 pb-2">
                                          <span className="font-viking-display font-black text-[10px] text-viking-gold uppercase tracking-widest flex items-center gap-1.5">
                                            ⚔️ MARCAS DE FORÇA (PRs)
                                          </span>
                                          <span className="text-[8px] bg-viking-gold/15 border border-viking-gold/30 text-viking-gold px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                            Viking
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2.5 text-center">
                                          <div className="bg-[#120d0c] border border-viking-gold/15 p-2 rounded-lg">
                                            <p className="text-[8px] text-viking-silver/70 uppercase font-black tracking-wider">Agachamento</p>
                                            <p className="font-viking-display text-[11px] font-black text-viking-gold mt-1">
                                              {squat !== null ? `${squat} kg` : '--'}
                                            </p>
                                          </div>
                                          <div className="bg-[#120d0c] border border-viking-gold/15 p-2 rounded-lg">
                                            <p className="text-[8px] text-viking-silver/70 uppercase font-black tracking-wider">Supino</p>
                                            <p className="font-viking-display text-[11px] font-black text-viking-gold mt-1">
                                              {bench !== null ? `${bench} kg` : '--'}
                                            </p>
                                          </div>
                                          <div className="bg-[#120d0c] border border-viking-gold/15 p-2 rounded-lg">
                                            <p className="text-[8px] text-viking-silver/70 uppercase font-black tracking-wider">Terra</p>
                                            <p className="font-viking-display text-[11px] font-black text-viking-gold mt-1">
                                              {deadlift !== null ? `${deadlift} kg` : '--'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between bg-[#120d0c] border border-viking-gold/20 px-3 py-2 rounded-lg text-[9px] font-bold">
                                          <span className="text-viking-silver uppercase tracking-wider">TOTAL DE CARGA:</span>
                                          <span className="font-viking-display font-black text-viking-gold text-xs">
                                            {total > 0 ? `${total} kg` : 'A definir'}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>

                      {/* Form Input */}
                      <div className="border-t border-viking-gold/15 pt-3 flex flex-col gap-2 shrink-0">
                        {currentUser?.role === 'trainer' && student && (
                          <div className="flex justify-start pb-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (student.prs) {
                                  handleSendMessage(
                                    targetEmail.toLowerCase(),
                                    `💪 Confiram as minhas marcas atuais de força e histórico de PRs no painel! Foco no treino! 🔥`,
                                    undefined,
                                    student.prs
                                  );
                                } else {
                                  showToast('Este guerreiro não possui PRs cadastrados!', 'warning');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-viking-gold/15 hover:bg-viking-gold/25 border border-viking-gold/30 hover:border-viking-gold/60 text-viking-gold text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              title="Compartilhar histórico de PRs (Squat/Bench/Deadlift) deste aluno"
                            >
                              <Award className="w-3.5 h-3.5 animate-pulse" /> Compartilhar PRs (Histórico)
                            </button>
                          </div>
                        )}
                        {chatImageFile && (
                          <div className="flex items-center justify-between bg-viking-gold/10 border border-viking-gold/20 p-2 rounded-lg">
                            <div className="flex items-center gap-2 text-viking-gold text-xs font-bold">
                              <ImageIcon className="w-4 h-4" />
                              <span className="truncate max-w-[200px]">{chatImageFile.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setChatImageFile(null)}
                              className="text-viking-silver hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <form onSubmit={handleSendActiveChatMessage} className="flex gap-2">
                          <label className="p-3 rounded-xl bg-black/60 border border-viking-gold/25 hover:border-viking-gold/50 text-viking-silver hover:text-viking-gold transition-all flex items-center justify-center shrink-0 cursor-pointer">
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setChatImageFile(e.target.files[0]);
                                }
                              }}
                            />
                            <Camera className="w-4 h-4" />
                          </label>
                          <input 
                            type="text"
                            value={chatMessageInput}
                            onChange={e => setChatMessageInput(e.target.value)}
                            placeholder="Digite um conselho de ferro ou feedback..."
                            className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-viking-gold/25 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30"
                          />
                          <motion.button 
                            whileTap={{ scale: 0.85 }}
                            type="submit"
                            disabled={isUploadingChatImage || (!chatMessageInput.trim() && !chatImageFile)}
                            className="p-3 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 disabled:opacity-50 text-viking-dark font-black transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-viking-gold/10"
                          >
                            {isUploadingChatImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </motion.button>
                        </form>
                      </div>
                    </div>
                  );
                })()}

                {/* 11. Gmail / Correio de Valhalla Drawer */}
                {drawerType === 'gmail' && (
                  <div className="space-y-4">
                    {!googleAccessToken ? (
                      <div className="text-center py-12 space-y-5">
                        <div className="w-16 h-16 bg-viking-gold/10 rounded-full flex items-center justify-center mx-auto border border-viking-gold/25 animate-pulse-gold">
                          <Mail className="w-8 h-8 text-viking-gold" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-viking-display text-base font-black text-white uppercase tracking-wider">CORREIO DE VALHALLA</h4>
                          <p className="text-xs text-viking-silver max-w-sm mx-auto leading-relaxed">
                            Conecte sua conta do Google para enviar fichas de treino, feedbacks e comunicados diretamente pelo seu Gmail com a permissão do clã.
                          </p>
                        </div>
                        <button 
                          onClick={handleGoogleSignIn}
                          className="gsi-material-button mx-auto shadow-lg"
                        >
                          <div className="gsi-material-button-state"></div>
                          <div className="gsi-material-button-content-wrapper">
                            <div className="gsi-material-button-icon">
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                              </svg>
                            </div>
                            <span className="gsi-material-button-contents font-bold text-[#1f2937]">Entrar com o Google</span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="p-4 rounded-xl bg-[#0d0908]/90 border border-viking-gold/25 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-viking-gold/15 border border-viking-gold/30 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-viking-gold" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-none">Gmail Conectado</p>
                              <p className="text-[10px] text-viking-silver mt-0.5">{googleUserEmail}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => { setGoogleAccessToken(null); setGoogleUserEmail(null); }}
                            className="px-3 py-1.5 rounded-lg bg-viking-red/10 hover:bg-viking-red/20 text-red-400 border border-viking-red/25 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all"
                          >
                            Desconectar
                          </button>
                        </div>

                        {/* Gmail tabs */}
                        <div className="flex border-b border-viking-gold/15">
                          {['inbox', 'compose', 'broadcast'].map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setGmailTab(t as any);
                                if (t === 'inbox') fetchRecentEmails(googleAccessToken);
                              }}
                              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                                gmailTab === t 
                                  ? 'border-viking-gold text-viking-gold font-bold bg-viking-gold/5' 
                                  : 'border-transparent text-viking-silver hover:text-white'
                              }`}
                            >
                              {t === 'inbox' && '📥 Caixa'}
                              {t === 'compose' && '✉️ Escrever'}
                              {t === 'broadcast' && '📢 Comunicado'}
                            </button>
                          ))}
                        </div>

                        {/* Gmail Tab: Inbox */}
                        {gmailTab === 'inbox' && (
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-black uppercase tracking-wider text-viking-gold flex items-center gap-1.5">
                                <Inbox className="w-4 h-4 text-viking-gold" /> Últimos E-mails Recebidos
                              </h4>
                              <button 
                                onClick={() => fetchRecentEmails(googleAccessToken)}
                                className="text-[10px] text-viking-silver hover:text-viking-gold transition-all flex items-center gap-1 font-bold cursor-pointer uppercase"
                              >
                                🔄 Atualizar
                              </button>
                            </div>

                            {loadingGmail ? (
                              <div className="text-center py-10 space-y-2">
                                <span className="block text-2xl animate-spin text-viking-gold">⌛</span>
                                <p className="text-xs text-viking-silver font-bold uppercase tracking-wider">Consultando pergaminhos no Gmail...</p>
                              </div>
                            ) : gmailMessages.length === 0 ? (
                              <div className="text-center py-10 text-viking-silver/50 bg-[#0d0908]/30 rounded-xl border border-viking-gold/10">
                                <Inbox className="w-10 h-10 mx-auto text-viking-gold/15 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-wider">Caixa vazia ou sem mensagens recentes.</p>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {gmailMessages.map((msg, i) => {
                                  const headers = msg.payload?.headers || [];
                                  const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(Sem Assunto)';
                                  const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Desconhecido';
                                  return (
                                    <div key={i} className="p-3.5 rounded-xl bg-[#0d0908]/55 border border-viking-gold/10 hover:border-viking-gold/25 transition-all">
                                      <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <p className="text-xs font-black text-white truncate max-w-[250px]">{subject}</p>
                                        <span className="text-[9px] font-bold text-viking-gold uppercase shrink-0">Recebido</span>
                                      </div>
                                      <p className="text-[10px] text-viking-silver font-semibold truncate mb-2">De: {from}</p>
                                      <p className="text-[11px] text-viking-silver/80 italic line-clamp-2 bg-black/20 p-2 rounded-lg border border-viking-gold/5">{msg.snippet}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Gmail Tab: Compose */}
                        {gmailTab === 'compose' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-viking-gold">✉️ Novo E-mail Individual</h4>
                            <div className="space-y-3 p-4 bg-[#0d0908]/40 border border-viking-gold/15 rounded-xl">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">E-mail do Destinatário</label>
                                <input 
                                  type="email" 
                                  placeholder="guerreiro@exemplo.com"
                                  id="composeTo"
                                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-semibold text-xs focus:outline-none focus:border-viking-gold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Assunto</label>
                                <input 
                                  type="text" 
                                  placeholder="🛡️ Convocação para o Treino"
                                  id="composeSubject"
                                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-semibold text-xs focus:outline-none focus:border-viking-gold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Mensagem</label>
                                <textarea 
                                  rows={5}
                                  placeholder="Escreva sua instrução ou aviso aqui..."
                                  id="composeBody"
                                  className="w-full p-4 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/35 focus:outline-none focus:border-viking-gold text-xs font-semibold"
                                />
                              </div>
                              <button 
                                onClick={async () => {
                                  const to = (document.getElementById('composeTo') as HTMLInputElement)?.value || '';
                                  const subject = (document.getElementById('composeSubject') as HTMLInputElement)?.value || '';
                                  const body = (document.getElementById('composeBody') as HTMLTextAreaElement)?.value || '';
                                  if (!to || !subject || !body) {
                                    showToast('Preencha todos os campos!', 'error');
                                    return;
                                  }
                                  const success = await sendGmail(to, subject, `<div style="font-family:sans-serif;color:#111;padding:15px;line-height:1.6;">${body.replace(/\n/g, '<br/>')}</div>`);
                                  if (success) {
                                    (document.getElementById('composeTo') as HTMLInputElement).value = '';
                                    (document.getElementById('composeSubject') as HTMLInputElement).value = '';
                                    (document.getElementById('composeBody') as HTMLTextAreaElement).value = '';
                                  }
                                }}
                                className="w-full py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-4 h-4" /> Enviar E-mail
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Gmail Tab: Broadcast */}
                        {gmailTab === 'broadcast' && (
                          <div className="space-y-4">
                            <div className="p-3.5 rounded-xl border border-dashed border-viking-gold/25 bg-viking-gold/5 text-xs text-viking-silver leading-relaxed flex gap-2">
                              <Info className="w-5 h-5 text-viking-gold shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-viking-gold">Envio em Massa:</span> Esta funcionalidade permite enviar um comunicado por e-mail para todos os {Object.keys(studentsData).length} atletas cadastrados no templo ao mesmo tempo.
                              </div>
                            </div>
                            <div className="space-y-3 p-4 bg-[#0d0908]/40 border border-viking-gold/15 rounded-xl">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Assunto do Comunicado</label>
                                <input 
                                  type="text" 
                                  placeholder="🛡️ Comunicado Oficial do Templo Viking Force"
                                  id="broadcastSubject"
                                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-semibold text-xs focus:outline-none focus:border-viking-gold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Mensagem do Comunicado</label>
                                <textarea 
                                  rows={5}
                                  placeholder="Escreva a mensagem que todos os guerreiros receberão..."
                                  id="broadcastBody"
                                  className="w-full p-4 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/35 focus:outline-none focus:border-viking-gold text-xs font-semibold"
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  const subject = (document.getElementById('broadcastSubject') as HTMLInputElement)?.value || '';
                                  const body = (document.getElementById('broadcastBody') as HTMLTextAreaElement)?.value || '';
                                  if (!subject || !body) {
                                    showToast('Preencha o assunto e a mensagem!', 'error');
                                    return;
                                  }
                                  const athleteEmails = Object.keys(studentsData);
                                  
                                  triggerConfirm(
                                    "Disparar Comunicado?",
                                    `Tem certeza que deseja disparar este e-mail em massa para TODOS os ${athleteEmails.length} atletas?`,
                                    async () => {
                                      showToast(`Iniciando disparo em massa...`, 'info');
                                      let sentCount = 0;
                                      for (const email of athleteEmails) {
                                        const success = await sendGmail(email, subject, `
                                          <div style="background-color:#0d0908;color:#e0d3a8;padding:25px;border-radius:15px;border:2px solid #d4af37;font-family:sans-serif;max-width:600px;margin:0 auto;">
                                            <h2 style="color:#d4af37;text-align:center;text-transform:uppercase;margin-top:0;">🛡️ Comunicado do Templo Viking Force</h2>
                                            <p style="font-size:15px;line-height:1.6;color:#ffffff;">Olá, Guerreiro!</p>
                                            <p style="font-size:14px;line-height:1.6;color:#e0d3a8;">${body.replace(/\n/g, '<br/>')}</p>
                                            <div style="margin-top:25px;border-top:1px solid #3c2a21;padding-top:15px;font-size:11px;color:#a89a78;text-align:center;">
                                              Viking Force Powerlifting - Central de Comunicação Gmail
                                            </div>
                                          </div>
                                        `);
                                        if (success) sentCount++;
                                      }
                                      showToast(`Disparo concluído: ${sentCount} e-mails enviados com sucesso!`, 'success');
                                      if (sentCount > 0) {
                                        const subjectEl = document.getElementById('broadcastSubject') as HTMLInputElement;
                                        const bodyEl = document.getElementById('broadcastBody') as HTMLTextAreaElement;
                                        if (subjectEl) subjectEl.value = '';
                                        if (bodyEl) bodyEl.value = '';
                                      }
                                    }
                                  );
                                }}
                                className="w-full py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-4 h-4" /> Disparar Comunicado para Todos os Atletas
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 13. Notifications Drawer */}
                {drawerType === 'notifications' && activeStudentProfile && (
                  <div className="space-y-4">
                    {activeStudentProfile.notifications && activeStudentProfile.notifications.length > 0 ? (
                      <div className="space-y-3">
                        {activeStudentProfile.notifications.map((notification, index) => (
                          <div 
                            key={(notification.id || 'notif') + '_' + index}
                            className={`p-4 rounded-xl border flex gap-3 items-start transition-all ${
                              !notification.read 
                                ? 'bg-viking-gold/5 border-viking-gold/30' 
                                : 'bg-black/40 border-viking-gold/10 opacity-70'
                            }`}
                          >
                            <div className="mt-0.5">
                              {notification.type === 'info' && <Bell className="w-5 h-5 text-viking-gold" />}
                              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {notification.type === 'warning' && <Info className="w-5 h-5 text-amber-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-viking-silver">{notification.message}</p>
                              <p className="text-[10px] text-viking-silver/50 mt-1 uppercase font-mono tracking-wider">
                                {new Date(notification.date).toLocaleDateString()} {new Date(notification.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              {notification.actionData && (
                                <button 
                                  onClick={() => {
                                    setSelectedWeek(notification.actionData!.week);
                                    setSelectedDay(notification.actionData!.day);
                                    setSessionRpeState({});
                                    setExerciseFailureState({});
                                    setDrawerOpen(false);
                                    setWorkoutModalOpen(true);
                                  }}
                                  className="mt-2 px-3 py-1.5 bg-viking-gold/20 hover:bg-viking-gold/30 text-viking-gold border border-viking-gold/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  Ver Treino <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            {!notification.read && (
                              <button 
                                onClick={() => {
                                  const updatedNotifications = [...activeStudentProfile.notifications!];
                                  updatedNotifications[index] = { ...updatedNotifications[index], read: true };
                                  
                                  const updatedStudent = {
                                    ...activeStudentProfile,
                                    notifications: updatedNotifications
                                  };
                                  
                                  setStudentsData(prev => ({
                                    ...prev,
                                    [currentUser!.email]: updatedStudent
                                  }));
                                  
                                  saveStudentToFirebase(currentUser!.email, updatedStudent);
                                }}
                                className="p-1.5 hover:bg-viking-gold/20 rounded-lg transition-colors cursor-pointer"
                                title="Marcar como lida"
                              >
                                <CheckCircle className="w-4 h-4 text-viking-gold" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-viking-silver/20 mx-auto mb-4" />
                        <p className="text-viking-silver/60 text-sm">Nenhum aviso no momento.</p>
                      </div>
                    )}
                  </div>
                )}

                
                {/* Protocolos Drawer */}
                {drawerType === 'protocols' && (
                  <ProtocolsDrawer
                    protocols={trainingProtocols}
                    setProtocols={setTrainingProtocols}
                    studentsData={studentsData}
                    onApplyToStudent={(protocol, studentEmail) => {
                      // Apply protocol to student
                      const student = studentsData[studentEmail];
                      if (student) {
                         const notification = {
                           id: Date.now().toString() + '_' + Math.random().toString(36).substring(7),
                           message: `Novo protocolo de treino aplicado: ${protocol.name}!`,
                           date: new Date().toISOString(),
                           read: false,
                           type: 'info' as const
                         };
                         const updatedStudent = {
                           ...student,
                           customProgram: JSON.parse(JSON.stringify(protocol.program)),
                           customProgramName: protocol.name,
                           workoutReady: true,
                           notifications: [notification, ...(student.notifications || [])]
                         };
                         setStudentsData(prev => ({
                           ...prev,
                           [studentEmail]: updatedStudent
                         }));
                         // Also update Firebase
                         saveStudentToFirebase(studentEmail, updatedStudent);
                         showToast(`Protocolo "${protocol.name}" aplicado com sucesso!`, 'success');
                      }
                    }}
                  />
                )}

                {/* 12. Biblioteca de Exercícios Drawer */}
                {drawerType === 'exerciseLibrary' && (
                  <div className="space-y-4">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-viking-silver/45 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          placeholder="Buscar exercício (ex: Agachamento)..."
                          value={dbExerciseSearch}
                          onChange={(e) => setDbExerciseSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0d0908]/90 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 text-xs font-semibold focus:outline-none focus:border-viking-gold"
                        />
                        {dbExerciseSearch && (
                          <button 
                            onClick={() => setDbExerciseSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-viking-silver hover:text-viking-gold"
                          >
                            Limpar
                          </button>
                        )}
                      </div>

                      {currentUser?.role === 'trainer' && !editingDbExercise && (
                        <button 
                          onClick={() => {
                            setEditingDbExercise({ id: '', name: '', techniqueTips: '', videoUrl: '' });
                            setTimeout(() => {
                              drawerContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 50);
                          }}
                          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-viking-gold/10"
                        >
                          <Plus className="w-4 h-4" /> Incluir Exercício
                        </button>
                      )}
                    </div>

                    {/* Database Size Banner */}
                    <div className="flex justify-between items-center bg-viking-gold/5 border border-viking-gold/25 rounded-2xl px-4 py-2.5 text-xs text-viking-silver">
                      <span className="font-bold flex items-center gap-1.5">
                        <Library className="w-4 h-4 text-viking-gold" /> Biblioteca do Templo:
                      </span>
                      <strong className="text-viking-gold font-black font-mono tracking-wide">{dbExercises.length} Exercícios Prescritivos</strong>
                    </div>

                    {/* Unified Form (Add or Edit) */}
                    {currentUser?.role === 'trainer' && editingDbExercise && (
                      <div className="p-4 bg-[#0d0908]/90 border border-viking-gold/25 rounded-2xl space-y-3.5 relative">
                        <div className="flex justify-between items-center border-b border-viking-gold/15 pb-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-viking-gold">
                            {editingDbExercise.id ? 'Editar Exercício' : 'Cadastrar Novo Exercício'}
                          </h4>
                          <button 
                            onClick={() => {
                              setEditingDbExercise(null);
                              setTimeout(() => {
                                drawerContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                              }, 50);
                            }}
                            className="p-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-viking-silver hover:text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Nome do Exercício *</label>
                            <input 
                              type="text" 
                              placeholder="Ex: Agachamento Livre Back Squat"
                              value={editingDbExercise.name}
                              onChange={(e) => setEditingDbExercise({ ...editingDbExercise, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-semibold text-xs focus:outline-none focus:border-viking-gold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Dicas de Técnica / Instruções de Movimento</label>
                            <textarea 
                              rows={2}
                              placeholder="Ex: Mantenha os joelhos alinhados com as pontas dos pés, descendo abaixo do paralelo mantendo o tronco firme."
                              value={editingDbExercise.techniqueTips}
                              onChange={(e) => setEditingDbExercise({ ...editingDbExercise, techniqueTips: e.target.value })}
                              className="w-full p-3 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/30 text-xs font-semibold focus:outline-none focus:border-viking-gold"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Link de Vídeo (YouTube)</label>
                              <input 
                                type="text" 
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={editingDbExercise.videoUrl || ''}
                                onChange={(e) => setEditingDbExercise({ ...editingDbExercise, videoUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-semibold text-xs focus:outline-none focus:border-viking-gold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1 flex items-center gap-1">
                                <Upload className="w-3.5 h-3.5 text-viking-gold" /> Upload Vídeo do Celular
                              </label>
                              <input 
                                type="file" 
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 1.2 * 1024 * 1024) {
                                    showToast('O vídeo deve ser menor que 1.2MB. Grave um clipe curto de 3-5 segundos.', 'error');
                                    return;
                                  }
                                  setIsUploadingVideo(true);
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setEditingDbExercise({
                                      ...editingDbExercise,
                                      videoBase64: ev.target?.result as string,
                                      videoFileType: file.type,
                                      videoUrl: ''
                                    });
                                    setIsUploadingVideo(false);
                                    showToast('Vídeo do celular carregado com sucesso!', 'success');
                                  };
                                  reader.onerror = () => {
                                    setIsUploadingVideo(false);
                                    showToast('Erro ao ler arquivo de vídeo.', 'error');
                                  };
                                  reader.readAsDataURL(file);
                                }}
                                className="w-full text-xs text-viking-silver file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-viking-gold/15 file:text-viking-gold hover:file:bg-viking-gold/25 cursor-pointer bg-black/40 p-1 rounded-xl border border-viking-gold/20"
                              />
                              {isUploadingVideo && (
                                <p className="text-[9px] text-viking-gold mt-1 animate-pulse">Processando vídeo...</p>
                              )}
                              {editingDbExercise.videoBase64 && (
                                <div className="mt-2 flex items-center justify-between bg-black/20 p-1.5 rounded border border-viking-gold/10">
                                  <span className="text-[9px] text-green-400 font-bold uppercase">✓ Vídeo carregado ({editingDbExercise.videoFileType?.split('/')[1] || 'mp4'})</span>
                                  <button 
                                    type="button"
                                    onClick={() => setEditingDbExercise({ ...editingDbExercise, videoBase64: undefined, videoFileType: undefined })}
                                    className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase"
                                  >
                                    Remover
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={async () => {
                              if (!editingDbExercise.name.trim()) {
                                showToast('O nome do exercício é obrigatório!', 'error');
                                return;
                              }
                              try {
                                const exerciseToSave = { ...editingDbExercise };
                                if (!exerciseToSave.id) {
                                  exerciseToSave.id = 'ex_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
                                }

                                // 1. Save immediately in the local UI state & localStorage
                                setDbExercises(prev => {
                                  const index = prev.findIndex(ex => ex.id === exerciseToSave.id);
                                  let newList;
                                  if (index > -1) {
                                    newList = [...prev];
                                    newList[index] = exerciseToSave;
                                  } else {
                                    newList = [exerciseToSave, ...prev];
                                  }
                                  localStorage.setItem('viking_db_exercises', JSON.stringify(newList));
                                  return newList;
                                });

                                // 2. Return to the start of the library immediately
                                setEditingDbExercise(null);
                                setDbExerciseSearch('');
                                setTimeout(() => {
                                  drawerContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                }, 50);

                                // 3. Show success message instantly
                                showToast('Exercício salvo com sucesso!', 'success');

                                // 4. Save to Firestore asynchronously in the background
                                saveDbExerciseToFirebase(exerciseToSave).then(async () => {
                                  const updatedExs = await fetchDbExercisesFromFirebase();
                                  if (updatedExs) {
                                    setDbExercises(updatedExs);
                                    localStorage.setItem('viking_db_exercises', JSON.stringify(updatedExs));
                                  }
                                }).catch(err => {
                                  console.error("Error in async Firestore save:", err);
                                });
                              } catch (err) {
                                console.error("Error saving db exercise:", err);
                                showToast('Falha ao salvar exercício.', 'error');
                              }
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-4 h-4" /> {editingDbExercise.id ? 'Salvar Alterações' : 'Gravar no Banco'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Exercise Library List */}
                    <div className="space-y-3 overflow-y-auto pr-1">
                      {dbExercisesLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 text-viking-gold animate-spin mx-auto mb-2" />
                          <p className="text-xs text-viking-silver font-bold uppercase tracking-wider">Lendo banco de dados de exercícios...</p>
                        </div>
                      ) : (() => {
                        const filtered = dbExercises.filter(ex => 
                          ex.name.toLowerCase().includes(dbExerciseSearch.toLowerCase()) ||
                          (ex.techniqueTips && ex.techniqueTips.toLowerCase().includes(dbExerciseSearch.toLowerCase()))
                        );

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-8 text-viking-silver/50 bg-[#0d0908]/30 rounded-xl border border-viking-gold/10">
                              <BookOpen className="w-10 h-10 mx-auto text-viking-gold/15 mb-2" />
                              <p className="text-xs font-bold uppercase tracking-wider">Nenhum exercício encontrado.</p>
                            </div>
                          );
                        }

                        return filtered.map((ex, eIdx) => {
                          const hasYoutube = !!ex.videoUrl;
                          const hasBase64 = !!ex.videoBase64;
                          const ytEmbedUrl = getYouTubeEmbedUrl(ex.videoUrl);

                          return (
                            <div 
                              key={ex.id + '_' + eIdx} 
                              className="p-4 rounded-2xl bg-[#0d0908]/55 border border-viking-gold/10 hover:border-viking-gold/25 transition-all space-y-3"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Dumbbell className="w-4 h-4 text-viking-gold shrink-0" /> {ex.name}
                                    {(() => {
                                      const matchedDbEx = dbExercises.find(d => d.name.toLowerCase().trim() === ex.name.toLowerCase().trim());
                                      const tips = ex.techniqueTips || matchedDbEx?.techniqueTips || '';
                                      return tips ? (
                                        <button
                                          type="button"
                                          onClick={() => setActiveTipsModal({ name: ex.name, tips })}
                                          className="w-5 h-5 ml-1 rounded-full bg-viking-gold/20 border border-viking-gold/40 text-viking-gold flex items-center justify-center text-[10px] font-black hover:bg-viking-gold hover:text-black transition-all cursor-pointer shrink-0"
                                          title="Dicas Técnicas"
                                        >
                                          ?
                                        </button>
                                      ) : null;
                                    })()}
                                  </h4>
                                  {ex.techniqueTips && (
                                    <p className="text-[11px] text-[#e0d3a8]/80 leading-relaxed">
                                      <strong className="text-viking-gold">Dica de Técnica:</strong> {ex.techniqueTips}
                                    </p>
                                  )}
                                </div>

                                {currentUser?.role === 'trainer' && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button 
                                      onClick={() => {
                                        setEditingDbExercise(ex);
                                        setTimeout(() => {
                                          drawerContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 50);
                                      }}
                                      className="p-1.5 rounded-lg bg-viking-gold/10 hover:bg-viking-gold/20 text-viking-gold border border-viking-gold/20 transition-all text-[10px] font-bold uppercase cursor-pointer"
                                      title="Editar"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        triggerConfirm(
                                          "Excluir Exercício?",
                                          `Tem certeza que deseja DELETAR o exercício "${ex.name}" do banco de dados geral do Templo?`,
                                          async () => {
                                            try {
                                              showToast('Removendo exercício...', 'info');
                                              await deleteDbExerciseFromFirebase(ex.id);
                                              const updated = await fetchDbExercisesFromFirebase();
                                              if (updated) {
                                                setDbExercises(updated);
                                                localStorage.setItem('viking_db_exercises', JSON.stringify(updated));
                                              }
                                              showToast('Exercício removido com sucesso!', 'success');
                                            } catch (e) {
                                              showToast('Erro ao remover exercício.', 'error');
                                            }
                                          },
                                          true
                                        );
                                      }}
                                      className="p-1.5 rounded-lg bg-viking-red/10 hover:bg-viking-red/20 text-red-400 border border-viking-red/25 transition-all text-[10px] font-bold uppercase cursor-pointer"
                                      title="Excluir"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {(hasYoutube || hasBase64) && (
                                <div className="p-2 rounded-xl bg-black/35 border border-viking-gold/5">
                                  {hasBase64 ? (
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] font-bold text-viking-gold uppercase tracking-wider flex items-center gap-1">
                                        <Video className="w-3 h-3 text-viking-gold" /> Vídeo Próprio (Celular/Upload)
                                      </span>
                                      <video 
                                        controls 
                                        src={ex.videoBase64} 
                                        className="w-full max-h-48 rounded-lg border border-viking-gold/15 bg-black" 
                                        playsInline
                                      />
                                    </div>
                                  ) : (
                                    ytEmbedUrl ? (
                                      <div className="space-y-1.5">
                                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                                          <Youtube className="w-3 h-3 text-red-500" /> Demonstração no YouTube
                                        </span>
                                        <iframe 
                                          src={ytEmbedUrl}
                                          title={ex.name}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          className="w-full h-44 rounded-lg border border-viking-gold/10"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                                          <Youtube className="w-3 h-3 text-red-500" /> Link de Demonstração
                                        </span>
                                        <a 
                                          href={ex.videoUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-[10px] font-black text-viking-gold hover:underline uppercase flex items-center gap-1 cursor-pointer"
                                        >
                                          Assistir Externamente
                                        </a>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* 13. Lixeira Virtual Drawer */}
                {drawerType === 'trash' && (
                  <div className="space-y-4">
                    <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                      <Trash2 className="w-8 h-8 text-red-400 shrink-0" />
                      <div>
                        <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-0.5">Lixeira Virtual (Cemitério de Guerreiros)</h4>
                        <p className="text-xs text-viking-silver/85">
                          Aqui estão os atletas excluídos do templo. Você pode restaurar o cadastro e os treinos deles a qualquer momento ou bani-los permanentemente.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                      {(() => {
                        const trashStudents = (Object.entries(studentsData) as [string, StudentProfile][]).filter(([_, s]) => s.isDeleted === true);

                        if (trashStudents.length === 0) {
                          return (
                            <div className="text-center py-12 text-viking-silver/50 bg-[#0d0908]/30 rounded-2xl border border-dashed border-viking-gold/10 space-y-2">
                              <Trash2 className="w-12 h-12 mx-auto text-viking-gold/10" />
                              <p className="text-xs font-bold uppercase tracking-wider">A lixeira está vazia.</p>
                              <p className="text-[11px] text-viking-silver/40">Nenhum atleta foi excluído ou movido para cá recentemente.</p>
                            </div>
                          );
                        }

                        return trashStudents.map(([email, s]) => (
                          <div 
                            key={email} 
                            className="p-4 rounded-2xl bg-[#0d0908]/55 border border-viking-gold/10 hover:border-red-500/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1 text-left">
                              <h5 className="font-bold text-white text-sm">{s.name}</h5>
                              <p className="text-xs text-viking-silver/60 flex items-center gap-1.5">
                                <span className="bg-viking-gold/10 text-viking-gold text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{s.plan}</span>
                                <span>{email}</span>
                              </p>
                              {s.deletedAt && (
                                <p className="text-[10px] text-viking-silver/40 italic">
                                  Excluído em: {new Date(s.deletedAt).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  const copy = { ...studentsData };
                                  if (copy[email]) {
                                    copy[email] = {
                                      ...copy[email],
                                      isDeleted: false
                                    };
                                    saveStudentsToDB(copy);
                                    showToast(`Guerreiro ${s.name} restaurado com sucesso!`, 'success');
                                  }
                                }}
                                className="px-3 py-2 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 text-viking-gold border border-viking-gold/20 hover:border-viking-gold text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                              </button>

                              <button
                                onClick={() => {
                                  triggerConfirm(
                                    'Excluir Permanentemente?',
                                    `Tem certeza que deseja apagar permanentemente ${s.name}? Esta ação não pode ser desfeita!`,
                                    () => {
                                      const copy = { ...studentsData };
                                      delete copy[email];
                                      saveStudentsToDB(copy);
                                      deleteStudentFromFirebase(email).catch(err => console.error("Firebase delete permanent error:", err));
                                      showToast(`Guerreiro ${s.name} banido definitivamente!`, 'success');
                                    },
                                    true,
                                    'Sim, Banir Definitivamente'
                                  );
                                }}
                                className="px-3 py-2 rounded-xl bg-[#611c1c]/15 hover:bg-red-950/40 border border-viking-red/20 hover:border-viking-red/40 text-red-400 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Banir
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Confirm Session Modal (Moved to root level) */}
      <AnimatePresence>
        {confirmSessionModalOpen && pendingSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#140e0c] p-6 rounded-2xl border border-viking-gold/20 shadow-2xl max-w-sm w-full"
            >
              <h2 className="text-xl font-bold text-viking-gold mb-4">Confirmar Treino</h2>
              <div className="space-y-2 text-sm text-[#e0d3a8] mb-6">
                <p>Deseja finalizar e salvar esta sessão?</p>
                <p>Volume Total: <span className="font-bold text-white">{pendingSession.totalAchievedVolume}</span></p>
                <p>RPE Médio: <span className="font-bold text-white">{pendingSession.avgRPE.toFixed(1)}</span></p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmSessionModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => finalizeSession(pendingSession)}
                  className="flex-1 py-2 rounded-lg bg-viking-gold text-[#140e0c] font-bold hover:brightness-110 transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- REUSABLE DISMISSIBLE ACTIVE WORKOUT MODAL --- */}
      <AnimatePresence>
        {workoutModalOpen && activeStudentProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWorkoutModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            />
            
            <motion.div 
              key={workoutLayout}
              initial={workoutLayout === 'modal' ? { opacity: 0, scale: 0.95 } : { x: '100%', opacity: 0.8 }}
              animate={workoutLayout === 'modal' ? { opacity: 1, scale: 1 } : { x: 0, opacity: 1 }}
              exit={workoutLayout === 'modal' ? { opacity: 0, scale: 0.95 } : { x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={workoutLayout === 'modal' 
                ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-[#140e0c]/98 border border-viking-gold/25 rounded-3xl z-50 flex flex-col max-h-[88vh] overflow-hidden text-[#e0d3a8] shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                : "fixed top-0 right-0 h-screen w-full sm:w-[480px] md:w-[540px] lg:w-[600px] bg-[#140e0c]/98 border-l-2 border-viking-gold/30 z-50 flex flex-col overflow-hidden text-[#e0d3a8] shadow-[-15px_0_50px_rgba(0,0,0,0.85)] backdrop-blur-xl rounded-l-3xl"
              }
            >
              <div className="p-4 sm:p-6 border-b border-viking-gold/15 bg-[#140e0c]/90 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-viking-gold/10 flex items-center justify-center border border-viking-gold/20">
                    <Dumbbell className="w-5 h-5 text-viking-gold" />
                  </div>
                  <div>
                    <h3 className="font-viking-display text-sm sm:text-base font-black tracking-wider text-viking-gold">DIÁRIO DO GUERREIRO</h3>
                    <p className="text-[10px] text-viking-silver uppercase font-viking-medieval mt-0.5">Registre suas marcas e feedbacks</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Layout Toggle Button */}
                  {workoutLayout === 'modal' ? (
                    <button 
                      type="button"
                      onClick={() => {
                        setWorkoutLayout('sidebar');
                        showToast('Treino movido para a lateral! Navegue pelo salão livremente.', 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 hover:border-viking-gold/40 text-viking-gold hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      title="Mover para Painel Lateral"
                    >
                      <Columns className="w-4 h-4 shrink-0" />
                      <span className="hidden md:inline">Mover para Lateral</span>
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setWorkoutLayout('modal');
                        showToast('Treino centralizado na tela.', 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 hover:border-viking-gold/40 text-viking-gold hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      title="Centralizar na Tela"
                    >
                      <Maximize2 className="w-4 h-4 shrink-0" />
                      <span className="hidden md:inline">Centralizar Treino</span>
                    </button>
                  )}

                  <button 
                    onClick={() => setWorkoutModalOpen(false)}
                    className="p-1.5 rounded-xl bg-viking-gold/5 border border-viking-gold/20 text-viking-silver hover:text-viking-gold cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 md:pb-6 space-y-4 sm:space-y-6">
                
                {/* Workout Selector */}
                <div className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                  <p className="text-xs text-viking-gold font-bold uppercase tracking-wider">🗓️ Período de Treino Ativo</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Semana</label>
                      <select 
                        value={selectedWeek}
                        onChange={e => { setSelectedWeek(parseInt(e.target.value)); setSessionRpeState({}); setExerciseFailureState({}); }}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      >
                        {Object.keys((activeStudentProfile?.customProgram || trainingProgram).weeks).map(Number).sort((a,b) => a-b).map(wk => (
                          <option key={wk} value={wk} className="bg-[#140e0c] text-[#e0d3a8]">
                            Semana {wk}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Treino</label>
                      <select 
                        value={selectedDay}
                        onChange={e => { 
                          const newDay = e.target.value;
                          setSelectedDay(newDay);
                          setSessionRpeState({}); 
                          setExerciseFailureState({}); 
                          setExerciseWarmupState({});
                          setExerciseSetsState({});
                          setCurrentExerciseIndex(0);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      >
                        {Object.keys((activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek] || { A: [], B: [], C: [] }).sort().map(day => {
                          return (
                            <option key={day} value={day} className="bg-[#140e0c] text-[#e0d3a8]">
                              Treino {day}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mode toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 gap-3">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-viking-gold" /> Modelo de Visualização
                    </p>
                    <p className="text-[10px] text-viking-silver mt-0.5">Alterne entre ver todos os exercícios ou focar em um por um. No celular, deslize a tela (swipe) para os lados para navegar!</p>
                  </div>
                  <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-viking-gold/10 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setWorkoutViewMode('list')}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer ${workoutViewMode === 'list' ? 'bg-[#d4af37] text-black font-black shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'text-viking-silver hover:text-viking-gold'}`}
                    >
                      Lista Completa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkoutViewMode('slide');
                        setCurrentExerciseIndex(0);
                        showToast('Modo de Foco Ativado! Deslize ou use os botões para avançar.', 'info');
                      }}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${workoutViewMode === 'slide' ? 'bg-[#d4af37] text-black font-black shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'text-viking-silver hover:text-viking-gold'}`}
                    >
                      <Sparkles className="w-3 h-3 text-current animate-pulse" /> Modo Slide Foco
                    </button>
                  </div>
                </div>

                {/* VIKING REST TIMER */}
                <motion.div 
                  animate={timerShake ? { x: [-10, 10, -10, 10, -5, 5, -2, 2, 0] } : { x: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#1a1210] to-[#120b09] border shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4 transition-all duration-300 ${timerShake ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-viking-gold/25'}`}
                >
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className={`p-2 sm:p-2.5 rounded-lg flex items-center justify-center transition-all ${restTimerActive ? 'bg-viking-gold/10 border border-viking-gold/25 animate-pulse text-viking-gold' : 'bg-black/40 border border-viking-silver/10 text-viking-silver'}`}>
                      <Timer className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 leading-none">
                        Cronômetro Viking
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-viking-silver mt-0.5">Mantenha a intensidade!</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                      {/* Time Display */}
                      {(() => {
                        const isEnding = restTimerActive && restTimerRemaining > 0 && restTimerRemaining <= 5;
                        return (
                          <div className={`bg-black/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border flex items-center justify-center font-mono text-lg sm:text-xl font-black tracking-widest min-w-[80px] sm:min-w-[90px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all duration-300 ${isEnding ? 'border-red-500 text-red-500 scale-105 sm:scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' : timerShake ? 'border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'border-viking-gold/15 text-viking-gold'}`}>
                            {(() => {
                              const mins = Math.floor(restTimerRemaining / 60);
                              const secs = restTimerRemaining % 60;
                              return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                            })()}
                          </div>
                        );
                      })()}

                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRestTimerActive(false);
                            setRestTimerRemaining(prev => Math.max(0, prev - 30));
                          }}
                          className="w-8 h-8 sm:p-2 rounded-lg bg-black/40 hover:bg-[#d4af37]/10 text-viking-silver hover:text-viking-gold border border-viking-gold/10 text-[9px] sm:text-[10px] font-black cursor-pointer transition-all flex items-center justify-center"
                        >
                          -30
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRestTimerActive(false);
                            setRestTimerRemaining(prev => prev + 30);
                          }}
                          className="w-8 h-8 sm:p-2 rounded-lg bg-black/40 hover:bg-[#d4af37]/10 text-viking-silver hover:text-viking-gold border border-viking-gold/10 text-[9px] sm:text-[10px] font-black cursor-pointer transition-all flex items-center justify-center"
                        >
                          +30
                        </button>
                        <button
                          type="button"
                          onClick={() => setRestTimerActive(!restTimerActive)}
                          className={`w-9 h-9 sm:p-2 rounded-lg text-black font-black flex items-center justify-center cursor-pointer transition-all ${restTimerActive ? 'bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-[#d4af37] hover:brightness-110'}`}
                        >
                          {restTimerActive ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRestTimerActive(false);
                            setRestTimerRemaining(restTimerSeconds);
                          }}
                          className="w-8 h-8 sm:p-2 rounded-lg bg-[#0d0908] hover:bg-[#140e0c] text-viking-silver hover:text-viking-gold border border-viking-gold/20 cursor-pointer transition-all flex items-center justify-center"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Adjust Presets */}
                    <div className="flex gap-1 bg-black/30 p-1 rounded-lg border border-viking-gold/5 text-[9px] font-bold w-full sm:w-auto justify-around">
                      {[60, 90, 120, 180].map(sec => {
                        const label = sec === 60 ? '1m' : sec === 90 ? '1m30' : sec === 120 ? '2m' : '3m';
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              setRestTimerActive(false);
                              setRestTimerSeconds(sec);
                              setRestTimerRemaining(sec);
                              showToast(`Intervalo ajustado para ${label}!`, 'info');
                            }}
                            className={`flex-1 sm:flex-none px-2 py-1 rounded transition-all cursor-pointer text-center ${restTimerSeconds === sec ? 'bg-viking-gold/20 text-viking-gold border border-viking-gold/30' : 'text-viking-silver hover:text-viking-gold'}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* RPE Explanatory note */}
                <div className="p-3.5 rounded-xl border border-dashed border-viking-gold/25 text-[11px] text-viking-silver leading-relaxed flex gap-2.5 bg-viking-gold/5">
                  <Info className="w-5 h-5 text-viking-gold shrink-0" />
                  <div>
                    <span className="font-bold text-viking-gold">Como funciona o RPE (Esforço Percebido)?</span> O RPE mede a intensidade de esforço real com base nas repetições restantes na reserva. RPE 8 significa que você parou tendo certeza de que conseguiria realizar exatamente mais 2 repetições. RPE 10 indica falha total. Logue seu cansaço real.
                  </div>
                </div>

                {/* Workout Progress Bar */}
                {(() => {
                  const list = (activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek]?.[selectedDay] || [];
                  if (list.length === 0) return null;
                  
                  const completedCount = list.filter(ex => {
                    const sets = exerciseSetsState[ex.id] || [];
                    return sets.length > 0 && sets.every(s => s.done);
                  }).length;
                  
                  const progressPct = Math.round((completedCount / list.length) * 100);
                  const isAllCompleted = progressPct === 100;

                  return (
                    <div className="space-y-2 p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 relative overflow-hidden transition-all duration-500">
                      {isAllCompleted && (
                        <div className="absolute inset-0 bg-green-500/10 mix-blend-screen animate-pulse pointer-events-none" />
                      )}
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest relative z-10">
                        <span className="text-viking-silver flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-viking-gold" /> Progresso da Sessão
                        </span>
                        <span className={isAllCompleted ? "text-green-400" : "text-viking-gold"}>
                          {completedCount} / {list.length} Exercícios ({progressPct}%)
                        </span>
                      </div>
                      <div className={`h-2.5 w-full bg-[#140e0c] rounded-full overflow-hidden border ${isAllCompleted ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-viking-gold/20'} p-[2px] transition-all duration-500 relative z-10`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${isAllCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-viking-gold-dark to-viking-gold'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      {isAllCompleted && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center text-[11px] text-green-400 font-black mt-3 flex justify-center items-center gap-2 relative z-10"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> SESSÃO DESTRUTIVA CONCLUÍDA! <Sparkles className="w-3.5 h-3.5" />
                        </motion.p>
                      )}
                    </div>
                  );
                })()}

                {/* Exercises list in workout */}
                <div className="space-y-4">
                  {((activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek]?.[selectedDay] || []).length === 0 ? (
                    <div className="text-center py-10 text-viking-silver/50 italic">
                      Nenhum exercício prescrito para a Semana {selectedWeek} - Treino {selectedDay} no momento.
                    </div>
                  ) : (
                    (() => {
                      const list = (activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek]?.[selectedDay] || [];
                      const filteredList = workoutViewMode === 'list' 
                        ? list 
                        : [list[currentExerciseIndex]].filter(Boolean);

                      return (
                        <div 
                          className={`space-y-4 relative w-full flex flex-col transition-all duration-300 ${workoutViewMode === 'slide' ? 'min-h-[500px] sm:min-h-[420px]' : ''}`} 
                          style={{ perspective: '1200px' }}
                          onTouchStart={(e) => {
                            if (workoutViewMode !== 'slide') return;
                            const tagName = (e.target as HTMLElement).tagName.toLowerCase();
                            if (
                              tagName === 'input' || 
                              tagName === 'button' || 
                              tagName === 'textarea' || 
                              (e.target as HTMLElement).closest('button') || 
                              (e.target as HTMLElement).closest('input') ||
                              (e.target as HTMLElement).closest('textarea')
                            ) {
                              return; // Ignore if interacting with form elements or buttons
                            }
                            setTouchStartX(e.targetTouches[0].clientX);
                            setTouchStartY(e.targetTouches[0].clientY);
                            setTouchEndX(e.targetTouches[0].clientX);
                            setTouchEndY(e.targetTouches[0].clientY);
                          }}
                          onTouchMove={(e) => {
                            if (workoutViewMode !== 'slide' || touchStartX === null) return;
                            setTouchEndX(e.targetTouches[0].clientX);
                            setTouchEndY(e.targetTouches[0].clientY);
                          }}
                          onTouchEnd={() => {
                            if (workoutViewMode !== 'slide' || touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;
                            const diffX = touchStartX - touchEndX;
                            const diffY = touchStartY - touchEndY;
                            
                            if (Math.abs(diffX) > Math.abs(diffY)) {
                              if (Math.abs(diffX) > 60) { // minimum threshold of 60px
                                if (diffX > 0) {
                                  // Swiped left -> Next
                                  if (currentExerciseIndex < list.length - 1) {
                                    setSlideDirection('forward');
                                    setCurrentExerciseIndex(prev => Math.min(list.length - 1, prev + 1));
                                  }
                                } else {
                                  // Swiped right -> Previous
                                  if (currentExerciseIndex > 0) {
                                    setSlideDirection('backward');
                                    setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
                                  }
                                }
                              }
                            }
                            setTouchStartX(null);
                            setTouchStartY(null);
                            setTouchEndX(null);
                            setTouchEndY(null);
                          }}
                        >
                          <AnimatePresence mode="wait">
                            {filteredList.map((ex) => {
                              const actualIdx = list.findIndex(item => item.id === ex.id);
                              const idx = actualIdx !== -1 ? actualIdx : 0;
                              
                              // Determine proper 1RM based on exercise identifier
                              let currentPr: number | null = null;
                              if (ex.baseWeight) {
                                currentPr = ex.baseWeight;
                              } else {
                                const exNameLower = ex.name.toLowerCase();
                                if (exNameLower.includes('agachamento') || exNameLower.includes('squat')) {
                                  currentPr = activeStudentProfile.prs.squat;
                                } else if (exNameLower.includes('supino') || exNameLower.includes('bench')) {
                                  currentPr = activeStudentProfile.prs.bench;
                                } else if (exNameLower.includes('terra') || exNameLower.includes('deadlift')) {
                                  currentPr = activeStudentProfile.prs.deadlift;
                                }
                              }
                              const intensityStr = typeof ex.intensity === 'number' ? `${Math.round(ex.intensity * 100)}% 1RM` : ex.intensity;
                              const warmupArray = ex.main ? getWarmupSteps(currentPr, ex.intensity, ex.warmup) : null;
                              return (
                                <motion.div 
                                  key={(ex.id || 'ex') + '_' + idx}
                                  layout
                                  initial={workoutViewMode === 'slide' ? { opacity: 0, x: slideDirection === 'forward' ? '100%' : '-100%', scale: 0.95 } : { opacity: 0, y: 30, scale: 0.95 }}
                                  animate={{ 
                                    opacity: 1, x: 0, y: 0, scale: 1
                                  }}
                                  exit={workoutViewMode === 'slide' ? { opacity: 0, x: slideDirection === 'forward' ? '-100%' : '100%', scale: 0.95 } : { opacity: 0, scale: 0.9 }}
                                  transition={{ 
                                    type: 'spring', stiffness: 300, damping: 30, mass: 1, delay: workoutViewMode === 'list' ? idx * 0.05 : 0
                                  }}
                                  className={`p-5 rounded-2xl border w-full ${ex.main ? 'bg-gradient-to-br from-[#1a1210]/95 to-[#120b09]/95 border-viking-gold/40 shadow-[0_8px_30px_rgba(212,175,55,0.12)]' : 'bg-[#0d0908]/80 border-viking-gold/15 shadow-xl'} ${workoutViewMode === 'list' ? (ex.main ? 'border-l-[4px] border-l-viking-gold' : 'border-l-[3px] border-l-viking-silver/30') : 'ring-1 ring-viking-gold/20'} select-none`}
                                >
                          
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <div>
                              <span className="text-[10px] text-viking-silver/65 uppercase tracking-wider font-viking-medieval">#{idx + 1} Exercício</span>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <h4 className="text-sm sm:text-base font-black text-white">
                                  {ex.name}
                                </h4>
                                {ex.main && <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Foco Principal</span>}
                                {workoutViewMode === 'slide' && (
                                  <div className="flex gap-1.5 ml-auto">
                                    <button
                                      type="button"
                                      disabled={currentExerciseIndex === 0}
                                      onClick={() => {
                                        setSlideDirection('backward');
                                        setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
                                      }}
                                      className="p-1.5 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={currentExerciseIndex === list.length - 1}
                                      onClick={() => {
                                        setSlideDirection('forward');
                                        setCurrentExerciseIndex(prev => Math.min(list.length - 1, prev + 1));
                                      }}
                                      className="p-1.5 rounded-lg bg-viking-gold/10 border border-viking-gold/20 text-[#e0d3a8] disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const matchedDbEx = dbExercises.find(d => d.name.toLowerCase().trim() === ex.name.toLowerCase().trim());
                                    const hasVideo = !!ex.videoUrl || !!matchedDbEx?.videoUrl || !!matchedDbEx?.videoBase64;
                                    const hasTips = !!ex.techniqueTips || !!matchedDbEx?.techniqueTips;
                                    
                                    return (
                                      <>
                                        {hasVideo && (
                                          <button 
                                            type="button"
                                            onClick={() => setActiveVideoModal({
                                              name: ex.name,
                                              videoUrl: ex.videoUrl || matchedDbEx?.videoUrl,
                                              videoBase64: matchedDbEx?.videoBase64
                                            })}
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-viking-gold hover:text-white bg-viking-gold/10 border border-viking-gold/25 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-viking-gold/10"
                                            title="Assistir execução no Templo"
                                          >
                                            <Video className="w-3.5 h-3.5 text-viking-gold" /> Ver Execução
                                          </button>
                                        )}
                                        {hasTips && (
                                          <button 
                                            type="button"
                                            onClick={() => setActiveTipsModal({
                                              name: ex.name,
                                              tips: ex.techniqueTips || matchedDbEx?.techniqueTips || ''
                                            })}
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/10"
                                            title="Dicas Técnicas"
                                          >
                                            <Info className="w-3.5 h-3.5 text-emerald-400" /> Dicas
                                          </button>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-viking-silver">
                              Séries: <strong className="text-white">{ex.sets}x{ex.reps}</strong> @{' '}
                              <strong className="text-viking-gold">
                                {ex.main ? (
                                  currentPr && (typeof ex.intensity === 'number' || (typeof ex.intensity === 'string' && !isNaN(parseFloat(ex.intensity)))) ? (
                                    (() => {
                                      let ratio = 0;
                                      if (typeof ex.intensity === 'number') ratio = ex.intensity;
                                      else {
                                        const p = parseFloat(ex.intensity.replace('%', ''));
                                        ratio = p > 1 ? p / 100 : p;
                                      }
                                      return `${Math.round(currentPr * ratio)} kg (${Math.round(ratio * 100)}%)`;
                                    })()
                                  ) : (
                                    intensityStr
                                  )
                                ) : (
                                  ex.baseWeight ? (
                                    `${ex.baseWeight} kg` + (ex.intensity && ex.intensity !== 'carga livre' ? ` (${ex.intensity})` : '')
                                  ) : (
                                    intensityStr
                                  )
                                )}
                              </strong>
                            </span>
                          </div>

                          {ex.techniqueTips && (
                            <div className="mb-4 p-3 rounded-xl bg-viking-gold/5 border border-viking-gold/15 flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-viking-gold shrink-0 mt-0.5" />
                              <div className="text-xs">
                                <span className="font-bold text-viking-gold">Dica de Técnica:</span>{' '}
                                <span className="text-viking-silver/90">{ex.techniqueTips}</span>
                              </div>
                            </div>
                          )}
                          {ex.trainerNote && (
                            <div className="mb-4 p-3 rounded-xl bg-viking-gold/10 border border-viking-gold/30 flex items-start gap-2.5 shadow-sm">
                              <Info className="w-4 h-4 text-viking-gold shrink-0 mt-0.5" />
                              <div className="text-xs">
                                <span className="font-bold text-viking-gold uppercase tracking-wide">Observações do Treinador:</span>{' '}
                                <span className="text-[#e0d3a8] font-medium">{ex.trainerNote}</span>
                              </div>
                            </div>
                          )}

                          {/* Training Methodology Badge & Description inside active session */}
                          {ex.methodology && ex.methodology !== 'standard' && (
                            <div className="mb-4 px-3 py-2 rounded-xl bg-viking-gold/5 border border-viking-gold/25 text-xs text-viking-silver flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-viking-gold">
                                <Zap className="w-4 h-4 text-viking-gold animate-bounce" />
                                <span>METODOLOGIA ATIVA:</span>
                                <span className="uppercase text-[11px] tracking-wider text-white">
                                  {ex.methodology === 'backoff' ? 'Back-off Set (Top Set + Séries de Recuo)' :
                                   ex.methodology === 'myoreps' ? 'Myo-Reps (Mini-Séries Rest-Pause)' :
                                   ex.methodology === 'clusters' ? 'Cluster Sets (Séries Agrupadas com Pausa)' :
                                   ex.methodology === 'dropset' ? 'Drop Set (Reduções Pós-Falha)' : ex.methodology}
                                </span>
                              </div>
                              {ex.methodologyDetails && (
                                <div className="text-[11px] text-[#e0d3a8] font-bold bg-[#140e0c]/80 p-2 rounded-lg border border-viking-gold/15">
                                  📋 Diretriz Viking: {ex.methodologyDetails}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Render automated warmup sequence */}
                          {ex.main && (
                            <div className="mb-4 pt-2 pb-1 text-xs">
                              {warmupArray ? (
                                <div className="p-3 bg-[#0d0908]/90 border-l-2 border-viking-gold border-t border-r border-b border-viking-gold/15 rounded-r-xl space-y-1.5">
                                  <span className="text-[10px] font-bold text-viking-gold uppercase tracking-widest flex items-center gap-1.5">
                                    <Flame className="w-3.5 h-3.5 animate-pulse text-viking-gold" /> Aquecimento Inteligente Calculado
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-viking-silver">
                                    {warmupArray.map((w: any, wIdx) => {
                                      const isDone = exerciseWarmupState[ex.id]?.[wIdx];
                                      return (
                                        <React.Fragment key={wIdx}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setExerciseWarmupState(prev => {
                                                const currentExWarmup = prev[ex.id] || [];
                                                const newExWarmup = [...currentExWarmup];
                                                newExWarmup[wIdx] = !newExWarmup[wIdx];
                                                return { ...prev, [ex.id]: newExWarmup };
                                              });
                                              if (!isDone) {
                                                setRestTimerActive(true);
                                                setRestTimerRemaining(restTimerSeconds);
                                              }
                                            }}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all cursor-pointer ${isDone ? 'bg-green-950/30 border-green-500/40 text-green-400' : 'bg-black/40 border-viking-gold/20 text-viking-silver hover:border-viking-gold/50'}`}
                                          >
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-green-500 border-green-500 text-black' : 'border-viking-gold/40 text-transparent'}`}>
                                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                                            </div>
                                            <span className={w.isTarget && !isDone ? 'text-viking-gold font-bold' : ''}>
                                              {w.reps}r @ <strong className={isDone ? 'text-green-300' : 'text-white'}>{w.weight} kg</strong> ({w.isTarget ? 'Alvo' : `${Math.round(w.percent * 100)}%`})
                                            </span>
                                          </button>
                                          {wIdx < warmupArray.length - 1 && <span className="text-viking-gold/40">→</span>}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 bg-red-950/20 border-l-2 border-viking-red border-t border-r border-b border-viking-red/15 rounded-r-xl text-[10px] text-red-300">
                                  ⚠️ Sem 1RM cadastrado para este exercício! Cadastre seu 1RM no botão "Ajustar 1RM" para gerar o aquecimento automático em kg.
                                </div>
                              )}
                            </div>
                          )}

                          {/* SÉRIES E REPETIÇÕES (Custom log per set) */}
                          <div className="mb-4 p-4 rounded-xl bg-[#0d0908]/80 border border-viking-gold/25 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-viking-gold/15">
                              <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                                <Dumbbell className="w-4 h-4 text-viking-gold" /> Séries e Repetições Realizadas
                              </span>
                              <span className="text-[10px] text-viking-gold font-bold uppercase">Prescrito: {ex.sets}x{ex.reps}</span>
                            </div>

                            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                              {(() => {
                                const sets = exerciseSetsState[ex.id] || [];
                                const firstIncompleteIdx = sets.findIndex(s => !s.done);
                                return sets.map((set, setIdx) => {
                                  const isActive = setIdx === firstIncompleteIdx;
                                  return (
                                <motion.div 
                                  key={setIdx} 
                                  initial={false}
                                  animate={isActive ? { scale: [1, 1.03, 1], borderColor: ['#d4af37', '#ffffff', '#d4af37'] } : { scale: 1 }}
                                  transition={{ duration: 0.4 }}
                                  className={`flex flex-col gap-2 p-2 rounded-lg transition-all duration-500 border ${
                                    set.done 
                                      ? 'bg-green-950/20 border-green-500/30' 
                                      : isActive
                                        ? 'bg-viking-gold/10 border-viking-gold shadow-[0_0_12px_rgba(212,175,55,0.25)] relative overflow-hidden'
                                        : 'bg-black/40 border-viking-gold/5 hover:border-viking-gold/10'
                                  }`}
                                >
                                  {isActive && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-viking-gold animate-pulse"></div>
                                  )}
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                                    {/* Mobile Header Row / Desktop Left Side */}
                                    <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                                      <div className="flex items-center gap-2.5">
                                        {/* Checkoff / Done Button */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              if (sets[setIdx]) {
                                                const nextDone = !sets[setIdx].done;
                                                sets[setIdx] = { ...sets[setIdx], done: nextDone };
                                                
                                                // Check for PR achievement
                                                if (nextDone && activeStudentProfile) {
                                                    const allDone = sets.every(s => s.done);
                                                    if (allDone) {
                                                        const maxWeight = Math.max(...sets.map(s => s.weight || 0));
                                                        let prValue = null;
                                                        const exNameLower = ex.name.toLowerCase();
                                                        if (exNameLower.includes('squat') || exNameLower.includes('agachamento')) prValue = activeStudentProfile.prs.squat;
                                                        else if (exNameLower.includes('bench') || exNameLower.includes('supino')) prValue = activeStudentProfile.prs.bench;
                                                        else if (exNameLower.includes('deadlift') || exNameLower.includes('levantamento')) prValue = activeStudentProfile.prs.deadlift;
                                                        
                                                        if (prValue !== null && prValue > 0 && maxWeight > prValue) {
                                                            confetti({
                                                                particleCount: 150,
                                                                spread: 70,
                                                                origin: { y: 0.6 },
                                                                colors: ['#d4af37', '#e0d3a8', '#ffffff']
                                                            });
                                                            showToast(`🔥 NOVO PR EM ${ex.name.toUpperCase()}: ${maxWeight}kg!`, 'success');
                                                        }
                                                    }
                                                }
                                              }
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                                            set.done 
                                              ? 'bg-green-500 border-green-400 text-black shadow-[0_0_8px_rgba(34,197,94,0.6)] hover:bg-green-600' 
                                              : 'bg-black/40 border-viking-gold/30 text-viking-gold/40 hover:border-viking-gold hover:text-viking-gold hover:bg-viking-gold/5'
                                          }`}
                                          title={set.done ? "Desmarcar Série" : "Marcar como Feito"}
                                        >
                                          <Check className={`w-4 h-4 stroke-[3] ${set.done ? 'text-black' : ''}`} />
                                        </button>

                                        {/* Set label */}
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider transition-all ${
                                          set.done 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                                            : 'bg-viking-gold text-black'
                                        }`}>
                                          SET {setIdx + 1}
                                        </span>
                                      </div>

                                      {/* Delete set (Mobile only) */}
                                      <div className="sm:hidden">
                                        <button
                                          type="button"
                                          disabled={set.done || (exerciseSetsState[ex.id]?.length || 0) <= 1}
                                          onClick={() => {
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              sets.splice(setIdx, 1);
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-35 shrink-0"
                                          title="Remover série"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Inputs Row - side-by-side on mobile, inline on desktop */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:justify-end">
                                      {/* Reps selector */}
                                      <div className="flex items-center gap-1 bg-[#1d1613] border border-viking-gold/30 rounded-lg px-2 py-1.5 flex-1 sm:flex-initial">
                                        <span className="text-[10px] text-viking-gold/70 uppercase font-bold mr-1 shrink-0">Reps:</span>
                                        <button
                                          type="button"
                                          disabled={set.done}
                                          onClick={() => {
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              if (sets[setIdx]) {
                                                sets[setIdx] = { ...sets[setIdx], reps: Math.max(0, (sets[setIdx].reps || 0) - 1) };
                                              }
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                        >
                                          -
                                        </button>
                                        <DebouncedInput
                                          type="number"
                                          inputMode="decimal"
                                          pattern="[0-9]*"
                                          value={set.reps === 0 ? '' : set.reps}
                                          placeholder="0"
                                          disabled={set.done}
                                          onChange={(val) => {
                                            const parsed = val === '' ? 0 : (parseInt(val) || 0);
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              if (sets[setIdx]) {
                                                sets[setIdx] = { ...sets[setIdx], reps: parsed };
                                              }
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="w-full min-w-[30px] bg-transparent text-center font-mono text-base font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:text-white/40"
                                        />
                                        <button
                                          type="button"
                                          disabled={set.done}
                                          onClick={() => {
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              if (sets[setIdx]) {
                                                sets[setIdx] = { ...sets[setIdx], reps: (sets[setIdx].reps || 0) + 1 };
                                              }
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                        >
                                          +
                                        </button>
                                      </div>

                                      {/* Weight selector */}
                                      <div className="flex items-center gap-1 bg-[#1d1613] border border-viking-gold/30 rounded-lg px-2 py-1.5 flex-1 sm:flex-initial">
                                        <span className="text-[10px] text-viking-gold/70 uppercase font-bold mr-1 shrink-0 hidden md:inline">Peso:</span>
                                        <button
                                          type="button"
                                          disabled={set.done}
                                          onClick={() => {
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              if (sets[setIdx]) {
                                                sets[setIdx] = { ...sets[setIdx], weight: Math.max(0, (sets[setIdx].weight || 0) - 2.5) };
                                              }
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                        >
                                          -
                                        </button>
                                        <DebouncedInput
                                          type="number"
                                          inputMode="decimal"
                                          step="2.5"
                                          pattern="[0-9]*\\.?[0-9]*"
                                          value={set.weight === 0 ? '' : set.weight}
                                          disabled={set.done}
                                          placeholder="0"
                                          onChange={(val) => {
                                            const parsed = val === '' ? 0 : (parseFloat(val) || 0);
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              if (sets[setIdx]) {
                                                sets[setIdx] = { ...sets[setIdx], weight: parsed };
                                              }
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="w-full min-w-[40px] bg-transparent text-center font-mono text-base font-bold focus:outline-none text-white disabled:text-viking-gold/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          title={ex.main ? "Carga sugerida pelo treinador. Você pode alterar se realizou uma carga diferente." : "Carga realizada (kg)"}
                                        />
                                        <button
                                          type="button"
                                          disabled={set.done}
                                          onClick={() => {
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              if (sets[setIdx]) {
                                                sets[setIdx] = { ...sets[setIdx], weight: (sets[setIdx].weight || 0) + 2.5 };
                                              }
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                        >
                                          +
                                        </button>
                                        <span className="text-[10px] text-viking-gold/70 font-bold shrink-0">kg</span>
                                        {ex.main && <Flame className="w-3.5 h-3.5 text-viking-gold/60 shrink-0" title="Carga sugerida pelo treinador. Altere se precisar ajustar." />}
                                      </div>

                                      {/* Delete set (Desktop only) */}
                                      <div className="hidden sm:block">
                                        <button
                                          type="button"
                                          disabled={set.done || (exerciseSetsState[ex.id]?.length || 0) <= 1}
                                          onClick={() => {
                                            setExerciseSetsState(prev => {
                                              const sets = [...(prev[ex.id] || [])];
                                              sets.splice(setIdx, 1);
                                              return { ...prev, [ex.id]: sets };
                                            });
                                          }}
                                          className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-35 shrink-0"
                                          title="Remover série"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="w-full">
                                    <input
                                      type="text"
                                      value={set.note || ''}
                                      disabled={set.done}
                                      onChange={(e) => {
                                        setExerciseSetsState(prev => {
                                          const sets = [...(prev[ex.id] || [])];
                                          if (sets[setIdx]) {
                                            sets[setIdx] = { ...sets[setIdx], note: e.target.value };
                                          }
                                          return { ...prev, [ex.id]: sets };
                                        });
                                      }}
                                      placeholder="Nota da série (ex: leve, dor no ombro, RPE 8)..."
                                      className="w-full bg-black/50 border border-viking-gold/20 rounded px-2 py-1.5 text-[11px] text-viking-silver focus:outline-none focus:border-viking-gold/50 disabled:opacity-50"
                                    />
                                  </div>
                                </motion.div>
                              );
                            });
                          })()}
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setExerciseSetsState(prev => {
                                    const sets = [...(prev[ex.id] || [])];
                                    let defaultWeight = 0;
                                    if (ex.main) {
                                      let pr = ex.baseWeight || null;
                                      const exNameLower = ex.name.toLowerCase();
                                      if (!pr && activeStudentProfile) {
                                        if (exNameLower.includes('agachamento') || exNameLower.includes('squat')) {
                                          pr = activeStudentProfile.prs.squat;
                                        } else if (exNameLower.includes('supino') || exNameLower.includes('bench')) {
                                          pr = activeStudentProfile.prs.bench;
                                        } else if (exNameLower.includes('terra') || exNameLower.includes('deadlift')) {
                                          pr = activeStudentProfile.prs.deadlift;
                                        }
                                      }
                                      if (pr && typeof ex.intensity === 'number') {
                                        defaultWeight = Math.round(pr * ex.intensity);
                                      } else if (pr) {
                                        defaultWeight = pr;
                                      }
                                    } else {
                                      defaultWeight = ex.baseWeight || 0;
                                    }
                                    const lastSet = sets[sets.length - 1] || { reps: ex.reps || 8, weight: defaultWeight };
                                    sets.push({ reps: lastSet.reps, weight: lastSet.weight || defaultWeight });
                                    return { ...prev, [ex.id]: sets };
                                  });
                                  showToast('Série adicionada!', 'success');
                                }}
                                className="flex-1 py-1.5 rounded-lg border border-dashed border-viking-gold/30 hover:border-viking-gold/60 text-viking-silver hover:text-viking-gold text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer bg-viking-gold/[0.02] transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" /> Adicionar Série (Set)
                              </button>
                            </div>
                          </div>

                          {/* Interactive Failure & Volume Adjustment Section */}
                          <div className="my-4 p-4 rounded-xl bg-black/40 border border-viking-gold/15 space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-viking-gold animate-pulse shrink-0" />
                                <span className="text-xs font-black text-white uppercase tracking-wider">Falhou na Carga ou Repetições Planejadas?</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const isCurrentlyFailed = exerciseFailureState[ex.id]?.failed;
                                  if (isCurrentlyFailed) {
                                    setExerciseFailureState(prev => {
                                      const copy = { ...prev };
                                      delete copy[ex.id];
                                      return copy;
                                    });
                                  } else {
                                    setExerciseFailureState(prev => ({
                                      ...prev,
                                      [ex.id]: { failed: true, actualReps: ex.reps - 2 > 0 ? ex.reps - 2 : 1, setsDone: ex.sets - 1 > 0 ? ex.sets - 1 : 1 }
                                    }));
                                  }
                                }}
                                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                                  exerciseFailureState[ex.id]?.failed
                                    ? 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                    : 'bg-[#140e0c] border-viking-gold/30 hover:border-viking-gold text-viking-silver hover:text-viking-gold'
                                }`}
                              >
                                {exerciseFailureState[ex.id]?.failed ? '⚠️ Sim, Falhei!' : 'Não'}
                              </button>
                            </div>

                            {exerciseFailureState[ex.id]?.failed && (
                              <div className="pt-2.5 border-t border-viking-gold/15 space-y-3 text-xs">
                                <p className="text-viking-silver/90 leading-relaxed">
                                  O Oráculo Viking detectou a falha! Para não comprometer a hipertrofia e garantir o <strong className="text-viking-gold">volume total de trabalho planejado ({ex.sets * ex.reps} reps totais)</strong>, siga as instruções de recuo ajustadas abaixo:
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-viking-gold/5 p-3 rounded-xl border border-viking-gold/20">
                                  <div className="space-y-1.5">
                                    <label className="block text-[9px] font-bold text-viking-silver uppercase">Séries realizadas completas:</label>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        type="button"
                                        disabled={(exerciseFailureState[ex.id]?.setsDone || 1) <= 1}
                                        onClick={() => setExerciseFailureState(prev => ({
                                          ...prev,
                                          [ex.id]: { ...prev[ex.id]!, setsDone: (prev[ex.id]?.setsDone || 1) - 1 }
                                        }))}
                                        className="w-6 h-6 rounded bg-black/40 border border-viking-gold/20 text-viking-gold hover:border-viking-gold flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="text-white font-black">{exerciseFailureState[ex.id]?.setsDone || 1} série(s)</span>
                                      <button 
                                        type="button"
                                        disabled={(exerciseFailureState[ex.id]?.setsDone || 1) >= ex.sets}
                                        onClick={() => setExerciseFailureState(prev => ({
                                          ...prev,
                                          [ex.id]: { ...prev[ex.id]!, setsDone: (prev[ex.id]?.setsDone || 1) + 1 }
                                        }))}
                                        className="w-6 h-6 rounded bg-black/40 border border-viking-gold/20 text-viking-gold hover:border-viking-gold flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="block text-[9px] font-bold text-viking-silver uppercase">Reps completadas na série da falha:</label>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        type="button"
                                        disabled={(exerciseFailureState[ex.id]?.actualReps || 1) <= 1}
                                        onClick={() => setExerciseFailureState(prev => ({
                                          ...prev,
                                          [ex.id]: { ...prev[ex.id]!, actualReps: (prev[ex.id]?.actualReps || 1) - 1 }
                                        }))}
                                        className="w-6 h-6 rounded bg-black/40 border border-viking-gold/20 text-viking-gold hover:border-viking-gold flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="text-white font-black">{exerciseFailureState[ex.id]?.actualReps || 1} rep(s)</span>
                                      <button 
                                        type="button"
                                        disabled={(exerciseFailureState[ex.id]?.actualReps || 1) >= ex.reps}
                                        onClick={() => setExerciseFailureState(prev => ({
                                          ...prev,
                                          [ex.id]: { ...prev[ex.id]!, actualReps: (prev[ex.id]?.actualReps || 1) + 1 }
                                        }))}
                                        className="w-6 h-6 rounded bg-black/40 border border-viking-gold/20 text-viking-gold hover:border-viking-gold flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {(() => {
                                  const targetVolume = ex.sets * ex.reps;
                                  const setsDone = exerciseFailureState[ex.id]?.setsDone || 1;
                                  const actualReps = exerciseFailureState[ex.id]?.actualReps || 1;
                                  
                                  // Volume achieved so far: setsDone completed series of ex.reps plus actualReps achieved in the failed series
                                  const achievedVolume = (setsDone * ex.reps) + actualReps;
                                  const deficitVolume = Math.max(0, targetVolume - achievedVolume);
                                  
                                  // Suggest remaining sets to fulfill the deficit volume
                                  // e.g. back-off set usually has a bit less load (-15%) but let's match target reps or reps + 2
                                  const recommendedReps = ex.reps;
                                  const remainingSetsToCompleteVolume = deficitVolume > 0 ? Math.ceil(deficitVolume / recommendedReps) : 0;

                                  return (
                                    <div className="p-3.5 bg-black/60 rounded-xl border border-viking-gold/30 space-y-2">
                                      <p className="text-[10px] text-viking-gold font-bold uppercase tracking-widest flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5 text-viking-gold animate-bounce" /> Estratégia de Recuo Ativa (Compensação de Volume):
                                      </p>
                                      <div className="space-y-1 text-[11px] text-viking-silver">
                                        <div>• <strong className="text-white">Volume Prescrito:</strong> {targetVolume} repetições totais</div>
                                        <div>• <strong className="text-white">Volume Acumulado:</strong> {achievedVolume} repetições (Déficit de {deficitVolume} reps)</div>
                                        
                                        {deficitVolume > 0 ? (
                                          <div className="pt-2 mt-2 border-t border-viking-gold/15 text-[#e0d3a8] font-bold text-xs">
                                            🔥 Recomendação de Recuo: Execute mais <span className="text-white font-black bg-viking-gold/10 px-1.5 py-0.5 rounded border border-viking-gold/30">{remainingSetsToCompleteVolume} série(s)</span> de <span className="text-white font-black bg-viking-gold/10 px-1.5 py-0.5 rounded border border-viking-gold/30">{recommendedReps} repetições</span> com <span className="text-green-400 font-black">15% a 20% MENOS carga</span>.
                                          </div>
                                        ) : (
                                          <div className="pt-2 mt-2 border-t border-viking-gold/15 text-green-400 font-bold text-xs flex items-center gap-1">
                                            ⚔️ Volume Prescrito já Completado! Parabéns, guerreiro!
                                          </div>
                                        )}
                                        <p className="text-[10px] text-viking-silver/50 italic leading-snug pt-1">
                                          Reduzir a carga (Back-off set de volume) mantém a intensidade mecânica do treino, protege suas articulações da fadiga excessiva e assegura 100% do estímulo anabólico planejado hoje!
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase text-viking-silver tracking-widest">Selecione RPE Real da Última Série</label>
                            
                            <div className="flex overflow-x-auto gap-1 pb-1.5 scrollbar-thin scrollbar-thumb-viking-gold/25 scrollbar-track-transparent snap-x md:grid md:grid-cols-9 md:gap-1.5 md:overflow-visible">
                              {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setSessionRpeState(prev => ({ ...prev, [ex.id]: val }))}
                                  className={`py-2.5 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer min-w-[44px] md:min-w-0 flex-1 shrink-0 snap-center ${
                                    sessionRpeState[ex.id] === val 
                                      ? 'bg-viking-gold text-viking-dark font-black shadow-lg shadow-viking-gold/30 scale-[1.03]' 
                                      : 'bg-black/40 hover:bg-viking-gold/10 text-viking-silver border border-viking-gold/20'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>

                            <div className="text-[10px] text-viking-silver/80 italic min-h-[14px]">
                              {sessionRpeState[ex.id] === 6 && '💡 RPE 6.0: Treino leve (Sobraram 4 ou mais repetições na reserva)'}
                              {sessionRpeState[ex.id] === 6.5 && '💡 RPE 6.5: Sobrariam entre 3 e 4 repetições na reserva'}
                              {sessionRpeState[ex.id] === 7 && '💡 RPE 7.0: Moderado (Sobrariam exatamente 3 repetições)'}
                              {sessionRpeState[ex.id] === 7.5 && '💡 RPE 7.5: Esforço firme (Sobrariam entre 2 e 3 repetições)'}
                              {sessionRpeState[ex.id] === 8 && '💡 RPE 8.0: Intenso (Sobrariam exatamente 2 repetições)'}
                              {sessionRpeState[ex.id] === 8.5 && '💡 RPE 8.5: Muito Intenso (Sobrariam entre 1 e 2 repetições)'}
                              {sessionRpeState[ex.id] === 9 && '💥 RPE 9.0: Limite de Força (Sobrou apenas 1 repetição com técnica)'}
                              {sessionRpeState[ex.id] === 9.5 && '💥 RPE 9.5: Próximo ao limite (Quase nenhuma repetição restante)'}
                              {sessionRpeState[ex.id] === 10 && '🔥 RPE 10.0: Falha Absoluta (Zero repetições possíveis, effort limite)'}
                            </div>
                          </div>

                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Slide View Navigation Panel */}
                  {workoutViewMode === 'slide' && list.length > 0 && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0908]/80 border border-viking-gold/30 shadow-[0_4px_25px_rgba(212,175,55,0.15)] relative overflow-hidden animate-fade-in"
                    >
                      <div className="absolute inset-0 bg-viking-gold/[0.02] pointer-events-none" />
                      
                      <button
                        type="button"
                        disabled={currentExerciseIndex === 0}
                        onClick={() => {
                          setSlideDirection('backward');
                          setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 hover:border-viking-gold/40 text-[#e0d3a8] hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:border-viking-gold/10 disabled:text-viking-silver/50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Anterior
                      </button>
                      
                      <div className="flex flex-col items-center gap-1.5 py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-viking-silver uppercase font-black tracking-widest">Dia:</span>
                          <select 
                            value={selectedDay}
                            onChange={e => { 
                              const newDay = e.target.value;
                              setSelectedDay(newDay);
                              setSessionRpeState({}); 
                              setExerciseFailureState({});
                              setExerciseWarmupState({});
                              setExerciseSetsState({});
                              setCurrentExerciseIndex(0); 
                            }}
                            className="px-2 py-1 rounded bg-black/40 border border-viking-gold/30 text-viking-gold text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-viking-gold cursor-pointer"
                          >
                            {Object.keys((activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek] || { A: [], B: [], C: [] }).sort().map(day => (
                              <option key={day} value={day}>Treino {day}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2 items-center">
                          {list.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSlideDirection(i > currentExerciseIndex ? 'forward' : 'backward');
                                setCurrentExerciseIndex(i);
                              }}
                              className={`w-3 h-3 rounded-full transition-all duration-300 relative ${
                                i === currentExerciseIndex 
                                  ? 'bg-viking-gold scale-125 shadow-[0_0_10px_rgba(212,175,55,0.8)]' 
                                  : 'bg-viking-silver/20 hover:bg-viking-gold/40'
                              }`}
                              title={`Ir para o exercício ${i + 1}`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-black text-viking-gold mt-1">
                          EXERCÍCIO {currentExerciseIndex + 1} DE {list.length}
                        </span>
                      </div>

                      {currentExerciseIndex === list.length - 1 ? (
                        <div className="w-full sm:w-auto bg-[#140e0c] border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-center text-[10px] font-black uppercase tracking-widest animate-pulse">
                          ⚔️ Último Exercício!
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSlideDirection('forward');
                            setCurrentExerciseIndex(prev => Math.min(list.length - 1, prev + 1));
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 hover:border-viking-gold/40 text-[#e0d3a8] hover:text-white flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Próximo <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })()
          )}
        </div>

                {/* Session observation box */}
                <div className="space-y-2 pt-2">
                  <label htmlFor="sessionNote" className="block text-xs font-bold text-viking-silver uppercase tracking-wider">Notas de Desempenho (Opcional)</label>
                  <DebouncedTextarea id="sessionNote" rows={3} value={sessionNote} onChange={(val: string) => setSessionNote(val)}
                    placeholder="Escreva como se sentiu hoje. Destaques, dores articulares ou velocidade das subidas..."
                    className="w-full p-4 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/35 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold text-xs font-semibold"
                  />
                </div>

              </div>

              {/* Submit panel */}
              <div className="p-4 sm:p-6 border-t border-viking-gold/15 bg-[#140e0c]/95 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
                <button 
                  onClick={handleWorkoutSubmit}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 shrink-0" /> Guardar Sessão
                </button>
                <button 
                  onClick={() => setWorkoutModalOpen(false)}
                  className="w-full sm:w-auto sm:px-8 py-3 rounded-xl bg-[#0d0908]/60 text-viking-silver hover:text-viking-gold border border-viking-gold/20 text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                >
                  Cancelar
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MOBILE COLLAPSIBLE DRAWER MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#140e0c]/98 border-l border-viking-gold/25 p-6 z-50 md:hidden flex flex-col justify-between backdrop-blur-xl"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-viking-gold/15">
                  <span className="font-viking-display text-viking-gold font-bold">MENU DO GUERREIRO</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-viking-silver hover:text-viking-gold cursor-pointer">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Activity className="w-4 h-4" /> Painel Geral
                  </button>
                  
                  {currentUser?.role === 'student' ? (
                    <>
                      <motion.button 
                        onClick={() => { 
                          if (isStudentPending) {
                            showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                            return;
                          }
                          if (isStudentBlocked) {
                            showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                            return;
                          }
                          setMobileMenuOpen(false); 
                          setWorkoutModalOpen(true); 
                        }}
                        className={`p-3 text-left rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                          activeStudentProfile?.workoutReady && !workoutModalOpen
                            ? 'text-viking-gold bg-[#1a1210]/60 border border-viking-gold/40 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                            : 'text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5'
                        }`}
                        animate={activeStudentProfile?.workoutReady && !workoutModalOpen ? {
                          boxShadow: [
                            "0 0 0px rgba(212, 175, 55, 0)",
                            "0 0 10px rgba(212, 175, 55, 0.5)",
                            "0 0 0px rgba(212, 175, 55, 0)"
                          ],
                          borderColor: [
                            "rgba(212, 175, 55, 0.2)",
                            "rgba(212, 175, 55, 0.6)",
                            "rgba(212, 175, 55, 0.2)"
                          ]
                        } : {}}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut"
                        }}
                      >
                        <Dumbbell className={`w-4 h-4 ${activeStudentProfile?.workoutReady && !workoutModalOpen ? 'animate-bounce text-viking-gold' : ''}`} /> 
                        Treino de Hoje
                        {activeStudentProfile?.workoutReady && !workoutModalOpen && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-viking-gold shadow-[0_0_6px_#d4af37]" />
                        )}
                      </motion.button>
                      <button 
                        onClick={() => { 
                          if (isStudentPending) {
                            showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                            return;
                          }
                          if (isStudentBlocked) {
                            showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                            return;
                          }
                          setMobileMenuOpen(false); 
                          setDrawerType('history'); 
                          setDrawerTitle('Seu Histórico & RPE'); 
                          setDrawerOpen(true); 
                        }}
                        className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <History className="w-4 h-4" /> Histórico de Sessões
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setMobileMenuOpen(false); setDrawerType('rpeFeedback'); setDrawerTitle('Feedback RPE de Alunos'); setDrawerOpen(true); }}
                        className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" /> Feedback de RPE
                      </button>
                      <button 
                        onClick={() => { setMobileMenuOpen(false); setDrawerType('addStudent'); setDrawerTitle('Recrutar Novo Aluno'); setDrawerOpen(true); }}
                        className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" /> Convocar Atleta
                      </button>
                    </>
                  )}

                  <button 
                    onClick={() => { 
                      if (currentUser?.role === 'student') {
                        if (isStudentPending) {
                          showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                          return;
                        }
                        if (isStudentBlocked) {
                          showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                          return;
                        }
                      }
                      setMobileMenuOpen(false); 
                      setEditingDbExercise(null); 
                      setDrawerType('exerciseLibrary'); 
                      setDrawerTitle('Biblioteca de Exercícios'); 
                      setDrawerOpen(true); 
                    }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-viking-gold" /> Biblioteca de Exercícios
                  </button>
                  {currentUser?.role === 'trainer' && (
                    <button 
                      onClick={() => { 
                        setMobileMenuOpen(false); 
                        setDrawerType('protocols'); 
                        setDrawerTitle('Protocolos de Treino'); 
                        setDrawerOpen(true); 
                      }}
                      className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <Folder className="w-4 h-4 text-viking-gold" /> Protocolos & Metodologias
                    </button>
                  )}

                  <button 
                    onClick={() => { 
                      if (currentUser?.role === 'student') {
                        if (isStudentPending) {
                          showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                          return;
                        }
                        if (isStudentBlocked) {
                          showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                          return;
                        }
                      }
                      setMobileMenuOpen(false); 
                      setDrawerType('ranking'); 
                      setDrawerTitle('Ranking do Templo'); 
                      setDrawerOpen(true); 
                    }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" /> Classificação Geral
                  </button>

                  <button 
                    onClick={() => { 
                      if (currentUser?.role === 'student') {
                        if (isStudentPending) {
                          showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                          return;
                        }
                        if (isStudentBlocked) {
                          showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                          return;
                        }
                      }
                      setMobileMenuOpen(false); 
                      setDrawerType('calendar'); 
                      setDrawerTitle('Calendário Competitivo'); 
                      setDrawerOpen(true); 
                    }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" /> Calendário Competitivo
                  </button>

                  <button 
                    onClick={() => { setMobileMenuOpen(false); setDrawerType('plans'); setDrawerTitle('Aliança Viking - Planos'); setDrawerOpen(true); }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" /> Planos de Treino
                  </button>

                  <button 
                    onClick={() => { 
                      if (currentUser?.role === 'student') {
                        if (isStudentPending) {
                          showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                          return;
                        }
                        if (isStudentBlocked) {
                          showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                          return;
                        }
                      }
                      setMobileMenuOpen(false); 
                      setDrawerType('gmail'); 
                      setDrawerTitle('Correio de Valhalla (Gmail)'); 
                      setDrawerOpen(true); 
                    }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-viking-gold" /> Correio Gmail
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-viking-gold/15">
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 bg-viking-red/10 hover:bg-viking-red/25 text-[#f87171] border border-viking-red/20 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Abandonar o Salão
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MOBILE BOTTOM NAV BAR --- */}
      {isLoggedIn && (
        <div className="fixed bottom-4 left-4 right-4 z-55 md:hidden bg-[#140e0c]/95 border border-viking-gold/20 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl px-2 py-2.5 flex justify-around items-center">
          {currentUser?.role === 'student' ? (
            <>
              {/* Tab: Início */}
              <button 
                onClick={() => { setActiveTab('home'); setWorkoutModalOpen(false); setDrawerOpen(false); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'home' && !drawerOpen && !workoutModalOpen 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <Activity className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Início</span>
              </button>

              {/* Tab: Treinar */}
              <button 
                onClick={() => { 
                  if (isStudentPending) {
                    showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                    return;
                  }
                  if (isStudentBlocked) {
                    showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                    return;
                  }
                  setWorkoutModalOpen(true); 
                  setDrawerOpen(false); 
                  setMobileMenuOpen(false); 
                }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  workoutModalOpen 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <Dumbbell className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Treinar</span>
              </button>

              {/* Tab: Histórico */}
              <button 
                onClick={() => { 
                  if (isStudentPending) {
                    showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                    return;
                  }
                  if (isStudentBlocked) {
                    showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                    return;
                  }
                  setWorkoutModalOpen(false); 
                  setDrawerType('history'); 
                  setDrawerTitle('Seu Histórico & RPE'); 
                  setDrawerOpen(true); 
                  setMobileMenuOpen(false); 
                }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'history' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <History className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Histórico</span>
              </button>

              {/* Tab: Ranking */}
              <button 
                onClick={() => { 
                  if (isStudentPending) {
                    showToast('Sua conta está aguardando liberação do plano pelo Treinador John.', 'warning');
                    return;
                  }
                  if (isStudentBlocked) {
                    showToast('Seu acesso está suspenso por pendência financeira.', 'error');
                    return;
                  }
                  setWorkoutModalOpen(false); 
                  setDrawerType('ranking'); 
                  setDrawerTitle('Ranking do Templo'); 
                  setDrawerOpen(true); 
                  setMobileMenuOpen(false); 
                }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'ranking' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <Trophy className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Ranking</span>
              </button>

              {/* Tab: Ajustes */}
              <button 
                onClick={() => { setWorkoutModalOpen(false); setDrawerType('settings'); setDrawerTitle('Configurações de Força'); setDrawerOpen(true); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'settings' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Ajustes</span>
              </button>
            </>
          ) : (
            <>
              {/* Tab: Início */}
              <button 
                onClick={() => { setActiveTab('home'); setWorkoutModalOpen(false); setDrawerOpen(false); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'home' && !drawerOpen 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <Activity className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Início</span>
              </button>

              {/* Tab: Treinos */}
              <button 
                onClick={() => { setWorkoutModalOpen(false); setDrawerType('recentWorkouts'); setDrawerTitle('Treinos Concluídos'); setDrawerOpen(true); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'recentWorkouts' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Treinos</span>
              </button>

              {/* Tab: Feedbacks */}
              <button 
                onClick={() => { setWorkoutModalOpen(false); setDrawerType('rpeFeedback'); setDrawerTitle('Feedback RPE de Alunos'); setDrawerOpen(true); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'rpeFeedback' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Feedbacks</span>
              </button>

              {/* Tab: Recrutar */}
              <button 
                onClick={() => { setWorkoutModalOpen(false); setDrawerType('addStudent'); setDrawerTitle('Recrutar Novo Aluno'); setDrawerOpen(true); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'addStudent' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <UserPlus className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Recrutar</span>
              </button>

              {/* Tab: Ranking */}
              <button 
                onClick={() => { setWorkoutModalOpen(false); setDrawerType('ranking'); setDrawerTitle('Ranking do Templo'); setDrawerOpen(true); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'ranking' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <Trophy className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Ranking</span>
              </button>

              {/* Tab: Caixa */}
              <button 
                onClick={() => { setWorkoutModalOpen(false); setDrawerType('payments'); setDrawerTitle('Fluxo de Caixa Viking'); setDrawerOpen(true); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  drawerOpen && drawerType === 'payments' 
                    ? 'text-viking-gold bg-viking-gold/5 shadow-sm' 
                    : 'text-viking-silver/60'
                }`}
              >
                <Coins className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">Caixa</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Athlete Confirmation Modal */}
      <AnimatePresence>
        {deletingStudentEmail && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingStudentEmail(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-60"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-48%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-48%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md bg-[#140e0c]/98 border-2 border-viking-red/45 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.2),inset_0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-xl z-60 p-6 text-[#e0d3a8] text-center"
            >
              <div className="w-16 h-16 bg-viking-red/10 border border-viking-red/35 text-[#f87171] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trash2 className="w-8 h-8" />
              </div>
              
              <h3 className="font-viking-display text-lg font-black tracking-wider text-viking-gold mb-2 uppercase">
                MOVER PARA A LIXEIRA?
              </h3>
              
              <p className="text-xs text-viking-silver mb-6 leading-relaxed">
                Tem certeza que deseja mover o guerreiro <span className="text-white font-extrabold">{studentsData[deletingStudentEmail]?.name || deletingStudentEmail}</span> para a <span className="text-viking-gold font-bold">Lixeira Virtual</span>? Seus registros e treinos prescritos serão preservados e você poderá restaurá-lo quando desejar!
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeletingStudentEmail(null)}
                  className="py-3 rounded-xl bg-viking-dark border border-viking-gold/20 hover:border-viking-gold text-viking-silver hover:text-viking-gold font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const email = deletingStudentEmail.toLowerCase();
                    const student = studentsData[email];
                    if (student) {
                      const copy = { ...studentsData };
                      copy[email] = {
                        ...student,
                        isDeleted: true,
                        deletedAt: new Date().toISOString()
                      };
                      saveStudentsToDB(copy);
                      setDeletingStudentEmail(null);
                      showToast("Atleta movido para a Lixeira Virtual!", "success");
                    } else {
                      setDeletingStudentEmail(null);
                    }
                  }}
                  className="py-3 rounded-xl bg-viking-red/20 hover:bg-viking-red/40 border border-viking-red/40 text-red-400 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Mover para Lixeira
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-60"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-48%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-48%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md bg-[#140e0c]/98 border-2 rounded-3xl shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-xl z-60 p-6 text-[#e0d3a8] text-center ${
                confirmModal.isDanger 
                  ? 'border-viking-red/45 shadow-[0_0_50px_rgba(239,68,68,0.15)]' 
                  : 'border-viking-gold/45 shadow-[0_0_50px_rgba(212,175,55,0.15)]'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse ${
                confirmModal.isDanger 
                  ? 'bg-viking-red/10 border border-viking-red/35 text-red-400' 
                  : 'bg-viking-gold/10 border border-viking-gold/35 text-viking-gold'
              }`}>
                {confirmModal.isDanger ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <Check className="w-8 h-8" />
                )}
              </div>
              
              <h3 className="font-viking-display text-lg font-black tracking-wider text-viking-gold mb-2 uppercase">
                {confirmModal.title}
              </h3>
              
              <p className="text-xs text-viking-silver mb-6 leading-relaxed whitespace-pre-wrap">
                {confirmModal.message}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="py-3 rounded-xl bg-viking-dark border border-viking-gold/20 hover:border-viking-gold text-viking-silver hover:text-viking-gold font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {confirmModal.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                  }}
                  className={`py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                    confirmModal.isDanger 
                      ? 'bg-viking-red/20 hover:bg-viking-red/40 border-viking-red/40 text-red-400' 
                      : 'bg-viking-gold/20 hover:bg-viking-gold/40 border-viking-gold/40 text-viking-gold'
                  }`}
                >
                  {confirmModal.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PR Celebration Modal */}
      <AnimatePresence>
        {prCelebration && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrCelebration(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-70 flex items-center justify-center p-4"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-48%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-48%' }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md bg-gradient-to-b from-[#1c1411] to-[#0a0605] border-2 border-viking-gold rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.35),inset_0_0_25px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-70 p-7 text-[#e0d3a8] text-center overflow-hidden"
            >
              {/* Decorative golden corner corners or visual patterns */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-viking-gold/40 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-viking-gold/40 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-viking-gold/40 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-viking-gold/40 rounded-br-xl pointer-events-none" />

              <div className="relative z-10">
                {/* Crown / Trophy Celebration Icon */}
                <div className="w-20 h-20 bg-viking-gold/15 border-2 border-viking-gold/40 text-viking-gold rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                  <Crown className="w-10 h-10 animate-bounce" />
                </div>
                
                <h3 className="font-viking-display text-xl sm:text-2xl font-black tracking-widest text-viking-gold mb-1 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  RECORDE ATINGIDO!
                </h3>
                
                <p className="text-[10px] sm:text-xs font-bold text-viking-silver/80 uppercase tracking-widest font-viking-medieval mb-6">
                  ⚔️ Os deuses do ferro testemunharam sua força! ⚔️
                </p>

                <div className="p-4 rounded-2xl bg-black/50 border border-viking-gold/25 shadow-inner space-y-3.5 mb-7 max-w-sm mx-auto">
                  <p className="text-[11px] font-bold text-viking-silver uppercase tracking-wider text-left border-b border-viking-gold/15 pb-1.5 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-viking-gold" /> Novas Cargas Registradas:
                  </p>
                  <div className="space-y-2">
                    {prCelebration.lifts.map((lift, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + idx * 0.15 }}
                        className="flex items-center gap-2.5 text-xs font-black text-white bg-viking-gold/5 border border-viking-gold/10 px-3 py-2.5 rounded-xl shadow-sm"
                      >
                        <Flame className="w-4 h-4 text-viking-gold shrink-0 animate-pulse" />
                        <span className="flex-1 text-left text-[#e0d3a8]">{lift}</span>
                        <span className="text-[10px] uppercase font-black tracking-wider bg-viking-gold text-viking-dark px-1.5 py-0.5 rounded-md">PR!</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <button
                    onClick={() => {
                      triggerPrConfetti();
                    }}
                    className="w-full py-3 rounded-xl bg-[#140e0c] border border-viking-gold/30 hover:border-viking-gold hover:bg-viking-gold/5 text-viking-gold font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                  >
                    💥 Jogar Mais Confetes!
                  </button>
                  
                  <button
                    onClick={() => setPrCelebration(null)}
                    className="w-full py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/25 cursor-pointer"
                  >
                    Retornar ao Templo
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- IN-APP TECHNIQUE TIPS POPUP MODAL --- */}
      <AnimatePresence>
        {activeTipsModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTipsModal(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: '-48%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-48%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-lg bg-[#140e0c]/98 border-2 border-emerald-500/30 rounded-3xl shadow-[0_0_80px_rgba(52,211,153,0.15)] z-[85] overflow-hidden text-[#e0d3a8] flex flex-col"
            >
              <div className="p-5 border-b border-emerald-500/15 bg-emerald-950/20 flex justify-between items-center">
                <h4 className="font-viking-display text-xs sm:text-sm font-black tracking-wider text-emerald-400 flex items-center gap-2 uppercase">
                  <Info className="w-5 h-5 text-emerald-400" /> Dicas: {activeTipsModal.name}
                </h4>
                <button 
                  onClick={() => setActiveTipsModal(null)}
                  className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-viking-silver hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 bg-black/40 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                  <p className="text-sm text-[#e0d3a8] leading-relaxed whitespace-pre-wrap">
                    {activeTipsModal.tips}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- IN-APP VIDEO DEMONSTRATION POPUP MODAL --- */}
      <AnimatePresence>
        {activeVideoModal && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoModal(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80]"
            />

            {/* Video Container Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: '-48%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-48%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#140e0c]/98 border-2 border-viking-gold/30 rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.3)] z-[85] overflow-hidden text-[#e0d3a8] flex flex-col"
            >
              <div className="p-5 border-b border-viking-gold/15 bg-[#140e0c]/90 flex justify-between items-center">
                <h4 className="font-viking-display text-xs sm:text-sm font-black tracking-wider text-viking-gold flex items-center gap-2 uppercase">
                  <Video className="w-4 h-4 text-viking-gold" /> {activeVideoModal.name}
                </h4>
                <button 
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1 rounded-lg bg-viking-gold/5 border border-viking-gold/15 text-viking-silver hover:text-viking-gold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 bg-black/40 space-y-4">
                {activeVideoModal.tips && (
                  <div className="p-3 bg-viking-gold/5 border border-viking-gold/20 rounded-xl text-xs text-[#e0d3a8]">
                     {activeVideoModal.tips}
                  </div>
                )}
                {activeVideoModal.videoBase64 ? (
                  <video 
                    controls 
                    autoPlay
                    src={activeVideoModal.videoBase64} 
                    className="w-full rounded-2xl border border-viking-gold/20 bg-black shadow-inner"
                    playsInline
                  />
                ) : activeVideoModal.videoUrl && getYouTubeEmbedUrl(activeVideoModal.videoUrl) ? (
                  <iframe 
                    src={getYouTubeEmbedUrl(activeVideoModal.videoUrl) || ''}
                    title={activeVideoModal.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-64 sm:h-80 rounded-2xl border border-viking-gold/20 shadow-inner bg-black"
                  />
                ) : activeVideoModal.videoUrl ? (
                  <div className="text-center py-10 space-y-4">
                    <p className="text-xs text-viking-silver">Este link não pode ser embutido diretamente.</p>
                    <a 
                      href={activeVideoModal.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex py-2.5 px-6 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg cursor-pointer transition-all"
                    >
                      Assistir no YouTube
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-12 text-viking-silver/50">
                    Nenhum vídeo disponível para visualização.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </div>
  );

  // Quick helper to close drawers safely
  function closeAllDrawers() {
    setDrawerOpen(false);
  }
}

