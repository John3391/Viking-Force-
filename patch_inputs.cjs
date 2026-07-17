const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// sessionNote
code = code.replace(
  /<textarea\s+id="sessionNote"\s+rows=\{3\}\s+value=\{sessionNote\}\s+onChange=\{e => setSessionNote\(e\.target\.value\)\}/g,
  '<DebouncedTextarea id="sessionNote" rows={3} value={sessionNote} onChange={(val: string) => setSessionNote(val)}'
);

// set.reps
code = code.replace(
  /<input\s*type="number"\s*value=\{set\.reps === 0 \? '' : set\.reps\}\s*placeholder="0"\s*disabled=\{set\.done\}\s*onChange=\{\(e\) => \{([\s\S]*?)return \{ \.\.\.prev, \[ex\.id\]: sets \};\s*\}\}\);\s*\}\}/g,
  `<DebouncedInput
                                      type="number"
                                      value={set.reps === 0 ? '' : set.reps}
                                      placeholder="0"
                                      disabled={set.done}
                                      onChange={(val: string) => {
                                        const parsed = val === '' ? 0 : (parseInt(val) || 0);
                                        setExerciseSetsState(prev => {
                                          const sets = [...(prev[ex.id] || [])];
                                          if (sets[setIdx]) {
                                            sets[setIdx] = { ...sets[setIdx], reps: parsed };
                                          }
                                          return { ...prev, [ex.id]: sets };
                                        });
                                      }}`
);

// set.weight
code = code.replace(
  /<input\s*type="number"\s*value=\{set\.weight === 0 \? '' : set\.weight\}\s*step="0\.5"\s*placeholder="0"\s*disabled=\{set\.done\}\s*onChange=\{\(e\) => \{([\s\S]*?)return \{ \.\.\.prev, \[ex\.id\]: sets \};\s*\}\}\);\s*\}\}/g,
  `<DebouncedInput
                                      type="number"
                                      value={set.weight === 0 ? '' : set.weight}
                                      step="0.5"
                                      placeholder="0"
                                      disabled={set.done}
                                      onChange={(val: string) => {
                                        const parsed = val === '' ? 0 : (parseFloat(val) || 0);
                                        setExerciseSetsState(prev => {
                                          const sets = [...(prev[ex.id] || [])];
                                          if (sets[setIdx]) {
                                            sets[setIdx] = { ...sets[setIdx], weight: parsed };
                                          }
                                          return { ...prev, [ex.id]: sets };
                                        });
                                      }}`
);

fs.writeFileSync('src/App.tsx', code);
