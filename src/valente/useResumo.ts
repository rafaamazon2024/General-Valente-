import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { AREAS, missoesDoDia, type AreaId, type Missao } from './areas';
import {
  alertaGeneral, diagnostico, diaDe, execucaoDia, execucaoSemana, porArea, proximaAcao, semanaAtual, sequencia,
} from './calc';
import { useValente, type Big3Item, type EstadoMissao } from './store';

export interface MissaoComEstado extends Missao {
  estado: EstadoMissao;
}

export function primeiroNome(nome?: string | null): string {
  return (nome || 'Rafael').trim().split(/\s+/)[0];
}

export function saudacao(d: Date): string {
  const h = d.getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export const FRASES_GENERAL = [
  'Seu foco hoje é obedecer ao plano, não ao humor.',
  'Pensar macro, executar micro: uma missão por vez.',
  'Dia ruim cumpre o mínimo. Dia bom cumpre o plano.',
  'Disciplina constrói liberdade.',
  'O plano já foi decidido. Agora é só executar.',
  'Constância vence intensidade.',
  'Registre, agradeça, avance.',
];

export function useResumo() {
  const { user } = useAuth();
  const v = useValente();
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return useMemo(() => {
    const { config, logs, metricas, hoje, estadoMissao } = v;
    const semana = semanaAtual(config, hoje);
    const execSemana = execucaoSemana(config, semana.n, logs, hoje);
    const execHoje = execucaoDia(hoje, logs);
    const anterior = semana.n > 1 ? execucaoSemana(config, semana.n - 1, logs, hoje).pct : null;
    const delta = execSemana.pct !== null && anterior !== null ? execSemana.pct - anterior : null;
    const areas = porArea(config, semana.n, logs, hoje);
    const pcts = Object.fromEntries(areas.map((a) => [a.area, a.exec.pct])) as Record<AreaId, number | null>;
    const missoes: MissaoComEstado[] = missoesDoDia(diaDe(hoje)).map((m) => ({ ...m, estado: estadoMissao(m.id, hoje) }));
    const proxima = proximaAcao(hoje, agora, estadoMissao);
    const alerta = alertaGeneral(config, semana.n, logs, metricas, hoje);
    const nome = primeiroNome(user?.displayName);
    const diag = diagnostico(config, semana.n, logs, metricas, hoje, proxima, nome);
    const seq = sequencia(config, logs, hoje);
    const big3: Big3Item[] = config.big3[String(semana.n)] || [];
    const frase = FRASES_GENERAL[Math.floor(agora.getTime() / 86400000) % FRASES_GENERAL.length];
    return { ...v, agora, semana, delta, execSemana, execHoje, areas, pcts, missoes, proxima, alerta, diag, seq, big3, nome, frase, AREAS };
  }, [v, agora, user]);
}
