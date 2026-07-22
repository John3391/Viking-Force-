import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Sparkles,
  Shield,
  Sword,
  Flame,
  Zap,
  Crown,
  CheckCircle2,
  TrendingUp,
  Dumbbell,
  Award,
  ChevronRight,
  Lock,
  RefreshCw,
  Star,
  ArrowUpRight,
  Flame as FireIcon
} from 'lucide-react';
import { StudentProfile } from '../types';
import confetti from 'canvas-confetti';

interface WilksGoalSelectorProps {
  studentProfile: StudentProfile;
  wilksRatios: { squat: number; bench: number; deadlift: number };
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onSaveProfile?: (updatedProfile: StudentProfile) => void;
}

export interface WilksGoalLevel {
  id: string;
  name: string;
  targetWilks: number;
  minWilks: number;
  badge: string;
  icon: React.ComponentType<any>;
  desc: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
}

export const WILKS_GOAL_LEVELS: WilksGoalLevel[] = [
  {
    id: 'recruta',
    name: 'Recruta Viking',
    targetWilks: 150,
    minWilks: 150,
    badge: '🛡️',
    icon: Shield,
    desc: 'Primeiro marco de força na academia do clã. Construa uma base sólida.',
    bgGradient: 'from-amber-950/40 via-amber-900/20 to-black/60',
    borderColor: 'border-amber-600/40',
    textColor: 'text-amber-400',
    glowColor: 'rgba(217, 119, 6, 0.25)',
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro do Clã',
    targetWilks: 250,
    minWilks: 250,
    badge: '⚔️',
    icon: Sword,
    desc: 'Força respeitável com técnica apurada nos três levantamentos.',
    bgGradient: 'from-amber-700/30 via-viking-gold/10 to-black/60',
    borderColor: 'border-viking-gold/40',
    textColor: 'text-viking-gold',
    glowColor: 'rgba(212, 175, 55, 0.3)',
  },
  {
    id: 'berserker',
    name: 'Berserker do Norte',
    targetWilks: 325,
    minWilks: 325,
    badge: '🔥',
    icon: Flame,
    desc: 'Domínio do aço e fúria eufórica erguendo grandes totais SBD.',
    bgGradient: 'from-orange-950/50 via-amber-900/25 to-black/60',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-400',
    glowColor: 'rgba(249, 115, 22, 0.3)',
  },
  {
    id: 'valhalla',
    name: 'Guerreiro de Valhalla',
    targetWilks: 400,
    minWilks: 400,
    badge: '⚡',
    icon: Zap,
    desc: 'Nível de alta performance de competição de nível nacional.',
    bgGradient: 'from-cyan-950/50 via-blue-900/25 to-black/60',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    glowColor: 'rgba(6, 182, 212, 0.3)',
  },
  {
    id: 'semideus',
    name: 'Semideus / Jarl',
    targetWilks: 475,
    minWilks: 475,
    badge: '👑',
    icon: Crown,
    desc: 'Lenda absoluta e referência no topo do powerlifting.',
    bgGradient: 'from-yellow-950/60 via-amber-500/20 to-black/70',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-300',
    glowColor: 'rgba(250, 204, 21, 0.35)',
  },
];

const calculateWilksScore = (
  gender: 'male' | 'female',
  bw: number,
  totalSBD: number
): number => {
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
    a = -216.0475144;
    b = 16.2606339;
    c = -0.002388645;
    d = -0.00113732;
    e = 0.00000701863;
    f = -0.00000001291;
  }
  const denom =
    a +
    b * x +
    c * Math.pow(x, 2) +
    d * Math.pow(x, 3) +
    e * Math.pow(x, 4) +
    f * Math.pow(x, 5);
  if (denom === 0) return 0;
  const coeff = 500 / denom;
  return totalSBD * coeff;
};

const calculateTotalForWilksTarget = (
  targetWilks: number,
  bw: number,
  gender: 'male' | 'female'
): number => {
  if (!bw || !targetWilks) return 0;
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
    a = -216.0475144;
    b = 16.2606339;
    c = -0.002388645;
    d = -0.00113732;
    e = 0.00000701863;
    f = -0.00000001291;
  }
  const denom =
    a +
    b * x +
    c * Math.pow(x, 2) +
    d * Math.pow(x, 3) +
    e * Math.pow(x, 4) +
    f * Math.pow(x, 5);
  if (denom === 0) return 0;
  const coeff = 500 / denom;
  return Math.ceil(targetWilks / coeff);
};

