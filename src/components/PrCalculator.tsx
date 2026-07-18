import React, { useState } from 'react';
import { Calculator, Target, Trophy } from 'lucide-react';
import { StudentProfile } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PrCalculatorProps {
  profile: StudentProfile;
}

const calculateWilks = (gender: 'male' | 'female', bw: number, totalSBD: number): number => {
  if (!bw || !totalSBD) return 0;
  const x = bw;
  let a, b, c, d, e, f;
  if (gender === 'female') {
    a = 594.17;
    b = -27.23806;
    c = 0.821122;
    d = -0.009307339;
    e = 0.00004731582;
    f = -0.00000009054;
  } else {
    // male
    a = -216.0475144;
    b = 16.2606339;
    c = -0.002388645;
    d = -0.00113732;
    e = 0.00000701863;
    f = -0.00000001291;
  }
  const denom = a + b*x + c*Math.pow(x, 2) + d*Math.pow(x, 3) + e*Math.pow(x, 4) + f*Math.pow(x, 5);
  if (denom === 0) return 0;
  const coeff = 500 / denom;
  return Math.round(totalSBD * coeff * 10) / 10;
};

export const PrCalculator: React.FC<PrCalculatorProps> = ({ profile }) => {
  const [customRM, setCustomRM] = useState<number>(100);
  const [selectedLift, setSelectedLift] = useState<'squat' | 'bench' | 'deadlift' | 'custom'>('squat');
  
  const [targetPercentage, setTargetPercentage] = useState<number>(80);

  const getBaseWeight = () => {
    switch (selectedLift) {
      case 'squat': return profile.prs.squat || 0;
      case 'bench': return profile.prs.bench || 0;
      case 'deadlift': return profile.prs.deadlift || 0;
      case 'custom': return customRM;
      default: return 0;
    }
  };

  const baseWeight = getBaseWeight();
  const calculatedWeight = (baseWeight * (targetPercentage / 100)).toFixed(1);

  const quickPercentages = [50, 60, 70, 75, 80, 85, 90, 95];
  
  const fullTablePercentages = [
    50, 55, 60, 65, 70, 75, 80, 82.5, 85, 87.5, 90, 92.5, 95, 97.5, 100, 105, 110
  ];

  // Wilks calculation for chart
  const currentTotal = (profile.prs.squat || 0) + (profile.prs.bench || 0) + (profile.prs.deadlift || 0);
  const currentWilks = calculateWilks(profile.gender || 'male', profile.bodyWeight || 80, currentTotal);
  
  let historyPoints: { name: string; Wilks: number }[] = [];

  // 1. Add prevPrs as the first baseline point
  if (profile.prevPrs) {
    const pTotal = (profile.prevPrs.squat || 0) + (profile.prevPrs.bench || 0) + (profile.prevPrs.deadlift || 0);
    if (pTotal > 0) {
      historyPoints.push({
        name: 'Base',
        Wilks: calculateWilks(profile.gender || 'male', profile.bodyWeight || 80, pTotal)
      });
    }
  }

  // 2. Add points from session history
  if (profile.sessions && profile.sessions.length > 0) {
    const sortedSessions = [...profile.sessions].sort((a, b) => {
      const [dA, mA, yA] = a.date.split('/');
      const [dB, mB, yB] = b.date.split('/');
      return new Date(Number(yA), Number(mA)-1, Number(dA)).getTime() - new Date(Number(yB), Number(mB)-1, Number(dB)).getTime();
    });

    sortedSessions.forEach(session => {
      if (session.prsAtSession) {
        const sTotal = (session.prsAtSession.squat || 0) + (session.prsAtSession.bench || 0) + (session.prsAtSession.deadlift || 0);
        if (sTotal > 0) {
          const w = calculateWilks(profile.gender || 'male', profile.bodyWeight || 80, sTotal);
          historyPoints.push({
            name: session.date.substring(0, 5), // DD/MM
            Wilks: w
          });
        }
      }
    });
  }

  // 3. Add current PRs as the final point
  if (currentTotal > 0) {
    historyPoints.push({
      name: 'Atual',
      Wilks: currentWilks
    });
  }

  // 4. Filter to keep only unique sequential values to show actual progression steps
  let uniqueProgression: { name: string; Wilks: number }[] = [];
  for (const pt of historyPoints) {
    if (uniqueProgression.length === 0 || uniqueProgression[uniqueProgression.length - 1].Wilks !== pt.Wilks) {
      uniqueProgression.push(pt);
    } else {
      // Update name to latest date for this score if it's the same score
      uniqueProgression[uniqueProgression.length - 1].name = pt.name;
    }
  }

  // If there is only one point in the progression (meaning no evolution yet), 
  // duplicate it so the line chart can render a flat line.
  if (uniqueProgression.length === 1) {
    uniqueProgression.unshift({ name: 'Início', Wilks: uniqueProgression[0].Wilks });
  }

  // Get the last 5 points
  const chartData = uniqueProgression.slice(-5);
  const hasHistory = chartData.length > 0;

  return (
    <div className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-5 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-viking-gold/10 text-viking-gold">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-viking-gold font-viking-display uppercase tracking-widest">
            Calculadora de Porcentagens
          </h2>
          <p className="text-sm text-viking-silver">
            Calcule as cargas de treino baseado no seu 1RM.
          </p>
        </div>
      </div>

      {/* Base Weight Selection */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="flex-1">
          <label className="block text-xs font-bold text-viking-silver uppercase mb-2">Exercício Base (100%)</label>
          <select 
            value={selectedLift}
            onChange={(e) => setSelectedLift(e.target.value as any)}
            className="w-full bg-[#0d0908]/80 text-[#e0d3a8] px-4 py-3 rounded-xl border border-viking-gold/20 focus:outline-none focus:border-viking-gold appearance-none font-bold"
          >
            <option value="squat">Agachamento (Squat) - {profile.prs.squat || 0}kg</option>
            <option value="bench">Supino (Bench) - {profile.prs.bench || 0}kg</option>
            <option value="deadlift">Levantamento Terra (Deadlift) - {profile.prs.deadlift || 0}kg</option>
            <option value="custom">Personalizado (Custom)</option>
          </select>
        </div>

        {selectedLift === 'custom' && (
          <div className="flex-1">
            <label className="block text-xs font-bold text-viking-silver uppercase mb-2">1RM Personalizado (kg)</label>
            <input 
              type="number" 
              value={customRM || ''}
              onChange={(e) => setCustomRM(Number(e.target.value))}
              min="0"
              className="w-full bg-[#0d0908]/80 text-[#e0d3a8] px-4 py-3 rounded-xl border border-viking-gold/20 focus:outline-none focus:border-viking-gold font-bold"
            />
          </div>
        )}
      </div>

      {/* Quick Calculator Section */}
      <div className="bg-[#0f0a08]/80 p-5 sm:p-6 rounded-2xl border border-viking-gold/15 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full space-y-4">
            <h3 className="text-sm font-bold text-viking-gold uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" /> Alvo Específico
            </h3>
            
            {/* Quick Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickPercentages.map(p => (
                <button
                  key={p}
                  onClick={() => setTargetPercentage(p)}
                  className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                    targetPercentage === p
                      ? 'bg-viking-gold text-viking-dark border-viking-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      : 'bg-viking-gold/5 text-viking-silver border-viking-gold/20 hover:border-viking-gold/50'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>

            {/* Custom Percentage */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-viking-silver uppercase">Ou digite:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={targetPercentage || ''}
                  onChange={(e) => setTargetPercentage(Number(e.target.value))}
                  min="0"
                  max="200"
                  className="w-full bg-[#1a1210] text-[#e0d3a8] px-4 py-2.5 rounded-xl border border-viking-gold/20 focus:outline-none focus:border-viking-gold font-bold"
                  placeholder="Ex: 82.5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-viking-silver font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Result Display */}
          <div className="bg-gradient-to-br from-viking-gold/10 to-transparent p-6 rounded-2xl border border-viking-gold/30 min-w-[180px] flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            <span className="text-xs font-black text-viking-silver uppercase tracking-widest mb-1">
              {targetPercentage}% de {baseWeight}kg
            </span>
            <div className="text-4xl font-black text-viking-gold font-viking-display">
              {calculatedWeight}
            </div>
            <span className="text-xs text-viking-silver font-bold uppercase mt-1">
              Quilos
            </span>
          </div>
        </div>
      </div>

      {/* Full Table */}
      <div className="bg-[#0f0a08]/80 p-4 sm:p-6 rounded-2xl border border-viking-gold/15">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-viking-gold uppercase tracking-widest">Tabela de Referência</h3>
          <div className="text-xs font-black bg-viking-gold/10 text-viking-gold px-3 py-1.5 rounded-lg border border-viking-gold/20">
            BASE: {baseWeight}kg
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
          {fullTablePercentages.map(p => {
            const weight = (baseWeight * (p / 100)).toFixed(1);
            const isHeavy = p >= 90;
            const isTarget = p === targetPercentage;
            
            return (
              <div 
                key={p} 
                onClick={() => setTargetPercentage(p)}
                className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 ${
                  isTarget
                    ? 'bg-viking-gold text-viking-dark border-viking-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                    : isHeavy 
                      ? 'bg-red-900/10 border-red-500/30' 
                      : 'bg-viking-gold/5 border-viking-gold/10'
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-black mb-1 ${isTarget ? 'text-viking-dark' : isHeavy ? 'text-red-400' : 'text-viking-silver'}`}>
                  {p}%
                </span>
                <span className={`text-sm sm:text-lg font-black ${isTarget ? 'text-viking-dark' : isHeavy ? 'text-white' : 'text-viking-gold'}`}>
                  {weight} <span className="text-[9px] sm:text-[10px] opacity-70">kg</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wilks Chart */}
      <div className="bg-[#0f0a08]/80 p-4 sm:p-6 rounded-2xl border border-viking-gold/15">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-viking-gold" />
            <h3 className="text-sm font-bold text-viking-gold uppercase tracking-widest">Evolução Wilks</h3>
          </div>
          <div className="text-xs font-black bg-viking-gold/10 text-viking-gold px-3 py-1.5 rounded-lg border border-viking-gold/20">
            PONTUAÇÃO ATUAL: {currentWilks}
          </div>
        </div>
        
        {hasHistory ? (
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#e0d3a8', fontSize: 12, fontWeight: 'bold' }} 
                  axisLine={{ stroke: 'rgba(212,175,55,0.2)' }}
                  tickLine={false}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1210', 
                    borderColor: 'rgba(212,175,55,0.3)',
                    borderRadius: '12px',
                    color: '#e0d3a8',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Wilks" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  dot={{ fill: '#1a1210', stroke: '#d4af37', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#d4af37', stroke: '#1a1210', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-viking-gold/20 rounded-xl bg-viking-gold/5">
            <p className="text-sm text-viking-silver">Seu primeiro registro de PRs servirá como base.</p>
            <p className="text-xs text-viking-silver/60 mt-1">Atualize seus PRs no futuro para ver sua evolução.</p>
          </div>
        )}
      </div>

    </div>
  );
};
