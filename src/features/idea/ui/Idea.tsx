import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCreateProject, generateImage } from '../../../requests.ts';
import IconButton from '@mui/material/IconButton';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Like from './Like.tsx';
import { Button, CardActions } from '@mui/material';
import Share from '../../../shared/ui/Share.tsx';
import { Author } from '../../../shared/ui/Author.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { useNavigate } from 'react-router-dom';
import type { PlaceDto } from 'dto';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { usePostAuthAction } from '../../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../../shared/lib/useRunPostAuthAction.ts';

const mockPlaces: PlaceDto[] = [
  {
    id: 1,
    title: 'Онлайн',
    description: 'Проведение занятий через Zoom / Google Meet',
    address: 'Онлайн',
    latitude: 0,
    longitude: 0,
    priceFrom: 0,
  },
  {
    id: 2,
    title: 'Школа №123',
    description: 'Класс с оборудованием для занятий',
    address: 'г. Москва, ул. Ленина, 10',
    latitude: 55.75,
    longitude: 37.61,
    priceFrom: 500,
  },
  {
    id: 3,
    title: 'Коворкинг для детей',
    description: 'Пространство для проектной работы',
    address: 'г. Москва, ул. Тверская, 5',
    latitude: 55.76,
    longitude: 37.62,
    priceFrom: 800,
  },
];

const CREATE_PROJECT_TYPE = 'create-project-type';

function Idea({ idea }: { idea: any }) {
  const queryClient = useQueryClient();
  const { passport, authHandler, role } = useAuth();
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const [isPlaceModalOpen, setPlaceModalOpen] = useState(false);

  useRunPostAuthAction(passport, action => {
    if (action.type === CREATE_PROJECT_TYPE && action.payload.ideaId === idea.id) {
      setPlaceModalOpen(true);
    }
  });

  const createProject = useMutation({
    mutationFn: fetchCreateProject,
  });

  const generateImageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', idea.id] });
    },
  });

  const handleCreateProject = () => {
    if (!passport) {
      setAction({
        type: CREATE_PROJECT_TYPE,
        payload: { ideaId: idea.id },
      });

      return authHandler();
    }

    setPlaceModalOpen(true);
  };

  const handlePlaceSelect = (place: PlaceDto) => {
    setPlaceModalOpen(false);

    createProject.mutate(
      { ideaId: idea.id, placeId: place.id, title: idea.title, description: idea.description, image: idea.image },
      {
        onSuccess: projectId => {
          navigate('/project/' + projectId);
        },
      },
    );
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <CardMedia
          component="img"
          height="360"
          image={idea.image || `/bg.jpeg`}
          alt={idea.title || 'Проект'}
          sx={{
            objectFit: 'cover',
            height: {
              xs: 220,
              sm: 360,
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
            borderRadius: '24px',
            padding: '1px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {generateImageMutation.isPending && (
            <Typography className="blink" sx={{ color: 'text.secondary', paddingLeft: 1 }}>
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
          <Typography component="h1" variant="h6">
            {idea.title}
          </Typography>

          <Typography
            sx={{
              mt: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: 'text.secondary',
            }}
          >
            {idea.description}
          </Typography>

          {idea.user && <Author user={idea.user} />}
        </Stack>
      </CardContent>

      {role === 'teacher' && (
        <>
          <CardActions sx={{ p: 2 }}>
            <Stack>
              <Typography variant="caption" gutterBottom sx={{ color: 'text.secondary' }}>
                Для преподавателей
              </Typography>{' '}
              <Button variant="outlined" onClick={handleCreateProject}>
                Создать свой проект
              </Button>
            </Stack>
          </CardActions>
          <Dialog open={isPlaceModalOpen} onClose={() => setPlaceModalOpen(false)}>
            <DialogTitle>Выберите место</DialogTitle>
            <DialogContent>
              <List>
                {mockPlaces.map(place => (
                  <ListItemButton key={place.id} onClick={() => handlePlaceSelect(place)}>
                    <ListItemText
                      primary={place.title || 'Без названия'}
                      secondary={`${place.address}${place.priceFrom ? ` • от ${place.priceFrom} ₽` : ''}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </DialogContent>
          </Dialog>
        </>
      )}

      {role === 'user' && (
        <CardActions sx={{ p: 2 }}>
          <Stack direction="row">
            <Like isLiked={idea.isLiked} ideaId={idea.id} />
            <Share title={idea.title} description={idea.description || ''} />
          </Stack>
        </CardActions>
      )}
    </Card>
  );
}

export default Idea;
