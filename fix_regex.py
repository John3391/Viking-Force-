import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"    const updatedStudents = \{\n\s*\.\.\.studentsData,\n\s*\[studentEmail\]: updatedProfile,\n\s*\};\n\s*saveStudentsToDB\(updatedStudents\);")

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

if pattern.search(content):
    content = pattern.sub(replacement, content, count=1)
    print("Replaced with regex!")
else:
    print("Not found with regex!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
