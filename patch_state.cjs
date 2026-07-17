const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const [navSearchQuery, setNavSearchQuery] = useState<string>('');",
  "const [navSearchQuery, setNavSearchQuery] = useState<string>('');\n  const [navSearchInput, setNavSearchInput] = useState<string>('');"
);

fs.writeFileSync('src/App.tsx', code);
