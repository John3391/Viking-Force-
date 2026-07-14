import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Shield, 
  Sword, 
  Flame, 
  Zap, 
  Crown, 
  TrendingUp, 
  CheckCircle2, 
  Lock, 
  Info, 
  Dumbbell, 
  ChevronRight, 
  Sparkles, 
  Users, 
  Weight, 
  Hammer,
  HelpCircle,
  Play
} from 'lucide-react';
import { StudentProfile } from '../types';
import confetti from 'canvas-confetti';

interface PatentTimelineProps {
  studentProfile: StudentProfile;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface PatentRank {
  id: string;
  name: string;
  badge: string;
  icon: React.ComponentType<any>;
  themeColor: string; // Tailwind class string, e.g. "from-amber-700 to-amber-900"
  textColor: string;
  borderColor: string;
  maleMultiplier: number;
  femaleMultiplier: number;
  lore: string;
  tips: string;
}

export default function PatentTimeline({ studentProfile, showToast }: PatentTimelineProps) {
  const [selectedRankId, setSelectedRankId] = useState<string | null>(null);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);
  
  // Interactive state
  const [simulatedWeight, setSimulatedWeight] = useState<number>(studentProfile.bodyWeight || 80.0);
  const [simulatedSquat, setSimulatedSquat] = useState<number>(studentProfile.prs.squat || 0);
  const [simulatedBench, setSimulatedBench] = useState<number>(studentProfile.prs.bench || 0);
  const [simulatedDeadlift, setSimulatedDeadlift] = useState<number>(studentProfile.prs.deadlift || 0);
  const [simulatedGender, setSimulatedGender] = useState<'male' | 'female'>(studentProfile.gender || 'male');

  // Real values
  const realWeight = studentProfile.bodyWeight || 80.0;
  const realGender = studentProfile.gender || 'male';
  const realSquat = studentProfile.prs.squat || 0;
  const realBench = studentProfile.prs.bench || 0;
  const realDeadlift = studentProfile.prs.deadlift || 0;
  const realTotal = realSquat + realBench + realDeadlift;
  const realRatio = realWeight > 0 ? realTotal / realWeight : 0;

  // Sync simulated state with real profile when not in interactive mode
  useEffect(() => {
    if (!interactiveMode) {
      setSimulatedWeight(realWeight);
      setSimulatedSquat(realSquat);
      setSimulatedBench(realBench);
      setSimulatedDeadlift(realDeadlift);
      setSimulatedGender(realGender);
    }
  }, [interactiveMode, realWeight, realSquat, realBench, realDeadlift, realGender]);

  // Current working values (real or simulated)
  const currentWeight = interactiveMode ? simulatedWeight : realWeight;
  const currentSquat = interactiveMode ? simulatedSquat : realSquat;
  const currentBench = interactiveMode ? simulatedBench : realBench;
  const currentDeadlift = interactiveMode ? simulatedDeadlift : realDeadlift;
  const currentGender = interactiveMode ? simulatedGender : realGender;
  const currentTotal = currentSquat + currentBench + currentDeadlift;
  const currentRatio = currentWeight > 0 ? currentTotal / currentWeight : 0;

