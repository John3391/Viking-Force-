with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    const studentEmail = (
      currentUser?.email ||
      activeStudentProfile.email ||
      ""
    )
      .toLowerCase()
      .trim();"""

replacement = """    const studentEmail = (
      activeStudentProfile.email ||
      currentUser?.email ||
      ""
    )
      .toLowerCase()
      .trim();"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed!")
else:
    print("Target not found.")
