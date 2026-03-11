import React, { useState, useEffect } from 'react';
import { Mail, Bell, Save, Shield, Clock } from 'lucide-react';
import { Settings } from '../types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    email: '',
    alert_time: '08:00',
    alerts_enabled: 0
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando configurações...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Configurações da Conta</h3>
            <p className="text-sm text-gray-400">Gerencie suas preferências e alertas.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <Mail size={14} /> Seu E-mail para Alertas
            </label>
            <input 
              type="email"
              value={settings.email || ''}
              onChange={e => setSettings({...settings, email: e.target.value})}
              placeholder="exemplo@email.com"
              className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                <Clock size={14} /> Horário do Alerta Diário
              </label>
              <input 
                type="time"
                value={settings.alert_time || '08:00'}
                onChange={e => setSettings({...settings, alert_time: e.target.value})}
                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                <Bell size={14} /> Status dos Alertas
              </label>
              <button
                type="button"
                onClick={() => setSettings({...settings, alerts_enabled: settings.alerts_enabled ? 0 : 1})}
                className={`w-full p-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  settings.alerts_enabled 
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' 
                    : 'bg-gray-100 text-gray-500 border-2 border-transparent'
                }`}
              >
                {settings.alerts_enabled ? 'Alertas Ativados' : 'Alertas Desativados'}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Save size={20} /> {saved ? 'Configurações Salvas!' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
        <h4 className="text-blue-900 font-bold mb-2">Sobre os Alertas Diários</h4>
        <p className="text-blue-800/70 text-sm leading-relaxed">
          Ao ativar os alertas, você receberá diariamente um resumo das suas metas, hábitos e tarefas pendentes diretamente no seu e-mail, ajudando você a manter o foco e a disciplina do General Valente.
        </p>
      </section>
    </div>
  );
}
