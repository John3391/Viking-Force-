const fs = require('fs');
let code = fs.readFileSync('src/components/VolumeChart.tsx', 'utf-8');

const regex = /const calculateSessionVolume = \(sess: LoggedSession\) => \{[\s\S]*?return totalSessionVolume === 0 \? 3200 : totalSessionVolume;\n  \};/m;

const replacement = `const calculateSessionVolume = (sess: LoggedSession) => {
    let totalSessionVolume = 0;
    const prs = profile.prs;
    
    sess.exercises.forEach(ex => {
      let exerciseVolume = 0;
      
      if (ex.sets && ex.sets.length > 0) {
        ex.sets.forEach(set => {
           if (set.done !== false) {
             const weight = set.weight || 0;
             exerciseVolume += (set.reps * weight);
           }
        });
      }
      
      if (exerciseVolume === 0) {
        const rpe = ex.rpe || 7;
        const lowerName = ex.name.toLowerCase();
        let estimatedWeight = 100; // in kg
        let sets = 4;
        let reps = 6;
        
        if (lowerName.includes('agachamento') || lowerName.includes('squat')) {
          estimatedWeight = prs.squat || 140;
          sets = 4;
          reps = 8;
        } else if (lowerName.includes('terra') || lowerName.includes('deadlift')) {
          estimatedWeight = prs.deadlift || 180;
          sets = 3;
          reps = 5;
        } else if (lowerName.includes('supino') || lowerName.includes('bench')) {
          estimatedWeight = prs.bench || 100;
          sets = 4;
          reps = 8;
        } else {
          estimatedWeight = (prs.bench || 100) * 0.4;
          sets = 3;
          reps = 10;
        }
        
        const intensityFactor = rpe / 10;
        exerciseVolume = Math.round(sets * reps * (estimatedWeight * intensityFactor));
      }
      totalSessionVolume += exerciseVolume;
    });
    return totalSessionVolume === 0 ? 3200 : totalSessionVolume;
  };`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/VolumeChart.tsx', code);
