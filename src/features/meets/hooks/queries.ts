import type { QueryClient } from '@tanstack/react-query';

export async function invalidateMeetQueries(client: QueryClient, projectId: number): Promise<void> {
  await Promise.all([
    ['meets'], ['teacher-meets'], ['teacher-dashboard'], ['place-dashboard'], ['projects'], ['project', String(projectId)],
  ].map(queryKey => client.invalidateQueries({ queryKey })));
}
