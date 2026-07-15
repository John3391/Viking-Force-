const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
let newLines = [];
let addedAutoMonthlySummaryVar = false;
let addedAutoMonthlySummaryProp = false;

for (let line of lines) {
    if (line.includes('const autoMonthlySummary =')) {
        if (!addedAutoMonthlySummaryVar) {
            newLines.push(line);
            addedAutoMonthlySummaryVar = true;
        }
    } else if (line.trim() === 'autoMonthlySummary,') {
        if (!addedAutoMonthlySummaryProp) {
            newLines.push(line);
            addedAutoMonthlySummaryProp = true;
        }
    } else {
        newLines.push(line);
    }
}
fs.writeFileSync('src/App.tsx', newLines.join('\n'), 'utf8');
console.log("Success");
