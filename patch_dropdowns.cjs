const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Patch in slide view navigation
code = code.replace(
  /setSelectedDay\(e\.target\.value\);\s*setSessionRpeState\(\{\}\);\s*setExerciseFailureState\(\{\}\);\s*setExerciseWarmupState\(\{\}\);\s*setExerciseSetsState\(\{\}\);\s*setCurrentExerciseIndex\(0\);/g,
  `const newDay = e.target.value;
                              setSelectedDay(newDay);
                              setEditorDay(newDay);
                              handleEditorLoadWeekDay(selectedWeek, newDay);
                              setSessionRpeState({}); 
                              setExerciseFailureState({});
                              setExerciseWarmupState({});
                              setExerciseSetsState({});
                              setCurrentExerciseIndex(0);`
);

// Patch in list view navigation (around line 10556)
code = code.replace(
  /onChange=\{e => \{ setSelectedDay\(e\.target\.value\); setSessionRpeState\(\{\}\); setExerciseFailureState\(\{\}\); \}\}/g,
  `onChange={e => { 
                          const newDay = e.target.value;
                          setSelectedDay(newDay);
                          setEditorDay(newDay);
                          handleEditorLoadWeekDay(selectedWeek, newDay);
                          setSessionRpeState({}); 
                          setExerciseFailureState({}); 
                          setExerciseWarmupState({});
                          setExerciseSetsState({});
                          setCurrentExerciseIndex(0);
                        }}`
);

fs.writeFileSync('src/App.tsx', code);
