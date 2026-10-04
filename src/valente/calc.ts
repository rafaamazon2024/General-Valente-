// Cálculos puros do General Valente. Tudo derivado de rotina_logs + valente_metricas + valente_config.

import type { DiaSemana } from '../config/rotinaSeed';
import { dateStr } from '../utils/date';
import {
  AREAS, AREA_POR_ID, MISSAO_POR_ID, META_KCAL, missoesDoDia, situacao,
  type AreaId, type Missao,
} from './areas';
import type { ConfigValente, EstadoMissao, LogDia, MetricasDia } from './store';

const INDEX_TO_DIA: DiaSemana[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
export const DIAS_SEMANA: { dia: DiaSemana; label: string }[] = [
  { dia: 'MO', label: 'Seg' }, { dia: 'TU', label: 'Ter' }, { dia: 'WE', label: 'Qua' },
  { dia: 'TH', label: 'Qui' }, { dia: 'FR', label: 'Sex' }, { dia: 'SA', label: 'Sáb' }, { dia: 'SU', label: 'Dom' },
];

export function parseData(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function somaDias(s: string, n: number): string {
  const d = parseData(s);
  d.setDate(d.getDate() + n);
  return dateStr(d);
}

export function diaDe(s: string): DiaSemana {
  return INDEX_TO_DIA[parseData(s).getDay()];
}

// ---------- Ciclo ----------

export interface SemanaInfo {
  n: number; // 1..12
  concluido: boolean;
  aindaNaoComecou: boolean;
}

export function semanaAtual(config: ConfigValente, hoje: string): SemanaInfo {
  const diff = Math.floor((parseData(hoje).getTime() - parseData(config.ciclo_inicio).getTime()) / 86400000);
  const bruto = Math.floor(diff / 7) + 1;
  return { n: Math.min(12, Math.max(1, bruto)), concluido: bruto > 12, aindaNaoComecou: bruto < 1 };
}

export function datasDaSemana(config: ConfigValente, n: number): string[] {
  const ini = somaDias(config.ciclo_inicio, (n - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => somaDias(ini, i));
}

// ---------- Execução ----------

export interface Execucao {
  planejado: number;
  feito: number;
  pct: number | null;
}

function pct(feito: number, planejado: number): number | null {
  return planejado === 0 ? null : Math.round((feito / planejado) * 100);
}

function feitosDoDia(logs: Record<string, LogDia>, date: string): string[] {
  return logs[date]?.feitos || [];
}

/** Execução somando só os dias já iniciados (<= hoje). */
export function execucaoDatas(
  datas: string[], logs: Record<string, LogDia>, hoje: string, area?: AreaId,
): Execucao {
  let planejado = 0;
  let feito = 0;
  for (const d of datas) {
    if (d > hoje) continue;
    const feitos = feitosDoDia(logs, d);
    for (const m of missoesDoDia(diaDe(d))) {
      if (area && m.area !== area) continue;
      planejado++;
      if (feitos.includes(m.id)) feito++;
    }
  }
  return { planejado, feito, pct: pct(feito, planejado) };
}

export function execucaoSemana(config: ConfigValente, n: number, logs: Record<string, LogDia>, hoje: string, area?: AreaId): Execucao {
  return execucaoDatas(datasDaSemana(config, n), logs, hoje, area);
}

export function execucaoDia(date: string, logs: Record<string, LogDia>): Execucao {
  const feitos = feitosDoDia(logs, date);
  const lista = missoesDoDia(diaDe(date));
  const feito = lista.filter((m) => feitos.includes(m.id)).length;
  return { planejado: lista.length, feito, pct: pct(feito, lista.length) };
}

export type CelulaHeat = 'feito' | 'parcial' | 'falha' | 'futuro' | 'vazio';

export function celulaHeat(area: AreaId, date: string, logs: Record<string, LogDia>, hoje: string): CelulaHeat {
  const lista = missoesDoDia(diaDe(date)).filter((m) => m.area === area);
  if (lista.length === 0) return 'vazio';
  if (date > hoje) return 'futuro';
  const feitos = feitosDoDia(logs, date);
  const n = lista.filter((m) => feitos.includes(m.id)).length;
  if (n === lista.length) return 'feito';
  if (n > 0) return 'parcial';
  return date === hoje ? 'futuro' : 'falha';
}

// ---------- Metas semanais ----------

export function metaSemanalMissoes(config: ConfigValente, n: number, area: AreaId): { missoes: number; minutos: number } {
  let missoes = 0;
  let minutos = 0;
  for (const d of datasDaSemana(config, n)) {
    for (const m of missoesDoDia(diaDe(d))) {
      if (m.area !== area) continue;
      missoes++;
      minutos += m.duracao || 0;
    }
  }
  return { missoes, minutos };
}

export function minutosFeitosSemana(config: ConfigValente, n: number, logs: Record<string, LogDia>, hoje: string, area: AreaId): number {
  let min = 0;
  for (const d of datasDaSemana(config, n)) {
    if (d > hoje) continue;
    const feitos = feitosDoDia(logs, d);
    for (const m of missoesDoDia(diaDe(d))) {
      if (m.area === area && feitos.includes(m.id)) min += m.duracao || 0;
    }
  }
  return min;
}

// ---------- Métricas ----------

export function valorMetrica(metricas: Record<string, MetricasDia>, date: string, key: string): number {
  const v = metricas[date]?.valores?.[key];
  return typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : 0;
}

export function kcalDoDia(metricas: Record<string, MetricasDia>, date: string): number {
  return (metricas[date]?.refeicoes || []).reduce((s, r) => s + (r.kcal || 0), 0);
}

export function somaMetricaSemana(config: ConfigValente, n: number, metricas: Record<string, MetricasDia>, key: string): number {
  return datasDaSemana(config, n).reduce((s, d) => s + valorMetrica(metricas, d, key), 0);
}

/** Último peso registrado até a data (peso é um estado, não um fluxo). */
export function ultimoPeso(metricas: Record<string, MetricasDia>): { peso: number; data: string } | null {
  const datas = Object.keys(metricas).filter((d) => typeof metricas[d].valores?.peso === 'number' && (metricas[d].valores.peso as number) > 0).sort();
  if (!datas.length) return null;
  const d = datas[datas.length - 1];
  return { peso: metricas[d].valores.peso as number, data: d };
}

export function aderenciaAlimentar(metricas: Record<string, MetricasDia>, datas: string[], hoje: string): number | null {
  const registrados = datas.filter((d) => d <= hoje && (metricas[d]?.refeicoes?.length || 0) > 0);
  if (!registrados.length) return null;
  const dentro = registrados.filter((d) => kcalDoDia(metricas, d) <= META_KCAL).length;
  return Math.round((dentro / registrados.length) * 100);
}

// ---------- Sequência (dia mínimo conta) ----------

export const LIMITE_DIA_MINIMO = 40;
export const LIMITE_DIA_CHEIO = 70;

export interface Sequencia {
  dias: number;
  cheios: number;
  minimos: number;
  /** Dias seguidos de plano retomado depois de uma quebra (recuperação). */
  emRecuperacao: boolean;
}

export function sequencia(config: ConfigValente, logs: Record<string, LogDia>, hoje: string): Sequencia {
  let dias = 0, cheios = 0, minimos = 0;
  let d = hoje;
  const piso = config.ciclo_inicio;
  const hojeEx = execucaoDia(hoje, logs).pct ?? 0;
  if (hojeEx >= LIMITE_DIA_MINIMO) {
    dias++;
    if (hojeEx >= LIMITE_DIA_CHEIO) cheios++; else minimos++;
  }
  d = somaDias(hoje, -1);
  while (d >= piso) {
    const p = execucaoDia(d, logs).pct ?? 0;
    if (p < LIMITE_DIA_MINIMO) break;
    dias++;
    if (p >= LIMITE_DIA_CHEIO) cheios++; else minimos++;
    d = somaDias(d, -1);
  }
  // Recuperação: sequência atual curta, mas já houve sequência maior antes da quebra.
  let emRecuperacao = false;
  if (d >= piso && dias > 0 && dias < 3) {
    let maior = 0, cur = 0;
    for (let x = piso; x <= hoje; x = somaDias(x, 1)) {
      const p = execucaoDia(x, logs).pct ?? 0;
      if (p >= LIMITE_DIA_MINIMO) { cur++; maior = Math.max(maior, cur); } else cur = 0;
    }
    emRecuperacao = maior > dias;
  }
  return { dias, cheios, minimos, emRecuperacao };
}

// ---------- Próxima ação ----------

export interface ProximaAcao {
  missao: Missao;
  motivo: 'em-andamento' | 'agora' | 'proxima' | 'sem-horario' | 'adiada';
}

function minutosDe(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function proximaAcao(
  hoje: string, agora: Date, estado: (id: string, date?: string) => EstadoMissao,
): ProximaAcao | null {
  const lista = missoesDoDia(diaDe(hoje));
  const abertas = lista.filter((m) => estado(m.id, hoje) !== 'feita');
  const andamento = abertas.find((m) => estado(m.id, hoje) === 'iniciada');
  if (andamento) return { missao: andamento, motivo: 'em-andamento' };

  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  const pendentes = abertas.filter((m) => estado(m.id, hoje) === 'pendente');
  const agoraM = pendentes.find((m) => m.inicio && m.fim && agoraMin >= minutosDe(m.inicio) && agoraMin < minutosDe(m.fim));
  if (agoraM) return { missao: agoraM, motivo: 'agora' };

  const proxima = pendentes.find((m) => m.inicio && minutosDe(m.inicio) >= agoraMin);
  if (proxima) return { missao: proxima, motivo: 'proxima' };

  const semHorario = pendentes.find((m) => !m.inicio);
  if (semHorario) return { missao: semHorario, motivo: 'sem-horario' };

  const adiada = abertas.find((m) => estado(m.id, hoje) === 'adiada');
  if (adiada) return { missao: adiada, motivo: 'adiada' };

  // Missões cujo horário já passou e seguem pendentes entram como recuperação.
  const atrasada = pendentes[0];
  if (atrasada) return { missao: atrasada, motivo: 'adiada' };
  return null;
}

// ---------- Alerta e diagnóstico ----------

export interface Alerta {
  area: AreaId | null;
  texto: string;
}

export function porArea(
  config: ConfigValente, n: number, logs: Record<string, LogDia>, hoje: string,
): { area: AreaId; exec: Execucao }[] {
  return AREAS.map((a) => ({ area: a.id, exec: execucaoSemana(config, n, logs, hoje, a.id) }));
}

export function alertaGeneral(
  config: ConfigValente, n: number, logs: Record<string, LogDia>, metricas: Record<string, MetricasDia>, hoje: string,
): Alerta | null {
  const kcal = kcalDoDia(metricas, hoje);
  if (kcal > META_KCAL) {
    return { area: 'alimentacao', texto: `Alimentação: ${kcal} kcal registradas hoje, ${kcal - META_KCAL} acima da meta de ${META_KCAL}. Feche o dia com água e sem novos registros.` };
  }
  const medidas = porArea(config, n, logs, hoje).filter((x) => x.exec.pct !== null);
  if (!medidas.length) return null;
  const pior = medidas.reduce((a, b) => ((a.exec.pct as number) <= (b.exec.pct as number) ? a : b));
  if ((pior.exec.pct as number) >= LIMITE_DIA_CHEIO) return null;
  const nome = AREA_POR_ID[pior.area].nome;
  return {
    area: pior.area,
    texto: `${nome} está abaixo da meta semanal: ${pior.exec.feito} de ${pior.exec.planejado} missões cumpridas (${pior.exec.pct}%).`,
  };
}

export interface Diagnostico {
  frases: string[];
}

export function diagnostico(
  config: ConfigValente, n: number, logs: Record<string, LogDia>, metricas: Record<string, MetricasDia>, hoje: string,
  proxima: ProximaAcao | null, nome: string,
): Diagnostico {
  const geral = execucaoSemana(config, n, logs, hoje);
  const anterior = n > 1 ? execucaoSemana(config, n - 1, logs, hoje) : null;
  const areas = porArea(config, n, logs, hoje).filter((x) => x.exec.pct !== null);
  const fortes = areas.filter((x) => situacao(x.exec.pct) === 'otimo').map((x) => AREA_POR_ID[x.area].nome);
  const fracas = areas.filter((x) => situacao(x.exec.pct) !== 'otimo')
    .sort((a, b) => (a.exec.pct as number) - (b.exec.pct as number))
    .map((x) => `${AREA_POR_ID[x.area].nome} (${x.exec.pct}%)`);

  const frases: string[] = [];
  if (geral.pct === null) {
    frases.push(`${nome}, a semana ${n} ainda não tem missões vencidas para medir. Comece pela próxima ação.`);
  } else {
    let tendencia = '';
    if (anterior?.pct !== null && anterior?.pct !== undefined) {
      const dif = geral.pct - anterior.pct;
      tendencia = dif > 3 ? `, ${dif} pontos acima da semana passada` : dif < -3 ? `, ${Math.abs(dif)} pontos abaixo da semana passada` : ', no mesmo nível da semana passada';
    }
    frases.push(`${nome}, a execução da semana ${n} está em ${geral.pct}% (${geral.feito} de ${geral.planejado} missões)${tendencia}.`);
  }
  if (fortes.length) frases.push(`Consistentes: ${fortes.join(', ')}.`);
  if (fracas.length) frases.push(`Pedem atenção: ${fracas.join(', ')}.`);

  const kcal = kcalDoDia(metricas, hoje);
  if (kcal > 0) frases.push(`Alimentação de hoje: ${kcal} de ${META_KCAL} kcal.`);

  if (proxima) {
    const m = proxima.missao;
    frases.push(`Próximo movimento: ${m.titulo}${m.duracao ? ` (${m.duracao} min)` : ''}.`);
  } else {
    frases.push('Todas as missões de hoje estão fechadas. Registre o que aprendeu e descanse.');
  }
  return { frases };
}

export function nomeMissao(id: string): string {
  return MISSAO_POR_ID[id]?.titulo || id;
}
