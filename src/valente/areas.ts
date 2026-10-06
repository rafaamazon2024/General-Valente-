// Catálogo do General Valente: 8 áreas de execução, missões diárias e indicadores.
// As missões vêm da rotina real (config/rotinaSeed.ts); nada aqui é dado de exemplo.

import {
  Cross, Mic, BookOpen, Brain, Briefcase, Wind, Utensils, Dumbbell, type LucideIcon,
} from 'lucide-react';
import { ROTINA, duracaoMin, type DiaSemana } from '../config/rotinaSeed';

export type AreaId =
  | 'espiritual' | 'comunicacao' | 'leitura' | 'memorizacao'
  | 'carreira' | 'mindfulness' | 'alimentacao' | 'esporte';

export type MetricaTipo = 'num' | 'escala' | 'check';

export interface MetricaDef {
  key: string;
  label: string;
  tipo: MetricaTipo;
  unidade?: string;
  /** Passo do botão +/-. */
  passo?: number;
  /** Para escala: significado dos extremos. */
  escala?: [string, string];
}

export interface AreaDef {
  id: AreaId;
  nome: string;
  curto: string;
  icon: LucideIcon;
  /** Parte do corpo no mapa. */
  corpo: string;
  identidade: string;
  metaCicloPadrao: string;
  metricas: MetricaDef[];
  /** Chave de métrica cujo total semanal vira "meta semanal" auxiliar. */
  principal?: string;
}

