const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Ensure useTransition is imported
if (!code.includes('useTransition')) {
  code = code.replace(/import React, \{ useState, useEffect, useRef, useMemo, useCallback \} from 'react';/, "import React, { useState, useEffect, useRef, useMemo, useCallback, useTransition } from 'react';");
}

code = code.replace(/const \[activeTab, setActiveTab\] = useState<string>\('home'\);/, "const [isPending, startTransition] = useTransition();\n  const [activeTab, setActiveTab] = useState<string>('home');");

// Wrap warmup toggle in transition
code = code.replace(
  /onClick=\{\(\) => \{\s*setExerciseWarmupState\(prev => \{/g,
  `onClick={() => {\n                                              startTransition(() => {\n                                              setExerciseWarmupState(prev => {`
);
code = code.replace(
  /return \{ \.\.\.prev, \[ex\.id\]: newExWarmup \};\s*\}\);\s*\}\}/g,
  `return { ...prev, [ex.id]: newExWarmup };\n                                              });\n                                              });\n                                            }}`
);

// Wrap RPE button in transition
code = code.replace(
  /onClick=\{\(\) => setSessionRpeState\(prev => \(\{ \.\.\.prev, \[ex\.id\]: val \}\)\)\}/g,
  `onClick={() => startTransition(() => setSessionRpeState(prev => ({ ...prev, [ex.id]: val }))))}`
);

// Wrap exerciseFailureState in transition
code = code.replace(
  /onClick=\{\(\) => setExerciseFailureState/g,
  `onClick={() => startTransition(() => setExerciseFailureState`
);

// We need to fix the syntax for the replacements above.
// The RPE replacement has an extra closing paren: `val }))))}` -> `val })))}`
