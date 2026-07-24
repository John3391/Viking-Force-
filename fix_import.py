with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("} ArrowUpDown,\n} from \"lucide-react\";", "  ArrowUpDown,\n} from \"lucide-react\";")

with open('src/App.tsx', 'w') as f:
    f.write(content)
