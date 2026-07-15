const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `                             const accessBlocked = (document.getElementById('editStudentAccess') as HTMLSelectElement).value === 'blocked';

                             const eventId = (document.getElementById('editStudentTargetEvent') as HTMLSelectElement).value;`;

const replacement1 = `                             const accessBlocked = (document.getElementById('editStudentAccess') as HTMLSelectElement).value === 'blocked';
                             const autoMonthlySummary = (document.getElementById('editStudentAutoMonthlySummary') as HTMLInputElement).checked;

                             const eventId = (document.getElementById('editStudentTargetEvent') as HTMLSelectElement).value;`;

const target2 = `                               accessBlocked,
                               targetEventId: eventId,`;
const replacement2 = `                               accessBlocked,
                               autoMonthlySummary,
                               targetEventId: eventId,`;

if (content.includes(target1) && content.includes(target2)) {
    content = content.replace(target1, replacement1);
    content = content.replace(target2, replacement2);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Success");
} else {
    console.error("Targets not found!");
}
