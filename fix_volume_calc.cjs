const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Remove the check for totalAchievedVolume from WeeklyVolumeLineChart
  const regex = /\/\/ If the session already has totalAchievedVolume stored, use it\s+if \(sess\.totalAchievedVolume && sess\.totalAchievedVolume > 0\) \{\s+return sess\.totalAchievedVolume;\s+\}/m;
  code = code.replace(regex, '');
  
  fs.writeFileSync(file, code);
}

fixFile('src/components/WeeklyVolumeLineChart.tsx');
// VolumeChart.tsx doesn't have this check because I replaced calculateSessionVolume earlier.
