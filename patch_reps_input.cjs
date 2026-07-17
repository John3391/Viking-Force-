const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<DebouncedInput\s*type="number"\s*value=\{set\.reps === 0 \? '' : set\.reps\}/g,
  `<DebouncedInput
                                      type="number"
                                      inputMode="numeric"
                                      value={set.reps === 0 ? '' : set.reps}`
);

fs.writeFileSync('src/App.tsx', code);
