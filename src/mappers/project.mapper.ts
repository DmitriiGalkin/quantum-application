import type { Project, ProjectRow } from 'entities';

function weeklySchedule(value: ProjectRow['weeklySchedule']): Project['weeklySchedule'] {
  if (value == null) return [];
  const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(parsed)) throw new Error('Некорректное расписание проекта');
  return parsed as Project['weeklySchedule'];
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    kind: row.kind ?? 'project',
    weeklySchedule: weeklySchedule(row.weeklySchedule),
    title: row.title,
    description: row.description,
    image: row.image,
    ideaId: row.ideaId,
    placeId: row.placeId,
    locationId: row.locationId ?? null,
    passportId: row.passportId,
  };
}
