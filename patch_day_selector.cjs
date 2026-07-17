const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<span className="text-\[9px\] text-viking-silver uppercase font-black tracking-widest">Navegação Viking<\/span>/;
const replacement = `<div className="flex items-center gap-2">
                          <span className="text-[9px] text-viking-silver uppercase font-black tracking-widest">Dia:</span>
                          <select 
                            value={selectedDay}
                            onChange={e => { 
                              setSelectedDay(e.target.value); 
                              setSessionRpeState({}); 
                              setExerciseFailureState({});
                              setExerciseWarmupState({});
                              setExerciseSetsState({});
                              setCurrentExerciseIndex(0); 
                            }}
                            className="px-2 py-1 rounded bg-black/40 border border-viking-gold/30 text-viking-gold text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-viking-gold cursor-pointer"
                          >
                            {Object.keys((activeStudentProfile?.customProgram || trainingProgram).weeks[selectedWeek] || { A: [], B: [], C: [] }).sort().map(day => (
                              <option key={day} value={day}>Treino {day}</option>
                            ))}
                          </select>
                        </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
