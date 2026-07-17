const fs = require('fs');
let code = fs.readFileSync('src/components/ProtocolsDrawer.tsx', 'utf-8');

code = code.replace(/Object\.entries\(studentsData\)/g, "Object.entries(studentsData) as [string, StudentProfile][]");

fs.writeFileSync('src/components/ProtocolsDrawer.tsx', code);
