import { expect, it } from 'vitest';
import { missoesDoDia } from '../src/valente/areas';
import { execucaoSemana, metaSemanalMissoes } from '../src/valente/calc';
import type { ConfigValente } from '../src/valente/store';

it('usa a agenda personalizada nas missões e nos cálculos', () => {
  const rotina = [{ id: 'estudo_custom', titulo: 'Estudo confirmado', inicio: '09:00', fim: '10:00', dias: ['WE'] as const, categoria: 'estudo' as const, frenteId: 'carreira', nota: 'Material próprio' }].map(b => ({ ...b, dias: [...b.dias] }));
  const config: ConfigValente = { rotina, ciclo_inicio: '2026-10-26', metas: {}, big3: {}, revisoes: {} };
  expect(missoesDoDia('WE', rotina).find(x => x.id === 'estudo_custom')?.titulo).toBe('Estudo confirmado');
  expect(missoesDoDia('WE', rotina).some(x => x.id === 'trabalho_manha')).toBe(false);
  expect(metaSemanalMissoes(config, 1, 'carreira')).toEqual({ missoes: 1, minutos: 60 });
  expect(execucaoSemana(config, 1, { '2026-10-28': { feitos: ['estudo_custom'], iniciados: [], adiados: [] } }, '2026-10-28', 'carreira')).toEqual({ planejado: 1, feito: 1, pct: 100 });
});
it('mantém agenda explicitamente vazia sem recriar a rotina antiga', () => {
  expect(missoesDoDia('WE', []).some(x => x.id === 'academia')).toBe(false);
});
