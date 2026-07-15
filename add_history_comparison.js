import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                {/* 1. History Drawer */}
                {drawerType === 'history' && activeStudentProfile && (
                  <div className="space-y-4">
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

                    {activeStudentProfile.sessions.length === 0 ? (`;

const replacement = `                {/* 1. History Drawer */}
                {drawerType === 'history' && activeStudentProfile && (
                  <div className="space-y-4">
                    <div className="flex bg-[#0d0908] rounded-xl border border-viking-gold/20 p-1 mb-4">
                      <button
                        onClick={() => setHistoryTab('list')}
                        className={\`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all \${
                          historyTab === 'list' 
                            ? 'bg-viking-gold/20 text-viking-gold shadow-sm' 
                            : 'text-viking-silver hover:text-white'
                        }\`}
                      >
                        Lista de Treinos
                      </button>
                      <button
                        onClick={() => setHistoryTab('comparison')}
                        className={\`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all \${
                          historyTab === 'comparison' 
                            ? 'bg-viking-gold/20 text-viking-gold shadow-sm' 
                            : 'text-viking-silver hover:text-white'
                        }\`}
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
                       
                       Object.values(studentsData).forEach(student => {
                         student.sessions.forEach(sess => {
                           if (sess.avgRPE && sess.avgRPE > 0) {
                             clanTotalRpe += sess.avgRPE;
                             clanRpeCount++;
                           }
                           if (sess.totalAchievedVolume) {
                             clanTotalVolume += sess.totalAchievedVolume;
                             clanSessionsCount++;
                           }
                         });
                       });

                       const clanAvgRpe = clanRpeCount > 0 ? (clanTotalRpe / clanRpeCount).toFixed(1) : 'N/A';
                       const clanAvgVolume = clanSessionsCount > 0 ? (clanTotalVolume / clanSessionsCount).toFixed(0) : 'N/A';

                       // Calcula médias do atleta
                       let athleteTotalRpe = 0;
                       let athleteRpeCount = 0;
                       let athleteTotalVolume = 0;
                       let athleteSessionsCount = 0;

                       activeStudentProfile.sessions.forEach(sess => {
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

                    {historyTab === 'list' && activeStudentProfile.sessions.length === 0 ? (`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Success replacing history UI");
} else {
    console.error("Target history UI not found!");
}
