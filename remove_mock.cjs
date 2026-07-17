const fs = require('fs');
let code = fs.readFileSync('src/components/VolumeChart.tsx', 'utf-8');

const regex = /if \(loggedData\.length === 1\) \{[\s\S]*?\} else \{[\s\S]*?chartData = loggedData;\n    \}/m;

code = code.replace(regex, 'chartData = loggedData;');

fs.writeFileSync('src/components/VolumeChart.tsx', code);