export const AREAS: AreaDef[] = [
  {
    id: 'espiritual', nome: 'Espiritual', curto: 'Espiritual', icon: Cross, corpo: 'Peito',
    identidade: 'Conexão diária com Deus. É o que sustenta o resto: verdade, servir e justiça.',
    metaCicloPadrao: 'Ritual da manhã cumprido todos os dias, com oração, Bíblia, terço e gratidão.',
    metricas: [
      { key: 'oracao', label: 'Oração', tipo: 'check' },
      { key: 'biblia', label: 'Bíblia', tipo: 'check' },
      { key: 'terco', label: 'Terço', tipo: 'check' },
      { key: 'meditacao_espiritual', label: 'Meditação espiritual', tipo: 'check' },
      { key: 'gratidao', label: 'Gratidão', tipo: 'check' },
      { key: 'diario_espiritual', label: 'Diário espiritual', tipo: 'check' },
    ],
  },
  {
    id: 'comunicacao', nome: 'Comunicação', curto: 'Comunic.', icon: Mic, corpo: 'Garganta',
    identidade: 'Presença verbal. Falar com clareza, voz firme e postura de quem sabe o que diz.',
    metaCicloPadrao: 'Treinar fala, dicção e voz nas sessões previstas e gravar a própria evolução.',
    metricas: [
      { key: 'minutos_fala', label: 'Treino de fala', tipo: 'num', unidade: 'min', passo: 5 },
      { key: 'diccao', label: 'Dicção', tipo: 'check' },
      { key: 'postura', label: 'Postura e voz', tipo: 'check' },
      { key: 'gravacoes', label: 'Gravações', tipo: 'num', unidade: 'un', passo: 1 },
      { key: 'conteudos', label: 'Conteúdos publicados', tipo: 'num', unidade: 'un', passo: 1 },
    ],
    principal: 'minutos_fala',
  },
  {
    id: 'leitura', nome: 'Leitura', curto: 'Leitura', icon: BookOpen, corpo: 'Cabeça',
    identidade: 'Leitura diária com execução dos exercícios do livro. O que se lê, se pratica.',
    metaCicloPadrao: 'Terminar o livro atual e registrar aprendizados de cada sessão.',
    metricas: [
      { key: 'paginas', label: 'Páginas', tipo: 'num', unidade: 'pág', passo: 5 },
      { key: 'minutos_leitura', label: 'Minutos lidos', tipo: 'num', unidade: 'min', passo: 5 },
      { key: 'exercicios_livro', label: 'Exercícios do livro feitos', tipo: 'check' },
    ],
    principal: 'paginas',
  },
  {
    id: 'memorizacao', nome: 'Memorização', curto: 'Memoriz.', icon: Brain, corpo: 'Cabeça',
    identidade: 'Operação Memória 40D: recuperar, revisar e aplicar. Constância vale mais que volume.',
    metaCicloPadrao: 'Concluir os 40 dias de treino e aumentar a retenção real de nomes, conceitos e conteúdos profissionais.',
    metricas: [
      { key: 'blocos_memorizados', label: 'Blocos memorizados', tipo: 'num', unidade: 'un', passo: 1 },
      { key: 'cartoes_revisados', label: 'Cartões revisados', tipo: 'num', unidade: 'un', passo: 5 },
      { key: 'cartoes_pendentes', label: 'Cartões pendentes', tipo: 'num', unidade: 'un', passo: 5 },
      { key: 'retencao', label: 'Retenção percebida', tipo: 'escala', escala: ['baixa', 'alta'] },
    ],
    principal: 'blocos_memorizados',
  },
  {
    id: 'carreira', nome: 'Carreira', curto: 'Carreira', icon: Briefcase, corpo: 'Braços',
    identidade: 'Construção da agência de IA: 5 horas de trabalho e 3 de estudo por dia útil, mais vendas.',
    metaCicloPadrao: 'Agência de IA funcionando, com pipeline ativo e as primeiras vendas fechadas.',
    metricas: [
      { key: 'prospeccoes', label: 'Prospecções', tipo: 'num', unidade: 'un', passo: 1 },
      { key: 'reunioes', label: 'Reuniões', tipo: 'num', unidade: 'un', passo: 1 },
      { key: 'propostas', label: 'Propostas enviadas', tipo: 'num', unidade: 'un', passo: 1 },
      { key: 'vendas', label: 'Vendas fechadas', tipo: 'num', unidade: 'un', passo: 1 },
      { key: 'receita', label: 'Receita', tipo: 'num', unidade: 'R$', passo: 100 },
    ],
    principal: 'prospeccoes',
  },
  {
    id: 'mindfulness', nome: 'Mindfulness', curto: 'Mindful.', icon: Wind, corpo: 'Cabeça',
    identidade: 'Equilíbrio sem sobrecarga. Meditação, respiração e silêncio como base da atenção.',
    metaCicloPadrao: 'Prática diária de meditação e respiração, com estresse e humor acompanhados.',
    metricas: [
      { key: 'minutos_pratica', label: 'Tempo de prática', tipo: 'num', unidade: 'min', passo: 5 },
      { key: 'respiracao', label: 'Respiração', tipo: 'check' },
      { key: 'silencio', label: 'Silêncio', tipo: 'check' },
      { key: 'estresse', label: 'Estresse', tipo: 'escala', escala: ['calmo', 'no limite'] },
      { key: 'humor', label: 'Humor', tipo: 'escala', escala: ['baixo', 'bom'] },
    ],
    principal: 'minutos_pratica',
  },
  {
    id: 'alimentacao', nome: 'Alimentação', curto: 'Aliment.', icon: Utensils, corpo: 'Abdômen',
    identidade: 'Meta de 1.500 kcal por dia, rumo aos 30 kg a menos.',
    metaCicloPadrao: 'Fechar os dias em até 1.500 kcal e registrar o peso toda semana.',
    metricas: [
      { key: 'agua_ml', label: 'Água', tipo: 'num', unidade: 'ml', passo: 250 },
      { key: 'peso', label: 'Peso', tipo: 'num', unidade: 'kg', passo: 0.1 },
      { key: 'deslizes', label: 'Deslizes', tipo: 'num', unidade: 'un', passo: 1 },
    ],
  },
  {
    id: 'esporte', nome: 'Esporte e Academia', curto: 'Esporte', icon: Dumbbell, corpo: 'Pernas',
    identidade: 'Corpo como instrumento: treino de força, trote e cardio, com carga registrada.',
    metaCicloPadrao: 'Cumprir os treinos da semana e progredir a carga nos exercícios principais.',
    metricas: [
      { key: 'km', label: 'Corrida / cardio', tipo: 'num', unidade: 'km', passo: 0.5 },
      { key: 'series', label: 'Séries feitas', tipo: 'num', unidade: 'un', passo: 1 },
      { key: 'carga_max', label: 'Maior carga do dia', tipo: 'num', unidade: 'kg', passo: 2.5 },
      { key: 'execucao', label: 'Qualidade da execução', tipo: 'escala', escala: ['ruim', 'ótima'] },
    ],
  },
];

