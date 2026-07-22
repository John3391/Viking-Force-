import React from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  Phone,
  Flame,
  ShieldCheck,
  UserX,
  Zap,
  BellRing
} from "lucide-react";
import { StudentProfile } from "../types";

interface InactiveStudentsAlertProps {
  studentsData: Record<string, StudentProfile>;
  onMotivateStudent: (email: string, name: string) => void;
  showToast?: (msg: string, type: "success" | "error" | "info") => void;
}

export interface InactiveStudentInfo {
  email: string;
  profile: StudentProfile;
  daysInactive: number;
  lastSessionDateStr: string;
}

export default function InactiveStudentsAlert({
  studentsData,
  onMotivateStudent,
  showToast
}: InactiveStudentsAlertProps) {
  // Compute inactive students (> 3 days without workouts)
  const inactiveStudents: InactiveStudentInfo[] = React.useMemo(() => {
    const now = new Date();
    const todayMs = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const list: InactiveStudentInfo[] = [];

    Object.keys(studentsData).forEach((email) => {
      const student = studentsData[email];
      if (!student) return;

      const sessions = student.sessions || [];
      let latestTimestamp = 0;
      let lastSessionDateStr = "Nenhum registro";

      if (sessions.length > 0) {
        sessions.forEach((s) => {
          if (!s.date) return;
          const d = new Date(s.date);
          if (!isNaN(d.getTime()) && d.getTime() > latestTimestamp) {
            latestTimestamp = d.getTime();
            lastSessionDateStr = s.date;
          }
        });
      }

      let daysInactive = 999;
      if (latestTimestamp > 0) {
        const lastDateObj = new Date(latestTimestamp);
        const lastMs = new Date(
          lastDateObj.getFullYear(),
          lastDateObj.getMonth(),
          lastDateObj.getDate()
        ).getTime();
        daysInactive = Math.floor((todayMs - lastMs) / (1000 * 60 * 60 * 24));
      } else if (student.createdAt) {
        const createdDate = new Date(student.createdAt);
        if (!isNaN(createdDate.getTime())) {
          daysInactive = Math.floor(
            (todayMs - createdDate.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      }

      // Filter students with strictly more than 3 days of inactivity
      if (daysInactive > 3) {
        list.push({
          email,
          profile: { ...student, email },
          daysInactive: Math.max(0, daysInactive),
          lastSessionDateStr
        });
      }
    });

    // Sort by daysInactive descending
    list.sort((a, b) => b.daysInactive - a.daysInactive);

    // Limit to top 5
    return list.slice(0, 5);
  }, [studentsData]);

  if (inactiveStudents.length === 0) {
    return (
      <div className="bg-[#1a1210]/90 border border-emerald-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-viking-display text-sm sm:text-base font-black text-white tracking-wider flex items-center gap-2 uppercase">
              ⚡ Gladiadores em Ação Total
            </h3>
            <p className="text-viking-silver/80 text-xs mt-0.5">
              Todos os atletas ativos registraram treinos nos últimos 3 dias. A disciplina reina no salão!
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shrink-0">
          100% Engajados
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1210]/95 border border-red-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md space-y-5"
    >
      {/* Background Decorative Accent */}
      <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
        <UserX className="w-64 h-64 text-red-500" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/20 pb-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 shrink-0 relative">
            <UserX className="w-6 h-6 animate-pulse text-red-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-viking-display text-base sm:text-lg font-black text-white tracking-wider uppercase flex items-center gap-2">
                ⚠️ Alerta de Inatividade (&gt; 3 Dias Sem Treino)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black font-mono">
                {inactiveStudents.length} {inactiveStudents.length === 1 ? "Atleta" : "Atletas"}
              </span>
            </div>
            <p className="text-viking-silver/80 text-xs mt-1 leading-relaxed">
              Os 5 gladiadores mais distantes do salão de treino. Entre em contato para resgatar a motivação antes do destreino.
            </p>
          </div>
        </div>
      </div>

      {/* List of 5 Inactive Students */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {inactiveStudents.map(({ email, profile, daysInactive, lastSessionDateStr }) => {
          const formattedLastDate =
            lastSessionDateStr !== "Nenhum registro"
              ? new Date(lastSessionDateStr).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit"
                })
              : "Sem registros";

          return (
            <div
              key={profile.email}
              className="bg-[#140e0c]/90 border border-red-500/20 hover:border-red-500/40 p-3.5 rounded-2xl flex flex-col justify-between transition-all duration-200 group hover:shadow-[0_4px_20px_rgba(239,68,68,0.15)] relative overflow-hidden"
            >
              {/* Top Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-amber-600" />

              <div>
                {/* Student Avatar & Name */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-500/30 overflow-hidden shrink-0 flex items-center justify-center font-black text-red-400 text-sm font-viking-display shadow-md">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white truncate group-hover:text-red-300 transition-colors uppercase">
                      {profile.name}
                    </h4>
                    <span className="text-[9px] font-bold text-viking-silver/60 uppercase block truncate">
                      {profile.plan || "Atleta"}
                    </span>
                  </div>
                </div>

                {/* Days Inactive Tag */}
                <div className="bg-red-950/60 border border-red-500/30 p-2 rounded-xl mb-3 text-center">
                  <span className="text-[10px] text-red-300 font-bold uppercase block tracking-wider">
                    {daysInactive >= 999
                      ? "Nenhum Treino"
                      : `${daysInactive} dias inativo`}
                  </span>
                  <div className="flex items-center justify-center gap-1 text-[9px] text-viking-silver/70 font-mono mt-0.5">
                    <Clock className="w-3 h-3 text-red-400" />
                    <span>Último: {formattedLastDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Motivate */}
              <button
                onClick={() => onMotivateStudent(profile.email, profile.name)}
                className="w-full py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>Motivar Atleta</span>
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
