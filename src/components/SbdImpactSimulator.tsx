import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  Minus, 
  TrendingUp, 
  Award, 
  Zap, 
  Flame, 
  Crown, 
  Shield, 
  Dumbbell, 
  CheckCircle2, 
  Info,
  HelpCircle
} from 'lucide-react';
import { StudentProfile } from '../types';
import confetti from 'canvas-confetti';

interface SbdImpactSimulatorProps {
  studentProfile: StudentProfile;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function SbdImpactSimulator({ studentProfile, showToast }: SbdImpactSimulatorProps) {
  // Real PRs
  const realSquat = studentProfile?.prs?.squat || 0;
  const realBench = studentProfile?.prs?.bench || 0;
  const realDeadlift = studentProfile?.prs?.deadlift || 0;
  const realWeight = studentProfile?.bodyWeight || 80.0;
  const realGender = studentProfile?.gender || 'male';
  const realTotal = realSquat + realBench + realDeadlift;

  // Incremental additions states
  const [addSquat, setAddSquat] = useState<number>(0);
  const [addBench, setAddBench] = useState<number>(0);
  const [addDeadlift, setAddDeadlift] = useState<number>(0);

  // Simulated values
  const simSquat = realSquat + addSquat;
  const simBench = realBench + addBench;
  const simDeadlift = realDeadlift + addDeadlift;
  const simTotal = simSquat + simBench + simDeadlift;
  const totalAdded = addSquat + addBench + addDeadlift;

  // Wilks calculation formulas
  const calculateWilksScore = (gender: 'male' | 'female', bw: number, totalSBD: number): number => {
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
    const denom = a + b * x + c * Math.pow(x, 2) + d * Math.pow(x, 3) + e * Math.pow(x, 4) + f * Math.pow(x, 5);
    if (denom === 0) return 0;
    const coeff = 500 / denom;
    return Math.round(totalSBD * coeff * 10) / 10;
  };

  // Wilks levels
  const WILKS_LEVELS = [
    { name: 'Aspirante Viking', minWilks: 0, badge: '🪵', desc: 'Iniciando a jornada nos portões de ferro.' },
    { name: 'Recruta Viking', minWilks: 150, badge: '🛡️', desc: 'Primeiras conquistas alcançadas no templo.' },
    { name: 'Guerreiro do Clã', minWilks: 250, badge: '⚔️', desc: 'Força relativa expressiva e respeito na tribo.' },
    { name: 'Berserker do Norte', minWilks: 325, badge: '🔥', desc: 'Fúria devastadora erguendo grandes pesos.' },
    { name: 'Guerreiro de Valhalla', minWilks: 400, badge: '⚡', desc: 'Força extraordinária digna dos deuses.' },
    { name: 'Semideus / Jarl', minWilks: 475, badge: '👑', desc: 'Lenda absoluta no topo da montanha de ferro.' }
  ];

  // SBD Ratio ranks
  const RATIO_RANKS = [
    { name: 'Recruta do Ferro (Cobre)', maleMult: 2.0, femaleMult: 1.4, badge: '🪵', colorClass: 'text-amber-500' },
    { name: 'Saqueador de Cargas (Bronze)', maleMult: 3.2, femaleMult: 2.2, badge: '🛡️', colorClass: 'text-orange-400' },
    { name: 'Guerreiro do Clã (Prata)', maleMult: 4.2, femaleMult: 3.0, badge: '⚔️', colorClass: 'text-slate-300' },
    { name: 'Fúria de Berserker (Ouro)', maleMult: 5.2, femaleMult: 3.8, badge: '🔥', colorClass: 'text-yellow-400' },
    { name: 'Campeão de Valhalla (Platina)', maleMult: 6.0, femaleMult: 4.5, badge: '⚡', colorClass: 'text-cyan-400' },
    { name: 'Jarl de Asgard (Obsidiana)', maleMult: 6.8, femaleMult: 5.2, badge: '👑', colorClass: 'text-fuchsia-400' }
  ];

  // Helper to determine active Wilks level
  const getWilksLevel = (score: number) => {
    let current = WILKS_LEVELS[0];
    for (let i = WILKS_LEVELS.length - 1; i >= 0; i--) {
      if (score >= WILKS_LEVELS[i].minWilks) {
        current = WILKS_LEVELS[i];
        break;
      }
    }
    return current;
  };

  // Helper to determine active SBD ratio rank
  const getRatioRank = (weight: number, gender: 'male' | 'female', sbdTotal: number) => {
    const ratio = weight > 0 ? sbdTotal / weight : 0;
    let current = RATIO_RANKS[0];
    for (let i = RATIO_RANKS.length - 1; i >= 0; i--) {
      const threshold = gender === 'female' ? RATIO_RANKS[i].femaleMult : RATIO_RANKS[i].maleMult;
      if (ratio >= threshold) {
        current = RATIO_RANKS[i];
        break;
      }
    }
    return { rank: current, ratio };
  };

  // Current states
  const realWilks = calculateWilksScore(realGender, realWeight, realTotal);
  const realWilksLevel = getWilksLevel(realWilks);
  const { rank: realRatioRank, ratio: realRatio } = getRatioRank(realWeight, realGender, realTotal);

  // Simulated states
  const simWilks = calculateWilksScore(realGender, realWeight, simTotal);
  const simWilksLevel = getWilksLevel(simWilks);
  const { rank: simRatioRank, ratio: simRatio } = getRatioRank(realWeight, realGender, simTotal);

  // Next targets calculations
  const nextWilksIdx = WILKS_LEVELS.indexOf(simWilksLevel) + 1;
  const nextWilksLevel = nextWilksIdx < WILKS_LEVELS.length ? WILKS_LEVELS[nextWilksIdx] : null;

  const nextRatioIdx = RATIO_RANKS.indexOf(simRatioRank) + 1;
  const nextRatioRank = nextRatioIdx < RATIO_RANKS.length ? RATIO_RANKS[nextRatioIdx] : null;

  // Promoted flags
  const promotedWilks = simWilksLevel.name !== realWilksLevel.name;
  const promotedRatio = simRatioRank.name !== realRatioRank.name;

  const handleReset = () => {
    setAddSquat(0);
    setAddBench(0);
    setAddDeadlift(0);
    showToast('Simulador redefinido para suas cargas reais!', 'info');
  };

  const adjustLift = (lift: 'squat' | 'bench' | 'deadlift', amount: number) => {
    let currentAdd = 0;
    if (lift === 'squat') currentAdd = addSquat;
    else if (lift === 'bench') currentAdd = addBench;
    else if (lift === 'deadlift') currentAdd = addDeadlift;

    const newValue = Math.max(0, currentAdd + amount);
    
    if (lift === 'squat') setAddSquat(newValue);
    else if (lift === 'bench') setAddBench(newValue);
    else if (lift === 'deadlift') setAddDeadlift(newValue);

    // If new level unlocked on this click, fire a reward confetti!
    const newSimTotal = (lift === 'squat' ? realSquat + newValue : simSquat) +
                        (lift === 'bench' ? realBench + newValue : simBench) +
                        (lift === 'deadlift' ? realDeadlift + newValue : simDeadlift);
    const newSimWilks = calculateWilksScore(realGender, realWeight, newSimTotal);
    const newSimWilksLevel = getWilksLevel(newSimWilks);
    const { rank: newSimRatioRank } = getRatioRank(realWeight, realGender, newSimTotal);

    if (newSimWilksLevel.name !== simWilksLevel.name || newSimRatioRank.name !== simRatioRank.name) {
      // Unlocked a new tier in either!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C5A059', '#E0D3A8', '#10B981']
      });
      showToast(`🔥 EVOLUÇÃO! Subida de patente simulada com sucesso!`, 'success');
    }
  };

  // Quick helper to distribute total SBD additions evenly
  const quickAddSbdTotal = (totalKg: number) => {
    // Distribute 40% squat, 20% bench, 40% deadlift or similar. Let's do roughly equal division
    const chunk = Math.round(totalKg / 3);
    const squatDiff = chunk;
    const benchDiff = Math.max(1, Math.round(totalKg * 0.2));
    const deadliftDiff = totalKg - squatDiff - benchDiff;

    setAddSquat(prev => prev + squatDiff);
    setAddBench(prev => prev + benchDiff);
    setAddDeadlift(prev => prev + deadliftDiff);

    // Trigger confetti if level promoted
    const finalSimTotal = simTotal + totalKg;
    const finalSimWilks = calculateWilksScore(realGender, realWeight, finalSimTotal);
    if (getWilksLevel(finalSimWilks).name !== simWilksLevel.name) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
    showToast(`Adicionado +${totalKg}kg distribuídos no seu SBD!`, 'success');
  };

  return (
    <div id="sbd-impact-simulator" className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden text-left space-y-6">
      <div className="absolute top-0 right-0 w-36 h-36 bg-viking-gold/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="border-b border-viking-gold/15 pb-4">
        <div className="flex items-center gap-2 text-viking-gold">
          <Sparkles className="w-5 h-5 text-viking-gold animate-pulse" />
          <span className="font-viking-medieval text-[10px] sm:text-xs font-black uppercase tracking-widest">Oráculo do Ferro</span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-white font-viking-display tracking-wide mt-1">
          Simulador de Força: "E se eu subir X kg?"
        </h2>
        <p className="text-[10px] sm:text-xs text-viking-silver/80 mt-1 max-w-2xl">
          Preveja exatamente o impacto de novos recordes no seu Coeficiente Wilks e na conquista de novas Patentes do Templo.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Sliders and Quick actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="text-xs uppercase font-black text-viking-gold tracking-wider flex items-center gap-1.5 border-b border-viking-gold/10 pb-1.5">
            <Dumbbell className="w-4 h-4 text-viking-gold" /> Ajustar Sobrecarga de Treino
          </h3>

          <div className="space-y-4">
            {/* SQUAT */}
            <div className="bg-[#0d0908]/70 border border-viking-gold/10 p-3.5 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-black flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-viking-gold rounded-full"></span>
                  AGACHAMENTO (S)
                </span>
                <div className="font-mono text-[11px]">
                  <span className="text-viking-silver/50">Atual: {realSquat}kg</span>
                  <span className="text-viking-gold font-bold ml-2">Simulado: {simSquat}kg</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => adjustLift('squat', -5)}
                  className="w-8 h-8 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/45 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  -5
                </button>
                <div className="flex-1 text-center bg-black/40 py-1.5 rounded-xl border border-white/5 font-mono text-xs">
                  <span className="text-viking-silver text-[10px] uppercase block">Acrescentar</span>
                  <strong className="text-viking-gold text-sm font-black font-mono">+{addSquat} kg</strong>
                </div>
                <button 
                  onClick={() => adjustLift('squat', 5)}
                  className="w-8 h-8 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/45 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  +5
                </button>
                <button 
                  onClick={() => adjustLift('squat', 10)}
                  className="w-8 h-8 bg-viking-gold/10 border border-viking-gold/25 hover:bg-viking-gold/25 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  +10
                </button>
              </div>
            </div>

            {/* BENCH */}
            <div className="bg-[#0d0908]/70 border border-viking-gold/10 p-3.5 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-black flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  SUPINO RETO (B)
                </span>
                <div className="font-mono text-[11px]">
                  <span className="text-viking-silver/50">Atual: {realBench}kg</span>
                  <span className="text-emerald-400 font-bold ml-2">Simulado: {simBench}kg</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => adjustLift('bench', -5)}
                  className="w-8 h-8 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/45 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  -5
                </button>
                <div className="flex-1 text-center bg-black/40 py-1.5 rounded-xl border border-white/5 font-mono text-xs">
                  <span className="text-viking-silver text-[10px] uppercase block">Acrescentar</span>
                  <strong className="text-emerald-400 text-sm font-black font-mono">+{addBench} kg</strong>
                </div>
                <button 
                  onClick={() => adjustLift('bench', 5)}
                  className="w-8 h-8 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/45 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  +5
                </button>
                <button 
                  onClick={() => adjustLift('bench', 10)}
                  className="w-8 h-8 bg-viking-gold/10 border border-viking-gold/25 hover:bg-viking-gold/25 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  +10
                </button>
              </div>
            </div>

            {/* DEADLIFT */}
            <div className="bg-[#0d0908]/70 border border-viking-gold/10 p-3.5 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-black flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-fuchsia-500 rounded-full"></span>
                  LEVANTAMENTO TERRA (D)
                </span>
                <div className="font-mono text-[11px]">
                  <span className="text-viking-silver/50">Atual: {realDeadlift}kg</span>
                  <span className="text-fuchsia-400 font-bold ml-2">Simulado: {simDeadlift}kg</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => adjustLift('deadlift', -5)}
                  className="w-8 h-8 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/45 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  -5
                </button>
                <div className="flex-1 text-center bg-black/40 py-1.5 rounded-xl border border-white/5 font-mono text-xs">
                  <span className="text-viking-silver text-[10px] uppercase block">Acrescentar</span>
                  <strong className="text-fuchsia-400 text-sm font-black font-mono">+{addDeadlift} kg</strong>
                </div>
                <button 
                  onClick={() => adjustLift('deadlift', 5)}
                  className="w-8 h-8 bg-black/60 border border-viking-gold/15 hover:bg-viking-gold/10 hover:border-viking-gold/45 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  +5
                </button>
                <button 
                  onClick={() => adjustLift('deadlift', 10)}
                  className="w-8 h-8 bg-viking-gold/10 border border-viking-gold/25 hover:bg-viking-gold/25 rounded-xl text-viking-gold font-black flex items-center justify-center cursor-pointer transition-all shrink-0 text-sm"
                >
                  +10
                </button>
              </div>
            </div>
          </div>

          {/* Quick Total Increments */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-viking-silver/50 font-black block">Aumentos Rápidos no Total SBD</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => quickAddSbdTotal(15)}
                className="py-2 px-3 rounded-xl bg-[#1c1210]/60 hover:bg-viking-gold/15 border border-viking-gold/15 text-[10px] text-viking-silver hover:text-white font-extrabold tracking-wider transition-all cursor-pointer text-center"
              >
                +15 kg Total 🛡️
              </button>
              <button 
                onClick={() => quickAddSbdTotal(30)}
                className="py-2 px-3 rounded-xl bg-[#1c1210]/60 hover:bg-viking-gold/20 border border-viking-gold/25 text-[10px] text-viking-gold hover:text-white font-black tracking-wider transition-all cursor-pointer text-center"
              >
                +30 kg Total ⚔️
              </button>
              <button 
                onClick={() => quickAddSbdTotal(45)}
                className="py-2 px-3 rounded-xl bg-[#1c1210]/60 hover:bg-viking-gold/30 border border-viking-gold/40 text-[10px] text-yellow-400 hover:text-white font-black tracking-wider transition-all cursor-pointer text-center animate-pulse"
              >
                +45 kg Total 🔥
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Scoreboard & Patent Promotion (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f0908]/90 border border-viking-gold/15 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-viking-gold/10 pb-2">
              <h3 className="text-xs uppercase font-black text-viking-gold tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-viking-gold" /> Painel de Resultados
              </h3>
              {totalAdded > 0 && (
                <button 
                  onClick={handleReset}
                  className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Metrics Dashboard */}
            <div className="mt-4 space-y-4">
              {/* WILKS SCORE CARD */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-viking-silver/50 uppercase font-bold block">Pontuação Wilks</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white font-mono">{simWilks.toFixed(1)}</span>
                    {simWilks > realWilks && (
                      <span className="text-[10px] text-emerald-400 font-mono font-black">
                        (+{(simWilks - realWilks).toFixed(1)})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-viking-silver/50 uppercase font-bold block">Patente Wilks</span>
                  <p className="text-xs font-black text-viking-gold flex items-center gap-1 mt-0.5 justify-end">
                    <span>{simWilksLevel.badge}</span>
                    <span>{simWilksLevel.name}</span>
                  </p>
                </div>
              </div>

              {/* SBD RATIO CARD */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-viking-silver/50 uppercase font-bold block">Força Corporal (Ratio)</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white font-mono">{simRatio.toFixed(2)}x</span>
                    {simRatio > realRatio && (
                      <span className="text-[10px] text-emerald-400 font-mono font-black">
                        (+{(simRatio - realRatio).toFixed(2)}x)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-viking-silver/50 uppercase font-bold block">Selo de Força</span>
                  <p className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-0.5 justify-end">
                    <span>{simRatioRank.badge}</span>
                    <span>{simRatioRank.name.split(' (')[0]}</span>
                  </p>
                </div>
              </div>

              {/* TOTAL SBD TONELAGEM */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-viking-silver/50 uppercase font-bold block">Total SBD</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white font-mono">{simTotal} kg</span>
                    {totalAdded > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono font-black">
                        (+{totalAdded} kg)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-viking-silver/50 uppercase font-bold block">Peso Corporal</span>
                  <span className="text-xs font-black text-white block mt-0.5">{realWeight.toFixed(1)} kg</span>
                </div>
              </div>
            </div>

            {/* Promotions / Goals status warnings */}
            <div className="mt-4">
              <AnimatePresence mode="wait">
                {promotedWilks || promotedRatio ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center space-y-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400 animate-bounce" /> SUBIDA DE PATENTE SIMULADA!
                    </p>
                    <p className="text-[10px] text-viking-silver/90 leading-tight">
                      Ao atingir estas cargas, sua patente do Templo subirá de 
                      <strong className="text-white ml-1">{realWilksLevel.badge} {realWilksLevel.name}</strong> para 
                      <strong className="text-emerald-400 ml-1">{simWilksLevel.badge} {simWilksLevel.name}</strong>!
                    </p>
                  </motion.div>
                ) : (
                  <div className="p-3 bg-viking-gold/5 border border-viking-gold/10 rounded-xl text-center space-y-1.5">
                    {nextWilksLevel ? (
                      <p className="text-[10px] text-viking-silver/85">
                        Faltam <strong className="text-viking-gold">{(nextWilksLevel.minWilks - simWilks).toFixed(1)}</strong> Wilks para se tornar um <strong className="text-white">{nextWilksLevel.badge} {nextWilksLevel.name}</strong>.
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-400 font-bold">
                        👑 Você atingiu a patente máxima simulada do Templo!
                      </p>
                    )}
                    {nextRatioRank && (
                      <p className="text-[9px] text-viking-silver/60">
                        Próximo Selo Corporal: <strong>{nextRatioRank.badge} {nextRatioRank.name.split(' (')[0]}</strong> com total de {Math.ceil((realGender === 'female' ? nextRatioRank.femaleMult : nextRatioRank.maleMult) * realWeight)}kg.
                      </p>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-[10px] text-viking-silver/50 leading-snug flex items-start gap-1.5 bg-black/30 p-2.5 rounded-xl">
            <Info className="w-3.5 h-3.5 text-viking-gold shrink-0 mt-0.5" />
            <span>
              Use esta simulação para calibrar as cargas alvo das suas próximas planilhas com o treinador John Vasques. O esforço planejado hoje é a glória de amanhã!
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
