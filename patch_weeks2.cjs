const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

// 1. Find numWeeks
const replacement1 = `
  // Find max weeks in custom program or logged sessions
  let numWeeks = 8;
  if (profile.customProgram?.weeks) {
    const keys = Object.keys(profile.customProgram.weeks).map(Number);
    if (keys.length > 0) {
      numWeeks = Math.max(...keys);
    }
  }
  
  if (rawSessions.length > 0) {
     rawSessions.forEach(sess => {
        let weekNum = 0;
        const match = sess.sessionName.match(/(?:semana|sem|s)\\s*(\\d+)/i);
        if (match) {
          weekNum = parseInt(match[1]);
        }
        if (weekNum > numWeeks) numWeeks = weekNum;
     });
  }
  
  if (numWeeks < 4) numWeeks = 4; // minimum 4 weeks for a good chart

  // Set up weekly buckets
  const weeklyBuckets: Record<number, { volume: number | null; plannedVolume: number; sessions: LoggedSession[] }> = {};
  for (let w = 1; w <= numWeeks; w++) {
    weeklyBuckets[w] = { volume: 0, plannedVolume: 0, sessions: [] };
  }
`;

code = code.replace(/\/\/ Set up 8-week buckets[\s\S]*?for \(let w = 1; w <= 8; w\+\) \{\s*weeklyBuckets\[w\] = \{ volume: 0, plannedVolume: 0, sessions: \[\] \};\s*\}/m, replacement1);

code = code.replace(/\/\/ Clip\/Clamp to weeks 1 to 8/g, '// Clip/Clamp to weeks 1 to numWeeks');
code = code.replace(/if \(weekNum >= 1 && weekNum <= 8\) \{/g, 'if (weekNum >= 1 && weekNum <= numWeeks) {');
code = code.replace(/for \(let w = 1; w <= 8; w\+\) \{/g, 'for (let w = 1; w <= numWeeks; w++) {');

// We also need to fix avgWeeklyVolume
code = code.replace(/const avgWeeklyVolume = totalVolumeSum \/ 8;/g, 'const avgWeeklyVolume = totalVolumeSum / numWeeks;');

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
