import type { AreaId } from './areas';

export type Rota =
  | { t: 'inicio' }
  | { t: 'ciclo' }
  | { t: 'general' }
  | { t: 'habitos' }
  | { t: 'perfil' }
  | { t: 'areas' }
  | { t: 'big3' }
  | { t: 'relatorios' }
  | { t: 'revisao' }
  | { t: 'area'; id: AreaId };

export type Ir = (r: Rota) => void;

export function rotaKey(r: Rota): string {
  return r.t === 'area' ? `area:${r.id}` : r.t;
}
