import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IdeaGallery from './IdeaGallery.tsx';
import EditIdeaDialog from './EditIdeaDialog.tsx';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCreateProject, fetchPlaces, generateImage } from '../../../requests.ts';
import IconButton from '@mui/material/IconButton';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Like from './Like.tsx';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Share from 'components/Share.tsx';
import { Author } from 'components/Author.tsx';
import { useAuth } from '../../../providers/auth-context.ts';
import { useNavigate } from 'react-router-dom';
import type { PlaceDto, IdeaDto } from 'entities';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../../components/ClosableDialogTitle.tsx';
import Alert from '@mui/material/Alert';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { usePostAuthAction } from '../../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../../shared/lib/useRunPostAuthAction.ts';

const CREATE_PROJECT_TYPE = 'create-project-type';

function Idea({ idea }: { idea: IdeaDto }) {
  const queryClient = useQueryClient();
  const { passport, authHandler, role } = useAuth();
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const [isPlaceModalOpen, setPlaceModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const canEdit = Boolean(passport && (idea.passportId === null || idea.passportId === passport.id));
  const places = useQuery({ queryKey: ['places'], queryFn: fetchPlaces, enabled: isPlaceModalOpen });

  useRunPostAuthAction(passport, action => {
    if (action.type === CREATE_PROJECT_TYPE && action.payload?.ideaId === idea.id) {
      setPlaceModalOpen(true);
    }
  }, action => action.type === CREATE_PROJECT_TYPE && action.payload?.ideaId === idea.id);

  const createProject = useMutation({
    mutationFn: fetchCreateProject,
  });

  const generateImageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['idea'] });
      void queryClient.invalidateQueries({ queryKey: ['ideas'] });
      void queryClient.invalidateQueries({ queryKey: ['teacher-ideas'] });
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
    createProject.mutate(
      { ideaId: idea.id, placeId: place.id, title: idea.title, description: idea.description, image: idea.image },
      {
        onSuccess: projectId => {
          setPlaceModalOpen(false);
          void queryClient.invalidateQueries({ queryKey: ['passport'] });
          void queryClient.invalidateQueries({ queryKey: ['projects'] });
          navigate('/project/' + projectId);
        },
      },
    );
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 2fr)' }, overflowWrap: 'anywhere', '& > *': { minWidth: 0 } }}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <IdeaGallery key={idea.id} idea={idea} />
        {/* Блок с кнопкой генерации */}
        {canEdit && <Box
          sx={{
            position: 'absolute',
            top: 8,
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
            <Typography role="status" className="blink" sx={{ color: 'text.secondary', paddingLeft: 1 }}>
              Генерирую...
            </Typography>
          )}
          <IconButton
            aria-label="Сгенерировать обложку"
            disabled={generateImageMutation.isPending}
            onClick={e => {
              e.stopPropagation();
              generateImageMutation.mutate(idea.id);
            }}
          >
            <AutoAwesome fontSize="large" />
          </IconButton>
        </Box>}
      </Box>
      <CardContent sx={{ gridColumn: { md: 2 }, gridRow: { md: 1 } }}>
        {generateImageMutation.isError && <Alert severity="error">Не удалось создать обложку. Попробуйте ещё раз.</Alert>}
        <Stack spacing={1}>
          <Typography component="h1" variant="h4">
            {idea.title}
          </Typography>

          <Typography
            sx={{
              mt: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: 'text.secondary',
              whiteSpace: 'pre-line',
            }}
          >
            {idea.description}
          </Typography>

          {idea.user && <Author user={idea.user} />}
        </Stack>
      </CardContent>
      {canEdit && (
        <CardActions sx={{ p: 2 }}><Button onClick={() => setEditing(true)}>Редактировать идею</Button></CardActions>
      )}
      {editing && <EditIdeaDialog idea={idea} onClose={() => setEditing(false)} />}

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
          <Dialog open={isPlaceModalOpen} onClose={createProject.isPending ? undefined : () => setPlaceModalOpen(false)} fullWidth maxWidth="sm">
            <ClosableDialogTitle onClose={() => setPlaceModalOpen(false)} disabled={createProject.isPending}>Выберите центр</ClosableDialogTitle>
            <DialogContent>
              {places.isPending && <Typography role="status">Загрузка центров…</Typography>}
              {places.isError && <Alert severity="error" action={<Button onClick={() => void places.refetch()}>Повторить</Button>}>Не удалось загрузить центры.</Alert>}
              {places.data?.length === 0 && <Typography>Доступных центров пока нет.</Typography>}
              {createProject.isError && <Alert severity="error">{createProject.error.message}</Alert>}
              <List>
                {places.data?.map(place => (
                  <ListItemButton key={place.id} disabled={createProject.isPending} onClick={() => handlePlaceSelect(place)} sx={{ overflowWrap: 'anywhere' }}>
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
