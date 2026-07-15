import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<button 
                  onClick={() => { setDrawerType('whatsapp'); setDrawerTitle('Cobranças via WhatsApp'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 shrink-0 text-viking-gold" /> Cobrar Inadimplentes (WhatsApp)
                </button>`;

const replacement = `<button 
                  onClick={() => { setDrawerType('whatsapp'); setDrawerTitle('Painel de Cobranças'); setDrawerOpen(true); }}
                  className="p-4 rounded-2xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" /> Painel de Atrasados
                </button>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Success sidebar");
} else {
    console.error("Sidebar target not found!");
}
