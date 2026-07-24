with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  const [paymentsDelayDays, setPaymentsDelayDays] = useState<number>(0);
  const [showOnlyVencidas, setShowOnlyVencidas] = useState(false);"""
replacement = """  const [paymentsDelayDays, setPaymentsDelayDays] = useState<number>(0);
  const [showOnlyVencidas, setShowOnlyVencidas] = useState(false);
  const [vencimentoSortDir, setVencimentoSortDir] = useState<"asc" | "desc" | null>(null);"""

content = content.replace(target, replacement)
with open('src/App.tsx', 'w') as f:
    f.write(content)
