import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchIdea } from '../../requests.ts';
import { Button, Grid } from '@mui/material';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';
import Idea from '../../features/idea/ui/Idea.tsx';
import Projects from '../../features/project/ui/Projects.tsx';

function IdeaPage() {
  const filter = useFilters();

  const { id } = useParams<{ id: string }>();

  const {
    data: idea,
    isError: isProjectError,
    refetch,
  } = useQuery({
    queryKey: ['idea', id, filter.filters],
    queryFn: () => fetchIdea(id!, filter.filters),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (idea?.title) {
      document.title = idea?.title;
    }
  }, [idea?.title]);

  if (!id) {
    return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6">Проект не найден</Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Некорректная ссылка
          </Typography>
        </Box>
    );
  }

  if (isProjectError) {
    return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6">Не удалось загрузить идею</Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Попробуйте обновить страницу
          </Typography>

          <Button sx={{ mt: 2 }} variant="contained" onClick={() => window.location.reload()}>
            Обновить
          </Button>
        </Box>
    );
  }

  if(!idea) return null;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Idea idea={idea} />
      </Grid>

      <Grid size={{ xs: 12, md: 9 }}>
        <Projects filter={filter} projects={idea.projects} refetch={refetch} withoutIdea />
      </Grid>
    </Grid>
  );
}

export default IdeaPage;
