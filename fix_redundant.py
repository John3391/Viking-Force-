with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    saveStudentsToDB(updatedStudents);

    if (studentEmail) {
      saveStudentToFirebase(studentEmail, updatedProfile).catch((err) =>
        console.error(
          "Direct Firebase save error on workout completion:",
          err,
        ),
      );
    }"""

replacement = """    saveStudentsToDB(updatedStudents);"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
