const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

const regex = /const plannedVol = sess\.totalPlannedVolume \|\| Math\.round\(vol \* 0\.95\);/;
code = code.replace(regex, 'const plannedVol = Math.round(vol * 1.05); // using a default +5% if no program data');

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
