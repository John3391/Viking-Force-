const fs = require('fs');

const appFile = 'src/App.tsx';
let content = fs.readFileSync(appFile, 'utf8');

const targetStr = `{navSearchQuery && (
                    <button 
                      onClick={() => setNavSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-viking-silver/60 hover:text-viking-gold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}`;

const snippet = fs.readFileSync('search_results_snippet.txt', 'utf8');

content = content.replace(targetStr, targetStr + '\n' + snippet);

fs.writeFileSync(appFile, content, 'utf8');
console.log('App.tsx updated');
