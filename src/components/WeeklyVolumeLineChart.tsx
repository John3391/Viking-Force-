import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { StudentProfile, LoggedSession } from '../types';
import { 
  TrendingUp, 
  Info, 
  Flame, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface WeeklyVolumeLineChartProps {
  profile: StudentProfile;
}

interface WeeklyVolumeData {
  weekLabel: string;
  weekIndex: number;
  volume: number | null;
  plannedVolume: number;
  sessionCount: number;
  avgRpe: number;
}

export default function WeeklyVolumeLineChart({ profile }: WeeklyVolumeLineChartProps) {
  const [showTips, setShowTips] = useState<boolean>(true);

  if (!profile) {
    return (
      <div className="bg-[#1a1210]/85 border border-viking-gold/20 p-6 rounded-3xl backdrop-blur-md text-center text-viking-silver">
        Carregando gráfico de volume semanal...
      </div>
    );
  }

  // Helper to calculate a session's volume
  const calculateSessionVolume = (sess: LoggedSession) => {
    if (sess.totalAchievedVolume) return sess.totalAchievedVolume;
    
    let totalSessionVolume = 0;
    const prs = profile.prs;
    
    sess.exercises.forEach((ex: any) => {
      let exerciseVolume = 0;
      
      if (ex.sets && Array.isArray(ex.sets) && ex.sets.length > 0) {
        ex.sets.forEach((set: any) => {
           if (set.done !== false) {
             const weight = set.weight || 0;
             exerciseVolume += ((set.reps || 0) * weight);
           }
        });
      }
      
      if (exerciseVolume === 0) {
        // Fallback to prescribed weight or RPE estimation
        let estimatedWeight = ex.baseWeight || 0;
        let intensity = 1;
        
        if (typeof ex.intensity === 'number') intensity = ex.intensity;
        else if (typeof ex.intensity === 'string') {
          const pct = parseFloat(ex.intensity.replace('%', ''));
          if (!isNaN(pct)) intensity = pct > 1 ? pct / 100 : pct;
        }
        
        if (!estimatedWeight) {
            const rpe = ex.rpe || 7;
            const lowerName = ex.name.toLowerCase();
            
            if (lowerName.includes('agachamento') || lowerName.includes('squat')) {
              estimatedWeight = prs.squat || 140;
            } else if (lowerName.includes('terra') || lowerName.includes('deadlift')) {
              estimatedWeight = prs.deadlift || 180;
            } else if (lowerName.includes('supino') || lowerName.includes('bench')) {
              estimatedWeight = prs.bench || 100;
            } else {
              estimatedWeight = (prs.bench || 100) * 0.4;
            }
            intensity = rpe / 10;
        }
        
        let setsCount = 3;
        if (Array.isArray(ex.sets)) setsCount = ex.sets.length;
        else if (typeof ex.sets === 'number') setsCount = ex.sets;
        
        let reps = ex.reps || 8;
        exerciseVolume = Math.round(setsCount * reps * (estimatedWeight * intensity));
      }
      totalSessionVolume += exerciseVolume;
    });
    return totalSessionVolume;
  };

  // Extract sessions and aggregate into 8 weeks
  const rawSessions = profile.sessions || [];
  
  // Helper to parse date string "DD/MM/YYYY"
  const parseDate = (dateStr: string): Date => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    } catch (e) {
      // fallback
    }
    return new Date();
  };

  // Find the base start date of all training to bucket by chronological weeks
  let baseDate = new Date();
  if (rawSessions.length > 0) {
    const dates = rawSessions.map(s => parseDate(s.date).getTime());
    const minTime = Math.min(...dates);
    baseDate = new Date(minTime);
  }

    // Find max weeks in custom program or logged sessions
  let numWeeks = 8;
  if (profile.customProgram?.weeks) {
    const keys = Object.keys(profile.customProgram.weeks).map(Number);
    if (keys.length > 0) {
      numWeeks = Math.max(...keys);
    }
  }
  
  if (rawSessions.length > 0) {
     rawSessions.forEach(sess => {
        let weekNum = 0;
        const match = sess.sessionName.match(/(?:semana|sem|s)\s*(\d+)/i);
        if (match) {
          weekNum = parseInt(match[1]);
        }
        if (weekNum > numWeeks) numWeeks = weekNum;
     });
  }
  
  if (numWeeks < 4) numWeeks = 4;
  
  const weeklyBuckets: Record<number, { volume: number | null; plannedVolume: number; sessions: LoggedSession[] }> = {};
  for (let w = 1; w <= numWeeks; w++) {
    weeklyBuckets[w] = { volume: 0, plannedVolume: 0, sessions: [] };
  }
