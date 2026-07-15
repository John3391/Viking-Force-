import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                    <button 
                      onClick={() => handleDownloadPDF(activeStudentProfile)}
                      className="w-full py-3 px-4 rounded-xl bg-viking-gold/15 hover:bg-viking-gold/25 border border-viking-gold/40 hover:border-viking-gold text-viking-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <FileDown className="w-4.5 h-4.5" /> Exportar Relatório em PDF
                    </button>`;

const replacement = `                    <button 
                      onClick={() => handleDownloadPDF(activeStudentProfile)}
                      className="w-full py-3 px-4 rounded-xl bg-viking-gold/15 hover:bg-viking-gold/25 border border-viking-gold/40 hover:border-viking-gold text-viking-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <FileDown className="w-4.5 h-4.5" /> Exportar Relatório em PDF
                    </button>
                    
                    <button 
                      onClick={() => handleDownloadMonthlySummaryPDF(activeStudentProfile)}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Calendar className="w-4.5 h-4.5" /> Resumo Mensal Consolidado (PDF)
                    </button>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Button added!");
} else {
    console.error("Target button not found!");
}
