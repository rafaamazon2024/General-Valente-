export function todayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Manaus' });
}

export function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateStrDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateStr(d);
}
