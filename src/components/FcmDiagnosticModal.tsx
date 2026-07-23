// src/components/FcmDiagnosticModal.tsx - Diagnostic & FCM Token Expiration Monitor Modal for Trainer
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Bell,
  Zap,
  Users,
  Search,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Send,
  RefreshCw,
  Copy,
  Info,
  Clock,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StudentProfile } from "../types";
import { publishWorkoutFcmNotification, playVikingHornSound } from "../fcm";

interface FcmDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsData: Record<string, StudentProfile>;
  onUpdateStudent: (studentEmail: string, updatedProfile: StudentProfile) => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export function FcmDiagnosticModal({
  isOpen,
  onClose,
  studentsData,
  onUpdateStudent,
  showToast,
}: FcmDiagnosticModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired" | "missing" | "error">("all");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({});

  const ITEMS_PER_PAGE = 6;

  // Reset page on filter or search change
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: "all" | "active" | "expired" | "missing" | "error") => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  const activeStudents = Object.entries(studentsData).filter(
    ([_, s]) => !s.isDeleted
  );

  // High-level diagnostic stats
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const totalCount = activeStudents.length;

  const activeTokenCount = activeStudents.filter(([_, s]) => {
    return (
      s.fcmToken &&
      s.fcmEnabled !== false &&
      (!s.fcmTokenUpdatedAt || now - s.fcmTokenUpdatedAt <= THIRTY_DAYS_MS)
    );
  }).length;

  const expiredTokenCount = activeStudents.filter(([_, s]) => {
    return (
      s.fcmToken &&
      s.fcmTokenUpdatedAt &&
      now - s.fcmTokenUpdatedAt > THIRTY_DAYS_MS
    );
  }).length;

  const missingTokenCount = activeStudents.filter(([_, s]) => {
    return !s.fcmToken || s.fcmEnabled === false;
  }).length;

  const errorCount = activeStudents.filter(([_, s]) => {
    return (s.fcmPushErrors && s.fcmPushErrors.length > 0) || !s.fcmToken;
  }).length;

  // Filtered student list
  const filteredStudents = activeStudents.filter(([email, student]) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      student.name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      (student.plan && student.plan.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    const hasToken = !!student.fcmToken && student.fcmEnabled !== false;
    const isExpired =
      hasToken &&
      student.fcmTokenUpdatedAt &&
      now - student.fcmTokenUpdatedAt > THIRTY_DAYS_MS;
    const hasError = (student.fcmPushErrors && student.fcmPushErrors.length > 0) || !hasToken;

    if (filterStatus === "active") return hasToken && !isExpired;
    if (filterStatus === "expired") return isExpired;
    if (filterStatus === "missing") return !hasToken;
    if (filterStatus === "error") return hasError;

    return true;
  });

  // Helper to format timestamps nicely
  const formatTimestamp = (ts?: number) => {
    if (!ts) return "Desconhecido";
    const date = new Date(ts);
    const daysAgo = Math.floor((now - ts) / (24 * 60 * 60 * 1000));
    if (daysAgo === 0) return `Hoje às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    if (daysAgo === 1) return `Ontem às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    if (daysAgo < 30) return `há ${daysAgo} dias`;
    return date.toLocaleDateString("pt-BR");
  };

  // Dispatch Test Push to specific student
  const handleSendTestPush = async (email: string, studentName: string) => {
    try {
      playVikingHornSound();
      await publishWorkoutFcmNotification(
        email,
        "Diagnóstico de Teste FCM",
        undefined,
        undefined,
        studentsData[email.toLowerCase()]
      );
      showToast(`📯 Push de teste enviado para ${studentName}!`, "success");
    } catch (err) {
      showToast(`Falha ao disparar push de teste: ${err}`, "error");
    }
  };

  // Send Push Activation Notification request to student
  const handleRequestPushActivation = (email: string, student: StudentProfile) => {
    const cleanEmail = email.toLowerCase().trim();
    const existingNotifs = student.notifications || [];
    const newNotif = {
      id: `notif_fcm_req_${Date.now()}`,
      message: `⚔️ SOLICITAÇÃO DO TREINADOR: Ative suas Notificações Push FCM para receber avisos instantâneos de novos treinos em seu aparelho!`,
      date: new Date().toLocaleDateString("pt-BR"),
      read: false,
      type: "warning" as const,
    };

    const updatedProfile = {
      ...student,
      notifications: [newNotif, ...existingNotifs],
    };

    onUpdateStudent(cleanEmail, updatedProfile);
    showToast(`Solicitação de ativação enviada para ${student.name}!`, "info");
  };

  // Batch request push activation for all students without active tokens
  const handleBatchRequestPushActivation = () => {
    const missingStudents = activeStudents.filter(([_, s]) => !s.fcmToken || s.fcmEnabled === false);
    if (missingStudents.length === 0) {
      showToast("Todos os atletas já possuem token FCM registrado!", "info");
      return;
    }

    missingStudents.forEach(([email, student]) => {
      handleRequestPushActivation(email, student);
    });

    showToast(`Solicitação em massa enviada para ${missingStudents.length} atletas sem token!`, "success");
  };

  // Clear push error history for student
  const handleClearErrors = (email: string, student: StudentProfile) => {
    const cleanEmail = email.toLowerCase().trim();
    const updatedProfile = {
      ...student,
      fcmPushErrors: [],
    };
    onUpdateStudent(cleanEmail, updatedProfile);
    showToast(`Histórico de erros limpo para ${student.name}!`, "success");
  };

  // Remove FCM Token for student (clears expired or problematic tokens)
  const handleRemoveToken = (email: string, student: StudentProfile) => {
    const cleanEmail = email.toLowerCase().trim();
    const updatedProfile = {
      ...student,
      fcmToken: undefined,
      fcmEnabled: false,
      fcmTokenUpdatedAt: undefined,
      fcmPushErrors: [],
    };
    onUpdateStudent(cleanEmail, updatedProfile);
    showToast(`Token FCM do atleta ${student.name} foi removido com sucesso!`, "warning");
  };

  // Clear all errors and reset expired tokens across all students
  const handleClearAllErrors = () => {
    let cleanedErrorCount = 0;
    let cleanedExpiredTokensCount = 0;

    Object.entries(studentsData).forEach(([email, student]) => {
      const cleanEmail = email.toLowerCase().trim();
      const hasErrors = student.fcmPushErrors && student.fcmPushErrors.length > 0;
      const isExpired =
        !!student.fcmToken &&
        !!student.fcmTokenUpdatedAt &&
        now - student.fcmTokenUpdatedAt > THIRTY_DAYS_MS;

      if (hasErrors || isExpired) {
        if (hasErrors) cleanedErrorCount++;
        if (isExpired) cleanedExpiredTokensCount++;

        const updated = {
          ...student,
          fcmPushErrors: [],
          ...(isExpired ? { fcmEnabled: false, fcmTokenUpdatedAt: undefined } : {}),
        };
        onUpdateStudent(cleanEmail, updated);
      }
    });

    if (cleanedErrorCount > 0 || cleanedExpiredTokensCount > 0) {
      showToast(
        `Manutenção de erros concluída! Erros limpos em ${cleanedErrorCount} atleta(s) e ${cleanedExpiredTokensCount} token(s) expirados removidos.`,
        "success"
      );
    } else {
      showToast("Nenhum erro registrado ou token expirado encontrado para limpar.", "info");
    }
  };

  // Pagination math
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
        <motion.div
          id="fcmDiagnosticModal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#120c0a] border-2 border-viking-gold/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(212,175,55,0.2)] overflow-hidden relative"
        >
          {/* Header */}
          <div className="modal-header p-4 sm:p-5 bg-gradient-to-r from-viking-dark via-[#1e1411] to-viking-dark border-b border-viking-gold/30 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-viking-gold/20 text-viking-gold border border-viking-gold/40 shadow-inner">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase text-viking-gold font-viking-display tracking-wider flex items-center gap-2">
                  <span>Diagnóstico FCM & Monitor de Tokens Push</span>
                  <span className="text-[10px] bg-viking-gold/20 text-viking-gold border border-viking-gold/40 px-2 py-0.5 rounded-full font-mono">
                    Painel do Treinador
                  </span>
                </h3>
                <p className="text-xs text-viking-silver/80 mt-0.5">
                  Identifique tokens expirados, ausentes ou com erros de entrega para cada atleta.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAllErrors}
                className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-100 border border-red-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Limpar todos os registros de erros de entrega e resetar tokens expirados da guilda"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Limpar Todos os Erros</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-black/40 hover:bg-viking-gold/20 text-viking-silver hover:text-viking-gold transition-colors border border-viking-gold/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Diagnostic Metrics Cards Grid */}
          <div className="p-4 sm:p-5 bg-[#18100d]/90 border-b border-viking-gold/20 grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
            <div className="p-3 rounded-2xl bg-black/50 border border-viking-gold/20 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-viking-silver/70 flex items-center gap-1">
                <Users className="w-3 h-3 text-viking-gold" /> Total Atletas
              </span>
              <span className="text-xl font-black text-white mt-1 font-mono">
                {totalCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-green-950/30 border border-green-500/30 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" /> Tokens Ativos
              </span>
              <span className="text-xl font-black text-green-400 mt-1 font-mono">
                {activeTokenCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Expirando (&gt;30d)
              </span>
              <span className="text-xl font-black text-amber-400 mt-1 font-mono">
                {expiredTokenCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" /> Sem Token
              </span>
              <span className="text-xl font-black text-red-400 mt-1 font-mono">
                {missingTokenCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-purple-300 flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-300" /> Com Alerta/Erro
              </span>
              <span className="text-xl font-black text-purple-300 mt-1 font-mono">
                {errorCount}
              </span>
            </div>
          </div>

          {/* Search Bar & Filters & Batch Actions */}
          <div className="p-4 bg-[#140d0a] border-b border-viking-gold/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-viking-gold/60" />
              <input
                type="text"
                placeholder="Buscar atleta por nome, e-mail ou plano..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-black/60 text-viking-silver border border-viking-gold/30 focus:border-viking-gold rounded-xl pl-9 pr-3 py-2 text-xs font-medium placeholder-viking-silver/40 outline-none"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  filterStatus === "all"
                    ? "bg-viking-gold/25 border-viking-gold text-viking-gold"
                    : "bg-black/40 border-viking-gold/20 text-viking-silver/70 hover:text-viking-gold"
                }`}
              >
                Todos ({totalCount})
              </button>
              <button
                onClick={() => handleFilterChange("active")}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  filterStatus === "active"
                    ? "bg-green-500/30 border-green-500 text-green-300"
                    : "bg-black/40 border-green-500/20 text-viking-silver/70 hover:text-green-400"
                }`}
              >
                Ativos ({activeTokenCount})
              </button>
              <button
                onClick={() => handleFilterChange("expired")}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  filterStatus === "expired"
                    ? "bg-amber-500/30 border-amber-500 text-amber-300"
                    : "bg-black/40 border-amber-500/20 text-viking-silver/70 hover:text-amber-400"
                }`}
              >
                Expirando ({expiredTokenCount})
              </button>
              <button
                onClick={() => handleFilterChange("missing")}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  filterStatus === "missing"
                    ? "bg-red-500/30 border-red-500 text-red-300"
                    : "bg-black/40 border-red-500/20 text-viking-silver/70 hover:text-red-400"
                }`}
              >
                Sem Token ({missingTokenCount})
              </button>
            </div>

            {/* Batch Request Button */}
            <button
              onClick={handleBatchRequestPushActivation}
              className="px-3 py-2 bg-gradient-to-r from-viking-gold-dark to-viking-gold text-viking-dark hover:brightness-110 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              title="Enviar notificação no app para todos os atletas sem token"
            >
              <Send className="w-3.5 h-3.5" />
              Notificar sem Token
            </button>
          </div>

          {/* Student Diagnostic Scrollable List */}
          <div className="modal-body p-4 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center bg-black/30 rounded-2xl border border-viking-gold/15 space-y-2">
                <Info className="w-8 h-8 text-viking-gold/50 mx-auto" />
                <p className="text-xs text-viking-silver/70">
                  Nenhum atleta encontrado para os filtros selecionados.
                </p>
              </div>
            ) : (
              <>
                {paginatedStudents.map(([email, student]) => {
                  const hasToken = !!student.fcmToken && student.fcmEnabled !== false;
                  const isExpired =
                    hasToken &&
                    student.fcmTokenUpdatedAt &&
                    now - student.fcmTokenUpdatedAt > THIRTY_DAYS_MS;
                  const errors = student.fcmPushErrors || [];
                  const pendingPush = student.fcmPushPending;
                  const isErrExpanded = expandedErrors[email];
                  const visibleErrors = isErrExpanded ? errors : errors.slice(0, 2);

                  return (
                    <div
                      key={email}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        !hasToken
                          ? "bg-red-950/15 border-red-500/30"
                          : isExpired
                          ? "bg-amber-950/15 border-amber-500/30"
                          : errors.length > 0
                          ? "bg-purple-950/15 border-purple-500/30"
                          : "bg-[#18100d]/80 border-viking-gold/20"
                      }`}
                    >
                      {/* Student Info & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-viking-gold/15 pb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-viking-gold/20 border border-viking-gold/40 flex items-center justify-center text-viking-gold font-black text-sm shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black uppercase text-viking-gold tracking-wide">
                                {student.name}
                              </h4>
                              {student.plan && (
                                <span className="text-[9px] bg-viking-gold/10 text-viking-silver border border-viking-gold/30 px-1.5 py-0.2 rounded uppercase font-mono">
                                  {student.plan}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-viking-silver/70 font-mono">
                              {email}
                            </p>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {!hasToken ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Sem Token
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Token Antigo
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Token Ativo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Token Details & Timestamp */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-black/50 border border-viking-gold/15 flex items-center justify-between">
                          <span className="text-viking-silver/60 font-bold uppercase text-[10px]">
                            Registro FCM:
                          </span>
                          <div className="flex items-center gap-1 font-mono text-viking-gold/90 truncate max-w-[200px]">
                            <span>
                              {student.fcmToken
                                ? `${student.fcmToken.substring(0, 24)}...`
                                : "Não Cadastrado"}
                            </span>
                            {student.fcmToken && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(student.fcmToken || "");
                                  showToast("Token FCM copiado para a área de transferência!", "info");
                                }}
                                className="text-viking-silver/60 hover:text-viking-gold p-1 cursor-pointer"
                                title="Copiar Token FCM Completo"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-black/50 border border-viking-gold/15 flex items-center justify-between">
                          <span className="text-viking-silver/60 font-bold uppercase text-[10px]">
                            Última Sincronização:
                          </span>
                          <span className="font-mono text-viking-silver">
                            {formatTimestamp(student.fcmTokenUpdatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Pending Push Status if any */}
                      {pendingPush && (
                        <div className="p-2.5 rounded-xl bg-viking-gold/5 border border-viking-gold/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5 text-viking-gold animate-pulse shrink-0" />
                            <span className="text-viking-silver font-medium text-[11px]">
                              Último Envio: <strong>{pendingPush.title}</strong>
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase font-mono ${
                              pendingPush.delivered ? "text-green-400" : "text-amber-400"
                            }`}
                          >
                            {pendingPush.delivered ? "✅ Entregue" : "📩 Pendente no App"}
                          </span>
                        </div>
                      )}

                      {/* Recent Errors Log */}
                      {errors.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-red-400">
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Histórico de Erros Recentes ({errors.length})
                            </span>
                            <button
                              onClick={() => handleClearErrors(email, student)}
                              className="text-viking-silver/60 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" /> Limpar
                            </button>
                          </div>
                          {visibleErrors.map((err) => (
                            <div
                              key={err.id}
                              className="p-1.5 rounded bg-black/60 text-[11px] text-red-200 border border-red-500/20 flex flex-col gap-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-red-300">{err.title}</span>
                                <span className="text-[9px] font-mono text-viking-silver/60">
                                  {formatTimestamp(err.timestamp)}
                                </span>
                              </div>
                              <p className="text-[10px] text-viking-silver/80">{err.error}</p>
                            </div>
                          ))}
                          {errors.length > 2 && (
                            <button
                              onClick={() =>
                                setExpandedErrors((prev) => ({
                                  ...prev,
                                  [email]: !prev[email],
                                }))
                              }
                              className="text-[10px] text-viking-gold hover:underline font-bold flex items-center gap-1 cursor-pointer pt-0.5"
                            >
                              {isErrExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3" /> Mostrar menos
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" /> Ver todos os {errors.length} erros
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Action Buttons Row */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-viking-gold/10">
                        <button
                          onClick={() => handleSendTestPush(email, student.name)}
                          className="flex-1 min-w-[130px] px-3 py-1.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Testar Push FCM
                        </button>

                        <button
                          onClick={() => handleRequestPushActivation(email, student)}
                          className="px-3 py-1.5 bg-black/50 hover:bg-viking-gold/20 text-viking-gold border border-viking-gold/30 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Pedir Ativação
                        </button>

                        <button
                          onClick={() => handleRemoveToken(email, student)}
                          className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/80 text-red-300 hover:text-red-100 border border-red-500/40 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          title="Excluir o token FCM atual e os erros associados deste atleta"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          Remover Token
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Controls Bar */}
                {filteredStudents.length > 0 && (
                  <div className="p-3 bg-black/50 rounded-2xl border border-viking-gold/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-viking-silver mt-2 shrink-0">
                    <span className="text-[11px] text-viking-silver/80 font-mono">
                      Mostrando{" "}
                      <strong className="text-viking-gold">
                        {Math.min((safeCurrentPage - 1) * ITEMS_PER_PAGE + 1, filteredStudents.length)}
                      </strong>{" "}
                      -{" "}
                      <strong className="text-viking-gold">
                        {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredStudents.length)}
                      </strong>{" "}
                      de <strong className="text-viking-gold">{filteredStudents.length}</strong> atletas
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage === 1}
                        className="px-3 py-1.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/25 border border-viking-gold/30 disabled:opacity-40 disabled:cursor-not-allowed text-viking-gold font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Anterior
                      </button>

                      <div className="px-3 py-1 rounded-lg bg-black/60 border border-viking-gold/30 font-mono font-bold text-xs text-viking-gold">
                        {safeCurrentPage} / {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage === totalPages}
                        className="px-3 py-1.5 rounded-xl bg-viking-gold/10 hover:bg-viking-gold/25 border border-viking-gold/30 disabled:opacity-40 disabled:cursor-not-allowed text-viking-gold font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Próxima
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gradient-to-r from-viking-dark via-[#1e1411] to-viking-dark border-t border-viking-gold/30 flex items-center justify-between text-xs text-viking-silver/70 shrink-0">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Info className="w-4 h-4 text-viking-gold shrink-0" />
              Notificações FCM enviadas via Firebase Firestore payload + Broadcast Web API.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-viking-gold/20 hover:bg-viking-gold/30 text-viking-gold border border-viking-gold/40 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
            >
              Fechar Diagnóstico
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
