import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchIdea } from '../requests.ts';
import { Button, Grid } from '@mui/material';
import IdeaProjectCard from '../features/project/ui/IdeaProjectCard.tsx';
import { useFilters } from '../features/idea/model/useFilters.ts';
import Filter from '../features/idea/ui/Filter.tsx';
import Idea from '../features/idea/ui/Idea.tsx';

function IdeaPage() {
  const { filters, setView, setSort, setWhen } = useFilters();

  const { id } = useParams<{ id: string }>();

  const {
    data: idea,
    isError: isProjectError,
    refetch,
  } = useQuery({
    queryKey: ['idea', id, filters],
    queryFn: () => fetchIdea(id!, filters),
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
            <Stack spacing={2}>
              {/* Если сужающих фильтров нет и проектов нет, то фильты не рисуем */}
              {!(filters.when === undefined && !idea.projects.length) && (
                <Filter filters={filters} setView={setView} setSort={setSort} setWhen={setWhen} />
              )}

              {filters.view === 'map' && <div>Карта</div>}

              {filters.view === 'module' && (
                <Stack spacing={1}>
                  {(idea.projects || []).map((project, index) => (
                    <IdeaProjectCard key={index} project={project} refetch={refetch} />
                  ))}
                </Stack>
              )}

              {filters.when === undefined && !idea.projects.length && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Пока нет проектов
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Мы ищем учителей для реализации этой идеи
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Поделитесь идеей с друзьями — возможно, вместе вы запустите проект 🚀
                  </Typography>

                  <Button variant="contained">Поделиться</Button>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
  );
}

export default IdeaPage;
