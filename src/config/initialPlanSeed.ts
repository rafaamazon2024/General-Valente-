import { DECLARACAO, FRENTES, INICIO_OPERACAO } from './frentesSeed';

export type InitialRecord = {
  area_id: string;
  type: string;
  data: Record<string, unknown> & { seedKey: string };
};

function addMonths(months: number) {
  const date = new Date(`${INICIO_OPERACAO}T12:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

const metas: InitialRecord[] = FRENTES.flatMap((frente) => {
  const main: InitialRecord = {
    area_id: frente.areaId,
    type: 'meta',
    data: {
      seedKey: `frente:${frente.id}:destino`,
      titulo: frente.alvo,
      prazo: addMonths(12),
      status: 'Em Andamento',
      objetivo: frente.porque,
      notaPartida: frente.notaPartida,
      notaAlvo: frente.notaAlvo,
    },
  };
  const milestones = frente.marcos.map((marco): InitialRecord => ({
    area_id: frente.areaId,
    type: 'meta',
    data: {
      seedKey: `frente:${frente.id}:marco:${marco.id}`,
      titulo: marco.titulo,
      prazo: addMonths(marco.prazoMeses),
      status: 'Pendente',
      metaPai: frente.alvo,
    },
  }));
  return [main, ...milestones];
});

const cursos: InitialRecord[] = [
  ['curso:elainne', 'Cursos de espiritualidade da Elainne', 'Elainne'],
  ['curso:pablo', 'Mentoria do Pablo', 'Pablo'],
  ['curso:sobral', 'Formação do Sobral', 'Sobral'],
  ['curso:comunicacao', 'Comunicação', ''],
  ['curso:autoevolucao', 'Autoevolução', ''],
  ['curso:mentalidade', 'Mentalidade', ''],
  ['curso:pnl', 'Programação Neurolinguística (PNL)', ''],
  ['curso:memoria', 'Memória e memorização', ''],
].map(([seedKey, nome, instrutor]) => ({
  area_id: 'desenvolvimento',
  type: 'curso',
  data: { seedKey, nome, instrutor, plataforma: 'Outro', status: 'Não Iniciado', categoria: 'Outros', notas: 'Cadastrar módulos, aulas, materiais, resumos e implementações.' },
}));

const espiritualidade: InitialRecord[] = [
  ['terco', 'Terço', 10], ['diario', 'Diário', 5], ['biblia', 'Bíblia', 10],
  ['meditacao', 'Meditação', 15], ['hooponopono', 'Ho’oponopono', 10],
  ['frases_poder', 'Frases de poder', 5], ['agradecimento', 'Agradecimento', 10],
  ['subliminares', 'Vídeos subliminares', 10],
].map(([id, nome, duracao]) => ({
  area_id: 'espiritualidade',
  type: 'pratica',
  data: { seedKey: `espiritual:${id}`, nome, duracao, horario: '05:00', streak: 0, meta: 30, status: 'Ativo' },
}));

const desenvolvimento: InitialRecord[] = [
  {
    area_id: 'desenvolvimento', type: 'livro', data: {
      seedKey: 'livro:pense_magro', titulo: 'Pense Magro', autor: 'Judith S. Beck', categoria: 'Psicologia', status: 'Lendo', notas: 'Jornada prática de 42 dias integrada à área Saúde & Fitness.',
    },
  },
  {
    area_id: 'desenvolvimento', type: 'habito', data: {
      seedKey: 'habito:leitura_aprofundada', nome: 'Leitura aprofundada', descricao: 'Leitura diária com resumo supremo e implementação prática.', frequencia: 'Diária', duracaoAlvo: '40 minutos', meta: 'Ler, resumir e aplicar', metaStreak: 30, horarioIdeal: '06:35', lembrete: true, categoria: 'Desenvolvimento', status: 'Ativo',
    },
  },
];

export const INITIAL_PLAN_RECORDS: InitialRecord[] = [...metas, ...cursos, ...espiritualidade, ...desenvolvimento];
export const INITIAL_SUPREME_GOAL = DECLARACAO;
