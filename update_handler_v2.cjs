const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const accessBlocked = (document.getElementById('editStudentAccess') as HTMLSelectElement).value === 'blocked';")) {
        lines.splice(i + 1, 0, '                             const autoMonthlySummary = (document.getElementById("editStudentAutoMonthlySummary") as HTMLInputElement).checked;');
        i++;
    }
    if (lines[i].includes('accessBlocked,')) {
        lines.splice(i + 1, 0, '                               autoMonthlySummary,');
        i++;
    }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'), 'utf8');
console.log("Success");
