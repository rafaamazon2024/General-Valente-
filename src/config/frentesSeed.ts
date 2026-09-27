// As Frentes do Quartel General.
//
// Uma Frente é uma área da vida com linha de partida e destino declarado —
// diferente de "área", que é só uma gaveta. Notas de partida e alvos vêm da
// anamnese pessoal (18/08/2026). É o topo da cadeia:
//
//   Declaração → Frente → Marco → Meta → Tarefa/Hábito/Bloco de rotina → Check
//
// Enquanto o app tiver um único operador, esta é a fonte da verdade. Quando
// virar multiusuário, cada um responde a anamnese e gera as próprias frentes.

export const DECLARACAO =
  'Deixar de viver uma vida disfuncional e me tornar um novo homem: equilibrado em todas as ' +
  'áreas, bem física e mentalmente, realizado profissionalmente, financeiramente livre, ' +
  'conectado com Deus, presente para meu filho e capaz de construir uma vida plena, leve e feliz.';

export interface Marco {
  id: string;
  titulo: string;
  /** Prazo em meses a partir do início da operação. */
  prazoMeses: number;
}

/**
 * 'entrada'      — frente que se alimenta com tempo na rotina. Se não tem bloco, é um alarme.
 * 'consequencia' — frente que não se conquista com bloco na agenda; ela é o preço pago pelas
 *                  outras. Nunca sinalizar "sem tempo alocado" numa frente de consequência.
 */
export type TipoFrente = 'entrada' | 'consequencia';

export interface Frente {
  id: string;
  nome: string;
  tipo: TipoFrente;
  /** id da área em CONFIG_AREAS que alimenta esta frente. */
  areaId: string;
  /** Nota 0-10 declarada na anamnese. Linha de partida — não muda. */
  notaPartida: number;
  /** Nota 0-10 pretendida em 12 meses. */
  notaAlvo: number;
  /** O destino, na linguagem do próprio operador. */
  alvo: string;
  /** Por que esta frente existe. */
  porque: string;
  marcos: Marco[];
  cor: string;
}

/** Início da operação: Mês 1. */
export const INICIO_OPERACAO = '2026-08-01';

