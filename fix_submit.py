with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if line.strip() == "prsAtSession: {":
        pass
    if "setPendingSession(newSession);" in line and "setConfirmSessionModalOpen(true);" in lines[i+1]:
        # we found my injected code
        pass

# Actually it's easier to just do it via sed or python replacing lines
