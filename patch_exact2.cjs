const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

let replacement = "  // Find max weeks in custom program or logged sessions\\n";
replacement += "  let numWeeks = 8;\\n";
replacement += "  if (profile.customProgram?.weeks) {\\n";
replacement += "    const keys = Object.keys(profile.customProgram.weeks).map(Number);\\n";
replacement += "    if (keys.length > 0) {\\n";
replacement += "      numWeeks = Math.max(...keys);\\n";
replacement += "    }\\n";
replacement += "  }\\n";
replacement += "  \\n";
replacement += "  if (rawSessions.length > 0) {\\n";
replacement += "     rawSessions.forEach(sess => {\\n";
replacement += "        let weekNum = 0;\\n";
replacement += "        const match = sess.sessionName.match(/(?:semana|sem|s)\\\\s*(\\\\d+)/i);\\n";
replacement += "        if (match) {\\n";
replacement += "          weekNum = parseInt(match[1]);\\n";
replacement += "        }\\n";
replacement += "        if (weekNum > numWeeks) numWeeks = weekNum;\\n";
replacement += "     });\\n";
replacement += "  }\\n";
replacement += "  \\n";
replacement += "  if (numWeeks < 4) numWeeks = 4;\\n";
replacement += "  \\n";
replacement += "  const weeklyBuckets: Record<number, { volume: number | null; plannedVolume: number; sessions: LoggedSession[] }> = {};\\n";
replacement += "  for (let w = 1; w <= numWeeks; w++) {\\n";
replacement += "    weeklyBuckets[w] = { volume: 0, plannedVolume: 0, sessions: [] };\\n";
replacement += "  }\\n";

let i = code.indexOf('// Set up 8-week buckets');
let j = code.indexOf('// Group real sessions into the 8 weeks');
if (i !== -1 && j !== -1) {
  code = code.substring(0, i) + replacement + code.substring(j);
}

code = code.replace(/for \\(let w = 1; w <= 8; w\\+\\) \\{/g, 'for (let w = 1; w <= numWeeks; w++) {');

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