export const FRENTES: Frente[] = [
  {
    id: 'financeira',
    tipo: 'entrada',
    nome: 'Financeira',
    areaId: 'financas',
    notaPartida: 0,
    notaAlvo: 9,
    alvo: 'R$ 20 mil por mês, investindo mensalmente',
    porque: 'É o zero que sustenta carro, viagem, investimento e boa parte da paz mental.',
    marcos: [
      { id: 'fin_15k', titulo: 'Primeiro mês fechando R$ 15 mil', prazoMeses: 6 },
      { id: 'fin_invest', titulo: 'Primeiro aporte mensal feito', prazoMeses: 7 },
      { id: 'fin_20k', titulo: 'R$ 20 mil por mês sustentados', prazoMeses: 12 },
    ],
    cor: '#D50000',
  },
  {
    id: 'carreira',
    tipo: 'entrada',
    nome: 'Carreira',
    areaId: 'carreira',
    notaPartida: 6,
    notaAlvo: 9,
    alvo: 'Agência de IA funcionando',
    porque: 'É o motor da frente financeira. As 5h diárias de trabalho constroem ela.',
    marcos: [
      {
        id: 'car_oferta',
        titulo: 'Oferta comercial clara: público, problema, solução, preço',
        prazoMeses: 1,
      },
      { id: 'car_ativo', titulo: 'Primeiro ativo profissional utilizável entregue', prazoMeses: 2 },
      { id: 'car_clientes', titulo: 'Carteira recorrente de clientes', prazoMeses: 8 },
    ],
    cor: '#8E24AA',
  },
  {
    id: 'saude',
    tipo: 'entrada',
    nome: 'Saúde física',
    areaId: 'saude',
    notaPartida: 6,
    notaAlvo: 9,
    alvo: 'Menos 30 kg e bem fisicamente',
    porque: 'Corpo é a base de energia de todas as outras frentes.',
    marcos: [
      { id: 'sau_mes1', titulo: '18 a 22 treinos no Mês 1', prazoMeses: 1 },
      { id: 'sau_15kg', titulo: 'Metade do caminho: menos 15 kg', prazoMeses: 3 },
      { id: 'sau_30kg', titulo: 'Menos 30 kg', prazoMeses: 6 },
    ],
    cor: '#0B8043',
  },
  {
    id: 'relacionamento',
    tipo: 'entrada',
    nome: 'Relacionamento',
    areaId: 'relacionamentos',
    notaPartida: 0,
    notaAlvo: 8,
    alvo: 'Uma companheira',
    porque: 'Você pediu alguém que te cobre e devolva perspectiva. Isso começa saindo do isolamento.',
    marcos: [
      { id: 'rel_social', titulo: '3 microinterações sociais por semana, 4 semanas seguidas', prazoMeses: 1 },
      { id: 'rel_contatos', titulo: '2 contatos com potencial de continuidade', prazoMeses: 3 },
      { id: 'rel_relacao', titulo: 'Uma relação em construção', prazoMeses: 12 },
    ],
    cor: '#E67C73',
  },
  {
    id: 'liberdade',
    tipo: 'consequencia',
    nome: 'Liberdade',
    areaId: 'lazer',
    notaPartida: 0,
    notaAlvo: 8,
    alvo: 'Carro e viagens',
    porque: 'Liberdade vem depois de pagar o preço. Não se agenda — se conquista. Por isso não tem bloco de rotina, e a ausência dele não é falha.',
    marcos: [
      {
        id: 'lib_recompensa',
        titulo: 'Primeira recompensa saudável do Mês 1 definida e resgatada',
        prazoMeses: 1,
      },
      { id: 'lib_carro', titulo: 'Carro', prazoMeses: 10 },
      { id: 'lib_viagem', titulo: 'Primeira viagem', prazoMeses: 12 },
    ],
    cor: '#F4511E',
  },
  {
    id: 'familia',
    tipo: 'entrada',
    nome: 'Família',
    areaId: 'familia',
    notaPartida: 3,
    notaAlvo: 9,
    alvo: 'Ser um bom pai para meu filho de 12 anos',
    porque: 'A única frente onde o tempo perdido não volta.',
    marcos: [
      { id: 'fam_mes1', titulo: '4 momentos de qualidade com o filho no Mês 1', prazoMeses: 1 },
      { id: 'fam_ritmo', titulo: 'Presença semanal sustentada por 3 meses', prazoMeses: 3 },
      { id: 'fam_ano', titulo: 'Um ano de presença real', prazoMeses: 12 },
    ],
    cor: '#039BE5',
  },
  {
    id: 'emocional',
    tipo: 'entrada',
    nome: 'Emocional',
    areaId: 'desenvolvimento',
    notaPartida: 6,
    notaAlvo: 9,
    alvo: 'Equilíbrio sem sobrecarga',
    porque: 'Hoje você não consegue equilibrar objetivos sem se sobrecarregar. Isso tem conserto.',
    marcos: [
      { id: 'emo_rotina', titulo: 'Rotina estruturada cumprida 20 de 30 dias', prazoMeses: 1 },
      { id: 'emo_vicio', titulo: 'Ambiente livre de gatilhos', prazoMeses: 2 },
      { id: 'emo_clareza', titulo: 'Três meses sem sensação de sobrecarga', prazoMeses: 6 },
    ],
    cor: '#3F51B5',
  },
  {
    id: 'espiritualidade',
    tipo: 'entrada',
    nome: 'Espiritualidade',
    areaId: 'espiritualidade',
    notaPartida: 6,
    notaAlvo: 10,
    alvo: 'Conexão diária mantida',
    porque: 'Verdade, servir e justiça — a base declarada de todo o resto.',
    marcos: [
      { id: 'esp_30dias', titulo: '30 dias de prática, mesmo em versão mínima', prazoMeses: 1 },
      { id: 'esp_comunidade', titulo: 'Missa ou grupo comunitário toda semana por 3 meses', prazoMeses: 3 },
      { id: 'esp_ano', titulo: 'Um ano de prática sem quebra longa', prazoMeses: 12 },
    ],
    cor: '#D97706',
  },
];

export const FRENTES_POR_ID: Record<string, Frente> = Object.fromEntries(FRENTES.map((f) => [f.id, f]));

/** Média das notas de partida — o retrato honesto do ponto zero. */
export function notaMediaPartida(): number {
  return FRENTES.reduce((s, f) => s + f.notaPartida, 0) / FRENTES.length;
}

/** Só frentes de entrada devem ser cobradas por tempo na rotina. */
export const FRENTES_DE_ENTRADA: Frente[] = FRENTES.filter((f) => f.tipo === 'entrada');

/** Frentes em situação crítica: partiram de zero. */
export function frentesCriticas(): Frente[] {
  return FRENTES.filter((f) => f.notaPartida === 0);
}
