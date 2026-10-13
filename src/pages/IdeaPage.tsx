import { getBrowser } from '../shared/lib/browser.ts';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchIdea } from '../requests.ts';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import Idea from '../features/idea/ui/Idea.tsx';
import Projects from '../features/project/ui/Projects.tsx';

function IdeaPage() {
  const filter = useFilters({ projects: true, defaultView: 'table' });

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
      getBrowser()!.document.title = idea?.title;
    }
  }, [idea?.title]);

  if (!id) {
    return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6">Идея не найдена</Typography>

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

          <Button sx={{ mt: 2 }} variant="contained" onClick={() => void refetch()}>
            Обновить
          </Button>
        </Box>
    );
  }

  if(!idea) return <Typography role="status">Загрузка идеи…</Typography>;

  return (
    <Stack spacing={3}>
      <Idea idea={idea} />
      <Projects title="Проекты по этой идее" filter={filter} projects={idea.projects} refetch={refetch} withoutIdea />
    </Stack>
  );
}

export default IdeaPage;
