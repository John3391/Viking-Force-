const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

code = code.replace(/\\\\s\*/g, '\\s*');
code = code.replace(/\\\\d\+/g, '\\d+');

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
