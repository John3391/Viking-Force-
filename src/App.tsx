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
  MessageSquare,
  AlertTriangle,
  Info,
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
  Upload,
  Zap
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { User as UserType, TrainingProgram, StudentProfile, LoggedSession, Exercise, WarmupStep, VikingPlan, ChatMessage, GymLeaderboardEntry, DbExercise } from './types';
import { DEFAULT_PROGRAM, DEFAULT_STUDENTS } from './data';
import { 
  fetchStudentsFromFirebase, 
  saveStudentToFirebase, 
  deleteStudentFromFirebase, 
  fetchProgramFromFirebase, 
  saveProgramToFirebase, 
  fetchPlansFromFirebase, 
  savePlansToFirebase,
  fetchDbExercisesFromFirebase,
  saveDbExerciseToFirebase,
  deleteDbExerciseFromFirebase,
  auth,
  subscribeStudents
} from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import VolumeChart from './components/VolumeChart';
import OneRepMaxChart from './components/OneRepMaxChart';
import WilksScatterChart from './components/WilksScatterChart';
import FailureSentinel from './components/FailureSentinel';
import PatentTimeline from './components/PatentTimeline';
import WeeklyVolumeLineChart from './components/WeeklyVolumeLineChart';

const TRAINER_EMAIL = 'john.vasquesrodrigues@gmail.com';
const TRAINER_PASSWORD = '3636';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
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

  // App core database state
  const [trainingProgram, setTrainingProgram] = useState<TrainingProgram>(DEFAULT_PROGRAM);
  const [studentsData, setStudentsData] = useState<Record<string, StudentProfile>>(DEFAULT_STUDENTS);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Active UI Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [studentSubTab, setStudentSubTab] = useState<'overview' | 'wilks'>('overview');
  const [wilksRatios, setWilksRatios] = useState({ squat: 38, bench: 24, deadlift: 38 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Reuseable Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState<string>('');
  const [drawerType, setDrawerType] = useState<string>(''); // 'history' | 'ranking' | 'plans' | 'settings' | 'addStudent' | 'whatsapp' | 'payments' | 'rpeFeedback' | 'editProgram'
  const [editingStudentEmail, setEditingStudentEmail] = useState<string>('');
  const [activeChatStudentEmail, setActiveChatStudentEmail] = useState<string>('');
  const [chatMessageInput, setChatMessageInput] = useState<string>('');
  const [activeNoteStudentEmail, setActiveNoteStudentEmail] = useState<string>('');
  const [publicNoteInput, setPublicNoteInput] = useState<string>('');

  // Gmail states
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [gmailTab, setGmailTab] = useState<'inbox' | 'compose' | 'broadcast'>('inbox');
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [loadingGmail, setLoadingGmail] = useState<boolean>(false);

  // Active workout modal state (Student)
  const [workoutModalOpen, setWorkoutModalOpen] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>('A');
  const [sessionRpeState, setSessionRpeState] = useState<Record<string, number>>({});
  const [exerciseFailureState, setExerciseFailureState] = useState<Record<string, { failed: boolean; actualReps: number; setsDone: number }>>({});
  const [sessionNote, setSessionNote] = useState<string>('');

  // Program Editor state (Trainer)
  const [editorWeek, setEditorWeek] = useState<number>(1);
  const [editorDay, setEditorDay] = useState<string>('A');
  const [editorExercises, setEditorExercises] = useState<Exercise[]>([]);
  const [editorSearchQuery, setEditorSearchQuery] = useState<string>('');

  // Toast notification stack
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Search filter state for Trainer dashboard
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [whatsappSearch, setWhatsappSearch] = useState<string>('');
  const [paymentsSearch, setPaymentsSearch] = useState<string>('');
  const [rpeSearch, setRpeSearch] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending_or_overdue'>('all');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Delete Athlete state (Trainer)
  const [deletingStudentEmail, setDeletingStudentEmail] = useState<string | null>(null);

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

  // PR Celebration state (Student)
  const [prCelebration, setPrCelebration] = useState<{ lifts: string[] } | null>(null);

  // Exercises Database state
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);
  const [dbExercisesLoading, setDbExercisesLoading] = useState<boolean>(false);
  const [editingDbExercise, setEditingDbExercise] = useState<DbExercise | null>(null);
  const [dbExerciseSearch, setDbExerciseSearch] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ name: string; videoUrl?: string; videoBase64?: string } | null>(null);

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

  useEffect(() => {
    localStorage.setItem('viking_plans', JSON.stringify(vikingPlans));
  }, [vikingPlans]);

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

  // --- LOCALSTORAGE & FIREBASE SYNC ---
  useEffect(() => {
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || '').trim().toLowerCase();
        const isTrainer = email === TRAINER_EMAIL;
        
        // Ensure state and localstorage match current authenticated user
        const storedUserObj = localStorage.getItem('viking_current_user');
        let name = isTrainer ? 'John Vasques' : (email.split('@')[0]);
        if (storedUserObj) {
          try {
            const parsed = JSON.parse(storedUserObj);
            if (parsed.email === email && parsed.name) {
              name = parsed.name;
            }
          } catch (e) {}
        }
        
        const userObj: UserType = {
          name: name,
          email: email,
          role: isTrainer ? 'trainer' : 'student'
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
          unsubscribeStudents = subscribeStudents((remoteStudents) => {
            if (remoteStudents && Object.keys(remoteStudents).length > 0) {
              setStudentsData(remoteStudents);
              localStorage.setItem('viking_students', JSON.stringify(remoteStudents));
            }
          });
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

        setIsOnline(syncSuccess);
      } else {
        // Not signed in to Firebase Auth
        setIsOnline(false);
        if (unsubscribeStudents) {
          unsubscribeStudents();
          unsubscribeStudents = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeStudents) {
        unsubscribeStudents();
      }
    };
  }, []);

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
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
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
      
      const squatVal = profile.prs.squat ? `${profile.prs.squat} kg` : 'Não registrado';
      const benchVal = profile.prs.bench ? `${profile.prs.bench} kg` : 'Não registrado';
      const deadliftVal = profile.prs.deadlift ? `${profile.prs.deadlift} kg` : 'Não registrado';
      
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
      
      if (profile.sessions.length === 0) {
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
          doc.text(`RPE Médio: ${sess.avgRPE.toFixed(1)}`, 140, y + 4);
          
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

    // MAP TRAINER LOGINS (As requested: name "john", password "3636")
    const isTrainerLogin = email === 'john' || email === TRAINER_EMAIL;
    if (isTrainerLogin) {
      if (password !== '3636') {
        showToast('Senha do Treinador incorreta!', 'error');
        return;
      }
      email = TRAINER_EMAIL;
      password = 'john3636'; // Translate to 6+ characters for Firebase Auth
    }

    try {
      setAuthLoading(true);
      if (!isRegisterMode) {
        // Firebase Auth sign-in
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          // If the trainer doesn't exist yet, automatically create their Firebase Auth user
          if (isTrainerLogin && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw signInErr;
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
          
          handleLoginSuccess({ name: 'John Vasques', email, role: 'trainer' });
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

        // 1. Create Firebase Auth user
        await createUserWithEmailAndPassword(auth, email, password);

        // 2. Create or merge the athlete profile (preventing overwrites of trainer-created data)
        const existingStudent = studentsData[email];
        const newStudent: StudentProfile = {
          name: existingStudent?.name || regName.trim(),
          plan: existingStudent?.plan || 'Mensal',
          status: existingStudent?.status || 'Pago',
          prs: {
            squat: existingStudent?.prs?.squat ?? (parseFloat(prSquat) || null),
            bench: existingStudent?.prs?.bench ?? (parseFloat(prBench) || null),
            deadlift: existingStudent?.prs?.deadlift ?? (parseFloat(prDeadlift) || null),
          },
          preferredTime: existingStudent?.preferredTime || regPreferredTime || '18:00',
          sessions: existingStudent?.sessions || [],
          age: existingStudent?.age ?? (parseInt(regAge) || 25),
          bodyWeight: existingStudent?.bodyWeight ?? (parseFloat(regBodyWeight) || 80),
          gender: existingStudent?.gender || regGender,
          prevPrs: existingStudent?.prevPrs,
          chatHistory: existingStudent?.chatHistory,
          publicNote: existingStudent?.publicNote
        };

        const updated = { ...studentsData, [email]: newStudent };
        saveStudentsToDB(updated);
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
        errorMsg = 'Este e-mail de guerreiro já está em uso.';
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

  const handleLogout = () => {
    signOut(auth).catch(err => console.warn("Firebase signout warning:", err));
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

  // --- GMAIL INTEGRATION LOGIC ---
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
        const weekWorkout = trainingProgram.weeks[currentWeek] || trainingProgram.weeks[1];
        
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
            <li style="margin-bottom: 6px;">🏋️ <strong>Agachamento:</strong> ${s.prs.squat ? `${s.prs.squat} kg` : 'Não registrado'}</li>
            <li style="margin-bottom: 6px;">🏋️ <strong>Supino:</strong> ${s.prs.bench ? `${s.prs.bench} kg` : 'Não registrado'}</li>
            <li style="margin-bottom: 6px;">🏋️ <strong>Levantamento Terra:</strong> ${s.prs.deadlift ? `${s.prs.deadlift} kg` : 'Não registrado'}</li>
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
  const handleSendMessage = (studentEmail: string, text: string) => {
    if (!text.trim()) return;
    const student = studentsData[studentEmail.toLowerCase()];
    if (!student) return;

    const newMessage: ChatMessage = {
      id: String(Date.now()),
      sender: currentUser?.role === 'trainer' ? 'trainer' : 'student',
      text: text.trim(),
      timestamp: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    };

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
      publicNote: noteText.trim() || undefined
    };

    const updatedStudents = {
      ...studentsData,
      [studentEmail.toLowerCase()]: updatedProfile
    };

    saveStudentsToDB(updatedStudents);
    showToast('Nota pública de parabéns atualizada com sucesso!', 'success');
    setDrawerOpen(false);
  };

  const handleSendActiveChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;

    const targetEmail = currentUser?.role === 'trainer' ? activeChatStudentEmail : currentUser?.email;
    if (!targetEmail) return;

    handleSendMessage(targetEmail.toLowerCase(), chatMessageInput);
  };

  // --- STUDENT LEVEL LOGIC ---
  const activeStudentProfile = currentUser && currentUser.role === 'student' ? studentsData[currentUser.email.toLowerCase()] : null;

  // Calculate volume: Sets * Reps * 1RM * intensity ratio for each logged exercise
  const calculateTotalVolume = () => {
    if (!activeStudentProfile) return 0;
    // Just sum up arbitrary but sensible weight lifting values based on logged sessions
    let sum = 0;
    activeStudentProfile.sessions.forEach(sess => {
      sess.exercises.forEach(ex => {
        // Find exercise inside program to get sets & reps
        // Or default to 3 * 8 * RPE * multiplier
        const rpe = ex.rpe || 7;
        sum += 3 * 8 * rpe * 5; // dynamic representation of volume lifted
      });
    });
    return sum === 0 ? 1280 : sum; // sensible starter volume
  };

  const calculateAvgRpe = () => {
    if (!activeStudentProfile || activeStudentProfile.sessions.length === 0) return '—';
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
      <div id="strength-evolution-panel" className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
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
      weight: Math.round(pr * step.percent * 10) / 10,
    }));

    // Target work set preview
    warmup.push({
      percent: parsedIntensity,
      reps: 2,
      weight: Math.round(pr * parsedIntensity * 10) / 10,
      isTarget: true
    } as any);

    return warmup;
  };

  const handleWorkoutSubmit = () => {
    if (!currentUser || !activeStudentProfile) return;
    const currentExercises = trainingProgram.weeks[selectedWeek]?.[selectedDay] || [];
    
    // Validate that all exercises have an RPE logged
    const loggedCount = Object.keys(sessionRpeState).length;
    if (loggedCount < currentExercises.length) {
      showToast(`Registre o RPE de todos os ${currentExercises.length} exercícios antes de salvar!`, 'error');
      return;
    }

    let totalPlannedVolume = 0;
    let totalAchievedVolume = 0;

    const exercisesLog = currentExercises.map(ex => {
      const isFailed = !!exerciseFailureState[ex.id]?.failed;
      const plannedVol = ex.sets * ex.reps;
      let achievedVol = plannedVol;
      
      if (isFailed) {
        const sDone = exerciseFailureState[ex.id]?.setsDone || (ex.sets - 1 > 0 ? ex.sets - 1 : 1);
        const aReps = exerciseFailureState[ex.id]?.actualReps || 1;
        achievedVol = (sDone * ex.reps) + aReps;
      }

      totalPlannedVolume += plannedVol;
      totalAchievedVolume += achievedVol;

      return {
        name: ex.name,
        rpe: sessionRpeState[ex.id] || 8,
        plannedVolume: plannedVol,
        achievedVolume: achievedVol,
        failed: isFailed
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
      id: 'session_' + Date.now().toString(),
      date: formattedDate,
      sessionName: `Semana ${selectedWeek} - Treino ${selectedDay}`,
      exercises: exercisesLog,
      avgRPE,
      note: sessionNote.trim() || undefined,
      totalPlannedVolume,
      totalAchievedVolume,
      volumeDeficit,
      compensationSuggestion: compensationSuggestion || undefined,
      prsAtSession: {
        squat: activeStudentProfile.prs.squat,
        bench: activeStudentProfile.prs.bench,
        deadlift: activeStudentProfile.prs.deadlift
      }
    };

    const updatedProfile: StudentProfile = {
      ...activeStudentProfile,
      sessions: [newSession, ...activeStudentProfile.sessions]
    };

    const updatedStudents = {
      ...studentsData,
      [currentUser.email]: updatedProfile
    };

    saveStudentsToDB(updatedStudents);
    setWorkoutModalOpen(false);
    setSessionRpeState({});
    setExerciseFailureState({});
    setSessionNote('');

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
      if (weight <= 57) return 'Até 57kg';
      if (weight <= 72) return '57.1kg - 72kg';
      return 'Mais de 72kg';
    } else {
      if (weight <= 74) return 'Até 74kg';
      if (weight <= 93) return '74.1kg - 93kg';
      return 'Mais de 93kg';
    }
  };

  const getLeaderboard = (): GymLeaderboardEntry[] => {
    // Collect everyone (default + active student) and calculate dynamic rank
    const entries: GymLeaderboardEntry[] = Object.keys(studentsData).map(email => {
      const profile = studentsData[email];
      const squat = profile.prs.squat || 0;
      const bench = profile.prs.bench || 0;
      const deadlift = profile.prs.deadlift || 0;
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
  };

  const getAbsoluteLeader = (): GymLeaderboardEntry | null => {
    const entries: GymLeaderboardEntry[] = Object.keys(studentsData).map(email => {
      const profile = studentsData[email];
      const squat = profile.prs.squat || 0;
      const bench = profile.prs.bench || 0;
      const deadlift = profile.prs.deadlift || 0;
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
  };

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
      gender
    };

    saveStudentsToDB({ ...studentsData, [email]: newStudent });
    setDrawerOpen(false);
    showToast(`${name} foi convocado para o clã Viking Force!`, 'success');
  };

  const openProgramEditor = (studentEmail: string) => {
    setEditingStudentEmail(studentEmail);
    // Let's copy current week/day program to editor state
    const currentExercises = trainingProgram.weeks[editorWeek]?.[editorDay] || [];
    setEditorExercises(JSON.parse(JSON.stringify(currentExercises)));
    setEditorSearchQuery('');
    setDrawerType('editProgram');
    setDrawerTitle(`Prescrever Treino`);
    setDrawerOpen(true);
  };

  const handleEditorLoadWeekDay = (week: number, day: string) => {
    setEditorWeek(week);
    setEditorDay(day);
    const currentExercises = trainingProgram.weeks[week]?.[day] || [];
    setEditorExercises(JSON.parse(JSON.stringify(currentExercises)));
    setEditorSearchQuery('');
  };

  const handleEditorAddWeek = () => {
    const existingWeeks = Object.keys(trainingProgram.weeks).map(Number);
    const nextWeek = existingWeeks.length > 0 ? Math.max(...existingWeeks) + 1 : 1;
    
    const updatedWeeks = { ...trainingProgram.weeks };
    updatedWeeks[nextWeek] = { A: [], B: [], C: [] };
    
    saveProgramToDB({ weeks: updatedWeeks });
    handleEditorLoadWeekDay(nextWeek, 'A');
    showToast(`Semana ${nextWeek} adicionada com sucesso ao cronograma de treinos!`, 'success');
  };

  const handleEditorAddWorkoutDay = () => {
    const currentWeekWorkout = trainingProgram.weeks[editorWeek] || { A: [], B: [], C: [] };
    const existingDays = Object.keys(currentWeekWorkout).sort();
    
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const nextDay = letters.find(l => !existingDays.includes(l)) || String.fromCharCode(65 + existingDays.length);
    
    const updatedWeeks = { ...trainingProgram.weeks };
    if (!updatedWeeks[editorWeek]) {
      updatedWeeks[editorWeek] = { A: [], B: [], C: [] };
    }
    updatedWeeks[editorWeek][nextDay] = [];
    
    saveProgramToDB({ weeks: updatedWeeks });
    handleEditorLoadWeekDay(editorWeek, nextDay);
    showToast(`Treino ${nextDay} adicionado com sucesso à Semana ${editorWeek}!`, 'success');
  };

  const handleEditorAddExercise = () => {
    const newEx: Exercise = {
      id: 'ex_' + Date.now().toString(),
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
    const updatedWeeks = { ...trainingProgram.weeks };
    if (!updatedWeeks[editorWeek]) {
      updatedWeeks[editorWeek] = { A: [], B: [], C: [] };
    }
    updatedWeeks[editorWeek][editorDay] = editorExercises;

    saveProgramToDB({ weeks: updatedWeeks });
    showToast(`Prescrição da Semana ${editorWeek} - Treino ${editorDay} salva para todos os guerreiros!`, 'success');
  };

  const handleEditorUpdateField = (idx: number, field: keyof Exercise, value: any) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === idx) {
        return { ...ex, [field]: value };
      }
      return ex;
    }));
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

  const handleEditorRemoveWarmupStep = (exIdx: number, stepIdx: number) => {
    setEditorExercises(prev => prev.map((ex, i) => {
      if (i === exIdx && ex.warmup) {
        return { ...ex, warmup: ex.warmup.filter((_, s) => s !== stepIdx) };
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center relative z-10">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-viking-gold-dark to-viking-gold flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Shield className="w-7 h-7 text-viking-dark animate-pulse-gold" />
            </div>
            <div>
              <span className="font-viking-display text-xl sm:text-2xl font-bold tracking-wider bg-gradient-to-r from-white via-viking-gold to-viking-gold-dark bg-clip-text text-transparent">
                VIKING FORCE
              </span>
              <p className="text-[10px] text-viking-silver uppercase tracking-widest font-viking-medieval block">Salão de Powerlifting</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
              <div className="flex items-center gap-1.5 bg-[#0f0a08] border border-viking-gold/20 p-1 rounded-2xl backdrop-blur-md">
                <button 
                  onClick={() => { setActiveTab('home'); closeAllDrawers(); setWorkoutModalOpen(false); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'home' && !drawerOpen && !workoutModalOpen 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${activeTab === 'home' && !drawerOpen && !workoutModalOpen ? 'text-viking-dark' : 'text-viking-gold'}`} /> Início
                </button>
                
                {currentUser?.role === 'student' ? (
                  <>
                    <button 
                      onClick={() => { setWorkoutModalOpen(true); setDrawerOpen(false); }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        workoutModalOpen 
                          ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                          : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                      }`}
                    >
                      <Dumbbell className={`w-4 h-4 ${workoutModalOpen ? 'text-viking-dark' : 'text-viking-gold'}`} /> Treino Hoje
                    </button>
                    <button 
                      onClick={() => { setWorkoutModalOpen(false); setDrawerType('history'); setDrawerTitle('Seu Histórico & RPE'); setDrawerOpen(true); }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        drawerOpen && drawerType === 'history' 
                          ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                          : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                      }`}
                    >
                      <History className={`w-4 h-4 ${drawerOpen && drawerType === 'history' ? 'text-viking-dark' : 'text-viking-gold'}`} /> Histórico
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setWorkoutModalOpen(false); setDrawerType('rpeFeedback'); setDrawerTitle('Feedback RPE de Alunos'); setDrawerOpen(true); }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        drawerOpen && drawerType === 'rpeFeedback' 
                          ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                          : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 ${drawerOpen && drawerType === 'rpeFeedback' ? 'text-viking-dark' : 'text-viking-gold'}`} /> RPE dos Alunos
                    </button>
                    <button 
                      onClick={() => { setWorkoutModalOpen(false); setDrawerType('addStudent'); setDrawerTitle('Recrutar Novo Aluno'); setDrawerOpen(true); }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        drawerOpen && drawerType === 'addStudent' 
                          ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                          : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                      }`}
                    >
                      <UserPlus className={`w-4 h-4 ${drawerOpen && drawerType === 'addStudent' ? 'text-viking-dark' : 'text-viking-gold'}`} /> Adicionar Aluno
                    </button>
                  </>
                )}

                <button 
                  onClick={() => { setWorkoutModalOpen(false); setDrawerType('exerciseLibrary'); setDrawerTitle('Biblioteca de Exercícios'); setDrawerOpen(true); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    drawerOpen && drawerType === 'exerciseLibrary' 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${drawerOpen && drawerType === 'exerciseLibrary' ? 'text-viking-dark' : 'text-viking-gold'}`} /> Biblioteca
                </button>

                <button 
                  onClick={() => { setWorkoutModalOpen(false); setDrawerType('ranking'); setDrawerTitle('Ranking do Templo'); setDrawerOpen(true); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    drawerOpen && drawerType === 'ranking' 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <Trophy className={`w-4 h-4 ${drawerOpen && drawerType === 'ranking' ? 'text-viking-dark' : 'text-viking-gold'}`} /> Classificação
                </button>

                <button 
                  onClick={() => { setWorkoutModalOpen(false); setDrawerType('plans'); setDrawerTitle('Aliança Viking - Planos'); setDrawerOpen(true); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    drawerOpen && drawerType === 'plans' 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${drawerOpen && drawerType === 'plans' ? 'text-viking-dark' : 'text-viking-gold'}`} /> Planos
                </button>

                <button 
                  onClick={() => { setWorkoutModalOpen(false); setDrawerType('gmail'); setDrawerTitle('Correio de Valhalla (Gmail)'); setDrawerOpen(true); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    drawerOpen && drawerType === 'gmail' 
                      ? 'text-viking-dark bg-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                      : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                  }`}
                >
                  <Mail className={`w-4 h-4 ${drawerOpen && drawerType === 'gmail' ? 'text-viking-dark' : 'text-viking-gold'}`} /> Correio Gmail
                </button>
              </div>
            </div>
          )}

          {/* Right Area (User, Settings, Hamburger) */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
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
                    <div className="w-full h-full rounded-full bg-viking-darker flex items-center justify-center">
                      <User className="w-4 h-4 text-viking-gold" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none">{currentUser?.name}</p>
                    <p className="text-[9px] text-viking-gold uppercase font-viking-medieval mt-0.5">{currentUser?.role === 'trainer' ? 'Treinador' : 'Atleta'}</p>
                  </div>
                </div>

                {currentUser?.role === 'student' && (
                  <button 
                    onClick={() => { setDrawerType('settings'); setDrawerTitle('Configurações de Força'); setDrawerOpen(true); }}
                    className="p-2.5 rounded-xl bg-viking-dark hover:bg-viking-gold/10 text-viking-silver hover:text-viking-gold transition-all border border-viking-gold/20 hover:border-viking-gold/40"
                    title="Configurar Força (1RM)"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
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
                  className="p-2.5 rounded-xl bg-viking-dark text-viking-silver hover:text-viking-gold md:hidden border border-viking-gold/20 hover:border-viking-gold/40 transition-colors"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-28 md:pb-8">

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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0d0908] border border-viking-gold/20 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <Shield className="w-9 h-9 text-viking-gold" />
                  </div>
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
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6 relative z-10"
          >
            {/* Header Greeting */}
            <div className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl backdrop-blur-md relative overflow-hidden">
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
              </div>
              <div className="flex items-center gap-2 bg-viking-gold/10 border border-viking-gold/30 px-3 py-1.5 rounded-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider font-viking-medieval text-viking-gold">Ciclo de Força Ativo</span>
              </div>
            </div>

            {/* Conditional Highlight Card / Public Note from Trainer */}
            {activeStudentProfile.publicNote && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-gradient-to-br from-amber-500/15 via-[#231710]/95 to-amber-950/20 border-2 border-viking-gold rounded-3xl p-6 relative overflow-hidden shadow-[0_0_25px_rgba(217,119,6,0.25)] text-left"
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
            <div className="flex border-b border-viking-gold/15 gap-2 sm:gap-6 bg-[#140e0c]/40 p-1.5 rounded-2xl border border-viking-gold/10">
              <button 
                onClick={() => setStudentSubTab('overview')}
                className={`flex-1 sm:flex-initial py-3 px-5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  studentSubTab === 'overview' 
                    ? 'text-viking-dark bg-gradient-to-r from-viking-gold-dark to-viking-gold shadow-md shadow-viking-gold/15' 
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/5'
                }`}
              >
                ⚔️ Treinos &amp; Progresso
              </button>
              <button 
                onClick={() => setStudentSubTab('wilks')}
                className={`flex-1 sm:flex-initial py-3 px-5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  studentSubTab === 'wilks' 
                    ? 'text-viking-dark bg-gradient-to-r from-viking-gold-dark to-viking-gold shadow-md shadow-viking-gold/15' 
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/5'
                }`}
              >
                🏆 Metas de Wilks
              </button>
            </div>

            {studentSubTab === 'overview' && (
              <>
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
                  <div className={`rounded-3xl p-6 border transition-all md:col-span-7 flex flex-col justify-between ${
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Dumbbell className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">{calculateTotalVolume().toLocaleString('pt-BR')} kg</p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Volume Total</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Trophy className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">
                  {(activeStudentProfile.prs.squat || 0) > 0 ? '3' : '0'}
                </p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">PRs Ativos</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <History className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">{activeStudentProfile.sessions.length}</p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Treinos Concluídos</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Activity className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">{calculateAvgRpe()}</p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">RPE Médio Recente</p>
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

            {/* Quick Actions Panel */}
            <div className="bg-[#1a1210]/85 border border-viking-gold/20 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="font-viking-display text-sm font-bold tracking-widest text-viking-gold uppercase mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-viking-gold" /> Portões do Combate - Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                <button 
                  onClick={() => setWorkoutModalOpen(true)}
                  className="p-4 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-viking-gold/20 cursor-pointer"
                >
                  <Dumbbell className="w-5 h-5 shrink-0" /> Treinar Hoje
                </button>

                <button 
                  onClick={() => { setDrawerType('history'); setDrawerTitle('Histórico & RPE de Treinos'); setDrawerOpen(true); }}
                  className="p-4 rounded-xl bg-viking-dark border border-viking-gold/20 text-viking-gold hover:bg-viking-gold/10 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <History className="w-5 h-5 shrink-0" /> Histórico &amp; RPE
                </button>

                <button 
                  onClick={() => { setDrawerType('ranking'); setDrawerTitle('Tabela de Honra Viking'); setDrawerOpen(true); }}
                  className="p-4 rounded-xl bg-viking-dark border border-viking-gold/20 text-viking-gold hover:bg-viking-gold/10 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Trophy className="w-5 h-5 shrink-0" /> Classificação
                </button>

                <button 
                  onClick={() => { setDrawerType('settings'); setDrawerTitle('Configurações de Força'); setDrawerOpen(true); }}
                  className="p-4 rounded-xl bg-viking-dark border border-viking-gold/20 text-viking-gold hover:bg-viking-gold/10 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-5 h-5 shrink-0" /> Ajustar 1RM
                </button>

                <button 
                  onClick={() => { 
                    setDrawerType('chat'); 
                    setDrawerTitle('Feedback com o Treinador'); 
                    setDrawerOpen(true); 
                  }}
                  className="p-4 rounded-xl bg-viking-gold/10 border border-viking-gold hover:bg-viking-gold/20 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer text-viking-gold animate-pulse shadow-md shadow-viking-gold/5"
                >
                  <MessageSquare className="w-5 h-5 shrink-0" /> Falar com Coach
                </button>

              </div>
            </div>

            {/* Core Workout Prescribed Preview */}
            <div className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-viking-gold/15">
                <div>
                  <h3 className="font-viking-display text-lg font-bold text-viking-gold">PROVA ATUAL PROGRAMADA</h3>
                  <p className="text-xs text-viking-silver">Desenvolvida pelo Treinador John com foco em técnica de Powerlifting</p>
                </div>
                <div className="text-xs bg-viking-darker border border-viking-gold/20 px-3.5 py-1.5 rounded-xl text-viking-gold font-bold">
                  🏋️ Semana 1 - Treino A (Foco em Agachamento)
                </div>
              </div>

              <div className="space-y-3">
                {(trainingProgram.weeks[1]?.A || []).map((ex, idx) => (
                  <div key={ex.id || idx} className="p-4 rounded-xl bg-black/30 border border-viking-gold/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-viking-gold/40 transition-all">
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
                            <Info className="w-3.5 h-3.5 shrink-0 text-viking-gold" /> Dica: {ex.techniqueTips}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold sm:text-right">
                      <div>
                        <p className="text-[10px] text-viking-silver uppercase font-viking-medieval">Intensidade</p>
                        <p className="text-[#e0d3a8] font-bold mt-0.5">
                          {typeof ex.intensity === 'number' ? `${Math.round(ex.intensity * 100)}% 1RM` : ex.intensity}
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

                                const neededDiff = targetTotal - total;

                                return (
                                  <tr 
                                    key={lvl.id} 
                                    className={`transition-all hover:bg-viking-gold/5 ${
                                      isUnlocked 
                                        ? 'bg-emerald-950/10 hover:bg-emerald-950/15' 
                                        : isCurrentGoal 
                                          ? 'bg-viking-gold/10 hover:bg-viking-gold/15 shadow-inner' 
                                          : 'opacity-70 hover:opacity-100'
                                    }`}
                                  >
                                    {/* Name and Status */}
                                    <td className="py-4 px-4 font-extrabold flex items-center gap-2">
                                      <span className="text-lg shrink-0">{lvl.badge}</span>
                                      <div>
                                        <p className="text-white text-xs sm:text-sm font-black flex items-center gap-1.5">
                                          {lvl.name}
                                          {isUnlocked && (
                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                                              Conquistado
                                            </span>
                                          )}
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
              const expectedTotal = Object.keys(studentsData).reduce((sum, email) => sum + getPlanMonthlyEquivalent(studentsData[email].plan), 0);
              const receivedTotal = Object.keys(studentsData).reduce((sum, email) => {
                const s = studentsData[email];
                return s.status === 'Pago' ? sum + getPlanMonthlyEquivalent(s.plan) : sum;
              }, 0);
              const pendingOrOverdueTotal = Object.keys(studentsData).reduce((sum, email) => {
                const s = studentsData[email];
                return (s.status === 'Pendente' || s.status === 'Atrasado') ? sum + getPlanMonthlyEquivalent(s.plan) : sum;
              }, 0);

              const countMensal = Object.keys(studentsData).filter(email => studentsData[email].plan === 'Mensal').length;
              const countTrimestral = Object.keys(studentsData).filter(email => studentsData[email].plan === 'Trimestral').length;
              const countAnual = Object.keys(studentsData).filter(email => studentsData[email].plan === 'Anual').length;

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
                <p className="text-2xl font-black text-white">{Object.keys(studentsData).length}</p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Atletas Ativos</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Coins className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">
                  R$ {Object.keys(studentsData).reduce((sum, email) => sum + getPlanMonthlyEquivalent(studentsData[email].plan), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Faturamento Est. / mês</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <Clock className="w-8 h-8 text-viking-red mx-auto mb-2" />
                <p className="text-2xl font-black text-white">
                  {Object.keys(studentsData).map(email => studentsData[email]).filter(s => s.status !== 'Pago').length}
                </p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Atrasos/Pendências</p>
              </div>

              <div className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-2xl p-5 text-center relative overflow-hidden shadow-md hover:border-viking-gold/40 transition-all">
                <TrendingUp className="w-8 h-8 text-viking-gold mx-auto mb-2" />
                <p className="text-2xl font-black text-white">+20%</p>
                <p className="text-[10px] text-viking-silver uppercase mt-1 tracking-widest font-viking-medieval">Crescimento Mensal</p>
              </div>

            </div>

            {/* Wilks Efficiency Scatter Chart */}
            <WilksScatterChart entries={getLeaderboard()} />

            {/* Payment Highlight Card */}
            {(() => {
              const overdueOrPending = Object.keys(studentsData)
                .map(email => ({ email, ...studentsData[email] }))
                .filter(s => s.status === 'Pendente' || s.status === 'Atrasado');

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
                <button 
                  onClick={() => { setDrawerType('addStudent'); setDrawerTitle('Recrutar Novo Aluno'); setDrawerOpen(true); }}
                  className="px-4 py-2 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-viking-gold/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 shrink-0" /> Novo Guerreiro
                </button>
              </div>

              {/* Search Bar for Athlete Filtering */}
              <div className="mb-6 relative">
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

              {(() => {
                const filteredStudentEmails = Object.keys(studentsData).filter(email => {
                  const s = studentsData[email];
                  if (paymentFilter === 'pending_or_overdue' && s.status === 'Pago') {
                    return false;
                  }
                  const searchLower = searchTerm.toLowerCase().trim();
                  if (!searchLower) return true;
                  return s.name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
                });

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
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-viking-gold/15 text-xs text-viking-gold uppercase font-viking-medieval">
                            <th className="py-3 px-4 font-bold">Guerreiro</th>
                            <th className="py-3 px-4 font-bold">Email</th>
                            <th className="py-3 px-4 font-bold">Assinatura</th>
                            <th className="py-3 px-4 font-bold">Estado Financeiro</th>
                            <th className="py-3 px-4 font-bold">Último RPE Médio</th>
                            <th className="py-3 px-4 font-bold">Sentinela (Treino Hoje)</th>
                            <th className="py-3 px-4 font-bold text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-viking-gold/10">
                          {filteredStudentEmails.map(email => {
                            const s = studentsData[email];
                            const lastSess = s.sessions[0];
                            const todayString = new Date().toLocaleDateString('pt-BR');
                            const hasTrainedToday = s.sessions?.some(sess => sess.date === todayString);
                            const preferredTime = s.preferredTime || '18:00';
                            const isPastPreferredTime = simulatedTime > preferredTime;

                            return (
                              <tr key={email} className="hover:bg-viking-gold/5 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-white">{s.name}</td>
                                <td className="py-3.5 px-4 text-xs font-medium text-viking-silver">{email}</td>
                                <td className="py-3.5 px-4 text-xs font-medium text-white">{s.plan}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${
                                    s.status === 'Pago' 
                                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                                      : s.status === 'Pendente'
                                      ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                                      : 'bg-red-950/40 text-red-400 border-red-800/40'
                                  }`}>
                                    {s.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  {lastSess ? (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                                      lastSess.avgRPE >= 9 
                                        ? 'bg-red-950/40 text-red-400 border border-red-800/30' 
                                        : lastSess.avgRPE >= 7.5
                                        ? 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30'
                                    }`}>
                                      <Activity className="w-3 h-3" /> {lastSess.avgRPE.toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600 text-xs italic">Nenhum treino</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  {hasTrainedToday ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs" title="Treino registrado hoje!">
                                      <Check className="w-3.5 h-3.5" /> Concluído
                                    </span>
                                  ) : isPastPreferredTime ? (
                                    <span className="inline-flex items-center gap-1 text-red-400 font-bold text-xs animate-pulse" title={`Horário de preferência (${preferredTime}) ultrapassado`}>
                                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Atrasado ({preferredTime})
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-viking-silver/65 font-medium text-xs" title={`Horário preferencial às ${preferredTime}`}>
                                      <Clock className="w-3.5 h-3.5" /> Pendente ({preferredTime})
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    <button 
                                      onClick={() => {
                                        setActiveNoteStudentEmail(email);
                                        setPublicNoteInput(s.publicNote || '');
                                        setDrawerTitle(`Nota Pública / Parabenizar ${s.name}`);
                                        setDrawerType('publicNote');
                                        setDrawerOpen(true);
                                      }}
                                      className="p-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-400 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                                      title="Escrever Nota Pública de Parabenização"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span className="text-xs font-bold">Parabenizar</span>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setActiveChatStudentEmail(email);
                                        setDrawerTitle(`Chat com ${s.name}`);
                                        setDrawerType('chat');
                                        setDrawerOpen(true);
                                      }}
                                      className="p-2 px-3 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/35 hover:border-viking-gold text-viking-gold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                                      title="Enviar Feedback"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <span className="text-xs font-bold">Feedback</span>
                                    </button>
                                    <button 
                                      onClick={() => openProgramEditor(email)}
                                      className="px-3.5 py-2 rounded-xl bg-viking-dark border border-viking-gold/25 hover:border-viking-gold hover:bg-viking-gold/10 text-viking-silver hover:text-viking-gold font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                      Prescrever Treino <ChevronRight className="w-3.5 h-3.5 text-viking-gold" />
                                    </button>
                                    <button 
                                      onClick={() => sendWorkoutPlanEmail(email, s)}
                                      className="p-2 px-3.5 rounded-xl bg-viking-gold/5 hover:bg-viking-gold/20 border border-viking-gold/20 hover:border-viking-gold text-viking-gold hover:text-white transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                                      title="Enviar Ficha por Gmail"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                      <span className="text-xs font-bold">Enviar Ficha</span>
                                    </button>
                                    <button 
                                      onClick={() => setDeletingStudentEmail(email)}
                                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 hover:border-red-500 text-red-400 transition-all cursor-pointer inline-flex items-center justify-center"
                                      title="Excluir Guerreiro"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="block md:hidden space-y-4">
                      {filteredStudentEmails.map(email => {
                        const s = studentsData[email];
                        const lastSess = s.sessions[0];
                        return (
                          <div key={email} className="p-4 rounded-2xl bg-[#0d0908]/50 border border-viking-gold/15 space-y-3.5 shadow-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-[#e0d3a8] text-base">{s.name}</p>
                                <p className="text-[11px] text-viking-silver mt-0.5">{email}</p>
                              </div>
                              <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border ${
                                s.status === 'Pago' 
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                                  : s.status === 'Pendente'
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                                  : 'bg-red-950/40 text-red-400 border-red-800/40'
                              }`}>
                                {s.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-viking-gold/10 pt-2 text-xs">
                              <div>
                                <p className="text-[9px] text-viking-silver uppercase font-viking-medieval">Assinatura</p>
                                <p className="font-bold text-white mt-0.5">{s.plan}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-viking-silver uppercase font-viking-medieval">Último RPE Médio</p>
                                <div className="mt-0.5">
                                  {lastSess ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                      lastSess.avgRPE >= 9 
                                        ? 'bg-red-950/40 text-red-400' 
                                        : lastSess.avgRPE >= 7.5
                                        ? 'bg-amber-950/40 text-amber-400'
                                        : 'bg-emerald-950/40 text-emerald-400'
                                    }`}>
                                      {lastSess.avgRPE.toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-600 italic text-[11px]">Nenhum</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Sentinela status in mobile card */}
                            {(() => {
                              const todayString = new Date().toLocaleDateString('pt-BR');
                              const hasTrainedToday = s.sessions?.some(sess => sess.date === todayString);
                              const preferredTime = s.preferredTime || '18:00';
                              const isPastPreferredTime = simulatedTime > preferredTime;
                              return (
                                <div className="border-t border-viking-gold/10 pt-2 flex justify-between items-center text-xs">
                                  <span className="text-[9px] text-viking-silver uppercase font-viking-medieval">Sentinela Viking:</span>
                                  <div>
                                    {hasTrainedToday ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                                        <Check className="w-3.5 h-3.5" /> Concluído
                                      </span>
                                    ) : isPastPreferredTime ? (
                                      <span className="inline-flex items-center gap-1 text-red-400 font-bold text-xs animate-pulse">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Atrasado ({preferredTime})
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-viking-silver/65 font-medium text-xs">
                                        <Clock className="w-3.5 h-3.5" /> Pendente ({preferredTime})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="border-t border-viking-gold/10 pt-2 grid grid-cols-4 gap-2">
                              <button 
                                onClick={() => {
                                  setActiveChatStudentEmail(email);
                                  setDrawerTitle(`Chat com ${s.name}`);
                                  setDrawerType('chat');
                                  setDrawerOpen(true);
                                }}
                                className="py-2.5 rounded-xl bg-viking-gold/10 border border-viking-gold/30 hover:bg-viking-gold/20 text-viking-gold font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3" /> Chat
                              </button>
                              <button 
                                onClick={() => openProgramEditor(email)}
                                className="py-2.5 rounded-xl bg-viking-dark border border-viking-gold/25 hover:border-viking-gold hover:bg-viking-gold/10 text-viking-gold font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Prescrever
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveNoteStudentEmail(email);
                                  setPublicNoteInput(s.publicNote || '');
                                  setDrawerTitle(`Parabenizar ${s.name}`);
                                  setDrawerType('publicNote');
                                  setDrawerOpen(true);
                                }}
                                className="py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-400 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" /> Parabéns
                              </button>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => sendWorkoutPlanEmail(email, s)}
                                  className="flex-1 py-2.5 rounded-xl bg-viking-gold/5 border border-viking-gold/20 hover:bg-viking-gold/10 text-viking-gold transition-all flex items-center justify-center cursor-pointer"
                                  title="Enviar Planilha por Gmail"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => setDeletingStudentEmail(email)}
                                  className="flex-1 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 hover:border-red-500 text-red-400 transition-all flex items-center justify-center cursor-pointer"
                                  title="Excluir Guerreiro"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Quick actions for Trainer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-viking-gold/15">
                <button 
                  onClick={() => { setDrawerType('whatsapp'); setDrawerTitle('Cobranças via WhatsApp'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 shrink-0 text-viking-gold" /> Cobrar Inadimplentes (WhatsApp)
                </button>
                <button 
                  onClick={() => { setDrawerType('payments'); setDrawerTitle('Fluxo de Caixa Viking'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 shrink-0 text-viking-gold" /> Visualizar Pagamentos
                </button>
                <button 
                  onClick={() => { setDrawerType('rpeFeedback'); setDrawerTitle('Alertas & Notas de RPE'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-viking-gold" /> Logs de Treino dos Alunos
                </button>
                <button 
                  onClick={() => { setDrawerType('gmail'); setDrawerTitle('Correio de Valhalla (Gmail)'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 shrink-0 text-viking-gold" /> Central de Gmail (Correio)
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
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Sheet Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, x: '-50%', y: '-48%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.85, x: '-50%', y: '-48%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-2xl bg-[#140e0c]/98 border-2 border-viking-gold/30 rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.25),inset_0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-xl z-50 flex flex-col max-h-[85vh] overflow-hidden text-[#e0d3a8]"
            >
              <div className="p-6 border-b border-viking-gold/15 bg-[#140e0c]/90 flex justify-between items-center shrink-0">
                <h3 className="font-viking-display text-sm sm:text-base font-black tracking-wider text-viking-gold flex items-center gap-2 uppercase">
                  {drawerType === 'history' && <History className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'ranking' && <Trophy className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'plans' && <CreditCard className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'settings' && <Settings className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'addStudent' && <UserPlus className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'whatsapp' && <Phone className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'payments' && <CreditCard className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'rpeFeedback' && <MessageSquare className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'editProgram' && <Settings className="w-5 h-5 text-viking-gold" />}
                  {drawerType === 'chat' && <MessageSquare className="w-5 h-5 text-viking-gold animate-pulse" />}
                  {drawerType === 'gmail' && <Mail className="w-5 h-5 text-viking-gold" />}
                  {drawerTitle}
                </h3>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-viking-gold/5 border border-viking-gold/20 text-viking-silver hover:text-viking-gold cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pb-28 md:pb-6 space-y-5">
                
                {/* 1. History Drawer */}
                {drawerType === 'history' && activeStudentProfile && (
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleDownloadPDF(activeStudentProfile)}
                      className="w-full py-3 px-4 rounded-xl bg-viking-gold/15 hover:bg-viking-gold/25 border border-viking-gold/40 hover:border-viking-gold text-viking-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <FileDown className="w-4.5 h-4.5" /> Exportar Relatório em PDF
                    </button>

                    {activeStudentProfile.sessions.length === 0 ? (
                      <div className="text-center py-12 text-viking-silver">
                        <History className="w-12 h-12 text-viking-gold/30 mx-auto mb-3" />
                        <p className="font-bold">Nenhum treino realizado ainda.</p>
                        <p className="text-xs mt-1">Conclua sua primeira prova em "Treino Hoje" para iniciar seu histórico.</p>
                      </div>
                    ) : (
                      activeStudentProfile.sessions.map((sess, idx) => (
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
                              RPE Médio: {sess.avgRPE.toFixed(1)}
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
                          
                          <div className="space-y-1.5 border-t border-viking-gold/15 pt-2.5">
                            {sess.exercises.map((ex, eidx) => (
                              <div key={eidx} className="flex justify-between items-center text-xs">
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
                    )}
                  </div>
                )}

                {/* 2. Leaderboard Drawer */}
                {drawerType === 'ranking' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80 leading-relaxed">
                      🏆 Templo Viking Force - Classificação de Competição. O coeficiente Wilks compara os guerreiros de diferentes pesos corporais e gêneros de forma justa para encontrar o campeão absoluto. Toque nos cabeçalhos para ordenar!
                    </p>

                    {/* Absolute Leader Highlight Card */}
                    {getAbsoluteLeader() && (() => {
                      const leader = getAbsoluteLeader()!;
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
                          {getLeaderboard().map((warrior, idx) => {
                            const isSelf = currentUser && currentUser.email === warrior.email;
                            const isAbsoluteLeader = getAbsoluteLeader()?.email === warrior.email;
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
                          })}
                        </div>
                      )}

                      {/* 2.2 Leaderboard Grouped by Age Division */}
                      {leaderboardTab === 'age' && (
                        <div className="space-y-6">
                          {['Sub-Júnior (≤18)', 'Júnior (19-23)', 'Open (24-39)', 'Master (40+)'].map(division => {
                            const competitors = getLeaderboard()
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
                                    const isAbsoluteLeader = getAbsoluteLeader()?.email === warrior.email;
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
                          })}
                        </div>
                      )}

                      {/* 2.3 Leaderboard Grouped by Weight Class */}
                      {leaderboardTab === 'weight' && (
                        <div className="space-y-6">
                          {['Até 57kg', '57.1kg - 72kg', 'Mais de 72kg', 'Até 74kg', '74.1kg - 93kg', 'Mais de 93kg'].map(wClass => {
                            const competitors = getLeaderboard()
                              .filter(w => w.weightClass === wClass)
                              .sort((a, b) => b.wilks - a.wilks);

                            if (competitors.length === 0) return null;

                            const isFemaleClass = ['Até 57kg', '57.1kg - 72kg', 'Mais de 72kg'].includes(wClass);

                            return (
                              <div key={wClass} className="space-y-2">
                                <h4 className="text-xs font-black text-viking-silver uppercase tracking-widest border-b border-viking-silver/20 pb-1 flex items-center gap-1.5">
                                  <Scale className="w-3.5 h-3.5 text-viking-silver" /> 
                                  Classe {wClass} ({isFemaleClass ? 'Feminino' : 'Masculino'})
                                </h4>
                                <div className="space-y-1.5">
                                  {competitors.map((warrior, idx) => {
                                    const isSelf = currentUser && currentUser.email === warrior.email;
                                    const isCategoryLeader = idx === 0;
                                    const isAbsoluteLeader = getAbsoluteLeader()?.email === warrior.email;
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
                          })}
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
                        
                        {vikingPlans.map(plan => (
                          <div key={plan.id} className="p-5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 hover:border-viking-gold/40 transition-all text-center space-y-2 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-viking-gold/10 text-viking-gold px-2.5 py-1 rounded-full">{plan.badge}</span>
                            <h4 className="font-viking-display text-base font-bold text-white">{plan.name}</h4>
                            <p className="text-3xl font-black text-viking-gold">R$ {plan.price.toLocaleString('pt-BR')} <span className="text-xs font-normal text-viking-silver/60">{plan.period}</span></p>
                            <p className="text-xs text-viking-silver max-w-xs mx-auto">{plan.description}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* 4. Settings (PRs update) */}
                {drawerType === 'settings' && activeStudentProfile && (
                  <div className="space-y-4">
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
                          <input 
                            type="number" 
                            id="cfgSquat"
                            defaultValue={activeStudentProfile.prs.squat || ''}
                            placeholder="Ex: 150"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-viking-silver mb-1">Supino Máximo (kg)</label>
                          <input 
                            type="number" 
                            id="cfgBench"
                            defaultValue={activeStudentProfile.prs.bench || ''}
                            placeholder="Ex: 110"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-viking-silver mb-1">Levantamento Terra Máximo (kg)</label>
                          <input 
                            type="number" 
                            id="cfgDeadlift"
                            defaultValue={activeStudentProfile.prs.deadlift || ''}
                            placeholder="Ex: 190"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          />
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
                              id="cfgAge"
                              defaultValue={activeStudentProfile.age || 25}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-viking-silver mb-1">Peso Corporal (kg)</label>
                            <input 
                              type="number" 
                              step="0.1"
                              id="cfgBodyWeight"
                              defaultValue={activeStudentProfile.bodyWeight || 80}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
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
                            gender
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-viking-silver uppercase mb-1">Idade (anos)</label>
                        <input 
                          type="number" 
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

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 mt-4 cursor-pointer"
                    >
                      Convocar Guerreiro ao Clã
                    </button>
                  </form>
                )}

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

                 {/* 6. WhatsApp billing */}
                 {drawerType === 'whatsapp' && (
                   <div className="space-y-4">
                     <p className="text-xs text-viking-silver/85">
                       Selecione um atleta em atraso ou pendente para abrir o WhatsApp Web com uma mensagem personalizada de lembrete de renovação de forma instantânea.
                     </p>
                     
                     {/* Search Bar */}
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Search className="h-3.5 w-3.5 text-viking-gold/60" />
                       </div>
                       <input
                         type="text"
                         placeholder="Buscar guerreiro por nome ou email..."
                         value={whatsappSearch}
                         onChange={(e) => setWhatsappSearch(e.target.value)}
                         className="w-full pl-9 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/45 outline-none transition-all"
                       />
                       {whatsappSearch && (
                         <button
                           onClick={() => setWhatsappSearch('')}
                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-viking-silver hover:text-viking-gold transition-colors text-xs font-bold cursor-pointer"
                         >
                           Limpar
                         </button>
                       )}
                     </div>

                     <div className="space-y-3">
                       {(() => {
                         const filtered = Object.keys(studentsData)
                           .map(email => ({ email, s: studentsData[email] }))
                           .filter(({ email, s }) => {
                             if (s.status === 'Pago') return false;
                             const term = whatsappSearch.toLowerCase().trim();
                             if (!term) return true;
                             return s.name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
                           });

                         if (filtered.length === 0) {
                           return (
                             <p className="text-center py-6 text-xs text-viking-silver/60">
                               {whatsappSearch ? 'Nenhum guerreiro correspondente encontrado.' : 'Nenhum guerreiro está inadimplente no momento! Todos em dia.'}
                             </p>
                           );
                         }

                         return filtered.map(({ email, s }) => {
                           const customText = `Saudações, guerreiro ${s.name}! Passando para lembrar sobre a renovação da sua assinatura de acompanhamento na Viking Force. Vamos continuar os treinos e quebrar recordes? 💪⚔️`;
                           return (
                             <div key={email} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 flex justify-between items-center">
                               <div>
                                 <p className="text-sm font-bold text-white">{s.name}</p>
                                 <p className="text-[10px] text-viking-gold uppercase mt-0.5 font-viking-medieval font-bold">Mensalidade em {s.status}</p>
                               </div>
                               <a 
                                 href={`https://wa.me/5511999990000?text=${encodeURIComponent(customText)}`}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="px-3.5 py-2 rounded-xl bg-[#1ea453] hover:bg-[#167d3e] text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                               >
                                 <Phone className="w-3.5 h-3.5" /> Enviar Cobrança
                               </a>
                             </div>
                           );
                         });
                       })()}
                     </div>
                   </div>
                 )}

                {/* 7. Payments list (Trainer) */}
                {drawerType === 'payments' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80">Controle de fluxo de caixa referente à prestação de serviços de treinamento esportivo.</p>
                    
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

                    <div className="space-y-2">
                      {(() => {
                        const filtered = Object.keys(studentsData).filter(email => {
                          const s = studentsData[email];
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

                        return filtered.map(email => {
                          const s = studentsData[email];
                          return (
                            <div key={email} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-white">{s.name}</p>
                                <p className="text-xs text-viking-silver">{email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-white">R$ {getPlanPrice(s.plan).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <span className={`text-[9px] font-black uppercase ${s.status === 'Pago' ? 'text-emerald-400' : s.status === 'Pendente' ? 'text-amber-400' : 'text-red-400'}`}>
                                  {s.status}
                                </span>
                              </div>
                            </div>
                          );
                        });
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
                          const term = rpeSearch.toLowerCase().trim();
                          if (!term) return true;
                          return s.name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
                        });
                        const hasSessions = filteredEmails.some(email => studentsData[email].sessions.length > 0);
                        
                        return hasSessions ? (
                          filteredEmails.map(email => studentsData[email]).map(student => 
                            student.sessions.map((sess, sIdx) => (
                            <div key={`${student.name}-${sIdx}`} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white">{student.name}</span>
                                <span className="text-[10px] text-viking-silver">{sess.date}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-viking-gold font-bold">{sess.sessionName}</p>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  sess.avgRPE >= 9 
                                    ? 'bg-red-950/40 text-red-400 border border-red-800/30' 
                                    : sess.avgRPE >= 7.5
                                    ? 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                                    : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                                }`}>
                                  RPE Médio: {sess.avgRPE.toFixed(1)}
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
                                  <div key={eIdx} className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                      <span>{e.name}</span>
                                      {e.failed && (
                                        <span className="text-[8px] bg-red-950 text-red-400 font-bold px-1 rounded border border-red-900/40">FALHOU</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {e.achievedVolume !== undefined && e.plannedVolume !== undefined && (
                                        <span className="text-[10px] text-viking-silver/60">
                                          ({e.achievedVolume}/{e.plannedVolume})
                                        </span>
                                      )}
                                      <strong className={e.rpe >= 9 ? 'text-viking-red font-bold' : 'text-[#e0d3a8]'}>RPE {e.rpe}</strong>
                                    </div>
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
                      <p className="text-xs text-viking-gold font-bold uppercase tracking-wider">🗓️ Carregar Período</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Semana</label>
                          <select 
                            value={editorWeek}
                            onChange={e => handleEditorLoadWeekDay(parseInt(e.target.value), editorDay)}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          >
                            {Object.keys(trainingProgram.weeks).map(Number).sort((a,b) => a-b).map(wk => (
                              <option key={wk} value={wk} className="bg-[#140e0c] text-[#e0d3a8]">
                                Semana {wk}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Treino</label>
                          <select 
                            value={editorDay}
                            onChange={e => handleEditorLoadWeekDay(editorWeek, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          >
                            {Object.keys(trainingProgram.weeks[editorWeek] || { A: [], B: [], C: [] }).sort().map(day => (
                              <option key={day} value={day} className="bg-[#140e0c] text-[#e0d3a8]">
                                Treino {day}
                              </option>
                            ))}
                          </select>
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

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-viking-gold tracking-wider">Exercícios Prescritos ({editorExercises.length})</span>
                        <button 
                          onClick={handleEditorAddExercise}
                          className="px-2.5 py-1 text-xs bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black uppercase rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-viking-gold/10"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </button>
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

                        return filtered.map(({ ex, originalIdx }) => (
                          <div key={ex.id || originalIdx} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3 relative transition-all duration-300 hover:scale-[1.02] hover:border-viking-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                            
                            {/* Header row */}
                            <div className="flex justify-between items-center pb-2 border-b border-viking-gold/15">
                              <span className="text-xs text-viking-gold font-bold uppercase tracking-widest font-viking-medieval">#{originalIdx + 1} Exercício</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleEditorDuplicateExercise(originalIdx)}
                                  className="p-1 rounded hover:bg-viking-gold/10 text-viking-gold cursor-pointer"
                                  title="Duplicar Exercício"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleEditorRemoveExercise(originalIdx)}
                                  className="p-1 rounded hover:bg-red-950/40 text-red-400 cursor-pointer"
                                  title="Remover Exercício"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Standard fields */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2 relative">
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Nome do Exercício</label>
                                <div className="relative">
                                  <input 
                                    value={ex.name}
                                    onChange={e => {
                                      handleEditorUpdateField(originalIdx, 'name', e.target.value);
                                      setOpenDropdownIdx(originalIdx);
                                    }}
                                    onFocus={() => setOpenDropdownIdx(originalIdx)}
                                    className="w-full pl-3 pr-8 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                    placeholder="Escreva ou selecione..."
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => setOpenDropdownIdx(openDropdownIdx === originalIdx ? null : originalIdx)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-viking-silver hover:text-viking-gold cursor-pointer"
                                    title="Abrir Banco de Exercícios"
                                  >
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdownIdx === originalIdx ? 'rotate-90 text-viking-gold' : 'text-viking-silver/50'}`} />
                                  </button>
                                </div>

                                {openDropdownIdx === originalIdx && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setOpenDropdownIdx(null)} 
                                    />
                                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#140e0c] border-2 border-viking-gold/30 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.9)] z-55 p-1 flex flex-col gap-0.5 divide-y divide-viking-gold/10">
                                      {(() => {
                                        const query = ex.name.toLowerCase();
                                        const matches = dbExercises.filter(dbEx => 
                                          dbEx.name.toLowerCase().includes(query)
                                        );
                                        const listToShow = query === '' ? dbExercises : matches;

                                        if (listToShow.length === 0) {
                                          return (
                                            <div className="p-2 text-center text-[10px] text-viking-silver/50">
                                              Nenhum exercício encontrado.
                                            </div>
                                          );
                                        }

                                        return listToShow.map((dbEx) => (
                                          <button
                                            key={dbEx.id}
                                            type="button"
                                            onClick={() => {
                                              setEditorExercises(prev => prev.map((item, i) => {
                                                if (i === originalIdx) {
                                                  return {
                                                    ...item,
                                                    name: dbEx.name,
                                                    techniqueTips: dbEx.techniqueTips || '',
                                                    videoUrl: dbEx.videoUrl || ''
                                                  };
                                                }
                                                return item;
                                              }));
                                              setOpenDropdownIdx(null);
                                              showToast(`Exercício "${dbEx.name}" selecionado!`, 'success');
                                            }}
                                            className="w-full text-left p-2 hover:bg-viking-gold/15 rounded-lg text-xs font-semibold text-viking-silver hover:text-viking-gold flex flex-col gap-0.5 transition-all cursor-pointer"
                                          >
                                            <span className="font-bold text-white text-[10px] sm:text-[11px] uppercase tracking-wider">{dbEx.name}</span>
                                            {dbEx.techniqueTips && (
                                              <span className="text-[9px] text-viking-silver/60 truncate max-w-[280px] italic">Orientações: {dbEx.techniqueTips}</span>
                                            )}
                                          </button>
                                        ));
                                      })()}
                                    </div>
                                  </>
                                )}
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Séries</label>
                                <input 
                                  type="number"
                                  value={ex.sets}
                                  onChange={e => handleEditorUpdateField(originalIdx, 'sets', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Repetições</label>
                                <input 
                                  type="number"
                                  value={ex.reps}
                                  onChange={e => handleEditorUpdateField(originalIdx, 'reps', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Intensidade (%) ou Livre</label>
                                <input 
                                  value={typeof ex.intensity === 'number' ? Math.round(ex.intensity * 100) : ex.intensity}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const parsedNum = parseFloat(val);
                                    if (!isNaN(parsedNum) && parsedNum <= 100) {
                                      handleEditorUpdateField(originalIdx, 'intensity', parsedNum / 100);
                                    } else {
                                      handleEditorUpdateField(originalIdx, 'intensity', val);
                                    }
                                  }}
                                  placeholder="Ex: 80 ou Carga Livre"
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">RPE Alvo</label>
                                <input 
                                  type="number"
                                  step="0.5"
                                  value={ex.targetRPE}
                                  onChange={e => handleEditorUpdateField(originalIdx, 'targetRPE', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>

                              <div className="col-span-2 flex items-center gap-2 pt-1.5">
                                <input 
                                  type="checkbox"
                                  id={`chk-main-${originalIdx}`}
                                  checked={ex.main}
                                  onChange={e => handleEditorUpdateField(originalIdx, 'main', e.target.checked)}
                                  className="rounded border-viking-gold/30 text-viking-gold focus:ring-viking-gold bg-black/40 cursor-pointer"
                                />
                                <label htmlFor={`chk-main-${originalIdx}`} className="text-[10px] font-bold text-viking-silver uppercase tracking-wider cursor-pointer select-none">
                                  Habilitar Aquecimento Inteligente (Para agacho, supino e terra)
                                </label>
                              </div>

                              <div className="col-span-2 pt-1">
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Dicas de Técnica / Orientações para o Aluno</label>
                                <textarea 
                                  value={ex.techniqueTips || ''}
                                  onChange={e => handleEditorUpdateField(originalIdx, 'techniqueTips', e.target.value)}
                                  placeholder="Ex: Controlar a descida por 3s, expandir o peito na subida, forçar os joelhos para fora."
                                  rows={2}
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-medium text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30 resize-none"
                                />
                              </div>

                              <div className="col-span-2 pt-1">
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1 flex items-center gap-1">
                                  <Youtube className="w-3 h-3 text-red-500 animate-pulse" /> Link do YouTube (Vídeo de Execução)
                                </label>
                                <input 
                                  value={ex.videoUrl || ''}
                                  onChange={e => handleEditorUpdateField(originalIdx, 'videoUrl', e.target.value)}
                                  placeholder="Ex: https://www.youtube.com/watch?v=..."
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30"
                                />
                              </div>

                              <div className="col-span-2 pt-2 border-t border-viking-gold/10 mt-1">
                                <label className="block text-[9px] font-bold text-viking-gold uppercase mb-1 tracking-wider">⚡ Metodologia de Treino</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <select
                                      value={ex.methodology || 'standard'}
                                      onChange={e => handleEditorUpdateField(originalIdx, 'methodology', e.target.value)}
                                      className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                    >
                                      <option value="standard" className="bg-[#140e0c] text-[#e0d3a8]">Padrão (Séries Lineares)</option>
                                      <option value="backoff" className="bg-[#140e0c] text-[#e0d3a8]">Back-off Sets (Top Set + Recuo)</option>
                                      <option value="myoreps" className="bg-[#140e0c] text-[#e0d3a8]">Myo-Reps (Mini-Séries de Estimulação)</option>
                                      <option value="clusters" className="bg-[#140e0c] text-[#e0d3a8]">Cluster Sets (Repetições Agrupadas)</option>
                                      <option value="dropset" className="bg-[#140e0c] text-[#e0d3a8]">Drop Sets (Redução Pós-Falha)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      value={ex.methodologyDetails || ''}
                                      onChange={e => handleEditorUpdateField(originalIdx, 'methodologyDetails', e.target.value)}
                                      placeholder={
                                        ex.methodology === 'backoff' ? "Ex: 1 Top Set + 3 Sets de Recuo com -10%" :
                                        ex.methodology === 'myoreps' ? "Ex: Série Ativadora + 4 mini-sets de 3 reps" :
                                        ex.methodology === 'clusters' ? "Ex: 4x(3+3+3 reps com 15s descanso)" :
                                        ex.methodology === 'dropset' ? "Ex: Reduzir a carga em 30% após a falha" :
                                        "Opcional: Detalhes da metodologia..."
                                      }
                                      className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-semibold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Warmup editor nested inside exercise */}
                            {ex.main && (
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
                                        value={Math.round(step.percent * 100)}
                                        onChange={e => handleEditorUpdateWarmupStep(originalIdx, sIdx, 'percent', (parseFloat(e.target.value) || 0) / 100)}
                                        className="w-8 bg-black/40 border-none text-[#e0d3a8] text-center p-0 text-[10px] font-bold focus:ring-0 rounded"
                                      />
                                      <span className="text-viking-silver/80">% ×</span>
                                      <input 
                                        type="number"
                                        value={step.reps}
                                        onChange={e => handleEditorUpdateWarmupStep(originalIdx, sIdx, 'reps', parseInt(e.target.value) || 1)}
                                        className="w-6 bg-black/40 border-none text-[#e0d3a8] text-center p-0 text-[10px] font-bold focus:ring-0 rounded"
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
                            )}

                          </div>
                        ));
                      })()}

                      <div className="sticky bottom-0 pt-4 pb-2 bg-[#140e0c]/95 border-t border-viking-gold/15 flex gap-3">
                        <button 
                          onClick={handleEditorSaveProgram}
                          className="flex-1 py-3 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Save className="w-4 h-4 shrink-0" /> Salvar Prescrição
                        </button>
                        <button 
                          onClick={() => setDrawerOpen(false)}
                          className="px-5 py-3 rounded-xl bg-[#0d0908]/60 text-viking-silver hover:text-viking-gold border border-viking-gold/20 text-xs font-bold transition-all cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* 10. Direct Chat / Feedback Drawer */}
                {drawerType === 'chat' && (() => {
                  const targetEmail = currentUser?.role === 'trainer' ? activeChatStudentEmail : currentUser?.email;
                  const student = targetEmail ? studentsData[targetEmail.toLowerCase()] : null;
                  if (!student) return <p className="text-center text-viking-silver py-6">Carregando guerreiro...</p>;

                  const chatHistory = student.chatHistory || [];

                  return (
                    <div className="flex flex-col h-[62vh] max-h-[62vh] justify-between">
                      {/* Description / Instructions */}
                      <div className="px-1 pb-3 border-b border-viking-gold/10 text-xs text-viking-silver/80 flex items-center gap-1.5 shrink-0">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                        <span>Canal de feedback direto. Envie conselhos de ferro, correções ou dúvidas instantâneas.</span>
                      </div>

                      {/* Message List */}
                      <div ref={chatMessagesContainerRef} className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 scrollbar-thin scrollbar-thumb-viking-gold/20">
                        {chatHistory.length === 0 ? (
                          <div className="text-center py-12 text-viking-silver/50 space-y-2">
                            <MessageSquare className="w-10 h-10 mx-auto text-viking-gold/20" />
                            <p className="text-xs font-bold">Nenhuma mensagem trocada ainda.</p>
                            <p className="text-[11px]">Escreva abaixo para iniciar as orientações e motivar o clã!</p>
                          </div>
                        ) : (
                          chatHistory.map(msg => {
                            const isMe = (currentUser?.role === 'trainer' && msg.sender === 'trainer') ||
                                         (currentUser?.role === 'student' && msg.sender === 'student');

                            return (
                              <div 
                                key={msg.id} 
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
                                  {msg.text}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Form Input */}
                      <form onSubmit={handleSendActiveChatMessage} className="border-t border-viking-gold/15 pt-3 flex gap-2 shrink-0">
                        <input 
                          type="text"
                          value={chatMessageInput}
                          onChange={e => setChatMessageInput(e.target.value)}
                          placeholder="Digite um conselho de ferro ou feedback..."
                          className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-viking-gold/25 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30"
                          required
                        />
                        <button 
                          type="submit"
                          className="p-3 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-viking-gold/10"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
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
                          onClick={() => setEditingDbExercise({ id: '', name: '', techniqueTips: '', videoUrl: '' })}
                          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-viking-gold/10"
                        >
                          <Plus className="w-4 h-4" /> Incluir Exercício
                        </button>
                      )}
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

                        return filtered.map((ex) => {
                          const hasYoutube = !!ex.videoUrl;
                          const hasBase64 = !!ex.videoBase64;
                          const ytEmbedUrl = getYouTubeEmbedUrl(ex.videoUrl);

                          return (
                            <div 
                              key={ex.id} 
                              className="p-4 rounded-2xl bg-[#0d0908]/55 border border-viking-gold/10 hover:border-viking-gold/25 transition-all space-y-3"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Dumbbell className="w-4 h-4 text-viking-gold" /> {ex.name}
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

              </div>
            </motion.div>
          </>
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
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-[#140e0c]/98 border border-viking-gold/25 rounded-3xl z-50 flex flex-col max-h-[92vh] overflow-hidden text-[#e0d3a8] shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div className="p-6 border-b border-viking-gold/15 bg-[#140e0c]/90 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-viking-gold/10 flex items-center justify-center border border-viking-gold/20">
                    <Dumbbell className="w-5 h-5 text-viking-gold" />
                  </div>
                  <div>
                    <h3 className="font-viking-display text-sm sm:text-base font-black tracking-wider text-viking-gold">DIÁRIO DO GUERREIRO</h3>
                    <p className="text-[10px] text-viking-silver uppercase font-viking-medieval mt-0.5">Registre suas marcas e feedbacks</p>
                  </div>
                </div>
                <button 
                  onClick={() => setWorkoutModalOpen(false)}
                  className="p-1.5 rounded-xl bg-viking-gold/5 border border-viking-gold/20 text-viking-silver hover:text-viking-gold cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pb-28 md:pb-6 space-y-6">
                
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
                        {Object.keys(trainingProgram.weeks).map(Number).sort((a,b) => a-b).map(wk => (
                          <option key={wk} value={wk} className="bg-[#140e0c] text-[#e0d3a8]">
                            Semana {wk} {wk === 4 ? '(Deload)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Treino</label>
                      <select 
                        value={selectedDay}
                        onChange={e => { setSelectedDay(e.target.value); setSessionRpeState({}); setExerciseFailureState({}); }}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      >
                        {Object.keys(trainingProgram.weeks[selectedWeek] || { A: [], B: [], C: [] }).sort().map(day => {
                          let label = `Treino ${day}`;
                          if (day === 'A') label = 'Treino A (Agachamento Principal)';
                          else if (day === 'B') label = 'Treino B (Supino/Terra)';
                          else if (day === 'C') label = 'Treino C (GPP/Acessórios)';
                          return (
                            <option key={day} value={day} className="bg-[#140e0c] text-[#e0d3a8]">
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* RPE Explanatory note */}
                <div className="p-3.5 rounded-xl border border-dashed border-viking-gold/25 text-[11px] text-viking-silver leading-relaxed flex gap-2.5 bg-viking-gold/5">
                  <Info className="w-5 h-5 text-viking-gold shrink-0" />
                  <div>
                    <span className="font-bold text-viking-gold">Como funciona o RPE (Esforço Percebido)?</span> O RPE mede a intensidade de esforço real com base nas repetições restantes na reserva. RPE 8 significa que você parou tendo certeza de que conseguiria realizar exatamente mais 2 repetições. RPE 10 indica falha total. Logue seu cansaço real.
                  </div>
                </div>

                {/* Exercises list in workout */}
                <div className="space-y-4">
                  {(trainingProgram.weeks[selectedWeek]?.[selectedDay] || []).length === 0 ? (
                    <div className="text-center py-10 text-viking-silver/50 italic">
                      Nenhum exercício prescrito para a Semana {selectedWeek} - Treino {selectedDay} no momento.
                    </div>
                  ) : (
                    (trainingProgram.weeks[selectedWeek]?.[selectedDay] || []).map((ex, idx) => {
                      // Determine proper 1RM based on exercise identifier
                      let currentPr: number | null = null;
                      const exNameLower = ex.name.toLowerCase();
                      if (exNameLower.includes('agachamento') || exNameLower.includes('squat')) {
                        currentPr = activeStudentProfile.prs.squat;
                      } else if (exNameLower.includes('supino') || exNameLower.includes('bench')) {
                        currentPr = activeStudentProfile.prs.bench;
                      } else if (exNameLower.includes('terra') || exNameLower.includes('deadlift')) {
                        currentPr = activeStudentProfile.prs.deadlift;
                      }

                      const intensityStr = typeof ex.intensity === 'number' ? `${Math.round(ex.intensity * 100)}% 1RM` : ex.intensity;
                      const warmupArray = ex.main ? getWarmupSteps(currentPr, ex.intensity, ex.warmup) : null;

                      return (
                        <div key={ex.id || idx} className={`p-5 rounded-2xl border ${ex.main ? 'bg-gradient-to-br from-[#1a1210]/60 to-[#120b09]/60 border-viking-gold/30 shadow-[0_4px_20px_rgba(212,175,55,0.05)]' : 'bg-[#0d0908]/40 border-viking-gold/10'}`}>
                          
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <div>
                              <span className="text-[10px] text-viking-silver/65 uppercase tracking-wider font-viking-medieval">#{idx + 1} Exercício</span>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <h4 className="text-sm sm:text-base font-black text-white">
                                  {ex.name}
                                </h4>
                                {ex.main && <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Foco Principal</span>}
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
                                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-viking-gold hover:text-white bg-viking-gold/10 border border-viking-gold/25 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-viking-gold/10"
                                      title="Assistir execução no Templo"
                                    >
                                      <Video className="w-3.5 h-3.5 text-viking-gold" /> Ver Execução
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                            <span className="text-xs text-viking-silver">Séries: <strong className="text-white">{ex.sets}x{ex.reps}</strong> @ <strong className="text-viking-gold">{intensityStr}</strong></span>
                          </div>

                          {ex.techniqueTips && (
                            <div className="mb-4 p-3 rounded-xl bg-viking-gold/5 border border-viking-gold/15 flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-viking-gold shrink-0 mt-0.5" />
                              <div className="text-xs">
                                <span className="font-bold text-viking-gold">Orientações do Treinador:</span>{' '}
                                <span className="text-viking-silver/90">{ex.techniqueTips}</span>
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
                                    {warmupArray.map((w: any, wIdx) => (
                                      <React.Fragment key={wIdx}>
                                        <span className={w.isTarget ? 'text-viking-gold font-bold' : ''}>
                                          {w.reps}r @ <strong className="text-white">{w.weight} kg</strong> ({w.isTarget ? 'Alvo' : `${Math.round(w.percent * 100)}%`})
                                        </span>
                                        {wIdx < warmupArray.length - 1 && <span className="text-viking-gold/40">→</span>}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 bg-red-950/20 border-l-2 border-viking-red border-t border-r border-b border-viking-red/15 rounded-r-xl text-[10px] text-red-300">
                                  ⚠️ Sem 1RM cadastrado para este exercício! Cadastre seu 1RM no botão "Ajustar 1RM" para gerar o aquecimento automático em kg.
                                </div>
                              )}
                            </div>
                          )}

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

                        </div>
                      );
                    })
                  )}
                </div>

                {/* Session observation box */}
                <div className="space-y-2 pt-2">
                  <label htmlFor="sessionNote" className="block text-xs font-bold text-viking-silver uppercase tracking-wider">Notas de Desempenho (Opcional)</label>
                  <textarea 
                    id="sessionNote"
                    rows={3}
                    value={sessionNote}
                    onChange={e => setSessionNote(e.target.value)}
                    placeholder="Escreva como se sentiu hoje. Destaques, dores articulares ou velocidade das subidas..."
                    className="w-full p-4 rounded-xl bg-black/40 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/35 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold text-xs font-semibold"
                  />
                </div>

              </div>

              {/* Submit panel */}
              <div className="p-6 border-t border-viking-gold/15 bg-[#140e0c]/90 flex gap-3 shrink-0">
                <button 
                  onClick={handleWorkoutSubmit}
                  className="flex-1 py-3.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-viking-gold/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 shrink-0" /> Guardar Sessão de Treino
                </button>
                <button 
                  onClick={() => setWorkoutModalOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-[#0d0908]/60 text-viking-silver hover:text-viking-gold border border-viking-gold/20 text-xs font-bold transition-all cursor-pointer"
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
                      <button 
                        onClick={() => { setMobileMenuOpen(false); setWorkoutModalOpen(true); }}
                        className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Dumbbell className="w-4 h-4" /> Treino de Hoje
                      </button>
                      <button 
                        onClick={() => { setMobileMenuOpen(false); setDrawerType('history'); setDrawerTitle('Seu Histórico & RPE'); setDrawerOpen(true); }}
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
                    onClick={() => { setMobileMenuOpen(false); setDrawerType('exerciseLibrary'); setDrawerTitle('Biblioteca de Exercícios'); setDrawerOpen(true); }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-viking-gold" /> Biblioteca de Exercícios
                  </button>

                  <button 
                    onClick={() => { setMobileMenuOpen(false); setDrawerType('ranking'); setDrawerTitle('Ranking do Templo'); setDrawerOpen(true); }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" /> Classificação Geral
                  </button>

                  <button 
                    onClick={() => { setMobileMenuOpen(false); setDrawerType('plans'); setDrawerTitle('Aliança Viking - Planos'); setDrawerOpen(true); }}
                    className="p-3 text-left rounded-xl text-[#e0d3a8]/80 hover:text-viking-gold hover:bg-viking-gold/5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" /> Planos de Treino
                  </button>

                  <button 
                    onClick={() => { setMobileMenuOpen(false); setDrawerType('gmail'); setDrawerTitle('Correio de Valhalla (Gmail)'); setDrawerOpen(true); }}
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
                onClick={() => { setWorkoutModalOpen(true); setDrawerOpen(false); setMobileMenuOpen(false); }}
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
                onClick={() => { setWorkoutModalOpen(false); setDrawerType('history'); setDrawerTitle('Seu Histórico & RPE'); setDrawerOpen(true); setMobileMenuOpen(false); }}
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
                BANIR GUERREIRO?
              </h3>
              
              <p className="text-xs text-viking-silver mb-6 leading-relaxed">
                Tem certeza que deseja excluir o guerreiro <span className="text-white font-extrabold">{studentsData[deletingStudentEmail]?.name || deletingStudentEmail}</span> do templo? Todos os seus registros e treinos prescritos serão perdidos para sempre!
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
                    const copy = { ...studentsData };
                    delete copy[deletingStudentEmail];
                    saveStudentsToDB(copy);
                    setDeletingStudentEmail(null);
                    showToast("Atleta excluído com sucesso!", "success");
                  }}
                  className="py-3 rounded-xl bg-viking-red/20 hover:bg-viking-red/40 border border-viking-red/40 text-red-400 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Confirmar Exclusão
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

              <div className="p-5 bg-black/40">
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
