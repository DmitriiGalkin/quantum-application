import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceProjects } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Projects from '../../features/project/ui/Projects.tsx';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';

export default function PlaceProjectsPage() {
  const filter = useFilters();
  const { placeId } = useAuth();

  const { data: projects = [], refetch } = useQuery({
    queryKey: ['place-projects', placeId],
    queryFn: fetchPlaceProjects,
  });

  return (
    <Stack spacing={3}>
      {projects.length === 0 && <Typography color="text.secondary">В центре пока нет проектов</Typography>}

      <Projects title="Проекты центра" filter={filter} projects={projects} refetch={refetch} withoutIdea />
    </Stack>
  );
}
