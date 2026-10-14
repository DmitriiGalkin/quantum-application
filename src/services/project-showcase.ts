import type { GetProjectsQuery, ProjectDto } from '../entities/project.js';

export function selectShowcaseProjects(projects: ProjectDto[], params: GetProjectsQuery, now = new Date()): ProjectDto[] {
  const upcomingOnly = params.upcomingOnly === true || params.upcomingOnly === 'true';
  const day = (date: Date) => new Date(date.getTime() + 3 * 3600000).toISOString().slice(0, 10);
  const targetDay = day(new Date(now.getTime() + (params.when === 'tomorrow' ? 86400000 : 0)));
  const result = upcomingOnly ? projects.filter(project => project.meets.some(meet => {
    const start = new Date(meet.startedAt);
    return !meet.deletedAt && meet.status === 'published' && start.getTime() > now.getTime()
      && (!params.when || day(start) === targetDay);
  })) : [...projects];
  if (params.sort === 'popular') result.sort((a, b) => b.users.length - a.users.length || b.id - a.id);
  return result;
}
