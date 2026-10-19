import type { ProjectWeeklySlot } from '../../../entities/project.ts';

export const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export function formatWeeklySlot(slot: ProjectWeeklySlot): string {
  const [hours, minutes] = slot.startTime.split(':').map(Number);
  const endMinutes = hours * 60 + minutes + slot.duration;
  const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
  return `${weekdays[slot.weekday - 1]}, ${slot.startTime}–${endTime}${endMinutes >= 1440 ? ' (+1 день)' : ''}`;
}

export function formatWeeklySchedule(slots: ProjectWeeklySlot[]): string {
  return [...slots].sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime))
    .map(formatWeeklySlot).join(' · ');
}
