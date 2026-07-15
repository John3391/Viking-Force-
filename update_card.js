import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                          <div className="flex flex-col gap-1 pr-6">
                            <h4 className="text-base font-bold text-[#e0d3a8]">{s.name}</h4>
                            <p className="text-[10px] text-viking-silver truncate">{email}</p>
                          </div>`;

const replacement = `                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1 pr-6">
                              <h4 className="text-base font-bold text-[#e0d3a8]">{s.name}</h4>
                              <p className="text-[10px] text-viking-silver truncate">{email}</p>
                            </div>
                            {!isBatchMode && s.phone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(\`https://wa.me/\${s.phone.replace(/\\D/g, '')}\`, '_blank');
                                }}
                                className="p-2 rounded-xl bg-[#0d0908] hover:bg-emerald-500/10 border border-viking-gold/10 hover:border-emerald-500/30 text-emerald-500 transition-all cursor-pointer shadow-sm z-10"
                                title="Conversar no WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>`;

if (!content.includes(target)) {
    console.error("Target not found!");
    process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
