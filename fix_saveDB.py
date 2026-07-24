import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"  const saveStudentsToDB = \(newStuds: Record<string, StudentProfile>\) => \{\n\s*const prevStuds = studentsData;\n\n\s*// Normalize email keys to lowercase\n\s*const normalizedStuds: Record<string, StudentProfile> = \{\};\n\s*Object\.keys\(newStuds\)\.forEach\(\(email\) => \{\n\s*const cleanEmail = email\.trim\(\)\.toLowerCase\(\);\n\s*if \(cleanEmail\) \{\n\s*normalizedStuds\[cleanEmail\] = \{\n\s*\.\.\.newStuds\[email\],\n\s*email: cleanEmail,\n\s*\};\n\s*\}\n\s*\}\);\n\n\s*// Save state and local storage instantly for fluid UI responsiveness\n\s*setStudentsData\(normalizedStuds\);\n\s*localStorage\.setItem\(\"viking_students\", JSON\.stringify\(normalizedStuds\)\);\n\n\s*// Async sync to Firestore\n\s*// Deletion check\n\s*Object\.keys\(prevStuds\)\.forEach\(\(email\) => \{\n\s*const cleanEmail = email\.trim\(\)\.toLowerCase\(\);\n\s*if \(\!normalizedStuds\[cleanEmail\]\) \{\n\s*deleteStudentFromFirebase\(cleanEmail\)\.catch\(\(err\) =>\n\s*console\.error\(\"Firebase delete athlete error:\", err\),\n\s*\);\n\s*\}\n\s*\}\);\n\n\s*// Modification / addition check\n\s*Object\.keys\(normalizedStuds\)\.forEach\(\(cleanEmail\) => \{\n\s*const oldVal = prevStuds\[cleanEmail\];\n\s*const newVal = normalizedStuds\[cleanEmail\];\n\s*if \(\!oldVal \|\| JSON\.stringify\(oldVal\) !== JSON\.stringify\(newVal\)\) \{\n\s*saveStudentToFirebase\(cleanEmail, newVal\)\.catch\(\(err\) =>\n\s*console\.error\(\"Firebase save athlete error:\", err\),\n\s*\);\n\s*\}\n\s*\}\);\n\n\s*// Broadcast student updates across tabs and windows for real-time trainer sync\n\s*try \{\n\s*if \(typeof window !== \"undefined\" && window\.BroadcastChannel\) \{\n\s*const bc = new BroadcastChannel\(\"viking_force_sync\"\);\n\s*bc\.postMessage\(\{ type: \"STUDENTS_UPDATED\", data: normalizedStuds \}\);\n\s*bc\.close\(\);\n\s*\}\n\s*\} catch \(\_\) \{\}\n\s*\};\n")

replacement = """  const saveStudentsToDB = (newStuds: Record<string, StudentProfile>) => {
    setStudentsData((prevStuds) => {
      // Normalize email keys to lowercase
      const normalizedStuds: Record<string, StudentProfile> = {};
      
      // Merge with prevStuds to avoid stale state issues!
      // This ensures we don't accidentally overwrite existing students if newStuds was built from a stale closure.
      Object.keys(prevStuds).forEach((email) => {
          normalizedStuds[email] = prevStuds[email];
      });
      
      Object.keys(newStuds).forEach((email) => {
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail) {
          normalizedStuds[cleanEmail] = {
            ...newStuds[email],
            email: cleanEmail,
          };
        }
      });

      // Save state and local storage instantly for fluid UI responsiveness
      localStorage.setItem("viking_students", JSON.stringify(normalizedStuds));

      // Async sync to Firestore
      // Deletion check
      Object.keys(prevStuds).forEach((email) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!normalizedStuds[cleanEmail]) {
          deleteStudentFromFirebase(cleanEmail).catch((err) =>
            console.error("Firebase delete athlete error:", err),
          );
        }
      });

      // Modification / addition check
      Object.keys(normalizedStuds).forEach((cleanEmail) => {
        const oldVal = prevStuds[cleanEmail];
        const newVal = normalizedStuds[cleanEmail];
        if (!oldVal || JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          saveStudentToFirebase(cleanEmail, newVal).catch((err) =>
            console.error("Firebase save athlete error:", err),
          );
        }
      });

      // Broadcast student updates across tabs and windows for real-time trainer sync
      try {
        if (typeof window !== "undefined" && window.BroadcastChannel) {
          const bc = new BroadcastChannel("viking_force_sync");
          bc.postMessage({ type: "STUDENTS_UPDATED", data: normalizedStuds });
          bc.close();
        }
      } catch (_) {}
      
      return normalizedStuds;
    });
  };
"""

if pattern.search(content):
    content = pattern.sub(replacement, content, count=1)
    print("Replaced saveStudentsToDB with regex!")
else:
    print("Not found saveStudentsToDB with regex!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
