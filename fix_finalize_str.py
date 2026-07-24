with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    const updatedStudents = {
      ...studentsData,
      [studentEmail]: updatedProfile,
    };
    saveStudentsToDB(updatedStudents);"""

replacement = """    setStudentsData((prev) => {
      const updated = {
        ...prev,
        [studentEmail]: updatedProfile,
      };
      localStorage.setItem("viking_students", JSON.stringify(updated));
      if (studentEmail) {
        saveStudentToFirebase(studentEmail, updatedProfile).catch((err) =>
          console.error("Firebase save athlete error:", err)
        );
      }
      return updated;
    });"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced!")
else:
    print("Not found!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
