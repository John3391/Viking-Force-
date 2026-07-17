const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const \[selectedDay, setSelectedDay\] = useState<string>\('A'\);/,
  "const [selectedDay, setSelectedDay] = useState<string>(() => localStorage.getItem('viking_last_day') || 'A');"
);

// We need to add a useEffect to save it. We can find another useEffect and place it there, or just replace setSelectedDay where it's updated, or use a useEffect hook.
fs.writeFileSync('src/App.tsx', code);
