with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    const studentEmail = (
      activeStudentProfile.email ||
      currentUser?.email ||
      ""
    )
      .toLowerCase()
      .trim();

    const updatedStudents = {
      ...studentsData,
      [studentEmail]: updatedProfile,
    };
    saveStudentsToDB(updatedStudents);"""

replacement = """    const studentEmail = (
      activeStudentProfile.email ||
      currentUser?.email ||
      ""
    )
      .toLowerCase()
      .trim();

    setStudentsData((prev) => {
      const updatedStudents = {
        ...prev,
        [studentEmail]: updatedProfile,
      };
      
      // Update local storage instantly
      localStorage.setItem("viking_students", JSON.stringify(updatedStudents));
      
      // Sync to Firebase
      saveStudentToFirebase(studentEmail, updatedProfile).catch((err) =>
        console.error("Firebase save athlete error:", err),
      );
      
      return updatedStudents;
    });"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
