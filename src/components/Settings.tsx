import React, { useState, useEffect } from 'react';
import { Save, Bell, User, Zap, Target, Clock } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>({
    name: '',
    phrase: '',
    start_date: '',
    supreme_goal: '',
    email: '',
    alert_time: '09:00',
    alerts_enabled: false,
    priorities: [],
    alarms: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          ...data,
          priorities: typeof data.priorities === 'string' ? JSON.parse(data.priorities) : data.priorities || [],
          alarms: typeof data.alarms === 'string' ? JSON.parse(data.alarms) : data.alarms || []
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-mono text-xs text-gray-500 uppercase tracking-widest">Carregando_Configurações...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Configurações do Sistema</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[#00ff9d] text-black font-bold rounded-xl hover:bg-[#00d4ff] transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'SALVANDO...' : 'SALVAR_ALTERAÇÕES'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Perfil */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-[#00ff9d] mb-2">
            <User size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Perfil_Do_Usuário</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Nome_De_Guerra</label>
              <input
                type="text"
                value={settings.name}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00ff9d] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Frase_De_Efeito</label>
              <input
                type="text"
                value={settings.phrase}
                onChange={e => setSettings({ ...settings, phrase: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00ff9d] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Data_De_Início_Da_Transformação</label>
              <input
                type="date"
                value={settings.start_date}
                onChange={e => setSettings({ ...settings, start_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00ff9d] outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Notificações */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-[#00d4ff] mb-2">
            <Bell size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Alertas_E_Sincronização</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-sm text-gray-300">Ativar Notificações do Sistema</span>
              <button
                onClick={() => setSettings({ ...settings, alerts_enabled: !settings.alerts_enabled })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.alerts_enabled ? 'bg-[#00ff9d]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.alerts_enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Horário_Padrão_De_Alerta</label>
              <input
                type="time"
                value={settings.alert_time}
                onChange={e => setSettings({ ...settings, alert_time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00d4ff] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Email_De_Recuperação</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00d4ff] outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Meta Suprema */}
        <section className="col-span-full bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Target size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Meta_Suprema_2026</h3>
          </div>
          <textarea
            value={settings.supreme_goal}
            onChange={e => setSettings({ ...settings, supreme_goal: e.target.value })}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-all resize-none text-lg font-bold"
            placeholder="Qual é o seu objetivo final para este ano?"
          />
        </section>

        {/* Alarms */}
        <section className="col-span-full bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-purple-500 mb-2">
            <Clock size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Rotina_De_Alarmes</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.alarms.map((alarm: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">{alarm.label}</p>
                <p className="text-xl font-mono font-bold text-white">{alarm.time}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
