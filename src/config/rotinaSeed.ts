// Rotina fixa do Rafael, importada da agenda do Google em 18/08/2026.
// Fonte da verdade dos blocos: este arquivo. O que vai pro Firestore é só o
// check-in diário (quais blocos foram cumpridos), na coleção rotina_logs.

export type DiaSemana = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';

export type CategoriaRotina =
  | 'descanso'
  | 'ritual'
  | 'aprendizado'
  | 'estudo'
  | 'corpo'
  | 'trabalho'
  | 'vendas'
  | 'pausa'
  | 'meditacao';

export interface BlocoRotina {
  id: string;
  titulo: string;
  inicio: string; // HH:MM
  fim: string;    // HH:MM
  dias: DiaSemana[];
  categoria: CategoriaRotina;
  nota: string;
}

export const CATEGORIA_META: Record<CategoriaRotina, { label: string; cor: string }> = {
  descanso:   { label: 'Descanso',    cor: '#3F51B5' },
  ritual:     { label: 'Ritual',      cor: '#F4511E' },
  aprendizado:{ label: 'Aprendizado', cor: '#D50000' },
  estudo:     { label: 'Estudo',      cor: '#039BE5' },
  corpo:      { label: 'Corpo',       cor: '#0B8043' },
  trabalho:   { label: 'Trabalho',    cor: '#8E24AA' },
  vendas:     { label: 'Vendas',      cor: '#D97706' },
  pausa:      { label: 'Pausa',       cor: '#0E7490' },
  meditacao:  { label: 'Meditação',   cor: '#E67C73' },
};

const TODOS: DiaSemana[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const UTEIS: DiaSemana[] = ['MO', 'TU', 'WE', 'TH', 'FR'];

export const ROTINA: BlocoRotina[] = [
  { id: 'ritual_manha', titulo: 'Ritual da manhã', inicio: '05:00', fim: '06:35', dias: TODOS, categoria: 'ritual',
    nota: 'Terço 10m; Diário 5m; Bíblia 10m; meditação 15m; Ho’oponopono 10m; frases de poder 5m; agradecimento 10m; vídeos subliminares 10m; leitura 10m; atividade física 10m.' },
  { id: 'leitura_aprofundada', titulo: 'Leitura aprofundada', inicio: '06:35', fim: '07:15', dias: TODOS, categoria: 'aprendizado',
    nota: 'Leitura diária com execução dos exercícios do livro.' },
  { id: 'memorizacao', titulo: 'Memorização', inicio: '07:15', fim: '07:55', dias: ['MO', 'WE', 'FR'], categoria: 'aprendizado',
    nota: 'Treino de memorização.' },
  { id: 'comunicacao', titulo: 'Comunicação', inicio: '07:15', fim: '07:55', dias: ['TU', 'TH', 'SA'], categoria: 'aprendizado',
    nota: 'Treino de comunicação.' },
  { id: 'estudo_1_3', titulo: 'Estudo 1/3', inicio: '07:55', fim: '08:55', dias: ['MO', 'WE', 'FR'], categoria: 'estudo',
    nota: 'Primeira hora das 3 horas de estudo do dia.' },
  { id: 'estudo_manha', titulo: 'Estudo — manhã', inicio: '07:55', fim: '10:20', dias: ['TU', 'TH'], categoria: 'estudo',
    nota: 'Bloco de estudo de 2h25.' },
  { id: 'academia', titulo: 'Academia + deslocamento + banho', inicio: '08:55', fim: '10:20', dias: ['MO', 'WE', 'FR', 'SA'], categoria: 'corpo',
    nota: '08:55 saída; 09:05–09:55 treino; 09:55–10:05 volta; 10:05–10:20 banho.' },
  { id: 'trabalho_manha', titulo: 'Trabalho — manhã', inicio: '10:20', fim: '12:00', dias: UTEIS, categoria: 'trabalho',
    nota: 'Bloco de trabalho em home office — 1h40.' },
  { id: 'almoco', titulo: 'Almoço', inicio: '12:00', fim: '13:00', dias: TODOS, categoria: 'pausa',
    nota: 'Almoço e pausa.' },
  { id: 'trabalho_inicio_tarde', titulo: 'Trabalho — início da tarde', inicio: '13:00', fim: '14:00', dias: UTEIS, categoria: 'trabalho',
    nota: 'Bloco de trabalho em home office — 1h.' },
  { id: 'vendas', titulo: 'Vendas', inicio: '14:00', fim: '15:00', dias: UTEIS, categoria: 'vendas',
    nota: 'Uma hora diária de vendas.' },
  { id: 'trabalho_tarde', titulo: 'Trabalho — tarde', inicio: '15:00', fim: '17:20', dias: UTEIS, categoria: 'trabalho',
    nota: 'Bloco de trabalho em home office — 2h20. Total de trabalho do dia: 5 horas.' },
  { id: 'trote', titulo: 'Trote', inicio: '17:20', fim: '18:00', dias: ['TU', 'TH', 'SA'], categoria: 'corpo',
    nota: 'Trote no centro social ao lado de casa.' },
  { id: 'estudo_2_3_3_3', titulo: 'Estudo 2/3 e 3/3', inicio: '18:00', fim: '20:00', dias: ['MO', 'WE', 'FR'], categoria: 'estudo',
    nota: 'Duas horas finais das 3 horas de estudo do dia.' },
  { id: 'estudo_fechamento', titulo: 'Estudo — fechamento', inicio: '19:00', fim: '19:35', dias: ['TU', 'TH'], categoria: 'estudo',
    nota: '35 minutos finais para completar as 3 horas de estudo.' },
  { id: 'meditacao_ter_qui', titulo: 'Meditação / curso', inicio: '19:35', fim: '20:35', dias: ['TU', 'TH'], categoria: 'meditacao',
    nota: 'Prática e aulas do curso de meditação.' },
  { id: 'meditacao_seg_qua_sex', titulo: 'Meditação / curso', inicio: '20:00', fim: '21:00', dias: ['MO', 'WE', 'FR'], categoria: 'meditacao',
    nota: 'Prática e aulas do curso de meditação.' },
  { id: 'sono', titulo: 'Sono', inicio: '23:00', fim: '05:00', dias: TODOS, categoria: 'descanso',
    nota: 'Dormir às 23h e acordar às 5h.' },
];

export const DIAS_ORDEM: DiaSemana[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export const DIA_LABEL: Record<DiaSemana, string> = {
  MO: 'Seg', TU: 'Ter', WE: 'Qua', TH: 'Qui', FR: 'Sex', SA: 'Sáb', SU: 'Dom',
};

const INDEX_TO_DIA: DiaSemana[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export function diaDaSemana(d: Date = new Date()): DiaSemana {
  return INDEX_TO_DIA[d.getDay()];
}

export function blocosDoDia(dia: DiaSemana): BlocoRotina[] {
  return ROTINA.filter(b => b.dias.includes(dia)).sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function duracaoMin(b: BlocoRotina): number {
  const ini = minutos(b.inicio);
  const fim = minutos(b.fim);
  return fim > ini ? fim - ini : fim + 24 * 60 - ini;
}

export function formatarDuracao(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

/** Bloco que está acontecendo no horário informado (trata o bloco que cruza a meia-noite). */
export function blocoAgora(dia: DiaSemana, agoraMin: number): BlocoRotina | null {
  for (const b of blocosDoDia(dia)) {
    const ini = minutos(b.inicio);
    const fim = minutos(b.fim);
    const dentro = fim > ini ? agoraMin >= ini && agoraMin < fim : agoraMin >= ini || agoraMin < fim;
    if (dentro) return b;
  }
  return null;
}
