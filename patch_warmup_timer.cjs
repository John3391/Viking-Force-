const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /newExWarmup\[wIdx\] = !newExWarmup\[wIdx\];\s*return \{ \.\.\.prev, \[ex\.id\]: newExWarmup \};\s*\}\);\s*\}\);\s*\}\}/g,
  `newExWarmup[wIdx] = !newExWarmup[wIdx];
                                                return { ...prev, [ex.id]: newExWarmup };
                                              });
                                              });
                                              if (!isDone) {
                                                setRestTimerActive(true);
                                                setRestTimerRemaining(restTimerSeconds);
                                              }
                                            }}`
);

fs.writeFileSync('src/App.tsx', code);
