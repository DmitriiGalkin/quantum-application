import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Card, Stack } from '@mui/material';
import { type ProjectExtendedDto } from '@shared/types';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';
import PlaceIcon from '@mui/icons-material/Place';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProjectUser, fetchDeleteProjectUser } from '../../../requests.ts';
import ProjectCardHeader from './ProjectCardHeader.tsx';
import Meet from '../../meets/ui/Meet.tsx';

type IdeaProjectCardProps = {
  project: ProjectExtendedDto; // частичное должно быть
  refetch?: any;
};

function IdeaProjectCard({ project, refetch }: IdeaProjectCardProps) {
  const { user, authHandler } = useAuth();

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
      <ProjectCardHeader passport={project.passport} handleUnlike={liked && handleUnlike} />

      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 1, alignItems: 'center' }}>
        <PlaceIcon sx={{ fontSize: 16, opacity: 0.6 }} />

        <Typography variant="body2" color="text.secondary">
          {project.place?.address}
        </Typography>

        {/*{project.distance != null && (*/}
        {/*  <Box*/}
        {/*    sx={{*/}
        {/*      px: 1,*/}
        {/*      py: 0.2,*/}
        {/*      borderRadius: 10,*/}
        {/*      backgroundColor: 'rgba(255,182,40,0.15)',*/}
        {/*      fontSize: 12,*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    {project.distance < 1*/}
        {/*      ? `${Math.round(project.distance * 1000)} м`*/}
        {/*      : `${project.distance.toFixed(1)} км`}*/}
        {/*  </Box>*/}
        {/*)}*/}
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowX: 'auto' }}>
        {project.meets?.[0] ? (
          <Meet meet={project.meets[0]} withoutAction />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Станьте первым участником и помогите запустить проект 🚀
          </Typography>
        )}
      </Box>

      <Box sx={{ px: 2, mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Участники
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <AvatarGroupUsers users={project.users || []} />
        </Box>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {!liked && (
          <Button variant="contained" size="small" onClick={handleLike}>
            Вступить
          </Button>
        )}
        <Button variant="text" size="small" href={`/project/${project.id}`}>
          Подробнее
        </Button>
      </Box>
    </Card>
  );
}

export default IdeaProjectCard;
