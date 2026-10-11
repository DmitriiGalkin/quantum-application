export const DAY_MS = 86400000;
export function moscowFormat(value: number | Date | string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('ru-RU', { ...options, timeZone: 'Europe/Moscow' }).format(new Date(value));
}
export function moscowDay(value: number | Date | string): number {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return Date.parse(`${part('year')}-${part('month')}-${part('day')}T00:00:00+03:00`);
}
export function moscowWeek(value: number | Date | string): number {
  const day = moscowDay(value);
  const weekday = new Date(day + 10800000).getUTCDay();
  return day - ((weekday + 6) % 7) * DAY_MS;
}
