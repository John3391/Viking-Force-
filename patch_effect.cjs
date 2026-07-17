const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const \[selectedDay, setSelectedDay\] = useState<string>\(\(\) => localStorage\.getItem\('viking_last_day'\) \|\| 'A'\);/,
  "const [selectedDay, setSelectedDay] = useState<string>(() => localStorage.getItem('viking_last_day') || 'A');\n  useEffect(() => { localStorage.setItem('viking_last_day', selectedDay); }, [selectedDay]);"
);

fs.writeFileSync('src/App.tsx', code);
