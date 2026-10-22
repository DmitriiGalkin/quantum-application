import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceProjects } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import Projects from '../../features/project/ui/Projects.tsx';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

export default function PlaceProjectsPage() {
  const filter = useFilters({ projects: true, compactViews: true, defaultView: 'table', allowWhen: false, allowNearby: false });
  const { placeId } = useAuth();

  const { data: projects = [], refetch, isPending, isError } = useQuery({
    queryKey: ['place-projects', placeId],
    queryFn: fetchPlaceProjects,
    enabled: Boolean(placeId),
  });
  if (!placeId) return <Typography>Выберите центр в меню профиля.</Typography>;
  if (isPending) return <Typography role="status">Загрузка проектов центра…</Typography>;
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить проекты центра.</Alert>;

  return (
    <Stack spacing={3}>
      <Projects title="Проекты центра" filter={filter} projects={projects} refetch={refetch} withoutIdea compactViews cardVariant="catalog" emptyText="В центре пока нет проектов." />
    </Stack>
  );
}
