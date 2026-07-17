const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

code = code.replace(
  /<Line\s+name="Volume Real Realizado \(kg\)"\s+type="monotone"\s+dataKey="volume"/m,
  '<Line \n                connectNulls={true}\n                name="Volume Real Realizado (kg)"\n                type="monotone" \n                dataKey="volume"'
);

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
