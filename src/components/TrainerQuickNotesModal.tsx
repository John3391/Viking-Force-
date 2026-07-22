import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StickyNote,
  X,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Search,
  User,
  Sparkles,
  ShieldAlert,
  Clock,
  Filter,
  Flame,
  FileText
} from 'lucide-react';
import { StudentProfile, TrainerQuickNote } from '../types';

interface TrainerQuickNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsData: Record<string, StudentProfile>;
  initialStudentEmail?: string;
  onSaveNotes: (studentEmail: string, notes: TrainerQuickNote[]) => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: Array<NonNullable<TrainerQuickNote['category']>> = [
  'Lembrete',
  'Lesão / Cuidado',
  'Meta',
  'Técnica',
  'Financeiro',
];

const PRESET_NOTES = [
  '⚠️ Dor/desconforto leve no ombro - atenção nas cargas de supino.',
  '🎯 Focar na cadência e controle da fase excêntrica esta semana.',
  '💳 Lembrete: Vencimento do plano próximo. Enviar mensagem amanhã.',
  '🏋️ Excelente execução no agachamento! Considerar subir 2.5kg.',
  '⏱️ Reduzir tempo de descanso para 90s nos exercícios secundários.',
  '🩹 Atleta relatou cansaço lombar. Ajustar volume de terra se necessário.',
];

