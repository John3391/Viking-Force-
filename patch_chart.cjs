const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

const replacement = `
    const programPlannedVol = calculatePlannedVolumeForWeek(w);
    let finalVolume = bucket.volume;
    
    // Default planned volume logic if no program exists:
    // If we have actual volume, use it to anchor the planned volume.
    // Otherwise, try to guess based on week 1, or use defaultWeeklyBase.
    let fallbackPlanned = bucket.plannedVolume;
    if (fallbackPlanned === 0) {
       // Try to use a baseline if they haven't logged this week
       const base = defaultWeeklyBase;
       let plannedMult = 1.0;
       if (w === 1) plannedMult = 0.92;
       else if (w === 2) plannedMult = 0.95;
       else if (w === 3) plannedMult = 1.00;
       else if (w === 4) plannedMult = 0.80; // Deload
       else if (w === 5) plannedMult = 1.02;
       else if (w === 6) plannedMult = 1.08;
       else if (w === 7) plannedMult = 1.15;
       else if (w === 8) plannedMult = 0.85; // Taper
       fallbackPlanned = Math.round(base * plannedMult);
    }
    
    let finalPlannedVolume = programPlannedVol !== null && programPlannedVol > 0 ? programPlannedVol : fallbackPlanned;
    let finalAvgRpe = avgRpeVal;

    const hasAnyProgram = !!profile.customProgram?.weeks && Object.keys(profile.customProgram.weeks).length > 0;
    
    // Only mock real volume if they have NO sessions AT ALL and NO program
    const isMocked = rawSessions.length === 0 && !hasAnyProgram;

    if (isMocked) {
`;

code = code.replace(/    const programPlannedVol = calculatePlannedVolumeForWeek\(w\);[\s\S]*?if \(isMocked\) \{/m, replacement);

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
