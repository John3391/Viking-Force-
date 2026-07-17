const fs = require('fs');
let code = fs.readFileSync('src/components/VolumeChart.tsx', 'utf-8');

const helper = `
  // Generate data from custom program if available
  const generateProgramData = () => {
    if (!profile.customProgram || !profile.customProgram.weeks) return [];
    let data = [];
    const prs = profile.prs;
    const weeks = Object.keys(profile.customProgram.weeks).map(Number).sort((a,b)=>a-b);
    
    for (const w of weeks) {
       const week = profile.customProgram.weeks[w];
       for (const day of ['A', 'B', 'C', 'D', 'E', 'F']) {
         if (week[day] && week[day].length > 0) {
           let vol = 0;
           week[day].forEach(ex => {
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
           
           data.push({
             name: \`S\${w}T\${day}\`,
             volume: vol,
             rpe: 7.5,
             date: 'Prescrito'
           });
         }
       }
    }
    return data.length > 0 ? data : null;
  };
`;

code = code.replace(
  "  if (rawSessions.length === 0) {",
  helper + "\n  if (rawSessions.length === 0) {"
);

code = code.replace(
  "chartData = seedSessions;",
  "const programData = generateProgramData();\n    chartData = programData || seedSessions;"
);

fs.writeFileSync('src/components/VolumeChart.tsx', code);
