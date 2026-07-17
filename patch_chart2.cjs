const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

// Change WeeklyVolumeData
code = code.replace(/volume: number;/g, 'volume: number | null;');

// Change chartData.push
code = code.replace(/volume: finalVolume,/g, 'volume: finalVolume > 0 ? finalVolume : null,');

// Fix max volume logic
code = code.replace(
  /const maxVolumeWeek = \[\.\.\.chartData\]\.sort\(\(a, b\) => b\.volume - a\.volume\)\[0\];/g,
  'const maxVolumeWeek = [...chartData].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0];'
);

// Fix total volume logic
code = code.replace(
  /const totalVolumeSum = chartData\.reduce\(\(sum, item\) => sum \+ item\.volume, 0\);/g,
  'const totalVolumeSum = chartData.reduce((sum, item) => sum + (item.volume || 0), 0);'
);

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
