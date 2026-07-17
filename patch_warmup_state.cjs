const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const \[exerciseSetsState, setExerciseSetsState\] = useState<Record<string, \{ reps: number; weight: number; done\?: boolean \}\[\]>>\(\{\}\);/,
  "const [exerciseSetsState, setExerciseSetsState] = useState<Record<string, { reps: number; weight: number; done?: boolean }[]>>({});\n  const [exerciseWarmupState, setExerciseWarmupState] = useState<Record<string, boolean[]>>({});"
);

fs.writeFileSync('src/App.tsx', code);
