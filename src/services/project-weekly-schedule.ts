import type { ProjectKind, ProjectWeeklySlot } from '../entities/project.js';
import { HttpError } from '../utils/http-error.js';

export function validateProjectSchedule(kind: ProjectKind, schedule: ProjectWeeklySlot[]): ProjectWeeklySlot[] {
  if (kind === 'project') return [];
  if (!Array.isArray(schedule) || !schedule.length) throw new HttpError('Добавьте время занятий кружка', 400);
  const keys = new Set<string>();
  return schedule.map(slot => {
    const { weekday, startTime, duration } = slot;
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7
      || typeof startTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
      || !Number.isInteger(duration) || duration < 1 || duration > 1440) {
      throw new HttpError('Проверьте день, время и длительность занятия', 400);
    }
    const key = `${weekday}:${startTime}`;
    if (keys.has(key)) throw new HttpError('Одинаковое время занятия указано дважды', 400);
    keys.add(key);
    return { weekday, startTime, duration };
  });
}
