import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  db, collection, doc, query, where, onSnapshot, setDoc, arrayUnion, arrayRemove,
  handleFirestoreError, OperationType,
} from '../firebase';
import { useAuth } from '../components/AuthContext';
import { dateStr, todayStr } from '../utils/date';
import type { AreaId } from './areas';
import type { BlocoRotina } from '../config/rotinaSeed';

// ---------- Tipos ----------

export interface LogDia {
  feitos: string[];
  iniciados: string[];
  adiados: string[];
}

export interface Big3Item {
  id: string;
  titulo: string;
  progresso: number; // 0-100
}

export interface Revisao {
  destaques: string;
  deuCerto: string;
  deuErrado: string;
  licoes: string;
  big3Proxima: string[];
  criadaEm: string;
}

export interface Refeicao {
  id: string;
  nome: string;
  kcal: number;
}

export interface MetricasDia {
  valores: Record<string, number | boolean>;
  refeicoes: Refeicao[];
}

export interface ConfigValente {
  rotina?: BlocoRotina[];
  metaKcal?: number;
  ciclo_inicio: string;
  metas: Partial<Record<AreaId, string>>;
  big3: Record<string, Big3Item[]>;
  revisoes: Record<string, Revisao>;
  livro?: { titulo: string; total: number; atual: number };
  memoria40?: { inicio: string; foco: string };
}

export type EstadoMissao = 'pendente' | 'iniciada' | 'adiada' | 'feita';

function segundaDaSemana(d: Date): string {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // segunda = 0
  x.setDate(x.getDate() - dow);
  return dateStr(x);
}

// ---------- Contexto ----------

interface ValenteCtx {
  erro: string;
  carregando: boolean;
  logs: Record<string, LogDia>;
  metricas: Record<string, MetricasDia>;
  config: ConfigValente;
  hoje: string;
  estadoMissao: (id: string, date?: string) => EstadoMissao;
  mudarMissao: (id: string, acao: 'concluir' | 'iniciar' | 'adiar' | 'reabrir', date?: string) => Promise<void>;
  setMetrica: (date: string, key: string, valor: number | boolean) => Promise<void>;
  addRefeicao: (date: string, nome: string, kcal: number, atuais: Refeicao[]) => Promise<void>;
  removeRefeicao: (date: string, id: string, atuais: Refeicao[]) => Promise<void>;
  salvarConfig: (parcial: Record<string, unknown>) => Promise<void>;
}

export const Ctx = createContext<ValenteCtx | null>(null);
export type { ValenteCtx };

export function useValente(): ValenteCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useValente fora do ValenteProvider');
  return c;
}

