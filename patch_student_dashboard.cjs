const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update the state type
code = code.replace(
  "const [studentSubTab, setStudentSubTab] = useState<'overview' | 'wilks' | 'cardio' | 'calculator'>('overview');",
  "const [studentSubTab, setStudentSubTab] = useState<'overview' | 'dashboard' | 'wilks' | 'cardio' | 'calculator'>('overview');"
);

// 2. Add the Dashboard button to the sub-tab navigation
const navButtonsRegex = /(<button\s+onClick=\{\(\) => setStudentSubTab\('overview'\)\}[\s\S]*?<\/button>)/;
const dashboardButton = `
              <button 
                onClick={() => setStudentSubTab('dashboard')}
                className={\`flex-1 sm:flex-initial py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl text-[10px] sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 \${
                  studentSubTab === 'dashboard' 
                    ? 'text-viking-dark bg-gradient-to-r from-viking-gold-dark to-viking-gold shadow-md shadow-viking-gold/15' 
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/5'
                }\`}
              >
                📊 Dashboard
              </button>`;
code = code.replace(navButtonsRegex, "$1" + dashboardButton);

// 3. Move the charts from 'overview' tab to 'dashboard' tab.
// Find where the charts are inside the overview tab.
const chartsStartStr = "{/* Consolidated Evolution Charts Widget */}";
const chartsEndStr = "{/* RIGHT COLUMN: Sidebar Statistics & Quick Actions (4 cols on desktop) */}";

const chartsStartIdx = code.indexOf(chartsStartStr);
const chartsEndIdx = code.indexOf(chartsEndStr);

if (chartsStartIdx !== -1 && chartsEndIdx !== -1) {
  const chartsSection = code.slice(chartsStartIdx, chartsEndIdx);
  
  // Remove charts from overview
  code = code.slice(0, chartsStartIdx) + code.slice(chartsEndIdx);
  
  // Add dashboard section
  const dashboardSection = `
            {studentSubTab === 'dashboard' && activeStudentProfile && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Dashboard Header */}
                <div className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-viking-gold/5 pointer-events-none">
                    <TrendingUp className="w-32 h-32" />
                  </div>
                  <div>
                    <h2 className="font-viking-display text-2xl font-black text-[#e0d3a8] tracking-wider uppercase">Dashboard de Evolução</h2>
                    <p className="text-viking-silver/80 text-sm mt-1">
                      Acompanhe seu progresso de volume, cargas estimadas e records pessoais de SBD (Squat, Bench, Deadlift).
                    </p>
                  </div>
                </div>

                ${chartsSection.trim()}
              </div>
            )}
`;
  
  // We need to inject this after the overview block or cardio block.
  // Let's find `{studentSubTab === 'overview' && (`
  const overviewStartIdx = code.indexOf("{studentSubTab === 'overview' && (");
  if (overviewStartIdx !== -1) {
    code = code.slice(0, overviewStartIdx) + dashboardSection + code.slice(overviewStartIdx);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Patched App.tsx successfully');
  } else {
    console.log('Failed to find overview start');
  }
} else {
  console.log('Failed to find charts boundaries');
}
