import React, { useState } from 'react';
import { CardioSession, CardioGoal, CardioPrescription, StudentProfile } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Flame, 
  Target, 
  Plus, 
  Zap, 
  Trash2, 
  Award, 
  TrendingUp, 
  Clock, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Play
} from 'lucide-react';

interface CardioViewProps {
  profile: StudentProfile;
  role: 'student' | 'trainer';
  onAddSession: (session: CardioSession) => void;
  onAddGoal: (goal: CardioGoal) => void;
  onAddPrescription?: (prescription: CardioPrescription) => void;
  onDeleteSession?: (sessionId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  onDeletePrescription?: (prescriptionId: string) => void;
  onUpdateGoalStatus?: (goalId: string, completed: boolean) => void;
}

export const CardioView: React.FC<CardioViewProps> = ({ 
  profile, 
  role, 
  onAddSession, 
  onAddGoal,
  onAddPrescription,
  onDeleteSession,
  onDeleteGoal,
  onDeletePrescription,
  onUpdateGoalStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'charts' | 'prescribe' | 'log'>('charts');
  
  // Form States
  const [sessionType, setSessionType] = useState<'running' | 'cycling' | 'rowing' | 'sprints' | 'other'>('running');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [sprintSpeed, setSprintSpeed] = useState<string>('');
  const [sprintTime, setSprintTime] = useState<string>('');
  const [pace, setPace] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Goal Form States
  const [goalType, setGoalType] = useState<'running' | 'cycling' | 'rowing' | 'sprints' | 'other'>('running');
  const [goalTitle, setGoalTitle] = useState<string>('');
  const [goalDistance, setGoalDistance] = useState<string>('');
  const [goalDuration, setGoalDuration] = useState<string>('');
  const [goalSprintSpeed, setGoalSprintSpeed] = useState<string>('');
  const [goalDeadline, setGoalDeadline] = useState<string>('');

  // Prescription Form States
  const [prescType, setPrescType] = useState<'running' | 'cycling' | 'rowing' | 'sprints' | 'other'>('running');
  const [prescFreq, setPrescFreq] = useState<string>('3x por semana');
  const [prescInstructions, setPrescInstructions] = useState<string>('');
  const [prescDistance, setPrescDistance] = useState<string>('');
  const [prescDuration, setPrescDuration] = useState<string>('');
  const [prescIntensity, setPrescIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');

  // Selected prescription to log (satisfies quick-log flow)
  const [activeQuickLog, setActiveQuickLog] = useState<CardioPrescription | null>(null);

  const sessions = profile.cardioSessions || [];
  const goals = profile.cardioGoals || [];
  const prescriptions = profile.cardioPrescriptions || [];

  // Summary statistics
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalKm = sessions.reduce((acc, s) => acc + (s.distanceKm || 0), 0);
  const maxSprint = sessions.reduce((acc, s) => Math.max(acc, s.sprintSpeedKmh || 0), 0);
  const completedGoalsCount = goals.filter(g => g.completed).length;

  const handleLogPrescribed = (p: CardioPrescription) => {
    setActiveQuickLog(p);
    setSessionType(p.type);
    setDuration(p.targetDurationMinutes?.toString() || '');
    setDistance(p.targetDistanceKm?.toString() || '');
    setIntensity(p.targetIntensity || 'moderate');
    setSprintSpeed('');
    setSprintTime('');
    setPace('');
    setNote(`Realizado conforme prescrição do treinador.`);
    setActiveSubTab('log');
  };

  const submitSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionDate || !duration) return;

    const newSession: CardioSession = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(7),
      date: sessionDate,
      type: sessionType,
      durationMinutes: parseInt(duration),
      distanceKm: distance ? parseFloat(distance) : undefined,
      intensity,
      sprintSpeedKmh: sprintSpeed ? parseFloat(sprintSpeed) : undefined,
      sprintTimeSeconds: sprintTime ? parseInt(sprintTime) : undefined,
      paceMinPerKm: pace || undefined,
      note: note || undefined
    };

    onAddSession(newSession);
    setActiveQuickLog(null);
    setDuration('');
    setDistance('');
    setSprintSpeed('');
    setSprintTime('');
    setPace('');
    setNote('');
    setActiveSubTab('charts');
  };