  const RANKS: PatentRank[] = [
    {
      id: 'recruta',
      name: 'Recruta do Ferro (Cobre)',
      badge: '🪵',
      icon: Shield,
      themeColor: 'from-amber-800 to-amber-950',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-800/40',
      maleMultiplier: 2.0,
      femaleMultiplier: 1.4,
      lore: 'Você deu seus primeiros passos na arena sagrada do templo de ferro. Sua musculatura começa a se adaptar ao aço.',
      tips: 'Foque em dominar a técnica básica do Agachamento, Supino e Levantamento Terra. Constância é mais importante do que carga alta nesta fase inicial.'
    },
    {
      id: 'saqueador',
      name: 'Saqueador de Cargas (Bronze)',
      badge: '🛡️',
      icon: Hammer,
      themeColor: 'from-orange-600 to-amber-900',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      maleMultiplier: 3.2,
      femaleMultiplier: 2.2,
      lore: 'Suas cargas já chamam atenção no clã. Você saqueia quilos da barra a cada treino e sua armadura muscular está se consolidando.',
      tips: 'Adicione treinos de força com foco na fase excêntrica lenta (3-4 segundos de descida) para gerar maior tensão mecânica.'
    },
    {
      id: 'guerreiro',
      name: 'Guerreiro do Clã (Prata)',
      badge: '⚔️',
      icon: Sword,
      themeColor: 'from-slate-400 to-slate-700',
      textColor: 'text-slate-300',
      borderColor: 'border-slate-500/30',
      maleMultiplier: 4.2,
      femaleMultiplier: 3.0,
      lore: 'Um guerreiro respeitado que ergue pesos impressionantes. A tribo reconhece seu esforço e sua técnica impecável nas três modalidades.',
      tips: 'Comece a periodizar blocos de acúmulo de volume (6-8 reps com 70-75% 1RM) seguidos de blocos de intensidade de força (2-4 reps com 85%+ 1RM).'
    },
    {
      id: 'berserker',
      name: 'Fúria de Berserker (Ouro)',
      badge: '🔥',
      icon: Flame,
      themeColor: 'from-yellow-500 to-amber-700',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
      maleMultiplier: 5.2,
      femaleMultiplier: 3.8,
      lore: 'Sua entrada na sala de treinos é temida. Tomado pela fúria rítmica dos tambores do norte, você dobra o aço com extrema agressividade mental.',
      tips: 'Trabalhe com RPE @8.5-9 de forma consistente. Use cinturão e calçados adequados de powerlifting para maximizar a transferência de força nas pernas.'
    },
    {
      id: 'campeao',
      name: 'Campeão de Valhalla (Platina)',
      badge: '⚡',
      icon: Zap,
      themeColor: 'from-cyan-500 to-indigo-700',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      maleMultiplier: 6.0,
      femaleMultiplier: 4.5,
      lore: 'Seus feitos ecoam nos grandes salões de Odin. Outros atletas silenciam para ver você levantar cargas dignas de lendas antigas.',
      tips: 'Períodos de deload estratégico a cada 4-5 semanas são mandatórios. Treine força de pegada (grippers, fat gripz) para garantir estabilidade no Terra.'
    },
    {
      id: 'jarl',
      name: 'Jarl de Asgard (Obsidiana)',
      badge: '👑',
      icon: Crown,
      themeColor: 'from-purple-600 to-fuchsia-900',
      textColor: 'text-fuchsia-400',
      borderColor: 'border-purple-500/40',
      maleMultiplier: 6.8,
      femaleMultiplier: 5.2,
      lore: 'Você é um Semideus do Powerlifting. Sentado no trono de ouro de Asgard, você governa as anilhas e detém a soberania absoluta do ferro.',
      tips: 'Seu foco está em refinar frações milimétricas de técnica, sono, alimentação e suplementação avançada. Cada quilo adicional na barra exige dedicação extrema.'
    }
  ];

  // Helper to determine multiplier required for a rank
  const getMultiplier = (rank: PatentRank, gender: 'male' | 'female') => {
    return gender === 'female' ? rank.femaleMultiplier : rank.maleMultiplier;
  };

  const getTargetKg = (rank: PatentRank, gender: 'male' | 'female', bw: number) => {
    return Math.ceil(getMultiplier(rank, gender) * bw);
  };

