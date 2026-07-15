import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const stateTarget = `  const [whatsappSearch, setWhatsappSearch] = useState<string>('');`;
const stateReplacement = `  const [whatsappSearch, setWhatsappSearch] = useState<string>('');
  const [billingFilterDelay, setBillingFilterDelay] = useState<number>(0);`;

if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplacement);
} else {
    console.error("State target not found!");
}

const drawerTarget = `                 {drawerType === 'whatsapp' && (
                   <div className="space-y-4">
                     <p className="text-xs text-viking-silver/85">
                       Selecione um atleta em atraso ou pendente para abrir o WhatsApp Web com uma mensagem personalizada de lembrete de renovação de forma instantânea.
                     </p>
                     
                     {/* Search Bar */}
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Search className="h-3.5 w-3.5 text-viking-gold/60" />
                       </div>
                       <input
                         type="text"
                         placeholder="Buscar guerreiro por nome ou email..."
                         value={whatsappSearch}
                         onChange={(e) => setWhatsappSearch(e.target.value)}
                         className="w-full pl-9 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/45 outline-none transition-all"
                       />
                       {whatsappSearch && (
                         <button
                           onClick={() => setWhatsappSearch('')}
                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-viking-silver hover:text-viking-gold transition-colors text-xs font-bold cursor-pointer"
                         >
                           Limpar
                         </button>
                       )}
                     </div>

                     <div className="space-y-3">
                       {(() => {
                         const filtered = Object.keys(studentsData)
                           .map(email => ({ email, s: studentsData[email] }))
                           .filter(({ email, s }) => {
                             if (s.status === 'Pago') return false;
                             const term = whatsappSearch.toLowerCase().trim();
                             if (!term) return true;
                             return s.name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
                           });

                         if (filtered.length === 0) {
                           return (
                             <p className="text-center py-6 text-xs text-viking-silver/60">
                               {whatsappSearch ? 'Nenhum guerreiro correspondente encontrado.' : 'Nenhum guerreiro está inadimplente no momento! Todos em dia.'}
                             </p>
                           );
                         }

                         return filtered.map(({ email, s }) => {
                           const customText = \`Saudações, guerreiro \${s.name}! Passando para lembrar sobre a renovação da sua assinatura de acompanhamento na Viking Force. Vamos continuar os treinos e quebrar recordes? 💪⚔️\`;
                           const phoneClean = (s.phone || '5511999999999').replace(/\\D/g, ''); // default if missing
                           return (
                             <div key={email} className="p-4 rounded-xl bg-[#0d0908]/60 border border-viking-gold/15 flex justify-between items-center">
                               <div>
                                 <p className="text-sm font-bold text-white">{s.name}</p>
                                 <p className="text-[10px] text-viking-gold uppercase mt-0.5 font-viking-medieval font-bold">Mensalidade em {s.status}</p>
                                 {s.phone && <p className="text-xs text-viking-silver mt-1">{s.phone}</p>}
                               </div>
                               <a 
                                 href={\`https://wa.me/\${phoneClean}?text=\${encodeURIComponent(customText)}\`}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="px-3.5 py-2 rounded-xl bg-[#1ea453] hover:bg-[#167d3e] text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                               >
                                 <Phone className="w-3.5 h-3.5" /> Enviar Cobrança
                               </a>
                             </div>
                           );
                         });
                       })()}
                     </div>
                   </div>
                 )}`;

