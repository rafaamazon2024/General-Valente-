import React, { useState, useEffect } from 'react';
import { AreaField } from '../../types';
import { X } from 'lucide-react';

interface DynamicFormProps {
  fields: AreaField[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  title: string;
}

export default function DynamicForm({ fields, onSubmit, onCancel, initialData, title }: DynamicFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-[#00ff9d]">
            {title}
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {fields.map((field) => {
            // Conditional logic for Rating
            if (field.nome === 'rating' && formData.status !== 'Lido') {
              return null;
            }

            return (
              <div key={field.nome} className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.tipo === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.nome] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm appearance-none"
                  >
                    <option value="" className="bg-[#0a0a0a]">Selecione...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0a0a0a]">{opt}</option>
                    ))}
                  </select>
                ) : field.tipo === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.nome] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm min-h-[100px] resize-none"
                    placeholder={field.label.toUpperCase()}
                  />
                ) : field.tipo === 'checkbox' ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="checkbox"
                      checked={formData[field.nome] || false}
                      onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#00ff9d] focus:ring-[#00ff9d]/20"
                    />
                    <span className="text-sm text-gray-400 font-mono">{field.label}</span>
                  </div>
                ) : field.tipo === 'date' ? (
                  <input
                    type="date"
                    required={field.required}
                    value={formData[field.nome] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                  />
                ) : field.tipo === 'time' ? (
                  <input
                    type="time"
                    required={field.required}
                    value={formData[field.nome] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                  />
                ) : field.tipo === 'url' ? (
                  <input
                    type="url"
                    required={field.required}
                    value={formData[field.nome] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                    placeholder="HTTPS://..."
                  />
                ) : field.tipo === 'number' ? (
                  <input
                    type="number"
                    required={field.required}
                    value={formData[field.nome] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                    placeholder={field.label.toUpperCase()}
                  />
                ) : (
                  <input
                    type="text"
                    required={field.required}
                    value={formData[field.nome] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.nome]: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                    placeholder={field.label.toUpperCase()}
                  />
                )}
              </div>
            );
          })}
          <button
            type="submit"
            className="w-full bg-[#00ff9d] hover:bg-[#00cc7d] text-black p-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#00ff9d]/20 uppercase tracking-[0.2em] text-xs"
          >
            SALVAR_REGISTRO
          </button>
        </form>
      </div>
    </div>
  );
}
