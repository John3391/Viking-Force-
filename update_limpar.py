with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                              {(paymentsSearch || paymentsStatusFilter !== "all" || paymentsDelayDays > 0) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentsSearch("");
                                    setPaymentsStatusFilter("all");
                                    setPaymentsDelayDays(0);
                                  }}"""

replacement = """                              {(paymentsSearch || paymentsStatusFilter !== "all" || paymentsDelayDays > 0 || showOnlyVencidas) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentsSearch("");
                                    setPaymentsStatusFilter("all");
                                    setPaymentsDelayDays(0);
                                    setShowOnlyVencidas(false);
                                  }}"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
