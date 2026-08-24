import type { IdeaDto, ProjectDto } from 'entities';

export function groupProjectsByIdea(projects: ProjectDto[]): { idea: IdeaDto; projects: ProjectDto[] }[] {
  const map = new Map<number, { idea: IdeaDto; projects: ProjectDto[] }>();

  for (let i=0; i< projects.length; i++) {
    const project = projects[i];
    const ideaId = project.idea?.id || 0;

    if (!map.has(ideaId)) {
      map.set(ideaId, {
        idea: project.idea as IdeaDto,
        projects: [],
      });
    }

    map.get(ideaId)!.projects.push(project);
  }

  return Array.from(map.values());
}

export const getImage = (id: number) => `https://api.dicebear.com/10.x/lorelei/svg?seed=${id}`;
