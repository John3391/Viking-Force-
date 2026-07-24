with open('src/App.tsx', 'r') as f:
    content = f.read()

target1 = """                        allSessions.sort((a, b) => {
                          const aTime = a.id
                            ? parseInt(a.id.split("_")[1] || "0")
                            : 0;
                          const bTime = b.id
                            ? parseInt(b.id.split("_")[1] || "0")
                            : 0;
                          return bTime - aTime;
                        });"""

replacement1 = """                        allSessions.sort((a, b) => {
                          const aTime = a.id
                            ? parseInt(a.id.split("_")[0] || "0")
                            : 0;
                          const bTime = b.id
                            ? parseInt(b.id.split("_")[0] || "0")
                            : 0;
                          return bTime - aTime;
                        });"""

if target1 in content:
    content = content.replace(target1, replacement1)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found.")
