with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                            // Filter by Search string
                            if (!rawTerm) return true;"""

replacement = """                            // Filter by Vencidas
                            if (showOnlyVencidas) {
                              const isPastDue = (() => {
                                if (s.status === "Pago") return false;
                                if (!s.dueDate) return false;
                                const parts = s.dueDate.trim().split("-");
                                if (parts.length !== 3) return false;
                                const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return due.getTime() < today.getTime();
                              })();
                              if (!isPastDue) return false;
                            }

                            // Filter by Search string
                            if (!rawTerm) return true;"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
