import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Card, CardActionArea, Stack } from '@mui/material';
import { type ProjectExtendedDto } from '@shared/types';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProjectUser, fetchDeleteProjectUser } from '../../../requests.ts';
import ProjectCardHeader from './ProjectCardHeader.tsx';
import Meet from '../../meets/ui/Meet.tsx';
import { useNavigate } from 'react-router-dom';

type IdeaProjectCardProps = {
  project: ProjectExtendedDto; // частичное должно быть
  refetch?: any;
};

function IdeaProjectCard({ project, refetch }: IdeaProjectCardProps) {
  const { user, authHandler } = useAuth();
  const navigate = useNavigate();

  const liked = user && project.users?.map(user => user.id).includes(user.id);

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
      <CardActionArea onClick={() => navigate(`/project/${project.id}`)}>
        <ProjectCardHeader passport={project.passport} place={project.place} handleUnlike={liked && handleUnlike} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowX: 'auto' }}>
          {project.meets?.[0] && <Meet meet={project.meets[0]} withoutAction={!liked} refetch={refetch} withoutUsers />}
        </Box>

        {Boolean(project.users.length) && (
          <Box sx={{ p: 2 }}>
            <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Участники проекта
            </Typography>
            <AvatarGroupUsers users={project.users || []} />
          </Box>
        )}
      </CardActionArea>

      {!liked && (
        <Stack spacing={2} direction="row" sx={{ alignItems: 'center', px: 2, pb: 2 }}>
          <Button variant="contained" size="small" onClick={handleLike}>
            Присоединиться к проекту
          </Button>
          {!project.users.length && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Станьте первым участником и помогите запустить проект 🚀
            </Typography>
          )}
        </Stack>
      )}
    </Card>
  );
}

export default IdeaProjectCard;
