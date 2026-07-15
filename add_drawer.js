import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `                 {/* 6. WhatsApp billing */}`;

const insertion = `                {/* 5.5 Student Action Panel */}
                {drawerType === 'studentPanel' && (() => {
                  const s = studentsData[editingStudentEmail];
                  if (!s) return <p className="text-viking-silver">Atleta não encontrado.</p>;

                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-viking-gold/5 border border-viking-gold/15 mb-4">
                        <p className="text-base font-black text-white">{s.name}</p>
                        <p className="text-xs text-viking-silver">{editingStudentEmail}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            setActiveNoteStudentEmail(editingStudentEmail);
                            setPublicNoteInput(s.publicNote || '');
                            setDrawerTitle(\`Nota Pública / Parabenizar \${s.name}\`);
                            setDrawerType('publicNote');
                          }}
                          className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Parabenizar</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setActiveChatStudentEmail(editingStudentEmail);
                            setDrawerTitle(\`Chat com \${s.name}\`);
                            setDrawerType('chat');
                          }}
                          className="p-3 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/30 text-viking-gold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Feedback</span>
                        </button>

                        <button 
                          onClick={() => {
                            setDrawerTitle(\`Editar Cadastro de \${s.name}\`);
                            setDrawerType('editStudent');
                          }}
                          className="p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Editar Cadastro</span>
                        </button>

                        <button 
                          onClick={() => {
                            setDrawerOpen(false);
                            openProgramEditor(editingStudentEmail);
                          }}
                          className="p-3 rounded-xl bg-viking-dark border border-viking-gold/25 hover:border-viking-gold hover:bg-viking-gold/10 text-viking-silver transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4 text-viking-gold" /> <span className="text-xs font-bold uppercase tracking-wider">Prescrever Treino</span>
                        </button>

                        <button 
                          onClick={() => {
                            sendWorkoutPlanEmail(editingStudentEmail, s);
                          }}
                          className="p-3 rounded-xl bg-[#0d0908] border border-viking-gold/20 hover:border-viking-gold/50 text-viking-gold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Mail className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Enviar Ficha</span>
                        </button>

                        <button 
                          onClick={() => {
                            setDrawerOpen(false);
                            setDeletingStudentEmail(editingStudentEmail);
                          }}
                          className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 text-red-400 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Remover Guerreiro</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

`;

content = content.replace(anchor, insertion + anchor);
fs.writeFileSync('src/App.tsx', content, 'utf8');
