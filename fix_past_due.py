with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                  const isPastDue = (() => {
                                    if (!s.dueDate) return false;
                                    const parts = s.dueDate.trim().split("-");
                                    if (parts.length !== 3) return false;
                                    const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return due.getTime() < today.getTime();
                                  })();"""

replacement = """                                  const isPastDue = (() => {
                                    if (s.status === "Pago") return false;
                                    if (!s.dueDate) return false;
                                    const parts = s.dueDate.trim().split("-");
                                    if (parts.length !== 3) return false;
                                    const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return due.getTime() < today.getTime();
                                  })();"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced isPastDue!")
else:
    print("isPastDue not found!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
