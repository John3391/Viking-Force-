const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// We want to find the section around lines 11320-11410
// and delete the redundant weight selector and trash button.
// Specifically:
// 11325:                                           </button>
// 11326:                                         </div>
// 11327:                                       </div>
// 11328: 
// 11329:                                     {/* Weight selector */}
// ... down to:
// 11404:                                     </div>
// 11405:                                     <div className="w-full">

// Let's locate the duplicate block and replace it with just the closing div and spaces.
const targetText = `                                      </div>
                                    </div>

                                   {/* Weight selector */}
                                   <div className="flex items-center gap-1 bg-[#1d1613] border border-viking-gold/30 rounded-lg px-2 py-2 flex-1 min-w-[100px]">
                                     <span className="text-[10px] text-viking-gold/70 uppercase font-bold mr-1 hidden sm:inline">Peso:</span>
                                     <button
                                       type="button"
                                       disabled={set.done}
                                       onClick={() => {
                                         setExerciseSetsState(prev => {
                                           const sets = [...(prev[ex.id] || [])];
                                           if (sets[setIdx]) {
                                             sets[setIdx] = { ...sets[setIdx], weight: Math.max(0, (sets[setIdx].weight || 0) - 2.5) };
                                           }
                                           return { ...prev, [ex.id]: sets };
                                         });
                                       }}
                                       className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                     >
                                       -
                                     </button>
                                     <DebouncedInput
                                       type="number"
                                       inputMode="decimal"
                                       step="2.5"
                                       value={set.weight === 0 ? '' : set.weight}
                                       disabled={set.done}
                                       placeholder="0"
                                       onChange={(val: string) => {
                                         const parsed = val === '' ? 0 : (parseFloat(val) || 0);
                                         setExerciseSetsState(prev => {
                                           const sets = [...(prev[ex.id] || [])];
                                           if (sets[setIdx]) {
                                             sets[setIdx] = { ...sets[setIdx], weight: parsed };
                                           }
                                           return { ...prev, [ex.id]: sets };
                                         });
                                       }}
                                       className="w-full min-w-[40px] bg-transparent text-center font-mono text-base font-bold focus:outline-none text-white disabled:text-viking-gold/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                       title={ex.main ? "Carga sugerida pelo treinador. Você pode alterar se realizou uma carga diferente." : "Carga realizada (kg)"}
                                     />
                                     <button
                                       type="button"
                                       disabled={set.done}
                                       onClick={() => {
                                         setExerciseSetsState(prev => {
                                           const sets = [...(prev[ex.id] || [])];
                                           if (sets[setIdx]) {
                                             sets[setIdx] = { ...sets[setIdx], weight: (sets[setIdx].weight || 0) + 2.5 };
                                           }
                                           return { ...prev, [ex.id]: sets };
                                         });
                                       }}
                                       className="w-7 h-7 rounded bg-viking-gold/15 text-viking-gold flex items-center justify-center font-bold text-sm hover:bg-viking-gold/25 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                     >
                                       +
                                     </button>
                                     <span className="text-[10px] text-viking-gold/70 font-bold ml-1 hidden sm:inline">kg</span>
                                     {ex.main && <Flame className="w-3.5 h-3.5 text-viking-gold/60 shrink-0" title="Carga sugerida pelo treinador. Altere se precisar ajustar." />}
                                   </div>

                                   {/* Delete set */}
                                   <button
                                     type="button"
                                     disabled={set.done || (exerciseSetsState[ex.id]?.length || 0) <= 1}
                                     onClick={() => {
                                       setExerciseSetsState(prev => {
                                         const sets = [...(prev[ex.id] || [])];
                                         sets.splice(setIdx, 1);
                                         return { ...prev, [ex.id]: sets };
                                        });
                                      }}
                                      className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-35 shrink-0"
                                      title="Remover série"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                    </div>`;

const replacement = `                                      </div>
                                    </div>`;

const normalize = s => s.replace(/\s+/g, ' ').trim();

if (normalize(code).includes(normalize(targetText))) {
  console.log("Match found!");
  // Let's find index-based match to replace precisely
  const parts = code.split(/<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Weight selector \*\/}/);
  if (parts.length > 1) {
    console.log("Splitting works!");
  }
}

// Let's do a reliable replacement using lines match
const lines = code.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Delete set (Desktop only)') && lines[i+1]?.includes('<div className="hidden sm:block">')) {
    // Look for the end of the first container (approx 15 lines later)
    for (let j = i; j < i + 35; j++) {
      if (lines[j]?.includes('</div>') && lines[j+1]?.includes('</div>') && lines[j+2]?.includes('Weight selector') && lines[j+2]?.includes('{/*')) {
        startIdx = j + 2; // We start deleting from Weight selector comment
        break;
      }
    }
  }
  if (startIdx !== -1) {
    // Find where the duplicate ends (Remover série Trash2 followed by closing div)
    for (let k = startIdx; k < startIdx + 120; k++) {
      if (lines[k]?.includes('Trash2 className="w-4 h-4"') && lines[k+2]?.includes('Remover série') && lines[k+5]?.includes('</div>') && lines[k+6]?.includes('<div className="w-full">')) {
        endIdx = k + 6; // up to (but not including) the note div
        break;
      }
    }
    break;
  }
}

console.log('Detected indices:', startIdx, endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const deletedLines = lines.slice(startIdx, endIdx);
  console.log('Deleting lines:\n', deletedLines.join('\n'));
  lines.splice(startIdx, endIdx - startIdx);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log('SUCCESSFUL CLEANUP!');
} else {
  console.log('ERROR: Indice detection failed.');
}
