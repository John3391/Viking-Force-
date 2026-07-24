with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                  <th className="p-3">
                                    <div className="flex items-center gap-2">
                                      Vencimento
                                      <button
                                        type="button"
                                        onClick={() => setShowOnlyVencidas(!showOnlyVencidas)}
                                        className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${showOnlyVencidas ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#0d0908]/40 text-viking-silver hover:text-viking-gold border border-viking-gold/20'}`}
                                        title="Mostrar apenas vencidas"
                                      >
                                        Vencidas
                                      </button>
                                    </div>
                                  </th>"""

replacement = """                                  <th className="p-3">
                                    <div className="flex items-center gap-2">
                                      Vencimento
                                      <button
                                        type="button"
                                        onClick={() => setVencimentoSortDir(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc")}
                                        className={`p-0.5 rounded transition-colors ${vencimentoSortDir ? 'bg-viking-gold/20 text-viking-gold' : 'text-viking-silver/50 hover:text-viking-gold/80'}`}
                                        title="Ordenar por data"
                                      >
                                        <ArrowUpDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setShowOnlyVencidas(!showOnlyVencidas)}
                                        className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${showOnlyVencidas ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#0d0908]/40 text-viking-silver hover:text-viking-gold border border-viking-gold/20'}`}
                                        title="Mostrar apenas vencidas"
                                      >
                                        Vencidas
                                      </button>
                                    </div>
                                  </th>"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced header!")
else:
    print("Not found header!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
