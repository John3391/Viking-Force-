const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyVolumeLineChart.tsx', 'utf-8');

// Insert calculatePlannedVolumeForWeek
const helperCode = `
  const calculatePlannedVolumeForWeek = (weekNum: number) => {
    if (!profile.customProgram?.weeks?.[weekNum]) return null;
    const week = profile.customProgram.weeks[weekNum];
    let vol = 0;
    const prs = profile.prs;
    Object.values(week).forEach(exercises => {
      exercises.forEach(ex => {
        let weight = ex.baseWeight;
        if (!weight) {
          const lowerName = ex.name.toLowerCase();
          if (lowerName.includes('agachamento') || lowerName.includes('squat')) weight = prs.squat || 140;
          else if (lowerName.includes('terra') || lowerName.includes('deadlift')) weight = prs.deadlift || 180;
          else if (lowerName.includes('supino') || lowerName.includes('bench')) weight = prs.bench || 100;
          else weight = (prs.bench || 100) * 0.4;
        }
        
        let intensity = 1;
        if (typeof ex.intensity === 'number') intensity = ex.intensity;
        else if (typeof ex.intensity === 'string') {
          const pct = parseFloat(ex.intensity);
          if (!isNaN(pct)) intensity = pct > 1 ? pct / 100 : pct;
        }
        
        vol += Math.round((ex.sets || 0) * (ex.reps || 0) * (weight * intensity));
      });
    });
    return vol;
  };
`;

code = code.replace(
  "// Calculate base reference PR Sum to generate realistic mock data if needed",
  helperCode + "\n  // Calculate base reference PR Sum to generate realistic mock data if needed"
);

// Replace loop logic
const oldLogic = `    let finalVolume = bucket.volume;
    let finalPlannedVolume = bucket.plannedVolume;
    let finalAvgRpe = avgRpeVal;

    const isMocked = bucket.volume === 0;

    if (isMocked) {
      // Create a nice waves-like block periodization progression`;

const newLogic = `    const programPlannedVol = calculatePlannedVolumeForWeek(w);
    let finalVolume = bucket.volume;
    let finalPlannedVolume = programPlannedVol !== null ? programPlannedVol : bucket.plannedVolume;
    let finalAvgRpe = avgRpeVal;

    const hasAnyProgram = !!profile.customProgram?.weeks && Object.keys(profile.customProgram.weeks).length > 0;
    const isMocked = bucket.volume === 0 && !hasAnyProgram && rawSessions.length === 0;

    if (isMocked) {
      // Create a nice waves-like block periodization progression`;

code = code.replace(oldLogic, newLogic);

fs.writeFileSync('src/components/WeeklyVolumeLineChart.tsx', code);
