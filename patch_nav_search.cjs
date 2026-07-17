const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<div className="hidden lg:flex relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-viking-silver/60 group-focus-within:text-viking-gold transition-colors" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    className="w-48 xl:w-64 search-input-viking text-viking-silver text-xs px-9 py-2 rounded-xl outline-none transition-all"
                  />
                  {navSearchQuery && (
                    <button 
                      onClick={() => setNavSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-viking-silver/60 hover:text-viking-gold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}`;

const replacement = `<div className="hidden lg:flex items-center gap-2 group">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-viking-silver/60 group-focus-within:text-viking-gold transition-colors" />
                    <input
                      id="navSearchInput"
                      type="text"
                      placeholder="Pesquisar..."
                      value={navSearchQuery}
                      onChange={(e) => setNavSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // Manual trigger visual effect if needed
                        }
                      }}
                      className="w-48 xl:w-64 search-input-viking text-viking-silver text-xs px-9 py-2 rounded-xl outline-none transition-all"
                    />
                    {navSearchQuery && (
                      <button 
                        onClick={() => setNavSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-viking-silver/60 hover:text-viking-gold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      document.getElementById('navSearchInput')?.focus();
                    }}
                    className="p-2 bg-viking-gold/10 hover:bg-viking-gold/20 border border-viking-gold/20 text-viking-gold rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                    title="Pesquisar"
                  >
                    <Search className="w-4 h-4" />
                  </button>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
