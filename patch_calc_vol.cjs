const fs = require('fs');
let code = fs.readFileSync('src/components/VolumeChart.tsx', 'utf-8');

const regexCalc = /const calculateSessionVolume = \(sess: LoggedSession\) => \{[\s\S]*?return totalSessionVolume === 0 \? 3200 : totalSessionVolume;\s*\};/m;

const newCalc = `const calculateSessionVolume = (sess: LoggedSession) => {
    let totalSessionVolume = 0;
    const prs = profile.prs;
    
    sess.exercises.forEach((ex: any) => {
      let exerciseVolume = 0;
      
      if (ex.sets && Array.isArray(ex.sets) && ex.sets.length > 0) {
        ex.sets.forEach((set: any) => {
           if (set.done !== false) {
             const weight = set.weight || 0;
             exerciseVolume += (set.reps * weight);
           }
        });
      }
      
      if (exerciseVolume === 0) {
        // Fallback to prescribed weight or RPE estimation
        let estimatedWeight = ex.baseWeight || 0;
        let intensity = 1;
        
        if (typeof ex.intensity === 'number') intensity = ex.intensity;
        else if (typeof ex.intensity === 'string') {
          const pct = parseFloat(ex.intensity);
          if (!isNaN(pct)) intensity = pct > 1 ? pct / 100 : pct;
        }
        
        if (!estimatedWeight) {
            const rpe = ex.rpe || 7;
            const lowerName = ex.name.toLowerCase();
            
            if (lowerName.includes('agachamento') || lowerName.includes('squat')) {
              estimatedWeight = prs.squat || 140;
            } else if (lowerName.includes('terra') || lowerName.includes('deadlift')) {
              estimatedWeight = prs.deadlift || 180;
            } else if (lowerName.includes('supino') || lowerName.includes('bench')) {
              estimatedWeight = prs.bench || 100;
            } else {
              estimatedWeight = (prs.bench || 100) * 0.4;
            }
            intensity = rpe / 10;
        }
        
        let sets = ex.sets;
        // If ex.sets is an array, we get its length as a fallback for sets count if it was passed weirdly
        if (Array.isArray(ex.sets)) sets = ex.sets.length || 3;
        else if (typeof sets !== 'number') sets = 3;
        
        let reps = ex.reps || 8;
        
        exerciseVolume = Math.round(sets * reps * (estimatedWeight * intensity));
      }
      totalSessionVolume += exerciseVolume;
    });
    return totalSessionVolume === 0 ? 3200 : totalSessionVolume;
  };`;

code = code.replace(regexCalc, newCalc);

fs.writeFileSync('src/components/VolumeChart.tsx', code);
