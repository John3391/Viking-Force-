with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                      className={`transition-colors cursor-pointer group border-b border-viking-gold/10 ${
                                        isOverdueByDate
                                          ? "bg-red-950/40 hover:bg-red-900/50 border-l-4 border-l-red-500 shadow-[inset_0_0_12px_rgba(239,68,68,0.2)]"
                                          : "hover:bg-viking-gold/5"
                                      }`}"""

replacement = """                                      className={`transition-colors cursor-pointer group border-b border-viking-gold/10 ${
                                        isOverdueByDate
                                          ? "bg-red-950/40 border-l-4 border-l-red-500"
                                          : "hover:bg-viking-gold/5"
                                      }`}"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed!")
else:
    print("Target not found.")
