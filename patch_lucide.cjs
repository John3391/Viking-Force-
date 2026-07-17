const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/} from 'lucide-react';/, "  Folder\n} from 'lucide-react';");

fs.writeFileSync('src/App.tsx', code);