export default function WilksGoalSelector({
  studentProfile,
  wilksRatios,
  showToast,
  onSaveProfile,
}: WilksGoalSelectorProps) {
  const bw = studentProfile?.bodyWeight || 80.0;
  const gender = studentProfile?.gender || 'male';
  const squatPR = studentProfile?.prs?.squat || 0;
  const benchPR = studentProfile?.prs?.bench || 0;
  const deadliftPR = studentProfile?.prs?.deadlift || 0;
  const currentTotal = squatPR + benchPR + deadliftPR;
  const currentWilks = calculateWilksScore(gender, bw, currentTotal);

  // Automatically suggest the next unreached goal level
  const autoSuggestedLevel = React.useMemo(() => {
    const nextLevel = WILKS_GOAL_LEVELS.find((lvl) => currentWilks < lvl.targetWilks);
    return nextLevel || WILKS_GOAL_LEVELS[WILKS_GOAL_LEVELS.length - 1];
  }, [currentWilks]);

  const [selectedLevelId, setSelectedLevelId] = useState<string>(autoSuggestedLevel.id);

  // Update selected level if athlete's PRs change and they haven't explicitly picked a distant one
  useEffect(() => {
    setSelectedLevelId(autoSuggestedLevel.id);
  }, [autoSuggestedLevel.id]);

  const selectedLevel =
    WILKS_GOAL_LEVELS.find((l) => l.id === selectedLevelId) || autoSuggestedLevel;

  const targetTotalSBD = calculateTotalForWilksTarget(selectedLevel.targetWilks, bw, gender);
  const totalDiff = targetTotalSBD - currentTotal;
  const targetSquat = Math.round((targetTotalSBD * wilksRatios.squat) / 100);
  const targetBench = Math.round((targetTotalSBD * wilksRatios.bench) / 100);
  const targetDeadlift = Math.round((targetTotalSBD * wilksRatios.deadlift) / 100);

  const squatDiff = targetSquat - squatPR;
  const benchDiff = targetBench - benchPR;
  const deadliftDiff = targetDeadlift - deadliftPR;

  const isUnlocked = currentWilks >= selectedLevel.targetWilks;
  const isAutoSuggested = selectedLevel.id === autoSuggestedLevel.id;

  const handleSetAsActiveGoal = () => {
    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#f59e0b', '#ffffff'],
    });

    if (onSaveProfile) {
      onSaveProfile({
        ...studentProfile,
        targetWilks: selectedLevel.targetWilks,
        targetEventName: `Meta Wilks: ${selectedLevel.name}`,
      });
    }

    showToast(
      `🎯 Meta "${selectedLevel.name}" (${selectedLevel.targetWilks} Wilks / ${targetTotalSBD}kg Total) fixada no seu perfil!`,
      'success'
    );
  };

  return (
    <div className="bg-[#1a1210]/95 border border-viking-gold/25 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md space-y-6">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-viking-gold/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Header with Title & Auto-Suggestion Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-viking-gold/15 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-viking-gold bg-viking-gold/15 px-2.5 py-0.5 rounded-full border border-viking-gold/30 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-viking-gold" /> Seletor Inteligente de Metas
            </span>
            {isAutoSuggested && (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> Sugestão Automática
              </span>
            )}
          </div>
          <h3 className="font-viking-display text-lg sm:text-xl font-black text-[#e0d3a8] tracking-wider uppercase flex items-center gap-2">
            Projeção de Nível & Objetivos Futuros
          </h3>
          <p className="text-xs text-viking-silver/80 mt-1 max-w-2xl leading-relaxed">
            Selecione uma patente abaixo para visualizar instantaneamente as cargas necessárias em cada levantamento e acompanhar quanto falta para alcançar sua próxima conquista no templo.
          </p>
        </div>

        {/* Current Status Quick Badge */}
        <div className="flex items-center gap-3 bg-[#140e0c]/80 border border-viking-gold/20 p-3 rounded-2xl shrink-0 self-start lg:self-center">
          <div className="text-center px-2">
            <span className="text-[9px] uppercase font-bold text-viking-silver/60 block">
              Total Atual SBD
            </span>
            <span className="text-base font-black text-white font-mono">{currentTotal} kg</span>
          </div>
          <div className="h-8 w-px bg-viking-gold/20" />
          <div className="text-center px-2">
            <span className="text-[9px] uppercase font-bold text-viking-silver/60 block">
              Wilks Atual
            </span>
            <span className="text-base font-black text-viking-gold font-viking-display">
              {currentWilks.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Goal Selector Buttons (Level Cards Grid) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-viking-silver">
          <span className="flex items-center gap-1.5 text-viking-gold">
            <FireIcon className="w-4 h-4 text-viking-gold" /> Escolha sua Próxima Meta:
          </span>
          {selectedLevelId !== autoSuggestedLevel.id && (
            <button
              onClick={() => setSelectedLevelId(autoSuggestedLevel.id)}
              className="text-[10px] text-viking-gold hover:text-white flex items-center gap-1 transition-colors cursor-pointer underline"
            >
              <RefreshCw className="w-3 h-3" /> Voltar para Sugestão Automática ({autoSuggestedLevel.name})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {WILKS_GOAL_LEVELS.map((lvl) => {
            const isSelected = lvl.id === selectedLevelId;
            const isAutoNext = lvl.id === autoSuggestedLevel.id;
            const isPassed = currentWilks >= lvl.targetWilks;
            const reqTotal = calculateTotalForWilksTarget(lvl.targetWilks, bw, gender);
            const IconComp = lvl.icon;

            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevelId(lvl.id)}
                className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? `bg-gradient-to-b ${lvl.bgGradient} ${lvl.borderColor} ring-2 ring-viking-gold/60 shadow-[0_4px_20px_rgba(212,175,55,0.2)]`
                    : isPassed
                    ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40 opacity-80 hover:opacity-100'
                    : isAutoNext
                    ? 'bg-viking-gold/10 border-viking-gold/40 hover:bg-viking-gold/15 shadow-md'
                    : 'bg-[#140e0c]/60 border-viking-gold/10 hover:border-viking-gold/30 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Top badges */}
                <div className="flex items-center justify-between gap-1 w-full mb-2">
                  <span className="text-xl shrink-0">{lvl.badge}</span>
                  {isPassed ? (
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase border border-emerald-500/30">
                      ✓ Feito
                    </span>
                  ) : isAutoNext ? (
                    <span className="text-[8px] bg-viking-gold text-viking-dark font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      Sugestão
                    </span>
                  ) : (
                    <span className="text-[8px] text-viking-silver/50 font-mono">
                      {lvl.targetWilks} W
                    </span>
                  )}
                </div>

                {/* Level Title */}
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wide line-clamp-1 ${lvl.textColor}`}>
                    {lvl.name}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-sm font-black text-white">{reqTotal}</span>
                    <span className="text-[10px] text-viking-silver/60">kg SBD</span>
                  </div>
                </div>

                {/* Selection Indicator line */}
                {isSelected && (
                  <motion.div
                    layoutId="activeGoalLine"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-viking-gold"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Level Focus Detail Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedLevel.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`p-5 rounded-2xl border bg-gradient-to-r ${selectedLevel.bgGradient} ${selectedLevel.borderColor} relative overflow-hidden shadow-2xl`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Target Header Info */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{selectedLevel.badge}</span>
                <h4 className="text-xl font-black text-white font-viking-display tracking-wider uppercase">
                  Meta Selecionada: <span className={selectedLevel.textColor}>{selectedLevel.name}</span>
                </h4>
                {isUnlocked ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Patente Conquistada
                  </span>
                ) : isAutoSuggested ? (
                  <span className="bg-viking-gold/20 text-viking-gold border border-viking-gold/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Próximo Degrau Recomendado
                  </span>
                ) : (
                  <span className="bg-black/50 text-viking-silver/80 border border-viking-gold/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Meta Futura
                  </span>
                )}
              </div>

              <p className="text-xs text-viking-silver/90 italic leading-relaxed max-w-xl">
                "{selectedLevel.desc}"
              </p>

              {/* Progress gauge for this specific selected goal */}
              <div className="mt-3 space-y-1.5 max-w-xl">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-viking-silver/80">Progresso de Carga Total SBD</span>
                  <span className="text-viking-gold font-mono">
                    {currentTotal}kg / {targetTotalSBD}kg
                  </span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-viking-gold/20 p-[2px]">
                  <div
                    className="h-full bg-gradient-to-r from-viking-gold-dark via-viking-gold to-viking-gold-light rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(212,175,55,0.5)]"
                    style={{
                      width: `${Math.min(100, Math.max(0, (currentTotal / (targetTotalSBD || 1)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-viking-silver/60">
                    Wilks Alvo: <strong className="text-white font-mono">{selectedLevel.targetWilks}</strong>
                  </span>
                  <span className="font-extrabold font-mono">
                    {isUnlocked ? (
                      <span className="text-emerald-400">✓ Meta Atingida! (+{Math.abs(totalDiff)}kg acima)</span>
                    ) : (
                      <span className="text-viking-gold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Falta erguer +{totalDiff} kg no total
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-2.5 shrink-0 border-t lg:border-t-0 lg:border-l border-viking-gold/15 pt-4 lg:pt-0 lg:pl-6">
              <button
                onClick={handleSetAsActiveGoal}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-viking-gold-dark via-viking-gold to-viking-gold-light text-viking-dark font-black text-xs uppercase tracking-widest shadow-lg shadow-viking-gold/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" /> Fixed Como Meta Ativa
              </button>

              <p className="text-[9px] text-viking-silver/50 text-center max-w-[200px]">
                Define esta meta como o objetivo visível no painel principal do atleta.
              </p>
            </div>
          </div>

          {/* Individual Lift Requirements Grid (Agachamento, Supino, Terra) */}
          <div className="mt-6 pt-5 border-t border-viking-gold/15 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Squat Target Card */}
            <div className="bg-[#140e0c]/80 border border-viking-gold/20 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase">
                  <Flame className="w-4 h-4 text-viking-gold" /> Agachamento
                </span>
                <span className="text-[10px] font-bold text-viking-gold bg-viking-gold/10 px-2 py-0.5 rounded border border-viking-gold/20">
                  {wilksRatios.squat}%
                </span>
              </div>
              <div>
                <div className="flex items-baseline justify-between font-mono mt-1">
                  <span className="text-[10px] text-viking-silver/60">Carga Necessária:</span>
                  <span className="text-base font-black text-white">{targetSquat} kg</span>
                </div>
                <div className="flex items-baseline justify-between font-mono text-[10px] mt-0.5">
                  <span className="text-viking-silver/60">PR Atual:</span>
                  <span className="font-bold text-viking-silver">{squatPR} kg</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-viking-gold/10 flex justify-between items-center text-[10px] font-extrabold">
                <span className="text-viking-silver/50">Diferença:</span>
                {squatDiff <= 0 ? (
                  <span className="text-emerald-400 font-black flex items-center gap-0.5">
                    ✓ Alvo Atingido
                  </span>
                ) : (
                  <span className="text-viking-gold font-mono font-black">
                    +{squatDiff} kg
                  </span>
                )}
              </div>
            </div>

            {/* Bench Target Card */}
            <div className="bg-[#140e0c]/80 border border-viking-gold/20 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase">
                  <Award className="w-4 h-4 text-viking-gold" /> Supino Reto
                </span>
                <span className="text-[10px] font-bold text-viking-gold bg-viking-gold/10 px-2 py-0.5 rounded border border-viking-gold/20">
                  {wilksRatios.bench}%
                </span>
              </div>
              <div>
                <div className="flex items-baseline justify-between font-mono mt-1">
                  <span className="text-[10px] text-viking-silver/60">Carga Necessária:</span>
                  <span className="text-base font-black text-white">{targetBench} kg</span>
                </div>
                <div className="flex items-baseline justify-between font-mono text-[10px] mt-0.5">
                  <span className="text-viking-silver/60">PR Atual:</span>
                  <span className="font-bold text-viking-silver">{benchPR} kg</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-viking-gold/10 flex justify-between items-center text-[10px] font-extrabold">
                <span className="text-viking-silver/50">Diferença:</span>
                {benchDiff <= 0 ? (
                  <span className="text-emerald-400 font-black flex items-center gap-0.5">
                    ✓ Alvo Atingido
                  </span>
                ) : (
                  <span className="text-viking-gold font-mono font-black">
                    +{benchDiff} kg
                  </span>
                )}
              </div>
            </div>

            {/* Deadlift Target Card */}
            <div className="bg-[#140e0c]/80 border border-viking-gold/20 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase">
                  <Dumbbell className="w-4 h-4 text-viking-gold" /> Levantamento Terra
                </span>
                <span className="text-[10px] font-bold text-viking-gold bg-viking-gold/10 px-2 py-0.5 rounded border border-viking-gold/20">
                  {wilksRatios.deadlift}%
                </span>
              </div>
              <div>
                <div className="flex items-baseline justify-between font-mono mt-1">
                  <span className="text-[10px] text-viking-silver/60">Carga Necessária:</span>
                  <span className="text-base font-black text-white">{targetDeadlift} kg</span>
                </div>
                <div className="flex items-baseline justify-between font-mono text-[10px] mt-0.5">
                  <span className="text-viking-silver/60">PR Atual:</span>
                  <span className="font-bold text-viking-silver">{deadliftPR} kg</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-viking-gold/10 flex justify-between items-center text-[10px] font-extrabold">
                <span className="text-viking-silver/50">Diferença:</span>
                {deadliftDiff <= 0 ? (
                  <span className="text-emerald-400 font-black flex items-center gap-0.5">
                    ✓ Alvo Atingido
                  </span>
                ) : (
                  <span className="text-viking-gold font-mono font-black">
                    +{deadliftDiff} kg
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
