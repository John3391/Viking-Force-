const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const handleEditorLoadWeekDay = \(week: number, day: string\) => \{/,
  `const handleEditorLoadWeekDay = (week: number, day: string) => {
    setSelectedWeek(week);
    setSelectedDay(day);
    setCurrentExerciseIndex(0);`
);

fs.writeFileSync('src/App.tsx', code);
