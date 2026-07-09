const MANAUS_TZ = 'America/Manaus';

/** Data local de Manaus no formato YYYY-MM-DD para o instante informado (default: agora). */
export function getManausDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: MANAUS_TZ }).format(date);
}
