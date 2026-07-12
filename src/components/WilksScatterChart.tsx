import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Label
} from 'recharts';
import { GymLeaderboardEntry } from '../types';
import { Scale, Trophy, Flame, TrendingUp } from 'lucide-react';

interface WilksScatterChartProps {
  entries: GymLeaderboardEntry[];
}

export default function WilksScatterChart({ entries }: WilksScatterChartProps) {
  // Filter out any entries without bodyWeight or total
  const data = entries.map(entry => ({
    name: entry.name,
    weight: entry.bodyWeight || 80,
    wilks: entry.wilks || 0,
    total: entry.total || 0,
    gender: entry.gender,
    genderLabel: entry.gender === 'female' ? 'Valquíria' : 'Viking'
  }));

  // Find insights safely
  const highestWilks = data.length > 0 
    ? data.reduce((max, current) => current.wilks > max.wilks ? current : max, { name: 'Nenhum', wilks: 0, weight: 0 })
    : { name: 'Nenhum', wilks: 0, weight: 0 };

  const lowestWeight = data.length > 0
    ? data.reduce((min, current) => current.weight < min.weight ? current : min, { name: 'Nenhum', wilks: 0, weight: Infinity })
    : { name: 'Nenhum', wilks: 0, weight: 0 };

  const highestWeight = data.length > 0
    ? data.reduce((max, current) => current.weight > max.weight ? current : max, { name: 'Nenhum', wilks: 0, weight: 0 })
    : { name: 'Nenhum', wilks: 0, weight: 0 };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className="bg-[#140e0c]/98 border border-viking-gold/30 rounded-xl p-4 shadow-xl backdrop-blur-md text-[#e0d3a8] text-xs">
          <p className="font-bold text-white text-sm border-b border-viking-gold/20 pb-1.5 mb-2 flex items-center gap-1.5">
            ⚔️ {info.name} <span className="text-[10px] text-viking-gold uppercase px-1.5 py-0.5 bg-viking-gold/10 rounded border border-viking-gold/20 font-viking-medieval">{info.genderLabel}</span>
          </p>
          <div className="space-y-1">
            <p className="flex justify-between gap-6">
              <span className="text-viking-silver/80">Peso Corporal:</span>
              <strong className="text-white font-mono">{info.weight.toFixed(1)} kg</strong>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-viking-silver/80">Total SBD:</span>
              <strong className="text-white font-mono">{info.total} kg</strong>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-viking-silver/80">Pontuação Wilks:</span>
              <strong className="text-viking-gold font-mono">{info.wilks.toFixed(1)}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="wilks-scatter-chart-card" className="bg-[#1a1210]/90 border border-viking-gold/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
      <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none">
        <Scale className="w-64 h-64 text-viking-gold" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-viking-gold/15">
        <div>
          <h3 className="font-viking-display text-lg font-bold text-viking-gold flex items-center gap-2 uppercase tracking-wide">
            <TrendingUp className="w-5 h-5" /> Eficiência de Força: Peso Corporal vs. Wilks
          </h3>
          <p className="text-xs text-viking-silver mt-1">
            Guerreiros mais ao topo esquerdo demonstram alta força relativa (mais eficiência por quilo de peso).
          </p>
        </div>
      </div>

      {/* Insight mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 bg-viking-gold/5 border border-viking-gold/15 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-viking-gold/10 flex items-center justify-center border border-viking-gold/20">
            <Trophy className="w-4 h-4 text-viking-gold" />
          </div>
          <div>
            <p className="text-[10px] text-viking-silver uppercase font-viking-medieval">Maior Força Relativa</p>
            <p className="text-xs font-bold text-white mt-0.5">{highestWilks.name} ({highestWilks.wilks.toFixed(1)} Wilks)</p>
          </div>
        </div>
        <div className="p-3.5 bg-viking-silver/5 border border-viking-silver/15 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-viking-silver/10 flex items-center justify-center border border-viking-silver/20">
            <Scale className="w-4 h-4 text-viking-silver" />
          </div>
          <div>
            <p className="text-[10px] text-viking-silver uppercase font-viking-medieval">Mais Leve do Clã</p>
            <p className="text-xs font-bold text-white mt-0.5">{lowestWeight.name} ({lowestWeight.weight.toFixed(1)} kg)</p>
          </div>
        </div>
        <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-viking-silver uppercase font-viking-medieval">Mais Pesado do Clã</p>
            <p className="text-xs font-bold text-white mt-0.5">{highestWeight.name} ({highestWeight.weight.toFixed(1)} kg)</p>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[350px] w-full bg-[#120a08]/40 border border-viking-gold/10 rounded-2xl p-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-viking-silver/60 text-xs">
            Nenhum guerreiro cadastrado com dados suficientes ainda.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1e1b" />
              <XAxis 
                type="number" 
                dataKey="weight" 
                name="Peso Corporal" 
                unit="kg" 
                stroke="#a69480"
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              >
                <Label value="Peso Corporal (kg)" offset={-10} position="insideBottom" fill="#a69480" fontSize={11} className="font-bold" />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="wilks" 
                name="Pontuação Wilks" 
                stroke="#a69480"
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 20', 'dataMax + 20']}
              >
                <Label value="Pontuação Wilks" angle={-90} position="insideLeft" offset={0} fill="#a69480" fontSize={11} className="font-bold" />
              </YAxis>
              <ZAxis type="number" range={[100, 100]} />
              <Tooltip content={customTooltip} cursor={{ strokeDasharray: '3 3', stroke: '#d4af37' }} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                wrapperStyle={{ color: '#a69480', fontSize: '11px', textTransform: 'uppercase' }} 
              />
              <Scatter 
                name="Valquírias" 
                data={data.filter(d => d.gender === 'female')} 
                fill="#f472b6" 
                shape="circle" 
              >
                {data.filter(d => d.gender === 'female').map((entry, index) => (
                  <Cell key={`cell-f-${index}`} fill="#f472b6" stroke="#f472b6" strokeWidth={1} fillOpacity={0.8} />
                ))}
              </Scatter>
              <Scatter 
                name="Vikings" 
                data={data.filter(d => d.gender !== 'female')} 
                fill="#d4af37" 
                shape="circle" 
              >
                {data.filter(d => d.gender !== 'female').map((entry, index) => (
                  <Cell key={`cell-m-${index}`} fill="#d4af37" stroke="#d4af37" strokeWidth={1} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
