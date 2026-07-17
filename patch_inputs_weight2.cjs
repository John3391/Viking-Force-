const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<input\s+type="number"\s+value=\{set\.weight === 0 \? '' : set\.weight\}\s+disabled=\{set\.done\}\s+placeholder="0"\s+onChange=\{\(e\) => \{[\s\S]*?className="w-full bg-transparent/g,
  `<DebouncedInput
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
                                      className="w-full bg-transparent`
);

fs.writeFileSync('src/App.tsx', code);