  const submitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;

    const newGoal: CardioGoal = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(7),
      type: goalType,
      title: goalTitle,
      targetDistanceKm: goalDistance ? parseFloat(goalDistance) : undefined,
      targetDurationMinutes: goalDuration ? parseInt(goalDuration) : undefined,
      targetSprintSpeedKmh: goalSprintSpeed ? parseFloat(goalSprintSpeed) : undefined,
      deadline: goalDeadline || undefined,
      completed: false
    };

    onAddGoal(newGoal);
    setGoalTitle('');
    setGoalDistance('');
    setGoalDuration('');
    setGoalSprintSpeed('');
    setGoalDeadline('');
  };

  const submitPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescFreq || !prescInstructions) return;

    if (onAddPrescription) {
      const newPrescription: CardioPrescription = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substring(7),
        type: prescType,
        frequency: prescFreq,
        instructions: prescInstructions,
        targetDistanceKm: prescDistance ? parseFloat(prescDistance) : undefined,
        targetDurationMinutes: prescDuration ? parseInt(prescDuration) : undefined,
        targetIntensity: prescIntensity,
        datePrescribed: new Date().toISOString().split('T')[0]
      };
      onAddPrescription(newPrescription);
      setPrescInstructions('');
      setPrescDistance('');
      setPrescDuration('');
      showActivePrescriptionToast();
    }
  };

  const showActivePrescriptionToast = () => {
    // Standard visual feedback
  };

  // Prepare chart data chronologically
  const chartData = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => {
      const activityLabels: Record<string, string> = {
        running: 'Corrida',
        cycling: 'Bicicleta',
        rowing: 'Remo',
        sprints: 'Sprints',
        other: 'Outro'
      };
      return {
        ...s,
        formattedDate: s.date.split('-').reverse().slice(0, 2).join('/'),
        tipo: activityLabels[s.type] || s.type,
        'Volume (min)': s.durationMinutes,
        'Distância (km)': s.distanceKm || 0,
        'Velocidade Sprint (km/h)': s.sprintSpeedKmh || 0,
      };
    });

  const translateType = (type: string) => {
    const dict: Record<string, string> = {
      running: 'Corrida 🏃',
      cycling: 'Ciclismo 🚴',
      rowing: 'Remo 🚣',
      sprints: 'Sprints 🔥',
      other: 'Outro ⚡'
    };
    return dict[type] || type;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Decorative Banner */}
      <div className="bg-gradient-to-br from-amber-600/10 via-[#1e1310]/95 to-amber-950/25 border-2 border-viking-gold/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-4 top-4 text-viking-gold/10 pointer-events-none">
          <Flame className="w-32 h-32 rotate-12 animate-pulse" />
        </div>
        <div className="flex items-start gap-4">
          <span className="p-3.5 rounded-2xl bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark shrink-0 shadow-lg shadow-viking-gold/25 mt-1">
            <Zap className="w-7 h-7" />
          </span>
          <div className="space-y-1 pr-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-viking-gold bg-viking-gold/10 px-2.5 py-1 rounded-md border border-viking-gold/20">
              Forja Cardiorrespiratória
            </span>
            <h2 className="font-viking-display text-2xl font-black text-white tracking-wide">
              CARDIO & METAS DE CORRIDA
            </h2>
            <p className="text-viking-silver hover:text-white transition-colors text-sm font-semibold">
              Treine sua resistência de guerreiro, domine os limites e acompanhe seu progresso rumo ao topo de Valhalla.
            </p>
          </div>
        </div>
      </div>

      {/* Glory Stats (Metric Dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#150e0c] border border-viking-gold/15 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <span className="text-xs text-viking-silver uppercase font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-viking-gold" /> Total Cardio
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{totalMinutes}</span>
            <span className="text-xs text-viking-silver/60">min</span>
          </div>
        </div>

        <div className="bg-[#150e0c] border border-viking-gold/15 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <span className="text-xs text-viking-silver uppercase font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-viking-gold" /> Distância Total
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{totalKm.toFixed(1)}</span>
            <span className="text-xs text-viking-silver/60">km</span>
          </div>
        </div>

        <div className="bg-[#150e0c] border border-viking-gold/15 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <span className="text-xs text-viking-silver uppercase font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Sprint Máximo
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400">{maxSprint > 0 ? maxSprint : '-'}</span>
            <span className="text-xs text-viking-silver/60">{maxSprint > 0 ? 'km/h' : 'N/A'}</span>
          </div>
        </div>

        <div className="bg-[#150e0c] border border-viking-gold/15 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <span className="text-xs text-viking-silver uppercase font-bold flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" /> Metas Concluídas
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400">{completedGoalsCount}</span>
            <span className="text-xs text-viking-silver/60">/ {goals.length}</span>
          </div>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex bg-[#0f0a08] border border-viking-gold/20 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveSubTab('charts')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'charts' 
              ? 'bg-viking-gold text-viking-dark shadow-md font-black' 
              : 'text-viking-silver hover:text-white'
          }`}
        >
          Análise & Gráficos
        </button>
        <button
          onClick={() => setActiveSubTab('log')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'log' 
              ? 'bg-viking-gold text-viking-dark shadow-md font-black' 
              : 'text-viking-silver hover:text-white'
          }`}
        >
          Registrar Treino
        </button>
        {(role === 'trainer' || prescriptions.length > 0) && (
          <button
            onClick={() => setActiveSubTab('prescribe')}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'prescribe' 
                ? 'bg-viking-gold text-viking-dark shadow-md font-black' 
                : 'text-viking-silver hover:text-white'
            }`}
          >
            Prescritos
          </button>
        )}
      </div>

      {/* TAB 1: CHARTS & METRICS */}
      {activeSubTab === 'charts' && (
        <div className="space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Geral de Cardio */}
            <div className="bg-[#140e0c]/85 border border-viking-gold/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-viking-display text-sm font-black text-viking-gold uppercase tracking-wider">Volume Cardio Geral</h3>
                  <p className="text-[11px] text-viking-silver/60">Minutos acumulados por dia de esforço</p>
                </div>
                <Clock className="w-5 h-5 text-viking-gold/40" />
              </div>
              
              {chartData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center border border-viking-gold/10 border-dashed rounded-xl bg-viking-darker/30">
                  <p className="text-xs text-viking-silver/40 font-semibold italic">Nenhum treino de cardio registrado para plotar.</p>
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a3f35" opacity={0.3} />
                      <XAxis dataKey="formattedDate" stroke="#e0d3a8" fontSize={10} />
                      <YAxis stroke="#e0d3a8" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#140e0c', borderColor: '#d4af37', borderRadius: '12px' }}
                        labelStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#e0d3a8' }} />
                      <Bar name="Minutos" dataKey="Volume (min)" fill="#d4af37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Gráfico de Corrida e Sprints */}
            <div className="bg-[#140e0c]/85 border border-viking-gold/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-viking-display text-sm font-black text-viking-gold uppercase tracking-wider">Evolução de Corrida & Sprints</h3>
                  <p className="text-[11px] text-viking-silver/60">Análise de distâncias (km) e picos de sprint (km/h)</p>
                </div>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              
              {chartData.filter(d => d.type === 'running' || d.type === 'sprints').length === 0 ? (
                <div className="h-[250px] flex items-center justify-center border border-viking-gold/10 border-dashed rounded-xl bg-viking-darker/30">
                  <p className="text-xs text-viking-silver/40 font-semibold italic">Nenhum registro de Corrida ou Sprints para plotar.</p>
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSprint" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a3f35" opacity={0.3} />
                      <XAxis dataKey="formattedDate" stroke="#e0d3a8" fontSize={10} />
                      <YAxis stroke="#e0d3a8" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#140e0c', borderColor: '#d4af37', borderRadius: '12px' }}
                        labelStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#e0d3a8' }} />
                      <Area name="Corrida (km)" type="monotone" dataKey="Distância (km)" stroke="#d4af37" fillOpacity={1} fill="url(#colorDistance)" strokeWidth={2} />
                      <Area name="Sprint Máx (km/h)" type="monotone" dataKey="Velocidade Sprint (km/h)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSprint)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Active Goals Board */}
          <div className="bg-[#140e0c]/85 border border-viking-gold/20 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-viking-gold/10 pb-3">
              <div>
                <h3 className="font-viking-display text-sm font-black text-viking-gold uppercase tracking-wider">Objetivos de Velocidade & Resistência</h3>
                <p className="text-[11px] text-viking-silver/60">Metas ativas para superar marcas pessoais</p>
              </div>
              <Target className="w-5 h-5 text-viking-gold" />
            </div>

            {goals.length === 0 ? (
              <div className="p-8 text-center border border-viking-gold/10 border-dashed rounded-xl">
                <p className="text-xs text-viking-silver/50 italic">Nenhum objetivo ou meta de sprint cadastrado pelo guerreiro ou mestre.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(g => {
                  const runningTotalForGoal = sessions
                    .filter(s => s.type === g.type)
                    .reduce((acc, s) => acc + (g.targetDistanceKm ? (s.distanceKm || 0) : s.durationMinutes), 0);
                  const goalTarget = g.targetDistanceKm || g.targetDurationMinutes || 1;
                  const progressPercentage = Math.min(100, Math.round((runningTotalForGoal / goalTarget) * 100));

                  return (
                    <div 
                      key={g.id} 
                      className={`p-4 rounded-xl border relative transition-all ${
                        g.completed 
                          ? 'bg-emerald-950/15 border-emerald-500/30' 
                          : 'bg-viking-darker border-viking-gold/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-viking-gold bg-viking-gold/10 px-2 py-0.5 rounded border border-viking-gold/20 uppercase">
                            {translateType(g.type)}
                          </span>
                          <h4 className="text-xs font-black text-[#e0d3a8] pt-1">{g.title}</h4>
                        </div>
                        {onUpdateGoalStatus && (
                          <button
                            onClick={() => onUpdateGoalStatus(g.id, !g.completed)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              g.completed 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-[#140e0c] border-viking-gold/20 text-viking-silver/60 hover:text-viking-gold'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Display targets */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-viking-silver/80">
                        {g.targetDistanceKm && (
                          <div>
                            <span className="block text-[9px] text-viking-silver/45 font-bold uppercase">Distância</span>
                            <span className="font-semibold text-white">{g.targetDistanceKm} km</span>
                          </div>
                        )}
                        {g.targetDurationMinutes && (
                          <div>
                            <span className="block text-[9px] text-viking-silver/45 font-bold uppercase">Duração</span>
                            <span className="font-semibold text-white">{g.targetDurationMinutes} min</span>
                          </div>
                        )}
                        {g.targetSprintSpeedKmh && (
                          <div>
                            <span className="block text-[9px] text-viking-silver/45 font-bold uppercase">Sprint Alvo</span>
                            <span className="font-semibold text-amber-400 font-mono">{g.targetSprintSpeedKmh} km/h</span>
                          </div>
                        )}
                      </div>

                      {/* Goal Progress bar for non-sprint cumulative goals */}
                      {!g.targetSprintSpeedKmh && (
                        <div className="mt-3.5 space-y-1">
                          <div className="flex justify-between text-[10px] text-viking-silver/50">
                            <span>Progresso Acumulado</span>
                            <span className="font-mono">{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-[#100a08] h-1.5 rounded-full overflow-hidden border border-viking-gold/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${g.completed ? 'bg-emerald-500' : 'bg-viking-gold'}`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Achievement badge */}
                      {g.completed && (
                        <div className="absolute right-12 bottom-3 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold uppercase">
                          <Award className="w-3 h-3" /> Batida!
                        </div>
                      )}

                      {/* Delete option for trainer */}
                      {role === 'trainer' && onDeleteGoal && (
                        <button
                          onClick={() => onDeleteGoal(g.id)}
                          className="absolute right-3 bottom-3 text-viking-silver/40 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History Log Table */}
          <div className="bg-[#140e0c]/85 border border-viking-gold/20 p-5 rounded-2xl relative overflow-hidden">
            <h3 className="font-viking-display text-sm font-black text-viking-gold uppercase tracking-wider mb-4 border-b border-viking-gold/10 pb-3">Histórico de Treinos de Cardio</h3>
            {sessions.length === 0 ? (
              <div className="p-6 text-center text-viking-silver/40 italic text-xs">Nenhum treino registrado ainda.</div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-viking-gold/15 text-viking-silver/60 font-bold uppercase">
                      <th className="py-2.5 pr-2">Data</th>
                      <th className="py-2.5 px-2">Atividade</th>
                      <th className="py-2.5 px-2">Duração</th>
                      <th className="py-2.5 px-2">Distância</th>
                      <th className="py-2.5 px-2">Intensidade</th>
                      <th className="py-2.5 px-2">Sprint Máx</th>
                      <th className="py-2.5 px-2">Anotação</th>
                      {onDeleteSession && <th className="py-2.5 pl-2">Ação</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id} className="border-b border-viking-gold/5 hover:bg-viking-gold/5 transition-colors text-[#e0d3a8]">
                        <td className="py-3 pr-2 font-mono whitespace-nowrap">{s.date.split('-').reverse().join('/')}</td>
                        <td className="py-3 px-2 font-bold whitespace-nowrap">{translateType(s.type)}</td>
                        <td className="py-3 px-2 font-mono">{s.durationMinutes} min</td>
                        <td className="py-3 px-2 font-mono">{s.distanceKm ? `${s.distanceKm} km` : '-'}</td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.intensity === 'high' ? 'bg-red-950/40 text-red-400 border border-red-500/20' :
                            s.intensity === 'moderate' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {s.intensity === 'high' ? 'Alta' : s.intensity === 'moderate' ? 'Moderada' : 'Leve'}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-amber-400">{s.sprintSpeedKmh ? `${s.sprintSpeedKmh} km/h` : '-'}</td>
                        <td className="py-3 px-2 truncate max-w-[150px] text-viking-silver/80" title={s.note}>{s.note || '-'}</td>
                        {onDeleteSession && (
                          <td className="py-3 pl-2">
                            <button onClick={() => onDeleteSession(s.id)} className="text-red-400/80 hover:text-red-400 transition-colors cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LOG SESSIONS / QUICK SESSIONS */}
      {activeSubTab === 'log' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={submitSession} className="bg-[#140e0c]/85 border border-viking-gold/20 p-5 rounded-2xl relative overflow-hidden space-y-4">
              <h3 className="font-viking-display text-sm font-black text-viking-gold uppercase tracking-wider border-b border-viking-gold/10 pb-3">
                {activeQuickLog ? `Registrar Prescrição: ${translateType(activeQuickLog.type)}` : 'Registrar Sessão Manual'}
              </h3>

              {activeQuickLog && (
                <div className="p-3 bg-viking-gold/5 border border-viking-gold/15 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-viking-gold">Orientações do Treinador:</span>
                  <p className="text-viking-silver/85 italic">"{activeQuickLog.instructions}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Atividade</label>
                  <select 
                    value={sessionType}
                    onChange={e => setSessionType(e.target.value as any)}
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none cursor-pointer"
                  >
                    <option value="running">Corrida 🏃</option>
                    <option value="cycling">Ciclismo 🚴</option>
                    <option value="rowing">Remo 🚣</option>
                    <option value="sprints">Sprints de Velocidade 🔥</option>
                    <option value="other">Outra Atividade ⚡</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Data da Realização</label>
                  <input 
                    type="date"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Duração (Minutos)</label>
                  <input 
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="Tempo total"
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Distância Opcional (Km)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={distance}
                    onChange={e => setDistance(e.target.value)}
                    placeholder="Ex: 5.2"
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Intensidade Cardíaca</label>
                  <select 
                    value={intensity}
                    onChange={e => setIntensity(e.target.value as any)}
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none cursor-pointer"
                  >
                    <option value="low">Leve (Zona 1-2)</option>
                    <option value="moderate">Moderada (Zona 3-4)</option>
                    <option value="high">Alta / Esforço Máximo (Zona 5)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Pace Opcional (min/km)</label>
                  <input 
                    type="text"
                    value={pace}
                    onChange={e => setPace(e.target.value)}
                    placeholder="Ex: 5:12"
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                  />
                </div>

                {/* Sprints metrics */}
                {(sessionType === 'sprints' || sessionType === 'running') && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-500">Velocidade Máxima do Sprint (Km/h)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={sprintSpeed}
                        onChange={e => setSprintSpeed(e.target.value)}
                        placeholder="Ex: 24.5"
                        className="w-full bg-[#0d0908] border border-amber-500/30 hover:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-500">Tempo de Sprint Máximo (Segundos)</label>
                      <input 
                        type="number"
                        value={sprintTime}
                        onChange={e => setSprintTime(e.target.value)}
                        placeholder="Ex: 15"
                        className="w-full bg-[#0d0908] border border-amber-500/30 hover:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-viking-silver">Notas / Desempenho Espiritual</label>
                <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Relate sentimentos de força, superação de sprints ou batimentos..."
                  className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {activeQuickLog && (
                  <button 
                    type="button"
                    onClick={() => { setActiveQuickLog(null); setNote(''); }}
                    className="px-4 py-2 border border-viking-gold/20 hover:bg-viking-gold/10 text-viking-silver font-bold text-xs rounded-xl transition-all uppercase cursor-pointer"
                  >
                    Voltar Manual
                  </button>
                )}
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black text-xs rounded-xl transition-all uppercase cursor-pointer shadow-md shadow-viking-gold/15"
                >
                  Registrar Sessão ⚔️
                </button>
              </div>
            </form>
          </div>

          {/* Goals and sprint target setter */}
          <div className="space-y-6">
            <form onSubmit={submitGoal} className="bg-[#140e0c]/85 border border-viking-gold/20 p-5 rounded-2xl relative overflow-hidden space-y-4">
              <h3 className="font-viking-display text-sm font-black text-viking-gold uppercase tracking-wider border-b border-viking-gold/10 pb-3">Definir Novo Objetivo</h3>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-viking-silver">Tipo de Meta</label>
                <select 
                  value={goalType}
                  onChange={e => setGoalType(e.target.value as any)}
                  className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none cursor-pointer"
                >
                  <option value="running">Corrida 🏃</option>
                  <option value="cycling">Ciclismo 🚴</option>
                  <option value="rowing">Remo 🚣</option>
                  <option value="sprints">Sprints 🔥</option>
                  <option value="other">Outro ⚡</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-viking-silver">Título da Meta</label>
                <input 
                  type="text"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="Ex: Sub-20 nos 5K de Corrida"
                  className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-viking-silver">Meta Distância Opcional (Km)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={goalDistance}
                  onChange={e => setGoalDistance(e.target.value)}
                  placeholder="Ex: 10.0"
                  className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-viking-silver">Meta Duração Opcional (Minutos)</label>
                <input 
                  type="number"
                  value={goalDuration}
                  onChange={e => setGoalDuration(e.target.value)}
                  placeholder="Ex: 45"
                  className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-viking-silver">Velocidade Sprint Alvo (Km/h)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={goalSprintSpeed}
                  onChange={e => setGoalSprintSpeed(e.target.value)}
                  placeholder="Ex: 26.0"
                  className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-viking-silver">Prazo Limite</label>
                <input 
                  type="date"
                  value={goalDeadline}
                  onChange={e => setGoalDeadline(e.target.value)}
                  className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black text-xs rounded-xl transition-all uppercase cursor-pointer shadow-md shadow-viking-gold/15"
              >
                Definir Objetivo 🎯
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PRESCRIBED CARDIO */}
      {activeSubTab === 'prescribe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-viking-display text-base font-black text-viking-gold uppercase tracking-wider">Planos de Cardio Prescritos</h3>
            {prescriptions.length === 0 ? (
              <div className="p-8 text-center border border-viking-gold/10 border-dashed rounded-xl bg-[#140e0c]/30">
                <p className="text-xs text-viking-silver/50 italic">Nenhum treino de cardio prescrito ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map(p => (
                  <div key={p.id} className="bg-viking-dark border-2 border-viking-gold/15 p-5 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-viking-dark bg-viking-gold px-2.5 py-1 rounded-md">
                          {translateType(p.type)}
                        </span>
                        <span className="text-[10px] text-viking-silver font-bold bg-viking-gold/5 border border-viking-gold/15 px-2 py-0.5 rounded">
                          ⏱️ {p.frequency}
                        </span>
                      </div>
                      
                      <p className="text-xs text-white font-semibold italic">"{p.instructions}"</p>

                      <div className="flex gap-4 text-[11px] text-viking-silver/60">
                        {p.targetDistanceKm && <span>Distância Alvo: <strong className="text-[#e0d3a8]">{p.targetDistanceKm} km</strong></span>}
                        {p.targetDurationMinutes && <span>Tempo Alvo: <strong className="text-[#e0d3a8]">{p.targetDurationMinutes} min</strong></span>}
                        <span>Intensidade: <strong className="text-[#e0d3a8]">{p.targetIntensity === 'high' ? 'Alta' : p.targetIntensity === 'moderate' ? 'Moderada' : 'Leve'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {role === 'student' && (
                        <button
                          onClick={() => handleLogPrescribed(p)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:from-viking-gold hover:to-amber-500 text-viking-dark font-black text-xs rounded-xl uppercase shadow-md shadow-viking-gold/15 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-viking-dark" /> Realizar
                        </button>
                      )}
                      {role === 'trainer' && onDeletePrescription && (
                        <button
                          onClick={() => onDeletePrescription(p.id)}
                          className="p-2 bg-red-950/20 border border-red-500/25 hover:bg-red-950/50 hover:border-red-500 text-red-400 transition-all rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trainer prescription form */}
          {role === 'trainer' && (
            <div className="space-y-6">
              <form onSubmit={submitPrescription} className="bg-[#140e0c]/85 border border-viking-gold/20 p-5 rounded-2xl relative overflow-hidden space-y-4">
                <h3 className="font-viking-display text-sm font-black text-viking-gold uppercase tracking-wider border-b border-viking-gold/10 pb-3">Prescrever Cardio</h3>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Tipo de Exercício</label>
                  <select 
                    value={prescType}
                    onChange={e => setPrescType(e.target.value as any)}
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none cursor-pointer"
                  >
                    <option value="running">Corrida 🏃</option>
                    <option value="cycling">Ciclismo 🚴</option>
                    <option value="rowing">Remo 🚣</option>
                    <option value="sprints">Sprints de Corrida 🔥</option>
                    <option value="other">Outro ⚡</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Frequência Semanal</label>
                  <input 
                    type="text"
                    value={prescFreq}
                    onChange={e => setPrescFreq(e.target.value)}
                    placeholder="Ex: 3x por semana pós perna"
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Orientações e Instruções</label>
                  <textarea 
                    value={prescInstructions}
                    onChange={e => setPrescInstructions(e.target.value)}
                    placeholder="Ex: Tiros de 10x 100m na esteira, com descanso ativo de 1min"
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none h-16 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-viking-silver">Distância Alvo (Km)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={prescDistance}
                      onChange={e => setPrescDistance(e.target.value)}
                      placeholder="Opcional"
                      className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-viking-silver">Duração Alvo (Minutos)</label>
                    <input 
                      type="number"
                      value={prescDuration}
                      onChange={e => setPrescDuration(e.target.value)}
                      placeholder="Opcional"
                      className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-viking-silver">Zona de Esforço Recomendada</label>
                  <select 
                    value={prescIntensity}
                    onChange={e => setPrescIntensity(e.target.value as any)}
                    className="w-full bg-[#0d0908] border border-viking-gold/20 rounded-xl p-2.5 text-xs text-white focus:border-viking-gold outline-none cursor-pointer"
                  >
                    <option value="low">Z1-Z2 Regenerativo</option>
                    <option value="moderate">Z3-Z4 Moderado</option>
                    <option value="high">Z5 Tiro / HIIT máximo</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark font-black text-xs rounded-xl transition-all uppercase cursor-pointer shadow-md shadow-viking-gold/15"
                >
                  Prescrever ao Aluno 🏃
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
