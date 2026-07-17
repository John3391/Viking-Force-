const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /onClick=\{\(\) => startTransition\(\(\) => setSessionRpeState\(prev => \(\{ \.\.\.prev, \[ex\.id\]: val \}\)\)\)\)\}/g,
  `onClick={() => startTransition(() => setSessionRpeState(prev => ({ ...prev, [ex.id]: val })))}`
);

// We need to fix the failure state one too
code = code.replace(
  /onClick=\{\(\) => startTransition\(\(\) => setExerciseFailureState\(prev => \(\{([\s\S]*?)\}\)\)\}/g,
  `onClick={() => startTransition(() => setExerciseFailureState(prev => ({\n$1\n})))}` // Wait, this might be tricky, let's just make sure the parentheses match.
);

fs.writeFileSync('src/App.tsx', code);