// Group real sessions into the 8 weeks
  rawSessions.forEach(sess => {
    // 1. Try to parse week number from session name (e.g., "Semana 3 - Treino A")
    let weekNum = 0;
    const match = sess.sessionName.match(/(?:semana|sem|s)\s*(\d+)/i);
    if (match) {
      weekNum = parseInt(match[1]);
    } else {
      // 2. Fallback to chronological week from start date
      const sessDate = parseDate(sess.date);
      const diffTime = sessDate.getTime() - baseDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      weekNum = Math.floor(diffDays / 7) + 1;
    }

    // Clip/Clamp to weeks 1 to numWeeks
    if (weekNum >= 1 && weekNum <= numWeeks) {
      const vol = calculateSessionVolume(sess);
      const plannedVol = Math.round(vol * 1.05); // using a default +5% if no program data
      weeklyBuckets[weekNum].volume += vol;
      weeklyBuckets[weekNum].plannedVolume += plannedVol;
      weeklyBuckets[weekNum].sessions.push(sess);
    }
  });

  
  const calculatePlannedVolumeForWeek = (weekNum: number) => {
    if (!profile.customProgram?.weeks?.[weekNum]) return null;
    const week = profile.customProgram.weeks[weekNum];
    let vol = 0;
    const prs = profile.prs;
    Object.values(week).forEach(exercises => {
      exercises.forEach(ex => {
        let weight = ex.baseWeight;
        if (!weight) {
          const lowerName = ex.name.toLowerCase();
          if (lowerName.includes('agachamento') || lowerName.includes('squat')) weight = prs.squat || 140;
          else if (lowerName.includes('terra') || lowerName.includes('deadlift')) weight = prs.deadlift || 180;
          else if (lowerName.includes('supino') || lowerName.includes('bench')) weight = prs.bench || 100;
          else weight = (prs.bench || 100) * 0.4;
        }
        
        let intensity = 1;
        if (typeof ex.intensity === 'number') intensity = ex.intensity;
        else if (typeof ex.intensity === 'string') {
          const pct = parseFloat(ex.intensity.replace('%', ''));
          if (!isNaN(pct)) intensity = pct > 1 ? pct / 100 : pct;
        }
        
        vol += Math.round((ex.sets || 0) * (ex.reps || 0) * (weight * intensity));
      });
    });
    return vol;
  };

  // Calculate base reference PR Sum to generate realistic mock data if needed
  const prs = profile.prs;
  const prSum = (prs.squat || 140) + (prs.bench || 100) + (prs.deadlift || 180);
  
  // Base realistic weekly volume for an average 3-4 days/week lifter (sets * reps * load)
  const defaultWeeklyBase = Math.round(prSum * 28); // e.g. (140+100+180) * 28 = ~11,760 kg of volume

  // Build final chart array
  const chartData: WeeklyVolumeData[] = [];
  let totalSessionsLogged = 0;

  for (let w = 1; w <= numWeeks; w++) {
    const bucket = weeklyBuckets[w];
    if (!bucket) continue;

    const rpes = bucket.sessions.map(s => s.avgRPE).filter(r => r > 0);
    const avgRpeVal = rpes.length > 0 ? rpes.reduce((sum, r) => sum + r, 0) / rpes.length : 0;
    
    totalSessionsLogged += bucket.sessions.length;

    // If no sessions logged for this week, we generate a realistic progressive baseline 
    // to give the user immediate visual satisfaction of how the workload behaves

    const programPlannedVol = calculatePlannedVolumeForWeek(w);
    let finalVolume = bucket.volume || 0;
    
    // Default planned volume logic if no program exists:
    // If we have actual volume, use it to anchor the planned volume.
    // Otherwise, try to guess based on week 1, or use defaultWeeklyBase.
    let fallbackPlanned = bucket.plannedVolume || 0;
    if (fallbackPlanned === 0) {
       // Try to use a baseline if they haven't logged this week
       const base = defaultWeeklyBase;
       let plannedMult = 1.0;
       if (w % 4 === 1) plannedMult = 0.92;
       else if (w % 4 === 2) plannedMult = 0.95;
       else if (w % 4 === 3) plannedMult = 1.00;
       else if (w % 4 === 0) plannedMult = 0.80; // Deload
       fallbackPlanned = Math.round(base * plannedMult);
    }
    
    let finalPlannedVolume = (programPlannedVol !== null && programPlannedVol > 0) ? programPlannedVol : fallbackPlanned;
    let finalAvgRpe = avgRpeVal;

    const hasAnyProgram = !!profile.customProgram?.weeks && Object.keys(profile.customProgram.weeks).length > 0;
    
    // Only mock real volume if they have NO sessions AT ALL and NO program
    const isMocked = rawSessions.length === 0 && !hasAnyProgram;

    if (isMocked) {
      // Create a nice waves-like block periodization progression
      let multiplier = 1.0;
      let plannedMult = 1.0;
      let rpeEst = 7.0;

      const phase = (w - 1) % 4;
      if (phase === 0) { multiplier = 0.90; plannedMult = 0.92; rpeEst = 7.0; }
      else if (phase === 1) { multiplier = 0.96; plannedMult = 0.95; rpeEst = 7.5; }
      else if (phase === 2) { multiplier = 1.04; plannedMult = 1.00; rpeEst = 8.0; }
      else if (phase === 3) { multiplier = 0.78; plannedMult = 0.80; rpeEst = 6.0; } // Deload week

      finalVolume = Math.round(defaultWeeklyBase * multiplier);
      finalPlannedVolume = Math.round(defaultWeeklyBase * plannedMult);
      finalAvgRpe = rpeEst;
    }

    chartData.push({
      weekLabel: `Semana ${w}`,
      weekIndex: w,
      volume: finalVolume > 0 ? finalVolume : null,
      plannedVolume: finalPlannedVolume,
      sessionCount: isMocked ? 3 : bucket.sessions.length,
      avgRpe: Math.round(finalAvgRpe * 10) / 10
    });
  }

  // Calculate stats based on chartData
  const totalVolumeSum = chartData.reduce((sum, item) => sum + (item.volume || 0), 0);
  const avgWeeklyVolume = chartData.length > 0 ? totalVolumeSum / chartData.length : 0;
  const maxVolumeWeek = chartData.length > 0 ? [...chartData].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0] : { volume: 0, weekLabel: 'N/A' };

  // ACWR (Acute-to-Chronic Workload Ratio) 
  // Acute workload = Latest week volume
  // Chronic workload = average volume of last 4 weeks
  const acuteWorkload = chartData.length > 0 ? (chartData[chartData.length - 1].volume || 0) : 0;
  
  const last4 = chartData.slice(-4);
  const chronicWorkload = last4.length > 0 
    ? last4.reduce((sum, item) => sum + (item.volume || 0), 0) / last4.length 
    : 0;
    
  const acwr = chronicWorkload > 0 ? (acuteWorkload / chronicWorkload) : 1.0;

  // Determine workload status based on ACWR
  let acwrStatus = {
    title: 'Estável & Consistente',
    desc: 'Carga de trabalho equilibrada. Ótimo ritmo para ganho de força constante sem sobrecarga articular.',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: CheckCircle2,
    badge: 'Sweet Spot'
  };

  if (acwr > 1.5) {
    acwrStatus = {
      title: 'Zona de Alto Risco (Fadiga Aguda)',
      desc: 'O volume da última semana subiu rápido demais em relação à sua média recente. Risco elevado de lesão ou overreaching nocivo.',
      colorClass: 'text-viking-red bg-viking-red/10 border-viking-red/25',
      icon: AlertTriangle,
      badge: 'Risco de Lesão'
    };
  } else if (acwr > 1.3) {
    acwrStatus = {
      title: 'Progresso Agressivo',
      desc: 'Sua carga está subindo de forma rápida. Monitore dores articulares e garanta no mínimo 8 horas de sono diárias.',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: Zap,
      badge: 'Sobrecarga Ativa'
    };
  } else if (acwr < 0.8) {
    acwrStatus = {
      title: 'Destreino / Tapering',
      desc: 'Volume significativamente menor do que sua capacidade crônica. Ideal se você estiver em período de descanso ou regeneração pós-combate.',
      colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      icon: TrendingDown,
      badge: 'Descondicionamento'
    };
  }

  // Calculate volume progression % from first 2 weeks to last 2 weeks to show general trend
  const earlyWeeksAvg = chartData.length >= 2 ? ((chartData[0].volume || 0) + (chartData[1].volume || 0)) / 2 : (chartData[0]?.volume || 0);
  const lateWeeksAvg = chartData.length >= 8 ? ((chartData[6].volume || 0) + (chartData[7].volume || 0)) / 2 : (chartData[chartData.length - 1]?.volume || 0);
  const trendPercent = earlyWeeksAvg > 0 ? Math.round(((lateWeeksAvg - earlyWeeksAvg) / earlyWeeksAvg) * 100) : 0;

  return (
    <div id="weekly-volume-line-card" className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden text-left">
      <div className="absolute right-4 top-4 text-viking-gold/5 pointer-events-none">
        <Activity className="w-32 h-32" />
      </div>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-viking-gold/15 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-viking-gold">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="font-viking-medieval text-xs font-black uppercase tracking-widest">Métricas de Sobrecarga Progressiva</span>
          </div>
          <h2 className="text-xl font-black text-white font-viking-display tracking-wide mt-1">
            Progressão de Carga de Trabalho (8 Semanas)
          </h2>
          <p className="text-xs text-viking-silver/80 mt-1 max-w-2xl">
            Acompanhe a variação do Volume Total Semanal acumulado (Séries × Repetições × Peso) e compare com o planejado para garantir supercompensação ideal.
          </p>
        </div>

        {totalSessionsLogged === 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-viking-gold/10 border border-viking-gold/30 text-viking-gold font-bold text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Modelo de Periodização Ativo
          </span>
        )}
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-[#0d0908]/80 border border-viking-gold/10 p-3.5 rounded-2xl">
          <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">Volume Total Acumulado</span>
          <strong className="text-sm text-white font-mono mt-1 block">
            {totalVolumeSum.toLocaleString('pt-BR')} <span className="text-[10px] text-viking-silver font-normal">kg</span>
          </strong>
        </div>

        <div className="bg-[#0d0908]/80 border border-viking-gold/10 p-3.5 rounded-2xl">
          <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">Média de Volume Semanal</span>
          <strong className="text-sm text-viking-gold font-mono mt-1 block">
            {Math.round(avgWeeklyVolume).toLocaleString('pt-BR')} <span className="text-[10px] text-viking-silver font-normal">kg</span>
          </strong>
        </div>

        <div className="bg-[#0d0908]/80 border border-viking-gold/10 p-3.5 rounded-2xl">
          <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">Pico de Trabalho</span>
          <strong className="text-sm text-white font-mono mt-1 block">
            {(maxVolumeWeek.volume || 0).toLocaleString('pt-BR')} <span className="text-[10px] text-viking-silver font-normal">kg ({maxVolumeWeek.weekLabel})</span>
          </strong>
        </div>

        <div className="bg-[#0d0908]/80 border border-viking-gold/10 p-3.5 rounded-2xl">
          <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">Tendência Geral</span>
          <div className="flex items-center gap-1.5 mt-1">
            <strong className={`text-sm font-mono ${trendPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendPercent >= 0 ? `+${trendPercent}%` : `${trendPercent}%`}
            </strong>
            {trendPercent >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* LINE CHART CONTAINER */}
      <div className="bg-[#0d0908]/40 border border-viking-gold/10 rounded-2xl p-4 mb-5">
        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="weekLabel" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                dx={-5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WeeklyVolumeData;
                    return (
                      <div className="bg-[#0b0c10]/95 border border-viking-gold/20 rounded-2xl p-3.5 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                        <p className="font-bold text-viking-gold">{data.weekLabel}</p>
                        <div className="border-t border-viking-gold/15 pt-1.5 mt-1 space-y-1">
                          <p className="text-white font-semibold flex items-center justify-between gap-5">
                            <span>Volume Real:</span>
                            <span className="text-viking-gold font-mono font-bold">{(data.volume || 0).toLocaleString('pt-BR')} kg</span>
                          </p>
                          <p className="text-viking-silver flex items-center justify-between gap-5">
                            <span>Volume Planejado:</span>
                            <span className="font-mono text-viking-silver/95">{data.plannedVolume.toLocaleString('pt-BR')} kg</span>
                          </p>
                          <p className="text-viking-silver flex items-center justify-between gap-5">
                            <span>RPE Médio:</span>
                            <span className="text-amber-400 font-mono font-bold">@{data.avgRpe} RPE</span>
                          </p>
                          <p className="text-viking-silver/60 text-[10px]">
                            Consumo de {data.sessionCount} treinos na semana
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
              />
              <Line 
                connectNulls={true}
                name="Volume Real Realizado (kg)"
                type="monotone" 
                dataKey="volume" 
                stroke="#d4af37" 
                strokeWidth={3}
                dot={{ fill: '#e5c158', stroke: '#0d0908', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#ffffff' }}
              />
              <Line 
                name="Volume Alvo Planejado (kg)"
                type="monotone" 
                dataKey="plannedVolume" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: 'rgba(255,255,255,0.4)', stroke: '#0d0908', strokeWidth: 1, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ATHLETIC COACHING ADVICE - ACWR */}
      {showTips && (
        <div className={`p-4 border rounded-2xl relative overflow-hidden transition-all duration-300 ${acwrStatus.colorClass}`}>
          <div className="absolute right-3 top-3 opacity-[0.03] pointer-events-none">
            <Activity className="w-24 h-24" />
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-black/40 shrink-0 mt-0.5">
              <acwrStatus.icon className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-white">
                  Análise da Carga de Trabalho: <span className="underline">{acwrStatus.title}</span>
                </h4>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-black/60 text-viking-gold border border-viking-gold/20">
                  Razão ACWR: {acwr.toFixed(2)} ({acwrStatus.badge})
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-viking-silver/90">
                {acwrStatus.desc} Para os powerlifters da tribo, a variação ideal de carga (Zona de Segurança / Sweet Spot) situa-se entre <strong>0.8 e 1.3</strong>. Modificações bruscas e picos agudos de volume reduzem o ganho de força absoluta e aumentam a fadiga acumulada do sistema nervoso central.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
