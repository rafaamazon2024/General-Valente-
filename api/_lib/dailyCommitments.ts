// Lista derivada manualmente de src/config/areas.ts (campos tipo:'date' + campo 'status' com valor
// terminal). Mantenha esta lista em sincronia se areas.ts mudar.
export interface DailyCommitmentType {
  area_id: string;
  type: string;
  dateField: string;
  statusField: string;
  doneValues: string[];
}

export const DAILY_COMMITMENT_TYPES: DailyCommitmentType[] = [
  { area_id: 'desenvolvimento', type: 'curso', dateField: 'previsaoConclusao', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'desenvolvimento', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'financas', type: 'transacao', dateField: 'data', statusField: 'status', doneValues: ['Pago'] },
  { area_id: 'financas', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'carreira', type: 'projeto', dateField: 'deadline', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'carreira', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'saude', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'relacionamentos', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'relacionamentos', type: 'acao', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'familia', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'familia', type: 'tarefa', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'lazer', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'espiritualidade', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'ambiente', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'ambiente', type: 'tarefa', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'social', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'contribuicao', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
  { area_id: 'hobbies', type: 'meta', dateField: 'prazo', statusField: 'status', doneValues: ['Concluído'] },
];
