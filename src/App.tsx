import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart3, CalendarRange, Home, LayoutGrid, Repeat, Target, User as UserIcon } from 'lucide-react';
import LockScreen from './components/LockScreen';
import Login from './pages/Login';
import { useAuth } from './components/AuthContext';
import { db, doc, onSnapshot } from './firebase';
import { ValenteProvider, useValente } from './valente/store';
import { rotaKey, type Ir, type Rota } from './valente/nav';
import Capacete, { Logo } from './valente/ui/Capacete';
import TemaToggle from './valente/ui/TemaToggle';
import { InicioDesktop, InicioMobile } from './valente/pages/Inicio';
import AreaPage from './valente/pages/AreaPage';
import {
  AreasPagina, Big3Pagina, CicloPagina, GeneralPagina, HabitosPagina, PerfilPagina, RelatoriosPagina, RevisaoPagina,
} from './valente/pages/Outras';

export function useDesktop(): boolean {
  const q = '(min-width: 1024px)';
  const [d, setD] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setD(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return d;
}

export function Pagina({ rota, ir, desktop }: { rota: Rota; ir: Ir; desktop: boolean }) {
  switch (rota.t) {
    case 'inicio': return desktop ? <InicioDesktop ir={ir} /> : <InicioMobile ir={ir} />;
    case 'ciclo': return <CicloPagina ir={ir} />;
    case 'general': return <GeneralPagina ir={ir} />;
    case 'habitos': return <HabitosPagina />;
    case 'perfil': return <PerfilPagina />;
    case 'areas': return <AreasPagina ir={ir} />;
    case 'big3': return <Big3Pagina />;
    case 'relatorios': return <RelatoriosPagina ir={ir} />;
    case 'revisao': return <RevisaoPagina ir={ir} />;
    case 'area': return <AreaPage id={rota.id} ir={ir} />;
  }
}

// Qual item do menu fica aceso para cada rota.
function itemAtivo(rota: Rota, desktop: boolean): string {
  if (rota.t === 'area') return desktop ? 'areas' : 'inicio';
  if (rota.t === 'revisao') return 'ciclo';
  if (rota.t === 'general' && desktop) return 'relatorios';
  return rota.t;
}

const MENU_MOBILE: { t: Rota['t']; label: string; icon?: React.ComponentType<{ size?: number }> }[] = [
  { t: 'inicio', label: 'Início', icon: Home },
  { t: 'ciclo', label: 'Ciclo', icon: CalendarRange },
  { t: 'general', label: 'General' },
  { t: 'habitos', label: 'Hábitos', icon: Repeat },
  { t: 'perfil', label: 'Perfil', icon: UserIcon },
];

const MENU_DESKTOP: { t: Rota['t']; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { t: 'inicio', label: 'Início', icon: Home },
  { t: 'ciclo', label: 'Ciclo', icon: CalendarRange },
  { t: 'areas', label: 'Áreas da Vida', icon: LayoutGrid },
  { t: 'habitos', label: 'Hábitos', icon: Repeat },
  { t: 'big3', label: 'Big 3', icon: Target },
  { t: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { t: 'perfil', label: 'Perfil', icon: UserIcon },
];

function Casca() {
  const { user } = useAuth();
  const { carregando } = useValente();
  const desktop = useDesktop();
  const [rota, setRota] = useState<Rota>({ t: 'inicio' });
  const [bloqueado, setBloqueado] = useState(() => localStorage.getItem('isLocked') === 'true');
  const [settings, setSettings] = useState<any>(null);

  const ir: Ir = (r) => {
    setRota(r);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'users', user.uid), (d) => d.exists() && setSettings(d.data()));
  }, [user]);

  // Toque em SIM/NÃO na notificação push abre "/?action=sim|nao" — processa uma vez ao montar.
  useEffect(() => {
    if (!user) return;
    const action = new URLSearchParams(window.location.search).get('action');
    if (action !== 'sim' && action !== 'nao') return;
    window.history.replaceState({}, '', window.location.pathname);
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/apply-daily-outcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ action }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || 'Falha ao registrar check-in');
        alert(result.status === 'completed_yes' ? 'Dia concluído e registrado.' : 'Sem problemas. Os itens pendentes continuam no sistema.');
      } catch (error) {
        console.error('Erro ao registrar check-in:', error);
        alert('Não foi possível registrar sua resposta agora.');
      }
    })();
  }, [user]);

  const ativo = itemAtivo(rota, desktop);

  if (carregando) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 text-cyan">
        <Capacete size={40} />
        <p className="rotulo animate-pulse">Carregando posição</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <AnimatePresence>
        {bloqueado && (
          <LockScreen
            userName={settings?.displayName || user?.displayName || 'Valente'}
            onUnlock={() => { setBloqueado(false); localStorage.setItem('isLocked', 'false'); }}
          />
        )}
      </AnimatePresence>

      {desktop && (
        <aside className="w-[220px] shrink-0 sticky top-0 h-screen border-r border-line bg-panel flex flex-col">
          <div className="p-5 border-b border-line">
            <Logo size={36} />
            <p className="rotulo mt-3" style={{ fontSize: 10 }}>Disciplina constrói liberdade.</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {MENU_DESKTOP.map((m) => {
              const on = ativo === m.t;
              const Icon = m.icon;
              return (
                <button
                  key={m.t}
                  onClick={() => ir({ t: m.t } as Rota)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left cursor-pointer transition-colors border"
                  style={{ borderColor: on ? 'var(--color-line2)' : 'transparent', background: on ? 'var(--color-deep)' : 'transparent', color: on ? 'var(--color-cyan)' : 'var(--color-mute)' }}
                >
                  <Icon size={17} /><span className="text-[14px]">{m.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-line flex items-center justify-between gap-2"><span className="text-xs text-mute truncate">{user?.email}</span><TemaToggle /></div>
        </aside>
      )}

      <main className="flex-1 min-w-0" style={{ paddingBottom: desktop ? 0 : 76 }}>
        <AnimatePresence mode="wait">
          <motion.div key={rotaKey(rota)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <Pagina rota={rota} ir={ir} desktop={desktop} />
          </motion.div>
        </AnimatePresence>
      </main>

      {!desktop && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-panel border-t border-line safe-bottom grid grid-cols-5">
          {MENU_MOBILE.map((m) => {
            const on = ativo === m.t;
            const Icon = m.icon;
            const cor = on ? 'var(--color-cyan)' : 'var(--color-mute)';
            if (!Icon) {
              return (
                <button key={m.t} onClick={() => ir({ t: m.t } as Rota)} className="flex flex-col items-center justify-end pb-2 cursor-pointer relative" aria-label="General">
                  <span className="absolute -top-6 w-14 h-14 rounded-full flex items-center justify-center bg-panel" style={{ border: `2px solid ${on ? 'var(--color-cyan)' : 'var(--color-line2)'}`, color: cor, boxShadow: on ? '0 0 18px color-mix(in srgb, var(--color-cyan) 35%, transparent)' : 'none' }}>
                    <Capacete size={30} cor={cor} />
                  </span>
                  <span className="rotulo mt-7" style={{ fontSize: 10, color: cor }}>{m.label}</span>
                </button>
              );
            }
            return (
              <button key={m.t} onClick={() => ir({ t: m.t } as Rota)} className="flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer" style={{ color: cor }}>
                <Icon size={20} />
                <span className="rotulo" style={{ fontSize: 10, color: cor }}>{m.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 text-cyan">
        <Capacete size={40} />
        <p className="rotulo animate-pulse">Iniciando sistema</p>
      </div>
    );
  }
  if (!user) return <Login />;

  return (
    <ValenteProvider>
      <Casca />
    </ValenteProvider>
  );
}
