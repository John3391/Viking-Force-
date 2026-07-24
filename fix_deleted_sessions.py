with open('src/App.tsx', 'r') as f:
    content = f.read()

target1 = """                            if (
                              student &&
                              student.sessions &&
                              student.sessions.length > 0
                            ) {"""

replacement1 = """                            if (
                              student &&
                              !student.isDeleted &&
                              student.sessions &&
                              student.sessions.length > 0
                            ) {"""

if target1 in content:
    content = content.replace(target1, replacement1)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Fixed target1!")
else:
    print("Target1 not found.")
