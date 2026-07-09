import React, { useState, useEffect } from 'react';
import { Save, Bell, User, Zap, Target, Clock, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { db, doc, getDoc, setDoc } from '../firebase';
import { useFcm } from '../hooks/useFcm';

export default function Settings() {
  const { user } = useAuth();
  const { requestAndSave, revoke } = useFcm();
  const [settings, setSettings] = useState<any>({
    displayName: '',
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
    if (!user) return;

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            ...settings,
            ...data,
            displayName: data.displayName || user.displayName || '',
            email: data.email || user.email || ''
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...settings,
        updated_at: new Date().toISOString()
      }, { merge: true });
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
        <h2 className="text-2xl font-bold text-[#14120d] tracking-tight">Configurações do Sistema</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[#d97706] text-white font-bold rounded-xl hover:bg-[#c2680a] transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'SALVANDO...' : 'SALVAR_ALTERAÇÕES'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Perfil */}
        <section className="bg-white/50 backdrop-blur-xl border border-black/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-[#d97706] mb-2">
            <User size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Perfil_Do_Usuário</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Nome_De_Guerra</label>
              <input
                type="text"
                value={settings.displayName}
                onChange={e => setSettings({ ...settings, displayName: e.target.value })}
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-[#14120d] focus:border-[#d97706] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Frase_De_Efeito</label>
              <input
                type="text"
                value={settings.phrase}
                onChange={e => setSettings({ ...settings, phrase: e.target.value })}
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-[#14120d] focus:border-[#d97706] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Data_De_Início_Da_Transformação</label>
              <input
                type="date"
                value={settings.start_date}
                onChange={e => setSettings({ ...settings, start_date: e.target.value })}
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-[#14120d] focus:border-[#d97706] outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Notificações */}
        <section className="bg-white/50 backdrop-blur-xl border border-black/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-[#0e7490] mb-2">
            <Bell size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Alertas_E_Sincronização</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/5">
              <span className="text-sm text-gray-700">Ativar Notificações do Sistema</span>
              <button
                onClick={async () => {
                  const enabling = !settings.alerts_enabled;
                  setSettings({ ...settings, alerts_enabled: enabling });
                  if (enabling) {
                    const granted = await requestAndSave();
                    if (!granted) setSettings((prev: any) => ({ ...prev, alerts_enabled: false }));
                  } else {
                    await revoke();
                  }
                }}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.alerts_enabled ? 'bg-[#d97706]' : 'bg-black/10'}`}
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
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-[#14120d] focus:border-[#0e7490] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Email_De_Recuperação</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-[#14120d] focus:border-[#0e7490] outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Meta Suprema */}
        <section className="col-span-full bg-white/50 backdrop-blur-xl border border-black/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <Target size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Meta_Suprema_2026</h3>
          </div>
          <textarea
            value={settings.supreme_goal}
            onChange={e => setSettings({ ...settings, supreme_goal: e.target.value })}
            rows={3}
            className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-[#14120d] focus:border-amber-600 outline-none transition-all resize-none text-lg font-bold"
            placeholder="Qual é o seu objetivo final para este ano?"
          />
        </section>

        {/* Alarms */}
        <section className="col-span-full bg-white/50 backdrop-blur-xl border border-black/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <Clock size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Rotina_De_Alarmes</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.alarms.map((alarm: any, idx: number) => (
              <div key={idx} className="bg-black/5 border border-black/5 p-4 rounded-xl">
                <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">{alarm.label}</p>
                <p className="text-xl font-mono font-bold text-[#14120d]">{alarm.time}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Migration */}
        <section className="col-span-full bg-white/50 backdrop-blur-xl border border-black/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-[#d97706] mb-2">
            <Zap size={20} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Migração_De_Dados</h3>
          </div>
          <p className="text-gray-600 text-xs">
            Se você já utilizava o sistema anteriormente (offline), pode migrar seus registros locais para sua conta segura na nuvem.
          </p>
          <button
            onClick={async () => {
              if (!confirm('Deseja migrar seus dados locais para o Firebase? Isso pode duplicar itens se já tiverem sido migrados.')) return;
              try {
                const res = await fetch('/api/records-all');
                const localRecords = await res.json();
                
                if (!localRecords || localRecords.length === 0) {
                  alert('Nenhum dado local encontrado para migrar.');
                  return;
                }

                alert(`Iniciando migração de ${localRecords.length} registros...`);
                
                const { collection, addDoc, db: firestoreDb } = await import('../firebase');
                
                let successCount = 0;
                for (const record of localRecords) {
                  try {
                    await addDoc(collection(firestoreDb, 'records'), {
                      area_id: record.area_id,
                      type: record.type,
                      data: record.data,
                      uid: user.uid,
                      created_at: record.created_at || new Date().toISOString(),
                      updated_at: record.updated_at || new Date().toISOString()
                    });
                    successCount++;
                  } catch (e) {
                    console.error('Erro ao migrar item:', e);
                  }
                }
                
                alert(`Migração concluída! ${successCount} de ${localRecords.length} registros migrados com sucesso.`);
              } catch (error) {
                console.error('Erro na migração:', error);
                alert('Erro durante a migração.');
              }
            }}
            className="px-6 py-3 bg-black/5 border border-black/10 rounded-xl text-[10px] font-mono font-bold text-[#14120d] hover:bg-[#d97706]/20 hover:border-[#d97706]/50 transition-all uppercase tracking-widest"
          >
            Migrar_Registros_Locais_Para_Nuvem
          </button>
        </section>
      </div>
    </div>
  );
}
