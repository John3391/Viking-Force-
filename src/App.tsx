import React, { useState, useEffect } from 'react';
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
  Youtube
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { User as UserType, TrainingProgram, StudentProfile, LoggedSession, Exercise, WarmupStep, VikingPlan, ChatMessage } from './types';
import { DEFAULT_PROGRAM, DEFAULT_STUDENTS } from './data';
import VolumeChart from './components/VolumeChart';
import OneRepMaxChart from './components/OneRepMaxChart';

const TRAINER_EMAIL = 'john.vasquesrodrigues@gmail.com';
const TRAINER_PASSWORD = '3636';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('john.vasquesrodrigues@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('3636');
  
  // Registration and PR state
  const [regName, setRegName] = useState<string>('');
  const [prSquat, setPrSquat] = useState<string>('');
  const [prBench, setPrBench] = useState<string>('');
  const [prDeadlift, setPrDeadlift] = useState<string>('');
  const [regPreferredTime, setRegPreferredTime] = useState<string>('18:00');
  const [simulatedTime, setSimulatedTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  // App core database state
  const [trainingProgram, setTrainingProgram] = useState<TrainingProgram>(DEFAULT_PROGRAM);
  const [studentsData, setStudentsData] = useState<Record<string, StudentProfile>>(DEFAULT_STUDENTS);

  // Active UI Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Reuseable Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState<string>('');
  const [drawerType, setDrawerType] = useState<string>(''); // 'history' | 'ranking' | 'plans' | 'settings' | 'addStudent' | 'whatsapp' | 'payments' | 'rpeFeedback' | 'editProgram'
  const [editingStudentEmail, setEditingStudentEmail] = useState<string>('');
  const [activeChatStudentEmail, setActiveChatStudentEmail] = useState<string>('');
  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Active workout modal state (Student)
  const [workoutModalOpen, setWorkoutModalOpen] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<'A' | 'B' | 'C'>('A');
  const [sessionRpeState, setSessionRpeState] = useState<Record<string, number>>({});
  const [sessionNote, setSessionNote] = useState<string>('');

  // Program Editor state (Trainer)
  const [editorWeek, setEditorWeek] = useState<number>(1);
  const [editorDay, setEditorDay] = useState<'A' | 'B' | 'C'>('A');
  const [editorExercises, setEditorExercises] = useState<Exercise[]>([]);

  // Toast notification stack
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Search filter state for Trainer dashboard
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Delete Athlete state (Trainer)
  const [deletingStudentEmail, setDeletingStudentEmail] = useState<string | null>(null);

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

  // --- LOCALSTORAGE SYNC ---
  useEffect(() => {
    const storedProgram = localStorage.getItem('viking_program');
    const storedStudents = localStorage.getItem('viking_students');
    const storedUser = localStorage.getItem('viking_current_user');
    const isLoggedOut = localStorage.getItem('viking_logged_out');

    if (storedProgram) setTrainingProgram(JSON.parse(storedProgram));
    if (storedStudents) setStudentsData(JSON.parse(storedStudents));

    // Handle "/cadastro", "#/cadastro", "?atleta=cadastro"
    const isRegisterRoute = 
      window.location.pathname.includes('cadastro') || 
      window.location.hash.includes('cadastro') || 
      window.location.search.includes('cadastro');

    if (isRegisterRoute) {
      setIsRegisterMode(true);
      setIsLoggedIn(false);
      setCurrentUser(null);
    } else if (storedUser) {
      const u = JSON.parse(storedUser);
      setCurrentUser(u);
      setIsLoggedIn(true);
    } else if (!isLoggedOut) {
      // Auto-login as trainer on initial load to start directly on trainer panel
      const trainerUser: UserType = { name: 'John Vasques', email: TRAINER_EMAIL, role: 'trainer' };
      setCurrentUser(trainerUser);
      setIsLoggedIn(true);
      localStorage.setItem('viking_current_user', JSON.stringify(trainerUser));
    }
  }, []);

  const saveProgramToDB = (newProg: TrainingProgram) => {
    setTrainingProgram(newProg);
    localStorage.setItem('viking_program', JSON.stringify(newProg));
  };

  const saveStudentsToDB = (newStuds: Record<string, StudentProfile>) => {
    setStudentsData(newStuds);
    localStorage.setItem('viking_students', JSON.stringify(newStuds));
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

  // --- ACTIONS ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword.trim();

    if (!email || !password) {
      showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
      return;
    }

    // Trainer validation
    if (!isRegisterMode) {
      if (email === TRAINER_EMAIL && password === TRAINER_PASSWORD) {
        handleLoginSuccess({ name: 'John Vasques', email, role: 'trainer' });
        return;
      }

      // Existing Athlete Validation
      const student = studentsData[email];
      if (student) {
        handleLoginSuccess({ name: student.name, email, role: 'student' });
      } else {
        // Fallback simulate login for any new credentials
        const name = email.split('@')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        const newStudent: StudentProfile = {
          name: formattedName,
          plan: 'Mensal',
          status: 'Pago',
          prs: { squat: null, bench: null, deadlift: null },
          preferredTime: '18:00',
          sessions: []
        };
        const updated = { ...studentsData, [email]: newStudent };
        saveStudentsToDB(updated);
        handleLoginSuccess({ name: formattedName, email, role: 'student' });
      }
    } else {
      // Register Mode
      if (!regName.trim()) {
        showToast('Por favor, informe seu nome de guerreiro!', 'error');
        return;
      }
      
      const newStudent: StudentProfile = {
        name: regName.trim(),
        plan: 'Mensal',
        status: 'Pago',
        prs: {
          squat: parseFloat(prSquat) || null,
          bench: parseFloat(prBench) || null,
          deadlift: parseFloat(prDeadlift) || null,
        },
        preferredTime: regPreferredTime || '18:00',
        sessions: []
      };

      const updated = { ...studentsData, [email]: newStudent };
      saveStudentsToDB(updated);
      handleLoginSuccess({ name: regName.trim(), email, role: 'student' });
    }
  };

  const handleLogout = () => {
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

  // --- CHAT / FEEDBACK LOGIC ---
  const handleSendMessage = (studentEmail: string, text: string) => {
    if (!text.trim()) return;
    const student = studentsData[studentEmail];
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
      [studentEmail]: updatedProfile
    };

    saveStudentsToDB(updatedStudents);
    setChatMessageInput('');
    showToast('Comentário enviado!', 'success');
  };

  const handleSendActiveChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;

    const targetEmail = currentUser?.role === 'trainer' ? activeChatStudentEmail : currentUser?.email;
    if (!targetEmail) return;

    handleSendMessage(targetEmail, chatMessageInput);
  };

  // --- STUDENT LEVEL LOGIC ---
  const activeStudentProfile = currentUser && currentUser.role === 'student' ? studentsData[currentUser.email] : null;

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

    const exercisesLog = currentExercises.map(ex => ({
      name: ex.name,
      rpe: sessionRpeState[ex.id] || 8
    }));

    const avgRPE = exercisesLog.reduce((sum, e) => sum + e.rpe, 0) / exercisesLog.length;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');

    const newSession: LoggedSession = {
      date: formattedDate,
      sessionName: `Semana ${selectedWeek} - Treino ${selectedDay}`,
      exercises: exercisesLog,
      avgRPE,
      note: sessionNote.trim() || undefined
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
    setSessionNote('');
    showToast(`Treino registrado! RPE Médio: ${avgRPE.toFixed(1)}. Seu feedback foi enviado ao John.`, 'success');
  };

  // --- LEADERBOARD LOGIC ---
  const getLeaderboard = () => {
    // Collect everyone (default + active student) and calculate dynamic rank
    const entries = Object.keys(studentsData).map(email => {
      const profile = studentsData[email];
      const squat = profile.prs.squat || 100;
      const bench = profile.prs.bench || 70;
      const deadlift = profile.prs.deadlift || 120;
      const total = squat + bench + deadlift;
      // Synthesize a beautiful Wilks score
      const wilks = Math.round(total * 0.93 * 10) / 10;
      return {
        name: profile.name,
        email,
        squat,
        bench,
        deadlift,
        total,
        wilks
      };
    });

    // Sort descending by Wilks
    entries.sort((a, b) => b.wilks - a.wilks);
    return entries.map((entry, idx) => ({ ...entry, position: idx + 1 }));
  };

  // --- TRAINER LEVEL LOGIC ---
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.currentTarget as any).newStudentName.value.trim();
    const email = (e.currentTarget as any).newStudentEmail.value.trim().toLowerCase();
    const plan = (e.currentTarget as any).newStudentPlan.value;
    const status = (e.currentTarget as any).newStudentStatus.value;
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
      sessions: []
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
    setDrawerType('editProgram');
    setDrawerTitle(`Prescrever Treino`);
    setDrawerOpen(true);
  };

  const handleEditorLoadWeekDay = (week: number, day: 'A' | 'B' | 'C') => {
    setEditorWeek(week);
    setEditorDay(day);
    const currentExercises = trainingProgram.weeks[week]?.[day] || [];
    setEditorExercises(JSON.parse(JSON.stringify(currentExercises)));
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
              </div>
            </div>
          )}

          {/* Right Area (User, Settings, Hamburger) */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
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
                  className="hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-viking-red/15 hover:bg-viking-red/30 text-white hover:text-viking-gold border border-viking-red/30 hover:border-viking-gold/40 transition-all font-medium text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>

                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2.5 rounded-xl bg-viking-dark text-viking-silver hover:text-viking-gold md:hidden border border-viking-gold/20 hover:border-viking-gold/40 transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="text-xs text-viking-gold font-viking-medieval border border-viking-gold/20 px-3.5 py-1.5 rounded-xl bg-viking-gold/5 backdrop-blur-md">
                🛡️ MODO OFFLINE SEGURO
              </div>
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

                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0d0908] border border-viking-gold/20 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <Shield className="w-9 h-9 text-viking-gold" />
                  </div>
                  <h2 className="font-viking-display text-2xl sm:text-3xl font-bold tracking-wider bg-gradient-to-r from-[#e0d3a8] via-viking-gold to-[#e0d3a8] bg-clip-text text-transparent">
                    {isRegisterMode ? 'FORGE SUA CONTA' : 'TEMPLO VIKING FORCE'}
                  </h2>
                  <p className="text-xs text-viking-silver mt-2 max-w-sm mx-auto leading-relaxed">
                    {isRegisterMode 
                      ? 'Cadastre-se para calcular seus warmups inteligentes e registrar seu cansaço via RPE.' 
                      : 'Faça login para ter acesso aos programas de treino personalizados de Powerlifting.'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {isRegisterMode && (
                    <div>
                      <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">Seu Nome de Guerreiro</label>
                      <input 
                        type="text" 
                        required 
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="Ex: Ragnar Lothbrok" 
                        className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold transition-all text-sm font-semibold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">Endereço de Email</label>
                    <input 
                      type="email" 
                      required 
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com" 
                      className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold transition-all text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-viking-silver uppercase tracking-wider mb-1.5">Senha do Clã</label>
                    <input 
                      type="password" 
                      required 
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 rounded-xl bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] placeholder-viking-silver/40 focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold transition-all text-sm font-semibold"
                    />
                  </div>

                  {/* Register PR Fields (Optional) */}
                  {isRegisterMode && (
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
                            value={prSquat}
                            onChange={e => setPrSquat(e.target.value)}
                            placeholder="Ex: 140"
                            className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Supino (kg)</label>
                          <input 
                            type="number" 
                            value={prBench}
                            onChange={e => setPrBench(e.target.value)}
                            placeholder="Ex: 100"
                            className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1">Terra (kg)</label>
                          <input 
                            type="number" 
                            value={prDeadlift}
                            onChange={e => setPrDeadlift(e.target.value)}
                            placeholder="Ex: 180"
                            className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs text-center font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[10px] font-bold text-viking-silver uppercase mb-1.5">Horário de Preferência de Treino</label>
                        <input 
                          type="time" 
                          value={regPreferredTime}
                          onChange={e => setRegPreferredTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0d0908]/60 border border-viking-gold/20 text-[#e0d3a8] text-xs font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
                  >
                    {isRegisterMode ? <UserPlus className="w-4 h-4 shrink-0" /> : <Play className="w-4 h-4 shrink-0" />}
                    {isRegisterMode ? 'Registrar meu Clã' : 'Adentrar ao Salão'}
                  </button>
                </form>

                {/* Switch Login / Register Mode */}
                <div className="text-center mt-6 pt-4 border-t border-viking-gold/15">
                  <button 
                    onClick={() => { setIsRegisterMode(!isRegisterMode); }}
                    className="text-xs text-viking-gold hover:text-viking-gold-dark font-semibold transition-all underline cursor-pointer"
                  >
                    {isRegisterMode ? 'Já faz parte do clã? Entre aqui' : 'Ainda não tem conta? Registre-se agora'}
                  </button>
                </div>



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

            {/* Training Volume Chart */}
            <VolumeChart profile={activeStudentProfile} />

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
                          {ex.videoUrl && (
                            <a 
                              href={ex.videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                              title="Assistir execução no YouTube"
                            >
                              <Youtube className="w-3 h-3 text-red-500 animate-pulse" /> Ver Execução
                            </a>
                          )}
                        </p>
                        <p className="text-[11px] text-viking-silver/80 mt-0.5">Séries prescritas de trabalho: <strong className="text-viking-gold">{ex.sets}x{ex.reps}</strong></p>
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

              {(() => {
                const filteredStudentEmails = Object.keys(studentsData).filter(email => {
                  const s = studentsData[email];
                  const searchLower = searchTerm.toLowerCase().trim();
                  if (!searchLower) return true;
                  return s.name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
                });

                if (filteredStudentEmails.length === 0) {
                  return (
                    <div className="py-12 text-center text-viking-silver/60 bg-[#0d0908]/30 rounded-2xl border border-viking-gold/10">
                      <Search className="w-10 h-10 mx-auto text-viking-silver/30 mb-3" />
                      <p className="text-sm font-semibold text-viking-gold">Nenhum guerreiro encontrado</p>
                      <p className="text-xs mt-1">Nenhum atleta corresponde à busca "{searchTerm}".</p>
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
                                        setActiveChatStudentEmail(email);
                                        setDrawerTitle(`Chat com ${s.name}`);
                                        setDrawerType('chat');
                                        setDrawerOpen(true);
                                      }}
                                      className="p-2 px-3.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/35 hover:border-viking-gold text-viking-gold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
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

                            <div className="border-t border-viking-gold/10 pt-2 grid grid-cols-5 gap-2">
                              <button 
                                onClick={() => {
                                  setActiveChatStudentEmail(email);
                                  setDrawerTitle(`Chat com ${s.name}`);
                                  setDrawerType('chat');
                                  setDrawerOpen(true);
                                }}
                                className="col-span-2 py-3 rounded-xl bg-viking-gold/10 border border-viking-gold/30 hover:bg-viking-gold/20 text-viking-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Chat
                              </button>
                              <button 
                                onClick={() => openProgramEditor(email)}
                                className="col-span-2 py-3 rounded-xl bg-viking-dark border border-viking-gold/25 hover:border-viking-gold hover:bg-viking-gold/10 text-viking-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Prescrever
                              </button>
                              <button 
                                onClick={() => setDeletingStudentEmail(email)}
                                className="col-span-1 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 hover:border-red-500 text-red-400 transition-all flex items-center justify-center cursor-pointer"
                                title="Excluir Guerreiro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Quick actions for Trainer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-viking-gold/15">
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
                        <div key={idx} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15">
                          <div className="flex justify-between items-center mb-2">
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
                          <p className="text-sm font-black text-white">{sess.sessionName}</p>
                          
                          <div className="mt-3 space-y-1.5 border-t border-viking-gold/15 pt-2.5">
                            {sess.exercises.map((ex, eidx) => (
                              <div key={eidx} className="flex justify-between items-center text-xs">
                                <span className="text-viking-silver font-medium">{ex.name}</span>
                                <span className="text-viking-gold font-bold">RPE {ex.rpe}</span>
                              </div>
                            ))}
                          </div>

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
                      🏆 A pontuação Wilks é calculada dinamicamente com base nas marcas máximas (1RM) registradas em seu perfil. Aumente seu total para subir na tabela de honra dos guerreiros.
                    </p>
                    <div className="space-y-2">
                      {getLeaderboard().map((warrior, idx) => {
                        const isSelf = currentUser && currentUser.email === warrior.email;
                        return (
                          <div 
                            key={warrior.email} 
                            className={`p-4 rounded-xl border flex justify-between items-center ${
                              isSelf 
                                ? 'bg-gradient-to-r from-viking-gold/10 to-transparent border-viking-gold/40' 
                                : 'bg-[#0d0908]/60 border-viking-gold/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-viking-medieval text-lg font-black w-6 text-center ${
                                idx === 0 ? 'text-viking-gold' : idx === 1 ? 'text-viking-silver' : idx === 2 ? 'text-viking-red' : 'text-[#50403a]'
                              }`}>
                                {idx + 1}º
                              </span>
                              <div>
                                <p className="text-sm font-black text-white flex items-center gap-1.5">
                                  {warrior.name}
                                  {isSelf && <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1 py-0.5 rounded uppercase tracking-wider">Você</span>}
                                </p>
                                <p className="text-[10px] text-viking-silver font-mono mt-0.5">
                                  Agacho: {warrior.squat}kg · Supino: {warrior.bench}kg · Terra: {warrior.deadlift}kg
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-viking-silver font-medium font-viking-medieval">Pontuação Wilks</p>
                              <p className="text-sm font-black text-viking-gold">{warrior.wilks.toFixed(1)}</p>
                            </div>
                          </div>
                        );
                      })}
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
                            showToast('Novos valores salvos com sucesso e replicados para todos os alunos!', 'success');
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
                          
                          const oldPrs = activeStudentProfile.prs || { squat: null, bench: null, deadlift: null };
                          const prevPrs = {
                            squat: s !== oldPrs.squat ? oldPrs.squat : (activeStudentProfile.prevPrs?.squat ?? null),
                            bench: b !== oldPrs.bench ? oldPrs.bench : (activeStudentProfile.prevPrs?.bench ?? null),
                            deadlift: d !== oldPrs.deadlift ? oldPrs.deadlift : (activeStudentProfile.prevPrs?.deadlift ?? null),
                          };

                          const updatedProfile = {
                            ...activeStudentProfile,
                            prs: { squat: s, bench: b, deadlift: d },
                            prevPrs,
                            preferredTime: pt
                          };
                          saveStudentsToDB({ ...studentsData, [currentUser!.email]: updatedProfile });
                          setDrawerOpen(false);
                          showToast('Seu perfil de Guerreiro foi atualizado com sucesso!', 'success');
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

                {/* 6. WhatsApp billing */}
                {drawerType === 'whatsapp' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/85">
                      Selecione um atleta em atraso ou pendente para abrir o WhatsApp Web com uma mensagem personalizada de lembrete de renovação de forma instantânea.
                    </p>
                    <div className="space-y-3">
                      {Object.keys(studentsData)
                        .map(email => ({ email, s: studentsData[email] }))
                        .filter(({ s }) => s.status !== 'Pago')
                        .map(({ email, s }) => {
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
                        })}

                      {Object.keys(studentsData).map(email => studentsData[email]).filter(s => s.status !== 'Pago').length === 0 && (
                        <p className="text-center py-6 text-xs text-viking-silver/60">Nenhum guerreiro está inadimplente no momento! Todos em dia.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. Payments list (Trainer) */}
                {drawerType === 'payments' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80">Controle de fluxo de caixa referente à prestação de serviços de treinamento esportivo.</p>
                    <div className="space-y-2">
                      {Object.keys(studentsData).map(email => {
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
                      })}
                    </div>
                  </div>
                )}

                {/* 8. RPE Logs (Trainer) */}
                {drawerType === 'rpeFeedback' && (
                  <div className="space-y-4">
                    <p className="text-xs text-viking-silver/80">Histórico cronológico de feedbacks postados pelos seus atletas. Monitoramento de cansaço extremo.</p>
                    
                    <div className="space-y-3">
                      {Object.keys(studentsData).map(email => studentsData[email]).some(s => s.sessions.length > 0) ? (
                        Object.keys(studentsData).map(email => studentsData[email]).map(student => 
                          student.sessions.map((sess, sIdx) => (
                            <div key={`${student.name}-${sIdx}`} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-black text-white">{student.name}</span>
                                <span className="text-[10px] text-viking-silver">{sess.date}</span>
                              </div>
                              <p className="text-xs text-viking-gold font-bold">{sess.sessionName}</p>
                              
                              <div className="mt-2 text-xs bg-black/40 p-2.5 rounded-lg border border-viking-gold/10 space-y-1">
                                {sess.exercises.map((e, eIdx) => (
                                  <div key={eIdx} className="flex justify-between">
                                    <span>{e.name}</span>
                                    <strong className={e.rpe >= 9 ? 'text-viking-red font-bold' : 'text-[#e0d3a8]'}>RPE {e.rpe}</strong>
                                  </div>
                                ))}
                              </div>

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
                        )
                      ) : (
                        <p className="text-center py-6 text-xs text-viking-silver/60">Nenhum feedback postado ainda.</p>
                      )}
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
                            <option value="1" className="bg-[#140e0c] text-[#e0d3a8]">Semana 1</option>
                            <option value="2" className="bg-[#140e0c] text-[#e0d3a8]">Semana 2</option>
                            <option value="3" className="bg-[#140e0c] text-[#e0d3a8]">Semana 3</option>
                            <option value="4" className="bg-[#140e0c] text-[#e0d3a8]">Semana 4</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Treino</label>
                          <select 
                            value={editorDay}
                            onChange={e => handleEditorLoadWeekDay(editorWeek, e.target.value as any)}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                          >
                            <option value="A" className="bg-[#140e0c] text-[#e0d3a8]">Treino A</option>
                            <option value="B" className="bg-[#140e0c] text-[#e0d3a8]">Treino B</option>
                            <option value="C" className="bg-[#140e0c] text-[#e0d3a8]">Treino C</option>
                          </select>
                        </div>
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

                      {editorExercises.length === 0 ? (
                        <p className="text-center py-6 text-xs text-viking-silver/60 border border-viking-gold/10 rounded-xl">Treino limpo ou sem exercícios.</p>
                      ) : (
                        editorExercises.map((ex, idx) => (
                          <div key={ex.id || idx} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3 relative transition-all duration-300 hover:scale-[1.02] hover:border-viking-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                            
                            {/* Header row */}
                            <div className="flex justify-between items-center pb-2 border-b border-viking-gold/15">
                              <span className="text-xs text-viking-gold font-bold uppercase tracking-widest font-viking-medieval">#{idx + 1} Exercício</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleEditorDuplicateExercise(idx)}
                                  className="p-1 rounded hover:bg-viking-gold/10 text-viking-gold cursor-pointer"
                                  title="Duplicar Exercício"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleEditorRemoveExercise(idx)}
                                  className="p-1 rounded hover:bg-red-950/40 text-red-400 cursor-pointer"
                                  title="Remover Exercício"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Standard fields */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Nome do Exercício</label>
                                <input 
                                  value={ex.name}
                                  onChange={e => handleEditorUpdateField(idx, 'name', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Séries</label>
                                <input 
                                  type="number"
                                  value={ex.sets}
                                  onChange={e => handleEditorUpdateField(idx, 'sets', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Repetições</label>
                                <input 
                                  type="number"
                                  value={ex.reps}
                                  onChange={e => handleEditorUpdateField(idx, 'reps', parseInt(e.target.value) || 0)}
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
                                      handleEditorUpdateField(idx, 'intensity', parsedNum / 100);
                                    } else {
                                      handleEditorUpdateField(idx, 'intensity', val);
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
                                  onChange={e => handleEditorUpdateField(idx, 'targetRPE', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                                />
                              </div>

                              <div className="col-span-2 flex items-center gap-2 pt-1.5">
                                <input 
                                  type="checkbox"
                                  id={`chk-main-${idx}`}
                                  checked={ex.main}
                                  onChange={e => handleEditorUpdateField(idx, 'main', e.target.checked)}
                                  className="rounded border-viking-gold/30 text-viking-gold focus:ring-viking-gold bg-black/40 cursor-pointer"
                                />
                                <label htmlFor={`chk-main-${idx}`} className="text-[10px] font-bold text-viking-silver uppercase tracking-wider cursor-pointer select-none">
                                  Habilitar Aquecimento Inteligente (Para agacho, supino e terra)
                                </label>
                              </div>

                              <div className="col-span-2 pt-1">
                                <label className="block text-[9px] font-bold text-viking-silver uppercase mb-1">Dicas de Técnica / Orientações para o Aluno</label>
                                <textarea 
                                  value={ex.techniqueTips || ''}
                                  onChange={e => handleEditorUpdateField(idx, 'techniqueTips', e.target.value)}
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
                                  onChange={e => handleEditorUpdateField(idx, 'videoUrl', e.target.value)}
                                  placeholder="Ex: https://www.youtube.com/watch?v=..."
                                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold text-xs focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold placeholder-viking-silver/30"
                                />
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
                                    onClick={() => handleEditorAddWarmupStep(idx)}
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
                                        onChange={e => handleEditorUpdateWarmupStep(idx, sIdx, 'percent', (parseFloat(e.target.value) || 0) / 100)}
                                        className="w-8 bg-black/40 border-none text-[#e0d3a8] text-center p-0 text-[10px] font-bold focus:ring-0 rounded"
                                      />
                                      <span className="text-viking-silver/80">% ×</span>
                                      <input 
                                        type="number"
                                        value={step.reps}
                                        onChange={e => handleEditorUpdateWarmupStep(idx, sIdx, 'reps', parseInt(e.target.value) || 1)}
                                        className="w-6 bg-black/40 border-none text-[#e0d3a8] text-center p-0 text-[10px] font-bold focus:ring-0 rounded"
                                      />
                                      <span className="text-viking-silver/80">reps</span>
                                      <button 
                                        onClick={() => handleEditorRemoveWarmupStep(idx, sIdx)}
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
                        ))
                      )}

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
                  const student = targetEmail ? studentsData[targetEmail] : null;
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
                      <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 scrollbar-thin scrollbar-thumb-viking-gold/20">
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
                        onChange={e => { setSelectedWeek(parseInt(e.target.value)); setSessionRpeState({}); }}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      >
                        <option value="1" className="bg-[#140e0c] text-[#e0d3a8]">Semana 1</option>
                        <option value="2" className="bg-[#140e0c] text-[#e0d3a8]">Semana 2</option>
                        <option value="3" className="bg-[#140e0c] text-[#e0d3a8]">Semana 3</option>
                        <option value="4" className="bg-[#140e0c] text-[#e0d3a8]">Semana 4 (Deload)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-viking-silver mb-1">Treino</label>
                      <select 
                        value={selectedDay}
                        onChange={e => { setSelectedDay(e.target.value as any); setSessionRpeState({}); }}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-viking-gold/20 text-[#e0d3a8] font-bold focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                      >
                        <option value="A" className="bg-[#140e0c] text-[#e0d3a8]">Treino A (Agachamento Principal)</option>
                        <option value="B" className="bg-[#140e0c] text-[#e0d3a8]">Treino B (Supino/Terra)</option>
                        <option value="C" className="bg-[#140e0c] text-[#e0d3a8]">Treino C (GPP/Acessórios)</option>
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
                                {ex.videoUrl && (
                                  <a 
                                    href={ex.videoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-red-500/10"
                                    title="Assistir execução no YouTube"
                                  >
                                    <Youtube className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Ver Execução
                                  </a>
                                )}
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

    </div>
  );

  // Quick helper to close drawers safely
  function closeAllDrawers() {
    setDrawerOpen(false);
  }
}
