import { Button, Card, CardContent, IconButton, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProjectUser, fetchDeleteProjectUser } from '../../../requests.ts';
import { useNavigate } from 'react-router-dom';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import LinkIcon from '@mui/icons-material/Link';
import ProjectCardHeader from './ProjectCardHeader.tsx';
import type { ProjectFullDto } from '@shared/types';
import MeetingCardContainer from '../../meets/ui/MeetingCard/MeetingCardContainer.tsx';

export default function Project({ project, refetch }: { project: ProjectFullDto; refetch?: () => void }) {
  const { user, authHandler } = useAuth();
  const navigate = useNavigate();

  const mutationLike = useMutation({
    mutationFn: fetchCreateProjectUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteProjectUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  if (!project) return null;

  const now = new Date();
  const isMember = project.users.some(u => u.id === user?.id);

  const sortedMeets = [...project.meets].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  const nextMeet = sortedMeets.find(m => new Date(m.startedAt) > now);

  const handleLike = () => {
    if (user) mutationLike.mutate({ userId: user.id, projectId: project.id });
    else authHandler();
  };

  const handleUnlike = () => {
    if (user) mutationUnlike.mutate({ userId: user.id, projectId: project.id });
    else authHandler();
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <ProjectCardHeader passport={project.passport} place={project.place} handleUnlike={handleUnlike} />

      <CardMedia
        component="img"
        height="360"
        image={project.image || `/bg.jpeg`}
        alt={project.title || 'Проект'}
        sx={{
          objectFit: 'cover',
          height: {
            xs: 220,
            sm: 360,
          },
        }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="h1" variant="h6" gutterBottom>
            {project.title}
          </Typography>
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation(); // важно: чтобы не триггерить Card click
              navigate(`/idea/${project.ideaId}`);
            }}
            sx={{
              opacity: 0.5,
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography sx={{ color: 'text.secondary' }}>{project.description}</Typography>
      </CardContent>
      {!isMember && (
        <CardContent>
          <Typography variant="h6">Вступите в проект</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Чтобы участвовать во встречах
          </Typography>

          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleLike}>
            Вступить
          </Button>
        </CardContent>
      )}

      {isMember && nextMeet && <MeetingCardContainer meet={nextMeet} />}

      {isMember && !nextMeet && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Пока нет встреч</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Вы получите уведомление
          </Typography>

          <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
            Подписаться
          </Button>
        </Box>
      )}
    </Card>
  );
}
