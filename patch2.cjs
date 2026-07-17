const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

const regex = /let finalVolume = bucket\.volume;[\s\S]*?if \(isMocked\) \{/m;

const replacement = `const programPlannedVol = calculatePlannedVolumeForWeek(w);
    let finalVolume = bucket.volume;
    let finalPlannedVolume = programPlannedVol !== null ? programPlannedVol : bucket.plannedVolume;
    let finalAvgRpe = avgRpeVal;

    const hasAnyProgram = !!profile.customProgram?.weeks && Object.keys(profile.customProgram.weeks).length > 0;
    const isMocked = bucket.volume === 0 && !hasAnyProgram && totalSessionsLogged === 0;

    if (isMocked) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
