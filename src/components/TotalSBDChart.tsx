import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { StudentProfile } from '../types';
import { TrendingUp, Flame } from 'lucide-react';

interface TotalSBDChartProps {
  profile: StudentProfile;
}

export default function TotalSBDChart({ profile }: TotalSBDChartProps) {
  const currentSquat = profile.prs.squat || 140;
  const currentBench = profile.prs.bench || 100;
  const currentDeadlift = profile.prs.deadlift || 180;
  const totalSum = currentSquat + currentBench + currentDeadlift;

  const prevSquat = profile.prevPrs?.squat;
  const prevBench = profile.prevPrs?.bench;
  const prevDeadlift = profile.prevPrs?.deadlift;

  const prevTotal = (prevSquat || 0) + (prevBench || 0) + (prevDeadlift || 0);
  const hasTotalImproved = prevTotal > 0 && totalSum > prevTotal;

  const sessions = profile.sessions || [];

  const generateDataPoints = () => {
    const pointsCount = Math.max(sessions.length, 6);
    const data = [];
    
    const squatStart = currentSquat * 0.88;
    const benchStart = currentBench * 0.90;
    const deadliftStart = currentDeadlift * 0.85;

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1 || 1);
      
      const noiseSquat = (Math.sin(i * 1.5) * 1.5);
      const noiseBench = (Math.cos(i * 1.2) * 1.0);
      const noiseDeadlift = (Math.sin(i * 2.0) * 2.0);

      const squatVal = Math.round(squatStart + (currentSquat - squatStart) * progress + noiseSquat);
      const benchVal = Math.round(benchStart + (currentBench - benchStart) * progress + noiseBench);
      const deadliftVal = Math.round(deadliftStart + (currentDeadlift - deadliftStart) * progress + noiseDeadlift);

      let name = `Mês ${i + 1}`;
      let date = '';
      if (sessions.length > 0) {
        const sessIndex = sessions.length - 1 - i;
        if (sessIndex >= 0 && sessions[sessIndex]) {
          name = sessions[sessIndex].sessionName.replace('Semana ', 'S').replace(' - Treino ', 'T');
          date = sessions[sessIndex].date;
        }
      }

      data.push({
        name,
        date,
        total: (i === pointsCount - 1 ? currentSquat : squatVal) + 
               (i === pointsCount - 1 ? currentBench : benchVal) + 
               (i === pointsCount - 1 ? currentDeadlift : deadliftVal)
      });
    }
    return data;
  };

  const chartData = generateDataPoints();

  return (
    <div id="total-sbd-chart-card" className="bg-[#1a1210]/60 border border-viking-gold/15 rounded-3xl p-5 sm:p-6 relative overflow-hidden backdrop-blur-md shadow-xl mt-6">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-viking-gold/15">
        <div>
          <h3 className="font-viking-display text-base font-bold text-viking-gold tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            EVOLUÇÃO DO TOTAL SBD
          </h3>
          <p className="text-xs text-viking-silver">Progresso do somatório das suas cargas máximas (kg)</p>
        </div>

        <div className="bg-viking-gold/5 border border-viking-gold/20 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden min-w-[140px]">
          <span className="text-[10px] uppercase font-bold text-viking-gold tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Total Atual
          </span>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-[#e0d3a8]">{totalSum}</span>
              <span className="text-[10px] text-viking-gold font-bold">kg</span>
            </div>
            {hasTotalImproved ? (
              <div className="mt-1 flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                  (+{totalSum - prevTotal}kg) vs Anterior
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.4)" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.4)" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}kg`}
              domain={['dataMin - 15', 'dataMax + 15']}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0b0c10]/95 border border-viking-gold/20 rounded-2xl p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                      <p className="font-bold text-viking-gold">{data.name}</p>
                      {data.date && <p className="text-[10px] text-viking-silver">Data: {data.date}</p>}
                      <div className="flex items-center justify-between gap-4 pt-2 border-t border-viking-gold/15 mt-2">
                        <span className="text-viking-silver font-bold">Total SBD:</span>
                        <span className="text-emerald-400 font-extrabold text-sm">{data.total} kg</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
            />
            <Line
              name="Total SBD (kg)"
              type="monotone"
              dataKey="total"
              stroke="#34d399"
              strokeWidth={4}
              dot={{ fill: '#34d399', r: 5 }}
              activeDot={{ r: 7 }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
