// Divisão de treino semanal fixa: dia da semana (0=Domingo..6=Sábado) → grupo(s) muscular(es) do dia.
// Os nomes dos grupos aqui precisam bater exatamente com o campo grupo_muscular usado em
// src/config/exerciciosSeed.ts e nos exercícios cadastrados na Biblioteca.
export const TREINO_SPLIT: Record<number, string[]> = {
  0: [], // Domingo — descanso
  1: ['Peito', 'Costas'],
  2: ['Pernas'],
  3: ['Costas', 'Ombros/Braços'],
  4: ['Pernas'],
  5: ['Peito', 'Costas'],
  6: ['Ombros/Braços', 'Cardio'],
};

export const GRUPOS_MUSCULARES = ['Costas', 'Pernas', 'Ombros/Braços', 'Peito', 'Cardio'];

export function getGruposDoDia(date: Date = new Date()): string[] {
  return TREINO_SPLIT[date.getDay()] ?? [];
}
