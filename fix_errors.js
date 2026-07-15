import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// fix Users import
if (!content.includes('Users,') && !content.includes(', Users')) {
  content = content.replace(/import \{(.*?)\} from 'lucide-react';/, "import {$1, Users} from 'lucide-react';");
}

// fix Object.values cast
content = content.replace(/Object\.values\(studentsData\)\.forEach\(student => \{/g, 'Object.values(studentsData).forEach((student: any) => {');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed');
