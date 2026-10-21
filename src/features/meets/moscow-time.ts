export const DAY_MS = 86400000;
export function moscowYear(value: number | Date | string): string {
  return moscowFormat(value, { year: 'numeric' });
}
/** Informational dates; input forms and documents retain their full dates. */
export function informationDate(value: number | Date | string, options: Intl.DateTimeFormatOptions = {}, now = new Date(), forceYear = false): string {
  return moscowFormat(value, { day: 'numeric', month: 'long', ...options,
    year: forceYear || moscowYear(value) !== moscowYear(now) ? 'numeric' : undefined });
}
export function meetingDate(value: number | Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  return moscowFormat(value, { day: 'numeric', month: 'long', ...options, year: undefined });
}
export function informationRange(start: number | Date | string, end: number | Date | string): string {
  return `${meetingDate(start, { month: 'short' })} — ${meetingDate(end, { month: 'short' })}`;
}
export function informationDateTime(value: number | Date | string): string {
  return `${informationDate(value)}, ${moscowFormat(value, { hour: '2-digit', minute: '2-digit' })}`;
}
export function informationDateTimeRange(start: number | Date | string, end: number | Date | string): string {
  const crossYear = moscowYear(start) !== moscowYear(end);
  const format = (value: number | Date | string) => `${informationDate(value, {}, new Date(), crossYear)}, ${moscowFormat(value, { hour: '2-digit', minute: '2-digit' })}`;
  return `${format(start)} — ${format(end)}`;
}
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
