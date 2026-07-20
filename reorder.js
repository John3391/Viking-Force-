const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const getBlock = (startMarker, endMarker) => {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) throw new Error(`Marker not found: ${startMarker} or ${endMarker}`);
  return content.substring(startIdx, endIdx);
};

// Markers
const marker1 = "{/* Resumo Financeiro Section */}";
const marker2 = "{/* Coach Stats Grid */}";
const marker3 = "{/* --- PRÓXIMAS COMPETIÇÕES & TESTES --- */}";
const marker4 = "{/* --- PAINEL DE RECORDES PESSOAIS (PR) --- */}";
const marker5 = "{/* --- RECENT WORKOUTS (LIVE LIST) --- */}";
const marker6 = "{/* Wilks Efficiency Scatter Chart */}";
const marker7 = "{/* Payment Highlight Card */}";
const marker8 = "{/* Failure Sentinel & Periodization Optimizer */}";

const block1 = getBlock(marker1, marker2); // Resumo Financeiro
const block2 = getBlock(marker2, marker3); // Coach Stats
const block3 = getBlock(marker3, marker4); // Competicoes
const block4 = getBlock(marker4, marker5); // PRs
const block5 = getBlock(marker5, marker6); // Recent Workouts
const block6 = getBlock(marker6, marker7); // Wilks
const block7 = getBlock(marker7, marker8); // Payment Highlight

const originalBlock = block1 + block2 + block3 + block4 + block5 + block6 + block7;

// Edit classes in the blocks
let modifiedBlock3 = block3.replace('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', 'space-y-3');
modifiedBlock3 = modifiedBlock3.replace('mb-6', 'mb-0'); // remove bottom margin

let modifiedBlock4 = block4.replace('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', 'space-y-3');

let modifiedBlock5 = block5.replace('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10', 'space-y-3 relative z-10');

// Fix Coach stats grid
let modifiedBlock2 = block2.replace('grid grid-cols-2 lg:grid-cols-4 gap-4', 'grid grid-cols-2 sm:grid-cols-4 gap-4');

// Wrap everything
const newLayout = `
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column (Primary Ops & Finances) */}
              <div className="xl:col-span-8 space-y-6 flex flex-col">
${block1}${modifiedBlock2}${block7}${block6}              </div>

              {/* Right Column (Live Activity & Alerts) */}
              <div className="xl:col-span-4 space-y-6 flex flex-col">
${modifiedBlock5}${modifiedBlock4}${modifiedBlock3}              </div>
            </div>
`;

const newContent = content.replace(originalBlock, newLayout);
fs.writeFileSync('src/App.tsx', newContent);
console.log("Done");
