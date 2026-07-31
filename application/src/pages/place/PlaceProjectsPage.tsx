import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceProjects } from '../../requests.ts';
import Box from '@mui/material/Box';
import ProjectCard from '../../features/project/ui/ProjectCard.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';

export default function PlaceProjectsPage() {
  const { activePlace } = useAuth();
  const id = activePlace?.id;
  const placeId = Number(id);

  const { data: projects = [] } = useQuery({
    queryKey: ['place-projects', placeId],
    queryFn: () => fetchPlaceProjects(2),
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Проекты центра</Typography>

      {projects.length === 0 && <Typography color="text.secondary">В центре пока нет проектов</Typography>}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1,
          }}
        >
          {projects.map((project, index) => (
            <>
              <ProjectCard key={index} project={project} />
            </>
          ))}
        </Box>
    </Stack>
  );
}
