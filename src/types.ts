import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = [
  'Saúde',
  'Espiritual',
  'Financeiro',
  'Intelectual',
  'Emocional',
  'Profissional',
  'Família',
  'Relacionamento',
  'Trabalho',
  'Estudo',
  'Projeto Pessoal',
];

export const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Urgente'];

export const TASK_STATUS = ['A Fazer', 'Em Andamento', 'Concluído', 'Arquivado'];

export interface Habit {
  id: number;
  name: string;
  category: string;
  frequency: string;
  suggested_time: string;
  priority: string;
  description: string;
  active: number;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  date: string;
  status: number;
  check_time: string;
}

export interface Task {
  id: number;
  title: string;
  priority: string;
  category: string;
  deadline: string;
  status: string;
  observations: string;
  completed_at: string;
  habit_id: number | null;
  fail_reason: string | null;
}

export interface AreaField {
  nome: string;
  label: string;
  tipo: 'text' | 'number' | 'date' | 'select' | 'progress' | 'checkbox' | 'url' | 'time' | 'textarea';
  options?: string[];
  required?: boolean;
}

export interface AreaConfig {
  id: string;
  nome: string;
  icon: string;
  cor: string;
  tiposItem: string[];
  campos: Record<string, AreaField[]>;
  colunasKanban: string[];
  views: string[];
  graficos: string[];
}

export interface GenericRecord {
  id: number;
  area_id: string;
  type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  email: string;
  alert_time: string;
  alerts_enabled: number;
}
