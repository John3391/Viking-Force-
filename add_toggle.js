const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                              <option value="blocked" className="bg-[#140e0c] text-red-400">Bloqueado</option>
                            </select>
                          </div>
                        </div>`;
const replacement = `                              <option value="blocked" className="bg-[#140e0c] text-red-400">Bloqueado</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border border-viking-gold/15 bg-black/30">
                           <label className="flex items-center gap-3 cursor-pointer">
                             <input 
                               type="checkbox" 
                               id="editStudentAutoMonthlySummary"
                               defaultChecked={s.autoMonthlySummary || false}
                               className="w-4 h-4 rounded border-viking-gold/20 text-viking-gold focus:ring-viking-gold"
                             />
                             <span className="text-xs font-bold text-white uppercase">Resumo Mensal Automático</span>
                           </label>
                        </div>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Success");
} else {
    console.error("Target not found!");
}
