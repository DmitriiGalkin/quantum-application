import type { QueryClient } from '@tanstack/react-query';

export async function invalidateMeetQueries(client: QueryClient, projectId: number): Promise<void> {
  await Promise.all([
    ['meets'], ['user-dashboard'], ['teacher-meets'], ['teacher-dashboard'], ['place-dashboard'], ['place-projects'], ['place-users'], ['places'], ['projects'], ['project', String(projectId)],
  ].map(queryKey => client.invalidateQueries({ queryKey })));
}
