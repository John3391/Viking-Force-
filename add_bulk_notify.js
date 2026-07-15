import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  </div>

                  {overdueOrPending.length > 0 ? (`;

const replacement = `                  </div>
                  
                  {overdueOrPending.filter(s => s.status === 'Atrasado').length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 relative z-10 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Notificação em Massa</span>
                         <span className="text-viking-silver text-[10px]">Cobrar todos os guerreiros atrasados simultaneamente</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const atrasados = overdueOrPending.filter(s => s.status === 'Atrasado');
                            const bccList = atrasados.map(s => s.email).join(',');
                            const subject = encodeURIComponent("Lembrete Urgente: Renovação de Assinatura - Viking Force");
                            const body = encodeURIComponent("Saudações, guerreiro! Identificamos que sua mensalidade na Viking Force consta como ATRASADA. Por favor, regularize sua situação o quanto antes para continuar acessando seus treinos e quebrando recordes! 💪⚔️");
                            window.open(\`mailto:?bcc=\${bccList}&subject=\${subject}&body=\${body}\`, '_blank');
                          }}
                          className="px-4 py-2 bg-[#0d0908] hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                        >
                          <Mail className="w-4 h-4" /> Cobrança em Massa (Email)
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const atrasados = overdueOrPending.filter(s => s.status === 'Atrasado');
                            const phones = atrasados.map(s => s.phone?.replace(/\\D/g, '')).filter(Boolean);
                            if (phones.length > 0) {
                              navigator.clipboard.writeText(phones.join(', '));
                              showToast(\`Copiados \${phones.length} números de telefone para a área de transferência!\`, 'success');
                            } else {
                              showToast('Nenhum aluno atrasado possui telefone cadastrado.', 'error');
                            }
                          }}
                          className="px-4 py-2 bg-[#0d0908] hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-500 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" /> Copiar Números (WhatsApp)
                        </button>
                      </div>
                    </div>
                  )}

                  {overdueOrPending.length > 0 ? (`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Success");
} else {
    console.error("Target not found!");
}
