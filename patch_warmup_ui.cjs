const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="flex flex-wrap items-center gap-1\.5 text-\[11px\] text-viking-silver">\s*\{warmupArray\.map\(\(w: any, wIdx\) => \([\s\S]*?<\/React\.Fragment>\s*\)\)\}\s*<\/div>/;

const replacement = `<div className="flex flex-wrap items-center gap-1.5 text-[11px] text-viking-silver">
                                    {warmupArray.map((w: any, wIdx) => {
                                      const isDone = exerciseWarmupState[ex.id]?.[wIdx];
                                      return (
                                        <React.Fragment key={wIdx}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setExerciseWarmupState(prev => {
                                                const currentExWarmup = prev[ex.id] || [];
                                                const newExWarmup = [...currentExWarmup];
                                                newExWarmup[wIdx] = !newExWarmup[wIdx];
                                                return { ...prev, [ex.id]: newExWarmup };
                                              });
                                            }}
                                            className={\`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all cursor-pointer \${isDone ? 'bg-green-950/30 border-green-500/40 text-green-400' : 'bg-black/40 border-viking-gold/20 text-viking-silver hover:border-viking-gold/50'}\`}
                                          >
                                            <div className={\`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors \${isDone ? 'bg-green-500 border-green-500 text-black' : 'border-viking-gold/40 text-transparent'}\`}>
                                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                                            </div>
                                            <span className={w.isTarget && !isDone ? 'text-viking-gold font-bold' : ''}>
                                              {w.reps}r @ <strong className={isDone ? 'text-green-300' : 'text-white'}>{w.weight} kg</strong> ({w.isTarget ? 'Alvo' : \`\${Math.round(w.percent * 100)}%\`})
                                            </span>
                                          </button>
                                          {wIdx < warmupArray.length - 1 && <span className="text-viking-gold/40">→</span>}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
