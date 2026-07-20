const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = "{/* 1. History Drawer */}";
const endStr = "{/* Calendar Drawer */}";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* 1. History Drawer */}
                {drawerType === 'history' && activeStudentProfile && (
                  <WorkoutHistory 
                    activeStudentProfile={activeStudentProfile}
                    studentsData={studentsData}
                    handleDownloadPDF={handleDownloadPDF}
                    handleDownloadMonthlySummaryPDF={handleDownloadMonthlySummaryPDF}
                    drawerContentRef={drawerContentRef}
                  />
                )}

                `;
  const newCode = code.slice(0, startIdx) + replacement + code.slice(endIdx);
  fs.writeFileSync('src/App.tsx', newCode);
  console.log('Patched App.tsx successfully');
} else {
  console.log('Failed to find markers');
}
