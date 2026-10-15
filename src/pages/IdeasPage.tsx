import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
//import '../../App.css';
import { MeetMap } from '../features/place/MeetMap.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchIdeas } from '../requests.ts';
import Stack from '@mui/material/Stack';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import Filter from '../features/idea/ui/Filter.tsx';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation } from '../shared/lib/useLocation.ts';
import Typography from '@mui/material/Typography';
import IdeaGrids from '../features/idea/ui/IdeaGrids.tsx';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

function IdeasPage() {
  const { filters, setView, setSort, setWhen } = useFilters();
  const location = useLocation(filters.sort === 'nearby');
  const query = {
    sort: filters.sort,
    when: filters.when,
    ...(filters.sort === 'nearby' && location.status === 'success'
      ? { latitude: location.lat, longitude: location.lng }
      : {}),
  };

  const { data: ideas = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ideas', query],
    queryFn: () => fetchIdeas(query),
  });

  return (
    <Stack spacing={2}>
      <Typography component="h1" variant="h4">Библиотека идей</Typography>
      {/*{activeContext.role === 'guest' && <AIIdeaBanner />}*/}

      <Filter filters={filters} setView={setView} setSort={setSort} setWhen={setWhen} withoutGroups />
      {isError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить идеи.</Alert>}
      {!isLoading && !isError && !ideas.length && <Typography>Идей по выбранным условиям пока нет. Измените дату или сортировку.</Typography>}
      {(isLoading || (filters.sort === 'nearby' && location.status === 'loading')) && (
        <Box
          sx={{
            height: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: 'text.primary' }} />
        </Box>
      )}
      {filters.sort === 'nearby' && location.status === 'error' && (
        <Typography sx={{ color: 'text.secondary' }}>Местоположение недоступно. Показываем все идеи.</Typography>
      )}
      {filters.view === 'map' && (
        <Paper
          component="section"
          elevation={1}
          sx={{
            mb: 4,
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
          aria-label="Центры и встречи на карте"
        >
          <MeetMap lat={55.75} lng={37.62} zoom={12} />
        </Paper>
      )}
      {(filters.view === 'module' || filters.view === 'group') && <IdeaGrids ideas={ideas} />}
    </Stack>
  );
}

export default IdeasPage;
