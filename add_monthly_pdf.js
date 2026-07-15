import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const handleExportWilksPDF = (`;

const monthlyPDFCode = `  const handleDownloadMonthlySummaryPDF = (profile: StudentProfile) => {
    try {
      const doc = new jsPDF();
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(197, 160, 89);
      doc.text('VIKING FORCE', 20, 25);
      
      doc.setFontSize(13);
      doc.setTextColor(100, 100, 100);
      doc.text('RESUMO MENSAL CONSOLIDADO', 20, 33);
      
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Guerreiro(a):', 20, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.name, 45, 48);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Data de Emissão:', 120, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('pt-BR'), 153, 48);

      const monthlyData: Record<string, {
        sessions: number;
        totalVolume: number;
        totalRPE: number;
        rpeCount: number;
        maxSquat: number;
        maxBench: number;
        maxDeadlift: number;
      }> = {};

      profile.sessions.forEach(sess => {
        const parts = sess.date.split('/');
        if (parts.length >= 3) {
          const mm = parts[1].padStart(2, '0');
          const yyyy = parts[2];
          const monthYear = \`\${mm}/\${yyyy}\`;
          
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
              sessions: 0,
              totalVolume: 0,
              totalRPE: 0,
              rpeCount: 0,
              maxSquat: 0,
              maxBench: 0,
              maxDeadlift: 0
            };
          }
          const md = monthlyData[monthYear];
          md.sessions++;
          md.totalVolume += (sess.totalAchievedVolume || 0);
          
          if (sess.avgRPE !== undefined && !isNaN(sess.avgRPE) && sess.avgRPE > 0) {
            md.totalRPE += sess.avgRPE;
            md.rpeCount++;
          }
          
          if (sess.prsAtSession) {
            if (sess.prsAtSession.squat && sess.prsAtSession.squat > md.maxSquat) md.maxSquat = sess.prsAtSession.squat;
            if (sess.prsAtSession.bench && sess.prsAtSession.bench > md.maxBench) md.maxBench = sess.prsAtSession.bench;
            if (sess.prsAtSession.deadlift && sess.prsAtSession.deadlift > md.maxDeadlift) md.maxDeadlift = sess.prsAtSession.deadlift;
          }
        }
      });

      let y = 65;
      const pageHeight = doc.internal.pageSize.height;

      const months = Object.keys(monthlyData).sort((a, b) => {
        const [mA, yA] = a.split('/').map(Number);
        const [mB, yB] = b.split('/').map(Number);
        if (yA !== yB) return yB - yA;
        return mB - mA;
      });

      if (months.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Nenhum dado mensal registrado.', 20, y);
      } else {
        months.forEach(month => {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = 20;
          }
          
          const md = monthlyData[month];
          
          doc.setFillColor(13, 9, 8);
          doc.rect(20, y, 170, 8, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(197, 160, 89);
          doc.text(\`Mês/Ano: \${month}\`, 23, y + 5.5);
          
          y += 15;
          doc.setFontSize(10);
          doc.setTextColor(50, 50, 50);
          
          const avgRpe = md.rpeCount > 0 ? (md.totalRPE / md.rpeCount).toFixed(1) : 'N/A';
          
          doc.text(\`Sessões Treinadas: \${md.sessions}\`, 25, y);
          doc.text(\`Volume Total (Reps): \${md.totalVolume}\`, 100, y);
          y += 7;
          doc.text(\`RPE Médio do Mês: \${avgRpe}\`, 25, y);
          y += 10;
          
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text('RECORDES (PR) ATINGIDOS NO PERÍODO:', 25, y);
          y += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(30, 30, 30);
          doc.text(\`Agachamento: \${md.maxSquat > 0 ? md.maxSquat + ' kg' : '-'}\`, 25, y);
          doc.text(\`Supino: \${md.maxBench > 0 ? md.maxBench + ' kg' : '-'}\`, 80, y);
          doc.text(\`Terra: \${md.maxDeadlift > 0 ? md.maxDeadlift + ' kg' : '-'}\`, 135, y);
          
          y += 15;
          doc.setDrawColor(220, 220, 220);
          doc.line(20, y, 190, y);
          y += 10;
        });
      }

      const fileName = \`viking_force_\${profile.name.toLowerCase().replace(/\\s+/g, '_')}_resumo_mensal.pdf\`;
      doc.save(fileName);
      showToast('Resumo Mensal exportado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PDF Mensal.', 'error');
    }
  };

  const handleExportWilksPDF = (`;

if (content.includes(target)) {
    content = content.replace(target, monthlyPDFCode);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Monthly PDF function added!");
} else {
    console.error("Target not found!");
}
