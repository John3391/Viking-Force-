const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /weight: Math\.round\(pr \* step\.percent \* 10\) \/ 10/g,
  'weight: Math.round(pr * step.percent)'
);

code = code.replace(
  /weight: Math\.round\(pr \* parsedIntensity \* 10\) \/ 10/g,
  'weight: Math.round(pr * parsedIntensity)'
);

fs.writeFileSync('src/App.tsx', code);
