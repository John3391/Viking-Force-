const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix handleEditorLoadWeekDay
code = code.replace(
  /const handleEditorLoadWeekDay = \(week: number, day: string\) => \{\s*setSelectedWeek\(week\);\s*setSelectedDay\(day\);\s*setCurrentExerciseIndex\(0\);\s*setEditorWeek\(week\);\s*setEditorDay\(day\);/g,
  `const handleEditorLoadWeekDay = (week: number, day: string) => {
    setEditorWeek(week);
    setEditorDay(day);`
);

// Fix onChange 1 (list view)
code = code.replace(
  /onChange=\{e => \{ \s*const newDay = e\.target\.value;\s*setSelectedDay\(newDay\);\s*setEditorDay\(newDay\);\s*handleEditorLoadWeekDay\(selectedWeek, newDay\);\s*setSessionRpeState\(\{\}\); \s*setExerciseFailureState\(\{\}\); \s*setExerciseWarmupState\(\{\}\);\s*setExerciseSetsState\(\{\}\);\s*setCurrentExerciseIndex\(0\);\s*\}\}/g,
  `onChange={e => { 
                          const newDay = e.target.value;
                          setSelectedDay(newDay);
                          setSessionRpeState({}); 
                          setExerciseFailureState({}); 
                          setExerciseWarmupState({});
                          setExerciseSetsState({});
                          setCurrentExerciseIndex(0);
                        }}`
);

// Fix onChange 2 (slide view)
code = code.replace(
  /onChange=\{e => \{ \s*const newDay = e\.target\.value;\s*setSelectedDay\(newDay\);\s*setEditorDay\(newDay\);\s*handleEditorLoadWeekDay\(selectedWeek, newDay\);\s*setSessionRpeState\(\{\}\); \s*setExerciseFailureState\(\{\}\);\s*setExerciseWarmupState\(\{\}\);\s*setExerciseSetsState\(\{\}\);\s*setCurrentExerciseIndex\(0\); \s*\}\}/g,
  `onChange={e => { 
                              const newDay = e.target.value;
                              setSelectedDay(newDay);
                              setSessionRpeState({}); 
                              setExerciseFailureState({});
                              setExerciseWarmupState({});
                              setExerciseSetsState({});
                              setCurrentExerciseIndex(0); 
                            }}`
);

fs.writeFileSync('src/App.tsx', code);
