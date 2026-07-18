import React, { useState } from 'react';
import { CardioSession, CardioGoal, StudentProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Flame, Target, Plus, Zap } from 'lucide-react';

interface CardioViewProps {
  profile: StudentProfile;
  role: 'student' | 'trainer';
  onAddSession: (session: CardioSession) => void;
  onAddGoal: (goal: CardioGoal) => void;
}

export const CardioView: React.FC<CardioViewProps> = ({ profile, role, onAddSession, onAddGoal }) => {
  const [sessionForm, setSessionForm] = useState<Partial<CardioSession>>({ type: 'running', intensity: 'moderate' });
  const [goalForm, setGoalForm] = useState<Partial<CardioGoal>>({ type: 'running' });

  const cardioData = profile.cardioSessions || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-viking-gold">Cardio & Metas</h2>

      {/* Stats/Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1210] p-4 rounded-xl border border-viking-gold/20">
          <h3 className="text-lg font-bold text-viking-silver mb-4">Volume Cardio (Minutos)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cardioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a3f35" />
              <XAxis dataKey="date" stroke="#e0d3a8" />
              <YAxis stroke="#e0d3a8" />
              <Tooltip contentStyle={{ backgroundColor: '#140e0c' }} />
              <Bar dataKey="durationMinutes" fill="#d4af37" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1210] p-4 rounded-xl border border-viking-gold/20">
          <h3 className="text-lg font-bold text-viking-silver mb-4">Evolução Distância (Km)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cardioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a3f35" />
              <XAxis dataKey="date" stroke="#e0d3a8" />
              <YAxis stroke="#e0d3a8" />
              <Tooltip contentStyle={{ backgroundColor: '#140e0c' }} />
              <Line type="monotone" dataKey="distanceKm" stroke="#d4af37" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forms */}
      <div className="bg-[#1a1210] p-6 rounded-xl border border-viking-gold/20">
        <h3 className="text-lg font-bold text-viking-gold mb-4">Registrar Nova Sessão</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="date" className="bg-[#140e0c] border border-viking-gold/20 p-2 rounded text-white" onChange={e => setSessionForm({...sessionForm, date: e.target.value})} />
          <input type="number" placeholder="Duração (min)" className="bg-[#140e0c] border border-viking-gold/20 p-2 rounded text-white" onChange={e => setSessionForm({...sessionForm, durationMinutes: parseInt(e.target.value)})} />
          <input type="number" placeholder="Distância (km)" className="bg-[#140e0c] border border-viking-gold/20 p-2 rounded text-white" onChange={e => setSessionForm({...sessionForm, distanceKm: parseFloat(e.target.value)})} />
          <button onClick={() => sessionForm.date && sessionForm.durationMinutes && onAddSession(sessionForm as CardioSession)} className="bg-viking-gold text-viking-dark font-bold py-2 px-4 rounded">Registrar</button>
        </div>
      </div>

      {role === 'trainer' && (
        <div className="bg-[#1a1210] p-6 rounded-xl border border-viking-gold/20">
          <h3 className="text-lg font-bold text-viking-gold mb-4">Prescrever Nova Meta</h3>
          <div className="grid grid-cols-2 gap-4">
             <select className="bg-[#140e0c] border border-viking-gold/20 p-2 rounded text-white" onChange={e => setGoalForm({...goalForm, type: e.target.value as any})}>
               <option value="running">Corrida</option>
               <option value="cycling">Ciclismo</option>
             </select>
             <input type="number" placeholder="Meta Distância (km)" className="bg-[#140e0c] border border-viking-gold/20 p-2 rounded text-white" onChange={e => setGoalForm({...goalForm, targetDistanceKm: parseFloat(e.target.value)})} />
             <button onClick={() => goalForm.type && onAddGoal(goalForm as CardioGoal)} className="bg-viking-gold text-viking-dark font-bold py-2 px-4 rounded">Definir Meta</button>
          </div>
        </div>
      )}
    </div>
  );
};
