import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const startPattern = `                return (
                  <>
                    {/* Desktop Table View */}`;
const endPattern = `                    </div>
                  </>
                );
              })()}`;

const startIndex = content.indexOf(startPattern);
const endIndex = content.indexOf(endPattern, startIndex) + endPattern.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Pattern not found!");
    process.exit(1);
}

const replacement = `                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudentEmails.map(email => {
                      const s = studentsData[email];
                      const lastSess = s.sessions[0];
                      const todayString = new Date().toLocaleDateString('pt-BR');
                      const hasTrainedToday = s.sessions?.some(sess => sess.date === todayString);
                      const preferredTime = s.preferredTime || '18:00';
                      const isPastPreferredTime = simulatedTime > preferredTime;
                      const isSelected = selectedStudentEmails.includes(email);

                      return (
                        <div 
                          key={email}
                          onClick={() => {
                            if (isBatchMode) {
                              setSelectedStudentEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
                            } else {
                              setEditingStudentEmail(email);
                              setDrawerTitle(\`Painel do Guerreiro: \${s.name}\`);
                              setDrawerType('studentPanel');
                              setDrawerOpen(true);
                            }
                          }}
                          className={\`relative p-5 rounded-2xl border transition-all cursor-pointer shadow-md flex flex-col gap-3 \${
                            isSelected 
                              ? 'bg-viking-gold/10 border-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                              : 'bg-[#0d0908]/80 border-viking-gold/20 hover:border-viking-gold/50 hover:bg-[#140e0c]'
                          }\`}
                        >
                          {isBatchMode && (
                            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedStudentEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])}
                                className="text-viking-gold hover:text-white transition-colors cursor-pointer"
                              >
                                {isSelected ? <CheckSquare className="w-5 h-5 text-viking-gold" /> : <Square className="w-5 h-5 text-viking-silver/40" />}
                              </button>
                            </div>
                          )}

                          <div className="flex flex-col gap-1 pr-6">
                            <h4 className="text-base font-bold text-[#e0d3a8]">{s.name}</h4>
                            <p className="text-[10px] text-viking-silver truncate">{email}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#1a1210] p-2 rounded-xl border border-viking-gold/10">
                              <p className="text-[9px] text-viking-silver/60 uppercase font-bold tracking-wider mb-1">Status</p>
                              <span className={\`inline-block text-[11px] font-black uppercase \${
                                s.status === 'Pago' ? 'text-emerald-400' : s.status === 'Pendente' ? 'text-amber-400' : 'text-red-400'
                              }\`}>
                                {s.status}
                              </span>
                            </div>
                            <div className="bg-[#1a1210] p-2 rounded-xl border border-viking-gold/10">
                              <p className="text-[9px] text-viking-silver/60 uppercase font-bold tracking-wider mb-1">Último RPE</p>
                              {lastSess ? (
                                <span className={\`inline-flex items-center gap-1 font-bold text-[11px] \${
                                  lastSess.avgRPE >= 9 ? 'text-red-400' : lastSess.avgRPE >= 7.5 ? 'text-amber-400' : 'text-emerald-400'
                                }\`}>
                                  <Activity className="w-3 h-3" /> {lastSess.avgRPE.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-viking-silver/50 text-[11px] italic">N/A</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-1 pt-3 border-t border-viking-gold/10">
                            {hasTrainedToday ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]" title="Treino registrado hoje!">
                                <Check className="w-3.5 h-3.5" /> Concluído
                              </span>
                            ) : isPastPreferredTime ? (
                              <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[10px] animate-pulse" title={\`Horário de preferência (\${preferredTime}) ultrapassado\`}>
                                <AlertTriangle className="w-3 h-3 text-red-500" /> Atrasado (\${preferredTime})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-viking-silver/65 font-medium text-[10px]" title={\`Horário preferencial às \${preferredTime}\`}>
                                <Clock className="w-3 h-3" /> Pendente (\${preferredTime})
                              </span>
                            )}
                            
                            {!isBatchMode && (
                              <span className="text-[10px] text-viking-gold font-bold uppercase flex items-center gap-1 hover:underline">
                                Acessar <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync('src/App.tsx', content, 'utf8');
