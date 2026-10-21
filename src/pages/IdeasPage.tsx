import Box from '@mui/material/Box';
import { useQuery } from '@tanstack/react-query';
import { fetchIdeas } from '../requests.ts';
import Stack from '@mui/material/Stack';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import Filter from '../features/idea/ui/Filter.tsx';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IdeaGrids from '../features/idea/ui/IdeaGrids.tsx';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

function IdeasPage() {
  const { filters, setView, setSort, setWhen } = useFilters({ compactViews: true, allowWhen: false, allowNearby: false });
  const query = { sort: filters.sort };

  const { data: ideas = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ideas', query],
    queryFn: () => fetchIdeas(query),
  });

  return (
    <Stack spacing={2}>
      <Typography component="h1" variant="h4">Библиотека идей</Typography>
      {/*{activeContext.role === 'guest' && <AIIdeaBanner />}*/}

      <Filter filters={filters} setView={setView} setSort={setSort} setWhen={setWhen}
        compactViews withOutLocation withOutWhen withoutGroups />
      {isError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить идеи.</Alert>}
      {!isLoading && !isError && !ideas.length && <Typography>Идей по выбранной сортировке пока нет.</Typography>}
      {isLoading && (
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
      {filters.view === 'module' && <IdeaGrids ideas={ideas} />}
    </Stack>
  );
}

export default IdeasPage;