  // Determine current active rank in real/simulated context
  const getActiveRank = () => {
    let active = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
      const requiredMult = getMultiplier(RANKS[i], currentGender);
      if (currentRatio >= requiredMult) {
        active = RANKS[i];
        break;
      }
    }
    return active;
  };

  const activeRank = getActiveRank();

  // Celebrate with Confetti!
  const triggerCelebration = (isReal: boolean) => {
    const colors = ['#C5A059', '#E0D3A8', '#99732F', '#FFFFFF', '#6366F1'];
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: colors
    });
    showToast(
      isReal 
        ? `🔥 Soberania do Ferro! Você celebrou suas conquistas com a bênção de Odin!`
        : `⚙️ Simulação: Comemoração de Patente disparada com sucesso!`, 
      'success'
    );
  };

  // Auto trigger confetti if real total goes up to a new milestone or on mount if student is Jarl/high class
  useEffect(() => {
    if (realRatio >= 5.2) {
      // Trigger a subtle small confetti on first mount for elite warriors
      const timer = setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#C5A059', '#E0D3A8']
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div id="patent-timeline-card" className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden text-left">
      <div className="absolute -right-16 -top-16 text-viking-gold/5 pointer-events-none">
        <Award className="w-56 h-56 rotate-12" />
      </div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-viking-gold/15 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-viking-gold">
            <Award className="w-5 h-5" />
            <span className="font-viking-medieval text-xs font-black uppercase tracking-widest">Soberania Corporal de Carga</span>
          </div>
          <h2 className="text-xl font-black text-white font-viking-display tracking-wide mt-1">
            Cronograma de Patentes de Força
          </h2>
          <p className="text-xs text-viking-silver/80 mt-1 max-w-2xl">
            Sua classificação na tribo é baseada na sua força relativa: o total levantado no Agachamento, Supino e Terra (SBD Total) dividido pelo seu peso corporal.
          </p>
        </div>

        {/* Mode switcher */}
        <button
          onClick={() => setInteractiveMode(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-1.5 cursor-pointer ${
            interactiveMode
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
              : 'bg-[#0d0908]/80 border-viking-gold/10 text-viking-silver/60 hover:text-viking-gold hover:border-viking-gold/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{interactiveMode ? 'Modo Planejador Ativo' : 'Planejar Metas Futuras'}</span>
        </button>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left Stats Circle/Overview */}
        <div className="lg:col-span-4 bg-[#0d0908]/80 border border-viking-gold/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-viking-gold/5 via-transparent to-transparent pointer-events-none" />
          
          <span className="text-[10px] font-black uppercase tracking-widest text-viking-silver/50 block mb-2">
            {interactiveMode ? 'Razão SBD Simulada' : 'Sua Razão SBD Real'}
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Outer golden circle rim */}
            <div className="absolute inset-0 rounded-full border-2 border-viking-gold/15" />
            <div className="absolute inset-1.5 rounded-full border border-dashed border-viking-gold/30" />
            
            {/* Spinning status background */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-viking-dark via-[#1a1210] to-black shadow-lg flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-viking-gold font-viking-display tracking-tight">
                {currentRatio.toFixed(2)}x
              </span>
              <span className="text-[9px] uppercase tracking-wider text-viking-silver/60 font-black font-viking-medieval mt-0.5">
                Peso Corporal
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-wide flex items-center justify-center gap-1.5">
              <span>{activeRank.badge}</span>
              <span className={activeRank.textColor}>{activeRank.name.replace(/\(.*?\)/g, '').trim()}</span>
            </h4>
            <p className="text-[10px] text-viking-silver/70 italic max-w-[200px] leading-relaxed mx-auto">
              "{activeRank.lore}"
            </p>
          </div>

          {/* Quick Metrics display inside overview */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-5 pt-4 border-t border-viking-gold/10 w-full text-left text-[11px]">
            <div>
              <span className="text-viking-silver/50 block text-[9px] uppercase">Peso do Atleta</span>
              <strong className="text-white font-mono">{currentWeight.toFixed(1)} kg</strong>
            </div>
            <div>
              <span className="text-viking-silver/50 block text-[9px] uppercase">Total SBD</span>
              <strong className="text-viking-gold font-mono">{currentTotal} kg</strong>
            </div>
            <div className="col-span-2 pt-1">
              <div className="flex justify-between items-center bg-black/40 px-2 py-1 rounded border border-viking-gold/5 text-[9px] text-viking-silver">
                <span>Gênero Utilizado:</span>
                <span className="text-white font-bold">{currentGender === 'male' ? 'Masculino ♂' : 'Feminino ♀'}</span>
              </div>
            </div>
          </div>

          {/* Celebration Button */}
          <button 
            onClick={() => triggerCelebration(interactiveMode ? false : true)}
            className="w-full mt-4 py-2 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30 hover:border-viking-gold text-viking-gold font-black text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Celebrar Conquista
          </button>
        </div>

        {/* Right: Interactive Editor (if interactiveMode) or Core Metrics */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {interactiveMode ? (
            <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Painel de Planejamento de Metas
                </h4>
                <span className="text-[9px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">Simulação</span>
              </div>
              <p className="text-[11px] text-viking-silver/80 leading-relaxed">
                Ajuste os controles abaixo para simular mudanças de peso corporal ou prever quais quilos você precisa adicionar no Agachamento, Supino ou Terra para atingir as patentes lendárias.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5">
                {/* Weight slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white flex items-center gap-1"><Weight className="w-3.5 h-3.5 text-amber-400" /> Peso Corporal</span>
                    <span className="text-amber-400">{simulatedWeight.toFixed(1)} kg</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="150" 
                    step="0.5" 
                    value={simulatedWeight}
                    onChange={(e) => setSimulatedWeight(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Gender selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-white block">Gênero Biológico</span>
                  <div className="flex bg-black/50 p-1 rounded-xl border border-viking-gold/10">
                    <button
                      onClick={() => setSimulatedGender('male')}
                      className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${simulatedGender === 'male' ? 'bg-amber-500/20 text-amber-300' : 'text-viking-silver/60 hover:text-white'}`}
                    >
                      Masculino ♂ (Fator Alto)
                    </button>
                    <button
                      onClick={() => setSimulatedGender('female')}
                      className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${simulatedGender === 'female' ? 'bg-amber-500/20 text-amber-300' : 'text-viking-silver/60 hover:text-white'}`}
                    >
                      Feminino ♀ (Fator Ajustado)
                    </button>
                  </div>
                </div>

                {/* Squat input */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Agachamento (PR)</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      min="0" 
                      max="450" 
                      value={simulatedSquat}
                      onChange={(e) => setSimulatedSquat(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/60 border border-viking-gold/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono text-center focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-viking-silver/50 font-bold">kg</span>
                  </div>
                </div>

                {/* Bench input */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Supino Reto (PR)</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      min="0" 
                      max="350" 
                      value={simulatedBench}
                      onChange={(e) => setSimulatedBench(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/60 border border-viking-gold/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono text-center focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-viking-silver/50 font-bold">kg</span>
                  </div>
                </div>

                {/* Deadlift input */}
                <div className="space-y-1 md:col-span-2">
                  <span className="text-xs font-bold text-white block">Levantamento Terra (PR)</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      min="0" 
                      max="500" 
                      value={simulatedDeadlift}
                      onChange={(e) => setSimulatedDeadlift(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/60 border border-viking-gold/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono text-center focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-viking-silver/50 font-bold">kg</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => {
                    setInteractiveMode(false);
                    showToast('Dados da simulação redefinidos para seus PRs oficiais.', 'info');
                  }}
                  className="px-3 py-1 text-[10px] font-bold text-viking-silver/65 hover:text-white transition-colors"
                >
                  Limpar / Voltar para Dados Oficiais
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-[#0d0908]/50 border border-viking-gold/5 p-5 rounded-2xl space-y-4 h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-viking-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Entendendo a Escala Viking de Patentes
                </h4>
                <p className="text-[11px] text-viking-silver leading-relaxed mt-2">
                  Diferente de tabelas de peso absoluto, a escala corporal de força expressa a eficiência metabólica e mecânica do seu sistema musculoesquelético. Erguer <strong>3 vezes o próprio peso</strong> é o primeiro divisor que distingue um guerreiro amador de um saqueador calejado no clã.
                </p>
                <p className="text-[11px] text-viking-silver leading-relaxed mt-2">
                  Guerreiros de elite atingem acima de <strong>5.0x</strong>. Os Jarls absolutistas e os campeões olímpicos de powerlifting ultrapassam a incrível barreira de <strong>6.5x</strong>.
                </p>
              </div>

              {/* Quick dynamic tip */}
              <div className="p-3 bg-viking-gold/5 border border-viking-gold/10 rounded-xl text-[11px] text-viking-silver/90 flex items-start gap-2.5">
                <Dumbbell className="w-4 h-4 text-viking-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Conselho Técnico de Odin:</p>
                  <p className="text-[10px] mt-0.5 text-viking-silver/70">
                    Seu peso corporal de <strong className="text-white">{realWeight.toFixed(1)}kg</strong> indica que para alcançar a próxima patente (<strong className="text-white">{RANKS[Math.min(RANKS.length - 1, RANKS.indexOf(activeRank) + 1)].name.split(' (')[0]}</strong>) seu total na barra deve atingir no mínimo <strong className="text-viking-gold">{getTargetKg(RANKS[Math.min(RANKS.length - 1, RANKS.indexOf(activeRank) + 1)], realGender, realWeight)}kg</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HORIZONTAL STEPPER TIMELINE */}
      <div className="mt-8 space-y-6">
        <h3 className="font-viking-display text-xs font-black tracking-widest text-viking-gold uppercase border-b border-viking-gold/15 pb-2">
          Sua Jornada na Linha do Tempo
        </h3>

        {/* Stepper track wrapper */}
        <div className="relative pt-6 pb-2 px-1">
          {/* Timeline continuous track bar */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#140e0c] -translate-y-1/2 border-t border-b border-viking-gold/10" />
          
          {/* Active progress colored filling bar */}
          {(() => {
            // Find progress ratio between ranks
            const numRanks = RANKS.length;
            let activeIndex = RANKS.indexOf(activeRank);
            if (activeIndex === -1) activeIndex = 0;
            
            // Calculate approximate percentage completion
            let totalPct = 0;
            if (activeIndex === numRanks - 1) {
              totalPct = 100;
            } else {
              const currentRankMult = getMultiplier(RANKS[activeIndex], currentGender);
              const nextRankMult = getMultiplier(RANKS[activeIndex + 1], currentGender);
              const fraction = (currentRatio - currentRankMult) / (nextRankMult - currentRankMult);
              const clampedFraction = Math.min(1, Math.max(0, fraction));
              
              const stepWeight = 100 / (numRanks - 1);
              totalPct = (activeIndex * stepWeight) + (clampedFraction * stepWeight);
            }

            return (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalPct}%` }}
                transition={{ duration: 0.8 }}
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-viking-gold-dark to-viking-gold -translate-y-1/2 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
              />
            );
          })()}

          {/* Steps list */}
          <div className="relative flex justify-between items-center z-10">
            {RANKS.map((rank, index) => {
              const reqMultiplier = getMultiplier(rank, currentGender);
              const targetKg = getTargetKg(rank, currentGender, currentWeight);
              const isUnlocked = currentRatio >= reqMultiplier;
              const isCurrent = rank.id === activeRank.id;
              const StepIcon = rank.icon;

              return (
                <div 
                  key={rank.id} 
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => setSelectedRankId(selectedRankId === rank.id ? null : rank.id)}
                >
                  {/* Circle Badge Node */}
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative ${
                      isUnlocked 
                        ? `bg-gradient-to-br ${rank.themeColor} border-viking-gold text-white shadow-[0_0_15px_rgba(197,160,89,0.25)]`
                        : 'bg-black/80 border-viking-gold/20 text-viking-silver/30'
                    } ${isCurrent ? 'ring-2 ring-viking-gold ring-offset-2 ring-offset-viking-dark' : ''}`}
                  >
                    {isUnlocked ? (
                      <span className="text-lg">{rank.badge}</span>
                    ) : (
                      <Lock className="w-4 h-4 text-viking-silver/40" />
                    )}

                    {/* Miniature lock status dot */}
                    {isUnlocked ? (
                      <span className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-black">
                        <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                      </span>
                    ) : null}
                  </motion.div>

                  {/* Under Step Label */}
                  <div className="text-center mt-2 px-1 max-w-[80px] sm:max-w-[120px]">
                    <span className={`text-[9px] font-black uppercase tracking-wider block leading-none ${
                      isUnlocked ? 'text-white' : 'text-viking-silver/40'
                    } ${isCurrent ? 'text-viking-gold font-extrabold underline decoration-viking-gold/40 decoration-1 underline-offset-2' : ''}`}>
                      {rank.name.split(' (')[0]}
                    </span>
                    <span className={`text-[8px] font-mono block mt-0.5 ${isUnlocked ? 'text-viking-gold' : 'text-viking-silver/30'}`}>
                      {reqMultiplier.toFixed(1)}x ({targetKg}kg)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILS OF SELECTED OR ACTIVE RANK */}
        <div className="pt-2">
          {(() => {
            const displayRank = RANKS.find(r => r.id === (selectedRankId || activeRank.id)) || activeRank;
            const mult = getMultiplier(displayRank, currentGender);
            const targetKg = getTargetKg(displayRank, currentGender, currentWeight);
            const isUnlocked = currentRatio >= mult;
            const neededDiff = targetKg - currentTotal;
            const DisplayIcon = displayRank.icon;

            return (
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayRank.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`border-2 rounded-2xl p-5 relative overflow-hidden transition-colors duration-300 ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-[#1a1210] via-black/40 to-black border-viking-gold/40' 
                      : 'bg-black/60 border-viking-gold/10'
                  }`}
                >
                  <div className="absolute right-4 top-4 text-[70px] leading-none pointer-events-none opacity-5">
                    {displayRank.badge}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Big Circle Icon inside description */}
                      <div className={`p-3.5 rounded-2xl shrink-0 border ${
                        isUnlocked 
                          ? `bg-gradient-to-br ${displayRank.themeColor} ${displayRank.borderColor} text-white shadow-md`
                          : 'bg-black border-viking-gold/10 text-viking-silver/30'
                      }`}>
                        <DisplayIcon className="w-7 h-7" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xl">{displayRank.badge}</span>
                          <h4 className="text-base font-black text-white uppercase tracking-wider font-viking-display">
                            {displayRank.name}
                          </h4>
                          {isUnlocked ? (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                              Selo Desbloqueado
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-[#0d0908] text-viking-silver/45 border border-viking-gold/5 px-2 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-viking-silver/30" /> Bloqueado
                            </span>
                          )}
                        </div>

                        {/* Lore and tips text */}
                        <p className="text-xs text-viking-silver/90 leading-relaxed mt-2.5 pr-2">
                          {displayRank.lore}
                        </p>

                        <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-viking-gold/5 space-y-1.5 text-xs">
                          <span className="text-[9px] font-black uppercase tracking-wider text-viking-gold block">
                            🛡️ Estratégia Recomendada para este Nível:
                          </span>
                          <p className="text-viking-silver leading-relaxed italic font-medium">
                            "{displayRank.tips}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Checklist metrics */}
                    <div className="md:border-l md:border-viking-gold/10 md:pl-5 shrink-0 flex flex-col justify-between w-full md:w-56 mt-3 md:mt-0 gap-3">
                      <div>
                        <span className="text-[9px] text-viking-silver/50 uppercase block font-black">Meta de Proporção</span>
                        <strong className="text-white text-base font-black font-viking-display block mt-0.5">
                          {mult.toFixed(1)}x <span className="text-xs text-viking-silver/65 font-normal">peso corporal</span>
                        </strong>
                      </div>

                      <div>
                        <span className="text-[9px] text-viking-silver/50 uppercase block font-black">Total SBD Exigido</span>
                        <strong className="text-viking-gold text-base font-black font-mono block mt-0.5">
                          {targetKg} <span className="text-xs text-viking-silver/65 font-normal">kg</span>
                        </strong>
                      </div>

                      <div className="pt-2 border-t border-viking-gold/10 text-xs">
                        {isUnlocked ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-xl text-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Patente Conquistada!</span>
                          </div>
                        ) : (
                          <div className="space-y-1 bg-amber-950/10 border border-amber-900/20 p-2.5 rounded-xl">
                            <span className="text-[9px] text-viking-silver/60 uppercase block text-center font-bold">Faltam para Desbloquear:</span>
                            <strong className="text-amber-400 font-mono text-center block text-sm font-black">
                              +{neededDiff} kg
                            </strong>
                            <p className="text-[8px] text-viking-silver/50 text-center leading-normal">
                              Isso representa {(neededDiff / 3).toFixed(1)}kg adicionais em cada um dos 3 levantamentos.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
