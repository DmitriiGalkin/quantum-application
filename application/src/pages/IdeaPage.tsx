import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container'; // Импортируем Container
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchIdea, generateImage } from '../requests.ts';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import ProjectCard from '../components/ProjectCard.tsx';
import Like from '../components/Like.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';
import {CardActions, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function IdeaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);

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
    queryKey: ['idea', id],
    queryFn: () => fetchIdea(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (idea?.title) {
      document.title = idea?.title;
    }
  }, [idea?.title]);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share && idea) {
      await navigator.share({
        title: idea.title,
        text: idea.description ?? '',
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (!id) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Не указан id проекта.</Alert>
      </Container>
    );
  }

  if (isProjectLoading) {
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={24} />
        <Typography>Загрузка идеи...</Typography>
      </Stack>
    );
  }

  if (isProjectError || !idea) {
    return <Alert severity="error">Не удалось загрузить идею.</Alert>;
  }

  return (
    // Оборачиваем весь контент в Container для контроля ширины
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="absolute"
        color="inherit"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: 1,
          border: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            aria-label="open drawer"
            sx={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />

          <>
            <IconButton size="large" sx={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '50%' }} onClick={e => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon sx={{ color: 'white' }} />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => navigate(`/project/${id}/edit`)}>Редактировать</MenuItem>
              <MenuItem onClick={() => console.log('delete')}>Удалить</MenuItem>
              <MenuItem onClick={() => handleShare()}>Поделиться</MenuItem>
            </Menu>
          </>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" disableGutters>
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: '0 0 4px 4px',
          }}
        >
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
          <Box sx={{ position: 'relative', top: '-20px', borderRadius: 6, backgroundColor: 'white' }}>
            <CardContent sx={{ px: { xs: 2.5, sm: 4 } }}>
              <Stack spacing={3}>
                <Box>
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
                </Box>
              </Stack>
            </CardContent>
            <CardActions sx={{ px: { xs: 2.5, sm: 4 }, py: 0 }} disableSpacing>
              {user && (
                <Tooltip title="В избранное">
                  <Like isLiked={idea.isLiked} ideaId={idea.id} userId={user.id} />
                </Tooltip>
              )}
            </CardActions>
          </Box>
        </Card>
      </Container>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {Boolean(idea.projects.length) ? (
          <Stack>
            <Typography component="h6" variant="h6" sx={{ pt: 2, mb: { xs: 2, md: 3 }, fontWeight: 900, color: 'white' }}>
              Проекты по идее
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {(idea.projects || []).map(project => (
                <ProjectCard project={project} key={project.id} />
              ))}
            </Box>
          </Stack>
        ) : (
          <Alert>
            Проектов по идее еще нет, но мы активно ищем учителей для его реализации. Чтобы активнее найти найтие учителя, поделитьсь ею с друзьями, -
            возможно им тоже будет это интересно и у вас соберется совместная группа единомышленников!
          </Alert>
        )}
      </Container>
    </Box>
  );
}

export default IdeaPage;
