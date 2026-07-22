import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, FileDown, Calendar, Activity, Users, Dumbbell, Zap, ArrowLeft, ArrowRight, Award
} from 'lucide-react';
import { StudentProfile } from '../types';

interface WorkoutHistoryProps {
  activeStudentProfile: StudentProfile;
  studentsData: Record<string, StudentProfile>;
  handleDownloadPDF: (student: StudentProfile) => void;
  handleDownloadMonthlySummaryPDF: (student: StudentProfile) => void;
  handleDownloadAnnualSummaryPDF?: (student: StudentProfile) => void;
  drawerContentRef: React.RefObject<HTMLDivElement>;
}

export function WorkoutHistory({ 
  activeStudentProfile, 
  studentsData, 
  handleDownloadPDF, 
  handleDownloadMonthlySummaryPDF,
  handleDownloadAnnualSummaryPDF,
  drawerContentRef
}: WorkoutHistoryProps) {
  const [historyTab, setHistoryTab] = useState<'list' | 'comparison'>('list');
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState<number>(5);

  useEffect(() => {
    setHistoryPage(1);
  }, [historyTab]);

  const handlePageChange = (newPage: number) => {
    setHistoryPage(newPage);
    if (drawerContentRef.current) {
      drawerContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-[#0d0908] rounded-xl border border-viking-gold/20 p-1 mb-4">
        <button
          onClick={() => setHistoryTab('list')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
            historyTab === 'list' 
              ? 'bg-viking-gold/20 text-viking-gold shadow-sm' 
              : 'text-viking-silver hover:text-white'
          }`}
        >
          Lista de Treinos
        </button>
        <button
          onClick={() => setHistoryTab('comparison')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
            historyTab === 'comparison' 
              ? 'bg-viking-gold/20 text-viking-gold shadow-sm' 
              : 'text-viking-silver hover:text-white'
          }`}
        >
          Evolução vs Clã
        </button>
      </div>

      {historyTab === 'list' && (
        <div className="space-y-2">
          <button 
            onClick={() => handleDownloadPDF(activeStudentProfile)}
            className="w-full py-2.5 px-4 rounded-xl bg-viking-gold/15 hover:bg-viking-gold/25 border border-viking-gold/40 hover:border-viking-gold text-viking-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <FileDown className="w-4 h-4" /> Exportar Sessões em PDF
          </button>
          
          <button 
            onClick={() => handleDownloadMonthlySummaryPDF(activeStudentProfile)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Calendar className="w-4 h-4" /> Resumo Mensal Consolidado (PDF)
          </button>

          {handleDownloadAnnualSummaryPDF && (
            <button 
              onClick={() => handleDownloadAnnualSummaryPDF(activeStudentProfile)}
              className="w-full py-3 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500 text-amber-300 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Award className="w-4.5 h-4.5 text-amber-400" /> Desempenho Anual Consolidado (PDF)
            </button>
          )}
        </div>
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

      {historyTab === 'list' && (() => {
        const allSessions = activeStudentProfile.sessions || [];
        const totalSessionsCount = allSessions.length;
        
        if (totalSessionsCount === 0) {
          return (
            <div className="text-center py-12 text-viking-silver">
              <History className="w-12 h-12 text-viking-gold/30 mx-auto mb-3" />
              <p className="font-bold">Nenhum treino realizado ainda.</p>
              <p className="text-xs mt-1">Conclua sua primeira prova em "Treino Hoje" para iniciar seu histórico.</p>
            </div>
          );
        }

        const totalPagesCount = Math.ceil(totalSessionsCount / historyItemsPerPage) || 1;
        const validCurrentPage = Math.min(Math.max(1, historyPage), totalPagesCount);
        const paginatedSessions = allSessions.slice(
          (validCurrentPage - 1) * historyItemsPerPage,
          validCurrentPage * historyItemsPerPage
        );

        return (
          <div className="space-y-4">
            {/* Controle de Exibição / Paginação Superior */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0d0908]/80 rounded-xl border border-viking-gold/15 text-xs text-viking-silver">
              <div className="flex items-center gap-2">
                <span>Sessões por página:</span>
                <select
                  value={historyItemsPerPage}
                  onChange={(e) => {
                    setHistoryItemsPerPage(Number(e.target.value));
                    setHistoryPage(1);
                  }}
                  className="px-2 py-1 rounded bg-[#140e0c] border border-viking-gold/25 text-[#e0d3a8] text-[11px] font-bold outline-none focus:border-viking-gold cursor-pointer"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={15}>15 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>
              <div className="text-[10px] font-black uppercase text-viking-gold/85 tracking-wider">
                Exibindo {paginatedSessions.length} de {totalSessionsCount} treinos
              </div>
            </div>

            {/* Lista Paginada de Treinos com Animação */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${validCurrentPage}-${historyItemsPerPage}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {paginatedSessions.map((sess, idx) => (
                  <div key={sess.id || idx} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 space-y-3">
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
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Navegação Inferior de Página */}
            {totalPagesCount > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-viking-gold/15">
                <button
                  type="button"
                  disabled={validCurrentPage === 1}
                  onClick={() => handlePageChange(Math.max(1, validCurrentPage - 1))}
                  className="px-3 py-2 rounded-lg bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 text-[#e0d3a8] disabled:opacity-25 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPagesCount }, (_, i) => i + 1).map((p) => {
                    if (totalPagesCount > 5 && Math.abs(p - validCurrentPage) > 1 && p !== 1 && p !== totalPagesCount) {
                      if (p === 2 && validCurrentPage > 3) return <span key={p} className="text-viking-silver/50 px-1 text-xs select-none">...</span>;
                      if (p === totalPagesCount - 1 && validCurrentPage < totalPagesCount - 2) return <span key={p} className="text-viking-silver/50 px-1 text-xs select-none">...</span>;
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          p === validCurrentPage
                            ? 'bg-viking-gold/25 border border-viking-gold text-viking-gold'
                            : 'bg-black/20 border border-viking-gold/10 text-viking-silver hover:border-viking-gold/40 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={validCurrentPage === totalPagesCount}
                  onClick={() => handlePageChange(Math.min(totalPagesCount, validCurrentPage + 1))}
                  className="px-3 py-2 rounded-lg bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 text-[#e0d3a8] disabled:opacity-25 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                >
                  Próximo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
