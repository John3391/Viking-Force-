with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    const updatedStudents = {
      ...studentsData,
      [studentEmail]: updatedProfile,
    };
    saveStudentsToDB(updatedStudents);"""

replacement = """    setStudentsData((prev) => {
      const updatedStudents = {
        ...prev,
        [studentEmail]: updatedProfile,
      };
      localStorage.setItem("viking_students", JSON.stringify(updatedStudents));
      if (studentEmail) {
        saveStudentToFirebase(studentEmail, updatedProfile).catch((err) =>
          console.error("Firebase save athlete error:", err)
        );
      }
      return updatedStudents;
    });"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
