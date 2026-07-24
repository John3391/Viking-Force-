with open('src/App.tsx', 'r') as f:
    content = f.read()

target1 = """                      const copy = { ...studentsData };
                      copy[email] = {
                        ...student,
                        isDeleted: true,
                        deletedAt: new Date().toISOString(),
                      };
                      saveStudentsToDB(copy);"""
                      
replacement1 = """                      const copy = { ...studentsData };
                      copy[email] = {
                        ...student,
                        isDeleted: true,
                        deletedAt: new Date().toISOString(),
                      };
                      saveStudentsToDB(copy);
                      saveStudentToFirebase(email, copy[email]).catch((err) => console.error("Firebase sync error on soft delete:", err));"""

if target1 in content:
    content = content.replace(target1, replacement1)
    print("Fixed soft delete!")
else:
    print("Target 1 not found.")

target2 = """                                  const copy = { ...studentsData };
                                  if (copy[email]) {
                                    copy[email] = {
                                      ...copy[email],
                                      isDeleted: false,
                                    };
                                    saveStudentsToDB(copy);
                                    showToast("""

replacement2 = """                                  const copy = { ...studentsData };
                                  if (copy[email]) {
                                    copy[email] = {
                                      ...copy[email],
                                      isDeleted: false,
                                    };
                                    saveStudentsToDB(copy);
                                    saveStudentToFirebase(email, copy[email]).catch((err) => console.error("Firebase sync error on restore:", err));
                                    showToast("""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Fixed restore!")
else:
    print("Target 2 not found.")
    
target3 = """                                      const copy = { ...studentsData };
                                      delete copy[email];
                                      saveStudentsToDB(copy);
                                      showToast("""

replacement3 = """                                      const copy = { ...studentsData };
                                      delete copy[email];
                                      saveStudentsToDB(copy);
                                      deleteStudentFromFirebase(email).catch(
                                        (err) => console.error("Firebase delete permanent error:", err)
                                      );
                                      showToast("""

if target3 in content:
    content = content.replace(target3, replacement3)
    print("Fixed hard delete!")
else:
    print("Target 3 not found.")

with open('src/App.tsx', 'w') as f:
    f.write(content)
