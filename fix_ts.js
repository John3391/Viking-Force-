import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const expiringStudents = Object\.values\(studentsData\)\.filter\(\(student: any\) => \{/g,
  'const expiringStudents = (Object.values(studentsData) as StudentProfile[]).filter(student => {'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
