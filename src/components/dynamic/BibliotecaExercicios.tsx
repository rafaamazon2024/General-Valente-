import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, PlayCircle } from 'lucide-react';
import { useExercicios } from '../../hooks/useExercicios';
import { Exercicio } from '../../types';
import { GRUPOS_MUSCULARES } from '../../config/treinoSplit';

export default function BibliotecaExercicios() {
  const { exercicios, loading, addExercicio, updateExercicio, removeExercicio } = useExercicios();
  const [filtro, setFiltro] = useState<string | null>(null);
  const [editing, setEditing] = useState<Exercicio | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', grupo_muscular: GRUPOS_MUSCULARES[0], link_video: '' });

  const openNew = () => {
    setEditing(null);
    setFormData({ nome: '', grupo_muscular: GRUPOS_MUSCULARES[0], link_video: '' });
    setIsFormOpen(true);
  };

  const openEdit = (ex: Exercicio) => {
    setEditing(ex);
    setFormData({ nome: ex.nome, grupo_muscular: ex.grupo_muscular, link_video: ex.link_video || '' });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateExercicio(editing.id, formData);
    } else {
      await addExercicio(formData);
    }
    setIsFormOpen(false);
  };

  const visiveis = filtro ? exercicios.filter(e => e.grupo_muscular === filtro) : exercicios;

  if (loading) {
    return <div className="py-12 text-center text-gray-500 font-mono text-[14px] uppercase tracking-widest">Carregando_Biblioteca...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFiltro(null)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-mono font-bold uppercase tracking-widest transition-all ${filtro === null ? 'bg-[#10b981] text-white' : 'bg-black/5 text-gray-600 hover:bg-black/10'}`}
          >
            Todos
          </button>
          {GRUPOS_MUSCULARES.map(g => (
            <button
              key={g}
              onClick={() => setFiltro(g)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-mono font-bold uppercase tracking-widest transition-all ${filtro === g ? 'bg-[#10b981] text-white' : 'bg-black/5 text-gray-600 hover:bg-black/10'}`}
            >
              {g}
            </button>
          ))}
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] text-white font-bold text-[13px] uppercase tracking-widest transition-all hover:bg-[#0ea371] shrink-0"
        >
          <Plus size={16} /> Novo Exercício
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiveis.map(ex => (
          <div key={ex.id} className="bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-gray-700">{ex.nome}</h4>
                <span className="text-[12px] font-mono text-[#10b981] uppercase tracking-widest">{ex.grupo_muscular}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(ex)} className="p-1.5 hover:bg-black/5 rounded-lg text-gray-500 hover:text-[#10b981] transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => { if (window.confirm('Excluir este exercício?')) removeExercicio(ex.id); }} className="p-1.5 hover:bg-black/5 rounded-lg text-gray-500 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {ex.link_video ? (
              <a href={ex.link_video} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[13px] font-mono text-[#10b981] hover:underline">
                <PlayCircle size={14} /> Ver Vídeo
              </a>
            ) : (
              <span className="text-[13px] font-mono text-gray-400 uppercase tracking-widest">Vídeo Pendente</span>
            )}
          </div>
        ))}
        {visiveis.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-mono text-[14px] uppercase tracking-widest border border-dashed border-black/10 rounded-2xl">
            NENHUM_EXERCÍCIO_NESTE_GRUPO
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="bg-white border border-black/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-black/10 flex items-center justify-between bg-black/5">
              <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-[#10b981]">
                {editing ? 'Editar_Exercício' : 'Novo_Exercício'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-black/5 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-mono font-bold text-gray-500 uppercase tracking-widest">Nome</label>
                <input
                  required
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full p-4 rounded-xl bg-black/5 border border-black/10 text-[#14120d] focus:border-[#10b981]/50 outline-none font-mono text-sm transition-colors"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-mono font-bold text-gray-500 uppercase tracking-widest">Grupo Muscular</label>
                <select
                  required
                  value={formData.grupo_muscular}
                  onChange={e => setFormData({ ...formData, grupo_muscular: e.target.value })}
                  className="w-full p-4 rounded-xl bg-black/5 border border-black/10 text-[#14120d] focus:border-[#10b981]/50 outline-none font-mono text-sm appearance-none"
                >
                  {GRUPOS_MUSCULARES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-mono font-bold text-gray-500 uppercase tracking-widest">Link do Vídeo</label>
                <input
                  value={formData.link_video}
                  onChange={e => setFormData({ ...formData, link_video: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-4 rounded-xl bg-black/5 border border-black/10 text-[#14120d] focus:border-[#10b981]/50 outline-none font-mono text-sm transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#10b981] hover:bg-[#0ea371] text-white p-4 rounded-2xl font-bold transition-all uppercase tracking-[0.2em] text-xs"
              >
                Salvar_Exercício
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
