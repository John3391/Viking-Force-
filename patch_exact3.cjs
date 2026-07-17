const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

code = code.replace(/\\n/g, '\n');

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
