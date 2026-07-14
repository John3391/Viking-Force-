import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingDown, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  Check, 
  Info, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Dumbbell, 
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Skull
} from 'lucide-react';
import { StudentProfile, TrainingProgram, Exercise } from '../types';

interface FailureSentinelProps {
  studentsData: Record<string, StudentProfile>;
  trainingProgram: TrainingProgram;
  onSaveProgram: (newProg: TrainingProgram) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface FailureStats {
  exerciseName: string;
  timesPerformed: number;
  failuresCount: number;
  failureRate: number;
  offendingStudents: string[];
  avgFailedRpe: number;
}

export default function FailureSentinel({
  studentsData,
  trainingProgram,
  onSaveProgram,
  showToast
}: FailureSentinelProps) {
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Analyze historical sessions
  const getAnalysisData = (): FailureStats[] => {
    const statsMap: Record<string, {
      exerciseName: string;
      timesPerformed: number;
      failuresCount: number;
      offendingStudents: Set<string>;
      failedRpes: number[];
    }> = {};

    // 1. Process real historical data
    Object.keys(studentsData).forEach(email => {
      const student = studentsData[email];
      const sessions = student.sessions || [];
      
      sessions.forEach(sess => {
        const exercises = sess.exercises || [];
        exercises.forEach(ex => {
          const exKey = ex.name.toLowerCase().trim();
          if (!statsMap[exKey]) {
            statsMap[exKey] = {
              exerciseName: ex.name,
              timesPerformed: 0,
              failuresCount: 0,
              offendingStudents: new Set<string>(),
              failedRpes: []
            };
          }
          
          statsMap[exKey].timesPerformed += 1;
          if (ex.failed) {
            statsMap[exKey].failuresCount += 1;
            statsMap[exKey].offendingStudents.add(student.name);
            statsMap[exKey].failedRpes.push(ex.rpe);
          }
        });
      });
    });

    // 2. Mix or override with simulation data if requested
    if (simulationMode) {
      // Add simulated failures for demo/preview purposes
      const simulatedExercises = [
        { name: 'Agachamento Principal', total: 12, failed: 4, students: ['Ragnar Lothbrok', 'Lagertha'] },
        { name: 'Supino Reto Barra', total: 10, failed: 3, students: ['Bjorn Ironside', 'Floki'] },
        { name: 'Levantamento Terra Convencional', total: 8, failed: 1, students: ['Ivar Desossado'] }
      ];

      simulatedExercises.forEach(sim => {
        const exKey = sim.name.toLowerCase().trim();
        if (!statsMap[exKey]) {
          statsMap[exKey] = {
            exerciseName: sim.name,
            timesPerformed: 0,
            failuresCount: 0,
            offendingStudents: new Set<string>(),
            failedRpes: []
          };
        }
        statsMap[exKey].timesPerformed += sim.total;
        statsMap[exKey].failuresCount += sim.failed;
        sim.students.forEach(st => statsMap[exKey].offendingStudents.add(st));
        for (let i = 0; i < sim.failed; i++) {
          statsMap[exKey].failedRpes.push(9.5);
        }
      });
    }

    // Map to array and filter out exercises with zero failures
    return Object.keys(statsMap)
      .map(key => {
        const item = statsMap[key];
        const rpeSum = item.failedRpes.reduce((sum, val) => sum + val, 0);
        const avgRpe = item.failedRpes.length > 0 ? rpeSum / item.failedRpes.length : 0;
        const rate = item.timesPerformed > 0 ? (item.failuresCount / item.timesPerformed) * 100 : 0;

        return {
          exerciseName: item.exerciseName,
          timesPerformed: item.timesPerformed,
          failuresCount: item.failuresCount,
          failureRate: rate,
          offendingStudents: Array.from(item.offendingStudents),
          avgFailedRpe: avgRpe
        };
      })
      .filter(stat => stat.failuresCount > 0)
      .sort((a, b) => b.failureRate - a.failureRate || b.failuresCount - a.failuresCount);
  };

  const analysis = getAnalysisData();

  // Handle periodization adjustment
  const handleApplyAdjustment = (stat: FailureStats) => {
    const isHighSeverity = stat.failureRate >= 20;
    const intensityReduction = isHighSeverity ? 0.075 : 0.05; // 7.5% or 5%
    const rpeReduction = isHighSeverity ? 1.0 : 0.5;

    // Clone the training program to modify it
    const clonedProgram = JSON.parse(JSON.stringify(trainingProgram)) as TrainingProgram;
    let modifiedCount = 0;

    // Loop through all weeks and days to find matching exercises
    Object.keys(clonedProgram.weeks).forEach(weekStr => {
      const weekNum = Number(weekStr);
      const weekWorkout = clonedProgram.weeks[weekNum];
      if (weekWorkout) {
        ['A', 'B', 'C'].forEach(day => {
          const exercises = weekWorkout[day] || [];
          exercises.forEach((ex: Exercise) => {
            if (ex.name.toLowerCase().trim() === stat.exerciseName.toLowerCase().trim()) {
              // Adjust Intensity if it is a number
              if (typeof ex.intensity === 'number') {
                const oldIntensity = ex.intensity;
                const newIntensity = Math.max(0.30, oldIntensity - intensityReduction);
                ex.intensity = Number(newIntensity.toFixed(3));
              } else if (typeof ex.intensity === 'string') {
                // Try parsing string with %
                const match = ex.intensity.match(/(\d+)%/);
                if (match) {
                  const percentValue = parseInt(match[1]);
                  const newPercent = Math.max(30, percentValue - (intensityReduction * 100));
                  ex.intensity = `${newPercent}% 1RM`;
                }
              }

              // Adjust target RPE
              const oldRPE = ex.targetRPE || 8;
              ex.targetRPE = Math.max(6, oldRPE - rpeReduction);

              // Add a technique tip automatically
              if (!ex.techniqueTips || !ex.techniqueTips.includes('Ajustado por falha')) {
                ex.techniqueTips = `⚠️ Ajustado por falha em periodização (-${(intensityReduction*100).toFixed(1)}% intensidade / -${rpeReduction} RPE). Foco extremo em controle excêntrico. ${ex.techniqueTips || ''}`.trim();
              }

              modifiedCount += 1;
            }
          });
        });
      }
    });

    if (modifiedCount > 0) {
      onSaveProgram(clonedProgram);
      showToast(
        `Sentinela de Falhas: O exercício "${stat.exerciseName}" teve sua intensidade reduzida em ${(intensityReduction * 100).toFixed(1)}% e RPE alvo ajustado em -${rpeReduction} ponto(s) em ${modifiedCount} prescrição(ões) do programa!`,
        'success'
      );
    } else {
      showToast(
        `O exercício "${stat.exerciseName}" foi analisado, mas não foi encontrado no programa ativo atual (Semana/Dia) para alteração automática.`,
        'info'
      );
    }
  };

  return (
    <div id="failure-sentinel-card" className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute right-4 top-4 text-viking-red/5 pointer-events-none">
        <Skull className="w-32 h-32" />
      </div>

      {/* Title / Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-viking-gold/15 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-viking-red">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="font-viking-medieval text-xs font-black uppercase tracking-widest">Sentinela de Mecânica & Falhas</span>
          </div>
          <h2 className="text-xl font-black text-white font-viking-display tracking-wide mt-1">
            Análise de Falhas de Execução (RPE)
          </h2>
          <p className="text-xs text-viking-silver/80 mt-1 max-w-2xl">
            Monitoramento de falhas registradas na arena de treinos. O sistema analisa onde a exaustão neuromuscular impede as repetições planejadas e sugira correções automáticas de periodização.
          </p>
        </div>

        {/* Demo/Simulation Trigger */}
        <button
          onClick={() => setSimulationMode(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-1.5 cursor-pointer ${
            simulationMode
              ? 'bg-viking-gold/20 border-viking-gold text-viking-gold shadow-[0_0_10px_rgba(197,160,89,0.15)]'
              : 'bg-[#0d0908]/80 border-viking-gold/10 text-viking-silver/60 hover:text-viking-gold hover:border-viking-gold/30'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${simulationMode ? 'animate-spin' : ''}`} />
          <span>{simulationMode ? 'Simulação Ativa' : 'Simular Falhas (Demo)'}</span>
        </button>
      </div>

      {/* Main body / List */}
      {analysis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-emerald-950/10 border border-emerald-500/10 rounded-2xl">
          <span className="text-3xl mb-2.5">🛡️</span>
          <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wide font-viking-medieval">Soberania de Ferro Absoluta</h4>
          <p className="text-xs text-viking-silver/80 max-w-md mt-1">
            Todos os guerreiros estão concluindo suas séries prescritas com sucesso! Nenhuma falha crítica ou déficit motor foi registrado nas últimas sessões. A integridade muscular está em dia.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-viking-red/5 border border-viking-red/15 text-xs text-viking-silver/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-viking-red shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Alerta de Fadiga do Clã:</p>
              <p className="text-[11px] mt-0.5">
                Os exercícios abaixo apresentam falhas repetidas. Isso sugere sobrecarga no acúmulo de intensidade relativa (% de 1RM) em relação à capacidade atual de recuperação dos atletas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {analysis.map((stat) => {
              const isHigh = stat.failureRate >= 20;
              const isExpanded = expandedExercise === stat.exerciseName;

              return (
                <div 
                  key={stat.exerciseName}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? 'bg-[#0d0908]/90 border-viking-gold/40 shadow-lg shadow-black/40' 
                      : 'bg-[#0d0908]/50 border-viking-gold/10 hover:border-viking-gold/25'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div 
                    onClick={() => setExpandedExercise(isExpanded ? null : stat.exerciseName)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 border ${
                        isHigh 
                          ? 'bg-red-950/40 text-viking-red border-viking-red/30' 
                          : 'bg-amber-950/40 text-amber-400 border-amber-800/30'
                      }`}>
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wide">
                          {stat.exerciseName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px]">
                          <span className="text-viking-silver font-semibold">
                            Executado: <strong className="text-white">{stat.timesPerformed}x</strong>
                          </span>
                          <span className="text-viking-silver/40">•</span>
                          <span className="text-viking-silver font-semibold">
                            Falhou: <strong className={isHigh ? 'text-viking-red' : 'text-amber-400'}>{stat.failuresCount}x</strong>
                          </span>
                          <span className="text-viking-silver/40">•</span>
                          <span className="font-semibold text-viking-silver flex items-center gap-1">
                            Alunos afetados: <strong className="text-white truncate max-w-[120px]">{stat.offendingStudents.join(', ')}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Badge Indicator */}
                    <div className="flex items-center justify-between md:justify-end gap-3.5">
                      <div className="text-right">
                        <span className="text-[10px] text-viking-silver/50 uppercase font-black tracking-widest block">Índice de Falhas</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className={`text-sm font-black ${isHigh ? 'text-viking-red' : 'text-amber-400'}`}>
                            {stat.failureRate.toFixed(0)}%
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                            isHigh 
                              ? 'bg-red-950 text-viking-red border border-red-900/40' 
                              : 'bg-amber-950 text-amber-400 border border-amber-900/40'
                          }`}>
                            {isHigh ? 'Alto Risco' : 'Atenção'}
                          </span>
                        </div>
                      </div>

                      <div className="text-viking-gold/40">
                        <ChevronRight className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-viking-gold/15 bg-black/40 overflow-hidden"
                      >
                        <div className="p-4.5 space-y-4 text-xs">
                          
                          {/* Grid statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0d0908]/90 p-3 rounded-xl border border-viking-gold/5">
                            <div>
                              <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">RPE Médio na Falha</span>
                              <strong className="text-xs text-white mt-0.5 block">@{stat.avgFailedRpe.toFixed(1)} RPE</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">Total Execuções</span>
                              <strong className="text-xs text-white mt-0.5 block">{stat.timesPerformed} registros</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">Teto Sugerido</span>
                              <strong className="text-xs text-emerald-400 mt-0.5 block">@{isHigh ? '8.0 RPE' : '8.5 RPE'}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-viking-silver/50 uppercase font-black block tracking-wider">Severidade de Ajuste</span>
                              <strong className={`text-xs mt-0.5 block uppercase font-bold ${isHigh ? 'text-viking-red' : 'text-amber-400'}`}>
                                {isHigh ? 'Forte (7.5% 1RM)' : 'Leve (5.0% 1RM)'}
                              </strong>
                            </div>
                          </div>

                          {/* Suggested Correction Details Card */}
                          <div className="bg-[#1a1210]/70 border border-viking-gold/15 p-4 rounded-xl space-y-3 relative overflow-hidden">
                            <div className="absolute right-3 top-3 opacity-[0.03] pointer-events-none">
                              <Sparkles className="w-20 h-20 text-viking-gold" />
                            </div>
                            
                            <h5 className="font-bold text-[#e0d3a8] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                              <Zap className="w-4 h-4 text-viking-gold animate-bounce" /> Estratégia Recomendada de Ajuste na Periodização
                            </h5>
                            
                            <div className="space-y-2 text-viking-silver font-semibold leading-relaxed">
                              <p className="text-[11px]">
                                {isHigh ? (
                                  <>
                                    O índice de falhas acima de 20% no <strong className="text-white">{stat.exerciseName}</strong> aponta para um desgaste metabólico crônico. Sugere-se uma <strong className="text-viking-gold">redução imediata de 7.5% de intensidade alvo</strong> e corte de <strong className="text-viking-gold">1 ponto no RPE alvo</strong> em todas as semanas do programa de treinos. 
                                    <span className="block mt-1.5 text-[10px] text-viking-silver/70 italic bg-black/30 p-2 rounded border border-viking-gold/5">
                                      Adicionalmente, inclua 1 série de back-off com 10% menos carga para compensar o volume sem sobrecarregar a articulação.
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    As falhas ocasionais de RPE no <strong className="text-white">{stat.exerciseName}</strong> indicam que a carga prescrita está ligeiramente acima do limite de exaustão mecânica. Sugere-se um <strong className="text-viking-gold">ajuste profilático de 5% de intensidade alvo</strong> e corte de <strong className="text-viking-gold">0.5 no RPE alvo</strong> para restabelecer a consistência mecânica.
                                  </>
                                )}
                              </p>
                            </div>

                            {/* CTA Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-viking-gold/10">
                              <button
                                onClick={() => handleApplyAdjustment(stat)}
                                className="w-full sm:w-auto px-4.5 py-2 rounded-xl bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-viking-gold/15 cursor-pointer transition-all duration-200"
                              >
                                <Check className="w-4 h-4" />
                                Aplicar Ajuste de Intensidade Automático
                              </button>
                              
                              <span className="hidden sm:inline text-viking-silver/40 text-xs">|</span>
                              
                              <p className="text-[10px] text-viking-silver/60 italic text-center sm:text-left">
                                Isso reescreverá a intensidade e RPE de todas as prescrições deste exercício no programa.
                              </p>
                            </div>

                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
