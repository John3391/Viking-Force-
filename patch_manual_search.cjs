const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add the state
code = code.replace(
  /const \[navSearchQuery, setNavSearchQuery\] = useState<string>\(''\);/,
  "const [navSearchQuery, setNavSearchQuery] = useState<string>('');\n  const [navSearchInput, setNavSearchInput] = useState<string>('');"
);

// Replace setNavSearchQuery('') with setNavSearchQuery(''); setNavSearchInput('');
code = code.replace(/setNavSearchQuery\(''\);/g, "setNavSearchQuery(''); setNavSearchInput('');");

// Replace the UI block we just patched
const target = `<div className="hidden lg:flex items-center gap-2 group">
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
                        onClick={() => { setNavSearchQuery(''); setNavSearchInput(''); }}
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

const replacement = `<div className="hidden lg:flex items-center gap-2 group relative z-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-viking-silver/60 group-focus-within:text-viking-gold transition-colors" />
                    <input
                      id="navSearchInput"
                      type="text"
                      placeholder="Pesquisar..."
                      value={navSearchInput}
                      onChange={(e) => setNavSearchInput(e.target.value)}
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
                  </button>`;

// Note: In the previous patch, we might have used navSearchQuery inside the X button which we just replaced globally.
// Let's just do a clean regex replace on the entire div block to be safe.
