const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace session note textarea
code = code.replace(
  /<textarea\s+id="sessionNote"\s+rows=\{3\}\s+value=\{sessionNote\}\s+onChange=\{e => setSessionNote\(e\.target\.value\)\}/g,
  '<DebouncedTextarea\n                    id="sessionNote"\n                    rows={3}\n                    value={sessionNote}\n                    onChange={(val: string) => setSessionNote(val)}'
);

// We need to replace the reps input in the workout log
code = code.replace(
  /<input\s*type="number"\s*value=\{set\.reps === 0 \? '' : set\.reps\}\s*onChange=\{e => \{/g,
  '<DebouncedInput\n                                      type="number"\n                                      value={set.reps === 0 ? \'\' : set.reps}\n                                      onChange={(val: string) => {'
);
// In the replacement above, we still have `e` in the body of `onChange`?
// No, the original body is:
// onChange={e => {
//   setExerciseSetsState(prev => {
//     const sets = [...(prev[ex.id] || [])];
//     if (sets[setIdx]) {
//       sets[setIdx] = { ...sets[setIdx], reps: e.target.value === '' ? 0 : parseInt(e.target.value, 10) };
//     }
//     return { ...prev, [ex.id]: sets };
//   });
// }}

// It's better to just write a script that does literal string replacements.
