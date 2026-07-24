with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                        const totalCount = Object.keys(studentsData).length;

                        return ("""

replacement = """                        if (vencimentoSortDir) {
                          filtered.sort((emailA, emailB) => {
                            const dateA = studentsData[emailA]?.dueDate;
                            const dateB = studentsData[emailB]?.dueDate;
                            if (!dateA && !dateB) return 0;
                            if (!dateA) return 1;
                            if (!dateB) return -1;
                            
                            const timeA = new Date(dateA).getTime();
                            const timeB = new Date(dateB).getTime();
                            
                            if (vencimentoSortDir === "asc") {
                              return timeA - timeB;
                            } else {
                              return timeB - timeA;
                            }
                          });
                        }

                        const totalCount = Object.keys(studentsData).length;

                        return ("""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced!")
else:
    print("Not found!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
