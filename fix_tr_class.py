with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                  const isOverdueByDate = daysOverdue > 0 || s.status === "Atrasado";
                                  const isPending = s.status === "Pendente";
                                  const isOverdue = isOverdueByDate;"""

replacement = """                                  const isPastDue = (() => {
                                    if (!s.dueDate) return false;
                                    const parts = s.dueDate.trim().split("-");
                                    if (parts.length !== 3) return false;
                                    const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return due.getTime() < today.getTime();
                                  })();
                                  
                                  const isOverdueByDate = daysOverdue > 0 || s.status === "Atrasado";
                                  const isPending = s.status === "Pendente";
                                  const isOverdue = isOverdueByDate;"""

target2 = """                                      className={`transition-colors cursor-pointer group border-b border-viking-gold/10 ${
                                        isOverdueByDate
                                          ? "bg-red-950/40 border-l-4 border-l-red-500"
                                          : "hover:bg-viking-gold/5"
                                      }`}"""

replacement2 = """                                      className={`transition-colors cursor-pointer group border-b border-viking-gold/10 ${
                                        isPastDue
                                          ? "bg-red-950/40 border-l-4 border-l-red-500"
                                          : "hover:bg-viking-gold/5"
                                      }`}"""


if target in content and target2 in content:
    content = content.replace(target, replacement)
    content = content.replace(target2, replacement2)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found.")
