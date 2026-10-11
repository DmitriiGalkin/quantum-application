import type { PlaceScheduleDayDto } from '../../entities/place.js';

export function moscowInput(value: string | number | Date): { date: string; time: string } {
  const shifted = new Date(new Date(value).getTime() + 3 * 3600000).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}

export function meetStart(date: string, time: string): string {
  return `${date}T${time}:00+03:00`;
}

export function withinPlaceHours(startedAt: string, duration: number | null, schedule: PlaceScheduleDayDto[]): boolean {
  const instant = new Date(startedAt).getTime();
  if (!Number.isFinite(instant)) return false;
  const start = new Date(instant + 3 * 3600000);
  const minutes = start.getUTCHours() * 60 + start.getUTCMinutes() + start.getUTCSeconds() / 60;
  const weekday = start.getUTCDay() || 7;
  const toMinutes = (time: string) => {
    const [h, m, s = 0] = time.split(':').map(Number);
    return h * 60 + m + s / 60;
  };
  return schedule.some(day => day.enabled && day.weekday === weekday &&
    minutes >= toMinutes(day.startTime) && minutes + (duration ?? 60) <= toMinutes(day.endTime));
}
