const fs = require('fs');
let code = fs.readFileSync('src/components/ProtocolsDrawer.tsx', 'utf-8');

code = code.replace(/\{Object\.entries\(studentsData\) as \[string, StudentProfile\]\[\]\.map\(/g, "{Object.entries(studentsData).map(");

// Let's rewrite those lines explicitly.
code = code.replace(/\{Object\.entries\(studentsData\) as \[string, StudentProfile\]\[\]\.map\(\(\[email, student\]\) => \(/g, 
  "{(Object.entries(studentsData) as any[]).map(([email, student]: [string, any]) => (");

// Also restore if it was corrupted.
// I will just fetch from Git or redo the whole file since it's short.
