
export function groupProjectsByIdea<T extends { idea: { id: number } }>(projects: T[]): { idea: T['idea']; projects: T[] }[] {
  const map = new Map<number, { idea: T['idea']; projects: T[] }>();

  for (const project of projects) {
    const ideaId = project.idea.id;

    if (!map.has(ideaId)) {
      map.set(ideaId, {
        idea: project.idea,
        projects: [],
      });
    }

    map.get(ideaId)!.projects.push(project);
  }

  return Array.from(map.values());
}
