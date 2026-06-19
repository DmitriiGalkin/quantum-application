import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchIdea, generateImage } from '../requests.ts';
import IconButton from '@mui/material/IconButton';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Like from '../components/Like.tsx';
import { Button, CardActions, Grid } from '@mui/material';
import Page from '../components/Page.tsx';
import IdeaProjectCard from '../components/IdeaProjectCard.tsx';
import { useFilters } from './useFilters.ts';
import Filter from './Filter.tsx';
import Share from '../components/Share.tsx';

function IdeaPage() {
  const f = useFilters();
  const { filters } = f;

  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const generateImageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', id] });
    },
  });

  const {
    data: idea,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useQuery({
    queryKey: ['idea', id, JSON.stringify(filters)],
    queryFn: () => fetchIdea(id!, filters),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (idea?.title) {
      document.title = idea?.title;
    }
  }, [idea?.title]);

  return (
    <Page isLoading={isProjectLoading} isError={isProjectError}>
      {(!id || isProjectError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Не указан id проекта.
        </Alert>
      )}
      {idea && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <Box sx={{ position: 'relative', width: '100%' }}>
                <CardMedia
                  component="img"
                  // Адаптивная высота изображения
                  height="360"
                  image={idea.image || `/bg.jpeg`}
                  alt={idea.title || 'Проект'}
                  sx={{
                    objectFit: 'cover',
                    height: {
                      xs: 220, // Высота на самых маленьких экранах
                      sm: 360, // Высота на средних и больших экранах
                    },
                  }}
                />
                {/* Блок с кнопкой генерации */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 28,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    boxShadow: 3,
                    borderRadius: '24px', // Делаем круглым
                    padding: '1px', // Добавляем отступ для иконки
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                >
                  {generateImageMutation.isPending && (
                    <Typography className="blink" color="text.secondary" sx={{ paddingLeft: 1 }}>
                      Генерирую...
                    </Typography>
                  )}
                  <IconButton
                    aria-label="Сгенерировать обложку"
                    onClick={e => {
                      e.stopPropagation();
                      generateImageMutation.mutate(idea.id);
                    }}
                  >
                    <AutoAwesome fontSize="large" />
                  </IconButton>
                </Box>
              </Box>
              <CardContent>
                <Stack spacing={1}>
                  <Typography
                    component="h1"
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.75rem', sm: '2.5rem' }, // Адаптивный размер шрифта
                    }}
                  >
                    {idea.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: { xs: 1.5, sm: 2 }, // Адаптивный отступ сверху
                      fontSize: { xs: '0.9rem', sm: '1rem' }, // Адаптивный размер шрифта
                    }}
                  >
                    {idea.description}
                  </Typography>

                  <Typography gutterBottom align="right" sx={{ marginLeft: 'auto', pr: 1 }} variant="body1" color="textDisabled">
                    {idea.user?.title}, {idea.user?.age} лет
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained">Создать проект</Button>
                  <Stack direction="row">
                    <Like isLiked={idea.isLiked} ideaId={idea.id} />
                    <Share title={idea.title} description={idea.description} />
                  </Stack>
                </Stack>
              </CardActions>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Stack spacing={1}>
              {/* Если сужающих фильтров нет и проектов нет, то фильты не рисуем */}
              {!(f.filters.when === undefined && !idea.projects.length) && <Filter {...f} />}

              {filters.view === 'map' && <div>Карта</div>}

              {filters.view === 'module' && (
                <Stack spacing={1}>
                  {(idea.projects || []).map((project, index) => (
                    <IdeaProjectCard key={index} project={project} />
                  ))}
                </Stack>
              )}

              <Alert variant="outlined">
                Проектов по идее еще нет, но мы активно ищем учителей для его реализации. Чтобы активнее найти найтие учителя, поделитьсь ею с
                друзьями, - возможно им тоже будет это интересно и у вас соберется совместная группа единомышленников!
              </Alert>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Page>
  );
}

export default IdeaPage;
