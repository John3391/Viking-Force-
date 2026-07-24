with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                      const copy = { ...studentsData };
                                      delete copy[email];
                                      saveStudentsToDB(copy);
                                      deleteStudentFromFirebase(email).catch(
                                        (err) =>
                                          console.error(
                                            "Firebase delete permanent error:",
                                            err,
                                          ),
                                      );"""

replacement = """                                      const copy = { ...studentsData };
                                      delete copy[email];
                                      saveStudentsToDB(copy);"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed!")
else:
    print("Target not found.")
