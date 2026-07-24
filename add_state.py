with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  const [paymentsDelayDays, setPaymentsDelayDays] = useState<number>(0);"""
replacement = """  const [paymentsDelayDays, setPaymentsDelayDays] = useState<number>(0);
  const [showOnlyVencidas, setShowOnlyVencidas] = useState(false);"""

content = content.replace(target, replacement)
with open('src/App.tsx', 'w') as f:
    f.write(content)
