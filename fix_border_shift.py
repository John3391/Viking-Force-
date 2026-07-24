with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                        isPastDue
                                          ? "bg-red-950/40 border-l-4 border-l-red-500"
                                          : "hover:bg-viking-gold/5"
                                      }`}"""

replacement = """                                        isPastDue
                                          ? "bg-red-950/40 border-l-4 border-l-red-500"
                                          : "border-l-4 border-l-transparent hover:bg-viking-gold/5"
                                      }`}"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced!")
else:
    print("Not found!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
