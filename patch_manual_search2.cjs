const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="hidden lg:flex items-center gap-2 group">[\s\S]*?<AnimatePresence>/m;

const replacement = `<div className="hidden lg:flex items-center gap-2 group relative z-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-viking-silver/60 group-focus-within:text-viking-gold transition-colors" />
                    <input
                      id="navSearchInput"
                      type="text"
                      placeholder="Pesquisar..."
                      value={navSearchInput}
                      onChange={(e) => {
                        setNavSearchInput(e.target.value);
                        if (e.target.value === '') {
                           setNavSearchQuery('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setNavSearchQuery(navSearchInput);
                        }
                      }}
                      className="w-48 xl:w-64 search-input-viking text-viking-silver text-xs pl-9 pr-9 py-2 rounded-xl outline-none transition-all"
                    />
                    {navSearchInput && (
                      <button 
                        onClick={() => { setNavSearchQuery(''); setNavSearchInput(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-viking-silver/60 hover:text-viking-gold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setNavSearchQuery(navSearchInput);
                    }}
                    className="p-2 bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 text-viking-gold rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="Acionar Pesquisa"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <AnimatePresence>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
