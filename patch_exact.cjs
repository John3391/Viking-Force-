const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

const target = \`
  // Set up 8-week buckets
  const weeklyBuckets: Record<number, { volume: number | null; plannedVolume: number; sessions: LoggedSession[] }> = {};
  for (let w = 1; w <= 8; w++) {
    weeklyBuckets[w] = { volume: 0, plannedVolume: 0, sessions: [] };
  }
\`;

const replacement = \`
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
        const match = sess.sessionName.match(/(?:semana|sem|s)\\\\s*(\\\\d+)/i);
        if (match) {
          weekNum = parseInt(match[1]);
        }
        if (weekNum > numWeeks) numWeeks = weekNum;
     });
  }
  
  if (numWeeks < 4) numWeeks = 4;

  const weeklyBuckets: Record<number, { volume: number | null; plannedVolume: number; sessions: LoggedSession[] }> = {};
  for (let w = 1; w <= numWeeks; w++) {
    weeklyBuckets[w] = { volume: 0, plannedVolume: 0, sessions: [] };
  }
\`;

// Since it might have slightly different spacing, we can also use indexOf
let i = code.indexOf('// Set up 8-week buckets');
let j = code.indexOf('// Group real sessions into the 8 weeks');
if (i !== -1 && j !== -1) {
  code = code.substring(0, i) + replacement + code.substring(j);
}

// We also need to fix this one loop later:
code = code.replace(/for \\(let w = 1; w <= 8; w\\+\\) \\{/g, 'for (let w = 1; w <= numWeeks; w++) {');

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
