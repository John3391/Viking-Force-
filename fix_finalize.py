with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    const updatedProfile: StudentProfile = {
      ...activeStudentProfile,
      sessions: [session, ...(activeStudentProfile.sessions || [])],
    };"""

replacement = """    const updatedProfile: StudentProfile = {
      ...activeStudentProfile,
      sessions: activeStudentProfile.sessions?.some(s => s.id === session.id) 
        ? activeStudentProfile.sessions.map(s => s.id === session.id ? session : s)
        : [session, ...(activeStudentProfile.sessions || [])],
    };"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed!")
else:
    print("Target not found.")
