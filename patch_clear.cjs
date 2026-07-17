const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/setNavSearchQuery\(''\);/g, "setNavSearchQuery(''); setNavSearchInput('');");
// To avoid duplicates if it was already replaced
code = code.replace(/setNavSearchQuery\(''\); setNavSearchInput\(''\); setNavSearchInput\(''\);/g, "setNavSearchQuery(''); setNavSearchInput('');");

fs.writeFileSync('src/App.tsx', code);
