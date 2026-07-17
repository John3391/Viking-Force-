const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /setExerciseSetsState\(\{\}\);/g,
  "setExerciseSetsState({});\n    setExerciseWarmupState({});"
);

fs.writeFileSync('src/App.tsx', code);
