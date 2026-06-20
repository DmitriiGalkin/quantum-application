import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Button, Card, CardHeader, Stack } from '@mui/material';
import type { ProjectFullDto } from '@shared/types';
import AvatarGroupUsers from './AvatarGroupUsers.tsx';
import PlaceIcon from '@mui/icons-material/Place';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProjectUser, fetchDeleteProjectUser } from '../requests.ts';
import ProjectMeetCard from './ProjectMeetCard.tsx';

type IdeaProjectCardProps = {
  project: ProjectFullDto;
  refetch?: any;
};

function IdeaProjectCard({ project, refetch }: IdeaProjectCardProps) {
  const { user, authHandler } = useAuth();

  const likedFront = project.users.map(user => user.id).includes(user?.id);

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
    if (user)
      if (!likedFront) {
        user && mutationLike.mutate({ userId: user.id, projectId: project.id });
      } else {
        user && mutationUnlike.mutate({ userId: user.id, projectId: project.id });
      }
    else authHandler();
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<Avatar src={project.passport.image}>{project.passport.title[0]}</Avatar>}
        title={project.passport.title}
        subheader="Профессор всех наук и просто боксер"
      />
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
          <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)' }}>
            <Typography variant="caption" color="text.secondary">
              Ближайшая встреча
            </Typography>
            <ProjectMeetCard meet={project.meets[0]} />
          </Box>
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
        <Button variant="contained" size="small" onClick={handleLike}>
          {likedFront ? 'Выйти' : 'Вступить'}
        </Button>

        <Button variant="text" size="small" href={`/project/${project.id}`}>
          Подробнее
        </Button>
      </Box>
    </Card>
  );
}

export default IdeaProjectCard;