export const AREA_POR_ID: Record<AreaId, AreaDef> = Object.fromEntries(
  AREAS.map((a) => [a.id, a]),
) as Record<AreaId, AreaDef>;

export const META_KCAL = 1500;

// ---------- Missões ----------

export interface Missao {
  id: string;
  titulo: string;
  area: AreaId;
  inicio?: string;
  fim?: string;
  dias: DiaSemana[];
  duracao?: number; // minutos
  nota?: string;
}

const AREA_DO_BLOCO: Record<string, AreaId | null> = {
  ritual_manha: 'espiritual',
  leitura_aprofundada: 'leitura',
  memorizacao: 'memorizacao',
  comunicacao: 'comunicacao',
  estudo_1_3: 'carreira',
  estudo_manha: 'carreira',
  academia: 'esporte',
  trabalho_manha: 'carreira',
  almoco: null,
  trabalho_inicio_tarde: 'carreira',
  vendas: 'carreira',
  trabalho_tarde: 'carreira',
  trote: 'esporte',
  estudo_2_3_3_3: 'carreira',
  estudo_fechamento: 'carreira',
  meditacao_ter_qui: 'mindfulness',
  meditacao_seg_qua_sex: 'mindfulness',
  sono: null,
};

const TODOS: DiaSemana[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export const MISSOES: Missao[] = [
  ...ROTINA.filter((b) => AREA_DO_BLOCO[b.id]).map<Missao>((b) => ({
    id: b.id,
    titulo: b.titulo,
    area: AREA_DO_BLOCO[b.id] as AreaId,
    inicio: b.inicio,
    fim: b.fim,
    dias: b.dias,
    duracao: duracaoMin(b),
    nota: b.nota,
  })),
  {
    id: 'alimentacao_dia',
    titulo: 'Fechar o dia em até 1.500 kcal',
    area: 'alimentacao',
    dias: TODOS,
    nota: 'Registre as refeições e marque ao fechar o dia dentro da meta.',
  },
];

export function missoesDoDia(dia: DiaSemana): Missao[] {
  return MISSOES.filter((m) => m.dias.includes(dia)).sort((a, b) => {
    if (a.inicio && b.inicio) return a.inicio.localeCompare(b.inicio);
    if (a.inicio) return -1;
    if (b.inicio) return 1;
    return 0;
  });
}

export const MISSAO_POR_ID: Record<string, Missao> = Object.fromEntries(MISSOES.map((m) => [m.id, m]));

// ---------- Status por percentual ----------

export type Situacao = 'otimo' | 'atencao' | 'critico' | 'sem';

export function situacao(pct: number | null): Situacao {
  if (pct === null) return 'sem';
  if (pct >= 70) return 'otimo';
  if (pct >= 50) return 'atencao';
  return 'critico';
}

export const COR: Record<Situacao, string> = {
  otimo: '#34d399',
  atencao: '#fbbf24',
  critico: '#f87171',
  sem: '#4b5563',
};

export const ROTULO: Record<Situacao, string> = {
  otimo: 'No ritmo',
  atencao: 'Atenção',
  critico: 'Abaixo da meta',
  sem: 'Sem previsão',
};