export function ValenteProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Record<string, LogDia>>({});
  const [erro, setErro] = useState('');
  const [metricas, setMetricas] = useState<Record<string, MetricasDia>>({});
  const [configRaw, setConfigRaw] = useState<Partial<ConfigValente> | null>(null);
  const [rotina, setRotina] = useState<BlocoRotina[] | undefined>();
  const [prontos, setProntos] = useState({ logs: false, metricas: false, config: false, rotina: false });
  const [hoje, setHoje] = useState(todayStr);
  useEffect(() => { const timer = setInterval(() => setHoje(todayStr()), 30000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    if (!user) return;
    setErro(''); setLogs({}); setMetricas({}); setConfigRaw(null);
    setRotina(undefined); setProntos({ logs: false, metricas: false, config: false, rotina: false });
    const uid = user.uid;
    const marca = (k: 'logs' | 'metricas' | 'config' | 'rotina') => setProntos((p) => ({ ...p, [k]: true }));

    const u1 = onSnapshot(
      query(collection(db, 'rotina_logs'), where('uid', '==', uid)),
      (snap) => {
        const out: Record<string, LogDia> = {};
        snap.docs.forEach((d) => {
          const x = d.data() as any;
          if (!x.date) return;
          out[x.date] = {
            feitos: x.blocos_feitos || [],
            iniciados: x.blocos_iniciados || [],
            adiados: x.blocos_adiados || [],
          };
        });
        setLogs(out);
        marca('logs');
      },
      (err) => { setErro('Não foi possível carregar os checks da rotina. Verifique sua conexão e permissões.'); handleFirestoreError(err, OperationType.LIST, 'rotina_logs'); marca('logs'); },
    );

    const u2 = onSnapshot(
      query(collection(db, 'valente_metricas'), where('uid', '==', uid)),
      (snap) => {
        const out: Record<string, MetricasDia> = {};
        snap.docs.forEach((d) => {
          const x = d.data() as any;
          if (!x.date) return;
          out[x.date] = { valores: x.valores || {}, refeicoes: x.refeicoes || [] };
        });
        setMetricas(out);
        marca('metricas');
      },
      (err) => { setErro('Não foi possível carregar seus indicadores. Verifique sua conexão e permissões.'); handleFirestoreError(err, OperationType.LIST, 'valente_metricas'); marca('metricas'); },
    );

    const u3 = onSnapshot(
      doc(db, 'valente_config', uid),
      (snap) => {
        setConfigRaw(snap.exists() ? (snap.data() as Partial<ConfigValente>) : {});
        marca('config');
      },
      (err) => { setErro('Não foi possível carregar as metas da conta. Recarregue antes de editar.'); handleFirestoreError(err, OperationType.GET, `valente_config/${uid}`); marca('config'); },
    );

    const u4 = onSnapshot(doc(db, 'rotina_config', uid), snap => { const b = snap.data()?.blocos; setRotina(Array.isArray(b) ? b : undefined); marca('rotina'); }, () => { setErro('Não foi possível carregar a agenda personalizada. Recarregue antes de editar.'); marca('rotina'); });
    return () => { u1(); u2(); u3(); u4(); };
  }, [user]);

  // Ler a conta não cria nem substitui um ciclo. O início é salvo explicitamente no Perfil.

  const config: ConfigValente = useMemo(() => ({
    rotina,
    ciclo_inicio: configRaw?.ciclo_inicio || segundaDaSemana(new Date()),
    metas: configRaw?.metas || {},
    big3: configRaw?.big3 || {},
    revisoes: configRaw?.revisoes || {},
    livro: configRaw?.livro,
    memoria40: configRaw?.memoria40,
    metaKcal: configRaw?.metaKcal,
  }), [configRaw, rotina]);

  const estadoMissao = useCallback((id: string, date: string = hoje): EstadoMissao => {
    const l = logs[date];
    if (!l) return 'pendente';
    if (l.feitos.includes(id)) return 'feita';
    if (l.iniciados.includes(id)) return 'iniciada';
    if (l.adiados.includes(id)) return 'adiada';
    return 'pendente';
  }, [logs, hoje]);

  const mudarMissao = useCallback(async (id: string, acao: 'concluir' | 'iniciar' | 'adiar' | 'reabrir', date: string = hoje) => {
    if (!user) return;
    const campos: Record<string, unknown> = { uid: user.uid, date, updated_at: new Date().toISOString() };
    const feitos = acao === 'concluir' ? arrayUnion(id) : arrayRemove(id);
    const iniciados = acao === 'iniciar' ? arrayUnion(id) : arrayRemove(id);
    const adiados = acao === 'adiar' ? arrayUnion(id) : arrayRemove(id);
    campos.blocos_feitos = feitos;
    campos.blocos_iniciados = iniciados;
    campos.blocos_adiados = adiados;
    try {
      await setDoc(doc(db, 'rotina_logs', `${user.uid}_${date}`), campos, { merge: true });
    } catch (e) {
      setErro('Não foi possível salvar o check. Tente novamente.');
      handleFirestoreError(e, OperationType.UPDATE, `rotina_logs/${user.uid}_${date}`);
      throw e;
    }
  }, [user, hoje]);

  const escreverMetricas = useCallback(async (date: string, dados: Record<string, unknown>) => {
    if (!user) return;
    try {
      await setDoc(
        doc(db, 'valente_metricas', `${user.uid}_${date}`),
        { uid: user.uid, date, updated_at: new Date().toISOString(), ...dados },
        { merge: true },
      );
    } catch (e) {
      setErro('Não foi possível salvar o indicador. Tente novamente.');
      handleFirestoreError(e, OperationType.UPDATE, `valente_metricas/${user.uid}_${date}`);
    }
  }, [user]);

  const setMetrica = useCallback((date: string, key: string, valor: number | boolean) =>
    escreverMetricas(date, { valores: { [key]: valor } }), [escreverMetricas]);

  const addRefeicao = useCallback((date: string, nome: string, kcal: number, atuais: Refeicao[]) =>
    escreverMetricas(date, { refeicoes: arrayUnion({ id: crypto.randomUUID(), nome, kcal }) }), [escreverMetricas]);

  const removeRefeicao = useCallback((date: string, id: string, atuais: Refeicao[]) =>
    escreverMetricas(date, { refeicoes: arrayRemove(...atuais.filter((r) => r.id === id)) }), [escreverMetricas]);

  const salvarConfig = useCallback(async (parcial: Record<string, unknown>) => {
    if (!user) return;
    if (configRaw === null) { setErro('A configuração ainda não foi carregada. Recarregue antes de editar.'); return; }
    try {
      await setDoc(
        doc(db, 'valente_config', user.uid),
        { uid: user.uid, updated_at: new Date().toISOString(), ...parcial },
        { merge: true },
      );
    } catch (e) {
      setErro('Não foi possível salvar suas configurações. Tente novamente.');
      handleFirestoreError(e, OperationType.UPDATE, `valente_config/${user.uid}`);
    }
  }, [user, configRaw]);

  const value: ValenteCtx = {
    erro,
    carregando: !(prontos.logs && prontos.metricas && prontos.config && prontos.rotina),
    logs, metricas, config, hoje,
    estadoMissao, mudarMissao, setMetrica, addRefeicao, removeRefeicao, salvarConfig,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
