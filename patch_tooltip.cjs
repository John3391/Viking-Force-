const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

code = code.replace(
  /\{data\.volume\.toLocaleString\('pt-BR'\)\}/g,
  '{(data.volume || 0).toLocaleString(\'pt-BR\')}'
);

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
