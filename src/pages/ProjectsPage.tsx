import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchProjects } from '../requests.ts';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import Projects from '../features/project/ui/Projects.tsx';
import ProjectSearch from '../features/project/ui/ProjectSearch.tsx';
import Filter from '../features/idea/ui/Filter.tsx';
import { useLocation } from '../shared/lib/useLocation.ts';

export default function ProjectsPage() {
  const filter = useFilters({ projects: true, compactViews: true });
  const { filters } = filter;
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const location = useLocation(filters.sort === 'nearby');
  const { data: projects = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['projects', filters.sort, filters.when, q, location],
    queryFn: () => fetchProjects({
      q, upcomingOnly: true, sort: filters.sort, when: filters.when,
      ...(filters.sort === 'nearby' && location.status === 'success' ? { latitude: location.lat, longitude: location.lng } : {}),
    }),
    enabled: filters.sort !== 'nearby' || location.status === 'success' || location.status === 'error',
  });
  const search = (value: string) => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (value) next.set('q', value); else next.delete('q');
    return next;
  });
  const loading = isLoading || (filters.sort === 'nearby' && location.status === 'loading');
  return <Stack spacing={3}>
    <Stack spacing={1} sx={{ textAlign: 'center', pt: 2 }}>
      <Typography component="h1" variant="h4">Образовательные проекты для детей</Typography>
      <Typography>Выберите проект по интересам ребёнка и присоединяйтесь к встречам с преподавателем.</Typography>
    </Stack>
    <Stack sx={{ alignItems: 'center', width: '100%' }}>
      <ProjectSearch key={q} initialQuery={q} example={!q ? projects[0]?.title : undefined} onSearch={search} />
    </Stack>
    {q && <Button onClick={() => search('')} sx={{ alignSelf: 'flex-start' }}>Очистить поиск</Button>}
    <Filter {...filter} projects compactViews />
    {filters.sort === 'nearby' && location.status === 'error' && <Typography>Местоположение недоступно. Показываем все проекты.</Typography>}
    {loading ? <Stack sx={{ alignItems: "center" }} spacing={1}><CircularProgress aria-label="Загрузка проектов" /><Typography>Загрузка проектов…</Typography></Stack>
      : isError ? <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить проекты.</Alert>
        : <Projects filter={filter} projects={projects} catalog preserveOrder withoutIdea withoutFilters
          emptyText={q || filters.when ? 'Ничего не найдено. Попробуйте другие слова или измените фильтр даты.' : 'Сейчас нет проектов с запланированными встречами. Загляните позже.'} />}
  </Stack>;
}
