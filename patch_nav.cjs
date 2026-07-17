const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0908]/80 border-b border-viking-gold/60 shadow-xl relative overflow-hidden animate-fade-in"`;
const replacement = `className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0908]/80 border border-viking-gold/30 shadow-[0_4px_25px_rgba(212,175,55,0.15)] relative overflow-hidden animate-fade-in"`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
