import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Heart, Activity, Coins, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FinancialHealthChartProps {
  studentsData: Record<string, any>;
  getPlanMonthlyEquivalent: (plan: string) => number;
}

export default function FinancialHealthChart({ studentsData, getPlanMonthlyEquivalent }: FinancialHealthChartProps) {
  // Compute financial totals per category
  let expectedTotal = 0;
  let receivedTotal = 0;

  let mensalTarget = 0;
  let mensalReceived = 0;

  let trimestralTarget = 0;
  let trimestralReceived = 0;

  let anualTarget = 0;
  let anualReceived = 0;

  Object.values(studentsData).forEach((student: any) => {
    if (!student || student.isDeleted) return;
    const value = getPlanMonthlyEquivalent(student.plan);
    const isPaid = student.status === 'Pago';

    expectedTotal += value;
    if (isPaid) receivedTotal += value;

    if (student.plan === 'Mensal') {
      mensalTarget += value;
      if (isPaid) mensalReceived += value;
    } else if (student.plan === 'Trimestral') {
      trimestralTarget += value;
      if (isPaid) trimestralReceived += value;
    } else if (student.plan === 'Anual') {
      anualTarget += value;
      if (isPaid) anualReceived += value;
    }
  });

  const receivedPercentage = expectedTotal > 0 ? Math.round((receivedTotal / expectedTotal) * 100) : 0;

  // Determine Health Status
  let healthLabel = 'Crítica';
  let healthColor = 'text-red-400 border-red-500/20 bg-red-500/5';
  let healthText = 'A arrecadação está baixa. Entre em contato com os guerreiros com mensalidade em atraso!';
  let HealthIcon = AlertCircle;

  if (receivedPercentage >= 85) {
    healthLabel = 'Excelente';
    healthColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    healthText = 'O tesouro de Valhalla está transbordando! Excelente índice de adimplência.';
    HealthIcon = CheckCircle2;
  } else if (receivedPercentage >= 50) {
    healthLabel = 'Estável';
    healthColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    healthText = 'Nível de arrecadação moderado. Recomenda-se enviar lembretes para os pendentes.';
    HealthIcon = Activity;
  }

  // Data for Recharts Bar Chart
  const chartData = [
    {
      name: 'Total Geral',
      'Meta de Arrecadação': expectedTotal,
      'Valor Recebido': receivedTotal,
    },
    {
      name: 'Plano Mensal',
      'Meta de Arrecadação': mensalTarget,
      'Valor Recebido': mensalReceived,
    },
    {
      name: 'Plano Trimestral',
      'Meta de Arrecadação': trimestralTarget,
      'Valor Recebido': trimestralReceived,
    },
    {
      name: 'Plano Anual',
      'Meta de Arrecadação': anualTarget,
      'Valor Recebido': anualReceived,
    },
  ];

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#140e0c]/98 border border-viking-gold/30 rounded-xl p-4 shadow-xl backdrop-blur-md text-[#e0d3a8] text-xs">
          <p className="font-bold text-white text-sm border-b border-viking-gold/20 pb-1.5 mb-2 flex items-center gap-1.5">
            🛡️ {payload[0].payload.name}
          </p>
          <div className="space-y-1.5">
            {payload.map((item: any, idx: number) => (
              <p key={idx} className="flex justify-between gap-6 items-center">
                <span className="text-viking-silver/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}:
                </span>
                <strong className="font-mono text-white">{formatCurrency(item.value)}</strong>
              </p>
            ))}
            {payload[0].payload['Meta de Arrecadação'] > 0 && (
              <p className="flex justify-between gap-6 border-t border-viking-gold/10 pt-1.5 mt-1.5">
                <span className="text-viking-silver/80">Aproveitamento:</span>
                <strong className="text-viking-gold font-mono">
                  {Math.round((payload[0].payload['Valor Recebido'] / payload[0].payload['Meta de Arrecadação']) * 100)}%
                </strong>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="financial-health-card" className="bg-[#1a1210]/95 border border-viking-gold/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute -right-16 -top-16 opacity-[0.03] pointer-events-none">
        <Heart className="w-48 h-48 text-viking-gold animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-viking-gold/15 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-viking-gold">
            <Heart className="w-5 h-5 animate-pulse text-red-500" />
            <h3 className="font-viking-medieval text-xs font-black uppercase tracking-widest">Saúde Financeira do Clã</h3>
          </div>
          <p className="text-white font-viking-display text-lg font-black tracking-wide mt-0.5">Metas vs Arrecadação Mensal</p>
        </div>

        {/* Health status badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider ${healthColor}`}>
          <HealthIcon className="w-4 h-4 shrink-0" />
          <span>Saúde: {healthLabel}</span>
        </div>
      </div>

      {/* Mini Insight Card */}
      <div className="mb-6 p-3.5 rounded-2xl bg-black/30 border border-viking-gold/10 flex items-start gap-3">
        <Coins className="w-5 h-5 text-viking-gold shrink-0 mt-0.5" />
        <p className="text-xs text-viking-silver/90 leading-relaxed uppercase">
          {healthText} Atualmente, o clã arrecadou <span className="text-emerald-400 font-bold">{formatCurrency(receivedTotal)}</span> de um total de <span className="text-white font-bold">{formatCurrency(expectedTotal)}</span> previstos para este ciclo.
        </p>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-[280px] w-full bg-[#120a08]/40 border border-viking-gold/10 rounded-2xl p-3 sm:p-4">
        {expectedTotal === 0 ? (
          <div className="h-full flex items-center justify-center text-viking-silver/60 text-xs">
            Nenhum dado financeiro disponível. Cadastre planos de atletas ativos para visualizar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1e1b" />
              <XAxis 
                dataKey="name" 
                stroke="#a69480" 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                stroke="#a69480" 
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `R$${val}`}
              />
              <Tooltip content={customTooltip} cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                wrapperStyle={{ color: '#a69480', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }} 
              />
              <Bar 
                name="Meta (Esperado)" 
                dataKey="Meta de Arrecadação" 
                fill="#d4af37" 
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-meta-${index}`} fill="#d4af37" fillOpacity={index === 0 ? 0.95 : 0.75} />
                ))}
              </Bar>
              <Bar 
                name="Recebido (Pago)" 
                dataKey="Valor Recebido" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-received-${index}`} fill="#10b981" fillOpacity={index === 0 ? 0.95 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
