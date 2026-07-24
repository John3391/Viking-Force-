with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                        allSessions.sort((a, b) => {
                          const aTime = a.id
                            ? parseInt(a.id.split("_")[0] || "0")
                            : 0;
                          const bTime = b.id
                            ? parseInt(b.id.split("_")[0] || "0")
                            : 0;
                          return bTime - aTime;
                        });"""

replacement = """                        allSessions.sort((a, b) => {
                          const aTime = a.id
                            ? parseInt(a.id.split("_")[1] || "0")
                            : 0;
                          const bTime = b.id
                            ? parseInt(b.id.split("_")[1] || "0")
                            : 0;
                          return bTime - aTime;
                        });"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Fixed target 1!")
else:
    print("Target 1 not found.")


target2 = """                        allSessions.sort((a, b) => {
                          const aTime = a.id
                            ? parseInt(a.id.split("_")[0] || "0")
                            : 0;
                          const bTime = b.id
                            ? parseInt(b.id.split("_")[0] || "0")
                            : 0;
                          return bTime - aTime;"""

replacement2 = """                        allSessions.sort((a, b) => {
                          const aTime = a.id
                            ? parseInt(a.id.split("_")[1] || "0")
                            : 0;
                          const bTime = b.id
                            ? parseInt(b.id.split("_")[1] || "0")
                            : 0;
                          return bTime - aTime;"""
                          
if target2 in content:
    content = content.replace(target2, replacement2)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Fixed target 2!")
else:
    print("Target 2 not found.")

