import React, { useState } from 'react';
import { Folder, FileText, Plus, Trash2, Copy, Search, ChevronDown, ChevronRight, Save, User, CheckCircle } from 'lucide-react';
import { TrainingProtocol, StudentProfile } from '../types';

interface ProtocolsDrawerProps {
  protocols: TrainingProtocol[];
  setProtocols: React.Dispatch<React.SetStateAction<TrainingProtocol[]>>;
  studentsData: Record<string, StudentProfile>;
  onApplyToStudent: (protocol: TrainingProtocol, studentEmail: string) => void;
}

export const ProtocolsDrawer: React.FC<ProtocolsDrawerProps> = ({
  protocols,
  setProtocols,
  studentsData,
  onApplyToStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newProtocolName, setNewProtocolName] = useState('');
  const [newProtocolFolder, setNewProtocolFolder] = useState('');
  const [newProtocolSource, setNewProtocolSource] = useState(''); // student email
  const [applyingProtocol, setApplyingProtocol] = useState<string | null>(null); // protocol id
  const [targetStudent, setTargetStudent] = useState('');

  const folders = Array.from(new Set(protocols.map(p => p.folder || 'Geral')));
  
  const handleToggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleCreateProtocol = () => {
    if (!newProtocolName.trim() || !newProtocolSource) return;
    
    const sourceStudent = studentsData[newProtocolSource];
    if (!sourceStudent || !sourceStudent.customProgram) return;

    const newProtocol: TrainingProtocol = {
      id: Date.now().toString(),
      name: newProtocolName.trim(),
      folder: newProtocolFolder.trim() || 'Geral',
      program: JSON.parse(JSON.stringify(sourceStudent.customProgram)),
      createdAt: new Date().toISOString()
    };

    setProtocols(prev => [...prev, newProtocol]);
    setIsCreating(false);
    setNewProtocolName('');
    setNewProtocolFolder('');
    setNewProtocolSource('');
    
    // Auto expand the folder where it was created
    setExpandedFolders(prev => ({ ...prev, [newProtocol.folder!]: true }));
  };

  const handleDeleteProtocol = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este protocolo?')) {
      setProtocols(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleApply = (protocol: TrainingProtocol) => {
    if (!targetStudent) return;
    onApplyToStudent(protocol, targetStudent);
    setApplyingProtocol(null);
    setTargetStudent('');
    alert('Protocolo aplicado com sucesso!');
  };

  // Filter protocols
  const filteredProtocols = protocols.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.folder && p.folder.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group by folder
  const groupedProtocols: Record<string, TrainingProtocol[]> = {};
  filteredProtocols.forEach(p => {
    const f = p.folder || 'Geral';
    if (!groupedProtocols[f]) groupedProtocols[f] = [];
    groupedProtocols[f].push(p);
  });

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-viking-silver/60" />
          <input
            type="text"
            placeholder="Buscar protocolos ou pastas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0d0908]/60 border border-viking-gold/20 rounded-xl text-xs text-white focus:border-viking-gold outline-none"
          />
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-viking-gold/10 hover:bg-viking-gold/20 text-viking-gold border border-viking-gold/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          {isCreating ? 'Cancelar' : <><Plus className="w-4 h-4" /> Novo Protocolo</>}
        </button>
      </div>

      {/* Creation Form */}
      {isCreating && (
        <div className="p-4 bg-[#140e0c] border border-viking-gold/30 rounded-2xl space-y-3 animate-fade-in">
          <h4 className="text-sm font-bold text-viking-gold mb-2 flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar Novo Protocolo
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-viking-silver mb-1">Nome do Protocolo</label>
              <input
                type="text"
                value={newProtocolName}
                onChange={e => setNewProtocolName(e.target.value)}
                placeholder="Ex: Força Base 8 Semanas"
                className="w-full px-3 py-2 bg-[#0d0908] border border-viking-gold/20 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-viking-silver mb-1">Pasta (Opcional)</label>
              <input
                type="text"
                value={newProtocolFolder}
                onChange={e => setNewProtocolFolder(e.target.value)}
                placeholder="Ex: Powerlifting, Iniciantes"
                className="w-full px-3 py-2 bg-[#0d0908] border border-viking-gold/20 rounded-xl text-xs text-white"
                list="existing-folders"
              />
              <datalist id="existing-folders">
                {folders.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] text-viking-silver mb-1">Copiar treino de qual aluno?</label>
              <select
                value={newProtocolSource}
                onChange={e => setNewProtocolSource(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d0908] border border-viking-gold/20 rounded-xl text-xs text-white"
              >
                <option value="">Selecione um aluno base...</option>
                {(Object.entries(studentsData) as any[]).map(([email, student]) => (
                  <option key={email} value={email}>
                    {student.name} ({student.customProgram ? 'Tem programa' : 'Sem programa'})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCreateProtocol}
            disabled={!newProtocolName.trim() || !newProtocolSource}
            className="w-full py-2 bg-viking-gold text-viking-dark rounded-xl text-xs font-bold disabled:opacity-50 mt-2"
          >
            Salvar Metodologia
          </button>
        </div>
      )}

      {/* Folders & Protocols List */}
      <div className="space-y-2 mt-4">
        {Object.keys(groupedProtocols).length === 0 ? (
          <div className="text-center py-8 text-viking-silver/50 text-xs">
            Nenhum protocolo encontrado. Crie um novo para começar.
          </div>
        ) : (
          Object.entries(groupedProtocols).map(([folder, folderProtocols]) => (
            <div key={folder} className="bg-[#0d0908]/40 border border-viking-gold/10 rounded-xl overflow-hidden">
              <button
                onClick={() => handleToggleFolder(folder)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-viking-gold/5 transition-colors"
              >
                <div className="flex items-center gap-2 text-viking-gold text-sm font-bold">
                  <Folder className="w-4 h-4" />
                  {folder} <span className="text-xs text-viking-silver/50 font-normal">({folderProtocols.length})</span>
                </div>
                {expandedFolders[folder] ? <ChevronDown className="w-4 h-4 text-viking-silver/50" /> : <ChevronRight className="w-4 h-4 text-viking-silver/50" />}
              </button>
              
              {expandedFolders[folder] && (
                <div className="p-2 space-y-2 bg-[#0d0908]/80 border-t border-viking-gold/10">
                  {folderProtocols.map(protocol => (
                    <div key={protocol.id} className="bg-[#140e0c] border border-viking-gold/20 rounded-xl p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-viking-gold" /> {protocol.name}
                          </h5>
                          <p className="text-[10px] text-viking-silver/60 mt-1">
                            {Object.keys(protocol.program.weeks || {}).length} Semanas estruturadas
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteProtocol(protocol.id)}
                          className="p-1.5 text-viking-red/70 hover:text-viking-red hover:bg-viking-red/10 rounded-lg transition-colors"
                          title="Excluir Protocolo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Apply Actions */}
                      <div className="mt-3 pt-3 border-t border-viking-gold/10">
                        {applyingProtocol === protocol.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={targetStudent}
                              onChange={e => setTargetStudent(e.target.value)}
                              className="flex-1 px-2 py-1.5 bg-[#0d0908] border border-viking-gold/30 rounded-lg text-xs text-white"
                            >
                              <option value="">Aplicar em qual aluno?</option>
                              {(Object.entries(studentsData) as any[]).map(([email, student]) => (
                                <option key={email} value={email}>{student.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleApply(protocol)}
                              disabled={!targetStudent}
                              className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Confirmar Aplicação"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setApplyingProtocol(null)}
                              className="p-1.5 bg-viking-silver/10 text-viking-silver hover:bg-viking-silver/20 rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setApplyingProtocol(protocol.id)}
                            className="w-full py-1.5 bg-viking-gold/5 hover:bg-viking-gold/15 border border-viking-gold/20 text-viking-gold rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Copy className="w-3 h-3" /> Prescrever este Protocolo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