const drawerReplacement = `                 {drawerType === 'whatsapp' && (
                   <div className="space-y-5">
                     <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4">
                       <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">Painel de Atrasados</h4>
                       <p className="text-xs text-viking-silver/85">
                         Filtre e notifique de forma rápida os alunos com status de mensalidade 'Atrasado'.
                       </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                       {/* Search Bar */}
                       <div className="relative flex-1">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Search className="h-3.5 w-3.5 text-viking-gold/60" />
                         </div>
                         <input
                           type="text"
                           placeholder="Buscar guerreiro..."
                           value={whatsappSearch}
                           onChange={(e) => setWhatsappSearch(e.target.value)}
                           className="w-full pl-9 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/45 outline-none transition-all"
                         />
                         {whatsappSearch && (
                           <button
                             onClick={() => setWhatsappSearch('')}
                             className="absolute inset-y-0 right-0 pr-3 flex items-center text-viking-silver hover:text-viking-gold transition-colors text-xs font-bold cursor-pointer"
                           >
                             <X className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                       
                       {/* Delay Filter */}
                       <div className="sm:w-48 relative">
                         <select
                           value={billingFilterDelay}
                           onChange={(e) => setBillingFilterDelay(Number(e.target.value))}
                           className="w-full appearance-none pl-3 pr-8 py-2 bg-[#0d0908]/60 border border-viking-gold/20 hover:border-viking-gold/45 focus:border-viking-gold focus:ring-1 focus:ring-viking-gold rounded-xl text-xs text-white outline-none transition-all cursor-pointer font-bold"
                         >
                           <option value={0}>Todos os Atrasados</option>
                           <option value={7}>Mais de 7 dias</option>
                           <option value={15}>Mais de 15 dias</option>
                           <option value={30}>Mais de 30 dias</option>
                         </select>
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                           <Filter className="h-3.5 w-3.5 text-viking-gold/60" />
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       {(() => {
                         const today = new Date();
                         today.setHours(0, 0, 0, 0);

                         const filtered = Object.keys(studentsData)
                           .map(email => ({ email, s: studentsData[email] }))
                           .filter(({ email, s }) => {
                             if (s.status !== 'Atrasado') return false; // ONLY Atrasado
                             
                             // Delay logic
                             let daysDelayed = 0;
                             if (s.dueDate) {
                               const [year, month, day] = s.dueDate.split('-');
                               const due = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                               const diffTime = today.getTime() - due.getTime();
                               daysDelayed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                             }
                             
                             if (billingFilterDelay > 0 && daysDelayed <= billingFilterDelay) return false;

                             const term = whatsappSearch.toLowerCase().trim();
                             if (!term) return true;
                             return s.name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
                           });

                         if (filtered.length === 0) {
                           return (
                             <div className="text-center py-10 bg-black/20 rounded-2xl border border-viking-gold/10">
                               <Shield className="w-10 h-10 mx-auto text-emerald-500/30 mb-3" />
                               <p className="text-sm text-emerald-500/80 font-bold">Nenhum atleta atrasado encontrado.</p>
                               <p className="text-xs text-viking-silver/60 mt-1">As finanças do templo estão seguras para este filtro!</p>
                             </div>
                           );
                         }

                         return filtered.map(({ email, s }) => {
                           // calc delay for display
                           let daysDelayed = 0;
                           if (s.dueDate) {
                             const [year, month, day] = s.dueDate.split('-');
                             const due = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                             const diffTime = today.getTime() - due.getTime();
                             daysDelayed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                           }

                           const customText = \`Saudações, guerreiro \${s.name}! Identificamos que sua assinatura na Viking Force encontra-se ATRASADA. Por favor, regularize sua situação o quanto antes para continuar seus treinos! 💪⚔️\`;
                           const phoneClean = (s.phone || '').replace(/\\D/g, ''); 
                           
                           const mailSubject = encodeURIComponent("Renovação de Assinatura - Viking Force");
                           const mailBody = encodeURIComponent(\`Saudações, guerreiro \${s.name}!\n\nIdentificamos que sua assinatura na Viking Force encontra-se ATRASADA.\nPor favor, regularize sua situação o quanto antes para continuar acessando seus treinos.\n\nAtenciosamente,\nEquipe Viking Force\`);

                           return (
                             <div key={email} className="p-4 rounded-xl bg-red-950/10 border border-red-500/20 hover:border-red-500/40 hover:bg-red-950/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                               <div>
                                 <div className="flex items-center gap-2">
                                   <p className="text-sm font-bold text-white">{s.name}</p>
                                   <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                     {s.status}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-3 mt-1.5 text-[10px] text-viking-silver/80">
                                   <span className="flex items-center gap-1">
                                     <Calendar className="w-3 h-3" /> Vencimento: {s.dueDate ? s.dueDate.split('-').reverse().join('/') : 'N/A'}
                                   </span>
                                   {daysDelayed > 0 && (
                                     <span className="flex items-center gap-1 text-red-400 font-bold">
                                       <AlertTriangle className="w-3 h-3" /> {daysDelayed} dias de atraso
                                     </span>
                                   )}
                                 </div>
                                 {s.phone && <p className="text-[10px] text-viking-silver mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</p>}
                               </div>
                               
                               <div className="flex gap-2 w-full md:w-auto">
                                 {s.phone ? (
                                   <a 
                                     href={\`https://wa.me/\${phoneClean}?text=\${encodeURIComponent(customText)}\`}
                                     target="_blank"
                                     rel="noreferrer"
                                     className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-[#1ea453] hover:bg-[#167d3e] text-white font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#1ea453]/20"
                                   >
                                     <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                   </a>
                                 ) : (
                                   <button disabled className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-viking-dark border border-viking-gold/10 text-viking-silver/30 font-bold text-[10px] uppercase cursor-not-allowed flex items-center justify-center gap-1.5">
                                     <MessageCircle className="w-3.5 h-3.5 opacity-30" /> S/ Whats
                                   </button>
                                 )}
                                 <a 
                                   href={\`mailto:\${email}?subject=\${mailSubject}&body=\${mailBody}\`}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-viking-dark border border-viking-gold/30 hover:border-viking-gold text-[#e0d3a8] hover:text-white font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                 >
                                   <Mail className="w-3.5 h-3.5 text-viking-gold" /> E-mail
                                 </a>
                               </div>
                             </div>
                           );
                         });
                       })()}
                     </div>
                   </div>
                 )}`;

if (content.includes(drawerTarget)) {
    content = content.replace(drawerTarget, drawerReplacement);
} else {
    console.error("Drawer target not found!");
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("Success");
