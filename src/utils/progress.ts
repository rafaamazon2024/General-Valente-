import { GenericRecord } from '../types';

const DONE_STATUSES = ['Lido', 'Concluído', 'Finalizado', 'Realizado', 'Pago', 'Feito', 'Mestre'];

// Progresso 0-100 de um registro individual. Usado tanto pelos cards de Metas
// (DynamicGoals) quanto pelo score de área na Visão Geral, pra manter as duas
// telas consistentes e pra Roda da Vida refletir progresso real (streak, páginas
// lidas etc.) em vez de só "feito"/"não feito".
export function getRecordProgress(record: GenericRecord): number {
  const data = record.data || {};

  if (data.totalPaginas && data.paginaAtual !== undefined) {
    return Math.min(100, Math.round((data.paginaAtual / data.totalPaginas) * 100));
  }
  if (data.totalAulas && data.aulaAtual !== undefined) {
    return Math.min(100, Math.round((data.aulaAtual / data.totalAulas) * 100));
  }
  if (data.metaStreak && data.streakAtual !== undefined) {
    return Math.min(100, Math.round((data.streakAtual / data.metaStreak) * 100));
  }
  if (record.type === 'desafio') {
    const dias = Number(data.duracao) || 30;
    const feitos = Array.isArray(data.checkedDays) ? data.checkedDays.length : 0;
    return dias > 0 ? Math.min(100, Math.round((feitos / dias) * 100)) : 0;
  }
  if (DONE_STATUSES.includes(data.status)) {
    return 100;
  }
  return 0;
}