export default function TrainerQuickNotesModal({
  isOpen,
  onClose,
  studentsData,
  initialStudentEmail,
  onSaveNotes,
  showToast,
}: TrainerQuickNotesModalProps) {
  const studentEmails = Object.keys(studentsData);

  const [selectedEmail, setSelectedEmail] = useState<string>(
    initialStudentEmail || studentEmails[0] || ''
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'single' | 'all'>('single');

  // New Note Form state
  const [noteText, setNoteText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] =
    useState<TrainerQuickNote['category']>('Lembrete');
  const [isHighPriority, setIsHighPriority] = useState<boolean>(false);

  // Synchronize initial email when changed from props
  React.useEffect(() => {
    if (initialStudentEmail && studentEmails.includes(initialStudentEmail)) {
      setSelectedEmail(initialStudentEmail);
    } else if (studentEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(studentEmails[0]);
    }
  }, [initialStudentEmail, studentEmails]);

  if (!isOpen) return null;

  const currentStudent = studentsData[selectedEmail];
  const currentNotes: TrainerQuickNote[] = currentStudent?.privateNotes || [];

  const handleAddNote = () => {
    if (!noteText.trim()) {
      showToast?.('Digite um texto para o lembrete.', 'error');
      return;
    }
    if (!selectedEmail) return;

    const newNote: TrainerQuickNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
      category: selectedCategory,
      priority: isHighPriority ? 'high' : 'low',
    };

    const updatedNotes = [newNote, ...currentNotes];
    onSaveNotes(selectedEmail, updatedNotes);

    setNoteText('');
    setIsHighPriority(false);
    showToast?.('Nota rápida salva com sucesso!', 'success');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedEmail) return;
    const updatedNotes = currentNotes.filter((n) => n.id !== noteId);
    onSaveNotes(selectedEmail, updatedNotes);
    showToast?.('Lembrete removido.', 'info');
  };

  // Filter student list for selector
  const filteredStudents = studentEmails.filter((email) => {
    const s = studentsData[email];
    if (!s) return false;
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  // Calculate total notes across all students
  const totalNotesCount = studentEmails.reduce((acc, email) => {
    return acc + (studentsData[email]?.privateNotes?.length || 0);
  }, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#1a1210] border border-viking-gold/30 rounded-3xl w-full max-w-4xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] relative text-white"
        >
          {/* Top Header */}
          <div className="p-5 sm:p-6 border-b border-viking-gold/20 flex items-center justify-between bg-gradient-to-r from-viking-darker via-[#1f1613] to-viking-darker shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-viking-gold/15 text-viking-gold border border-viking-gold/30 rounded-2xl shadow-md">
                <StickyNote className="w-6 h-6 text-viking-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-viking-display text-lg sm:text-xl font-black text-[#e0d3a8] tracking-wider uppercase">
                    Notas Rápidas do Treinador
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> Apenas Visível para o Treinador
                  </span>
                </div>
                <p className="text-xs text-viking-silver/80 mt-0.5">
                  Lembretes estratégicos, observações técnicas e alertas individuais por atleta.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-viking-gold/20 border border-viking-gold/20 text-viking-silver hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="px-6 pt-4 pb-2 border-b border-viking-gold/10 flex items-center justify-between gap-4 bg-[#140e0c] shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'single'
                    ? 'bg-viking-gold text-viking-dark shadow-md'
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                }`}
              >
                <User className="w-4 h-4" /> Por Atleta
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-viking-gold text-viking-dark shadow-md'
                    : 'text-viking-silver hover:text-viking-gold hover:bg-viking-gold/10'
                }`}
              >
                <FileText className="w-4 h-4" /> Visão Geral ({totalNotesCount})
              </button>
            </div>

            {currentStudent && activeTab === 'single' && (
              <span className="text-xs text-viking-silver/70 font-bold hidden sm:inline-block">
                {currentNotes.length}{' '}
                {currentNotes.length === 1 ? 'lembrete ativo' : 'lembretes ativos'} para{' '}
                <strong className="text-viking-gold">{currentStudent.name}</strong>
              </span>
            )}
          </div>

          {/* Main Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'single' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Athlete Selector List */}
                <div className="lg:col-span-4 bg-[#140e0c] border border-viking-gold/15 p-4 rounded-2xl flex flex-col max-h-[500px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-viking-silver/60 mb-2.5 block">
                    Selecione o Atleta
                  </span>

                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-viking-gold/60" />
                    <input
                      type="text"
                      placeholder="Buscar atleta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#0d0908] border border-viking-gold/20 rounded-xl text-xs text-white placeholder-viking-silver/40 outline-none focus:border-viking-gold"
                    />
                  </div>

                  <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
                    {filteredStudents.map((email) => {
                      const s = studentsData[email];
                      if (!s) return null;
                      const isSel = email === selectedEmail;
                      const notesCount = s.privateNotes?.length || 0;
                      const hasHighPriority = s.privateNotes?.some(
                        (n) => n.priority === 'high'
                      );

                      return (
                        <button
                          key={email}
                          onClick={() => setSelectedEmail(email)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSel
                              ? 'bg-viking-gold/20 border-viking-gold text-white font-bold shadow-sm'
                              : 'bg-[#0d0908]/60 border-viking-gold/10 hover:border-viking-gold/30 text-viking-silver hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-viking-darker border border-viking-gold/30 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-viking-gold">
                              {s.photoUrl ? (
                                <img
                                  src={s.photoUrl}
                                  alt={s.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                s.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{s.name}</p>
                              <p className="text-[9px] text-viking-silver/50 truncate font-mono">
                                {email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {hasHighPriority && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Informa nota de alta prioridade!" />
                            )}
                            {notesCount > 0 && (
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                  isSel
                                    ? 'bg-viking-gold text-viking-dark'
                                    : 'bg-viking-gold/10 text-viking-gold border border-viking-gold/20'
                                }`}
                              >
                                {notesCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Note Form & Active Notes list */}
                <div className="lg:col-span-8 space-y-5">
                  {currentStudent ? (
                    <>
                      {/* Active Athlete Header */}
                      <div className="flex items-center justify-between bg-[#140e0c] border border-viking-gold/20 p-3.5 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-viking-gold/10 border border-viking-gold/30 overflow-hidden shrink-0 flex items-center justify-center font-bold text-viking-gold text-sm font-viking-display">
                            {currentStudent.photoUrl ? (
                              <img
                                src={currentStudent.photoUrl}
                                alt={currentStudent.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              currentStudent.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">
                              {currentStudent.name}
                            </h4>
                            <p className="text-[10px] text-viking-silver/70 font-mono">
                              {selectedEmail} • Plano {currentStudent.plan || 'Geral'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] bg-viking-gold/15 text-viking-gold border border-viking-gold/30 font-extrabold uppercase px-2.5 py-1 rounded-lg">
                          {currentNotes.length} Lembretes
                        </span>
                      </div>

                      {/* Add Note Form */}
                      <div className="bg-[#140e0c]/90 border border-viking-gold/20 p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-viking-gold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-viking-gold" /> Criar Novo Lembrete Rápido
                          </span>
                          <span className="text-[9px] text-viking-silver/50 lowercase">
                            (não enviado ao aluno)
                          </span>
                        </div>

                        <textarea
                          rows={2}
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Digite a observação do treinador sobre o atleta..."
                          className="w-full p-3 bg-[#0d0908] border border-viking-gold/20 focus:border-viking-gold rounded-xl text-xs text-white placeholder-viking-silver/40 outline-none transition-all resize-none"
                        />

                        {/* Category Selector & Priority */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          {/* Categories */}
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] font-bold text-viking-silver/60 uppercase mr-1">
                              Categoria:
                            </span>
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                                  selectedCategory === cat
                                    ? 'bg-viking-gold text-viking-dark shadow-sm'
                                    : 'bg-black/40 text-viking-silver border border-viking-gold/15 hover:border-viking-gold/40'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          {/* Priority Toggle */}
                          <button
                            onClick={() => setIsHighPriority(!isHighPriority)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                              isHighPriority
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                                : 'bg-black/40 text-viking-silver/70 border border-viking-gold/15 hover:text-white'
                            }`}
                          >
                            <AlertTriangle className={`w-3 h-3 ${isHighPriority ? 'text-red-400' : 'text-viking-silver'}`} />
                            {isHighPriority ? 'Alta Prioridade' : 'Prioridade Normal'}
                          </button>
                        </div>

                        {/* Presets Chips */}
                        <div className="pt-2 border-t border-viking-gold/10 space-y-1.5">
                          <span className="text-[9px] font-bold text-viking-silver/50 uppercase tracking-widest block">
                            Atalhos de Inserção Rápida:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {PRESET_NOTES.map((preset, idx) => (
                              <button
                                key={idx}
                                onClick={() => setNoteText(preset)}
                                className="text-[9.5px] bg-black/40 hover:bg-viking-gold/15 border border-viking-gold/10 hover:border-viking-gold/30 text-viking-silver/80 hover:text-viking-gold px-2 py-1 rounded-md transition-all cursor-pointer text-left truncate max-w-[260px]"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={handleAddNote}
                            className="px-5 py-2.5 bg-gradient-to-r from-viking-gold-dark to-viking-gold hover:brightness-110 text-viking-dark font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-viking-gold/20 transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Salvar Lembrete
                          </button>
                        </div>
                      </div>

                      {/* Notes Feed */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-black uppercase tracking-wider text-viking-gold flex items-center gap-1.5">
                          <StickyNote className="w-3.5 h-3.5 text-viking-gold" /> Lembretes Salvos ({currentNotes.length})
                        </h5>

                        {currentNotes.length === 0 ? (
                          <div className="p-8 text-center bg-[#140e0c]/40 border border-viking-gold/10 rounded-2xl">
                            <Sparkles className="w-8 h-8 text-viking-gold/30 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-viking-silver/70">
                              Nenhum lembrete registrado para este atleta ainda.
                            </p>
                            <p className="text-[10px] text-viking-silver/40 mt-1">
                              Crie anotações sobre lesões, evolução ou cobranças no campo acima.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {currentNotes.map((note) => {
                              const dateFormatted = new Date(note.createdAt).toLocaleDateString(
                                'pt-BR',
                                { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
                              );

                              return (
                                <motion.div
                                  key={note.id}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 relative ${
                                    note.priority === 'high'
                                      ? 'bg-red-950/20 border-red-500/40 shadow-sm'
                                      : 'bg-[#140e0c] border-viking-gold/20'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-viking-gold/15 text-viking-gold border border-viking-gold/30 px-2 py-0.5 rounded-md">
                                          {note.category || 'Lembrete'}
                                        </span>
                                        {note.priority === 'high' && (
                                          <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3 text-red-400" /> Alta Prioridade
                                          </span>
                                        )}
                                        <span className="text-[10px] text-viking-silver/50 font-mono flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {dateFormatted}
                                        </span>
                                      </div>

                                      <p className="text-xs text-white leading-relaxed pt-1">
                                        {note.text}
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => handleDeleteNote(note.id)}
                                      className="p-1.5 rounded-lg text-viking-silver/50 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                                      title="Excluir Lembrete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-viking-silver/60">
                      Selecione um atleta ao lado.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Overview Tab across all athletes */
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#140e0c] p-3.5 rounded-2xl border border-viking-gold/15">
                  <span className="text-xs font-bold text-viking-gold uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-viking-gold" /> Todos os Lembretes Ativos no Sistema
                  </span>
                  <span className="text-xs text-viking-silver font-mono">
                    Total: {totalNotesCount}
                  </span>
                </div>

                <div className="space-y-3">
                  {studentEmails.map((email) => {
                    const s = studentsData[email];
                    if (!s || !s.privateNotes || s.privateNotes.length === 0) return null;

                    return (
                      <div
                        key={email}
                        className="bg-[#140e0c] border border-viking-gold/20 p-4 rounded-2xl space-y-3"
                      >
                        <div className="flex justify-between items-center border-b border-viking-gold/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white uppercase">{s.name}</span>
                            <span className="text-[10px] text-viking-silver/50 font-mono">({email})</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedEmail(email);
                              setActiveTab('single');
                            }}
                            className="text-[10px] font-bold text-viking-gold hover:underline cursor-pointer"
                          >
                            Gerenciar Atleta →
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {s.privateNotes.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-xl border text-xs ${
                                n.priority === 'high'
                                  ? 'bg-red-950/20 border-red-500/30 text-red-200'
                                  : 'bg-[#0d0908] border-viking-gold/15 text-viking-silver/90'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[9px] font-bold uppercase mb-1">
                                <span className="text-viking-gold">{n.category || 'Lembrete'}</span>
                                <span className="text-viking-silver/50">
                                  {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-white text-xs">{n.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
