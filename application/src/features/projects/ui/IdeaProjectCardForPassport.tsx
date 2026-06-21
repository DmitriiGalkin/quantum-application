import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Card, Stack } from '@mui/material';
import { type ProjectExtendedDto } from '@shared/types';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';
import PlaceIcon from '@mui/icons-material/Place';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import MeetForPassport from '../../meets/ui/MeetForPassport.tsx';

type IdeaProjectCardProps = {
  project: ProjectExtendedDto; // частичное должно быть
  refetch?: any;
};

function IdeaProjectCardForPassport({ project, refetch }: IdeaProjectCardProps) {
  const { user, authHandler } = useAuth();

  const liked = user && project.users?.map(user => user.id).includes(user.id);

  const nextMeet = project.meets?.[0];

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 1, alignItems: 'center' }}>
        <PlaceIcon sx={{ fontSize: 16, opacity: 0.6 }} />

        <Typography variant="body2" color="text.secondary">
          {project.place?.address}
        </Typography>
      </Stack>

      {nextMeet ? (
        <MeetForPassport meet={nextMeet} withoutAction={!liked} refetch={refetch} withoutUsers />
      ) : (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Встреч пока нет
          </Typography>

          <Button size="small" sx={{ mt: 1 }}>
            Запланировать
          </Button>
        </Box>
      )}

      {Boolean(project.users.length) && (
        <Box
          sx={{
            px: 2,
            mt: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AvatarGroupUsers users={project.users || []} />

          <Typography variant="caption" color="text.secondary">
            {project.users.length}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button size="small">Поделиться</Button>

        <Button variant="contained" size="small" href={`/project/${project.id}`}>
          Открыть
        </Button>
      </Box>
    </Card>
  );
}

export default IdeaProjectCardForPassport;
