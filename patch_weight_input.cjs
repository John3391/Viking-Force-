const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `<div className="flex items-center gap-1 bg-[#1d1613] border border-viking-gold/30 rounded-lg px-2 py-2 flex-1 min-w-[100px]">
                                    <span className="text-[10px] text-viking-gold/70 uppercase font-bold mr-1">Peso:</span>
                                    <DebouncedInput
                                      type="number"
                                      value={set.weight === 0 ? '' : set.weight}
                                      disabled={set.done}
                                      placeholder="0"
                                      onChange={(val: string) => {
                                        const parsed = val === '' ? 0 : (parseFloat(val) || 0);
                                        setExerciseSetsState(prev => {
                                          const sets = [...(prev[ex.id] || [])];
                                          if (sets[setIdx]) {
                                            sets[setIdx] = { ...sets[setIdx], weight: parsed };
                                          }
                                          return { ...prev, [ex.id]: sets };
                                        });
                                      }}
                                      className="w-full bg-transparent text-right font-mono text-base font-bold focus:outline-none text-white disabled:text-viking-gold/50"
                                      title={ex.main ? "Carga sugerida pelo treinador. Você pode alterar se realizou uma carga diferente." : "Carga realizada (kg)"}
                                    />
                                    <span className="text-[10px] text-viking-gold/70 font-bold ml-1">kg</span>
                                    {ex.main && <Flame className="w-3.5 h-3.5 text-viking-gold/60 shrink-0" title="Carga sugerida pelo treinador. Altere se precisar ajustar." />}
                                  </div>`;

const replacementStr = `<div className="flex items-center gap-1 bg-[#1d1613] border border-viking-gold/30 rounded-lg px-2 py-2 flex-1 min-w-[100px]">
                                    <span className="text-[10px] text-viking-gold/70 uppercase font-bold mr-1 hidden sm:inline">Peso:</span>
                                    <button
                                      type="button"
                                      disabled={set.done}
                                      onClick={() => {
                                        setExerciseSetsState(prev => {
                                          const sets = [...(prev[ex.id] || [])];
                                          if (sets[setIdx]) {
                                            sets[setIdx] = { ...sets[setIdx], weight: Math.max(0, (sets[setIdx].weight || 0) - 2.5) };
                                          }
                                          return { ...prev, [ex.id]: sets };
                                        });
                                      }}
                                      className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                    >
                                      -
                                    </button>
                                    <DebouncedInput
                                      type="number"
                                      inputMode="decimal"
                                      step="2.5"
                                      value={set.weight === 0 ? '' : set.weight}
                                      disabled={set.done}
                                      placeholder="0"
                                      onChange={(val: string) => {
                                        const parsed = val === '' ? 0 : (parseFloat(val) || 0);
                                        setExerciseSetsState(prev => {
                                          const sets = [...(prev[ex.id] || [])];
                                          if (sets[setIdx]) {
                                            sets[setIdx] = { ...sets[setIdx], weight: parsed };
                                          }
                                          return { ...prev, [ex.id]: sets };
                                        });
                                      }}
                                      className="w-full min-w-[40px] bg-transparent text-center font-mono text-base font-bold focus:outline-none text-white disabled:text-viking-gold/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      title={ex.main ? "Carga sugerida pelo treinador. Você pode alterar se realizou uma carga diferente." : "Carga realizada (kg)"}
                                    />
                                    <button
                                      type="button"
                                      disabled={set.done}
                                      onClick={() => {
                                        setExerciseSetsState(prev => {
                                          const sets = [...(prev[ex.id] || [])];
                                          if (sets[setIdx]) {
                                            sets[setIdx] = { ...sets[setIdx], weight: (sets[setIdx].weight || 0) + 2.5 };
                                          }
                                          return { ...prev, [ex.id]: sets };
                                        });
                                      }}
                                      className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                    >
                                      +
                                    </button>
                                    <span className="text-[10px] text-viking-gold/70 font-bold ml-1 hidden sm:inline">kg</span>
                                    {ex.main && <Flame className="w-3.5 h-3.5 text-viking-gold/60 shrink-0" title="Carga sugerida pelo treinador. Altere se precisar ajustar." />}
                                  </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Success');
} else {
  console.log('Target string not found, trying regex approach');
  
  // Create a regex to match the div structure
  code = code.replace(
    /<div className="flex items-center gap-1 bg-\[#1d1613\] border border-viking-gold\/30 rounded-lg px-2 py-2 flex-1 min-w-\[100px\]">[\s\S]*?<DebouncedInput[\s\S]*?className="w-full bg-transparent text-right font-mono text-base font-bold focus:outline-none text-white disabled:text-viking-gold\/50"[\s\S]*?{ex\.main && <Flame.*?\}<\/div>/g,
    replacementStr
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Done with regex');
}
